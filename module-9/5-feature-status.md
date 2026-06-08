<script setup>
const quiz = {
  id: 'm9-5-feature-status',
  title: '🧠 Mini-check: Feature status',
  intro: '2 питання.',
  questions: [
    {
      type: 'command',
      q: 'Show all features + statuses (active/pending/inactive):',
      accepts: ['solana feature status', 'solana feature status --url mainnet-beta'],
      ideal: 'solana feature status',
      explanation: 'Module 9.5.'
    },
    {
      type: 'mcq',
      q: 'Feature pending(epoch_N) means:',
      options: [
        'Activates at start of epoch N',
        'Validator votes to support activation',
        'Already activated, just pending UI refresh',
        'Awaits ≥2/3 stake voting yes to activate'
      ],
      correct: [0],
      explanation: 'Pending = scheduled activation. Not voting period — voting happened previously, now timed activation. Module 9.5.'
    }
  ]
}
</script>

# 5. Feature flags & protocol activations

## TL;DR

Solana evolves through **feature flags** — protocol changes deployed gradually. Each feature has pubkey, status (active/pending/inactive), and activation epoch. Operators must track features через `solana feature status` для timing upgrades + understanding cluster behavior.

## Feature flag system

Each SIMD-implemented change has corresponding feature flag:

- **Feature pubkey** identifies feature
- **Code includes both behaviors** (old + new), gated by feature status check
- **Status checked**: validators активują new behavior when feature active

This allows gradual rollout без forced upgrades.

## solana feature status

Comprehensive feature view:

```bash
solana feature status
```

Output:

```
Feature                                              Status              Description
6FQNANGYQzpqmdJB4...                                active              Reduce compute budget overhead
2eDsj3iC4VDjGwS5J...                                pending(epoch:880)  Turbine V2 improvements
9b3vQDxK7CMvxL8Mt...                                pending(epoch:870)  Better fee market
Aja3K9xL2KsfwY...                                   inactive            Future SIMD ready
...

Filtered features: 142
Total features: 287
```

Columns:

| | |
|---|---|
| **Feature** | Pubkey identifying feature |
| **Status** | Current state |
| **Description** | Short summary purpose |

Statuses:

- **active**: feature applied currently
- **pending(epoch:N)**: scheduled to activate at start of epoch N
- **inactive**: code ready, not scheduled yet

### Filter за status

```bash
# Tільки активні
solana feature status | grep "active"

# Pending активаціon
solana feature status | grep "pending"

# Не активовані
solana feature status | grep "inactive"
```

### Specific feature inspection

```bash
solana feature status FEATURE_PUBKEY
```

Detailed information про specific feature.

## Pre-activation workflow

Before SIMD активуєтся:

1. **Notice** activation announcement (Discord, Twitter)

2. **Check status**:
   ```bash
   solana feature status | grep FEATURE_PUBKEY
   # Should show pending(epoch:NUM)
   ```

3. **Convert epoch до date/time**:
   ```bash
   solana epoch-info
   # Note current epoch + completion %
   # Calculate: (target_epoch - current) × 2 days = days till activation
   ```

4. **Verify validator version** supports feature:
   ```bash
   sudo /home/solana/ag/bin/agave-validator --version
   # Check release notes mention feature support
   ```

5. **Plan upgrade window** перш ніж activation epoch якщо need newer software

6. **Monitor closely post-activation** — first few epochs after activation для bugs

## Why operators care

Specific reasons:

### Software compatibility

Old validator software може not understand новий feature behavior. If feature activates і validator running old version → starts producing invalid blocks → goes delinquent.

**Action**: upgrade до supporting agave version перед activation.

### Behavior changes

Some features change runtime behavior:
- Different compute pricing
- Different rent rules
- Different vote credit accounting
- Different scheduling

**Action**: read SIMD specifications + release notes для understanding.

### Performance impact

New features можуть affect:
- TX execution speed
- Replay performance
- Vote latency

**Action**: monitor performance metrics post-activation, rollback якщо degradation.

## Feature voting

Some major features go through stake-weighted voting:

```bash
# Express support (через your vote authority)
solana feature activate FEATURE_PUBKEY --yes
```

Most features активуються однажди достignута critical mass support. Operators express opinion through this mechanism.

⚠️ Not all features use signal voting. Some pass через informal consensus + scheduled activation.

## Cluster-version vs feature-status

```bash
solana cluster-version
# Output: 2.1.0
```

= "що software version cluster running"

```bash
solana feature status
# Output: list features + activation states
```

= "що behavior cluster ENFORCING right now"

Cluster version increments з each agave release. Feature activations happen at epoch boundaries, often gating new behavior already у current cluster version.

Тому possible: cluster running version X, але only some X features actually active (others pending).

## Connect to your work

### Monthly feature check

Build into validator operations routine:

```bash
#!/bin/bash
# /home/devops_ssh/feature-check.sh

echo "=== Active features ==="
solana feature status --url localhost | grep "active" | wc -l

echo ""
echo "=== Pending activations (next 2 epochs) ==="
solana feature status --url localhost | grep "pending"

echo ""
echo "=== Cluster version ==="
solana cluster-version --url localhost
```

Run weekly або моnthly через cron.

## Hands-on

```bash
# Total features known
solana feature status --url localhost | grep -c "^[A-Za-z0-9]"

# Pending activations
solana feature status --url localhost | grep -i pending | head

# Cluster version
solana cluster-version --url localhost
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Feature flag`](/glossary#f), [`Feature pubkey`](/glossary#f), [`Activation epoch`](/glossary#a)

## External refs

- [Anza: Feature Activations](https://docs.anza.xyz/validator/proposing-features-changes-and-additions)

---

**Попередньо:** [← 4. Validator-side](/module-9/4-validator-side) | **Наступне:** [6. Benchmarking →](/module-9/6-benchmarking)
