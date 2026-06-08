<script setup>
const quiz = {
  id: 'm6-5-firedancer',
  title: '🧠 Mini-check: Firedancer',
  intro: '2 питання.',
  questions: [
    {
      type: 'compare',
      q: 'Agave (Rust) vs Firedancer (C)?',
      ideal: 'Agave — Solana\'s original/primary validator client. Rust-based. Maintained by Anza. Most validators use це. Battle-tested mainnet.\n\nFiredancer — alternative client written from scratch by Jump Crypto. C language (some Rust components, "Frankendancer" hybrid у production transition phase). Massive performance focus.\n\nKey differences:\n1. Language: Rust vs C — different memory safety models\n2. Architecture: Firedancer extremely modular, separate processes per stage (banking, sigverify, broadcast)\n3. Performance: Firedancer benchmarks 100k+ TPS у lab (vs agave 3-5k mainnet effective)\n4. Networking: Firedancer custom QUIC implementation, kernel-bypass\n5. Maturity: Agave production-stable. Firedancer transitioning ("Frankendancer" partial deployment, full Firedancer coming)\n\nWhy matters: client diversity = network resilience. Якщо all run agave і agave bug — cluster halts. Multi-client (agave + firedancer) = independent code paths catch issues.\n\nGoal: ~50% mainnet running each client eventually.',
      explanation: 'Module 6.5.'
    },
    {
      type: 'mcq',
      q: 'Як LumLabs має думати про Firedancer adoption?',
      options: [
        'Wait для production-ready Firedancer release',
        'Test на testnet ascolto coли available',
        'Гibrid: production mainnet on agave, testnet experimentation с Frankendancer',
        'Immediately switch all validators до Firedancer'
      ],
      correct: [0, 1, 2],
      explanation: 'Conservative approach. Immediate switch risky. Module 6.5.'
    }
  ]
}
</script>

# 5. Firedancer (alternative validator client)

## TL;DR

**Firedancer** — alternative Solana validator client written from scratch by Jump Crypto. Written у C (with some Rust components). Goal: massive performance improvement + network client diversity. Currently transitioning до production через "Frankendancer" hybrid phase.

## Чому Firedancer

Solana initially had **single validator implementation** (agave/solana-labs Rust). Single client risks:

1. **Bugs cascade**: agave bug crashes entire mainnet (як cluster halts during 2022-2023 incidents)
2. **Performance ceiling**: agave optimized but bounded by Rust + design choices
3. **Centralization risk**: depends on Anza team velocity

**Multi-client networks** (e.g., Ethereum has Geth, Nethermind, Erigon, Besu, Reth) — resilience через diversity. One bug у one client doesn't kill whole network.

Solana adopting same model: agave + Firedancer (плюс potentially others).

## Jump Crypto contribution

[Jump Crypto](https://jumpcrypto.com/) — trading firm з high-frequency expertise. Built Firedancer leveraging deep network/performance knowledge.

Design goals:

1. **Massive performance**: 1M+ TPS у lab benchmarks (vs ~5k mainnet effective)
2. **Modularity**: separate processes per stage (no shared state = fewer race conditions)
3. **Custom networking**: kernel-bypass QUIC, AF_XDP
4. **Memory safety**: even у C, через rigorous architecture
5. **Compatibility**: behave identically до agave consensus-wise

## Architecture differences

| Aspect | Agave | Firedancer |
|---|---|---|
| Language | Rust | C (+ some Rust) |
| Process model | Single process, many threads | Multi-process, IPC через shared memory |
| Networking | tokio QUIC | Custom kernel-bypass QUIC |
| Memory | Standard Rust | Hugepages, NUMA-aware |
| Sigverify | Tokio threads / GPU | AVX-512 optimized, dedicated process |
| Banking | Single process | Dedicated process |

Firedancer's multi-process architecture isolates failures: якщо sigverify process crashes, validator still alive (restart that process).

## Frankendancer transition

Full Firedancer deployment takes time. Interim solution: **Frankendancer** — hybrid:

- Replace high-perf components з Firedancer (sigverify, networking, banking)
- Keep agave's consensus, storage у production
- Gradual replacement of agave components

Current status (як 2026): Frankendancer testnet active, mainnet trials underway. Full standalone Firedancer expected 2026-2027.

## Validator client diversity importance

Solana long-term goal: **~50% agave + ~50% Firedancer** (плюс possibly others).

Benefits:

- **Bug isolation**: agave bug → Firedancer validators unaffected → cluster continues
- **Performance competition**: forces both teams optimize
- **Decentralization**: not depending на single development team
- **Resilience**: vendor lock-in eliminated

Currently mainnet ~99% agave (older deployment). Firedancer rolling out gradually.

## Operator considerations

### Should you run Firedancer?

**Wait pattern (recommended for now)**:
1. Production mainnet: agave (battle-tested, stable)
2. Testnet: experiment з Frankendancer when available
3. Once Firedancer mainnet-stable (~2027): consider migration

**Aggressive adopt**: only якщо ти OK з cutting-edge risk. Performance gains real, but stability TBD.

### Migration considerations

If switching:
- Backup keypairs (always)
- Test thoroughly testnet first
- Run в parallel (one Firedancer, one agave) for comparison period
- Plan rollback path
- Monitor closely first 1-2 months

### Operational differences

Firedancer:
- Different systemd configuration
- Different CLI tools (some compatibility з solana CLI)
- Different log formats
- Different metrics naming (Prometheus integration)

Documentation: [firedancer-io.github.io](https://firedancer-io.github.io/firedancer/) (Jump Crypto's docs).

## Connect to your work

For LumLabs:

- **Now**: stick з agave mainnet
- **Track**: Firedancer development через Discord, Twitter
- **Plan**: test на Alpenglow або dedicated testnet 2026-2027
- **Decision time**: full Firedancer production-ready (likely 2027)

Switching one validator до Firedancer = independent decision per validator. Some operators run mix (some validators agave, some Firedancer).

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Firedancer`](/glossary#f), [`Frankendancer`](/glossary#f), [`Jump Crypto`](/glossary#j), [`Client diversity`](/glossary#c), [`AVX-512`](/glossary#a), [`Kernel-bypass`](/glossary#k)

## External refs

- [Firedancer documentation](https://firedancer-io.github.io/firedancer/)
- [Jump Crypto Firedancer announcement](https://jumpcrypto.com/firedancer/)
- [Firedancer GitHub](https://github.com/firedancer-io/firedancer)

---

**Попередньо:** [← 4. Banking & replay](/module-6/4-stages)
