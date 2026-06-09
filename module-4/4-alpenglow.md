<script setup>
const quiz = {
  id: 'm4-4-alpenglow',
  title: '🧠 Mini-check: Alpenglow',
  intro: '3 питання — твоя priority topic. Концепти що ти оперуєш кожен день на WNX0016778.',
  questions: [
    {
      type: 'compare',
      q: 'У чому ключові різниці між Tower BFT (current mainnet) і Alpenglow (SIMD-0326)?',
      ideal: '1. Voting mechanism: Tower BFT use individual vote TXs per slot. Alpenglow uses BLS aggregated signatures — кілька validators sign single combined message, reduces network overhead.\n\n2. Credits semantics: Tower BFT credits = 1 per successful vote (count of votes). Alpenglow epochCredits = lamport reward earned (актуальний рублевий результат, not vote count). Це fundamentally different — Alpenglow "accuracy metric" must normalize by stake to compare validators fairly.\n\n3. Finality speed: Tower BFT ~12-30 sec (depth 32 у tower). Alpenglow targets faster finality через improved voting protocol.\n\n4. Network efficiency: BLS aggregation reduces vote TX volume по cluster significantly — менше bandwidth для same security.\n\n5. Slashing: Alpenglow proposed більш строгий slashing для double-signs і protocol violations.\n\n6. Current status: Tower BFT live mainnet. Alpenglow community cluster (твій WNX0016778), не mainnet ще.',
      explanation: 'Ключове: BLS aggregation, lamport-based credits, faster finality, stricter slashing. Module 4.4.'
    },
    {
      type: 'diagnose',
      q: 'Твій Telegram bot на Alpenglow showed "Credits: ?" у Final Reports. Worked правильно для slot lag, але не для credits. Що могло бути cause і як це relates до SIMD-0326 semantics?',
      options: [
        'Bot script парсив credits як integer count (Tower BFT style), але Alpenglow повертає lamport amount — parsing failed',
        'RPC endpoint не повертав credits field у response',
        'Bash echo "$json" | python3 <<EOF pipe+heredoc concatenation issue (technical bug)',
        'Validator stopped voting'
      ],
      correct: [0, 2],
      explanation: 'Real cause був technical bash bug (pipe+heredoc concatenation, fixed by switch to python3 -c). АЛЕ також conceptual issue: на Alpenglow credits != vote count, тому naive parsing/comparison may fail. Validator був voting, RPC returned data. Module 4.4.'
    },
    {
      type: 'mcq',
      q: 'Що з цього потрібно для validator on Alpenglow community cluster (vs mainnet)?',
      options: [
        'BLS pubkey (auto-set via V2 create-vote-account instruction)',
        'VAT (Validator Admission Ticket) — 1.6 SOL/epoch',
        'Stake minimum 1 SOL для voting',
        'KYC verification through Anza'
      ],
      correct: [0, 1, 2],
      explanation: '#1 BLS pubkey — Alpenglow consensus aggregation key. #2 VAT — admission mechanism (з cheatsheet §15). #3 1 SOL minimum self-stake. #4 KYC не потрібен — community cluster permissionless. Module 4.4.'
    }
  ]
}
</script>

# 4. Alpenglow (SIMD-0326) overview

> ⚠️ Цей модуль — **research / proposed protocol**. Як 2026 Alpenglow still pre-mainnet, тестується community cluster (твій). Specifics можуть змінитись перш ніж mainnet adoption.

> 📚 **Deep dive available**: цей section дає overview. Для comprehensive Alpenglow operations coverage (Votor mechanics, Rotor, vote history, identity management, 5 failover patterns, slashing landscape) — see [Module 11: Alpenglow operations deep dive](/module-11/).

## TL;DR

**Alpenglow** (SIMD-0326) — proposed next-generation Solana consensus protocol. Replaces Tower BFT з: **BLS aggregated signatures** для votes (less network overhead), **faster finality**, **lamport-based credits** (різна semantics ніж classical Tower BFT). Currently tested на community cluster — твій validator на WNX0016778.

