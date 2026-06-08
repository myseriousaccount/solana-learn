<script setup>
const quiz = {
  id: 'm4-3-votes-credits',
  title: '🧠 Mini-check: Votes & credits',
  intro: '3 питання — як vote translates у credits і rewards.',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього вірно про vote credits на classical Solana (pre-Alpenglow Tower BFT)? (обери всі)',
      options: [
        'Кожен successful vote landed = 1 credit',
        'Credits accumulate per epoch',
        'End of epoch: credits → lamport rewards proportional до stake share',
        'Credits можна "withdraw" як токени'
      ],
      correct: [0, 1, 2],
      explanation: 'Credits track voting performance. Convert до lamport rewards via inflation у кінці epoch. Не withdrawable directly — automatically distributed as SOL rewards. Module 4.3.'
    },
    {
      type: 'command',
      q: 'Як подивитись скільки credits ти заробила у останніх 5 epochs?',
      accepts: [
        'solana vote-account YOUR_VOTE | grep -A 7 "Epoch Voting"',
        'solana vote-account YOUR_VOTE | grep -A 5 Credits',
        'sudo /home/solana/ag/bin/solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899 | grep -A 7 "Epoch Voting"'
      ],
      ideal: 'solana vote-account YOUR_VOTE | grep -A 7 "Epoch Voting"',
      explanation: 'vote-account output має "Epoch Voting History" section. grep -A N виводить N рядків після match. Module 4.3.'
    },
    {
      type: 'explain',
      q: 'Поясни як rewards розподіляються validator vs delegators після epoch end.',
      ideal: 'У кінці кожного epoch:\n\n1. Cluster computes total inflation pool — це нові SOL minted (~5%/year currently, decreasing 15%/year per inflation schedule).\n\n2. Pool divided across active validators proportional до їх vote credits earned:\n   validator_share = (their_credits / total_credits_all_validators) × inflation_pool\n\n3. validator_share далі split:\n   - Commission % йде до validator identity (operator income)\n   - (100 - commission)% розподіляється до delegators proportional to їх stake відносно validator total stake\n\nПриклад:\nValidator earned 1000 SOL inflation share, commission 10%.\n- Operator: 100 SOL до identity\n- Delegators: 900 SOL spliticed proportional до each delegator stake\n\nДодатково: 50% transaction fees йдуть до leader (validator), не до delegators.\n\nДеlegators see rewards у формі їх stake account balance growing autom every epoch — їх стake "compounds" if not withdrawn.',
      explanation: 'Inflation pool → vote credits → validator share → commission split. Module 4.3.'
    }
  ]
}
</script>

# 3. Votes, credits, finality

## TL;DR

**Vote credit** = successful vote landed у block. Кожен validator accumulates credits per epoch. End of epoch: credits → lamport rewards proportional to validator's stake share. Operator earns **commission** %, delegators get rest.

