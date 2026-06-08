<script setup>
const quiz = {
  id: 'm10-1-geyser',
  title: '🧠 Mini-check: Geyser',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'Geyser plugin do what?',
      options: [
        'Streams account changes, TXs, slots live from validator',
        'Enable replacing standard RPC',
        'Add custom programs до validator',
        'Power indexers, dashboards, real-time analytics'
      ],
      correct: [0, 3],
      explanation: 'Geyser = streaming pipeline. Не replaces RPC, не custom programs. Module 10.1.'
    },
    {
      type: 'explain',
      q: 'Чому RPC nodes часто running Geyser plugins?',
      ideal: 'RPC nodes are entry point для apps querying validators. Standard RPC методи answer "what is state of account X now?" Geyser additionally streams REAL-TIME notifications: "account X changed", "new block arrived", "TX with signature Y included".\n\nThis powers:\n- Real-time UIs (Phantom wallet showing live balance changes)\n- Indexers (databases tracking all NFT mints, all DEX trades, etc.)\n- Bots (arbitrage, MEV, liquidation, monitoring)\n- Analytics platforms\n\nWithout Geyser apps мусили б poll RPC every second — high latency, high RPC load. Geyser pushes — faster + more efficient.\n\nProviders як Helius/Triton run Geyser-enabled RPC nodes commercially.',
      explanation: 'Module 10.1.'
    }
  ]
}
</script>

# 1. Geyser plugins & RPC nodes

## TL;DR

**Geyser** — Solana's plugin system для streaming live data з validator. Plugins receive callbacks: account changes, slot updates, TXs, blocks — у real-time. Powers indexers, dashboards, real-time UIs.

**RPC nodes** vs **validator nodes**: RPC = no voting, full RPC + historical data. Validator = voting. Many RPC providers run Geyser plugins для enhanced data services.

## Geyser plugin model

Validator loads plugin (compiled `.so` library) at startup. Plugin implements callbacks:

```rust
trait GeyserPlugin {
    fn update_account(&self, account: &AccountInfo, slot: u64, is_startup: bool);
    fn update_slot_status(&self, slot: u64, parent: u64, status: SlotStatus);
    fn notify_transaction(&self, transaction: &TransactionInfo, slot: u64);
    fn notify_block_metadata(&self, blockinfo: &BlockInfo);
    // ...
}
```

Validator fires callbacks events occur. Plugin processes:
- Index data до database
- Push до Kafka/Redis pipeline
- Filter + forward до WebSocket subscribers
- Custom monitoring

### Setup

```bash
# Configure plugin у validator startup
agave-validator \
    --geyser-plugin-config /path/to/geyser-config.json \
    [other flags]
```

Config JSON specifies plugin location + plugin-specific settings.

### Common plugins

| Plugin | Use case |
|---|---|
| **Solana Geyser PostgreSQL** | Index до Postgres database |
| **Solana Geyser Kafka** | Stream до Kafka topics |
| **Helius Geyser** | Powers Helius RPC services |
| **Triton One Yellowstone** | gRPC streaming framework |

## RPC nodes

**RPC node** = validator з `--no-voting` (doesn't vote) + RPC enabled (`--rpc-port`).

Differences від voting validator:
- No vote account, no stake
- Full ledger storage (for queries)
- Possibly extra RAM/disk для serving queries
- Possibly Geyser plugins для real-time streams

Major RPC providers:
- **Helius**: largest, best Solana-specific features
- **Triton One**: high-performance, low latency
- **QuickNode**: multi-chain, easy setup
- **Alchemy**: developer-focused

Free tier на public endpoints (`api.mainnet-beta.solana.com`) heavily rate-limited. Production apps pay для dedicated RPC.

## Connect to your work

LumLabs runs validators (voting), не dedicated RPC nodes. But knowing Geyser/RPC contexts useful коли:
- Apps integrate з validator data
- Debug RPC issues (rate limits, slowness)
- Choose RPC provider для tools

## Mini-quiz

<Quiz :data="quiz" />

## Glossary

[`Geyser`](/glossary#g), [`RPC node`](/glossary#r), [`Yellowstone`](/glossary#y), [`Helius`](/glossary#h), [`Triton One`](/glossary#t)

## External refs

- [Anza: Geyser Plugins](https://docs.anza.xyz/validator/geyser)
- [Helius docs](https://docs.helius.dev)

---

**Наступне:** [2. Snapshots →](/module-10/2-snapshots)
