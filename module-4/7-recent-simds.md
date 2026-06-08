<script setup>
const quiz = {
  id: 'm4-7-simds',
  title: '🧠 Mini-check: Recent SIMDs',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього є real impact-areas recent SIMDs?',
      options: [
        'Turbine V2 improvements (block propagation efficiency)',
        'Runtime / compute budget changes',
        'Fee/rent economic adjustments',
        'Account model expansions (Token-2022 native support, etc.)'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'Все real areas of recent SIMD activity. Module 4.7.'
    },
    {
      type: 'command',
      q: 'Як check які features активні у cluster?',
      accepts: ['solana feature status', 'solana feature status --url mainnet-beta'],
      ideal: 'solana feature status',
      explanation: 'Виводить enabled/pending features (kind of "what protocol version is cluster running"). Module 4.7, also Module 9.5.'
    }
  ]
}
</script>

# 7. Recent SIMDs & cluster evolution

## TL;DR

Solana evolves via SIMDs (Solana Improvement Documents) — formal protocol proposals voted in by validators. Recent SIMDs cover: Turbine V2 (better block propagation), Alpenglow consensus, fee market changes, runtime improvements. Operators must track + understand impact perш ніж features activate.

## SIMD process recap

З Module 10.4:

1. Proposal submitted → SIMD repo
2. Community discussion period
3. Validator vote (stake-weighted)
4. Implementation у agave/Firedancer
5. Activation at specific epoch boundary

Validators participate через `solana feature` command.

## Recent / active SIMDs (як 2026)

⚠️ Specific SIMD numbers change. Check [official SIMD repo](https://github.com/solana-foundation/solana-improvement-documents) для current state.

### SIMD-0326: Alpenglow consensus

Covered у Module 4.4. Major consensus overhaul: BLS aggregation, faster finality, stricter slashing.

Status: тестується community cluster (твій), не mainnet ще.

### SIMD-0123: Turbine V2

Block propagation improvements:
- Better tree formation
- Reduced shred overhead
- Improved erasure coding ratios

Impact: validators feel improved propagation latency, slightly higher TPS ceiling.

### SIMD-0096: Vote credits formula update

Adjust how vote credits computed (Tower BFT context). Affects validator rewards distribution slightly.

Impact: minor rewards reshuffle, mostly transparent to operators.

### SIMD-0207: Fee market reforms

Various improvements до priority fee mechanism, base fee handling.

Impact: better TX landing у congestion, fee market efficiency.

### SIMD-0151: Hash invalidation

Better handling of blockhash expiry edge cases. Reduces dropped TXs.

### Various runtime improvements

Many smaller SIMDs:
- Account compression улучшеnia
- Compute budget pricing changes
- Sealevel scheduler optimizations
- Bank replay performance

Track all через SIMD repo.

## Feature flags

Solana uses **feature flags** для gradual protocol evolution. Each SIMD typically:
- Defines feature pubkey
- Code includes both old і new behavior
- Validators check feature pubkey status (active/pending)
- When activated at epoch boundary — new behavior universally

### Check feature status

```bash
solana feature status
```

Output:

```
Feature                                              Status         Description
6FQNANGYQzpqmd...                                   active         Better fee market
9b3vQDx...                                          pending(859)   Turbine V2 (activates epoch 859)
Aja3K9xL...                                         inactive       Future SIMD ready for activation
...
```

- **active**: feature applied currently
- **pending(epoch_N)**: scheduled to activate
- **inactive**: code ready but not scheduled

### Per-feature inspection

```bash
solana feature status FEATURE_PUBKEY
# Detailed info про specific feature
```

## Operator implications

Why care about SIMDs:

1. **Software upgrade requirements**: new SIMDs require specific agave version. Old version cannot validate новий behavior.

2. **Activation timing**: when SIMD activates, behavior changes. Pre-activation monitoring + understanding critical.

3. **Performance impact**: some SIMDs change TX execution speed, vote credit dynamics, rewards.

4. **Configuration changes**: some SIMDs require new flags у systemd unit.

5. **Vote participation**: SIMD activation тривalу validator vote. Operator вирішує yes/no based on stake.

## Pre-activation checklist

Before SIMD activation epoch:

```bash
# 1. Verify on supported agave version (release notes mention SIMDs supported)
sudo /home/solana/ag/bin/agave-validator --version

# 2. Check feature status — confirm pending activation
solana feature status | grep FEATURE_PUBKEY

# 3. Read release notes для config changes
# https://github.com/anza-xyz/agave/releases

# 4. Test на testnet first якщо major change

# 5. Backup keypairs

# 6. Monitor cluster behavior closely post-activation
```

## Voting on SIMDs

Validator can vote on SIMD proposals via vote TX flag (signal support). Stake-weighted.

```bash
# Vote yes
solana vote-account YOUR_VOTE --signal-vote SIMD_NUM yes

# Vote no
solana vote-account YOUR_VOTE --signal-vote SIMD_NUM no
```

⚠️ Не all SIMDs use signal voting. Some pass через informal consensus (Discord discussion → implementation → activation).

## Connect to your work

Track SIMDs through:

- [SIMD GitHub](https://github.com/solana-foundation/solana-improvement-documents)
- Anza Discord #governance
- Solana Foundation announcements
- Twitter: @anza_xyz, @SolanaFndn

For LumLabs mainnet validator: stay on latest agave stable, monitor Discord для activation announcements, plan upgrades around SIMD activation epochs.

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Feature flag`](/glossary#f), [`Feature activation`](/glossary#f), [`Pending feature`](/glossary#p), [`SIMD repo`](/glossary#s)

## External refs

- [SIMD repository](https://github.com/solana-foundation/solana-improvement-documents)
- [Anza release notes](https://github.com/anza-xyz/agave/releases)

---

**Попередньо:** [← 6. Slashing deep](/module-4/6-slashing-deep)
