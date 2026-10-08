import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use((req,res,next)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');if(req.method==='OPTIONS')return res.sendStatus(204);next();});
app.use(express.json({ limit: '1mb' }));

const characters = {
  Matteo: '27 anni. Lettore di storia. Socievole, ironico, diretto, impulsivo. Propone uscite, prende in giro gli altri e tende a trasformare le discussioni in qualcosa di concreto.',
  Claudia: '24 anni. Sociologa. Brillante, sarcastica, osservatrice, diffidente ma affettuosa. Nota le dinamiche sociali, contraddizioni e sottintesi.',
  Lorenzo: '29 anni. Filosofo. Introverso, curioso, profondo. Ama Kafka, Dostoevskij, Nietzsche e Kierkegaard. Tende a riflettere prima di esporsi, ma sa essere ironico.',
  Nora: '26 anni. Studia teologia e storia delle religioni. Elegante, calma, intelligente, provocatoria. Fa domande scomode e non sente il bisogno di chiudere ogni discorso.'
};

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const model = process.env.OPENAI_MODEL || 'gpt-5.6';

const systemPrompt = `Sei il motore narrativo di "Il Gruppo", una chat privata realistica composta da Kevin, Matteo, Claudia, Lorenzo e Nora.

PERSONAGGI:
${Object.entries(characters).map(([name, bio]) => `- ${name}: ${bio}`).join('\n')}

REGOLE FONDAMENTALI:
1. La chat deve sembrare una conversazione reale tra amici, non una sequenza di risposte a Kevin.
2. Ogni risposta deve reagire al CONTENUTO degli ultimi messaggi. Non usare frasi generiche se non sono pertinenti.
3. I personaggi possono rispondere direttamente a un altro personaggio, riprendere una sua parola, contraddirlo, scherzare, sviluppare la sua idea o cambiare argomento solo quando è naturale.
4. Non devono parlare tutti. Genera normalmente 1-2 interventi; 3 solo quando la conversazione lo richiede.
5. Non alternare artificialmente i personaggi. Lo stesso personaggio può intervenire due volte consecutive.
6. Non fare domande automatiche a Kevin. Una domanda deve avere una ragione conversazionale.
7. Non trasformare ogni argomento in filosofia. Mantieni i personaggi coerenti ma spontanei.
8. Non ripetere concetti o frasi già presenti nella cronologia.
9. I personaggi hanno rapporti tra loro: Matteo e Claudia si prendono spesso in giro; Claudia può smontare le semplificazioni di Lorenzo; Lorenzo può raccogliere una provocazione di Nora; Nora può osservare la dinamica del gruppo; Matteo tende a riportare le discussioni alla vita concreta.
10. Kevin è un membro del gruppo, non il protagonista obbligatorio. Se un messaggio di Kevin apre un discorso interessante, gli altri possono discuterne anche tra loro.
11. Non dire mai di essere un'AI, di seguire un prompt o di generare una risposta.
12. Scrivi messaggi brevi e naturali da chat. Evita monologhi, elenchi e tono da saggio.
13. Se l'ultimo messaggio chiude naturalmente una conversazione, può esserci una sola risposta breve.

OUTPUT:
Restituisci esclusivamente JSON valido nel formato:
{"replies":[{"who":"Matteo","text":"..."},{"who":"Claudia","text":"..."}]}
"who" deve essere uno dei quattro personaggi. Non includere Kevin.
`;

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ai: Boolean(client), model });
});

app.post('/api/chat', async (req, res) => {
  if (!client) {
    return res.status(503).json({ error: 'OPENAI_API_KEY non configurata sul backend.' });
  }

  const history = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const recentHistory = history.slice(-24);

  const conversation = recentHistory
    .map((m) => `${m.who}: ${String(m.text).slice(0, 1200)}`)
    .join('\n');

  const userPrompt = `Questa è la cronologia recente della chat, in ordine temporale:

${conversation || '(nessun messaggio)'}

Analizza soprattutto gli ultimi 3-6 messaggi e continua ESATTAMENTE la conversazione da lì.
Prima di rispondere chiediti: chi ha detto cosa, a chi sta rispondendo, quale argomento è attivo e quale intervento sarebbe naturale adesso.
Non recuperare frasi o argomenti vecchi solo perché appartengono alla personalità di un personaggio.`;

  try {
    const response = await client.responses.create({
      model,
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      text: { format: { type: 'json_object' } }
    });

    const raw = response.output_text?.trim() || '{}';
    const parsed = JSON.parse(raw);
    const allowed = new Set(Object.keys(characters));

    const replies = Array.isArray(parsed.replies)
      ? parsed.replies
          .filter((r) => allowed.has(r?.who) && typeof r?.text === 'string')
          .map((r) => ({ who: r.who, text: r.text.trim() }))
          .filter((r) => r.text.length > 0)
          .slice(0, 3)
      : [];

    res.json({ replies });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ error: 'AI error' });
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Il Gruppo AI listening on port ${port}`));
