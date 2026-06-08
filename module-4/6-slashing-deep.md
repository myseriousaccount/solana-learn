<script setup>
const quiz = {
  id: 'm4-6-slashing',
  title: '🧠 Mini-check: Slashing',
  intro: '2 питання.',
  questions: [
    {
      type: 'compare',
      q: 'Solana slashing — current state vs proposed Alpenglow?',
      ideal: 'Current (Tower BFT, as of 2026):\n- Double-vote condition defined у Tower BFT protocol\n- Slashing logic implemented у runtime\n- BUT not actively triggered/enforced automatically\n- Enforcement через social punishment: caught validators removed from SFDP, stake pools withdraw delegations, reputation damage\n- Economic disincentive (lost income) > technical slashing currently\n\nAlpenglow proposed:\n- Strict automatic enforcement:\n  - Double-vote: instant stake slash + validator ejection\n  - Equivocation (conflicting blocks signed): same\n  - Inactivity beyond threshold: gradual stake reduction\n- More similar to Cosmos slashing model\n- Higher operational risk для validators — bugs that cause double-signs could destroy stake\n\nWhy proposed change: Tower BFT defines but не enforces — relies on goodwill. Alpenglow wants мathematical guarantees, не trust.\n\nImplications для operators: more careful operations needed (avoid running same identity на multiple machines, avoid restoring keypair without ensuring old instance stopped, etc.).',
      explanation: 'Module 4.6.'
    },
    {
      type: 'mcq',
      q: 'Як validator може accidentally double-vote?',
      options: [
        'Running validator identity на two servers simultaneously',
        'Restoring keypair backup on new server без stopping old instance',
        'Cluster restart procedures done improperly',
        'Slow network causes vote retry'
      ],
      correct: [0, 1, 2],
      explanation: '#4 не cause double-vote — protocol handles retries safely. Module 4.6.'
    }
  ]
}
</script>

# 6. Slashing — deep dive

## TL;DR

**Slashing** = penalty (stake reduction) для malicious or buggy validator behavior. Solana has slashing **conditions defined** but currently **not actively enforced** automatically. Alpenglow proposes strict enforcement — higher operational risk requiring careful key management.

## Slashing conditions

### Double-vote

Validator signs **two conflicting votes** for same slot (e.g., for blocks A and B at slot 100).

Detection: vote TXs у chain show both signatures from same validator. Mechanically detectable.

Cause:
- **Honest mistake**: bug у validator software signs twice
- **Malicious**: deliberately trying to disrupt consensus
- **Operational error**: same identity running on two servers (most common cause)

### Equivocation (signing conflicting blocks)

Leader signs two different blocks for same slot. Similar to double-vote but for leader output.

### Inactivity (proposed)

Validator down beyond threshold. Currently → delinquent flag (no rewards). Alpenglow proposes stake reduction over extended inactivity.

## Current state: defined but not enforced

Tower BFT (Module 4.2) defines slashing conditions in protocol specification. Runtime can detect violations. But:

- **No automatic stake reduction** triggered
- **No on-chain enforcement** mechanism active
- Validators caught double-signing — not slashed by protocol

### How violations actually handled today

Social punishment:

1. **Caught violators publicized** у Discord/Twitter
2. **SFDP removal** — Foundation removes stake delegation
3. **Stake pool withdrawals** — Jito/Marinade pools un-delegate
4. **Reputation damage** — direct delegators leave
5. **Income loss** — without delegations, validator unprofitable

Effectively: economic слашing through community action, not protocol.

### Why this design

Several reasons:
- Solana focused on performance over strict slashing initially
- Risk of false positives slashing honest operators (bugs у edge cases)
- Easier to evolve без protocol-level enforcement
- Trust community will self-police

## Alpenglow proposed slashing

SIMD-0326 proposes much stricter mechanism:

### Automatic enforcement

