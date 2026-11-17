// Vercel Serverless Function: /api/embed
// Erzeugt 768-dimensionale Text-Embeddings via gemini-embedding-001

function isOriginAllowed(req: any): boolean {
  const origin = req.headers?.origin;
  if (!origin) return true;
  const host = req.headers?.host;
  if (!host) return true;
  try {
    const parsedOrigin = new URL(origin);
    if (parsedOrigin.host === host) return true;
    const allowedOrigin = (process.env.ALLOWED_ORIGIN || '').trim();
    if (allowedOrigin && origin === allowedOrigin) return true;
    return false;
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  const origin = req.headers?.origin;
  res.setHeader('Vary', 'Origin');
  if (origin && isOriginAllowed(req)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    if (!isOriginAllowed(req)) {
      return res.status(403).json({ error: 'Origin nicht erlaubt.' });
    }
    res.status(200).end();
    return;
  }

  if (!isOriginAllowed(req)) {
    return res.status(403).json({ error: 'Cross-Origin-Zugriff nicht erlaubt.' });
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
    const candidateKeys: string[] = [];
    const pushKey = (raw?: string) => {
      if (!raw) return;
      for (const k of raw.split(',')) {
        const clean = k.trim();
        if (clean && !candidateKeys.includes(clean)) candidateKeys.push(clean);
      }
    };
    if (clientKey) pushKey(clientKey);
    pushKey(process.env.GEMINI_API_KEY);
    pushKey(process.env.GEMINI_BACKUP_API_KEY);
    pushKey(process.env.GEMINI_API_KEYS);
    pushKey(process.env.VITE_GEMINI_API_KEY);

    if (candidateKeys.length === 0) {
      return res.status(401).json({ error: 'Kein API-Schlüssel konfiguriert.' });
    }

    const requestedDim = typeof body.outputDimensionality === 'number' && body.outputDimensionality > 0
      ? Math.min(3072, Math.max(128, Math.floor(body.outputDimensionality)))
      : 768;
    const taskType = body.taskType === 'RETRIEVAL_DOCUMENT' ? 'RETRIEVAL_DOCUMENT' : 'RETRIEVAL_QUERY';

    let lastStatus = 502;
    let lastErr = 'Unbekannter Embedding-Fehler';
    for (const activeKey of candidateKeys) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${encodeURIComponent(activeKey)}`;
        const apiRes = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(25000),
          body: JSON.stringify({
            model: 'models/gemini-embedding-001',
            content: { parts: [{ text }] },
            taskType,
            outputDimensionality: requestedDim
          })
        });

        if (!apiRes.ok) {
          const errData = await apiRes.json().catch(() => ({}));
          lastStatus = apiRes.status;
          lastErr = errData?.error?.message || `HTTP ${apiRes.status}`;
          continue;
        }

        const data = await apiRes.json();
        return res.status(200).json({
          embedding: data.embedding?.values || []
        });
      } catch (err: any) {
        lastErr = err?.message || String(err);
      }
    }

    return res.status(lastStatus).json({ error: lastErr });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Interner Serverfehler' });
  }
}
