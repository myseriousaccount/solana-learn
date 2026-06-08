import{C as i,o as n,c as l,a5 as a,E as r}from"./chunks/framework.CW28V7p_.js";const d=JSON.parse('{"title":"2. Snapshots — fetch, create, serve","description":"","frontmatter":{},"headers":[],"relativePath":"module-10/2-snapshots.md","filePath":"module-10/2-snapshots.md","lastUpdated":1780937944000}'),o={name:"module-10/2-snapshots.md"},k=Object.assign(o,{setup(h){const e={id:"m10-2-snapshots",title:"🧠 Mini-check: Snapshots",intro:"2 питання.",questions:[{type:"compare",q:"Full snapshot vs incremental snapshot?",ideal:`Full snapshot: complete accountsDB state at specific slot. Large (~80-100 GB mainnet). Created periodically (every ~25000 slots).

Incremental snapshot: delta from last full. Small (~1 GB typical). Created more frequently (every ~100 slots).

Fast catch-up:
1. Download recent full snapshot (~30-60 min)
2. Download recent incremental delta (~few min)
3. Apply delta до full → current state
4. Catch-up з cluster для recent slots

Total: ~30-90 min vs full replay from genesis (days/weeks).`,explanation:"Module 10.2."},{type:"command",q:"Як list local snapshots ledger directory?",accepts:["ls -lh /home/solana/solana/ledger/snapshot-*","sudo ls -lh /home/solana/solana/ledger/snapshot-*"],ideal:"sudo ls -lh /home/solana/solana/ledger/snapshot-*",explanation:"Module 10.2."}]};return(p,s)=>{const t=i("Quiz");return n(),l("div",null,[s[0]||(s[0]=a("",32)),r(t,{data:e}),s[1]||(s[1]=a("",6))])}}});export{d as __pageData,k as default};
