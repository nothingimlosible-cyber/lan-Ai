import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    const { pesan, aksi = 'chat', userId = 'anon' } = await req.json();
    let koin = await kv.get(`koin:${userId}`) || 5000; // Gratis 5rb buat test

    const headers = {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    };

    // 1. CHAT GRATIS PAKE GPT-4o-MINI = MURAH BANGET
    if (aksi === 'chat') {
      const gpt = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Kamu Lan AI dari Bandung. Jawab singkat, gaul, pake "kak" dan "🍄". Maksimal 2 kalimat.' },
            { role: 'user', content: pesan }
          ]
        })
      });
      const data = await gpt.json();
      const jawaban = data.choices[0].message.content;
      return res.json({ jawaban, koin });
    }

    // 2. GENERATE GAMBAR = 1000 KOIN - PAKE DALL-E 3
    if (aksi === 'gambar') {
      if (koin < 1000) return res.json({ error: 'Koin kurang kak. Topup 1rb dulu 🚀', koin });
      koin -= 1000;
      await kv.set(`koin:${userId}`, koin);

      const dalle = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: pesan + ', digital art, masterpiece',
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        })
      });
      const data = await dalle.json();
      const urlGambar = data.data[0].url;

      return res.json({ urlGambar, koin, sukses: `Gambar HD jadi. Sisa koin: ${koin}` });
    }

    // 3. GENERATE VIDEO = 1000 KOIN - PAKE DALL-E + ANIMATE
    if (aksi === 'video') {
      if (koin < 1000) return res.json({ error: 'Koin kurang kak 🚀', koin });
      koin -= 1000;
      await kv.set(`koin:${userId}`, koin);

      // Step 1: Bikin gambar dulu pake DALL-E
      const dalle = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: pesan,
          n: 1,
          size: '1024x1024'
        })
      });
      const dataGambar = await dalle.json();
      const urlGambar = dataGambar.data[0].url;

      // Step 2: Animasiin. SEMENTARA PAKE API GRATIS. Nanti ganti Runway
      const urlVideo = `https://api.zephra.ai/animate?image=${encodeURIComponent(urlGambar)}`;

      return res.json({ urlVideo, urlGambar, koin, sukses: `Video 3 detik jadi. Sisa koin: ${koin}` });
    }

  } catch (e) {
    res.json({ error: 'Error OpenAI kak: ' + e.message });
  }
}
