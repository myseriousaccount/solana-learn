<script setup>
const quiz = {
  id: 'm6-2-tvu',
  title: '🧠 Mini-check: TVU',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'TVU does:',
      options: [
        'Receives shreds від turbine',
        'Verifies leader\'s signatures',
        'Replays TXs у block to verify execution',
        'Forwards shreds до next layer turbine'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'TVU = "validate і replay blocks". Module 6.2.'
    },
    {
      type: 'compare',
      q: 'TPU vs TVU?',
      ideal: 'TPU (Transaction Processing Unit): incoming TXs path. Receives client TXs through QUIC, verifies, includes у block if leader, forwards to leader if not. Active when validator producing blocks.\n\nTVU (Transaction Validation Unit): incoming blocks path. Receives shreds from turbine (broadcasts of other leaders\' blocks), verifies, replays TXs to check leader didn\'t lie, votes. Active when validator validating others\' blocks (most of the time).\n\nMost validators spend majority of time у TVU (only leader ~25% of slots, most time validating). Both run concurrently.',
      explanation: 'Module 6.1, 6.2.'
    }
  ]
}
</script>

# 2. TVU — Transaction Validation Unit

## TL;DR

**TVU** (Transaction Validation Unit) — частина validator що receives shreds від turbine (other leaders' blocks), reconstructs blocks, replays TXs to verify execution, votes за block.

Most validator time spent у TVU (validating others) — only ~25% slots own leader (TPU active).

## Концепти

### TVU pipeline

```
Shreds received via turbine
        ↓
Shred validation (signatures, format)
        ↓
Block reconstruction (when enough shreds)
        ↓
Bank replay (execute TXs)
        ↓
Bank verification (compare local hash to leader's)
        ↓
Vote signing → submit through TPU
```

### Replay stage

Validator **replays** TXs у block — executes them locally, computes resulting state. Compares result hash to leader's claimed hash.

If matches → leader didn't lie → vote.
If differs → leader malicious / buggy → don't vote, raise alarm.

Це security mechanism: every validator independently verifies every block. Leader can't include invalid TXs (would be caught).

### TPU vs TVU concurrency

Both run continuously у validator process:

- TPU: receive + process incoming TXs (more active when leader)
- TVU: receive + validate incoming blocks (active most of the time)

Different threads/cores. Don't compete for resources.

## Connect to your work

Replay performance critical для voting on time:

- Slow replay → vote late → miss credits
- Cause: slow CPU, slow accountsDB (disk I/O)

```bash
sudo journalctl -u solana | grep -iE "replay|tvu" | tail -10
```

Look для:
- "Replay slot X took N ms" — long times = bottleneck
- "Replay stage stalled" — serious issue

## Hands-on

```bash
# Replay activity
sudo journalctl -u solana | grep -i replay | tail -10

# Disk I/O (replay reads/writes accountsDB)
iostat -x 1 5 | head -30
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary

[`TVU`](/glossary#t), [`Replay stage`](/glossary#r), [`Block verification`](/glossary#b)

## External refs

- [Anza: TVU](https://docs.anza.xyz/validator/tvu)

---

**Попередньо:** [← 1. TPU](/module-6/1-tpu) | **Наступне:** [3. AccountsDB →](/module-6/3-accountsdb)
