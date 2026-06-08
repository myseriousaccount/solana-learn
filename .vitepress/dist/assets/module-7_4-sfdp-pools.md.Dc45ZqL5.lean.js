import{C as o,o as s,c as n,a5 as e,E as r}from"./chunks/framework.CW28V7p_.js";const h=JSON.parse('{"title":"4. SFDP & stake pools","description":"","frontmatter":{},"headers":[],"relativePath":"module-7/4-sfdp-pools.md","filePath":"module-7/4-sfdp-pools.md","lastUpdated":1780937944000}'),l={name:"module-7/4-sfdp-pools.md"},g=Object.assign(l,{setup(d){const t={id:"m7-4-sfdp-pools",title:"🧠 Mini-check: SFDP & pools",intro:"2 питання.",questions:[{type:"compare",q:"SFDP vs Stake pools (Jito, Marinade)?",ideal:`SFDP (Solana Foundation Delegation Program):
- Anza/Foundation delegates "matching" stake до qualifying validators
- Free для validator (no fee)
- Requires meeting performance + decentralization criteria (geographic, software diversity, performance metrics)
- Significant boost для new validators getting started
- Can be removed якщо performance дроп

Stake pools:
- Smart contracts collecting retail SOL (users mint liquid token: JitoSOL, mSOL, INF, etc.)
- Algorithmically delegate до approved validators
- Pay validator like normal delegation (commission applies)
- Approved validators chosen by pool DAO/manager based on performance criteria
- More transparent than SFDP, governed by tokens (JitoDAO, etc.)

Both provide stake to validators meeting standards. SFDP free + Foundation backed. Pools democratic + community governed.`,explanation:"Module 7.4."},{type:"mcq",q:"Що з цього вірно про StakeNet Steward Config (per memory)?",options:["Validator must meet specific criteria для qualifying у Steward pool","JIP-28 ongoing 100% tier (active stake delegation)","Criteria НЕ те ж саме що JIP-31/37 cash subsidy criteria","Steward Config документація — canonical source для exact thresholds"],correct:[0,1,2,3],explanation:"Steward Config separate from JIPs cash. Critical distinction (per memory feedback). Module 7.4."}]};return(p,a)=>{const i=o("Quiz");return s(),n("div",null,[a[0]||(a[0]=e("",31)),r(i,{data:t}),a[1]||(a[1]=e("",6))])}}});export{h as __pageData,g as default};
