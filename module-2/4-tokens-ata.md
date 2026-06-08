<script setup>
const quiz = {
  id: 'm2-4-tokens-ata',
  title: '🧠 Mini-check: Tokens & ATA',
  intro: '3 питання — це ВАЖЛИВО для DoubleZero rewards setup.',
  questions: [
    {
      type: 'diagnose',
      q: 'Тобі дали pubkey 9mP3sXyzAbc... як кандидат для --rewards-token-owner. Як перевірити чи це SOL wallet (підходить) чи token account/ATA (не підходить)?',
      options: [
        'solana account 9mP3sXyzAbc... і подивитись на Owner field',
        'solana balance 9mP3sXyzAbc... — якщо балас > 0 SOL, то wallet',
        'spl-token accounts --owner 9mP3sXyzAbc...',
        'Не можна перевірити без access до private key'
      ],
      correct: [0],
      explanation: 'Тільки solana account дає Owner field. Якщо Owner = 11111... (System Program) → SOL wallet, годиться. Якщо Owner = Tokenkeg... → ATA/token account, НЕ годиться. Balance — теж є у wallet AND token accounts, не decisive. spl-token accounts — дає token accounts які owns цей wallet, но не тип самого pubkey. Module 2.4.'
    },
    {
      type: 'mcq',
      q: 'Що з цього вірно про Associated Token Account (ATA)? (обери всі)',
      options: [
        'ATA address derives deterministically з (owner_wallet, token_mint)',
        'Кожна пара (wallet, mint) має тільки одну ATA',
        'ATA можна створити будь-ким — не потрібен власник wallet signнути',
        'Один wallet може мати кілька ATAs для різних tokens'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'Усі 4 правильні. ATA = deterministic PDA з seeds (wallet, mint, token_program). One per (wallet, mint) — це і означає "associated". Permissionless creation — будь-хто може створити ATA для будь-якого pair (платить rent). Wallet має ATA per token type — JTO ATA, USDC ATA, JitoSOL ATA, etc.'
    },
    {
      type: 'command',
      q: 'Як подивитись всі token accounts які owns певний wallet (наприклад для аудиту чийогось portfolio)? Напиши команду.',
      accepts: [
        'spl-token accounts --owner WALLET_PUBKEY',
        'spl-token accounts --owner WALLET_PUBKEY --url mainnet-beta',
        'solana spl-token accounts --owner WALLET_PUBKEY'
      ],
      ideal: 'spl-token accounts --owner WALLET_PUBKEY',
      explanation: 'spl-token accounts --owner <PUBKEY> виводить всі token accounts які owned by цей wallet. Кожен рядок: token mint, balance, account pubkey (це і є ATA). Module 2.4.'
    }
  ]
}
</script>

# 4. Token accounts & ATA

## TL;DR

SPL tokens (JTO, USDC, JitoSOL, BAM token, тощо) — не зберігаються "у wallet" як SOL. Кожен token type потребує **окремий token account** з owner = SPL Token Program. Wallet pubkey owns ці token accounts через field у їхніх data.

**ATA (Associated Token Account)** — deterministically derived token account для пари `(owner_wallet, token_mint)`. Standard convention: одна ATA per (wallet, token type). Це чому ти можеш просто sent комусь USDC за wallet address — ATA derive'ується automatically.

Для тебе як operator: **`--rewards-token-owner` ≠ ATA**. Очікує owner wallet (SOL wallet pubkey), ATA derived програмою. Це footgun що ти словила 2026-06-08 з DoubleZero config.

## Концепти

### SOL vs SPL tokens — different mechanics

| | SOL | SPL token (JTO, USDC, etc.) |
|---|---|---|
| Storage | Lamports field у wallet account | Окремий token account з amount field |
| Transfer | System Program: SOL with no need для new account | Token Program: transfer between two token accounts |
| One wallet has | Один SOL balance | Кілька token accounts (один per mint) |
| Receiver action | Anyone може receive SOL без preparation | Receiver needs token account для цього mint (auto-create через ATA) |

SOL — special-cased у System Program (native asset). All other tokens — handled by SPL Token Program як generic accounts.

### Token account anatomy

Token account це **звичайний account** з owner = SPL Token Program і structured data:

```
Token account {
    mint: Pubkey,         // який token (e.g., USDC mint)
    owner: Pubkey,        // wallet який володіє цим balance (SOL wallet)
    amount: u64,          // кількість tokens (у lowest unit, e.g., 1 USDC = 1_000_000)
    state: AccountState,  // initialized/frozen
    ... (інші поля)
}
```

⚠️ **Confusing terminology**: token account має поле "owner" — це **інший** owner ніж account-level owner!

- **Account-level owner** = SPL Token Program (manages даний account)
- **Field "owner" у data** = wallet pubkey (хто може spend з цього balance)

Тобто:

```
Token account "BPMx..."
  account.owner = TokenkegQ... (Token Program manages)
  account.data.owner = "9wPx..." (your SOL wallet — you control)
```

Token Program контролює operations (transfer, mint, burn), але тільки якщо wallet `9wPx...` signs.

### Multiple tokens, multiple accounts

Якщо твій wallet тримає JTO + USDC + JitoSOL — це **3 окремі token accounts**:

```
Wallet "9wPx..." (SOL wallet)
   ├─ token account "BPMa..." → JTO balance
   ├─ token account "BPMb..." → USDC balance
   └─ token account "BPMc..." → JitoSOL balance
```

Кожен має:
- Own pubkey
- Same wallet `9wPx...` у field "owner"
- Different mint
- Own amount

### ATA — Associated Token Account

Проблема: коли хтось хоче send тобі JTO, як знати в який token account? У тебе може бути 0, 1 або більше JTO token accounts.

Solution: **convention** — для кожної пари `(wallet, mint)` стандартизована deterministic address. Це і є **ATA**.

Formula:

```
ATA = findProgramAddress(
    seeds = [wallet_pubkey, TOKEN_PROGRAM, mint_pubkey],
    program = ASSOCIATED_TOKEN_PROGRAM
)
```

Все що знає sender — твій wallet pubkey + mint. Він обчислює ATA → sends туди → ти отримуєш.

### ATA creation

ATA spawn'иться auto при першому transfer (через Associated Token Program). Anyone може створити ATA для пари (wallet, mint) — це permissionless. Хто створив — платить rent reserve (~0.002 SOL).

Зазвичай:

- Sender створює ATA при transfer (заплачує rent)
- Receiver просто отримує

Команда manual creation:

```bash
spl-token create-account <MINT_ADDRESS>
# Створює ATA для (твій wallet, mint)
```

## Connect to your work: DoubleZero --rewards-token-owner

З сесії 2026-06-08 ти питала "це не оцей гаманець ATA?". Тепер з контекстом:

`--rewards-token-owner` очікує **wallet pubkey** (SOL wallet, owner field), не ATA pubkey.

Workflow коли вкажеш:

1. Ти даєш `--rewards-token-owner 9mP3sXyz...` (wallet pubkey)
2. DoubleZero program обчислює ATA = `findProgramAddress([9mP3sXyz, TOKEN_PROGRAM, DZ_MINT], ATA_PROGRAM)`
3. Якщо ATA ще не існує — створює (платить rent)
4. Posts rewards transfers до ATA
5. Тільки твій wallet (9mP3sXyz) може spend з ATA

Якщо помилково подавала ATA pubkey як `--rewards-token-owner`:

- Program обчислює ATA від ATA (nonsense input)
- Може деплоїти tokens у "ATA of ATA" — un-recoverable бо ніхто не контролює "ATA's ATA"

⚠️ **Always**: перевір owner field перед використанням як rewards-token-owner:

```bash
solana account 3zr1GfKvd4AULbBZjc3bvEqEUBfsog7hjuhxqiQ2wvyA --url mainnet-beta | grep Owner
```

- `Owner: 11111111111111111111111111111111` → SOL wallet ✅
- `Owner: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` → token account/ATA ❌

## SPL Token CLI

`spl-token` — CLI для interactions з SPL Token Program:

```bash
# Show all token accounts твого default wallet
spl-token accounts

# Specific owner
spl-token accounts --owner <WALLET_PUBKEY>

# Balance of specific token
spl-token balance <MINT>

# Create ATA для specific mint
spl-token create-account <MINT>

# Transfer tokens
spl-token transfer <MINT> <AMOUNT> <RECIPIENT_WALLET>
# (auto-creates ATA if recipient доesn't have one)

# Mint info
spl-token display <MINT_ADDRESS>
```

### Find ATA для конкретної пари

```bash
spl-token address \
    --owner <WALLET_PUBKEY> \
    --token <MINT_ADDRESS>
```

Виведе ATA pubkey (deterministic, той самий завжди).

## Token mints — what are they

**Mint** — інший account який defines token type:

```
Mint account {
    mint_authority: Pubkey,   // хто може mint нові tokens (or None для fixed supply)
    supply: u64,              // total tokens minted
    decimals: u8,             // скільки decimals (USDC має 6, JTO має 9)
    is_initialized: bool,
    freeze_authority: Pubkey, // може freeze any token account (or None для permissionless)
}
```

Mint account creation = "creating new token type". Token accounts referencja mint у їхньому data.

Приклади mints:

| Token | Mint pubkey |
|---|---|
| USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| JTO | `jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL` |
| JitoSOL | `J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn` |

Ти можеш `solana account <MINT>` подивитись mint state.

## Hands-on exercise

З ноутбука mainnet:

```bash
# Подивись на USDC mint
solana account EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --url mainnet-beta

# Через спеціалізований view
spl-token display EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --url mainnet-beta

# Якщо у тебе є wallet з token holdings (наприклад LumLabs treasury):
spl-token accounts --owner <TREASURY_WALLET> --url mainnet-beta

# Обчислити ATA для пари
spl-token address \
    --owner <WALLET_PUBKEY> \
    --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v \
    --url mainnet-beta

# Verify що повернений pubkey це token account
spl-token display <ATA_PUBKEY> --url mainnet-beta
```

На eta (DoubleZero context):

```bash
# Перевір candidate wallet для rewards-token-owner
sudo solana account 3zr1GfKvd4AULbBZjc3bvEqEUBfsog7hjuhxqiQ2wvyA --url mainnet-beta

# Якщо Owner = 11111... → SOL wallet, годиться як --rewards-token-owner
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`SPL Token`](/glossary#s), [`Token account`](/glossary#t), [`ATA`](/glossary#a), [`Mint`](/glossary#m), [`Mint authority`](/glossary#m), [`Freeze authority`](/glossary#f), [`Associated Token Program`](/glossary#a)

## External refs

- [SPL Token docs](https://spl.solana.com/token)
- [Solana Cookbook: Tokens](https://solana.com/developers/cookbook/tokens/create-mint-account)
- [Anchor: Token examples](https://www.anchor-lang.com/docs/tokens)

---

**Попередньо:** [← 3. Rent](/module-2/3-rent) | **Наступне:** [⭐ Final quiz →](/module-2/final-quiz)
