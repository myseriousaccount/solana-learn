<script setup>
const quiz = {
  id: 'm0-7-tmux',
  title: '🧠 Mini-check: tmux',
  intro: '3 питання — короткий quiz бо tmux простий.',
  questions: [
    {
      type: 'scenario',
      q: 'Ти запустила agave build (25 хв) на сервері через SSH. Через 10 хвилин у тебе пропав інтернет. Що станеться з build без tmux і що з tmux?',
      ideal: 'БЕЗ tmux: build вб\'ється з SIGHUP коли SSH session закриється. Все 10 хвилин компіляції пропали. Доведеться запускати заново.\n\nЗ tmux: build продовжує працювати у background. tmux session відв\'язана від SSH connection. Коли інтернет повернеться, можна reconnect через SSH і `tmux attach -t build` — побачити progress, який не зупинявся.\n\nЦе чому ВСІ довгі задачі (build, snapshot fetch, рестарт) треба робити у tmux.',
      explanation: 'Ключове: SIGHUP вбиває foreground process при SSH disconnect, tmux survive\'ить бо attached process — це сам tmux server, not your bash. Якщо ти описала це + механіку attach після reconnect — повна відповідь.'
    },
    {
      type: 'command',
      q: 'Як attach до існуючої tmux session з іменем "build"? Напиши команду.',
      accepts: [
        'tmux attach -t build',
        'tmux attach-session -t build',
        'tmux a -t build'
      ],
      ideal: 'tmux attach -t build',
      explanation: 'tmux attach -t <name> приєднується до session. -t специфікує target name (без -t — приєднується до останньої). Скорочення: tmux a (attach), tmux ls (list), tmux new -s name (new session). attach-session — повна форма attach.'
    },
    {
      type: 'mcq',
      q: 'Яка комбінація клавіш detach (відключитися) з tmux session не вбиваючи її? (Default tmux prefix)',
      options: [
        'Ctrl+B потім D',
        'Ctrl+C',
        'Ctrl+D',
        'Ctrl+B потім X'
      ],
      correct: [0],
      explanation: 'Ctrl+B потім D = detach. Ctrl+B це tmux prefix (як escape key для tmux commands), потім D команда detach. Ctrl+C вб\'є foreground process у session. Ctrl+D пошле EOF (зачинить shell). Ctrl+B потім X закриє pane.'
    }
  ]
}
</script>

# 7. tmux

## TL;DR

**tmux** (terminal multiplexer) — програма яка дозволяє запускати **persistent terminal sessions** які виживають SSH disconnect. Запустив build у tmux → втратила інтернет → переконнектилась → reattach до session → побачила що build продовжився.

Для validator ops tmux обов'язковий для будь-якої задачі довшої за 1 хвилину: build (25-30 хв), snapshot fetch, cluster restart procedures. **Не використовувати tmux = втратити роботу при першому SSH disconnect**.

## Концепти

### Що таке terminal multiplexer

Multiplexer = "багатоканальник". tmux дозволяє:

1. **Persistent sessions** — terminal який працює навіть коли ти disconnected
2. **Multiple windows у одній сесії** — кілька shell-ів паралельно (як browser tabs)
3. **Split panes** — розділити вікно на частини (як IDE)
4. **Reattach з різних місць** — підключитись з телефону, з ноутбука, з іншого комп'ютера

Найбільш цінне для validator ops — **persistence**. tmux server відокремлений від твого SSH session.

### Як tmux survives SSH disconnect

Без tmux:

```
Ти ←(SSH)→ server bash ←(spawned)→ build process
```

Коли SSH рветься → bash отримує SIGHUP → bash вмирає → build process теж вмирає (no parent).

З tmux:

```
Ти ←(SSH)→ tmux client ←(attached to)→ tmux server ←(spawned)→ bash ←(spawned)→ build process
                                       ^
                                       |
                                 (працює як daemon)
```

Коли SSH рветься → tmux client вмирає → tmux server **продовжує** працювати → bash + build живі. Reconnect через SSH → `tmux attach` → тебе підключає до того ж tmux server → ти бачиш build що продовжився.

## Базові концепти

| Поняття | Що це |
|---|---|
| **Server** | Background процес tmux на сервері (PID 1 для всіх tmux sessions) |
| **Session** | Named collection of windows (e.g., "build", "monitor") |
| **Window** | Як browser tab — повноекранний терміналу всередині session |
| **Pane** | Split window — кілька terminal'ів в одному window |
| **Prefix** | Префікс для tmux commands. Default: `Ctrl+B` |

## Key commands

