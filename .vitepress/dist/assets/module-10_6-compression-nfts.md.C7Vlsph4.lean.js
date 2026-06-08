import{C as o,o as n,c as i,a5 as a,E as t}from"./chunks/framework.CW28V7p_.js";const m=JSON.parse('{"title":"6. Compression & cNFTs","description":"","frontmatter":{},"headers":[],"relativePath":"module-10/6-compression-nfts.md","filePath":"module-10/6-compression-nfts.md","lastUpdated":1780937944000}'),l={name:"module-10/6-compression-nfts.md"},u=Object.assign(l,{setup(c){const s={id:"m10-6-compression",title:"🧠 Mini-check: Compression",intro:"2 питання.",questions:[{type:"mcq",q:"Чому compression critical для NFT scaling?",options:["Standard NFT: ~0.012 SOL each для rent + metadata. 1M NFTs = 12,000 SOL impossible","Compressed NFT: ~0.00001 SOL each. 1M NFTs = 10 SOL feasible","Compression uses Merkle trees — store hash of millions tokens у single account","Same DEX trading works for both compressed/standard"],correct:[0,1,2,3],explanation:"Compression dramatically reduces cost. Trading abstracted by tooling. Module 10.6."},{type:"explain",q:"Як compression (cNFTs) works on high level?",ideal:`Standard NFT: each NFT = individual on-chain account (mint + metadata + ATA per owner). Costs add up.

Compressed NFT (cNFT): use **state compression** via Merkle trees:
1. Single Merkle tree account stores root hash представляє up to billion+ NFTs
2. Individual NFT data stored OFF-CHAIN (IPFS, Arweave) + proof tree position
3. Operations (transfer, sell) update Merkle root via tree proof
4. RPC indexers cache off-chain data, serve до wallets/marketplaces

Result:
- Cost: ~0.00001 SOL per NFT (1000x cheaper than standard)
- Trade-off: proof needed для each operation
- Trust: RPC providers reliable

Use cases: gaming NFTs (millions of items), loyalty programs, ticketing, identity badges.

Major platforms (Magic Eden, Tensor) support cNFTs natively now.`,explanation:"Module 10.6."}]};return(p,e)=>{const r=o("Quiz");return n(),i("div",null,[e[0]||(e[0]=a("",44)),t(r,{data:s}),e[1]||(e[1]=a("",6))])}}});export{m as __pageData,u as default};
