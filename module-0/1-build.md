<script setup>
const quiz = {
  id: 'm0-1-build',
  title: '🧠 Mini-check: Build process',
  intro: '3 питання щоб перевірити чи зрозуміла основні концепти.',
  questions: [
    {
      type: 'mcq',
      q: 'Чому ми завжди використовуємо --release для validator builds (обери всі правильні)?',
      options: [
        'Debug build повільніше у 10-100 разів і не витримає mainnet TPS',
        'Release build має менший розмір binary',
        'Debug build містить sensitive debug symbols які небезпечно деплоїти',
        'Cargo install не приймає debug builds'
      ],
      correct: [0, 1],
      explanation: 'Головна причина — performance. Release робить LTO + inlining, дає 10-100x швидше runtime. Розмір теж менший без debug symbols. Debug symbols самі по собі не secret. Cargo install приймає debug, просто це поганий вибір для prod.'
    },
    {
      type: 'explain',
      q: 'Поясни своїми словами що робить linker і чому без linking не вийде запустити binary.',
      ideal: 'Linker з\'єднує object files (результат compile окремих файлів source code) і бібліотеки (готовий код типу libc, tokio, solana-sdk) в один виконуваний binary. Аналогія: compile = вирізав дошки і фурнітуру за кресленням, link = з\'єднав їх у готову конструкцію. Без linking у тебе тільки купа .o файлів — CPU не вміє виконувати окремі object files, потрібен один self-contained executable з усіма symbols (функціями, даними) resolved.',
      explanation: 'Ключове: linker з\'єднує object files + libraries в один binary. Якщо ти описала що окремо compile робить object files а link їх з\'єднує — це 80%+. Bonus якщо згадала про resolved symbols (функції з deps мають бути знайдені перш ніж binary запускається).'
    },
    {
      type: 'command',
      q: 'Як подивитись чи binary це ELF executable і яка архітектура? Напиши команду (припустимо binary на стандартному mainnet шляху).',
      accepts: [
        'file ~/.local/share/solana/install/active_release/bin/agave-validator',
        'sudo file ~/.local/share/solana/install/active_release/bin/agave-validator',
        'file /home/solana/.local/share/solana/install/active_release/bin/agave-validator',
        'sudo file /home/solana/.local/share/solana/install/active_release/bin/agave-validator'
      ],
      ideal: 'file ~/.local/share/solana/install/active_release/bin/agave-validator',
      explanation: 'Команда file читає ELF header і показує що це за binary: 64-bit, архітектура (x86_64/arm64), статично чи динамічно слінкований, OS. На mainnet/testnet agave-install кладе binaries у ~/.local/share/solana/install/active_release/bin/.'
    }
  ]
}
</script>

# 1. Build process

## TL;DR

**Source code** (Rust/C/тощо) — це текст, написаний людиною. CPU не вміє виконувати текст. **Compiler** перетворює текст у **binary** — послідовність машинних інструкцій. **Linker** з'єднує compile'нуті частини в один self-contained executable. Цей весь процес називається **build**.

Для Solana ти білдиш agave з Rust → отримуєш binaries типу `agave-validator`, `solana`, `solana-keygen`. На mainnet/testnet більшість операторів використовують `agave-install` (one-command upgrade). Build from source — тільки коли треба специфічний tag/patch.

## Концепти

### Source code

Plain text програми на високорівневій мові (Rust, C, Python). Можна відкрити будь-яким редактором. Приклад: `validator/src/main.rs` у agave repo — entrypoint валідатора в Rust.

CPU **не виконує** текст напряму. Текст треба перетворити у машинні інструкції.

### Compiler

Перекладач з людської мови (Rust, C) у машинну мову (CPU instructions, специфічні для архітектури типу x86_64 або arm64).

Процес перекладу — багатоступеневий:

1. **Parsing**: читає текст, будує AST (abstract syntax tree, деревовидну структуру програми)
2. **Type checking**: перевіряє що типи сходяться (Rust особливо суворий)
3. **Optimization**: переписує код щоб виконувався швидше (inline функцій, dead code elimination)
4. **Code generation**: генерує object files — це проміжний binary формат, не виконується напряму

Object file = "напівфабрикат". Має machine code твоєї функції, але **не знає де лежать функції які вона викликає** з бібліотек.

