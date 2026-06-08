<script setup>
const quiz = {
  id: 'm8-6-kernel',
  title: '🧠 Mini-check: Kernel tuning',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього важливі sysctl settings для validator?',
      options: [
        'net.core.rmem_max / wmem_max (UDP buffer sizes)',
        'vm.swappiness (avoid swap pressure)',
        'fs.file-max (allow many open file descriptors)',
        'kernel.panic (machine reboot policy)'
      ],
      correct: [0, 1, 2],
      explanation: 'Network buffers + swap + file descriptors critical. Panic не affects validator runtime. Module 8.6.'
    },
    {
      type: 'explain',
      q: 'Чому swappiness should be дуже low (e.g., 1) для validator?',
      ideal: 'Swap = Linux moves rarely-used RAM pages to disk коли RAM pressure. Великий cost: disk much slower than RAM (~1000x latency).\n\nValidator continuously reads accountsDB hot accounts. Якщо OS swaps these → next access = disk read → блокує TX processing → late voting → missed credits.\n\nDefault swappiness = 60 (aggressive swap). Validator wants 1 (almost no swap, prefer drop file cache).\n\nIdeally: NO swap взагалі. Якщо out of RAM — better OOM kill than slow degradation. Configure:\n\nsudo sysctl -w vm.swappiness=1\n# або disable swap entirely:\nsudo swapoff -a\n\nMonitor swap usage:\nfree -h | grep Swap\n# Should be 0 used',
      explanation: 'Module 8.6.'
    }
  ]
}
</script>

# 6. Kernel & network tuning

## TL;DR

Validator performance critically depends on kernel + network settings. Default Linux configs не optimized для high-throughput UDP-based workloads. Mainnet validators tune sysctl + ulimits + NIC settings для extracting full performance.

## Critical sysctl settings

```bash
# /etc/sysctl.d/99-solana.conf

# UDP buffer sizes — turbine uses UDP, default buffers too small
net.core.rmem_max = 134217728     # 128MB read buffer
net.core.wmem_max = 134217728     # 128MB write buffer
net.core.rmem_default = 134217728
net.core.wmem_default = 134217728

# Network connection tracking + state
net.netfilter.nf_conntrack_max = 1000000
net.core.netdev_max_backlog = 10000
net.ipv4.tcp_max_syn_backlog = 8096

# Reduce swap pressure
vm.swappiness = 1
vm.dirty_ratio = 60
vm.dirty_background_ratio = 5

# File descriptors
fs.file-max = 1000000
fs.nr_open = 1000000
```

Apply:

```bash
sudo sysctl -p /etc/sysctl.d/99-solana.conf
```

## ulimits (per-user resource limits)

Validator opens many sockets, file descriptors. Default `ulimit -n` зазвичай 1024 — way too low.

```bash
# /etc/security/limits.d/99-solana.conf

solana soft nofile 1000000
solana hard nofile 1000000
solana soft nproc 65536
solana hard nproc 65536
solana soft memlock unlimited
solana hard memlock unlimited
```

Або у systemd unit file (preferred):

```ini
[Service]
LimitNOFILE=1000000
LimitNPROC=65536
LimitMEMLOCK=infinity
```

## NIC tuning

Network interface card settings affect packet throughput:

```bash
# Disable offload features що interfere з UDP performance
sudo ethtool -K eth0 gro off gso off tso off lro off

# Increase ring buffer sizes
sudo ethtool -G eth0 rx 8192 tx 8192

# Multi-queue для multi-core distribution
sudo ethtool -L eth0 combined <NUM_CORES>
```

Verify:

```bash
sudo ethtool -k eth0 | grep -E "rx-checksumming|tcp-segmentation"
sudo ethtool -g eth0  # ring sizes
sudo ethtool -l eth0  # queue count
```

## CPU governor

Mainnet wants max performance, не power-save:

```bash
# Set все CPUs до performance governor
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Persistent через cpufrequtils package або systemd service
```

Check current:

```bash
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
# Should: performance
```

## Disable transparent huge pages (THP)

THP може cause latency spikes для validator:

```bash
echo never | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
echo never | sudo tee /sys/kernel/mm/transparent_hugepage/defrag
```

Persistent через GRUB:

```
# /etc/default/grub
GRUB_CMDLINE_LINUX_DEFAULT="... transparent_hugepage=never"
```

## NUMA pinning (multi-socket servers)

Якщо validator server has 2+ CPU sockets — NUMA awareness важлива. Memory access across NUMA nodes slow.

```bash
# Check NUMA topology
numactl --hardware

# Pin validator до specific NUMA node
numactl --cpunodebind=0 --membind=0 agave-validator ...
```

У systemd unit:

```ini
[Service]
ExecStart=/usr/bin/numactl --cpunodebind=0 --membind=0 /home/solana/ag/bin/agave-validator ...
```

Чому: cross-NUMA memory access can be 2x slower. Pin validator до one NUMA node → consistent perf.

## Swap configuration

Best practice mainnet: **disable swap completely** (OOM kill is better than slow degradation).

```bash
sudo swapoff -a
# Comment swap line у /etc/fstab щоб не re-enable on boot
```

If swap required (low RAM testnet): minimal swap, low swappiness:

```bash
vm.swappiness = 1
```

## File system

ext4 OK. ZFS popular advanced (snapshots, compression). XFS теж OK.

Mount options для ledger drive:

```
/dev/nvme0n1p1 /home/solana/solana/ledger ext4 \
    defaults,noatime,nodiratime 0 0
```

`noatime`/`nodiratime` — don't update access timestamps (saves writes).

## Validation: verify all tuning applied

```bash
# sysctl
sysctl net.core.rmem_max          # 134217728
sysctl vm.swappiness               # 1

# ulimits (як solana user)
sudo -u solana bash -c 'ulimit -n'  # 1000000

# THP disabled
cat /sys/kernel/mm/transparent_hugepage/enabled  # always madvise [never]

# CPU governor
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor  # performance

# Swap off
free -h | grep Swap  # 0 total
```

## Connect to your work

### Validation script

Створи checklist script для quick audit:

```bash
#!/bin/bash
# /home/devops_ssh/tune-check.sh

echo "=== Kernel tuning check ==="
echo "rmem_max: $(sysctl -n net.core.rmem_max)"
echo "swappiness: $(sysctl -n vm.swappiness)"
echo "THP: $(cat /sys/kernel/mm/transparent_hugepage/enabled | grep -o '\[.*\]')"
echo "CPU governor: $(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor)"
echo "Swap: $(free -h | grep Swap | awk '{print $3}')"
echo "ulimit -n (solana): $(sudo -u solana bash -c 'ulimit -n')"
echo "File descriptors used: $(cat /proc/$(pgrep -f agave-validator | head -1)/limits 2>/dev/null | grep 'Max open files' | awk '{print $4}')"
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`sysctl`](/glossary#s), [`ulimits`](/glossary#u), [`THP`](/glossary#t), [`NUMA`](/glossary#n), [`CPU governor`](/glossary#c)

## External refs

- [Solana validator system tuning](https://docs.anza.xyz/operations/guides/validator-start)

---

**Попередньо:** [← 5. Hardware specs](/module-8/5-hardware-specs) | **Наступне:** [7. Treasury multisig →](/module-8/7-treasury-multisig)
