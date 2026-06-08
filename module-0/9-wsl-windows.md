<script setup>
const quiz = {
  id: 'm0-9-wsl',
  title: '🧠 Mini-check: WSL',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'WSL2 для Solana operator dev environment? (обери всі вірні)',
      options: [
        'WSL2 — full Linux kernel у Windows, fully compatible з Linux Solana tools',
        'WSL1 — translation layer, partial Linux compat (avoid for Solana)',
        'Solana CLI works native у WSL2 same as Ubuntu',
        'Cannot run agave validator у WSL для production'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'WSL2 для дev OK. Production validator should bare-metal Linux, не WSL. Module 0.9.'
    },
    {
      type: 'command',
      q: 'Як install Solana CLI на WSL2 Ubuntu?',
      accepts: [
        'sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"'
      ],
      ideal: 'sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"',
      explanation: 'Same як native Ubuntu — agave-install script. Module 0.9.'
    }
  ]
}
</script>

# 9. WSL & Windows operator setup

## TL;DR

WSL2 (Windows Subsystem for Linux 2) — practical для Solana operator development на Windows. Full Linux kernel + tools compatibility. Mostly transparent. Production validator не на WSL — bare-metal Linux.

## WSL options

| | WSL1 | WSL2 |
|---|---|---|
| Architecture | Translation layer | Full Linux kernel у Hyper-V VM |
| Filesystem perf | Slower | Native Linux ext4 |
| Linux syscalls | Partial | Full |
| Solana compatibility | Spotty | Excellent |
| Recommendation | Avoid | Use |

**Use WSL2** для всього Solana work на Windows.

## Setup WSL2

Windows 10/11:

```powershell
# In PowerShell as Administrator
wsl --install
# Restart computer

# After restart, Ubuntu installed by default
# Set up user during first launch
```

Verify:

```powershell
wsl --status
# Should show: Default Version: 2
```

If WSL1 default:

```powershell
wsl --set-default-version 2
```

## Install Solana tools у WSL2

In WSL2 terminal:

```bash
# Standard agave installer
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Update PATH (зазвичай auto-suggested)
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
# Add до ~/.bashrc для persistence

# Verify
solana --version
# Output: solana-cli X.Y.Z (src:HASH; feat:NUM, client:Agave)
```

## Install Rust + cargo

Якщо need build agave from source:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustc --version
```

## SSH keys у WSL2

```bash
# Generate SSH keypair
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add до ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Show public key для adding to servers
cat ~/.ssh/id_ed25519.pub
```

WSL2 SSH client works same як native Linux.

## tmux у WSL2

```bash
sudo apt install tmux
tmux new -s build
# Same usage як native Linux
```

## File system tips

WSL2 has TWO filesystems:

1. **WSL2 Linux** (fast): `/home/yourname/` — use для projects
2. **Windows mount** (slow): `/mnt/c/Users/...` — accessing Windows files

⚠️ **Never** put Solana ledger у `/mnt/c/`. Slow. Use `/home/yourname/`.

## Limitations vs native Linux

WSL2 не perfect для production validator:

- **Networking**: NAT through Hyper-V — extra layer, не ideal for high-throughput
- **GPU access**: limited (CUDA possible але complex)
- **Memory**: WSL2 reserves significant Windows RAM
- **Performance**: ~5-10% overhead vs bare metal

For LumLabs team members on Windows:

- ✅ Development, CLI work, building, testing — WSL2 fine
- ✅ SSH'ing до production validators — WSL2 fine
- ❌ Running production validator у WSL2 — don't

## Native Windows alternative

Solana CLI tools also work native Windows (without WSL):

```powershell
# Install via PowerShell
cmd /c "curl https://release.anza.xyz/stable/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe --create-dirs"
C:\solana-install-tmp\solana-install-init.exe stable
```

Works but less convenient (PowerShell quirks, path differences). WSL2 more Linux-like, easier transfer skills.

## Recommended workflow для Windows operators

1. Install WSL2 + Ubuntu 22.04
2. Setup Solana CLI у WSL2
3. SSH from WSL2 до production validators
4. Use Windows для browser, communication, daily apps
5. Use WSL2 для Solana CLI, scripts, builds, dev work

## Connect to your work

LumLabs team members на Windows можуть join без switch до Linux laptop. WSL2 sufficient для:
- Running solana CLI commands
- Building agave (slowly — better на mainnet hardware, не WSL)
- SSH'ing to validators
- Reading docs, course materials

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`WSL`](/glossary#w), [`WSL2`](/glossary#w), [`Hyper-V`](/glossary#h)

## External refs

- [Microsoft WSL docs](https://learn.microsoft.com/en-us/windows/wsl/)

---

**Попередньо:** [← 8. SSH](/module-0/8-ssh)
