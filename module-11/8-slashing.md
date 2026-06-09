<script setup>
const quiz = {
  id: 'm11-8-slashing',
  title: '🧠 Mini-check: Slashing landscape',
  intro: '3 питання — current state + future enforcement.',
  questions: [
    {
      type: 'mcq',
      q: 'Current state of slashing on Solana (як 2026-06)?',
      options: [
        'Conditions defined у protocol but NOT actively enforced',
        'Tower BFT double-vote = technically slashable, no automatic execution',
        'Future SIMD-0204 will introduce observational layer first',
        'Already automatic stake destruction для violations'
      ],
      correct: [0, 1, 2],
      explanation: 'Currently social punishment only. SIMD-0204 lands observation layer. Auto-destruction future. Module 11.8.'
    },
    {
      type: 'compare',
      q: 'Tower BFT slashing violations vs Alpenglow slashing violations.',
      ideal: 'Tower BFT violations (mostly defined):\n- Double-vote: signing two conflicting votes for same slot\n- Lockout violation: voting against own previous lockout commitment\n- Equivocation: producing multiple blocks at same slot as leader\n\nDetection via on-chain vote TXs (vote history visible to all). Hard to commit accidentally если using proper tower.bin.\n\nAlpenglow violations:\n- Conflicting notarize + skip vote for same slot (primary new violation)\n- Multiple finalize votes за different blocks\n- Equivocation (duplicate block production у same slot)\n\nDetection harder бо individual votes off-chain. Must reconstruct from:\n- BLS certificate voter_bitmap analysis\n- Cross-validator gossip of received vote messages\n- Aggregator records\n\nWhy Alpenglow potentially harsher:\n1. set-identity без vote_history.bin can trigger unintentional double-vote\n2. Off-chain votes harder to "prove" accidentally — slashed if proven\n3. Stricter file requirements (vote_history.bin) reflect protocol stricter assumptions\n\nFuture enforcement (SIMD-0204 + Alpenglow-specific):\n- Both Tower BFT and Alpenglow violations eventually enforced\n- 10x weight for duplicate block production (worst offense)\n- 1x weight для voting violations\n- Quadratic penalty scaling based on percentage stake involved\n\nModule 11.8.',
      explanation: ''
    },
    {
      type: 'mcq',
      q: 'Proposed slashing penalty structure (quadratic scaling):',
      options: [
        '< 1% slashable stake: no penalty',
        '4.66% violation: ~1.2% slash',
        '> 33% stake: up to 100% penalty',
        'Linear scaling (1% violation = 1% slash)'
      ],
      correct: [0, 1, 2],
      explanation: 'Quadratic не linear. Incentivizes independent infrastructure. Module 11.8.'
    }
  ]
}
</script>

# 8. Slashing landscape — current + future

## TL;DR

**Current state (2026-06)**: Slashing **conditions defined** у protocol для both Tower BFT і Alpenglow, але **NOT actively enforced**. Social punishment only.

**Coming**:
- **SIMD-0204** introduces Slashing Program — observational first, eventually executional
- **Alpenglow-specific violations** integrate з Slashing Program post-mainnet
- **Quadratic penalty** scaling based on percent stake involved
- **10x weight** для duplicate block production vs 1x для voting violations

## Current state

### Tower BFT mainnet

Slashable conditions defined:
- Double-vote (signing two conflicting votes for same slot)
- Lockout violation (voting against own lockout commitment)
- Equivocation (multiple blocks at same slot from leader)

**Enforcement**: None automatic. Mechanisms exist у protocol but no on-chain transaction destroys stake currently.

Social punishment instead:
- Caught operators publicized у Discord/Twitter
- SFDP delegation removed
- Stake pools (Jito, Marinade) un-delegate
- Reputation damage = real economic cost
- Operators want to avoid violations even без protocol enforcement

### Alpenglow community cluster

Same conditions defined у Alpenglow protocol:
- Conflicting notarize + skip vote for same slot
- Multiple finalize votes for different blocks
- Equivocation (duplicate block production)

**Enforcement**: None currently. Test cluster, tokens без real value.

Operators voluntarily comply бо future mainnet enforcement coming.

## Why no enforcement yet

Several reasons:

1. **Early protocol design**: focus on performance + correctness first. Slashing programs require complex дue process logic.
2. **False positive risk**: bugs у validator software could trigger violations accidentally. Better wait until widespread confidence.
3. **Operational consensus needed**: slashing parameters require community agreement (severity, penalty curves, dispute mechanisms).
4. **Implementation maturity**: SIMD-0204 still в proposal stage.

Slashing programs у other chains (Cosmos, Eth2) took years to mature. Solana following similar path.

## SIMD-0180: foundation layer

URL: `https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0180-vote-account-keyed-leader-schedule.md`

### Key change

Leader schedule keyed до **vote account address** (not validator identity address).

### Why this matters для slashing

Currently:
- Leader produces block under identity address
- Stake delegated до vote account address
- Connection between them not directly enforced у leader schedule

After SIMD-0180:
- Leader schedule references vote account directly
- Direct, unambiguous link between block production duty and delegated stake
- Slashing attribution accurate: "vote account X produced duplicate blocks → vote account X stake at risk"

Foundation for any subsequent slashing program.

## SIMD-0204: Slashing Program

URL: `https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0204-slashing.md`

### Architecture

Slashing program як on-chain entity that:
1. Receives evidence of violation (via cryptographic proof)
2. Verifies evidence на-chain (signature checks, replay protection)
3. Records violation у permanent ledger
4. Initially: observational only (records без destroying stake)
5. Later: executional (destroys stake per penalty formula)

