<script setup>
const quiz = {
  id: 'm5-2-turbine',
  title: '🧠 Mini-check: Turbine',
  intro: '3 питання — block propagation.',
  questions: [
    {
      type: 'mcq',
      q: 'Чому Turbine використовує tree structure а не broadcast (leader → всім напряму)?',
      options: [
        'Bandwidth: leader не має enough для send блок до 2000+ validators одночасно',
        'Latency: tree пропагація швидша ніж sequential broadcast',
        'Resilience: hierarchical structure resilient до node failures',
        'Security: tree prevents DoS attacks'
      ],
      correct: [0, 1, 2],
      explanation: 'Direct broadcast би overwhelm leader bandwidth. Tree distributes load. Module 5.2.'
    },
    {
      type: 'explain',
      q: 'Поясни як turbine tree формується і чому позиція validator у tree affects performance.',
      ideal: 'Turbine tree:\n1. Leader = root\n2. Children = subset validators (e.g., 200 first-layer neighbors)\n3. Their children = next layer\n4. Cascade until reach всі validators\n\nДва-три levels typically для mainnet ~2000 validators.\n\nPosition matters:\n- Layer 1 (close до leader): receive shreds first, ~0-20ms after leader produces. Low latency, more chances to vote on time.\n- Layer 2: receive ~30-60ms after.\n- Layer 3 (deep): receive ~100ms+ after. Higher chance to miss vote window.\n\nTree shuffled per slot (stake-weighted). Validators з більшим stake more likely в layer 1.\n\nResilience: erasure coding (Reed-Solomon) дозволяє recover block з ~50% shreds. Even якщо some tree branches fail.\n\nFor operator: low network latency до major datacenters (where most stake located) = better position у tree consistently.',
      explanation: 'Module 5.2.'
    },
    {
      type: 'mcq',
      q: 'Якщо validator misses 30% shreds через packet loss — він може reconstruct block?',
      options: ['Так, якщо ≤ 50% loss (erasure coding handles до 50%)', 'Ні, потрібен 100% delivery', 'Тільки через repair protocol', 'Залежить від turbine layer'],
      correct: [0],
      explanation: 'Reed-Solomon erasure coding у turbine дозволяє reconstruct з ~50% shreds. Module 5.2, 5.3.'
    }
  ]
}
</script>

# 2. Turbine — block propagation

## TL;DR

**Turbine** — Solana's block propagation protocol. Leader **не** broadcasts block до всіх validators напряму. Замість того створюється hierarchical tree: leader sends shreds до small set neighbors (layer 1), they forward до layer 2, etc. Cascade reaches whole cluster fast без overloading leader bandwidth.

## Концепти

### Чому не direct broadcast

Mainnet ~2000 validators. Block ~10KB (~32 shreds × 1280 bytes). Якщо leader sends block до всіх:

```
Bandwidth = 10KB × 2000 = 20MB per block
Per slot rate = 20MB / 0.4s = 50 MB/s = 400 Mbps from leader
```

Most validators не мають 400 Mbps available для leadership. Direct broadcast не feasible.

Solution: **tree multicast** — leader sends до small subset, they forward.

### Turbine tree structure

```
Layer 0:         Leader
                   |
                   v
Layer 1:    [validators A, B, C, ..., X]   (~200 nodes)
              |        |        |
              v        v        v
Layer 2:    nodes    nodes    nodes        (next ~1800 nodes split across)
```

Typical 2-3 layers для mainnet sized cluster.

Кожен layer receives shreds, forwards до next layer. Cascade ends коли всі validators received shreds.

### Tree generation (per slot)

Tree shuffled deterministically per slot, stake-weighted:

- Higher stake → more likely у early layers
- Lower stake → more likely deeper

Це incentive: more stake = better network position.

### Erasure coding (Reed-Solomon)

Турбіна uses **Reed-Solomon** erasure coding для resilience:

- Block split into 32 data shreds
- Compute 32 parity shreds (redundancy)
- 64 total shreds broadcast

Validator can reconstruct block з **будь-якими 32+ shreds** (з 64). I.e., може lose up to 50% shreds без losing block.

Це critical для UDP-based protocol (packet loss inevitable).

### Performance implications

Validator's turbine position affects:

- **Latency receive shreds**: layer 1 = first, layer 3 = last
- **Vote timing**: must vote ASAP після reconstruct block. Late position = late vote = potentially miss credit window
- **Block forward bandwidth**: layer 1 must forward many shreds to children

Tier 1 validators (high stake, good network) consistently у layer 1 — getting best performance — earning most credits — staying high stake. Network effect.

## Connect to your work

### Network requirements

Для good turbine performance:

- **Low latency** до cluster centroid (where most stake located). Mainnet ~Equinix data centers.
- **High bandwidth**: 1Gbps+ symmetric. 10Gbps preferred.
- **Low packet loss**: enterprise ISP, dedicated lines preferred

Якщо твій server у далекому location — perpetually layer 3 → higher skip rate → less credits.

### Monitoring turbine performance

```bash
sudo journalctl -u solana | grep -iE "turbine|shred" | tail -20
```

Look for:
- "Turbine shred broadcast failed" — network issue
- "Repair needed for slot X" — missed shreds
- "Reconstructing block from N shreds" — partial receive

## Hands-on exercise

```bash
# Поточні tcp/udp connections
ss -tunap | grep agave-validator | head -10

# Network bandwidth usage
sudo iftop -i eth0 2>/dev/null || sudo nethogs eth0
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Turbine`](/glossary#t), [`Multicast`](/glossary#m), [`Turbine tree`](/glossary#t), [`Layer (turbine)`](/glossary#l), [`Reed-Solomon`](/glossary#r)

## External refs

- [Anza: Turbine](https://docs.anza.xyz/consensus/turbine-block-propagation)

---

**Попередньо:** [← 1. Gossip](/module-5/1-gossip) | **Наступне:** [3. Shreds →](/module-5/3-shreds)
