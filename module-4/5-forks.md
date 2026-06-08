<script setup>
const quiz = {
  id: 'm4-5-forks',
  title: '🧠 Mini-check: Forks',
  intro: '3 питання — fork mechanics.',
  questions: [
    {
      type: 'explain',
      q: 'Поясни як fork choice algorithm works у Tower BFT — як validator вирішує який fork canonical коли two competing forks existed?',
      ideal: 'Tower BFT fork choice — "heaviest fork rule":\n\n1. Кожен fork has набір validators які voted за нього (з різним stake amounts)\n2. Heavy fork = total stake голосуючих за нього\n3. Validator picks fork з найбільшим total stake voting за нього\n\nКлючова механіка з lockouts:\n\n4. Якщо validator already voted на fork A — он locked (per lockout rules). Cannot vote на conflicting fork B without violating lockout (which would slash).\n\n5. Lockouts exponential по depth → older votes lock validator harder.\n\n6. Result: cluster converges бо vast majority validators locked into heavy fork. Light fork lose validators (lockouts expire, validators switch до heavy).\n\nПрактично: forks резулto rare — leader schedule і fast finalization mean clear canonical chain зазвичай. Тільки edge cases (cluster split, network partitions) trigger forks.',
      explanation: 'Heaviest fork by stake, locked by lockouts → convergence. Module 4.5.'
    },
    {
      type: 'mcq',
      q: 'Як виникає fork на Solana?',
      options: [
        'Network partition — кластер split, дві halves продовжують separately',
        'Leader malfunction — produces conflicting blocks на same slot',
        'Software bug — different validators replay TX differently',
        'Якщо два TX try modify same account simultaneously'
      ],
      correct: [0, 1, 2],
      explanation: '#1, #2, #3 — справжні causes forks. #4 НЕПРАВИЛЬНО — це не fork (це TX execution conflict, handled by scheduler within single leader\'s block). Module 4.5.'
    },
    {
      type: 'mcq',
      q: 'Що відбувається з TX які landed на losing fork після fork choice settled?',
      options: [
        'Reverted — TX as if never executed',
        'Migrated до winning fork automatically',
        'Persisted у history як "orphaned" блок',
        'User refunded fee'
      ],
      correct: [0],
      explanation: 'Losing fork TXs reverted — accounts state rolled back. Validator must resubmit TX до canonical fork. Не auto-migrated. Module 4.5.'
    }
  ]
}
</script>

# 5. Forks, lockouts, fork choice

## TL;DR

**Fork** = ситуація коли cluster has two competing chains of blocks і не уzgод який canonical. Solana fork resolution через **fork choice algorithm** (heaviest stake-weighted fork wins) + **lockouts** (validators commitments prevent switching).

Forks rare на Solana через leader schedule (один leader per slot, no race) + fast finality. Common тільки під час network partitions або hardware/software malfunctions.

## Концепти

### Що таке fork

Normal cluster:

```
... ← Block 100 ← Block 101 ← Block 102 ← Block 103 ← ...
                     (canonical chain, single path)
```

Forked cluster:

```
... ← Block 100 ← Block 101A ← Block 102A ← Block 103A ← ...   (fork A)
             ↖
              Block 101B ← Block 102B ← Block 103B ← ...        (fork B)
```

Дві competing histories starting from same point. Cluster має choose який canonical.

### Як виникають forks на Solana

Most forks come from:

1. **Network partitions** — cluster splits, дві halves продовжують separately, each building своїх blocks
2. **Leader malfunction** — leader produces multiple competing blocks для свого slot (technically не дозволено, але buggy software might)
3. **Software bugs** — different validators replay TX differently (rare, would be major bug)
4. **Cluster restarts** — improper restart може trigger forks (з твого досвіду cluster restart, ledger wipes)

NOT forks (often confused):

- Skipped slot — slot just empty, no competing block
- Two TXs modifying same account — handled by scheduler within single block, not fork

### Fork choice algorithm

Solana uses **heaviest fork rule**:

```
canonical_fork = fork з найбільшою sum(stake of validators voting for it)
```

Кожен validator picks heaviest fork based on votes seen.

Аналогія: village voting на mayor. Two candidates. Village folks vote. Кандидат з більшою кількістю voters wins. Solana — voters weighted by stake (vote with $1M stake > vote with $1 stake).

### Lockouts prevent fork-switching

Tower BFT lockouts (Module 4.2) prevent validators silly switching:

- Validator voted for fork A at slot 100 → locked into A for N slots
- Cannot vote for fork B without violating lockout → would be slashable
- Validator either stays on A or accepts loss

