<script setup>
const quiz = {
  id: 'm0-5-filesystem',
  title: '🧠 Mini-check: Filesystem & permissions',
  intro: '3 питання щоб закріпити permissions і symlinks.',
  questions: [
    {
      type: 'diagnose',
      q: 'Ти запускаєш /home/solana/ag/bin/solana slot як юзер devops_ssh БЕЗ sudo і отримуєш Permission denied. Файл solana має mode 755 (виконуваний для всіх). Чому помилка?',
      options: [
        'Тому що папка /home/solana/ має mode 750 — devops_ssh не може traverse у неї без elevated permissions',
        'Тому що binary потребує root capabilities',
        'Тому що файл насправді не існує',
        'Тому що SELinux блокує доступ'
      ],
      correct: [0],
      explanation: 'Це класичний footgun з §1 cheatsheet. /home/solana/ має mode 750 (rwxr-x---). Group execute (x) дозволяє traverse в папку для members групи solana. devops_ssh не в групі solana → не може traverse → не доходить до binary. Виконати solana --version через 750 директорію неможливо для не-member групи. Sudo обходить це бо root ignored всі permission checks.'
    },
    {
      type: 'command',
      q: 'Як подивитись на що вказує symlink /home/solana/ag? Напиши команду.',
      accepts: [
        'readlink /home/solana/ag',
        'sudo readlink /home/solana/ag',
        'ls -la /home/solana/ag',
        'sudo ls -la /home/solana/ag',
        'readlink -f /home/solana/ag'
      ],
      ideal: 'readlink /home/solana/ag',
      explanation: 'readlink показує куди вказує symlink (raw target). readlink -f показує final resolved path (якщо це symlink на symlink — fully resolves). ls -la теж показує target через `->` нотацію. На сервері /home/solana/ має mode 750 тому додай sudo якщо ти devops_ssh.'
    },
    {
      type: 'scenario',
      q: 'Тобі треба видалити всі файли у /home/solana/solana/ledger/ (повний wipe). Ти набираєш `sudo rm -rf /home/solana/solana/ledger/*` як devops_ssh — і нічого не видаляється. Чому і як виправити?',
      ideal: 'Причина: shell expand* ПЕРЕД викликом sudo — а shell працює як devops_ssh. devops_ssh не може читати /home/solana/solana/ (mode 750), тому wildcard * не знаходить нічого для expand, лишається literal *. rm отримує литерал /home/solana/solana/ledger/* який нічого не матчить → silent no-op.\n\nFix варіант 1 (recommended): `sudo bash -c "rm -rf /home/solana/solana/ledger/*"` — bash тепер запускається ПІД root, ВІН expand * маючи доступ.\n\nFix варіант 2: `sudo find /home/solana/solana/ledger -mindepth 1 -delete` — find працює як root, traverses фолдер, видаляє content.\n\nЦе footgun який ти зловила під час cluster restart 2026-06-02.',
      explanation: 'Ключове розуміння: shell glob expansion timing. * розширюється ДО запуску sudo, у permissions shell-юзера. Якщо ти описала це + один з двох fixes — повна відповідь. Bonus якщо обидва варіанти.'
    }
  ]
}
</script>

# 5. Filesystem & permissions

## TL;DR

Linux filesystem це **tree** (дерево) починаючи від `/` (root). Кожен файл/папка має **owner** (юзер), **group**, і **mode** (permissions: rwx для u/g/o). Permissions керують хто що може робити. **Symlinks** це покажчики на інші файли — використовуються для versioning, aliases.

Для validator ops permissions критичні: validator біжить під юзером `solana`, твій SSH юзер `devops_ssh` має обмежений доступ до `/home/solana/`. Розуміти **чому** sudo потрібен у тих чи інших командах = розуміти permissions.

## Концепти

### Filesystem tree

Linux філсистем — одне дерево з кореня `/`:

```
/
├── bin/                # системні бінарники (ls, cat, bash)
├── etc/                # config files (/etc/systemd/, /etc/passwd)
├── home/               # юзерські папки
│   ├── devops_ssh/     # твій home
│   └── solana/         # solana юзер home
├── tmp/                # тимчасові файли
├── var/                # variable data (logs у /var/log)
└── usr/                # user-installed software
```

