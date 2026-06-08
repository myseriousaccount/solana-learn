---
layout: home

hero:
  name: "Solana Learn"
  text: "Validator operator curriculum"
  tagline: Beginner-friendly, з оригінальною Anza термінологією. Build platform для DevOps які оперують Solana валідатори.
  actions:
    - theme: brand
      text: Почати з Module 0
      link: /module-0/
    - theme: alt
      text: Глосарій
      link: /glossary

features:
  - title: 11 модулів від основ до операцій
    details: Module 0 (dev/sysadmin fundamentals) → 10 Solana-specific модулів. Загалом 18-22 години концентрованого вивчення.
  - title: Hands-on на твоїх серверах
    details: Кожна секція має read-only exercises на реальних кластерах (Alpenglow, mainnet, testnet). Концепти fixуються через практику.
  - title: Розумний quiz після кожної теми
    details: 7 типів питань — MCQ, написання команд, scenario, order, diagnose, compare, explain. Mini-check після кожної секції + final quiz модуля.
  - title: Anza docs як canonical source
    details: Кожен модуль має прямі лінки на docs.anza.xyz. Я даю beginner ramp + переклад жаргону, anza дає глибину.
---

## Як працює курс

1. **Послідовно** від Module 0 до Module 10. Кожен модуль будується на попередніх
2. **Hands-on exercises** на твоїх реальних серверах — не пропускай, без рук концепти не fixуються
3. **Quiz після кожної секції** (mini-check, 2-3 питання) і **final quiz у кінці модуля** (10-15 питань)
4. **Глосарій** [накопичує всі терміни](/glossary) — гортай як зустрічаєш незнайоме

## Quiz типи що змусять думати

| Тип | Як перевіряє |
|---|---|
| **MCQ** з smart distractors | Тонкі різниці між схожими варіантами |
| **Write the command** | Введи команду — нормалізує whitespace, перевіряє точність |
| **Scenario** | "Ти білдиш Х, відбувається Y, твої next 3 кроки?" |
| **Order the steps** | Перетягни кроки у правильний порядок |
| **Diagnose the error** | Лог показує помилку, що пішло не так? |
| **Compare & contrast** | У чому різниця між X і Y |
| **Explain in your words** | Поясни концепт своїми словами |

Progress зберігається у localStorage браузера — можна повернутись.

## Status (з Variant B expansion)

| Модуль | Секцій | Status |
|---|---|---|
| 0. Fundamentals | 9 | ✅ Повний (+WSL/Windows) |
| 1. Solana foundations | 6 | ✅ Повний (+Genesis ceremony) |
| 2. Account model | 6 | ✅ Повний (+PDA deep, +Token-2022) |
| 3. Transactions | 6 | ✅ Повний (+Versioned TX/ALTs, +Durable nonces) |
| 4. Consensus ⭐ | 7 | ✅ Повний (+Slashing deep, +Recent SIMDs) |
| 5. Networking | 5 | ✅ Повний (+QUIC/Fiber) |
| 6. Validator internals | 5 | ✅ Повний (+Firedancer) |
| 7. Stake & rewards | 6 | ✅ Повний (+Jito BE deep, +Stake split/merge) |
| 8. Operations security | 9 | ✅ Повний (+Hardware, +Kernel tuning, +Multisig, +Monitoring stack, +Runbooks) |
| 9. CLI deep dive | 6 | ✅ Повний (+Feature status, +Benchmarking) |
| 10. Special topics | 7 | ✅ Повний (+Snapshot mirror, +Compression NFTs, +Oracles) |

**🎓 Усі 11 модулів. 72 sections total. ~70 mini-quizzes + 11 final quizzes. ~150-term глосарій.**

**Coverage:** ~95% breadth, ~90% depth of Anza docs equivalent + operational practical specifics.
