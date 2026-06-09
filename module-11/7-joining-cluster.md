<script setup>
const quiz = {
  id: 'm11-7-joining',
  title: '🧠 Mini-check: Joining + BLS setup',
  intro: '3 питання.',
  questions: [
    {
      type: 'explain',
      q: 'Поясни SIMD-0387 BLS pubkey registration process.',
      ideal: 'SIMD-0387 establishes mechanism для validators register BLS public keys у vote accounts. Required для Alpenglow consensus participation.\n\nProcess:\n\n1. Generate BLS keypair: validator generates BLS12-381 keypair using preferred method. Vote program enforces no specific derivation scheme.\n\n2. Create Proof of Possession (PoP): cryptographic signature proving ownership of BLS keypair. Signs domain-separated message containing:\n   - Label: "ALPENGLOW"\n   - Vote account Ed25519 address\n   - Compressed BLS pubkey (48 bytes)\n\n3. Submit registration: via updated VoteAuthorize instruction with new VoterWithBLS variant. Contains:\n   - bls_pubkey (48 bytes)\n   - bls_proof_of_possession (96 bytes)\n\n4. Vote account upgrades to version 4 (per SIMD-0185), incorporating dedicated BLS pubkey field.\n\n5. Once registered, only vote accounts with BLS pubkey can participate Alpenglow voting after activation.\n\nKey operational details:\n- BLS keypair can auto-derive from vote authority keypair (or identity fallback)\n- 34,500 compute units consumed per BLS verification\n- After registration, older authorize instructions restricted if BLS pubkey present\n- BLS update doesn\'t require changing authorized voters\n\nFor existing Tower BFT validators: must register BEFORE Alpenglow mainnet activation, else lose validation eligibility. Module 11.7.',
      explanation: ''
    },
    {
      type: 'mcq',
      q: 'In-genesis vs out-of-genesis joining cluster — що з цього вірно?',
      options: [
        'In-genesis: validator included у initial cluster setup, ready slot 0',
        'Out-of-genesis: validator joins later, must catch up з cluster',
        'In-genesis requires application/coordination з cluster organizer',
        'Out-of-genesis impossible після cluster live'
      ],
      correct: [0, 1, 2],
      explanation: 'Out-of-genesis IS possible — just requires more steps (wipe ledger, fetch snapshot, sync, create vote account, get stake delegated). LumLabs joined Alpenglow out-of-genesis Jun 2026. Module 11.7.'
    },
    {
      type: 'command',
      q: 'Як verify validator vote account has BLS pubkey registered?',
      accepts: [
        'solana vote-account <VOTE_PUBKEY>',
        'solana vote-account <VOTE_PUBKEY> --url <RPC>',
        'solana vote-account VOTE_PUBKEY | grep -i bls'
      ],
      ideal: 'solana vote-account <VOTE_PUBKEY>',
      explanation: 'Vote account output includes BLS pubkey field if registered. grep -i bls filters specifically. Module 11.7.'
    }
  ]
}
</script>

# 7. Joining cluster — BLS keys (SIMD-0387)

## TL;DR

Joining Alpenglow cluster requires **BLS pubkey registration** (SIMD-0387) у vote account before consensus participation. Two paths: **in-genesis** (validator у initial setup) vs **out-of-genesis** (joining cluster after launch, requires sync + setup).

## In-genesis vs out-of-genesis

### In-genesis

Validator included у cluster's initial genesis configuration. Ready to vote from slot 0.

**Requirements**:
- Apply через cluster organizer (Anza for community cluster)
- Provide validator identity pubkey
- Initial stake amount agreed-upon
- Have BLS pubkey registered у vote account before genesis
- Coordinate з cluster launch time

**Process**:
1. Submit form/application to organizer
2. Provide pubkeys (identity + vote)
3. Wait for genesis file generation
4. Coordinate start time
5. Boot validator at agreed moment

Easier path — everything setup в advance.

### Out-of-genesis

Validator joins cluster after launch. Must catch up з existing chain state.

**Requirements**:
- Cluster running
- Have wallet з SOL для stake
- Build agave з cluster's software version
- BLS pubkey registration
- Patience (cluster sync time)

**Process**:
1. Build validator software (matching cluster version)
2. Generate validator identity keypair
3. Fetch cluster snapshot
4. Start validator (sync to current slot)
5. Create vote account з BLS pubkey
6. Acquire stake (self-stake OR delegate-stake)
7. Wait для epoch boundary активации
8. Start voting

More steps but standard для joining established networks.

## SIMD-0387 BLS pubkey registration

### Why BLS keys

Alpenglow uses BLS12-381 signature aggregation:
- 60-80% threshold checks need efficient aggregation
- Ed25519 doesn't support aggregation natively
- BLS = critical для protocol functioning

Vote accounts must register BLS pubkey to enable validator participation у Alpenglow consensus.

### Generation

Validators generate BLS keypair using preferred method. SIMD-0387 doesn't mandate specific derivation:

```bash
# Method 1: Derive from existing vote authority keypair (common pattern)
agave-validator generate-bls-keypair \
    --from-keypair /path/to/vote-authority-keypair.json \
    --output bls-keypair.json

# Method 2: Generate independent BLS keypair
agave-validator generate-bls-keypair --output bls-keypair.json
```

Method 1 (derivation) recommended:
- One keypair to manage (auto-derived from existing)
- No additional backup burden
- Consistent з existing security model

Method 2 (independent):
- Separate BLS key для hardware wallet integration
- More keys to backup
- Higher operational complexity

### Proof of Possession (PoP)

Cryptographic proof binding BLS pubkey to specific vote account. Prevents:
- **Rogue key attacks**: someone claiming BLS pubkey без actually owning private key
- **Replay attacks**: reusing PoP from different vote account

