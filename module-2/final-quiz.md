<script setup>
const quiz = {
  id: 'm2-final',
  title: '⭐ Module 2 — Final quiz',
  intro: '12 питань — account model синтез. 80%+ для Module 3.',
  questions: [
    {
      type: 'mcq',
      q: 'Які поля має account на Solana? (обери всі)',
      options: ['lamports', 'owner', 'data', 'executable', 'rent_epoch', 'private_key'],
      correct: [0, 1, 2, 3, 4],
      explanation: '5 fields: lamports, owner, data, executable, rent_epoch. private_key NEVER stored on chain — це client-side тільки. Module 2.1.'
    },
    {
      type: 'compare',
      q: 'У чому різниця між account-level owner і "owner" field у data token account?',
      ideal: 'Account-level owner: program який володіє правом модифікувати account. Для token account це SPL Token Program (Tokenkeg...) — він manage всі operations transfer/mint/burn.\n\n"Owner" у data field token account: wallet pubkey (SOL wallet) який володіє цим balance. Це людський owner — той хто має private key і може ініціювати transfer.\n\nКонфлікт terminology: те ж саме слово "owner" значить різні речі залежно від layer. Account-level = program (security primitive). Data field = wallet (financial control).',
      explanation: 'Двозначність "owner" — поширений pitfall. Module 2.1, 2.4.'
    },
    {
      type: 'command',
      q: 'Як подивитись чи pubkey є SOL wallet чи token account?',
      accepts: [
        'solana account <PUBKEY> | grep Owner',
        'solana account <PUBKEY>',
        'sudo /home/solana/ag/bin/solana account <PUBKEY> --url http://localhost:8899'
      ],
      ideal: 'solana account <PUBKEY> | grep Owner',
      explanation: 'Owner field: 11111... = SOL wallet, Tokenkeg... = token account/ATA. Module 2.1, 2.4.'
    },
    {
      type: 'mcq',
      q: 'Які з цих native programs? (обери всі)',
      options: [
        'System Program (11111...)',
        'Vote Program',
        'SPL Token Program',
        'Stake Program',
        'Memo Program'
      ],
      correct: [0, 1, 3],
      explanation: 'System, Vote, Stake — native (built into validator). SPL Token, Memo — BPF deployed programs. Module 2.2.'
    },
    {
      type: 'explain',
      q: 'Чому Solana розділяє program (executable code) від state (data accounts), на відміну від Ethereum де contract і state в одному account?',
      ideal: 'Ключові причини:\n\n1. Parallelism (Sealevel): TX що touches different data accounts можуть виконуватись паралельно. На Ethereum один contract з shared storage → серiальне виконання неможливо. Solana program one, data many → багато TX можуть hit same program в parallel якщо вони touch різні state accounts.\n\n2. Composability: один program (e.g., SPL Token) може bath бути викликаний для мільйонів token accounts. Не дублюється contract code для кожного instance.\n\n3. Memory efficiency: bytecode програми зберігається ONE раз, незалежно від кількості instances. Ethereum дублює contract code для кожного deployment.\n\n4. Upgrade flexibility: BPF Loader Upgradeable дозволяє редеплой код без зміни всіх state accounts. State migration optional.\n\n5. Explicit TX dependencies: TX must declare list accounts it touches. Runtime scheduler use this для parallel execution.',
      explanation: 'Multi-benefit: parallelism, composability, memory, upgrades. Module 2.2.'
    },
    {
      type: 'command',
      q: 'Як подивитись мінімум lamports для rent-exempt для token account (165 bytes)?',
      accepts: ['solana rent 165', 'solana rent 165 --url mainnet-beta'],
      ideal: 'solana rent 165',
      explanation: 'solana rent <size_bytes>. Для token account ~0.00204 SOL. Module 2.3.'
    },
    {
      type: 'scenario',
      q: 'Ти створюєш stake account з 1 SOL — `solana create-stake-account stake.json 1 --from validator.json`. Validator очікує self-stake мінімум 1.0 SOL. Що піде не так?',
      ideal: 'Створення stake account резервує ~0.00228 SOL для rent reserve. Effective delegated amount = 1.0 - 0.00228 = ~0.99772 SOL, що НИЖЧЕ за required 1.0 SOL minimum.\n\nValidator скаже "stake too low to vote" або similar — voting не активується.\n\nFix: створити з більше SOL. Наприклад:\nsolana create-stake-account stake.json 2 --from validator.json\n\nЦе дасть 2.0 - 0.00228 = ~1.99772 effective stake, well above minimum. Безпечне margin для rent reserve.\n\nЦе саме реально трапилось у тебе 2026-06-02 на Alpenglow — додала ще 1 SOL ПІСЛЯ initial create, after that voting started.',
      explanation: 'Rent reserve deducts from effective stake. Module 2.3.'
    },
    {
      type: 'mcq',
      q: 'Що з цього вірно про ATA (Associated Token Account)? (обери всі)',
      options: [
        'ATA address derives deterministically з (wallet, mint)',
        'Кожна пара (wallet, mint) має тільки одну canonical ATA',
        'ATA може створити anyone (permissionless), платить хто створює',
        'Один wallet pubkey може бути ATA для нескольки tokens'
      ],
      correct: [0, 1, 2],
      explanation: '#1, #2, #3 правильні. #4 НЕПРАВИЛЬНО: wallet pubkey — це SOL wallet, не ATA. ATA — окремий derived address для конкретної пари. Module 2.4.'
    },
    {
      type: 'diagnose',
      q: 'Тобі дали pubkey як кандидат для DoubleZero --rewards-token-owner. Як ти перевіриш чи це правильна валідна цифра (wallet) чи помилка (ATA)?',
      options: [
        'solana account <PUBKEY> і подивитись на Owner: якщо 11111... → wallet OK, якщо Tokenkeg... → ATA, не годиться',
        'solana balance <PUBKEY> — якщо > 0 то wallet',
        'spl-token accounts <PUBKEY>',
        'Тільки якщо є приватний ключ, інакше не можна'
      ],
      correct: [0],
      explanation: 'Owner field — definitive answer. 11111... = SOL wallet (System Program account). Tokenkeg... = ATA/token account (SPL Token Program account). Module 2.4.'
    },
    {
      type: 'command',
      q: 'Як подивитись всі token holdings (token accounts) конкретного wallet?',
      accepts: [
        'spl-token accounts --owner <WALLET>',
        'spl-token accounts --owner <WALLET> --url mainnet-beta'
      ],
      ideal: 'spl-token accounts --owner <WALLET>',
      explanation: 'spl-token accounts --owner показує всі token accounts owned by цей wallet, з token type + balance. Module 2.4.'
    },
    {
      type: 'mcq',
      q: 'Що означає Executable: true у solana account output?',
      options: [
        'Account містить compiled BPF bytecode і може бути викликаний як program',
        'Account може receive incoming transfers',
        'Account create'ний адміністратором cluster',
        'Account є native (built into validator)'
      ],
      correct: [0],
      explanation: 'Executable=true означає це program — data field містить bytecode. False — звичайний state account. Module 2.1, 2.2.'
    },
    {
      type: 'explain',
      q: 'Поясни як PDA derivation працює і чому вони critical.',
      ideal: 'PDA = pubkey derived deterministically з seeds + program_id. Off-curve (no private key exists). Only deriving program може sign through invoke_signed CPI. Critical because: enable program-owned state без trusted key management, foundation для ATAs, Squads vaults, AMM pools. find_program_address loop increments bump seed until off-curve point found. Module 2.5.',
      explanation: ''
    },
    {
      type: 'compare',
      q: 'SPL Token (legacy) vs Token-2022?',
      ideal: 'Legacy SPL Token (TokenkegQ...): original, simple feature set (mint/transfer/burn/freeze). Used by USDC, JTO, JitoSOL.\n\nToken-2022 (TokenzQd...): newer, supports opt-in extensions: transfer fees, confidential transfers, non-transferable, transfer hooks, permanent delegate, etc. Used для RWAs, privacy stablecoins, soul-bound tokens.\n\nNot interchangeable — кожен mint у one program. New tokens increasingly choose 2022. Module 2.6.',
      explanation: ''
    },
    {
      type: 'explain',
      q: 'У чому різниця між native programs і BPF programs щодо upgradeability?',
      ideal: 'Native programs (System, Vote, Stake):\n- Built into agave validator binary\n- Upgrade тільки через cluster-wide coordination: всі validators must agree to upgrade software version (зазвичай через SIMD proposal + governance vote)\n- Жоден individual entity не може unilateral upgrade — це distributed protocol change\n- Upgrade requires socialnetwork consensus + binary rollout\n\nBPF programs (deployed contracts):\n- Deployed by entities (developers, teams)\n- Якщо BPF Loader Upgradeable + upgrade authority set — authority може redeploy new bytecode у одному TX, instant\n- Якщо authority set to None — program immutable forever\n- Trust depends на authority key security\n\nЯкщо authority compromised для critical BPF program (e.g., DEX, lending protocol) — attacker може redeploy malicious code → users lose funds. Це чому SPL Token authority set to None — immutable by design.',
      explanation: 'Native = social coordination, BPF = single TX. Trust model dramatically different. Module 2.2.'
    }
  ]
}
</script>

# ⭐ Module 2 — Final quiz

12 питань. 80%+ → Module 3 (Transactions).

<Quiz :data="quiz" />

---

**Попередньо:** [← 4. Tokens & ATA](/module-2/4-tokens-ata) | **Наступне:** [Module 3: Transactions →](/module-3/)
