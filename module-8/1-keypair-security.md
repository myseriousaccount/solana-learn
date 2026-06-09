<script setup>
const quiz = {
  id: 'm8-1-keypair',
  title: '🧠 Mini-check: Keypair hygiene',
  intro: '3 питання — security critical.',
  questions: [
    {
      type: 'mcq',
      q: 'Які 3 keys validator потребує (per cheatsheet §Constants)?',
      options: ['Identity keypair', 'Vote account keypair', 'Stake keypair', 'Withdrawer key (separate from above)'],
      correct: [0, 1, 2, 3],
      explanation: 'Identity, vote, stake, plus withdrawer authority (separate cold key best practice). Module 8.1.'
    },
    {
      type: 'explain',
      q: 'Чому withdrawer authority має бути cold key separate від identity?',
      ideal: 'Identity та vote authority keys live на validator server (hot). Used continuously by software для signing vote TXs.\n\nIf server compromised (SSH breach, malware, etc.):\n- Attacker can sign votes (limited damage — vote authority вже there)\n- Attacker can spend identity SOL balance\n- BUT: cannot drain vote account rent reserve or change commission IF withdrawer authority separate (cold storage)\n\nWith withdrawer compromise:\n- Drain vote account rent (~0.027 SOL)\n- Change commission to 100% (steal all rewards going forward)\n- Change authorities (lock you out)\n\nThus: withdrawer = CRITICAL key. Should be:\n- Cold storage (offline, hardware wallet)\n- Multisig (Squads) for org treasury\n- Never on validator server\n\nMainnet: separate cold withdrawer always. Testnet/Alpenglow: --allow-unsafe-authorized-withdrawer flag дозволяє same key (testnet only).',
      explanation: 'Module 8.1.'
    },
    {
      type: 'command',
      q: 'Як safely backup identity keypair з сервера WNX0016778 на твій ноутбук?',
      accepts: [
        'scp devops_ssh@WNX0016778:/tmp/validator-keypair-backup-*.json ~/Desktop/',
        'scp devops_ssh@WNX0016778:/home/solana/solana/validator-keypair.json ~/Desktop/'
      ],
      ideal: 'scp devops_ssh@WNX0016778:/tmp/validator-keypair-backup-*.json ~/Desktop/',
      explanation: 'Per §3 Phase 0 cheatsheet: copy to /tmp/ first (with date stamp), then scp from /tmp/. Direct copy від /home/solana/ won\'t работать (permissions 750). Module 8.1.'
    }
  ]
}
</script>

# 1. Keypair hygiene & cold storage

## TL;DR

Validator потребує 3+ keypairs: **identity**, **vote**, **stake** plus authorities. Hot keys (used by software): identity, vote authority. Cold keys (rarely used, high value): withdrawer authority. **Never** use same key for hot + critical operations.

## Концепти

### Keys overview

| Key | Purpose | Hot/Cold |
|---|---|---|
| **Identity keypair** | Validator PoH ticking, fee payer for votes | Hot (на сервері) |
| **Vote authority** | Sign vote TXs | Hot (на сервері) |
| **Stake authority** | Delegate/redelegate stake | Hot (operator) |
| **Withdrawer authority** | Withdraw vote/stake funds, change auths | **COLD** (offline) |

### Hot vs cold separation

**Hot keys**: на validator server, used continuously by software.
- Risk: server compromise → key compromise
- Damage: vote forge (limited), spend identity balance (~few SOL)

**Cold keys**: offline (hardware wallet, multisig, paper backup).
- Used rarely (commission changes, key rotation)
- Damage from compromise: catastrophic (drain vote, change to 100% commission)

Best practice: **withdrawer ALWAYS cold** на mainnet.

### Permission setup

З Module 0.5 — keypairs must mode 600:

```bash
sudo chmod 600 /home/solana/solana/validator-keypair.json
sudo chown solana:solana /home/solana/solana/validator-keypair.json
```

`600` = only owner read+write. Не readable by others.

### Cold withdrawer setup (mainnet)

```bash
# Generate cold key OFFLINE на отдельному машині
solana-keygen new -o cold-withdrawer.json

# Note pubkey
solana-keygen pubkey cold-withdrawer.json

# Store keypair file у safe (hardware vault, encrypted backup, paper)

# When creating vote account, use cold pubkey як withdrawer:
solana create-vote-account vote.json validator.json <COLD_PUBKEY>
# (without --allow-unsafe-authorized-withdrawer — strict mode)
```

### Multisig для org

Better than single cold key — **Squads** multisig:

- Withdrawer = Squads multisig PDA (2-of-3 or 3-of-5)
- Multiple team members hold component keys
- Single compromise insufficient
- Squad UI для proposing/approving operations

Industry standard для validator orgs.

## Connect to your work

### Cheatsheet §3 Phase 0 — backup procedure

```bash
# Per cheatsheet:
sudo cp /home/solana/solana/validator-keypair.json /tmp/validator-keypair-backup-$(date +%Y%m%d).json
sudo cp /home/solana/solana/vote-account-keypair.json /tmp/vote-account-keypair-backup-$(date +%Y%m%d).json
sudo ls -la /tmp/*-keypair-backup-*.json

# Then copy to laptop:
scp devops_ssh@WNX0016778:/tmp/validator-keypair-backup-*.json ~/Desktop/
scp devops_ssh@WNX0016778:/tmp/vote-account-keypair-backup-*.json ~/Desktop/
```

Critical first step before ANY destructive operation.

### Testnet/Alpenglow exception

З §13 cheatsheet:

```bash
solana create-vote-account ... --allow-unsafe-authorized-withdrawer
```

Це OK для testnet/Alpenglow (low stakes). **NEVER** на mainnet (real money).

## Mini-quiz

<Quiz :data="quiz" />

## Glossary

[`Hot key`](/glossary#h), [`Cold key`](/glossary#c), [`Multisig`](/glossary#m), [`Squads`](/glossary#s), [`Withdrawer authority`](/glossary#w)

## Related modules

- [**Module 11.4: Vote history**](/module-11/4-vote-history) — vote_history.bin sync strategies (для Alpenglow) додаються до keypair backup discipline
- [Module 11.5: Identity management](/module-11/5-identity-management) — junk identity pattern, unstaked identity для standby validators
- [Module 8.2: Backups](/module-8/2-backups) — disaster recovery procedure expands keypair backup до cover vote_history under Alpenglow

---

**Наступне:** [2. Backups →](/module-8/2-backups)
