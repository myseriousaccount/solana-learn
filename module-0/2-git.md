<script setup>
const quiz = {
  id: 'm0-2-git',
  title: '🧠 Mini-check: Git',
  intro: '3 питання — фокус на тому що ти реально робиш у workflow.',
  questions: [
    {
      type: 'diagnose',
      q: 'Ти бачиш error: "Your local changes to the following files would be overwritten by checkout". Які з цих причин могли його спричинити (обери всі)?',
      options: [
        'Ти раніше робила sed на файлі і не закоммітила',
        'Хтось інший push нув зміни у віддалений repo',
        'Файл у target branch/tag відрізняється від файлу що ти змінила',
        'Working tree має staged changes що конфліктують з target'
      ],
      correct: [0, 2, 3],
      explanation: 'Помилка про ЛОКАЛЬНІ зміни — git не дозволить overwrite їх checkout-ом. Триггер: твоя локальна зміна + різний файл у target. Чужі push у remote не впливають поки ти не зробиш pull. Staged changes теж блокують якщо вони конфліктують.'
    },
    {
      type: 'command',
      q: 'Як відкинути локальні зміни в одному файлі (наприклад config.toml)? Напиши команду.',
      accepts: [
        'git checkout -- config.toml',
        'git restore config.toml',
        'git checkout config.toml'
      ],
      ideal: 'git checkout -- config.toml',
      explanation: 'git checkout -- <file> класичний синтаксис, працює усюди. Сучасний еквівалент: git restore <file>. Без -- може бути ambiguous якщо branch має таке ж імя як файл (рідкісно але буває).'
    },
    {
      type: 'compare',
      q: 'У чому різниця між branch і tag у git? Перерахуй 2-3 ключові пункти.',
      ideal: '1. Branch рухається з новими commits (вказівник просувається), tag immutable (привязаний до конкретного commit назавжди).\n2. Branch для активної розробки (новий код), tag для releases (snapshot готової версії).\n3. Checkout на branch стає на її tip і можеш робити commits. Checkout на tag стає detached HEAD, commits будуть orphaned.\n4. Branch можна швидко створити/видалити локально. Tag зазвичай створюють і пушать у remote як публічний marker.',
      explanation: 'Ключове — mutability (branch рухається, tag ні) і призначення (розробка vs release). Якщо ти описала ці два пункти — це 80%+ правильне розуміння. Detached HEAD як deeper concept — bonus.'
    }
  ]
}
</script>

# 2. Git

## TL;DR

**Git** — distributed version control system. Кожен commit це **snapshot** всього репозиторію в конкретний момент часу, з посиланням на parent commit. Git трекає historical changes, дозволяє переключатись між версіями (`checkout`), зберігати тимчасові зміни (`stash`), синхронізувати з remote (`fetch`/`pull`/`push`).

Для validator ops git це: спосіб дістати конкретну версію source code (`git checkout v2.1.0`), перевірити які зміни введені (`git log`, `git diff`), і backout локальних експериментів (`git checkout -- FILE`). Більшість mainnet операторів **не торкаються git** у щоденній роботі — `agave-install` робить все. Git стає потрібним коли треба build from source.

## Концепти

### Repository (repo)

Директорія яка містить:

- **Working tree**: твої файли як ти їх бачиш у `ls`
- **Index (staging area)**: куди йдуть зміни перед commit
- **`.git/` directory**: вся історія commits + metadata (прихована)

Приклад: будь-який клонований агейв (`~/agave` на mainnet validator або `/home/devops_ssh/agave` на твоєму Alpenglow сервері) — це git repo. Якщо зробиш `ls -la` побачиш приховану `.git/` папку.

### Commit

Snapshot стану файлів на момент часу. Має:

- **SHA-1 hash** (40 hex chars, відображається 7-знаковий short): `a3f9c12` → unique identifier
- **Parent commit**: посилання на попередній snapshot
- **Message**: пояснення що змінилось
- **Author**: хто і коли

Commits утворюють ланцюжок: кожен новий commit має parent. **DAG** (directed acyclic graph) — це формальна назва структури: ланцюжки + гілки + злиття (merges) утворюють дерево-граф з напрямком (від нащадків до предків) і без циклів. Простими словами — дерево історії змін.

ASCII-візуалізація простого history:

```
A ← B ← C ← D   (main branch)
        ↖
         E ← F  (feature branch що відгалузилась від C)
```

### Branch

Рухомий покажчик на commit. Branch `main` зазвичай вказує на tip головної лінії розробки. Коли робиш новий commit на `main`, branch автоматично "просувається" на новий commit.

```
A ← B ← C ← D
            ↑
           main
```

