import{C as t,o as r,c as n,a5 as i,E as l}from"./chunks/framework.CW28V7p_.js";const c=JSON.parse('{"title":"7. Oracles (Switchboard, Pyth)","description":"","frontmatter":{},"headers":[],"relativePath":"module-10/7-oracles.md","filePath":"module-10/7-oracles.md","lastUpdated":1780937944000}'),o={name:"module-10/7-oracles.md"},k=Object.assign(o,{setup(h){const s={id:"m10-7-oracles",title:"🧠 Mini-check: Oracles",intro:"2 питання.",questions:[{type:"compare",q:"Pyth vs Switchboard?",ideal:`Pyth: institutional-focused price oracle. First-party data publishers (Jane Street, Hudson River, Wintermute, etc.) push prices directly. Pull-based — apps fetch latest при потребі. Very low latency (sub-second updates). Focus: financial market data (stocks, FX, crypto).

Switchboard: general-purpose oracle. Decentralized network of node operators (anyone can become operator). Push + pull modes. Broader data types: prices, sports scores, weather, custom feeds. More permissionless than Pyth.

Differences summary:
- Trust: Pyth institutional, Switchboard decentralized
- Data: Pyth financial markets, Switchboard general
- Latency: Pyth sub-second, Switchboard variable
- Cost: Pyth pay-per-update, Switchboard free for many feeds

Most DeFi апплікації use one or both. Major use: price feeds для perp DEXes, lending protocols.`,explanation:"Module 10.7."},{type:"mcq",q:"Чому oracles need consensus mechanism?",options:["Single oracle publisher = single point of failure / manipulation","Aggregation (median, average) of multiple publishers more robust","Outliers detected/excluded automatically","On-chain consensus required for every TX"],correct:[0,1,2],explanation:"#4 не специфічна про oracles. Module 10.7."}]};return(d,a)=>{const e=t("Quiz");return r(),n("div",null,[a[0]||(a[0]=i("",45)),l(e,{data:s}),a[1]||(a[1]=i("",6))])}}});export{c as __pageData,k as default};
