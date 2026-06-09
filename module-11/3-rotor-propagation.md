<script setup>
const quiz = {
  id: 'm11-3-rotor',
  title: '🧠 Mini-check: Rotor',
  intro: '2 питання.',
  questions: [
    {
      type: 'compare',
      q: 'Turbine vs Rotor — ключові differences.',
      ideal: 'Turbine (current Solana):\n- Hierarchical tree multicast (multi-layer)\n- Separate data shreds + recovery (parity) shreds\n- Validators forward shreds до children layers\n- Stake-weighted tree positioning\n- Complex layer construction algorithm\n\nRotor (Alpenglow):\n- Single-hop relay (no tree layers)\n- Leader sends erasure-coded shreds direct до relay nodes\n- Relay nodes broadcast до all participants\n- Single erasure-coded shred format (no separate data/parity)\n- Stake-weighted relay selection (simpler)\n- Compatible з multicast networks (DoubleZero)\n\nWhy Rotor simpler і чому це matter:\n- Fewer hops = lower latency variability\n- Single shred format = simpler reconstruction\n- Multicast compatible = future DoubleZero integration native\n- 1Gbps validator can broadcast 1500 shreds у 18ms (whitepaper figure)\n\nResult: ~50ms typical block propagation (vs Turbine ~80-100ms). Module 11.3.',
      explanation: ''
    },
    {
      type: 'mcq',
      q: 'Які shred properties змінились у Rotor?',
      options: [
        'Single shred format (no separate data + parity)',
        'Stake-weighted relay node selection',
        'Multicast network compatibility (DoubleZero)',
        'Removed Merkle tree authentication'
      ],
      correct: [0, 1, 2],
      explanation: 'Merkle tree authentication retained via leader signature. Other three — Rotor changes. Module 11.3.'
    }
  ]
}
</script>

# 3. Rotor — block propagation redesign

## TL;DR

**Rotor** = Alpenglow's block propagation protocol. Replaces Turbine's hierarchical multi-layer tree з **single-hop relay** model. Leader sends erasure-coded shreds direct до relay nodes; relays broadcast до all participants. Simpler, faster, multicast-compatible.

⚠️ Rotor SIMD не yet finalized — separate proposal (SIMD-0327 expected). Currently Alpenglow community cluster uses **modified Turbine** until Rotor lands.

## Why redesign propagation

Turbine has served well but has constraints:

1. **Tree construction complexity**: per-slot stake-weighted tree generation = computation
2. **Hierarchical latency variance**: tree path length varies validator-to-validator
3. **Data + parity shred duality**: complex erasure coding bookkeeping
4. **Multicast incompatibility**: tree forwarding не leverages network-level multicast

Rotor redesign goals:

1. **Single hop**: leader → relay → everyone. Predictable latency.
2. **Simpler shred format**: one type, single erasure-coding scheme
3. **Multicast-compatible**: DoubleZero (Module 10.3), other dedicated networks
4. **Faster**: target sub-50ms propagation

## Architecture overview

### Turbine flow (current)

```
              Leader
               │
       ┌───────┴───────┐
       │               │
    Layer 1         Layer 1
    (50 nodes)      (50 nodes)
       │               │
    [tree branches deeper]
       │               │
    Layer 2         Layer 2
    (500 nodes)     (500 nodes)
       │               │
    Layer 3         Layer 3
    (1500 nodes)    (1500 nodes)
```

Each node receives shreds від parent, forwards до children. Tree adapts per-slot.

### Rotor flow (proposed)

```
              Leader
               │
       ┌───┬───┴───┬───┐
       │   │       │   │
     Relay Relay Relay Relay   (~10-50 relay nodes)
       │   │       │   │
       └───┴───┬───┴───┘
               │
       (each relay broadcasts to everyone)
               │
       ┌───────┼───────┐
       │       │       │
   Validator Validator Validator   (everyone receives via any relay)
```

Single hop: leader → relay → everyone. Multiple relays for redundancy.

## Erasure coding changes

### Turbine: dual shred types

- **Data shreds**: actual block content (TXs, metadata)
- **Recovery shreds**: parity (XOR-based, for loss recovery)
- Separate accounting + reconstruction logic

