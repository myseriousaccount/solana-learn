<script setup>
const quiz = {
  id: 'm7-4-sfdp-pools',
  title: '🧠 Mini-check: SFDP & pools',
  intro: '2 питання.',
  questions: [
    {
      type: 'compare',
      q: 'SFDP vs Stake pools (Jito, Marinade)?',
      ideal: 'SFDP (Solana Foundation Delegation Program):\n- Anza/Foundation delegates "matching" stake до qualifying validators\n- Free для validator (no fee)\n- Requires meeting performance + decentralization criteria (geographic, software diversity, performance metrics)\n- Significant boost для new validators getting started\n- Can be removed якщо performance дроп\n\nStake pools:\n- Smart contracts collecting retail SOL (users mint liquid token: JitoSOL, mSOL, INF, etc.)\n- Algorithmically delegate до approved validators\n- Pay validator like normal delegation (commission applies)\n- Approved validators chosen by pool DAO/manager based on performance criteria\n- More transparent than SFDP, governed by tokens (JitoDAO, etc.)\n\nBoth provide stake to validators meeting standards. SFDP free + Foundation backed. Pools democratic + community governed.',
      explanation: 'Module 7.4.'
    },
    {
      type: 'mcq',
      q: 'Що з цього вірно про StakeNet Steward Config (per memory)?',
      options: [
        'Validator must meet specific criteria для qualifying у Steward pool',
        'JIP-28 ongoing 100% tier (active stake delegation)',
        'Criteria НЕ те ж саме що JIP-31/37 cash subsidy criteria',
        'Steward Config документація — canonical source для exact thresholds'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'Steward Config separate from JIPs cash. Critical distinction (per memory feedback). Module 7.4.'
    }
  ]
}
</script>

# 4. SFDP & stake pools

## TL;DR

**SFDP** (Solana Foundation Delegation Program) — Foundation delegates stake до qualifying validators (free). **Stake pools** — Jito/Marinade/etc. — community DAO-governed pools delegating retail SOL до approved validators. Both critical income streams для validators.

## SFDP

**Solana Foundation Delegation Program**: Anza/Foundation runs program where Foundation matches up to N SOL stake to validators meeting decentralization + performance criteria.

Criteria (приблизно):
- **Performance**: skip rate < threshold, vote credits high
- **Software diversity**: not over-concentrated на one version
- **Geographic diversity**: not all validators у same region
- **Identity**: known operator, not anonymous shell
- **Decentralization**: not too much stake from one source

Benefit:
- Free additional stake (no commission earned but boosts validator size)
- Stay у "tier 1" voting weight
- Reputation signal (Foundation-vetted)

Negative:
- Can be removed quickly якщо performance drops
- Not infinite (capped per validator)

## Stake pools

**Stake pools** — smart contracts collecting retail SOL → delegating to approved validators → issuing **liquid staking tokens** (LSTs).

Major pools:

| Pool | LST | Approach |
|---|---|---|
| **Jito** | JitoSOL | MEV-aware, performance-focused |
| **Marinade** | mSOL | Algorithmic delegation, validator scoring |
| **Sanctum** | INF + ind. LSTs | Infrastructure для LSTs |
| **Lido** | (formerly stSOL, sunsetted) | — |

User wants stake but want liquidity → deposit SOL → receive LST (1:1 initially, then accumulates rewards). Sell/use LST у DeFi while underlying SOL earns rewards.

Pool managers/DAOs decide validator set based on criteria similar to SFDP.

### StakeNet Steward

StakeNet — system для governing stake pool delegations через on-chain config. Per memory `feedback_verify_validator_criteria_from_official_sources.md`:

⚠️ **Critical**: StakeNet **Steward Config** thresholds ≠ JIP-31/37 cash subsidy criteria. Different programs. Always check **canonical official sources** для exact criteria.

### Jito JIP-28 (per memory)

- Ongoing JitoSOL delegation
- 100% tier active
- Eligible validators chosen за StakeNet Steward Config criteria
- Specific thresholds у docs (не paraphrase from memory без verifying)

## Connect to your work

### Mainnet income breakdown (typical)

```
LumLabs mainnet validator income:
├─ Foundation delegated stake (SFDP) — boosts rewards
├─ Jito stake pool delegation (JitoSOL via StakeNet)
├─ Direct delegators (individuals, treasuries)
├─ Self-stake
└─ Plus Jito tips (MEV) — bonus income
```

### Check delegations to твой validator

```bash
solana stakes YOUR_MAINNET_VOTE_PUBKEY --url mainnet-beta | head -30
```

Show всі stake accounts delegated. Можна group by staker to see SFDP, Jito, etc.

## Hands-on

```bash
# Alpenglow self-stake
sudo /home/solana/ag/bin/solana stakes 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899

# Mainnet stake breakdown (with explorer URL pre-built)
echo "https://stakewiz.com/validator/YOUR_MAINNET_VOTE_PUBKEY"
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary

[`SFDP`](/glossary#s), [`Stake pool`](/glossary#s), [`LST`](/glossary#l), [`Liquid staking token`](/glossary#l), [`JitoSOL`](/glossary#j), [`mSOL`](/glossary#m), [`StakeNet`](/glossary#s), [`Steward Config`](/glossary#s)

## External refs

- [SFDP overview](https://solana.org/delegation-program)
- [Jito StakeNet docs](https://docs.jito.network/stakenet)

---

**Попередньо:** [← 3. MEV/Jito](/module-7/3-mev-jito) | **Наступне:** [⭐ Final quiz →](/module-7/final-quiz)