### Tag

**Статичний (immutable) покажчик** на конкретний commit. Tag не рухається — він навічно прив'язаний до того commit на якому створений. Використовується для releases.

Приклад: `v2.1.0` (агейв mainnet release tag), `ag-v0.4.2` (Alpenglow community cluster release tag).

```
A ← B ← C ← D
        ↑   ↑
      v2.0  main, v2.1.0
```

Branch vs Tag:

| | Branch | Tag |
|---|---|---|
| Рух | Рухається з новими commits | Immutable, прив'язана до конкретного commit |
| Призначення | Активна розробка | Snapshot releases |
| Приклад | `main`, `master`, `feature-x` | `v1.0.0`, `v2.1.0`, `ag-v0.4.2` |

### HEAD

**Special pointer на "де ти зараз"** у дереві commits. Зазвичай вказує на branch (тоді ланцюжок: `HEAD → branch → commit`).

**Detached HEAD** — стан коли HEAD вказує на commit/tag **напряму**, минаючи branch. Виникає коли робиш `checkout` на конкретний tag або commit hash без branch.

```
Нормально:
HEAD → main → D

Detached HEAD:
HEAD → C   (no branch)
```

Чому це матерує:

- **Read/build OK у detached HEAD** — можеш дивитись код, компілити, нічого не зламається
- **Commits у detached HEAD стають orphaned** — якщо зробиш новий commit, він не належить жодній branch і буде garbage-collected коли переключишся

Для validator ops ти **завжди у detached HEAD** після `git checkout v2.1.0` — це нормально, ти ж не плануєш commit'ити.

### Working tree states

| Стан | Що означає |
|---|---|
| **Clean** | Жодних uncommitted змін. `git status` → "nothing to commit, working tree clean" |
| **Dirty** | Є uncommitted зміни. `git status` → "Changes not staged for commit" |
| **Staged** | Зміни додані до index через `git add`, готові до commit |

Git **відмовляється** переключити branch якщо working tree dirty (і зміни перетнуться з target branch). Це для того щоб ти не втратила роботу.

## Key commands для validator ops

```bash
git status              # що змінено, де ми
git log --oneline -10   # останні 10 commits, коротко
git fetch --tags        # скачати нові tags/commits з remote
git checkout v2.1.0     # переключитись на tag
git diff                # показати unstaged зміни
git diff --staged       # показати staged зміни
git checkout -- FILE    # discard зміни конкретного файлу
git stash               # тимчасово відкласти зміни
git stash pop           # повернути stash
git remote -v           # показати remotes (e.g., origin = GitHub)
git rev-parse HEAD      # показати hash поточного commit
```

## Git workflow приклади (від простого до складного)

Тепер коли концепти зрозумілі — реальні приклади як git використовується у різних сценаріях.

### Випадок A — Mainnet/testnet з agave-install (git не потрібен)

Якщо ти оператор mainnet/testnet і не маєш специфічних потреб у custom builds — ти git **не торкаєшся**. Один command:

```bash
agave-install update
```

Що під капотом: agave-install скачує prebuilt binary з GitHub releases (Anza CI вже зробила build). Git репозиторій у тебе ніде немає.

### Випадок B — Build from source на mainnet/testnet

Коли треба специфічний commit, patch або release якого ще немає у `agave-install`. Тут ти **клонуєш** агейв repo і працюєш з git напряму:

```bash
git clone https://github.com/anza-xyz/agave ~/agave    # clone repo один раз
cd ~/agave
git fetch --tags                                       # отримати свіжі tags
git tag --sort=-creatordate | head -5                  # подивитись що є
git checkout v2.1.0                                    # переключитись на target version
git log -1 --oneline                                   # verify ми на правильному commit
cargo build --release --bin agave-validator            # build
sudo cp target/release/agave-validator \
    ~/.local/share/solana/install/active_release/bin/  # copy у agave-install layout
```

Розбираю **git** частину по рядках:

| Рядок | Що робить | Чому |
|---|---|---|
| `git clone ...` | Скачати repo на сервер | Робиться **один раз**, далі repo живе локально |
| `cd ~/agave` | Перейти в clone | git команди працюють у поточному repo |
| `git fetch --tags` | Скачати **нові** tags/commits з GitHub | Без цього `git checkout v2.1.0` не знайде нового тегу |
| `git tag --sort=-creatordate \| head -5` | Подивитись 5 найновіших tags | Дізнатись що доступне для checkout |
| `git checkout v2.1.0` | Переключити working tree на цей tag | Файли стають такими як були на момент v2.1.0 release. Ти у detached HEAD |
| `git log -1 --oneline` | Подивитись поточний HEAD | Verify що ти справді на v2.1.0 (показує commit message) |

