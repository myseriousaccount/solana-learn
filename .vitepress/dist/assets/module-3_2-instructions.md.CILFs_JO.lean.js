import{C as n,o as i,c as r,a5 as s,E as o}from"./chunks/framework.CW28V7p_.js";const u=JSON.parse('{"title":"2. Instructions & cross-program invocation","description":"","frontmatter":{},"headers":[],"relativePath":"module-3/2-instructions.md","filePath":"module-3/2-instructions.md","lastUpdated":1780937944000}'),l={name:"module-3/2-instructions.md"},h=Object.assign(l,{setup(c){const e={id:"m3-2-instructions",title:"🧠 Mini-check: Instructions & CPI",intro:"3 питання — instructions і cross-program calls.",questions:[{type:"mcq",q:"Що з цього вірно про cross-program invocation (CPI)?",options:["Один program може викликати інший program у тому ж TX","CPI calls counted у TX compute budget","Calling program може передавати accounts отриманні з TX до called program","Cycle CPI (A → B → A) автоматично дозволений"],correct:[0,1,2],explanation:"CPI дозволяє composability — DEX викликає Token Program, lending викликає Oracle, etc. Cycles НЕ дозволені (max depth ~4). Module 3.2."},{type:"explain",q:"Поясни своїми словами як працює Sealevel parallel execution. Чому Solana може це робити коли Ethereum не може?",ideal:`Sealevel — Solana runtime для parallel TX execution. Як працює:

1. Scheduler читає account lists від всіх pending TXs у block being built
2. Для кожної pair TXs визначає conflict: "чи туч обидві same writable account?"
3. Якщо conflict — TXs execute sequentially. Якщо disjoint — паралельно on different CPU cores.
4. Validator з 32+ cores може execute 32+ TXs одночасно якщо non-conflicting.

Чому Solana може, Ethereum не може:
- Solana TX має EXPLICIT pre-declared account list. Scheduler знає upfront які accounts touched.
- Ethereum smart contract може dynamically access будь-яку storage slot under contract address. Сcheduler can't predict accesses без executing the TX → can't safely parallelize.

This design choice (pre-declared accounts) — fundamental enabler Solana throughput. Tradeoff: developer must enumerate accounts upfront (mental overhead).`,explanation:"Pre-declared accounts → parallel scheduling. Ethereum dynamic access → sequential. Module 3.2."},{type:"compare",q:"У чому різниця між instruction account marked writable vs read-only?",ideal:`Writable: instruction може modify account (lamports або data). Scheduler treatить writable accounts як exclusive — тільки одна TX may write до конкретного account at a time.

Read-only: instruction може ТІЛЬКИ read account. Multiple TXs можуть concurrently read same account (parallel-safe).

Чому matters: TX explicitly tags кожен account як writable або read-only через TransactionMessage header. Це дає scheduler info для parallelism:
- Якщо TX1 writes account X, TX2 reads X → sequential (TX2 must wait)
- Якщо TX1 reads X, TX2 reads X → parallel OK (no conflict)
- Якщо TX1 writes X, TX2 writes Y → parallel OK (different accounts)

Developer має tagнути правильно. Якщо declare writable що actually read-only — TX лишається correct але loses parallelization opportunity. Якщо declare read-only що writes — runtime catches violation, TX fails.`,explanation:"Writable = exclusive lock, read-only = shared. Affects parallelism. Module 3.2."}]};return(p,a)=>{const t=n("Quiz");return i(),r("div",null,[a[0]||(a[0]=s("",66)),o(t,{data:e}),a[1]||(a[1]=s("",6))])}}});export{u as __pageData,h as default};
