<script setup>
const quiz = {
  id: 'm8-5-hardware',
  title: '🧠 Mini-check: Hardware',
  intro: '3 питання — hardware requirements.',
  questions: [
    {
      type: 'mcq',
      q: 'Mainnet validator min CPU specs?',
      options: [
        '12+ cores, high single-thread perf (AMD EPYC або Intel Xeon Gold, 3.5GHz+ boost)',
        '4 cores any CPU',
        '32+ cores low frequency',
        'GPU mandatory'
      ],
      correct: [0],
      explanation: 'PoH single-threaded, потребує high single-thread performance. AMD EPYC 7xxx / Intel Xeon Gold з 3.5GHz+ boost. 12-16 cores typical. GPU optional (for sigverify). Module 8.5.'
    },
    {
      type: 'explain',
      q: 'Чому NVMe critical для validator (не SATA SSD)?',
      ideal: 'Validator continuously read/write accountsDB: replay TXs (read accounts), update states (write modified), snapshot generation (bulk write). Mainnet ~3000 TPS, тисячі accounts modified per second.\n\nSATA SSD: max ~500 MB/s sequential, much slower random (~100 MB/s). Random I/O для accountsDB операцій = bottleneck.\n\nNVMe: 3000-7000 MB/s sequential, near-line random performance. Handle validator load comfortable.\n\nЕnterprise NVMe (Samsung 980 Pro, Micron 9300, Intel D7-P5000) — кращі за consumer (better endurance, sustained perf). Consumer NVMe може work для testnet, не recommend mainnet.\n\nMinimum recommended:\n- Mainnet: 2x NVMe (one ledger, one accountsDB або combined ZFS), ~4TB total\n- Testnet: 1x NVMe enterprise grade ~2TB',
      explanation: 'Random I/O performance differential. Module 8.5.'
    },
    {
      type: 'mcq',
      q: 'Що з цього важливо для validator networking?',
      options: [
        '1Gbps+ symmetric bandwidth (10Gbps preferred mainnet)',
        'Low latency до major DCs (Equinix where most stake)',
        'Static IP',
        'IPv6 mandatory'
      ],
      correct: [0, 1, 2],
      explanation: 'Bandwidth + latency + static IP. IPv6 optional. Module 8.5.'
    }
  ]
}
</script>

# 5. Hardware specifications

## TL;DR

Validator hardware requirements differ значно per cluster (mainnet most demanding). Critical: high single-thread CPU (PoH), enterprise NVMe (accountsDB I/O), large RAM (accountsDB cache), high bandwidth (turbine).

## Mainnet validator requirements

### CPU

**Required**: High single-thread performance (PoH service single-threaded).

| Tier | CPU | Notes |
|---|---|---|
| **Recommended** | AMD EPYC 9474F (48-core, 4.1GHz boost) | Latest gen, top performance |
| **Good** | AMD EPYC 7763 (64-core, 3.5GHz boost) | Common choice, proven |
| **Acceptable** | AMD EPYC 74F3 (24-core, 4.0GHz boost) | High freq, less cores |
| **Intel alternative** | Intel Xeon Gold 6354 (18-core, 3.6GHz boost) | If Intel preferred |
| **NOT recommended** | Consumer Ryzen | Lower sustained perf |
| **NOT acceptable** | Older Xeon E5 | Single-thread too слабкий |

PoH wants 3.5GHz+ boost. Cores beyond 16 mostly help sigverify (если no GPU) and parallel TX execution.

### RAM

| Cluster | Min | Recommended |
|---|---|---|
| Mainnet | 256 GB | 384-512 GB |
| Testnet | 128 GB | 256 GB |
| Alpenglow (community) | 64 GB | 128 GB |

Mainnet ~500GB accountsDB. RAM caches hot accounts. More RAM → less disk pressure → better performance.

ECC RAM strongly recommended (silent corruption у DB = catastrophic).

### Storage

**Two NVMe drives recommended мainnet:**

1. **Ledger drive** (~2TB): Samsung 980 Pro, Micron 9300 series. Random I/O important.
2. **Snapshots/accountsDB cache** (~2TB): same class.

Enterprise NVMe (not consumer):
- Higher endurance (5+ DWPD)
- Sustained performance (no thermal throttling)
- Larger DRAM cache

