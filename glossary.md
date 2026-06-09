# Glossary

Накопичувальний словник усіх термінів курсу. Сортовано алфавітом (англ.). Кожен term має посилання на module де deeper explanation.

## A

**Account** — основна абстракція state на Solana. 5 fields: lamports, owner, data, executable, rent_epoch. Identify by Pubkey. [Module 2.1](/module-2/1-account-basics)

**AccountsDB** — validator's storage всіх accounts state. Mainnet ~500GB on NVMe + RAM cache. Alpenglow на tmpfs (RAM). [Module 6.3](/module-6/3-accountsdb)

**Account lock** — Sealevel scheduler tracks which TXs touch which accounts. Writable accounts exclusive, read-only shared. [Module 6.4](/module-6/4-stages)

**Accelerate** — annual Solana conference де Alpenglow вперше unveiled (May 2024). [Module 11.1](/module-11/1-context)

**Activation epoch** — epoch коли feature flag активується. До неї old behavior, після — new. [Module 4.7](/module-4/7-recent-simds)

**Active stake** — SOL delegated до validators які зараз голосують (non-delinquent). [Module 1.5](/module-1/5-validator-status)

**Address Lookup Table (ALT)** — on-chain account containing list pubkeys. TX references via 1-byte index замість 32-byte pubkey. Дозволяє 256+ accounts у TX. [Module 3.5](/module-3/5-versioned-tx-alts)

**Alertmanager** — Prometheus component для notifications. Maps alerts до channels (Slack, Telegram, PagerDuty). [Module 8.8](/module-8/8-monitoring-stack)

**Alpenglow** — proposed next-gen Solana consensus protocol (SIMD-0326). BLS aggregated signatures, faster finality. Currently тестується community cluster. [Module 4.4](/module-4/4-alpenglow) / [Module 11](/module-11/)

**Alpenglow community cluster** — testing cluster для Alpenglow protocol. ~90 validators, ~4.4M SOL stake. Test tokens, NOT mainnet value. [Module 11.1](/module-11/1-context)

**Alpenglow Explorer** — public dashboard для community cluster validators. URL: ag.validblocks.com/validators. [Module 11.1](/module-11/1-context)

**Ancestor finalization** — Alpenglow property: коли block at slot N finalizes, all ancestor blocks automatically finalize. [Module 11.2](/module-11/2-votor-consensus)

**AshwinSekar/solana fork** — primary repository для Alpenglow implementation. Active branch: alpenglow-v0.4. [Module 11.1](/module-11/1-context)

**Authorized voter (constant)** — у failover patterns, --authorized-voter flag permanently references staked keypair, identity swaps independently. [Module 11.5](/module-11/5-identity-management)

**Anchor** — popular Rust framework для writing Solana smart contracts. [Module 2.2](/module-2/2-programs)

**Atomicity** — TX execute як єдиний unit: усі instructions success або жодна. Foundation of DeFi composability. [Module 3.1](/module-3/1-tx-anatomy)

**ATA (Associated Token Account)** — deterministic token account для пари `(owner_wallet, token_mint)`. Auto-derived, standard convention. [Module 2.4](/module-2/4-tokens-ata)

**Authorized voter** — key що signs vote TXs. Hot key OK (на сервері). [Module 4.3](/module-4/3-votes-credits)

**Authorized withdrawer** — controls vote account: withdraw, change authorities, set commission. **Critical key** — cold storage mandatory mainnet. [Module 4.3](/module-4/3-votes-credits)

**AVX-512** — Intel CPU SIMD instruction set. Firedancer uses для accelerated sigverify. [Module 6.5](/module-6/5-firedancer)

## B

**Backup** — copy critical data (keypairs, configs) у safe locations. Mandatory before destructive operations. [Module 8.2](/module-8/2-backups)

**BAM (Block Assembly Marketplace)** — Jito's permissioned block-building marketplace. Eligible validators receive bundles + tips. [Module 7.3](/module-7/3-mev-jito)

**Bank** — internal термін для in-progress block state у validator memory. [Module 1.4](/module-1/4-block-production)

**Banking stage** — leader mode component що executes TXs у parallel via Sealevel. [Module 6.4](/module-6/4-stages)

**Base fee** — 5000 lamports per signature. 50% burned, 50% leader. [Module 3.3](/module-3/3-fees)

**Base58** — encoding для Solana pubkeys (легше читати ніж hex). [Module 2.1](/module-2/1-account-basics)

**Binary** — виконуваний файл, результат компіляції source code. ELF format на Linux. [Module 0.1](/module-0/1-build)

**Block** — data container що зберігає всі TXs виконані у конкретному slot. [Module 1.2](/module-1/2-slots-epochs)

**Block engine** — Jito component що simulates blocks з bundles, picks best paying. [Module 7.3](/module-7/3-mev-jito)

**Block height** — кількість blocks створених від genesis (виключає skipped slots). [Module 1.2](/module-1/2-slots-epochs)

**Blockhash** — унікальний відбиток block content. Використовується у TX як "recent blockhash" для expiry tracking. [Module 1.2](/module-1/2-slots-epochs)

**Blockhash expiry** — TX has ~150 slots (~60 sec) щоб бути included. [Module 3.4](/module-3/4-lifecycle)

**BLS pubkey registration** — process через який validators register BLS pubkey у vote account per SIMD-0387. Required для Alpenglow consensus participation. [Module 11.7](/module-11/7-joining-cluster)

**BLS signature** — Boneh-Lynn-Shacham signature scheme. Дозволяє aggregation (many signers → one signature). Alpenglow uses. [Module 4.4](/module-4/4-alpenglow)

**Bleeding edge software** — frequent unstable releases typical для research clusters (Alpenglow community). [Module 11.9](/module-11/9-cluster-operations)

**Block-level replication** — failover strategy storing validator data via block-level mirroring (DRBD, Ceph). Lowest latency, highest complexity. [Module 11.4](/module-11/4-vote-history)

**Bootstrap validator** — initial validator(s) у genesis. Define cluster's starting point. [Module 1.6](/module-1/6-genesis)

**Borsh** — binary serialization format used by Solana programs. [Module 3.2](/module-3/2-instructions)

**BPF Loader** — native program що loads + executes BPF programs. Current = BPF Loader Upgradeable. [Module 2.2](/module-2/2-programs)

**BPF program** — user-deployed smart contract. Compiled до BPF bytecode, executes у sandboxed BPF VM. [Module 2.2](/module-2/2-programs)

**Branch (git)** — рухомий покажчик на commit. Просувається з новими commits. [Module 0.2](/module-0/2-git)

**Bump seed** — 0-255 value used у PDA derivation щоб find off-curve address. [Module 2.5](/module-2/5-pda-deep)

**Bundle (Jito)** — group of TXs that execute together, submitted by searcher з tip. [Module 7.3](/module-7/3-mev-jito)

**Bytecode** — compiled program format (BPF) що executes у BPF VM. [Module 2.2](/module-2/2-programs)

