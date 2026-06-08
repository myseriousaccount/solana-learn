import{C as o,o as i,c as l,a5 as a,E as n}from"./chunks/framework.CW28V7p_.js";const p=JSON.parse('{"title":"2. Tower BFT — Solana mainnet consensus","description":"","frontmatter":{},"headers":[],"relativePath":"module-4/2-tower-bft.md","filePath":"module-4/2-tower-bft.md","lastUpdated":1780937944000}'),r={name:"module-4/2-tower-bft.md"},k=Object.assign(r,{setup(d){const e={id:"m4-2-tower-bft",title:"🧠 Mini-check: Tower BFT",intro:"3 питання — current mainnet consensus.",questions:[{type:"mcq",q:"Що з цього вірно про Tower BFT? (обери всі)",options:["Це variant PBFT (Practical Byzantine Fault Tolerance) optimized з PoH","Validators vote on slots, votes lockout exponentially (більший слот → довший lockout)","Requires > 2/3 stake voting для finality","Тільки leader може голосувати"],correct:[0,1,2],explanation:"Tower BFT = PBFT + PoH optimization, exponential lockouts, 2/3 stake для finality. Всі validators (не тільки leader) голосують. Module 4.2."},{type:"explain",q:'Поясни своїми словами що таке "lockout" у Tower BFT і чому це важливо.',ideal:`Lockout — це commitment validator дає коли голосує за slot: "Я обіцяю не голосувати за конфліктуючий fork протягом N slots".

Ключова механіка — lockouts exponential. Кожен наступний vote doubles lockout попередніх:
- Vote 1 (most recent): 2 slots lockout
- Vote 2: 4 slots lockout
- Vote 3: 8 slots lockout
- ... до vote 32: 2^32 slots (effectively forever)

Чому matter:

1. Finality: коли vote stack має 32 votes, oldest reaches max lockout — slot вважається finalized (impossible to revert without violating lockouts які би slash validator).

2. Fork choice: якщо два forks existed, validators choose heaviest fork by stake. Validator не може switch до alternative fork while locked — змусило б violate lockout commitments.

3. Safety: malicious validators які vote conflicting forks (double-voting) lose stake (slashing). Lockouts make this expensive — більше votes = bigger penalty.

This enables Solana fast finality (~12-30 sec) без traditional BFT slowness.`,explanation:"Lockout = exponential commitment, enables finality + slash protection. Module 4.2."},{type:"mcq",q:"Якщо malicious validator голосує за два конфліктних forks одночасно (double-vote) — що відбувається?",options:["Cluster ignores один з vote arbitrarily","Validator gets slashed (loses stake)","Validator marked delinquent для одного epoch","Both votes accepted, cluster splits"],correct:[1],explanation:"Double-vote — slashable offense. Validator stake slashed (зменшується). Це і робить Tower BFT secure — economic disincentive для misbehavior. Module 4.2."}]};return(h,t)=>{const s=o("Quiz");return i(),l("div",null,[t[0]||(t[0]=a("",66)),n(s,{data:e}),t[1]||(t[1]=a("",6))])}}});export{p as __pageData,k as default};