### Linker

Тепер ключове що ти просила пояснити: **linker з'єднує object files + бібліотеки у фінальний executable**.

**Аналогія IKEA-меблів:**

| Етап | Що робить | Результат |
|---|---|---|
| **Compile** | Вирізає дошки і фурнітуру за кресленням | Купа дошок (object files) |
| **Link** | Гвинтами з'єднує дошки + ставить готові handles, hinges (бібліотеки) | Готовий стіл (executable binary) |

У термінах коду:

- Compile: `validator/src/main.rs` → `main.o` (object file з machine code для функцій у main.rs)
- Link: `main.o` + `tokio.o` + `solana_sdk.o` + ... + `libc.so` → `agave-validator` (один self-contained binary)

Без linking у тебе тільки купа `.o` файлів. CPU **не вміє** виконувати окремі object files — він потребує **один** executable де всі `call function_X` resolveдо адрес фактичних функцій (це і робить linker).

### Чому agave має ~600 dependencies

Validator виконує багато різних задач, кожна потребує спеціалізованих бібліотек:

| Задача | Приклади бібліотек |
|---|---|
| P2P networking | tokio, libp2p, quinn (QUIC) |
| Crypto | ed25519-dalek, sha2, blake3 |
| Storage | rocksdb, sled |
| Async runtime | tokio, futures |
| JSON RPC server | jsonrpc-core, hyper |
| Serialization | serde, bincode |
| Solana primitives | solana-sdk, solana-runtime, solana-vote |
| Monitoring | prometheus, tracing |
| ... | ... |

Кожна бібліотека сама має sub-dependencies (наприклад tokio залежить від ~30 дрібніших crates). Сума з усіма транзитивними deps: ~600 entries у `Cargo.lock`.

Це чому agave build займає **25-30 хв** — треба скомпілити 600+ окремих crates перш ніж linker їх з'єднає.

## Static vs dynamic linking

Тепер коли ти зрозуміла **що** робить linker, два варіанти **як** він з'єднує бібліотеки:

| | Static linking | Dynamic linking |
|---|---|---|
| Що робить | Вклеює код бібліотеки **всередину** binary | Залишає посилання на `.so` файли (shared objects) |
| Розмір binary | Великий | Малий |
| Залежність від системи | Самодостатній — можна копіювати куди завгодно | Потребує тих самих `.so` на target |
| Аналогія | IKEA-стіл з вже прикрученими handles | Стіл де handles треба купити окремо |

Rust default — переважно static (з винятками типу `libc` яка завжди dynamic). Тому `agave-validator` можна скопіювати з одного Ubuntu сервера на інший — буде працювати.

Перевірити чи binary statically/dynamically linked:

```bash
file ~/.local/share/solana/install/active_release/bin/agave-validator
```

Вивід типу `ELF 64-bit LSB executable, x86-64, ... dynamically linked` — значить є деякі dynamic deps (зазвичай libc).

## Debug vs Release builds

Це **критична** різниця для validator ops:

| | Debug | Release |
|---|---|---|
| Команда | `cargo build` | `cargo build --release` |
| Optimization | Мінімальна | Максимальна (LTO, inlining) |
| Debug symbols | Так (можна attach debugger) | Ні (можливо є line numbers) |
| Build time | Швидко (~хвилини) | Повільно (~25-30 хв для agave) |
| Runtime speed | 10-100x повільніше | Production-fast |
| Binary size | Великий | Менший |
| Куди пише | `target/debug/` | `target/release/` |
| Для чого | Дебагінг розробником | Production deployment |

**Правило:** для validator завжди release. Debug build не витримає mainnet TPS — нода буде delinquent.

## Validator build приклади (від простого до складного)

Тепер коли ти зрозуміла **що відбувається** у build — поглянь на реальні приклади того, як це виглядає у різних кластерах.

### Випадок A — Standard mainnet/testnet з agave-install

Це **найпоширеніший** сценарій. `agave-install` — офіційний tool Anza, скачує **prebuilt binaries** з GitHub releases.

```bash
agave-install update
```

Одна команда. Усе. Під капотом:
1. Перевіряє чи є нова версія
2. Скачує `agave-release-<version>-x86_64-unknown-linux-gnu.tar.bz2` з GitHub
3. Розпаковує у `~/.local/share/solana/install/releases/<version>/`
4. Перенаправляє symlink `~/.local/share/solana/install/active_release` на нову версію

