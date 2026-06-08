import{C as n,o as t,c as h,a5 as i,E as l}from"./chunks/framework.CW28V7p_.js";const d=JSON.parse('{"title":"8. SSH","description":"","frontmatter":{},"headers":[],"relativePath":"module-0/8-ssh.md","filePath":"module-0/8-ssh.md","lastUpdated":1780937944000}'),p={name:"module-0/8-ssh.md"},c=Object.assign(p,{setup(k){const a={id:"m0-8-ssh",title:"🧠 Mini-check: SSH",intro:"3 питання — фокус на key-based auth, scp, ProxyJump.",questions:[{type:"explain",q:"Поясни своїми словами як працює SSH key-based authentication. Чому це безпечніше за password?",ideal:`SSH key-based auth використовує asymmetric crypto — пара ключів public + private. Private key зберігається на твоєму ноутбуці (~/.ssh/id_ed25519), public key копіюється на сервер у ~/.ssh/authorized_keys.

Коли ти SSH-ишся:
1. Сервер генерує random challenge string
2. Сервер encrypts challenge твоїм public key
3. Передає encrypted challenge тобі
4. Твій ssh client decrypts його private key (тільки private key може розшифрувати)
5. Sends decrypted answer назад
6. Server verifies → auth pass

Переваги над password:
- Private key ніколи не передається мережею (тільки challenge response)
- Brute-force атаки практично impossible (key 256+ bits ≠ 8-char password)
- Один key може дати access до багатьох серверів (різні public keys у authorized_keys)
- Key можна protect ще додатково passphrase (двофакторний доступ: щось маєш + щось знаєш)`,explanation:"Ключове: asymmetric pair, private stays local, public goes on server, challenge-response handshake. Якщо ти описала pair концепцію + те що private key ніколи не передається — це 80%+. Bonus за пояснення безпекових переваг."},{type:"command",q:"Як скопіювати файл validator-keypair.json з твого ноутбука на сервер eta у /tmp/? Напиши команду scp.",accepts:["scp validator-keypair.json devops_ssh@eta:/tmp/","scp ./validator-keypair.json devops_ssh@eta:/tmp/","scp validator-keypair.json devops_ssh@eta:/tmp","scp ~/validator-keypair.json devops_ssh@eta:/tmp/"],ideal:"scp validator-keypair.json devops_ssh@eta:/tmp/",explanation:"scp syntax: scp <local-file> <user>@<host>:<remote-path>. Якщо host у твоєму ~/.ssh/config — можеш просто eta замість IP. Зворотній копія: scp user@host:/path/file . — з сервера на ноутбук. -r для recursive (папки). -P для non-standard port."},{type:"scenario",q:"Тобі треба SSH-итись на сервер internal-1 який доступний ТІЛЬКИ з bastion server. Тобто bastion публічний, internal-1 — приватний. Як це зробити одною командою без ручного hop?",ideal:`Використати ProxyJump:

ssh -J devops_ssh@bastion devops_ssh@internal-1

-J specifies jump host. SSH спочатку конектиться до bastion, тоді з bastion відкриває tunnel до internal-1, ти отримуєш прямий shell на internal-1 — без ручного логіну на bastion.

Для повторного використання — у ~/.ssh/config:

Host internal-1
    HostName internal-1.private.local
    User devops_ssh
    ProxyJump devops_ssh@bastion

Після цього просто ssh internal-1 — все автоматично.`,explanation:"Ключове: -J flag або ProxyJump config. Якщо описала -J ssh command або згадала ProxyJump у config — повна відповідь. Bonus за config file приклад."}]};return(r,s)=>{const e=n("Quiz");return t(),h("div",null,[s[0]||(s[0]=i("",72)),l(e,{data:a}),s[1]||(s[1]=i("",6))])}}});export{d as __pageData,c as default};
