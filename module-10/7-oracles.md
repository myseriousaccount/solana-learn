<script setup>
const quiz = {
  id: 'm10-7-oracles',
  title: '🧠 Mini-check: Oracles',
  intro: '2 питання.',
  questions: [
    {
      type: 'compare',
      q: 'Pyth vs Switchboard?',
      ideal: 'Pyth: institutional-focused price oracle. First-party data publishers (Jane Street, Hudson River, Wintermute, etc.) push prices directly. Pull-based — apps fetch latest при потребі. Very low latency (sub-second updates). Focus: financial market data (stocks, FX, crypto).\n\nSwitchboard: general-purpose oracle. Decentralized network of node operators (anyone can become operator). Push + pull modes. Broader data types: prices, sports scores, weather, custom feeds. More permissionless than Pyth.\n\nDifferences summary:\n- Trust: Pyth institutional, Switchboard decentralized\n- Data: Pyth financial markets, Switchboard general\n- Latency: Pyth sub-second, Switchboard variable\n- Cost: Pyth pay-per-update, Switchboard free for many feeds\n\nMost DeFi апплікації use one or both. Major use: price feeds для perp DEXes, lending protocols.',
      explanation: 'Module 10.7.'
    },
    {
      type: 'mcq',
      q: 'Чому oracles need consensus mechanism?',
      options: [
        'Single oracle publisher = single point of failure / manipulation',
        'Aggregation (median, average) of multiple publishers more robust',
        'Outliers detected/excluded automatically',
        'On-chain consensus required for every TX'
      ],
      correct: [0, 1, 2],
      explanation: '#4 не специфічна про oracles. Module 10.7.'
    }
  ]
}
</script>

# 7. Oracles (Switchboard, Pyth)

## TL;DR

**Oracles** = bridges від off-chain data (prices, sports scores, weather) до on-chain. Solana has two major: **Pyth** (institutional financial data, sub-second latency) і **Switchboard** (general purpose, decentralized network).

Critical infrastructure для DeFi (DEXes, lending, perpetuals).

## Why oracles

Smart contracts on-chain can't access external data directly. Need:
- BTC price for liquidations
- ETH/USD для cross-chain
- TSLA stock price для perp trading
- Sports scores для prediction markets
- Weather для insurance contracts

Oracle = trusted source pushing data on-chain.

Challenge: single oracle = single point of failure (manipulation, downtime). Solution: aggregation.

## Pyth

Institutional-grade oracle для financial market data.

### Architecture

- **First-party publishers**: institutional trading firms (Jane Street, Wintermute, Hudson River, ~80+ firms) publish prices directly
- **Aggregation**: medianizer combines submissions, removes outliers
- **Pull-based**: apps fetch current price коли needed (не constant push)
- **Confidence interval**: each price comes з confidence range (uncertainty estimate)

### Use cases

- Crypto prices (BTC, ETH, SOL, etc.)
- FX rates (EUR/USD, JPY/USD)
- US stocks
- Commodities

### Cost

Pay-per-update model для Solana apps:
- Each price fetch ~0.001 SOL fee
- Highly subsidized for major feeds
- High-frequency apps можуть optimize through batching

### Integration

```rust
// Pseudo-code Rust:
use pyth_sdk_solana::load_price_feed_from_account_info;

let price_feed = load_price_feed_from_account_info(&pyth_btc_account)?;
let price = price_feed.get_price_no_older_than(clock, 60)?; // ≤60s old
let btc_usd = price.price;
let confidence = price.conf;
```

## Switchboard

General-purpose decentralized oracle network.

### Architecture

- **Permissionless node operators**: anyone can run Switchboard node
- **Job definition**: data feed defines source (API endpoint, etc.) + processing logic
- **Crank-based**: anyone can trigger oracle update (cranks)
- **Reward**: nodes paid у SWITCH token

### Use cases

- Crypto prices (similar to Pyth)
- Sports scores
- Weather data
- Random number generation (VRF)
- Custom data feeds

### Cost

- Many feeds free for consumers (oracle operators rewarded by protocol)
- Custom feeds: pay node operators
- VRF requests: small fee

### Integration

```rust
// Switchboard SDK
use switchboard_solana::AggregatorAccountData;

let aggregator: AggregatorAccountData = ctx.accounts.aggregator.load()?;
let value = aggregator.get_result()?;
```

## Comparison

| | Pyth | Switchboard |
|---|---|---|
| Trust model | Institutional (known publishers) | Decentralized (node operators) |
| Data types | Financial markets | General purpose |
| Latency | Sub-second | Variable (seconds) |
| Pricing | Pay-per-update | Often free |
| Setup | Pre-existing feeds | Can create custom |
| Adoption | Most DeFi | Specific use cases |

## DeFi applications using oracles

| App | Oracle | Use |
|---|---|---|
| **Drift Protocol** | Pyth | Perpetual swap pricing |
| **Marginfi** | Switchboard | Lending price feeds |
| **Kamino** | Pyth | Vault pricing |
| **Mango Markets** | Pyth + Switchboard | DEX + perpetuals |
| **Jupiter** | Aggregator (multiple) | Best-price routing |

Major Solana DeFi heavily oracle-dependent. Oracle reliability = DeFi reliability.

## Operator perspective

Як validator: oracle TXs look normal. Just specific programs called. Validator processes them like any other TX.

Як RPC operator (if applicable): may want indexer integration for oracle data lookups.

Якщо building tools / monitoring scripts:
- Pyth: https://docs.pyth.network — SDK availability
- Switchboard: https://docs.switchboard.xyz — SDK + documentation

## Historic oracle failures

Solana ecosystem incidents:
- Mango Markets exploit (Oct 2022): manipulated oracle price → drained funds
- Various smaller exploits: thin oracle markets manipulated

Learnings: use multiple oracles, confidence intervals, slippage protection.

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Oracle`](/glossary#o), [`Pyth`](/glossary#p), [`Switchboard`](/glossary#s), [`Price feed`](/glossary#p), [`Confidence interval`](/glossary#c), [`VRF (Switchboard)`](/glossary#v)

## External refs

- [Pyth Network](https://pyth.network)
- [Switchboard](https://switchboard.xyz)
- [Helius: Solana Oracles](https://www.helius.dev/blog/solana-oracles)

---

**Попередньо:** [← 6. Compression NFTs](/module-10/6-compression-nfts)
