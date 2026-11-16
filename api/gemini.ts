// Vercel Serverless Function: /api/gemini
// Ermöglicht die sichere Nutzung des Google Gemini API-Keys als Vercel-Secret (GEMINI_API_KEY)
// ohne clientseitige Offenlegung im Browser-Bundle.

const CANDIDATE_FLASH_MODELS = [
  'gemini-4-hydrogen',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
];

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
    return res.status(405).json({ error: 'Nur POST-Anfragen sind für /api/gemini zulässig.' });
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

    const { systemPrompt, userPrompt, model, temperature = 0.2 } = body;

    const clientKey = (typeof body.apiKey === 'string' && body.apiKey.trim() !== 'serverless-proxy')
      ? body.apiKey.trim()
      : '';
    const serverKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
    const activeKey = clientKey || serverKey;

    if (!activeKey) {
      return res.status(401).json({
        error: 'Kein Gemini API-Schlüssel konfiguriert. Bitte hinterlege GEMINI_API_KEY in Vercel als Secret oder trage deinen persönlichen Schlüssel im Dialog ein.'
      });
    }

    if (!userPrompt || typeof userPrompt !== 'string') {
      return res.status(400).json({ error: 'Feld "userPrompt" fehlt oder ist ungültig.' });
    }

    const requestedModels = model
      ? [model, ...CANDIDATE_FLASH_MODELS.filter(m => m !== model)]
      : CANDIDATE_FLASH_MODELS;

    let lastError = null;
    let responseText = '';
    let usedModel = '';

    for (const candidate of requestedModels) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent?key=${activeKey}`;
        const payload: any = {
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        };

        if (systemPrompt && typeof systemPrompt === 'string') {
          payload.systemInstruction = {
            parts: [{ text: systemPrompt }]
          };
        }

        const apiRes = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(45000),
          body: JSON.stringify(payload)
        });

        if (!apiRes.ok) {
          const errData = await apiRes.json().catch(() => ({}));
          lastError = errData?.error?.message || `HTTP ${apiRes.status}`;
          continue;
        }

        const data = await apiRes.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        usedModel = candidate;
        break;
      } catch (err: any) {
        lastError = err.message || String(err);
      }
    }

    if (!responseText && lastError) {
      return res.status(502).json({
        error: `Alle Modellversuche fehlgeschlagen. Letzter Fehler: ${lastError}`
      });
    }

    return res.status(200).json({
      text: responseText,
      model: usedModel
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Interner Serverfehler' });
  }
}
