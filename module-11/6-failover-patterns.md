<script setup>
const quiz = {
  id: 'm11-6-failover',
  title: '🧠 Mini-check: Failover patterns',
  intro: '3 питання — comparing 5 industry approaches.',
  questions: [
    {
      type: 'compare',
      q: 'Manual hot-swap pattern (Pumpkin/Anza) vs Automated (SVS, SOL-Strategies) — tradeoffs.',
      ideal: 'Manual pattern:\n+ Full control, operator аware кожного swap\n+ No additional software (just bash scripts + ssh)\n+ Predictable behavior\n+ Easier to debug when issues\n- Requires 24/7 operator availability OR slow response time\n- Swap time 5-30 sec depending on operator\n- Human error risk (misaligned symlinks, forgotten file copy)\n- No automatic disaster detection\n\nAutomated tools (SVS, SOL-Strategies):\n+ Sub-second swap times (~1-3 sec)\n+ Automatic disaster detection (delinquency monitoring)\n+ SSH connection pooling = instant execution\n+ Reduce operator burden\n+ Built-in rollback mechanisms\n- Additional software to install/maintain\n- Configuration complexity\n- Tool bugs могут cause downtime\n- May not yet support Alpenglow fully\n- Trust dependency на third-party tool maintenance\n\nDecision matrix:\n- Small operator з 1 validator: manual sufficient\n- Medium operator з multiple validators: automated saves time\n- Large operator (many validators, professional sysops): automated critical\n\nMost large operators currently using mix: automated for routine swaps, manual for unusual circumstances. Module 11.6.',
      explanation: ''
    },
    {
      type: 'mcq',
      q: 'Який pattern використовує QUIC для peer-to-peer coordination між active+passive?',
      options: [
        'Anza official guide (manual)',
        'Pumpkin\'s Pool active validator (manual)',
        'SVS (huiskylabs) — automated dashboard',
        'SOL-Strategies validator failover — QUIC peer-to-peer'
      ],
      correct: [3],
      explanation: 'SOL-Strategies tool specifically built on QUIC peer-to-peer. SVS uses SSH connection pooling. Module 11.6.'
    },
    {
      type: 'explain',
      q: 'Чому Pumpkin\'s Pool keyless operation pattern attractive для maximum security?',
      ideal: 'Keyless operation pattern:\n\nValidator started з ONLY junk (unstaked) identity locally. Staked identity keypair NEVER stored на validator filesystem. Authorized voter set remotely via:\n\nagave-validator --ledger $LEDGER authorized-voter add <staked-keypair>\n\nThis command sent via SSH from operator workstation. Staked keypair file lives на operator\'s laptop OR hardware wallet OR multisig vault. Validator receives BLS keys derived через validation flow without touching real keypair file.\n\nSecurity advantages:\n1. Server compromise = junk identity compromised (low value). Staked identity safe.\n2. Backup easier (only one keypair file to protect, on cold storage).\n3. Compliance — separation of duties more clear.\n4. Hardware wallet integration possible (Ledger/HSM holds staked key).\n\nDownsides:\n1. After restart, validator reverts to junk identity. Manual re-authorization needed.\n2. Operator must be available для restart events.\n3. Automation harder (still need staked key access for set-identity calls).\n4. Not yet validated specifically для Alpenglow vote_history.bin handling.\n\nUse case: validators with extremely high stake where compromise damage > operator inconvenience. Trade convenience for security. Module 11.6.',
      explanation: ''
    }
  ]
}
</script>

# 6. Failover patterns — 5 industry approaches

## TL;DR

Industry has converged on **5 standard patterns** для validator failover. Range from fully manual (Anza official guide) до fully automated (SVS, SOL-Strategies tools). Choice depends on operator size, stake value, automation tolerance.

All patterns share core elements: active-standby setup, identity symlink, set-identity command, vote history sync. Differ on: who orchestrates, how fast, how much human involvement.

## Common elements (across all patterns)

Every pattern requires:

1. **Two validator instances**: active (currently voting) + standby (non-voting)
2. **Identity separation**: each instance has both staked + unstaked identity keypairs
3. **Symbolic link convention**: `/home/sol/identity.json` switches between identities
4. **Authorized voter constant**: `--authorized-voter` permanently points to staked keypair
5. **Vote history sync**: tower.bin or vote_history.bin transferred during swap
6. **Network connectivity**: SSH or QUIC channel between servers
7. **Maintenance window awareness**: `wait-for-restart-window` command

Patterns differ on **orchestration**: who triggers swap, how fast, automation level.

## Pattern A: Anza official guide (manual)

