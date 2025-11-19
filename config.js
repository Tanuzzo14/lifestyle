let GEMINI_API_URL = "https://lifestyle-be.gaetanosmario.workers.dev/";

async function callGemini(prompt) {
    const res = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
    });

    return await res.json();
}