Avoid:
- SATA SSDs (too slow random I/O)
- HDDs (impossible)
- Consumer NVMe (thermal throttling under load)

### Network

| Property | Required | Recommended |
|---|---|---|
| Bandwidth | 1 Gbps symmetric | 10 Gbps |
| Latency to major DCs | < 50ms | < 10ms |
| Monthly traffic | ~5 TB | ~20 TB capacity |
| Static IP | Required | Required |

**Co-location у tier-1 datacenter** (Equinix, NTT, Digital Realty) where most other validators located. Reduces turbine latency dramatically.

Common locations: Frankfurt (Equinix FR4), Amsterdam (Equinix AM3), Tokyo (Equinix TY2), Ashburn (Equinix DC2).

### GPU (optional)

Sigverify (signature verification) можна accelerate з GPU:
- NVIDIA Turing/Ampere+ (RTX 2080+, A4000+, A100)
- Boost: ~2-5x signature throughput

Optional. Modern CPUs з 16+ cores можуть handle без GPU.

## Testnet validator requirements

Similar profile, smaller scale:
- CPU: 16-24 cores, 3.5GHz+
- RAM: 128 GB
- Storage: 1-2 TB enterprise NVMe
- Network: 1 Gbps symmetric

Testnet stake/load smaller, requirements lighter.

## Alpenglow community cluster

Much smaller cluster, less demanding:
- CPU: 16+ cores, 3.0GHz+
- RAM: 64-128 GB
- Storage: 500GB-1TB NVMe (consumer OK)
- Network: 1 Gbps

WNX0016778 likely fits this profile.

## Cost estimate (monthly)

| Tier | Setup | Approx $/mo |
|---|---|---|
| Mainnet (top-tier) | EPYC 9474F + 512GB + 4TB NVMe + 10Gbps + Equinix | $1500-2500 |
| Mainnet (good) | EPYC 7763 + 384GB + 4TB NVMe + 10Gbps + tier-2 DC | $800-1500 |
| Testnet | EPYC 7443 + 128GB + 2TB NVMe + 1Gbps | $400-800 |
| Alpenglow community | Mid-range hosting | $200-400 |

## Hosting providers commonly used

- **Latitude.sh**: validator-friendly, bare-metal у key locations
- **Bloq.it**: Solana-specific hosting
- **OVHcloud**: cheap but variable performance
- **Equinix Metal**: tier-1 datacenters
- **Hetzner**: cost-effective Germany (testnet/Alpenglow OK, mainnet borderline)
- **iWeb / Server Mania**: alternative providers

⚠️ Avoid hyperscalers (AWS/GCP) для mainnet validators — too expensive, ~$5-10k/mo. OK for RPC nodes.

## Connect to your work

### Hardware audit команди

```bash
# CPU info
lscpu | grep -E "Model name|MHz|CPU\(s\):"

# RAM total + free
free -h

# Disk type + size (look for "nvme" у name)
lsblk
df -h /home/solana/solana/ledger

# Network info
ip link show
ethtool eth0 | grep Speed
```

### Performance test scripts

```bash
# CPU single-thread benchmark
openssl speed -evp aes-256-gcm 2>/dev/null | tail -5

# Disk random I/O
sudo fio --filename=/home/solana/solana/test --size=10G --direct=1 \
    --rw=randread --bs=4k --ioengine=libaio --iodepth=64 \
    --runtime=60 --numjobs=4 --time_based --group_reporting \
    --name=randread-test --eta-newline=1
# Want: > 200k IOPS for mainnet

# Network bandwidth
iperf3 -c <some-server-у-cluster>
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`NVMe`](/glossary#n), [`DWPD`](/glossary#d), [`Co-location`](/glossary#c), [`Equinix`](/glossary#e), [`PoH bottleneck`](/glossary#p)

## External refs

- [Solana Validator Requirements](https://docs.anza.xyz/operations/requirements)
- [Stakewiz cluster hardware survey](https://stakewiz.com/) — actual deployed hardware data

---

**Попередньо:** [← 4. Upgrade safety](/module-8/4-upgrade-safety) | **Наступне:** [6. Kernel & network tuning →](/module-8/6-kernel-tuning)