- Double-vote detected on-chain → instant stake slash
- Equivocation → instant slash + validator ejection
- Slashed funds: burned or redistributed

### Inactivity slashing

Gradual stake reduction для extended downtime:
- 1 hour down: no penalty
- 1 day down: small penalty
- 1 week down: significant penalty
- Designed to incentivize liveness, not just safety

### Implications для operators

Higher operational risk:
- Bug у setup that double-signs → real money loss
- Hardware failure during voting → potentially slashed
- Need more careful key management

Best practices ще критичніші:
- NEVER run same identity на multiple machines
- ALWAYS verify old instance stopped перед restoring backup
- Test thoroughly on testnet перед mainnet operations
- Use validator software із double-sign protection (vote tracking)

## Common double-vote pitfalls

### Pitfall 1: Running validator twice

```
Server A (production): identity key, voting
Server B (testing):    same identity key copied, also voting
→ both sign votes для same slots → double-vote!
```

Fix: NEVER copy identity to second instance without ensuring first stopped + waited.

### Pitfall 2: Disaster recovery without coordination

```
Server A: crashes hard (assumed down)
Restore: copy keypair backup до Server B, start validator
Server A: comes back up (was network issue, not crash)
→ both signing!
```

Fix: ALWAYS verify Server A truly down (SSH dead, console confirmation). Wait 5+ minutes before bringing up new instance з same identity.

### Pitfall 3: Failover automation

```
Watchdog: detects ping failure
Action: auto-spawn backup validator з restored identity
Reality: network glitch, primary still alive
→ both signing!
```

Fix: NO auto-failover для identity. Manual confirmation required for safety.

### Pitfall 4: Identity rotation race

```
Old identity X: validator running з X
Rotate: set new identity Y via agave-validator set-identity
Old validator process: still has X loaded (didn't restart)
→ both X identity AND Y signing concurrently
```

Fix: restart validator after identity rotation. Don't trust hot rotation work без restart.

## Double-sign protection patterns

### Slasher prevention scripts

External monitoring detect duplicate signing:

```bash
# Track vote signatures у chain — alert if duplicate
# Custom script сhecking RPC for двох votes from same identity у same slot
```

Some Jito-Solana variants ship з built-in double-sign protection (refuse to vote якщо detect conflicting recent vote).

### Tower file management

Validator stores tower (vote history) у `~/.solana/tower-N.bin`. Якщо restored validator з old tower → can re-sign already-voted slot.

Solution: **delete tower file** перш ніж restore on new server. Validator builds new tower from scratch (slower catchup але safe).

```bash
sudo rm /home/solana/solana/ledger/tower-*.bin
```

## Connect to your work

### Cluster restart sensitivity

З cheatsheet §3 — cluster restart involves identity preservation across servers. Critical:

- Backup keypair (Phase 0)
- New cluster has new genesis = new "session" effectively
- Old votes from old genesis не conflict з new (different cluster)

### Alpenglow risk profile

Alpenglow community cluster тестує strict slashing scenarios. Якщо bug у your validator setup → real Alpenglow SOL loss (though small amounts на community cluster).

Mainnet (Tower BFT) less stringent currently. Don't be complacent — Alpenglow stricter ideology coming.

### Hot identity rotation

З Module 9.4 — `agave-validator set-identity` allows rotation без restart. CONVENIENT але:

- If old identity already used для votes recently → vote authority transition careful
- Best practice: stop validator, rotate, restart (avoid hot swap у production)

## Mini-quiz

<Quiz :data="quiz" />

## Glossary additions

[`Slashing`](/glossary#s), [`Double-sign`](/glossary#d), [`Equivocation`](/glossary#e), [`Tower file`](/glossary#t), [`Identity rotation`](/glossary#i), [`Slashing condition`](/glossary#s)

---

**Попередньо:** [← 5. Forks](/module-4/5-forks) | **Наступне:** [7. Recent SIMDs →](/module-4/7-recent-simds)
