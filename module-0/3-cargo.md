<script setup>
const quiz = {
  id: 'm0-3-cargo',
  title: '🧠 Mini-check: Cargo / Rust',
  intro: '3 питання щоб перевірити cargo концепти.',
  questions: [
    {
      type: 'mcq',
      q: 'Що робить флаг --locked у cargo install (обери всі правильні)?',
      options: [
        'Забороняє cargo resolveити dependencies наново, використовує точно версії з Cargo.lock',
        'Гарантує reproducible builds — той самий source + lock дають bit-exact binary',
        'Падає з помилкою якщо Cargo.lock не synced з Cargo.toml',
        'Encrypts the binary з ключем lock-файлу'
      ],
      correct: [0, 1, 2],
      explanation: 'Locked = lock file is authoritative. Cargo читає тільки звідти, не намагається upgradeити deps. Якщо lock не sync з toml — fail. Це і дає reproducibility. Encryption тут ні до чого.'
    },
    {
      type: 'scenario',
      q: 'Ти запускаєш cargo install --locked --path validator --root /home/solana/ag-v0.4.2. Build пройшов через 5 хвилин з помилкою: "error: binary agave-validator already exists in destination". Що робити (опиши 2 варіанти fix)?',
      ideal: 'Варіант 1: додати --force flag (cargo install --locked --force --path validator --root /home/solana/ag-v0.4.2). Це скаже cargo переписати existing binary. Це швидкий fix який і використовується у agave cargo-install-all.sh через sed додавання --force.\n\nВаріант 2: видалити старий binary спочатку (sudo rm /home/solana/ag-v0.4.2/bin/agave-validator), потім перезапустити cargo install. Менш зручно але можна якщо --force з якоїсь причини не підходить.\n\nПричина error: cargo install за замовчуванням refuses overwrite — захист від випадкового перепису.',
      explanation: 'Ключові пункти: знати про --force flag і чому він треба (cargo захищає від overwrite), знати альтернативу (видалити вручну). Якщо ти описала обидва підходи + причину — це повна відповідь.'
    },
    {
      type: 'command',
      q: 'Напиши команду щоб подивитись скільки RAM потрібно agave для build (підказка: вільну RAM).',
      accepts: [
        'free -h',
        'free -m',
        'free',
        'free -g',
        'cat /proc/meminfo'
      ],
      ideal: 'free -h',
      explanation: 'free -h показує memory usage у human-readable форматі (GB/MB). free -m у мегабайтах, free -g у гігабайтах. cat /proc/meminfo дає raw data — теж працює але менш зручно. Для agave потрібно ~16 GB вільної RAM.'
    }
  ]
}
</script>

# 3. Cargo / Rust

## TL;DR

**Rust** — compiled, memory-safe systems language. Solana validator (`agave`), Jito-Solana fork, частково Firedancer — all Rust. **Cargo** — стандартний build tool + package manager Rust. Робить три речі: керує dependencies (через `Cargo.toml`), компілює (`cargo build`), інсталює виконувані binaries (`cargo install`).

Для тебе як operator: знати достатньо щоб **читати** stack traces у логах, **розуміти** що робить `cargo install --locked --force`, і **діагностувати** build failures.

## Чому Rust для Solana

Solana обробляє ~3000 TPS у production, потребує:

- **Швидкість**: C/C++/Rust клас performance
- **Memory safety**: no memory bugs (no segfaults, no use-after-free) бо стейкхолдери довіряють реальні гроші
- **Concurrency**: тисячі потоків обробляють TX одночасно

Rust забезпечує all three: швидкий як C, безпечний без runtime overhead (на відміну від Go з garbage collector), сучасна concurrency.

## Cargo концепти

### Cargo.toml — manifest проєкту

Декларативно описує package + dependencies:

```toml
[package]
name = "agave-validator"
version = "3.0.0"
edition = "2021"

[dependencies]
solana-sdk = "1.18"
tokio = { version = "1.0", features = ["full"] }
```

Аналог `package.json` (npm), `requirements.txt` (pip), `pom.xml` (Maven).

### Cargo.lock — exact snapshot dependencies

Точна snapshot всіх dependencies (включно з транзитивними). Робить builds reproducible:

- **Без lock**: `cargo build` обере **найновіші compatible** версії deps → той самий source може дати різний binary
- **З lock**: `cargo build` використовує **точно ці** версії → bit-exact reproducibility

Для production validator builds **завжди** з `--locked` flag (це говорить cargo: "читай тільки з lock, не намагайся resolve заново"). Інакше можеш отримати binary який trohi відрізняється від того що інші вузли запускають — може спричинити non-determinism.

