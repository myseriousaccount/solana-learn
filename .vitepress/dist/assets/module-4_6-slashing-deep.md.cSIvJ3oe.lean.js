import{C as o,o as n,c as s,a5 as a,E as l}from"./chunks/framework.CW28V7p_.js";const h=JSON.parse('{"title":"6. Slashing — deep dive","description":"","frontmatter":{},"headers":[],"relativePath":"module-4/6-slashing-deep.md","filePath":"module-4/6-slashing-deep.md","lastUpdated":1780937944000}'),r={name:"module-4/6-slashing-deep.md"},u=Object.assign(r,{setup(d){const t={id:"m4-6-slashing",title:"🧠 Mini-check: Slashing",intro:"2 питання.",questions:[{type:"compare",q:"Solana slashing — current state vs proposed Alpenglow?",ideal:`Current (Tower BFT, as of 2026):
- Double-vote condition defined у Tower BFT protocol
- Slashing logic implemented у runtime
- BUT not actively triggered/enforced automatically
- Enforcement через social punishment: caught validators removed from SFDP, stake pools withdraw delegations, reputation damage
- Economic disincentive (lost income) > technical slashing currently

Alpenglow proposed:
- Strict automatic enforcement:
  - Double-vote: instant stake slash + validator ejection
  - Equivocation (conflicting blocks signed): same
  - Inactivity beyond threshold: gradual stake reduction
- More similar to Cosmos slashing model
- Higher operational risk для validators — bugs that cause double-signs could destroy stake

Why proposed change: Tower BFT defines but не enforces — relies on goodwill. Alpenglow wants мathematical guarantees, не trust.

Implications для operators: more careful operations needed (avoid running same identity на multiple machines, avoid restoring keypair without ensuring old instance stopped, etc.).`,explanation:"Module 4.6."},{type:"mcq",q:"Як validator може accidentally double-vote?",options:["Running validator identity на two servers simultaneously","Restoring keypair backup on new server без stopping old instance","Cluster restart procedures done improperly","Slow network causes vote retry"],correct:[0,1,2],explanation:"#4 не cause double-vote — protocol handles retries safely. Module 4.6."}]};return(c,e)=>{const i=o("Quiz");return n(),s("div",null,[e[0]||(e[0]=a("",68)),l(i,{data:t}),e[1]||(e[1]=a("",4))])}}});export{h as __pageData,u as default};
