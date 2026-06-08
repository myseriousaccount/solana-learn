<script setup>
const quiz = {
  id: 'm3-6-nonces',
  title: '🧠 Mini-check: Durable nonces',
  intro: '2 питання.',
  questions: [
    {
      type: 'explain',
      q: 'Чому durable nonce замість recent blockhash для multisig workflows?',
      ideal: 'Standard TX uses recent_blockhash (valid ~60 sec). Якщо TX takes > 60 sec collect signatures (multisig requires multiple signers у різних timezones) — blockhash expires, TX dies.\n\nDurable nonce: special on-chain nonce account holds long-lived nonce value (updates тільки коли used). TX references цей nonce замість recent_blockhash. Не expires through time, тільки coли nonce account explicitly updated.\n\nWorkflow:\n1. Create nonce account (one-time, rent reserve ~0.0015 SOL)\n2. Get current nonce value: solana nonce <NONCE_ACCOUNT>\n3. Build TX з durable nonce instead of recent_blockhash\n4. Pass TX around team for multiple signatures (days/weeks OK)\n5. Submit signed TX — landed, nonce advanced\n6. Reuse nonce account для next operation\n\nDownside: requires nonce account management. Most users don\'t need (regular TXs fine with recent_blockhash).',
      explanation: 'Module 3.6.'
    },
    {
      type: 'mcq',
      q: 'Use cases для durable nonces?',
      options: [
        'Multisig signing (collecting signatures over days)',
        'Offline signing (cold wallet generates signed TX, brought online later)',
        'Standard SOL transfer between two hot wallets',
        'Scheduled TXs (signed now, submit later)'
      ],
      correct: [0, 1, 3],
      explanation: 'Standard transfers — use recent_blockhash. Nonces для long-lived/offline scenarios. Module 3.6.'
    }
  ]
}
</script>

# 6. Durable nonces

## TL;DR

**Durable nonce** = alternative до recent_blockhash для TX expiry. Long-lived (не expires через time), enabling multisig signing flows, offline signing, scheduled transactions.

Standard recent_blockhash valid ~60 sec — insufficient для workflows requiring collecting multiple signatures over days.

## Проблема recent_blockhash

З Module 3.1: TX needs **recent blockhash** for expiry tracking. Valid only ~150 slots (~60 sec). After expiry — TX rejected.

Adequate для:
- ✅ Single-user TX submitted через wallet (instant signing + submit)
- ✅ DeFi swaps (signed і submitted у моментально)

Insufficient для:
- ❌ **Multisig**: 5 members у different timezones may take days to collect signatures
- ❌ **Offline signing**: cold wallet generates signed TX yesterday, online tomorrow
- ❌ **Scheduled TXs**: sign now, submit at specific future time

## Durable nonce mechanism

**Nonce account** = on-chain account з owner = System Program containing:

```
NonceAccount {
    state: Initialized,
    nonce: <current nonce value, 32 bytes>,
    authority: <pubkey that може advance nonce>
}
```

TX references nonce account замість recent_blockhash:

```
TX {
    instructions: [
        // First instruction MUST be nonce advance:
        SystemProgram.advanceNonce(nonce_account, authority),
        
        // Your actual operations follow:
        ...
    ],
    recent_blockhash: <nonce value>,  // не real blockhash, durable nonce
}
```

Validator checks: nonce value matches current nonce_account state → TX valid. After execution, nonce advances → can't replay TX.

## Workflow

### 1. Create nonce account

```bash
solana create-nonce-account nonce-keypair.json 0.0015 \
    --from authority-keypair.json
```

Creates account з ~0.0015 SOL rent reserve. Authority defaults до funder.

### 2. Query current nonce

```bash
solana nonce <NONCE_ACCOUNT_PUBKEY>
# Output: <32-byte hex nonce value>
```

### 3. Build TX з durable nonce

Через SDK (CLI also supports). Example для transfer:

```bash
solana transfer RECIPIENT 1 \
    --nonce <NONCE_ACCOUNT_PUBKEY> \
    --nonce-authority nonce-authority-keypair.json \
    --sign-only \
    --blockhash <CURRENT_NONCE_VALUE> \
    --output json
```

`--sign-only` produces signed TX **без submitting**. Can transfer signed TX bytes до next signer.

### 4. Multi-signer flow (multisig pattern)

```
Signer 1 (initial): create signed TX з durable nonce → send to Signer 2
Signer 2: add signature → send to Signer 3
...
Signer N (last): add signature → broadcast TX → nonce advances on chain
```

Days/weeks elapsed = OK. Nonce only advances when TX submitted.

### 5. Submit signed TX

```bash
solana send-transaction --signed-transaction <BASE64_TX>
```

Або через wallet UI.

### 6. Reuse nonce account

After successful execution, nonce automatically advanced. Query new nonce value, use for next operation:

```bash
NEW_NONCE=$(solana nonce <NONCE_ACCOUNT>)
# Build next TX з $NEW_NONCE
```

One nonce account supports many sequential operations.

## Authority management

`nonce-authority` controls nonce. Can:
- Advance nonce (auto-done by TX)
- Withdraw funds from nonce account
- Change authority до new key

Authority changes:

```bash
solana authorize-nonce-account <NONCE_ACCOUNT> \
    new-authority-keypair.json \
    --nonce-authority current-authority-keypair.json
```

Withdraw:

```bash
solana withdraw-from-nonce-account <NONCE_ACCOUNT> \
    recipient_pubkey \
    amount \
    --nonce-authority authority-keypair.json
```

## Use cases для LumLabs

1. **Treasury multisig** (Squads natively integrate з durable nonces):
   - Сtake withdraw operations
   - Vote account authority changes
   - Treasury rebalancing

2. **Withdrawer operations**:
   - Cold withdrawer signs durable-nonce TX
   - Submitted later через ops team
   - No real-time coordination needed

3. **Scheduled operations**:
   - Sign now during business hours
   - Submit later through automation

## Caveats

- Adds complexity (nonce account management, advance instruction у TX)
- Rent reserve locked у nonce account (~0.0015 SOL)
- Authority key compromise = nonce account drainable
- One nonce account = sequential operations (можеш мати кілька для parallel work)

Most operators don't need this. Multisig orgs benefit most.

## Connect to your work

Якщо LumLabs использовuw Squads (Module 8.7) — Squads handles durable nonces internally для long signing flows. Operator не interacts напряму.

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Durable nonce`](/glossary#d), [`Nonce account`](/glossary#n), [`Nonce authority`](/glossary#n), [`Offline signing`](/glossary#o)

## External refs

- [Anza: Durable Transaction Nonces](https://docs.anza.xyz/implemented-proposals/durable-tx-nonces)
- [Solana Cookbook: Durable Nonce](https://solana.com/developers/cookbook/transactions/use-durable-nonce)

---

**Попередньо:** [← 5. Versioned TX & ALTs](/module-3/5-versioned-tx-alts)
