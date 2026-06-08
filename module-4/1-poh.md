<script setup>
const quiz = {
  id: 'm4-1-poh',
  title: '🧠 Mini-check: Proof of History',
  intro: '3 питання — PoH fundamentals.',
  questions: [
    {
      type: 'explain',
      q: 'Поясни своїми словами що таке PoH і чому Solana її потребує.',
      ideal: 'PoH (Proof of History) — це децентралізований "годинник", який доводить що passing time через recursive SHA-256 hashing. Validator continuously обчислює hash(previous_hash) у loop, кожна iteration triggers "tick". Скільки ticks = скільки часу пройшло (з deterministic перерахунком per ticks per second).\n\nЧому Solana потребує:\n\n1. Без trusted clock — нема способу validators agree про порядок подій. PoH дає cryptographically verifiable timeline без trust.\n\n2. Enables 400ms slots: leader може швидко вкладати TXs у "поточне" time window (current PoH tick range), без чекати global gossip про "котра година".\n\n3. Permits fast Tower BFT consensus: validators використовують PoH timestamps щоб verify когда vote was issued, прискорюючи tower computation.\n\n4. Reduces network overhead: не треба broadcast "сurrent time" з кожним message — PoH sequence sами self-проявляє time.\n\nАналогія: SHA-256 hashing як stopwatch — кожен click того ж самого хімічного механізму doves одиниця часу пройшла, тому що SHA є computationally expensive (потрібен real CPU work). Не можна fake "I did 1000 hashes" без реально їх обчислення.',
      explanation: 'Ключове: cryptographic clock без trust, enabler fast consensus. Якщо описала hashing loop + чому це matter — повна відповідь.'
    },
    {
      type: 'mcq',
      q: 'Що з цього вірно про PoH? (обери всі)',
      options: [
        'PoH тільки leader обчислює, не cluster',
        'PoH не consensus per se — це timestamping mechanism',
        'PoH ticks deterministic — different validators verifying same sequence reach same conclusions',
        'PoH замінює Tower BFT як voting consensus'
      ],
      correct: [0, 1, 2],
      explanation: 'PoH — це clock, не voting consensus (Tower BFT робить voting). Тільки current leader generates PoH. Other validators verify sequence. Tower BFT та PoH працюють разом. Module 4.1.'
    },
    {
      type: 'mcq',
      q: 'Що значить "tick" у PoH context?',
      options: [
        'Single iteration hash(prev_hash) → next_hash',
        'Marker через які passing time можна measure',
        'Group of ~12,500 hashes that produce one PoH counter increment',
        'Vote signal до cluster'
      ],
      correct: [0, 1, 2],
      explanation: 'Tick це basic time unit у PoH. На mainnet 1 tick = ~12,500 hashes (~6.25 ticks per slot). Не vote (це Tower BFT). Module 4.1.'
    }
  ]
}
</script>

# 1. Proof of History (PoH)

## TL;DR

**PoH (Proof of History)** — це cryptographic clock built з recursive SHA-256 hashing. Solana validator (current leader) continuously обчислює `hash(previous_hash) → next_hash` у loop. Це creates verifiable sequence де кожна iteration proves real CPU time passed.

PoH **не consensus сам по собі** — це **timestamping mechanism**. Consensus робить Tower BFT (Module 4.2). PoH dає Tower BFT надiйний `"котра година"` що дозволяє швидке voting.

## Концепти

### Проблема: time у distributed system

Класична задача distributed systems — як validators agree про порядок подій без trusted central clock?

Bitcoin solution: blocks come з timestamp from miner. But miners can lie. So Bitcoin uses block depth (probability of canonical chain) як time approximation.

Solana solution: **cryptographic clock** через PoH — кожен validator може **independently verify** time passage.

### Як PoH працює

Leader continuously runs loop:

```
loop {
    next_hash = sha256(previous_hash)
    previous_hash = next_hash
    counter += 1
    
    if counter % 12500 == 0 {
        emit_tick(counter, current_hash)
    }
}
```

Each iteration takes **real CPU time** (SHA-256 не зайвий — потрібен compute work). Не можна fake "I did 1M iterations" без actually doing them.

Periodically (~6.25 рази за 400ms slot, тобто ~64 ticks/sec) leader emits **tick** — marker з counter + hash. Tick = "this much time has passed since last tick".

### Чому це це clock

| Без PoH | З PoH |
|---|---|
| Validator timestamp = wall clock (можна fake) | Validator timestamp = PoH position (cryptographically proven) |
| Trust source требеба для clock sync | Trustless: any validator can verify PoH sequence |
| Time disagreement → consensus issues | All validators agree on PoH sequence ↔ time |

PoH дає cluster-wide **monotonic timeline** без trust:

```
PoH(0) → PoH(1) → PoH(2) → PoH(3) → ...

Кожна стрілка = real CPU work, не можна skip.
"Counter at 12500" означає 12500 hashes computed since start.
```

### PoH не consensus

Це важливо: **PoH не вирішує "хто має rights to write blocks"** — це Tower BFT job (Module 4.2). PoH just provides **timing infrastructure**.

Specifically PoH:

- Помагає leader stamp transactions з accurate time (no need для wall clock)
- Allows validators to verify "leader did process TX at PoH tick N"
- Provides timeline для votes ("validator voted at PoH tick M")

Tower BFT then uses цю timeline + stake weights для consensus.

### Tick rate vs slot rate

| Concept | Rate | Time |
|---|---|---|
| Hash | ~6 billion/sec on validator CPU | sub-nanosecond |
| Tick | ~64/sec | ~15.6ms кожен |
| Slot | 2.5/sec | 400ms кожен |

Тобто:

- 1 slot = 64 ticks
- 1 tick = 12500 hashes (mainnet config)
- 1 hash = sub-nanosecond

Leader emits tick кожні 12500 hashes ≈ 15.6ms ≈ 64 ticks per second. Validators verify ticks independently.

### Як validators verify PoH

Validator receives block з leader. Block contains PoH sequence (ticks + TXs interleaved). Validator:

1. Takes starting hash (from previous block)
2. Replays sequence: for each tick, compute hash(prev) и compare to leader's hash
3. If matches — sequence valid. Якщо ні — block invalid, reject.

Verification потребує real CPU time (same compute as generation). Це і безпекова guarantee — fake PoH sequence неможливо without actually doing work.

### PoH leader vs PoH validator

| Role | Compute |
|---|---|
| Leader (in their slot) | Generates PoH (continuous hashing) |
| Non-leader validators | Verifies received PoH (replay hashing) |
| Leader switching slots | Hands off PoH stream to next leader |

Leader changes every 4 slots (mainnet leader slot groups). PoH stream continuity preserved through handoffs.

### Why PoH critical для performance

Без PoH Solana би потребував traditional consensus protocols (Paxos, Raft, classical BFT) які потребують many rounds messages для agreement. Це slow (multi-second finality).

З PoH:

- Leader broadcasts block with embedded PoH timeline
- Validators can verify timing without additional gossip messages
- Tower BFT votes can reference PoH positions
- Consensus converges fast (1-3 sec confirmed, 12-30 sec finalized)

Це key enabler 400ms slots.

## Connect to your work

### PoH у твоєму validator workflow

Коли твій validator стає leader:

1. PoH thread starts hashing (initialized з last block's PoH)
2. Banking stage processes incoming TXs, interleaves them у PoH stream
3. Tick markers emit ~64/sec
4. На slot end — block contains full PoH sequence

Якщо твоя CPU **повільна** — PoH generation rate drops → less throughput per slot → fewer TXs included → потенційно skipped slot.

Це чому validator CPU потребує **high single-thread performance** — PoH single-threaded by design.

### Monitoring PoH performance

```bash
sudo tail -f /home/solana/solana/solana.log | grep -i "PoH"
```

Common log lines:

- `PoH tick rate: 6,250,000 hashes/sec` — normal
- `PoH overrun warning` — leader не встигає hash → degraded performance
- `Tick height N` — поточна tick

Якщо overruns frequent → CPU bottleneck.

## Hands-on exercise

```bash
# Подивись poH state локального validator
sudo /home/solana/ag/bin/solana epoch-info --url http://localhost:8899 | grep -i "block height"
# Block height = number of non-skipped blocks (related но не equal до slot)

# Поточна slot vs block height — різниця показує skipped slots count
SLOT=$(sudo /home/solana/ag/bin/solana slot --url http://localhost:8899)
BLOCK=$(sudo /home/solana/ag/bin/solana epoch-info --url http://localhost:8899 | grep "Block height" | awk '{print $3}')
echo "Slot: $SLOT, Block: $BLOCK, Skipped: $((SLOT - BLOCK))"

# PoH logs
sudo grep -i "poh" /home/solana/solana/solana.log | tail -20
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`PoH`](/glossary#p), [`Tick`](/glossary#t), [`SHA-256`](/glossary#s), [`PoH leader`](/glossary#p), [`Banking stage`](/glossary#b), [`PoH verifier`](/glossary#p)

## External refs

- [Anza: Proof of History](https://docs.anza.xyz/cluster/synchronization)
- [Anatoly Yakovenko: PoH whitepaper](https://solana.com/solana-whitepaper.pdf) — original 2017 paper
- [Helius: PoH Explained](https://www.helius.dev/blog/proof-of-history-proof-of-stake-proof-of-work-explained)

---

**Наступне:** [2. Tower BFT →](/module-4/2-tower-bft)
