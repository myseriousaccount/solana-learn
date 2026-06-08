<script setup>
const quiz = {
  id: 'm5-1-gossip',
  title: '🧠 Mini-check: Gossip',
  intro: '3 питання — gossip basics.',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього передається через gossip? (обери всі)',
      options: ['Cluster nodes list', 'Validator versions', 'Vote signatures', 'TXs from clients'],
      correct: [0, 1, 2],
      explanation: 'Gossip = membership + metadata. TX submission separate (TPU). Votes можуть передаватись через gossip або як regular TX. Module 5.1.'
    },
    {
      type: 'command',
      q: 'Як подивитись всі nodes у cluster через gossip?',
      accepts: ['solana gossip', 'sudo /home/solana/ag/bin/solana gossip --url http://localhost:8899'],
      ideal: 'solana gossip',
      explanation: 'solana gossip lists всі visible nodes з gossip data: identity, IP, ports, version. Module 5.1.'
    },
    {
      type: 'explain',
      q: 'Поясни як gossip protocol дозволяє nodes discover один одного без centralized registry.',
      ideal: 'Gossip — epidemic propagation. Workflow:\n1. New node connects до entrypoint (well-known seed node, e.g., 64.130.37.11:8000 для Alpenglow)\n2. Entrypoint shares свій table відомих nodes\n3. New node pings цих nodes, building local table\n4. Periodically всі nodes exchange tables з random peers\n5. Через кілька rounds (~5-10 sec) all nodes converge до consistent view of cluster\n\nКлючове: decentralized — no single source of truth. Entrypoints lower trust requirement (just bootstrap). Gossip self-healing — якщо node disappears, gossip propagates absence.\n\nGossiped info: identity pubkey, IP+ports, validator version, last activity timestamp, optional metadata (validator-info publishing).\n\nЦе чому твій validator може join Alpenglow cluster knowing тільки 2 entrypoint IPs — gossip handles the rest.',
      explanation: 'Module 5.1.'
    }
  ]
}
</script>

# 1. Gossip protocol — cluster membership

## TL;DR

**Gossip** — epidemic protocol через який cluster nodes discover один одного, share metadata, propagate cluster state. Не використовується для TX submission (це TPU) або block propagation (це turbine). Gossip = "who's in cluster + what they know".

## Концепти

### Чому gossip

Distributed system needs membership: who's у cluster, які їх addresses, які versions. Без centralized registry — gossip.

Кожен node periodically:
1. Picks random peers
2. Shares own state (membership table)
3. Receives peer's table
4. Merges → updated view

Через few rounds (~5-10 sec) cluster converges до consistent view.

### Що gossip carries

```
ContactInfo {
    pubkey: validator identity
    gossip: IP:port    // gossip port
    tpu: IP:port       // TPU (для receiving TXs)
    tvu: IP:port       // TVU (для receiving shreds)
    repair: IP:port    // repair service
    rpc: IP:port       // optional RPC
    version: agave/solana version
    timestamps: when seen last
}

Vote        // vote signatures (sometimes)
EpochSlots  // slots validator has seen
SnapshotHashes // for snapshot fetching
ValidatorInfo // optional human-readable info (name, logo, website)
```

### Entrypoints — bootstrap

Bootstrap problem: new node knows nothing. Solution: **entrypoint** — well-known seed nodes у constants/genesis.

З Constants твого Alpenglow:

```
Entrypoint #1: 64.130.37.11:8000
Entrypoint #2: 213.239.141.16:8001
```

New validator connects до entrypoint → gets initial peers list → начинає gossip → joins cluster.

Якщо entrypoints down — нові nodes can't join (existing nodes продовжують працювати).

### solana gossip command

```bash
solana gossip
```

Output (similar до):

```
IP Address       | Identity                                       | Gossip | TPU      | RPC          | Version    | Feature Set
64.130.37.11     | 9ZmGqB...                                      | 8001   | 8003     | 8899         | 0.4.0      | -
213.239.141.16   | 8KsGcM...                                      | 8001   | 8003     | none         | 0.4.0      | -
WNX0016778       | DSDefivSL...                                   | 8001   | 8003     | 8899         | 0.4.0      | -
...
```

Всі знайдені через gossip nodes. Якщо твій validator не з'являється — gossip issue.

## Connect to your work

### Cluster restart і gossip

Після cluster restart (новий genesis) — gossip restarts. New genesis hash = different shred_version. Validators з old shred_version filtered out (incompatible).

Якщо ти бачиш "no peers" після restart — gossip ще не converged або shred_version mismatch.

### Validator-info publishing

`solana validator-info publish` updates gossip з human-readable info (validator name, logo, website). З §17 cheatsheet.

## Hands-on exercise

```bash
sudo /home/solana/ag/bin/solana gossip --url http://localhost:8899 | head -20

# Скільки nodes у cluster
sudo /home/solana/ag/bin/solana gossip --url http://localhost:8899 | tail -1

# Search для свого validator
sudo /home/solana/ag/bin/solana gossip --url http://localhost:8899 | grep DSDefivSL

# Mainnet (з ноутбука)
solana gossip --url mainnet-beta | head -10
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Gossip`](/glossary#g), [`Entrypoint`](/glossary#e), [`ContactInfo`](/glossary#c), [`Cluster membership`](/glossary#c), [`Shred version`](/glossary#s)

## External refs

- [Anza: Gossip Service](https://docs.anza.xyz/validator/gossip)
- [Anza: Cluster Overview](https://docs.anza.xyz/cluster/overview)

---

**Наступне:** [2. Turbine →](/module-5/2-turbine)