Це converges cluster — minority fork loses validators over time (lockouts expire, validators switch to heavy), heavy fork gains.

### Fork resolution timeline

Typical fork resolution на mainnet:

```
T=0       Fork happens
T=0.4s    Both forks getting some votes  
T=2s      Heavy fork has 2/3 stake voting — становить Confirmed
T=12s     Heavy fork reaches Finalized
T=30s     Lockouts force minority validators to switch
T=60s     Fork resolved — losing fork orphaned
```

Fast convergence due to Tower BFT + PoH timing.

### TXs on losing fork

Якщо TX landed на losing fork:

- Block containing TX orphaned
- TX state changes reverted (як ніколи не виконалось)
- User's nonce/blockhash still consumed (fee paid, but state changes reverted)
- User must resubmit TX (з fresh blockhash) до canonical fork

Це чому **Finalized** confirmation level critical для high-value operations — Confirmed теоретично reversable if fork happens, Finalized is not.

### Probabilistic vs deterministic finality

- **Probabilistic** (Bitcoin-style): after N confirmations TX **probably** canonical. Always slight chance of reorg. Trust grows asymptotically.
- **Deterministic** (Solana finalized): після Finalized — mathematical guarantee no revert (would require >2/3 stake act malicious + violate lockouts).

Solana finalized provides much stronger guarantee than Bitcoin's "6 confirmations" rule.

### Cluster restart vs fork

З твоєї cheatsheet §3 — cluster restart це NOT fork:

- Fork: cluster live, two competing histories
- Restart: cluster halted, all validators agree to start fresh з new genesis

Restart procedure ensures NO fork (everyone wipes ledger, starts identical genesis state).

Якщо restart improperly executed (some validators skip wipe, retain old ledger) — could create fork between "in-genesis" і "out-of-genesis" validators. Це і чому Phase 1 cheatsheet emphasizes complete ledger wipe.

## Connect to your work

### Cluster restart fork risk

З §3 cheatsheet:

- Different operators executing restart procedure differently → potential fork
- Cached genesis bug (validator loads old genesis from ledger/tmp-genesis/) → validator joins wrong fork
- Solution: thorough ledger wipe + verify genesis hash matches expected

Coordinated cluster restart prevents forks через social coordination (всі operators do identical procedure).

### Vote on wrong fork = potential slashing

Якщо твій validator votes на different fork ніж majority:

- Votes wasted (don't count toward credits on canonical fork)
- Якщо conflicting votes detected (vote A на canonical, vote B на minority) → slashing condition triggered

Тому: don't manually edit vote/identity на live validator. Just let consensus work.

### Monitoring fork events

Rare на mainnet, но possible. Indicators:

```bash
# Different validator's lastVote pointing to different forks
sudo /home/solana/ag/bin/solana validators --url http://localhost:8899 --output json \
    | python3 -c "import json,sys; d=json.load(sys.stdin); votes=[v.get('lastVote',0) for v in d['validators']]; print(f'Min: {min(votes)}, Max: {max(votes)}, Range: {max(votes)-min(votes)}')"
```

Healthy: range дуже small (всі validators voted на similar recent slots). Forking: range large (validators voting на different slots = different forks).

## Hands-on exercise

```bash
# Slot stats — чи cluster healthy?
sudo /home/solana/ag/bin/solana validators --url http://localhost:8899 --output json 2>/dev/null \
    | python3 -c "
import json,sys
d = json.load(sys.stdin)
votes = [v.get('lastVote', 0) for v in d['validators'] if v.get('lastVote', 0) > 0]
print(f'Validators: {len(votes)}')
print(f'Min lastVote: {min(votes)}')
print(f'Max lastVote: {max(votes)}')
print(f'Spread: {max(votes) - min(votes)} slots')
"

# Cluster nodes
sudo /home/solana/ag/bin/solana gossip --url http://localhost:8899 | head -5

# Recent root slots — мають advance regularly
for i in {1..3}; do
    sudo /home/solana/ag/bin/solana epoch-info --url http://localhost:8899 | grep "Block height"
    sleep 2
done
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Fork`](/glossary#f), [`Fork choice`](/glossary#f), [`Heaviest fork rule`](/glossary#h), [`Reorg`](/glossary#r), [`Orphaned block`](/glossary#o), [`Network partition`](/glossary#n)

## External refs

- [Anza: Fork Choice](https://docs.anza.xyz/consensus/fork-generation)
- [Anza: Tower BFT (fork choice section)](https://docs.anza.xyz/implemented-proposals/tower-bft)

---

**Попередньо:** [← 4. Alpenglow](/module-4/4-alpenglow) | **Наступне:** [⭐ Final quiz →](/module-4/final-quiz)