Two-phase rollout reduces risk of buggy implementation causing harm.

### Initial focus: Duplicate block production

Most clearly verifiable violation:
- Leader produces 2+ different blocks для same slot
- Each block has leader's signature
- Evidence = both blocks, both signed by same leader
- Proof = trivial cryptographic check

Penalty weight: **10x** standard (severe offense).

### Future expansions

After duplicate block enforcement stable:

- Voting violations (lockout, double-vote)
- Alpenglow violations (conflicting notarize/skip)
- Inactivity (gradual penalty для extended downtime)

Each requires separate SIMD з detailed mechanism.

## Penalty formula (proposed)

Quadratic scaling based on total slashable stake у violation set:

```
penalty_pct = f(slashable_stake_pct)

if slashable_stake_pct < 1%:
    penalty = 0%
elif slashable_stake_pct < 5%:
    penalty = small quadratic
elif slashable_stake_pct < 33%:
    penalty = larger quadratic
else (>= 33%):
    penalty = 100%
```

### Example values

| Stake violating | Penalty (approximate) |
|---|---|
| 0.5% | 0% (no penalty) |
| 1% | ~0.1% |
| 4.66% | ~1.2% |
| 10% | ~5% |
| 20% | ~25% |
| 33% | 100% (max penalty triggered) |

### Why quadratic

Linear scaling = same harm per validator regardless of correlation. Quadratic scaling:

- **Independent failures**: low penalty (small percentage involved)
- **Correlated failures**: high penalty (large percentage involved)
- Incentivizes operators to ensure **diverse infrastructure** (different datacenters, geo, providers)
- Reduces systemic risk

If single operator's many validators all fail same way:
- All у same violation set
- Combined stake percentage high
- Quadratic = high per-validator penalty

Encourages decentralization in infrastructure не just stake distribution.

## Alpenglow-specific violations

### Conflicting notarize + skip

Validator signs **both** notarize(block X) AND skip vote for same slot:

- Protocol assumption: validator either saw valid block (notarize) OR did not (skip)
- Both = contradiction = mathematical impossibility unless malicious or buggy
- Easy to detect: BLS signatures don't aggregate cleanly если both present
- Proof: two signed vote messages, same slot, conflicting types

### Triggers (accidental)

How operator might accidentally cause this:

1. **set-identity без vote_history.bin**: standby starts fresh, doesn't know about active's recent votes. Votes differently. → conflicting vote.
2. **Same identity on two servers**: both vote independently, may diverge. → conflicting.
3. **Software bug**: validator logic incorrectly votes both ways (rare).

Все scenarios preventable з proper operations:
- Sync vote_history.bin
- Single-machine identity OR proper hot-swap
- Tested software versions

### Triggers (malicious)

Theoretically:
1. Validator deliberately votes both ways to confuse cluster
2. Compromise validator key, attacker signs both
3. Coordinated attack involving multiple validators

Quadratic penalty deters такого rational actor.

## Operator implications

### Pre-enforcement period (now)

- Conditions defined, no economic damage if violate
- Best practice: act as if enforcement live (build muscle memory)
- Reputation costs apply currently
- Tools (SVS, etc.) already enforce safety

### Post-enforcement period (future)

When SIMD-0204 + Alpenglow violations both enforced:

- Bug у validator software = real money loss possible
- Operations discipline mandatory
- Auto-failover tools з safety checks essential
- Real-time vote_history sync mandatory
- Multi-region distribution important
- Monitoring + alerting must be proactive

Migration planning required. Don't wait until enforcement Sunday to learn.

### Unstaking exploit risk

Concern: validator could:
1. Commit violation
2. Quickly deactivate stake before slashing TX lands
3. Withdraw funds free from penalty

Proposed mitigation: **slashable cooldown period**. Stake remains slashable for several days after deactivation. Prevents arbitrage avoidance.

### Insurance and risk transfer

Industry developing:
- Slashing insurance products (Tenderize, others)
- Pools з shared slashing risk
- Validator service contracts with SLA

For high-stake validators, insurance might be cost-effective hedge.

## What this means для operations strategy

### Short-term (next 6-12 months)

- Continue current practices
- Monitor SIMD-0204 progress
- Test failover patterns
- Build vote_history sync infrastructure
- Document procedures

### Medium-term (12-24 months, Alpenglow mainnet activation)

- Migrate до active-standby setup mainnet
- Adopt automated failover tools
- Verify vote_history sync working end-to-end
- Monitor cluster health metrics actively

### Long-term (post-slashing enforcement)

- Multi-region distribution
- Diverse infrastructure (avoid correlated failures)
- Insurance evaluation
- Real-time alerting + on-call rotation

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Social punishment`](/glossary#s), [`Slashing program`](/glossary#s), [`Observational layer`](/glossary#o), [`Quadratic penalty`](/glossary#q), [`Slashing cooldown`](/glossary#s), [`Correlated failure`](/glossary#c), [`Slashing insurance`](/glossary#s)

## External refs

- [SIMD-0204: Slashing](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0204-slashing.md)
- [SIMD-0180: Leader schedule](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0180-vote-account-keyed-leader-schedule.md)
- [Helius: Bringing Slashing to Solana](https://www.helius.dev/blog/bringing-slashing-to-solana)

---

**Попередньо:** [← 7. Joining cluster](/module-11/7-joining-cluster) | **Наступне:** [9. Cluster operations →](/module-11/9-cluster-operations)
