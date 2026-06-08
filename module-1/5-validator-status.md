<script setup>
const quiz = {
  id: 'm1-5-validator-status',
  title: '🧠 Mini-check: Validator status',
  intro: '3 питання — як читати validator health.',
  questions: [
    {
      type: 'diagnose',
      q: 'Solana validators виводить твоїй validator у "Delinquent Stake" sекції. Що з цього вірно (обери всі)?',
      options: [
        'Twi validator не голосував >128 slots на rooted slot — це Solana definition of delinquent',
        'Inший validator може бути delinquent тимчасово через network issue, recoverable',
        'Delinquent validator втрачає stake rewards для періоду delinquency',
        'Cluster автоматично slashes delinquent validators'
      ],
      correct: [0, 1, 2],
      explanation: '#1, #2, #3 правильні. #4 НЕПРАВИЛЬНО: Solana НЕ slashing для delinquency (на цей момент). Ти просто не заробляєш rewards поки delinquent.'
    },
    {
      type: 'command',
      q: 'Як отримати JSON з усіма validators і їх vote credits? Напиши команду.',
      accepts: [
        'solana validators --output json',
        'solana validators --output json-compact',
        'sudo /home/solana/ag/bin/solana validators --output json',
        'solana validators --output json --url mainnet-beta'
      ],
      ideal: 'solana validators --output json',
      explanation: '--output json дає structured data для parsing (через jq, python, etc). За дефолтом вивід table format. --output json-compact = without newlines (smaller).'
    },
    {
      type: 'explain',
      q: 'Поясни різницю між "Active Stake" і "Delinquent Stake" у cluster. Чому ці метрики matter для health всього cluster?',
      ideal: 'Active Stake = total SOL яка staked до validators які зараз правильно голосують (non-delinquent). Delinquent Stake = SOL staked до validators які НЕ голосують зараз (delinquent).\n\nЧому matter:\n1. Consensus needs > 2/3 stake voting щоб produce finality. Якщо Active Stake падає нижче 67% — cluster haltиться (no finality можлива).\n2. Якщо delinquent stake велика — cluster під risk. Mainnet target: delinquent < 5-10%.\n3. На Alpenglow halt threshold ~18% delinquent — beyond cluster stops producing blocks.\n\nЯк твій restart це впливає: коли ти restartиш свій validator, він тимчасово стає delinquent (поки catches up). Якщо cluster delinquent вже high — твій restart може pushнути кластер ближче до halt threshold. Тому з §4 cheatsheet pre-flight check: "якщо delinquent > 5%, не restartй".',
      explanation: 'Ключове: active needed for finality (2/3 threshold), delinquent зростає коли validators відстають, restart твоєю додає до delinquent тимчасово. Якщо описала обидва + halt threshold — повна відповідь.'
    }
  ]
}
</script>

# 5. Validator status (voting, delinquent, healthy)

## TL;DR

Кожен validator у cluster має status: **active+voting** (healthy), **active+delinquent** (тимчасово не голосує), **inactive** (без stake або retired). `solana validators` показує цю інформацію плюс vote credits, version, commission, root slot.

Тебе як operator цікавить два питання щодня: (1) **мій validator voting** (Active Stake, growing credits)? (2) **які активи cluster-wide** (Delinquent Stake < 5%, нема halt risk)?

## Концепти

### Validator status types

| Status | Що означає |
|---|---|
| **Active, voting** | Валідатор має stake + регулярно голосує. Зароблює rewards. Норма. |
| **Active, delinquent** | Має stake, але **не голосував > 128 slots** на rooted slot. Тимчасовий стан — recover'иться коли голосування відновиться. |
| **Inactive (no stake)** | Validator running but no stake delegated. На mainnet — це validator що чекає на delegation. На Alpenglow — твоя нода без self-stake. |
| **Stopped / not running** | Не з'являється в `solana validators` output. |

### Definition: delinquent

