<script setup>
const quiz = {
  id: 'm4-2-tower-bft',
  title: '🧠 Mini-check: Tower BFT',
  intro: '3 питання — current mainnet consensus.',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього вірно про Tower BFT? (обери всі)',
      options: [
        'Це variant PBFT (Practical Byzantine Fault Tolerance) optimized з PoH',
        'Validators vote on slots, votes lockout exponentially (більший слот → довший lockout)',
        'Requires > 2/3 stake voting для finality',
        'Тільки leader може голосувати'
      ],
      correct: [0, 1, 2],
      explanation: 'Tower BFT = PBFT + PoH optimization, exponential lockouts, 2/3 stake для finality. Всі validators (не тільки leader) голосують. Module 4.2.'
    },
    {
      type: 'explain',
      q: 'Поясни своїми словами що таке "lockout" у Tower BFT і чому це важливо.',
      ideal: 'Lockout — це commitment validator дає коли голосує за slot: "Я обіцяю не голосувати за конфліктуючий fork протягом N slots".\n\nКлючова механіка — lockouts exponential. Кожен наступний vote doubles lockout попередніх:\n- Vote 1 (most recent): 2 slots lockout\n- Vote 2: 4 slots lockout\n- Vote 3: 8 slots lockout\n- ... до vote 32: 2^32 slots (effectively forever)\n\nЧому matter:\n\n1. Finality: коли vote stack має 32 votes, oldest reaches max lockout — slot вважається finalized (impossible to revert without violating lockouts які би slash validator).\n\n2. Fork choice: якщо два forks existed, validators choose heaviest fork by stake. Validator не може switch до alternative fork while locked — змусило б violate lockout commitments.\n\n3. Safety: malicious validators які vote conflicting forks (double-voting) lose stake (slashing). Lockouts make this expensive — більше votes = bigger penalty.\n\nThis enables Solana fast finality (~12-30 sec) без traditional BFT slowness.',
      explanation: 'Lockout = exponential commitment, enables finality + slash protection. Module 4.2.'
    },
    {
      type: 'mcq',
      q: 'Якщо malicious validator голосує за два конфліктних forks одночасно (double-vote) — що відбувається?',
      options: [
        'Cluster ignores один з vote arbitrarily',
        'Validator gets slashed (loses stake)',
        'Validator marked delinquent для одного epoch',
        'Both votes accepted, cluster splits'
      ],
      correct: [1],
      explanation: 'Double-vote — slashable offense. Validator stake slashed (зменшується). Це і робить Tower BFT secure — economic disincentive для misbehavior. Module 4.2.'
    }
  ]
}
</script>

# 2. Tower BFT — Solana mainnet consensus

## TL;DR

**Tower BFT** — Solana's current mainnet consensus algorithm. Variant of PBFT (Practical Byzantine Fault Tolerance) optimized with PoH timing. Validators vote on slots; votes carry **exponentially increasing lockouts** that prevent voting for conflicting forks. Finality reached at 32+ vote stack depth.

Key properties:
- **2/3 stake threshold** для finality
- **Exponential lockouts** — older votes commit harder
- **Slashing** для double-voting (malicious behavior)
- **Fast** (~12-30 sec finality на mainnet)

## Концепти

### PBFT background

**PBFT** (Practical Byzantine Fault Tolerance) — classical consensus algorithm з 1999, tolerates up to 1/3 malicious nodes. Standard approach: validators exchange messages у rounds (Pre-Prepare → Prepare → Commit) щоб agree on value.

Cost: O(N²) messages, slow.

Tower BFT modifies PBFT з PoH timing — instead of multiple rounds, validators vote on PoH timeline positions. PoH provides ordering, no need для extra rounds.

### Tower BFT voting

Each validator maintains **tower** of recent votes (max 32 deep, stack):

```
Tower (most recent on top):
  Vote 32: slot X       (lockout: 2 slots)
  Vote 31: slot X-1     (lockout: 4 slots)
  Vote 30: slot X-2     (lockout: 8 slots)
  ...
  Vote 1: slot X-31     (lockout: 2^32 slots ≈ forever)
```

When validator votes for new slot:

1. Push new vote to top of tower
2. Each existing vote's lockout **doubles**
3. If tower exceeds 32 votes — bottom vote pops as **rooted** (finalized for this validator)

### Lockout mechanic

**Lockout** = commitment: "Я не буду голосувати за fork that conflicts with this slot, протягом N slots".

Lockouts exponential:

- Vote with depth 1: lockout 2 slots
- Vote with depth 2: lockout 4 slots  
- Vote with depth 3: lockout 8 slots
- ...
- Vote with depth N: lockout 2^N slots

Older votes (deeper у tower) → довший lockout → harder to revert.

Lockout depths у secondes (mainnet):

| Depth | Lockout slots | Time |
|---|---|---|
| 1 | 2 | 0.8 sec |
| 2 | 4 | 1.6 sec |
| 3 | 8 | 3.2 sec |
| 5 | 32 | 12.8 sec |
| 10 | 1024 | 6.8 min |
| 32 | 2^32 ≈ 4 billion | "forever" |

