<script setup>
const quiz = {
  id: 'm9-3-transfers',
  title: '🧠 Mini-check: Transfers',
  intro: '2 питання.',
  questions: [
    {
      type: 'command',
      q: 'Як transfer 1 SOL з твого default keypair до specific address?',
      accepts: ['solana transfer RECIPIENT_PUBKEY 1', 'solana transfer RECIPIENT_PUBKEY 1 --allow-unfunded-recipient'],
      ideal: 'solana transfer RECIPIENT_PUBKEY 1',
      explanation: 'Module 9.3.'
    },
    {
      type: 'command',
      q: 'Як отримати airdrop 2 SOL на devnet?',
      accepts: ['solana airdrop 2 --url devnet', 'solana airdrop 2'],
      ideal: 'solana airdrop 2 --url devnet',
      explanation: 'Faucet тільки на devnet/testnet, не mainnet. Module 9.3.'
    }
  ]
}
</script>

# 3. Transfers & account ops

## TL;DR

Move SOL/tokens, manage accounts, query balances. Core financial operations.

## SOL transfers

```bash
# Basic transfer
solana transfer RECIPIENT_PUBKEY 1   # 1 SOL

# Specific fee payer
solana transfer RECIPIENT 1 --fee-payer fee-payer-keypair.json

# Allow create new account (для never-used recipient)
solana transfer RECIPIENT 1 --allow-unfunded-recipient

# With specific keypair (not default)
solana transfer RECIPIENT 1 --from sender-keypair.json

# Sign without broadcast (offline mode)
solana transfer RECIPIENT 1 --sign-only --blockhash <BLOCKHASH>
```

## Balance & airdrops

```bash
solana balance                       # default keypair
solana balance PUBKEY                # specific account
solana airdrop 2                     # 2 SOL від faucet (devnet/testnet)
solana airdrop 2 --url devnet        # explicit cluster
```

## Account management

```bash
solana-keygen new -o new-keypair.json                           # generate new keypair
solana-keygen new --no-bip39-passphrase -o new-keypair.json     # no password
solana-keygen pubkey existing-keypair.json                      # show pubkey
solana-keygen recover -o recovered-keypair.json                 # restore з seed phrase
solana-keygen verify <PUBKEY> existing-keypair.json             # verify file matches pubkey

solana create-address-with-seed pubkey "seed_str" SYSTEM_PROGRAM_ID  # derive address
```

## SPL tokens (через spl-token CLI)

```bash
spl-token accounts                              # all your token holdings
spl-token balance <MINT>                        # specific token balance
spl-token create-account <MINT>                 # create ATA для mint
spl-token transfer <MINT> <AMOUNT> <RECIPIENT>  # transfer tokens
spl-token mint <MINT> <AMOUNT> [token-account]  # mint new (if authority)
spl-token burn <TOKEN_ACCOUNT> <AMOUNT>         # burn tokens

spl-token address --owner <WALLET> --token <MINT>   # derive ATA
spl-token display <MINT>                            # mint info
```

## Mini-quiz

<Quiz :data="quiz" />

---

**Попередньо:** [← 2. Vote & stake](/module-9/2-vote-stake) | **Наступне:** [4. Validator-side →](/module-9/4-validator-side)
