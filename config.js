/**
 * Configurazione del provider AI - Cloudflare Worker
 * Il Worker gestisce tutte le chiamate AI in modo sicuro lato server
 * senza esporre chiavi API nel client
 */

const AI_PROVIDER_CONFIG = {
    name: 'cloudflare',
    endpoint: "https://lifestyle-be.gaetanosmario.workers.dev/",
    description: "Cloudflare Worker per proxy API AI sicuro"
};

// Compatibilità con codice esistente
const GEMINI_API_URL = AI_PROVIDER_CONFIG.endpoint;

/**
 * Chiama l'API AI attraverso Cloudflare Worker
 * @param {string} prompt - Il prompt di testo da inviare all'AI
 * @returns {Promise<Object>} - La risposta JSON dall'AI
 * @throws {Error} Se la chiamata API fallisce con messaggio in italiano
 */
async function callGemini(prompt) {
    if (!prompt || typeof prompt !== 'string') {
        throw new Error('Prompt non valido: deve essere una stringa non vuota');
    }

    try {
        const response = await fetch(AI_PROVIDER_CONFIG.endpoint, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{ 
                    role: "user", 
                    parts: [{ text: prompt }] 
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || errorData.message || `Errore API AI: ${response.status}`;
            
            // Traduci errori comuni in italiano
            if (response.status === 401 || response.status === 403) {
                throw new Error('Errore di autenticazione: verifica la configurazione del Cloudflare Worker');
            } else if (response.status === 429) {
                throw new Error('Troppi richieste: riprova tra qualche minuto');
            } else if (response.status === 500 || response.status === 502 || response.status === 503) {
                throw new Error('Servizio temporaneamente non disponibile: riprova più tardi');
            }
            
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        // Se è già un nostro errore, rilancia
        if (error.message.includes('Errore')) {
            throw error;
        }
        
        // Altrimenti traduci errori di rete
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Errore di connessione: verifica la tua connessione internet');
        }
        
        throw new Error(`Errore durante la chiamata AI: ${error.message}`);
    }
}

/**
 * Ottiene la configurazione corrente del provider AI
 * @returns {Object} Configurazione del provider
 */
function getAIProviderConfig() {
    return { ...AI_PROVIDER_CONFIG };
}
