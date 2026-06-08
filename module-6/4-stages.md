<script setup>
const quiz = {
  id: 'm6-4-stages',
  title: '🧠 Mini-check: Banking & replay',
  intro: '2 питання — final piece validator internals.',
  questions: [
    {
      type: 'order',
      q: 'Postaj у правильному порядку (leader producing block):',
      items: [
        'Banking stage: execute TXs in parallel via Sealevel',
        'PoH service: continuous hashing',
        'Block packing: combine TXs + PoH ticks',
        'Shred generation + sign',
        'Broadcast through turbine'
      ],
      correctOrder: [1, 0, 2, 3, 4],
      explanation: 'PoH continuous → banking executes TXs → pack into block → shreds → broadcast. Module 6.4.'
    },
    {
      type: 'mcq',
      q: 'Banking stage parallelism:',
      options: [
        'Executes TXs у parallel across CPU cores via Sealevel',
        'Conflict detection via account locks',
        'Sequential для same-account TXs',
        'Single-threaded для simplicity'
      ],
      correct: [0, 1, 2],
      explanation: 'Sealevel parallel execution з account-level locking. Module 6.4.'
    }
  ]
}
</script>

# 4. Banking & replay stages

## TL;DR

**Banking stage**: коли validator is leader, виконує TXs у parallel via Sealevel, accumulates into block. **Replay stage**: коли validator validating others' blocks, executes TXs локально to verify.

Both stages call into Sealevel runtime для parallel execution.

## Концепти

### Banking stage (leader mode)

Active коли validator generating own block:

```
TXs from TPU buffer
       ↓
Sealevel scheduler: group по account access
       ↓
Parallel execute на multiple CPU cores
       ↓
Update accountsDB state (writeable accounts modified)
       ↓
Interleave з PoH ticks
       ↓
Build block
```

### Replay stage (validation mode)

Active коли validator validating others' blocks:

```
Shreds received via TVU
       ↓
Reconstruct block
       ↓
Sealevel: replay TXs у same order, parallel where possible
       ↓
Compute resulting state hash
       ↓
Compare to leader's claimed hash
       ↓
If match: vote yes. If diff: vote no, raise alarm.
```

### PoH service

Окрема thread continuously running `hash(prev_hash)`. Emits ticks periodically. Banking stage references current tick for TX ordering у block.

## Connect to your work

Performance monitoring:

```bash
# Banking activity
sudo journalctl -u solana | grep -i banking | tail -10

# CPU usage per thread (htop -t)
htop -t -p $(pgrep -f agave-validator | head -1)
```

Look для thread saturation — який thread bottleneck.

## Hands-on

```bash
# Process threads
ps -T -p $(pgrep -f agave-validator | head -1) -o pid,tid,stat,pcpu,comm | head -20

# Compute usage breakdown
top -H -p $(pgrep -f agave-validator | head -1) -n 1 | head -20
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary

[`Banking stage`](/glossary#b), [`Replay stage`](/glossary#r), [`PoH service`](/glossary#p), [`Account lock`](/glossary#a)

---

**Попередньо:** [← 3. AccountsDB](/module-6/3-accountsdb) | **Наступне:** [⭐ Final quiz →](/module-6/final-quiz)
