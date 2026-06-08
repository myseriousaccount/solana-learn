import{C as t,o as e,c as l,a5 as a,E as h}from"./chunks/framework.CW28V7p_.js";const k=JSON.parse('{"title":"5. Snapshot mirror service","description":"","frontmatter":{},"headers":[],"relativePath":"module-10/5-snapshot-mirror.md","filePath":"module-10/5-snapshot-mirror.md","lastUpdated":1780937944000}'),p={name:"module-10/5-snapshot-mirror.md"},c=Object.assign(p,{setup(r){const i={id:"m10-5-snapshot-mirror",title:"🧠 Mini-check: Snapshot mirror",intro:"2 питання.",questions:[{type:"mcq",q:"Snapshot mirror використовується для:",options:["Public snapshot hosting для community catch-up","Faster catch-up для validators у same region","Backup snapshots до cloud storage","Replace validator's own snapshot creation"],correct:[0,1,2],explanation:"Mirror not replace — validator still creates own. Module 10.5."},{type:"explain",q:"Як setup public snapshot mirror з твого validator?",ideal:`1. Validator вже creates snapshots у \`/home/solana/solana/ledger/snapshot-*\` files (default).

2. Choose HTTP server (nginx, caddy, simple Python http.server). Configure для serve snapshot directory.

3. Configure rsync schedule або symlinks щоб latest snapshots available HTTP-accessible path:
   \`ln -sf /home/solana/solana/ledger/snapshot-*.tar.zst /var/www/snapshots/\`

4. Publish URL у Discord/community:
   \`https://snapshots.lumlabs.io/snapshot-latest.tar.zst\`

5. Others can \`wget\` your snapshots для catch-up:
   \`wget https://snapshots.lumlabs.io/snapshot-369450000-XYZ.tar.zst -O /home/solana/solana/ledger/snapshot.tar.zst\`

6. Consider rate limiting + bandwidth caps щоб не overwhelm your server.

Most validators do це as community contribution. Some run dedicated snapshot servers separately from validators (just download snapshots + serve).`,explanation:"Module 10.5."}]};return(o,s)=>{const n=t("Quiz");return e(),l("div",null,[s[0]||(s[0]=a("",54)),h(n,{data:i}),s[1]||(s[1]=a("",4))])}}});export{k as __pageData,c as default};
