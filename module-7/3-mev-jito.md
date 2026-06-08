<script setup>
const quiz = {
  id: 'm7-3-mev-jito',
  title: '🧠 Mini-check: MEV/Jito',
  intro: '2 питання.',
  questions: [
    {
      type: 'explain',
      q: 'Що таке MEV і як Jito extracts value для validators?',
      ideal: 'MEV (Maximum Extractable Value) — value extractable from ordering/inclusion/exclusion TXs у blocks. Examples:\n- Arbitrage between DEXes\n- Liquidations\n- Front-running\n- Sandwich attacks\n\nJito mechanism:\n1. Searchers (algorithmic traders) discover MEV opportunities, build bundles (multiple TXs that should execute together)\n2. Searchers submit bundles до Jito\'s block engine, paying tips\n3. Block engine forwards bundles до Jito-relay\n4. Jito-Solana validator includes bundles у its blocks (instead of mempool ordering)\n5. Validator earns tips від bundles (50% goes to validator, 50% to stakers/delegators)\n\nJito-Solana — fork agave with MEV functionality. Validators run Jito client замість vanilla agave. Tips паралельно до inflation rewards.\n\nMainstream mainnet: ~50%+ stake on Jito-Solana. LumLabs eligible BAM validator (per memory).',
      explanation: 'Module 7.3.'
    },
    {
      type: 'mcq',
      q: 'BAM (Block Assembly Marketplace, JIP-37/JIP-31):',
      options: [
        'Jito\'s permissioned block-building marketplace',
        'Eligible validators receive subsidy + tips з BAM block builders',
        'LumLabs eligible mainnet BAM validator',
        'Replaces SFDP delegation program'
      ],
      correct: [0, 1, 2],
      explanation: 'BAM separate from SFDP. JIP-31/37 cash subsidy (ended Sept 30 2026), JIP-28 ongoing JitoSOL delegation. Module 7.3.'
    }
  ]
}
</script>

# 3. MEV, Jito, BAM

## TL;DR

**MEV** (Maximum Extractable Value) — value витягувана з ordering TXs у block. **Jito** — most popular MEV system on Solana, fork agave validator with MEV functionality. **BAM** (Block Assembly Marketplace) — Jito's permissioned block-building marketplace, key revenue stream for eligible validators.

## MEV

MEV = profit з smart TX ordering у block. Sources:

| MEV type | Description |
|---|---|
| **Arbitrage** | Buy low on one DEX, sell high на іншому у same block |
| **Liquidations** | Liquidate underwater loans before others |
| **Backruns** | Trade after large swaps (price impact opportunities) |
| **Frontrunning** | Insert TX before pending big TX |
| **Sandwich** | Frontrun + backrun same target TX |

MEV exists on every chain. Question — як to manage (extract for validators? prevent? democratize?).

## Jito-Solana

**Jito Labs** — team що creates MEV infrastructure для Solana. Their flagship:

- **Jito-Solana validator client**: fork agave з MEV functionality. Validators run це instead of vanilla agave.
- **Block engine**: simulates blocks with included bundles, picks best paying
- **Jito-relay**: receives bundles від searchers, forwards до validators
- **JitoSOL**: liquid staking token

### Bundle flow

```
Searcher discovers MEV → builds bundle (multiple TXs) → submits to Jito relay with tip
                              ↓
                    Block engine simulates, picks best paying bundles
                              ↓
                    Forwards до Jito-Solana validator (current leader)
                              ↓
                    Validator includes bundle у block
                              ↓
                    Tips paid to validator (50% operator, 50% stakers)
```

### Income for validators

Validator running Jito-Solana earns:
- Standard rewards (inflation + base fees)
- **+ Jito tips** від MEV bundles

Tips on mainnet — often 10-30% of validator income (significant addition).

## BAM (Block Assembly Marketplace)

**BAM** — Jito's permissioned marketplace для block building. Approved block builders (e.g., institutional traders, sophisticated MEV teams) submit blocks → eligible validators include.

Key differences від base Jito:
- **Permissioned**: only approved builders (anti-spam, quality control)
- **More sophisticated**: full block templates with optimal ordering
- **Higher tips**: BAM builders typically pay більше per block

### JIP-37 / JIP-31 subsidy

З memory `jito_bam_subsidy_jip_37.md`:

- **JIP-31/37**: cash subsidy program. **Hard cutoff Sept 30, 2026.**
- **JIP-28**: ongoing JitoSOL delegation. 100% tier active.

LumLabs eligible BAM mainnet validator (per memory). Requirements:
- Run Jito-Solana
- Run BAM stack components
- Meet performance thresholds
- Other criteria per Jito governance

## Connect to your work

### Mainnet validator running Jito

Якщо LumLabs mainnet validator running Jito-Solana — earns standard rewards + Jito tips. Sigificant income стрім.

```bash
# Check version (Jito vs agave)
sudo /home/solana/ag/bin/agave-validator --version
# Якщо Jito-Solana — version mentions "jito" або specific build
```

### BAM setup на mainnet

З BAM JIP requirements (per memory `jito_bam_subsidy_jip_37.md`):
- Run BAM stack
- Configure shred publisher rewards (DoubleZero integration на eta — це і є та config ти робила 2026-06-08)
- Maintain performance

### Discussion context 2026-05-25

Ти писала Twitter thread про JIP-37 (per memory feedback). Discussion period для governance proposal. Need to attribute carefully ("Jito announced...", не "we announced").

## Hands-on

```bash
# Check Jito tips received (на mainnet validator)
# Tips go to validator identity wallet as regular SOL transfers
sudo solana transaction-history YOUR_MAINNET_IDENTITY --url mainnet-beta | head -20

# Stakewiz validator detail page shows Jito tips received
# https://stakewiz.com/validator/YOUR_VOTE_PUBKEY
```

## Mini-quiz

<Quiz :data="quiz" />

## Glossary

[`MEV`](/glossary#m), [`Jito`](/glossary#j), [`Jito-Solana`](/glossary#j), [`Bundle`](/glossary#b), [`Searcher`](/glossary#s), [`Block engine`](/glossary#b), [`BAM`](/glossary#b), [`JIP-37`](/glossary#j), [`JitoSOL`](/glossary#j)

## External refs

- [Jito Foundation](https://www.jito.network/)
- [Jito documentation](https://docs.jito.network/)
- [BAM docs](https://docs.jito.network/bam)

---

**Попередньо:** [← 2. Rewards](/module-7/2-rewards) | **Наступне:** [4. SFDP & pools →](/module-7/4-sfdp-pools)
