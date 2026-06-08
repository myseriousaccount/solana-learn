import{C as t,o as n,c as l,a5 as a,E as r}from"./chunks/framework.CW28V7p_.js";const c=JSON.parse('{"title":"4. Repair protocol & network resilience","description":"","frontmatter":{},"headers":[],"relativePath":"module-5/4-repair.md","filePath":"module-5/4-repair.md","lastUpdated":1780937944000}'),o={name:"module-5/4-repair.md"},k=Object.assign(o,{setup(p){const i={id:"m5-4-repair",title:"🧠 Mini-check: Repair",intro:"2 питання — repair basics.",questions:[{type:"mcq",q:"Коли validator triggers repair protocol?",options:["Missing shreds для slot, can't reconstruct","After cluster restart — need catch up missed slots","Routine health checks","On every shred received"],correct:[0,1],explanation:"#1: insufficient shreds → repair. #2: catching up after restart/downtime. #3/#4 — wrong (continuous polling would overload). Module 5.4."},{type:"explain",q:"Якщо validator поза cluster тривалий час (наприклад крашнувся на 1 годину), як він catches up через repair?",ideal:`1. На startup validator checks last known slot vs current cluster slot. Якщо behind significantly — catch-up mode.

2. Repair service requests missing slots/shreds від cluster peers через repair protocol.

3. Peers send shreds для requested slots.

4. Validator reconstructs blocks, replays TXs, updates own state.

5. Continues catch-up аж до reaching cluster head.

6. Then resumes normal voting.

Час: ~1-2 hours catch-up може занять 5-30 хв depending bandwidth. Validator remains delinquent during catch-up.

Alternative для very long downtime: download fresh snapshot замість replay all missed blocks. Faster (~30-90 min vs hours).`,explanation:"Module 5.4."}]};return(h,s)=>{const e=t("Quiz");return n(),l("div",null,[s[0]||(s[0]=a("",31)),r(e,{data:i}),s[1]||(s[1]=a("",6))])}}});export{c as __pageData,k as default};
