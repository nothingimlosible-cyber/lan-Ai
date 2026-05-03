export default async function handler(req, res) {
  // 1. WAJIB JSON BIAR GAK "Unexpected token"
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const { pesan } = await req.json();
    
    // 2. CEK API KEY
    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({ jawaban: 'Error: API Key belum diset di Vercel kak' });
    }

    // 3. PANGGIL OPENAI - PALING SIMPLE
    const openai = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: pesan }]
      })
    });

    const data = await openai.json();
    
    // 4. KALO OPENAI ERROR, KASIH TAU
    if (data.error) {
      return res.status(200).json({ jawaban: 'Error OpenAI: ' + data.error.message });
    }

    // 5. KALO SUKSES
    const jawaban = data.choices[0].message.content;
    return res.status(200).json({ jawaban });

  } catch (error) {
    // 6. KALO SERVER ERROR, KASIH TAU JUGA
    return res.status(200).json({ jawaban: 'Error Server: ' + error.message });
  }
}
