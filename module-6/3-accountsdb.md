<script setup>
const quiz = {
  id: 'm6-3-accountsdb',
  title: '🧠 Mini-check: AccountsDB',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'AccountsDB на mainnet:',
      options: [
        'Stored на NVMe disk + optional RAM cache',
        'Stored на RAM disk (tmpfs)',
        'Contains all ~500M accounts (mainnet)',
        'Read/write by TX execution'
      ],
      correct: [0, 2, 3],
      explanation: 'AccountsDB live on disk (with RAM cache). NOT RAM disk (would be too big — accountsDB ~500GB+). Module 6.3.'
    },
    {
      type: 'explain',
      q: 'Чому /mnt/ramdisk на твоєму Alpenglow setup для accounts?',
      ideal: 'Alpenglow community cluster менший за mainnet — accountsDB поміщається у RAM (~16-32 GB вместо 500GB). Mounting на ramdisk (tmpfs) дає sub-millisecond access latency vs NVMe ~50-100µs.\n\nFor small cluster performance critical (every microsecond у validation matters), RAM storage optimal.\n\nMainnet ні — accountsDB занадто big для RAM. Mainnet uses disk (NVMe) з aggressive RAM cache for hot accounts.\n\nTradeoff:\n- RAM disk: faster access, but data lost on reboot, limited size\n- Disk: slower, persistent, scales до TB+',
      explanation: 'Module 6.3.'
    }
  ]
}
</script>

# 3. AccountsDB & state storage

## TL;DR

**AccountsDB** — validator's storage for all accounts state. На mainnet ~500GB on NVMe + RAM cache для hot accounts. На малих clusters (Alpenglow) — RAM-mounted tmpfs for speed.

## Концепти

### AccountsDB що зберігає

Кожен account у cluster має entry у accountsDB:
- pubkey (32 bytes)
- account data (variable size)
- lamports, owner, executable, rent_epoch

Mainnet ~500M accounts. AccountsDB size:
- Hot path (recently accessed): ~10-50 GB у RAM cache
- Total on disk: ~500 GB

### Storage strategy

```
┌──────────────────────────────────┐
│ RAM cache (10-50 GB)             │  ← hot accounts, fast access
│ - LRU eviction                   │
├──────────────────────────────────┤
│ AccountsDB on NVMe (~500 GB)     │  ← all accounts, persistent
│ - Append-only writes             │
│ - Background compaction          │
└──────────────────────────────────┘
```

NVMe critical — slow disk → slow TX replay → late voting.

### Your Alpenglow setup

```
Accounts (ramdisk): /mnt/ramdisk/accounts
```

З Constants. Alpenglow cluster smaller, accounts fit у RAM. Tmpfs (RAM-backed filesystem) gives best performance.

Tradeoff: lost on reboot. Validator wipes ramdisk on restart, fetches fresh snapshot.

### AccountsDB performance issues

Common bottlenecks:
- **Slow disk**: HDD impossible, SATA SSD marginal, NVMe required
- **Disk full**: validator crashes hard
- **Memory pressure**: thrashing if not enough RAM for cache
- **Background compaction lag**: writes pile up faster than compaction

## Connect to your work

```bash
# Check disk usage
sudo du -sh /home/solana/solana/ledger/accounts/  # disk version
sudo du -sh /mnt/ramdisk/                          # ramdisk version (Alpenglow)

# RAM usage
free -h

# Disk I/O performance
iostat -x 1 3
```

## Hands-on

```bash
# AccountsDB size
sudo du -sh /home/solana/solana/ledger/accounts/ 2>/dev/null
sudo du -sh /mnt/ramdisk/accounts/ 2>/dev/null

# Total accounts у cluster
sudo /home/solana/ag/bin/solana validators --url http://localhost:8899 | wc -l

# Recent disk I/O
iostat -x 1 5 | head -30
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary

[`AccountsDB`](/glossary#a), [`tmpfs`](/glossary#t), [`Compaction`](/glossary#c)

---

**Попередньо:** [← 2. TVU](/module-6/2-tvu) | **Наступне:** [4. Banking & replay →](/module-6/4-stages)
