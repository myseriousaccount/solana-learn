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

### Cluster version distribution

Після `solana validators` output у кінці є секція "Stake By Version" — breakdown скільки validators (stake-weighted) на кожній версії:

```bash
solana validators | tail -30
# Або specifically version section:
solana validators | grep -A 20 "Stake By Version"
```

Output:

```
Stake By Version:
0.4.4    -     16 current validators ( 20.03%)
0.4.3    -     50 current validators ( 62.50%)
0.4.2    -     14 current validators ( 17.47%)
```

% це stake-weighted count. Use cases:
- Verify твоя нова version visible cluster-wide після upgrade
- Track adoption нових SIMDs / consensus changes
- Detect single-version risk

JSON для parsing:

```bash
solana validators --output json | jq '.stakeByVersion'
```

Specific validator's version:

```bash
solana validators | grep <IDENTITY_PUBKEY> | awk '{print $9}'
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
