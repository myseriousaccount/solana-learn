<script setup>
const quiz = {
  id: 'm9-6-bench',
  title: '🧠 Mini-check: Benchmarking',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього useful benchmarking tools для validator hardware?',
      options: [
        'solana-bench-tps (TX throughput на cluster)',
        'fio (disk I/O random/sequential)',
        'iperf3 (network bandwidth + latency)',
        'sysbench / stress-ng (CPU stress)'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'Все useful для різних aspects. Module 9.6.'
    },
    {
      type: 'command',
      q: 'Як вимірити disk random I/O performance (потрібно для accountsDB benchmark)?',
      accepts: [
        'fio --filename=/path/to/test --size=10G --direct=1 --rw=randread --bs=4k --ioengine=libaio --iodepth=64 --runtime=60 --numjobs=4 --time_based --group_reporting --name=randread-test'
      ],
      ideal: 'fio --filename=/path/to/test --size=10G --direct=1 --rw=randread --bs=4k --ioengine=libaio --iodepth=64 --runtime=60 --numjobs=4 --time_based --group_reporting --name=randread-test',
      explanation: 'fio standard disk benchmark. 4k random read simulates accountsDB access pattern. Want > 200k IOPS для mainnet. Module 9.6.'
    }
  ]
}
</script>

# 6. Benchmarking & performance tools

## TL;DR

Validator performance depends на hardware + software + network. Benchmark tools verify each layer:
- **fio**: disk I/O
- **iperf3**: network bandwidth/latency
- **sysbench / stress-ng**: CPU
- **solana-bench-tps**: end-to-end TX throughput

Run benchmarks: после initial setup, after hardware changes, during performance issues.

## Disk benchmarking (fio)

Most critical для validator. AccountsDB heavily random I/O.

### Install

```bash
sudo apt install fio
```

### 4k random read (accountsDB pattern)

```bash
fio --filename=/home/solana/solana/test_file \
    --size=10G --direct=1 \
    --rw=randread --bs=4k \
    --ioengine=libaio --iodepth=64 \
    --runtime=60 --numjobs=4 \
    --time_based --group_reporting \
    --name=randread-test --eta-newline=1
```

What to expect:

| Disk type | IOPS (random 4k read) |
|---|---|
| Consumer NVMe (Samsung 980) | 100-300k |
| Enterprise NVMe (Samsung 980 Pro) | 500k-1M |
| Mainnet target | > 200k |
| SATA SSD | 50-100k (insufficient) |
| HDD | < 200 (way insufficient) |

### Sequential write (snapshots, replay)

```bash
fio --filename=/home/solana/solana/test_file \
    --size=10G --direct=1 \
    --rw=write --bs=1M \
    --ioengine=libaio --iodepth=4 \
    --runtime=60 --numjobs=1 \
    --time_based --group_reporting \
    --name=write-test
```

Expect:
- NVMe: 1-3 GB/s
- Mainnet target: > 500 MB/s

### Cleanup

```bash
rm /home/solana/solana/test_file
```

## Network benchmarking (iperf3)

Test bandwidth + latency до peers.

### Install

```bash
sudo apt install iperf3
```

### Test до specific peer

```bash
# On peer (server mode)
iperf3 -s

# On your validator (client)
iperf3 -c <peer_ip> -t 30
```

Output shows bandwidth Mbit/s.

### Latency

```bash
ping -c 20 <peer_ip>
# Look at avg, min, max RTT
```

Targets для mainnet:
- Bandwidth: > 1 Gbps до cluster peers
- Latency: < 30ms до major DCs

## CPU benchmarking (sysbench)

Test CPU single-thread + multi-thread.

### Install

```bash
sudo apt install sysbench
```

### Single-thread (важливо для PoH)

```bash
sysbench cpu --threads=1 --time=30 run
```

Look для events per second. Mainnet wants high (modern EPYC: 2000+).

### Multi-thread

```bash
sysbench cpu --threads=$(nproc) --time=30 run
```

Scale roughly linear з cores.

## End-to-end TX throughput (solana-bench-tps)

Built-in Solana tool. Tests how many TXs cluster can process.

```bash
solana-bench-tps \
    --url http://localhost:8899 \
    --keypair YOUR_KEYPAIR \
    --threads 8 \
    --duration 60 \
    --tx-count 100000
```

Sends thousands of test TXs, measures landed rate.

Mainly used by Anza для cluster-wide testing. Single-validator results not meaningful — cluster throughput shared.

## Memory bandwidth (stream)

CPU-RAM bandwidth important для accountsDB cache.

```bash
sudo apt install stream
stream  
# Or compile manually with optimization
```

Output: GB/s for copy/scale/add/triad operations.

DDR4: ~30-50 GB/s typical. DDR5: 50-100+ GB/s.

## End-to-end validator benchmark

Real test = run validator under load. Look at:

```bash
# Skip rate (Module 1.4) — best real metric
solana validators | grep YOUR_IDENTITY

# Vote credits growth rate
solana vote-account YOUR_VOTE | grep -A 2 Credits

# Logs для performance warnings
sudo journalctl -u solana | grep -iE "slow|lag|behind"
```

Якщо all hardware benchmarks pass але skip rate high → likely software/config issue (not hardware).

## Connect to your work

### Pre-deployment audit

Before deploying new validator setup, run benchmarks:

```bash
#!/bin/bash
# /home/devops_ssh/bench-all.sh

echo "=== Disk random 4k read ==="
fio --filename=/tmp/fio_test --size=5G --direct=1 \
    --rw=randread --bs=4k --ioengine=libaio --iodepth=64 \
    --runtime=30 --numjobs=4 --time_based --group_reporting \
    --name=test 2>&1 | grep "IOPS"
rm /tmp/fio_test

echo ""
echo "=== CPU single-thread ==="
sysbench cpu --threads=1 --time=10 run | grep "events per second"

echo ""
echo "=== Memory bandwidth ==="
# (stream output)
```

### Performance regression testing

After upgrade, compare benchmarks before/after. Significant change = regression candidate.

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`fio`](/glossary#f), [`iperf3`](/glossary#i), [`sysbench`](/glossary#s), [`IOPS`](/glossary#i), [`solana-bench-tps`](/glossary#s)

## External refs

- [fio documentation](https://fio.readthedocs.io/)
- [iperf3 docs](https://iperf.fr/iperf-doc.php)

---

**Попередньо:** [← 5. Feature status](/module-9/5-feature-status)
