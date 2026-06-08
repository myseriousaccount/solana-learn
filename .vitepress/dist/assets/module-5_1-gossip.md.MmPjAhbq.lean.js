import{C as n,o as t,c as o,a5 as a,E as l}from"./chunks/framework.CW28V7p_.js";const c=JSON.parse('{"title":"1. Gossip protocol — cluster membership","description":"","frontmatter":{},"headers":[],"relativePath":"module-5/1-gossip.md","filePath":"module-5/1-gossip.md","lastUpdated":1780937944000}'),p={name:"module-5/1-gossip.md"},g=Object.assign(p,{setup(r){const i={id:"m5-1-gossip",title:"🧠 Mini-check: Gossip",intro:"3 питання — gossip basics.",questions:[{type:"mcq",q:"Що з цього передається через gossip? (обери всі)",options:["Cluster nodes list","Validator versions","Vote signatures","TXs from clients"],correct:[0,1,2],explanation:"Gossip = membership + metadata. TX submission separate (TPU). Votes можуть передаватись через gossip або як regular TX. Module 5.1."},{type:"command",q:"Як подивитись всі nodes у cluster через gossip?",accepts:["solana gossip","sudo /home/solana/ag/bin/solana gossip --url http://localhost:8899"],ideal:"solana gossip",explanation:"solana gossip lists всі visible nodes з gossip data: identity, IP, ports, version. Module 5.1."},{type:"explain",q:"Поясни як gossip protocol дозволяє nodes discover один одного без centralized registry.",ideal:`Gossip — epidemic propagation. Workflow:
1. New node connects до entrypoint (well-known seed node, e.g., 64.130.37.11:8000 для Alpenglow)
2. Entrypoint shares свій table відомих nodes
3. New node pings цих nodes, building local table
4. Periodically всі nodes exchange tables з random peers
5. Через кілька rounds (~5-10 sec) all nodes converge до consistent view of cluster

Ключове: decentralized — no single source of truth. Entrypoints lower trust requirement (just bootstrap). Gossip self-healing — якщо node disappears, gossip propagates absence.

Gossiped info: identity pubkey, IP+ports, validator version, last activity timestamp, optional metadata (validator-info publishing).

Це чому твій validator може join Alpenglow cluster knowing тільки 2 entrypoint IPs — gossip handles the rest.`,explanation:"Module 5.1."}]};return(h,s)=>{const e=n("Quiz");return t(),o("div",null,[s[0]||(s[0]=a("",31)),l(e,{data:i}),s[1]||(s[1]=a("",6))])}}});export{c as __pageData,g as default};
