<script setup>
const quiz = {
  id: 'm8-9-oncall',
  title: '🧠 Mini-check: Oncall runbooks',
  intro: '2 питання.',
  questions: [
    {
      type: 'order',
      q: 'Standard incident response order:',
      items: [
        'Acknowledge alert (silence dup notifications)',
        'Assess scope: just us, or cluster-wide?',
        'Mitigate first (stop bleed: rollback, etc.)',
        'Investigate root cause',
        'Document incident, post-mortem'
      ],
      correctOrder: [0, 1, 2, 3, 4],
      explanation: 'Ack → assess → mitigate → investigate → document. Mitigate before deep investigation — stop loss first. Module 8.9.'
    },
    {
      type: 'mcq',
      q: 'Перші steps коли validator delinquent alert fires?',
      options: [
        'Check systemctl status — is process running?',
        'Check journalctl logs — panic/error?',
        'Check cluster — is cluster-wide issue?',
        'Immediately wipe ledger and restart'
      ],
      correct: [0, 1, 2],
      explanation: 'Diagnose first, не destructive operations. Wipe ledger тільки якщо all else fails. Module 8.9.'
    }
  ]
}
</script>

# 9. Oncall runbooks

## TL;DR

Runbook = pre-written step-by-step procedure для common incidents. Documents what to do коли specific alert fires. Critical для consistent response, on-call rotation handoffs, junior operators.

## Incident response framework

Standard order:

1. **Acknowledge** — silence duplicate notifications, claim ownership
2. **Assess** — scope (just us / cluster-wide), severity (critical / warning)
3. **Mitigate** — stop the bleed (rollback, restart, failover)
4. **Investigate** — root cause analysis
5. **Document** — post-incident summary, lessons learned

⚠️ Mitigate BEFORE deep investigation. If validator down — restart first, debug after.

## Runbook template

Each runbook should answer:

```
ALERT NAME: <e.g., ValidatorDelinquent>
SEVERITY: <critical / warning / info>

SYMPTOMS:
  - What user/oncall sees
  - Example: "Telegram bot reports delinquent status"

INITIAL CHECKS (5 min):
  - Specific commands to run
  - Each with expected output / interpretation

LIKELY CAUSES (ordered by frequency):
  1. Cause A → fix steps
  2. Cause B → fix steps
  3. Cause C → fix steps

MITIGATION:
  - Specific recovery steps
  - Rollback procedure якщо relevant

ESCALATION:
  - Who to contact якщо unable to resolve
  - Timeline (e.g., "після 30 min, escalate to <lead>")

POST-INCIDENT:
  - What to document
  - Where to write up
```

## Example: ValidatorDelinquent runbook

```
ALERT: ValidatorDelinquent
SEVERITY: critical

SYMPTOMS:
  - solana validators output shows ⚠ (delinquent) для нашого validator
  - Telegram bot reports "delinquent"
  - Vote credits stop growing

INITIAL CHECKS:
  1. Is process running?
     sudo systemctl status solana
     → "active (running)": process up, look elsewhere
     → "failed": go to "Process failed" section

  2. Cluster issue or just us?
     solana validators --url mainnet-beta | grep -E "Active|Delinquent"
     → Delinquent > 10% globally: cluster-wide problem, не наша fault
     → Delinquent < 5%: our issue

  3. What state are we в?
     curl -s http://localhost:8899 -X POST -H "Content-Type: application/json" \
         -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
     → "Node is behind by N slots": catching up, may recover
     → "Connection refused": validator process not responsive

LIKELY CAUSES:
  1. Network issue (most common)
     → Check ping to entrypoints, gossip peers
     → Check ISP status page

  2. Disk full
     → df -h /home/solana/solana/ledger
     → Якщо < 50GB: clean old snapshots або add storage

  3. OOM kill
     → sudo journalctl -u solana | grep -i "out of memory"
     → Якщо так: add swap або більше RAM

  4. Software bug (recent upgrade?)
     → If upgraded recently → rollback per §4 Phase 6

  5. Hardware degradation
     → Run smartctl на NVMe (`smartctl -a /dev/nvme0`)
     → Look for errors/wear

MITIGATION:
  1. Якщо process not running → systemctl restart solana
  2. Якщо catching up (rare): wait 5-30 min
  3. Якщо software issue: rollback до previous version
  4. Якщо hardware issue: failover до backup server (якщо є)

ESCALATION:
  - After 15 min no recovery → notify team lead
  - After 1 hour → consider declaring incident
  - After 4 hours → consider stake migration до backup validator

POST-INCIDENT:
  - Write up у incidents/ folder
  - Update runbook if new patterns discovered
  - If significant downtime: notify delegators
```

