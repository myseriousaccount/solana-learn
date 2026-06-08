<script setup>
const quiz = {
  id: 'm0-8-ssh',
  title: '🧠 Mini-check: SSH',
  intro: '3 питання — фокус на key-based auth, scp, ProxyJump.',
  questions: [
    {
      type: 'explain',
      q: 'Поясни своїми словами як працює SSH key-based authentication. Чому це безпечніше за password?',
      ideal: 'SSH key-based auth використовує asymmetric crypto — пара ключів public + private. Private key зберігається на твоєму ноутбуці (~/.ssh/id_ed25519), public key копіюється на сервер у ~/.ssh/authorized_keys.\n\nКоли ти SSH-ишся:\n1. Сервер генерує random challenge string\n2. Сервер encrypts challenge твоїм public key\n3. Передає encrypted challenge тобі\n4. Твій ssh client decrypts його private key (тільки private key може розшифрувати)\n5. Sends decrypted answer назад\n6. Server verifies → auth pass\n\nПереваги над password:\n- Private key ніколи не передається мережею (тільки challenge response)\n- Brute-force атаки практично impossible (key 256+ bits ≠ 8-char password)\n- Один key може дати access до багатьох серверів (різні public keys у authorized_keys)\n- Key можна protect ще додатково passphrase (двофакторний доступ: щось маєш + щось знаєш)',
      explanation: 'Ключове: asymmetric pair, private stays local, public goes on server, challenge-response handshake. Якщо ти описала pair концепцію + те що private key ніколи не передається — це 80%+. Bonus за пояснення безпекових переваг.'
    },
    {
      type: 'command',
      q: 'Як скопіювати файл validator-keypair.json з твого ноутбука на сервер eta у /tmp/? Напиши команду scp.',
      accepts: [
        'scp validator-keypair.json devops_ssh@eta:/tmp/',
        'scp ./validator-keypair.json devops_ssh@eta:/tmp/',
        'scp validator-keypair.json devops_ssh@eta:/tmp',
        'scp ~/validator-keypair.json devops_ssh@eta:/tmp/'
      ],
      ideal: 'scp validator-keypair.json devops_ssh@eta:/tmp/',
      explanation: 'scp syntax: scp <local-file> <user>@<host>:<remote-path>. Якщо host у твоєму ~/.ssh/config — можеш просто eta замість IP. Зворотній копія: scp user@host:/path/file . — з сервера на ноутбук. -r для recursive (папки). -P для non-standard port.'
    },
    {
      type: 'scenario',
      q: 'Тобі треба SSH-итись на сервер internal-1 який доступний ТІЛЬКИ з bastion server. Тобто bastion публічний, internal-1 — приватний. Як це зробити одною командою без ручного hop?',
      ideal: 'Використати ProxyJump:\n\nssh -J devops_ssh@bastion devops_ssh@internal-1\n\n-J specifies jump host. SSH спочатку конектиться до bastion, тоді з bastion відкриває tunnel до internal-1, ти отримуєш прямий shell на internal-1 — без ручного логіну на bastion.\n\nДля повторного використання — у ~/.ssh/config:\n\nHost internal-1\n    HostName internal-1.private.local\n    User devops_ssh\n    ProxyJump devops_ssh@bastion\n\nПісля цього просто ssh internal-1 — все автоматично.',
      explanation: 'Ключове: -J flag або ProxyJump config. Якщо описала -J ssh command або згадала ProxyJump у config — повна відповідь. Bonus за config file приклад.'
    }
  ]
}
</script>

# 8. SSH

## TL;DR

**SSH (Secure Shell)** — encrypted protocol для remote access до серверів. Замінив старі telnet/rlogin які передавали passwords plaintext. Базова операція ssh: ти на ноутбуці → encrypted connection → shell session на сервері.

Для validator ops ти проводиш 90% часу в SSH session: SSH на mainnet validator, на testnet validator, на Alpenglow WNX0016778, на eta для DoubleZero config. Знати SSH добре = знати як швидко переключатись між серверами, безпечно зберігати keys, використовувати scp/ProxyJump/port forwarding.

## Концепти

### Symmetric vs asymmetric encryption

