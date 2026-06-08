import{C as i,o as n,c as o,a5 as r,E as s}from"./chunks/framework.CW28V7p_.js";const p=JSON.parse('{"title":"5. Firedancer (alternative validator client)","description":"","frontmatter":{},"headers":[],"relativePath":"module-6/5-firedancer.md","filePath":"module-6/5-firedancer.md","lastUpdated":1780937944000}'),l={name:"module-6/5-firedancer.md"},g=Object.assign(l,{setup(d){const a={id:"m6-5-firedancer",title:"🧠 Mini-check: Firedancer",intro:"2 питання.",questions:[{type:"compare",q:"Agave (Rust) vs Firedancer (C)?",ideal:`Agave — Solana's original/primary validator client. Rust-based. Maintained by Anza. Most validators use це. Battle-tested mainnet.

Firedancer — alternative client written from scratch by Jump Crypto. C language (some Rust components, "Frankendancer" hybrid у production transition phase). Massive performance focus.

Key differences:
1. Language: Rust vs C — different memory safety models
2. Architecture: Firedancer extremely modular, separate processes per stage (banking, sigverify, broadcast)
3. Performance: Firedancer benchmarks 100k+ TPS у lab (vs agave 3-5k mainnet effective)
4. Networking: Firedancer custom QUIC implementation, kernel-bypass
5. Maturity: Agave production-stable. Firedancer transitioning ("Frankendancer" partial deployment, full Firedancer coming)

Why matters: client diversity = network resilience. Якщо all run agave і agave bug — cluster halts. Multi-client (agave + firedancer) = independent code paths catch issues.

Goal: ~50% mainnet running each client eventually.`,explanation:"Module 6.5."},{type:"mcq",q:"Як LumLabs має думати про Firedancer adoption?",options:["Wait для production-ready Firedancer release","Test на testnet ascolto coли available","Гibrid: production mainnet on agave, testnet experimentation с Frankendancer","Immediately switch all validators до Firedancer"],correct:[0,1,2],explanation:"Conservative approach. Immediate switch risky. Module 6.5."}]};return(c,e)=>{const t=i("Quiz");return n(),o("div",null,[e[0]||(e[0]=r("",41)),s(t,{data:a}),e[1]||(e[1]=r("",6))])}}});export{p as __pageData,g as default};