```bash
tmux new -s build              # Створити нову session з ім'ям "build"
tmux ls                        # List всіх sessions
tmux attach -t build           # Attach до існуючої session
tmux attach                    # Attach до останньої session (якщо одна)
tmux kill-session -t build     # Видалити session (вбиває все всередині)
tmux kill-server               # Вбити tmux server (всі sessions!)
```

## Key bindings (всередині tmux)

Усі починаються з prefix `Ctrl+B`, потім letter.

| Combo | Що робить |
|---|---|
| `Ctrl+B` `D` | **Detach** (відключитись, session продовжує) |
| `Ctrl+B` `C` | Create new window |
| `Ctrl+B` `N` | Next window |
| `Ctrl+B` `P` | Previous window |
| `Ctrl+B` `<number>` | Switch to window N |
| `Ctrl+B` `%` | Split pane vertically |
| `Ctrl+B` `"` | Split pane horizontally |
| `Ctrl+B` `arrow` | Navigate between panes |
| `Ctrl+B` `X` | Close current pane |
| `Ctrl+B` `[` | Enter scrollback mode (потім arrows/PgUp, q щоб вийти) |
| `Ctrl+B` `?` | Help (показати всі bindings) |

**Найважливіше для тебе: `Ctrl+B` `D`** — це detach без вбивання. Це те що ти робиш після `tmux new -s build` + запуску build: detach, можеш закрити SSH, build продовжується.

## Connect to your work: build workflow з tmux

З §4 cheatsheet:

```bash
cd /home/devops_ssh/agave
git fetch --tags
git checkout ag-v0.4.2
sed -i 's/install --locked/install --locked --force/g' scripts/cargo-install-all.sh
tmux new -s build                                              # ← створюємо session
CI_COMMIT=$(git rev-parse HEAD) scripts/cargo-install-all.sh /home/solana/ag-v0.4.2
# Ctrl+B D — detach
```

Після `Ctrl+B D` ти бачиш своїй shell. Build продовжується у background tmux session. Можеш:

- Закрити SSH — build continues
- Через 30 хв повернутись — `tmux attach -t build` — побачиш фініш
- Якщо build впав з помилкою — побачиш error message у scrollback

**Перевірити що сесія жива:**

```bash
tmux ls
# build: 1 windows (created Sun Jun  8 14:23:01 2026)
```

## Typical scenarios

### Запустила build, треба detach

```bash
tmux new -s build
# ... запустила build ...
# Ctrl+B потім D
```

### Підключилась через 30 хв подивитись

```bash
tmux ls                  # перевірити що session жива
tmux attach -t build     # entered the session
# дивишся output
# Ctrl+B потім D — знову detach
```

### Build впав, треба подивитись error

```bash
tmux attach -t build
# Ctrl+B потім [    — scrollback mode
# ↑↑↑↑↑ або PgUp щоб скролити вгору
# q щоб вийти з scrollback
```

### Закінчила, треба видалити session

```bash
tmux ls                       # show running sessions
tmux kill-session -t build    # delete specific
```

## Hands-on exercise

На сервері:

```bash
# Подивись tmux версію
tmux -V

# Перевір чи є running sessions
tmux ls 2>&1 || echo "No sessions running"

# Створити test session
tmux new -s test

# Всередині test session:
echo "Hello from tmux"
date

# Detach: натисни Ctrl+B потім D
# Має повернутись у звичайний shell

# Перевір session жива
tmux ls

# Reattach
tmux attach -t test

# Закінчила тестувати
exit                          # вб'є shell всередині, session теж закриється
# або
# Ctrl+B D потім: tmux kill-session -t test
```

## Альтернатива: screen

`screen` — старіший terminal multiplexer, схожі можливості. Якщо tmux немає на сервері:

```bash
screen -S build                # створити session
# ... запустити ...
# Ctrl+A потім D — detach
screen -r build                # reattach
```

99% сучасних серверів мають tmux. Якщо немає — встанови:

```bash
sudo apt install tmux          # Ubuntu/Debian
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`tmux`](/glossary#t), `Session (tmux)`, `Window (tmux)`, `Pane`, [`Prefix key`](/glossary#p), `Detach`, `Reattach`

## External refs

- [tmux cheatsheet](https://tmuxcheatsheet.com/) — visual key binding reference
- [tmux GitHub README](https://github.com/tmux/tmux) — official docs
- [The Tao of tmux](https://leanpub.com/the-tao-of-tmux/read) — full free book

---

**Попередньо:** [← 6. Shell mechanics](/module-0/6-shell) | **Наступне:** [8. SSH →](/module-0/8-ssh)
