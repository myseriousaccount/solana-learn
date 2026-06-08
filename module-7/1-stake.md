<script setup>
const quiz = {
  id: 'm7-1-stake',
  title: '🧠 Mini-check: Stake accounts',
  intro: '3 питання — stake delegation mechanics.',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього вірно про stake account?',
      options: ['Owner = Stake Program', 'Має stake_state (initialized/activating/active/deactivating/inactive)', 'Один stake account може delegate до multiple validators одночасно', 'Rent reserve ~0.00228 SOL'],
      correct: [0, 1, 3],
      explanation: 'Stake account delegate до ОДНОГО validator at a time. Module 7.1.'
    },
    {
      type: 'order',
      q: 'Postaj у правильному порядку (delegation lifecycle):',
      items: ['Initialized: stake account created з SOL', 'Activating: warmup до next epoch boundary', 'Active: voting + earning rewards', 'Deactivating: cooldown після undelegate', 'Inactive: ready to withdraw'],
      correctOrder: [0, 1, 2, 3, 4],
      explanation: 'Linear lifecycle. Module 7.1.'
    },
    {
      type: 'explain',
      q: 'Чому stake activation чекає epoch boundary?',
      ideal: 'Consensus працює з єдиним stake snapshot per epoch (для determinism). Mid-epoch stake changes би ламали leader schedule і vote weight tallying.\n\nProcess:\n1. Delegate-stake TX submitted у slot X (mid epoch N)\n2. Stake → "activating" status\n3. Кінець epoch N: cluster snapshots stakes, твій stake включений у snapshot\n4. Slot 0 epoch N+1: твій stake "active" у new stake set\n5. Validator починає включати твою вагу у voting/leader schedule\n6. У кінці epoch N+1 — твоя частка rewards proportionally\n\nЦе чому "почекай 1 epoch" — стандартний answer на "коли мій stake активний?"\n\nDeactivation similar: undelegate → "deactivating" → boundary → "inactive" → withdrawable.',
      explanation: 'Module 7.1.'
    }
  ]
}
</script>

# 1. Stake accounts & delegation

## TL;DR

**Stake account** — окремий account з owner = Stake Program що зберігає SOL "locked" для delegation. **Delegation** — direct stake до конкретного validator (vote account). Activations / deactivations align з epoch boundaries.

## Концепти

### Stake account anatomy

```
Stake account {
    owner: Stake Program
    data: {
        stake_state: Initialized | Activating | Active | Deactivating | Inactive,
        delegation: { vote_account, stake_amount, activation_epoch, deactivation_epoch },
        authorized: { staker, withdrawer }
    }
    lamports: total amount (rent reserve + active stake)
}
```

### State machine

```
Initialized → Activating → Active → Deactivating → Inactive
                ↑                                       ↓
                └──── re-delegate ──────────────────────┘
```

- **Initialized**: account created з SOL, не delegated yet
- **Activating**: delegated, чекає next epoch boundary
- **Active**: voting + earning rewards
- **Deactivating**: undelegated, чекає cooldown
- **Inactive**: cooldown complete, can withdraw SOL

### Two authorities

- **Staker**: can delegate/redelegate. Hot key OK.
- **Withdrawer**: can withdraw SOL з account. **Critical** — cold key recommended.

З §14 cheatsheet — stake-authorize commands для rotation.

### Epoch alignment

Стейки activate/deactivate ТІЛЬКИ на epoch boundaries (Module 1.2):

- Delegate mid-epoch N → active початок epoch N+1 (~1-48 годин wait)
- Undelegate mid-epoch N → inactive початок epoch N+1

Це enforces consensus determinism (single stake snapshot per epoch).

### Single delegation per stake account

Кожен stake account delegate до ОДНОГО validator. Якщо хочеш split stake across validators — create multiple stake accounts.

### Self-stake vs delegated stake

- **Self-stake**: validator operator stakes own SOL до own validator. На Alpenglow ти робиш self-stake 1-2 SOL.
- **Delegated stake**: third parties delegate до validator (SFDP, stake pools, individuals).

Validator total stake = self + всі delegated. Determines leader schedule slot count.

## Connect to your work

### Alpenglow self-stake

З 2026-06-02 cheatsheet — ти створювала stake account з 1 SOL, але voting не починався (rent reserve issue). Fix: ще 1 SOL (тепер 2 SOL total).

```bash
solana create-stake-account stake-keypair-1.json 2 --from validator-keypair.json
solana delegate-stake stake-keypair-1.json 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo
```

### Mainnet з SFDP / pools

Mainnet stake переважно з:
- **SFDP** (Solana Foundation Delegation Program) — Anza delegates до qualifying validators
- **Stake pools** (Jito, Marinade, Lido fallen, etc.) — collect retail SOL, delegate strategically
- **Direct delegators** — individuals/treasuries

LumLabs mainnet validator likely SFDP + stake pool delegations.

## Hands-on

```bash
# Твій stake account state
sudo /home/solana/ag/bin/solana stake-account /home/solana/solana/stake-keypair-1.json --url http://localhost:8899

# Stakes делегованих до твого validator
sudo /home/solana/ag/bin/solana stakes 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899 | head -20

# Cluster total stakes
sudo /home/solana/ag/bin/solana validators --url http://localhost:8899 | grep -E "Active|Delinquent"
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary

[`Stake account`](/glossary#s), [`Delegation`](/glossary#d), [`Staker authority`](/glossary#s), [`Withdrawer authority`](/glossary#w), [`Stake state`](/glossary#s), [`Self-stake`](/glossary#s), [`Warmup`](/glossary#w), [`Cooldown`](/glossary#c)

## External refs

- [Anza: Stake Program](https://docs.anza.xyz/cli/delegate-stake)

---

**Наступне:** [2. Inflation & rewards →](/module-7/2-rewards)