### Rotor: single shred type

- All shreds erasure-coded uniformly
- К/N coding scheme: K data + (N-K) parity in same format
- Reconstruction: any K out of N reconstruct block

Example numbers (hypothetical):
- 64 total shreds per block, 32 needed for reconstruction
- 50% loss tolerance per FEC set
- Simpler than Turbine separate data+parity

## Stake-weighted relay selection

Relay nodes chosen per-slot (similar до leader schedule mechanism):

- Higher stake → higher probability of selection як relay
- ~10-50 relays per slot (numbers TBD у final SIMD)
- Same algorithm-deterministic so all validators agree

Incentive: relay nodes receive small reward для bandwidth contribution. Encourages large operators до provide relay capacity.

## Bandwidth analysis

### Leader bandwidth requirement

Per Alpenglow whitepaper:

```
1 Gbps validator bandwidth
1,500 shreds × ~1280 bytes = ~1.9 MB block
Broadcast time: 1.9 MB / 125 MB/s = 15.2 ms
```

≪ 80ms typical network delay → propagation finishes well within slot window.

### Receiver-side

Each validator receives ~1 shred per relay broadcast (deduplicated if multiple relays). Bandwidth required:

```
Single relay broadcast received: ~1.9 MB
~10 relays × 1.9 MB = 19 MB potential (with deduplication ~1.9 MB effective)
```

Modern validator з 1-10 Gbps connection handles trivially.

## DoubleZero integration

Rotor designed to be **multicast-compatible**:

- Native single-hop = no tree state forwarding
- Multicast networks (DoubleZero) deliver shred to N receivers через single transmission
- Leader sends one packet, network duplicates to all subscribers
- Massive bandwidth efficiency для leader

Without multicast: leader bandwidth = N * single_send.
With multicast: leader bandwidth = 1 * single_send.

DoubleZero (Module 10.3) provides this multicast capability. Rotor + DoubleZero = synergy.

## Authentication

Leader signs Merkle root of all shreds:

```
shred_authentication = ed25519_sign(leader_identity_key, merkle_root(shreds))
```

Each shred contains:
- Slot + position metadata
- Erasure-coded data
- Merkle proof (to verify against root)
- Leader signature

Validators verify:
1. Signature checks out (leader identity)
2. Merkle proof matches shred position
3. Erasure coding reconstructable

Prevents:
- Forgery (signature check)
- Tampering (Merkle proof check)
- Partial sets з different blocks mixed

## Current state (як 2026-06)

**Important**: Rotor not yet implemented. Alpenglow community cluster uses **modified Turbine** для block propagation.

Implementation timeline TBD — possibly after Alpenglow mainnet activation (Q3 2026+), or as separate gradual deployment.

Validators currently testing Votor + Turbine combo. Rotor will be incremental change once SIMD finalized.

### Operational implications зараз

- No Rotor-specific commands or flags для validators
- Turbine knowledge (Module 5.2) still applies
- DoubleZero integration не yet leveraging Rotor multicast
- Stake-weighted positioning matters less than mainnet currently

## Performance comparison

| Metric | Turbine (current) | Rotor (target) |
|---|---|---|
| Propagation latency | 80-100 ms | ~50 ms |
| Tree construction | Per-slot, complex | None — direct relay |
| Shred reconstruction | Data + parity bookkeeping | Single erasure-coding |
| Multicast compat | No | Yes |
| Leader bandwidth | Distribute via tree (~1 hop avg) | Direct to relays (small N) |
| Receiver bandwidth | Forward + receive | Receive only |
| Bandwidth scaling | O(N) for leader | O(1) for leader |

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Rotor`](/glossary#r), [`Single-hop relay`](/glossary#s), [`Relay node`](/glossary#r), [`Multicast (network)`](/glossary#m), [`Stake-weighted relay`](/glossary#s)

## External refs

- [SIMD-0326: Alpenglow (Rotor mentions)](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0326-alpenglow.md)
- [DoubleZero docs](https://docs.malbeclabs.com/)

---

**Попередньо:** [← 2. Votor](/module-11/2-votor-consensus) | **Наступне:** [4. Vote history →](/module-11/4-vote-history)
