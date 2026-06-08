<script setup>
const quiz = {
  id: 'm3-final',
  title: '⭐ Module 3 — Final quiz',
  intro: '12 питань — TX synthesis. 80%+ → Module 4 (Consensus, твоя пріоритетна тема).',
  questions: [
    {
      type: 'mcq',
      q: 'Що з цього є частинами Solana TX?',
      options: ['Signatures', 'Account list (pre-declared)', 'Recent blockhash', 'Instructions', 'Gas limit'],
      correct: [0, 1, 2, 3],
      explanation: 'TX = signatures + message (account_keys, blockhash, instructions). Gas limit — Ethereum. Module 3.1.'
    },
    {
      type: 'explain',
      q: 'Чому pre-declared account list у TX так important для Solana?',
      ideal: 'Pre-declared accounts enable Sealevel parallelism. Scheduler читає account lists від pending TXs, визначає які TXs touch disjoint accounts (можна паралель) vs same accounts (sequential). Без pre-declaration scheduler не може safely parallelize — мусив би execute serially. Це fundamental enabler 3000+ TPS Solana throughput, відрізняє від Ethereum dynamic-access model.',
      explanation: 'Module 3.1, 3.2.'
    },
    {
      type: 'mcq',
      q: 'Що з цього вірно про CPI? (обери всі)',
      options: [
        'Program може викликати інший program у тому ж TX',
        'CPI calls counted у TX compute budget',
        'Max depth ~4 levels (anti-recursion)',
        'Cycles (A→B→A) дозволені без обмежень'
      ],
      correct: [0, 1, 2],
      explanation: 'CPI bidirectional дозволений, але limited глибиною ~4 levels. Cycles НЕ дозволені infinitely. Module 3.2.'
    },
    {
      type: 'compare',
      q: 'Writable vs read-only accounts у instruction — у чому різниця і чому matter?',
      ideal: 'Writable: instruction може modify account state (data або lamports). Scheduler treat writable як exclusive lock — тільки одна TX може write до конкретного account at a time.\n\nRead-only: instruction може тільки read. Multiple TXs можуть concurrently read same account (no conflict).\n\nMatter: parallelism scheduling. Якщо TX1 writes X, TX2 also writes X → sequential. Якщо TX1 reads X, TX2 reads X → parallel OK. Якщо TX1 writes X, TX2 writes Y → parallel OK (disjoint).\n\nTagging правильно matter:\n- Over-declare writable (when actually read-only): TX correct але loses parallelization\n- Under-declare writable (declare read-only when actually writes): runtime catches, TX fails',
      explanation: 'Module 3.2.'
    },
    {
      type: 'mcq',
      q: 'TX cost components?',
      options: [
        'Base fee: 5000 lamports per signature',
        'Priority fee: optional pay-per-CU',
        'Rent: для новостворених accounts',
        'Slot fee: pay-per-slot вашою TX active'
      ],
      correct: [0, 1, 2],
      explanation: 'Base + priority + rent. Slot fee не існує. Module 3.3.'
    },
    {
      type: 'command',
      q: 'Як перевірити recent priority fees на mainnet (RPC)?',
      accepts: [
        'curl -X POST https://api.mainnet-beta.solana.com -H "Content-Type: application/json" -d \'{"jsonrpc":"2.0","id":1,"method":"getRecentPrioritizationFees"}\'',
        'curl -X POST https://api.mainnet-beta.solana.com -H "Content-Type: application/json" -d \'{"jsonrpc":"2.0","method":"getRecentPrioritizationFees"}\''
      ],
      ideal: 'curl -X POST https://api.mainnet-beta.solana.com -H "Content-Type: application/json" -d \'{"jsonrpc":"2.0","id":1,"method":"getRecentPrioritizationFees"}\'',
      explanation: 'getRecentPrioritizationFees — RPC method для current fee market. Module 3.3.'
    },
    {
      type: 'scenario',
      q: 'TX submitted 90 секунд тому, статус "Not Found". Що 4 можливі причини?',
      ideal: '1. Blockhash expired (~150 slots = 60 sec ago). 90 sec > 60 — likely cause. TX rejected by leaders coz блокhash invalid.\n\n2. Priority fee too low — у congestion period leaders sort by priority, low-bid TXs могли бути skipped аж до blockhash expiry.\n\n3. RPC endpoint dropped TX — мабуть overloaded або rate-limited, не forwarded до leader.\n\n4. Network packet loss між RPC і leader TPU. UDP-based TPU може lose packet without retry.\n\nFix: rebuild TX з fresh blockhash, add priority fee (if congestion suspected), use private RPC (Helius/Triton) для reliable submission.',
      explanation: 'Module 3.4.'
    },
    {
      type: 'compare',
      q: 'Confirmed vs Finalized?',
      ideal: 'Confirmed: ≥2/3 stake voted. Probabilistic finality. ~1-3 сек на mainnet. Could theoretically be reverted у extreme scenarios (cluster reorg), але extremely unlikely.\n\nFinalized: 31+ vote credits. Cryptographic finality. ~12-30 сек. Cannot be reverted без consensus breach (>2/3 stake malicious — катастрофічна подія, ніколи не сталась mainnet).\n\nUse cases:\n- Confirmed: typical app UX, transaction success indication\n- Finalized: high-value operations (cross-chain bridges, exchange deposits, large transfers) where revert would mean unrecoverable loss',
      explanation: 'Module 3.4.'
    },
    {
      type: 'order',
      q: 'TX lifecycle order (client → finality):',
      items: [
        'Client SDK signs TX',
        'Cluster votes — block becomes Confirmed',
        'TX submit до RPC',
        'Leader processes TX, includes у block',
        'Block broadcast через turbine',
        '31+ vote credits — Finalized'
      ],
      correctOrder: [0, 2, 3, 4, 1, 5],
      explanation: 'Sign → submit → leader processes → broadcast → vote (Confirmed) → finalize. Module 3.4.'
    },
    {
      type: 'mcq',
      q: 'Що robi ComputeBudget.setComputeUnitLimit?',
      options: [
        'Raise max CU TX може consume (above default 200k)',
        'Set priority fee bid',
        'Reserve compute для future TXs',
        'Pre-allocate CU у block'
      ],
      correct: [0],
      explanation: 'setComputeUnitLimit raises per-TX cap. Без instruction default 200k. setComputeUnitPrice — для priority bid. Module 3.3.'
    },
    {
      type: 'command',
      q: 'Як перевірити статус TX (Confirmed/Finalized/Failed) за signature?',
      accepts: ['solana confirm <SIGNATURE>', 'solana confirm -v <SIGNATURE>', 'solana confirm <SIG> --url mainnet-beta'],
      ideal: 'solana confirm <SIGNATURE>',
      explanation: 'solana confirm — basic status. -v verbose з instructions, logs, fee. Module 3.4.'
    },
    {
      type: 'compare',
      q: 'Legacy TX vs Versioned TX (V0)?',
      ideal: 'Legacy: all account refs as 32-byte pubkeys. Max ~30 accounts per TX. Versioned (V0, default since 2023): backward compatible + ALT support — account refs як 1-byte index у published Address Lookup Table. Allows 256+ accounts у TX. Critical для DeFi aggregators (Jupiter). Module 3.5.',
      explanation: ''
    },
    {
      type: 'explain',
      q: 'Коли використовувати durable nonce замість recent blockhash?',
      ideal: 'Recent blockhash valid ~60 sec. Insufficient для workflows вимагаючих signatures over days (multisig, offline signing, scheduled TXs). Durable nonce: long-lived nonce account, не expires through time. Used by Squads multisig для cross-timezone signing. Cost: nonce account management + rent reserve. Most users не need (standard TXs fine з blockhash). Module 3.6.',
      explanation: ''
    },
    {
      type: 'explain',
      q: 'Чому Solana TX has 1232-byte max size? Які implications?',
      ideal: 'Limit derived з single UDP packet (1280 bytes - QUIC overhead = ~1232 bytes effective). Solana TPU uses QUIC, кожна TX має fit у single packet — no fragmentation для simplicity і latency.\n\nImplications:\n1. Limited кількість signers (~10 max)\n2. Limited accounts list (~30 typical, account = 32 bytes)\n3. Limited instructions per TX (~5-10 typical)\n4. Limited instruction data size\n\nЯкщо operation потребує більше — два workarounds:\n1. Split на multiple TXs (втрачаєш atomicity)\n2. Address Lookup Tables (ALT): compress account references — instead of 32 bytes per account, можна reference 1 byte index у lookup table. Це enable до ~256 accounts у одній TX.',
      explanation: 'Module 3.1.'
    }
  ]
}
</script>

# ⭐ Module 3 — Final quiz

12 питань. Після цього → Module 4 (Consensus, твоя priority topic).

<Quiz :data="quiz" />

---

**Попередньо:** [← 4. TX lifecycle](/module-3/4-lifecycle) | **Наступне:** [Module 4: Consensus →](/module-4/)
