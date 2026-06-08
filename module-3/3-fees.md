<script setup>
const quiz = {
  id: 'm3-3-fees',
  title: '🧠 Mini-check: Fees',
  intro: '3 питання — fee structure.',
  questions: [
    {
      type: 'mcq',
      q: 'TX cost на Solana складається з чого? (обери всі)',
      options: [
        'Base fee: 5000 lamports per signature',
        'Priority fee: optional, payable per CU (compute unit)',
        'Gas refund unused budget назад до user',
        'Rent for new accounts created у TX (якщо є)'
      ],
      correct: [0, 1, 3],
      explanation: '#1: base 5000 lamports/signature (50% burned, 50% to validator). #2: priority fee — optional pay-extra щоб leader prioritized include. #3 НЕПРАВИЛЬНО — Solana не refunds. #4: правильно, rent додається до fee якщо TX creates account.'
    },
    {
      type: 'scenario',
      q: 'Mainnet congested. Твоя TX (SOL transfer) висить 2 хвилини, не landed. Що зробити щоб мати кращий шанс на landing?',
      ideal: 'Додати priority fee. Базовий fee (5000 lamports) однаковий для всіх TXs — у congestion leader sorts by priority fee per CU. TX без priority fee сидять у "free tier", leader робить їх останніми.\n\nКонкретно:\n\n1. Estimate current priority fee floor через RPC method getRecentPrioritizationFees або через services як Triton/Helius.\n\n2. Add Compute Budget instructions у TX:\n   - setComputeUnitLimit(N) — оцінити realistic budget (для transfer ~5000 CU)\n   - setComputeUnitPrice(price_per_CU_in_microlamports) — priority bid\n\n3. Sign і submit TX з fresh blockhash (старий expired).\n\n4. Якщо ще не landing — increase price, спробуй знов.\n\nКорисні дашборди для current pricing: helius.dev priority fee tracker, Solscan fee analytics. У congested moments priority fee може стрибнути до 100k-1M lamports per CU.\n\nЯкщо TX truly stuck — пересертифікуй з вищим bid замість wait.',
      explanation: 'Priority fee — основний lever у congestion. Module 3.3.'
    },
    {
      type: 'command',
      q: 'Як подивитись recent priority fees на mainnet через RPC? Напиши solana CLI команду або curl.',
      accepts: [
        'curl -X POST https://api.mainnet-beta.solana.com -H "Content-Type: application/json" -d \'{"jsonrpc":"2.0","id":1,"method":"getRecentPrioritizationFees"}\'',
        'solana fees',
        'solana fees --url mainnet-beta'
      ],
      ideal: 'curl -X POST https://api.mainnet-beta.solana.com -H "Content-Type: application/json" -d \'{"jsonrpc":"2.0","id":1,"method":"getRecentPrioritizationFees"}\'',
      explanation: 'getRecentPrioritizationFees — RPC method що повертає samples recent priority fees. solana fees deprecated на user CLI. Module 3.3.'
    }
  ]
}
</script>

# 3. Fees, priority fees, compute budget

## TL;DR

Solana TX cost: **base fee** (5000 lamports per signature) + optional **priority fee** (pay-per-CU для leader prioritization у congestion) + rent (якщо TX creates new account).

Base fee на mainnet ~$0.0005 — практично "free". Priority fee — реальна plata за **landing** TX швидко коли cluster congested.

## Концепти

### Fee structure (3 components)

```
Total TX cost = base_fee + priority_fee + rent_for_new_accounts

base_fee = num_signatures × 5000 lamports
priority_fee = compute_units_used × price_per_CU
rent = sum(rent_reserve для нових accounts created)
```

| Component | Скільки | Куди йде |
|---|---|---|
| Base fee | 5000 lamports × signers | 50% burned, 50% leader |
| Priority fee | CU used × bid (CU price) | 50% burned, 50% leader |
| Rent | Залежить від size | Locked у account (returned при close) |

### Base fee mechanics

Base fee — flat per signature. Простий transfer (1 signature) = 5000 lamports = ~$0.001.

50% burned (зменшує SOL supply), 50% leader (validator income).

Не залежить від:
- Compute units used (5000 чи 500000 — same base fee)
- Account changes
- Time of day

### Priority fee mechanics

**Priority fee** — opcional bid у мікроламortах per Compute Unit. Скажеш leader: "за кожен CU я плачу X micro-lamports extra".

```
priority_fee = compute_units_used × price_per_CU (in micro-lamports)
1 lamport = 1,000,000 micro-lamports
```

Приклад: TX uses 50,000 CUs, ти ставиш price = 1000 micro-lamports/CU:

```
priority_fee = 50,000 × 1000 = 50,000,000 micro-lamports = 50 lamports = ~$0.00001
```

У quiet periods priority fee = 0 OK (твоя TX still lands). У congested periods (NFT mint, market volatility, popular DEX activity) — без priority fee TX сидить.

### Leader prioritization

Коли leader приймає TXs з TPU buffer і budget'ит який include у block, sort by:

1. **Priority fee per CU** (вищий → перший)
2. **Receive time** (старіший → перший) як tiebreaker

