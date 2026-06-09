<script setup>
const quiz = {
  id: 'm11-9-cluster-ops',
  title: '🧠 Mini-check: Cluster operations',
  intro: '3 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'Чим cluster restart на Alpenglow community differs від mainnet routine restart?',
      options: [
        'New genesis hash (community restart from scratch)',
        'Coordinated start time with all operators',
        'Validators must wipe ledger before restart',
        'BLS pubkeys must re-register у new vote accounts'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'All four are real differences. Community restart = effectively new cluster. Module 11.9.'
    },
    {
      type: 'command',
      q: 'Як monitor cluster delinquent stake (verify health перед restart)?',
      accepts: [
        'solana validators --url http://localhost:8899 | grep -E "Active Stake|Delinquent Stake"',
        'solana validators | grep -E "Active|Delinquent"',
        'solana validators --output json | jq ".clusterStakeByStatus"'
      ],
      ideal: 'solana validators | grep -E "Active|Delinquent"',
      explanation: 'Pre-flight check before any cluster operation. Module 11.9.'
    },
    {
      type: 'explain',
      q: 'Поясни typical Alpenglow community cluster restart procedure.',
      ideal: 'Cluster restart announced via Discord #ag-community-cluster channel. Reason typically: protocol upgrade, halt recovery, intentional reset.\n\nPhases:\n\nPhase 0 — Backup keypairs\nBefore destroying anything:\n- Copy validator-keypair.json до safe location\n- Copy vote-account-keypair.json\n- Copy stake-keypair*.json\nThese keys persist across cluster restarts. Funds tied to keys, not cluster state.\n\nPhase 1 — Stop validator + wipe ledger\nsudo systemctl stop solana\nWipe ledger contents (rocksdb, snapshots, tmp-genesis):\nsudo bash -c "rm -rf /home/solana/solana/ledger/*"\nsudo bash -c "rm -rf /mnt/ramdisk/*"\nCritical: nothing should remain. Old genesis would conflict з new.\n\nPhase 2 — Update software (if needed)\nGit fetch + checkout new tag. Rebuild via cargo-install-all.sh. Update symlink.\n\nPhase 3 — Get new genesis info\nFrom Discord/coordination:\n- New genesis hash\n- New shred_version\n- New entrypoints\n- New cluster version\n\nPhase 4 — Update systemd unit\nUpdate flags reflecting new params.\n\nPhase 5 — Start validator\nValidator fetches snapshot from cluster peers. Catches up to current slot.\n\nPhase 6 — Re-create vote account (out-of-genesis case)\nIf not included у initial new genesis:\n- Create new vote account з BLS pubkey\n- Set up authorities\n- Self-stake\n- Wait for delegation from organizer\n\nPhase 7 — Verify voting\nMonitor logs + slot delta + credits growing.\n\nTotal time: 1-3 hours typically. Module 11.9.',
      explanation: ''
    }
  ]
}
</script>

# 9. Cluster operations — restart, monitoring, governance

## TL;DR

Alpenglow community cluster operates з different rhythms than mainnet:
- **Frequent restarts** (research cluster, protocol evolution)
- **Discord-coordinated** (real-time community)
- **Bleeding edge software** (operators expected to upgrade quickly)
- **Lower stakes** (test tokens, room для experimentation)

Operator must monitor Discord, participate restart procedures, track SIMD evolution, contribute back через issue reports.

## Cluster restart procedures

Unlike mainnet (where restart = catastrophic halt recovery), Alpenglow community cluster restarts могут be planned events:

- Protocol upgrades requiring new genesis
- Intentional reset для clean slate testing
- Halt recovery (cluster stuck)
- Cluster reorg testing

### Announcement flow

1. Anza team (Ashwin Sekar) posts у Discord #ag-community-cluster
2. Reason explained
3. New genesis hash provided
4. Coordinated start time
5. Software version specified

### Phase 0 — Backup keypairs (always first)

Before destroying anything:

```bash
sudo cp /home/solana/solana/validator-keypair.json \
    /tmp/validator-keypair-backup-$(date +%Y%m%d).json
sudo cp /home/solana/solana/vote-account-keypair.json \
    /tmp/vote-account-keypair-backup-$(date +%Y%m%d).json
sudo cp /home/solana/solana/stake-keypair-*.json /tmp/

sudo ls -la /tmp/*-backup-*.json
```

