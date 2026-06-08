<script setup>
const quiz = {
  id: 'm1-6-genesis',
  title: '🧠 Mini-check: Genesis',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'Що defines unique cluster?',
      options: [
        'Genesis hash',
        'Initial validator set',
        'Initial accounts state',
        'Software version'
      ],
      correct: [0, 1, 2],
      explanation: 'Software version може evolve, genesis immutable. Module 1.6.'
    },
    {
      type: 'explain',
      q: 'Як new community cluster (наприклад Alpenglow) запускається з genesis?',
      ideal: 'New cluster bring-up process (community-coordinated):\n\n1. **Plan**: organizers decide cluster purpose, expected operators, schedule.\n\n2. **Solicit operators**: validators apply via form indicating їх pubkey + intent. Operators у "genesis set" otherwise self-stake at launch.\n\n3. **Software version**: agreed-upon agave/Firedancer version. Optional cluster-specific fork patches.\n\n4. **Genesis params**: organizer creates genesis using solana-genesis tool:\n   - Initial validator pubkeys + initial stake amounts\n   - Cluster parameters (slot duration, epoch length)\n   - Initial features enabled\n   - Output: genesis.tar.bz2 file\n\n5. **Distribute genesis**: organizer publishes genesis hash + file URL. All operators verify hash matches expected.\n\n6. **Coordinate start time**: organizer announces specific UTC time для все валідатори start simultaneously.\n\n7. **All operators start** validator з same genesis at agreed time. Initially: small cluster, fast TX execution.\n\n8. **Out-of-genesis operators** (як LumLabs Alpenglow case 2026-06) can join later by syncing з cluster + creating own vote account + getting stake delegation.\n\nThis ceremony similar для mainnet original launch 2020.',
      explanation: 'Module 1.6.'
    }
  ]
}
</script>

# 6. Genesis ceremony

## TL;DR

**Genesis** = initial state of cluster (accounts, validators, parameters) at time-zero. **Genesis hash** uniquely identifies cluster. New cluster bring-up = community-coordinated process: organizer creates genesis, operators verify, all start simultaneously з same genesis.

## What's в genesis

Genesis file (`genesis.tar.bz2`) contains:

1. **Initial accounts**: pre-funded wallets, validators, system accounts
2. **Initial validator set**: pubkeys + initial stake amounts
3. **Cluster parameters**:
   - Slot duration (typically 400ms)
   - Epoch length (typically 432,000 slots)
   - Inflation schedule
   - Fee schedule
4. **Initial features enabled**: which protocol features active from start
5. **Genesis hash**: SHA-256 of the entire genesis (cluster identifier)

After cluster starts, genesis immutable — referenced by все subsequent blocks через chain of parent hashes.

## Genesis creation

Cluster organizer uses `solana-genesis` tool:

```bash
solana-genesis \
    --bootstrap-validator <PUBKEY> \
        <VOTE_PUBKEY> \
        <STAKE_PUBKEY> \
    --bootstrap-validator-lamports 100000000 \
    --bootstrap-validator-stake-lamports 50000000 \
    --bootstrap-stake-authorized-pubkey <STAKE_AUTHORITY> \
    --ledger /tmp/genesis-output \
    --slots-per-epoch 432000 \
    --hashes-per-tick auto \
    --ticks-per-slot 64 \
    --target-tick-duration 6250 \
    --cluster-type development
```

Many parameters. Each cluster organizer chooses thoughtfully.

Output:
- `/tmp/genesis-output/genesis.bin` — binary genesis
- `/tmp/genesis-output/genesis.tar.bz2` — compressed для distribution

### Verify

```bash
sha256sum /tmp/genesis-output/genesis.bin
# Output = genesis hash, share з community
```

All operators must verify they have identical hash.

## Coordinated launch process

### Phase 1: Planning

Organizers (Anza for mainnet, community for Alpenglow):
- Determine purpose, scope, timeline
- Recruit initial operators
- Choose software stack
- Set parameters

### Phase 2: Operator registration

Solicit interested validators:

```
Form fields:
- Operator name
- Validator identity pubkey
- Vote pubkey
- Stake pubkey
- Initial stake amount
- Contact info
```

Approved operators included у genesis bootstrap set.

### Phase 3: Genesis creation + distribution

Organizer:
- Creates genesis з all operator pubkeys
- Publishes genesis hash
- Posts genesis file URL (typically GitHub release)

Operators:
- Download genesis file
- Verify hash matches expected
- Place у local ledger directory

### Phase 4: Start coordination

Organizer announces:
- UTC start time
- Entrypoint IPs
- Software version

All operators start validators within tight window (e.g., 5-min). Cluster begins producing blocks.

### Phase 5: Stabilization

First 1-2 epochs:
- Verify cluster healthy (active stake, blocks producing)
- Initial bugs/issues address
- Cluster становить stable

## Alpenglow case study (Jun 2026)

З твоєї cheatsheet §3:

- **Pre-restart**: Anza Ashwin coordinates restart announcement у Discord
- **Operators register**: form для inclusion у new genesis
- **Genesis created**: новий genesis hash `F7m9FCZqve9pRmX3Ar4EqoZ1CUMFv8pZiN2gaELPWQtL`
- **In-genesis operators**: pubkeys включені, ready to start
- **Out-of-genesis operators** (LumLabs missed form): join later

LumLabs case (з Phase 0 cheatsheet):
1. Did not fill form (overslept)
2. After cluster running, joined via:
   - Wipe ledger
   - Build new agave version
   - Start з new genesis
   - Sync з cluster
   - Create vote account
   - Self-stake 2 SOL
   - Wait для Tim Garcia (organizer) to delegate community stake

## Out-of-genesis joining

Process when missed initial genesis:

1. **Same software** version as cluster (verify)
2. **Same genesis file** (download from cluster's published source)
3. **Wipe own ledger** (any stale data conflict)
4. **Start validator** — fetches snapshot from cluster, catches up
5. **Create vote account** з new BLS pubkey for Alpenglow
6. **Self-stake** minimum required (cluster-specific)
7. **Wait для community delegation** (з organizer'a discretion)

Out-of-genesis operators initially lower influence (less stake), но can grow over time.

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Genesis ceremony`](/glossary#g), [`Bootstrap validator`](/glossary#b), [`solana-genesis`](/glossary#s), [`In-genesis vs out-of-genesis`](/glossary#i)

## External refs

- [solana-genesis tool](https://docs.anza.xyz/cli/solana-genesis)

---

**Попередньо:** [← 5. Validator status](/module-1/5-validator-status)
