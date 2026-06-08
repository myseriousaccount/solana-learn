import{C as n,o as t,c as l,a5 as a,E as r}from"./chunks/framework.CW28V7p_.js";const k=JSON.parse('{"title":"5. PDA (Program Derived Addresses) — deep dive","description":"","frontmatter":{},"headers":[],"relativePath":"module-2/5-pda-deep.md","filePath":"module-2/5-pda-deep.md","lastUpdated":1780937944000}'),p={name:"module-2/5-pda-deep.md"},c=Object.assign(p,{setup(d){const i={id:"m2-5-pda-deep",title:"🧠 Mini-check: PDA deep",intro:"2 питання.",questions:[{type:"explain",q:"Поясни як PDA працює і чому це critical для Solana smart contracts.",ideal:`PDA (Program Derived Address) — special pubkey derived deterministically з seeds + program ID. Key properties:

1. Off curve: not generated through ed25519 keypair (no private key exists). Cannot sign normally.

2. Deterministic: same seeds + program → same PDA always. Calculate via findProgramAddress(seeds, program_id).

3. Program-controlled: тільки derived program може "sign" transactions для PDA через invoke_signed mechanism у CPI.

Why critical:
- Program-owned state: program створює PDAs для storing data without trusting external keys
- Cross-program coordination: programs can deterministically reference each other's state
- No private key management: no risk losing/leaking PDA keys
- Composability: anyone can compute PDA address без знання internal state

Examples:
- Token Program ATAs are PDAs derived from (wallet, mint, token_program)
- Anchor "PDA seeds" pattern для account discovery
- Stake pool delegations
- AMM pool authority accounts`,explanation:"Module 2.5."},{type:"mcq",q:"PDA properties (обери всі правильні):",options:["Off ed25519 curve (no private key exists)","Deterministic derivation з (seeds, program_id)",'Only derived program може "sign" through invoke_signed',"Can be transferred between users like regular wallet"],correct:[0,1,2],explanation:"PDA controlled by program, не transferable like user wallet. Module 2.5."}]};return(o,s)=>{const e=n("Quiz");return t(),l("div",null,[s[0]||(s[0]=a("",43)),r(e,{data:i}),s[1]||(s[1]=a("",6))])}}});export{k as __pageData,c as default};
