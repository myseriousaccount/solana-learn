<script setup>
const quiz = {
  id: 'm11-4-vote-history',
  title: '🧠 Mini-check: Vote history',
  intro: '3 питання — critical operational concept.',
  questions: [
    {
      type: 'compare',
      q: 'tower.bin (Tower BFT) vs vote_history.bin (Alpenglow) — operational differences.',
      ideal: 'tower.bin (Tower BFT):\n- Local file recording validator vote history\n- Used при restart до prevent double-voting\n- Если missing: agave reconstructs best-effort з on-chain vote TXs\n- Imperfect reconstruction але resilient до file loss\n- Located у /mnt/ledger/ or ledger dir\n- Format: tower-1_9-<identity_pubkey>.bin\n\nvote_history.bin (Alpenglow):\n- Same purpose: prevent double-voting after restart\n- Used at startup + during set-identity\n- If missing: agave REFUSES TO START — no reconstruction possible\n- Why no reconstruction: no on-chain vote TXs у Alpenglow (off-chain BLS aggregation)\n- Stricter safety guarantee\n- Located у same ledger dir\n- Format details still evolving\n\nKey operational implication:\n- Tower: file loss is recoverable annoyance\n- Alpenglow: file loss IS A PROBLEM, requires --do-not-require-vote-history bypass (risky)\n\nThis fundamentally changes failover architecture. Module 11.4.',
      explanation: ''
    },
    {
      type: 'mcq',
      q: 'Що відбувається якщо запустити Alpenglow validator without vote_history.bin?',
      options: [
        'agave-validator refuses to start (default safe behavior)',
        'Must pass --do-not-require-vote-history flag to override',
        'Validator might double-vote with old identity (slashable у future)',
        'Tower BFT reconstruction kicks in automatically'
      ],
      correct: [0, 1, 2],
      explanation: 'Alpenglow has NO Tower BFT fallback — no reconstruction possible. Either provide file or override з risk. Module 11.4.'
    },
    {
      type: 'explain',
      q: 'Чому Alpenglow stricter than Tower BFT regarding vote history file?',
      ideal: 'Tower BFT validators submit vote transactions on-chain. Each vote TX is recorded у block, persisted у ledger forever, accessible to all participants.\n\nIf validator loses local tower.bin:\n- Can query own past vote TXs from chain history (rpc getVoteAccounts, etc.)\n- Reconstruct approximate tower state from latest votes\n- Not perfect (timing edge cases) але resilient enough\n- Risk of double-vote reduced significantly\n\nAlpenglow validators broadcast votes peer-to-peer, NOT as on-chain TXs:\n- Votes aggregated into BLS certificates\n- Only certificates anchor on-chain (with voter_bitmap)\n- Individual vote messages do not persist anywhere globally\n- No way to query "what did validator X vote at slot N" from chain\n\nSo if local vote_history.bin lost:\n- No source of truth для reconstruction\n- Validator does not know which slots already voted\n- Risk of voting again differently for same slot (double-vote)\n- Strict requirement: file present OR explicit override\n\nThis is fundamental architectural consequence of moving voting off-chain. Safety guarantee shifts from "chain history acts as backup" to "local state critical, treat it accordingly". Module 11.4.',
      explanation: ''
    }
  ]
}
</script>

# 4. Vote history & state management

## TL;DR

**vote_history.bin** = local file recording validator's voting history у Alpenglow. Functionally similar до Tower BFT's `tower.bin` але **stricter requirements**:

- Tower BFT: file missing → agave reconstructs з on-chain vote TXs (best-effort)
- Alpenglow: file missing → agave **refuses to start** unless `--do-not-require-vote-history` flag passed

Reason: Alpenglow votes off-chain (BLS aggregation), no on-chain TXs до reconstruct from. Local state is single source of truth.

This fundamentally changes failover, backup, migration practices.

## What is vote_history.bin

Local file що validator software (agave) maintains у ledger directory. Contains:

- List of slots validator has voted on
- Vote type per slot (notarize, skip, finalize, fallback variants)
- Block hashes voted for
- Timestamp metadata
- BLS signature artifacts

