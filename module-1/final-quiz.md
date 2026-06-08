<script setup>
const quiz = {
  id: 'm1-final',
  title: '⭐ Module 1 — Final quiz',
  intro: '15 питань що синтезують усі 5 секцій Module 1. Цільте на 80%+.',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього правильне про cluster? (обери всі)',
      options: [
        'Cluster має унікальний genesis hash',
        'Один agave-validator binary може joinнути будь-який cluster (mainnet/testnet/devnet/Alpenglow)',
        'SOL у mainnet можна перевести у testnet через bridge',
        'Усі nodes у cluster мають однаковий software version'
      ],
      correct: [0, 1],
      explanation: '#1 правильно: genesis hash — unique fingerprint. #2 правильно: один binary, різний config. #3 НЕПРАВИЛЬНО: clusters separate, SOL не fungible. #4 НЕПРАВИЛЬНО: один cluster може мати nodes на різних patch versions (compatible).'
    },
    {
      type: 'command',
      q: 'Як переключити solana CLI на mainnet-beta?',
      accepts: [
        'solana config set --url mainnet-beta',
        'solana config set --url https://api.mainnet-beta.solana.com',
        'solana config set -u mainnet-beta'
      ],
      ideal: 'solana config set --url mainnet-beta',
      explanation: 'solana config set --url <network>. Shortcut: mainnet-beta, testnet, devnet, localhost. Module 1.1.'
    },
    {
      type: 'compare',
      q: 'У чому різниця між slot і block?',
      ideal: 'Slot це 400ms time window (continuous, незалежно від подій). Block це data container що може опціонально existувати у slot. Якщо leader зміг створити block у своєму slot — slot has block. Якщо не зміг — slot skipped (empty).\n\nКлючові розбіжності:\n1. Slot завжди existує (counter monotonically increases). Block conditional.\n2. Slot timing fixed (400ms). Block size variable (залежить від TX).\n3. Один slot = 0 або 1 blocks. Ніколи 2+.\n4. Block height counts тільки produced blocks, slot number counts всі.',
      explanation: 'Ключове: slot = time window, block = data container. Slot може бути empty. Module 1.2.'
    },
    {
      type: 'mcq',
      q: 'Скільки часу триває epoch на mainnet (приблизно)?',
      options: [
        '~48 годин (~2 дні)',
        '~24 години (1 день)',
        '~1 година',
        '~1 тиждень'
      ],
      correct: [0],
      explanation: '432,000 slots × 400ms = 172,800 секунд = 48 годин. У реальності може бути 49-52 години через slight slot timing drift. Module 1.2.'
    },
    {
      type: 'command',
      q: 'Як подивитись прогрес поточного epoch (% completed, скільки часу залишилось)?',
      accepts: [
        'solana epoch-info',
        'solana epoch-info --url mainnet-beta',
        'sudo /home/solana/ag/bin/solana epoch-info --url http://localhost:8899'
      ],
      ideal: 'solana epoch-info',
      explanation: 'solana epoch-info виводить slot range, completed percent, completed time. Module 1.2.'
    },
    {
      type: 'mcq',
      q: 'Що з цього правильне про leader schedule? (обери всі правильні)',
      options: [
        'Schedule визначається deterministically на base stake snapshot з кінця попереднього epoch',
        'Schedule для всього epoch публікується заздалегідь (всі 432000 entries)',
        'Validator з більшим stake отримує більше slots у schedule (proportional)',
        'Якщо leader впав під час slot, інший validator перебирає live'
      ],
      correct: [0, 1, 2],
      explanation: 'Schedule deterministic, public, stake-proportional. Slots не "перебираються" — якщо leader fail, slot stays empty (skipped). Module 1.3.'
    },
    {
      type: 'order',
      q: 'Постав у правильному порядку steps що leader робить у своєму 400ms slot:',
      items: [
        'Broadcast shreds через turbine',
        'Open bank',
        'Process transactions з TPU',
        'Generate PoH ticks',
        'Vote за parent block',
        'Close bank'
      ],
      correctOrder: [1, 3, 2, 4, 0, 5],
      explanation: 'Open bank → PoH start → process TXs → vote за parent → broadcast shreds (паралельно) → close bank. Module 1.4.'
    },
    {
      type: 'scenario',
      q: 'Mainnet validator має skip rate 15% (norм 5%). Опиши 4 angles які варто investigate (technical, не organizational).',
      ideal: '1. CPU bottleneck: validator processing не встигає за 400ms. Run htop, дивись чи high CPU/IOwait. Solution: faster CPU (AMD EPYC, Intel Xeon Gold з high boost).\n\n2. Disk I/O: повільний NVMe. iostat -x 1 покаже high await. Solution: enterprise NVMe (Samsung 980 Pro або better).\n\n3. Network: high latency to peers або packet loss. ping/iperf до peers. Solution: better ISP/peering, possibly move datacenter.\n\n4. RAM: under 256GB для mainnet → OS swapping. free -h check. Solution: upgrade RAM.\n\n5. Software: regression у new agave version. Check release notes якщо щойно updateувала. Solution: downgrade per §4 Phase 6.\n\n6. Logs analysis: sudo journalctl -u solana --since "1 hour ago" | grep -iE "error|warn" — конкретні errors під час leader slots.',
      explanation: 'Multi-angle thinking: hardware (CPU/disk/RAM), network, software, logs. Якщо описала 4+ angles — повна відповідь. Module 1.4.'
    },
    {
      type: 'diagnose',
      q: 'Solana validators виводить тебе у "Delinquent Stake" sекції. Що правда (обери всі)?',
      options: [
        'Validator не голосував > 128 slots на rooted slot',
        'Validator продовжує заробляти rewards поки delinquent',
        'Cluster автоматично slashes delinquent validators',
        'Status може recoverитись коли validator catch up і resume voting'
      ],
      correct: [0, 3],
      explanation: '#1 правильно — це Solana definition. #4 правильно — recoverable. #2 НЕПРАВИЛЬНО — нема rewards поки delinquent. #3 НЕПРАВИЛЬНО — Solana НЕ slashing для delinquency (на цей момент). Module 1.5.'
    },
    {
      type: 'mcq',
      q: 'Якщо cluster active stake падає нижче 67% — що відбувається?',
      options: [
        'Cluster halts (не може finalize blocks)',
        'Cluster slowly degrades (slots take longer)',
        'Validators get auto-slashed',
        'Епоха автоматично extendsся'
      ],
      correct: [0],
      explanation: 'Solana потребує > 2/3 stake voting для finality. Якщо delinquent > 33% (active < 67%) — cluster halts. Module 1.5.'
    },
    {
      type: 'command',
      q: 'Як перевірити скільки vote credits ти заробила у останніх 3 epochs?',
      accepts: [
        'solana vote-account YOUR_VOTE | grep -A 5 "Epoch Voting"',
        'solana vote-account YOUR_VOTE | grep -A 3 Credits',
        'sudo /home/solana/ag/bin/solana vote-account YOUR_VOTE --url http://localhost:8899 | grep -A 5 "Epoch Voting"'
      ],
      ideal: 'solana vote-account YOUR_VOTE | grep -A 5 "Epoch Voting"',
      explanation: 'vote-account command виводить voting history з credits per epoch. grep -A N виводить N рядків після match. Module 1.5.'
    },
    {
      type: 'explain',
      q: 'Поясни (своїми словами) як stake delegation activation працює через epoch boundaries.',
      ideal: 'Стейк не активується миттю. Process:\n\n1. Ти запускаєш delegate-stake на slot X (середина epoch N)\n2. Stake переходить у status "activating" (= warmup) до кінця epoch N\n3. На boundary epoch N → N+1 cluster робить snapshot всіх stakes — твій stake потрапляє у новий active stake set\n4. На slot 0 epoch N+1 твій stake "active" — validator починає включати твою вагу у voting/leader schedule\n5. У кінці epoch N+1 ти отримуєш свою частку rewards proportionally\n\nЧому boundary гранична: consensus працює з одним stake snapshot per epoch (з міркувань determinism). Mid-epoch changes ламали б leader schedule і vote tallying. Тому всі stake operations effects відкладені до next boundary.\n\nSame logic for deactivation: ти undelegate-stake — stake "deactivating" до кінця epoch — inactive у наступному.',
      explanation: 'Ключове: boundary-aligned activation, snapshot-based consensus. Якщо описала activating → boundary → active sequence — повна відповідь. Module 1.2.'
    },
    {
      type: 'mcq',
      q: 'Що з цього є валідними причинами skipped slot? (обери всі)',
      options: [
        'Hardware повільний — не встиг compile block за 400ms',
        'Network лагав, shreds не доcтачились до cluster',
        'Інший validator забрав slot (race)',
        'Validators software crashed mid-slot'
      ],
      correct: [0, 1, 3],
      explanation: 'Hardware, network, software crash — real causes. Race не може бути — slot fixed для одного leader, no override. Module 1.4.'
    },
    {
      type: 'compare',
      q: 'У чому різниця між Processed, Confirmed, і Finalized slot?',
      ideal: 'Processed: останній slot який твій validator обробив локально (включено TX у local bank). Найвищий number.\n\nConfirmed: slot який ≥ 2/3 stake проголосувала за. Lower number (старіший) ніж Processed.\n\nFinalized: slot який має full finality (31+ vote credits, irreversible). Найнижчий (найстаріший) з трьох.\n\nOrdering: Processed > Confirmed > Finalized.\n\nDifference indicates consensus latency. На mainnet типово Processed-Finalized = 12-32 slots (~5-12 секунд).\n\nДля validator ops: коли ти у monitor бачиш ці три — Processed = "я бачу", Finalized = "ми всі точно згодні". Якщо різниця велика — cluster має consensus issues.',
      explanation: 'Ordering matters. Якщо описала ordering + meaning — повна відповідь. Module 1.2.'
    },
    {
      type: 'command',
      q: 'Як подивитись скільки validators активних на mainnet прямо зараз?',
      accepts: [
        'solana validators --url mainnet-beta | grep -c "^✓"',
        'solana validators --url mainnet-beta | grep "^✓" | wc -l',
        'solana validators --url mainnet-beta --output json | jq "[.validators[] | select(.delinquent == false)] | length"'
      ],
      ideal: 'solana validators --url mainnet-beta | grep -c "^✓"',
      explanation: 'Validator row starts з ✓ (voting) або ⚠ (delinquent). grep -c counts matches. На mainnet типово ~1500-2000. Module 1.5.'
    },
    {
      type: 'explain',
      q: 'Чим відрізняється in-genesis від out-of-genesis joining нового cluster?',
      ideal: 'In-genesis: operator fills form до launch, його validator pubkey включений у initial genesis з initial stake. Starts validator у coordinated launch time з cluster. Гарантоване місце у first epoch leader schedule.\n\nOut-of-genesis (LumLabs Alpenglow case 2026-06): missed initial form. Cluster launches без вас. Later join: wipe ledger, download cluster genesis, sync, create vote account, self-stake, wait for organizer to delegate community stake.\n\nDifference: in-genesis ready from slot 0. Out-of-genesis joins mid-flight, needs catch-up + manual setup. Both valid paths. Module 1.6.',
      explanation: ''
    }
  ]
}
</script>

# ⭐ Module 1 — Final quiz

> 15 питань що перевіряють твоє розуміння Solana foundations: cluster, slots, epochs, leader schedule, block production, validator status. **80%+ correct = ready для Module 2.**

## Як проходити

- **Без підглядання** у секції під час quiz
- **Self-grade чесно** для explain/scenario/compare — порівнюй з ідеальною відповіддю
- Mid-quiz break OK — progress зберігається в localStorage
- **Цільте 12+/15 (80%+)** перед переходом на Module 2

## Quiz

<Quiz :data="quiz" />

## Результат

| Результат | Що далі |
|---|---|
| **13-15 / 15** | Ready для Module 2 (Account model) |
| **10-12 / 15** | Повторити секції з помилками, re-take |
| **< 10 / 15** | Прочитати модуль повторно, потім re-take |

## Що далі — Module 2

[Module 2: Account model](/module-2/) — Solana's унікальна account-based архітектура: програми це accounts, дані це accounts, rent, lamports, owner concept. Це фундамент для розуміння як TX оперує на state (Module 3).

---

**Попередньо:** [← 5. Validator status](/module-1/5-validator-status) | **Наступне:** [Module 2: Account model →](/module-2/) (🚧 не написано)
