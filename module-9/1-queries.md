<script setup>
const quiz = {
  id: 'm9-1-queries',
  title: '🧠 Mini-check: Queries',
  intro: '2 питання.',
  questions: [
    {
      type: 'command',
      q: 'Як подивитись current slot, epoch, completion progress одною командою?',
      accepts: ['solana epoch-info', 'solana epoch-info --url mainnet-beta'],
      ideal: 'solana epoch-info',
      explanation: 'Module 9.1.'
    },
    {
      type: 'command',
      q: 'Як отримати JSON список всіх validators (для programmatic parsing)?',
      accepts: ['solana validators --output json', 'solana validators --output json --url mainnet-beta'],
      ideal: 'solana validators --output json',
      explanation: 'Module 9.1.'
    }
  ]
}
</script>

# 1. Network & cluster queries

## TL;DR

Read-only commands для checking cluster state. Most-used: `epoch-info`, `slot`, `validators`, `cluster-version`, `gossip`.

## Time & position

```bash
solana slot                          # current slot
solana epoch                         # current epoch number
solana epoch-info                    # detailed: slot range, progress, time
solana block-time <SLOT>             # timestamp of specific slot
solana block-height                  # block height (non-skipped slots count)
```

## Cluster state

```bash
solana cluster-version               # current cluster software version
solana gossip                        # list visible nodes
solana validators                    # full validator list з voting status
solana validators --output json     # for parsing
solana stakes <VOTE_PUBKEY>          # delegators до specific validator
solana inflation-rate                # current inflation %
solana supply                        # total + circulating supply
```

## Account queries

```bash
solana account <PUBKEY>              # generic account info
solana balance <PUBKEY>              # SOL balance
solana vote-account <PUBKEY>         # vote-specific view
solana stake-account <PUBKEY>        # stake-specific view
solana program show <PUBKEY>         # program-specific view
```

## RPC verification

```bash
solana rpc-info                      # RPC URL + recent stats
solana ping                          # round-trip latency test (sends tiny TX)
solana confirm <SIG>                 # TX status
solana confirm -v <SIG>              # verbose з instructions/logs
```

## TPS / cluster stats

```bash
solana transaction-count             # total TXs ever
solana cluster-date                  # cluster current time
solana feature status                # feature flags enabled/pending
```

## Mini-quiz

<Quiz :data="quiz" />

---

**Наступне:** [2. Vote & stake →](/module-9/2-vote-stake)
