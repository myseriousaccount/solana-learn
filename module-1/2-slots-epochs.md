<script setup>
const quiz = {
  id: 'm1-2-slots-epochs',
  title: '🧠 Mini-check: Slots, epochs, time',
  intro: '3 питання — фундаментальна Solana terminology про час.',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього правильне про slot на Solana? (обери всі)',
      options: [
        'Slot це 400ms window під час якого один (заздалегідь обраний) leader може створити block',
        'Один slot завжди містить рівно один block',
        'Якщо leader не зміг створити block у своєму slot — slot вважається skipped',
        'Slot number монотонно росте, не починається з нуля для кожного epoch'
      ],
      correct: [0, 2, 3],
      explanation: 'Slot це time window для leader. Block може бути створений (success) або skipped (leader fail). #2 неправильно: slot може бути empty. Slot numbering глобальне, не resetиться кожен epoch.'
    },
    {
      type: 'command',
      q: 'Як подивитись інфо про поточний epoch (slot range, progress, скільки часу залишилось)? Напиши команду.',
      accepts: [
        'solana epoch-info',
        'solana epoch-info --url mainnet-beta',
        'solana epoch-info --url http://localhost:8899'
      ],
      ideal: 'solana epoch-info',
      explanation: 'solana epoch-info показує: Epoch number, Slot Range (start..end), Epoch Completed Percent, Epoch Completed Time. Це найкорисніша одно-командна довідка про де знаходимось у часі.'
    },
    {
      type: 'scenario',
      q: 'На mainnet тобі сказали "почекай 1 epoch перш ніж stake активний". Поясни що це означає у часовому вимірі — скільки часу чекати, чому саме 1 epoch, що відбудеться в кінці.',
      ideal: 'Один epoch на mainnet = ~2 дні (~432000 slots × 400ms = 172800 сек = 48 годин).\n\nЧому 1 epoch: stake delegation активується ТІЛЬКИ на boundary епохи. Якщо ти delegateиш на slot середини epoch N — твій stake додається у "activating" state, чекає кінця epoch N, і стає active на старті epoch N+1.\n\nЦе механіка warmup. Solana має це обмеження щоб уникнути в межах epoch фрагментації stake (consensus працює з єдиним stake snapshot per epoch).\n\nЩо відбудеться в кінці: на slot 0 наступного epoch твій stake потрапляє в active set, validator починає включати твою stake вагу у голосуванні, ти починаєш заробляти rewards (якщо validator vote'ить).',
      explanation: 'Ключове: epoch boundaries це consensus moment коли stake snapshots оновлюються. Якщо описала ~2 дні + чому boundary важлива — повна відповідь.'
    }
  ]
}
</script>

# 2. Slots, epochs, time на Solana

## TL;DR

Solana ділить час на **slots** (400ms кожен). У кожному slot **один заздалегідь визначений leader** має право створити block. Якщо leader зміг — slot містить block; якщо не зміг — slot **skipped** (empty).

**Epoch** = 432,000 slots (~2 дні на mainnet). У кінці кожного epoch відбуваються **boundary events**: stake activations, leader schedule для наступного epoch обчислюється, rewards розподіляються.

Розуміти slots і epochs критично бо: stake activations, rewards, validator delinquency status, vote credits — все вимірюється в цих одиницях.

## Концепти

### Чому Solana не використовує "blocks" як основну time unit

На Bitcoin/Ethereum базова time unit це **block** — block виходить коли хтось зміг його зробити (proof-of-work або proof-of-stake тощо). Час між blocks непередбачуваний (10 хв середнє для BTC, але може бути 1 хв або 30 хв).

Solana використовує **slot** як time unit — це **fixed 400ms window** який існує **незалежно** від того чи створиться у ньому block. Якщо leader зміг — slot містить block. Якщо ні (leader впав, мережа лагає) — slot **skipped** (empty).

```
Time:    0ms        400ms      800ms      1200ms     1600ms
Slot:    [#100]     [#101]     [#102]     [#103]     [#104]
         block      block      SKIPPED    block      block
```

Slot #102 порожній бо leader не встиг (або взагалі не пробував). Time continues — slot #103 належить наступному leader.

Це базове проектне рішення Solana: **час безперервний, blocks дискретні**.

### Slot

**Slot** — 400ms window, ідентифікується **slot number** (глобальний, монотонно зростаючий integer):

