# Module 11 — Alpenglow operations deep dive

> **TL;DR.** Comprehensive обладнання у Alpenglow (SIMD-0326) — protocol що замінить Tower BFT на Solana mainnet (target Agave 4.1, Q3 2026). Module covers consensus mechanics, identity management, failover patterns (5 industry-standard approaches), slashing implications, cluster operations.

> **Цей модуль для:** operators які прагнуть **зрозуміти Alpenglow глибоко** — не тільки що команди запускати, але **чому** і **які implications** для архітектури. Будувати на знаннях з Module 4.4 (Alpenglow overview) + Module 8 (operations).

## Чому окремий module

Alpenglow — не "минор зміна". Це **complete consensus rewrite**:

| Aspect | Tower BFT | Alpenglow |
|---|---|---|
| Voting | On-chain TXs з lockouts | Off-chain BLS aggregation |
| Finality | 12.8 сек | 100-150 мс |
| Vote fees | ~1 SOL/day/validator | ~0 (replaced by VAT) |
| Failover safety | Tower.bin best-effort reconstruct | **Strict** vote_history.bin requirement |
| Slashing | Defined, not enforced | Stricter conditions, enforcement coming |

Operating Alpenglow vs operating Tower BFT — **different mental models**. Цей module connects pieces.

## Секції

| # | Тема | Час | Status |
|---|---|---|---|
| 1 | [Alpenglow context — history, governance, timeline](/module-11/1-context) | 25-30 хв | ✅ |
| 2 | [Votor — two-round voting protocol deep](/module-11/2-votor-consensus) | 40-50 хв | ✅ |
| 3 | [Rotor — block propagation redesign](/module-11/3-rotor-propagation) | 25-30 хв | ✅ |
| 4 | [Vote history & state management](/module-11/4-vote-history) | 35-40 хв | ✅ ⚠️ |
| 5 | [Identity management & hot-swap](/module-11/5-identity-management) | 35-40 хв | ✅ ⚠️ |
| 6 | [Failover patterns — 5 industry approaches](/module-11/6-failover-patterns) | 50-60 хв | ✅ ⚠️ |
| 7 | [Joining cluster — BLS keys (SIMD-0387)](/module-11/7-joining-cluster) | 30-35 хв | ✅ |
| 8 | [Slashing landscape — current + future](/module-11/8-slashing) | 25-30 хв | ✅ |
| 9 | [Cluster operations — restart, monitoring, governance](/module-11/9-cluster-operations) | 30-40 хв | ✅ |
| ⭐ | [Final quiz](/module-11/final-quiz) | 30 хв | ✅ |

**⚠️ — operationally critical sections.** Sections 4-6 deserve focused attention; they cover the differences що матимуть найбільший impact на validator infrastructure architecture.

**Загальний час: 5-6 годин.**

## Що ти будеш знати після

- Як Votor 2-round voting працює (notarize/skip/finalize паттерни)
- Чому Alpenglow stricter за Tower щодо vote history файлу
- Які 5 industry-standard failover patterns існують + tradeoffs кожного
- Як зареєструвати BLS pubkey у vote account (SIMD-0387 workflow)
- Що відбувається з slashing коли SIMD-0204 lands + Alpenglow stricter conditions
- Як cluster restart procedure differs від Tower BFT mainnet

## Prerequisites

Перш ніж читати:
- [Module 4 — Consensus](/module-4/) — base concepts (Tower BFT, votes, lockouts)
- [Module 4.4 — Alpenglow overview](/module-4/4-alpenglow) — initial Alpenglow intro
- [Module 7 — Stake & rewards](/module-7/) — how rewards distribute
- [Module 8 — Operations security](/module-8/) — keypair hygiene, backups

Якщо ці модулі не пройдені — повернись спочатку до них.
