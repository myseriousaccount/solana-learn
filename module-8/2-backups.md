<script setup>
const quiz = {
  id: 'm8-2-backups',
  title: '🧠 Mini-check: Backups',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього MUST backup для validator?',
      options: ['Identity keypair', 'Vote account keypair', 'Stake keypair(s)', 'AccountsDB / ledger'],
      correct: [0, 1, 2],
      explanation: 'Keys MUST. Ledger/accountsDB recoverable from cluster (via snapshot). Lost keys = lost identity forever. Module 8.2.'
    },
    {
      type: 'scenario',
      q: 'Сервер WNX0016778 hard drive died. Що тобі необхідно щоб restore validator на новий сервер?',
      ideal: '1. Backups identity keypair, vote keypair, stake keypair (з backups на ноутбук/cold storage)\n\n2. New server provisioned, agave installed\n\n3. Copy keypairs до new server:\n   scp ~/validator-keypair-backup-*.json devops_ssh@new-server:/tmp/\n   sudo cp /tmp/...json /home/solana/solana/validator-keypair.json\n   sudo chmod 600 /home/solana/solana/validator-keypair.json\n   sudo chown solana:solana /home/solana/solana/validator-keypair.json\n\n4. Configure solana.service з reference до keypair paths\n\n5. Start validator з no ledger → fetches snapshot з cluster (~30-90 min)\n\n6. Once catches up — voting resumes\n\n7. Validate that vote account still your validator\'s (vote auth still you):\n   sudo solana vote-account YOUR_VOTE | grep Identity\n\nKey insight: без keypair backups — IRRECOVERABLE LOSS. Validator identity gone. Stake delegated до it stuck. Need new validator from scratch (new vote account, lose existing delegations).',
      explanation: 'Module 8.2.'
    }
  ]
}
</script>

# 2. Backups & disaster recovery

## TL;DR

**Backup MUST**: всі keypairs (identity, vote, stake). **Backup NEEDED-MAYBE**: validator config (systemd unit, custom scripts). **Not backup**: ledger/accountsDB (recoverable from cluster snapshots).

Lost keypair = lost identity forever. Stake delegated до validator stuck.

## Концепти

### What to backup

**Critical (MUST backup, store securely)**:

- `/home/solana/solana/validator-keypair.json` (identity)
- `/home/solana/solana/vote-account-keypair.json` (vote)
- `/home/solana/solana/stake-keypair-*.json` (stakes)
- Withdrawer cold key (already cold)

**Useful (backup for convenience)**:

- `/etc/systemd/system/solana.service` (validator config)
- Custom scripts (monitoring bots, helpers)
- `~/.ssh/` (for re-access)

**Recoverable from cluster (no need backup)**:

- Ledger
- AccountsDB
- Snapshots
- Vote account state (lives on chain)

### Backup destinations

Multi-location for resilience:

1. **Local laptop** (encrypted disk) — quick access
2. **Cloud encrypted** (1Password Secure Notes, encrypted S3 bucket) — geographic redundancy
3. **Cold storage** (paper, hardware token у safe) — long-term
4. **Org backup** (1Password Teams, shared vault) — team continuity

### Backup workflow

```bash
# 1. On validator server — copy до /tmp/ (devops_ssh can access tmp)
sudo cp /home/solana/solana/validator-keypair.json /tmp/validator-keypair-backup-$(date +%Y%m%d).json
sudo cp /home/solana/solana/vote-account-keypair.json /tmp/vote-account-keypair-backup-$(date +%Y%m%d).json
sudo cp /home/solana/solana/stake-keypair-1.json /tmp/stake-keypair-1-backup-$(date +%Y%m%d).json

# 2. From laptop — scp
scp devops_ssh@WNX0016778:/tmp/*-keypair-backup-*.json ~/Desktop/

# 3. Upload до 1Password Secure Notes (paste contents)

# 4. Delete /tmp/ copies після successful backup
sudo rm /tmp/*-keypair-backup-*.json
```

### Frequency

- **Keypairs**: at creation + after any rotation. Otherwise unchanged.
- **Config**: after each meaningful change

### Test restore periodically

Backup not tested = unknown if works. Annually:

1. Spin up test server
2. Copy keypair backups
3. Try start agave-validator
4. Verify identity matches expected

## Disaster scenarios

### Hard drive failure

```
Restore steps:
1. New server provisioned
2. Install agave
3. Copy keypair backups
4. Configure systemd unit
5. Start (no ledger → fetch snapshot)
6. Catch-up 30-90 min
7. Resume voting
```

### Whole server compromised

```
Steps:
1. Stop validator (don\'t spread compromise)
2. ROTATE all hot keys immediately:
   - Generate new identity keypair
   - Use cold withdrawer to change vote authorities to new identity
3. Move stake to new vote account (require coordination with delegators)
4. Investigate breach, harden new setup
```

### Key compromise

Hot key (identity, vote auth):
- Damage: limited (vote forge, identity SOL spend)
- Fix: rotate authorities via cold withdrawer

Cold key (withdrawer):
- Damage: catastrophic
- Fix: immediate response — change all authorities, transfer stake elsewhere
- Investigate WHERE cold key leaked

## Connect to your work

Cheatsheet §3 Phase 0 — pre-restart backup mandatory. Same applies before:
- Upgrades
- Server moves
- Cluster restarts
- Any destructive operation

## Mini-quiz

<Quiz :data="quiz" />

## Glossary

[`Backup`](/glossary#b), [`Disaster recovery`](/glossary#d), [`Key rotation`](/glossary#k)

---

**Попередньо:** [← 1. Keypair security](/module-8/1-keypair-security) | **Наступне:** [3. Monitoring →](/module-8/3-monitoring)
