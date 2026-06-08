# Module 1 — Solana foundations

> **TL;DR.** Перший Solana-специфічний модуль. Цілий курс будується на термінах з нього: **cluster**, **slot**, **epoch**, **leader**, **block**, **validator status**. Без цього модуль 4 (Consensus) не зрозуміти, без модуля 4 не зрозуміти що ти моніториш у щоденній роботі. Перший модуль = mental map "що це за система і як вона рухається у часі".

> **Як читати:** послідовно. Кожна секція будується на попередній. Не пропускай — це foundation для всього курсу.

## Секції

| # | Тема | Час | Status |
|---|---|---|---|
| 1 | [Cluster, network types, node kinds](/module-1/1-cluster) | 30-40 хв | ✅ |
| 2 | [Slots, epochs, time на Solana](/module-1/2-slots-epochs) | 30-40 хв | ✅ |
| 3 | [Leader, leader schedule, rotation](/module-1/3-leaders) | 30-40 хв | ✅ |
| 4 | [Block production (produce vs skip)](/module-1/4-block-production) | 30-40 хв | ✅ |
| 5 | [Validator status (voting, delinquent, healthy)](/module-1/5-validator-status) | 30-40 хв | ✅ |
| ⭐ | [Final quiz](/module-1/final-quiz) | 30 хв | ✅ |

**Загальний час Module 1: 3-4 години.**

## Як перевірити що готова до Module 2

Після Module 1 ти маєш знати без підглядання:

- Що таке cluster і чим відрізняються mainnet/testnet/devnet/Alpenglow
- Що таке slot, epoch, скільки слотів в епоці, скільки часу триває epoch
- Як вибирається leader для конкретного slot
- Що значить "validator skipped a slot" і чи це погано
- Як читати output `solana validators` (active vs delinquent stake)
- Що показує `solana epoch-info` і чому це корисно

Final quiz перевіряє все це. **80%+ correct** → Module 2 готовий.

## Чому ця послідовність

1. **Cluster першим** — найвищий рівень, він тримає все інше. Поки не зрозуміла "що таке Solana як мережа" — далі не йдемо
2. **Slots/epochs другим** — як Solana **рухається у часі**. Без цього всі інші концепти (leader rotation, voting, stake epochs) — magic
3. **Leader третім** — slots дають "коли", leader дає "хто". Це core consensus primitive
4. **Block production четвертим** — що **відбувається** у кожен slot. Зв'язує leader + cluster
5. **Validator status п'ятим** — як **тебе** як operator стосується все вище. Voting/delinquent — те що моніториш щодня
