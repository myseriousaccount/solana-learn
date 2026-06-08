<script setup>
const quiz = {
  id: 'm3-2-instructions',
  title: '🧠 Mini-check: Instructions & CPI',
  intro: '3 питання — instructions і cross-program calls.',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього вірно про cross-program invocation (CPI)?',
      options: [
        'Один program може викликати інший program у тому ж TX',
        'CPI calls counted у TX compute budget',
        'Calling program може передавати accounts отриманні з TX до called program',
        'Cycle CPI (A → B → A) автоматично дозволений'
      ],
      correct: [0, 1, 2],
      explanation: 'CPI дозволяє composability — DEX викликає Token Program, lending викликає Oracle, etc. Cycles НЕ дозволені (max depth ~4). Module 3.2.'
    },
    {
      type: 'explain',
      q: 'Поясни своїми словами як працює Sealevel parallel execution. Чому Solana може це робити коли Ethereum не може?',
      ideal: 'Sealevel — Solana runtime для parallel TX execution. Як працює:\n\n1. Scheduler читає account lists від всіх pending TXs у block being built\n2. Для кожної pair TXs визначає conflict: \"чи туч обидві same writable account?\"\n3. Якщо conflict — TXs execute sequentially. Якщо disjoint — паралельно on different CPU cores.\n4. Validator з 32+ cores може execute 32+ TXs одночасно якщо non-conflicting.\n\nЧому Solana може, Ethereum не може:\n- Solana TX має EXPLICIT pre-declared account list. Scheduler знає upfront які accounts touched.\n- Ethereum smart contract може dynamically access будь-яку storage slot under contract address. Сcheduler can\'t predict accesses без executing the TX → can\'t safely parallelize.\n\nThis design choice (pre-declared accounts) — fundamental enabler Solana throughput. Tradeoff: developer must enumerate accounts upfront (mental overhead).',
      explanation: 'Pre-declared accounts → parallel scheduling. Ethereum dynamic access → sequential. Module 3.2.'
    },
    {
      type: 'compare',
      q: 'У чому різниця між instruction account marked writable vs read-only?',
      ideal: 'Writable: instruction може modify account (lamports або data). Scheduler treatить writable accounts як exclusive — тільки одна TX may write до конкретного account at a time.\n\nRead-only: instruction може ТІЛЬКИ read account. Multiple TXs можуть concurrently read same account (parallel-safe).\n\nЧому matters: TX explicitly tags кожен account як writable або read-only через TransactionMessage header. Це дає scheduler info для parallelism:\n- Якщо TX1 writes account X, TX2 reads X → sequential (TX2 must wait)\n- Якщо TX1 reads X, TX2 reads X → parallel OK (no conflict)\n- Якщо TX1 writes X, TX2 writes Y → parallel OK (different accounts)\n\nDeveloper має tagнути правильно. Якщо declare writable що actually read-only — TX лишається correct але loses parallelization opportunity. Якщо declare read-only що writes — runtime catches violation, TX fails.',
      explanation: 'Writable = exclusive lock, read-only = shared. Affects parallelism. Module 3.2.'
    }
  ]
}
</script>

# 2. Instructions & cross-program invocation

## TL;DR

