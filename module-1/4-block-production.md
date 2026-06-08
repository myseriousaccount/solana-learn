<script setup>
const quiz = {
  id: 'm1-4-block-production',
  title: '🧠 Mini-check: Block production',
  intro: '3 питання — що відбувається у leader slot.',
  questions: [
    {
      type: 'order',
      q: 'Постав у правильному порядку steps що leader робить у своєму 400ms slot:',
      items: [
        'Broadcast shreds через turbine до інших validators',
        'Open bank (start new in-progress block state)',
        'Process transactions з TPU (включити у block)',
        'Generate PoH ticks (continuous timestamping)',
        'Vote за parent block (як validator)',
        'Close bank (фіналізувати block state)'
      ],
      correctOrder: [1, 3, 2, 4, 0, 5],
      explanation: 'Open bank → почати PoH (фіксує start time) → process TXs (заповнити block) → vote за previous (це теж TX) → broadcast shreds (паралельно з processing для latency) → close bank. PoH starts as soon as bank opens. Шреди можуть start broadcast як тільки перший shred ready (не чекати закриття).'
    },
    {
      type: 'mcq',
      q: 'Що з цього є валідними причинами skipped slot? (обери всі)',
      options: [
        'Leader hardware замало fast — не встиг compile block за 400ms',
        'Leader software крашнувся під час slot',
        'Network лагав — leader не зміг достачити shreds до cluster',
        'Інший validator забрав slot (race condition)'
      ],
      correct: [0, 1, 2],
      explanation: '#1, #2, #3 — реальні причини skip. #4 НЕПРАВИЛЬНО: slot fixed для одного leader, ніхто не "забирає" race-style. Якщо leader fails — slot просто skipped.'
    },
    {
      type: 'scenario',
      q: 'Твій mainnet validator має skip rate 12% (підвищений). Що з цього варто investigate спочатку? Опиши 3-4 perspectivy.',
      ideal: '1. Hardware: CPU bottleneck. Run htop під час leader slot, дивись на high CPU/IOwait. Solution: upgrade CPU або move to faster server. Mainnet validator потребує AMD EPYC або Intel Xeon з high single-thread perf.\n\n2. Network: high latency to peers. Run ping до major datacenter (e.g., Equinix). High RTT (>30ms до близьких peers) = шреди не доходять to cluster in time. Solution: change ISP/host, use peering.\n\n3. Disk I/O: slow NVMe. Bank operations потребують fast write. Check iostat for high await. Solution: faster NVMe (Samsung 980 Pro або enterprise NVMe).\n\n4. Software: новий agave version з regression. Check release notes if you upgraded recently. Solution: downgrade until issue fixed.\n\n5. RAM: not enough RAM, OS swapping. Check free -h. Solution: 256GB+ для mainnet.\n\n6. Логи: подивись solana logs для panic/error під час your leader slots specifically.',
      explanation: 'Ключове: думати multi-perspective (hardware/network/software). Якщо описала 3+ angles — повна відповідь. Bonus за specific debugging tools (htop, iostat, ping).'
    }
  ]
}
</script>

# 4. Block production (produce vs skip)

## TL;DR

У своєму 400ms slot leader має багато встигнути: відкрити bank, обробити transactions з TPU, generate PoH ticks, проголосувати за parent block, broadcast shreds, закрити bank. Якщо встиг — slot містить block (**produced**). Якщо ні — slot **skipped**.

Skip rate (% твоїх slots що стали skipped) — основний health metric. Mainnet target: < 5%. Якщо > 10% — щось не так з hardware/network/software.

## Концепти

### Що відбувається у 400ms leader slot

Послідовність events що leader виконує:

