<script setup>
const quiz = {
  id: 'm10-4-governance',
  title: '🧠 Mini-check: Governance',
  intro: '2 питання.',
  questions: [
    {
      type: 'compare',
      q: 'SIMD vs JIP — у чому різниця?',
      ideal: 'SIMD (Solana Improvement Document): Solana Foundation governance proposals. Cluster-wide protocol changes. Examples: SIMD-0326 (Alpenglow consensus), other consensus/runtime changes. Affects entire Solana cluster.\n\nJIP (Jito Improvement Proposal): Jito DAO governance. Jito-specific features. Examples: JIP-37 (BAM subsidy), JIP-28 (JitoSOL delegation), etc. Affects only Jito system + validators using Jito-Solana.\n\nDifferent scopes:\n- SIMD: Solana protocol level\n- JIP: Jito application level\n\nBoth follow similar process: proposal → discussion period → vote → implementation if approved. SIMD voted by validators (stake-weighted). JIP voted by JTO token holders.',
      explanation: 'Module 10.4.'
    },
    {
      type: 'mcq',
      q: 'Як LumLabs має writ про governance proposals (per content style memory)?',
      options: [
        'Attribute clearly до source ("Jito announced X", не "we announced")',
        'Avoid imperative voice ("you must do X")',
        'No em-dashes, minimal emoji',
        'Use "we" коли writing про Jito decisions'
      ],
      correct: [0, 1, 2],
      explanation: 'LumLabs external observer, не member Jito team. Module 10.4.'
    }
  ]
}
</script>

# 4. JIPs & SIMD governance

## TL;DR

Solana ecosystem changes through formal governance:
- **SIMD** (Solana Improvement Documents) — Solana Foundation level (protocol changes, e.g., SIMD-0326 Alpenglow)
- **JIP** (Jito Improvement Proposals) — Jito ecosystem level (BAM subsidies, JitoSOL delegation criteria)

Validators participate як stakers і operators — sometimes vote (stake-weighted) на SIMDs, follow JIP impacts.

## SIMD process

1. **Proposal submitted** to [github.com/solana-foundation/solana-improvement-documents](https://github.com/solana-foundation/solana-improvement-documents)
2. **Discussion period** (usually weeks) on GitHub + Discord
3. **Vote** — validators sign-voting via vote TX flag
4. **Implementation** if approved — included у future agave release
5. **Activation** at specific epoch boundary

Examples:
- **SIMD-0326**: Alpenglow consensus protocol (твій community cluster тестує)
- Various runtime improvements, fee changes, etc.

## JIP process

1. **Proposal submitted** to [gov.jito.network](https://gov.jito.network)
2. **Discussion period** (typically 14 days)
3. **Vote on Realms** — JTO token holders vote
4. **Implementation** if approved

Examples:
- **JIP-28**: JitoSOL delegation, 100% tier active, ongoing
- **JIP-31/37**: Cash subsidy для BAM validators, hard cutoff Sept 30 2026

## LumLabs participation

Як validator operator:
- **SIMDs**: monitor для protocol changes affecting validator setup/operation
- **JIPs**: monitor для subsidy/delegation criteria changes
- **Write/comment**: external observer perspective, не Jito/Foundation member

### Content style (per memory)

З `feedback_lumlabs_content_style.md`:

- Attribute source: "Jito announced X" (не "we announced")
- No imperative voice: "you must do X" sounds як authority
- No em-dashes, minimal emoji
- Peer-to-peer voice, not from team з authority

Twitter/blog/Discord content про JIPs/SIMDs має ці rules.

## Where to track

| Source | What |
|---|---|
| github.com/solana-foundation/solana-improvement-documents | All SIMD proposals + discussions |
| gov.jito.network | Jito proposals + voting |
| #governance Discord channels | Discussion |
| Forum.solana.com | Long-form discussion |

## Mini-quiz

<Quiz :data="quiz" />

## Glossary

[`SIMD`](/glossary#s), [`JIP`](/glossary#j), [`Realms`](/glossary#r), [`JTO`](/glossary#j), [`Stake-weighted vote`](/glossary#s)

## External refs

- [SIMD repository](https://github.com/solana-foundation/solana-improvement-documents)
- [Jito Governance](https://gov.jito.network)

---

**Попередньо:** [← 3. DoubleZero](/module-10/3-doublezero) | **Наступне:** [⭐ Final quiz →](/module-10/final-quiz)
