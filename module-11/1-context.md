<script setup>
const quiz = {
  id: 'm11-1-context',
  title: '🧠 Mini-check: Alpenglow context',
  intro: '3 питання — historical + governance context.',
  questions: [
    {
      type: 'mcq',
      q: 'Які components Alpenglow заміняє у current Solana?',
      options: [
        'Tower BFT consensus',
        'Turbine block propagation',
        'Proof of History clock',
        'SPL Token Program'
      ],
      correct: [0, 1, 2],
      explanation: 'Alpenglow заміняє consensus (Tower BFT → Votor), block propagation (Turbine → Rotor), AND PoH (replaced by fixed 400ms slot timing). SPL Token Program — application layer, NOT touched. Module 11.1.'
    },
    {
      type: 'compare',
      q: 'У чому ключові entities responsible за Alpenglow development і governance?',
      ideal: 'Alpenglow proposed by Anza team (specifically researchers Roger Wattenhofer, Quentin Kniep, та інші). SIMD-0326 — formal Solana governance proposal published у Solana Foundation Improvement Documents repo.\n\nGovernance flow:\n1. SIMD published — community feedback period\n2. Validator vote (stake-weighted) approves\n3. Anza implements у Agave codebase (master branch first, then release branch)\n4. Community testing на dedicated cluster\n5. Mainnet activation at scheduled epoch\n\nCurrent state (2026-06): SIMD-0326 approved (Sep 2025). Implementation у progress. Community cluster active for testing (AshwinSekar/solana fork). Target mainnet: Agave 4.1 release, Q3 2026.\n\nKey personnel:\n- Roger Wattenhofer (formal proofs + paper)\n- Ashwin Sekar (Anza, leads implementation)\n- Anatoly Yakovenko (Solana Labs co-founder, advocacy)\n\nDiscussions happen у Solana Discord #ag-community-cluster channel + Solana developer forums.',
      explanation: 'Module 11.1.'
    },
    {
      type: 'mcq',
      q: 'Що з цього вірно про current Alpenglow community cluster (2026-06)?',
      options: [
        '~90 validators total (active + delinquent)',
        '~4.4M SOL у total active stake',
        'Most validators on version 0.4.4',
        'Already mainnet — accepting real SOL'
      ],
      correct: [0, 1, 2],
      explanation: 'Community cluster is testing environment, NOT mainnet. SOL there is tokens for testing, не real. Per Alpenglow Explorer 2026-06. Module 11.1.'
    }
  ]
}
</script>

# 1. Alpenglow context — history, governance, timeline

## TL;DR

**Alpenglow** = formal name для consensus rewrite proposal на Solana. Replaces three core components: Tower BFT (consensus), Turbine (block propagation), Proof of History (clock). Approved у governance Sep 2025 (SIMD-0326). Currently тестується community cluster. Target mainnet activation: **Agave 4.1, Q3 2026**.

## Origins

Proposal originated у Anza Research team:

- **Roger Wattenhofer** (ETH Zurich + Anza) — formal proofs + companion whitepaper
- **Quentin Kniep** + інші researchers — protocol design
- **Ashwin Sekar** (Anza) — implementation lead

Unveiled публічно на **Accelerate conference (May 2024)** як response до several Solana limitations:

1. **Latency**: Tower BFT requires ~12.8 seconds для deterministic finality (32-deep lockout chain). DeFi apps, payment systems want sub-second.
2. **Block space waste**: Vote TXs consume ~25-75% block space (varies). Less room для user transactions.
3. **Vote fees burden**: Validators pay ~1 SOL/day у vote TX fees. Small operators non-profitable.
4. **Hardware constraints**: PoH single-threaded hashing requires high single-thread CPU performance — limits hardware choice.

## Governance journey

### SIMD-0326 timeline

| Date | Event |
|---|---|
| May 2024 | Accelerate unveiling |
| Aug 2025 | SIMD-0326 published (formal proposal) |
| Aug-Sep 2025 | Community discussion period |
| Sep 9 2025 | Validator vote approved |
| Late 2025 | Implementation у Agave master branch |
| Early 2026 | Community cluster launched |
| Q3 2026 (target) | Agave 4.1 release з Alpenglow |
| TBD | Mainnet activation epoch |

### Related SIMDs

Alpenglow не — це **single** SIMD. Family related proposals:

| SIMD | Що |
|---|---|
| **SIMD-0326** | Alpenglow core (Votor + finality model) |
| **SIMD-0327** (planned) | Rotor — block propagation |
| **SIMD-0385** | Smart Sampling (з Rotor) |
| **SIMD-0387** | BLS pubkey management у vote account |
| **SIMD-0185** | Vote account version 4 |
| **SIMD-0180** | Leader schedule keyed до vote account |
| **SIMD-0204** | Slashing program (foundation для Alpenglow violations) |

Кожен — independent proposal з власним adoption timeline. Vote together для coordinated rollout.

### Voting outcome (SIMD-0326)

Approved у Sep 2025 з broad community support. Key reasoning у favor:

- Validator economics: vote fees eliminated = lower break-even stake
- Block space: ~75% більше room для user TXs
- Hardware flexibility: HSM-friendly identity keys (no high-freq signing)
- Performance: sub-second finality

Concerns voiced:

- Migration complexity для existing operators
- Unknown impact на MEV strategies (latency arbitrage windows)
- Slashing implementation uncertainty
- Multiple Concurrent Leaders (MCL) interaction TBD

