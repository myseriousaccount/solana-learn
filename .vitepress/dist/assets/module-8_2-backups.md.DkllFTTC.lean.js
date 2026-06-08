import{C as t,o as n,c as o,a5 as s,E as r}from"./chunks/framework.CW28V7p_.js";const d=JSON.parse('{"title":"2. Backups & disaster recovery","description":"","frontmatter":{},"headers":[],"relativePath":"module-8/2-backups.md","filePath":"module-8/2-backups.md","lastUpdated":1780937944000}'),l={name:"module-8/2-backups.md"},k=Object.assign(l,{setup(p){const e={id:"m8-2-backups",title:"🧠 Mini-check: Backups",intro:"2 питання.",questions:[{type:"mcq",q:"Що з цього MUST backup для validator?",options:["Identity keypair","Vote account keypair","Stake keypair(s)","AccountsDB / ledger"],correct:[0,1,2],explanation:"Keys MUST. Ledger/accountsDB recoverable from cluster (via snapshot). Lost keys = lost identity forever. Module 8.2."},{type:"scenario",q:"Сервер WNX0016778 hard drive died. Що тобі необхідно щоб restore validator на новий сервер?",ideal:`1. Backups identity keypair, vote keypair, stake keypair (з backups на ноутбук/cold storage)

2. New server provisioned, agave installed

3. Copy keypairs до new server:
   scp ~/validator-keypair-backup-*.json devops_ssh@new-server:/tmp/
   sudo cp /tmp/...json /home/solana/solana/validator-keypair.json
   sudo chmod 600 /home/solana/solana/validator-keypair.json
   sudo chown solana:solana /home/solana/solana/validator-keypair.json

4. Configure solana.service з reference до keypair paths

5. Start validator з no ledger → fetches snapshot з cluster (~30-90 min)

6. Once catches up — voting resumes

7. Validate that vote account still your validator's (vote auth still you):
   sudo solana vote-account YOUR_VOTE | grep Identity

Key insight: без keypair backups — IRRECOVERABLE LOSS. Validator identity gone. Stake delegated до it stuck. Need new validator from scratch (new vote account, lose existing delegations).`,explanation:"Module 8.2."}]};return(h,a)=>{const i=t("Quiz");return n(),o("div",null,[a[0]||(a[0]=s("",36)),r(i,{data:e}),a[1]||(a[1]=s("",4))])}}});export{d as __pageData,k as default};
