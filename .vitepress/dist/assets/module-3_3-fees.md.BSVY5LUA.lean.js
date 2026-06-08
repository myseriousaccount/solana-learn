import{C as t,o as n,c as o,a5 as s,E as r}from"./chunks/framework.CW28V7p_.js";const c=JSON.parse('{"title":"3. Fees, priority fees, compute budget","description":"","frontmatter":{},"headers":[],"relativePath":"module-3/3-fees.md","filePath":"module-3/3-fees.md","lastUpdated":1780937944000}'),p={name:"module-3/3-fees.md"},u=Object.assign(p,{setup(l){const a={id:"m3-3-fees",title:"🧠 Mini-check: Fees",intro:"3 питання — fee structure.",questions:[{type:"mcq",q:"TX cost на Solana складається з чого? (обери всі)",options:["Base fee: 5000 lamports per signature","Priority fee: optional, payable per CU (compute unit)","Gas refund unused budget назад до user","Rent for new accounts created у TX (якщо є)"],correct:[0,1,3],explanation:"#1: base 5000 lamports/signature (50% burned, 50% to validator). #2: priority fee — optional pay-extra щоб leader prioritized include. #3 НЕПРАВИЛЬНО — Solana не refunds. #4: правильно, rent додається до fee якщо TX creates account."},{type:"scenario",q:"Mainnet congested. Твоя TX (SOL transfer) висить 2 хвилини, не landed. Що зробити щоб мати кращий шанс на landing?",ideal:`Додати priority fee. Базовий fee (5000 lamports) однаковий для всіх TXs — у congestion leader sorts by priority fee per CU. TX без priority fee сидять у "free tier", leader робить їх останніми.

Конкретно:

1. Estimate current priority fee floor через RPC method getRecentPrioritizationFees або через services як Triton/Helius.

2. Add Compute Budget instructions у TX:
   - setComputeUnitLimit(N) — оцінити realistic budget (для transfer ~5000 CU)
   - setComputeUnitPrice(price_per_CU_in_microlamports) — priority bid

3. Sign і submit TX з fresh blockhash (старий expired).

4. Якщо ще не landing — increase price, спробуй знов.

Корисні дашборди для current pricing: helius.dev priority fee tracker, Solscan fee analytics. У congested moments priority fee може стрибнути до 100k-1M lamports per CU.

Якщо TX truly stuck — пересертифікуй з вищим bid замість wait.`,explanation:"Priority fee — основний lever у congestion. Module 3.3."},{type:"command",q:"Як подивитись recent priority fees на mainnet через RPC? Напиши solana CLI команду або curl.",accepts:[`curl -X POST https://api.mainnet-beta.solana.com -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getRecentPrioritizationFees"}'`,"solana fees","solana fees --url mainnet-beta"],ideal:`curl -X POST https://api.mainnet-beta.solana.com -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getRecentPrioritizationFees"}'`,explanation:"getRecentPrioritizationFees — RPC method що повертає samples recent priority fees. solana fees deprecated на user CLI. Module 3.3."}]};return(h,e)=>{const i=t("Quiz");return n(),o("div",null,[e[0]||(e[0]=s("",61)),r(i,{data:a}),e[1]||(e[1]=s("",6))])}}});export{c as __pageData,u as default};