Validator вважається **delinquent** якщо його last vote slot:

```
last_vote < (current_root_slot - 128)
```

Тобто validator відстав на > 128 slots (~51 секунда) у voting. Це trigger.

Recovery: коли validator catches up і знову vote'ить — status повертається до "active, voting" протягом 1-2 epochs.

### Чому 128 slots threshold

128 slots ≈ 51 секунда — це **значно більше** за нормальний voting jitter (validator зазвичай vote'ить кожен slot або через 1-2). Threshold вибрано щоб:

- Тимчасові network glitches (повільніший shred receiving) — НЕ trigger delinquent
- Реальні issues (validator crashed, frozen) — швидко visible

Якщо threshold був би 10 slots — false positives flood. Якщо 1000 — slow detection.

### Cluster-wide stake breakdown

Cluster total stake = **Active Stake** + **Delinquent Stake**.

```bash
solana validators --url mainnet-beta | grep -E "Active Stake|Delinquent Stake"
```

Output:

```
Active Stake:    387,234,567.12 SOL
Delinquent Stake: 12,876,543.21 SOL
```

Active / (Active + Delinquent) = % cluster voting properly. Mainnet target: > 95%.

### Halt threshold

Solana consensus requires **> 2/3 stake** голосувати для finalization. Якщо delinquent stake > 33% → cluster **halts** (cannot finalize blocks).

| Cluster | Halt threshold (delinquent) | Реально часто |
|---|---|---|
| mainnet-beta | 33% | < 5% |
| testnet | 33% | 5-15% (testing instability) |
| Alpenglow | ~18% (different consensus) | різниться, ранній research |

⚠️ **Restart pressure**: коли ти restart'иш свій validator, він стає delinquent на 1-5 хв (поки catches up). Якщо cluster delinquent вже high — твій restart може push'нути cluster ближче до halt threshold.

Тому з §4 Phase 1 cheatsheet:

> ⚠️ Threshold: якщо cluster delinquent stake > 5% — почекати поки відновиться, інакше твій restart додасть ще ~3% delinquent і наблизить cluster до halt threshold.

## Solana CLI: validators command

```bash
solana validators
```

Output format:

```
  Identity                                       Vote Account                                  Commission  Last Vote        Root Slot        Credits     Version  Active Stake
✓ 7xKXt...                                       9mP3s...                                      10%        369450123 (   0)  369450088 (- 35)  4123847     1.18.22   1000000.00 SOL  
✓ DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt  3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo   100%       369450122 (-  1)  369450088 (- 35)  142847      1.18.22   1.00 SOL        
...

Active Stake: 387,234,567.12 SOL
Delinquent Stake: 12,876,543.21 SOL  
```

Колонки:

| Колонка | Що означає |
|---|---|
| ✓/⚠ | Voting (✓) або delinquent (⚠) |
| **Identity** | Validator's identity pubkey (PoH ticking key) |
| **Vote Account** | Vote account address (зберігає voting state) |
| **Commission** | % of rewards validator забирає для себе (rest до stakers) |
| **Last Vote** | Slot останнього voted block, з offset від current |
| **Root Slot** | Highest finalized slot |
| **Credits** | Vote credits earned (це і є базис rewards) |
| **Version** | Agave/Solana version |
| **Active Stake** | SOL delegated to validator (active) |

### Як читати "Last Vote" і "Root Slot"

```
369450123 (   0)
```

- `369450123` = slot number останнього vote
- `(   0)` = offset від current slot

Якщо `(0)` — validator vote'ив **тільки що**, healthy. Якщо `(- 50)` — vote'ив 50 slots тому, теж healthy (50 < 128). Якщо `(-200)` — delinquent (200 > 128).

### Filter для свого validator

```bash
solana validators --url mainnet-beta | grep DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt
```

Тільки твій рядок — easy daily check.

### JSON output for scripting

```bash
solana validators --output json --url mainnet-beta > validators.json

# Parse with jq
jq '.validators[] | select(.identityPubkey == "DSDefivSL...")' validators.json

# Total active stake
jq '[.validators[] | select(.delinquent == false) | .activatedStake] | add' validators.json
```

## Vote credits — основа rewards

**Vote credit** = одиниця "успішного voting work" що validator earn'ить.

На classic Solana (Tower BFT):

- Validator vote'ить за конкретний slot → отримує **1 credit** якщо vote landed inside того slot
- За epoch validator accumulates credits proportionally до how many votes he made
- У кінці epoch — inflation rewards розподіляються proportional до credits

На Alpenglow (SIMD-0326):

- `epochCredits` означає інше — **lamport reward**, не vote count
- Module 4 (Consensus) розкаже деталі

Перевірити свої credits:

```bash
solana vote-account YOUR_VOTE_ACCOUNT | grep -A 3 Credits
```

Output:

```
Epoch Voting History:
Epoch  Credits Earned
853    122847
852    121234
...
```

Credits мають **рости** monotonically (number більший = краще). Якщо credit count не змінився між epochs — validator не голосував.

## Connect to your work

### Daily health check (mainnet)

```bash
solana validators --url mainnet-beta | grep YOUR_IDENTITY
# Перевір:
# - ✓ marker (не ⚠)
# - Last Vote offset близько до 0
# - Credits growing порівняно з вчора
```

Або через dashboards: stakewiz.com, validator.app.

### Pre-restart check (з §4 cheatsheet)

```bash
solana validators --url localhost | grep -E "Active Stake|Delinquent Stake"
```

Якщо delinquent > 5% — НЕ restart'й, чекай.

### Post-restart verify (з Module 0.4 pattern)

```bash
# Live logs
sudo tail -f /home/solana/solana/solana.log

# Slot delta
S1=$(sudo /home/solana/ag/bin/solana slot --url http://localhost:8899)
sleep 5
S2=$(sudo /home/solana/ag/bin/solana slot --url http://localhost:8899)
echo "delta: $((S2-S1))"

# Credits growing
sudo /home/solana/ag/bin/solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo \
    --url http://localhost:8899 | grep -A 3 Credits
```

## Hands-on exercise

На твоєму сервері WNX0016778 (Alpenglow):

```bash
# Подивись свій validator у списку
sudo /home/solana/ag/bin/solana validators --url http://localhost:8899 | grep DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt

# Cluster health (active vs delinquent)
sudo /home/solana/ag/bin/solana validators --url http://localhost:8899 | grep -E "Active Stake|Delinquent Stake"

# Vote credits твого validator
sudo /home/solana/ag/bin/solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo \
    --url http://localhost:8899 | grep -A 5 "Epoch Voting"

# Top 5 validators by stake
sudo /home/solana/ag/bin/solana validators --url http://localhost:8899 | head -10

# Total validator count
sudo /home/solana/ag/bin/solana validators --url http://localhost:8899 | grep -cE "^[✓⚠]"
```

Mainnet (з ноутбука):

```bash
# Cluster stats
solana validators --url mainnet-beta | grep -E "Active Stake|Delinquent Stake"

# Кількість delinquent validators
solana validators --url mainnet-beta | grep -c "^⚠"
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Active stake`](/glossary#a), [`Delinquent`](/glossary#d), [`Halt threshold`](/glossary#h), [`Vote credit`](/glossary#v), [`Last vote`](/glossary#l), [`Root slot`](/glossary#r), [`Commission`](/glossary#c), [`SFDP`](/glossary#s)

## External refs

- [Anza: Validator FAQ](https://docs.anza.xyz/operations/best-practices/general)
- [Stakewiz.com](https://stakewiz.com) — live validator stats
- [Validators.app](https://www.validators.app) — operator dashboard з alerts

---

**Попередньо:** [← 4. Block production](/module-1/4-block-production) | **Наступне:** [⭐ Final quiz →](/module-1/final-quiz)
