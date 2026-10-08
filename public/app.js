const members={
  Matteo:{age:27,field:'Storia',color:'#b48a68',bio:'Socievole, ironico e diretto. Quello che propone di uscire prima ancora che gli altri abbiano finito il messaggio.',avatar:'M'},
  Claudia:{age:24,field:'Sociologia',color:'#9b7181',bio:'Brillante, sarcastica e osservatrice. Nota subito le dinamiche sociali e raramente lascia passare una contraddizione.',avatar:'C'},
  Lorenzo:{age:29,field:'Filosofia',color:'#687a8e',bio:'Introverso e curioso. Kafka, Dostoevskij, Nietzsche e Kierkegaard sono presenze quasi domestiche.',avatar:'L'},
  Nora:{age:26,field:'Teologia e storia delle religioni',color:'#8c8064',bio:'Elegante, calma e provocatoria. Fa domande scomode senza avere sempre bisogno di una risposta.',avatar:'N'}
};

const seed=[
  {id:1,who:'Matteo',text:'Ragazzi, domanda seria: perché ogni volta che diciamo “una cosa tranquilla” finiamo a discutere di filosofia alle due di notte?',time:'21:14'},
  {id:2,who:'Claudia',text:'Perché Lorenzo usa la parola “ontologico” come altri usano “boh”.',time:'21:15'},
  {id:3,who:'Lorenzo',text:'Mi difendo dicendo che almeno non uso “vibes” come categoria epistemologica.',time:'21:16'},
  {id:4,who:'Nora',text:'Aspettate. La vera domanda è perché abbiamo bisogno che una serata abbia una categoria.',time:'21:17'}
];

let messages=JSON.parse(localStorage.getItem('ilgruppo.messages')||'null')||seed;
let mode=localStorage.getItem('ilgruppo.mode')||'demo';
let usedReplies=JSON.parse(localStorage.getItem('ilgruppo.usedReplies')||'[]');
const app=document.querySelector('#app');

function save(){
  localStorage.setItem('ilgruppo.messages',JSON.stringify(messages));
  localStorage.setItem('ilgruppo.usedReplies',JSON.stringify(usedReplies.slice(-40)));
}

function esc(s){
  return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function render(){
  app.innerHTML=`<header><div><div class="eyebrow">CHAT PRIVATA</div><h1>Il Gruppo</h1><div class="sub">Kevin · Matteo · Claudia · Lorenzo · Nora</div></div><button id="people">◉</button></header>
  <main id="chat">${messages.map(m=>`<article class="row ${m.who==='Kevin'?'me':''}"><div class="avatar" style="--c:${members[m.who]?.color||'#6d6258'}">${members[m.who]?.avatar||'K'}</div><div class="bubble"><div class="name">${esc(m.who)}</div><div>${esc(m.text)}</div><div class="time">${m.time}</div></div></article>`).join('')}</main>
  <form id="composer"><input id="msg" autocomplete="off" placeholder="Scrivi al gruppo…"><button>Invia</button></form>
  <aside id="panel" class="hidden"><div class="panelHead"><b>Il gruppo</b><button id="close">×</button></div>
  ${Object.entries(members).map(([n,m])=>`<div class="person"><div class="avatar" style="--c:${m.color}">${m.avatar}</div><div><b>${n}</b><small>${m.age} · ${m.field}</small><p>${m.bio}</p></div></div>`).join('')}
  <div class="settings"><label>Modalità</label><select id="mode"><option value="demo" ${mode==='demo'?'selected':''}>Demo locale</option><option value="ai" ${mode==='ai'?'selected':''}>Backend AI</option></select><button id="clear">Cancella conversazione</button></div></aside>`;

  document.querySelector('#chat').scrollTop=999999;
  document.querySelector('#composer').onsubmit=send;
  document.querySelector('#people').onclick=()=>document.querySelector('#panel').classList.remove('hidden');
  document.querySelector('#close').onclick=()=>document.querySelector('#panel').classList.add('hidden');
  document.querySelector('#clear').onclick=()=>{messages=[];usedReplies=[];save();render()};
  document.querySelector('#mode').onchange=e=>{mode=e.target.value;localStorage.setItem('ilgruppo.mode',mode)};
}

function addReply(who,text,delay){
  setTimeout(()=>{
    messages.push({id:Date.now()+Math.random(),who,text,time:new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})});
    usedReplies.push(text);
    save();
    render();
  },delay);
}

function pickUnique(pool,count){
  const available=pool.filter(x=>!usedReplies.includes(x[1]));
  const source=available.length>=count?available:pool.filter(x=>!usedReplies.includes(x[1])).concat(pool);
  const shuffled=[...source].sort(()=>Math.random()-0.5);
  const result=[];
  for(const x of shuffled){
    if(!result.some(r=>r[1]===x[1])) result.push(x);
    if(result.length===count) break;
  }
  return result;
}

