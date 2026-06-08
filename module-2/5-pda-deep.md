<script setup>
const quiz = {
  id: 'm2-5-pda-deep',
  title: '🧠 Mini-check: PDA deep',
  intro: '2 питання.',
  questions: [
    {
      type: 'explain',
      q: 'Поясни як PDA працює і чому це critical для Solana smart contracts.',
      ideal: 'PDA (Program Derived Address) — special pubkey derived deterministically з seeds + program ID. Key properties:\n\n1. Off curve: not generated through ed25519 keypair (no private key exists). Cannot sign normally.\n\n2. Deterministic: same seeds + program → same PDA always. Calculate via findProgramAddress(seeds, program_id).\n\n3. Program-controlled: тільки derived program може "sign" transactions для PDA через invoke_signed mechanism у CPI.\n\nWhy critical:\n- Program-owned state: program створює PDAs для storing data without trusting external keys\n- Cross-program coordination: programs can deterministically reference each other\'s state\n- No private key management: no risk losing/leaking PDA keys\n- Composability: anyone can compute PDA address без знання internal state\n\nExamples:\n- Token Program ATAs are PDAs derived from (wallet, mint, token_program)\n- Anchor "PDA seeds" pattern для account discovery\n- Stake pool delegations\n- AMM pool authority accounts',
      explanation: 'Module 2.5.'
    },
    {
      type: 'mcq',
      q: 'PDA properties (обери всі правильні):',
      options: [
        'Off ed25519 curve (no private key exists)',
        'Deterministic derivation з (seeds, program_id)',
        'Only derived program може "sign" through invoke_signed',
        'Can be transferred between users like regular wallet'
      ],
      correct: [0, 1, 2],
      explanation: 'PDA controlled by program, не transferable like user wallet. Module 2.5.'
    }
  ]
}
</script>

# 5. PDA (Program Derived Addresses) — deep dive

## TL;DR

**PDA** = special pubkey deterministically derived з seeds + program ID. Off-curve (no private key). Only deriving program може "sign" through `invoke_signed` mechanism. Foundation для program-owned state on Solana.

## Why need PDAs

Regular Solana account має corresponding private key. Program needs:
- **State accounts**: persistent data owned by program
- **No private key management**: programs can't safely store/sign з private keys
- **Deterministic addresses**: anyone calculates same address from public inputs

Solution: PDAs. Program "owns" PDA but no private key existed ever.

## Derivation mechanics

```
PDA = findProgramAddress(
    seeds = [array of byte arrays],
    program_id = program pubkey
)
```

Algorithm (simplified):

1. Concat seeds + program_id + magic bytes
2. SHA-256 hash
3. Check якщо result is on ed25519 curve
4. Якщо on curve (would correspond до private key): increment "bump seed", retry
5. Якщо off curve: return PDA + bump seed used

**Bump seed**: 0-255 incremented until off-curve point found. ~50% chance any iteration off-curve, тому usually 1-2 tries.

```rust
// Rust example
let (pda, bump) = Pubkey::find_program_address(
    &[b"vault", user.key.as_ref()],
    program_id,
);
// pda = derived address (off curve)
// bump = the bump seed used
```

JS:

```javascript
const [pda, bump] = await PublicKey.findProgramAddress(
    [Buffer.from("vault"), user.publicKey.toBuffer()],
    programId
);
```

### Seeds choice matters

Seeds determine PDA uniqueness. Common patterns:

| Seed pattern | Use case |
|---|---|
| `["state"]` | Singleton program-level account |
| `["user", user_pubkey]` | Per-user state |
| `["pool", token_a, token_b]` | Per-token-pair pool |
| `["vote_account", validator_id]` | Per-validator state |
| `["ata", wallet, token_program, mint]` | Associated Token Account standard |

Limit: max 16 seeds total, each max 32 bytes.

## Signing для PDA: invoke_signed

Regular TX signing requires private key. PDA has none. Solution: `invoke_signed` CPI.

Program can call `invoke_signed(instructions, accounts, signers_seeds)`:

```rust
invoke_signed(
    &transfer_instruction,
    &[from_pda, to_account, system_program],
    &[&[b"vault", user.key.as_ref(), &[bump]]]  // seeds + bump as "signature"
)?;
```

Runtime:
1. Computes PDA з provided seeds + caller program_id
2. Verifies matches expected signer
3. Allows TX як if PDA signed (despite no private key)

Тільки originally-deriving program може invoke_signed для its PDAs. Other programs cannot fake.

## Connect to your work

### ATA derivation

З Module 2.4 ATA = PDA derived з:

```
seeds = [
    wallet_pubkey,
    TOKEN_PROGRAM_ID,
    mint_pubkey
]
program_id = ASSOCIATED_TOKEN_PROGRAM_ID
```

Тому ATA deterministic для пари (wallet, mint). Anyone може compute без knowing wallet's private key.

```bash
# Compute ATA via spl-token CLI
spl-token address \
    --owner <WALLET_PUBKEY> \
    --token <MINT_ADDRESS>
```

Returns PDA = ATA address.

### Squads vault address

З Module 8.7 — Squads creates vault PDA per Squad:

```
seeds = ["squad", squad_id]
program_id = SQUADS_PROGRAM_ID
```

Vault PDA holds treasury funds. Squads program controls спending через invoke_signed з threshold validation.

### Vote/stake authority

Validator's vote account, stake account are regular accounts (з private keys). But authority delegation patterns sometimes use PDAs:

- Multisig vote authority → PDA owned by Squads
- Stake pool authority → PDA owned by stake pool program

## Hands-on

```bash
# Compute Token Program ATA для wallet+mint
WALLET=<your_wallet_pubkey>
MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v   # USDC
spl-token address --owner $WALLET --token $MINT --url mainnet-beta

# Compute Squads vault address (через Squads SDK or UI)
# Via UI: visit squads.so, view squad details, copy vault address
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`PDA`](/glossary#p), [`Bump seed`](/glossary#b), [`invoke_signed`](/glossary#i), [`Off-curve point`](/glossary#o), [`Seeds (PDA)`](/glossary#s)

## External refs

- [Solana Cookbook: PDAs](https://solana.com/developers/courses/native-onchain-development/program-derived-addresses)
- [Anchor: PDA Examples](https://www.anchor-lang.com/docs/pdas)

---

**Попередньо:** [← 4. Tokens & ATA](/module-2/4-tokens-ata) | **Наступне:** [6. Token-2022 →](/module-2/6-token-2022)
