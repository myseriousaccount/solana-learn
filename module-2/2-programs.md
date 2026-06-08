<script setup>
const quiz = {
  id: 'm2-2-programs',
  title: '🧠 Mini-check: Programs as accounts',
  intro: '3 питання — programs vs data accounts.',
  questions: [
    {
      type: 'compare',
      q: 'У чому різниця між native programs і BPF programs (deployed contracts)?',
      ideal: 'Native programs:\n- Built into validator binary (написані у Rust як частина agave codebase)\n- Implement system-level operations: System Program (account creation, SOL transfers), Vote Program, Stake Program\n- Не можна upgrade без updating agave validator software\n- Owner: Native Loader\n\nBPF programs:\n- Deployed by users як bytecode (compiled з Rust/C/Anchor)\n- Загружені на chain як account data\n- Можна upgrade if upgrade authority set (BPF Loader Upgradeable)\n- Owner: BPF Loader або BPF Loader Upgradeable\n- Приклади: SPL Token, Metaplex, Anchor-based smart contracts\n\nКлючова різниця: native = частина validator, BPF = uploaded user code. Native trusted at protocol level, BPF runs in sandboxed VM (BPF VM).',
      explanation: 'Native vs BPF — fundamental distinction. Native = baked into validator, BPF = deployed user code. Якщо описала this + один-два specific examples — повна відповідь.'
    },
    {
      type: 'mcq',
      q: 'Що з цього є native programs на Solana? (обери всі правильні)',
      options: [
        'System Program (11111...)',
        'Vote Program (Vote111...)',
        'SPL Token Program (TokenkegQ...)',
        'Stake Program (Stake111...)'
      ],
      correct: [0, 1, 3],
      explanation: 'System, Vote, Stake — native (built into validator). SPL Token — BPF program (deployed code, although core ecosystem). Module 2.2.'
    },
    {
      type: 'command',
      q: 'Як перевірити чи певний account є executable program? Напиши команду + який field показує result.',
      accepts: [
        'solana account <PUBKEY> | grep -i executable',
        'solana account TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA | grep -i executable',
        'solana account <PUBKEY> | grep Executable'
      ],
      ideal: 'solana account <PUBKEY> | grep -i executable',
      explanation: 'solana account виводить Executable: true/false поле. true = program (можна викликати з TX), false = data account. Module 2.2.'
    }
  ]
}
</script>

# 2. Programs as accounts

## TL;DR

На Solana **програми (smart contracts) це теж accounts** — з `executable=true` flag і compiled BPF bytecode у `data` поле. Два типи: **native programs** (System, Vote, Stake — built into validator) і **BPF programs** (deployed user code — SPL Token, Anchor contracts).

Програма **не зберігає state** сама — state живе у **окремих** data accounts які owned by program. Це fundamental архітектурна різниця з Ethereum (де contract і state в одному account).

## Концепти

### Programs as executable accounts

Згадай з Module 2.1: account має `executable: bool` flag. Якщо `true` — це **program**, `data` поле містить compiled BPF bytecode.

```bash
solana account TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
```

Output:

```
Public Key: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
Balance: 0.00114144 SOL
Owner: BPFLoaderUpgradeab1e11111111111111111111111
Executable: true
Length: 134080 (0x20b00) bytes
```

`Executable: true` — це program. `Length: 134080` — 134KB bytecode. `Owner: BPFLoaderUpgradeable` — loader що manage цей deployed program.

### Programs don't hold state

Critical Solana design choice: **program і data розділені**.

На Ethereum:
- Smart contract account містить **і** code, **і** state (storage)
- Contract methods modify own storage

На Solana:
- Program account містить тільки **code**
- State зберігається у **окремих** data accounts які `owner=program`
- Program methods викликаються з TX, який передає список data accounts які модифікувати

Приклад — SPL Token Program:

```
Token Program (TokenkegQ...): executable=true, data=bytecode
   ↓ owns
Token account #1 (HKLm...): executable=false, data=[mint, owner, amount, ...]
Token account #2 (BPMo...): executable=false, data=[mint, owner, amount, ...]
Token account #3 (Xyzz...): executable=false, data=[mint, owner, amount, ...]
```

Token Program код — один. Token accounts — мільйони. Кожен token holding — окремий account owned by Token Program.

Переваги цього design:

