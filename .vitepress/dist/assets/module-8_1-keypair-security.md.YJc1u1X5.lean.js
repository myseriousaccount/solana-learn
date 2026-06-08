import{C as t,o as n,c as o,a5 as s,E as r}from"./chunks/framework.CW28V7p_.js";const k=JSON.parse('{"title":"1. Keypair hygiene & cold storage","description":"","frontmatter":{},"headers":[],"relativePath":"module-8/1-keypair-security.md","filePath":"module-8/1-keypair-security.md","lastUpdated":1780937944000}'),l={name:"module-8/1-keypair-security.md"},c=Object.assign(l,{setup(h){const i={id:"m8-1-keypair",title:"🧠 Mini-check: Keypair hygiene",intro:"3 питання — security critical.",questions:[{type:"mcq",q:"Які 3 keys validator потребує (per cheatsheet §Constants)?",options:["Identity keypair","Vote account keypair","Stake keypair","Withdrawer key (separate from above)"],correct:[0,1,2,3],explanation:"Identity, vote, stake, plus withdrawer authority (separate cold key best practice). Module 8.1."},{type:"explain",q:"Чому withdrawer authority має бути cold key separate від identity?",ideal:`Identity та vote authority keys live на validator server (hot). Used continuously by software для signing vote TXs.

If server compromised (SSH breach, malware, etc.):
- Attacker can sign votes (limited damage — vote authority вже there)
- Attacker can spend identity SOL balance
- BUT: cannot drain vote account rent reserve or change commission IF withdrawer authority separate (cold storage)

With withdrawer compromise:
- Drain vote account rent (~0.027 SOL)
- Change commission to 100% (steal all rewards going forward)
- Change authorities (lock you out)

Thus: withdrawer = CRITICAL key. Should be:
- Cold storage (offline, hardware wallet)
- Multisig (Squads) for org treasury
- Never on validator server

Mainnet: separate cold withdrawer always. Testnet/Alpenglow: --allow-unsafe-authorized-withdrawer flag дозволяє same key (testnet only).`,explanation:"Module 8.1."},{type:"command",q:"Як safely backup identity keypair з сервера WNX0016778 на твій ноутбук?",accepts:["scp devops_ssh@WNX0016778:/tmp/validator-keypair-backup-*.json ~/Desktop/","scp devops_ssh@WNX0016778:/home/solana/solana/validator-keypair.json ~/Desktop/"],ideal:"scp devops_ssh@WNX0016778:/tmp/validator-keypair-backup-*.json ~/Desktop/",explanation:"Per §3 Phase 0 cheatsheet: copy to /tmp/ first (with date stamp), then scp from /tmp/. Direct copy від /home/solana/ won't работать (permissions 750). Module 8.1."}]};return(p,a)=>{const e=t("Quiz");return n(),o("div",null,[a[0]||(a[0]=s("",31)),r(e,{data:i}),a[1]||(a[1]=s("",4))])}}});export{k as __pageData,c as default};
