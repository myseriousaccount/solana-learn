import{C as t,o as n,c as l,a5 as i,E as r}from"./chunks/framework.CW28V7p_.js";const k=JSON.parse('{"title":"1. Geyser plugins & RPC nodes","description":"","frontmatter":{},"headers":[],"relativePath":"module-10/1-geyser-rpc.md","filePath":"module-10/1-geyser-rpc.md","lastUpdated":1780937944000}'),o={name:"module-10/1-geyser-rpc.md"},g=Object.assign(o,{setup(h){const a={id:"m10-1-geyser",title:"🧠 Mini-check: Geyser",intro:"2 питання.",questions:[{type:"mcq",q:"Geyser plugin do what?",options:["Streams account changes, TXs, slots live from validator","Enable replacing standard RPC","Add custom programs до validator","Power indexers, dashboards, real-time analytics"],correct:[0,3],explanation:"Geyser = streaming pipeline. Не replaces RPC, не custom programs. Module 10.1."},{type:"explain",q:"Чому RPC nodes часто running Geyser plugins?",ideal:`RPC nodes are entry point для apps querying validators. Standard RPC методи answer "what is state of account X now?" Geyser additionally streams REAL-TIME notifications: "account X changed", "new block arrived", "TX with signature Y included".

This powers:
- Real-time UIs (Phantom wallet showing live balance changes)
- Indexers (databases tracking all NFT mints, all DEX trades, etc.)
- Bots (arbitrage, MEV, liquidation, monitoring)
- Analytics platforms

Without Geyser apps мусили б poll RPC every second — high latency, high RPC load. Geyser pushes — faster + more efficient.

Providers як Helius/Triton run Geyser-enabled RPC nodes commercially.`,explanation:"Module 10.1."}]};return(p,s)=>{const e=t("Quiz");return n(),l("div",null,[s[0]||(s[0]=i("",25)),r(e,{data:a}),s[1]||(s[1]=i("",6))])}}});export{k as __pageData,g as default};
