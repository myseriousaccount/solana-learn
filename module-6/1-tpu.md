<script setup>
const quiz = {
  id: 'm6-1-tpu',
  title: '🧠 Mini-check: TPU',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього робить TPU?',
      options: [
        'Receive TX submissions від clients через QUIC',
        'Verify signatures у parallel',
        'Pre-execute (sanity check) перед including у block',
        'Forward TXs до next leader якщо not currently leader'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'TPU = "ingest TXs у validator". Module 6.1.'
    },
    {
      type: 'explain',
      q: 'Чому TPU forwards TXs до next leader замість processити сам?',
      ideal: 'Тільки current leader може include TXs у block. Якщо random validator receives TX і це not currently leader — нема point holding TX (заfdamn doesn\'t help include).\n\nForward механіка:\n1. Validator receives TX через TPU\n2. Перевіряє leader schedule — хто current/upcoming leader\n3. Forward TX до leader\'s TPU\n4. Leader includes у його block\n\nЦе дає клієнтам can submit TX до any validator (не треба знати поточного leader) — TX eventually reaches leader.\n\nЕфективно: RPC nodes typically forward до 2-3 upcoming leaders щоб maximize chance включення.',
      explanation: 'Module 6.1.'
    }
  ]
}
</script>

# 1. TPU — Transaction Processing Unit

## TL;DR

**TPU** (Transaction Processing Unit) — частина validator що receives incoming TXs з clients через QUIC, verifies signatures, pre-executes, eventually includes у block (якщо validator is current leader) або forwards до actual leader.

## Концепти

### TPU pipeline

```
Client submits TX → TPU port (QUIC over UDP)
                       ↓
            Signature verification stage
                       ↓
            Sigverify pre-processing
                       ↓
            Banking stage (якщо leader)
                       ↓
            Include у block
            ↓ (якщо not leader)
            Forward до actual leader
```

### TPU ports

```
TPU port: 8003 (typical)         — receive new TXs
TPU forwards: 8004               — forwarded TXs від other validators
TPU vote: 8005                   — vote TXs (separate stream)
```

QUIC protocol (UDP-based) для high-performance.

### Sigverify

Signature verification GPU-accelerated на mainnet (if validator has GPU). Otherwise multi-threaded CPU.

Bottleneck часто. На mainnet ~3000+ TPS peak — signature verification at this rate потребує efficient hardware.

### Forwarding strategy

Якщо validator не current leader:
- Looks up upcoming leaders (next ~4 slots)
- Forwards TX до those leaders' TPU
- Improves landing chances у congestion

## Connect to your work

Моніторинг TPU activity:

```bash
sudo journalctl -u solana | grep -iE "tpu|sigverify" | tail -10
```

Bottleneck indicators:
- "Sigverify queue full" — overload
- "TPU buffer full" — overload
- "Forward failed" — network issue

## Hands-on

```bash
# TPU connections
ss -unap | grep ":8003" | head -10

# CPU usage by validator process
top -p $(pgrep -f agave-validator | head -1)
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary

[`TPU`](/glossary#t), [`Sigverify`](/glossary#s), [`QUIC`](/glossary#q), [`TX forwarding`](/glossary#t)

## External refs

- [Anza: TPU](https://docs.anza.xyz/validator/tpu)

---

**Наступне:** [2. TVU →](/module-6/2-tvu)
