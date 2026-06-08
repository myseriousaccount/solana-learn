<script setup>
const quiz = {
  id: 'm10-5-snapshot-mirror',
  title: '🧠 Mini-check: Snapshot mirror',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'Snapshot mirror використовується для:',
      options: [
        'Public snapshot hosting для community catch-up',
        'Faster catch-up для validators у same region',
        'Backup snapshots до cloud storage',
        'Replace validator\'s own snapshot creation'
      ],
      correct: [0, 1, 2],
      explanation: 'Mirror not replace — validator still creates own. Module 10.5.'
    },
    {
      type: 'explain',
      q: 'Як setup public snapshot mirror з твого validator?',
      ideal: '1. Validator вже creates snapshots у `/home/solana/solana/ledger/snapshot-*` files (default).\n\n2. Choose HTTP server (nginx, caddy, simple Python http.server). Configure для serve snapshot directory.\n\n3. Configure rsync schedule або symlinks щоб latest snapshots available HTTP-accessible path:\n   `ln -sf /home/solana/solana/ledger/snapshot-*.tar.zst /var/www/snapshots/`\n\n4. Publish URL у Discord/community:\n   `https://snapshots.lumlabs.io/snapshot-latest.tar.zst`\n\n5. Others can `wget` your snapshots для catch-up:\n   `wget https://snapshots.lumlabs.io/snapshot-369450000-XYZ.tar.zst -O /home/solana/solana/ledger/snapshot.tar.zst`\n\n6. Consider rate limiting + bandwidth caps щоб не overwhelm your server.\n\nMost validators do це as community contribution. Some run dedicated snapshot servers separately from validators (just download snapshots + serve).',
      explanation: 'Module 10.5.'
    }
  ]
}
</script>

# 5. Snapshot mirror service

## TL;DR

Solana validators create snapshots locally (Module 5.4). **Snapshot mirror** = make these snapshots HTTP-accessible для other validators catching up. Community contribution, reduces gossip-based fetch load.

## Why mirror snapshots

Default snapshot fetch:
- New validator connects to gossip-known peers
- Requests snapshot from those peers
- Peers serve via P2P (using their own RPC ports)

Issues:
- Slow if peers busy
- No централізованих fast download
- Public snapshot URLs (Anza, Helius, third-party) faster

Snapshot mirrors solve: dedicated HTTP servers з recent snapshots, validators download directly.

## Setup overview

### 1. Validator generates snapshots (default)

Already happens. Snapshots в `/home/solana/solana/ledger/snapshot-*.tar.zst`:

```bash
ls -lh /home/solana/solana/ledger/snapshot-* | tail -5
```

### 2. HTTP server installation

Use any web server. Simple nginx config:

```nginx
# /etc/nginx/sites-enabled/snapshots
server {
    listen 80;
    server_name snapshots.lumlabs.io;
    
    root /var/www/snapshots;
    autoindex on;
    
    location ~* \.tar\.zst$ {
        # Optional rate limit
        limit_rate 10m;
        add_header Cache-Control "public, max-age=3600";
    }
}
```

```bash
sudo systemctl reload nginx
```

### 3. Sync snapshots до web root

```bash
mkdir -p /var/www/snapshots
chown www-data:www-data /var/www/snapshots
```

Periodic sync (cron):

```bash
# /etc/cron.d/snapshot-sync
*/5 * * * * root rsync -av --delete \
    /home/solana/solana/ledger/snapshot-*.tar.zst \
    /var/www/snapshots/
```

Або symlinks (instant, no copy):

```bash
ln -sf /home/solana/solana/ledger/snapshot-369450000-XYZ.tar.zst \
       /var/www/snapshots/snapshot-latest.tar.zst
```

(Update symlink when newer snapshot generated.)

### 4. SSL / TLS (let's encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d snapshots.lumlabs.io
```

### 5. Publish

DNS + Discord announcement:

```
https://snapshots.lumlabs.io/snapshot-latest.tar.zst
https://snapshots.lumlabs.io/incremental-snapshot-latest.tar.zst
```

## Consumer side (catch-up)

Validator wanting to use mirror:

```bash
# Stop validator
sudo systemctl stop solana

# Wipe ledger
sudo bash -c "rm -rf /home/solana/solana/ledger/*"

# Download snapshot from mirror
cd /home/solana/solana/ledger
sudo wget https://snapshots.lumlabs.io/snapshot-latest.tar.zst

# Start validator — auto-detects, uses snapshot
sudo systemctl start solana
```

## Existing public mirrors

Major Solana operators run public mirrors:

- **Helius**: https://snapshots.helius-rpc.com
- **Triton One**: snapshot mirrors через RPC services
- **Various validators**: many run mirrors

Check Solana Discord для current list.

## Operational considerations

### Bandwidth

Snapshots large (~80GB mainnet full). Serving до ten validators per day = ~800GB outbound. Plan bandwidth quota accordingly.

### Storage

Keep recent snapshots only. Old snapshots invalid (much catch-up still needed).

```bash
# Retention policy: keep latest 3 full snapshots
find /var/www/snapshots -name "snapshot-*.tar.zst" -mtime +1 -delete
```

### Security

- Read-only access (no upload)
- Rate limiting (avoid DDoS amplification)
- HTTPS only (prevent tampering)

### Performance

Use CDN if global serving. Cloudflare R2 popular для Solana snapshots.

## LumLabs decision

Running snapshot mirror = community contribution.

Pros:
- Goodwill у community
- Helps decentralization (more sources)
- May increase brand visibility

Cons:
- Bandwidth costs
- Operational complexity
- Need monitoring (broken mirrors waste user time)

For LumLabs scale, optional. Larger operators (Helius, etc.) make sense to provide as service.

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Snapshot mirror`](/glossary#s), [`Public snapshot`](/glossary#p)

---

**Попередньо:** [← 4. Governance](/module-10/4-governance) | **Наступне:** [6. Compression NFTs →](/module-10/6-compression-nfts)
