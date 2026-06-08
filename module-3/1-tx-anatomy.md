<script setup>
const quiz = {
  id: 'm3-1-tx-anatomy',
  title: '🧠 Mini-check: Transaction anatomy',
  intro: '3 питання — TX structure.',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього є частинами Solana transaction? (обери всі)',
      options: [
        'Список signatures (signed by accounts that authorize)',
        'Список accounts (всі accounts які TX буде читати/писати)',
        'Recent blockhash (для expiry tracking)',
        'Список instructions (що робити)',
        'Gas limit і gas price'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'Tx має: signatures, account list, recent blockhash, instructions. Gas limit/price = Ethereum terminology — Solana використовує compute budget + priority fees, але структура іnша. Module 3.1.'
    },
    {
      type: 'explain',
      q: 'Чому Solana TX вимагає список ВСІХ accounts які буде touched, заздалегідь?',
      ideal: 'Це enabler для Sealevel parallelism. Runtime scheduler читає account lists з усіх pending TX і визначає які TX можуть виконуватись паралельно (touch different accounts) vs sequentially (touch same accounts → потенційний conflict).\n\nБез pre-declared lists scheduler не може зробити цей analysis — мусив би виконувати TXs sequentially або race-detect on-the-fly (повільно). Solana вибрала pre-declaration: developer/SDK сам формує список, runtime просто планує.\n\nTradeoffs:\n+ Massive parallelism — десятки TXs паралельно\n- TX size зростає (кожен account =32 bytes у TX)\n- Developer mental overhead — must know all accounts upfront\n\nЦе fundamental з \'rules of the game\' для Solana smart contracts.',
      explanation: 'Pre-declared accounts = parallelism enabler. Module 3.1.'
    },
    {
      type: 'command',
      q: 'Як подивитись detailed info про конкретну TX за її signature? Напиши команду.',
      accepts: [
        'solana confirm -v <SIGNATURE>',
        'solana confirm -v <SIGNATURE> --url mainnet-beta',
        'solana confirm <SIGNATURE>'
      ],
      ideal: 'solana confirm -v <SIGNATURE>',
      explanation: 'solana confirm <SIG> — статус (confirmed/finalized/failed). -v = verbose: instructions, accounts, logs, compute units used. Module 3.1.'
    }
  ]
}
</script>

# 1. Transaction anatomy

## TL;DR

Solana **transaction (TX)** має 4 ключові частини: **signatures** (хто authorize), **account list** (всі accounts які TX touches), **recent blockhash** (для expiry), **instructions** (що робити). Max TX size: 1232 bytes (single UDP packet).

Pre-declared account list — це fundamental Solana design що enable parallelism (Sealevel scheduler). Solana TX **не може dynamically discover** accounts — все має бути у list upfront.

## Концепти

### TX structure

```
Transaction {
    signatures: Vec<Signature>,    // 1+ signatures (64 bytes each)
    message: TransactionMessage {
        header: {
            num_required_signatures: u8,
            num_readonly_signed_accounts: u8,
            num_readonly_unsigned_accounts: u8,
        },
        account_keys: Vec<Pubkey>,  // всі accounts (32 bytes each)
        recent_blockhash: Hash,     // 32 bytes
        instructions: Vec<Instruction>,
    }
}
```

Total size: signatures + message. Max **1232 bytes** (один UDP packet через QUIC). Тому TX inherently size-limited — не можна туди влізти 1000 token transfers.

### Signatures

Кожна signature — 64 bytes (Ed25519). Підписує `message` (everything крім самих signatures).

Один TX може мати **кілька signatures** якщо різні accounts потребують authorization. Приклад: multisig transfer — 2-of-3 signers must sign.

Authority model:

- **Fee payer** = перший signer. Платить fees. Обов'язково signs.
- **Other signers** = accounts які instructions потребують to authorize (e.g., owner of token account для transfer)

### Account list (account_keys)

Список **всіх** accounts які TX touches. Кожен labeled:

- **Writable / Read-only**: чи instruction буде modify account
- **Signer / Non-signer**: чи треба signature

Чому pre-declared? Solana scheduler (Sealevel) читає account lists від багатьох pending TXs і паралелізує: TXs що touch disjoint accounts виконуються одночасно, на різних cores.

Ethereum для contrast: contract may dynamically access будь-який storage slot — нема way to predict, тому одна TX блокує всі.

### Recent blockhash

Hash recent block (зазвичай within last ~150 slots = 60 секунд). TX expires якщо blockhash older than ~150 slots — leader відмовляється process expired TX.

Чому: TX uniqueness + DoS protection. Якщо TX була submitted, не included, чекає у mempool — eventually expires (не може infinite linger). Якщо submitter wants retry — re-sign з fresh blockhash.

Якщо ти sent TX і ніхто не included її за ~60 sec — TX dead. Try again.

### Instructions

Список **instructions** які виконуються **послідовно** (atomic — все або нічого):

