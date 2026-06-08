import{C as t,o as n,c as l,a5 as i,E as r}from"./chunks/framework.CW28V7p_.js";const c=JSON.parse('{"title":"6. Genesis ceremony","description":"","frontmatter":{},"headers":[],"relativePath":"module-1/6-genesis.md","filePath":"module-1/6-genesis.md","lastUpdated":1780937944000}'),o={name:"module-1/6-genesis.md"},g=Object.assign(o,{setup(p){const e={id:"m1-6-genesis",title:"🧠 Mini-check: Genesis",intro:"2 питання.",questions:[{type:"mcq",q:"Що defines unique cluster?",options:["Genesis hash","Initial validator set","Initial accounts state","Software version"],correct:[0,1,2],explanation:"Software version може evolve, genesis immutable. Module 1.6."},{type:"explain",q:"Як new community cluster (наприклад Alpenglow) запускається з genesis?",ideal:`New cluster bring-up process (community-coordinated):

1. **Plan**: organizers decide cluster purpose, expected operators, schedule.

2. **Solicit operators**: validators apply via form indicating їх pubkey + intent. Operators у "genesis set" otherwise self-stake at launch.

3. **Software version**: agreed-upon agave/Firedancer version. Optional cluster-specific fork patches.

4. **Genesis params**: organizer creates genesis using solana-genesis tool:
   - Initial validator pubkeys + initial stake amounts
   - Cluster parameters (slot duration, epoch length)
   - Initial features enabled
   - Output: genesis.tar.bz2 file

5. **Distribute genesis**: organizer publishes genesis hash + file URL. All operators verify hash matches expected.

6. **Coordinate start time**: organizer announces specific UTC time для все валідатори start simultaneously.

7. **All operators start** validator з same genesis at agreed time. Initially: small cluster, fast TX execution.

8. **Out-of-genesis operators** (як LumLabs Alpenglow case 2026-06) can join later by syncing з cluster + creating own vote account + getting stake delegation.

This ceremony similar для mainnet original launch 2020.`,explanation:"Module 1.6."}]};return(h,s)=>{const a=t("Quiz");return n(),l("div",null,[s[0]||(s[0]=i("",46)),r(a,{data:e}),s[1]||(s[1]=i("",6))])}}});export{c as __pageData,g as default};
