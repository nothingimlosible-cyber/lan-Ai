// File: /api/chat.js
export default async function handler(req, res) {
  // Biar bisa dipanggil dari HTML
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'POST') return res.status(405).json({ error: 'Pake POST kak' });

  try {
    const { history } = req.body;

    // GEMINI_KEY diambil dari Vercel Environment. Aman!
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: history,
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2048, // 4000+ karakter
          topP: 0.95
        }
      })
    });

    const data = await geminiRes.json();
    return res.status(200).json(data);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