Якщо leader's block CU budget hit limit (max ~48M CU per block) — TXs з low priority fees залишаються у mempool, потенційно експайряться.

### Compute Units

Кожна operation у TX consumes Compute Units (CU):

| Operation | Approx CU |
|---|---|
| SOL transfer | ~150 |
| Token transfer | ~3000 |
| Token mint | ~5000 |
| Stake delegate | ~30000 |
| Simple DEX swap | ~80000-150000 |
| Complex aggregator route | ~500000+ |

Default budget: 200,000 CU per TX. Якщо TX requires більше — додай ComputeBudget instruction щоб raise limit (max 1,400,000 CU).

```
Instruction 0: ComputeBudget.setComputeUnitLimit(800_000)
Instruction 1: ComputeBudget.setComputeUnitPrice(5_000)  // 5k microlamports per CU
Instruction 2: <main instruction>
```

### ComputeBudget program

Native program (`ComputeBudget111111111111111111111111111111`) з instructions:

- `setComputeUnitLimit(units)` — raise per-TX CU limit (max 1.4M)
- `setComputeUnitPrice(microlamports)` — priority fee bid
- `requestHeapFrame(bytes)` — request more heap для program execution
- `setLoadedAccountsDataSizeLimit(bytes)` — limit account data loaded

Більшість TXs тільки potrebują перші 2.

### Як вибрати priority fee

Strategy:

1. **Sample current market** через RPC `getRecentPrioritizationFees`:

```bash
curl -X POST https://api.mainnet-beta.solana.com \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"getRecentPrioritizationFees"}'
```

Returns samples за recent slots. Compute percentile (e.g., 75th) як reasonable bid.

2. **Use Helius / Triton priority fee APIs** — preprocessed estimates:

```
https://api.helius.xyz/v0/priority-fees?api-key=YOUR_KEY
```

3. **Iterate** if TX not landing — bump priority, retry з fresh blockhash.

Quiet periods на mainnet: priority fee 0-1000 micro-lamports/CU OK. Congestion: 50000-500000+ micro-lamports/CU.

## Fee burn — deflationary mechanism

50% of base + priority fees burned. Перманентно destroyed (lamports gone from supply).

Це **deflationary force** counteracting inflation rewards. Net SOL inflation:

```
Net = inflation_rewards - fees_burned
```

Currently mainnet inflation ~5%/year, fees ~0.5% — net inflation ~4.5%/year, decreasing.

Якщо Solana adoption росте і fees increase — eventually fees_burned > inflation → **deflationary SOL** (supply decreases).

## Connect to your work

### Vote TXs пейс fees

Validator vote TXs cost base fee (~5000 lamports/vote). Це automatically deducted from validator identity wallet. У середньому ~1.1 SOL/day за voting (~432000 votes × 5000 = 2.16 SOL/day at max rate).

Це чому validator identity має мати reasonable balance (1-2 SOL рекомендовано). Якщо identity balance hits 0 — validator stops voting → goes delinquent.

З §15 cheatsheet VAT mechanic — Alpenglow specific mechanism для validator fee funding.

### Stake/vote operations TX fees

Однократні TX fees:
- create-vote-account: ~5000 lamports base + rent reserve (~0.027 SOL)
- delegate-stake: ~5000 lamports base
- withdraw: ~5000 lamports base

Negligible порівняно з amount you're stakingом.

## RPC fee endpoints

```bash
# Recent prioritization fees (samples)
curl -X POST https://api.mainnet-beta.solana.com \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"getRecentPrioritizationFees"}'

# Total supply (track burn over time)
curl -X POST https://api.mainnet-beta.solana.com \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"getSupply"}'
```

## Hands-on exercise

```bash
# Recent priority fees на mainnet (JSON output)
curl -s -X POST https://api.mainnet-beta.solana.com \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"getRecentPrioritizationFees"}' \
    | jq '.result | length'

# Average fee (з samples)
curl -s -X POST https://api.mainnet-beta.solana.com \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"getRecentPrioritizationFees"}' \
    | jq '.result | map(.prioritizationFee) | add / length'

# Inflation rate
curl -s -X POST https://api.mainnet-beta.solana.com \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"getInflationRate"}' | jq

# Supply
curl -s -X POST https://api.mainnet-beta.solana.com \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"getSupply"}' | jq '.result.value | {total, circulating}'
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Base fee`](/glossary#b), [`Priority fee`](/glossary#p), [`Compute Unit`](/glossary#c), [`Compute Budget Program`](/glossary#c), [`Fee burn`](/glossary#f), [`Micro-lamport`](/glossary#m)

## External refs

- [Anza: Transaction Fees](https://docs.anza.xyz/implemented-proposals/transaction-fees)
- [Helius: Priority Fees Guide](https://www.helius.dev/blog/priority-fees-understanding-solanas-transaction-fee-mechanics)
- [Solana Docs: Compute Budget](https://solana.com/docs/intro/compute-budget)

---

**Попередньо:** [← 2. Instructions](/module-3/2-instructions) | **Наступне:** [4. TX lifecycle →](/module-3/4-lifecycle)
