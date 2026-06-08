import{C as i,o as l,c as r,a5 as t,E as n}from"./chunks/framework.CW28V7p_.js";const c=JSON.parse('{"title":"3. Monitoring & alerting","description":"","frontmatter":{},"headers":[],"relativePath":"module-8/3-monitoring.md","filePath":"module-8/3-monitoring.md","lastUpdated":1780937944000}'),o={name:"module-8/3-monitoring.md"},u=Object.assign(o,{setup(d){const e={id:"m8-3-monitoring",title:"🧠 Mini-check: Monitoring",intro:"2 питання.",questions:[{type:"mcq",q:"Що з цього важливо моніторити для validator?",options:["Vote credits (growing per epoch)","Delinquent status (binary)","Slot lag vs cluster max","System resources (RAM, disk, CPU)"],correct:[0,1,2,3],explanation:"Всі critical metrics. Module 8.3."},{type:"compare",q:"Push vs pull alerting?",ideal:`Push: alert active sends message коли threshold violated. Examples: Telegram bot (your setup), Slack webhook, PagerDuty.
- + Low latency (immediate notification)
- + No infrastructure якщо use external service
- - Bot/service single point failure

Pull: external monitoring service queries validator periodically. Examples: stakewiz.com, validator.app, Zabbix.
- + Centralized dashboards across many validators
- + Survives validator down (still detects, will alert)
- - Polling latency (typically 30-60s)

Best practice: BOTH. Push для immediate (validator-side bot). Pull для cross-check (external service).

Your LumLabs setup: Telegram monitor bot (push) + likely stakewiz/validator.app (pull) для belt+suspenders.`,explanation:"Module 8.3."}]};return(h,a)=>{const s=i("Quiz");return l(),r("div",null,[a[0]||(a[0]=t("",31)),n(s,{data:e}),a[1]||(a[1]=t("",6))])}}});export{c as __pageData,u as default};
