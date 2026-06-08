import{C as s,o as n,c as o,a5 as e,E as r}from"./chunks/framework.CW28V7p_.js";const h=JSON.parse('{"title":"3. MEV, Jito, BAM","description":"","frontmatter":{},"headers":[],"relativePath":"module-7/3-mev-jito.md","filePath":"module-7/3-mev-jito.md","lastUpdated":1780937944000}'),l={name:"module-7/3-mev-jito.md"},u=Object.assign(l,{setup(d){const i={id:"m7-3-mev-jito",title:"🧠 Mini-check: MEV/Jito",intro:"2 питання.",questions:[{type:"explain",q:"Що таке MEV і як Jito extracts value для validators?",ideal:`MEV (Maximum Extractable Value) — value extractable from ordering/inclusion/exclusion TXs у blocks. Examples:
- Arbitrage between DEXes
- Liquidations
- Front-running
- Sandwich attacks

Jito mechanism:
1. Searchers (algorithmic traders) discover MEV opportunities, build bundles (multiple TXs that should execute together)
2. Searchers submit bundles до Jito's block engine, paying tips
3. Block engine forwards bundles до Jito-relay
4. Jito-Solana validator includes bundles у its blocks (instead of mempool ordering)
5. Validator earns tips від bundles (50% goes to validator, 50% to stakers/delegators)

Jito-Solana — fork agave with MEV functionality. Validators run Jito client замість vanilla agave. Tips паралельно до inflation rewards.

Mainstream mainnet: ~50%+ stake on Jito-Solana. LumLabs eligible BAM validator (per memory).`,explanation:"Module 7.3."},{type:"mcq",q:"BAM (Block Assembly Marketplace, JIP-37/JIP-31):",options:["Jito's permissioned block-building marketplace","Eligible validators receive subsidy + tips з BAM block builders","LumLabs eligible mainnet BAM validator","Replaces SFDP delegation program"],correct:[0,1,2],explanation:"BAM separate from SFDP. JIP-31/37 cash subsidy (ended Sept 30 2026), JIP-28 ongoing JitoSOL delegation. Module 7.3."}]};return(p,a)=>{const t=s("Quiz");return n(),o("div",null,[a[0]||(a[0]=e("",37)),r(t,{data:i}),a[1]||(a[1]=e("",6))])}}});export{h as __pageData,u as default};
