<script setup>
const quiz = {
  id: 'm9-4-validator-side',
  title: '🧠 Mini-check: Validator-side commands',
  intro: '2 питання.',
  questions: [
    {
      type: 'command',
      q: 'Як check catch-up status running validator?',
      accepts: ['sudo /home/solana/ag/bin/agave-validator --ledger /home/solana/solana/ledger catchup', 'agave-validator -l ledger catchup'],
      ideal: 'sudo /home/solana/ag/bin/agave-validator --ledger /home/solana/solana/ledger catchup',
      explanation: 'Module 9.4.'
    },
    {
      type: 'command',
      q: 'Як запустити interactive monitor validator?',
      accepts: ['sudo -u solana /home/solana/ag/bin/agave-validator -l /home/solana/solana/ledger monitor', 'agave-validator -l ledger monitor'],
      ideal: 'sudo -u solana /home/solana/ag/bin/agave-validator -l /home/solana/solana/ledger monitor',
      explanation: 'Module 9.4.'
    }
  ]
}
</script>

# 4. Validator-side commands (agave-validator)

## TL;DR

`agave-validator` binary має sub-commands для validator operator tasks. Most don't query RPC — they interact with running validator via admin socket.

## Version & info

```bash
agave-validator --version            # version info + feature set hash
agave-validator monitor              # interactive dashboard
agave-validator -l /path/to/ledger catchup   # catch-up status
```

## Operations

```bash
# Wait для безпечного restart window
agave-validator -l /path/to/ledger wait-for-restart-window

# Set log filter (без restart)
agave-validator -l /path/to/ledger set-log-filter "warn,solana_runtime=info"

# Get block production stats
agave-validator -l /path/to/ledger block-production
```

## Identity management

```bash
# Change validator identity (без restart)
agave-validator -l /path/to/ledger set-identity new-identity-keypair.json

# Set authorized voter
agave-validator -l /path/to/ledger authorized-voter add new-voter-keypair.json
```

## Snapshots

```bash
# Force create snapshot (для backup/migration)
agave-validator -l /path/to/ledger create-snapshot <SLOT>

# List local snapshots
ls /path/to/ledger/snapshot-*
```

## Plugin management (Geyser)

```bash
# Reload Geyser plugin без restart
agave-validator -l /path/to/ledger plugin reload my-plugin
```

## Mini-quiz

<Quiz :data="quiz" />

---

**Попередньо:** [← 3. Transfers](/module-9/3-transfers) | **Наступне:** [⭐ Final quiz →](/module-9/final-quiz)