## Common runbooks для LumLabs validator

### 1. ValidatorDelinquent (above)

### 2. HighSkipRate

```
SYMPTOMS: Skip rate jumped > 10%

CHECKS:
  - solana validators | grep YOUR_IDENTITY (offset from current)
  - sudo journalctl -u solana | grep -i "skip"
  - ps aux + htop (CPU/RAM saturation)
  - iostat (disk I/O bottleneck)

CAUSES:
  1. Resource saturation (CPU/RAM)
  2. Network degradation
  3. Disk slow (NVMe wearing out?)
  4. Recent software upgrade regression

MITIGATION:
  - Resource: upgrade hardware або move validator
  - Network: switch ISP / move datacenter
  - Disk: replace NVMe
  - Software: rollback per §4
```

### 3. ClusterRestartAnnounced

```
SYMPTOMS: Anza/Ashwin announces cluster restart у Discord

ACTIONS:
  1. Read announcement carefully (genesis hash, version)
  2. Check if we are у new genesis (validator list)
     - If YES: follow cheatsheet §3 in-genesis flow
     - If NO: follow §3 out-of-genesis flow (chats Tim про delegation)
  3. Backup keypairs (cheatsheet §3 Phase 0)
  4. Execute restart procedure
  5. Verify post-restart per §4 Phase 5
  6. Monitor for first epoch
```

### 4. DiskFull

```
SYMPTOMS: < 50GB free /home/solana/solana/ledger

ACTIONS:
  1. List old snapshots:
     sudo ls -lhS /home/solana/solana/ledger/snapshot-* | head -20
  2. Delete oldest (keep latest 2-3 full + latest incremental):
     sudo rm /home/solana/solana/ledger/snapshot-OLD_SLOT-*
  3. Adjust validator snapshot retention via --maximum-snapshots-to-retain N
  4. Long-term: add storage capacity
```

### 5. NewVersionUpgrade

```
SYMPTOMS: New agave version released

ACTIONS:
  1. Read release notes (breaking changes? feature flags?)
  2. Wait 24-48h for community feedback (Discord, Twitter)
  3. Test на testnet first (якщо production-level change)
  4. Schedule mainnet upgrade у off-peak hours
  5. Follow cheatsheet §4 routine upgrade procedure
  6. Monitor closely first 1-2 hours
```

## Incident log structure

Maintain `incidents/` folder у team docs:

```
incidents/
├── 2026-06-02-alpenglow-cluster-restart.md
├── 2026-05-23-bot-credits-bug.md
├── 2026-04-15-mainnet-skip-rate-spike.md
└── ...
```

Each file:

```markdown
# Incident YYYY-MM-DD: <short title>

**Date**: 2026-06-08
**Duration**: 14:23 - 15:47 UTC (~1h 24m)
**Severity**: Warning
**Author**: Yeva

## Summary
<2-3 sentences what happened>

## Timeline
- 14:23 — Alert fired: ValidatorDelinquent
- 14:25 — Acknowledged, started investigation
- 14:30 — Identified: disk full
- 14:45 — Deleted old snapshots, freed 200GB
- 15:00 — Validator caught up
- 15:47 — Confirmed back to normal voting

## Root Cause
<technical explanation>

## What Went Well
- Alert fired quickly
- Runbook had exact remediation steps

## What Didn't Go Well
- We should have monitored disk free more proactively
- Runbook didn't say which snapshots safe to delete

## Action Items
- [ ] Add disk free monitoring at 70% threshold (warning)
- [ ] Update DiskFull runbook з safe deletion criteria
- [ ] Schedule monthly disk capacity review
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Runbook`](/glossary#r), [`Incident response`](/glossary#i), [`Post-mortem`](/glossary#p), [`SEV`](/glossary#s)

---

**Попередньо:** [← 8. Monitoring stack](/module-8/8-monitoring-stack)
