<script setup>
const quiz = {
  id: 'm11-final',
  title: '⭐ Module 11 — Final quiz',
  intro: '15 питань — Alpenglow operations synthesis. 80%+ for mastery.',
  questions: [
    {
      type: 'mcq',
      q: 'Які components Alpenglow заміняє у current Solana?',
      options: ['Tower BFT', 'Turbine', 'Proof of History', 'SPL Token Program'],
      correct: [0, 1, 2],
      explanation: 'Consensus + propagation + clock. SPL Token unchanged. Module 11.1.'
    },
    {
      type: 'compare',
      q: 'Tower BFT vs Votor — основні differences.',
      ideal: 'Tower BFT: on-chain vote TXs, Ed25519 signatures, lockout chain до 12.8s finality, 33% byzantine threshold. Votor: off-chain BLS aggregated votes, 60/80% thresholds, 100-150ms finality, 20+20 security model (20% byzantine + 20% crashed = 40% combined tolerance). Module 11.2.',
      explanation: ''
    },
    {
      type: 'order',
      q: 'Votor slot lifecycle (Fast-Finalization path):',
      items: [
        'Leader produces block at slot N',
        'Block propagates via Rotor',
        'Validators replay TXs, decide vote',
        'Each broadcasts notarize vote (BLS)',
        '≥80% notarize → Fast-Finalization cert',
        'Slot finalized, ancestors automatic'
      ],
      correctOrder: [0, 1, 2, 3, 4, 5],
      explanation: 'Module 11.2.'
    },
    {
      type: 'compare',
      q: 'Turbine vs Rotor architectural differences.',
      ideal: 'Turbine: hierarchical tree multicast, data + parity shreds separate, complex per-slot tree construction.\n\nRotor: single-hop relay (no tree), single erasure-coded shred format, stake-weighted relay selection, multicast network compatible (DoubleZero).\n\nResult: simpler, faster, lower latency. ~50ms target vs 80-100ms Turbine. Module 11.3.',
      explanation: ''
    },
    {
      type: 'mcq',
      q: 'vote_history.bin missing на Alpenglow validator. What happens?',
      options: [
        'Refuses to start by default',
        'Requires --do-not-require-vote-history flag override',
        'Bypassing risks double-vote (slashable у future)',
        'Tower BFT-style reconstruction kicks in'
      ],
      correct: [0, 1, 2],
      explanation: 'No Tower reconstruction — no on-chain vote TXs to reconstruct from. Module 11.4.'
    },
    {
      type: 'explain',
      q: 'Чому Alpenglow stricter than Tower regarding vote history file?',
      ideal: 'Tower: vote TXs on-chain → reconstruction from chain history possible if tower.bin missing. Imperfect but resilient safety net.\n\nAlpenglow: votes off-chain (BLS aggregation). Individual vote messages не persist after aggregation. Only certificates anchor on-chain. No source of truth for reconstruction.\n\nResult: vote_history.bin = single source of truth. Loss = either downtime or risky --do-not-require-vote-history bypass. Module 11.4.',
      explanation: ''
    },
    {
      type: 'explain',
      q: 'Identity symlink pattern — purpose + structure.',
      ideal: 'Pattern: --identity flag у validator config points to symbolic link (/home/sol/identity.json). Symlink target switches between staked-identity.json (active) and unstaked-identity.json (standby).\n\nWhy foundational:\n1. Validator config never changes (just symlink target)\n2. Atomic identity switch (ln -sf is atomic at FS level)\n3. Standby з unstaked identity can\'t accidentally vote (no stake)\n4. Same setup на both servers enables symmetric hot-swap\n5. set-identity command + symlink update = sub-second swap\n\nWithout this pattern, identity changes require validator restart + config edits. Symlink pattern enables true hot-swap. Module 11.5.',
      explanation: ''
    },
    {
      type: 'mcq',
      q: 'Failover patterns comparison (general):',
      options: [
        'Pattern A (Anza manual): 10-30s, no automation, ideal solo',
        'Pattern D (SVS): 1-3s, automated dashboard, ideal teams',
        'Pattern E (SOL-Strategies): QUIC peer-to-peer, dry-run mode',
        'All patterns identical у speed and complexity'
      ],
      correct: [0, 1, 2],
      explanation: 'Patterns differ significantly. Module 11.6.'
    },
    {
      type: 'compare',
      q: 'Manual vs automated failover tradeoffs.',
      ideal: 'Manual (Anza, Pumpkin patterns):\n+ Full control, predictable\n+ No additional software\n+ Easier debugging\n- 5-30s swap time\n- Requires operator 24/7\n- Human error risk\n- No disaster detection\n\nAutomated (SVS, SOL-Strategies):\n+ 1-3s swap time\n+ Automatic disaster detection\n+ Multi-validator dashboards\n+ Built-in rollback\n- Software dependency\n- Configuration complexity\n- Tool bugs могут cause issues\n- Maintenance overhead\n\nDecision: small operator з 1 validator = manual sufficient. Medium-large operators з multiple validators = automated essential. Module 11.6.',
      explanation: ''
    },
    {
      type: 'mcq',
      q: 'SIMD-0387 BLS pubkey registration requirements:',
      options: [
        'Generate BLS keypair (any derivation method)',
        'Create Proof-of-Possession signature (96 bytes)',
        'Submit via VoteAuthorize з VoterWithBLS variant',
        'Vote account upgrades to v4 per SIMD-0185'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'All four required для valid BLS registration. Module 11.7.'
    },
    {
      type: 'compare',
      q: 'In-genesis vs out-of-genesis cluster joining.',
      ideal: 'In-genesis:\n- Validator included у cluster initial setup\n- Ready to vote from slot 0\n- Requires application/coordination з organizer\n- Pubkeys + stake amounts agreed beforehand\n- Smoother experience\n\nOut-of-genesis:\n- Validator joins after cluster live\n- Must catch up з existing chain state\n- Build software, fetch snapshot, sync\n- Create vote account з BLS pubkey post-launch\n- Acquire stake (self-stake or delegate)\n- Wait epoch boundary activation\n- More steps but standard для late joining\n\nBoth valid paths. In-genesis preferred when possible (less complexity). Module 11.7.',
      explanation: ''
    },
    {
      type: 'mcq',
      q: 'Current state slashing on Solana (2026-06):',
      options: [
        'Conditions defined у protocol, NOT actively enforced',
        'Social punishment only (SFDP removal, pool withdrawal)',
        'SIMD-0204 introduces observational layer first',
        'Already automatic stake destruction operational'
      ],
      correct: [0, 1, 2],
      explanation: 'Implementation у progress. Module 11.8.'
    },
    {
      type: 'mcq',
      q: 'Proposed quadratic penalty formula:',
      options: [
        '< 1% stake involved: no penalty',
        '4.66% violation: ~1.2% slash',
        '≥ 33% stake: up to 100% penalty',
        'Encourages independent infrastructure (avoid correlated failures)'
      ],
      correct: [0, 1, 2, 3],
      explanation: 'Quadratic scaling rewards diversification. Module 11.8.'
    },
    {
      type: 'order',
      q: 'Alpenglow community cluster restart phases:',
      items: [
        'Backup keypairs (validator + vote + stake)',
        'Stop validator + wipe ledger completely',
        'Update software if new version required',
        'Get new genesis hash, shred_version, entrypoints',
        'Update systemd unit з new params',
        'Start validator + fetch snapshot + catch up',
        'Re-create vote account (if out-of-genesis) + acquire stake',
        'Verify voting + monitor logs'
      ],
      correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
      explanation: 'Standard restart sequence. Module 11.9.'
    },
    {
      type: 'explain',
      q: 'Чому участь у Alpenglow community cluster valuable for mainnet operators?',
      ideal: 'Benefits operating community cluster:\n\n1. Learn operational patterns before mainnet activation — Alpenglow differs significantly from Tower BFT\n2. Build muscle memory с new commands, flags, file formats\n3. Encounter failure modes у low-stakes environment\n4. Contribute bug reports → help Anza prepare for mainnet\n5. Build reputation у Anza community\n6. Test failover tools з Alpenglow compatibility\n7. Develop monitoring + alerting workflows\n\nMainnet activation (Q3 2026 target) will require operational pivot. Operators з community cluster experience pre-prepared:\n- vote_history.bin handling familiar\n- set-identity flags understood\n- Active-standby setup tested\n- BLS pubkey registration workflow practiced\n- Cluster restart procedures known\n\nCost = small (hardware + time). Value = operational readiness. Module 11.9.',
      explanation: ''
    }
  ]
}
</script>

# ⭐ Module 11 — Final quiz

15 питань що synthesize всі 9 секцій. 80%+ correct = strong understanding Alpenglow operations.

## Як проходити

- **No peeking**: don't reference module sections during quiz
- **Self-grade honestly**: для explain/compare questions, mark accurately
- **Mid-quiz break OK**: localStorage saves progress
- **Target 12+/15** (80%+)

## Quiz

<Quiz :data="quiz" />

## Результат

| Score | What next |
|---|---|
| **13-15 / 15** | Mastery achieved. Ready for mainnet Alpenglow operations when activation happens. |
| **10-12 / 15** | Review sections з помилками, re-take |
| **< 10 / 15** | Re-read module fully, focus on sections 4-6 (critical operational concepts) |

## Що далі

Курс completed! 12 modules covered:

- Module 0: Dev/sysadmin fundamentals
- Module 1: Solana foundations
- Module 2: Account model
- Module 3: Transactions
- Module 4: Consensus
- Module 5: Networking
- Module 6: Validator internals
- Module 7: Stake & rewards
- Module 8: Operations security
- Module 9: CLI deep dive
- Module 10: Special topics
- **Module 11: Alpenglow operations deep dive** ⭐

Recommended next steps:

1. **Apply knowledge**: practice на community cluster or testnet
2. **Track upgrades**: monitor Anza Discord, SIMD repo
3. **Build infrastructure**: implement failover pattern of choice
4. **Document procedures**: write team runbooks based на patterns learned
5. **Re-take quizzes**: quarterly for retention
6. **Share knowledge**: help other operators learn

---

**Попередньо:** [← 9. Cluster operations](/module-11/9-cluster-operations) | **Course start:** [Home](/)
