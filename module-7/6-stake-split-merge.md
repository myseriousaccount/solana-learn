<script setup>
const quiz = {
  id: 'm7-6-stake-split-merge',
  title: '🧠 Mini-check: Stake split/merge',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'Чому split stake account?',
      options: [
        'Spread stake across multiple validators (one account = one delegation)',
        'Partial deactivation (split off portion to deactivate, leave rest active)',
        'Liquid staking simulator (small slice для experiments)',
        'Reduce single stake account size'
      ],
      correct: [0, 1, 2],
      explanation: '#4 — size не matter for stake accounts. Module 7.6.'
    },
    {
      type: 'command',
      q: 'Як split stake account на дві (50% кожна)?',
      accepts: [
        'solana split-stake source-stake-keypair.json new-stake-keypair.json 1',
        'solana split-stake source-stake-keypair.json new-stake-keypair.json AMOUNT'
      ],
      ideal: 'solana split-stake source-stake-keypair.json new-stake-keypair.json AMOUNT',
      explanation: 'split-stake takes source + new keypair + amount to split. AMOUNT у SOL. Module 7.6.'
    }
  ]
}
</script>

# 6. Stake split & merge operations

## TL;DR

**Split stake**: divide stake account into two — useful для spreading across validators, partial deactivation. **Merge stake**: combine two compatible stake accounts. Both operations preserve stake state (active stays active, etc.).

## Split stake

Use cases:

1. **Spread across validators**: one stake account → one delegation. Want 50% Validator A + 50% Validator B? Split first, then delegate each half.

2. **Partial deactivation**: have 100 SOL active, want to liquidate 30. Split off 30 SOL, deactivate that portion.

3. **Inheritance / distribution**: split stake account між benefıciaries.

### Command

```bash
solana split-stake \
    source-stake-keypair.json \
    new-stake-keypair.json \
    AMOUNT_TO_SPLIT_IN_SOL
```

Behavior:
- Source loses `AMOUNT_TO_SPLIT` (стає smaller)
- New keypair creates new stake account з `AMOUNT_TO_SPLIT`
- Both inherit same delegation, activation status, authorities
- Both rent-exempt (each needs ~0.00228 SOL reserve)

Example: split 10 SOL з 100 SOL account:

```bash
solana split-stake stake-100sol.json stake-10sol-split.json 10
```

After:
- `stake-100sol.json`: 90 SOL (still delegated to original validator, active if was)
- `stake-10sol-split.json`: 10 SOL (same delegation, same activation status)

### Caveats

- Both accounts maintain delegation (split doesn't undelegate)
- New keypair must be funded for rent reserve (~0.00228 SOL)
- Split doesn't change activation/deactivation schedule

## Merge stake

Opposite of split. Combine two compatible stake accounts:

### Compatibility requirements

Both accounts must:

1. **Same delegated validator** (or both undelegated)
2. **Same authorities** (staker, withdrawer)
3. **Same stake state** (both active, both inactive, etc.)
4. **No transient stake** (no partial activation/deactivation)

If not compatible — merge fails.

### Command

```bash
solana merge-stake \
    destination-stake-keypair.json \
    source-stake-keypair.json
```

Behavior:
- Source account closed
- All lamports + active stake moved до destination
- Source's rent reserve returned до destination

### Use cases

1. **Consolidate fragmented stakes**: many small stake accounts → fewer large ones
2. **After redelegation**: undelegate scattered accounts, merge inactive ones

## Connect to your work

### Mainnet: stake spreading

LumLabs mainnet validator may receive stake from delegators who want to spread risk:

- Delegator splits 1000 SOL → 500 to LumLabs + 500 to Validator B
- Each stake account independent
- Combined delegation visible у `solana stakes <VOTE_PUBKEY>`

### Alpenglow: self-stake adjustments

З §14 cheatsheet — your self-stake operations:

```bash
# Create stake account з 2 SOL
solana create-stake-account stake-keypair-1.json 2

# Delegate
solana delegate-stake stake-keypair-1.json 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo
```

If wanting to increase stake: create another stake account з additional SOL, delegate to same validator. Не need to merge unless cleanup desired.

Якщо хочеш зменшити stake: split off portion, deactivate that portion, withdraw after cooldown.

## Stake transient states

Be aware: stake accounts можуть be у transient states (activating, deactivating). У ці моменти split/merge restricted:

| Source state | Destination state | Merge allowed? |
|---|---|---|
| Active | Active (same validator) | ✅ |
| Inactive | Inactive | ✅ |
| Activating | Activating (same validator) | ❌ |
| Deactivating | Anything | ❌ |
| Different validators | — | ❌ |

Wait for stable state (active or inactive) перш ніж merge.

## Workflow example: redelegate

Redelegate from Validator A до Validator B:

```bash
# 1. Deactivate current
solana deactivate-stake stake-keypair.json

# 2. Wait 1 epoch для становить inactive

# 3. Withdraw OR redelegate
solana delegate-stake stake-keypair.json NEW_VOTE_PUBKEY
# Stake reactivates з warmup на наступний epoch
```

Alternative — split off portion to redelegate:

```bash
# 1. Split 30 SOL
solana split-stake stake-100sol.json stake-30sol.json 30

# 2. Deactivate split portion
solana deactivate-stake stake-30sol.json

# 3. Wait 1 epoch

# 4. Redelegate
solana delegate-stake stake-30sol.json NEW_VOTE_PUBKEY
```

Loses 1 epoch of rewards (during deactivation) but maintains other 70 SOL voting continuously.

## Hands-on

```bash
# Listed delegations
sudo /home/solana/ag/bin/solana stakes 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899 | head -30

# Stake account details
sudo /home/solana/ag/bin/solana stake-account /home/solana/solana/stake-keypair-1.json --url http://localhost:8899
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Split stake`](/glossary#s), [`Merge stake`](/glossary#m), [`Stake redelegation`](/glossary#s), [`Transient stake`](/glossary#t)

---

**Попередньо:** [← 5. Jito BE deep](/module-7/5-jito-block-engine)