### Finality через lockout depth

Slot becomes **finalized** for validator when it reaches lockout depth 32 у tower — practically irreversible bo lockout 2^32 slots.

Cluster finality: коли ≥2/3 stake has slot at depth 32 у their towers → slot **globally finalized**.

This is **deterministic finality** — no probability calculation. Якщо majority can't revert (locked), slot can't be reverted.

### Vote credits

Кожен successful vote earns **1 credit** for validator (classical accounting).

Credits accumulate per epoch. End of epoch: credits convert to lamport rewards proportional to:

```
rewards = (validator_credits / total_credits) × inflation_pool × (1 - commission)
```

(stake delegators get residual after commission).

Credits = primary metric "did validator work". Higher credits = більше rewards.

⚠️ **Alpenglow змінює це** — Module 4.4 розкаже про SIMD-0326 і new "credits" semantics.

### Double-voting and slashing

If validator votes for **two conflicting blocks** at same slot (e.g., A and B на slot 100):

- Tower BFT detects via vote tracking
- Slashing condition triggered
- Validator's stake gets **slashed** (reduced)
- Slashed amount goes to protocol (burned or redistributed)

Cost of double-vote: significant stake loss. Не рентабельно для validator.

⚠️ **Note**: As of 2026, Solana **doesn't actively slash** для double-vote. Mechanism exists у protocol але not enforced through automatic slashing system. Validators caught manually могут be socially punished (removed from SFDP, stake pools).

### Vote latency

Validator should vote ASAP після seeing block. Late votes mean missed credits = missed rewards.

Vote latency depends on:

- Network speed до cluster
- Validator's processing speed
- Bank/replay time (verify block locally before voting)

Healthy validator vote latency: 1-5 slots (~0.4-2 sec).

### Mainnet Tower BFT operation

Every slot:

1. Leader produces block (Module 1.4)
2. Block broadcasts via turbine (~400ms target до most cluster)
3. Validators receive shreds, reconstruct block
4. Validators replay TXs у block (verify execution matches)
5. Validators vote (submit vote TX до next leader)
6. Vote TX included у next block (or block + 1, + 2)
7. Other validators count votes, update their towers
8. When 2/3 stake voted — slot Confirmed
9. After depth-32 reach — Finalized

Mainnet:

- Confirmed: ~2-3 sec after block produced
- Finalized: ~12-30 sec after block produced

## Slashing landscape (current state)

Solana's slashing mechanisms (як 2026):

- **Double-vote**: tracked у protocol, slashing condition defined, **not enforced automatically**
- **Down validator**: no slashing, just no rewards (validator marked delinquent)
- **Wrong fork choice**: lockout violation → tower BFT theoretically detects, but enforcement TBD

Current state: trust model relies mostly на economic incentives (validators want rewards), social punishment (delegators withdraw stake from bad actors), not technical slashing.

This може change з Alpenglow (Module 4.4) — більш строгий slashing landscape proposed.

## Connect to your work

### Twoje credits indicator

```bash
solana vote-account YOUR_VOTE | grep -A 5 "Epoch Voting"
```

Credits per epoch — health metric. Якщо drops від previous epoch → validator має voting issues.

### Tower на твоєму validator

Внутрішньо твій validator maintains tower у memory. Persisted у ledger periodically. Якщо ти wipe ledger — tower lost (start fresh, build up again).

З §3 cheatsheet про cluster restart: після ledger wipe ти fresh tower. Validator потребує time щоб accumulate vote depths back до 32 (для own finality).

### Vote authority key

Vote TXs signed з **vote authority** key, не identity key (different keys). Vote authority sits на validator's local disk, used by agave-validator для signing votes. Identity key — different purpose.

З §13 cheatsheet — vote-authorize-voter-checked commands для rotation цього key.

## Hands-on exercise

```bash
# Твій vote account state
sudo /home/solana/ag/bin/solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899

# Credits per epoch
sudo /home/solana/ag/bin/solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899 | grep -A 10 "Epoch Voting"

# Last vote slot
sudo /home/solana/ag/bin/solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899 | grep "Last Vote"

# Cluster's stake distribution
sudo /home/solana/ag/bin/solana validators --url http://localhost:8899 | head -15
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Tower BFT`](/glossary#t), [`PBFT`](/glossary#p), [`Lockout`](/glossary#l), [`Tower`](/glossary#t), [`Rooted slot`](/glossary#r), [`Slashing`](/glossary#s), [`Double-vote`](/glossary#d), [`Vote authority`](/glossary#v)

## External refs

- [Anza: Tower BFT](https://docs.anza.xyz/implemented-proposals/tower-bft)
- [Solana Whitepaper](https://solana.com/solana-whitepaper.pdf)
- [Helius: Tower BFT Explained](https://www.helius.dev/blog/solana-consensus-protocols)

---

**Попередньо:** [← 1. PoH](/module-4/1-poh) | **Наступне:** [3. Votes, credits, finality →](/module-4/3-votes-credits)
