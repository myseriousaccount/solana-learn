import{C as r,o as t,c as n,a5 as a,E as o}from"./chunks/framework.CW28V7p_.js";const c=JSON.parse('{"title":"2. Turbine — block propagation","description":"","frontmatter":{},"headers":[],"relativePath":"module-5/2-turbine.md","filePath":"module-5/2-turbine.md","lastUpdated":1780937944000}'),l={name:"module-5/2-turbine.md"},u=Object.assign(l,{setup(d){const s={id:"m5-2-turbine",title:"🧠 Mini-check: Turbine",intro:"3 питання — block propagation.",questions:[{type:"mcq",q:"Чому Turbine використовує tree structure а не broadcast (leader → всім напряму)?",options:["Bandwidth: leader не має enough для send блок до 2000+ validators одночасно","Latency: tree пропагація швидша ніж sequential broadcast","Resilience: hierarchical structure resilient до node failures","Security: tree prevents DoS attacks"],correct:[0,1,2],explanation:"Direct broadcast би overwhelm leader bandwidth. Tree distributes load. Module 5.2."},{type:"explain",q:"Поясни як turbine tree формується і чому позиція validator у tree affects performance.",ideal:`Turbine tree:
1. Leader = root
2. Children = subset validators (e.g., 200 first-layer neighbors)
3. Their children = next layer
4. Cascade until reach всі validators

Два-три levels typically для mainnet ~2000 validators.

Position matters:
- Layer 1 (close до leader): receive shreds first, ~0-20ms after leader produces. Low latency, more chances to vote on time.
- Layer 2: receive ~30-60ms after.
- Layer 3 (deep): receive ~100ms+ after. Higher chance to miss vote window.

Tree shuffled per slot (stake-weighted). Validators з більшим stake more likely в layer 1.

Resilience: erasure coding (Reed-Solomon) дозволяє recover block з ~50% shreds. Even якщо some tree branches fail.

For operator: low network latency до major datacenters (where most stake located) = better position у tree consistently.`,explanation:"Module 5.2."},{type:"mcq",q:"Якщо validator misses 30% shreds через packet loss — він може reconstruct block?",options:["Так, якщо ≤ 50% loss (erasure coding handles до 50%)","Ні, потрібен 100% delivery","Тільки через repair protocol","Залежить від turbine layer"],correct:[0],explanation:"Reed-Solomon erasure coding у turbine дозволяє reconstruct з ~50% shreds. Module 5.2, 5.3."}]};return(p,e)=>{const i=r("Quiz");return t(),n("div",null,[e[0]||(e[0]=a("",38)),o(i,{data:s}),e[1]||(e[1]=a("",6))])}}});export{c as __pageData,u as default};
