<script setup>
const quiz = {
  id: 'm1-1-cluster',
  title: '🧠 Mini-check: Cluster, network, node kinds',
  intro: '3 питання щоб закріпити cluster basics.',
  questions: [
    {
      type: 'compare',
      q: 'У чому різниця між mainnet-beta, testnet, devnet, і Alpenglow? Перерахуй 2-3 ключові пункти різниці.',
      ideal: '1. mainnet-beta: production cluster, реальні SOL мають справжню вартість, validator потребує stake (SFDP або self), будь-який bug коштує grошей.\n\n2. testnet: stable software testing, дешевий SOL без вартості, validator потребує stake (тестовий), Anza тут тестує bleeding-edge releases ПЕРЕД mainnet.\n\n3. devnet: developer-friendly, free SOL з faucet, дуже дозволяючий (за параметрами легше), нема stake requirement. Для developers що пишуть програми.\n\n4. Alpenglow community cluster: research cluster для нового consensus protocol (SIMD-0326). Дуже маленький, нестабільний, "be ready for everything to break". Community-run, не Anza.',
      explanation: 'Ключові осі різниці: (1) реальна цінність SOL, (2) stake/access requirements, (3) стабільність software, (4) цільова аудиторія (operators/devs/researchers). Якщо описала ці пункти — повна відповідь.'
    },
    {
      type: 'mcq',
      q: 'Що з цього є RPC node (а не consensus validator)?',
      options: [
        'Нода що тримає копію ledger, обробляє getBalance/getTransaction запити від клієнтів, НЕ голосує і НЕ отримує rewards',
        'Нода з активним voting + stake, обробляє блоки, голосує, отримує rewards',
        'Тільки cluster entrypoint який bootstrapає нових нод',
        'Light client який не тримає state'
      ],
      correct: [0],
      explanation: 'RPC node — full node з ledger state але БЕЗ vote account. Тримає історичні дані для serving queries. Не голосує, не отримує consensus rewards. Запускається з різним config (RPC mode flags). #2 — consensus validator. #3 — entrypoint це частина gossip layer, не окрема role. #4 — light clients не існує у Solana.'
    },
    {
      type: 'command',
      q: 'Як подивитись на якому network знаходиться твій локальний solana CLI? Напиши команду.',
      accepts: [
        'solana config get',
        'solana cluster-version',
        'solana config get | grep -i RPC'
      ],
      ideal: 'solana config get',
      explanation: 'solana config get показує всі поточні CLI settings: RPC URL (з нього видно cluster — mainnet/testnet/devnet/custom), keypair path, websocket URL, commitment level. RPC URL це source of truth куди йдуть твої команди.'
    }
  ]
}
</script>

# 1. Cluster, network types, node kinds

## TL;DR

**Cluster** — це група вузлів (validators + RPC nodes) які разом утворюють одну Solana network. У будь-який момент часу існує кілька **окремих** clusters: production (mainnet-beta), staging (testnet), developer playground (devnet), плюс research/community clusters (Alpenglow).

Кожен cluster має свій **genesis hash** (унікальний відбиток першого блоку) і свою economy — SOL у mainnet ≠ SOL у testnet (це різні tokens на різних networks).

Validator — це нода що **голосує** (бере участь у consensus). **RPC node** — це нода що тримає state і відповідає на client запити, але **не голосує**. Це різні ролі того ж software (`agave-validator`), але з різними CLI flags.

## Концепти

### Cluster

**Cluster** = група валідаторів + RPC nodes що:

- Працюють на тому самому software version (`agave-validator vX.Y.Z`)
- Стартують з того самого **genesis** (initial state)
- Спілкуються через **gossip protocol** (модуль 5)
- Спільно ведуть один **ledger** (історію всіх transactions)

**Genesis** — це stamp-моменту початку: initial accounts, initial stake distribution, system parameters (slot duration, epoch length). Усі nodes у cluster мають однаковий genesis. Якщо різний genesis — це **інший cluster**.

Кожен cluster має свій **genesis hash** — унікальний відбиток. На твоєму Alpenglow setup:

```
Genesis hash: F7m9FCZqve9pRmX3Ar4EqoZ1CUMFv8pZiN2gaELPWQtL
```

(з §Constants твого cheatsheet — post-cluster-restart June 2026)

### Public Solana clusters

| Cluster | RPC URL | Призначення | SOL value | Stake requirement |
|---|---|---|---|---|
| **mainnet-beta** | `https://api.mainnet-beta.solana.com` | Production, реальні гроші | Real (~$200) | Так (SFDP або self) |
| **testnet** | `https://api.testnet.solana.com` | Pre-prod software testing | Нема | Так (тестовий) |
| **devnet** | `https://api.devnet.solana.com` | Developer playground | Нема (faucet) | Ні |

Кожен має:

- Свій separate ledger
- Свої separate accounts (твій mainnet wallet не існує на testnet)
- Свої separate validators

### Beyond official: community clusters

**Alpenglow community cluster** — окремий research cluster для тестування нового consensus protocol (SIMD-0326). Не Anza, не Solana Foundation — community-run на agave fork:

```
Genesis hash: F7m9FCZqve9pRmX3Ar4EqoZ1CUMFv8pZiN2gaELPWQtL
Shred version: 63812
Cluster version: 0.4.0
Entrypoints: 64.130.37.11:8000, 213.239.141.16:8001
```

Це **окремий** cluster — ніяк не пов'язаний з mainnet-beta. SOL у Alpenglow не існує у mainnet і навпаки.

### Node kinds: validator vs RPC node

Один той самий software `agave-validator` може працювати у двох ролях:

| | **Voting validator** | **RPC node** |
|---|---|---|
| Vote account | Так (`--vote-account` flag) | Ні (`--no-voting`) |
| Голосує | Так | Ні |
| Отримує consensus rewards | Так | Ні |
| Requires stake | Так (SFDP, self, або delegated) | Ні |
| Тримає full ledger | Так | Так |
| Serves RPC queries | Залежить від config | Так (це основна функція) |
| Resource usage | High (CPU/RAM для voting + storage) | High (storage для historical data) |
| Cost to run | Висока (stake locked) | Помірна (тільки server cost) |

**Для тебе як LumLabs operator:**

- **mainnet validator** (server `eta`) — voting validator з stake. Receives rewards. Це product LumLabs.
- **Alpenglow validator** (WNX0016778) — voting validator на experimental cluster. Self-stake, тестування.
- **testnet validator** — voting validator на testnet. Self-stake. Testing software.

LumLabs **не оперує** dedicated RPC nodes (зазвичай).

### Hybrid роль

Validator МОЖЕ одночасно serv'ити RPC запити (флаг `--rpc-port 8899`). Але це додаткове навантаження + storage overhead. У production стандарт:

- **Validator** = voting, мінімально RPC (для health checks, твоїх CLI команд)
- **RPC node** = no voting, full RPC + history (для apps, indexers, користувачів)

## Network вибір через CLI

`solana` CLI має concept "current network" — куди йдуть твої команди.

```bash
solana config get                                # show current
solana config set --url mainnet-beta            # switch to mainnet
solana config set --url testnet                 # switch to testnet
solana config set --url devnet                  # switch to devnet
solana config set --url http://localhost:8899   # local node
solana config set --url https://custom-rpc.com  # custom
```

`--url mainnet-beta` resolveається до `https://api.mainnet-beta.solana.com` (shortcut). Можна писати повний URL.

Або per-command override:

```bash
solana validators --url mainnet-beta
solana epoch-info --url testnet
solana balance --url http://localhost:8899
```

⚠️ Завжди перевір `solana config get` ПЕРЕД destructive command (`transfer`, `vote-authorize`, etc.) — `--url` різниця може коштувати грошей.

## RPC endpoints — health

Перш ніж покладатись на RPC endpoint, перевір що він живий:

```bash
curl -s https://api.mainnet-beta.solana.com -X POST \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

Очікувані відповіді:

- `{"jsonrpc":"2.0","result":"ok","id":1}` — endpoint живий
- `{"jsonrpc":"2.0","error":{"code":-32005,"message":"Node is behind by N slots"...}}` — нода catching up
- `503 Service Unavailable` — endpoint лежить
- `403 Forbidden` — твій IP заблоковано (буває з public endpoints)

Production tip: **public RPC endpoints (api.mainnet-beta) часто rate-limited або slow**. Для production apps використовуй платні RPC providers (Helius, QuickNode, Triton One) або власну RPC node.

## Connect to your work: твій setup

| Server | Cluster | Role | Identity |
|---|---|---|---|
| `eta` | mainnet-beta | Voting validator | (production identity) |
| `WNX0016778` | Alpenglow community | Voting validator | `DSDefivSLLox2Sg4buLCfzxdD281H4AaQg3h1vLeBqjt` |
| testnet validator | testnet | Voting validator | `FLHB8AGEsED5jAF5sS1kSkAzSXVK23iuT7YDPHGmbcjb` |

Кожен — окремий cluster, окремі stake/rewards, окремі issues для моніторингу.

### Чому ти не можеш переключити Alpenglow → mainnet "просто так"

- Різний genesis (різні `genesis hash`)
- Різний software version (Alpenglow `ag-v0.4.x`, mainnet `v2.x`)
- Різна identity (Alpenglow validator pubkey ≠ mainnet validator pubkey)
- Різні vote accounts
- Різні stake

Validator instance прив'язана до cluster через config + identity. Switch cluster = wipe ledger + новий identity + новий config = фактично новий setup.

## Hands-on exercise

На твоєму ноутбуці:

```bash
# Подивись поточний cluster
solana config get

# Перевір mainnet health
solana cluster-version --url mainnet-beta

# Подивись скільки validators на mainnet
solana validators --url mainnet-beta 2>&1 | tail -5

# Тестовий cluster
solana validators --url testnet 2>&1 | tail -5
```

На сервері WNX0016778 (Alpenglow):

```bash
# Поточний cluster через локальний RPC
sudo /home/solana/ag/bin/solana cluster-version --url http://localhost:8899

# Genesis hash
sudo /home/solana/ag/bin/solana genesis-hash --url http://localhost:8899
# Має повернути F7m9FCZqve9pRmX3Ar4EqoZ1CUMFv8pZiN2gaELPWQtL

# Скільки validators у cluster
sudo /home/solana/ag/bin/solana validators --url http://localhost:8899 2>&1 | tail -5

# Cluster nodes (gossip)
sudo /home/solana/ag/bin/solana gossip --url http://localhost:8899 | head -10
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Cluster`](/glossary#c), [`mainnet-beta`](/glossary#m), [`testnet`](/glossary#t), [`devnet`](/glossary#d), [`Genesis`](/glossary#g), [`Genesis hash`](/glossary#g), [`Validator`](/glossary#v), [`RPC node`](/glossary#r), [`Entrypoint`](/glossary#e)

## External refs

- [Anza: Clusters Overview](https://docs.anza.xyz/clusters) — official cluster doc
- [Solana Docs: Validator vs RPC](https://docs.anza.xyz/operations/setup-an-rpc-node) — different roles explained
- [Helius RPC guide](https://www.helius.dev/blog/an-introduction-to-solanas-mainnet-beta) — third-party RPC providers comparison

---

**Наступне:** [2. Slots, epochs, time на Solana →](/module-1/2-slots-epochs)
