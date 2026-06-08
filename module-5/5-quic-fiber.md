<script setup>
const quiz = {
  id: 'm5-5-quic-fiber',
  title: '🧠 Mini-check: QUIC & Fiber',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'QUIC vs TCP для Solana TPU?',
      options: [
        'QUIC: UDP-based з reliability + multiplexing built-in',
        'Lower handshake latency (0-RTT for repeat connections)',
        'Better congestion control під validator load',
        'TCP simpler але higher latency per connection'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'Все правильно. Module 5.5.'
    },
    {
      type: 'explain',
      q: 'Що таке Fiber protocol і чому important для Solana scaling?',
      ideal: 'Fiber — newer agave networking layer optimized для validator-to-validator traffic. Replaces older socket-based approach з kernel-bypass technology (DPDK-similar).\n\nKey aspects:\n1. Kernel bypass: packets go directly до NIC через user-space drivers, skipping kernel network stack. Reduces latency 10-100x for high-throughput traffic.\n\n2. Specifically designed для UDP multicast (turbine traffic). Standard kernel sockets struggle з millions of packets/sec.\n\n3. Reduces CPU overhead — handling packets у kernel uses cycles. Fiber moves це до user-space efficient processing.\n\n4. Required для achieving Firedancer-level throughput у agave.\n\nWhy important: Solana wants 1M+ TPS long-term. Standard kernel networking caps significantly lower. Fiber removes major bottleneck.\n\nFor operators: requires specific NIC support (Intel NICs з DPDK), kernel configuration. Not all hosting providers support. Currently optional, eventually may become mandatory для top-tier performance.',
      explanation: 'Module 5.5.'
    }
  ]
}
</script>

# 5. QUIC & Fiber (network details)

## TL;DR

**QUIC** — modern transport protocol used by Solana TPU. UDP-based з TCP-like reliability + multiplexing. Lower latency than TCP, better congestion control.

**Fiber** — newer agave networking layer using kernel-bypass для high-performance turbine. Critical для achieving high TPS, requires specific NIC support.

## QUIC у Solana

Старі validator versions used TCP / raw UDP. Switched до QUIC ~2023 для improvements:

### QUIC properties

| Property | TCP | UDP raw | QUIC |
|---|---|---|---|
| Reliable delivery | ✅ | ❌ | ✅ |
| Multiple streams | ❌ (one stream per connection) | ❌ | ✅ |
| Built-in encryption | ❌ | ❌ | ✅ (TLS 1.3) |
| Handshake latency | 1-RTT minimum | 0 | 0-RTT for repeat |
| Connection migration | ❌ | ❌ | ✅ |
| User-space implementation | Mostly kernel | User OK | User-space |

### Solana use case

TPU (incoming TXs) використовує QUIC для:

- **Many concurrent senders**: clients submit TXs concurrently. QUIC multiplexing handles efficiently.
- **Reliability**: TX submission shouldn't be lost
- **Encryption**: built-in TLS protects від MitM
- **Connection efficiency**: 0-RTT для repeat senders (apps re-sending many TXs)

### Stake-weighted QUIC

Solana added enhancement: validators prioritize QUIC connections from **other validators** based on stake. Anti-spam mechanism — random clients can DoS via TPU, stake-weighted prioritization protects validator.

Reserved bandwidth для known stake-holders.

## Fiber protocol

Recently introduced (~2024-2025) у agave: kernel-bypass networking layer для turbine traffic.

### Why kernel networking insufficient

Standard Linux network stack:

1. Packet arrives NIC → kernel network stack
2. Кернель processes (firewall, routing, протоколи)
3. Copies to user-space (validator process)
4. Validator processes

Each packet: ~10-50 microseconds overhead. Mainnet ~5000 packets/sec turbine receive = significant CPU.

Future scaling (Firedancer goals, Alpenglow throughput) — kernel becomes bottleneck.

### Fiber approach

Kernel bypass:

1. Packet arrives NIC → directly до user-space (skip kernel)
2. Validator processes inline (low latency)

Requires:
- **Compatible NIC** (Intel NICs з DPDK support зазвичай)
- **Hugepages** (large memory pages для efficient buffering)
- **CPU affinity** (specific cores dedicated до networking)
- **Special agave build/flags**

Performance gain: 10-100x packet processing throughput vs kernel networking.

### Status

Currently optional у agave. Activated through specific flags:

```bash
agave-validator \
    --enable-fiber \
    --fiber-config /path/to/fiber.toml \
    [other flags]
```

Many validators don't use yet (complexity, NIC requirements). Adoption growing.

Firedancer uses similar approach by default.

## TCP-based ports (still exist)

Не все Solana traffic over QUIC/Fiber:

- **RPC** (port 8899): standard HTTP over TCP
- **WebSocket** (port 8900): WebSocket over TCP
- **Gossip** (port 8001): primarily UDP, gossip-specific protocol

QUIC specifically для TPU. Fiber для turbine.

## Operator considerations

### Standard setup (no Fiber)

Most validators run без Fiber:
- Standard Ubuntu kernel
- Standard NICs
- agave default networking
- Adequate performance для mainnet currently

### Performance setup (з Fiber)

High-end operators:
- Intel NICs (X710, X550, E810 series)
- Hugepages configured
- Fiber enabled via config
- 10Gbps+ network

Cost trade-off: more setup complexity, hardware requirements vs incremental performance gains.

### Recommendation для LumLabs

For now: standard setup, focus on hardware fundamentals (CPU, RAM, NVMe). Fiber experimentation после mainnet performance optimization needs justify additional complexity.

## Connect to your work

### Verify QUIC active

```bash
# Validator logs mention QUIC connections
sudo journalctl -u solana | grep -i quic | tail -10

# Network connections — TPU port (8003 typical) should show QUIC traffic
ss -unap | grep ":8003"
```

### Monitor network performance

```bash
# Packet rate
sudo netstat -i eth0
# Look for high packet rates без errors

# Network errors
sudo ip -s link show eth0
# Look for drops/errors
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`QUIC`](/glossary#q), [`Fiber`](/glossary#f), [`Kernel bypass`](/glossary#k), [`DPDK`](/glossary#d), [`Stake-weighted QUIC`](/glossary#s), [`Hugepages`](/glossary#h)

## External refs

- [Anza: QUIC implementation](https://docs.anza.xyz/validator/quic)
- [QUIC protocol overview](https://www.cloudflare.com/learning/performance/what-is-http3/)

---

**Попередньо:** [← 4. Repair](/module-5/4-repair)
