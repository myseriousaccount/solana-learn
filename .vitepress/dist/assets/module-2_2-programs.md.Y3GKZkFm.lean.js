import{C as o,o as r,c as n,a5 as e,E as i}from"./chunks/framework.CW28V7p_.js";const h=JSON.parse('{"title":"2. Programs as accounts","description":"","frontmatter":{},"headers":[],"relativePath":"module-2/2-programs.md","filePath":"module-2/2-programs.md","lastUpdated":1780937944000}'),d={name:"module-2/2-programs.md"},g=Object.assign(d,{setup(l){const t={id:"m2-2-programs",title:"🧠 Mini-check: Programs as accounts",intro:"3 питання — programs vs data accounts.",questions:[{type:"compare",q:"У чому різниця між native programs і BPF programs (deployed contracts)?",ideal:`Native programs:
- Built into validator binary (написані у Rust як частина agave codebase)
- Implement system-level operations: System Program (account creation, SOL transfers), Vote Program, Stake Program
- Не можна upgrade без updating agave validator software
- Owner: Native Loader

BPF programs:
- Deployed by users як bytecode (compiled з Rust/C/Anchor)
- Загружені на chain як account data
- Можна upgrade if upgrade authority set (BPF Loader Upgradeable)
- Owner: BPF Loader або BPF Loader Upgradeable
- Приклади: SPL Token, Metaplex, Anchor-based smart contracts

Ключова різниця: native = частина validator, BPF = uploaded user code. Native trusted at protocol level, BPF runs in sandboxed VM (BPF VM).`,explanation:"Native vs BPF — fundamental distinction. Native = baked into validator, BPF = deployed user code. Якщо описала this + один-два specific examples — повна відповідь."},{type:"mcq",q:"Що з цього є native programs на Solana? (обери всі правильні)",options:["System Program (11111...)","Vote Program (Vote111...)","SPL Token Program (TokenkegQ...)","Stake Program (Stake111...)"],correct:[0,1,3],explanation:"System, Vote, Stake — native (built into validator). SPL Token — BPF program (deployed code, although core ecosystem). Module 2.2."},{type:"command",q:"Як перевірити чи певний account є executable program? Напиши команду + який field показує result.",accepts:["solana account <PUBKEY> | grep -i executable","solana account TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA | grep -i executable","solana account <PUBKEY> | grep Executable"],ideal:"solana account <PUBKEY> | grep -i executable",explanation:"solana account виводить Executable: true/false поле. true = program (можна викликати з TX), false = data account. Module 2.2."}]};return(p,a)=>{const s=o("Quiz");return r(),n("div",null,[a[0]||(a[0]=e("",61)),i(s,{data:t}),a[1]||(a[1]=e("",6))])}}});export{h as __pageData,g as default};
