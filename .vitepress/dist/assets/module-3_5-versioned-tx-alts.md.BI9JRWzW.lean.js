import{C as e,o as t,c as l,a5 as a,E as p}from"./chunks/framework.CW28V7p_.js";const k=JSON.parse('{"title":"5. Versioned transactions & Address Lookup Tables","description":"","frontmatter":{},"headers":[],"relativePath":"module-3/5-versioned-tx-alts.md","filePath":"module-3/5-versioned-tx-alts.md","lastUpdated":1780937944000}'),o={name:"module-3/5-versioned-tx-alts.md"},c=Object.assign(o,{setup(r){const i={id:"m3-5-versioned-tx",title:"🧠 Mini-check: Versioned TX & ALTs",intro:"2 питання.",questions:[{type:"compare",q:"Legacy TX vs Versioned TX (V0)?",ideal:`Legacy TX (original Solana format): all account refs as full 32-byte pubkeys у TX account list. Max ~30 accounts per TX (due to 1232 byte size limit).

Versioned TX (V0, default since 2023):
- Backward compatible (legacy TXs still work)
- Adds Address Lookup Table (ALT) support: account refs as 1-byte indexes у pre-published ALT account
- Result: ~256 accounts fit per TX (vs ~30 legacy)
- Smaller TX size коли using ALTs (1 byte per ref vs 32 bytes)
- Enables complex DeFi: aggregators (Jupiter) touching 30+ accounts via 4-5 ALTs

Developers typically use SDK V0 builder. Users transparent — wallets handle both formats.`,explanation:"Module 3.5."},{type:"mcq",q:"Address Lookup Table (ALT) usefulness?",options:["Compress account references у TX (1 byte vs 32 bytes per account)","Allow 256+ accounts у one TX (vs ~30 legacy)","Pre-published lookup table account holds account list","Required for простих SOL transfers"],correct:[0,1,2],explanation:"ALTs optional. Simple TXs don't need them. Module 3.5."}]};return(h,s)=>{const n=e("Quiz");return t(),l("div",null,[s[0]||(s[0]=a("",44)),p(n,{data:i}),s[1]||(s[1]=a("",6))])}}});export{k as __pageData,c as default};