URL: `https://docs.anza.xyz/operations/guides/validator-failover`

### Architecture

Two validators з identical startup config + identity symlinks. Operator manually orchestrates swap via SSH.

### Swap procedure

Operator opens two terminal sessions (one per server) and executes:

**Active server**:
```bash
agave-validator -l /mnt/ledger wait-for-restart-window --min-idle-time 2
agave-validator -l /mnt/ledger set-identity /home/sol/unstaked-identity.json
ln -sf /home/sol/unstaked-identity.json /home/sol/identity.json
scp /mnt/ledger/tower-1_9-$(solana-keygen pubkey /home/sol/staked-identity.json).bin standby:/mnt/ledger/
```

**Standby server**:
```bash
agave-validator -l /mnt/ledger set-identity --require-tower /home/sol/staked-identity.json
ln -sf /home/sol/staked-identity.json /home/sol/identity.json
```

### Characteristics

| | Value |
|---|---|
| Swap time | ~10-30 seconds (manual typing) |
| Required: software | None beyond agave |
| Required: operator | Available + capable |
| Disaster detection | None — operator initiates |
| Alpenglow compat | Yes (з vote_history equivalent) |
| Best для | Solo operator, one validator, simple setup |

### Pros / cons

**Pros**:
- No additional tooling — just agave + bash + ssh
- Full operator awareness
- Easy to debug
- Documented officially by Anza

**Cons**:
- Manual = slow
- Human error possible (typos, forgotten steps)
- Operator must be available 24/7
- No automated disaster detection

## Pattern B: Pumpkin's Pool active validator (manual з conventions)

URL: `https://pumpkins-pool.gitbook.io/pumpkins-pool#active-validator`

### Architecture

Similar to Anza guide але з community-curated naming conventions + bash script wrappers. Provides templates.

### Specific conventions

- Uses `/home/sol/` as standard path
- Symlink: `/home/sol/identity.json`
- Junk identity: `/home/sol/junk.json` OR `/home/sol/unstaked-identity.json`
- Tower file: `/mnt/ledger/tower-1_9-<pubkey>.bin`

### Swap script template

Provides reusable bash scripts:

```bash
# active-to-standby.sh (run on active)
#!/bin/bash
set -e
agave-validator -l /mnt/ledger wait-for-restart-window --min-idle-time 2
agave-validator -l /mnt/ledger set-identity /home/sol/junk.json
ln -sf /home/sol/junk.json /home/sol/identity.json
PUBKEY=$(solana-keygen pubkey /home/sol/staked-identity.json)
scp /mnt/ledger/tower-1_9-${PUBKEY}.bin standby:/mnt/ledger/
echo "Active deactivated, tower file transferred"
```

```bash
# standby-to-active.sh (run on standby)
#!/bin/bash
set -e
agave-validator -l /mnt/ledger set-identity --require-tower /home/sol/staked-identity.json
ln -sf /home/sol/staked-identity.json /home/sol/identity.json
echo "Standby activated"
```

### Characteristics

| | Value |
|---|---|
| Swap time | ~5-15 seconds (scripted) |
| Required: software | Bash scripts (own custom) |
| Required: operator | Still manual trigger |
| Disaster detection | None |
| Alpenglow compat | Yes (з script updates) |
| Best для | Solo/small team, want repeatable procedure |

### Pros / cons

**Pros**:
- Faster than Anza pattern (scripted)
- Reduces typos (commands fixed)
- Community-tested conventions
- Easy adoption (just bash)

**Cons**:
- Still manual trigger
- Scripts need updates per validator version
- No auto disaster detection

## Pattern C: Pumpkin's Pool keyless operation (max security)

URL: `https://pumpkins-pool.gitbook.io/pumpkins-pool/keyless-operation`

### Architecture

Staked identity NEVER stored on validator filesystem. Operator manages authorization remotely.

### Setup

Validator started з ONLY junk identity:

```bash
agave-validator \
    --identity /home/sol/junk.json \
    --vote-account <PUBKEY_ONLY> \
    --ledger /mnt/ledger \
    [other flags]
```

Note: `--vote-account` uses **pubkey only** (no keypair file). No `--authorized-voter` keypair file либо.

### Authorization procedure

From operator workstation:

```bash
# Send authorized-voter add command via SSH
ssh validator-server "agave-validator -l /mnt/ledger authorized-voter add" < /local/path/staked-keypair.json
```

Staked keypair stays on operator's machine. Validator receives keypair material via stdin pipe, never persists to disk.

### Failover