**Finality** levels: Processed (validator's local view) → Confirmed (2/3 stake voted, ~1-3 sec) → Finalized (depth 32 у towers, ~12-30 sec).

## Концепти

### Vote credits

Кожна successful vote earns validator 1 credit. "Successful" means:

- Vote TX submitted by validator
- Vote TX included у some leader's block
- Vote not rejected (signature valid, target slot valid)

Credits **accumulate per epoch**. Reset at epoch boundary.

⚠️ **Alpenglow змінює semantics** (Module 4.4): `epochCredits` поле там означає lamport reward not vote count. Module 4.4 розкаже SIMD-0326 differences.

### Credits → rewards conversion

End of epoch process:

1. **Inflation pool computed**: nові SOL minted (currently ~5%/year ramped down 15%/year)
2. **Per-validator share**: `share = (validator_credits / total_credits) × pool`
3. **Commission deducted**: operator takes `commission %` to identity wallet
4. **Delegators get rest**: split proportionally to each delegator's stake

Приклад (приблизні mainnet numbers):

| Item | Value |
|---|---|
| Mainnet stake total | 400M SOL |
| Validator stake | 1M SOL (0.25% of cluster) |
| Validator total credits earned | 432,000 (max possible) |
| Cluster total credits | 1,728,000,000 (assuming healthy cluster) |
| Inflation pool per epoch | ~110,000 SOL |
| Validator share | 110,000 × (432,000 / 1,728,000,000) = ~27.5 SOL |
| Operator (10% commission) | 2.75 SOL |
| Delegators (90%) | 24.75 SOL |

### Commission

`commission` field у vote account: 0-100 %. How much operator takes.

Higher commission = more operator income, less for delegators. Market competition pushes commission down. Mainnet typical:

- Big established validators: 0-5% (high-volume, low margin)
- Mid-tier: 5-10%
- New/small validators: 5-10% (need to attract delegators)

Commission can be changed (with restrictions — Solana enforces "commission update window" once per epoch).

### Finality levels (recap)

З Module 3.4:

| Level | What | Time mainnet |
|---|---|---|
| **Processed** | Validator's local view | Instant |
| **Confirmed** | ≥2/3 stake voted | ~1-3 sec |
| **Finalized** | Depth 32 у tower (lockouts) | ~12-30 sec |

Confirmation level **per slot** — кожен slot independently reaches these states.

### Vote-account command output

```bash
solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo
```

```
Account Balance: 0.02728 SOL
Validator Identity: DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt
Authorized Voter Address: DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt
Authorized Withdrawer: DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt
Credits: 142847
Commission: 100%
Root Slot: 369450088
Recent Timestamp: 2026-06-08T14:23:01 (slot: 369450123)
Last Vote: 369450123
Epoch Voting History:
Epoch  Credits Earned
854    142847
853    430123
852    431200
851    429876
...
```

Розбір:

| Поле | Що означає |
|---|---|
| Account Balance | Rent reserve (~0.027 SOL) |
| Validator Identity | Identity pubkey |
| Authorized Voter | Хто може signsign vote TXs (зазвичай same as identity) |
| Authorized Withdrawer | Хто може withdraw vote account funds (critical key!) |
| Credits | Total credits across all epochs (cumulative) |
| Commission | % operator commission |
| Root Slot | Highest finalized slot |
| Last Vote | Most recent vote |
| Epoch Voting History | Per-epoch credits earned |

### Credits trends

Healthy validator:

- Epoch credits roughly constant (e.g., 430,000-432,000 — close to theoretical max)
- Currently epoch credits growing (still in progress)

Unhealthy:

- Sudden drop у credits (validator down, network issues)
- Long-term decline (degraded hardware/software)
- Zero credits (validator stopped voting completely)

### Authorized voter vs authorized withdrawer

Two separate authorities на vote account:

- **Authorized voter** — signs vote TXs. Used by validator software constantly. Should be на validator server (hot key).
- **Authorized withdrawer** — controls vote account itself: can withdraw rent reserve, change other authorities, set commission. **Critical key** — should be cold (offline).

⚠️ **CRITICAL** для mainnet: НЕВЕР use same key for both. Withdrawer key compromised = attacker can drain rent reserve, change commission to 100%, redirect rewards.

З 2026-06 testnet session: ти створювала vote account з `--allow-unsafe-authorized-withdrawer` (testnet OK). На mainnet — separate cold key для withdrawer.

## Connect to your work

### Daily credit monitoring

```bash
# Quick check current epoch credits
sudo /home/solana/ag/bin/solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899 | grep "Credits:"

# Per-epoch history
sudo /home/solana/ag/bin/solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899 | grep -A 10 "Epoch Voting"
```

### Pre-restart credits baseline (з cheatsheet §4)

З Module 0.4 verify pattern: перед upgrade record credits, після перевір що grows.

### Post-restart credit comparison

З §4 Phase 5: "Credits мають продовжити рости з тої цифри що була до рестарту". Це check that voting resumed.

## Hands-on exercise

```bash
# Current epoch credits
sudo /home/solana/ag/bin/solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899 | grep "Credits:"

# Per-epoch history (last 10 epochs)
sudo /home/solana/ag/bin/solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899 | grep -A 12 "Epoch Voting"

# Cluster-wide validator credits sample
sudo /home/solana/ag/bin/solana validators --url http://localhost:8899 | head -10

# Mainnet — твій operator (Help if you remember pubkey)
solana vote-account YOUR_MAINNET_VOTE_PUBKEY --url mainnet-beta | grep -A 10 "Epoch Voting"
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Vote credit`](/glossary#v), [`Authorized voter`](/glossary#a), [`Authorized withdrawer`](/glossary#a), [`Commission`](/glossary#c), [`Inflation pool`](/glossary#i), [`Validator rewards`](/glossary#v), [`Delegator rewards`](/glossary#d)

## External refs

- [Anza: Vote Program](https://docs.anza.xyz/runtime/programs#vote-program)
- [Anza: Inflation Schedule](https://docs.anza.xyz/implemented-proposals/ed_overview/ed_validation_client_economics)

---

**Попередньо:** [← 2. Tower BFT](/module-4/2-tower-bft) | **Наступне:** [4. Alpenglow (SIMD-0326) →](/module-4/4-alpenglow)
