<script setup>
const quiz = {
  id: 'm8-8-monitoring-stack',
  title: '🧠 Mini-check: Monitoring stack',
  intro: '2 питання.',
  questions: [
    {
      type: 'compare',
      q: 'Prometheus pull vs Telegram bot push — у чому practical різниця?',
      ideal: 'Prometheus pull:\n- Scraper jobs query /metrics endpoint validator periodically (~15s default)\n- Centralized data storage у Prometheus DB (TSDB)\n- Grafana дashboards для visualization (graphs, alerts)\n- Survives validator down (still records absence, alerts via Alertmanager)\n- Requires infrastructure: Prometheus server, Grafana, possibly Alertmanager\n- Better for trends/history (weeks/months data retention)\n\nTelegram bot push:\n- Bot runs ON validator, computes status, pushes message\n- No infrastructure beyond Telegram chat\n- Immediate notifications (< 1 sec latency)\n- Limited history (chat scrollback only)\n- Bot dependency: if bot crashes, no alerts\n- Better for immediate operator awareness\n\nProduction setup: BOTH. Prometheus + Grafana для metrics history/trends, Telegram bot для urgent alerts. Defense in depth — independent paths, different failure modes.',
      explanation: 'Module 8.8.'
    },
    {
      type: 'mcq',
      q: 'Які core metrics expose validator до Prometheus?',
      options: [
        'agave-validator вже exposes /metrics endpoint built-in (no extra setup)',
        'Custom exporter potrebnyy для всіх metrics',
        'Validator versions, slot height, vote credits, banking stage timing',
        'System metrics (CPU/RAM/disk) — node_exporter separately'
      ],
      correct: [0, 2, 3],
      explanation: 'agave-validator built-in metrics on /metrics. node_exporter additionally для system metrics. Module 8.8.'
    }
  ]
}
</script>

# 8. Monitoring stack (Prometheus + Grafana)

## TL;DR

Production validator monitoring stack: **Prometheus** scrapes metrics, **Grafana** visualizes, **Alertmanager** notifies. Plus **node_exporter** для system metrics. Validator built-in `/metrics` endpoint exposes Solana-specific stats.

## Architecture

```
   Validator (agave) ──┐
                       ├─ /metrics (Prometheus exposition format)
   node_exporter ──────┘
                       │
                       ↓ scrape every 15s
                  Prometheus server
                  (stores time-series)
                       │
              ┌────────┴────────┐
              ↓                 ↓
         Grafana          Alertmanager
       (dashboards)    (notifications: Slack, Telegram, PagerDuty)
```

## Setup overview

### 1. Enable validator metrics

`agave-validator` exposes Prometheus-compatible metrics на configurable port. Add up systemd unit:

```ini
[Service]
ExecStart=/home/solana/ag/bin/agave-validator \
    ...standard flags... \
    --rpc-port 8899 \
    --enable-rpc-bigtable-ledger-storage \
    [other config]
```

Metrics endpoint default exposed на RPC port path `/metrics`:

```bash
curl http://localhost:8899/metrics | head -50
```

Should output Prometheus exposition format (`metric_name{labels} value`).

### 2. Install Prometheus

```bash
# Ubuntu/Debian
sudo apt install prometheus

# Or docker
docker run -d -p 9090:9090 \
    -v /etc/prometheus:/etc/prometheus \
    prom/prometheus
```

### 3. Configure scrape targets

`/etc/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'solana-validator'
    static_configs:
      - targets: ['localhost:8899']
        labels:
          cluster: 'mainnet'
          validator: 'lumlabs'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
        labels:
          cluster: 'mainnet'
```

Reload:
```bash
sudo systemctl reload prometheus
```

### 4. node_exporter для system metrics

```bash
sudo apt install prometheus-node-exporter
sudo systemctl enable --now prometheus-node-exporter
```

Exposes CPU, RAM, disk, network metrics на port 9100.

### 5. Install Grafana

```bash
sudo apt install grafana
sudo systemctl enable --now grafana-server
```

Access UI: `http://localhost:3000` (default admin/admin, change immediately).

### 6. Add Prometheus як data source

Grafana → Configuration → Data Sources → Add Prometheus → URL `http://localhost:9090`.

### 7. Import Solana dashboards

Pre-built dashboards available:

- **Solana Validator Dashboard**: [Grafana #14122](https://grafana.com/grafana/dashboards/14122)
- **Node Exporter Full**: [Grafana #1860](https://grafana.com/grafana/dashboards/1860) (system metrics)

Grafana → Dashboards → Import → Paste ID.

## Key validator metrics tracked

| Metric | Why |
|---|---|
| `solana_validator_slot_height` | Current slot — should grow |
| `solana_validator_root_slot` | Finalized slot — should grow близько до slot height |
| `solana_validator_processed_slot` | Local processed — should match cluster |
| `solana_validator_vote_credits` | Credits earned this epoch |
| `solana_validator_skipped_slots_total` | Skip count |
| `solana_banking_stage_packets` | TX throughput |
| `solana_replay_stage_replay_slot_time_us` | Replay performance |
| `solana_blockstore_insert_shreds_time_us` | Disk write performance |

System metrics through node_exporter:

| Metric | Why |
|---|---|
| `node_cpu_seconds_total` | CPU usage |
| `node_memory_MemAvailable_bytes` | RAM available |
| `node_filesystem_avail_bytes` | Disk free |
| `node_disk_io_time_seconds_total` | Disk I/O wait |
| `node_network_receive_bytes_total` | Network ingress |

## Alertmanager

Notifies on alert conditions:

```yaml
# /etc/prometheus/alertmanager.yml
route:
  receiver: 'telegram'

receivers:
  - name: 'telegram'
    webhook_configs:
      - url: 'https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>&text=ALERT'
```

Alert rules у Prometheus config (`/etc/prometheus/alerts.yml`):

```yaml
groups:
  - name: solana_validator
    rules:
      - alert: ValidatorDelinquent
        expr: solana_validator_root_slot < solana_cluster_root_slot - 128
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Validator delinquent: root slot far behind cluster"

      - alert: LowSkipRate
        expr: rate(solana_validator_skipped_slots_total[1h]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Skip rate > 10% past hour"

      - alert: HighDiskUsage
        expr: (node_filesystem_avail_bytes{mountpoint="/home/solana/solana/ledger"} / node_filesystem_size_bytes) < 0.2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Less than 20% disk free на ledger"
```

## Connect to your work

### Hybrid setup

- **Telegram bot** (existing): immediate validator-state push notifications
- **Prometheus/Grafana** (proposed): historical trends, system metrics, longer retention

Bot для "validator down NOW" alerts. Stack для "validator skip rate increased gradually past week" trend analysis.

### Cost

Self-hosted: free (compute on existing infra).

Managed alternatives:
- **Grafana Cloud**: free tier, paid scaling
- **Datadog**: integrated APM, more expensive
- **New Relic**: similar

For LumLabs scale (handful of validators), self-hosted sufficient.

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Prometheus`](/glossary#p), [`Grafana`](/glossary#g), [`Alertmanager`](/glossary#a), [`node_exporter`](/glossary#n), [`TSDB`](/glossary#t)

## External refs

- [Prometheus docs](https://prometheus.io/docs/)
- [Grafana docs](https://grafana.com/docs/)
- [Solana validator Grafana dashboard #14122](https://grafana.com/grafana/dashboards/14122)

---

**Попередньо:** [← 7. Treasury multisig](/module-8/7-treasury-multisig) | **Наступне:** [9. Oncall runbooks →](/module-8/9-oncall-runbooks)
