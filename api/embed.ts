// Vercel Serverless Function: /api/embed
// Erzeugt Text-Embeddings via text-embedding-004

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST-Anfragen sind zulässig.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Ungültiges JSON im Request-Body.' });
      }
    }
    body = body || {};

    const text = body.text;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Feld "text" fehlt oder ist ungültig.' });
    }

    const clientKey = (typeof body.apiKey === 'string' && body.apiKey.trim() !== 'serverless-proxy')
      ? body.apiKey.trim()
      : '';
    const serverKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
    const activeKey = clientKey || serverKey;

    if (!activeKey) {
      return res.status(401).json({ error: 'Kein API-Schlüssel konfiguriert.' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${activeKey}`;
    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text }] }
      })
    });

    if (!apiRes.ok) {
      const errData = await apiRes.json().catch(() => ({}));
      return res.status(apiRes.status).json({ error: errData?.error?.message || `HTTP ${apiRes.status}` });
    }

    const data = await apiRes.json();
    return res.status(200).json({
      embedding: data.embedding?.values || []
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Interner Serverfehler' });
  }
}