**Symmetric**: один ключ для encrypt і decrypt. Швидко але треба secure way share key.

**Asymmetric** (public-key crypto): пара ключів — public і private. Public роздаєш, private тримаєш у секреті.

- Encrypt public key → можна decrypt тільки private key
- Sign private key → можна verify public key

SSH використовує asymmetric для **authentication** (хто ти є) + symmetric для **bulk data transfer** (швидкий encrypted channel).

### SSH key pair

Генеруєш пару ключів на твоєму ноутбуці:

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
```

`-t ed25519` — modern algorithm (краще за старі rsa/dsa). `-C` — comment (метадані).

Результат: два файли в `~/.ssh/`:

- **`id_ed25519`** — private key (тримай в секреті, mode 600)
- **`id_ed25519.pub`** — public key (можна роздавати)

### Authentication flow

1. Ти набираєш `ssh devops_ssh@server`
2. Server розпізнає тебе по hostname/user, шукає public keys у `~devops_ssh/.ssh/authorized_keys`
3. Якщо твій public key там — server генерує **random challenge**
4. Шифрує challenge твоїм public key
5. Передає encrypted challenge тобі
6. Твій SSH client decrypts його твоїм private key (тільки private key може розшифрувати — це і є asymmetric pair magic)
7. Відсилає decrypted answer назад
8. Server verifies — auth pass — починає shell session

**Private key ніколи не передається мережею.** Це і робить SSH key-auth набагато безпечнішим за password.

### authorized_keys

На сервері — файл `~/.ssh/authorized_keys` (одна public key на рядок) містить всі публічні ключі яким дозволено login.

Дати комусь доступ:

```bash
# На локальному ноутбуці
cat ~/.ssh/id_ed25519.pub
# скопіювати output

# На сервері (як target user)
echo "ssh-ed25519 AAAA... your@email" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Або з ноутбука однією командою:

```bash
ssh-copy-id devops_ssh@server
```

### host keys & known_hosts

Сервер теж має свою пару keys (`/etc/ssh/ssh_host_*`). Коли ти конектишся вперше:

```
The authenticity of host 'server (1.2.3.4)' can't be established.
ED25519 key fingerprint is SHA256:xxxxx.
Are you sure you want to continue connecting (yes/no)?
```

Yes → public key server'а записується у твій `~/.ssh/known_hosts`. Наступні разу no prompt.

Якщо host key **змінилась** (server reinstalled, OR MITM attack) — SSH відмовляє з помилкою:

```
WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!
```

Якщо ти **знаєш** що це legit (наприклад знала про reinstall) — видали стару entry:

```bash
ssh-keygen -R server.hostname
```

## SSH config

`~/.ssh/config` — config file для шортatів і defaults:

```ssh-config
Host eta
    HostName eta.lumlabs.io
    User devops_ssh
    Port 22
    IdentityFile ~/.ssh/id_ed25519

Host alpenglow
    HostName WNX0016778.solana.com
    User devops_ssh

Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

Тепер замість `ssh devops_ssh@eta.lumlabs.io -p 22 -i ~/.ssh/id_ed25519` — просто `ssh eta`.

## scp — copy files

Скопіювати файли між local і remote:

```bash
# Local → remote
scp validator-keypair.json devops_ssh@server:/tmp/

# Remote → local
scp devops_ssh@server:/tmp/file.json ~/

# Recursive (папки)
scp -r local-folder/ devops_ssh@server:/path/

# Through ProxyJump
scp -J devops_ssh@bastion file user@internal:/tmp/

# Non-standard port
scp -P 2222 file user@server:/tmp/
```

## ssh-agent

Якщо твій private key захищений passphrase — кожен SSH потребує її ввести. `ssh-agent` тримає decrypted key у пам'яті щоб не вводити кожен раз:

```bash
eval "$(ssh-agent -s)"           # start agent
ssh-add ~/.ssh/id_ed25519        # add key (вводиш passphrase один раз)

