export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method harus POST' }), { status: 405 });
  }

  try {
    const { history } = await req.json();
    const GEMINI_KEY = process.env.GEMINI_KEY;
    
    if (!GEMINI_KEY) {
      return new Response(JSON.stringify({ error: 'GEMINI_KEY belum di set di Vercel Environment' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: history,
        generationConfig: { temperature: 0.9, maxOutputTokens: 4000 }
      })
    });

    const data = await geminiRes.json();
    
    // Kalo Gemini error, kirim error aslinya
    if (!geminiRes.ok) {
      return new Response(JSON.stringify({ 
        error: `Gemini Error: ${data.error?.message || JSON.stringify(data)}` 
      }), { 
        status: geminiRes.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server Error: ' + e.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
