import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const CANDIDATE_FLASH_MODELS = [
  'gemini-4-hydrogen',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
];

function geminiLocalProxyPlugin(localEnv: Record<string, string>): Plugin {
  const getServerKey = () => (
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    localEnv.GEMINI_API_KEY ||
    localEnv.VITE_GEMINI_API_KEY ||
    ''
  ).trim();
  return {
    name: 'gemini-local-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        // 1. /api/gemini endpoint
        if (url === '/api/gemini') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }

          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
            return;
          }

          let rawBody = '';
          req.on('data', (chunk) => {
            rawBody += chunk;
          });

          req.on('end', async () => {
            try {
              const body = JSON.parse(rawBody || '{}');
              const clientKey = (typeof body.apiKey === 'string' && body.apiKey.trim() !== 'serverless-proxy')
                ? body.apiKey.trim()
                : '';
              const serverKey = getServerKey();
              const activeKey = clientKey || serverKey;

              if (!activeKey) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  error: 'Kein Gemini API-Schlüssel konfiguriert. Bitte hinterlege GEMINI_API_KEY in der Umgebung oder trage deinen Schlüssel in den Einstellungen ein.'
                }));
                return;
              }

              const { systemPrompt, userPrompt, model, temperature = 0.2, jsonMode = false, maxOutputTokens } = body;
              const requestedModels = model ? [model, ...CANDIDATE_FLASH_MODELS.filter(m => m !== model)] : CANDIDATE_FLASH_MODELS;
              const resolvedMaxTokens = Math.min(16384, Math.max(1024, Number(maxOutputTokens) || 8192));

              let lastError = null;
              let responseText = '';
              let usedModel = '';

              for (const candidate of requestedModels) {
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

                  if (systemPrompt) {
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
                    continue;
                  }

                  const data = await apiRes.json();
                  const parts = data.candidates?.[0]?.content?.parts || [];
                  const nonThought = parts
                    .filter((p: any) => !p.thought && typeof p.text === 'string')
                    .map((p: any) => p.text)
                    .join('');
                  responseText = nonThought || parts?.[0]?.text || '';
                  if (!responseText) {
                    lastError = 'Leere Modellantwort';
                    continue;
                  }
                  usedModel = candidate;
                  break;
                } catch (err: any) {
                  lastError = err.message || String(err);
                }
              }

              if (!responseText && lastError) {
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: `Generierung fehlgeschlagen: ${lastError}` }));
                return;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text: responseText, model: usedModel }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Serverfehler' }));
            }
          });
          return;
        }

        // 2. /api/embed endpoint
        if (url === '/api/embed') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }

          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
            return;
          }

          let rawBody = '';
          req.on('data', (chunk) => {
            rawBody += chunk;
          });

          req.on('end', async () => {
            try {
              const body = JSON.parse(rawBody || '{}');
              const text = body.text || '';
              const clientKey = (typeof body.apiKey === 'string' && body.apiKey.trim() !== 'serverless-proxy')
                ? body.apiKey.trim()
                : '';
              const serverKey = getServerKey();
              const activeKey = clientKey || serverKey;

              if (!activeKey || !text) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Text und aktiver API-Key erforderlich' }));
                return;
              }

              const requestedDim = typeof body.outputDimensionality === 'number' && body.outputDimensionality > 0
                ? Math.min(3072, Math.max(128, Math.floor(body.outputDimensionality)))
                : 768;
              const taskType = body.taskType === 'RETRIEVAL_DOCUMENT' ? 'RETRIEVAL_DOCUMENT' : 'RETRIEVAL_QUERY';
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
                res.statusCode = apiRes.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: errData?.error?.message || `HTTP ${apiRes.status}` }));
                return;
              }

              const data = await apiRes.json();
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ embedding: data.embedding?.values || [] }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Serverfehler' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const localEnv = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), geminiLocalProxyPlugin(localEnv)],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
  };
});