**Absolute path** починається з `/`: `/home/solana/ag/bin/solana`. Завжди працює незалежно від поточної директорії.

**Relative path** не починається з `/`: `bin/solana`. Resolved відносно поточної директорії (`pwd`).

### Inode

**Inode** — внутрішня structure ext4/btrfs/xfs filesystem яка містить metadata файлу:

- Розмір
- Owner UID, Group GID
- Permissions (mode)
- Timestamps (created, modified, accessed)
- **Указівник на data blocks** (де файл фізично лежить на диску)

Filename — це **запис у каталозі** який мапить ім'я → inode number. **Один файл може мати кілька імен** (hardlinks) — всі вони вказують на той самий inode.

```bash
ls -i /home/solana/ag/bin/solana   # показує inode number
stat /home/solana/ag/bin/solana    # повна inode metadata
```

### Symlinks vs hardlinks

| | Symlink (symbolic link) | Hardlink |
|---|---|---|
| Що це | Файл який містить **шлях** до іншого файлу | Альтернативне ім'я для того ж inode |
| Cross-filesystem | Так | Ні (тільки в межах одного fs) |
| Працює для папок | Так | Ні (на більшості FS) |
| Стає broken якщо target видалити | Так (broken symlink) | Ні (data залишається доки є хоча б один hardlink) |
| Як створити | `ln -s target name` | `ln target name` |

99% часу ти працюєш з **symlinks** (вони простіші і працюють для папок).

### Symlinks у твоїй роботі

На Alpenglow сервері (§4 cheatsheet):

```
/home/solana/ag → /home/solana/ag-v0.4.2   (symlink)
```

`ag` це symlink що вказує на конкретну версію. Switch версії = просто перепрямувати symlink:

```bash
sudo ln -sfn /home/solana/ag-v0.4.3 /home/solana/ag
```

Validator process використовує `/home/solana/ag/bin/agave-validator` — після ln зміни symlink вказує на нову версію. Restart service → нова версія в дії.

`-s` = symbolic, `-f` = force (overwrite existing), `-n` = treat дестинатіон як файл навіть якщо symlink (без -n ln зайде у symlink target і створить новий symlink ВСЕРЕДИНІ старого).

Перевірити куди вказує:

```bash
readlink /home/solana/ag
# або
ls -la /home/solana/ag
```

## Permission model

Кожен файл/папка має:

1. **Owner** (user, UID): `solana`
2. **Group** (GID): `solana`
3. **Mode** — three groups of three bits: `rwxrwxrwx`
   - **u** (user/owner): перші три біти
   - **g** (group): наступні три
   - **o** (others/everyone): останні три

Bits:

- **r** (read) — читати content
- **w** (write) — модифікувати/видаляти content
- **x** (execute) — для файлів: запускати; для папок: **traverse** (зайти в неї)

### Numeric notation

Permissions записують як 3-цифрове число (octal):

| Numeric | rwx | Що дозволяє |
|---|---|---|
| 7 | rwx | read + write + execute |
| 6 | rw- | read + write, no execute |
| 5 | r-x | read + execute, no write |
| 4 | r-- | read only |
| 0 | --- | nothing |

Приклади:

- **755** = rwxr-xr-x — owner все може, group/others read+exec. Типове для виконуваних файлів
- **750** = rwxr-x--- — owner все, group read+exec, others **NOTHING**
- **644** = rw-r--r-- — owner read+write, group/others read only. Типове для config файлів
- **600** = rw------- — owner read+write, others nothing. Для secret файлів (keypairs!)

### chmod / chown

Змінити permissions:

```bash
chmod 755 file        # set numeric
chmod u+x file        # add execute for user
chmod o-r file        # remove read for others
chmod -R 755 dir/     # recursive
```

Змінити owner/group:

```bash
chown solana file              # change owner
chown solana:solana file       # change owner AND group
chown -R solana:solana dir/    # recursive
```

## Connect to your work: permission footgun у Constants

Це найголовніше у роботі з твоїми серверами.

**Папка `/home/solana/` має mode 750:**

```
drwxr-x--- 11 solana solana 4096 Jun  8 00:13 /home/solana
```

Що це означає:

- Owner (`solana`): rwx — все може
- Group (`solana`): r-x — read + traverse
- Others (всі інші): `---` — **NOTHING**

Юзер `devops_ssh` — не в групі `solana`. Тому:

