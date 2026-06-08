import{C as i,o as t,c as l,a5 as a,E as o}from"./chunks/framework.CW28V7p_.js";const d=JSON.parse('{"title":"6. Durable nonces","description":"","frontmatter":{},"headers":[],"relativePath":"module-3/6-durable-nonces.md","filePath":"module-3/6-durable-nonces.md","lastUpdated":1780937944000}'),r={name:"module-3/6-durable-nonces.md"},u=Object.assign(r,{setup(h){const n={id:"m3-6-nonces",title:"🧠 Mini-check: Durable nonces",intro:"2 питання.",questions:[{type:"explain",q:"Чому durable nonce замість recent blockhash для multisig workflows?",ideal:`Standard TX uses recent_blockhash (valid ~60 sec). Якщо TX takes > 60 sec collect signatures (multisig requires multiple signers у різних timezones) — blockhash expires, TX dies.

Durable nonce: special on-chain nonce account holds long-lived nonce value (updates тільки коли used). TX references цей nonce замість recent_blockhash. Не expires through time, тільки coли nonce account explicitly updated.

Workflow:
1. Create nonce account (one-time, rent reserve ~0.0015 SOL)
2. Get current nonce value: solana nonce <NONCE_ACCOUNT>
3. Build TX з durable nonce instead of recent_blockhash
4. Pass TX around team for multiple signatures (days/weeks OK)
5. Submit signed TX — landed, nonce advanced
6. Reuse nonce account для next operation

Downside: requires nonce account management. Most users don't need (regular TXs fine with recent_blockhash).`,explanation:"Module 3.6."},{type:"mcq",q:"Use cases для durable nonces?",options:["Multisig signing (collecting signatures over days)","Offline signing (cold wallet generates signed TX, brought online later)","Standard SOL transfer between two hot wallets","Scheduled TXs (signed now, submit later)"],correct:[0,1,3],explanation:"Standard transfers — use recent_blockhash. Nonces для long-lived/offline scenarios. Module 3.6."}]};return(p,s)=>{const e=i("Quiz");return t(),l("div",null,[s[0]||(s[0]=a("",51)),o(e,{data:n}),s[1]||(s[1]=a("",6))])}}});export{d as __pageData,u as default};