## C

**Cargo** — Rust's build tool + package manager. Manages deps, compiles, installs. [Module 0.3](/module-0/3-cargo)

**Cargo.lock** — exact dependency versions snapshot для reproducible builds. [Module 0.3](/module-0/3-cargo)

**Cargo.toml** — Rust project manifest. [Module 0.3](/module-0/3-cargo)

**CARGO_INSTALL_ROOT** — env variable specifying default install location. [Module 0.3](/module-0/3-cargo)

**Catch-up** — validator's process recovering missed slots/blocks через repair protocol. [Module 5.4](/module-5/4-repair)

**Certificate (Alpenglow)** — cryptographic proof aggregating BLS signatures від multiple validators showing votes reached threshold. Anchored on-chain. [Module 11.2](/module-11/2-votor-consensus)

**Cluster restart procedure** — coordinated process для re-launching cluster з new genesis (often after halt or protocol upgrade). [Module 11.9](/module-11/9-cluster-operations)

**Community cluster cadence** — frequent restarts + bleeding-edge releases typical для research clusters (e.g., Alpenglow community). [Module 11.9](/module-11/9-cluster-operations)

**Contributing back** — operator participation у community: bug reports, testing, documentation. Builds reputation з Anza. [Module 11.9](/module-11/9-cluster-operations)

**Correlated failure** — multiple validators failing same way simultaneously (same software bug, same datacenter outage). Quadratic slashing penalizes. [Module 11.8](/module-11/8-slashing)

**Checkout (git)** — switch між commits/branches/tags. [Module 0.2](/module-0/2-git)

**Client diversity** — multiple validator implementations (agave + Firedancer) для network resilience. [Module 6.5](/module-6/5-firedancer)

**Cluster** — група validators + RPC nodes що утворюють одну Solana network. [Module 1.1](/module-1/1-cluster)

**Cluster membership** — list of all visible nodes у cluster, maintained через gossip. [Module 5.1](/module-5/1-gossip)

**cNFT (compressed NFT)** — NFT з state compression. ~1000x cheaper ніж standard. Uses Merkle trees. [Module 10.6](/module-10/6-compression-nfts)

**Coding shred** — Reed-Solomon parity shred для erasure recovery. [Module 5.3](/module-5/3-shreds)

**Co-location** — physically placing servers у tier-1 datacenter (Equinix). Critical для validator network latency. [Module 8.5](/module-8/5-hardware-specs)

**Cold key** — key stored offline. Rarely used. Для high-value operations (withdrawer authority). [Module 8.1](/module-8/1-keypair-security)

**Commission** — % validator rewards operator takes (0-100%). [Module 4.3](/module-4/3-votes-credits)

**Commission bps** — commission set у basis points (800 = 8%). Jito-Solana flag. [Module 7.5](/module-7/5-jito-block-engine)

**Commit (git)** — snapshot стану repository у момент. SHA-1 hash, parent, message, author. [Module 0.2](/module-0/2-git)

**Compaction** — periodic AccountsDB cleanup що merges write logs. [Module 6.3](/module-6/3-accountsdb)

**Compiler** — translator з source code (Rust) до machine code (binary). [Module 0.1](/module-0/1-build)

