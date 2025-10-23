# Quick Start - Gemini API Integration

## Problema Risolto
❌ **Prima**: "GEMINI_API_KEY is not found" - chiave API esposta nel client  
✅ **Dopo**: Chiave API protetta lato server tramite proxy PHP

## Setup Rapido (3 Passi)

### 1️⃣ Configura la Chiave API
```bash
cp config.php.example config.php
```

Modifica `config.php` e inserisci la tua chiave API Gemini:
```php
define('GEMINI_API_KEY', 'la-tua-chiave-api-qui');
```

### 2️⃣ Testa la Configurazione
```bash
chmod +x test_gemini_setup.sh
./test_gemini_setup.sh
```

### 3️⃣ Deploy
- Assicurati che PHP >= 7.4 sia installato
- Verifica che cURL sia abilitato in PHP
- Deploy su un web server (Apache, Nginx, etc.)

## Come Ottenere una Chiave API Gemini

1. Vai su [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Accedi con il tuo account Google
3. Crea una nuova API key
4. Copia la chiave e aggiungila a `config.php`

## Verifica che Tutto Funzioni

### Test Automatico
```bash
./test_gemini_setup.sh
```

Dovresti vedere:
```
All tests passed! ✓
```

### Test Manuale
1. Apri `test_gemini_api.html` nel browser
2. Clicca sui pulsanti di test
3. Verifica che le risposte arrivino correttamente

## File Importanti

| File | Descrizione | Committato? |
|------|-------------|-------------|
| `config.php` | Chiave API (SENSIBILE) | ❌ No |
| `config.php.example` | Template | ✅ Sì |
| `gemini_proxy.php` | Proxy server-side | ✅ Sì |
| `.gitignore` | Include config.php | ✅ Sì |

## Sicurezza

✅ **Fatto**:
- Chiave API spostata lato server
- config.php escluso da Git
- Tutte le chiamate API usano il proxy
- Nessuna vulnerabilità rilevata (CodeQL)

⚠️ **Raccomandato per Produzione**:
- Usa HTTPS
- Implementa rate limiting
- Aggiungi autenticazione
- Monitora l'uso dell'API

## Risoluzione Problemi

### Errore: "config.php file not found"
```bash
cp config.php.example config.php
# Modifica config.php con la tua chiave API
```

### Errore: "Gemini API key not configured"
Apri `config.php` e sostituisci `YOUR_GEMINI_API_KEY_HERE` con la tua chiave API.

### Errore: "Failed to communicate with Gemini API"
- Verifica che la chiave API sia valida
- Controlla che il server abbia accesso a Internet
- Assicurati che cURL sia abilitato: `php -m | grep curl`

## Documentazione Completa

- 📖 **GEMINI_SETUP.md** - Guida dettagliata
- 📖 **GEMINI_FIX_SUMMARY.md** - Documentazione tecnica completa
- 📖 **SECURITY.md** - Best practices di sicurezza
- 📖 **GEMINI_INTEGRATION.md** - Architettura e implementazione

## Supporto

Per problemi o domande, consulta la documentazione completa o apri una issue su GitHub.

---

✅ **Tutto pronto!** L'integrazione Gemini API è ora sicura e funzionante.
