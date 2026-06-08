<script setup>
const quiz = {
  id: 'm0-4-processes',
  title: '🧠 Mini-check: Linux processes & daemons',
  intro: '3 питання — фокус на systemd і daemons.',
  questions: [
    {
      type: 'compare',
      q: 'У чому різниця між foreground process і daemon? Перерахуй 3 пункти.',
      ideal: '1. Foreground process прив\'язаний до твого terminal session — якщо закриєш SSH, він вб\'ється (SIGHUP). Daemon відв\'язаний від terminal, працює навіть якщо ти logoutишся.\n2. Foreground process пише stdout/stderr напряму у твій terminal. Daemon пише в лог-файли або journald.\n3. Foreground process має parent = твій shell. Daemon має parent = init (PID 1, systemd), тобто запускається через init system а не з shell напряму.\n4. Foreground process ти бачиш у терміналі коли він біжить. Daemon працює невидимо у background, перевіряєш через ps/systemctl.',
      explanation: 'Ключове — daemon відв\'язаний від TTY/session і працює як background service під керуванням init системи. Якщо ти описала ці два аспекти (no terminal + managed by systemd/init) — це повна відповідь.'
    },
    {
      type: 'command',
      q: 'Як подивитись live logs solana service (last 50 рядків + tail follow)? Напиши команду.',
      accepts: [
        'sudo journalctl -u solana -n 50 -f',
        'sudo journalctl -u solana.service -n 50 -f',
        'journalctl -u solana -n 50 -f',
        'sudo journalctl -fu solana -n 50'
      ],
      ideal: 'sudo journalctl -u solana -n 50 -f',
      explanation: 'journalctl читає systemd journal logs. -u solana фільтрує по unit. -n 50 показує останні 50 рядків як стартову точку. -f (follow) дотягує нові рядки live (як tail -f). sudo потрібен бо journal може бути restricted to root/adm group.'
    },
    {
      type: 'diagnose',
      q: 'systemctl status solana показує: "Active: failed (Result: exit-code)" і "Process: 12345 ExecStart=... (code=exited, status=1/FAILURE)". Що з цих причин могло це викликати (обери всі правдоподібні)?',
      options: [
        'У ExecStart рядку є typo або неправильний флаг — validator immediately exited',
        'Файл validator-keypair.json не існує або неправильні permissions',
        'Hardware failure (диск помер)',
        'Validator потребує більше RAM ніж є на сервері'
      ],
      correct: [0, 1],
      explanation: 'status=1/FAILURE означає validator binary запустився але exit-нув з кодом 1 (помилка). Типові причини — неправильний CLI flag (опечатка у ExecStart) або відсутній/non-readable файл. Hardware failure спричинив би різний error pattern (Active: failed + raw error у logs). OOM kill спричинив би status=9/KILL не status=1.'
    }
  ]
}
</script>

# 4. Linux processes & daemons

## TL;DR

**Process** — запущена програма у пам'яті ОС. Має PID (process ID), parent PID, owner user, open files, memory allocation. Linux керує тисячами процесів одночасно.

**Daemon** — особливий тип процесу що працює у **background**, відв'язаний від terminal, керується **init системою** (systemd на сучасних Linux). Solana validator — це daemon: запускається через systemd unit (`solana.service`), пише логи у journald або у файл, працює 24/7 без твоєї присутності.

Розуміти процеси і systemd критично для validator ops: 99% твоїх daily operations це `systemctl restart/stop/status solana` + `journalctl -u solana -f`.

## Концепти

### Process (процес)

Запущена програма у пам'яті. Має:

- **PID** (Process ID): unique number, e.g., `12345`
- **PPID** (Parent PID): хто запустив цей процес
- **Owner**: який user запустив (root, solana, devops_ssh, etc.)
- **Memory**: allocated RAM
- **Open files**: file descriptors (відкриті файли, sockets, pipes)
- **State**: running, sleeping, zombie, stopped

Коли ти запускаєш `ls` у shell — shell створює child process з PID, виконує `ls`, чекає завершення, потім читає exit code.

### Foreground vs background

| | Foreground | Background |
|---|---|---|
| Прив'язка до terminal | Так | Ні |
| Виживає SSH disconnect | Ні (SIGHUP вбиває) | Залежить |
| stdout/stderr | У твій terminal | У файл, /dev/null, або lost |
| Як запустити | Просто `command` | `command &` (job control) або через systemd |

