<script setup>
const quiz = {
  id: 'm6-final',
  title: '⭐ Module 6 — Final quiz',
  intro: '8 питань — validator internals.',
  questions: [
    {
      type: 'compare',
      q: 'TPU vs TVU?',
      ideal: 'TPU = ingest path (incoming TXs from clients). TVU = validate path (incoming blocks from cluster). TPU active when leader, TVU active most of time (validating others). Module 6.1, 6.2.',
      explanation: ''
    },
    {
      type: 'mcq',
      q: 'TPU responsibilities:',
      options: ['Receive TX from clients via QUIC', 'Verify signatures', 'Include у block if leader', 'Replay blocks'],
      correct: [0, 1, 2],
      explanation: 'Replay = TVU. Module 6.1.'
    },
    {
      type: 'mcq',
      q: 'TVU does:',
      options: ['Receive shreds via turbine', 'Replay TXs to verify execution', 'Vote if block valid', 'Submit TXs from clients'],
      correct: [0, 1, 2],
      explanation: 'TX submit = TPU. Module 6.2.'
    },
    {
      type: 'explain',
      q: 'Чому /mnt/ramdisk на Alpenglow?',
      ideal: 'Alpenglow cluster smaller — accountsDB fits in RAM (~16-32GB vs mainnet ~500GB). Tmpfs faster than NVMe. Mainnet uses NVMe + RAM cache. Module 6.3.',
      explanation: ''
    },
    {
      type: 'mcq',
      q: 'AccountsDB на mainnet:',
      options: ['~500GB on NVMe + RAM cache', '~500GB on RAM disk', 'Per-validator distributed', 'Stored on cluster shared storage'],
      correct: [0],
      explanation: 'Module 6.3.'
    },
    {
      type: 'order',
      q: 'Leader producing block:',
      items: ['PoH continuous hash', 'Banking stage execute TXs (Sealevel)', 'Block packing', 'Shreds generation + sign', 'Broadcast turbine'],
      correctOrder: [0, 1, 2, 3, 4],
      explanation: 'Module 6.4.'
    },
    {
      type: 'mcq',
      q: 'Replay stage:',
      options: ['Execute TXs from received block', 'Compute resulting state hash', 'Compare to leader\'s hash', 'Vote based on validity'],
      correct: [0, 1, 2, 3],
      explanation: 'Full replay flow. Module 6.4.'
    },
    {
      type: 'command',
      q: 'Як подивитись threads agave-validator process?',
      accepts: ['ps -T -p $(pgrep -f agave-validator | head -1)', 'top -H -p $(pgrep -f agave-validator | head -1)', 'htop -t -p $(pgrep -f agave-validator | head -1)'],
      ideal: 'ps -T -p $(pgrep -f agave-validator | head -1)',
      explanation: '-T per-thread view. Module 6.4.'
    },
    {
      type: 'compare',
      q: 'Agave (Rust) vs Firedancer (C)?',
      ideal: 'Agave: Anza\'s primary client, Rust-based, mainnet battle-tested.\nFiredancer: Jump Crypto\'s alternative client, C-based (з Rust components у Frankendancer hybrid). Multi-process architecture, kernel-bypass networking, AVX-512 sigverify. Goal: 1M+ TPS у lab.\n\nKey reason для multi-client: network resilience. If agave bug halts cluster — Firedancer validators unaffected. Goal ~50/50 split eventually.\n\nFor operators: stick agave для production, test Firedancer testnet 2026-2027 timeline. Module 6.5.',
      explanation: ''
    }
  ]
}
</script>

# ⭐ Module 6 — Final quiz

<Quiz :data="quiz" />

---

**Наступне:** [Module 7: Stake & rewards →](/module-7/)
