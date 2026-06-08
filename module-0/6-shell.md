<script setup>
const quiz = {
  id: 'm0-6-shell',
  title: '🧠 Mini-check: Shell mechanics',
  intro: '3 питання — фокус на тому що ламається у твоїх щоденних командах.',
  questions: [
    {
      type: 'mcq',
      q: 'Ти запускаєш sudo doublezero-solana shreds publisher-rewards configure ... і отримуєш "command not found". У звичайному (не-sudo) shell doublezero-solana працює. Чому (обери всі правдоподібні)?',
      options: [
        'sudo resets PATH за замовчуванням, doublezero-solana не у secure_path',
        'sudo вимагає absolute path до бінарника',
        'Користувач root не має дозволу на цей binary',
        'Binary потребує спеціального middleware'
      ],
      correct: [0],
      explanation: 'sudo за замовчуванням resets PATH до secure_path (/etc/sudoers config). Якщо твій binary у ~/.cargo/bin/ або іншому non-secure_path location — sudo його не знаходить. Fix варіанти: (1) sudo env "PATH=$PATH" doublezero-solana ..., (2) sudo /full/path/to/doublezero-solana ..., (3) sudo -i щоб стати root з повним shell.'
    },
    {
      type: 'command',
      q: 'Напиши команду яка покаже всю env variable PATH (де shell шукає бінарники).',
      accepts: [
        'echo $PATH',
        'echo "$PATH"',
        'env | grep PATH',
        'printenv PATH'
      ],
      ideal: 'echo $PATH',
      explanation: 'echo $PATH виведе значення (типу /usr/local/bin:/usr/bin:/bin). env показує ВСІ env vars, можеш grep. printenv специфічно для env vars. Bash потребує prefix $ щоб expand variable у значення.'
    },
    {
      type: 'scenario',
      q: 'Ти хочеш зберегти output довгої команди (solana validators) у файл І ОДНОЧАСНО бачити його у терміналі. Напиши command pipeline що це робить.',
      ideal: 'solana validators | tee output.txt\n\nАбо з append: solana validators | tee -a output.txt\n\nЯк працює: pipe | передає stdout solana validators у stdin tee. Команда tee читає stdin і пише ОДНОЧАСНО у file І у stdout (тому ти бачиш на екрані). -a режим append (без -a перезаписує файл щоразу).\n\nЯкщо треба ще й stderr захопити: solana validators 2>&1 | tee output.txt — 2>&1 redirect stderr (file descriptor 2) у stdout (file descriptor 1), потім обидва йдуть у pipe.',
      explanation: 'Ключові поняття: pipe (|) передає stdout наступній команді, tee splits output у файл + stdout. Якщо ти описала tee + -a flag — повна відповідь. Bonus якщо знаєш про 2>&1 для combine stderr.'
    }
  ]
}
</script>

# 6. Shell mechanics

## TL;DR

**Shell** (bash, zsh, sh) — програма яка читає твої commands і виконує їх. Між тим коли ти натиснула Enter і тим коли command реально запустилась shell робить багато роботи: parse command, expand variables/globs, set up pipes/redirects, спавнить subprocess. Розуміти ці кроки = розуміти чому деякі команди ламаються там де ти не очікувала.

Найважливіші концепти для validator ops: env vars (`$PATH`, `$HOME`), expansion (`*`, `$(...)`, `~`), redirects (`>`, `<`, `|`, `2>&1`), sudo behavior (особливо `sudo` + PATH).

## Концепти

### Shell

**Shell** — interpreter для command-line інструкцій. Стандартний на Linux — **bash** (Bourne Again Shell). На Mac — **zsh**.

Коли ти SSH-увалась на сервер, shell стартує для твоєї сесії. Він читає твої commands, парсить, виконує, показує output, чекає наступного.

### Command parsing — як shell читає рядок

Послідовність кроків коли ти набираєш command:

```bash
ls -la $HOME/documents/*.txt > /tmp/list.txt 2>&1
```

