<script setup>
const quiz = {
  id: 'm2-1-account-basics',
  title: '🧠 Mini-check: Account basics',
  intro: '3 питання — account anatomy.',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього є полями account на Solana? (обери всі правильні)',
      options: [
        'lamports (balance у lamports = 0.000000001 SOL)',
        'owner (program який володіє account)',
        'data (byte array з custom state)',
        'username і email власника'
      ],
      correct: [0, 1, 2],
      explanation: 'Account має: lamports (balance), owner (program), data (bytes), executable (flag), rent_epoch (legacy). НЕМАЄ usernames/emails — Solana покажчики це pubkeys, не людино-читабельні. Module 2.1.'
    },
    {
      type: 'command',
      q: 'Як подивитись повну інформацію про account за pubkey (наприклад твоєї identity)? Напиши команду.',
      accepts: [
        'solana account DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt',
        'solana account DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt --url http://localhost:8899',
        'sudo /home/solana/ag/bin/solana account DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt --url http://localhost:8899'
      ],
      ideal: 'solana account DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt',
      explanation: 'solana account <PUBKEY> виводить: balance, owner program, executable flag, data length, rent epoch. Якщо account не існує — "AccountNotFound". Module 2.1.'
    },
    {
      type: 'explain',
      q: 'Поясни своїми словами що означає поле "owner" у account і чому це важливо.',
      ideal: 'Owner — це pubkey program який ВОЛОДІЄ accountом. Це НЕ власник у людському сенсі (як wallet owner), а program який має право модифікувати accountа data і lamports.\n\nПриклади:\n1. Твій SOL wallet — owner це System Program (11111...). System Program може transfer lamports, але не може писати у data (data порожній).\n2. Token account — owner це Token Program (Tokenkeg...). Token Program може mint/burn/transfer tokens у цьому account.\n3. Vote account — owner це Vote Program (Vote111...). Тільки Vote Program може записувати votes.\n\nЧому важливо: тільки owner program може модифікувати account state. Хочеш transfer токенів? Виклич Token Program (як owner) — він зробить write. Random program не може торкнутись чужого account.\n\nЦе fundamental security model Solana — кожен account "захищений" своїм owner program.',
      explanation: 'Ключове: owner = program з write access, не людський власник. Security primitive. Module 2.1.'
    }
  ]
}
</script>

# 1. Account basics (anatomy)

## TL;DR

На Solana **все** є **account** — це універсальна абстракція. Кожен account має 5 fields: **lamports** (balance), **owner** (program який володіє), **data** (custom bytes), **executable** (це програма?), **rent_epoch** (legacy). Pubkey (32-byte ed25519 public key) identify account.

Owner ≠ людський власник. Owner це **program** який has write access до account. Це fundamental security model — Solana гарантує що тільки owner program може модифікувати account.

## Концепти

### Що таке account

Account — структура у Solana state з 5 fields:

```
Account {
    lamports: u64,        // balance у lamports (1 SOL = 1,000,000,000 lamports)
    owner: Pubkey,        // program який володіє цим account
    data: Vec<u8>,        // arbitrary byte array (state)
    executable: bool,     // true для programs, false для data accounts
    rent_epoch: u64,      // legacy field (більше не діє після rent-exempt rules)
}
```

Identify account = **Pubkey** (32 bytes, base58-encoded для people-readable). Приклади:

- Твоя validator identity: `DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt`
- System Program: `11111111111111111111111111111111`
- Token Program: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`

### Lamports

**Lamport** — найменша одиниця SOL. Як satoshi для Bitcoin, або wei для Ethereum.

```
1 SOL = 1,000,000,000 lamports (10^9)
```

Усі balances у Solana state — lamports. SOL це просто `lamports / 10^9` для display.

```bash
solana account YOUR_WALLET
# Balance: 5.234 SOL  (це 5,234,000,000 lamports внутрішньо)
```

### Owner — security primitive

**Owner** = pubkey program який володіє правом модифікувати цей account.

Це **не** wallet owner у звичайному сенсі (не людина). Це **program**.

Приклад owners:

| Account type | Owner | Owner pubkey |
|---|---|---|
| SOL wallet (твій) | System Program | `11111111111111111111111111111111` |
| Token account | SPL Token Program | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` |
| Vote account | Vote Program | `Vote111111111111111111111111111111111111111` |
| Stake account | Stake Program | `Stake11111111111111111111111111111111111111` |
| Program executable | BPF Loader | `BPFLoaderUpgradeab1e11111111111111111111111` |

**Security model**: тільки owner program може писати у `data` поле або змінювати `lamports`. Random program не може торкнутись чужого account.

Якщо хочеш transfer токенів — викликаєш Token Program (як owner token account). Token Program робить mutation. Без цього виклику data залишається такою як є.

### Data — custom state

`data: Vec<u8>` — arbitrary byte array. Що в ньому — залежить від owner program.

Приклади:

| Account | Що у data |
|---|---|
| SOL wallet | Порожньо (лише lamports має значення) |
| Token account | mint pubkey, owner wallet, amount, decimals |
| Vote account | identity, authorized voter, commission, epoch_credits, history |
| Stake account | stake_state (initialized/activating/active/deactivating), delegation info |
| Program | Compiled BPF bytecode (executable program) |

Як читати data: треба знати **schema** яку очікує owner program. CLI tools (`solana vote-account`, `solana stake-account`, `spl-token`) парсять data поле за specific program format.

```bash
# Raw data (hex/base64 для tooling)
solana account VOTE_PUBKEY

# Parsed data (Vote Program format)
solana vote-account VOTE_PUBKEY
```

### Executable flag

`executable: bool` — true для programs (smart contracts), false для data accounts.