- ❌ `cd /home/solana` — Permission denied (нема x)
- ❌ `ls /home/solana` — Permission denied (нема r)
- ❌ **Будь-який** доступ до файлів **під** `/home/solana/` блокується

Навіть якщо `/home/solana/ag/bin/solana` має mode 755 (виконуваний для всіх) — ти **не дійдеш до нього** як devops_ssh бо не можеш traverse через `/home/solana/`.

**Fix 1 — sudo** (root ignores всі permission checks):

```bash
sudo /home/solana/ag/bin/solana slot
```

**Fix 2 — стати solana юзером одноразово:**

```bash
sudo -u solana bash    # entering shell as solana
solana slot            # works without sudo (you ARE solana now)
exit                   # back to devops_ssh
```

## Glob expansion footgun

Окрема пастка пов'язана з permissions + shell.

**Сценарій (з твого досвіду cluster restart 2026-06-02):** треба видалити content `/home/solana/solana/ledger/*`. Як devops_ssh:

```bash
sudo rm -rf /home/solana/solana/ledger/*
```

Виглядає правильно — sudo дає root permissions, rm видалить файли. **Але нічого не видаляється.**

**Чому:** shell expand `*` ПЕРЕД викликом sudo. Тобто:

1. Bash (як devops_ssh) бачить `*` у command
2. Bash намагається list `/home/solana/solana/ledger/` щоб expand `*`
3. Bash не може читати ту папку (mode 750)
4. `*` лишається **literal** (не expanded)
5. `sudo rm` отримує літерал `/home/solana/solana/ledger/*` — нічого не матчить → silent no-op

**Fix 1 — sudo bash -c:**

```bash
sudo bash -c "rm -rf /home/solana/solana/ledger/*"
```

Тепер **bash запускається як root**, він має доступ до папки, expand'ить `*` правильно.

**Fix 2 — find:**

```bash
sudo find /home/solana/solana/ledger -mindepth 1 -delete
```

find працює як root, traverses, видаляє content. `-mindepth 1` щоб не видалити саму папку.

## Connect to your work: типові permission scenarios

### Зміна owner при build на Alpenglow

```bash
sudo chown -R devops_ssh:devops_ssh /home/solana/ag-v0.4.2   # дай ownership для build
# ... build ...
sudo chown -R solana:solana /home/solana/ag-v0.4.2           # поверни ownership солані
```

Чому: build script працює як devops_ssh (потребує write у dest dir). Validator service запускається як solana (потребує read+exec). Між цими стадіями ownership переключається.

### Permissions для keypairs

```bash
sudo chmod 600 /home/solana/solana/validator-keypair.json
sudo chown solana:solana /home/solana/solana/validator-keypair.json
```

`600` = тільки owner read+write. Ніхто інший не може навіть прочитати private key. Це **critical security**.

## Hands-on exercise

```bash
# Подивись permissions на /home/solana/
sudo ls -la /home/ | grep solana

# Подивись mode на validator binary
sudo ls -la /home/solana/ag/bin/agave-validator

# Подивись на що вказує symlink ag
sudo readlink /home/solana/ag

# Подивись keypair permissions (мають бути 600)
sudo ls -la /home/solana/solana/validator-keypair.json

# Подивись на твою власну home dir
ls -la /home/devops_ssh/ | head

# Спробуй (без sudo) звичайний ls /home/solana/ — отримай Permission denied
ls /home/solana/ 2>&1 || echo "Denied as expected"
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Inode`](/glossary#i), [`Symlink`](/glossary#s), [`Hardlink`](/glossary#h), [`Permission`](/glossary#p), [`Mode`](/glossary#m), `chmod`, `chown`, [`Absolute path`](/glossary#a), [`Relative path`](/glossary#r)

## External refs

- [Linux Filesystem Hierarchy Standard](https://www.pathname.com/fhs/) — структура `/`, `/etc`, `/var`, etc.
- [Linux Journey: Permissions](https://linuxjourney.com/lesson/file-permissions) — beginner-friendly
- [Symlinks Explained](https://linuxhandbook.com/symbolic-link-linux/)

---

**Попередньо:** [← 4. Linux processes & daemons](/module-0/4-processes) | **Наступне:** [6. Shell mechanics →](/module-0/6-shell)
