<script setup>
const quiz = {
  id: 'm1-3-leaders',
  title: '🧠 Mini-check: Leader, leader schedule',
  intro: '3 питання — leader rotation базові концепти.',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього вірно про leader schedule? (обери всі правильні)',
      options: [
        'Leader schedule для epoch N+1 визначається на base stake snapshot у кінці epoch N',
        'Schedule визначає хто буде leader для кожного slot всього epoch (заздалегідь, deterministically)',
        'Validator з більшим stake отримує більше slots у schedule (proportional)',
        'Якщо validator делінквент під час слоту що для нього призначений, інший validator перебирає цей slot live'
      ],
      correct: [0, 1, 2],
      explanation: '#1, #2, #3 правильні: schedule deterministic від stake snapshot, заздалегідь обчислений, proportional до stake. #4 НЕПРАВИЛЬНО — schedule fixed, ніхто не "перебирає" delinquent slot, він просто стає skipped.'
    },
    {
      type: 'command',
      q: 'Як подивитись чи буде твій validator (identity DSDefivSL...) leader у наступних 20 slots? Напиши команду з filter.',
      accepts: [
        'solana leader-schedule --url http://localhost:8899 | grep DSDefivSL | head -20',
        'solana leader-schedule | grep DSDefivSL | head -20',
        'sudo /home/solana/ag/bin/solana leader-schedule --url http://localhost:8899 | grep DSDefivSL | head -20'
      ],
      ideal: 'solana leader-schedule | grep DSDefivSL | head -20',
      explanation: 'solana leader-schedule виводить пари "slot_number identity_pubkey" для всього поточного epoch. grep по prefix твоєї identity показує тільки твої slots. head -20 — перші 20 hits.'
    },
    {
      type: 'explain',
      q: 'Чому Solana використовує проактивне (announced upfront) leader schedule, а не reactive (хто був першим створити block — той leader)?',
      ideal: 'Проактивне leader schedule дає кілька critical переваг:\n\n1. Performance: validators ЗАЗДАЛЕГІДЬ знають хто буде leader, можуть готуватись (warm up TPU sockets, pre-prepare transactions для forward). Це дає 400ms slot time можливим.\n\n2. Predictability: clients знають куди send transactions (forward to current/upcoming leader через TPU). Без schedule — flooding всього cluster кожним TX.\n\n3. No collision: reactive (PoW-style) має race conditions de кілька leaders створюють block одночасно → fork. Schedule eliminates це.\n\n4. Stake-weighted fairness: schedule гарантує що validator з X% stake отримує приблизно X% slots. Reactive не гарантує fairness, lucky validator може взяти більше.\n\nTradeoff: schedule визначається ДО epoch старту, тому stake changes у середині epoch не affect schedule до наступного boundary.',
      explanation: 'Ключове: performance + predictability + no collision + fairness. Якщо описала performance + predictability — основа є. Bonus за обговорення TPU forwarding або no-fork properties.'
    }
  ]
}
</script>

# 3. Leader, leader schedule, rotation

## TL;DR

У кожному slot **рівно один validator** має право створити block — це **leader** для цього slot. Хто є leader для якого slot визначається **заздалегідь** через **leader schedule**: deterministic мапа `slot → validator pubkey` обчислена на старті кожного epoch.

Validator з більшим stake отримує **більше slots** у schedule (proportional). Schedule fixed для всього epoch — якщо leader для slot впав, slot просто стає **skipped** (ніхто не "перебирає" його live).

## Концепти

### Leader

**Leader** для slot — це validator що має **ексклюзивне право** створити block у цьому slot.

Solana: ОДИН leader на slot. Не competition, не lottery — заздалегідь обраний.

Що leader робить у свій slot (~400ms):

1. **Зачинає bank** — створює новий "in-progress" block state
2. **Включає transactions** — обробляє received transactions (з TPU)
3. **Створює PoH ticks** — генерує proof-of-history sequence
4. **Голосує за parent block** — leader також validator, відправляє свій vote
5. **Broadcasts shreds** — розсилає block fragments через turbine
6. **Closes bank** — фіналізує block, "застигає" його state

Якщо встиг — block existes. Якщо ні — slot skipped, наступний leader перебирає (з НАСТУПНОГО slot, не цього).

### Leader schedule

**Leader schedule** = pre-computed мапа `slot → validator pubkey` для всього epoch. Тобто 432,000 entries (один на кожен slot epoch).

Приклад (фрагмент):

```
Slot 369120000 → 7xKXt...  (Validator A)
Slot 369120001 → 7xKXt...  (Validator A)
Slot 369120002 → 7xKXt...  (Validator A)
Slot 369120003 → 7xKXt...  (Validator A)
Slot 369120004 → 9mP3s...  (Validator B)
Slot 369120005 → 9mP3s...  (Validator B)
...
```

Уважайте — кожен validator зазвичай отримує **група consecutive slots** (4 на mainnet). Це називається **leader slot group** — більш ефективно ніж міняти leader кожен slot (зменшує context switching, network overhead).

### Як обчислюється schedule

Algorithm (спрощено):

1. **На старті epoch N-1**: snapshot всіх active stakes
2. **Обчислити** для epoch N: для кожного з 432000 slots обрати validator з імовірністю proportional до його stake
3. **Source of randomness**: VRF (verifiable random function) seeded зі stake snapshot + epoch number — deterministic, але unpredictable перед snapshot moment
4. **Group consecutive slots**: 4 послідовні slots йдуть до одного validator (mainnet)
5. **Publish schedule**: всі nodes у cluster обчислюють те ж саме schedule independent (бо deterministic)

