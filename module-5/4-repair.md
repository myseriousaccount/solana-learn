<script setup>
const quiz = {
  id: 'm5-4-repair',
  title: '🧠 Mini-check: Repair',
  intro: '2 питання — repair basics.',
  questions: [
    {
      type: 'mcq',
      q: 'Коли validator triggers repair protocol?',
      options: [
        'Missing shreds для slot, can\'t reconstruct',
        'After cluster restart — need catch up missed slots',
        'Routine health checks',
        'On every shred received'
      ],
      correct: [0, 1],
      explanation: '#1: insufficient shreds → repair. #2: catching up after restart/downtime. #3/#4 — wrong (continuous polling would overload). Module 5.4.'
    },
    {
      type: 'explain',
      q: 'Якщо validator поза cluster тривалий час (наприклад крашнувся на 1 годину), як він catches up через repair?',
      ideal: '1. На startup validator checks last known slot vs current cluster slot. Якщо behind significantly — catch-up mode.\n\n2. Repair service requests missing slots/shreds від cluster peers через repair protocol.\n\n3. Peers send shreds для requested slots.\n\n4. Validator reconstructs blocks, replays TXs, updates own state.\n\n5. Continues catch-up аж до reaching cluster head.\n\n6. Then resumes normal voting.\n\nЧас: ~1-2 hours catch-up може занять 5-30 хв depending bandwidth. Validator remains delinquent during catch-up.\n\nAlternative для very long downtime: download fresh snapshot замість replay all missed blocks. Faster (~30-90 min vs hours).',
      explanation: 'Module 5.4.'
    }
  ]
}
</script>

# 4. Repair protocol & network resilience

## TL;DR

**Repair protocol** — recovery mechanism коли validator missed shreds/blocks. Sends repair requests до peers, receives missing data, reconstructs. Critical для recovering після packet loss, brief downtime, або catch-up after restart.

## Концепти

### Коли repair triggers

1. **Missing shreds**: turbine packet loss, can't reconstruct block (< 32 з 64)
2. **Slot gap**: validator missed entire slots (network issue, restart)
3. **Catch-up**: validator joining cluster fresh або після downtime

### Repair flow

```
Validator detects missing data
   ↓
Identifies які slots/shreds потрібні
   ↓
Sends repair_request до peers (via gossip-known repair port)
   ↓
Peers send missing shreds/blocks back
   ↓
Validator reconstructs, replays
```

### Catch-up scenarios

**Brief downtime (< 5 min):**
- Catch-up через repair (request missed slots)
- ~ кілька minutes catch-up

**Longer downtime (1+ hour):**
- Catch-up через repair можливий але slow
- Alternative: download fresh snapshot, skip historical replay
- Snapshot download ~30-90 min, потім short catch-up

**Cluster restart (з §3 cheatsheet):**
- Special procedure
- Wipe ledger, fetch new snapshot from cluster
- Catch-up from snapshot start point

### Snapshot mechanism

Validators periodically create **snapshots** — compressed state dumps of accountsDB at specific slot. Saved to disk.

Other validators can download snapshot замість replaying from genesis (which would take days/weeks).

Two types:
- **Full snapshot**: complete state, large (~80-100 GB на mainnet)
- **Incremental snapshot**: delta from last full, small (~1 GB)

Validator downloads recent full + recent incremental → fast catch-up to ~current slot.

## Connect to your work

### Catch-up moніторинг

```bash
# Health check показує "behind by N slots" якщо catching up
curl -s http://localhost:8899 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# Specific catch-up status
sudo /home/solana/ag/bin/agave-validator --ledger /home/solana/solana/ledger catchup
```

### Snapshot directories

З Constants:
```
Full Snapshot Slot: 639625
Incremental Snapshot Slot: 701562
```

Snapshots живуть у ledger directory (`/home/solana/solana/ledger/`). Validator може serve snapshots до other validators.

## Hands-on exercise

```bash
# Catch-up status
sudo /home/solana/ag/bin/agave-validator --ledger /home/solana/solana/ledger catchup

# Health check
curl -s http://localhost:8899 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# Last snapshot slots
sudo ls -lh /home/solana/solana/ledger/snapshot-* 2>/dev/null | tail -5

# Repair activity у logs
sudo journalctl -u solana | grep -i repair | tail -10
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Repair`](/glossary#r), [`Snapshot`](/glossary#s), [`Full snapshot`](/glossary#f), [`Incremental snapshot`](/glossary#i), [`Catch-up`](/glossary#c)

## External refs

- [Anza: Repair Service](https://docs.anza.xyz/validator/repair)
- [Anza: Snapshots](https://docs.anza.xyz/operations/best-practices/general)

---

**Попередньо:** [← 3. Shreds](/module-5/3-shreds) | **Наступне:** [⭐ Final quiz →](/module-5/final-quiz)
