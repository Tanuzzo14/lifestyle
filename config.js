// Configurazione API Gemini
// NOTA: Le chiamate all'API Gemini sono ora dirette dal client
// La configurazione viene caricata da config.json
let GEMINI_API_KEY = 'AIzaSyCCE_m_W_L2DpBwA3hjaqMrOj-W1ws3Kv4';
let GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash';

// Carica la configurazione da config.json
fetch('config.json')
  .then(response => response.json())
  .then(config => {
    GEMINI_API_KEY = config.GEMINI_API_KEY;
    GEMINI_API_URL = config.GEMINI_API_URL;
  })
  .catch(error => {
    console.error('Errore nel caricamento di config.json:', error);
  });
