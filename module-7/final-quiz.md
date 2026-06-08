<script setup>
const quiz = {
  id: 'm7-final',
  title: '⭐ Module 7 — Final quiz',
  intro: '8 питань — economics.',
  questions: [
    {
      type: 'order',
      q: 'Stake lifecycle:',
      items: ['Initialized', 'Activating', 'Active (voting + earning rewards)', 'Deactivating', 'Inactive (withdrawable)'],
      correctOrder: [0, 1, 2, 3, 4],
      explanation: 'Module 7.1.'
    },
    {
      type: 'mcq',
      q: 'Що з цього вірно про stake account?',
      options: ['Owner = Stake Program', 'Може delegate до одного validator', 'Rent reserve ~0.00228 SOL', 'Може delegate до multiple validators одночасно'],
      correct: [0, 1, 2],
      explanation: 'One delegation per stake account. Multiple stake accounts to spread. Module 7.1.'
    },
    {
      type: 'explain',
      q: 'Чому stake activation чекає epoch boundary?',
      ideal: 'Consensus працює з єдиним stake snapshot per epoch для determinism. Mid-epoch changes би ламали leader schedule + vote tallying. Stake transition → snapshot at boundary → active у next epoch. ~1-48 година wait depending on position у epoch. Module 7.1.',
      explanation: ''
    },
    {
      type: 'explain',
      q: 'Поясни formula validator rewards.',
      ideal: '1. End of epoch: cluster computes inflation pool (~5%/year currently mainnet)\n2. validator_share = (their_credits / total_credits) × inflation_pool\n3. operator_income = validator_share × commission%\n4. delegator_pool = validator_share × (1 - commission%) split proportional to individual stakes\n\nPlus: 50% transaction fees від leader\'s blocks. Plus Jito tips якщо running Jito-Solana. Module 7.2.',
      explanation: ''
    },
    {
      type: 'mcq',
      q: 'Які increment validator income?',
      options: ['Higher commission', 'Larger total stake', 'Higher vote credits', 'Higher priority fees у leader blocks', 'Jito MEV tips'],
      correct: [0, 1, 2, 3, 4],
      explanation: 'Всі increment. Module 7.2, 7.3.'
    },
    {
      type: 'explain',
      q: 'Що таке MEV і як Jito заробляє для validators?',
      ideal: 'MEV = Maximum Extractable Value — profit з smart TX ordering. Sources: arbitrage, liquidations, backruns, frontruns, sandwiches.\n\nJito-Solana validator client extracts MEV для operators:\n1. Searchers discover opportunities, submit bundles з tips\n2. Jito block engine simulates, picks best paying\n3. Forwards bundles до validator (current leader)\n4. Validator includes у block, earns tips (50% operator, 50% stakers)\n\nSignificant validator income stream — 10-30% typical income. Mainnet ~50%+ stake runs Jito-Solana. Module 7.3.',
      explanation: ''
    },
    {
      type: 'compare',
      q: 'SFDP vs stake pools?',
      ideal: 'SFDP: Foundation delegates stake free до qualifying validators. Performance + decentralization criteria. Foundation backed.\n\nStake pools (Jito, Marinade): smart contracts collecting retail SOL, delegating до approved validators based on DAO criteria. Issue liquid staking tokens (JitoSOL, mSOL).\n\nDifference: SFDP free Foundation backing. Pools democratic, community governance.\n\nBoth common income streams для mainnet validators. Critical to qualify. Module 7.4.',
      explanation: ''
    },
    {
      type: 'mcq',
      q: 'StakeNet Steward Config (per memory):',
      options: [
        'Criteria для JitoSOL pool delegation',
        '= same as JIP-31/37 cash subsidy criteria',
        '= same as JIP-28 100% tier criteria',
        'Always check canonical official sources для exact thresholds'
      ],
      correct: [0, 2, 3],
      explanation: 'StakeNet Steward != JIP-31/37 (different programs). Module 7.4.'
    },
    {
      type: 'explain',
      q: 'Чому Jito Block Engine regional location matters для validator income?',
      ideal: 'Regional BEs (Frankfurt, NY, Tokyo, etc.) close to major financial centers де searchers located. Validators connect до nearest BE. Closer = lower latency = bundles reach validator before competing leaders. Validator у Frankfurt connecting Frankfurt BE = optimal. Far validator (e.g., remote region) → less bundle volume → less MEV income. Choice of datacenter affects не тільки basic ops але і MEV revenue. Module 7.5.',
      explanation: ''
    },
    {
      type: 'mcq',
      q: 'Чому split stake account?',
      options: [
        'Spread stake across multiple validators',
        'Partial deactivation',
        'Smaller stake account for experimentation',
        'Reduce inflation rate'
      ],
      correct: [0, 1, 2],
      explanation: '#4 нерелевантно — splits не affect inflation. Module 7.6.'
    }
  ]
}
</script>

# ⭐ Module 7 — Final quiz

<Quiz :data="quiz" />

---

**Наступне:** [Module 8: Operations security →](/module-8/)
