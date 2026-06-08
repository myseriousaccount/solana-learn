<script setup>
const quiz = {
  id: 'm8-3-monitoring',
  title: '🧠 Mini-check: Monitoring',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього важливо моніторити для validator?',
      options: [
        'Vote credits (growing per epoch)',
        'Delinquent status (binary)',
        'Slot lag vs cluster max',
        'System resources (RAM, disk, CPU)'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'Всі critical metrics. Module 8.3.'
    },
    {
      type: 'compare',
      q: 'Push vs pull alerting?',
      ideal: 'Push: alert active sends message коли threshold violated. Examples: Telegram bot (your setup), Slack webhook, PagerDuty.\n- + Low latency (immediate notification)\n- + No infrastructure якщо use external service\n- - Bot/service single point failure\n\nPull: external monitoring service queries validator periodically. Examples: stakewiz.com, validator.app, Zabbix.\n- + Centralized dashboards across many validators\n- + Survives validator down (still detects, will alert)\n- - Polling latency (typically 30-60s)\n\nBest practice: BOTH. Push для immediate (validator-side bot). Pull для cross-check (external service).\n\nYour LumLabs setup: Telegram monitor bot (push) + likely stakewiz/validator.app (pull) для belt+suspenders.',
      explanation: 'Module 8.3.'
    }
  ]
}
</script>

# 3. Monitoring & alerting

## TL;DR

Validators need 24/7 monitoring (production runs around clock). Core metrics: **vote credits trending**, **delinquent status**, **slot lag vs cluster**, **system resources**. Push alerting (Telegram/Slack) + pull dashboards (stakewiz, validator.app) — defense in depth.

## What to monitor

### Validator-level metrics

| Metric | Why | Alert threshold |
|---|---|---|
| **Vote credits growing** | Validator actually voting | No growth у 5 min |
| **Delinquent flag** | Vote authority active | Set true |
| **Skip rate** | Performance | > 10% |
| **Slot lag vs cluster** | Catching up indicator | > 100 slots behind |
| **Identity balance** | Pay vote fees | < 1 SOL |
| **Process running** | systemd active | Not running |

### System-level metrics

| Metric | Why | Alert threshold |
|---|---|---|
| **CPU usage** | Bottleneck | > 80% sustained |
| **RAM usage** | OOM risk | > 90% |
| **Disk free** | Ledger growth | < 100 GB free |
| **Disk I/O wait** | Performance issue | > 20% |
| **Network bandwidth** | Throughput | > 80% of capacity |

### Cluster-level (less critical, awareness)

- Cluster total delinquent stake
- Average skip rate cluster-wide
- Cluster halt threshold

## Push alerting (your Telegram bot)

Per memory `lumlabs_alpenglow_monitor_bot.md`:

- Telegram bot на validator server
- Sends Final Reports periodically
- Detected bug 2026-05-23: credits showing `?` (fixed)

Setup pattern:

```bash
# Cron job que executes monitoring script
*/5 * * * * /home/devops_ssh/monitor.sh

# Script queries validator state, formats message, sends to Telegram
```

### Telegram bot improvements (TBD from memory)

- Alert deduplication (avoid spam if same issue persists)
- Timeouts on solana CLI calls
- Single-instance lock (avoid concurrent runs)

## Pull dashboards

External services scrape Solana RPC + display:

- **stakewiz.com** — comprehensive validator dashboard
- **validator.app** — operator-focused, more detail
- **solanabeach.io** — explorer + validator views
- **solscan.io** — explorer

Add твій validator pubkey → continuous monitoring without infrastructure setup.

## Alert channels

```
Critical (page oncall immediately):
  - Validator delinquent
  - Identity balance < 1 SOL (vote fees risk)
  - Process not running

Warning (notify, не page):
  - Skip rate > 5%
  - Disk free < 200 GB
  - High CPU/RAM sustained

Info (digest daily):
  - Vote credits per epoch summary
  - Cluster stats
  - Performance trends
```

## Connect to your work

### Daily routine

1. Check Telegram bot Final Report (push)
2. Glance stakewiz validator page (pull)
3. SSH дo сервер, quick check:
   ```bash
   sudo systemctl status solana | head -3
   sudo /home/solana/ag/bin/solana balance DSDefivSL... --url http://localhost:8899
   free -h
   df -h /home/solana/solana/ledger
   ```

### Weekly

- Skip rate trend (week-over-week)
- Vote credits trend
- System resource usage trend
- Software version vs cluster norm

### Monthly

- Backup verification
- Key rotation review (if any)
- Cost/income analysis

## Mini-quiz

<Quiz :data="quiz" />

## Glossary

[`Monitoring`](/glossary#m), [`Alerting`](/glossary#a), [`Push alert`](/glossary#p), [`Pull dashboard`](/glossary#p)

## External refs

- [Stakewiz](https://stakewiz.com)
- [Validator.app](https://www.validators.app)

---

**Попередньо:** [← 2. Backups](/module-8/2-backups) | **Наступне:** [4. Upgrade safety →](/module-8/4-upgrade-safety)