Copy to laptop/cold storage:

```bash
scp devops_ssh@validator-host:/tmp/*-backup-*.json ~/Desktop/
```

Keys persist across cluster restarts. Funds tied до keys, не cluster state.

### Phase 1 — Stop validator + wipe ledger

```bash
sudo systemctl stop solana

# Verify nothing running
sleep 5
sudo systemctl status solana | head -3
sudo ps aux | grep agave | grep -v grep

# Wipe ledger (using sudo bash -c для glob expansion)
sudo bash -c "rm -rf /home/solana/solana/ledger/*"
sudo bash -c "rm -rf /home/solana/solana/ledger/.[!.]*"
sudo bash -c "rm -rf /mnt/ramdisk/*"

# Verify empty
sudo ls -la /home/solana/solana/ledger/
sudo du -sh /home/solana/solana/ledger/
```

Critical: leftover content (rocksdb, tmp-genesis, snapshots) causes genesis hash mismatch після restart.

### Phase 2 — Update software (if needed)

If restart includes protocol upgrade:

```bash
cd /home/devops_ssh/agave
git fetch --tags
git checkout <new-tag>  # e.g., ag-v0.4.5
sed -i '/--force/!s/install --locked/install --locked --force/g' scripts/cargo-install-all.sh
cargo clean
tmux new -s build
CI_COMMIT=$(git rev-parse HEAD) scripts/cargo-install-all.sh /home/solana/ag-<new-tag>
# Wait 25-30 minutes
```

Update symlink:

```bash
sudo ln -sfn /home/solana/ag-<new-tag> /home/solana/ag
sudo /home/solana/ag/bin/agave-validator --version
```

### Phase 3 — Get new cluster info

From Discord coordination:
- New genesis hash
- New shred_version
- New entrypoints (gossip seeds)
- New cluster version expected

Update systemd unit file with new values:

```ini
ExecStart=/home/solana/ag/bin/agave-validator \
    --expected-genesis-hash <NEW_HASH> \
    --expected-shred-version <NEW_SHRED_VERSION> \
    --entrypoint <NEW_ENTRYPOINT_1> \
    --entrypoint <NEW_ENTRYPOINT_2> \
    [other flags]
```

```bash
sudo systemctl daemon-reload
```

### Phase 4 — Start validator

```bash
sudo systemctl start solana

# Live logs to verify boot
sudo tail -f /home/solana/solana/solana.log
```

Validator behavior:
1. Read genesis from configured entrypoints
2. Verify genesis hash matches expected
3. Fetch snapshot from cluster peers
4. Replay snapshot
5. Catch up to current slot
6. Begin voting (if vote account exists with stake)

Total time: 30-90 minutes depending on bandwidth + cluster size.

### Phase 5 — Re-create vote account (out-of-genesis case)

If not included у new genesis:

```bash
# Create vote account with BLS pubkey (V2 instruction auto-sets BLS)
solana create-vote-account \
    vote-account-keypair.json \
    validator-keypair.json \
    <WITHDRAWER_PUBKEY> \
    --commission 10 \
    --allow-unsafe-authorized-withdrawer
```

Self-stake:

```bash
solana create-stake-account stake-keypair-1.json 2.0
solana delegate-stake stake-keypair-1.json <VOTE_PUBKEY>
```

Wait for epoch boundary activation.

### Phase 6 — Verify

```bash
# Service active
sudo systemctl status solana

# Logs healthy
sudo tail -n 100 /home/solana/solana/solana.log

# Slot progressing
S1=$(solana slot)
sleep 5
S2=$(solana slot)
echo "Slot delta: $((S2-S1))"

# Vote credits growing
solana vote-account <VOTE_PUBKEY> | grep -A 5 Credits

# Cluster sees you
solana validators | grep <IDENTITY_PUBKEY>
```

## Pre-restart checks

Before participating cluster restart:

1. **Cluster delinquent check**:
   ```bash
   solana validators | grep -E "Active Stake|Delinquent Stake"
   ```
   If delinquent > 5% → cluster may halt under additional restart load. Wait.

