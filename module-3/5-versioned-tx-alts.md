<script setup>
const quiz = {
  id: 'm3-5-versioned-tx',
  title: '🧠 Mini-check: Versioned TX & ALTs',
  intro: '2 питання.',
  questions: [
    {
      type: 'compare',
      q: 'Legacy TX vs Versioned TX (V0)?',
      ideal: 'Legacy TX (original Solana format): all account refs as full 32-byte pubkeys у TX account list. Max ~30 accounts per TX (due to 1232 byte size limit).\n\nVersioned TX (V0, default since 2023):\n- Backward compatible (legacy TXs still work)\n- Adds Address Lookup Table (ALT) support: account refs as 1-byte indexes у pre-published ALT account\n- Result: ~256 accounts fit per TX (vs ~30 legacy)\n- Smaller TX size коли using ALTs (1 byte per ref vs 32 bytes)\n- Enables complex DeFi: aggregators (Jupiter) touching 30+ accounts via 4-5 ALTs\n\nDevelopers typically use SDK V0 builder. Users transparent — wallets handle both formats.',
      explanation: 'Module 3.5.'
    },
    {
      type: 'mcq',
      q: 'Address Lookup Table (ALT) usefulness?',
      options: [
        'Compress account references у TX (1 byte vs 32 bytes per account)',
        'Allow 256+ accounts у one TX (vs ~30 legacy)',
        'Pre-published lookup table account holds account list',
        'Required for простих SOL transfers'
      ],
      correct: [0, 1, 2],
      explanation: 'ALTs optional. Simple TXs don\'t need them. Module 3.5.'
    }
  ]
}
</script>

# 5. Versioned transactions & Address Lookup Tables

## TL;DR

**Versioned transactions** (V0, default since 2023): backward-compatible TX format що adds **Address Lookup Tables (ALTs)** support — pre-published lookup accounts containing account lists. TX references via 1-byte index замість 32-byte pubkey, allowing 256+ accounts per TX (vs ~30 legacy).

Critical для modern DeFi aggregators (Jupiter, Phoenix) які touch багато accounts.

## Legacy TX limitations

З Module 3.1: TX max 1232 bytes. Account refs = 32 bytes each. Math:

```
Header + signatures + blockhash + instructions ≈ ~200 bytes overhead
Available для accounts: ~1000 bytes / 32 bytes per pubkey ≈ ~30 accounts max
```

Complex DeFi operations touch many accounts (DEX program, pool accounts, token accounts, oracle accounts, fee accounts...). 30 limit insufficient.

## Address Lookup Table (ALT)

**ALT** = on-chain account containing list of pubkeys. Created once, used many times.

```
ALT account "Xyz...":
  list: [
    pubkey0: TokenkegQ...,
    pubkey1: 7xKXt...,
    pubkey2: 9mP3s...,
    pubkey3: BPMzz...,
    ...
    pubkey255: ... (max 256 per ALT)
  ]
```

TX references account via **1-byte index** у ALT account:

```
TX accounts list:
  - Full pubkeys: [fee_payer, ALT_pubkey, ...]
  - ALT-referenced: [ALT_index_0, ALT_index_5, ALT_index_127, ...]
```

Saves 31 bytes per reference (32 → 1). Allows fitting 256+ accounts у single TX.

## Versioned TX (V0)

Default TX format since 2023. Extension of legacy format:

```
TransactionV0 {
    signatures: [...],
    message: {
        header: { num_required_signatures, ... },
        account_keys: [...],                    // full pubkeys (subset)
        recent_blockhash: ...,
        instructions: [...],
        address_table_lookups: [                // NEW у V0
            {
                account_key: ALT_PUBKEY,
                writable_indexes: [0, 5, 12],   // ALT positions to use as writable
                readonly_indexes: [1, 7, 99]    // ALT positions to use як read-only
            },
            {
                account_key: ANOTHER_ALT,
                writable_indexes: [3],
                readonly_indexes: [22, 88]
            }
        ]
    }
}
```

Instruction's account references mapped:

- Indexes 0..len(account_keys): direct from account_keys list
- Indexes len(account_keys)..: from ALTs (sum of all ALT entries)

## Create + use ALT

### 1. Create ALT

```bash
solana address-lookup-table create
# Output: ALT pubkey
```

ALT account created, owned by yourself (authority).

### 2. Add accounts до ALT

```bash
solana address-lookup-table extend <ALT_PUBKEY> \
    --addresses pubkey1,pubkey2,pubkey3,...
```

Can extend multiple times. Up to 256 entries per ALT.

### 3. Use у TX (SDK-side)

Developers use ALT через SDK. Example (JS pseudo):

```javascript
const lookupTableAccount = await connection.getAddressLookupTable(altPubkey);

const tx = new VersionedTransaction(new TransactionMessage({
    payerKey: payer,
    recentBlockhash: ...,
    instructions: [...],
}).compileToV0Message([lookupTableAccount]));
```

SDK automatically chooses accounts to reference via ALT vs inline.

### 4. Freeze ALT (optional)

```bash
solana address-lookup-table freeze <ALT_PUBKEY>
```

Immutable після freeze (can't extend). Recommended якщо ALT static (e.g., DEX pool accounts).

## ALT economics

- **Create ALT**: ~0.001 SOL rent
- **Each entry rent**: minimal (~0.00001 SOL per entry)
- **Maintenance**: pay rent ongoing (or close ALT if no longer needed)
- **TX size savings**: 31 bytes per ALT-referenced account

Typical Jupiter swap TX uses 4-5 ALTs з 100+ accounts touched. Without ALTs — impossible у single TX.

## Connect to your work

Як validator operator ти не creates ALTs (DeFi apps do). Але:

- **TX you build via CLI**: simple transfers/votes use legacy/V0 без ALTs
- **Receiving ALT-using TXs**: validator processes them normally (transparent)
- **Reading TX details**: `solana confirm -v` shows ALT info якщо present

## solana commands

```bash
# Create ALT
solana address-lookup-table create

# Show ALT contents
solana address-lookup-table show <ALT_PUBKEY>

# Extend з accounts
solana address-lookup-table extend <ALT_PUBKEY> \
    --addresses addr1,addr2,addr3

# Freeze (make immutable)
solana address-lookup-table freeze <ALT_PUBKEY>

# Deactivate (start cooldown to close)
solana address-lookup-table deactivate <ALT_PUBKEY>

# Close (recover rent після cooldown)
solana address-lookup-table close <ALT_PUBKEY>
```

## Hands-on

```bash
# Examine ALT-using TX from mainnet (find one via solscan)
solana confirm -v <SIG> --url mainnet-beta | head -50
# Look for "Address Table Lookups:" section
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Versioned transaction`](/glossary#v), [`V0 transaction`](/glossary#v), [`Address Lookup Table`](/glossary#a), [`ALT`](/glossary#a)

## External refs

- [Anza: Address Lookup Tables](https://solana.com/developers/cookbook/transactions/lookup-tables)
- [Versioned TX explainer](https://docs.solana.com/developing/versioned-transactions)

---

**Попередньо:** [← 4. TX lifecycle](/module-3/4-lifecycle) | **Наступне:** [6. Durable nonces →](/module-3/6-durable-nonces)
