import{C as i,o,c as n,a5 as a,E as r}from"./chunks/framework.CW28V7p_.js";const c=JSON.parse('{"title":"3. Votes, credits, finality","description":"","frontmatter":{},"headers":[],"relativePath":"module-4/3-votes-credits.md","filePath":"module-4/3-votes-credits.md","lastUpdated":1780937944000}'),l={name:"module-4/3-votes-credits.md"},k=Object.assign(l,{setup(d){const s={id:"m4-3-votes-credits",title:"🧠 Mini-check: Votes & credits",intro:"3 питання — як vote translates у credits і rewards.",questions:[{type:"mcq",q:"Що з цього вірно про vote credits на classical Solana (pre-Alpenglow Tower BFT)? (обери всі)",options:["Кожен successful vote landed = 1 credit","Credits accumulate per epoch","End of epoch: credits → lamport rewards proportional до stake share",'Credits можна "withdraw" як токени'],correct:[0,1,2],explanation:"Credits track voting performance. Convert до lamport rewards via inflation у кінці epoch. Не withdrawable directly — automatically distributed as SOL rewards. Module 4.3."},{type:"command",q:"Як подивитись скільки credits ти заробила у останніх 5 epochs?",accepts:['solana vote-account YOUR_VOTE | grep -A 7 "Epoch Voting"',"solana vote-account YOUR_VOTE | grep -A 5 Credits",'sudo /home/solana/ag/bin/solana vote-account 3GDBUfmTyL9d3KDb84zc1vUFCj8znunCEYpKuzsEdkeo --url http://localhost:8899 | grep -A 7 "Epoch Voting"'],ideal:'solana vote-account YOUR_VOTE | grep -A 7 "Epoch Voting"',explanation:'vote-account output має "Epoch Voting History" section. grep -A N виводить N рядків після match. Module 4.3.'},{type:"explain",q:"Поясни як rewards розподіляються validator vs delegators після epoch end.",ideal:`У кінці кожного epoch:

1. Cluster computes total inflation pool — це нові SOL minted (~5%/year currently, decreasing 15%/year per inflation schedule).

2. Pool divided across active validators proportional до їх vote credits earned:
   validator_share = (their_credits / total_credits_all_validators) × inflation_pool

3. validator_share далі split:
   - Commission % йде до validator identity (operator income)
   - (100 - commission)% розподіляється до delegators proportional to їх stake відносно validator total stake

Приклад:
Validator earned 1000 SOL inflation share, commission 10%.
- Operator: 100 SOL до identity
- Delegators: 900 SOL spliticed proportional до each delegator stake

Додатково: 50% transaction fees йдуть до leader (validator), не до delegators.

Деlegators see rewards у формі їх stake account balance growing autom every epoch — їх стake "compounds" if not withdrawn.`,explanation:"Inflation pool → vote credits → validator share → commission split. Module 4.3."}]};return(h,t)=>{const e=i("Quiz");return o(),n("div",null,[t[0]||(t[0]=a("",49)),r(e,{data:s}),t[1]||(t[1]=a("",6))])}}});export{c as __pageData,k as default};
