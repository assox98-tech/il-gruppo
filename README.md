# Il Gruppo — PWA V1

Versione pensata per essere sviluppata da Windows e installata su iPhone come Home Screen Web App.

## Prova immediata su Windows

Richiede Node.js 20+.

```powershell
cd server
npm install
node server.js
```

Apri `http://localhost:3000` sul PC per provare la UI.

## Per l'iPhone

La PWA deve essere pubblicata su un dominio HTTPS. Una volta online:
1. apri l'URL con Safari su iPhone;
2. Condividi;
3. Aggiungi a Home Screen;
4. abilita “Apri come app web”.

## AI reale

Imposta sul server:

```powershell
$env:OPENAI_API_KEY="LA_TUA_CHIAVE"
$env:OPENAI_MODEL="gpt-5.6"
node server.js
```

Non inserire mai la chiave API nel frontend.

## Struttura
- public/ — PWA
- server/ — backend Express + OpenAI Responses API

La modalità Demo locale funziona senza API e salva la chat in localStorage.