1. **Tokenize**: розбити на слова (`ls`, `-la`, `$HOME/documents/*.txt`, `>`, `/tmp/list.txt`, `2>&1`)
2. **Variable expansion**: замінити `$HOME` на значення (e.g., `/home/devops_ssh`)
3. **Glob expansion**: замінити `*.txt` на список реальних файлів (e.g., `a.txt b.txt c.txt`)
4. **Redirect setup**: налаштувати `>` (stdout → файл), `2>&1` (stderr → stdout)
5. **Execute**: запустити `ls -la /home/devops_ssh/documents/a.txt /home/devops_ssh/documents/b.txt /home/devops_ssh/documents/c.txt`

Важливо що **expansion відбувається ДО execution**. Це джерело багатьох footguns.

### Variable expansion

Variable у shell prefixед `$`:

```bash
echo $HOME              # /home/devops_ssh
echo "$HOME/docs"       # /home/devops_ssh/docs (quotes preserve spaces)
echo '${HOME}/docs'     # ${HOME}/docs (single quotes — NO expansion)
```

| Тип лапок | Variable expansion? | Glob expansion? |
|---|---|---|
| Без лапок | Так | Так |
| `"..."` (double) | Так | Ні (одинарна змінна але без globs всередині) |
| `'...'` (single) | **Ні** | Ні |

Тому `echo '$HOME'` виводить literal `$HOME`, не значення.

### Common environment variables

```bash
echo $PATH       # де shell шукає executables
echo $HOME       # твоя home directory
echo $USER       # твоє ім'я юзера
echo $SHELL      # шлях до shell (e.g., /bin/bash)
echo $PWD        # current working directory (same як `pwd`)
env              # ВСІ env vars
printenv PATH    # specific var (alternative до echo)
```

### Glob expansion

Wildcards для match файлів:

| Pattern | Що матчить |
|---|---|
| `*` | будь-який string (НЕ перетинає `/`) |
| `?` | один символ |
| `[abc]` | один з a, b, або c |
| `**` | recursive (тільки якщо globstar enabled) |

```bash
ls *.txt              # всі .txt у поточній dir
ls /var/log/*.log     # всі .log у /var/log
ls /etc/system?       # systemD, systemA, etc (один символ)
```

**КРИТИЧНО**: glob expansion відбувається **shell**, не command. Тому `ls *.txt` — це shell expand'ить `*.txt` у список файлів, потім передає список `ls`. Якщо shell не може прочитати папку (permissions) — glob лишається literal.

### Sudo та PATH

**sudo** (substitute user, do) запускає command як інший user (за замовчуванням root).

**Footgun**: sudo за замовчуванням **resets PATH** до значення `secure_path` з `/etc/sudoers`:

```bash
# Як devops_ssh
echo $PATH
# /home/devops_ssh/.cargo/bin:/usr/local/bin:/usr/bin:/bin

# Як sudo
sudo bash -c 'echo $PATH'
# /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

Якщо твій tool у `~/.cargo/bin/` (наприклад `doublezero-solana`) — `sudo doublezero-solana` фейлиться з `command not found`.

**Fix варіанти:**

```bash
# 1. Preserve PATH explicitly
sudo env "PATH=$PATH" doublezero-solana ...

# 2. Full path до binary
which doublezero-solana                              # знайти full path
sudo /home/devops_ssh/.cargo/bin/doublezero-solana ...