```
T=0ms      Open bank — створити in-progress block state на base parent block
T=0-380ms  Process loop:
            ├─ Read incoming transactions з TPU (transaction processing unit)
            ├─ Execute transactions, update accounts state
            ├─ Generate PoH ticks (continuous proof-of-history sequence)
            ├─ Vote за parent block (sign + include як TX)
            └─ Start broadcasting перші shreds через turbine
T=380ms    Close bank — фіналізувати state hash
T=~395ms   Last shreds out (target: cluster має ВСЕ до ~400ms)
T=400ms    Slot ends — наступний leader має почати свій slot
```

15-20ms safety margin у кінці бо: network latency, остання обробка signatures, sanity checks.

### Bank

**Bank** — internal термін для "in-progress block state" у validator memory. Validator тримає **поточний bank** (working state) + parent bank (попередній committed state).

Open bank = початок нового block, накопичуємо transactions у memory. Close bank = freeze state, обчислити hash, тепер block "ready to broadcast".

Bank state включає:

- Усі account changes (balances, data)
- Slot number, parent hash, blockhash
- Transaction execution results
- Vote tally
- Rewards accumulation

### Shreds

**Shred** — фрагмент block. Solana розбиває block на multiple shreds (типово 32-64 на block) і broadcasts через **turbine** (multicast protocol).

Чому шреди а не цілий block:

- **Швидкість**: можна розсилати першi shreds **до** закриття bank — паралельно з processing
- **Розмір**: один block може бути MB; шред 1280 bytes — fits in single UDP packet
- **Resilience**: erasure coding (Reed-Solomon) дозволяє відновити block з підмножини shreds (e.g., 32 з 64)

Module 5 (Networking) розкаже про turbine deeper.

### Produce vs Skip

| | Produced slot | Skipped slot |
|---|---|---|
| Block existed | Так | Ні |
| Leader earned fees | Так (transaction fees) | Ні |
| Leader earned vote rewards | Залежить від vote inclusion | Ні |
| Cluster advances slot counter | Так | Так (slot counter завжди increments) |
| Contributes до validator's stats | Як successful production | Як skip event |

**Important**: slot counter завжди increments навіть якщо skip. Тому ти бачиш `Slot: 369450123` навіть якщо багато попередніх slots були skipped.

### Skip rate computation

```
Skip rate = (skipped slots / total leader slots) × 100%
```

Для конкретного validator у конкретному epoch:

- Leader schedule says ти leader для 5000 slots
- Реально produce'нула 4750 blocks
- Skipped 250
- Skip rate = 250 / 5000 = 5%

На mainnet типові ranges:

| Skip rate | Сегмент |
|---|---|
| 0-3% | Top performers (excellent hardware + network) |
| 3-5% | Healthy (стандарт) |
| 5-10% | Acceptable, але room for improvement |
| 10-20% | Problematic — investigate |
| 20%+ | Серйозні issues — risk drop'нути зі stake pools |

### Чому skip відбувається

**Hardware-related:**

1. **CPU bottleneck**: not enough single-thread perf. Modern mainnet validator потребує AMD EPYC 7xxx або Intel Xeon Gold з ~3.5GHz boost
2. **Disk I/O slow**: bank operations потребують rapid writes. NVMe required, ideally enterprise-grade
3. **RAM insufficient**: 256GB+ для mainnet. Less → OS swapping → slow
4. **Network bandwidth**: 10Gbps preferred, 1Gbps minimum

**Network-related:**

1. **High latency до peers**: турбіна потребує fast shred propagation. Ping > 30ms до datacenter neighbors → проблема
2. **Packet loss**: UDP-based turbine, packet loss → shreds не доходять
3. **ISP throttling**: validator iтеntsively uses bandwidth (~500GB/day mainnet)

**Software-related:**

1. **Agave version bug**: regression у release (rare на stable tags, частіше на feature branches)
2. **Config misconfiguration**: bad flags у systemd unit
3. **OOM kills**: validator restarted under memory pressure

### Як investigate skip rate