### `cargo build` vs `cargo install`

Дві різні операції що часто плутають:

| | `cargo build` | `cargo install` |
|---|---|---|
| Що робить | Compile у `target/` директорію поточного repo | Compile **+** копіює binary у persistent installation location |
| Куди пише binary | `target/debug/X` або `target/release/X` | `~/.cargo/bin/X` (default) або `<--root>/bin/X` |
| Default mode | debug | release (так, `cargo install` без флагів автоматично release) |
| Чи треба `sudo` | Ні (пише у repo) | Залежить від destination dir |
| Use case | Development, тестування | Інсталювати CLI tool глобально |

## Cargo install приклади (від простого до складного)

Тепер коли концепти зрозумілі — поглянь як `cargo install` використовується у різних ситуаціях.

### Випадок A — Install з crates.io (найпростіше)

Найтиповіший use case: інсталити чужий tool з public registry.

```bash
cargo install ripgrep
```

Що відбувається:

1. Cargo шукає `ripgrep` на [crates.io](https://crates.io) (public Rust package registry)
2. Скачує source code
3. Compile в режимі release (default)
4. Копіює binary `rg` у `~/.cargo/bin/`
5. Готово — можеш викликати `rg "pattern" .`

Одна команда, без git, без локального source. Підходить коли tool maintained externally.

### Випадок B — Install з local source

Коли source code на твоєму диску (clonований repo, твоя розробка):

```bash
cd ~/my-tool
cargo install --path .                       # . означає "поточна директорія"
```

`--path` каже cargo взяти source з локального шляху замість crates.io.

Або з конкретним --root щоб не у дефолтний `~/.cargo/bin/`:

```bash
cd ~/agave
cargo install --path validator --root ~/agave-build
```

Тут:
- `--path validator` → source code у `~/agave/validator/`
- `--root ~/agave-build` → бінарник напише у `~/agave-build/bin/agave-validator`

### Випадок C — Build (НЕ install) з custom output

Якщо хочеш просто скомпілити без копіювання у destination dir:

```bash
cd ~/agave
cargo build --release --bin agave-validator
```

Результат у `target/release/agave-validator`. Сам копіюєш куди треба:

```bash
sudo cp target/release/agave-validator \
    ~/.local/share/solana/install/active_release/bin/
```

Це pattern для **mainnet/testnet build-from-source** (Module 0.1 Випадок B).

### Випадок D — Agave's cargo-install-all.sh (LumLabs Alpenglow)

Найскладніший випадок. Agave repo має скрипт що інсталить ВСІ binaries (validator, keygen, cli, ledger-tool, ...) у одну destination dir:

```bash
cd /home/devops_ssh/agave
sed -i 's/install --locked/install --locked --force/g' \
    scripts/cargo-install-all.sh
CI_COMMIT=$(git rev-parse HEAD) scripts/cargo-install-all.sh \
    /home/solana/ag-v0.4.2
```

Що цей скрипт робить всередині (спрощено):

```bash
#!/usr/bin/env bash
install_dir="$1"   # перший аргумент = куди інсталити
cargo install --locked --path validator --root "$install_dir"
cargo install --locked --path keygen --root "$install_dir"
cargo install --locked --path cli --root "$install_dir"
cargo install --locked --path ledger-tool --root "$install_dir"
# ... ще 5-6 binaries
```

Тобто він запускає `cargo install` для кожного binary окремо, кожен раз у `$install_dir/bin/`.

Чому потрібен `sed --force` patch:

- На **першому** build все ок — destination dir порожня, cargo install пише туди
- На **повторному** build (наступна версія) cargo install бачить existing binary і **відмовляється** перепис (захист від випадкового overwrite)
- Без `--force` другий build падає з `error: binary X already exists in destination`
- `sed` додає `--force` до кожного `cargo install` у скрипті → дозволяє overwrite

## Cargo flags які зустрічаються у твоїх commands

**`--release`**: optimization on, debug symbols off, slower compile, fast runtime. Завжди для prod. Note: `cargo install` робить release **за замовчуванням**, `cargo build` потребує явного `--release`.

**`--locked`**: read Cargo.lock as-is, error out if lock не synced з Cargo.toml. Для reproducible builds.

**`--force`**: overwrite existing installation. Без цього `cargo install` відмовиться інсталити якщо вже є binary з тим самим іменем у target dir.

**`--bin BINARY`**: build/install тільки конкретний binary (з workspace може бути кілька).

**`--root PATH`**: куди інсталювати замість дефолту (`~/.cargo/bin/`).

**`--path PATH`**: де знаходиться source (інакше — з crates.io).

## CARGO_INSTALL_ROOT environment variable

Альтернатива до `--root` flag. Якщо встановлено — cargo install інсталює сюди:

```bash
export CARGO_INSTALL_ROOT=/home/solana/ag-v0.4.2
cargo install --locked --path validator
```

Аналогічно до `cargo install --root /home/solana/ag-v0.4.2 ...`. Корисно коли скриптуєш кілька `cargo install` підряд у те саме місце — не повторюєш `--root` кожен раз.

## target/ directory structure

Після `cargo build` у repo з'являється `target/`:

```
target/
├── debug/                    # debug builds (cargo build без --release)
│   ├── agave-validator       # binary
│   ├── deps/                 # compiled deps
│   └── build/
├── release/                  # release builds (--release)
│   ├── agave-validator
│   └── deps/
└── .rustc_info.json          # internal cache
```

`target/` може важити **10+ GB** після build всього agave (бо ~600 dependencies × debug+release × incremental cache). Можна видалити (`cargo clean`) — наступний build перебудує з нуля (повільно).

## Чому build падає (топ-7 причин)

1. **OOM** — `error: linker killed` або `signal 9`. Linker потребує ~16 GB вільної RAM. Без swap = kill -9. Fix: додай swap або більше RAM.
2. **Disk full** — `error: No space left on device`. `target/` накопичує 10+ GB. `cargo clean` або більше диску.
3. **Network timeout** — `error: failed to fetch from crates.io`. Перевір internet, чи не blocked firewall'ом.
4. **Compiler error** — `error[E0xxx]: ...`. На release tag (v2.1.0, ag-v0.4.2) дуже рідко (Anza тестує перед push). Частіше якщо ти на feature branch.
5. **Cargo.lock mismatch з `--locked`** — `error: the lock file ... needs to be updated`. Хтось апдейтнув Cargo.toml без regenerate lock. Або не використовуй `--locked`, або updateни lock (`cargo update`).
6. **Duplicate `--force` flag** — `error: the argument '--force' cannot be used multiple times`. Trap для agave's `cargo-install-all.sh`: некоторі lines (spl-token-cli) ВЖЕ мають `--force`. Naïve sed `s/install --locked/install --locked --force/g` додає **другий** `--force` → break. Fix: smart sed `sed -i '/--force/!s/install --locked/install --locked --force/g'` (skip lines that already have --force).
7. **Cargo cache hit (silent fail)** — script returns success але binary не оновлюється. Symptom: `cargo build` output `Finished in 0.3s` (нічого не компілив) + binary version unchanged. Cargo decided existing artifacts up-to-date. **Fix**: `cargo clean` before build forces fresh full rebuild (~25-30 хв).

## Hands-on exercise

На будь-якому сервері з cargo:

```bash
# Версія cargo + rust
cargo --version
rustc --version
```

На твоєму сервері з clone agave:

```bash
# Подивись на workspace root Cargo.toml
sudo head -40 /home/devops_ssh/agave/Cargo.toml

# Скільки dependencies у Cargo.lock?
sudo grep -c '^name = ' /home/devops_ssh/agave/Cargo.lock
# Очікувано: ~600

# Подивись на target/ розмір
sudo du -sh /home/devops_ssh/agave/target/

# Подивись на cargo install скрипт agave (перші 50 рядків)
sudo head -50 /home/devops_ssh/agave/scripts/cargo-install-all.sh
```

На ноутбуці (якщо є rust):

```bash
# Спробуй install чогось простого з crates.io
cargo install --version 14.1.0 ripgrep
# Це створить ~/.cargo/bin/rg яким можеш користуватись
rg --version
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Cargo`](/glossary#c), [`Cargo.toml`](/glossary#c), [`Cargo.lock`](/glossary#c), `--locked flag`, `--release flag`, `--force flag`, `cargo build`, `cargo install`, `crates.io`, `CARGO_INSTALL_ROOT`

## External refs

- [The Rust Book](https://doc.rust-lang.org/book/) — official intro, читай chapter 1
- [The Cargo Book](https://doc.rust-lang.org/cargo/) — cargo reference
- [Cargo.toml format reference](https://doc.rust-lang.org/cargo/reference/manifest.html) — manifest spec
- [crates.io](https://crates.io) — public Rust package registry

---

**Попередньо:** [← 2. Git](/module-0/2-git) | **Наступне:** [4. Linux processes & daemons →](/module-0/4-processes)