Format binary, optimized для fast read/write per slot. Updated continuously as validator votes.

### Location

Default path (Alpenglow agave fork):

```
/mnt/ledger/vote_history-<identity_pubkey>.bin
```

OR depending on installation:

```
/home/solana/solana/ledger/vote_history.bin
```

Exact path depends on `--ledger` flag у validator startup config. Equivalent location до tower.bin у Tower BFT.

### Naming conventions

Per recent agave commits (AshwinSekar/solana):

- Internal Rust struct: `VoteHistory`
- File name format: still evolving у implementation
- Some references: `votor_history.bin`, `vote_history.bin`, or `votor_<pubkey>.bin`

Operators should consult current version's docs OR verify file location post-startup via:

```bash
ls -la /path/to/ledger/ | grep -i hist
```

## How vote_history is used

### Startup sequence

1. agave-validator starts
2. Reads `vote_history.bin` from ledger dir
3. Validates: file matches current identity (signature check or similar)
4. Determines: latest voted slot, what votes were cast
5. Initializes voting state: будs upon last known state
6. Joins consensus з safe baseline

If file missing OR corrupted:
- Default: **refuse to start** (safe)
- Override: `--do-not-require-vote-history` allows startup без history

### During voting

Each vote cast → append до vote_history file:

1. Validator decides vote (notarize/skip/finalize/etc.)
2. Cryptographically commits to local state
3. Updates vote_history.bin (atomic write, journal-style)
4. Broadcasts vote BLS signature до peers
5. Next vote can reference last vote (lockout-like checking)

Atomicity matters: writing must succeed before broadcast, else risk of double-vote on restart.

### During set-identity (hotswap)

This is **critical operational scenario**. Detailed у Module 11.5.

Short version: when switching staked identity onto new server, vote_history.bin must accompany identity transfer. Else risk of double-voting (old server still has history, new server starts fresh у same slot).

## Why Alpenglow stricter than Tower

### Tower BFT reconstruction mechanism

If Tower validator loses tower.bin:

```rust
// Pseudo-code Tower reconstruction
let recent_vote_txs = fetch_vote_txs_from_chain(my_identity, last_N_epochs);
let reconstructed_tower = analyze_vote_pattern(recent_vote_txs);
let safe_baseline = max(last_voted_slot) + safety_margin;
```

This works because:
- Every vote was on-chain TX
- TXs persisted у ledger
- Anyone can query
- Combined з blockhash chain provides ordered timeline

Imperfect but workable safety net.

### Alpenglow has no chain history of votes

Alpenglow votes propagate peer-to-peer:

```
Validator → broadcasts BLS-signed vote message
   ↓
Other validators receive, aggregate
   ↓
Aggregator builds BLS certificate (combined signature + voter_bitmap)
   ↓
Certificate anchored on-chain (single certificate per slot per outcome)
```

What's recorded on-chain:
- Certificate з aggregated signature
- Voter bitmap indicating які validators participated
- NOT individual vote messages (lost after aggregation)

So если my validator wants to query "what did I vote at slot N":
- voter_bitmap tells whether я participated
- Aggregated signature doesn't декомпозируется до individual signatures
- Original vote message gone

**No reconstruction possible.**

### Practical implications

For operators:
- vote_history.bin = single source of truth
- Backups critical (regular file copies до remote storage)
- Sync between active+standby validators essential (Module 11.6)
- Loss = either downtime OR risky --do-not-require-vote-history bypass

For protocol safety:
- Strict enforcement prevents accidental double-votes
- Future slashing makes this not just risk but real economic damage
- Operator discipline must align з protocol assumptions

## The `--do-not-require-vote-history` flag

Escape hatch added до agave Alpenglow fork. Allows operator to start validator WITHOUT vote_history.bin file.

### When you might use

1. **First-time validator startup**: no history exists yet, normal case
2. **Recovery from total disk loss**: vote_history.bin gone, must restart somehow
3. **Testing on community cluster**: low-risk environment
4. **Switching from unstaked to staked identity**: if no prior alpenglow votes

### When NOT to use