**SIGHUP** (signal hangup) — Linux надсилає цей signal всім процесам прив'язаним до terminal коли terminal закривається. За замовчуванням SIGHUP = вбити процес. Це чому довгі задачі в SSH terminal вмирають коли ти втрачаєш з'єднання.

### Daemon

**Daemon** — процес що:

1. Відв'язаний від terminal (no TTY)
2. Працює у background постійно
3. Зазвичай запускається при boot системи
4. Має parent = init (systemd, PID 1) а не shell
5. Логує у файли або journald (не в terminal)

Назва походить від Maxwell's demons (наукова метафора, не від релігії). Сучасний приклад: SSH server (`sshd`), Apache web server (`httpd`), Solana validator (`agave-validator`).

Daemon **переживає** твій SSH logout — він не прив'язаний до твоєї сесії.

### Init system: systemd

**Init system** — перший процес що запускається при boot Linux (PID 1). Він керує:

- Запуском всіх інших daemons при boot
- Restart daemons якщо вони впадуть
- Логуванням (через journald)
- Залежностями між services (e.g., network має бути up перед SSH)

На сучасних Linux (Ubuntu 20.04+, Debian 10+, CentOS 7+) init system = **systemd**. До systemd були SysVinit, Upstart — застаріли.

### systemd unit files

systemd керує services через **unit files** — текстові config файли у `/etc/systemd/system/` або `/usr/lib/systemd/system/`.

Приклад spr Solana validator (`/etc/systemd/system/solana.service`):

```ini
[Unit]
Description=Solana Validator
After=network.target

[Service]
Type=simple
User=solana
LimitNOFILE=1000000
LogRateLimitIntervalSec=0
Environment="RUST_LOG=info"
ExecStart=/home/solana/ag/bin/agave-validator \
    --identity /home/solana/solana/validator-keypair.json \
    --vote-account /home/solana/solana/vote-account-keypair.json \
    --ledger /home/solana/solana/ledger \
    --rpc-port 8899
Restart=always
RestartSec=1

[Install]
WantedBy=multi-user.target
```

Розбір ключових полів:

| Поле | Що означає |
|---|---|
| `[Unit]` Description | Human-readable name для logs/status |
| `After=network.target` | Не стартуй цей service поки network не up |
| `[Service]` Type=simple | Process не fork'ається (стає daemon) — systemd сам це робить |
| `User=solana` | Запускати під юзером `solana` (не root, безпечніше) |
| `LimitNOFILE=1000000` | Allow open до 1М файлів одночасно (validator потребує багато sockets) |
| `Environment="RUST_LOG=info"` | Set env var перед запуском |
| `ExecStart=...` | Команда яку запускає systemd (повний шлях + флаги) |
| `Restart=always` | Якщо process впаде — restart автоматично |
| `RestartSec=1` | Чекай 1 сек між restart attempts |
| `[Install]` WantedBy=... | До якого "boot target" прив'язаний (для enable/disable) |

⚠️ **Footgun** (з твого досвіду 2026-06-01): backslash `\` у кінці рядка означає "продовження на наступному рядку". Якщо є **trailing space** після `\` — systemd ламається на parsing. Якщо ставиш `# comment` всередині ExecStart — теж ламається (систему `#` не розуміє як comment всередині value).

## systemctl команди

Базові команди для керування services:

```bash
sudo systemctl start solana       # запустити service
sudo systemctl stop solana        # зупинити
sudo systemctl restart solana     # restart (stop + start атомарно)
sudo systemctl status solana      # поточний стан + останні 10 logs
sudo systemctl enable solana      # auto-start при boot
sudo systemctl disable solana     # не auto-start
sudo systemctl reload solana      # reload config БЕЗ restart (не всі services підтримують)
sudo systemctl daemon-reload      # перечитати unit files (потрібно після редагування .service)
```

## journalctl — systemd logs

journald збирає stdout/stderr всіх services. Читаються через `journalctl`:

```bash
sudo journalctl -u solana             # ВСІ логи solana service (з початку)
sudo journalctl -u solana -n 100      # останні 100 рядків
sudo journalctl -u solana -f          # live tail (як tail -f)
sudo journalctl -u solana -n 100 -f   # 100 рядків + tail follow (mainstream pattern)
sudo journalctl -u solana --since "10 minutes ago"
sudo journalctl -u solana --since today
sudo journalctl -u solana -p err      # тільки error-level
sudo journalctl -u solana | grep -i panic  # filter for panic
```

Альтернативно — якщо service пише у файл (як на твоєму setup `solana.log`), використовуй `tail`:

```bash
sudo tail -f /home/solana/solana/solana.log     # live tail
sudo tail -n 200 /home/solana/solana/solana.log # last 200 lines
```

## Process inspection commands

```bash
ps aux | grep agave-validator | grep -v grep    # знайти validator process
ps -p 12345 -o pid,ppid,user,start,cmd          # подивитись info по конкретному PID
top                                              # interactive view of all processes
htop                                             # nicer top (sudo apt install htop)
pgrep -fa agave-validator                        # знайти PIDs по pattern
pidof agave-validator                            # один PID якщо process running
```

**Що дивитись:**

- **VSZ/RSS** (virtual/resident memory) — скільки RAM використовує. Validator =  ~30-50 GB RSS на mainnet
- **%CPU** — поточне навантаження. Validator зазвичай 50-300% (multi-core)
- **STAT** — стан процесу (`R`=running, `S`=sleeping, `D`=uninterruptible wait, `Z`=zombie)

## Connect to your work: типові scenarios

### Випадок A — Перезапустити validator після config change

```bash
sudo nano /etc/systemd/system/solana.service   # відредагувати unit file
sudo systemctl daemon-reload                    # перечитати unit file
sudo systemctl restart solana                   # restart з новим config
sudo systemctl status solana                    # verify запустився
sudo journalctl -u solana -n 50 -f             # дивись live logs
```

⚠️ Без `daemon-reload` systemd не побачить зміни в unit file — restart буде зі старим config.

### Випадок B — Validator впав, треба зрозуміти чому

```bash
sudo systemctl status solana                       # стан + recent logs
sudo journalctl -u solana --since "1 hour ago"    # all logs за останню годину
sudo journalctl -u solana -p err --since today    # only errors
sudo journalctl -u solana | grep -iE "panic|fatal" | tail -20  # find crash point
```

### Випадок C — Перевірити чи validator process реально running

```bash
sudo systemctl status solana                # systemd view
ps aux | grep agave-validator | grep -v grep   # OS view (process exists?)
sudo /home/solana/ag/bin/solana slot --url http://localhost:8899  # functional view (responds?)
```

Три різні рівні перевірки — інколи systemd think it's running while process is hung, або process exists but RPC не reachable.

## Hands-on exercise

На твоєму mainnet/testnet/Alpenglow сервері:

```bash
# Подивись solana service config
sudo cat /etc/systemd/system/solana.service | head -30

# Поточний стан + останні 10 logs
sudo systemctl status solana

# Скільки часу running без restart
sudo systemctl show solana -p ActiveEnterTimestamp

# Validator process info
ps aux | grep agave-validator | grep -v grep | head -1
# або
pgrep -fa agave-validator

# Memory usage
ps -p $(pgrep -f agave-validator | head -1) -o pid,rss,vsz,cmd

# Live logs (Ctrl+C щоб вийти)
sudo journalctl -u solana -n 20 -f
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Process`](/glossary#p), [`PID`](/glossary#p), [`Daemon`](/glossary#d), [`SIGHUP`](/glossary#s), [`systemd`](/glossary#s), [`Unit file`](/glossary#u), [`journald`](/glossary#j), [`Init system`](/glossary#i)

## External refs

- [systemd.service manual](https://www.freedesktop.org/software/systemd/man/systemd.service.html) — official systemd service unit reference
- [Linux Journey: Processes & Tasks](https://linuxjourney.com/lesson/process-overview) — beginner-friendly
- [DigitalOcean: How to use systemctl](https://www.digitalocean.com/community/tutorials/how-to-use-systemctl-to-manage-systemd-services-and-units)

---

**Попередньо:** [← 3. Cargo / Rust](/module-0/3-cargo) | **Наступне:** [5. Filesystem & permissions →](/module-0/5-filesystem)
