<script setup>
const quiz = {
  id: 'm9-final',
  title: '⭐ Module 9 — Final quiz',
  intro: '8 командних питань.',
  questions: [
    {
      type: 'command',
      q: 'Current epoch progress + slot range:',
      accepts: ['solana epoch-info'],
      ideal: 'solana epoch-info',
      explanation: 'Module 9.1.'
    },
    {
      type: 'command',
      q: 'Vote credits per epoch для конкретного validator:',
      accepts: ['solana vote-account VOTE_PUBKEY | grep -A 7 "Epoch Voting"'],
      ideal: 'solana vote-account VOTE_PUBKEY | grep -A 7 "Epoch Voting"',
      explanation: 'Module 9.2.'
    },
    {
      type: 'command',
      q: 'Делегувати stake account до validator:',
      accepts: ['solana delegate-stake stake-keypair.json VOTE_PUBKEY'],
      ideal: 'solana delegate-stake stake-keypair.json VOTE_PUBKEY',
      explanation: 'Module 9.2.'
    },
    {
      type: 'command',
      q: 'Transfer 0.5 SOL до новостворeного wallet:',
      accepts: ['solana transfer RECIPIENT_PUBKEY 0.5 --allow-unfunded-recipient'],
      ideal: 'solana transfer RECIPIENT_PUBKEY 0.5 --allow-unfunded-recipient',
      explanation: 'Module 9.3.'
    },
    {
      type: 'command',
      q: 'Devnet airdrop 1 SOL:',
      accepts: ['solana airdrop 1 --url devnet', 'solana airdrop 1'],
      ideal: 'solana airdrop 1 --url devnet',
      explanation: 'Module 9.3.'
    },
    {
      type: 'command',
      q: 'Catch-up status running validator:',
      accepts: ['sudo /home/solana/ag/bin/agave-validator --ledger /home/solana/solana/ledger catchup'],
      ideal: 'sudo /home/solana/ag/bin/agave-validator --ledger /home/solana/solana/ledger catchup',
      explanation: 'Module 9.4.'
    },
    {
      type: 'command',
      q: 'Wait безпечного restart window:',
      accepts: ['sudo -u solana /home/solana/ag/bin/agave-validator --ledger /home/solana/solana/ledger wait-for-restart-window'],
      ideal: 'sudo -u solana /home/solana/ag/bin/agave-validator --ledger /home/solana/solana/ledger wait-for-restart-window',
      explanation: 'Module 9.4.'
    },
    {
      type: 'command',
      q: 'All token holdings конкретного wallet:',
      accepts: ['spl-token accounts --owner WALLET_PUBKEY'],
      ideal: 'spl-token accounts --owner WALLET_PUBKEY',
      explanation: 'Module 9.3.'
    },
    {
      type: 'command',
      q: 'Show feature flags status (active/pending/inactive):',
      accepts: ['solana feature status', 'solana feature status --url mainnet-beta'],
      ideal: 'solana feature status',
      explanation: 'Track SIMD activations + protocol changes. Module 9.5.'
    },
    {
      type: 'command',
      q: 'Disk random 4k read benchmark (NVMe test для validator):',
      accepts: ['fio --filename=/path/to/test --size=10G --direct=1 --rw=randread --bs=4k --ioengine=libaio --iodepth=64 --runtime=60 --numjobs=4 --time_based --group_reporting --name=randread-test'],
      ideal: 'fio --filename=/path/to/test --size=10G --direct=1 --rw=randread --bs=4k --ioengine=libaio --iodepth=64 --runtime=60 --numjobs=4 --time_based --group_reporting --name=randread-test',
      explanation: 'Mainnet target > 200k IOPS. Enterprise NVMe потрібен. Module 9.6.'
    }
  ]
}
</script>

# ⭐ Module 9 — Final quiz

<Quiz :data="quiz" />

---

**Наступне:** [Module 10: Special topics →](/module-10/)