**Instruction** — atomic unit of execution всередині TX. Specifies: which program виконати, який data передати, які accounts (з TX's account list) program може torcho.

Programs можуть **call other programs** через **CPI** (Cross-Program Invocation). Це enable composability — DEX aggregator може chain through кілька DEXes у одній TX.

## Концепти

### Instruction anatomy

```
Instruction {
    program_id: Pubkey,           // який program викликати
    accounts: Vec<AccountMeta>,   // які accounts передати (subset з TX account list)
    data: Vec<u8>,                // bytes argument (program-specific format)
}

AccountMeta {
    pubkey: Pubkey,
    is_signer: bool,
    is_writable: bool,
}
```

Один TX містить 1+ instructions. Виконуються **послідовно** в order. Atomic — все або нічого.

### Writable vs read-only accounts

Кожен account у instruction tagged: writable (можна modify) або read-only.

Чому matters: Sealevel scheduler паралелізує TXs по account access patterns.

| TX1 access | TX2 access | Same account? | Parallel OK? |
|---|---|---|---|
| Write X | Write X | Yes | No (lock) |
| Write X | Read X | Yes | No |
| Read X | Read X | Yes | Yes |
| Write X | Write Y | Different | Yes |

Solana може виконати десятки TXs паралельно якщо вони touch disjoint writable sets.

### Signer vs non-signer

Кожен account також tagged: signer (signature required) або non-signer.

Signer means: instruction вимагає authorization від owner цього account. Наприклад, SOL transfer requires sender signature.

Number signers per TX = `header.num_required_signatures`. Перший signer = fee payer.

### Instruction data format

`data: Vec<u8>` — arbitrary bytes. Format defined by program.

Native programs зазвичай мають simple encoding:

```
System Program transfer instruction:
  data = [0x02, ...transfer_amount_u64]
   ↑     ↑
   |     8 bytes little-endian amount
   discriminator (2 = transfer instruction)
```

BPF programs зазвичай використовують **borsh** або **bincode** serialization. Anchor framework додає 8-byte instruction discriminator + arguments.

Як developer — ти не пишеш raw bytes. SDK (web3.js, anchor) генерує data за тебе. Як operator — рідко treba бачити raw, але корисно знати що data це bytes which program decodes.

### Cross-Program Invocation (CPI)

**CPI** — коли one program (caller) calls another (callee) within same TX execution.

Приклад — Token Program transfer (внутрішньо):

```
User TX:
  Instruction: token_program.transfer(...)
    ↓ CPI
    Token Program executes:
      - Check ownership
      - Decrement source account amount
      - Increment destination account amount

User TX with CPI through aggregator:
  Instruction: jupiter_program.swap(USDC, JTO, amount)
    ↓ CPI
    Jupiter executes:
      ↓ CPI to Raydium
      Raydium executes: swap USDC → SOL
      ↓ CPI to Orca
      Orca executes: swap SOL → JTO
      ↓ CPI to Token Program
      Token Program transfers JTO to user
```

Кожна вкладена call counts towards TX's **compute budget**. Max depth ~4 levels (prevents infinite recursion).

### Composability through CPI

CPI робить Solana programs **composable** — нові апликації можуть build on existing programs:

- DEX aggregator (Jupiter) calls DEXes (Raydium, Orca) через CPI
- Lending protocols (Kamino) call Token Program для transfers, Oracle для prices
- NFT marketplaces (Magic Eden) call Metaplex Metadata Program для NFT data

Це similar concept to "function calls" у regular programming — але across **decentralized** programs (не контрольованих one entity).

### Accounts передача у CPI

Calling program передає subset своїх accounts to called program. Permissions inherited:

- Якщо у TX account marked writable → calling program може pass it як writable до callee
- Якщо у TX account signer → callee receives signer status

PDAs (Program Derived Addresses) — special case: program може "sign" за свого PDA через `invoke_signed` (since PDA has no private key, program itself is authority).

## Compute budget

TX має **compute budget** — max instructions allowed для execute. Default: 200,000 Compute Units (CU). Max: 1,400,000 CU.

Кожна operation costs CUs:

| Operation | Approx CU |
|---|---|
| Simple SOL transfer | ~150 CU |
| Token transfer | ~3000 CU |
| Token mint | ~5000 CU |
| Complex DEX swap | ~80000-150000 CU |
| Heavy CPI chain (aggregator) | ~500000+ CU |

Якщо TX exceeds budget — fails з "Computation budget exceeded".

User може increase budget via ComputeBudget instruction:

```
Instruction 0: ComputeBudget.setComputeUnitLimit(1_000_000)
Instruction 1: <main instruction>
```

Module 3.3 deeper на fees та compute pricing.

## Sealevel — parallel execution

Solana runtime **Sealevel** schedules TXs across CPU cores:

1. **Read account lists** від всіх pending TXs у block being built
2. **Build dependency graph**: TX1 → TX2 conflict якщо they share writable account
3. **Parallel execute** independent TXs across cores
4. **Sequential** group conflicting TXs у chains

Result: validator з 32 cores може process 32+ TXs simultaneously якщо non-conflicting. Це і root reason Solana ~3000+ TPS — паралелізм.

Ethereum (для contrast): EVM serial execution — одна TX at a time. Sharding propose parallel — but each shard internally still serial.

## Connect to your work

### Validator submits vote TXs

Кожен 400ms slot твій validator builds and signs vote TX, broadcasts через TPU. Це single-instruction TX:

```
Vote TX:
  Instruction: vote_program.vote(slot, hash, lockouts, ...)
```

Vote program не використовує CPI — simple direct call.

### Stake activation TX

```bash
solana delegate-stake stake.json VOTE_PUBKEY
```

Builds TX з instructions:

```
Instruction 0: Compute budget (optional)
Instruction 1: Stake Program.delegate(stake, vote, ...)
```

Stake program внутрішньо може CPI до Clock sysvar для timing data — read-only.

### Multi-instruction operations

`solana create-vote-account` builds TX з кількома instructions:

```
Instruction 0: System Program.create_account(new vote account, lamports, owner=Vote Program)
Instruction 1: Vote Program.initialize(vote account, identity, voter authority, ...)
```

Atomic — обидві instructions виконуються або жодна.

## Hands-on exercise

```bash
# Подивись на recent SOL transfer TX (з explorer Solscan можеш взяти signature)
# Або budovan локально:
solana transfer --keypair YOUR_KEYPAIR <RECIPIENT> 0.001 --url devnet
# Після signature returned, перевір:
solana confirm -v <SIG> --url devnet

# Output показує:
# - Instructions: 1 (system program transfer)
# - Accounts: from, to, system program
# - Compute units used (~150 для transfer)
# - Fee paid (5000 lamports = 0.000005 SOL базова)
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`CPI`](/glossary#c), [`Cross-program invocation`](/glossary#c), [`Sealevel`](/glossary#s), [`Compute Unit`](/glossary#c), [`Compute budget`](/glossary#c), [`AccountMeta`](/glossary#a), [`Discriminator`](/glossary#d), [`Borsh`](/glossary#b)

## External refs

- [Anza: Instructions](https://docs.anza.xyz/runtime/programs)
- [Anchor: CPI Examples](https://www.anchor-lang.com/docs/cross-program-invocations)
- [Helius: Solana Compute Units](https://www.helius.dev/blog/solana-compute-units)

---

**Попередньо:** [← 1. TX anatomy](/module-3/1-tx-anatomy) | **Наступне:** [3. Fees, priority fees, compute →](/module-3/3-fees)
