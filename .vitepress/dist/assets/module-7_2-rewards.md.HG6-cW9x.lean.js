import{C as n,o as t,c as l,a5 as s,E as r}from"./chunks/framework.CW28V7p_.js";const c=JSON.parse('{"title":"2. Inflation & rewards formula","description":"","frontmatter":{},"headers":[],"relativePath":"module-7/2-rewards.md","filePath":"module-7/2-rewards.md","lastUpdated":1780937944000}'),o={name:"module-7/2-rewards.md"},k=Object.assign(o,{setup(p){const i={id:"m7-2-rewards",title:"🧠 Mini-check: Rewards",intro:"2 питання.",questions:[{type:"explain",q:"Поясни formula rewards distribution на mainnet.",ideal:`1. End of epoch: cluster computes total inflation pool (mainnet currently ~5%/year annualized, ramped down ~15% per year).

2. Pool divided proportional to vote credits:
   validator_share = (their_credits / total_credits_all_validators) × inflation_pool

3. validator_share split by commission:
   - operator_income = validator_share × (commission%)
   - delegator_pool = validator_share × (1 - commission%)

4. delegator_pool further split proportional to individual delegator stakes:
   delegator_reward = (their_stake / validator_total_stake) × delegator_pool

Example (numbers approx mainnet):
- Validator with 1M stake, 432k credits earned, 10% commission
- Total cluster: 400M stake, 1.5B credits, inflation pool 110k SOL/epoch
- Validator share: 110k × (432k/1.5B) = 31.7 SOL
- Operator: 3.17 SOL (10%)
- Delegators: 28.5 SOL split proportional до each stake share

Delegator з 100k SOL (10% твого validator) earns 2.85 SOL цей epoch.`,explanation:"Module 7.2."},{type:"mcq",q:"Що з цього збільшує validator income?",options:["Higher commission %","Larger total delegated stake","Higher vote credits earned","Higher transaction fees (priority fees) у блоках"],correct:[0,1,2,3],explanation:"Всі incrementally збільшують income. Commission % — direct. Stake → більше credits possible. Credits → більше inflation share. Fees → bonus revenue (50% leader). Module 7.2."}]};return(d,a)=>{const e=n("Quiz");return t(),l("div",null,[a[0]||(a[0]=s("",25)),r(e,{data:i}),a[1]||(a[1]=s("",6))])}}});export{c as __pageData,k as default};