Тут **жодного компіляції** — binaries вже зібрані Anza CI на їх серверах. Switch + restart, готово.

### Випадок B — Build from source на mainnet/testnet

Коли треба специфічний commit, patch або release якого ще нема у `agave-install`:

```bash
cd ~/agave                                              # clone agave repo
git checkout v2.1.0                                     # specific tag
cargo build --release --bin agave-validator             # build тільки validator binary
sudo cp target/release/agave-validator \
    ~/.local/share/solana/install/active_release/bin/   # copy у agave-install location
sudo systemctl restart solana                           # restart service
```

Розбираю по рядках:

| Рядок | Що робить | Чому |
|---|---|---|
| `cd ~/agave` | Перейти в clone repo | Тут source code agave |
| `git checkout v2.1.0` | Переключитись на цей tag | Версія яку хочеш зібрати |
| `cargo build --release --bin agave-validator` | Compile + link тільки validator | --release для prod-quality, --bin для тільки одного binary (інакше build всіх ~10 утиліт) |
| `sudo cp target/release/...` | Copy свіже binary поверх старого | agave-install layout, validator знаходить тут |
| `sudo systemctl restart solana` | Перезапустити service з новим binary | Старий process досі тримає старе binary через відкритий file handle |

Тут на відміну від випадку A є **локальний compile** (25-30 хв). Решта така ж: одна destination директорія, agave-install symlinks.

### Випадок C — Alpenglow community cluster (LumLabs setup)

Це **найскладніший** випадок і той з яким ти працюєш на WNX0016778. Чому складніше:

1. **Немає `agave-install`** для Alpenglow — це research cluster без офіційного installer
2. **Немає prebuilt binaries** — компілити з source обов'язково
3. **LumLabs використовує versioned dirs** для instant rollback — кожна версія у своїй папці `/home/solana/ag-vX.Y.Z/`, symlink `/home/solana/ag` вказує на активну
4. **Два юзери на сервері** — `devops_ssh` (твій SSH login + build) і `solana` (run-time для validator). Треба chown туди-сюди

Тому build процес:

```bash
sudo mkdir -p /home/solana/ag-v0.4.2/bin                              # 1
sudo chown -R devops_ssh:devops_ssh /home/solana/ag-v0.4.2            # 2
cd /home/devops_ssh/agave                                             # 3
git fetch --tags                                                      # 4
git checkout ag-v0.4.2                                                # 5
sed -i 's/install --locked/install --locked --force/g' \
    scripts/cargo-install-all.sh                                      # 6
tmux new -s build                                                     # 7
CI_COMMIT=$(git rev-parse HEAD) scripts/cargo-install-all.sh \
    /home/solana/ag-v0.4.2                                            # 8
sudo cp -v /home/devops_ssh/agave/bin/* /home/solana/ag-v0.4.2/bin/   # 9
sudo chown -R solana:solana /home/solana/ag-v0.4.2                    # 10
```

Розбираю КОЖНУ команду:

| # | Команда | Що робить | Навіщо |
|---|---|---|---|
| 1 | `sudo mkdir -p /home/solana/ag-v0.4.2/bin` | Створити версіонований dir одразу з `/bin` підпапкою | sudo бо `/home/solana/` належить юзеру `solana`. `-p` створює intermediate dirs. `/bin` одразу щоб Phase 3 `cp` не падало |
| 2 | `sudo chown -R devops_ssh:devops_ssh /home/solana/ag-v0.4.2` | Тимчасово дати ownership твоєму юзеру | Build script тебе як `devops_ssh` пише сюди, без ownership не може. `-R` recursive |
| 3 | `cd /home/devops_ssh/agave` | Перейти в git clone agave | Тут source code |
| 4 | `git fetch --tags` | Скачати нові tags з GitHub | Без цього `git checkout ag-v0.4.2` не знайде новий тег якщо тебе клонували до його release |
| 5 | `git checkout ag-v0.4.2` | Переключити working tree на цей tag | Source code тепер відображає стан на момент release |
| 6 | `sed -i ... --force` | Patch build script — додати `--force` до `cargo install` | Без `--force` cargo не overwrite existing binary з попереднього build → fail |
| 7 | `tmux new -s build` | Запустити tmux session "build" | Build 25-30 хв. Якщо втратиш SSH connection — без tmux все скасується. У tmux — продовжується, reattach потім через `tmux attach -t build` |
| 8 | `CI_COMMIT=...  scripts/cargo-install-all.sh /home/solana/ag-v0.4.2` | Сам build | `CI_COMMIT=$(...)` встановлює env var з commit hash, скрипт включить його у binary version metadata. `$(...)` — command substitution: виконати команду і вставити результат. Аргумент скрипта = куди інсталити |
| 9 | `sudo cp -v /home/devops_ssh/agave/bin/* /home/solana/ag-v0.4.2/bin/` | Copy свіжі binaries з repo у target dir | Quirk цього agave fork: build пише binaries в `/home/devops_ssh/agave/bin/` (всередині repo) НЕЗАЛЕЖНО від аргументу скрипту. `-v` verbose показує що копіюється |
| 10 | `sudo chown -R solana:solana /home/solana/ag-v0.4.2` | Повернути ownership солані | Validator service запускається під юзером `solana`. Без owned binaries — не зможе exec |

Підсумок: 10 команд бо комбінація **no-installer-cluster** × **versioned-dirs-for-rollback** × **two-user-setup**. У типовому mainnet/testnet було б 1 команда (`agave-install update`) або 5 (build from source).

## Чому build падає (топ-5)

1. **OOM** — `error: linker killed` або `signal 9`. Linker потребує ~16 GB вільної RAM щоб з'єднати всі object files. Без swap — kill -9. Fix: додай swap або більше RAM.
2. **Disk full** — `error: No space left on device`. `target/` накопичує 10+ GB. `cargo clean` або більше диску.
3. **Network timeout** — `error: failed to fetch from crates.io`. Cargo тягне deps з мережі під час першого build.
4. **Compiler error** — `error[E0xxx]: ...`. На release tag дуже рідко (Anza тестує перед push). Частіше якщо ти на feature branch.
5. **Cargo.lock mismatch** — `error: the lock file ... needs to be updated`. Хтось апдейтнув Cargo.toml без regenerate lock. Або не використовуй `--locked`, або updateни lock.

## Hands-on exercise

На будь-якому твоєму сервері (read-only):

```bash
# Подивись скільки RAM (нагадування: для build потрібно ~16 GB)
free -h

# Подивись розмір final binary на mainnet (typical agave-install path)
ls -lh ~/.local/share/solana/install/active_release/bin/agave-validator 2>/dev/null

# Або на Alpenglow (LumLabs custom layout)
sudo ls -lh /home/solana/ag/bin/agave-validator

# Подивись що binary це ELF + статично/динамічно
sudo file /home/solana/ag/bin/agave-validator

# Скільки місця займає agave repo з target/
sudo du -sh /home/devops_ssh/agave/target/ 2>/dev/null

# Подивись скільки dependencies у agave (counts entries in Cargo.lock)
sudo grep -c '^name = ' /home/devops_ssh/agave/Cargo.lock
```

Очікувані відповіді:
- RAM → 32+ GB (потрібно ~16 GB вільної для linker)
- Binary size → 60-80 MB
- `file` → `ELF 64-bit LSB executable, x86-64, ... dynamically linked`
- `target/` → 8-15 GB
- Dependencies → ~600

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Source code`](/glossary#s), [`Compiler`](/glossary#c), [`Binary`](/glossary#b), [`Linker`](/glossary#l), [`Object file`](/glossary#o), [`Static linking`](/glossary#s), [`Dynamic linking`](/glossary#d), [`Debug build`](/glossary#d), [`Release build`](/glossary#r), [`target/ directory`](/glossary#t)

## External refs

- [Rust Book → Building and Running](https://doc.rust-lang.org/book/ch01-03-hello-cargo.html) — official Rust intro
- [Cargo Book → Build cache](https://doc.rust-lang.org/cargo/guide/build-cache.html) — як працює `target/`
- [Agave Install docs](https://docs.anza.xyz/cli/install-solana-cli-tools#use-solanas-install-tool) — standard installer для mainnet/testnet

---

**Наступне:** [2. Git →](/module-0/2-git)
