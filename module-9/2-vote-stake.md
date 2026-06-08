<script setup>
const quiz = {
  id: 'm9-2-vote-stake',
  title: '🧠 Mini-check: Vote & stake ops',
  intro: '2 питання.',
  questions: [
    {
      type: 'command',
      q: 'Як створити vote account з identity та withdrawer однаковими (testnet OK pattern)?',
      accepts: [
        'solana create-vote-account vote-keypair.json validator-keypair.json validator-keypair.json --commission 10 --allow-unsafe-authorized-withdrawer'
      ],
      ideal: 'solana create-vote-account vote-keypair.json validator-keypair.json validator-keypair.json --commission 10 --allow-unsafe-authorized-withdrawer',
      explanation: 'Module 9.2.'
    },
    {
      type: 'command',
      q: 'Як delegate stake account до specific validator?',
      accepts: ['solana delegate-stake stake-keypair.json VOTE_PUBKEY'],
      ideal: 'solana delegate-stake stake-keypair.json VOTE_PUBKEY',
      explanation: 'Module 9.2.'
    }
  ]
}
</script>

# 2. Vote & stake operations

## TL;DR

Vote account management + stake delegation commands. Critical для validator setup.

## Vote account

```bash
# Create vote account (testnet/Alpenglow with same-key withdrawer)
solana create-vote-account \
    vote-keypair.json \
    validator-keypair.json \
    validator-keypair.json \
    --commission 10 \
    --allow-unsafe-authorized-withdrawer

# Mainnet — separate cold withdrawer
solana create-vote-account \
    vote-keypair.json \
    validator-keypair.json \
    <COLD_WITHDRAWER_PUBKEY> \
    --commission 10

# Update commission
solana vote-update-commission VOTE_PUBKEY 5 vote-withdrawer-keypair.json

# Change voter authority
solana vote-authorize-voter-checked \
    VOTE_PUBKEY \
    current-voter-keypair.json \
    new-voter-pubkey

# Withdraw vote account funds
solana withdraw-from-vote-account VOTE_PUBKEY destination amount vote-withdrawer-keypair.json
```

## Stake account

```bash
# Create stake account з amount
solana create-stake-account stake-keypair.json 2 --from validator-keypair.json

# Delegate to validator
solana delegate-stake stake-keypair.json VOTE_PUBKEY

# Undelegate (deactivate)
solana deactivate-stake stake-keypair.json

# Withdraw (тільки якщо inactive)
solana withdraw-stake stake-keypair.json receiver_pubkey ALL

# Split stake (create new stake account from existing)
solana split-stake source-stake-keypair.json new-stake-keypair.json 1

# Merge stakes (combine two stake accounts)
solana merge-stake destination-stake-keypair.json source-stake-keypair.json

# Stake authorities
solana stake-authorize stake-keypair.json --new-stake-authority NEW_PUBKEY
solana stake-authorize stake-keypair.json --new-withdraw-authority NEW_PUBKEY
```

## Validator info publishing

```bash
solana validator-info publish \
    --name "LumLabs" \
    --website "https://lumlabs.io" \
    --keybase YOUR_KEYBASE \
    --details "Solana validator operator"
```

Updates gossip metadata visible у explorers.

## Mini-quiz

<Quiz :data="quiz" />

---

**Попередньо:** [← 1. Queries](/module-9/1-queries) | **Наступне:** [3. Transfers →](/module-9/3-transfers)
