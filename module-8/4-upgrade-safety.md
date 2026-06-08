<script setup>
const quiz = {
  id: 'm8-4-upgrade',
  title: '🧠 Mini-check: Upgrade safety',
  intro: '2 питання.',
  questions: [
    {
      type: 'order',
      q: 'Safe upgrade procedure order:',
      items: [
        'Backup keypairs до /tmp/',
        'Build new version у versioned dir',
        'Verify feature set unchanged (patch release)',
        'Wait-for-restart-window',
        'Swap symlink + systemctl restart',
        'Verify post-restart (logs, monitor, slot delta, credits)'
      ],
      correctOrder: [0, 1, 2, 3, 4, 5],
      explanation: 'Backup → build → verify → wait → swap → verify. Per cheatsheet §4. Module 8.4.'
    },
    {
      type: 'mcq',
      q: 'Rollback triggers після upgrade?',
      options: [
        'Panic/fatal у логах перші 5 хв',
        'Credits не ростуть 2-3 хв після restart',
        'Validator показує delinquent через 10 хв',
        'Cluster halts'
      ],
      correct: [0, 1, 2],
      explanation: 'Cluster halt = NOT your fault, не rollback. Інші — твої problems. Module 8.4.'
    }
  ]
}
</script>

# 4. Upgrade safety patterns

## TL;DR

Safe upgrade = **versioned dirs + symlink** для instant rollback. Per cheatsheet §4 routine upgrade: backup → build → verify → wait-for-window → swap → verify → rollback if needed.

## Key principles

### Versioned dirs + symlink

З cheatsheet:

```
/home/solana/ag-v0.4.0/   ← old version (preserved)
/home/solana/ag-v0.4.2/   ← new version (just built)
/home/solana/ag → ag-v0.4.2  (symlink, currently active)
```

Switch version = `ln -sfn` (atomic). Rollback = same `ln -sfn` back. Old version preserved → instant rollback possible.

### Six phases (cheatsheet §4)

1. **Pre-flight checks**: cluster health, current version, baseline credits
2. **Build**: новий version у versioned dir (з `cargo clean` для force fresh rebuild)
3. **Verify build produced new binary**: timestamp recent + version matches expected
4. **Swap + restart**: symlink → restart service
5. **Post-restart verify**: live logs + monitor + slot delta + credits
6. **Rollback if needed**: symlink back, restart

### Critical build pitfalls (з 2026-06-08 incident)

Два subtle bugs які можуть skip detection і призвести до "silent failure":

**Pitfall 1: Naïve sed на cargo-install-all.sh script**

```
# WRONG — duplicates --force on lines that already have it
sed -i 's/install --locked/install --locked --force/g' scripts/cargo-install-all.sh
```

→ `cargo install --locked --force --force spl-token-cli` → error `--force used multiple times`.

```
# CORRECT — skip lines що вже мають --force
sed -i '/--force/!s/install --locked/install --locked --force/g' scripts/cargo-install-all.sh
```

**Pitfall 2: Cargo cache silent skip**

Без `cargo clean` перед build, cargo може detect target/ artifacts up-to-date з previous build → skip compilation, output `Finished in 0.38s`. Binary НЕ updated to new version.

Symptom: build "успішно" завершується, але `agave-validator --version` все ще показує стару версію.

Fix: завжди `cargo clean` перед serious build (особливо upgrade):

```
cd /home/devops_ssh/agave
cargo clean
# Тепер rebuild from scratch — ~25-30 хв
```

**Завжди verify build output**:

```
ls -la /home/devops_ssh/agave/bin/agave-validator    # date має бути recent
/home/devops_ssh/agave/bin/agave-validator --version  # version має бути нова
```

Якщо date старе або version стара — НЕ proceed до Phase 4! Build did not produce new binary.

### Pre-flight checks important

```bash
# Cluster health (skip if delinquent > 5%)
solana validators --url localhost | grep -E "Active|Delinquent"

# Baseline credits
solana vote-account YOUR_VOTE | grep Credits

# Current version
agave-validator --version
```

Якщо delinquent > 5% — wait. Restart additional pressure може push cluster ближче до halt threshold.

### Wait-for-restart-window

Per cheatsheet §4 Phase 4:

```bash
sudo -u solana /home/solana/ag/bin/agave-validator \
    --ledger /home/solana/solana/ledger \
    wait-for-restart-window
```

Blocks until validator between leader slots (safe to restart без losing produced slots).

### Verify pattern (Module 0.4 + cheatsheet §4 Phase 5)

After restart:

1. **Live logs** — `sudo tail -f /home/solana/solana/solana.log`, watch 30-60s для panic/fatal
2. **Interactive monitor** — `agave-validator monitor`, see Processed slot growing
3. **Slot delta** — 10-15 slots / 5 sec = healthy
4. **Credits comparison** — продовжує рости з baseline

Не використовуй: `ps aux | grep`, `--version` (вже verified у Phase 3), post-mortem grep panic (слабше за live tail).

### Rollback triggers

| Indicator | Trigger? |
|---|---|
| Panic/fatal у логах перші 5 хв | YES |
| Credits не ростуть 2-3 хв | YES |
| Validator показує delinquent через 10 хв | YES |
| Skip rate jump > 5% над baseline | YES (after 1 epoch observation) |
| Cluster-wide issue | NO (не твоя проблема) |
| Тимчасовий network glitch | NO (wait, possibly recover) |

### Rollback command

```bash
sudo ln -sfn /home/solana/ag-v0.4.0 /home/solana/ag  # symlink назад
sudo systemctl restart solana
# Verify (same Phase 5)
```

Old version directory must still exist (don't delete старі версії). Зазвичай keep last 2-3 versions, deleте старіші.

## Connect to your work

### Coordination upgrades

- Major version upgrades (mainnet): coordinated by Anza, social rollout. Check Discord/governance перед upgrading.
- Patch releases: usually safe to upgrade anytime, but check release notes.
- Bleeding edge (testnet, Alpenglow): cluster restarts and breaking changes common. Stay caught up.

### Document upgrade history

Personal log of:
- When upgraded which version
- Issues encountered
- Performance changes (skip rate before/after)

Helps debug regressions, identify problematic versions.

## Mini-quiz

<Quiz :data="quiz" />

## Glossary

[`Upgrade`](/glossary#u), [`Rollback`](/glossary#r), [`Symlink swap`](/glossary#s), [`wait-for-restart-window`](/glossary#w)

---

**Попередньо:** [← 3. Monitoring](/module-8/3-monitoring) | **Наступне:** [⭐ Final quiz →](/module-8/final-quiz)
