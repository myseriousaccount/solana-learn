<script setup>
const quiz = {
  id: 'm2-3-rent',
  title: '🧠 Mini-check: Rent',
  intro: '3 питання щоб закріпити rent економіку.',
  questions: [
    {
      type: 'mcq',
      q: 'Що відбувається з account який НЕ має достатньо lamports для rent-exempt threshold?',
      options: [
        'Account автоматично видаляється (garbage collected) при наступному epoch',
        'Account залишається але не може приймати нові data',
        'Cluster halts',
        'Account paid rent кожну slot аж до закінчення lamports'
      ],
      correct: [0],
      explanation: 'Если account не rent-exempt і його lamports decrease below threshold — на наступному rent collection cycle account purged (видалений). Сучасно: всі нові accounts MUST be rent-exempt (мінімум lamports = rent threshold). Module 2.3.'
    },
    {
      type: 'command',
      q: 'Як подивитись мінімум lamports для rent-exempt для account розміру 165 bytes (типовий token account)?',
      accepts: [
        'solana rent 165',
        'solana rent 165 --url mainnet-beta',
        'sudo /home/solana/ag/bin/solana rent 165 --url http://localhost:8899'
      ],
      ideal: 'solana rent 165',
      explanation: 'solana rent <SIZE_BYTES> виводить мінімум lamports потрібних щоб account такого розміру був rent-exempt. Для token account (165 bytes) на mainnet ~0.00203928 SOL. Module 2.3.'
    },
    {
      type: 'scenario',
      q: 'Ти створюєш новий vote account з 1.000 SOL. Вотинг почався, але cluster повідомляє "stake account 1.00228 SOL requirement". Що сталось і як fix?',
      ideal: 'Сталось: stake account requires rent reserve ПЛЮС достаточну lamports для consider'ити voting active. Rent-exempt threshold для stake account ~0.00228 SOL (приблизно). Тому мінімум: 0.00228 SOL rent reserve + amount you want to actually delegate.\n\nЯкщо ти hadn 1.000 SOL → effective delegated amount = 1.000 - 0.00228 = ~0.998. Воно ще можливо рабочe (~ ≥ 1 SOL для self-stake on Alpenglow), або не зовсім — залежить від cluster minimum.\n\nFix: transfer ще більше SOL у stake account (e.g., 2 SOL total). Тепер rent reserve + 1.998 active stake. Це і трапилось у твоєму Alpenglow case 2026-06-02 — додала 1 SOL більше, after that working.\n\nOR: створити stake account з explicit amount > min:\nsolana create-stake-account stake-keypair.json 2 --from validator-keypair.json',
      explanation: 'Ключове: rent reserve деднує з effective stake amount. Якщо описала reserve + fix додати більше SOL — повна відповідь.'
    }
  ]
}
</script>

# 3. Rent and rent-exempt

## TL;DR

Solana stores account data on-chain. Storing data costs мережі resources (RAM, disk). Тому accounts мають "pay" — concept **rent**. Сучасно це implementations як **rent-exempt threshold**: account мусить мати мінімум lamports proportional до розміру `data` поля. Якщо менше — account purged.

Для тебе як operator: коли створюєш vote account, stake account, token account — мусиш фондити достатньо SOL щоб account був rent-exempt. Це звичайно ~0.001-0.003 SOL per account. **Не deduct'иться** з твого balance — це reserve який залишається у account і returned при account close.

## Концепти

### Чому rent взагалі

Solana cluster тримає **всі** accounts у RAM/SSD кожного validator. Сотні мільйонів accounts. Якщо хтось створює мільйон порожніх accounts — це burdens cluster без cost.

Економічний механізм: storing account costs **SOL reserved у самому account**. Це creates natural pressure не plodити garbage accounts.

### Old rent vs new rent

**Old system (deprecated):**

- Accounts pay rent periodically (кожен N slots)
- Rent rate = X lamports per byte per epoch
- Якщо account run out lamports — purged

**New system (current):**

- All accounts MUST be **rent-exempt** at creation time
- Rent-exempt threshold = enough lamports щоб **never** need to pay (2 years of rent prepaid)
- На практиці = ~0.00089 SOL per 100 bytes на mainnet
- Не deduct'иться — це reserve який stays in account forever (returned at close)

`rent_epoch` field у account — legacy artifact. Зараз effectively `u64::MAX` для всіх accounts (= "never collect rent").

### Як обчислюється rent-exempt threshold

Формула приблизна:

```
threshold_lamports = (account_size_bytes + 128 metadata bytes) × ~10 lamports/byte × ~2 years
                   ≈ 6964 lamports per byte
```

Round numbers (mainnet):

| Account type | Розмір (bytes) | Rent-exempt threshold |
|---|---|---|
| System Program account (empty wallet) | 0 | ~0.000890 SOL |
| Stake account | 200 | ~0.00228 SOL |
| Token account | 165 | ~0.00204 SOL |
| Vote account | ~3700 | ~0.0273 SOL |
| Mint account | 82 | ~0.00146 SOL |
| Program account (small contract) | 10000 | ~0.07 SOL |
| Program account (large contract) | 200000 | ~1.4 SOL |

