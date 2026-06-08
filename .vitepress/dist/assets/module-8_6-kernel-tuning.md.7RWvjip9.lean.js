import{C as e,o as t,c as l,a5 as i,E as p}from"./chunks/framework.CW28V7p_.js";const o=JSON.parse('{"title":"6. Kernel & network tuning","description":"","frontmatter":{},"headers":[],"relativePath":"module-8/6-kernel-tuning.md","filePath":"module-8/6-kernel-tuning.md","lastUpdated":1780937944000}'),h={name:"module-8/6-kernel-tuning.md"},F=Object.assign(h,{setup(k){const a={id:"m8-6-kernel",title:"🧠 Mini-check: Kernel tuning",intro:"2 питання.",questions:[{type:"mcq",q:"Що з цього важливі sysctl settings для validator?",options:["net.core.rmem_max / wmem_max (UDP buffer sizes)","vm.swappiness (avoid swap pressure)","fs.file-max (allow many open file descriptors)","kernel.panic (machine reboot policy)"],correct:[0,1,2],explanation:"Network buffers + swap + file descriptors critical. Panic не affects validator runtime. Module 8.6."},{type:"explain",q:"Чому swappiness should be дуже low (e.g., 1) для validator?",ideal:`Swap = Linux moves rarely-used RAM pages to disk коли RAM pressure. Великий cost: disk much slower than RAM (~1000x latency).

Validator continuously reads accountsDB hot accounts. Якщо OS swaps these → next access = disk read → блокує TX processing → late voting → missed credits.

Default swappiness = 60 (aggressive swap). Validator wants 1 (almost no swap, prefer drop file cache).

Ideally: NO swap взагалі. Якщо out of RAM — better OOM kill than slow degradation. Configure:

sudo sysctl -w vm.swappiness=1
# або disable swap entirely:
sudo swapoff -a

Monitor swap usage:
free -h | grep Swap
# Should be 0 used`,explanation:"Module 8.6."}]};return(r,s)=>{const n=e("Quiz");return t(),l("div",null,[s[0]||(s[0]=i("",50)),p(n,{data:a}),s[1]||(s[1]=i("",6))])}}});export{o as __pageData,F as default};
