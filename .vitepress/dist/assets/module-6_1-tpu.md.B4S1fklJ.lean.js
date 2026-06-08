import{C as n,o as t,c as l,a5 as s,E as r}from"./chunks/framework.CW28V7p_.js";const c=JSON.parse('{"title":"1. TPU — Transaction Processing Unit","description":"","frontmatter":{},"headers":[],"relativePath":"module-6/1-tpu.md","filePath":"module-6/1-tpu.md","lastUpdated":1780937944000}'),o={name:"module-6/1-tpu.md"},u=Object.assign(o,{setup(p){const i={id:"m6-1-tpu",title:"🧠 Mini-check: TPU",intro:"2 питання.",questions:[{type:"mcq",q:"Що з цього робить TPU?",options:["Receive TX submissions від clients через QUIC","Verify signatures у parallel","Pre-execute (sanity check) перед including у block","Forward TXs до next leader якщо not currently leader"],correct:[0,1,2,3],explanation:'TPU = "ingest TXs у validator". Module 6.1.'},{type:"explain",q:"Чому TPU forwards TXs до next leader замість processити сам?",ideal:`Тільки current leader може include TXs у block. Якщо random validator receives TX і це not currently leader — нема point holding TX (заfdamn doesn't help include).

Forward механіка:
1. Validator receives TX через TPU
2. Перевіряє leader schedule — хто current/upcoming leader
3. Forward TX до leader's TPU
4. Leader includes у його block

Це дає клієнтам can submit TX до any validator (не треба знати поточного leader) — TX eventually reaches leader.

Ефективно: RPC nodes typically forward до 2-3 upcoming leaders щоб maximize chance включення.`,explanation:"Module 6.1."}]};return(h,a)=>{const e=n("Quiz");return t(),l("div",null,[a[0]||(a[0]=s("",23)),r(e,{data:i}),a[1]||(a[1]=s("",6))])}}});export{c as __pageData,u as default};