```
Instruction {
    program_id: Pubkey,      // який program викликати
    accounts: Vec<AccountMeta>, // які з TX's account list передати у program
    data: Vec<u8>,           // bytes аргумент для program (custom format per program)
}
```

Один TX може містити кілька instructions (atomic batch). Приклад:

```
TX:
  Instruction 1: System Program → create_account(new token account)
  Instruction 2: Token Program → initialize_account(new token account, mint, owner)
  Instruction 3: Token Program → transfer(from, to, amount)
```

Усі 3 ор виконуються або жоден — atomic. Якщо instruction 3 fails (no balance) — instructions 1 і 2 revertяться (як ніби нічого не сталось).

### Atomicity

TX = atomic unit. Або все success, або все revert. Це fundamental — backbone DeFi composability.

Приклад: swap через DEX aggregator (Jupiter):

```
TX:
  Inst 1: Transfer USDC → Raydium pool
  Inst 2: Raydium swap USDC → SOL
  Inst 3: Transfer SOL → Orca pool
  Inst 4: Orca swap SOL → JTO
  Inst 5: Transfer JTO → user wallet
```

Якщо Orca swap fails (slippage) — все revert, USDC залишається у user wallet. Без atomicity користувач could lose USDC у середині multi-step trade.

## TX example: SOL transfer

Простий приклад:

```
Transaction {
    signatures: [
        sig_from_wallet_alice    // 64 bytes
    ],
    message: {
        header: {
            num_required_signatures: 1,
            num_readonly_signed_accounts: 0,
            num_readonly_unsigned_accounts: 1,  // System Program
        },
        account_keys: [
            alice_wallet,      // index 0, writable signer
            bob_wallet,        // index 1, writable non-signer
            system_program,    // index 2, readonly non-signer
        ],
        recent_blockhash: 0xab...,
        instructions: [
            {
                program_id: system_program,  // index 2 у account_keys
                accounts: [0, 1],            // alice (src), bob (dst)
                data: 0x02 0x... (transfer 1 SOL),
            }
        ]
    }
}
```

Тут:

- 1 signer: Alice (fee payer + transfer authority)
- 3 accounts total: Alice, Bob, System Program
- 1 instruction: System Program transfer

## Transaction size constraints

Max 1232 bytes. Це обмежує:

- Кількість signers (~10 max)
- Кількість accounts (~30 типово)
- Кількість instructions (~5-10 типово)
- Розмір instruction data (~50-200 bytes per instruction)

Якщо твоя operation не вліплиться — split на multiple TXs (втрачаєш atomicity) або use **Address Lookup Tables** (compress account references — Module 10).

## Connect to your work

### Vote TX

Кожен slot твій validator submit'ить vote TX:

```
Vote TX:
  Signatures: [vote_authority_signature]
  Accounts: [vote_account, validator_identity, ...]
  Instruction: vote_program.vote(slot, hash)
```

Це невелика TX яка constantly emit'иться validator (на mainnet — кожні 400ms).

### Stake delegation TX

З §14 cheatsheet — delegation:

```bash
solana delegate-stake stake-keypair.json VOTE_PUBKEY
```

Будує TX з:
- 1 signature (stake authority)
- ~5 accounts (stake account, vote, stake program, clock sysvar, stake config)
- 1 instruction: Stake Program delegate

## solana confirm command

Перевірити TX за signature:

```bash
solana confirm <SIGNATURE>
```

Виведе:

```
Confirmed
```

Або:

```
Finalized
```

Або:

```
Not Found    # TX never landed, expired, або wrong signature
```

Verbose:

```bash
solana confirm -v <SIGNATURE>
```

Показує: instructions, accounts, logs (program output), compute units used, fee.

## Hands-on exercise

```bash
# Будь-яка recent mainnet TX (random)
# Знайти TX signature (наприклад з explorer https://solscan.io)
solana confirm -v <PASTE_SIG_HERE> --url mainnet-beta
```

На WNX0016778:

```bash
# Recent vote TXs твого validator
sudo /home/solana/ag/bin/solana confirm -v $(sudo /home/solana/ag/bin/solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899 | grep "Last Vote" | head -1) --url http://localhost:8899
# (це не зовсім простий приклад — vote TX signatures rotate quickly)

# Recent slot's transactions
SLOT=$(sudo /home/solana/ag/bin/solana slot --url http://localhost:8899)
sudo /home/solana/ag/bin/solana block $((SLOT - 5)) --url http://localhost:8899 | head -50
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Transaction`](/glossary#t), [`Signature`](/glossary#s), [`Instruction`](/glossary#i), [`Recent blockhash`](/glossary#r), [`Fee payer`](/glossary#f), [`Signer`](/glossary#s), [`Atomicity`](/glossary#a)

## External refs

- [Anza: Transactions](https://docs.anza.xyz/runtime/programs)
- [Solana Cookbook: Transactions](https://solana.com/docs/core/transactions)
- [Helius: Solana Transactions Explained](https://www.helius.dev/blog/solana-transactions)

---

**Наступне:** [2. Instructions & CPI →](/module-3/2-instructions)