PoP signs domain-separated message:

```
message = "ALPENGLOW" || vote_account_pubkey || compressed_bls_pubkey
PoP_signature = BLS_sign(bls_private_key, message)
```

96-byte signature. Submitted alongside BLS pubkey.

### Submission

Via `VoteAuthorize` instruction з new `VoterWithBLS` variant:

```rust
// Pseudocode
let instruction = VoteAuthorize::VoterWithBLS {
    bls_pubkey: [u8; 48],
    bls_proof_of_possession: [u8; 96],
};
```

CLI command (when available):

```bash
solana vote-authorize-voter-with-bls \
    --vote-account <VOTE_PUBKEY> \
    --voter-keypair <CURRENT_VOTER_KEYPAIR> \
    --bls-pubkey <BLS_PUBKEY> \
    --bls-proof-of-possession <POP>
```

Validator submits TX. Vote program verifies:
1. Voter signature valid (existing voter authorizes change)
2. PoP signature valid (proves BLS key ownership)
3. Vote account version 4 supported

### After registration

Vote account upgrades to **version 4** (per SIMD-0185). New structure includes:

```rust
pub struct VoteState_v4 {
    // Existing fields...
    bls_pubkey: Option<[u8; 48]>,
    bls_pubkey_epoch: Option<u64>,  // when registered
    // Other v4 additions...
}
```

Validator can now participate Alpenglow consensus (post-activation).

### Update / rotation

BLS key can rotate without changing authorized voter:

```bash
solana vote-update-bls-pubkey \
    --vote-account <VOTE_PUBKEY> \
    --voter-keypair <VOTER_KEYPAIR> \
    --new-bls-pubkey <NEW_BLS_PUBKEY> \
    --new-bls-proof-of-possession <NEW_POP>
```

Use cases:
- BLS key compromised
- Moving to hardware wallet integration
- Routine key rotation

Once vote account has BLS pubkey, older authorize instructions restricted (forces use of BLS-aware variants).

## Pre-Alpenglow mainnet checklist (для existing validators)

Before Alpenglow activates на mainnet:

1. **Verify software version**: agave 4.1+ (when released)
2. **Generate BLS keypair**: derived from vote authority
3. **Register BLS pubkey**: submit VoterWithBLS instruction
4. **Verify registration**: `solana vote-account <pubkey>` shows BLS field
5. **Test on testnet first**: ensure BLS workflow works
6. **Schedule registration**: don't wait until last epoch
7. **Backup BLS keypair**: standard keypair backup discipline

Failure to register before activation = loss of voting ability = no rewards earned.

## Joining community cluster (current Alpenglow)

For testing/learning Alpenglow operations without mainnet impact.

### Steps

1. **Get cluster info**:
   - Genesis hash
   - Entrypoints (gossip seed nodes)
   - Current software version (tag)
   - Cluster Discord для announcements

2. **Build validator software**:
   ```bash
   git clone https://github.com/AshwinSekar/solana.git
   cd solana
   git checkout ag-v0.4.x  # current tag
   scripts/cargo-install-all.sh /home/solana/ag-v0.4.x
   ```

3. **Generate keypairs**:
   ```bash
   solana-keygen new --outfile validator-keypair.json
   solana-keygen new --outfile vote-account-keypair.json
   ```

4. **Get SOL для stake** (community cluster):
   - Request from organizers (Discord)
   - Mint via faucet (if available)
   - Receive delegation from cluster organizer

5. **Start validator** з proper config (genesis hash, entrypoints):
   ```bash
   agave-validator \
       --identity /path/to/validator-keypair.json \
       --vote-account /path/to/vote-account-keypair.json \
       --ledger /mnt/ledger \
       --rpc-port 8899 \
       --entrypoint <ENTRYPOINT_1>:<PORT> \
       --entrypoint <ENTRYPOINT_2>:<PORT> \
       --expected-genesis-hash <GENESIS_HASH> \
       [other flags]
   ```

6. **Wait для sync**: validator catches up to current slot. ~30-90 minutes depending on bandwidth.

7. **Create vote account з BLS pubkey**:
   ```bash
   solana create-vote-account \
       vote-account-keypair.json \
       validator-keypair.json \
       <WITHDRAWER_PUBKEY> \
       --commission 10 \
       --allow-unsafe-authorized-withdrawer  # testnet/community only
   ```

8. **Self-stake або wait для delegation**:
   ```bash
   solana create-stake-account stake-keypair.json 1.0
   solana delegate-stake stake-keypair.json <VOTE_PUBKEY>
   ```

9. **Wait epoch boundary**: stake activates у next epoch.

10. **Begin voting**: validator participates у Alpenglow consensus.

### Verification commands

```bash
# Check validator running
solana validators | grep <IDENTITY_PUBKEY>

# Check vote account state
solana vote-account <VOTE_PUBKEY>
# Should show: BLS pubkey present, recent vote, credits growing

# Check catchup status
agave-validator -l /mnt/ledger catchup
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`In-genesis`](/glossary#i), [`Out-of-genesis`](/glossary#o), [`BLS pubkey registration`](/glossary#b), [`Proof of Possession`](/glossary#p), [`VoterWithBLS`](/glossary#v), [`Vote account v4`](/glossary#v), [`SIMD-0387`](/glossary#s)

## External refs

- [SIMD-0387: BLS pubkey management](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0387-bls-pubkey-management-in-vote-account.md)
- [SIMD-0185: Vote account v4](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0185-vote-account-v4.md)
- [Alpenglow community cluster Discord](https://discord.gg/solana) (#ag-community-cluster)

---

**Попередньо:** [← 6. Failover patterns](/module-11/6-failover-patterns) | **Наступне:** [8. Slashing →](/module-11/8-slashing)
