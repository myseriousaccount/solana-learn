<script setup>
const quiz = {
  id: 'm3-4-lifecycle',
  title: '🧠 Mini-check: TX lifecycle',
  intro: '3 питання — end-to-end TX flow.',
  questions: [
    {
      type: 'order',
      q: 'Постав steps TX lifecycle у правильному порядку (client → finality):',
      items: [
        'Client SDK signs TX з private key',
        'TX broadcast через RPC → forwarded до current leader через TPU',
        'Block з TX broadcast через turbine до cluster',
        'Cluster votes за block, ≥2/3 stake → Confirmed',
        'Leader processes TX, includes у in-progress block',
        '31+ vote credits → Finalized (irreversible)'
      ],
      correctOrder: [0, 1, 4, 2, 3, 5],
      explanation: 'Sign → submit to RPC → leader processes + includes → broadcast block → cluster votes (Confirmed) → 31+ credits (Finalized). Module 3.4.'
    },
    {
      type: 'mcq',
      q: 'Що з цього найвірогідніше може спричинити "TX not found" status (TX submitted але не з\'явилась on chain)?',
      options: [
        'TX blockhash expired (більше ніж 150 slots старий, ~60 сек)',
        'Priority fee занадто low — leader skipped у favor вищих bids',
        'Network packet loss — TX не дійшла до leader',
        'TX size exceeded 1232 bytes — rejected by RPC'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'Усі 4 — real reasons чому TX може зникнути. Найчастіше: expired blockhash або low priority у congestion. Module 3.4.'
    },
    {
      type: 'compare',
      q: 'У чому різниця між Confirmed і Finalized status TX?',
      ideal: 'Confirmed: TX included у block який got ≥2/3 stake voting за нього. Це probabilistic finality — extremely unlikely бути reverted, але теоретично possible якщо cluster reorgs (rare).\n\nFinalized: TX у block який got ≥31 vote credits (full lockout fіналізація). Це cryptographic finality — guaranteed never reverted без consensus breach (would require >2/3 stake to act malicious).\n\nЧасові аспекти на mainnet:\n- Confirmed: typically ~1-3 секунди після submission\n- Finalized: typically ~12-30 секунд (~30 slots × 400ms)\n\nКоли яке matter:\n- Confirmed достатньо для UX (\"transaction successful!\") у більшості apps\n- Finalized потрібен для high-value operations: cross-chain bridges, exchange deposits, real money — recover impossible якщо reverted\n\nWallet/exchange policies: Phantom shows Confirmed checkmark, exchanges often чекають Finalized перш ніж credit deposit.',
      explanation: 'Confirmed = probabilistic, Finalized = guaranteed. Use case differs. Module 3.4.'
    }
  ]
}
</script>

# 4. TX lifecycle: client → RPC → leader → finality

## TL;DR

Solana TX lifecycle: **client signs** → **RPC forwards до leader** через TPU → **leader processes** + includes у block → **block broadcasts** через turbine → **cluster votes** → ≥2/3 stake = **Confirmed** → 31+ credits = **Finalized**.

Typical timing на mainnet: Confirmed ~1-3 сек, Finalized ~12-30 сек.

Розуміти lifecycle важливо для debugging — коли TX "пропала", you can тrace де саме процес broke.

## Концепти

### Step 1: Client signs TX

Користувач у Phantom/CLI хоче submit TX:

```
1. SDK (web3.js, anchor) збирає TX structure:
   - Account list (хто буде touched)
   - Instructions (що робити)
   - Fee payer
   - Recent blockhash (pulled via RPC getLatestBlockhash)

2. User's private key signs message → signatures attached
```

Signed TX = bytes ready to broadcast.

### Step 2: Submit to RPC

```
3. SDK calls RPC method sendTransaction(serialized_tx) до Solana RPC endpoint
   (e.g., https://api.mainnet-beta.solana.com або private Helius/Triton endpoint)

4. RPC endpoint forwards TX до **current leader** через TPU
```

**TPU (Transaction Processing Unit)** — leader's incoming port для receive TXs. RPC уже знає leader schedule, forwards directly.

### Step 3: Leader processes

```
5. Leader receives TX через TPU
6. Leader validates:
   - Signatures valid
   - Recent blockhash not expired
   - Fee payer has balance for fee
   - No duplicate processing
7. Leader executes instructions:
   - Programs run у BPF VM
   - Account state mutations applied
   - Compute units tracked
8. If success — TX included у current block
   If fail — TX still included але marked failed (user still pays fee)
```

### Step 4: Block broadcast

```
9. Leader closes bank (block finalized у memory)
10. Block split у shreds (~64 fragments)
11. Shreds broadcast через turbine multicast
12. Cluster validators receive shreds, reconstruct block
13. Each validator replays TXs у block (verify leader didn't lie)
```

### Step 5: Cluster votes

```
14. Validators sign vote TX за block (commit to this block as canonical)
15. Vote TXs aggregate
16. When ≥2/3 stake voted → block становить Confirmed
17. After ~30 slots і чергові votes → Finalized
```

### Confirmation levels

| Level | When | Guarantees |
|---|---|---|
| **Processed** | TX received and executed by validator locally | Validator's local view only |
| **Confirmed** | ≥2/3 stake voted (~1-3 sec) | Probabilistic finality, very unlikely revert |
| **Finalized** | 31+ vote credits (~12-30 sec) | Cryptographic finality, no revert without consensus breach |

### TX states client може спостерігати

```bash
solana confirm <SIGNATURE>
```

Output options:

- `Processed` — TX visible на cluster (received)
- `Confirmed` — ≥2/3 voted
- `Finalized` — full finality
- `Not Found` — TX never landed (expired blockhash, low priority skipped, network loss)

Або:

- `Failed` — TX executed але failed (user still pays fee)

### TX failure modes

| Failure | Cause | Recovery |
|---|---|---|
| `Not Found` | Blockhash expired before include | Resubmit з fresh blockhash |
| `Not Found` | Priority fee too low, skipped | Resubmit з higher priority fee |
| `Failed: BlockhashNotFound` | Blockhash already expired при receive | Same as #1 |
| `Failed: InsufficientFundsForFee` | Fee payer out of SOL | Add SOL до fee payer |
| `Failed: InstructionError` | Program logic rejected (e.g., slippage too high) | App-specific fix |
| `Failed: ComputationBudgetExceeded` | TX too complex для default 200k CU | Add ComputeBudget instruction |

### Blockhash expiry

Recent blockhash valid for ~150 slots (~60 sec). Якщо leader не includes TX за цей window — blockhash expired, TX rejected next leaders.

Cause of expiry:
- Submission delay (slow client)
- RPC overload (TX queue full)
- Leader congestion (priority fee bid not high enough)
- Network issues

Always-fresh strategy: submit TX immediately після signing з freshest possible blockhash.

## Connect to your work

### Vote TX lifecycle (constant)

Кожен 400ms твій validator:

1. Builds vote TX за parent slot's block
2. Signs з vote authority
3. Sends через TPU до next leader (validator's own TPU since це vote)
4. Vote TX processed by current leader at next opportunity
5. Vote included у block
6. Block broadcasts
7. Other validators replay, update their tower

Якщо validator skip vote → не contribute до voting → eventually delinquent.

### Self-issued TX (delegate-stake, transfer)

Якщо ти оператор робиш `solana delegate-stake`:

1. CLI builds TX
2. Sends до RPC (specified by --url або config)
3. RPC forwards до leader
4. Leader processes (Stake Program executes)
5. CLI polls confirm status, returns success

Якщо congested → бачимо "Sending..." → eventually success або timeout.

### Debug "TX not found"

Якщо у CLI или dashboard TX showed initially but tracker shows "Not Found":

1. Перевір signature правильна (no typos)
2. Перевір timestamp — якщо > 60 sec ago і немає Processed — expired
3. Перевір RPC endpoint reachable
4. Resubmit з fresh blockhash + maybe priority fee

## Hands-on exercise

```bash
# Watch live TX submission flow на devnet
solana airdrop 1 --url devnet      # request faucet SOL
# Note signature output, then:
solana confirm <SIG> --url devnet  # initial Processed
sleep 3
solana confirm <SIG> --url devnet  # likely Confirmed
sleep 15
solana confirm <SIG> --url devnet  # likely Finalized

# Verbose info про confirmed TX
solana confirm -v <SIG> --url devnet
```

Mainnet (recent TX з explorer):

```bash
# Pick random recent TX signature з https://solscan.io
solana confirm -v <SIG> --url mainnet-beta
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`TPU`](/glossary#t), [`getLatestBlockhash`](/glossary#g), [`sendTransaction`](/glossary#s), [`Processed`](/glossary#p), [`Confirmed`](/glossary#c), [`Finalized`](/glossary#f), [`Blockhash expiry`](/glossary#b)

## External refs

- [Anza: TPU](https://docs.anza.xyz/validator/tpu)
- [Anza: Transaction lifecycle](https://docs.anza.xyz/consensus/general)
- [Helius: TX Lifecycle Deep Dive](https://www.helius.dev/blog/solana-transaction-lifecycle)

---

**Попередньо:** [← 3. Fees](/module-3/3-fees) | **Наступне:** [⭐ Final quiz →](/module-3/final-quiz)
