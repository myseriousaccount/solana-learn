<script setup>
const quiz = {
  id: 'm10-3-doublezero',
  title: '🧠 Mini-check: DoubleZero',
  intro: '2 питання.',
  questions: [
    {
      type: 'mcq',
      q: 'DoubleZero (DZ) робить:',
      options: [
        'Dedicated network для validator shred propagation (alternative до public internet turbine)',
        'Lower latency, better delivery reliability для validator-to-validator traffic',
        'Permissioned access — validators paid у DZ tokens для участі',
        'Replaces SPL Token Program'
      ],
      correct: [0, 1, 2],
      explanation: 'DZ = network infrastructure layer. Permissioned. Module 10.3.'
    },
    {
      type: 'command',
      q: 'Як check current status DoubleZero tunnel?',
      accepts: ['doublezero status'],
      ideal: 'doublezero status',
      explanation: 'Module 10.3.'
    }
  ]
}
</script>

# 3. DoubleZero — shred publisher network

## TL;DR

**DoubleZero (DZ)** — dedicated high-performance network для Solana validators. Alternative до public internet для critical traffic (turbine shreds, votes). Lower latency, higher reliability. Permissioned — eligible validators receive DZ rewards.

## Концепти

### Problem DZ solves

Solana validators communicate over public internet — turbine shreds, vote TXs, gossip. Public internet has:
- Variable latency (ISP routing fluctuations)
- Packet loss (peak congestion)
- Possible DDoS exposure
- No QoS guarantees

For 400ms slots — every millisecond matters. Дrop packets means missed shreds means slower replay means late votes.

### DZ solution

Dedicated network infrastructure with:
- **Predictable low latency** (often < 10ms between nodes)
- **High reliability** (commercial-grade SLA)
- **DDoS protection** (private network harder to attack)
- **QoS prioritization** для validator traffic

### Architecture

```
Your validator
   ├─ Public internet (для clients, gossip)
   └─ DoubleZero tunnel (для shreds + votes, faster)
```

Validator runs `doublezerod` daemon + connects до DZ network через `doublezero` CLI.

### Eligibility & rewards

- **Permissioned**: validator gets access-pass через DZ DAO/admin
- **Rewards**: DZ tokens для actively publishing shreds (per JIPs)
- LumLabs eligible (per твоя 2026-06-08 setup activity)

### CLI overview

```bash
doublezero --version              # version
doublezero status                 # tunnel status (up/down)
doublezero address                # your DZ identity pubkey
doublezero balance                # DZ token balance
doublezero latency                # latency to network devices
doublezero device list            # available devices
doublezero connect ibrl           # manually connect
doublezero disconnect             # disconnect

sudo systemctl status doublezerod  # daemon status
```

### Configure shred publisher rewards

Per 2026-06-08 session:

```bash
sudo doublezero-solana shreds publisher-rewards configure \
    --node-id <MAINNET_VALIDATOR_IDENTITY> \
    --rewards-token-owner <WALLET_PUBKEY_FOR_TOKENS> \
    -k /root/solana/mainnet-validator-keypair.json
```

`--rewards-token-owner` = SOL wallet (System Program owned), not ATA (Module 2.4 critical distinction).

## Update workflow (з твоїх docs)

З `DoubleZero Update Guide.md`:

1. Record current version
2. Verify daemon running
3. `sudo apt update && sudo apt install --only-upgrade doublezero`
4. Verify version bumped
5. Check tunnel back up (auto-restart)
6. Check latency healthy

DZ updates auto-restart daemon (нema separate restart needed).

## Mini-quiz

<Quiz :data="quiz" />

## Glossary

[`DoubleZero`](/glossary#d), [`Shred publisher`](/glossary#s), [`Tunnel`](/glossary#t), [`Access-pass`](/glossary#a)

## External refs

- [DoubleZero docs](https://docs.malbeclabs.com/)

---

**Попередньо:** [← 2. Snapshots](/module-10/2-snapshots) | **Наступне:** [4. Governance →](/module-10/4-governance)
