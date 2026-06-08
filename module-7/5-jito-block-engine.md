<script setup>
const quiz = {
  id: 'm7-5-jito-be',
  title: '🧠 Mini-check: Jito BE deep',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'Jito Block Engine geographic considerations?',
      options: [
        'Regional engines (Frankfurt, Tokyo, NY, Singapore, Salt Lake) reduce latency для local searchers',
        'Validator connects до closest regional BE для best bundle quality',
        'Single global BE handles все mainnet',
        'BE choice impacts MEV income — closer searchers = більше bundles'
      ],
      correct: [0, 1, 3],
      explanation: 'Regional BEs critical. Single global wouldn\'t scale. Module 7.5.'
    },
    {
      type: 'explain',
      q: 'Поясни Jito tip mechanism і чому it differs з priority fee.',
      ideal: 'Priority fee (Module 3.3): pay-per-CU bid for leader inclusion. Standard Solana mechanism — works для будь-якого validator. Used для landing TX у congested moments.\n\nJito tip: payment у bundle для Jito-Solana validator (specifically). Not a per-CU bid — direct lamport amount in special "tip account" included у bundle.\n\nDifferences:\n1. Recipient: priority fee → 50% leader/50% burn. Jito tip → 100% specific validator (50% operator, 50% stakers через split).\n2. Validator selection: priority fee works для будь-який validator. Jito tip тільки для Jito-Solana validators.\n3. Inclusion guarantee: high priority fee = better but not guaranteed inclusion. Jito tip + bundle через block engine = directly tells validator "include this bundle".\n4. Use case: priority fee — для standard TX urgency. Jito tip — для MEV bundle execution (atomic multi-TX operations).\n\nFor LumLabs running Jito-Solana mainnet: both income streams. Priority fees from regular TX traffic. Jito tips from MEV bundles. Combined ~10-30% боку інкомe.',
      explanation: 'Module 7.5.'
    }
  ]
}
</script>

# 5. Jito Block Engine deep dive

## TL;DR

**Jito Block Engine (BE)** — Jito's centralized service що receives bundles від searchers, simulates blocks, forwards best-paying bundles до Jito-Solana validators. Multiple **regional engines** (Frankfurt, NY, Tokyo, etc.) reduce latency для geographically distributed searchers.

## BE architecture

```
Searchers (algorithmic traders) globally
       ↓ submit bundles + tips
Regional Block Engines (Frankfurt, NY, Tokyo, etc.)
       ↓ simulate, pick best paying
       ↓ forward bundles до current leader's BE connection
Jito-Solana validator (current leader)
       ↓ include bundles у block
Standard Solana cluster (votes, finalizes)
```

## Regional engines

| Region | Latency benefit для |
|---|---|
| Frankfurt (EU) | European searchers |
| New York (US East) | Wall Street firms |
| Salt Lake City (US West) | West Coast firms |
| Tokyo | Asia-Pacific searchers |
| Singapore | SEA searchers |

Single global BE wouldn't scale — bundle latency requirements measured у milliseconds. Regional placement critical.

### Validator BE choice

Jito-Solana validator connects до regional BE based on geographic location:

```
Validator у Frankfurt → connects до Frankfurt BE
Validator у Tokyo → connects до Tokyo BE
```

Connecting до nearest BE = lowest latency = best bundle reception. Connecting до wrong BE adds significant latency penalty.

LumLabs mainnet (likely Equinix datacenter) — pick nearest BE.

### Income impact

Validator's BE choice affects MEV income:

- Closer до major financial centers → more searcher activity → more bundles → higher tips
- Frankfurt і NY beвіrоо top — major trading hubs
- Validator у remote region → less bundle volume → less MEV income

Це factor у location choice (не тільки latency для basic operations, але і MEV income).

## Bundle mechanics

**Bundle** = atomic group of TXs з tip payment.

```
Bundle {
    transactions: [tx1, tx2, tx3, ...],   // executed sequentially, all or nothing
    tip_payment: <amount у lamports>      // separate TX paying Jito tip account
}
```

Bundle properties:
- **Atomic**: all TXs success or all revert (як single TX, але больше throughput)
- **Sequential**: TXs у specific order (matter для arbitrage)
- **Tipped**: payment до Jito tip account ensures validator interest
- **Private** (until landed): searcher's intent hidden from competitors before inclusion

## Tip mechanism

Jito tip ≠ priority fee.

| | Priority fee | Jito tip |
|---|---|---|
| Mechanism | Per-CU bid у TX | Lamport amount у special "tip account" |
| Recipient | 50% leader / 50% burn | 100% validator (split з stakers later) |
| Works з | Any validator | Тільки Jito-Solana validators |
| Inclusion guarantee | Better priority, не guaranteed | Direct — BE forwards bundles |

Searchers calculate optimal tip based on MEV value:

```
expected_mev = $5000 arbitrage profit
tip = expected_mev × 90% = $4500 (highly competitive)
searcher_profit = $500
```

High-value MEV → high tips → validator income boost.

## Searcher revenue split

When bundle lands:

```
Bundle tip (10 SOL) example
  ↓
Validator receives
  ↓ ~50% to operator (commission на tips)
  ↓ ~50% to stakers (proportional to stake)
```

Stakers earn passive yield from MEV без active management.

## BE setup для Jito-Solana validator

Connecting Jito-Solana до BE:

```bash
# Jito-Solana validator config
agave-validator \
    --tip-payment-program-pubkey <JITO_TIP_PROGRAM> \
    --tip-distribution-program-pubkey <JITO_DISTRIBUTION_PROGRAM> \
    --merkle-root-upload-authority <MERKLE_AUTHORITY> \
    --commission-bps 800 \
    --block-engine-url https://frankfurt.mainnet.block-engine.jito.wtf \
    --shred-receiver-address <REGIONAL_SHRED_RECEIVER> \
    [standard flags]
```

Key:
- `--block-engine-url` — your regional BE
- `--commission-bps` — MEV commission (800 = 8%, basis points)
- Tip distribution programs handle splitting tips операторам vs стakers

## Jito monitoring

Track MEV income:

```bash
# Jito website explorer
# https://explorer.jito.wtf
```

Per-validator MEV stats: bundles received, tips earned, MEV percentile rank.

Stakewiz також shows MEV income per validator.

## Connect to your work

Якщо LumLabs running mainnet validator:

- **Jito-Solana client** (most likely)
- **Frankfurt BE** likely (if Equinix Europe location)
- **8-10% MEV commission** typical setting
- **Income from MEV**: 10-30% of total revenue typical

Configuration через standard agave systemd unit + Jito-specific flags.

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Block engine`](/glossary#b), [`Regional BE`](/glossary#r), [`Tip account`](/glossary#t), [`Tip distribution`](/glossary#t), [`Commission bps`](/glossary#c)

## External refs

- [Jito Network documentation](https://docs.jito.network/)
- [Jito Block Engine docs](https://docs.jito.wtf/lowlatencytxnsend/)

---

**Попередньо:** [← 4. SFDP & pools](/module-7/4-sfdp-pools) | **Наступне:** [6. Stake split/merge →](/module-7/6-stake-split-merge)
