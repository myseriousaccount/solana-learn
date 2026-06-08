import{C as i,o as r,c as s,j as e,a as t,E as l}from"./chunks/framework.CW28V7p_.js";const m=JSON.parse('{"title":"⭐ Module 4 — Final quiz","description":"","frontmatter":{},"headers":[],"relativePath":"module-4/final-quiz.md","filePath":"module-4/final-quiz.md","lastUpdated":1780937944000}'),c={name:"module-4/final-quiz.md"},v=Object.assign(c,{setup(d){const a={id:"m4-final",title:"⭐ Module 4 — Final quiz",intro:"15 питань. Critical модуль — твоя priority topic. 80%+ → Module 5.",questions:[{type:"explain",q:"Поясни як PoH (Proof of History) працює і чому Solana її потребує.",ideal:`PoH = cryptographic clock через recursive SHA-256 hashing. Validator continuously runs loop: hash(prev) → next. Кожна iteration takes real CPU time, не можна fake. Periodically emits tick — marker з counter + hash. Sequence verifiable independently by other validators (replay hashing).

Чому Solana потребує:
1. Без trusted clock validators не можуть agree про порядок подій
2. Enables 400ms slots — leader can fast stamp TX з time без global gossip
3. Allows fast Tower BFT consensus — votes reference PoH positions
4. Reduces network overhead — time embedded у sequences, no separate broadcast

PoH != consensus (Tower BFT робить voting). PoH = timing infrastructure.`,explanation:"Module 4.1."},{type:"mcq",q:"Що з цього вірно про Tower BFT?",options:["PBFT variant з PoH optimization","Exponential lockouts: vote depth N has 2^N slots lockout","2/3 stake threshold для finality","Тільки leader голосує"],correct:[0,1,2],explanation:"Tower BFT properties. Всі validators голосують. Module 4.2."},{type:"explain",q:"Що таке lockout у Tower BFT і чому important?",ideal:`Lockout = commitment validator робить коли голосує: "не голосую за конфліктуючий fork протягом N slots". Exponential: кожен deeper vote doubles lockout попередніх.

Importance:
1. Finality: depth 32 vote = lockout 2^32 slots ≈ forever → slot effectively irreversible
2. Fork choice: locked validators can't switch fork → cluster converges
3. Safety: slashing для violation (double-voting) — economic disincentive

Enables fast finality (~12-30 sec) without traditional BFT slowness.`,explanation:"Module 4.2."},{type:"mcq",q:"Vote credits на classical Tower BFT — обери все правдиве:",options:["Кожен successful vote = 1 credit","Credits accumulate per epoch","Credits → lamport rewards proportional до vote credits + stake","Credits = lamport reward directly (same as Alpenglow)"],correct:[0,1,2],explanation:"Classical credits = vote count. Alpenglow змінює semantics (credits = lamport reward). Module 4.3, 4.4."},{type:"command",q:"Як подивитись свої credits per epoch?",accepts:['solana vote-account YOUR_VOTE | grep -A 7 "Epoch Voting"','sudo /home/solana/ag/bin/solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899 | grep -A 7 "Epoch Voting"'],ideal:'solana vote-account YOUR_VOTE | grep -A 7 "Epoch Voting"',explanation:"vote-account output має Epoch Voting History section. Module 4.3."},{type:"compare",q:"Authorized voter vs authorized withdrawer — різниця і чому matter.",ideal:`Authorized voter: signs vote TXs. Used by validator software constantly. Hot key on validator server.

Authorized withdrawer: controls vote account itself — withdraw rent, change authorities, set commission. Critical key.

Matter: воркер compromised = vote forge (limited damage). Withdrawer compromised = full control vote account, can drain rent, set commission 100% to attacker, redirect rewards.

NEVER use same key for both на mainnet. Withdrawer must be cold (offline). Voter can be hot.

З testnet 2026-06 у тебе обidva same — --allow-unsafe-authorized-withdrawer flag overrides protection. ONLY testnet, mainnet absolutely separate.`,explanation:"Module 4.3."},{type:"compare",q:"Tower BFT vs Alpenglow — ключові різниці.",ideal:`1. Voting: Tower BFT individual TXs per validator per slot; Alpenglow BLS aggregated (many validators → one signature).

2. Credits: Tower BFT = vote count; Alpenglow epochCredits = lamport reward.

3. Finality: Tower BFT ~12-30 sec; Alpenglow targets faster.

4. Network: Alpenglow much less voting bandwidth (BLS aggregation).

5. Slashing: Tower BFT defined but not enforced; Alpenglow strict enforcement.

6. Status: Tower BFT live mainnet; Alpenglow community cluster (твій WNX0016778) testing.

7. Halt threshold: Tower BFT 33%; Alpenglow ~18% delinquent.

8. VAT: Alpenglow specific (1.6 SOL/epoch admission); Tower BFT no equivalent.`,explanation:"Module 4.4."},{type:"mcq",q:"Що з цього Alpenglow-specific (not mainnet/Tower BFT)?",options:["BLS pubkey requirement","VAT (1.6 SOL/epoch)","epochCredits = lamport reward semantics","Vote authority key"],correct:[0,1,2],explanation:"BLS, VAT, lamport credits — Alpenglow specific. Vote authority common to both. Module 4.4."},{type:"scenario",q:'Bot showed "Credits: ?" у Alpenglow Final Report. Real cause: bash bug (pipe+heredoc). АЛЕ якщо би bug fixed, conceptual issue потенційно. Поясни обидва aspects.',ideal:`Technical bug (2026-05-23):
- Script used: echo "$json" | python3 <<EOF
- Pipe + heredoc concatenated incorrectly у bash
- Fixed by switching до python3 -c "..." pattern (one-liner inline script)

Conceptual issue (would surface after fix):
- Bot likely was parsing/comparing credits like Tower BFT (vote count)
- Alpenglow credits = lamport reward (currency, не count)
- Naive comparison "ours / max" would penalize small-stake validators (smaller credits despite same voting quality)
- Must normalize: accuracy = (our_credits / our_stake) / (max_credits / max_stake)

Both aspects together: даже після bash fix, bot потребує semantic update для Alpenglow credits parsing.`,explanation:"Module 4.4."},{type:"explain",q:"Поясни fork choice algorithm у Tower BFT.",ideal:`Heaviest fork rule:
1. Each fork tracked by total stake of validators voting за нього
2. Canonical = fork з найбільшим stake voting
3. Lockouts prevent validators silly switching

Mechanism:
- Validator voted на fork A → locked для N slots
- Cannot switch до fork B without violating lockout (slash condition)
- Light fork loses validators over time (lockouts expire, switch до heavy)
- Cluster converges на heavy fork

Result: forks rare і resolve fast (~30 sec typical mainnet).`,explanation:"Module 4.5."},{type:"mcq",q:"Як виникають forks?",options:["Network partition","Leader malfunction (produces conflicting blocks)","Software bug у TX replay","Two TXs modify same account simultaneously"],correct:[0,1,2],explanation:"#4 — це TX execution within block, not fork. Module 4.5."},{type:"mcq",q:"Що з TX які landed на losing fork?",options:["Reverted — state changes rolled back","Auto-migrated до winning fork","Persisted як orphaned","User refunded fee"],correct:[0],explanation:"Losing fork TXs reverted. User must resubmit з fresh blockhash. Fee paid but state changes gone. Module 4.5."},{type:"command",q:"Як перевірити чи cluster має fork issues (validator votes spread)?",accepts:[`solana validators --output json | python3 -c "import json,sys; d=json.load(sys.stdin); votes=[v.get('lastVote',0) for v in d['validators']]; print(max(votes) - min(votes))"`],ideal:`solana validators --output json | python3 -c "import json,sys; d=json.load(sys.stdin); votes=[v.get('lastVote',0) for v in d['validators']]; print(max(votes) - min(votes))"`,explanation:"Spread у lastVote slots показує fork divergence. Healthy: small (всі validators voting similar). Forking: large. Module 4.5."},{type:"mcq",q:"Що з цього вірно про Solana finality?",options:["Solana finalized = deterministic, no probability calculation","Bitcoin finality probabilistic, growing з confirmations","Solana Confirmed (1-3 sec) теоретично reversable","Cluster restart never trigger forks if properly executed"],correct:[0,1,2,3],explanation:"Всі правильні. Solana deterministic finalization vs Bitcoin probabilistic. Confirmed weaker than Finalized. Proper restart preserves consensus. Module 4.4, 4.5."},{type:"order",q:"Postaj у правильному порядку (TX lifecycle через Tower BFT):",items:["Leader producti block","Validators receive shreds, replay TXs","Validators vote, push to tower","Block reaches 2/3 stake voting — Confirmed","32 votes deep у towers — Finalized"],correctOrder:[0,1,2,3,4],explanation:"Produce → receive/replay → vote → confirmed → finalized. Module 4.2, 4.3."},{type:"compare",q:"Slashing — current state vs Alpenglow proposed?",ideal:`Current Tower BFT: double-vote/equivocation conditions defined у protocol, але automatic slashing NOT enforced. Reliance на social punishment (SFDP removal, pool withdrawals).

Alpenglow proposed: strict automatic enforcement — double-vote/equivocation → instant slash + ejection. Inactivity gradual stake reduction. Similar до Cosmos slashing.

Implications: validators need careful key management (avoid running identity на multiple servers). Higher operational risk у Alpenglow. Module 4.6.`,explanation:""},{type:"command",q:"Як check які features active або pending activation у cluster?",accepts:["solana feature status","solana feature status --url mainnet-beta"],ideal:"solana feature status",explanation:"Виводить активні + pending features + activation epochs. Critical для tracking SIMD activations. Module 4.7."}]};return(p,o)=>{const n=i("Quiz");return r(),s("div",null,[o[0]||(o[0]=e("h1",{id:"⭐-module-4-—-final-quiz",tabindex:"-1"},[t("⭐ Module 4 — Final quiz "),e("a",{class:"header-anchor",href:"#⭐-module-4-—-final-quiz","aria-label":'Permalink to "⭐ Module 4 — Final quiz"'},"​")],-1)),o[1]||(o[1]=e("p",null,"15 питань. Найважливіший модуль для тебе. 80%+ перед Module 5.",-1)),l(n,{data:a}),o[2]||(o[2]=e("hr",null,null,-1)),o[3]||(o[3]=e("p",null,[e("strong",null,"Попередньо:"),t(),e("a",{href:"/module-4/5-forks"},"← 5. Forks"),t(" | "),e("strong",null,"Наступне:"),t(),e("a",{href:"/module-5/"},"Module 5: Networking →")],-1))])}}});export{m as __pageData,v as default};
