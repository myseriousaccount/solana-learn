import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Solana Learn',
  description: 'Validator operator curriculum (Anza docs-based)',
  lang: 'uk',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }],
    ['meta', { name: 'theme-color', content: '#9945ff' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }],
  ],

  themeConfig: {
    siteTitle: 'Solana Learn',
    outline: { level: [2, 3], label: 'На цій сторінці' },
    docFooter: { prev: 'Попередньо', next: 'Далі' },

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: 'Шукати', buttonAriaLabel: 'Шукати' },
              modal: {
                noResultsText: 'Нічого не знайдено',
                resetButtonTitle: 'Очистити',
                footer: {
                  selectText: 'обрати',
                  navigateText: 'навігація',
                  closeText: 'закрити',
                },
              },
            },
          },
        },
      },
    },

    nav: [
      { text: 'Курс', link: '/' },
      { text: 'Глосарій', link: '/glossary' },
      { text: 'Anza docs', link: 'https://docs.anza.xyz', target: '_blank' },
    ],

    sidebar: [
      {
        text: 'Module 0 — Fundamentals',
        collapsed: false,
        items: [
          { text: 'Огляд модуля', link: '/module-0/' },
          { text: '1. Build process', link: '/module-0/1-build' },
          { text: '2. Git', link: '/module-0/2-git' },
          { text: '3. Cargo / Rust', link: '/module-0/3-cargo' },
          { text: '4. Linux processes & daemons', link: '/module-0/4-processes' },
          { text: '5. Filesystem & permissions', link: '/module-0/5-filesystem' },
          { text: '6. Shell mechanics', link: '/module-0/6-shell' },
          { text: '7. tmux', link: '/module-0/7-tmux' },
          { text: '8. SSH', link: '/module-0/8-ssh' },
          { text: '9. WSL & Windows', link: '/module-0/9-wsl-windows' },
          { text: '⭐ Final quiz', link: '/module-0/final-quiz' },
        ],
      },
      {
        text: 'Module 1 — Solana foundations',
        collapsed: true,
        items: [
          { text: 'Огляд модуля', link: '/module-1/' },
          { text: '1. Cluster, network, node kinds', link: '/module-1/1-cluster' },
          { text: '2. Slots, epochs, time', link: '/module-1/2-slots-epochs' },
          { text: '3. Leader, leader schedule', link: '/module-1/3-leaders' },
          { text: '4. Block production', link: '/module-1/4-block-production' },
          { text: '5. Validator status', link: '/module-1/5-validator-status' },
          { text: '6. Genesis ceremony', link: '/module-1/6-genesis' },
          { text: '⭐ Final quiz', link: '/module-1/final-quiz' },
        ],
      },
      {
        text: 'Module 2 — Account model',
        collapsed: true,
        items: [
          { text: 'Огляд модуля', link: '/module-2/' },
          { text: '1. Account basics', link: '/module-2/1-account-basics' },
          { text: '2. Programs as accounts', link: '/module-2/2-programs' },
          { text: '3. Rent and rent-exempt', link: '/module-2/3-rent' },
          { text: '4. Token accounts & ATA', link: '/module-2/4-tokens-ata' },
          { text: '5. PDA deep dive', link: '/module-2/5-pda-deep' },
          { text: '6. Token-2022', link: '/module-2/6-token-2022' },
          { text: '⭐ Final quiz', link: '/module-2/final-quiz' },
        ],
      },
      {
        text: 'Module 3 — Transactions',
        collapsed: true,
        items: [
          { text: 'Огляд модуля', link: '/module-3/' },
          { text: '1. TX anatomy', link: '/module-3/1-tx-anatomy' },
          { text: '2. Instructions & CPI', link: '/module-3/2-instructions' },
          { text: '3. Fees & priority', link: '/module-3/3-fees' },
          { text: '4. TX lifecycle', link: '/module-3/4-lifecycle' },
          { text: '5. Versioned TX & ALTs', link: '/module-3/5-versioned-tx-alts' },
          { text: '6. Durable nonces', link: '/module-3/6-durable-nonces' },
          { text: '⭐ Final quiz', link: '/module-3/final-quiz' },
        ],
      },
      {
        text: 'Module 4 — Consensus ⭐',
        collapsed: true,
        items: [
          { text: 'Огляд модуля', link: '/module-4/' },
          { text: '1. Proof of History', link: '/module-4/1-poh' },
          { text: '2. Tower BFT', link: '/module-4/2-tower-bft' },
          { text: '3. Votes, credits, finality', link: '/module-4/3-votes-credits' },
          { text: '4. Alpenglow (SIMD-0326)', link: '/module-4/4-alpenglow' },
          { text: '5. Forks, lockouts', link: '/module-4/5-forks' },
          { text: '6. Slashing deep', link: '/module-4/6-slashing-deep' },
          { text: '7. Recent SIMDs', link: '/module-4/7-recent-simds' },
          { text: '⭐ Final quiz', link: '/module-4/final-quiz' },
        ],
      },
      {
        text: 'Module 5 — Networking',
        collapsed: true,
        items: [
          { text: 'Огляд модуля', link: '/module-5/' },
          { text: '1. Gossip protocol', link: '/module-5/1-gossip' },
          { text: '2. Turbine block propagation', link: '/module-5/2-turbine' },
          { text: '3. Shreds & erasure coding', link: '/module-5/3-shreds' },
          { text: '4. Repair protocol', link: '/module-5/4-repair' },
          { text: '5. QUIC & Fiber', link: '/module-5/5-quic-fiber' },
          { text: '⭐ Final quiz', link: '/module-5/final-quiz' },
        ],
      },
      {
        text: 'Module 6 — Validator internals',
        collapsed: true,
        items: [
          { text: 'Огляд модуля', link: '/module-6/' },
          { text: '1. TPU', link: '/module-6/1-tpu' },
          { text: '2. TVU', link: '/module-6/2-tvu' },
          { text: '3. AccountsDB', link: '/module-6/3-accountsdb' },
          { text: '4. Banking & replay', link: '/module-6/4-stages' },
          { text: '5. Firedancer', link: '/module-6/5-firedancer' },
          { text: '⭐ Final quiz', link: '/module-6/final-quiz' },
        ],
      },
      {
        text: 'Module 7 — Stake & rewards',
        collapsed: true,
        items: [
          { text: 'Огляд модуля', link: '/module-7/' },
          { text: '1. Stake accounts', link: '/module-7/1-stake' },
          { text: '2. Inflation & rewards', link: '/module-7/2-rewards' },
          { text: '3. MEV, Jito, BAM', link: '/module-7/3-mev-jito' },
          { text: '4. SFDP & pools', link: '/module-7/4-sfdp-pools' },
          { text: '5. Jito Block Engine deep', link: '/module-7/5-jito-block-engine' },
          { text: '6. Stake split/merge', link: '/module-7/6-stake-split-merge' },
          { text: '⭐ Final quiz', link: '/module-7/final-quiz' },
        ],
      },
      {
        text: 'Module 8 — Operations security',
        collapsed: true,
        items: [
          { text: 'Огляд модуля', link: '/module-8/' },
          { text: '1. Keypair hygiene', link: '/module-8/1-keypair-security' },
          { text: '2. Backups & recovery', link: '/module-8/2-backups' },
          { text: '3. Monitoring & alerting', link: '/module-8/3-monitoring' },
          { text: '4. Upgrade safety', link: '/module-8/4-upgrade-safety' },
          { text: '5. Hardware specs', link: '/module-8/5-hardware-specs' },
          { text: '6. Kernel & network tuning', link: '/module-8/6-kernel-tuning' },
          { text: '7. Treasury multisig (Squads)', link: '/module-8/7-treasury-multisig' },
          { text: '8. Monitoring stack (Prom+Grafana)', link: '/module-8/8-monitoring-stack' },
          { text: '9. Oncall runbooks', link: '/module-8/9-oncall-runbooks' },
          { text: '⭐ Final quiz', link: '/module-8/final-quiz' },
        ],
      },
      {
        text: 'Module 9 — CLI deep dive',
        collapsed: true,
        items: [
          { text: 'Огляд модуля', link: '/module-9/' },
          { text: '1. Queries', link: '/module-9/1-queries' },
          { text: '2. Vote & stake ops', link: '/module-9/2-vote-stake' },
          { text: '3. Transfers', link: '/module-9/3-transfers' },
          { text: '4. Validator-side', link: '/module-9/4-validator-side' },
          { text: '5. Feature status', link: '/module-9/5-feature-status' },
          { text: '6. Benchmarking', link: '/module-9/6-benchmarking' },
          { text: '⭐ Final quiz', link: '/module-9/final-quiz' },
        ],
      },
      {
        text: 'Module 10 — Special topics',
        collapsed: true,
        items: [
          { text: 'Огляд модуля', link: '/module-10/' },
          { text: '1. Geyser & RPC', link: '/module-10/1-geyser-rpc' },
          { text: '2. Snapshots', link: '/module-10/2-snapshots' },
          { text: '3. DoubleZero', link: '/module-10/3-doublezero' },
          { text: '4. JIPs & SIMD governance', link: '/module-10/4-governance' },
          { text: '5. Snapshot mirror', link: '/module-10/5-snapshot-mirror' },
          { text: '6. Compression NFTs', link: '/module-10/6-compression-nfts' },
          { text: '7. Oracles', link: '/module-10/7-oracles' },
          { text: '⭐ Final quiz', link: '/module-10/final-quiz' },
        ],
      },
      { text: 'Глосарій', link: '/glossary' },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/anza-xyz/agave' }],
  },
})
