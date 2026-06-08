import{C as e,o as n,c as l,a5 as a,E as r}from"./chunks/framework.CW28V7p_.js";const k=JSON.parse('{"title":"8. Monitoring stack (Prometheus + Grafana)","description":"","frontmatter":{},"headers":[],"relativePath":"module-8/8-monitoring-stack.md","filePath":"module-8/8-monitoring-stack.md","lastUpdated":1780937944000}'),h={name:"module-8/8-monitoring-stack.md"},c=Object.assign(h,{setup(p){const i={id:"m8-8-monitoring-stack",title:"🧠 Mini-check: Monitoring stack",intro:"2 питання.",questions:[{type:"compare",q:"Prometheus pull vs Telegram bot push — у чому practical різниця?",ideal:`Prometheus pull:
- Scraper jobs query /metrics endpoint validator periodically (~15s default)
- Centralized data storage у Prometheus DB (TSDB)
- Grafana дashboards для visualization (graphs, alerts)
- Survives validator down (still records absence, alerts via Alertmanager)
- Requires infrastructure: Prometheus server, Grafana, possibly Alertmanager
- Better for trends/history (weeks/months data retention)

Telegram bot push:
- Bot runs ON validator, computes status, pushes message
- No infrastructure beyond Telegram chat
- Immediate notifications (< 1 sec latency)
- Limited history (chat scrollback only)
- Bot dependency: if bot crashes, no alerts
- Better for immediate operator awareness

Production setup: BOTH. Prometheus + Grafana для metrics history/trends, Telegram bot для urgent alerts. Defense in depth — independent paths, different failure modes.`,explanation:"Module 8.8."},{type:"mcq",q:"Які core metrics expose validator до Prometheus?",options:["agave-validator вже exposes /metrics endpoint built-in (no extra setup)","Custom exporter potrebnyy для всіх metrics","Validator versions, slot height, vote credits, banking stage timing","System metrics (CPU/RAM/disk) — node_exporter separately"],correct:[0,2,3],explanation:"agave-validator built-in metrics on /metrics. node_exporter additionally для system metrics. Module 8.8."}]};return(o,s)=>{const t=e("Quiz");return n(),l("div",null,[s[0]||(s[0]=a("",50)),r(t,{data:i}),s[1]||(s[1]=a("",6))])}}});export{k as __pageData,c as default};
