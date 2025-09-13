// Lightweight Gemini client for server-side use
// Uses dynamic import of node-fetch to support CommonJS

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function getFetch() {
  // node-fetch is ESM; use dynamic import to get default export
  const fetch = (await import('node-fetch')).default;
  return fetch;
}

/**
 * Generate text with Gemini using a single text prompt.
 * @param {{ text: string }} params
 * @returns {Promise<string>} message text
 */
async function generateWithGemini({ text }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY missing');
  }
  const fetch = await getFetch();
  const res = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text }]
        }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const msg =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    'Sorry, I could not generate a response.';
  return msg;
}

module.exports = { generateWithGemini };