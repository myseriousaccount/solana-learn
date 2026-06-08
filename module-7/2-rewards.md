<script setup>
const quiz = {
  id: 'm7-2-rewards',
  title: '🧠 Mini-check: Rewards',
  intro: '2 питання.',
  questions: [
    {
      type: 'explain',
      q: 'Поясни formula rewards distribution на mainnet.',
      ideal: '1. End of epoch: cluster computes total inflation pool (mainnet currently ~5%/year annualized, ramped down ~15% per year).\n\n2. Pool divided proportional to vote credits:\n   validator_share = (their_credits / total_credits_all_validators) × inflation_pool\n\n3. validator_share split by commission:\n   - operator_income = validator_share × (commission%)\n   - delegator_pool = validator_share × (1 - commission%)\n\n4. delegator_pool further split proportional to individual delegator stakes:\n   delegator_reward = (their_stake / validator_total_stake) × delegator_pool\n\nExample (numbers approx mainnet):\n- Validator with 1M stake, 432k credits earned, 10% commission\n- Total cluster: 400M stake, 1.5B credits, inflation pool 110k SOL/epoch\n- Validator share: 110k × (432k/1.5B) = 31.7 SOL\n- Operator: 3.17 SOL (10%)\n- Delegators: 28.5 SOL split proportional до each stake share\n\nDelegator з 100k SOL (10% твого validator) earns 2.85 SOL цей epoch.',
      explanation: 'Module 7.2.'
    },
    {
      type: 'mcq',
      q: 'Що з цього збільшує validator income?',
      options: ['Higher commission %', 'Larger total delegated stake', 'Higher vote credits earned', 'Higher transaction fees (priority fees) у блоках'],
      correct: [0, 1, 2, 3],
      explanation: 'Всі incrementally збільшують income. Commission % — direct. Stake → більше credits possible. Credits → більше inflation share. Fees → bonus revenue (50% leader). Module 7.2.'
    }
  ]
}
</script>

# 2. Inflation & rewards formula

## TL;DR

Validator income = (inflation rewards × stake share × vote credits) × commission + transaction fees (50% leader portion). Inflation currently ~5%/year, ramping down 15%/year annually.

## Інфляція schedule

Solana inflation:
- Initial rate: 8%
- Disinflation: 15%/year reduction
- Terminal: 1.5%

Currently 2026: ~5%/year inflation.

Total annual new SOL = supply × inflation_rate. Distributed to validators per their vote credits.

## Rewards formula

End of each epoch:

```
1. inflation_pool = supply × inflation_rate × (epoch_duration / year)

2. validator_share = (validator_credits / total_credits) × inflation_pool

3. operator_income = validator_share × commission%
   delegator_pool = validator_share × (1 - commission%)

4. delegator_reward[i] = (delegator_stake[i] / validator_total_stake) × delegator_pool
```

Validator earns max possible credits ≈ 432,000 per epoch (1 per slot if all slots). Realistic: 95-99% (small misses).

## Transaction fees revenue

Validator also earns:
- 50% of base fees (5000 lamports per signature × TXs у leader blocks)
- 50% of priority fees

50% burned (deflationary). Mainnet daily: ~hundreds SOL за активний leader.

## Connect to your work

### Track earnings

```bash
# Validator identity balance — operator income accumulates here
sudo /home/solana/ag/bin/solana balance DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt --url http://localhost:8899

# Recent epoch rewards
sudo /home/solana/ag/bin/solana inflation-rate --url http://localhost:8899
```

### Mainnet rewards tracker

External services (validator.app, stakewiz.com) track per-validator earnings:
- ROI for delegators
- Operator income trends
- Commission changes

## Hands-on

```bash
# Inflation rate cluster
curl -s -X POST http://localhost:8899 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getInflationRate"}' | jq

# Supply info
curl -s -X POST http://localhost:8899 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getSupply"}' | jq
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary

[`Inflation rate`](/glossary#i), [`Inflation pool`](/glossary#i), [`Validator rewards`](/glossary#v), [`Delegator rewards`](/glossary#d), [`Disinflation`](/glossary#d)

## External refs

- [Anza: Inflation](https://docs.anza.xyz/implemented-proposals/ed_overview/ed_validation_client_economics)

---

**Попередньо:** [← 1. Stake](/module-7/1-stake) | **Наступне:** [3. MEV, Jito, BAM →](/module-7/3-mev-jito)