Critical для тебе: ти **operator** Alpenglow validator. Розуміти specifics = розуміти що twoj bot monitors, чому credits comparison failed, чому BLS pubkey потрібен.

## Концепти

### Чому Alpenglow

Tower BFT добре працює для current Solana throughput, але має limitations:

1. **Network overhead** — individual vote TX per validator per slot = mainnet ~2000 validators × 2.5 slots/sec = 5000 vote TXs/sec just для voting. Велика частина network bandwidth.

2. **Finality time** — ~12-30 sec для Finalized stoupayich. Анza wants faster для better UX (apps need finality before exchanges credit deposits).

3. **Slashing implementation gap** — Tower BFT has slashing condition defined але not enforced. Alpenglow proposes stricter, enforceable slashing.

4. **Voting flexibility** — Tower BFT voting pattern relatively rigid. Alpenglow proposes більш flexible voting що краще handles network conditions.

Alpenglow attempts solve через:

- **BLS aggregation**: many validators sign single combined message → one network TX замість 1000
- **Better fork choice**: faster convergence on canonical fork
- **Per-validator vote weight**: incorporates stake weight directly у aggregation

### BLS signatures

**BLS** (Boneh-Lynn-Shacham) — signature scheme з unique property: можна **aggregate** кілька signatures від різних signers у одну signature.

Traditional ed25519 (current Solana):

```
Vote 1: 64 bytes signature від Validator A
Vote 2: 64 bytes signature від Validator B
Vote 3: 64 bytes signature від Validator C
Total: 192 bytes для 3 votes
```

BLS aggregated:

```
Combined signature: 96 bytes (constant size, regardless of validator count!)
+ pubkey aggregation: ~96 bytes
Total: ~192 bytes для 3 votes — but: same size для 1000 validators!
```

Це massive bandwidth reduction для voting traffic.

### Alpenglow voting

Замість individual vote TXs:

1. Validator generates vote (similar до Tower BFT)
2. Vote signed з validator's **BLS key** (separate from identity/vote keys)
3. Validators aggregate signatures local
4. Aggregated vote submitted у single TX (efficient)

Це чому твій validator має `BLS:` pubkey у constants (`6Rky9LMcW5wLXzgH3LtTdYdU8rJDanrHQ8eHgGoAPUnjpKHqVFy8pZui92gD1TTP5S`) — Alpenglow consensus key для signing aggregations.

BLS pubkey auto-set когда створюєш vote account з V2 instruction (з §13 cheatsheet):

```bash
solana create-vote-account ... --commission 10 --allow-unsafe-authorized-withdrawer
```

V2 (newer agave) automatically populates BLS field. V1 (older) — separate command needed.

### Credits semantics на Alpenglow

⚠️ **CRITICAL** для розуміння bot/monitoring behavior:

Classical Tower BFT:

```
epochCredits = number of successful votes (count)
```

Alpenglow (SIMD-0326):

```
epochCredits = lamport reward earned (currency amount)
```

**Different semantics!** На classical comparing two validators credits — fair (both can earn max ~432,000 votes per epoch). На Alpenglow comparing credits — unfair without normalization (different stakes earn different amounts).

З твоєї memory `alpenglow_credits_semantics.md`:

> Under SIMD-0326, epochCredits = lamport reward (not vote count); accuracy metric must normalize by stake.

Тобто bot або dashboard що compares validator performance на Alpenglow must use formula:

```
accuracy = (our_credits_per_stake_unit / max_credits_per_stake_unit) × 100
```

Naive `our_credits / max_credits` would be wrong on Alpenglow (would penalize small-stake validators).

### Finality на Alpenglow

Alpenglow proposes faster finality через **single-round voting** with BLS aggregation:

- Tower BFT: ~12-30 sec finalized (depth 32 у tower, multi-round implicit voting)
- Alpenglow target: sub-second finality для confirmed, few seconds для finalized

Real numbers depend on cluster size + network conditions. Community cluster testing шукає numbers.

### Slashing на Alpenglow

Stricter slashing proposed:

- **Double-vote**: instant slash + ejection
- **Equivocation** (signing conflicting blocks at same slot): instant slash
- **Inactivity** beyond threshold: gradual stake reduction