- Slot 0 — genesis
- Slot 1 — через 400ms після genesis
- Slot 100 — через 40 секунд після genesis
- Slot 432000 — через ~48 годин (≈ кінець першого epoch)

Slot numbers **не** ресетяться між epochs. Вони просто продовжують рости назавжди (на mainnet зараз slot ~370,000,000+).

Кожен slot має:

- **Leader** (один валідатор обраний заздалегідь)
- Або **block** (якщо leader зміг створити) або **skipped** mark (якщо не зміг)

### Block

**Block** = container який зберігає всі transactions виконані у конкретному slot. Якщо slot не skipped — у нього є один block.

Block містить:

- **Slot number**
- **Parent slot** (попередній не-skipped slot)
- **Blockhash** (унікальний відбиток block content)
- **Transactions** (всі що виконались)
- **Rewards** (для validator leader rewards)
- **Block time** (вtime коли підтверджений)

⚠️ **Slot ≠ Block.** Slot це time window. Block це data container. Один slot може мати або 0 blocks (skipped) або 1 block (produced). Ніколи 2+.

### Skipped slot

Якщо leader не створив block у своєму slot — slot **skipped**. Причини:

- Leader's нода впала
- Network затримка (block не вспів до cluster)
- Leader повільніший за інших
- Leader умисно не голосував (rare)

Skipped slots **не сприймаються погано як такі**. На mainnet skip rate ~3-5% — нормально. Якщо твій validator skip rate > 10% — це **погано** (втрачаєш rewards).

### Epoch

**Epoch** = 432,000 slots = група slots з спільним leader schedule і stake snapshot. Кожна epoch має number (зростаючий).

| Cluster | Slots per epoch | Slot duration | Epoch duration |
|---|---|---|---|
| mainnet-beta | 432,000 | 400ms | ~48 годин (~2 дні) |
| testnet | 432,000 | 400ms | ~48 годин |
| devnet | 432,000 | 400ms | ~48 годин |
| Alpenglow | різниться (config-specific) | 400ms | різниться |

⚠️ Epoch duration **приблизна**: 400ms це **target**, реальна швидкість залежить від cluster health. На mainnet часто 410-430ms середнє → epoch 49-52 години.

### Що відбувається на epoch boundary (важливо!)

Кінець epoch N → початок epoch N+1 = **critical transition** на cluster:

1. **Stake activations**: вся stake delegations які чекали на activation — стають active. Stake які чекали на deactivation — стають inactive.
2. **Leader schedule**: для epoch N+1 cluster обчислює новий leader schedule (хто веде який slot протягом наступних 432k slots) на base stake snapshot з кінця epoch N.
3. **Rewards distribution**: validator rewards за epoch N розподіляються (inflation + transaction fees).
4. **Vote credits accounting** finalізується для epoch N.

Тому "почекай 1 epoch перш ніж stake активний" = чекай boundary щоб твій stake потрапив у новий snapshot.

### Slot vs Block vs Confirmation level

Коли ти бачиш у monitor:

```
Processed Slot: 701999
Confirmed Slot: 701562
Finalized Slot: 701562
```

| Confirmation | Що означає |
|---|---|
| **Processed** | Останній slot який твій validator processed (включно з включенням transactions у локальний bank) |
| **Confirmed** | Slot який ≥2/3 stake голосів за |
| **Finalized** | Slot який має повну фіналізацію (irreversible, secured by 31+ vote credits) |

`Processed > Confirmed > Finalized` — це normal ordering. Difference показує latency consensus (на mainnet типово ~12-32 slots difference).

## Час на Solana — приблизні цифри

| Unit | Slots | Real time | Контекст |
|---|---|---|---|
| 1 slot | 1 | 400ms | leader window |
| 1 second | 2.5 | 1s | typical RPC latency |
| 1 minute | 150 | 60s | useful for quick estimates |
| 1 hour | 9,000 | 1h | block reorgs (rare past this) |
| 1 epoch | 432,000 | ~48h | stake/leader schedule unit |
| 1 day | 216,000 | 24h | ~half epoch |

Mental formula: **slots × 0.4 = секунди**. Або **slots / 150 = хвилини**.

## solana epoch-info — найкорисніша команда

```bash
solana epoch-info
```

Виведе щось типу:

```
Block height: 256432198
Slot: 369450123
Epoch: 854
Transaction Count: 425829304823
Epoch Slot Range: [369120000..369552000)
Epoch Completed Percent: 76.420%
Epoch Completed Slots: 330123 / 432000 (76.42%)
Epoch Completed Time: 1day 12h 16m 30s / 2days 0h 0m 0s (76.42%)
```

