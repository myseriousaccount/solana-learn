import{C as i,o as p,c as l,a5 as a,E as t}from"./chunks/framework.CW28V7p_.js";const h=JSON.parse('{"title":"9. Oncall runbooks","description":"","frontmatter":{},"headers":[],"relativePath":"module-8/9-oncall-runbooks.md","filePath":"module-8/9-oncall-runbooks.md","lastUpdated":1780937944000}'),o={name:"module-8/9-oncall-runbooks.md"},u=Object.assign(o,{setup(r){const n={id:"m8-9-oncall",title:"🧠 Mini-check: Oncall runbooks",intro:"2 питання.",questions:[{type:"order",q:"Standard incident response order:",items:["Acknowledge alert (silence dup notifications)","Assess scope: just us, or cluster-wide?","Mitigate first (stop bleed: rollback, etc.)","Investigate root cause","Document incident, post-mortem"],correctOrder:[0,1,2,3,4],explanation:"Ack → assess → mitigate → investigate → document. Mitigate before deep investigation — stop loss first. Module 8.9."},{type:"mcq",q:"Перші steps коли validator delinquent alert fires?",options:["Check systemctl status — is process running?","Check journalctl logs — panic/error?","Check cluster — is cluster-wide issue?","Immediately wipe ledger and restart"],correct:[0,1,2],explanation:"Diagnose first, не destructive operations. Wipe ledger тільки якщо all else fails. Module 8.9."}]};return(c,s)=>{const e=i("Quiz");return p(),l("div",null,[s[0]||(s[0]=a(`<h1 id="_9-oncall-runbooks" tabindex="-1">9. Oncall runbooks <a class="header-anchor" href="#_9-oncall-runbooks" aria-label="Permalink to &quot;9. Oncall runbooks&quot;">​</a></h1><h2 id="tl-dr" tabindex="-1">TL;DR <a class="header-anchor" href="#tl-dr" aria-label="Permalink to &quot;TL;DR&quot;">​</a></h2><p>Runbook = pre-written step-by-step procedure для common incidents. Documents what to do коли specific alert fires. Critical для consistent response, on-call rotation handoffs, junior operators.</p><h2 id="incident-response-framework" tabindex="-1">Incident response framework <a class="header-anchor" href="#incident-response-framework" aria-label="Permalink to &quot;Incident response framework&quot;">​</a></h2><p>Standard order:</p><ol><li><strong>Acknowledge</strong> — silence duplicate notifications, claim ownership</li><li><strong>Assess</strong> — scope (just us / cluster-wide), severity (critical / warning)</li><li><strong>Mitigate</strong> — stop the bleed (rollback, restart, failover)</li><li><strong>Investigate</strong> — root cause analysis</li><li><strong>Document</strong> — post-incident summary, lessons learned</li></ol><p>⚠️ Mitigate BEFORE deep investigation. If validator down — restart first, debug after.</p><h2 id="runbook-template" tabindex="-1">Runbook template <a class="header-anchor" href="#runbook-template" aria-label="Permalink to &quot;Runbook template&quot;">​</a></h2><p>Each runbook should answer:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ALERT NAME: &lt;e.g., ValidatorDelinquent&gt;</span></span>
<span class="line"><span>SEVERITY: &lt;critical / warning / info&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>SYMPTOMS:</span></span>
<span class="line"><span>  - What user/oncall sees</span></span>
<span class="line"><span>  - Example: &quot;Telegram bot reports delinquent status&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>INITIAL CHECKS (5 min):</span></span>
<span class="line"><span>  - Specific commands to run</span></span>
<span class="line"><span>  - Each with expected output / interpretation</span></span>
<span class="line"><span></span></span>
<span class="line"><span>LIKELY CAUSES (ordered by frequency):</span></span>
<span class="line"><span>  1. Cause A → fix steps</span></span>
<span class="line"><span>  2. Cause B → fix steps</span></span>
<span class="line"><span>  3. Cause C → fix steps</span></span>
<span class="line"><span></span></span>
<span class="line"><span>MITIGATION:</span></span>
<span class="line"><span>  - Specific recovery steps</span></span>
<span class="line"><span>  - Rollback procedure якщо relevant</span></span>
<span class="line"><span></span></span>
<span class="line"><span>ESCALATION:</span></span>
<span class="line"><span>  - Who to contact якщо unable to resolve</span></span>
<span class="line"><span>  - Timeline (e.g., &quot;після 30 min, escalate to &lt;lead&gt;&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>POST-INCIDENT:</span></span>
<span class="line"><span>  - What to document</span></span>
<span class="line"><span>  - Where to write up</span></span></code></pre></div><h2 id="example-validatordelinquent-runbook" tabindex="-1">Example: ValidatorDelinquent runbook <a class="header-anchor" href="#example-validatordelinquent-runbook" aria-label="Permalink to &quot;Example: ValidatorDelinquent runbook&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ALERT: ValidatorDelinquent</span></span>
<span class="line"><span>SEVERITY: critical</span></span>
<span class="line"><span></span></span>
<span class="line"><span>SYMPTOMS:</span></span>
<span class="line"><span>  - solana validators output shows ⚠ (delinquent) для нашого validator</span></span>
<span class="line"><span>  - Telegram bot reports &quot;delinquent&quot;</span></span>
<span class="line"><span>  - Vote credits stop growing</span></span>
<span class="line"><span></span></span>
<span class="line"><span>INITIAL CHECKS:</span></span>
<span class="line"><span>  1. Is process running?</span></span>
<span class="line"><span>     sudo systemctl status solana</span></span>
<span class="line"><span>     → &quot;active (running)&quot;: process up, look elsewhere</span></span>
<span class="line"><span>     → &quot;failed&quot;: go to &quot;Process failed&quot; section</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  2. Cluster issue or just us?</span></span>
<span class="line"><span>     solana validators --url mainnet-beta | grep -E &quot;Active|Delinquent&quot;</span></span>
<span class="line"><span>     → Delinquent &gt; 10% globally: cluster-wide problem, не наша fault</span></span>
<span class="line"><span>     → Delinquent &lt; 5%: our issue</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  3. What state are we в?</span></span>
<span class="line"><span>     curl -s http://localhost:8899 -X POST -H &quot;Content-Type: application/json&quot; \\</span></span>
<span class="line"><span>         -d &#39;{&quot;jsonrpc&quot;:&quot;2.0&quot;,&quot;id&quot;:1,&quot;method&quot;:&quot;getHealth&quot;}&#39;</span></span>
<span class="line"><span>     → &quot;Node is behind by N slots&quot;: catching up, may recover</span></span>
<span class="line"><span>     → &quot;Connection refused&quot;: validator process not responsive</span></span>
<span class="line"><span></span></span>
<span class="line"><span>LIKELY CAUSES:</span></span>
<span class="line"><span>  1. Network issue (most common)</span></span>
<span class="line"><span>     → Check ping to entrypoints, gossip peers</span></span>
<span class="line"><span>     → Check ISP status page</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  2. Disk full</span></span>
<span class="line"><span>     → df -h /home/solana/solana/ledger</span></span>
<span class="line"><span>     → Якщо &lt; 50GB: clean old snapshots або add storage</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  3. OOM kill</span></span>
<span class="line"><span>     → sudo journalctl -u solana | grep -i &quot;out of memory&quot;</span></span>
<span class="line"><span>     → Якщо так: add swap або більше RAM</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  4. Software bug (recent upgrade?)</span></span>
<span class="line"><span>     → If upgraded recently → rollback per §4 Phase 6</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  5. Hardware degradation</span></span>
<span class="line"><span>     → Run smartctl на NVMe (\`smartctl -a /dev/nvme0\`)</span></span>
<span class="line"><span>     → Look for errors/wear</span></span>
<span class="line"><span></span></span>
<span class="line"><span>MITIGATION:</span></span>
<span class="line"><span>  1. Якщо process not running → systemctl restart solana</span></span>
<span class="line"><span>  2. Якщо catching up (rare): wait 5-30 min</span></span>
<span class="line"><span>  3. Якщо software issue: rollback до previous version</span></span>
<span class="line"><span>  4. Якщо hardware issue: failover до backup server (якщо є)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>ESCALATION:</span></span>
<span class="line"><span>  - After 15 min no recovery → notify team lead</span></span>
<span class="line"><span>  - After 1 hour → consider declaring incident</span></span>
<span class="line"><span>  - After 4 hours → consider stake migration до backup validator</span></span>
<span class="line"><span></span></span>
<span class="line"><span>POST-INCIDENT:</span></span>
<span class="line"><span>  - Write up у incidents/ folder</span></span>
<span class="line"><span>  - Update runbook if new patterns discovered</span></span>
<span class="line"><span>  - If significant downtime: notify delegators</span></span></code></pre></div><h2 id="common-runbooks-для-lumlabs-validator" tabindex="-1">Common runbooks для LumLabs validator <a class="header-anchor" href="#common-runbooks-для-lumlabs-validator" aria-label="Permalink to &quot;Common runbooks для LumLabs validator&quot;">​</a></h2><h3 id="_1-validatordelinquent-above" tabindex="-1">1. ValidatorDelinquent (above) <a class="header-anchor" href="#_1-validatordelinquent-above" aria-label="Permalink to &quot;1. ValidatorDelinquent (above)&quot;">​</a></h3><h3 id="_2-highskiprate" tabindex="-1">2. HighSkipRate <a class="header-anchor" href="#_2-highskiprate" aria-label="Permalink to &quot;2. HighSkipRate&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SYMPTOMS: Skip rate jumped &gt; 10%</span></span>
<span class="line"><span></span></span>
<span class="line"><span>CHECKS:</span></span>
<span class="line"><span>  - solana validators | grep YOUR_IDENTITY (offset from current)</span></span>
<span class="line"><span>  - sudo journalctl -u solana | grep -i &quot;skip&quot;</span></span>
<span class="line"><span>  - ps aux + htop (CPU/RAM saturation)</span></span>
<span class="line"><span>  - iostat (disk I/O bottleneck)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>CAUSES:</span></span>
<span class="line"><span>  1. Resource saturation (CPU/RAM)</span></span>
<span class="line"><span>  2. Network degradation</span></span>
<span class="line"><span>  3. Disk slow (NVMe wearing out?)</span></span>
<span class="line"><span>  4. Recent software upgrade regression</span></span>
<span class="line"><span></span></span>
<span class="line"><span>MITIGATION:</span></span>
<span class="line"><span>  - Resource: upgrade hardware або move validator</span></span>
<span class="line"><span>  - Network: switch ISP / move datacenter</span></span>
<span class="line"><span>  - Disk: replace NVMe</span></span>
<span class="line"><span>  - Software: rollback per §4</span></span></code></pre></div><h3 id="_3-clusterrestartannounced" tabindex="-1">3. ClusterRestartAnnounced <a class="header-anchor" href="#_3-clusterrestartannounced" aria-label="Permalink to &quot;3. ClusterRestartAnnounced&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SYMPTOMS: Anza/Ashwin announces cluster restart у Discord</span></span>
<span class="line"><span></span></span>
<span class="line"><span>ACTIONS:</span></span>
<span class="line"><span>  1. Read announcement carefully (genesis hash, version)</span></span>
<span class="line"><span>  2. Check if we are у new genesis (validator list)</span></span>
<span class="line"><span>     - If YES: follow cheatsheet §3 in-genesis flow</span></span>
<span class="line"><span>     - If NO: follow §3 out-of-genesis flow (chats Tim про delegation)</span></span>
<span class="line"><span>  3. Backup keypairs (cheatsheet §3 Phase 0)</span></span>
<span class="line"><span>  4. Execute restart procedure</span></span>
<span class="line"><span>  5. Verify post-restart per §4 Phase 5</span></span>
<span class="line"><span>  6. Monitor for first epoch</span></span></code></pre></div><h3 id="_4-diskfull" tabindex="-1">4. DiskFull <a class="header-anchor" href="#_4-diskfull" aria-label="Permalink to &quot;4. DiskFull&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SYMPTOMS: &lt; 50GB free /home/solana/solana/ledger</span></span>
<span class="line"><span></span></span>
<span class="line"><span>ACTIONS:</span></span>
<span class="line"><span>  1. List old snapshots:</span></span>
<span class="line"><span>     sudo ls -lhS /home/solana/solana/ledger/snapshot-* | head -20</span></span>
<span class="line"><span>  2. Delete oldest (keep latest 2-3 full + latest incremental):</span></span>
<span class="line"><span>     sudo rm /home/solana/solana/ledger/snapshot-OLD_SLOT-*</span></span>
<span class="line"><span>  3. Adjust validator snapshot retention via --maximum-snapshots-to-retain N</span></span>
<span class="line"><span>  4. Long-term: add storage capacity</span></span></code></pre></div><h3 id="_5-newversionupgrade" tabindex="-1">5. NewVersionUpgrade <a class="header-anchor" href="#_5-newversionupgrade" aria-label="Permalink to &quot;5. NewVersionUpgrade&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SYMPTOMS: New agave version released</span></span>
<span class="line"><span></span></span>
<span class="line"><span>ACTIONS:</span></span>
<span class="line"><span>  1. Read release notes (breaking changes? feature flags?)</span></span>
<span class="line"><span>  2. Wait 24-48h for community feedback (Discord, Twitter)</span></span>
<span class="line"><span>  3. Test на testnet first (якщо production-level change)</span></span>
<span class="line"><span>  4. Schedule mainnet upgrade у off-peak hours</span></span>
<span class="line"><span>  5. Follow cheatsheet §4 routine upgrade procedure</span></span>
<span class="line"><span>  6. Monitor closely first 1-2 hours</span></span></code></pre></div><h2 id="incident-log-structure" tabindex="-1">Incident log structure <a class="header-anchor" href="#incident-log-structure" aria-label="Permalink to &quot;Incident log structure&quot;">​</a></h2><p>Maintain <code>incidents/</code> folder у team docs:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>incidents/</span></span>
<span class="line"><span>├── 2026-06-02-alpenglow-cluster-restart.md</span></span>
<span class="line"><span>├── 2026-05-23-bot-credits-bug.md</span></span>
<span class="line"><span>├── 2026-04-15-mainnet-skip-rate-spike.md</span></span>
<span class="line"><span>└── ...</span></span></code></pre></div><p>Each file:</p><div class="language-markdown vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;"># Incident YYYY-MM-DD: &lt;short title&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-light-font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold;">**Date**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: 2026-06-08</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-light-font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold;">**Duration**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: 14:23 - 15:47 UTC (~1h 24m)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-light-font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold;">**Severity**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: Warning</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-light-font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold;">**Author**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: Yeva</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## Summary</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;2-3 sentences what happened&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## Timeline</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 14:23 — Alert fired: ValidatorDelinquent</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 14:25 — Acknowledged, started investigation</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 14:30 — Identified: disk full</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 14:45 — Deleted old snapshots, freed 200GB</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 15:00 — Validator caught up</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 15:47 — Confirmed back to normal voting</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## Root Cause</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;technical explanation&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## What Went Well</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Alert fired quickly</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Runbook had exact remediation steps</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## What Didn&#39;t Go Well</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> We should have monitored disk free more proactively</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Runbook didn&#39;t say which snapshots safe to delete</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## Action Items</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [ ] Add disk free monitoring at 70% threshold (warning)</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [ ] Update DiskFull runbook з safe deletion criteria</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [ ] Schedule monthly disk capacity review</span></span></code></pre></div><h2 id="mini-quiz" tabindex="-1">Mini-quiz <a class="header-anchor" href="#mini-quiz" aria-label="Permalink to &quot;Mini-quiz&quot;">​</a></h2>`,28)),t(e,{data:n}),s[1]||(s[1]=a('<h2 id="glossary-additions" tabindex="-1">Glossary additions <a class="header-anchor" href="#glossary-additions" aria-label="Permalink to &quot;Glossary additions&quot;">​</a></h2><p><a href="/glossary#r"><code>Runbook</code></a>, <a href="/glossary#i"><code>Incident response</code></a>, <a href="/glossary#p"><code>Post-mortem</code></a>, <a href="/glossary#s"><code>SEV</code></a></p><hr><p><strong>Попередньо:</strong> <a href="/module-8/8-monitoring-stack">← 8. Monitoring stack</a></p>',4))])}}});export{h as __pageData,u as default};