2. **Backup verification**:
   ```bash
   ls -la /home/keypair-backups/
   ```
   Confirm backups recent + complete.

3. **Disk space**:
   ```bash
   df -h /home/solana/solana/ledger
   df -h /mnt/ramdisk
   ```
   Ensure enough space для fresh ledger.

4. **Network connectivity**:
   ```bash
   ping cluster.entrypoint.example
   ```
   Verify entrypoints reachable.

5. **Software readiness**:
   ```bash
   /home/solana/ag-<new-tag>/bin/agave-validator --version
   ```
   Verify new version built and accessible.

## Monitoring during restart

Watch for:

- **Gossip peer count growing**: validator finding cluster members
- **Snapshot downloading**: ledger catching up
- **Slot progressing**: catching up to head
- **Vote TXs landing** (Tower BFT) OR **BLS certs forming** (Alpenglow): consensus participation
- **Credits growing**: voting being recorded

Logs to grep:

```bash
sudo journalctl -u solana -f | grep -iE "gossip|snapshot|slot|vote"
```

## Governance tracking

### Sources to monitor

1. **Discord #ag-community-cluster**: real-time, primary
2. **SIMD repo**: https://github.com/solana-foundation/solana-improvement-documents
3. **Anza release notes**: https://github.com/anza-xyz/agave/releases
4. **Twitter**: @anza_xyz, @SolanaFndn, @ashwin_sekar
5. **Solana Developer Forums**: long-form discussions

### What to track

- New SIMDs proposed (review impact on operations)
- SIMDs approved → activation timing
- Software releases (Agave + Jito + Firedancer)
- Validator feature flag status changes
- BLS pubkey registration deadline (когда applicable)

### Cluster health monitoring

Daily/weekly metrics:

```bash
# Cluster stake breakdown
solana validators --url <RPC> | tail -10

# Your validator status
solana validators --url <RPC> | grep <IDENTITY_PUBKEY>

# Vote credits trend
solana vote-account <VOTE_PUBKEY> | grep -A 10 "Epoch Voting"

# Skip rate (external services like stakewiz)
# https://stakewiz.com/validator/<IDENTITY_PUBKEY>
```

## Contributing back

Operating community cluster validator = contributing to ecosystem. Ways to contribute meaningfully:

1. **Report issues**: bugs encountered, logs containing weird errors, performance regressions
2. **Test releases**: be early adopter of pre-release versions on community cluster
3. **Documentation**: contribute corrections to docs.anza.xyz, write blog posts
4. **Discord help**: answer other operators' questions
5. **Cluster restart participation**: be available для coordinated restarts

Operators who contribute build reputation з Anza + community. Beneficial для:
- SFDP eligibility on mainnet
- Stake pool delegation
- Job opportunities (validator-as-a-service)
- Discord influence/trust

## Differences from mainnet operations

| Aspect | Mainnet | Alpenglow community |
|---|---|---|
| Restart frequency | Years (only emergencies) | Monthly OR more |
| Coordination | SFDP + key validators | Discord channel |
| Software cadence | Monthly stable releases | Frequent (weekly bleeding edge) |
| Real value | Yes (rewards = real income) | None (test tokens) |
| Slashing risk | Pending enforcement | Pending enforcement (more so) |
| Operator role | Production discipline | Research + early adoption |
| Documentation | Official Anza docs | Community wikis + Discord |

Skills overlap но cadence very different. Community cluster experience = preparation для when Alpenglow lands on mainnet.

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Cluster restart procedure`](/glossary#c), [`Pre-flight check`](/glossary#p), [`Cluster halt`](/glossary#c), [`Bleeding edge software`](/glossary#b), [`Community cluster cadence`](/glossary#c), [`Contributing back`](/glossary#c)

## External refs

- [Anza Discord](https://discord.gg/solana) (#ag-community-cluster)
- [SIMD repository](https://github.com/solana-foundation/solana-improvement-documents)
- [AshwinSekar/solana fork](https://github.com/AshwinSekar/solana)

---

**Попередньо:** [← 8. Slashing](/module-11/8-slashing) | **Наступне:** [⭐ Final quiz →](/module-11/final-quiz)
