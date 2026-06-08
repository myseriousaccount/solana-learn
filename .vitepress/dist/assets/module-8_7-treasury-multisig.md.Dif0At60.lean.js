import{C as t,o as r,c as l,a5 as s,E as n}from"./chunks/framework.CW28V7p_.js";const p=JSON.parse('{"title":"7. Treasury multisig (Squads)","description":"","frontmatter":{},"headers":[],"relativePath":"module-8/7-treasury-multisig.md","filePath":"module-8/7-treasury-multisig.md","lastUpdated":1780937944000}'),o={name:"module-8/7-treasury-multisig.md"},c=Object.assign(o,{setup(d){const e={id:"m8-7-treasury",title:"🧠 Mini-check: Treasury multisig",intro:"2 питання.",questions:[{type:"explain",q:"Чому Squads multisig стандарт для validator org treasury?",ideal:`Single private key для org treasury = single point of failure. One compromise → all funds gone. One key holder departure → access lost.

Squads multisig:
1. N-of-M threshold (наприклад 3-of-5): need 3 signatures з 5 keys для operation
2. Distribute keys серед team members (CEO, CTO, ops lead, legal, board member)
3. Compromise one key = insufficient. Need to compromise 3+ simultaneously
4. One member departure: revoke their key, others still operational
5. On-chain auditable: всі actions transparent у blockchain history

Use cases для LumLabs:
- Holding cold withdrawer authorities для vote accounts
- Operator income wallet (collected commission)
- Treasury holdings (USDC, JTO, etc.)
- Long-term cold storage validator earnings

Setup time: ~30 min initial. Per-TX overhead: extra 1-2 sec для collecting signatures.`,explanation:"Module 8.7."},{type:"mcq",q:"Best practice для Squads setup?",options:["3-of-5 з each key on different hardware wallet","2-of-3 acceptable для smaller orgs","Threshold > 50% members (3-of-5, 4-of-7) для security","Single member can sign (1-of-N) defeats purpose"],correct:[0,1,2,3],explanation:"Усі правильні. Module 8.7."}]};return(h,a)=>{const i=t("Quiz");return r(),l("div",null,[a[0]||(a[0]=s("",50)),n(i,{data:e}),a[1]||(a[1]=s("",6))])}}});export{p as __pageData,c as default};