1. **Switching from one staked identity to another (active validator)**: high risk
2. **Mainnet production setup**: slashing coming, need real history
3. **After accidental file deletion**: try to restore from backup first

### Risk levels

| Scenario | Without flag | With flag |
|---|---|---|
| First startup (no votes ever) | Fail to start | Start clean ✓ |
| File missing, no previous votes | Fail to start | Start clean ✓ |
| File missing, had previous votes | Fail to start | **Start, risk double-vote** ⚠️ |
| File present | Start ✓ | Start ✓ (flag ignored) |

When risk of double-vote applies:
- Slashing not yet enforced → consequences = social punishment, future tokens
- Slashing enforced (post-SIMD-0204) → real stake loss

### Safer alternative

Before using `--do-not-require-vote-history` on active staked identity:

1. Try to restore vote_history.bin from backup
2. Verify backup matches your identity (file ownership check)
3. Wait some safe duration (e.g., N+1 epochs) before voting
4. If absolutely must override, monitor для double-vote risk

## Implications для failover architecture

### Tower BFT operators могли:

- Use single-server setup with reasonable confidence
- Restore from disaster з backup keypairs alone
- Tolerate brief downtime during recovery
- Accept best-effort tower reconstruction

### Alpenglow operators must:

- Plan for vote_history sync (live OR snapshot-based)
- Backup vote_history regularly
- Have failover procedure що includes vote_history transfer
- Use active-standby setup for mainnet (with sync)
- OR accept high risk via --do-not-require-vote-history (testnet OK, mainnet risky)

This is fundamental architectural shift. Module 11.6 covers concrete patterns.

## Backup strategies

### Strategy 1: Periodic snapshot

Cron job periodically copies vote_history.bin:

```bash
# Every 5 minutes
*/5 * * * * cp /mnt/ledger/vote_history.bin /backup/vote_history-$(date +%s).bin
```

Pros: simple, reliable
Cons: gap between snapshots (up to interval) = stale history if needed

### Strategy 2: rsync to remote

Real-time-ish sync to standby server:

```bash
# Cron more frequently with rsync
* * * * * rsync -a /mnt/ledger/vote_history.bin standby-server:/backup/
```

Pros: near-real-time
Cons: depends on network reliability, can lag if network slow

### Strategy 3: shared storage (NFS/etc.)

Validator writes vote_history.bin до shared network storage:

```bash
# /mnt/ledger mounted via NFS
# Both active + standby see same file
```

Pros: zero sync delay
Cons: single point of failure (storage), latency overhead для disk operations

### Strategy 4: Solid-state replication

Block-level replication (DRBD, Ceph, etc.):

Pros: lowest latency, strong consistency
Cons: complexity high, requires sysadmin expertise

### Trade-off matrix

| Strategy | Sync delay | Complexity | Risk on failure | Cost |
|---|---|---|---|---|
| Periodic snapshot | High (minutes) | Low | High data loss | Free |
| rsync continuous | Medium (seconds) | Low | Medium data loss | Free |
| Shared storage | Zero | Medium | Storage SPOF | Hardware |
| Block replication | Zero | High | Complex failure | Hardware + ops |

Recommendation depends on:
- Stake size (higher → more aggressive sync)
- Slashing enforcement timing (post-enforcement → real-time sync mandatory)
- Operator expertise (manage complexity)

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`vote_history.bin`](/glossary#v), [`VoteHistory`](/glossary#v), [`--do-not-require-vote-history`](/glossary#-), [`Off-chain voting`](/glossary#o), [`Vote reconstruction`](/glossary#v), [`Snapshot backup strategy`](/glossary#s), [`rsync sync strategy`](/glossary#r), [`Shared storage strategy`](/glossary#s), [`Block-level replication`](/glossary#b)

## External refs

- [SIMD-0326: vote handling](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0326-alpenglow.md)
- [AshwinSekar/solana commits on VoteHistory](https://github.com/AshwinSekar/solana/commits/alpenglow-v0.4)

---

**Попередньо:** [← 3. Rotor](/module-11/3-rotor-propagation) | **Наступне:** [5. Identity management →](/module-11/5-identity-management)
