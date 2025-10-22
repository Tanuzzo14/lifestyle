# Guida alla Configurazione - Configuration Setup Guide

## 🇮🇹 Italiano

### Panoramica
Tutte le chiavi API sensibili sono state centralizzate in un unico file di configurazione (`config.js`) per migliorare la sicurezza del progetto.

### Setup Iniziale

1. **Copia il file template**:
   ```bash
   cp config.example.js config.js
   ```

2. **Modifica il file config.js**:
   Apri `config.js` e inserisci la tua chiave API Gemini:
   ```javascript
   export const CONFIG = {
     GEMINI_API_KEY: 'LA_TUA_CHIAVE_API_QUI',
     GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
   };
   ```

3. **Ottieni una chiave API Gemini**:
   - Visita [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Crea o accedi con il tuo account Google
   - Genera una nuova API key
   - Copia la chiave nel file `config.js`

### ⚠️ Importante per la Sicurezza

- ✅ Il file `config.js` è **escluso dal controllo di versione** (nel `.gitignore`)
- ✅ **Non condividere** mai il file `config.js` contenente le tue chiavi API
- ✅ **Non fare commit** del file `config.js` nel repository
- ✅ Usa sempre `config.example.js` come template

### File Modificati

I seguenti file ora importano la configurazione da `config.js`:
- `index.html` - Applicazione principale
- `pro.html` - Dashboard professionista
- `test_gemini_api.html` - Test API Gemini

### Verifica dell'Installazione

Dopo aver configurato `config.js`, verifica che tutto funzioni:

```bash
# Avvia il server PHP
php -S localhost:8000

# Apri nel browser
# http://localhost:8000/index.html
```

Se la configurazione è corretta, l'applicazione si caricherà senza errori nella console del browser.

---

## 🇬🇧 English

### Overview
All sensitive API keys have been centralized in a single configuration file (`config.js`) to improve project security.

### Initial Setup

1. **Copy the template file**:
   ```bash
   cp config.example.js config.js
   ```

2. **Edit the config.js file**:
   Open `config.js` and insert your Gemini API key:
   ```javascript
   export const CONFIG = {
     GEMINI_API_KEY: 'YOUR_API_KEY_HERE',
     GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
   };
   ```

3. **Get a Gemini API key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create or log in with your Google account
   - Generate a new API key
   - Copy the key into the `config.js` file

### ⚠️ Important for Security

- ✅ The `config.js` file is **excluded from version control** (in `.gitignore`)
- ✅ **Never share** the `config.js` file containing your API keys
- ✅ **Do not commit** the `config.js` file to the repository
- ✅ Always use `config.example.js` as a template

### Modified Files

The following files now import configuration from `config.js`:
- `index.html` - Main application
- `pro.html` - Professional dashboard
- `test_gemini_api.html` - Gemini API tests

### Installation Verification

After configuring `config.js`, verify everything works:

```bash
# Start the PHP server
php -S localhost:8000

# Open in browser
# http://localhost:8000/index.html
```

If the configuration is correct, the application will load without errors in the browser console.

---

## Troubleshooting

### Errore: "Failed to load module script" / Error: "Failed to load module script"

**Soluzione / Solution**:
- Verifica che il file `config.js` esista / Verify that the `config.js` file exists
- Controlla che sia nella stessa directory di `index.html` / Check that it's in the same directory as `index.html`
- Assicurati che il server PHP sia in esecuzione / Make sure the PHP server is running

### Errore: "CONFIG is not defined" / Error: "CONFIG is not defined"

**Soluzione / Solution**:
- Verifica che il file `config.js` contenga l'export corretta / Verify that the `config.js` file contains the correct export
- Controlla la sintassi del file / Check the file syntax
- Riavvia il server PHP / Restart the PHP server

### L'API Gemini non funziona / Gemini API not working

**Soluzione / Solution**:
- Verifica che la chiave API sia valida / Verify that the API key is valid
- Controlla di aver copiato completamente la chiave / Check that you copied the complete key
- Verifica i limiti di quota su Google AI Studio / Check quota limits on Google AI Studio