Restart of validator reverts to junk identity. Operator must:
1. Detect restart
2. Re-authorize voter via SSH command
3. Validator resumes voting

### Characteristics

| | Value |
|---|---|
| Swap time | Manual (depends on operator response) |
| Required: software | SSH + operator workstation |
| Required: operator | High involvement (every restart) |
| Disaster detection | External monitoring needed |
| Alpenglow compat | TBD (depends on BLS key handling) |
| Best для | Maximum security setups, high-stake validators |

### Pros / cons

**Pros**:
- Highest security — staked key never on validator server
- Hardware wallet compatible (Ledger holds key)
- Server compromise = junk identity compromised only
- Compliance-friendly (clear separation)

**Cons**:
- Manual re-authorization every restart
- Operator availability critical
- Automation difficult (still need key access)
- Less proven для Alpenglow (vote_history.bin handling unclear)

## Pattern D: SVS (Solana Validator Switch) — automated dashboard

URL: `https://github.com/huiskylabs/solana-validator-switch`

### Architecture

Automated tool installed на operator's workstation. Connects до both validators via SSH. Provides dashboard + automated triggers.

### Key features

- **1-3 second hot swap** through optimizations:
  - SSH connection pooling (persistent connections)
  - Optimized tower transfer (streaming base64 + dd)
  - Pre-allocated commands
- **Multi-validator support**: dashboard manages pairs
- **Real-time monitoring**: SSH + RPC health checks
- **Telegram alerts**: delinquency, connection failures

### Setup

```bash
mkdir -p ~/.solana-validator-switch
cp config.example.yaml ~/.solana-validator-switch/config.yaml
# Edit config: SSH details, validator hosts, identity paths
svs start
```

### Operation modes

1. **Manual swap**: keyboard shortcut to trigger hot swap
2. **Auto-failover**: triggers on:
   - 30 seconds without voting → delinquency alert
   - 100 consecutive failures OR 30 minutes → connection failure
3. **Dry-run mode**: simulates swap для testing without committing

### Validator compatibility

- Agave (Tower BFT)
- Firedancer
- Jito-Solana
- Alpenglow (untested explicit, may work з compatible commands)

### Characteristics

| | Value |
|---|---|
| Swap time | 1-3 seconds |
| Required: software | SVS binary + Rust environment (or installer) |
| Required: operator | Setup + occasional monitoring |
| Disaster detection | Built-in (configurable thresholds) |
| Alpenglow compat | Likely (untested explicit) |
| Best для | Medium-to-large operators, multiple validators |

### Pros / cons

**Pros**:
- Fastest swap у industry (1-3s)
- Built-in disaster detection
- Multi-validator dashboard
- Documented configuration

**Cons**:
- Additional software dependency
- Configuration complexity
- Alpenglow support not explicitly verified
- Trust dependency на huiskylabs maintenance

## Pattern E: SOL-Strategies validator failover (QUIC peer-to-peer)

URL: `https://github.com/SOL-Strategies/solana-validator-failover`

### Architecture

Run same tool на both validators. Tool uses QUIC for peer-to-peer coordination. Active and passive roles auto-detected via gossip.

### How QUIC coordination works

- Passive validator: starts QUIC server listening for active's connection
- Active validator: connects as QUIC client
- Coordinated handover sequence via QUIC messages
- Lower latency than SSH (UDP-based, no TCP handshake overhead)

### Default mode: dry-run

Tool runs у dry-run mode by default:
- Tower file syncs successfully
- All timings recorded
- set-identity commands NOT executed
- Useful для testing failover speed без committing changes

To execute actual failover: `--not-a-drill` flag.

### Configuration

```yaml
# Example config
validator:
  ledger_dir: /mnt/ledger
  tower_file_template: "tower-1_9-{{.Pubkey}}.bin"
  set_identity_command: "agave-validator -l {{.LedgerDir}} set-identity {{.IdentityPath}}"

failover:
  active_to_standby_hook: "/path/to/pre-hook.sh"
  rollback_enabled: true
```

Templates accommodate different validator clients (Agave / Firedancer / Jito).

### Characteristics

| | Value |
|---|---|
| Swap time | < 5 seconds |
| Required: software | SOL-Strategies binary on both servers |
| Required: operator | Setup + trigger swap |
| Disaster detection | Limited (relies on operator detection) |
| Alpenglow compat | TBD (configurable templates) |
| Best для | Operators wanting peer-to-peer pattern, dry-run testing |

### Pros / cons

**Pros**:
- Peer-to-peer (no external orchestrator)
- QUIC = low latency
- Dry-run mode для testing
- Rollback capability
- Configurable templates

