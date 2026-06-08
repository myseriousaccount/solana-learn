import{C as t,o as i,c as o,a5 as a,E as r}from"./chunks/framework.CW28V7p_.js";const c=JSON.parse('{"title":"6. Token-2022 (newer token standard)","description":"","frontmatter":{},"headers":[],"relativePath":"module-2/6-token-2022.md","filePath":"module-2/6-token-2022.md","lastUpdated":1780937944000}'),l={name:"module-2/6-token-2022.md"},k=Object.assign(l,{setup(d){const n={id:"m2-6-token-2022",title:"🧠 Mini-check: Token-2022",intro:"2 питання.",questions:[{type:"compare",q:"SPL Token (legacy) vs Token-2022?",ideal:`SPL Token (legacy, TokenkegQ...): original Solana token standard. Simple: mint, transfer, burn, freeze. Most existing tokens use це (USDC, JTO, JitoSOL, etc.).

Token-2022 (TokenzQd...): newer standard supporting "extensions" — opt-in features per token. Extensions include:
- Transfer fees (mint takes % per transfer)
- Confidential transfers (encrypted amounts)
- Interest-bearing tokens (auto-accrue)
- Non-transferable (soul-bound NFTs)
- Default account state (freeze by default)
- Permanent delegate (mint authority always can move tokens)
- Transfer hooks (custom program runs per transfer)
- Metadata pointer (link to NFT metadata)

Ключова різниця: Token-2022 extensible, legacy fixed feature set. Compatibility: not interchangeable — mints either у legacy OR в 2022, не both.

Migration: legacy tokens won't auto-upgrade. New tokens choose either. Most major existing tokens stick з legacy для compatibility.`,explanation:"Module 2.6."},{type:"mcq",q:"Token-2022 use cases де extensions matter:",options:["RWA (real-world assets): need permanent delegate для compliance freeze","Stablecoins: confidential transfers для privacy","Loyalty tokens: non-transferable soul-bound","Interest-bearing instruments: auto-accrue без manual claim"],correct:[0,1,2,3],explanation:"Всі real use cases. Module 2.6."}]};return(h,e)=>{const s=t("Quiz");return i(),o("div",null,[e[0]||(e[0]=a("",65)),r(s,{data:n}),e[1]||(e[1]=a("",6))])}}});export{c as __pageData,k as default};