**Compressed NFT (cNFT)** — see [`cNFT`](/glossary#c). [Module 10.6](/module-10/6-compression-nfts)

**Compute Budget Program** — native program для controlling per-TX compute limits + priority fees. [Module 3.3](/module-3/3-fees)

**Compute Unit (CU)** — measure of operations у TX. Default budget 200,000 per TX. [Module 3.2](/module-3/2-instructions)

**Confidence interval** — uncertainty range provided з oracle price. [Module 10.7](/module-10/7-oracles)

**Confidential transfers** — Token-2022 extension hiding transfer amounts через zero-knowledge. [Module 2.6](/module-2/6-token-2022)

**Confirmed (slot/TX)** — ≥2/3 stake voted за block. Probabilistic finality. ~1-3 sec mainnet. [Module 3.4](/module-3/4-lifecycle)

**ContactInfo** — gossip-published validator metadata: pubkey, IP+ports, version, timestamps. [Module 5.1](/module-5/1-gossip)

**Cooldown** — stake state коли deactivating, чекає кінця epoch. [Module 7.1](/module-7/1-stake)

**CPI (Cross-Program Invocation)** — програма викликає інше program у тому ж TX. [Module 3.2](/module-3/2-instructions)

**CPU governor** — Linux setting що manages CPU frequency scaling. "performance" governor для validators. [Module 8.6](/module-8/6-kernel-tuning)

**Crates.io** — public Rust package registry. [Module 0.3](/module-0/3-cargo)

## D

**Daemon** — background process відв'язаний від terminal, managed by init system. [Module 0.4](/module-0/4-processes)

**Data shred** — shred containing actual block content. [Module 5.3](/module-5/3-shreds)

**Debug build** — non-optimized binary з debug symbols. Не для production. [Module 0.1](/module-0/1-build)

**Delegation (stake)** — direct stake account до specific validator. One stake account → one validator. [Module 7.1](/module-7/1-stake)

**Delegator rewards** — частка validator rewards до delegators proportional до їх stake. [Module 7.2](/module-7/2-rewards)

**Delinquent** — validator status: не голосував > 128 slots на rooted slot. Recoverable. [Module 1.5](/module-1/5-validator-status)

**Detached HEAD** — git state коли HEAD вказує на commit/tag напряму, не на branch. [Module 0.2](/module-0/2-git)

**Devnet** — Solana developer cluster. Free SOL з faucet, для testing apps. [Module 1.1](/module-1/1-cluster)

**Disaster recovery** — procedure для restoring validator після catastrophic failure. [Module 8.2](/module-8/2-backups)

**Discriminator** — first bytes of instruction data що identifies which method. Anchor uses 8-byte hash. [Module 3.2](/module-3/2-instructions)

**Disinflation** — gradual reduction inflation rate. Solana: 15% yearly. [Module 7.2](/module-7/2-rewards)

**DoubleZero** — dedicated low-latency network для Solana validator-to-validator traffic. [Module 10.3](/module-10/3-doublezero)

**Double-sign** — validator signs two conflicting things (votes/blocks) at same slot. Slashable. [Module 4.6](/module-4/6-slashing-deep)

**Double-vote** — see [Double-sign]. Specifically vote-level double signing. [Module 4.2](/module-4/2-tower-bft)

**--do-not-require-vote-history** — Alpenglow agave flag що дозволяє validator start без vote_history.bin file. Risky для active staked identity (may double-vote). [Module 11.4](/module-11/4-vote-history)

**Dry-run failover** — testing failover procedure без committing actual identity changes. Used by SOL-Strategies tool by default. [Module 11.6](/module-11/6-failover-patterns)

**DPDK** — Data Plane Development Kit, kernel-bypass networking framework. Used by Firedancer + Fiber. [Module 5.5](/module-5/5-quic-fiber)

**Durable nonce** — alternative до recent_blockhash для TX expiry. Long-lived. [Module 3.6](/module-3/6-durable-nonces)

**DWPD** — Drive Writes Per Day. SSD endurance metric. Enterprise NVMe usually 3-10 DWPD. [Module 8.5](/module-8/5-hardware-specs)

**Dynamic linking** — binary references shared `.so` libraries at runtime. [Module 0.1](/module-0/1-build)

## E

**Entrypoint** — well-known seed node для bootstrapping. [Module 1.1](/module-1/1-cluster)

**Environment variable** — variable у shell environment. Accessed з `$VAR`. [Module 0.6](/module-0/6-shell)

**Epoch** — 432,000 slots ≈ 48 годин mainnet. Group of slots з спільним leader schedule. [Module 1.2](/module-1/2-slots-epochs)

**Equinix** — major datacenter operator (FR4 Frankfurt, AM3 Amsterdam, тощо). Validator co-location standard. [Module 8.5](/module-8/5-hardware-specs)

**Equivocation** — leader signs two different blocks for same slot. Slashable. [Module 4.6](/module-4/6-slashing-deep)

**Erasure coding** — Reed-Solomon redundancy: 32 data + 32 coding shreds, recover з будь-якими 32+. [Module 5.3](/module-5/3-shreds)

**Executable flag** — account field: true для programs (call'able), false для data. [Module 2.1](/module-2/1-account-basics)

## F

**FEC set** — group of shreds (typically 32 data + 32 coding) for Forward Error Correction. [Module 5.3](/module-5/3-shreds)

**Failover rollback** — failover tools capability до undo identity swap якщо post-swap verification fails. [Module 11.6](/module-11/6-failover-patterns)

**Fast-Finalization** — Alpenglow path: ≥80% notarize votes у round 1 → instant finalization (~100ms). [Module 11.2](/module-11/2-votor-consensus)

**Fee burn** — 50% of TX fees permanently destroyed (deflationary). [Module 3.3](/module-3/3-fees)

**Finalize vote** — Alpenglow round 2 vote affirming slot ready for finality. [Module 11.2](/module-11/2-votor-consensus)

**Fee payer** — first signer у TX. Платить fees. [Module 3.1](/module-3/1-tx-anatomy)

**Feature activation** — moment коли feature flag перейде з pending до active. Епоch-aligned. [Module 4.7](/module-4/7-recent-simds)

**Feature flag** — pubkey identifying protocol feature. Code includes both old + new behavior gated by flag status. [Module 4.7](/module-4/7-recent-simds)

**Feature pubkey** — identifier for specific feature. Status checked via `solana feature status`. [Module 4.7](/module-4/7-recent-simds)

**Fetch (git)** — download нові commits/tags з remote. Не modify working tree. [Module 0.2](/module-0/2-git)

**Fiber** — newer agave networking layer using kernel-bypass для high-performance turbine. [Module 5.5](/module-5/5-quic-fiber)

**Finalized (slot/TX)** — vote depth 32 у tower. Cryptographic finality. ~12-30 sec mainnet. [Module 3.4](/module-3/4-lifecycle)

**fio** — Linux disk I/O benchmark tool. Standard для validator hardware testing. [Module 9.6](/module-9/6-benchmarking)

**Firedancer** — alternative validator client written у C by Jump Crypto. Performance + client diversity goal. [Module 6.5](/module-6/5-firedancer)

**Fork** — situation коли cluster has two competing chains. [Module 4.5](/module-4/5-forks)

**Fork choice** — algorithm для picking canonical fork. Heaviest stake-weighted wins. [Module 4.5](/module-4/5-forks)

**Frankendancer** — hybrid agave + Firedancer components (transition phase). [Module 6.5](/module-6/5-firedancer)

**Freeze authority** — wallet що може freeze token accounts. None = permissionless. [Module 2.4](/module-2/4-tokens-ata)

**Full snapshot** — complete accountsDB state at slot. Mainnet ~80-100 GB. [Module 10.2](/module-10/2-snapshots)

## G

**Garbage collection (accounts)** — old system: accounts below rent threshold purged. [Module 2.3](/module-2/3-rent)

**Genesis** — initial state cluster. All nodes мають однаковий genesis. [Module 1.1](/module-1/1-cluster)

**Genesis ceremony** — coordinated process to launch new cluster з shared genesis file. [Module 1.6](/module-1/6-genesis)

**Genesis hash** — unique fingerprint genesis. Identifies cluster. [Module 1.1](/module-1/1-cluster)

**Geyser** — Solana plugin system для streaming live data з validator. [Module 10.1](/module-10/1-geyser-rpc)

**Glob** — shell wildcard expansion (`*`, `?`, `[abc]`). Expanded by shell ДО execution. [Module 0.6](/module-0/6-shell)

**Gossip** — epidemic protocol для propagating cluster membership + metadata. [Module 5.1](/module-5/1-gossip)

**Grafana** — visualization tool для time-series data. Used з Prometheus для validator monitoring. [Module 8.8](/module-8/8-monitoring-stack)

## H

**Halt threshold** — % delinquent stake beyond which cluster halts. Mainnet 33%, Alpenglow ~18%. [Module 1.5](/module-1/5-validator-status)

**Hardlink** — alternative filename для того ж inode. [Module 0.5](/module-0/5-filesystem)

**HEAD (git)** — pointer "де ти зараз" у repo. [Module 0.2](/module-0/2-git)

**Heaviest fork rule** — Solana fork choice: canonical fork = з найбільшим stake voting. [Module 4.5](/module-4/5-forks)

**Helius** — popular Solana RPC provider з Geyser-enhanced services + cNFT indexing. [Module 10.1](/module-10/1-geyser-rpc)

**Heredoc** — shell construct для multi-line input. `<<EOF ... EOF`. [Module 0.6](/module-0/6-shell)

**Hot key** — key used continuously by software, on server. [Module 8.1](/module-8/1-keypair-security)

**Hot-swap** — runtime identity change без validator restart. Sub-second swap між active+standby. [Module 11.5](/module-11/5-identity-management)

**Hugepages** — large memory pages (2MB/1GB) для efficient buffering. Used by Firedancer + Fiber. [Module 5.5](/module-5/5-quic-fiber)

**Hyper-V** — Microsoft virtualization platform. Backs WSL2. [Module 0.9](/module-0/9-wsl-windows)

## I

**Identity rotation** — replacing validator identity key. Via `agave-validator set-identity`. Use carefully avoid double-sign. [Module 4.6](/module-4/6-slashing-deep)

**Identity symlink pattern** — standard hot-swap pattern. --identity flag points до symlink. Symlink target switches між staked + unstaked. [Module 11.5](/module-11/5-identity-management)

**Incident response** — structured handling of operational alerts. Ack → assess → mitigate → investigate → document. [Module 8.9](/module-8/9-oncall-runbooks)

**Incremental snapshot** — delta from last full snapshot. Small (~1 GB), created every ~100 slots. [Module 10.2](/module-10/2-snapshots)

**In-genesis** — validators included у cluster's initial genesis (vs out-of-genesis joining later). [Module 1.6](/module-1/6-genesis) / [Module 11.7](/module-11/7-joining-cluster)

**Inflation pool** — нові SOL minted per epoch, distributed до validators proportional до credits. [Module 7.2](/module-7/2-rewards)

**Inflation rate** — annual % new SOL supply created. ~5% currently, disinflating. [Module 7.2](/module-7/2-rewards)

**Init system** — first process boot Linux (PID 1). systemd = standard. [Module 0.4](/module-0/4-processes)

**Inode** — internal filesystem structure з file metadata + pointer до data blocks. [Module 0.5](/module-0/5-filesystem)

**Instruction** — atomic unit у TX. Specifies program, accounts, data. [Module 3.1](/module-3/1-tx-anatomy)

**invoke_signed** — CPI mechanism whereby program "signs" як PDA через seeds. [Module 2.5](/module-2/5-pda-deep)

**IOPS** — I/O Operations Per Second. Disk benchmark metric. Mainnet target > 200k random 4k read. [Module 9.6](/module-9/6-benchmarking)

**iperf3** — network bandwidth benchmark tool. [Module 9.6](/module-9/6-benchmarking)

## J

**JIP (Jito Improvement Proposal)** — Jito DAO governance proposal. [Module 10.4](/module-10/4-governance)

**Jito** — major MEV infrastructure provider для Solana. [Module 7.3](/module-7/3-mev-jito)

**Jito-Solana** — fork agave validator з MEV functionality. ~50% mainnet stake runs це. [Module 7.3](/module-7/3-mev-jito)

**JitoSOL** — Jito's liquid staking token. [Module 7.3](/module-7/3-mev-jito)

**journald** — systemd's logging system. Read через `journalctl`. [Module 0.4](/module-0/4-processes)

**JTO** — Jito DAO governance token. Votes на JIPs. [Module 10.4](/module-10/4-governance)

**Jump Crypto** — trading firm creating Firedancer. [Module 6.5](/module-6/5-firedancer)

## J

**Junk identity** — temporary unstaked keypair used by standby validator (cannot vote since no stake). [Module 11.5](/module-11/5-identity-management)

## K

**Kernel bypass** — networking technique routing packets directly до user-space (skip kernel). Fiber + Firedancer use. [Module 5.5](/module-5/5-quic-fiber)

**Key rotation** — periodic replacement keys. [Module 8.2](/module-8/2-backups)

**Keyless operation** — failover pattern де staked identity NEVER stored on validator. Authorized voter set remotely via SSH. Maximum security. [Module 11.6](/module-11/6-failover-patterns)

## L

**Lamport** — найменша одиниця SOL. 1 SOL = 10^9 lamports. [Module 2.1](/module-2/1-account-basics)

**Lamport credits** — Alpenglow epochCredits semantics: actual lamport reward earned (НЕ vote count). [Module 4.4](/module-4/4-alpenglow)

**Last vote** — slot of validator's most recent vote. [Module 1.5](/module-1/5-validator-status)

**Layer (turbine)** — tree level. Layer 1 receives від leader first. [Module 5.2](/module-5/2-turbine)

**Leader** — validator що має ексклюзивне право створити block у specific slot. [Module 1.3](/module-1/3-leaders)

**Leader schedule** — pre-computed мапа slot → validator pubkey для всього epoch. [Module 1.3](/module-1/3-leaders)

**Leader slot group** — consecutive slots assigned одному leader (4 на mainnet). [Module 1.3](/module-1/3-leaders)

**Linker** — частина build process що з'єднує object files + libraries у final binary. [Module 0.1](/module-0/1-build)

**Liquid staking token (LST)** — token representing staked SOL з liquidity. JitoSOL, mSOL. [Module 7.4](/module-7/4-sfdp-pools)

**Lockout** — Tower BFT commitment: validator не голосує за конфліктуючий fork. Exponential: depth N = 2^N slots. [Module 4.2](/module-4/2-tower-bft)

## M

**Mainnet-beta** — Solana's production cluster. [Module 1.1](/module-1/1-cluster)

**Merge stake** — combine two compatible stake accounts. [Module 7.6](/module-7/6-stake-split-merge)

**Merkle tree** — binary tree з hash combinations. Used у state compression. [Module 10.6](/module-10/6-compression-nfts)

**Merkle proof** — sequence hashes proving specific item belongs to Merkle tree root. [Module 10.6](/module-10/6-compression-nfts)

**MEV (Maximum Extractable Value)** — profit з smart TX ordering у block. [Module 7.3](/module-7/3-mev-jito)

**Micro-lamport** — 1/1,000,000 of lamport. Unit для priority fee bids. [Module 3.3](/module-3/3-fees)

**Mint** — token type-defining account. Stores mint authority, supply, decimals. [Module 2.4](/module-2/4-tokens-ata)

**Mint authority** — pubkey that може mint нові tokens. [Module 2.4](/module-2/4-tokens-ata)

**Mode (file permissions)** — `rwxrwxrwx` bits для u/g/o. [Module 0.5](/module-0/5-filesystem)

**Monitoring** — observability of system health. [Module 8.3](/module-8/3-monitoring)

**Multicast** — sending data до multiple recipients. Turbine uses tree multicast. [Module 5.2](/module-5/2-turbine)

**Multicast (network)** — sending data до multiple recipients efficiently. Rotor compatible з multicast (DoubleZero). [Module 11.3](/module-11/3-rotor-propagation)

**Multiple Concurrent Leaders (MCL)** — future Solana protocol enhancement що дозволить кільком leaders одночасно. Compatible з Alpenglow architecture. [Module 11.1](/module-11/1-context)

**Multisig** — wallet вимагає N-of-M signatures. Squads = standard Solana implementation. [Module 8.1](/module-8/1-keypair-security)

## N

**Native program** — built into agave validator binary. System, Vote, Stake, BPF Loader. [Module 2.2](/module-2/2-programs)

**Network partition** — cluster splits into halves через network failure. [Module 4.5](/module-4/5-forks)

**N-of-M** — multisig threshold notation. 3-of-5 = need 3 signatures з 5 keys. [Module 8.7](/module-8/7-treasury-multisig)

**Notarize vote** — Alpenglow round 1 vote: "I observed block X valid у slot N". [Module 11.2](/module-11/2-votor-consensus)

**Notar-fallback vote** — Alpenglow round 2 fallback vote when round 1 inconclusive. [Module 11.2](/module-11/2-votor-consensus)

**node_exporter** — Prometheus exporter для Linux system metrics (CPU, RAM, disk, network). [Module 8.8](/module-8/8-monitoring-stack)

**Nonce account** — on-chain account holding durable nonce value. [Module 3.6](/module-3/6-durable-nonces)

**Nonce authority** — key controlling nonce account (can advance, withdraw). [Module 3.6](/module-3/6-durable-nonces)

**Non-transferable** — Token-2022 extension making tokens soul-bound. [Module 2.6](/module-2/6-token-2022)

**NUMA** — Non-Uniform Memory Access. Multi-socket server architecture. Pinning validator до one NUMA node для consistent performance. [Module 8.6](/module-8/6-kernel-tuning)

**NVMe** — NVM Express. Modern fast SSD interface. Required для validator (random I/O performance). [Module 8.5](/module-8/5-hardware-specs)

## O

**Object file** — intermediate compile output (`.o` файли). [Module 0.1](/module-0/1-build)

**Observational layer (slashing)** — SIMD-0204 initial phase: violation evidence recorded on-chain without auto-destroying stake. Transition phase. [Module 11.8](/module-11/8-slashing)

**Off-chain voting** — Alpenglow design: votes propagate peer-to-peer (BLS messages) instead of as on-chain TXs. [Module 11.4](/module-11/4-vote-history)

**Off-curve point** — pubkey not on ed25519 curve. PDAs are off-curve (no private key exists). [Module 2.5](/module-2/5-pda-deep)

**Offline signing** — sign TX без internet connection (cold wallet pattern). Use durable nonces. [Module 3.6](/module-3/6-durable-nonces)

**Oracle** — bridge від off-chain data до on-chain. Pyth, Switchboard. [Module 10.7](/module-10/7-oracles)

**Orphaned block** — block on losing fork після resolution. TXs reverted. [Module 4.5](/module-4/5-forks)

**Out-of-genesis** — validators joining cluster ПІСЛЯ initial genesis. [Module 1.6](/module-1/6-genesis) / [Module 11.7](/module-11/7-joining-cluster)

**Owner (account)** — program який володіє правом modify account state. **Не** wallet owner. [Module 2.1](/module-2/1-account-basics)

## P

**Pane (tmux)** — split window section. [Module 0.7](/module-0/7-tmux)

**Path** — file system location. Absolute (`/home/...`) або relative. [Module 0.5](/module-0/5-filesystem)

**Pattern A (Anza)** — manual failover pattern per official Anza guide. 10-30s swap. Best для solo operators. [Module 11.6](/module-11/6-failover-patterns)

**Pattern B (Pumpkin)** — scripted manual failover з community-curated conventions. 5-15s swap. [Module 11.6](/module-11/6-failover-patterns)

**Pattern D (SVS)** — automated dashboard tool by huiskylabs. 1-3s swap via SSH connection pooling. [Module 11.6](/module-11/6-failover-patterns)

**Pattern E (SOL-Strategies)** — QUIC peer-to-peer failover tool. <5s swap, dry-run mode. [Module 11.6](/module-11/6-failover-patterns)

**Peer-to-peer coordination** — failover pattern де active+passive validators talk directly (QUIC) без external orchestrator. [Module 11.6](/module-11/6-failover-patterns)

**PATH (env var)** — colon-separated list of directories де shell searches для executables. [Module 0.6](/module-0/6-shell)

**PBFT (Practical Byzantine Fault Tolerance)** — classical consensus algorithm. Tower BFT = PBFT + PoH variant. [Module 4.2](/module-4/2-tower-bft)

**PDA (Program Derived Address)** — special pubkey derived deterministically з seeds + program ID. No private key. [Module 2.5](/module-2/5-pda-deep)

**Pending feature** — feature flag scheduled to activate at specific future epoch. [Module 4.7](/module-4/7-recent-simds)

**Permanent delegate** — Token-2022 extension. Mint authority can always move/burn tokens. [Module 2.6](/module-2/6-token-2022)

**Permission** — access rights для file/directory: read (r), write (w), execute (x). [Module 0.5](/module-0/5-filesystem)

**PID (Process ID)** — unique number identifying running process. [Module 0.4](/module-0/4-processes)

**Pipe** — shell `|` connecting stdout одного command до stdin наступного. [Module 0.6](/module-0/6-shell)

**PoH (Proof of History)** — cryptographic clock через recursive SHA-256 hashing. NOT consensus itself. [Module 4.1](/module-4/1-poh)

**PoH bottleneck** — PoH single-threaded, requires high single-thread CPU performance. [Module 8.5](/module-8/5-hardware-specs)

**PoH leader** — validator generating PoH sequence у its slot. [Module 4.1](/module-4/1-poh)

**PoH service** — validator thread що continuously runs hashing loop. [Module 6.4](/module-6/4-stages)

**Port forwarding** — SSH feature forwarding ports between local і remote. [Module 0.8](/module-0/8-ssh)

**Post-mortem** — post-incident analysis document. [Module 8.9](/module-8/9-oncall-runbooks)

**Prefix key (tmux)** — combo activating tmux command mode. Default: Ctrl+B. [Module 0.7](/module-0/7-tmux)

**Pre-flight check** — verification steps перед cluster operation (delinquent %, version, backups). [Module 11.9](/module-11/9-cluster-operations)

**Proof of Possession (PoP)** — cryptographic proof binding BLS pubkey до specific vote account. 96-byte signature. Prevents rogue key attacks. [Module 11.7](/module-11/7-joining-cluster)

**Price feed** — oracle data feed для specific market price. [Module 10.7](/module-10/7-oracles)

**Priority fee** — optional pay-per-CU для leader prioritization у congestion. [Module 3.3](/module-3/3-fees)

**Private key** — secret half asymmetric keypair. Never share. [Module 0.8](/module-0/8-ssh)

**Process** — running program у memory. [Module 0.4](/module-0/4-processes)

**Processed (slot/TX)** — validator's local view: TX received and executed. [Module 3.4](/module-3/4-lifecycle)

**Program ID** — pubkey of executable program account. [Module 2.2](/module-2/2-programs)

**Prometheus** — time-series database + scraper для metrics. Standard validator monitoring. [Module 8.8](/module-8/8-monitoring-stack)

**ProxyJump** — SSH feature для tunneling через bastion host. [Module 0.8](/module-0/8-ssh)

**Pubkey** — 32-byte public key identifying account. Base58 encoded. [Module 2.1](/module-2/1-account-basics)

**Public key** — public half asymmetric keypair. Safe to share. [Module 0.8](/module-0/8-ssh)

**Public snapshot** — HTTP-accessible snapshot mirror для community catch-up. [Module 10.5](/module-10/5-snapshot-mirror)

**Pull dashboard** — external service polls validator API для monitoring. [Module 8.3](/module-8/3-monitoring)

**Push alert** — validator-side bot sends notifications. [Module 8.3](/module-8/3-monitoring)

**Pyth** — institutional financial data oracle. First-party publishers, sub-second latency. [Module 10.7](/module-10/7-oracles)

## Q

**Quadratic penalty** — proposed slashing formula: penalty scales quadratically з percent stake violating. Incentivizes diverse infrastructure. [Module 11.8](/module-11/8-slashing)

**QUIC** — modern transport protocol (UDP-based з reliability). Solana TPU uses. [Module 5.5](/module-5/5-quic-fiber)

## R

**Realms** — Solana governance framework. JTO voting на JIPs. [Module 10.4](/module-10/4-governance)

**Recent blockhash** — hash recent block included у TX для expiry tracking. [Module 3.1](/module-3/1-tx-anatomy)

**Redirect** — shell I/O redirection: `>` (stdout), `2>&1` (stderr → stdout). [Module 0.6](/module-0/6-shell)

**Reed-Solomon** — erasure coding algorithm. Solana shreds use. [Module 5.3](/module-5/3-shreds)

**Relay node** — у Rotor, validators selected to receive shreds від leader and broadcast до cluster. Stake-weighted selection. [Module 11.3](/module-11/3-rotor-propagation)

**--require-tower** — Tower BFT set-identity flag вимагаючи tower.bin file present перед identity change. Safety check. [Module 11.5](/module-11/5-identity-management)

**--require-vote-history** — Alpenglow analog of --require-tower. Default behavior: refuses set-identity без vote_history.bin. [Module 11.5](/module-11/5-identity-management)

**Rotor** — Alpenglow's block propagation protocol replacing Turbine. Single-hop relay model. [Module 11.3](/module-11/3-rotor-propagation)

**rsync sync strategy** — backup strategy using rsync до continuously sync vote_history.bin до standby server. [Module 11.4](/module-11/4-vote-history)

**Regional BE** — geographically-distributed Jito Block Engines (Frankfurt, NY, Tokyo, etc.). [Module 7.5](/module-7/5-jito-block-engine)

**Release build** — optimized binary для production. `cargo build --release`. [Module 0.1](/module-0/1-build)

**Reorg** — cluster reorganizes around different fork. Дуже rare на Solana. [Module 4.5](/module-4/5-forks)

**Repair** — protocol для requesting missing shreds/slots від peers. [Module 5.4](/module-5/4-repair)

**Replay stage** — validator component що executes TXs у received block. [Module 6.2](/module-6/2-tvu)

**Repository (git)** — directory з versioned code + history. [Module 0.2](/module-0/2-git)

**Rent** — economic mechanism для storage costs. Current: rent-exempt threshold. [Module 2.3](/module-2/3-rent)

**Rent-exempt** — account має ≥ threshold lamports щоб never need to pay rent. [Module 2.3](/module-2/3-rent)

**Rent reserve** — lamports locked у account для rent-exempt. Returned at close. [Module 2.3](/module-2/3-rent)

**Rollback** — revert до previous version (after failed upgrade). [Module 8.4](/module-8/4-upgrade-safety)

**Root slot** — validator's highest finalized slot. [Module 1.5](/module-1/5-validator-status)

**Rooted slot** — slot reached depth 32 у tower (lockout ~forever). [Module 4.2](/module-4/2-tower-bft)

**RPC node** — full node з RPC enabled, не voting. [Module 1.1](/module-1/1-cluster)

**Runbook** — pre-written step-by-step procedure для common incidents. [Module 8.9](/module-8/9-oncall-runbooks)

## S

**scp** — secure copy через SSH. [Module 0.8](/module-0/8-ssh)

**Searcher** — algorithmic trader looking для MEV opportunities. Submits bundles до Jito. [Module 7.3](/module-7/3-mev-jito)

**Sealevel** — Solana runtime для parallel TX execution. [Module 3.2](/module-3/2-instructions)

**set-identity command** — agave-validator subcommand для runtime identity change. Used у hot-swap procedures. [Module 11.5](/module-11/5-identity-management)

**Shared storage strategy** — backup strategy: validator writes vote_history.bin до network storage. Zero sync delay, storage SPOF risk. [Module 11.4](/module-11/4-vote-history)

**Seeds (PDA)** — input bytes для PDA derivation. Determines uniqueness. [Module 2.5](/module-2/5-pda-deep)

**Self-stake** — validator operator stakes own SOL до own validator. [Module 7.1](/module-7/1-stake)

**SEV (severity)** — incident classification: critical, warning, info. [Module 8.9](/module-8/9-oncall-runbooks)

**SFDP (Solana Foundation Delegation Program)** — Foundation delegates stake до qualifying validators free. [Module 7.4](/module-7/4-sfdp-pools)

**SHA-256** — cryptographic hash function. Used у PoH. [Module 4.1](/module-4/1-poh)

**Shell** — command interpreter (bash, zsh). [Module 0.6](/module-0/6-shell)

**Shred** — block fragment, 1280 bytes. Block split into ~64 shreds. [Module 5.3](/module-5/3-shreds)

**Shred publisher** — DoubleZero role: validator що broadcasts shreds через DZ. [Module 10.3](/module-10/3-doublezero)

**Shred version** — cluster identifier (related до genesis). [Module 5.1](/module-5/1-gossip)

**SIGHUP** — Linux signal sent process коли controlling terminal closes. [Module 0.4](/module-0/4-processes)

**Signature aggregation** — combining many signers' signatures into one (BLS scheme). [Module 4.4](/module-4/4-alpenglow)

**Signature (TX)** — 64-byte Ed25519 signature над TX message. [Module 3.1](/module-3/1-tx-anatomy)

**Signer** — account marked as requiring signature у instruction. [Module 3.1](/module-3/1-tx-anatomy)

**Sigverify** — TPU stage що verifies signatures. GPU-accelerated якщо є GPU. [Module 6.1](/module-6/1-tpu)

**SIMD (Solana Improvement Document)** — Solana Foundation governance proposal. [Module 10.4](/module-10/4-governance)

**SIMD repo** — github.com/solana-foundation/solana-improvement-documents. Все SIMD proposals. [Module 4.7](/module-4/7-recent-simds)

**SIMD-0180** — leader schedule keyed до vote account (foundation для slashing). [Module 11.8](/module-11/8-slashing)

**SIMD-0185** — vote account v4 introducing BLS pubkey field. [Module 11.7](/module-11/7-joining-cluster)

**SIMD-0204** — Slashing Program proposal. Observational layer first, eventually executional. [Module 11.8](/module-11/8-slashing)

**SIMD-0326** — Alpenglow consensus proposal (Votor + finality model). [Module 11](/module-11/)

**SIMD-0387** — BLS pubkey management у vote account. Required для Alpenglow voting. [Module 11.7](/module-11/7-joining-cluster)

**Single-hop relay** — Rotor architecture: leader sends shreds direct to relays, relays broadcast to everyone. No tree layers. [Module 11.3](/module-11/3-rotor-propagation)

**Skip vote** — Alpenglow round 1 vote: "I did not observe valid block у slot N (timeout)". [Module 11.2](/module-11/2-votor-consensus)

**Skip-fallback vote** — Alpenglow round 2 fallback when round 1 inconclusive. [Module 11.2](/module-11/2-votor-consensus)

**Skip rate** — % validator's leader slots що стали skipped. Health metric. Mainnet target < 5%. [Module 1.3](/module-1/3-leaders)

**Skipped slot** — slot з 0 blocks produced. [Module 1.2](/module-1/2-slots-epochs)

**Slashing** — penalty (stake reduction) для malicious behavior. [Module 4.2](/module-4/2-tower-bft)

**Slashing condition** — protocol-defined violation triggering slashing. [Module 4.6](/module-4/6-slashing-deep)

**Slashing cooldown** — proposed period after stake deactivation де stake remains slashable. Prevents arbitrage avoidance. [Module 11.8](/module-11/8-slashing)

**Slashing insurance** — emerging products (Tenderize, etc.) що hedge validator slashing risk. [Module 11.8](/module-11/8-slashing)

**Slashing program** — on-chain program receiving evidence of violations, verifying, recording. SIMD-0204. [Module 11.8](/module-11/8-slashing)

**Slow-Finalization** — Alpenglow path: 60% notarize у round 1 + 60% finalize у round 2 → finalize (~150ms). [Module 11.2](/module-11/2-votor-consensus)

**Smart Sampling** — paired з Rotor у proposal (SIMD-0385). Refinements для shred sampling efficiency. [Module 11.1](/module-11/1-context)

**Snapshot backup strategy** — periodic copy of vote_history.bin via cron. Simple але gap risk. [Module 11.4](/module-11/4-vote-history)

**Social punishment** — non-protocol enforcement of slashable behavior (SFDP removal, pool withdrawals, reputation damage). Pre-formal-slashing model. [Module 11.8](/module-11/8-slashing)

**SSH connection pooling** — persistent SSH connections enabling instant command execution. Used by SVS для 1-3s hot swap. [Module 11.6](/module-11/6-failover-patterns)

**Stake-weighted relay** — Rotor relay node selection algorithm. Higher stake → higher probability of selection. [Module 11.3](/module-11/3-rotor-propagation)

**Slot** — 400ms time window. One leader per slot. [Module 1.2](/module-1/2-slots-epochs)

**Snapshot** — compressed accountsDB state dump at slot. [Module 5.4](/module-5/4-repair) / [Module 10.2](/module-10/2-snapshots)

**Snapshot mirror** — HTTP server serving public snapshots для community. [Module 10.5](/module-10/5-snapshot-mirror)

**solana-bench-tps** — Solana CLI tool для measuring cluster TX throughput. [Module 9.6](/module-9/6-benchmarking)

**solana-genesis** — Solana CLI tool для creating new cluster genesis. [Module 1.6](/module-1/6-genesis)

**Source code** — text written by human, before compilation. [Module 0.1](/module-0/1-build)

**SPL Token** — standard token program на Solana (legacy). [Module 2.4](/module-2/4-tokens-ata)

**Split stake** — divide stake account into two. [Module 7.6](/module-7/6-stake-split-merge)

**Squads** — popular Solana multisig wallet. Industry standard для org treasuries. [Module 8.7](/module-8/7-treasury-multisig)

**ssh-agent** — utility holding decrypted SSH keys у memory. [Module 0.8](/module-0/8-ssh)

**Stake account** — account з owner = Stake Program, stores SOL для delegation. [Module 7.1](/module-7/1-stake)

**Stake activation** — process whereby new delegation становить active. Epoch-aligned. [Module 1.2](/module-1/2-slots-epochs)

**Staker authority** — key permitting delegate/redelegate stake. [Module 7.1](/module-7/1-stake)

**Stake pool** — smart contract collecting retail SOL і delegating до validators. JitoSOL, Marinade. [Module 7.4](/module-7/4-sfdp-pools)

**Stake redelegation** — change stake delegation від one validator до another. Needs deactivation + reactivation. [Module 7.6](/module-7/6-stake-split-merge)

**Stake snapshot** — frozen state stakes at epoch boundary. Used для leader schedule. [Module 1.3](/module-1/3-leaders)

**Stake state** — stake account current phase: Initialized, Activating, Active, Deactivating, Inactive. [Module 7.1](/module-7/1-stake)

**Stake-weighted QUIC** — TPU prioritization для known stake-holders, anti-spam. [Module 5.5](/module-5/5-quic-fiber)

**Stake-weighted vote** — voting power proportional до stake amount. [Module 10.4](/module-10/4-governance)

**StakeNet** — Solana system для governing stake pool delegations через Steward Config. [Module 7.4](/module-7/4-sfdp-pools)

**State compression** — Solana technique storing data у Merkle trees замість individual accounts. [Module 10.6](/module-10/6-compression-nfts)

**Stash (git)** — temporarily set aside uncommitted changes. [Module 0.2](/module-0/2-git)

**Static linking** — compiler embeds libraries inside binary. [Module 0.1](/module-0/1-build)

**Steward Config** — StakeNet on-chain config defining stake pool validator selection criteria. NOT same as JIP-31/37. [Module 7.4](/module-7/4-sfdp-pools)

**Switchboard** — general-purpose decentralized oracle. [Module 10.7](/module-10/7-oracles)

**Symlink** — symbolic link, file containing path до another file. [Module 0.5](/module-0/5-filesystem)

**Symlink swap** — rename symlink point до new target. Atomic version switch. [Module 8.4](/module-8/4-upgrade-safety)

**sysbench** — multi-purpose Linux benchmark tool (CPU, memory, threads). [Module 9.6](/module-9/6-benchmarking)

**sysctl** — Linux kernel runtime parameter tuning. Critical для validator (UDP buffers, swap, file descriptors). [Module 8.6](/module-8/6-kernel-tuning)

**System Program** — native program (11111...) для basic SOL operations. [Module 2.1](/module-2/1-account-basics)

**systemd** — modern Linux init system. Manages daemons (services). [Module 0.4](/module-0/4-processes)

## T

**Tag (git)** — immutable pointer до specific commit. [Module 0.2](/module-0/2-git)

**target/ directory** — cargo build output directory. [Module 0.1](/module-0/1-build)

**Testnet** — Solana pre-production cluster. [Module 1.1](/module-1/1-cluster)

**Threshold signing** — multisig requires N-of-M signatures. [Module 8.7](/module-8/7-treasury-multisig)

**THP (Transparent Huge Pages)** — Linux feature що may cause latency spikes. Disable для validators. [Module 8.6](/module-8/6-kernel-tuning)

**Tick (PoH)** — basic time unit у PoH. ~64/sec mainnet. [Module 4.1](/module-4/1-poh)

**Tip account** — special PDA holding Jito tip payments. [Module 7.5](/module-7/5-jito-block-engine)

**Tip distribution** — Jito mechanism splitting tips operator vs stakers. [Module 7.5](/module-7/5-jito-block-engine)

**tmpfs** — RAM-backed filesystem. Used для Alpenglow accountsDB. [Module 6.3](/module-6/3-accountsdb)

**tmux** — terminal multiplexer. Persistent sessions surviving SSH disconnect. [Module 0.7](/module-0/7-tmux)

**Token account** — SPL Token account holding balance. Owned by SPL Token Program. [Module 2.4](/module-2/4-tokens-ata)

**Token-2022** — newer SPL token standard з extensions support. [Module 2.6](/module-2/6-token-2022)

**Token extensions** — Token-2022 opt-in features per token. [Module 2.6](/module-2/6-token-2022)

**Tower** — Tower BFT's per-validator vote stack (max 32 deep). [Module 4.2](/module-4/2-tower-bft)

**Tower BFT** — Solana's current mainnet consensus algorithm. PBFT + PoH variant. [Module 4.2](/module-4/2-tower-bft)

**Tower file** — validator's local tower (vote history) у `~/.solana/tower-N.bin`. Delete before restore avoid double-sign. [Module 4.6](/module-4/6-slashing-deep)

**TPU (Transaction Processing Unit)** — validator's incoming TX path. [Module 6.1](/module-6/1-tpu)

**Transaction (TX)** — atomic unit of execution. Max 1232 bytes. [Module 3.1](/module-3/1-tx-anatomy)

**Transfer fees** — Token-2022 extension taking % per transfer. [Module 2.6](/module-2/6-token-2022)

**Transfer hooks** — Token-2022 extension running custom program per transfer. [Module 2.6](/module-2/6-token-2022)

**Transient stake** — stake у activating/deactivating state. Restricts split/merge. [Module 7.6](/module-7/6-stake-split-merge)

**Triton One** — major Solana RPC provider, low-latency focus. Yellowstone Geyser framework. [Module 10.1](/module-10/1-geyser-rpc)

**TSDB** — Time-Series Database. Prometheus uses TSDB для metrics storage. [Module 8.8](/module-8/8-monitoring-stack)

**Tunnel (DZ)** — DoubleZero virtual tunnel між validator і DZ network. [Module 10.3](/module-10/3-doublezero)

**Turbine** — Solana's block propagation protocol. Hierarchical tree multicast. [Module 5.2](/module-5/2-turbine)

**Turbine tree** — per-slot dynamically built tree для shred distribution. [Module 5.2](/module-5/2-turbine)

**TVU (Transaction Validation Unit)** — validator's incoming blocks path. [Module 6.2](/module-6/2-tvu)

**TX forwarding** — non-leader validator forwards received TXs до current/upcoming leaders. [Module 6.1](/module-6/1-tpu)

## U

**ulimits** — per-user resource limits (file descriptors, processes). Critical для validator. [Module 8.6](/module-8/6-kernel-tuning)

**Unstaked identity** — temporary junk keypair used by standby validator. No stake associated. Cannot accidentally vote. [Module 11.5](/module-11/5-identity-management)

**Unit file** — systemd service config. [Module 0.4](/module-0/4-processes)

**Upgrade authority** — key able to redeploy BPF program code. Set to None = immutable. [Module 2.2](/module-2/2-programs)

## V

**Validator** — node з vote account + stake що бере участь у consensus. [Module 1.1](/module-1/1-cluster)

**Validator Admission Ticket (VAT)** — Alpenglow-specific: 1.6 SOL/epoch required для participation. [Module 4.4](/module-4/4-alpenglow)

**Validator rewards** — operator income: inflation share + fees + Jito tips. [Module 7.2](/module-7/2-rewards)

**Vault account** — Squads multisig PDA holding funds. [Module 8.7](/module-8/7-treasury-multisig)

**V0 transaction** — Versioned transaction format (default since 2023). [Module 3.5](/module-3/5-versioned-tx-alts)

**Vote account v4** — vote account format version including BLS pubkey field (per SIMD-0185). [Module 11.7](/module-11/7-joining-cluster)

**vote_history.bin** — Alpenglow's local vote history file. Equivalent до Tower's tower.bin але stricter requirements. [Module 11.4](/module-11/4-vote-history)

**Vote participation proof** — Alpenglow accountability mechanism: leader at slot N+8 includes vote aggregate from slot N. Non-voters get zero rewards. [Module 11.2](/module-11/2-votor-consensus)

**Vote reconstruction** — Tower BFT ability to rebuild tower.bin state from on-chain vote TXs. NOT possible у Alpenglow (votes off-chain). [Module 11.4](/module-11/4-vote-history)

**VoteHistory** — internal Rust struct у Alpenglow agave fork for vote history data. Persisted у vote_history.bin file. [Module 11.4](/module-11/4-vote-history)

**Voter bitmap** — у Alpenglow certificates, bitmap showing які validators contributed votes. Used для accountability + rewards. [Module 11.2](/module-11/2-votor-consensus)

**VoterWithBLS** — new VoteAuthorize instruction variant для registering BLS pubkey. SIMD-0387. [Module 11.7](/module-11/7-joining-cluster)

**Votor** — Alpenglow's voting + finalization component. Replaces Tower BFT. Two-round voting з BLS aggregation. [Module 11.2](/module-11/2-votor-consensus)

**Versioned transaction** — TX format supporting ALTs. V0 currently. [Module 3.5](/module-3/5-versioned-tx-alts)

**Vote authority** — key permitting sign vote TXs. Hot key on validator server. [Module 4.3](/module-4/3-votes-credits)

**Vote credit** — Tower BFT: 1 per successful vote landed. Alpenglow: lamport reward. [Module 4.3](/module-4/3-votes-credits)

**VRF (Verifiable Random Function)** — cryptographic randomness function. Used у leader schedule. [Module 1.3](/module-1/3-leaders)

**VRF (Switchboard)** — verifiable random number service на Solana. [Module 10.7](/module-10/7-oracles)

## W

**wait-for-restart-window** — `agave-validator` subcommand blocking until safe to restart. [Module 8.4](/module-8/4-upgrade-safety)

**Warmup** — stake state коли activating. [Module 1.2](/module-1/2-slots-epochs)

**Window (tmux)** — full-screen terminal у tmux session. [Module 0.7](/module-0/7-tmux)

**Withdrawer authority** — vote/stake account control key. **Critical**. Cold storage mandatory mainnet. [Module 4.3](/module-4/3-votes-credits)

**Working tree (git)** — current files у repo на disk. [Module 0.2](/module-0/2-git)

**WSL** — Windows Subsystem для Linux. WSL2 — full Linux kernel у Hyper-V VM. [Module 0.9](/module-0/9-wsl-windows)

## Y

**Yellowstone** — Triton One's gRPC streaming framework для Geyser. [Module 10.1](/module-10/1-geyser-rpc)

## Z

**zstd** — fast compression algorithm. Used для Solana snapshots. [Module 10.2](/module-10/2-snapshots)

## Numbers / symbols

**20+20 security model** — Alpenglow safety model: tolerates 20% byzantine + 20% crashed validators (40% combined fault tolerance). [Module 11.2](/module-11/2-votor-consensus)

---

_~290 terms (з Module 11 expansion). Updates з each module/section addition._