- **Parallelism**: TX що touches different accounts можуть виконуватись паралельно (Solana's Sealevel)
- **Composability**: один program може bath бути викликаний для багатьох accounts
- **Memory efficiency**: код одного program не дублюється для кожного instance

## Two types of programs

### Native programs

**Native programs** написані як частина agave validator codebase (Rust). Включені у validator binary.

Список native programs (mainnet):

| Program | Pubkey | Що робить |
|---|---|---|
| System Program | `11111111111111111111111111111111` | Account creation, SOL transfers, allocate space |
| Vote Program | `Vote111111111111111111111111111111111111111` | Validator voting |
| Stake Program | `Stake11111111111111111111111111111111111111` | Stake delegations |
| BPF Loader | `BPFLoader2111111111111111111111111111111111` | Deploy + run BPF programs (legacy) |
| BPF Loader Upgradeable | `BPFLoaderUpgradeab1e11111111111111111111111` | Deploy + upgrade BPF programs (current) |
| Config Program | `Config1111111111111111111111111111111111111` | Validator info storage |
| Address Lookup Table | `AddressLookupTab1e1111111111111111111111111` | Compress TX address lists |

Native programs:

- Не можна upgrade без updating validator software (узгоджена upgrade через governance/SIMD)
- Trusted at protocol level — їх execution не runs у sandboxed VM, native Rust code
- Зазвичай низькорівневі — system operations (create account, transfer SOL, mint vote)

### BPF programs (deployed contracts)

**BPF programs** — це user-deployed code, compiled у BPF bytecode і uploaded як account data.

Workflow:

1. Розробник пише Rust (зазвичай через Anchor framework)
2. Compile у BPF bytecode (`cargo build-sbf` або `anchor build`)
3. Deploy on-chain: `solana program deploy mycode.so` — створює новий account з `executable=true`, owner=BPF Loader Upgradeable
4. Анхайр пробує — TX викликає program, передає accounts і input data
5. BPF VM (всередині validator) виконує bytecode у sandbox

Приклади ecosystem-critical BPF programs:

| Program | Що робить |
|---|---|
| SPL Token (`TokenkegQ...`) | Fungible tokens |
| Token 2022 (`TokenzQdBNbLqP...`) | Updated token standard з extensions |
| Metaplex Token Metadata (`metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`) | NFT metadata |
| Memo Program (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`) | Just stores arbitrary memo у TX |
| Jupiter Aggregator | DEX aggregator |
| Squads Multisig | Multisig wallet |

### Чому розрізнення matter

| Аспект | Native | BPF |
|---|---|---|
| Швидкість виконання | Найвища (native Rust code) | Швидко (BPF VM optimized) |
| Audit surface | Перевіряється Anza у release | Deploy чий захоче |
| Upgrade процедура | Coordinated cluster upgrade | Single TX (якщо authority має ключ) |
| Risk | Низький (battle-tested) | Залежить від code quality |
| Cost | Безкоштовно (built into validator) | Pay rent для programu account |

Як operator — ти interactиш з native (System для transfers, Stake для delegations, Vote через validator) і trusted BPF (SPL Token для tokens, occasional ecosystem programs).

## BPF Loader Upgradeable

Currentmost system для BPF programs. Дозволяє upgrade'ити deployed program без редеплою з new pubkey.

Архітектура:

```
ProgramData account (Yzz...)
   └─ data: actual bytecode + upgrade authority
        ↑
Program account (Tkn...): executable=true
   └─ data: pointer to ProgramData
```

Дві accounts:
1. **Program account** (executable=true) — те що ти викликаєш у TX
2. **ProgramData account** — actual bytecode + upgrade authority pubkey

Upgrade authority може redeploy new bytecode у ProgramData → next TX уже виконує новий code.

Перевірити upgrade authority:

```bash
solana program show TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
```

Виведе:

```
Program Id: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: 6mGV1...
Upgrade Authority: None
```

`Upgrade Authority: None` — program immutable (нікому не можна upgrade). Це best practice для core programs — SPL Token authority set to None means safety: ніхто не може redeploy malicious code.

## Connect to your work

### Vote Program — це native, owned vote accounts

Твій vote account `3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo` має owner = Vote Program (`Vote111...`).

Тільки Vote Program може write у data поле твого vote account — записувати votes, оновлювати credits. Це security: ніяка інша program не може injectivote.

### Stake Program

Кожна твоя stake delegation — це окремий stake account з owner = Stake Program. Stake Program обчислює rewards, активує/деактивує stake.

### BPF programs — DoubleZero, BAM

DoubleZero shred publisher rewards system — це BPF program. Ти interactiз ним через його CLI tool (`doublezero-solana`), який під капотом будує TX що викликає DZ programa.

## Hands-on exercise

```bash
# Native program: System
sudo /home/solana/ag/bin/solana account 11111111111111111111111111111111 --url http://localhost:8899

# BPF program: SPL Token (mainnet)
solana account TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA --url mainnet-beta
solana program show TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA --url mainnet-beta

# Vote Program
sudo /home/solana/ag/bin/solana account Vote111111111111111111111111111111111111111 --url http://localhost:8899

# Stake Program
sudo /home/solana/ag/bin/solana account Stake11111111111111111111111111111111111111 --url http://localhost:8899

# Твій vote account — owned by Vote Program
sudo /home/solana/ag/bin/solana account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899
# Verify: Owner = Vote111... з вищенаписаного запиту
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Native program`](/glossary#n), [`BPF program`](/glossary#b), [`BPF Loader`](/glossary#b), [`Program ID`](/glossary#p), [`Upgrade authority`](/glossary#u), [`Bytecode`](/glossary#b), [`Sealevel`](/glossary#s)

## External refs

- [Anza: Programs Overview](https://docs.anza.xyz/runtime/programs)
- [Anchor Framework](https://www.anchor-lang.com/) — most popular Rust framework для Solana smart contracts
- [SPL Token docs](https://spl.solana.com/token)

---

**Попередньо:** [← 1. Account basics](/module-2/1-account-basics) | **Наступне:** [3. Rent and rent-exempt →](/module-2/3-rent)
