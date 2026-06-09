<script setup>
const quiz = {
  id: 'm11-2-votor',
  title: '🧠 Mini-check: Votor consensus',
  intro: '3 питання — fundamentals two-round voting.',
  questions: [
    {
      type: 'compare',
      q: 'Tower BFT vs Votor — основні архітектурні differences.',
      ideal: 'Tower BFT:\n- Vote = on-chain TX, signed Ed25519, embedded у block\n- Lockouts: exponential commitment 2^N slots\n- Finality: 32-deep tower (~12.8 sec)\n- Each validator submits own vote independently\n- Block space consumed by votes\n\nVotor:\n- Vote = off-chain message, signed BLS, aggregated peer-to-peer\n- NO lockouts — slot decisions deterministic via 60/80% thresholds\n- Finality: 100-150 ms (single або dual round)\n- Validators broadcast votes, anyone aggregates до certificate\n- Block space free від vote overhead\n\nKey design philosophy difference:\n- Tower: pessimistic safety через lockouts (validator commits not switching)\n- Votor: optimistic + provable (mathematical thresholds prevent conflicting finality)\n\nResult: 100x finality improvement з maintained safety guarantees. Module 11.2.',
      explanation: ''
    },
    {
      type: 'order',
      q: 'Постав steps у правильному порядку для Votor slot lifecycle (one round path):',
      items: [
        'Leader produces block at slot N',
        'Block propagates via Rotor до validators',
        'Validators replay TXs, decide notarize vs skip',
        'Each validator broadcasts notarize vote (BLS signature)',
        '≥80% notarize votes у aggregator → Fast-Finalization certificate',
        'Slot N finalized, ancestors automatically finalized'
      ],
      correctOrder: [0, 1, 2, 3, 4, 5],
      explanation: 'Linear flow: produce → propagate → replay → vote → aggregate → finalize. Module 11.2.'
    },
    {
      type: 'mcq',
      q: 'Які vote types existують у Votor? (обери всі)',
      options: [
        'notarize — "block X valid у slot N"',
        'skip — "no block у slot N (timeout)"',
        'finalize — "слот ready for finality"',
        'notarize-fallback, skip-fallback — safety conditions у round 2'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'All four types. notarize/skip — round 1. finalize — round 2 positive. fallback variants — round 2 conditions when round 1 уtoday clear. Module 11.2.'
    }
  ]
}
</script>

# 2. Votor — two-round voting protocol deep

## TL;DR

**Votor** = Alpenglow's voting + finalization component. Replaces Tower BFT. Two voting paths run concurrently per slot:

- **Fast-Finalization**: ≥80% notarize votes у round 1 → finalize (single round, ~100ms)
- **Slow-Finalization**: ≥60% notarize у round 1 + ≥60% finalize у round 2 → finalize (~150ms)

Whichever threshold crossed first wins. Stake overlap mathematically guarantees impossibility two conflicting blocks finalize.

## Why новий voting protocol

Tower BFT design constraints:

1. **Sequential lockout chain**: must wait для 32 votes back-to-back для max finality (12.8s)
2. **Vote TXs on-chain**: bandwidth + storage cost
3. **Independent validator decisions**: no certificate aggregation
4. **Reconstruction complexity**: tower.bin сomplex per-validator state

Votor redesign principles:

1. **Mathematical finality thresholds**: 60/80% stake makes conflicting finality provably impossible
2. **Off-chain votes**: peer-to-peer broadcast, BLS aggregation, certificates anchored on-chain
3. **Optimistic fast path** + pessimistic fallback path
4. **Local validator state minimal** (current view of certificates only)

## Two-round structure

### Round 1 vote types

Кожен validator у slot N decides:

- **`notarize`**: "I observed block X valid у slot N, it built on parent block correctly"
- **`skip`**: "I did not observe valid block (timeout or invalid block received)"

Single vote per validator per slot per round. Broadcast via peer-to-peer overlay (not gossip overhead).

### Round 1 outcomes

Aggregator (any validator) collects votes:

| Aggregate result | Outcome |
|---|---|
| ≥80% notarize | **Fast-Finalization certificate**, slot finalized at ~100ms |
| ≥60% notarize (but < 80%) | Notarization certificate issued, round 2 begins |
| ≥60% skip/skip-fallback | Skip certificate, slot becomes skipped |
| < 60% on any | Inconclusive, round 2 fallback path |

### Round 2 vote types (якщо needed)

- **`finalize`**: "Notarization happened у round 1, I commit slot як final"
- **`notarize-fallback`**: "Safety condition met, I can fall back до notarizing"
- **`skip-fallback`**: "Safety condition met, I can fall back до skipping"

### Round 2 outcomes

| Aggregate result | Outcome |
|---|---|
| ≥60% finalize | **Slow-Finalization certificate**, slot finalized |
| ≥60% notarize/notarize-fallback | Notar-fallback certificate (slot notarized) |
| ≥60% skip/skip-fallback | Skip certificate |
| Inconclusive | Slot uncertain — next leader's view determines |

## Visualization

```
                ┌─────────────────────────────────────────┐
                │ Slot N start (400ms window)             │
                │ Leader of slot N: produces block X      │
                └─────────────────┬───────────────────────┘
                                  │ propagate via Rotor
                                  ▼
                ┌─────────────────────────────────────────┐
                │ Round 1: each validator votes           │
                │   notarize(X) OR skip                   │
                └─────────────────┬───────────────────────┘
                                  │ aggregate
                       ┌──────────┴──────────┐
                       │                     │
              ≥80% notarize           ≥60% notarize       < 60%
                       │                     │              │
                       ▼                     ▼              ▼
                ┌──────────┐       ┌──────────────┐  ┌──────────────┐
                │ FAST     │       │ Notarization │  │ Inconclusive │
                │ FINAL    │       │ cert issued, │  │ → round 2    │
                │ ~100ms   │       │ round 2 ?    │  │ fallback     │
                └──────────┘       └──────┬───────┘  └──────────────┘
                                          │
                                          ▼
                                  ┌──────────────┐
                                  │ Round 2:     │
                                  │ finalize     │
                                  │ OR fallback  │
                                  └──────┬───────┘
                                         ▼
                                  ≥60% finalize → SLOW FINAL ~150ms
```

## BLS aggregation mechanics

### Why BLS signatures

Traditional Ed25519 (TowerBFT):

- Vote signature: 64 bytes
- 1000 validators voting = 64,000 bytes signature data
- Each vote separate TX on-chain

BLS12-381 aggregation:

- N individual signatures combine у **one** aggregate signature (96 bytes)
- Aggregate pubkey teж 96 bytes
- Verification time: const-ish (one pairing operation)
- Network footprint: dramatically reduced

### Certificate structure

```
Certificate {
    slot: u64,
    cert_type: enum {
        Notarization,
        FastFinalization,
        SkipFallback,
        Finalization,
        NotarFallback,
    },
    aggregated_signature: [u8; 96],
    aggregated_pubkey: [u8; 96],
    voter_bitmap: BitVec,         // які validators contributed
    stake_amount: u64,             // total stake voting
}
```

`voter_bitmap` дозволяє reconstructing which validators voted, для accountability + rewards calculation.

### Certificate UDP fit

Critical design constraint: cert must fit у single UDP packet (~1280 bytes max).

```
~1280 bytes available
- header overhead: ~100 bytes
- BLS signature + pubkey: ~200 bytes
- voter bitmap (2000 bits): ~250 bytes
- metadata: ~100 bytes
Total: ~650 bytes, well within budget
```

Allows certificate broadcast via simple UDP — no chunking, no retries dance.

## Validator counts cap

Per Alpenglow protocol: cluster limited до **2,000 highest-staked validators**.

Why:

- Cert UDP packet size constraint (bitmap для 2000 validators = 250 bytes)
- Aggregation latency (more validators → slower aggregation)
- Communication overhead (broadcast cost scales з N)

Current mainnet has ~1500-2000 active validators — within constraint. Future growth requires protocol changes.

Lower-staked validators (rank > 2000) excluded from voting set. They can still operate (full ledger, RPC), just не participate consensus.

## Vote participation proof

Critical accountability mechanism: validators must demonstrate active voting.

### Mechanism

- Leader of slot N+8 must include **vote aggregate from slot N** як evidence
- Vote aggregate = compressed cert showing які validators voted at slot N
- Non-participants visible via voter_bitmap

### Implications

- Validators who don't vote → not credited у leader's aggregate → no rewards earned for that slot
- Persistent non-participation → epoch removal (зdelinquency)
- Slot N+8 lag exists because:
  - Allows time для vote aggregation
  - Allows для small finalization delays
  - 8 slots ≈ 3.2 sec — short enough that operators detect quickly

### Validator economics implication

Vote performance = revenue. Non-voting validator earns zero rewards, regardless of stake size. Highly motivating for uptime.

## Finality model

### Two-path certainty

Both paths execute concurrently. Whichever certificate emerges first wins:

```
Time → 0ms     50ms    100ms    150ms
       │       │       │        │
       │       │       Fast Final (if 80% notarize)
       │       │
       │       Round 1 aggregation
       │
       Block produced + propagating
```

If Fast-Finalization triggers → slot finalized at ~100ms. Round 2 voting moot.

If только 60% notarize у round 1 → Round 2 begins. Finalize votes accumulate. ~150ms total.

### Ancestor finalization

Block at slot N finalizes → ALL ancestor blocks automatically finalize.

Example:
```
... slot 100 [unfinalized] ← slot 101 [unfinalized] ← slot 102 [Fast-Final at 102]
```

When slot 102 finalizes, slots 100 + 101 automatically finalize (assuming они були valid notarized predecessors).

### Skipped slot decisions

Skipped slots також decided retroactively:

- Slot 105 finalized
- Slot 104 had skip certificate
- → Slot 104 officially "skipped" — never finalized
- Slot 103 (parent of 105) finalized as part ancestor chain

## Comparison Tower BFT vs Votor

| Aspect | Tower BFT | Votor |
|---|---|---|
| Vote format | Ed25519 signature | BLS12-381 aggregated |
| Vote storage | On-chain TX (every slot) | Off-chain message + certs on-chain |
| Per-vote bytes | 64 bytes signature | ~0 (aggregated) |
| Finality time | 12.8 sec | 100-150 ms |
| Voting rounds | Continuous lockout chain | 1 or 2 рounds per slot |
| Threshold | 2/3 stake | 60% or 80% |
| Lockout duration | 2^N slots (exponential) | None — math-only |
| Fork choice | Heaviest fork | Notarization mathematics |
| Vote credits | Per successful vote | Per certificate participation |
| Slashing condition | Vote violates lockout (not enforced) | Conflicting notarize+skip (planned enforcement) |

## Security model: 20+20

Tower BFT: 33% byzantine threshold. If > 33% malicious, safety compromised.

Votor: 20% byzantine **+** 20% crashed = 40% combined tolerance.

### How 20+20 works

Math basis: 60% notarize + 60% finalize thresholds overlap by ≥20%.

```
60% + 60% = 120% (exceeds 100% available stake)
Overlap = 120% - 100% = 20%
```

This overlap creates "honest majority" anchor:

- If two conflicting blocks both got 60% notarize → they share ≥20% honest validators
- Honest validators won't notarize conflicting blocks → impossible

Result: must compromise ≥20% stake to break safety. AND additional 20% crashed = pesimistic deployment scenario без halt.

### Trade-off vs Tower

Lower Byzantine threshold (20% vs 33%) — Alpenglow tolerates **fewer malicious** validators. But Alpenglow tolerates **more crashed** validators. Net: similar adversary tolerance, faster finality.

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Votor`](/glossary#v), [`Notarize vote`](/glossary#n), [`Skip vote`](/glossary#s), [`Finalize vote`](/glossary#f), [`Fast-Finalization`](/glossary#f), [`Slow-Finalization`](/glossary#s), [`Certificate (Alpenglow)`](/glossary#c), [`Voter bitmap`](/glossary#v), [`20+20 security model`](/glossary#2), [`Vote participation proof`](/glossary#v)

## External refs

- [SIMD-0326: Votor section](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0326-alpenglow.md)
- [Alpenglow whitepaper v1.1](https://www.anza.xyz/blog/alpenglow-a-new-consensus-for-solana)
- [Helius: Alpenglow consensus mechanics](https://www.helius.dev/blog/alpenglow)

---

**Попередньо:** [← 1. Context](/module-11/1-context) | **Наступне:** [3. Rotor →](/module-11/3-rotor-propagation)
