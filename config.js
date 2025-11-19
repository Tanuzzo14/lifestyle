// Cloudflare Worker URL for Gemini API proxy
const GEMINI_API_URL = "https://lifestyle-be.gaetanosmario.workers.dev/";

/**
 * Call Gemini API through Cloudflare Worker
 * @param {string} prompt - The text prompt to send to Gemini
 * @returns {Promise<Object>} - The JSON response from Gemini
 */
async function callGemini(prompt) {
    const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Gemini API error: ${response.status}`;
        throw new Error(errorMessage);
    }

    return await response.json();
}