Не reqular slashing (як Cosmos), але significantly stricter than current Tower BFT (where slashing exists in spec but not enforced).

### Halt threshold

Tower BFT: cluster halts if delinquent stake > 33% (2/3 threshold).

Alpenglow: ~18% delinquent halt threshold (з твоєї cheatsheet pre-flight check). Лower threshold = less margin for downtime.

Тому з §4 Phase 1: "якщо cluster delinquent > 5% — не restart" critical specifically на Alpenglow.

## Connect to your work

### Bot monitoring issues 2026-05-23

З memory `lumlabs_alpenglow_monitor_bot.md`: bot showed `Credits: ?` у Final Reports. Real cause був bash bug, але conceptual aspect:

- Якщо bot was naively comparing credits like Tower BFT — comparisons would be misleading на Alpenglow
- Proper monitoring needs stake normalization formula

Bot improvements should include:
- Parse credits as lamport amount (not vote count)
- Normalize accuracy metric by stake
- Show per-validator-stake comparison rather than raw credits

### VAT (Validator Admission Ticket)

Alpenglow-specific mechanism для validator participation:

```
VAT cost: 1.6 SOL per epoch
N+1 timing rule: if pay VAT during epoch N, becomes active for epoch N+1
```

Without VAT — validator can't участи у consensus, no rewards. З §15 cheatsheet workflow для funding VAT.

Mainnet (Tower BFT) не має VAT — anyone з stake може vote. Alpenglow adds VAT як economic barrier (anti-spam).

### Cluster restart sensitivity

Alpenglow research cluster:

- ~30-50 validators (small)
- Active research changes
- Halt threshold 18% (lower than mainnet)

Тому one validator restart може trigger cascade. З §3 cheatsheet — strict pre-flight checks і wait-for-restart-window matter even more.

## Hands-on exercise

```bash
# Подивись на твій BLS pubkey у vote account state
sudo /home/solana/ag/bin/solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899 | grep -i bls

# Поточні credits (Alpenglow semantics = lamport reward)
sudo /home/solana/ag/bin/solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899 | grep -A 5 Credits

# Cluster stats
sudo /home/solana/ag/bin/solana validators --url http://localhost:8899 | head -10
sudo /home/solana/ag/bin/solana validators --url http://localhost:8899 | grep -E "Active|Delinquent"

# Cluster version (current Alpenglow version)
sudo /home/solana/ag/bin/solana cluster-version --url http://localhost:8899

# Хто voted recently
sudo /home/solana/ag/bin/solana validators --url http://localhost:8899 | tail -20
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Alpenglow`](/glossary#a), [`SIMD-0326`](/glossary#s), [`BLS signature`](/glossary#b), [`Signature aggregation`](/glossary#s), [`VAT`](/glossary#v), [`Lamport credits`](/glossary#l), [`Validator Admission Ticket`](/glossary#v)

## External refs

- [SIMD-0326: Alpenglow](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0326-alpenglow.md) — proposal text
- [Alpenglow Whitepaper](https://www.anza.xyz/blog/alpenglow-a-new-consensus-for-solana)
- [Alpenglow Community Cluster Discord](https://discord.com/channels/ag-community-cluster) — current state, announcements

## Related modules

- [**Module 11: Alpenglow operations deep dive**](/module-11/) — comprehensive coverage including Votor consensus mechanics, Rotor block propagation, vote history management, identity hot-swap procedures, 5 failover patterns comparison, slashing landscape, cluster operations
- [Module 4.6: Slashing deep](/module-4/6-slashing-deep) — slashing current state across Tower BFT + Alpenglow
- [Module 4.7: Recent SIMDs](/module-4/7-recent-simds) — SIMD-0326 + related proposals tracking
- [Module 10.4: Governance](/module-10/4-governance) — SIMD process, voting on Alpenglow

---

**Попередньо:** [← 3. Votes & credits](/module-4/3-votes-credits) | **Наступне:** [5. Forks, lockouts, fork choice →](/module-4/5-forks)
