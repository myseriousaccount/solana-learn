# Module 0 — Dev & sysadmin fundamentals

> **TL;DR.** Solana validator operations це **80% sysadmin/dev fundamentals + 20% Solana-specific**. Цей модуль — fundamentals: як з source code робиться binary, як git трекає зміни, як cargo білдить Rust код, як Linux запускає daemons, як shell виконує команди, як SSH передає тебе на сервер. Без цього validator ops — magic incantations. З цим — ти розумієш **чому** кожна команда у твоєму cheatsheet виглядає саме так.

> **Як читати цей модуль.** Це **довідник**, не лінійний курс. Можна читати послідовно, можна стрибати у потрібну секцію. Якщо при роботі з пізнішими модулями зустрінеш термін з Module 0 — повернись сюди. У [глосарії](/glossary) кожен термін має посилання на секцію.

## Секції

| # | Тема | Час | Status |
|---|---|---|---|
| 1 | [Build process](/module-0/1-build) | 30-40 хв | ✅ |
| 2 | [Git](/module-0/2-git) | 30-40 хв | ✅ |
| 3 | [Cargo / Rust](/module-0/3-cargo) | 30-40 хв | ✅ |
| 4 | [Linux processes & daemons](/module-0/4-processes) | 30-40 хв | ✅ |
| 5 | [Filesystem & permissions](/module-0/5-filesystem) | 30-40 хв | ✅ |
| 6 | [Shell mechanics](/module-0/6-shell) | 30-40 хв | ✅ |
| 7 | [tmux](/module-0/7-tmux) | 15-20 хв | ✅ |
| 8 | [SSH](/module-0/8-ssh) | 25-35 хв | ✅ |
| ⭐ | [Final quiz](/module-0/final-quiz) | 30 хв | ✅ |

**Загальний час Module 0: 4-5 годин концентрованого вивчення.**

## Як проходити

1. Читай секцію (30-40 хв)
2. Запусти hands-on exercises на твоєму сервері (read-only)
3. Пройди mini-quiz у кінці секції (2-3 питання)
4. Через 5-10 хв перерви — наступна секція
5. У кінці модуля — final quiz (15 питань, ~30 хв)

Якщо final quiz <80% — повернись у секції з найбільшими прорахунками.