Після цього `cargo build` бачить source code тієї версії і компілить її.

### Випадок C — LumLabs Alpenglow (build з custom patch)

Це твій реальний workflow на WNX0016778. Все те ж саме що Випадок B, **плюс одна додаткова git операція** через ваш custom build patch:

```bash
cd /home/devops_ssh/agave
git fetch --tags
git checkout ag-v0.4.2
sed -i 's/install --locked/install --locked --force/g' \
    scripts/cargo-install-all.sh                       # patch build script
# ... build ...
```

Тут `sed` редагує `scripts/cargo-install-all.sh` (додає `--force` до cargo install — деталі у Module 0.3 Cargo). Ця **локальна зміна** робить working tree dirty. Git це бачить:

```
$ git status
On branch (no branch, currently on ag-v0.4.2)
Changes not staged for commit:
  modified:   scripts/cargo-install-all.sh
```

Це нормально доки ти build'иш. Але стає проблемою на **наступний** upgrade.

## Connect to your work: реальна помилка 2026-06-08

Сьогодні ти стикнулась з цим коли робила upgrade ag-v0.4.0 → ag-v0.4.2:

```
$ git checkout ag-v0.4.2
error: Your local changes to the following files would be overwritten by checkout:
    scripts/cargo-install-all.sh
Please commit your changes or stash them before you switch branches.
Aborting
```

**Що відбулось крок за кроком:**

1. **Минулого тижня** (білд v0.4.0) ти запустила `sed -i ... cargo-install-all.sh`. Це змінило файл у working tree, але **не закоммітило**
2. Git цей файл досі вважає "modified" відносно HEAD (стану на v0.4.0)
3. **Сьогодні** ти зробила `git checkout ag-v0.4.2`
4. Git перевіряє: target tag (v0.4.2) теж має зміни у `scripts/cargo-install-all.sh` (різний від v0.4.0)
5. Якщо overwrite твою dirty копію — твоя робота втратиться
6. Git зупиняється: "розбирайся"

**Чому fix — `git checkout -- FILE`:**

```bash
git checkout -- scripts/cargo-install-all.sh   # discard локальні зміни в файлі
git checkout ag-v0.4.2                          # тепер працює — working tree clean
```

Перша команда: "відкинь локальні зміни у цьому файлі, поверни як в HEAD". Working tree стає clean → конфлікту немає.

**Чому discard а не stash:**

- `git stash` зберігає зміну, але після переходу на v0.4.2 — `git stash pop` може дати **conflict** якщо файл у v0.4.2 відрізняється від v0.4.0 (а він відрізняється бо ми його тоді ж пейтчили)
- Зміна тривіальна (sed одного рядка), ми переастосуємо її все одно після checkout
- Discard + reapply простіше і надійніше

## Hands-on exercise

Якщо у тебе на ноутбуці клоновано будь-який git repo:

```bash
cd /path/to/your/repo

# Базова інфа
git remote -v                            # звідки клоновано
git branch --show-current                # на якій branch
git log --oneline -5                     # останні 5 commits

# Working tree state
git status                               # clean/dirty
git diff                                 # якщо dirty — що змінено
```

Або на твоєму сервері WNX0016778 з agave repo:

```bash
cd /home/devops_ssh/agave

# Що це за repo? Звідки клонований?
git remote -v

# Які branches доступні?
git branch -a | head -10

# Які 5 найновіших tags?
git tag --sort=-creatordate | head -5

# Де HEAD зараз? (commit/branch/tag)
git status | head -3
git rev-parse --abbrev-ref HEAD

# Working tree clean чи dirty?
git status

# Скільки всього commits у репі?
git log --oneline | wc -l

# Подивись reflog — історію твоїх checkout'ів
git reflog | head -5
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Repository`](/glossary#r), [`Working tree`](/glossary#w), [`Commit`](/glossary#c), [`Branch`](/glossary#b), [`Tag`](/glossary#t), [`HEAD`](/glossary#h), [`Detached HEAD`](/glossary#d), [`Checkout`](/glossary#c), [`Fetch`](/glossary#f), [`Stash`](/glossary#s)

## External refs

- [Pro Git book (free)](https://git-scm.com/book/en/v2) — canonical reference, читай розділи 1-3
- [Atlassian Git tutorials](https://www.atlassian.com/git/tutorials) — більш visual
- [Oh Shit, Git!?!](https://ohshitgit.com/) — як recover з типових мискликів

---

**Попередньо:** [← 1. Build process](/module-0/1-build) | **Наступне:** [3. Cargo / Rust →](/module-0/3-cargo)