# 3. Login shell (повний env)
sudo -i
# у новому root shell все працює як треба
```

## Pipes & redirects

**Pipe `|`** — connect stdout однієї команди до stdin наступної:

```bash
solana validators | grep -c "Active"        # count active validators
ps aux | grep agave | grep -v grep | head   # find validator process
```

**Redirects:**

| Symbol | Що робить |
|---|---|
| `>` | stdout → файл (overwrite) |
| `>>` | stdout → файл (append) |
| `<` | файл → stdin |
| `2>` | stderr → файл |
| `2>&1` | stderr → stdout (combine streams) |
| `&>` | both stdout + stderr → файл (bash shortcut) |

Приклади:

```bash
solana validators > vals.txt              # save stdout
solana validators 2> errors.txt           # save errors
solana validators > vals.txt 2>&1         # save both (order matters!)
solana validators &> vals.txt             # same as above (shorter)
solana validators | tee vals.txt          # save AND show (tee splits)
```

⚠️ Order matters у `> file 2>&1`. `> file` спочатку redirect stdout, потім `2>&1` redirect stderr to where stdout points (= file). Якщо швидко: `2>&1 > file` — stderr іде у terminal (old stdout), stdout у file. Не те що ти хотіла.

## Heredoc — multiline strings

Для передачі багатолінійних даних у command:

```bash
cat <<EOF > /tmp/config
name = "validator"
version = "3.0"
EOF
```

`<<EOF` запускає heredoc, все до наступного `EOF` (на власному рядку) це stdin. `EOF` довільне (можна `END`, `STOP`, etc.) — головне щоб не з'являлось у самих даних.

Variant `<<'EOF'` (з quotes) — no expansion усередині (literal as-is).

## Command substitution

`$(command)` — виконати command і підставити output:

```bash
NOW=$(date +%s)
echo $NOW                                  # 1733678400
COMMIT=$(git rev-parse HEAD)              # current commit hash
CI_COMMIT=$(git rev-parse HEAD) scripts/build.sh   # env var inline
```

Старий синтаксис: backticks `` `command` `` — працює але важче читати, особливо коли nested.

## Connect to your work: типові footguns

### Footgun 1 — glob expansion з restricted dir (з cluster restart)

Розібрано детально у Module 0.5 (Filesystem). TL;DR: `*` expand'иться shell ДО sudo. Fix: `sudo bash -c "rm /path/*"`.

### Footgun 2 — sudo + custom tool not found

З сьогоднішнього (2026-06-08):

```bash
$ sudo doublezero-solana shreds publisher-rewards configure ...
sudo: doublezero-solana: command not found
```

Fix:

```bash
sudo env "PATH=$PATH" doublezero-solana shreds publisher-rewards configure ...
```

### Footgun 3 — variable expansion у one-liners

```bash
# Не працює як ти думаєш:
sudo echo "PATH is $PATH" > /tmp/log

# Чому: shell expand $PATH і > перед sudo. > /tmp/log виконується як devops_ssh.
# Якщо /tmp/log не writeable for devops_ssh → permission denied.

# Fix:
sudo bash -c 'echo "PATH is $PATH" > /tmp/log'
# Тепер bash як root expand'ить $PATH і пише у файл.
```

### Footgun 4 — pipe + sudo

```bash
# Не дає очікуваний результат:
cat /etc/sudoers | sudo ...

# Чому: cat виконується як devops_ssh. /etc/sudoers має mode 440, only readable by root.

# Fix:
sudo cat /etc/sudoers | ...
```

## Hands-on exercise

```bash
# Подивись на свій PATH
echo $PATH

# Порівняй з sudo's PATH
sudo bash -c 'echo $PATH'

# ВСІ env vars
env | head -20

# Тест glob expansion
ls /etc/system?
ls /var/log/*.log 2>/dev/null | head

# Тест command substitution
echo "Today is $(date)"
echo "Hostname: $(hostname)"
echo "Free RAM: $(free -h | grep Mem | awk '{print $7}')"

# Тест redirect
echo "test" > /tmp/test.txt && cat /tmp/test.txt && rm /tmp/test.txt

# Тест pipe + tee
date | tee /tmp/date.txt    # показує date І пише у файл
cat /tmp/date.txt
rm /tmp/date.txt

# Quote behavior
echo $HOME
echo "$HOME"
echo '$HOME'
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Shell`](/glossary#s), [`bash`](/glossary#b), [`Environment variable`](/glossary#e), [`PATH`](/glossary#p), [`Glob`](/glossary#g), [`Pipe`](/glossary#p), [`Redirect`](/glossary#r), [`Heredoc`](/glossary#h), [`Command substitution`](/glossary#c)

## External refs

- [Bash manual](https://www.gnu.org/software/bash/manual/bash.html) — official, дуже довгий
- [Bash Hackers Wiki](https://wiki.bash-hackers.org/) — practical
- [ExplainShell.com](https://explainshell.com/) — paste a command, get breakdown of each flag
- [ShellCheck](https://www.shellcheck.net/) — статичний аналізатор bash, ловить footguns

---

**Попередньо:** [← 5. Filesystem & permissions](/module-0/5-filesystem) | **Наступне:** [7. tmux →](/module-0/7-tmux)