Розбір:

| Поле | Що означає |
|---|---|
| **Block height** | Кількість blocks створених від genesis (виключає skipped slots) |
| **Slot** | Поточний slot (включає skipped) |
| **Epoch** | Номер поточного epoch |
| **Transaction Count** | Всі transactions за всю історію cluster |
| **Epoch Slot Range** | start..end slots поточного epoch |
| **Epoch Completed Percent** | Прогрес поточного epoch |
| **Epoch Completed Time** | Стільки часу пройшло / загальна оцінка |

## Зв'язок slot ↔ time

Перевести slot → real time:

```bash
solana block-time 369450123
# Виведе: 2026-06-08T15:23:45 (UTC)
```

Або обчислити різницю:

- Якщо slot A = 100, slot B = 1000 → різниця 900 slots × 0.4s ≈ 360s = 6 хв
- Якщо різниця 9000 slots → ~1 год

## Connect to your work: типові scenarios

### "Чекати ~1 epoch" перед/після stake operations

З §5 cheatsheet (stake delegation): "stake активується тільки на boundary epoch". Це значить:

1. Ти робиш `solana delegate-stake` на slot 500000
2. Stake у status "activating" до кінця поточного epoch
3. На кінці epoch (slot 432000 наступного multiple) stake стає "active"
4. Реально це чекати від ~10 хв (якщо ти близько до boundary) до ~48 год (якщо щойно почалась epoch)

`solana epoch-info` показує "Epoch Completed Percent" — звідси оцінюєш скільки чекати.

### Monitor slot lag

З Module 0.7a cheatsheet:

```bash
LOCAL=$(sudo /home/solana/ag/bin/solana slot --url http://localhost:8899)
REMOTE=$(sudo /home/solana/ag/bin/solana slot --url http://165.140.84.154:8899)
echo "us:$LOCAL them:$REMOTE delta:$((LOCAL - REMOTE))"
```

Якщо delta = 437 slots → ми відстаємо ~175 секунд (~3 хв).

### Vote credits earned

Validator заробляє vote credits **per epoch**. У кінці epoch N validator отримує lamport reward proportional до credits заробленних відносно total stake. Module 4 (Consensus) розкаже деталі.

## Hands-on exercise

На будь-якому з твоїх серверів:

```bash
# Поточна позиція у часі
sudo /home/solana/ag/bin/solana epoch-info --url http://localhost:8899

# Конкретний slot — коли він був (timestamp)
sudo /home/solana/ag/bin/solana slot --url http://localhost:8899   # отримай поточний
sudo /home/solana/ag/bin/solana block-time $(sudo /home/solana/ag/bin/solana slot --url http://localhost:8899) --url http://localhost:8899

# Slot leader для кожного з найближчих 10 slots
sudo /home/solana/ag/bin/solana leader-schedule --url http://localhost:8899 | head -20

# Block 1000 slot тому
CURRENT=$(sudo /home/solana/ag/bin/solana slot --url http://localhost:8899)
sudo /home/solana/ag/bin/solana block-time $((CURRENT - 1000)) --url http://localhost:8899
# Має повернути час ~6-7 хв тому
```

На mainnet (з ноутбука):

```bash
solana epoch-info --url mainnet-beta
solana validators --url mainnet-beta | tail -5   # cluster-wide stats
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Slot`](/glossary#s), [`Epoch`](/glossary#e), [`Block`](/glossary#b), [`Blockhash`](/glossary#b), [`Skipped slot`](/glossary#s), [`Block height`](/glossary#b), [`Processed slot`](/glossary#p), [`Confirmed slot`](/glossary#c), [`Finalized slot`](/glossary#f), [`Stake activation`](/glossary#s), [`Warmup`](/glossary#w)

## External refs

- [Anza: Clock](https://docs.anza.xyz/runtime/sysvars#clock) — sysvar з slot/epoch info
- [Anza: Inflation Schedule](https://docs.anza.xyz/implemented-proposals/ed_overview/ed_validation_client_economics) — як rewards розподіляються per epoch
- [Helius: Solana Time Model](https://www.helius.dev/blog/an-introduction-to-solanas-clock) — beginner-friendly

---

**Попередньо:** [← 1. Cluster](/module-1/1-cluster) | **Наступне:** [3. Leader, leader schedule →](/module-1/3-leaders)
