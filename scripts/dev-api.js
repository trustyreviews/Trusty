/**
 * Local API server for Optimize with AI during Expo device/simulator testing.
 *
 * Binds to 0.0.0.0:3000 so physical devices can reach the host via LAN IP
 * (e.g. http://192.168.1.64:3000) — not localhost, which points at the device.
 *
 * Usage: npm run api
 * (loads .env via `node --env-file=.env`)
 *
 * Production continues to use api/optimize-reply.js on Vercel.
 */

const http = require('http');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const PORT = Number(process.env.API_PORT || 3000);
const HOST = '0.0.0.0';
const MODEL = 'gemini-flash-latest';

const SYSTEM_INSTRUCTION =
  'You are helping a small business owner polish a draft reply to a customer review. ' +
  'Given a rough draft reply, rewrite it to be: warm and genuine, not corporate or robotic; ' +
  'concise, 2-3 sentences max; professional but human; keep any specific details from the ' +
  'original draft (apologies, offers, specifics mentioned). Return ONLY the rewritten reply text, ' +
  'nothing else — no preamble, no explanation, no quotation marks.';

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function handleOptimize(req, res) {
  // TEMPORARY — remove once Optimize with AI failures are diagnosed
  console.log('[DEBUG] optimize-reply: request received', { method: req.method });

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  // TEMPORARY — remove once Optimize with AI failures are diagnosed
  console.log('[DEBUG] optimize-reply: GEMINI_API_KEY defined?', Boolean(apiKey));

  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return sendJson(res, 500, { error: 'Server is not configured' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON body' });
  }

  const { reviewText = '', draftReply = '' } = body ?? {};
  // TEMPORARY — remove once Optimize with AI failures are diagnosed
  console.log('[DEBUG] optimize-reply: parsed payload', { reviewText, draftReply });

  if (typeof draftReply !== 'string' || !draftReply.trim()) {
    return sendJson(res, 400, { error: 'draftReply is required' });
  }

  const userMessage = `Original review: "${reviewText}"\n\nDraft reply: "${draftReply}"\n\nPolish this reply.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // TEMPORARY — remove once Optimize with AI failures are diagnosed
    console.log('[DEBUG] optimize-reply: calling Gemini', { model: MODEL });

    let result;
    try {
      result = await model.generateContent(userMessage);
    } catch (geminiErr) {
      // TEMPORARY — remove once Optimize with AI failures are diagnosed
      console.log('[DEBUG] optimize-reply: Gemini API call failed', {
        message: geminiErr?.message,
        name: geminiErr?.name,
        status: geminiErr?.status ?? geminiErr?.statusCode,
        errorDetails: geminiErr?.errorDetails,
        fullError: geminiErr,
        stringified: String(geminiErr),
      });
      throw geminiErr;
    }

    const polishedReply = result?.response?.text?.().trim();

    // TEMPORARY — remove once Optimize with AI failures are diagnosed
    console.log('[DEBUG] optimize-reply: Gemini response received', {
      polishedReply,
      candidates: result?.response?.candidates,
      promptFeedback: result?.response?.promptFeedback,
    });

    if (!polishedReply) {
      console.error('Gemini returned no text');
      return sendJson(res, 502, { error: 'Failed to optimize reply' });
    }

    return sendJson(res, 200, { polishedReply });
  } catch (err) {
    // TEMPORARY — remove once Optimize with AI failures are diagnosed
    console.log('[DEBUG] optimize-reply: outer catch', {
      message: err?.message,
      name: err?.name,
      status: err?.status ?? err?.statusCode,
      errorDetails: err?.errorDetails,
      fullError: err,
    });
    console.error('Optimize reply request failed', err);
    return sendJson(res, 502, { error: 'Failed to optimize reply' });
  }
}

const server = http.createServer(async (req, res) => {
  const path = (req.url || '').split('?')[0];
  if (path === '/api/optimize-reply') {
    return handleOptimize(req, res);
  }
  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`[api] Optimize with AI listening on http://${HOST}:${PORT}`);
  console.log(`[api] Device/simulator URL: http://<LAN-IP>:${PORT}/api/optimize-reply`);
  console.log(`[api] EXPO_PUBLIC_API_BASE_URL should be http://<LAN-IP>:${PORT}`);
});
