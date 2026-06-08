# Module 2 — Account model

> **TL;DR.** Solana все є **account**: твій SOL wallet, smart contract code, NFT, token holdings, vote state. Це **єдина універсальна абстракція** через яку state виражається. Розуміти account model = розуміти як data живе на Solana і як transactions з нею взаємодіють.

## Секції

| # | Тема | Час | Status |
|---|---|---|---|
| 1 | [Account basics (anatomy)](/module-2/1-account-basics) | 30-40 хв | ✅ |
| 2 | [Programs as accounts](/module-2/2-programs) | 30 хв | ✅ |
| 3 | [Rent and rent-exempt](/module-2/3-rent) | 25-30 хв | ✅ |
| 4 | [Token accounts & ATA](/module-2/4-tokens-ata) | 30-40 хв | ✅ |
| ⭐ | [Final quiz](/module-2/final-quiz) | 25 хв | ✅ |

**Загальний час Module 2: 2-3 години.**

## Що ти будеш знати після

- Що accounts містять (lamports, owner, data, executable flag)
- Чим program account відрізняється від data account
- Як працює rent і чому "rent-exempt" — це must
- Що таке Associated Token Account (ATA) і чому ATA ≠ wallet (важливо для DoubleZero rewards config)
- Як читати output `solana account <PUBKEY>` і розуміти кожне поле