Перевірити для конкретного розміру:

```bash
solana rent 165
# Rent per byte-year: 19.055441 lamports
# Rent per epoch: 0.000027395 SOL
# Rent-exempt minimum: 0.00203928 SOL
```

### Account close — recover rent

Коли account close'нуть (через `solana close-stake-account` тощо) — reserved lamports повертаються до specified receiver wallet.

Це чому rent можна вважати "reservable deposit" — не lost money, але locked while account exists.

## Practical implications для тебе

### Vote account creation

З §5 cheatsheet — створення vote account:

```bash
solana create-vote-account \
    vote-account-keypair.json \
    validator-keypair.json \
    YOUR_WITHDRAWER \
    --commission 10
```

Цей TX:

1. Створює account з owner = Vote Program
2. Allocates ~3700 bytes для vote state
3. Mandatory rent reserve: ~0.0273 SOL
4. Auto-funds reserve з твого default keypair (`solana config get → Keypair`)

Якщо твій keypair has < ~0.03 SOL — TX fails з "InsufficientFunds for rent".

### Stake account creation

```bash
solana create-stake-account stake-keypair.json 1 --from validator-keypair.json
```

Це створює stake account з **1 SOL total**. Але:

- Rent reserve: ~0.00228 SOL (locked у account)
- Effective stake для delegation: 1 - 0.00228 = ~0.99772 SOL

Якщо мінімум cluster для self-stake — 1.000 SOL → твій 0.998 effective може бути insufficient. Тому фактично create з 2+ SOL для safe margin.

### Твій 2026-06-02 incident

З memory: ти створила stake account з 1 SOL, але voting не починав бо effective stake < min. Fix: додати ще 1 SOL (тепер 2 SOL total, rent reserve + 1.998 effective).

## solana rent command

```bash
solana rent <SIZE_BYTES>
```

Виведе:

```
Rent per byte-year: 19.055441 lamports
Rent per epoch: 0.000027395 SOL
Rent-exempt minimum: 0.00203928 SOL
```

Useful формули:

| Як швидко обчислити | Команда |
|---|---|
| Для token account | `solana rent 165` |
| Для vote account | `solana rent 3762` |
| Для stake account | `solana rent 200` |
| Для system account (empty wallet) | `solana rent 0` |
| Для custom (наприклад program) | `solana rent <твій розмір>` |

## Cluster epoch fee + rent accounting

Кожен epoch validator earnings: inflation rewards + transaction fees + rent collection (legacy, now effectively zero).

Old rent: collected periodically. New: collected ONCE при account creation (rent-exempt deposit). У data terms — кожен epoch validators earn ~0 rent revenue.

Це one reason чому inflation rewards dominate validator income.

## Connect to your work

### Pre-create rent check (для нових accounts)

Перш ніж створювати vote/stake/token account, перевір:

```bash
# Скільки треба для vote account
solana rent 3762

# Перевір що твій keypair має достатньо
solana balance YOUR_DEFAULT_KEYPAIR
```

### Close stake account → recover rent

```bash
solana withdraw-stake stake-account-keypair.json receiver_pubkey ALL
```

Це закрить stake account і поверне всі lamports (включно з rent reserve) до receiver.

### Mainnet validator costs

| Account | Rent reserve | Comments |
|---|---|---|
| Validator identity (SOL wallet) | ~0.000890 | One-time |
| Vote account | ~0.0273 | One-time per vote |
| Stake account (per delegation) | ~0.00228 | Per stake account |
| Token accounts (ATAs) | ~0.00204 each | Per token type held |

Total для basic mainnet setup: ~0.03 SOL "stuck" у rent reserves. Negligible порівняно з stake amounts.

## Hands-on exercise

```bash
# Перевір rent для різних розмірів
solana rent 0       # empty wallet
solana rent 82      # mint account
solana rent 165     # token account
solana rent 200     # stake account
solana rent 3762    # vote account
solana rent 10000   # small program

# На твоєму Alpenglow — твій vote account дійсно reserved
sudo /home/solana/ag/bin/solana account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899 | grep -E "Balance|Length"

# Compare: balance (твоя total) vs minimum для розміру
sudo /home/solana/ag/bin/solana rent $(sudo /home/solana/ag/bin/solana account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899 | grep "Length:" | awk '{print $2}') --url http://localhost:8899

# Твій stake account
sudo /home/solana/ag/bin/solana stake-account /home/solana/solana/stake-keypair-1.json --url http://localhost:8899
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Rent`](/glossary#r), [`Rent-exempt`](/glossary#r), [`Rent reserve`](/glossary#r), [`Garbage collection (accounts)`](/glossary#g), [`Account allocation`](/glossary#a)

## External refs

- [Anza: Rent](https://docs.anza.xyz/implemented-proposals/rent)
- [Solana Cookbook: Account Rent](https://solana.com/docs/intro/rent)
- [Helius: Solana Rent Explained](https://www.helius.dev/blog/solana-rent)

---

**Попередньо:** [← 2. Programs](/module-2/2-programs) | **Наступне:** [4. Token accounts & ATA →](/module-2/4-tokens-ata)