## Implementation locus

### Code repository

Primary implementation: **AshwinSekar/solana** fork of agave.

```
https://github.com/AshwinSekar/solana
```

Active branch: `alpenglow-v0.4` (tracks community cluster releases).

Recent commits (як 2026-06):
- `votor: do not reinsert votes / save VoteHistory for Standstill votes`
- `repair: fix set-identity bug on ping challenges`
- Various votor refinements

Будь-який operator може:
1. Clone repo
2. Checkout latest tag
3. Build (per cargo-install-all.sh)
4. Run validator з Alpenglow protocol

### Community cluster

Independent network для testing. **NOT mainnet** — окремий genesis, окремі validators, токени без real value.

Current state (per `ag.validblocks.com/validators`, 2026-06):

| Metric | Value |
|---|---|
| Total validators | ~90 |
| Active | ~79 |
| Delinquent | ~11 |
| Total active stake | ~4.37M SOL |
| Skip rate (cluster avg) | 8.56% |
| Most common version | 0.4.4 |

Notable operators у cluster:

- SolBlaze (3.79% stake)
- Pumpkin's Pool (2.64%)
- Pigs in Blankets (2.45%)
- Staking Facilities, Quicknode, Allnodes, Marinade Finance, Jupiter, тощо

### Discord channel

Primary discussion locus: `#ag-community-cluster` у Solana Discord.

Активні respondents:

- **Ashwin Sekar** (Anza) — implementation lead, answers technical questions
- **Roger Wattenhofer** (Anza Research) — protocol design questions
- Community operators (jasper9/Valigator, lu, тощо) — operational practices

Daily updates про cluster status, restarts, breaking changes.

## Path до mainnet

### What needs to happen

1. **Agave 4.1 release**: integrates Alpenglow protocol. Currently у master branch для testing. Target Q3 2026.
2. **Community cluster maturity**: months of stress testing, attack simulation, bug fixes.
3. **Security audits**: formal review by external firms (Trail of Bits, Halborn, тощо typical).
4. **BLS pubkey migration**: усі mainnet validators must register BLS pubkey у vote account (SIMD-0387). Module 11.7 covers process.
5. **Feature activation epoch**: cluster-wide simultaneous switchover at scheduled epoch boundary.

### Expected complications

**Validator readiness**:
- Не all operators будуть готові у timing window
- Old validators (з pre-Alpenglow software) become incompatible at activation
- Gradual rollout (e.g., 10% validators per week) reduces risk

**Infrastructure changes**:
- Active-standby setups need vote_history sync vs current tower.bin sync (Module 11.4)
- BLS keypair management workflow (Module 11.7)
- Monitoring tooling updates (Geyser, dashboards, alerts)

**Application impact**:
- RPC providers need updates для new commitment levels
- DeFi apps relying на 12.8s finality assumption need migration

### Post-activation roadmap

- **Rotor activation** (SIMD-0327): separate feature activation. Block propagation rewrite.
- **Slashing program** (SIMD-0204): observational first, then enforcement.
- **Multi-leader proposals** (TBD): potentially follow-up SIMDs.
- **Smart Sampling** (SIMD-0385): refinements з Rotor data.

## Mainnet vs community cluster differences

| | Community cluster | Mainnet (future) |
|---|---|---|
| Software version | Bleeding edge (frequent changes) | Stable releases only |
| Stake | Test tokens | Real SOL з value |
| Validators | ~90 active | ~1500-2000 (post-migration) |
| Restart frequency | Often (research) | Rare (production discipline) |
| Documentation | Discord + community | Official Anza docs |
| SLA | None | Implicit production expectation |
| Slashing | Not enforced (currently) | Eventually enforced |

Operators на community cluster — research/testing roles. Skills gained там transfer до mainnet operation коли activation happens.

## Why participate у community cluster (як operator)

Benefits:

1. **Learn operational patterns** до mainnet activation — Alpenglow operationally differs
2. **Build muscle memory** з new commands, file formats, failure modes
3. **Contribute до stability** — bug reports help Anza prepare для mainnet
4. **Establish reputation** у Anza community — community-known operators favored для SFDP/stake pools
5. **Profit неrelevant** — tokens without value, але learning value substantial

Costs:

1. **Hardware**: server (acceptable for community = smaller specs than mainnet)
2. **Time**: monitor Discord, respond до incidents, participate restarts
3. **Self-stake**: 1-2 SOL minimum (community tokens)
4. **No revenue**: no real rewards

Many serious operators run community cluster validators **alongside** mainnet operations.

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Alpenglow community cluster`](/glossary#a), [`Accelerate`](/glossary#a), [`AshwinSekar/solana fork`](/glossary#a), [`Multiple Concurrent Leaders`](/glossary#m), [`Smart Sampling`](/glossary#s), [`Alpenglow Explorer`](/glossary#a)

## External refs

- [SIMD-0326 Alpenglow proposal](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0326-alpenglow.md)
- [Alpenglow Explorer (Valid Blocks)](https://ag.validblocks.com/validators)
- [AshwinSekar/solana fork](https://github.com/AshwinSekar/solana)
- [Helius: Alpenglow deep dive](https://www.helius.dev/blog/alpenglow)

---

**Наступне:** [2. Votor consensus →](/module-11/2-votor-consensus)