```bash
# Real-time monitoring
sudo journalctl -u solana -f | grep -iE "skip|leader"

# Hardware
htop                          # CPU, RAM under load
iostat -x 1                   # disk I/O
free -h                       # memory + swap

# Network
ping -c 5 близький_validator
iperf3 -c bandwidth_test_server

# Validator software
sudo /home/solana/ag/bin/agave-validator --version
sudo systemctl status solana --no-pager
```

## Leader slot group strategy

З Module 1.3 знаємо: Solana групує consecutive slots для одного leader (typically 4 на mainnet). Чому це впливає на skip rate:

**Перший slot у group часто skipped** (~10-15% вище за середнє) бо:

- Validator just received "you're leader" notification
- TPU forwarding не повністю warm
- Pre-allocations не готові

**Slots 2-4 у group** мають **lower skip rate** бо validator вже у "leader mode" — все warmed.

Tip: якщо твій skip rate skewed на first-of-group — це **infrastructure warmup issue**, not pure performance. Можна налаштувати TPU preheat або keep validator у "ready state" longer.

## Connect to your work

### Monitor skip rate щодня

На mainnet — використовуй [stakewiz.com](https://stakewiz.com) або [validator.app](https://www.validator.app). Set alerts якщо skip rate > 8% (early warning).

### Coordinate з cluster: don't restart during your leader window

З §4 cheatsheet (routine upgrade):

```bash
sudo -u solana /home/solana/ag/bin/agave-validator \
    --ledger /home/solana/solana/ledger \
    wait-for-restart-window
```

Ця команда блокує термінал поки validator не **поза** твоєю leader window. Коли вийде — safe to restart без втрати produced slots.

### Pre-upgrade баseline

Перед upgrade record:

```bash
# Skip rate
solana validators --url mainnet-beta | grep YOUR_IDENTITY

# Last credits
solana vote-account YOUR_VOTE | grep Credits
```

Після upgrade моніторь — якщо skip jump на 5+% порівняно до baseline → новий version має regression, rollback per §4 Phase 6.

## Hands-on exercise

На твоєму сервері WNX0016778 (Alpenglow):

```bash
# Скільки slots у тебе у цьому epoch
MY_IDENTITY=DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt
sudo /home/solana/ag/bin/solana leader-schedule --url http://localhost:8899 | grep $MY_IDENTITY | wc -l

# Поточний slot
CURRENT=$(sudo /home/solana/ag/bin/solana slot --url http://localhost:8899)
echo "Current slot: $CURRENT"

# Найближчі 5 твоїх leader slots
sudo /home/solana/ag/bin/solana leader-schedule --url http://localhost:8899 \
    | awk -v c=$CURRENT '$1 > c {print}' \
    | grep $MY_IDENTITY \
    | head -5

# Поточні system stats (для context)
free -h | head -2
df -h /home/solana/solana/ledger | tail -1
uptime
```

Mainnet (для reference):

```bash
# Top 10 validators by stake
solana validators --url mainnet-beta | head -15

# Cluster-wide active stake stats
solana validators --url mainnet-beta | grep -E "Active Stake|Delinquent Stake"
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Bank`](/glossary#b), [`Shred`](/glossary#s), [`Turbine`](/glossary#t), [`TPU`](/glossary#t), [`PoH`](/glossary#p), [`Erasure coding`](/glossary#e), [`Skip rate`](/glossary#s)

## External refs

- [Anza: Validator Anatomy](https://docs.anza.xyz/validator/anatomy) — internal architecture
- [Anza: TPU](https://docs.anza.xyz/validator/tpu) — Transaction Processing Unit details
- [Anza: Turbine block propagation](https://docs.anza.xyz/consensus/turbine-block-propagation)
- [Stakewiz Education](https://stakewiz.com/) — live data + explanations

---

**Попередньо:** [← 3. Leaders](/module-1/3-leaders) | **Наступне:** [5. Validator status →](/module-1/5-validator-status)