Це **stake-weighted**: validator з 1% stake отримає ~1% slots у schedule (~4320 slots / 432000 total). Validator з 10% stake отримає ~10% (~43200 slots).

### Чому проактивне (announced upfront) а не реактивне

Альтернатива: PoW-style "хто першим показав block — той leader". Solana вибрала **announced schedule** бо:

1. **Performance**: validators знають заздалегідь хто наступний leader → можуть **forward TPU traffic** заздалегідь, prepare RPC sessions. Це дає 400ms slot time. Реактивні системи дозволяють 10+ секунд.

2. **No collisions / no forks** (rare): тільки один legitimate leader на slot. Reactive системи мають race conditions → forks → reorgs.

3. **Predictability for clients**: користувачі і apps знають куди send transactions. Forward to current leader → TX processed з найменшим latency. Без schedule = flood всього cluster.

4. **Stake-weighted fairness**: 1% stake = 1% slots, гарантовано. Lucky validator не може взяти більше ніж його частка.

**Tradeoff**: schedule fixed для всього epoch, тому stake changes у середині epoch не вплинуть до наступного boundary.

### Schedule після epoch start: immutable

Раз schedule опублікований — він **immutable** для всього epoch. Тобто:

- Якщо validator знятий за violation у середині epoch — його slots усе одно залишаються у schedule (стануть skipped коли він спробує)
- Якщо новий validator активований у середині epoch — отримає slots ТІЛЬКИ у наступному epoch
- Якщо validator gain/lose stake у середині — schedule поточного epoch не реагує

Усі stake/validator зміни "тестять" нову schedule на наступному epoch boundary.

## Solana CLI: leader-schedule

```bash
solana leader-schedule
```

Виведе пари `slot validator_pubkey` для всього **поточного** epoch:

```
369120000  7xKXt...
369120001  7xKXt...
369120002  7xKXt...
369120003  7xKXt...
369120004  9mP3s...
...
```

Корисні фільтри:

```bash
# Подивись свої upcoming slots
solana leader-schedule | grep YOUR_IDENTITY | head -20

# Кількість slots у тебе на цей epoch
solana leader-schedule | grep YOUR_IDENTITY | wc -l

# Хто буде leader на конкретному slot
solana leader-schedule | grep "^369450000"
```

## Skip rate — індикатор validator health

**Skip rate** = % твоїх slots які стали skipped (не produced).

```bash
solana validators --url mainnet-beta | grep YOUR_IDENTITY
```

Output типу:

```
Identity                                       Vote Account                                  Commission Last Vote        Root Slot      Credits    Version  Active Stake  Delinquent
DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt  3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo   10%       369450123 (   0) 369450088 (-35)  4123847    1.18.22   1000.00 SOL   
```

Це basic. Для skip rate — використовуй services як **stakewiz.com** або **validator.app**:

| Skip rate | Health |
|---|---|
| < 5% | Healthy |
| 5-10% | Уважно, потенційні issues |
| > 10% | Проблема — server lag, network, software |
| > 30% | Серйозна проблема — risk бути dropped зі stake pools |

Причини high skip rate:

- Hardware повільний (CPU underpowered)
- Network latency to peers
- Disk slow (NVMe не fast enough)
- Software bug (рідко на release tags)
- Overloaded TPU (mainnet TX flooding)

## Connect to your work: leader workflow

### На mainnet: моніторити skip rate

Перевіряй щоденно (через stakewiz.com або dashboards). Якщо growing — investigate ASAP щоб не drop'нути зі SFDP / stake pools.

### На testnet: testing нової версії

Якщо upgrade'нула тестнет до bleeding-edge agave і помітила skip rate jump → revert до previous version. Це **і є** purpose testnet — ловити issues перед mainnet.

### На Alpenglow: schedule поки кластер маленький

З маленькою кількістю validators у Alpenglow ти отримуєш **багато slots** у schedule (proportional). Це і причина чому ti дуже бачиш своє голосування у logs.

## Hands-on exercise

На WNX0016778 (Alpenglow):

```bash
# Знайди свої slots у current epoch
sudo /home/solana/ag/bin/solana leader-schedule --url http://localhost:8899 | grep DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt | head -10

# Скільки всього slots у тебе в цей epoch
sudo /home/solana/ag/bin/solana leader-schedule --url http://localhost:8899 | grep DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt | wc -l

# Подивись на топ validators by leader slots
sudo /home/solana/ag/bin/solana leader-schedule --url http://localhost:8899 | awk '{print $2}' | sort | uniq -c | sort -rn | head -10

# Поточний leader (на цей конкретний slot)
SLOT=$(sudo /home/solana/ag/bin/solana slot --url http://localhost:8899)
sudo /home/solana/ag/bin/solana leader-schedule --url http://localhost:8899 | grep "^$SLOT"
```

На mainnet (з ноутбука):

```bash
# Топ-10 validators by slot count
solana leader-schedule --url mainnet-beta | awk '{print $2}' | sort | uniq -c | sort -rn | head -10
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Leader`](/glossary#l), [`Leader schedule`](/glossary#l), [`Leader slot group`](/glossary#l), [`Skip rate`](/glossary#s), [`VRF`](/glossary#v), [`Stake snapshot`](/glossary#s)

## External refs

- [Anza: Leader Rotation](https://docs.anza.xyz/consensus/leader-rotation) — official
- [Stakewiz](https://stakewiz.com) — live skip rate dashboard
- [Validator.app](https://www.validator.app) — operator monitoring

---

**Попередньо:** [← 2. Slots, epochs](/module-1/2-slots-epochs) | **Наступне:** [4. Block production →](/module-1/4-block-production)