Якщо `executable=true` — цей account можна **викликати** (його data treated as BPF bytecode). Якщо false — це звичайний state account.

```bash
# Token Program (executable)
solana account TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
# Output: Executable: true, ...

# Random wallet (not executable)
solana account DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt
# Output: Executable: false, ...
```

### rent_epoch (legacy)

Колись Solana мала dynamic rent — accounts pay rent періодично, могли бути deleted якщо не платять. Зараз — **rent-exempt rule**: account має тримати достатньо lamports щоб бути permanently rent-exempt. Module 2.3 розкаже.

`rent_epoch` тепер фактично unused (легасі поле). Але досі присутнє у structure.

## Pubkey — як accounts identifyуються

**Pubkey** = 32-byte public key (з ed25519 keypair або derived).

Дві категорії pubkeys:

1. **Regular pubkeys** — generated з keypair (e.g., `solana-keygen new`). Має corresponding **private key** який можна sign'ити TX.
2. **PDA** (Program Derived Addresses) — derived deterministically з seed + program. **Не має** private key. Тільки program може "sign" за PDA через CPI mechanism. Module 2 покриває деталі. (Module 3 deeper.)

Display format — **base58** encoding (легше читати ніж hex):

```
DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt   (regular pubkey, 32 bytes base58)
```

## solana account command

```bash
solana account <PUBKEY>
```

Виведе:

```
Public Key: DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt
Balance: 1.234 SOL
Owner: 11111111111111111111111111111111
Executable: false
Rent Epoch: 18446744073709551615
Length: 0 (0x0) bytes
```

Розбір:

| Поле | Що означає |
|---|---|
| Public Key | Address account |
| Balance | Lamports converted to SOL |
| Owner | Program що володіє |
| Executable | Programs vs data accounts |
| Rent Epoch | Legacy (max u64 value означає rent-exempt) |
| Length | Розмір `data` поля у байтах |

Якщо account не існує — `AccountNotFound`.

## Account types у Solana

Хоч всі accounts мають однакову structure, можна classify за **owner program**:

### System Program accounts (звичайні wallets)

Owner: `11111111111111111111111111111111`. Data length: 0 (porожній). Тільки lamports.

Це твої SOL wallets — generated через `solana-keygen new`. Можна:

- Receive SOL (anyone може transfer)
- Send SOL (owner = System Program виконує transfer від твого pubkey, потребує signature твоїм private key)

### Token accounts

Owner: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` (SPL Token Program). Data: mint + owner + amount.

Кожен token holding це окремий account. Якщо ти тримаєш JTO + USDC + JitoSOL — це **3 окремі token accounts**.

Module 2.4 deeper на token accounts і ATAs.

### Program accounts (executable)

Owner: `BPFLoaderUpgradeab1e11111111111111111111111`. Data: compiled BPF bytecode.

Це **smart contracts** на Solana. Module 2.2 deeper.

### Vote accounts

Owner: `Vote111111111111111111111111111111111111111`. Data: vote state.

Кожен validator має vote account з state: identity, voted slots history, commission, epoch credits.

```bash
solana vote-account YOUR_VOTE_PUBKEY
```

### Stake accounts

Owner: `Stake11111111111111111111111111111111111111`. Data: stake state + delegation.

Кожен delegation створює окремий stake account.

## Connect to your work: DoubleZero rewards-token-owner

З 2026-06-08 сесії — ти питала чи treasury wallet це ATA. Тепер контекст:

**`--rewards-token-owner`** очікує **owner wallet pubkey** (System Program account), НЕ ATA.

Перевірити:

```bash
solana account 3zr1GfKvd4AULbBZjc3bvEqEUBfsog7hjuhxqiQ2wvyA --url mainnet-beta
```

- Якщо `Owner: 11111111111111111111111111111111` → SOL wallet, годиться як `--rewards-token-owner`
- Якщо `Owner: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` → ATA, **не** годиться — треба знайти wallet що її owns

DoubleZero rewards system автоматично derive'є ATA з `(owner wallet, DZ token mint)` через standard formula. Ти даєш only wallet — програма обчислить ATA сама.

## Hands-on exercise

На сервері WNX0016778:

```bash
# Твій validator identity (System Program account = wallet)
sudo /home/solana/ag/bin/solana account DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt --url http://localhost:8899

# Твій vote account (Vote Program-owned)
sudo /home/solana/ag/bin/solana account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899

# Через спеціалізований view
sudo /home/solana/ag/bin/solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899

# System Program (executable)
sudo /home/solana/ag/bin/solana account 11111111111111111111111111111111 --url http://localhost:8899

# Token Program (executable)
sudo /home/solana/ag/bin/solana account TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA --url http://localhost:8899
```

Mainnet (з ноутбука):

```bash
# Anyone's wallet (можна Anatoly's відомий)
solana account 5cYUmJEozcr8U6tStRkkX97aGgrcwLg9DiQS2KQ7UH9w --url mainnet-beta

# Token Program (executable program account)
solana account TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA --url mainnet-beta
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Account`](/glossary#a), [`Lamport`](/glossary#l), [`Owner (account)`](/glossary#o), [`Pubkey`](/glossary#p), [`Executable flag`](/glossary#e), [`PDA`](/glossary#p), [`Base58`](/glossary#b), [`System Program`](/glossary#s), [`SPL Token Program`](/glossary#s)

## External refs

- [Anza: Accounts](https://docs.anza.xyz/runtime/programs) — official account model
- [Solana Cookbook: Account model](https://solana.com/docs/core/accounts) — practical examples
- [Helius: Anatomy of a Solana Account](https://www.helius.dev/blog/solana-accounts) — beginner-friendly

---

**Наступне:** [2. Programs as accounts →](/module-2/2-programs)
