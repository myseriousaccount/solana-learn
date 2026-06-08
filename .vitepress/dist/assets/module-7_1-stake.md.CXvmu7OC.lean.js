import{C as i,o as n,c as l,a5 as e,E as o}from"./chunks/framework.CW28V7p_.js";const p=JSON.parse('{"title":"1. Stake accounts & delegation","description":"","frontmatter":{},"headers":[],"relativePath":"module-7/1-stake.md","filePath":"module-7/1-stake.md","lastUpdated":1780937944000}'),r={name:"module-7/1-stake.md"},k=Object.assign(r,{setup(h){const s={id:"m7-1-stake",title:"🧠 Mini-check: Stake accounts",intro:"3 питання — stake delegation mechanics.",questions:[{type:"mcq",q:"Що з цього вірно про stake account?",options:["Owner = Stake Program","Має stake_state (initialized/activating/active/deactivating/inactive)","Один stake account може delegate до multiple validators одночасно","Rent reserve ~0.00228 SOL"],correct:[0,1,3],explanation:"Stake account delegate до ОДНОГО validator at a time. Module 7.1."},{type:"order",q:"Postaj у правильному порядку (delegation lifecycle):",items:["Initialized: stake account created з SOL","Activating: warmup до next epoch boundary","Active: voting + earning rewards","Deactivating: cooldown після undelegate","Inactive: ready to withdraw"],correctOrder:[0,1,2,3,4],explanation:"Linear lifecycle. Module 7.1."},{type:"explain",q:"Чому stake activation чекає epoch boundary?",ideal:`Consensus працює з єдиним stake snapshot per epoch (для determinism). Mid-epoch stake changes би ламали leader schedule і vote weight tallying.

Process:
1. Delegate-stake TX submitted у slot X (mid epoch N)
2. Stake → "activating" status
3. Кінець epoch N: cluster snapshots stakes, твій stake включений у snapshot
4. Slot 0 epoch N+1: твій stake "active" у new stake set
5. Validator починає включати твою вагу у voting/leader schedule
6. У кінці epoch N+1 — твоя частка rewards proportionally

Це чому "почекай 1 epoch" — стандартний answer на "коли мій stake активний?"

Deactivation similar: undelegate → "deactivating" → boundary → "inactive" → withdrawable.`,explanation:"Module 7.1."}]};return(d,a)=>{const t=i("Quiz");return n(),l("div",null,[a[0]||(a[0]=e("",32)),o(t,{data:s}),a[1]||(a[1]=e("",6))])}}});export{p as __pageData,k as default};
