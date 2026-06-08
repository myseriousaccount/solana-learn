import{C as s,o as r,c as n,a5 as a,E as o}from"./chunks/framework.CW28V7p_.js";const c=JSON.parse('{"title":"5. QUIC & Fiber (network details)","description":"","frontmatter":{},"headers":[],"relativePath":"module-5/5-quic-fiber.md","filePath":"module-5/5-quic-fiber.md","lastUpdated":1780937944000}'),l={name:"module-5/5-quic-fiber.md"},k=Object.assign(l,{setup(p){const i={id:"m5-5-quic-fiber",title:"🧠 Mini-check: QUIC & Fiber",intro:"2 питання.",questions:[{type:"mcq",q:"QUIC vs TCP для Solana TPU?",options:["QUIC: UDP-based з reliability + multiplexing built-in","Lower handshake latency (0-RTT for repeat connections)","Better congestion control під validator load","TCP simpler але higher latency per connection"],correct:[0,1,2,3],explanation:"Все правильно. Module 5.5."},{type:"explain",q:"Що таке Fiber protocol і чому important для Solana scaling?",ideal:`Fiber — newer agave networking layer optimized для validator-to-validator traffic. Replaces older socket-based approach з kernel-bypass technology (DPDK-similar).

Key aspects:
1. Kernel bypass: packets go directly до NIC через user-space drivers, skipping kernel network stack. Reduces latency 10-100x for high-throughput traffic.

2. Specifically designed для UDP multicast (turbine traffic). Standard kernel sockets struggle з millions of packets/sec.

3. Reduces CPU overhead — handling packets у kernel uses cycles. Fiber moves це до user-space efficient processing.

4. Required для achieving Firedancer-level throughput у agave.

Why important: Solana wants 1M+ TPS long-term. Standard kernel networking caps significantly lower. Fiber removes major bottleneck.

For operators: requires specific NIC support (Intel NICs з DPDK), kernel configuration. Not all hosting providers support. Currently optional, eventually may become mandatory для top-tier performance.`,explanation:"Module 5.5."}]};return(d,e)=>{const t=s("Quiz");return r(),n("div",null,[e[0]||(e[0]=a("",52)),o(t,{data:i}),e[1]||(e[1]=a("",6))])}}});export{c as __pageData,k as default};
