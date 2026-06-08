<script setup>
const quiz = {
  id: 'm5-final',
  title: '⭐ Module 5 — Final quiz',
  intro: '10 питань — networking синтез.',
  questions: [
    {
      type: 'mcq',
      q: 'Через що передається через gossip?',
      options: ['Cluster nodes membership', 'Validator versions', 'Vote signatures (sometimes)', 'Full transaction data'],
      correct: [0, 1, 2],
      explanation: 'TX data через TPU, не gossip. Module 5.1.'
    },
    {
      type: 'command',
      q: 'Як подивитись всі nodes cluster через gossip?',
      accepts: ['solana gossip', 'sudo /home/solana/ag/bin/solana gossip --url http://localhost:8899'],
      ideal: 'solana gossip',
      explanation: 'Module 5.1.'
    },
    {
      type: 'explain',
      q: 'Чому turbine використовує tree а не direct broadcast?',
      ideal: 'Direct broadcast би require leader send ~10KB до 2000 validators per 400ms = ~400 Mbps. Most validators не мають такого uplink. Tree distributes bandwidth load through hierarchy. Layer 1 (~200 nodes) receive from leader, forward to layer 2 (~1800 nodes). Each node has manageable load.\n\nAlso: tree provides resilience (some node failures don\'t block propagation), and erasure coding makes 50% packet loss recoverable.',
      explanation: 'Module 5.2.'
    },
    {
      type: 'mcq',
      q: 'Як positioning у turbine tree affect validator performance?',
      options: [
        'Layer 1: get shreds first, vote on time',
        'Layer 3: receive shreds late, higher chance miss vote window',
        'Lower stake → deeper layer',
        'Tree position random, не stake-weighted'
      ],
      correct: [0, 1, 2],
      explanation: 'Tree stake-weighted. Module 5.2.'
    },
    {
      type: 'mcq',
      q: 'Чому shreds 1280 bytes?',
      options: [
        'UDP MTU ~1500 bytes — fit у single packet',
        'Smaller packets менш likely lost',
        'Allows early forwarding (don\'t wait full block)',
        'Erasure coding works per-shred'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'Module 5.3.'
    },
    {
      type: 'compare',
      q: 'Data shreds vs coding shreds?',
      ideal: 'Data shreds — actual block content (TX data, metadata). Coding shreds — Reed-Solomon parity for erasure recovery. Typical: 32 data + 32 coding per FEC set. Recovery з будь-якими 32+ (50% loss tolerance). Bandwidth cost: 2x (send both types) у обмін for resilience.',
      explanation: 'Module 5.3.'
    },
    {
      type: 'mcq',
      q: 'Якщо validator received 20 з 64 shreds для slot:',
      options: [
        'Block reconstructed (20 < 32 threshold)',
        'Block НЕ reconstructed',
        'Repair protocol requests missing shreds',
        'Slot dropped silently'
      ],
      correct: [1, 2],
      explanation: '20 < 32 threshold. Repair kicks in. Module 5.3, 5.4.'
    },
    {
      type: 'mcq',
      q: 'Коли repair protocol triggers?',
      options: [
        'Missing shreds для current slot',
        'Catch-up after downtime',
        'Cluster restart recovery',
        'Кожний block перевіряти'
      ],
      correct: [0, 1, 2],
      explanation: 'Module 5.4.'
    },
    {
      type: 'explain',
      q: 'Поясни як snapshots дозволяють fast catch-up.',
      ideal: 'Snapshots — compressed state dumps accountsDB на specific slot. Full snapshot ~80-100 GB на mainnet, contains всі accounts state. Incremental snapshots ~1 GB, delta from last full.\n\nFast catch-up flow:\n1. Validator downloads recent full + recent incremental з cluster peers\n2. Reconstructs state at snapshot slot\n3. Then catches up from snapshot slot to cluster head через repair protocol (replay missed slots since snapshot)\n\nWithout snapshots — replay all history з genesis = days/weeks. With snapshots — ~30-90 min for download + short catch-up.',
      explanation: 'Module 5.4.'
    },
    {
      type: 'command',
      q: 'Як перевірити catch-up status валідатора?',
      accepts: ['sudo /home/solana/ag/bin/agave-validator --ledger /home/solana/solana/ledger catchup', 'agave-validator --ledger /home/solana/solana/ledger catchup'],
      ideal: 'sudo /home/solana/ag/bin/agave-validator --ledger /home/solana/solana/ledger catchup',
      explanation: 'catchup subcommand shows current slot lag і progress. Module 5.4.'
    },
    {
      type: 'compare',
      q: 'QUIC vs TCP для Solana TPU? Чому QUIC обрали?',
      ideal: 'QUIC: UDP-based з TCP-like reliability + multiplexing + 0-RTT для repeat connections + built-in TLS. Solana TPU uses for incoming TX submissions.\n\nTCP: simpler, but higher handshake latency, one stream per connection, no built-in encryption.\n\nWhy QUIC: many concurrent senders (clients submitting TXs), multiplexing handles efficiently, lower latency than TCP. Plus stake-weighted QUIC prioritizes known validator-to-validator traffic — anti-spam. Module 5.5.',
      explanation: ''
    }
  ]
}
</script>

# ⭐ Module 5 — Final quiz

<Quiz :data="quiz" />

---

**Наступне:** [Module 6: Validator internals →](/module-6/)
