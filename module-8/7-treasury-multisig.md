<script setup>
const quiz = {
  id: 'm8-7-treasury',
  title: '🧠 Mini-check: Treasury multisig',
  intro: '2 питання.',
  questions: [
    {
      type: 'explain',
      q: 'Чому Squads multisig стандарт для validator org treasury?',
      ideal: 'Single private key для org treasury = single point of failure. One compromise → all funds gone. One key holder departure → access lost.\n\nSquads multisig:\n1. N-of-M threshold (наприклад 3-of-5): need 3 signatures з 5 keys для operation\n2. Distribute keys серед team members (CEO, CTO, ops lead, legal, board member)\n3. Compromise one key = insufficient. Need to compromise 3+ simultaneously\n4. One member departure: revoke their key, others still operational\n5. On-chain auditable: всі actions transparent у blockchain history\n\nUse cases для LumLabs:\n- Holding cold withdrawer authorities для vote accounts\n- Operator income wallet (collected commission)\n- Treasury holdings (USDC, JTO, etc.)\n- Long-term cold storage validator earnings\n\nSetup time: ~30 min initial. Per-TX overhead: extra 1-2 sec для collecting signatures.',
      explanation: 'Module 8.7.'
    },
    {
      type: 'mcq',
      q: 'Best practice для Squads setup?',
      options: [
        '3-of-5 з each key on different hardware wallet',
        '2-of-3 acceptable для smaller orgs',
        'Threshold > 50% members (3-of-5, 4-of-7) для security',
        'Single member can sign (1-of-N) defeats purpose'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'Усі правильні. Module 8.7.'
    }
  ]
}
</script>

# 7. Treasury multisig (Squads)

## TL;DR

**Squads** — standard Solana multisig wallet. N-of-M threshold signing replaces single private key. Required для serious org treasury management. Used для cold withdrawer authority, treasury holdings, validator earnings cold storage.

## Чому multisig

Single private key risks:
- **Compromise** = all funds gone
- **Lost key** = locked funds forever
- **Team member departure** = trust assumption broken
- **Audit** = no transparency про who signed what

Multisig (e.g., 3-of-5):
- One key compromised = insufficient
- One member departs = revoke key, continue with rest
- All actions on-chain visible
- Defense in depth

## Squads basics

**Squads** = Solana smart contract programs implementing multisig + governance:

- Creates **vault account** (PDA) holding funds
- Defines **members** (their pubkeys) + **threshold**
- TXs propose-vote-execute workflow
- Members vote через UI (squads.so)

### N-of-M choices

| Setup | Use case |
|---|---|
| **2-of-3** | Small team, sufficient для basic |
| **3-of-5** | Standard для validator orgs |
| **4-of-7** | Larger orgs, higher security |
| **5-of-9** | Foundations, very large orgs |

Rule of thumb: threshold > 50% members. Below 50% = insufficient security.

### Member keys

Кожен member key MUST бути:
- На окремому hardware wallet (Ledger preferred)
- Different physical locations / people
- Different geographic regions якщо possible
- Documented у secure team wiki who holds what

## Setup process

### 1. Create Squad

Через [squads.so](https://squads.so):

1. Connect wallet (any member)
2. "Create Squad"
3. Set name (e.g., "LumLabs Treasury")
4. Add members (their pubkeys)
5. Set threshold (e.g., 3)
6. Confirm + sign creation TX

Output: Squad's **vault address** = treasury pubkey.

### 2. Fund the vault

```bash
# Send SOL to vault
solana transfer <SQUAD_VAULT_ADDRESS> 100 --allow-unfunded-recipient

# Або token transfer
spl-token transfer <USDC_MINT> 50000 <SQUAD_VAULT_ADDRESS>
```

Vault address — standard Solana address, accepts будь-які incoming transfers.

### 3. Use as withdrawer authority

When creating vote account:

```bash
solana create-vote-account \
    vote-keypair.json \
    validator-keypair.json \
    <SQUAD_VAULT_ADDRESS>          # ← Squad's vault as withdrawer
    --commission 10
```

Withdrawer = Squad vault. Any withdraw operation вимагає 3+ members signing через Squads UI.

### 4. Document everything

Шara team wiki з:
- Squad name + vault address
- Member list + pubkeys + key holders
- Threshold + voting rules
- Emergency recovery procedures
- Squad UI link

## Per-TX workflow

Коли потрібно execute operation (e.g., withdraw vote rent):

1. **Propose**: any member proposes TX через Squads UI
2. **Vote**: other members review + approve (sign на UI)
3. **Reach threshold**: коли N members approved → TX ready
4. **Execute**: anyone can hit "Execute" button → TX submits on-chain

Time: ~1-2 days typical (members need time to review + sign).

Для urgent operations — preset workflows можна automate (recurring withdraws, etc.).

## Squads programs

```
Squads V4: SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf
```

Open-source, audited. Used by Jito, Marinade, Helius, тощо.

## Use cases для LumLabs

| Asset | Pattern |
|---|---|
| Cold withdrawer for vote accounts | Squad 3-of-5 ✅ |
| Treasury (USDC, JTO, JitoSOL holdings) | Squad 3-of-5 ✅ |
| Operator income (commission collected) | Squad 2-of-3 (smaller threshold OK для warm) |
| Validator identity keypair | NOT multisig (used by validator software, must be single key) |
| Vote authority keypair | NOT multisig (used by validator software) |

⚠️ Validator software requires single private key files. Cannot use multisig для identity/vote authority. Multisig тільки for cold/treasury operations.

## Migration: single key → multisig

Якщо у тебе single withdrawer authority зараз:

1. Create Squad
2. Use `solana vote-authorize-withdrawer-checked` команду для transfer authority до Squad vault
3. Verify Squad now authority
4. Single key can бути archived / destroyed

```bash
solana vote-authorize-withdrawer-checked \
    VOTE_PUBKEY \
    current-withdrawer-keypair.json \
    <SQUAD_VAULT_ADDRESS>
```

## Squads costs

- One-time vault creation: ~0.01 SOL rent
- Per TX: standard fees (5000 lamports base + small extras для multisig logic)
- Negligible для validator economics

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Squads`](/glossary#s), [`Multisig`](/glossary#m), [`Vault account`](/glossary#v), [`Threshold signing`](/glossary#t), [`N-of-M`](/glossary#n)

## External refs

- [Squads documentation](https://docs.squads.so)
- [Squads V4 audit](https://github.com/Squads-Protocol/v4/tree/main/audits)

---

**Попередньо:** [← 6. Kernel tuning](/module-8/6-kernel-tuning) | **Наступне:** [8. Monitoring stack →](/module-8/8-monitoring-stack)
