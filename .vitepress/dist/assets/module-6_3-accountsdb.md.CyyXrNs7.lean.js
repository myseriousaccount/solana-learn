import{C as t,o as e,c as l,a5 as a,E as o}from"./chunks/framework.CW28V7p_.js";const d=JSON.parse('{"title":"3. AccountsDB & state storage","description":"","frontmatter":{},"headers":[],"relativePath":"module-6/3-accountsdb.md","filePath":"module-6/3-accountsdb.md","lastUpdated":1780937944000}'),p={name:"module-6/3-accountsdb.md"},k=Object.assign(p,{setup(r){const i={id:"m6-3-accountsdb",title:"🧠 Mini-check: AccountsDB",intro:"2 питання.",questions:[{type:"mcq",q:"AccountsDB на mainnet:",options:["Stored на NVMe disk + optional RAM cache","Stored на RAM disk (tmpfs)","Contains all ~500M accounts (mainnet)","Read/write by TX execution"],correct:[0,2,3],explanation:"AccountsDB live on disk (with RAM cache). NOT RAM disk (would be too big — accountsDB ~500GB+). Module 6.3."},{type:"explain",q:"Чому /mnt/ramdisk на твоєму Alpenglow setup для accounts?",ideal:`Alpenglow community cluster менший за mainnet — accountsDB поміщається у RAM (~16-32 GB вместо 500GB). Mounting на ramdisk (tmpfs) дає sub-millisecond access latency vs NVMe ~50-100µs.

For small cluster performance critical (every microsecond у validation matters), RAM storage optimal.

Mainnet ні — accountsDB занадто big для RAM. Mainnet uses disk (NVMe) з aggressive RAM cache for hot accounts.

Tradeoff:
- RAM disk: faster access, but data lost on reboot, limited size
- Disk: slower, persistent, scales до TB+`,explanation:"Module 6.3."}]};return(h,s)=>{const n=t("Quiz");return e(),l("div",null,[s[0]||(s[0]=a("",24)),o(n,{data:i}),s[1]||(s[1]=a("",4))])}}});export{d as __pageData,k as default};
