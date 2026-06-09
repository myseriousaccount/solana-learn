<script setup>
const quiz = {
  id: 'm11-5-identity',
  title: '🧠 Mini-check: Identity management',
  intro: '3 питання — set-identity mechanics + symlink pattern.',
  questions: [
    {
      type: 'explain',
      q: 'Поясни identity symlink pattern + чому це foundation для hot-swap.',
      ideal: 'Identity symlink pattern (standardized у Anza validator failover guide):\n\nValidator started з:\n- --identity /home/sol/identity.json (symbolic link)\n- --authorized-voter /home/sol/staked-identity.json (real keypair file, permanent reference)\n\nIdentity symlink switches between:\n- Active state: ln -sf /home/sol/staked-identity.json /home/sol/identity.json\n- Standby state: ln -sf /home/sol/unstaked-identity.json /home/sol/identity.json\n\nWhy this pattern foundational для hot-swap:\n\n1. Configuration constant: validator startup script never changes. Just symlink target.\n\n2. Atomic identity switch: ln -sf is atomic at filesystem level. No race condition.\n\n3. Cluster perspective: validator advertises identity via gossip. Symlink change + set-identity command propagates new identity.\n\n4. Failure isolation: standby running з unstaked identity does not vote. Cannot accidentally double-vote even if primary still alive.\n\n5. Reversibility: можна swap back так само easily для testing.\n\nWithout this pattern, identity hot-swap would require validator restart (not "hot") и config file edits. Symlink + set-identity = sub-second swap. Module 11.5.',
      explanation: ''
    },
    {
      type: 'mcq',
      q: 'Що з цього вірно про set-identity command на Alpenglow vs Tower BFT?',
      options: [
        'Both support set-identity command',
        'Tower: --require-tower flag requires tower.bin present',
        'Alpenglow: equivalent --require-vote-history flag (or default behavior) requires vote_history.bin',
        'Alpenglow accepts --do-not-require-vote-history flag to bypass requirement (risky)'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'Всі правильні. Behavior matches semantics — Alpenglow stricter, but escape hatch exists. Module 11.5.'
    },
    {
      type: 'compare',
      q: 'Authorized voter vs validator identity — у чому різниця?',
      ideal: 'Validator identity:\n- Keypair signing PoH ticks (Tower) or doing validator infrastructure work\n- Vote authority is delegated separately\n- Can be changed via set-identity (hot)\n- "Who is я як validator у gossip + leader schedule"\n\nAuthorized voter:\n- Keypair signing vote TXs (Tower) or BLS vote messages (Alpenglow)\n- Set on vote account when created or via vote-authorize-voter command\n- Defines "who can sign votes on behalf of vote account"\n- Permanent reference у validator startup (--authorized-voter flag)\n\nWhy separation matters:\n1. Identity rotation possible without affecting vote authority\n2. Standby validator can have different identity but same authorized voter\n3. Vote account ownership independent of validator infrastructure\n4. Hot swap: identity changes, authorized voter stays\n\nIn failover pattern:\n- Both active + standby validators registered identical authorized voter (the staked keypair)\n- Only identity symlink differs between active + standby\n- Vote authority remains the staked keypair regardless of which physical machine votes\n\nThis separation enables physical infrastructure flexibility без consensus disruption. Module 11.5.',
      explanation: ''
    }
  ]
}
</script>

# 5. Identity management & hot-swap

## TL;DR

Validator identity = который keypair currently performing validator duties (PoH ticking або BLS vote signing). **Identity hot-swap** = switching identity без validator restart, enabling sub-second failover between two physical machines.

Pattern relies on:
- **Identity symbolic link** (target switchable)
- **`set-identity` command** (runtime identity change)
- **`--require-tower` / `--require-vote-history`** flags (safety)
- **Authorized voter constant** (vote authority decoupled from identity)

Pattern works on Tower BFT і Alpenglow з minor differences.

## Conceptual model

### Validator components

```
┌─────────────────────────────────────────┐
│ Validator process (agave-validator)     │
│                                         │
│  ┌─────────────────┐                   │
│  │ Identity Keypair │ ← changeable     │
│  │ (--identity flag)│   via set-identity│
│  └─────────────────┘                   │
│                                         │
│  ┌─────────────────────────┐           │
│  │ Authorized Voter Keypair │ ← permanent│
│  │ (--authorized-voter flag)│   reference│
│  └─────────────────────────┘           │
│                                         │
│  ┌─────────────────┐                   │
│  │ Vote Account     │ ← on-chain ID    │
│  │ (--vote-account)│                   │
│  └─────────────────┘                   │
└─────────────────────────────────────────┘
```

Three references:

1. **Identity**: physical machine signature, changeable
2. **Authorized voter**: who can sign votes, permanent у startup config
3. **Vote account**: on-chain identifier, never changes

### Why separation

Tower BFT и Alpenglow both designed з this separation:

- **Vote account = identity у consensus**: stake delegated to vote account, rewards accrue, voting weight там
- **Authorized voter = signing authority**: which keypair can author votes
- **Validator identity = infrastructure marker**: who is the physical machine, used for leader schedule lookups, gossip identity

Hot-swap exploits decoupling: change identity (machine), keep authorized voter (vote authority).

## Identity symlink pattern

### Setup

On both active + standby validators:

```bash
# Generate junk (unstaked) identity per server
solana-keygen new -s --no-bip39-passphrase -o /home/sol/unstaked-identity.json

# Place real staked identity (shared between both servers via secure copy)
# /home/sol/staked-identity.json (existing)

# Create symlink (initial state)
# Active server: points to staked
ln -sf /home/sol/staked-identity.json /home/sol/identity.json

# Standby server: points to unstaked
ln -sf /home/sol/unstaked-identity.json /home/sol/identity.json
```

### Validator startup config

Both servers use **identical** startup command:

```bash
agave-validator \
    --identity /home/sol/identity.json \
    --vote-account /home/sol/vote-account-keypair.json \
    --authorized-voter /home/sol/staked-identity.json \
    --ledger /mnt/ledger \
    [other flags]
```

Key points:
- `--identity` points to **symlink** (changeable)
- `--authorized-voter` points to **real file** (permanent reference to staked identity)
- Same config on both servers

### Initial state

- **Active server**: identity symlink → staked identity. Validator votes as staked identity. Earns rewards.
- **Standby server**: identity symlink → unstaked identity. Validator running but does not vote (no stake associated with unstaked identity). No-op consensus participant.

## set-identity command

Runtime identity change без validator restart:

```bash
# Switch identity to specified keypair
agave-validator -l /mnt/ledger set-identity /path/to/new-identity-keypair.json
```

Validator process:

1. Receives admin command via local socket
2. Validates: new keypair valid
3. Checks: safety conditions (vote history availability)
4. Swaps internal identity reference
5. Continues running with new identity

### Safety: --require-tower flag (Tower BFT)

```bash
# Tower BFT: explicitly require tower.bin exists for new identity
agave-validator -l /mnt/ledger set-identity --require-tower /path/to/new-identity.json
```

Behavior:
- If tower.bin для new identity present + valid → proceed
- If missing → command fails, validator keeps current identity
- Prevents accidental double-vote через cold start

### Safety: vote_history equivalents (Alpenglow)

Alpenglow analog:

```bash
# Alpenglow: vote_history.bin required by default
agave-validator -l /mnt/ledger set-identity /path/to/new-identity.json

# Bypass requirement (risky)
agave-validator -l /mnt/ledger set-identity \
    --do-not-require-vote-history \
    /path/to/new-identity.json
```

Behavior:
- Default: requires vote_history.bin для new identity
- Without file → command fails
- Override з explicit flag (risky на active staked identity)

### Combined safety design

Why two safeguards (tower / vote_history + --require flag):

- Default behavior = safest (file required)
- Operators can override via explicit flag (informed risk)
- Mistakes (accidentally swapping without sync) prevented unless intentional

## Hot-swap procedure (complete)

### Pre-conditions

1. Active + standby both running
2. Both same software version
3. Both reachable via SSH from each other
4. Both connected to cluster, syncing slots
5. Standby identity = unstaked (cannot accidentally vote)
6. Network low-latency route between servers (preferably private)

### Step-by-step

**On active server (becoming standby)**:

```bash
# 1. Wait for safe transition window
agave-validator -l /mnt/ledger wait-for-restart-window --min-idle-time 2

# 2. Set identity to junk (unstaked)
agave-validator -l /mnt/ledger set-identity /home/sol/unstaked-identity.json

# 3. Update symlink to reflect new state
ln -sf /home/sol/unstaked-identity.json /home/sol/identity.json

# 4. Copy vote history file to standby
scp /mnt/ledger/vote_history.bin standby-host:/mnt/ledger/
# (Tower equivalent: scp /mnt/ledger/tower-1_9-<pubkey>.bin)
```

**On standby server (becoming active)**:

```bash
# 5. Activate staked identity (requires history file present)
agave-validator -l /mnt/ledger set-identity \
    --require-tower \
    /home/sol/staked-identity.json

# 6. Update symlink
ln -sf /home/sol/staked-identity.json /home/sol/identity.json
```

### Total time

- wait-for-restart-window: 0-30s (depends on leader schedule)
- set-identity on active: ~50ms
- File transfer: 100-500ms (network + file size)
- set-identity on standby: ~50ms

**Total: typically < 5 seconds, often < 2 seconds**

### Verification

Post-swap, confirm:

```bash
# Verify new active validator status
solana validators | grep <staked-identity-pubkey>
# Should show: ✓ (active voting), recent last_vote

# Standby is non-voting
solana validators | grep <unstaked-identity-on-old-server>
# Should show: ✗ or just not appear (no stake)

# Check cluster sees swap (gossip update)
solana gossip | grep <staked-identity>
# Should show new IP address (standby server's)
```

## Risks і pitfalls

### Risk 1: Both validators run staked identity simultaneously

If active validator не properly stopped/de-identified before standby activates:

- Both signing votes
- Conflicting signatures for same slot
- Slashable у future enforcement

Mitigation:
- Always set-identity active to junk FIRST
- Verify deactivation before activating standby
- Tools (SVS, SOL-Strategies) handle ordering automatically

### Risk 2: vote_history.bin not synced

If standby activates з stale vote_history:

- May vote different вариант для same slot (notarize vs skip)
- Slashable

Mitigation:
- Real-time sync (rsync continuous, NFS, replication)
- Verify file timestamp matches recent activity
- Use --require flags as safety net

### Risk 3: Network partition during swap

If network fails mid-swap:

- Active partially deactivated
- Standby not yet activated
- Brief downtime (acceptable if short)

Mitigation:
- Reliable network between servers
- Automated tools з rollback
- Don't swap during known network instability

### Risk 4: Symlink misalignment

If symlink points to wrong identity:

- Validator может вести себя unexpectedly
- May not vote despite seemingly correct setup

Mitigation:
- Verify symlinks after every change: `readlink /home/sol/identity.json`
- Automation tools handle symlink updates programmatically

### Risk 5: Forgotten --require-tower / --require-vote-history

If activating standby без safety flag:

- Tower BFT: history reconstruction kicks in, mostly safe
- Alpenglow: standby starts без history check, double-vote risk

Mitigation:
- Always use --require flag у production scripts
- Override only if confident у risk

## Configuration examples

### Tower BFT (Mainnet currently)

`/etc/systemd/system/solana.service`:

```ini
[Service]
ExecStart=/home/sol/agave-validator \
    --identity /home/sol/identity.json \
    --vote-account /home/sol/vote-account-keypair.json \
    --authorized-voter /home/sol/staked-identity.json \
    --ledger /mnt/ledger \
    --rpc-port 8899 \
    --gossip-port 8001 \
    [other flags]
```

`--identity` = symlink. `--authorized-voter` = staked keypair file.

### Alpenglow (Community cluster currently)

Similar structure з minor flag adjustments:

```ini
[Service]
ExecStart=/home/sol/agave-validator \
    --identity /home/sol/identity.json \
    --vote-account /home/sol/vote-account-keypair.json \
    --authorized-voter /home/sol/staked-identity.json \
    --ledger /mnt/ledger \
    [Alpenglow-specific flags as needed]
```

`--do-not-require-vote-history` typically NOT set у production unit file. Used only ad-hoc on command line if specifically needed.

## Differences Tower BFT vs Alpenglow

| Aspect | Tower BFT | Alpenglow |
|---|---|---|
| Identity command | `set-identity` | `set-identity` |
| Safety flag | `--require-tower` | (default behavior) |
| Override flag | (default lax) | `--do-not-require-vote-history` |
| History file | `tower-1_9-<pubkey>.bin` | `vote_history.bin` (or similar) |
| Reconstruction if file missing | Yes (best-effort з chain) | No (impossible) |
| Risk of double-vote бeз file | Low (reconstruction safety net) | High (no fallback) |
| Production discipline | Strongly recommended | Mandatory |

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Validator identity`](/glossary#v), [`Authorized voter`](/glossary#a), [`Junk identity`](/glossary#j), [`Unstaked identity`](/glossary#u), [`Identity symlink pattern`](/glossary#i), [`set-identity command`](/glossary#s), [`--require-tower`](/glossary#-), [`--require-vote-history`](/glossary#-), [`Hot-swap`](/glossary#h)

## External refs

- [Anza: Validator Failover Guide](https://docs.anza.xyz/operations/guides/validator-failover)
- [Pumpkin's Pool: Active Validator](https://pumpkins-pool.gitbook.io/pumpkins-pool#active-validator)
- [AshwinSekar/solana: set-identity changes](https://github.com/AshwinSekar/solana/commits/alpenglow-v0.4)

---

**Попередньо:** [← 4. Vote history](/module-11/4-vote-history) | **Наступне:** [6. Failover patterns →](/module-11/6-failover-patterns)
