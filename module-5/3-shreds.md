<script setup>
const quiz = {
  id: 'm5-3-shreds',
  title: '🧠 Mini-check: Shreds',
  intro: '3 питання — shred fundamentals.',
  questions: [
    {
      type: 'mcq',
      q: 'Чому Solana використовує shreds (1280 bytes each) замість sending full blocks?',
      options: [
        'UDP packet size limit ~1500 bytes (MTU) — single packet fit best',
        'Faster forwarding — receivers can forward shreds як тільки отримують перші, не чекати whole block',
        'Erasure coding can recover з partial shreds',
        'Smaller shreds менш likely до packet loss'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'Всі 4 — real reasons. UDP MTU + early forwarding + erasure resilience + loss probability. Module 5.3.'
    },
    {
      type: 'compare',
      q: 'Data shreds vs coding shreds — у чому різниця і роль?',
      ideal: 'Data shreds: actual TX data + block metadata. Carry useful information. Validator decoding data shreds reconstructs original block content.\n\nCoding shreds (parity): redundancy для erasure recovery. Computed з data shreds через Reed-Solomon algorithm. Якщо deta shred lost, coding shred + remaining data shreds reconstruct missing data.\n\nTypical ratio: 32 data + 32 coding = 64 total shreds per block batch. Можна recover з будь-якими 32 з 64 (50% loss tolerance).\n\nЗа bandwidth efficiency: leader sends ВСЕ 64 (data + coding). Validator receives partial set, reconstructs. Trade-off: 2× bandwidth для recovery capability.',
      explanation: 'Data = useful info, coding = redundancy для loss tolerance. Module 5.3.'
    },
    {
      type: 'mcq',
      q: 'Якщо validator отримав 25 з 64 shreds для блоку — що відбувається?',
      options: [
        'Block reconstructed (25 < 32 threshold? actually <32 incomplete!)',
        'Block НЕ reconstructed (під threshold 32)',
        'Repair protocol запитує missing shreds',
        'Block dropped silently'
      ],
      correct: [1, 2],
      explanation: '25 < 32 (Reed-Solomon threshold) → cannot reconstruct. Repair protocol kicks in — fetch missing shreds від peers. Якщо still не recover — slot effectively missed. Module 5.3, 5.4.'
    }
  ]
}
</script>

# 3. Shreds & erasure coding

## TL;DR

**Shred** = block fragment, 1280 bytes (fits у single UDP packet). Block split у ~32 data shreds + ~32 coding (parity) shreds = 64 total. Validator can reconstruct block з будь-якими 32+ shreds (50% loss tolerance through Reed-Solomon erasure coding).

## Концепти

### Чому shreds

Three reasons:

1. **UDP MTU**: ethernet MTU = 1500 bytes. Internet ~1280 safe. Shred sized to fit single packet — no fragmentation.

2. **Pipelining**: leader can start broadcasting first shreds **before** finishing block. Receivers start forwarding shreds as soon as received. Total latency reduce dramatically.

3. **Resilience**: erasure coding дозволяє some loss tolerance. Single UDP loss не destroys whole block.

### Shred structure

```
Shred {
    common_header: { slot, index, version, fec_set_index },
    data_header: { parent_offset, flags, size },
    payload: 1024 bytes (data or coding)
    signature: 64 bytes (validator signs кожний shred)
}
Total: ~1280 bytes
```

`fec_set_index` groups shreds у **FEC sets** (Forward Error Correction) — typically 32 data + 32 coding shreds in one FEC set.

### Data shreds vs coding shreds

**Data shreds**: carry actual TX data + block metadata.

**Coding shreds (parity)**: redundancy computed через Reed-Solomon з data shreds. Якщо data shred lost, coding shred allows reconstruction.

Reed-Solomon property: з N data + N coding (2N total), можна recover з будь-яких N. I.e., tolerates up to 50% loss.

Typical: 32 data + 32 coding per FEC set. Recover з 32+ shreds (доль of types).

### Shred lifecycle

```
Leader creates shreds → signs → broadcasts через turbine
   ↓
Layer 1 validators receive → forward до layer 2
   ↓
Layer 2 validators receive → forward до layer 3
   ↓
All validators reconstruct block via shred set
   ↓
Replay TXs, sign vote TX
```

### Repair protocol — when shreds lost

Якщо validator received < threshold shreds (< 32 з 64), can't reconstruct → invokes **repair protocol**:

1. Identify missing shreds (by index)
2. Send repair requests до random peers (multiple, redundancy)
3. Peers send missing shreds back
4. Reconstruct block

Repair adds latency (extra round-trip) — недобре якщо потрібно vote ASAP. But mejor better than losing slot entirely.

Module 5.4 deeper on repair.

## Connect to your work

### Shred version

Cluster has **shred_version** identifying current protocol/genesis. Validators з different shred_version filtered out.

Constants на Alpenglow:
```
Shred version: 63812 (post-restart Jun 2026)
Shred version (old): 50731 (pre-restart)
```

Якщо твій validator має shred_version mismatch — gossip filters peers, validator isolated. Можлива причина: leftover ledger from old cluster (genesis hash mismatch у tmp-genesis/).

### Monitoring shreds

```bash
sudo journalctl -u solana | grep -iE "shred|fec" | tail -20
```

Watch для:
- "Insufficient shreds to reconstruct slot X" — packet loss issue
- "Repair completed for slot X" — recovery worked
- "Discarding old shreds from slot X" — receiving outdated shreds (gossip issue?)

## Hands-on exercise

```bash
# Shred activity у logs
sudo journalctl -u solana | grep -i shred | tail -20

# Recent block info (includes shred count)
SLOT=$(sudo /home/solana/ag/bin/solana slot --url http://localhost:8899)
sudo /home/solana/ag/bin/solana block $((SLOT - 10)) --url http://localhost:8899 | head -20

# Shred version (from genesis)
sudo /home/solana/ag/bin/solana cluster-version --url http://localhost:8899
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Shred`](/glossary#s), [`Data shred`](/glossary#d), [`Coding shred`](/glossary#c), [`FEC set`](/glossary#f), [`Reed-Solomon`](/glossary#r), [`Shred version`](/glossary#s)

## External refs

- [Anza: Shreds](https://docs.anza.xyz/consensus/turbine-block-propagation)

---

**Попередньо:** [← 2. Turbine](/module-5/2-turbine) | **Наступне:** [4. Repair protocol →](/module-5/4-repair)
