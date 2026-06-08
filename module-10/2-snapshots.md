<script setup>
const quiz = {
  id: 'm10-2-snapshots',
  title: '🧠 Mini-check: Snapshots',
  intro: '2 питання.',
  questions: [
    {
      type: 'compare',
      q: 'Full snapshot vs incremental snapshot?',
      ideal: 'Full snapshot: complete accountsDB state at specific slot. Large (~80-100 GB mainnet). Created periodically (every ~25000 slots).\n\nIncremental snapshot: delta from last full. Small (~1 GB typical). Created more frequently (every ~100 slots).\n\nFast catch-up:\n1. Download recent full snapshot (~30-60 min)\n2. Download recent incremental delta (~few min)\n3. Apply delta до full → current state\n4. Catch-up з cluster для recent slots\n\nTotal: ~30-90 min vs full replay from genesis (days/weeks).',
      explanation: 'Module 10.2.'
    },
    {
      type: 'command',
      q: 'Як list local snapshots ledger directory?',
      accepts: ['ls -lh /home/solana/solana/ledger/snapshot-*', 'sudo ls -lh /home/solana/solana/ledger/snapshot-*'],
      ideal: 'sudo ls -lh /home/solana/solana/ledger/snapshot-*',
      explanation: 'Module 10.2.'
    }
  ]
}
</script>

# 2. Snapshots — fetch, create, serve

## TL;DR

Validators periodically create **snapshots** — compressed accountsDB state dumps at specific slots. Two types: **full** (complete, ~80-100GB mainnet) і **incremental** (delta, ~1GB). Used для fast catch-up — replace days of replay з minutes of download.

## Why snapshots

Without snapshots, new validator catching up = replay every TX від genesis. Mainnet has ~1B+ TXs total. Replay would take days/weeks.

З snapshots:
1. Download recent full + incremental з cluster
2. Reconstruct state
3. Catch-up з cluster only для recent slots (minutes)

Total ~30-90 min vs days.

## Snapshot files

```
ledger/
├── snapshot-369000000-XYZ.tar.zst       # full snapshot at slot 369M (~80GB)
├── snapshot-369450000-XYZ.tar.zst       # full at slot 369.45M
├── incremental-snapshot-369450000-369450100-ABC.tar.zst  # delta from 369450000 to 369450100
├── incremental-snapshot-369450100-369450200-DEF.tar.zst
└── ...
```

Compressed з **zstd**. Tar archives contain all account state plus metadata.

### Frequencies

Mainnet defaults:
- **Full snapshot**: every 25,000 slots (~3 годин)
- **Incremental**: every 100 slots (~40 секунд)

Settings configurable via flags:
```bash
agave-validator \
    --full-snapshot-interval-slots 25000 \
    --incremental-snapshot-interval-slots 100
```

### Serve до peers

Validator може serve snapshots для cluster:

```bash
agave-validator \
    --rpc-port 8899 \
    --enable-rpc-transaction-history \
    --enable-extended-tx-metadata-storage
```

Other validators fetching snapshots reach це через gossip-known RPC ports.

### Manual snapshot creation

```bash
agave-validator -l /path/to/ledger create-snapshot <SLOT>
```

Useful для backup перед major operations.

## Connect to your work

### Cluster restart (cheatsheet §3)

After Phase 1 (wipe ledger), new validator starts WITHOUT snapshot. Must fetch fresh з cluster — connects to entrypoints, requests snapshot, downloads, reconstructs.

Fetch може bу від:
- Other operators (gossip-discovered, fastest якщо близькі)
- Public mirrors (some providers host snapshots)

### Snapshot integrity verification

Validator verifies downloaded snapshot integrity (hash check). If corrupted → re-fetch.

```bash
# Logs показують snapshot fetching progress
sudo journalctl -u solana | grep -i snapshot | tail -20
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary

[`Snapshot`](/glossary#s), [`Full snapshot`](/glossary#f), [`Incremental snapshot`](/glossary#i), [`zstd`](/glossary#z)

## External refs

- [Anza: Snapshots](https://docs.anza.xyz/operations/best-practices/general)

---

**Попередньо:** [← 1. Geyser/RPC](/module-10/1-geyser-rpc) | **Наступне:** [3. DoubleZero →](/module-10/3-doublezero)
