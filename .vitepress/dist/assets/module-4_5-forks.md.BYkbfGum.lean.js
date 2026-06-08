import{C as t,o,c as n,a5 as a,E as l}from"./chunks/framework.CW28V7p_.js";const c=JSON.parse('{"title":"5. Forks, lockouts, fork choice","description":"","frontmatter":{},"headers":[],"relativePath":"module-4/5-forks.md","filePath":"module-4/5-forks.md","lastUpdated":1780937944000}'),r={name:"module-4/5-forks.md"},d=Object.assign(r,{setup(h){const i={id:"m4-5-forks",title:"🧠 Mini-check: Forks",intro:"3 питання — fork mechanics.",questions:[{type:"explain",q:"Поясни як fork choice algorithm works у Tower BFT — як validator вирішує який fork canonical коли two competing forks existed?",ideal:`Tower BFT fork choice — "heaviest fork rule":

1. Кожен fork has набір validators які voted за нього (з різним stake amounts)
2. Heavy fork = total stake голосуючих за нього
3. Validator picks fork з найбільшим total stake voting за нього

Ключова механіка з lockouts:

4. Якщо validator already voted на fork A — он locked (per lockout rules). Cannot vote на conflicting fork B without violating lockout (which would slash).

5. Lockouts exponential по depth → older votes lock validator harder.

6. Result: cluster converges бо vast majority validators locked into heavy fork. Light fork lose validators (lockouts expire, validators switch до heavy).

Практично: forks резулto rare — leader schedule і fast finalization mean clear canonical chain зазвичай. Тільки edge cases (cluster split, network partitions) trigger forks.`,explanation:"Heaviest fork by stake, locked by lockouts → convergence. Module 4.5."},{type:"mcq",q:"Як виникає fork на Solana?",options:["Network partition — кластер split, дві halves продовжують separately","Leader malfunction — produces conflicting blocks на same slot","Software bug — different validators replay TX differently","Якщо два TX try modify same account simultaneously"],correct:[0,1,2],explanation:"#1, #2, #3 — справжні causes forks. #4 НЕПРАВИЛЬНО — це не fork (це TX execution conflict, handled by scheduler within single leader's block). Module 4.5."},{type:"mcq",q:"Що відбувається з TX які landed на losing fork після fork choice settled?",options:["Reverted — TX as if never executed","Migrated до winning fork automatically",'Persisted у history як "orphaned" блок',"User refunded fee"],correct:[0],explanation:"Losing fork TXs reverted — accounts state rolled back. Validator must resubmit TX до canonical fork. Не auto-migrated. Module 4.5."}]};return(p,s)=>{const e=t("Quiz");return o(),n("div",null,[s[0]||(s[0]=a("",57)),l(e,{data:i}),s[1]||(s[1]=a("",6))])}}});export{c as __pageData,d as default};