# Тепер ssh працює без passphrase prompt поки agent живий
ssh server
```

На Mac агента можна налаштувати щоб auto-load keys у Keychain — passphrase лише при першому використанні.

## ProxyJump (bastion hosts)

Часто validator servers НЕ публічні — доступні тільки через **bastion** (jump host). SSH дозволяє one-command tunnel:

```bash
ssh -J devops_ssh@bastion devops_ssh@internal-1
```

SSH спочатку конектиться до bastion, з bastion відкриває tunnel до internal-1, ти отримуєш прямий shell на internal-1.

У config:

```ssh-config
Host internal-1
    HostName internal-1.private.local
    User devops_ssh
    ProxyJump devops_ssh@bastion
```

Після — просто `ssh internal-1`. SSH сам hop'ить через bastion.

## Port forwarding (tunnels)

Перенаправити порт з remote на local:

```bash
# Local port forwarding: localhost:8899 → remote_server:8899
ssh -L 8899:localhost:8899 devops_ssh@server

# Тепер curl localhost:8899 на твоєму ноутбуці = звертання до RPC на сервері
```

Корисно щоб подивитись validator's RPC через localhost без exposing port в інтернет.

## Connect to your work: типові SSH workflow

### Login до різних серверів

```bash
ssh devops_ssh@WNX0016778        # Alpenglow validator
ssh devops_ssh@eta               # mainnet validator (з ~/.ssh/config alias)
ssh devops_ssh@testnet-1         # testnet validator
```

### Скопіювати keypair backup на ноутбук (з §3 Phase 0 cheatsheet)

```bash
sudo cp /home/solana/solana/validator-keypair.json /tmp/validator-keypair-backup-20260608.json
scp devops_ssh@WNX0016778:/tmp/validator-keypair-backup-20260608.json ~/Desktop/
```

### Перевірити свій public key (для додавання у новий сервер)

```bash
cat ~/.ssh/id_ed25519.pub
# або
cat ~/.ssh/id_rsa.pub
```

## Permissions для SSH keys

Дуже строгі (інакше SSH відмовляється використовувати):

```bash
chmod 700 ~/.ssh                          # папка
chmod 600 ~/.ssh/id_ed25519               # private key (тільки owner read+write)
chmod 644 ~/.ssh/id_ed25519.pub           # public key (всі read)
chmod 600 ~/.ssh/authorized_keys          # тільки owner read+write
chmod 644 ~/.ssh/known_hosts              # всі read
chmod 600 ~/.ssh/config                   # тільки owner
```

Якщо помилкові permissions → `Bad owner or permissions on ~/.ssh/config` error.

## Hands-on exercise

На твоєму ноутбуці:

```bash
# Подивись чи є SSH keys
ls -la ~/.ssh/

# Подивись свій public key
cat ~/.ssh/id_ed25519.pub 2>/dev/null || cat ~/.ssh/id_rsa.pub

# Подивись SSH config
cat ~/.ssh/config 2>/dev/null

# Подивись known_hosts (всі сервера які ти відвідувала)
wc -l ~/.ssh/known_hosts
cut -d ',' -f 1 ~/.ssh/known_hosts | sort -u | head -10

# Якщо ssh-agent running — show keys loaded
ssh-add -l 2>/dev/null || echo "No agent or no keys loaded"
```

На будь-якому сервері:

```bash
# Подивись authorized_keys (для твого юзера)
cat ~/.ssh/authorized_keys

# Подивись server's host keys
sudo ls -la /etc/ssh/ssh_host_*

# Якщо у тебе sshd config
sudo cat /etc/ssh/sshd_config | grep -v "^#" | grep -v "^$" | head -20
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`SSH`](/glossary#s), [`Public key`](/glossary#p), [`Private key`](/glossary#p), [`ssh-agent`](/glossary#s), `authorized_keys`, `known_hosts`, `ProxyJump`, [`Port forwarding`](/glossary#p), `scp`

## External refs

- [SSH Mastery (book)](https://mwl.io/nonfiction/tools#ssh) — best practical book by Michael W Lucas
- [SSH config explained](https://linuxize.com/post/using-the-ssh-config-file/) — popular guide
- [Mozilla OpenSSH Guidelines](https://infosec.mozilla.org/guidelines/openssh) — security best practices

---

**Попередньо:** [← 7. tmux](/module-0/7-tmux) | **Наступне:** [⭐ Final quiz →](/module-0/final-quiz)
