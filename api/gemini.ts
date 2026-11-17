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

    const { systemPrompt, userPrompt, model, temperature = 0.2, jsonMode = false, maxOutputTokens } = body;

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

    const resolvedMaxTokens = Math.min(16384, Math.max(1024, Number(maxOutputTokens) || 8192));

    let lastError: string | null = null;
    let lastStatus = 502;
    let responseText = '';
    let usedModel = '';

    outer: for (const candidate of requestedModels) {
      for (const activeKey of candidateKeys) {
        try {
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent?key=${encodeURIComponent(activeKey)}`;
          const generationConfig: any = {
            temperature,
            topP: 0.95,
            maxOutputTokens: resolvedMaxTokens,
          };
          if (jsonMode) {
            generationConfig.responseMimeType = 'application/json';
          }
          const payload: any = {
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig
          };

          if (systemPrompt && typeof systemPrompt === 'string') {
            payload.systemInstruction = {
              parts: [{ text: systemPrompt }]
            };
          }

          const apiRes = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(12000),
            body: JSON.stringify(payload)
          });

          if (!apiRes.ok) {
            const errData = await apiRes.json().catch(() => ({}));
            lastError = errData?.error?.message || `HTTP ${apiRes.status}`;
            lastStatus = apiRes.status;
            // Bei 429/401/403 direkt nächsten Key versuchen, bei 404 Modell wechseln
            if (apiRes.status === 429 || apiRes.status === 401 || apiRes.status === 403) {
              continue;
            }
            break;
          }

          const data = await apiRes.json();
          const parts = data.candidates?.[0]?.content?.parts || [];
          const nonThoughtText = parts
            .filter((p: any) => !p.thought && typeof p.text === 'string')
            .map((p: any) => p.text)
            .join('');
          responseText = nonThoughtText || parts?.[0]?.text || '';
          if (!responseText) {
            lastError = 'Leere Modellantwort';
            continue;
          }
          usedModel = candidate;
          break outer;
        } catch (err: any) {
          lastError = err.message || String(err);
        }
      }
    }

    if (!responseText && lastError) {
      return res.status(lastStatus === 429 ? 429 : 502).json({
        error: `Alle Modell-/Key-Versuche fehlgeschlagen. Letzter Fehler: ${lastError}`
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