function demoReply(t){
  const lower=t.toLowerCase();
  const recent=messages.slice(-8).map(m=>m.text.toLowerCase()).join(' ');
  let pool;

  if(/kafka|dostoevsk|nietzsche|filosof|libro|romanzo|lettura/.test(lower)){
    pool=[
      ['Lorenzo','La cosa interessante è che continuiamo a cercare una risposta nei libri anche quando sappiamo già quale domanda ci interessa davvero.'],
      ['Claudia','O forse ci piace molto l’idea di essere persone che leggono libri difficili. È una distinzione meno nobile, ma più onesta.'],
      ['Nora','La lettura diventa interessante quando smette di confermarci.'],
      ['Matteo','Io su Dostoevskij ho un’unica posizione: posso parlarne per ore, purché ci sia qualcosa da mangiare.'],
      ['Lorenzo','Kafka almeno ha il vantaggio di non fingere che il mondo sia più ordinato di quanto sia.'],
      ['Claudia','E infatti eccoci qui, a trasformare una chat in un seminario universitario senza averlo deciso.']
    ];
  } else if(/uscir|aperitiv|birr|drink|cena|stasera|domani|weekend/.test(lower)){
    pool=[
      ['Matteo','Finalmente una proposta che non richiede una bibliografia. Io ci sono.'],
      ['Claudia','Dipende da dove. “Usciamo” è una frase molto più impegnativa di quanto sembri.'],
      ['Nora','Io sceglierei un posto dove si possa parlare senza urlare.'],
      ['Lorenzo','Per una volta sono favorevole a una decisione pratica. Segnatevelo.'],
      ['Matteo','Bene. Io propongo di decidere prima che qualcuno trasformi tutto in una riflessione esistenziale.'],
      ['Claudia','Troppo tardi. Lorenzo ha già aperto la porta dell’abisso.']
    ];
  } else if(/politic|societ|social|persone|gente|lavor|universit|studio/.test(lower)){
    pool=[
      ['Claudia','La parte interessante è che tutti pensano di parlare del problema, mentre spesso stanno parlando di sé.'],
      ['Lorenzo','Mi chiedo quanto di ciò che chiamiamo scelta sia semplicemente abitudine con un nome più elegante.'],
      ['Nora','La società cambia più lentamente di quanto amiamo raccontarci.'],
      ['Matteo','Io intanto cerco di capire se questa discussione porta da qualche parte o se dobbiamo solo berci qualcosa.'],
      ['Claudia','Il problema è proprio quando una conversazione diventa troppo soddisfatta delle proprie conclusioni.'],
      ['Nora','Una risposta troppo semplice di solito nasconde una domanda che non abbiamo ancora formulato.']
    ];
  } else {
    pool=[
      ['Matteo','Aspetta, questa cosa merita una risposta seria.'],
      ['Claudia','Non sono completamente convinta. C’è un dettaglio che mi sfugge.'],
      ['Lorenzo','Non so se sono d’accordo, ma la questione è più interessante di quanto sembri.'],
      ['Nora','Mi interessa più capire perché lo pensi che stabilire subito se hai ragione.'],
      ['Matteo','Ok, questa la voglio sentire fino in fondo.'],
      ['Claudia','Questa conversazione sta prendendo una piega sorprendentemente specifica.'],
      ['Lorenzo','Mi hai fatto cambiare leggermente prospettiva. Non è poco.'],
      ['Nora','La prima impressione che ho avuto è probabilmente quella sbagliata.'],
      ['Matteo','Va bene, mi avete convinto almeno a discuterne.'],
      ['Claudia','Secondo me stiamo dando per scontata proprio la cosa più interessante.'],
      ['Lorenzo','Potremmo anche non avere bisogno di arrivare subito a una conclusione.'],
      ['Nora','Interessante. Però io metterei in discussione una premessa.']
    ];
  }

  if(recent.includes('troppo tardi') && lower.includes('tardi')){
    pool=pool.filter(x=>!x[1].includes('Troppo tardi'));
  }

  const count=Math.random()<0.55?1:2;
  const chosen=pickUnique(pool,count);
  chosen.forEach((x,i)=>addReply(x[0],x[1],650+i*(850+Math.floor(Math.random()*500))));
}

async function send(e){
  e.preventDefault();
  const input=document.querySelector('#msg');
  const text=input.value.trim();
  if(!text)return;

  messages.push({id:Date.now(),who:'Kevin',text,time:new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})});
  input.value='';
  save();
  render();

  if(mode==='ai'){
    try{
      const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages})});
      if(!r.ok)throw new Error('Backend non disponibile');
      const d=await r.json();
      if(d.replies) d.replies.forEach((x,i)=>addReply(x.who,x.text,i*700));
    }catch(err){
      console.error(err);
      demoReply(text);
    }
  }else{
    demoReply(text);
  }
}

if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
render();
