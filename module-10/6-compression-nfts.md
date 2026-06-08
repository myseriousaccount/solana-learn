<script setup>
const quiz = {
  id: 'm10-6-compression',
  title: '🧠 Mini-check: Compression',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'Чому compression critical для NFT scaling?',
      options: [
        'Standard NFT: ~0.012 SOL each для rent + metadata. 1M NFTs = 12,000 SOL impossible',
        'Compressed NFT: ~0.00001 SOL each. 1M NFTs = 10 SOL feasible',
        'Compression uses Merkle trees — store hash of millions tokens у single account',
        'Same DEX trading works for both compressed/standard'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'Compression dramatically reduces cost. Trading abstracted by tooling. Module 10.6.'
    },
    {
      type: 'explain',
      q: 'Як compression (cNFTs) works on high level?',
      ideal: 'Standard NFT: each NFT = individual on-chain account (mint + metadata + ATA per owner). Costs add up.\n\nCompressed NFT (cNFT): use **state compression** via Merkle trees:\n1. Single Merkle tree account stores root hash представляє up to billion+ NFTs\n2. Individual NFT data stored OFF-CHAIN (IPFS, Arweave) + proof tree position\n3. Operations (transfer, sell) update Merkle root via tree proof\n4. RPC indexers cache off-chain data, serve до wallets/marketplaces\n\nResult:\n- Cost: ~0.00001 SOL per NFT (1000x cheaper than standard)\n- Trade-off: proof needed для each operation\n- Trust: RPC providers reliable\n\nUse cases: gaming NFTs (millions of items), loyalty programs, ticketing, identity badges.\n\nMajor platforms (Magic Eden, Tensor) support cNFTs natively now.',
      explanation: 'Module 10.6.'
    }
  ]
}
</script>

# 6. Compression & cNFTs

## TL;DR

**State compression** — Solana technique storing data у Merkle trees замість individual accounts. **cNFTs** (compressed NFTs) — primary use case, reducing cost від ~0.012 SOL per NFT до ~0.00001 SOL (1000x cheaper). Enables million-scale NFT collections impossible раніше.

## Why compression

Standard SPL NFT (Module 2.4):
- Mint account: ~0.0015 SOL rent
- Metadata account: ~0.005 SOL rent
- ATA for each owner: ~0.002 SOL rent

Per NFT ≈ 0.0085 SOL + metadata. 1M NFTs = ~8,500 SOL ($~1.7M at $200/SOL). Не feasible для large collections.

cNFT cost: ~0.00001 SOL per NFT. 1M NFTs = 10 SOL ($2,000). Affordable.

## Merkle tree mechanism

**Merkle tree** — binary tree з hash combinations:

```
                    Root hash
                   /         \
              Hash(A,B)     Hash(C,D)
              /    \         /    \
          Hash A  Hash B  Hash C  Hash D
            |      |       |       |
          NFT 1  NFT 2  NFT 3  NFT 4
```

On-chain: tree account stores **only root hash + tree metadata**. Compact representation.

Off-chain: each NFT's actual data (image URL, attributes, owner) lives у indexer database/IPFS.

Operations:
- **Mint**: append NFT to tree, update root hash
- **Transfer**: provide Merkle proof + new owner, recompute root
- **Sell**: similar, з marketplace logic

Costs:
- Tree account once: ~0.5 SOL (variable based on capacity)
- Per NFT mint: minimal (just tree update)
- Per transfer: minimal

Capacity examples:
- Tree depth 14, branching factor 8 = ~16k NFTs, cost ~0.5 SOL setup
- Tree depth 20, larger = millions NFTs, larger setup

## RPC indexer dependency

Critical implication: cNFT operations require **off-chain index**:

- RPC provider runs indexer caching off-chain NFT data + Merkle proofs
- Wallets/marketplaces query indexer для display NFTs
- Trust assumption: indexer accurate

Major indexers:
- **Helius**: most popular cNFT indexer
- **Triton One**: similar
- **Custom indexers**: large operators run own

Якщо all indexers down → cNFTs effectively invisible (data on-chain still valid, just hard access). Compare standard NFT: anyone can query account directly.

## Use cases

**Gaming**: millions of in-game items
- Sandbox-style metaverse assets
- Card collections (TCG-style)
- Item drops у MMOs

**Loyalty**: brand rewards
- Coffee shop punch cards
- Airline miles
- Gaming achievement systems

**Ticketing**: events
- Concert tickets
- Conference badges
- Time-limited access tokens

**Identity**: badges, certificates
- Educational credentials
- Conference attendance
- Membership proofs

## Operator implications

For validators: cNFT operations look like normal TXs (just specific programs called). No validator-side handling needed.

For RPC nodes: indexer integration valuable revenue stream (Helius makes значну часть income з cNFT indexing).

## Marketplaces support

Major Solana NFT marketplaces support cNFTs natively:
- Magic Eden
- Tensor
- Hyperspace
- DRiP (large drops use compression by default)

Listings, trades, royalties same UX as standard NFTs (abstracted by tooling).

## Connect to your work

LumLabs validator unaffected — same TX processing. If LumLabs ever runs RPC node — consider Helius/Triton partnership for cNFT indexer services.

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`State compression`](/glossary#s), [`cNFT`](/glossary#c), [`Compressed NFT`](/glossary#c), [`Merkle tree`](/glossary#m), [`Merkle proof`](/glossary#m)

## External refs

- [Helius: cNFT guide](https://www.helius.dev/blog/compressed-nfts)
- [Solana docs: State Compression](https://solana.com/developers/courses/state-compression)

---

**Попередньо:** [← 5. Snapshot mirror](/module-10/5-snapshot-mirror) | **Наступне:** [7. Oracles →](/module-10/7-oracles)