**Cons**:
- Requires installation on both validators
- Less mature/popular than SVS
- Disaster detection limited
- Alpenglow specifics may need template adjustments

## Pattern comparison matrix

| Pattern | Swap speed | Automation | Setup complexity | Alpenglow ready | Best для |
|---|---|---|---|---|---|
| **A. Anza official** | 10-30s | None | Low | Yes (з updates) | Solo, learning |
| **B. Pumpkin active** | 5-15s | Scripts | Low | Yes (з updates) | Solo, repeatable |
| **C. Keyless** | Manual | None | Medium | TBD | Max security |
| **D. SVS** | 1-3s | Full | Medium-High | Likely | Production teams |
| **E. SOL-Strategies** | < 5s | Peer | Medium | TBD | Peer-to-peer fans |

## Operator decision framework

### By scale

**Solo operator з 1 validator**:
- Tower BFT mainnet: Pattern A or B sufficient
- Alpenglow: Pattern A or B з vote_history sync added

**Small team (1-5 validators)**:
- Tower BFT: Pattern B (scripted) saves time
- Alpenglow: Pattern B OR consider Pattern D (SVS) як teams grow

**Larger operators (10+ validators)**:
- Pattern D (SVS) или Pattern E essential для scale
- Multiple parallel swaps без human bottleneck

### By stake value

**Low stake (< 100k SOL)**:
- Manual patterns OK
- Risk acceptable

**Medium stake (100k - 1M SOL)**:
- Automated detection valuable
- Pattern D recommended

**High stake (> 1M SOL)**:
- Pattern D з aggressive monitoring
- OR Pattern C (keyless) if security paramount
- Multiple regions для disaster resilience

### By timing context

**Pre-Alpenglow mainnet (before SIMD-0204 enforcement)**:
- All patterns acceptable
- Slashing not real risk
- Operator preference dominates

**Post-Alpenglow mainnet, post-slashing enforcement**:
- Pattern D-grade automation essential
- Real-time vote_history sync mandatory
- Multi-region setup recommended

## Common gotchas

### Gotcha 1: Identity stays on both servers

If active validator не set-identity to junk before standby activates:

- Both running staked identity
- Both signing votes
- Definitely slashable у future

**Mitigation**: All patterns enforce active-deactivation first. Verify post-swap.

### Gotcha 2: Vote history not synced

If vote_history.bin not transferred to standby before activation:

- Standby votes без knowledge of recent history
- Risk of conflicting vote (notarize vs skip same slot)
- Slashable у Alpenglow

**Mitigation**:
- All patterns transfer file
- Continuous sync (rsync) provides extra safety
- `--require-vote-history` default behavior catches if missing

### Gotcha 3: Asymmetric versions

If active + standby run different software versions:

- Behavior may differ subtly
- Compatibility breakdown possible

**Mitigation**: Keep both servers identical version. Patterns assume parity.

### Gotcha 4: Symlink misalignment

If symlink points wrong:

- Validator may load wrong identity
- Silent failure mode (no obvious error)

**Mitigation**:
- Verify `readlink` after every change
- Automation tools handle symlink updates explicitly

### Gotcha 5: Network partition during swap

If network breaks mid-swap:

- Active partially deactivated
- Standby not yet active
- Brief downtime

**Mitigation**:
- Reliable inter-validator network (preferably private)
- Don't swap during known network instability
- Tools з rollback capability handle gracefully

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Pattern A (Anza)`](/glossary#p), [`Pattern B (Pumpkin)`](/glossary#p), [`Keyless operation`](/glossary#k), [`Pattern D (SVS)`](/glossary#p), [`Pattern E (SOL-Strategies)`](/glossary#p), [`SSH connection pooling`](/glossary#s), [`Dry-run failover`](/glossary#d), [`Failover rollback`](/glossary#f), [`Peer-to-peer coordination`](/glossary#p)

## External refs

- [Anza Failover Guide](https://docs.anza.xyz/operations/guides/validator-failover)
- [Pumpkin's Pool Active Validator](https://pumpkins-pool.gitbook.io/pumpkins-pool#active-validator)
- [Pumpkin's Pool Keyless Operation](https://pumpkins-pool.gitbook.io/pumpkins-pool/keyless-operation)
- [SVS (huiskylabs)](https://github.com/huiskylabs/solana-validator-switch)
- [SOL-Strategies failover](https://github.com/SOL-Strategies/solana-validator-failover)

---

**Попередньо:** [← 5. Identity management](/module-11/5-identity-management) | **Наступне:** [7. Joining cluster →](/module-11/7-joining-cluster)
