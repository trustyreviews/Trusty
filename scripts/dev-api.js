/**
 * Local API server for Expo device/simulator testing.
 *
 * Routes:
 * - POST /api/optimize-reply   (Gemini)
 * - GET  /api/reviews          (Facebook Page ratings)
 * - POST /api/reviews/reply    (Facebook rating reply)
 *
 * Binds to 0.0.0.0:3000 so physical devices can reach the host via LAN IP
 * (e.g. http://192.168.1.64:3000) — not localhost, which points at the device.
 *
 * Usage: npm run api
 * (loads .env via `node --env-file=.env`)
 *
 * Production continues to use api/*.js on Vercel.
 */

const http = require('http');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
  fetchPageReviews,
  replyToReview,
} = require('../api/lib/facebookReviews');

const PORT = Number(process.env.API_PORT || 3000);
const HOST = '0.0.0.0';
// Prefer models available to new AQ. free-tier keys.
// Older Flash IDs often return quota limit:0 even when the plan is free.
const MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-2.0-flash',
];

function systemInstruction(tone) {
  const toneLine =
    tone === 'formal'
      ? 'Use a formal, polished tone (Dear / We / sincerely).'
      : 'Use a warm, casual tone (Hi / first name / conversational).';
  return (
    'You write customer-review replies for a small local business. ' +
    `${toneLine} ` +
    'Be warm and genuine, not corporate or robotic. Keep replies concise (2-3 sentences). ' +
    'Address specifics from the review when relevant. ' +
    'Return ONLY the reply text — no preamble, no explanation, no quotation marks.'
  );
}

function buildUserMessage({
  reviewText,
  draftReply,
  businessName,
  rating,
  authorName,
}) {
  const hasDraft = typeof draftReply === 'string' && draftReply.trim();
  const meta = [
    businessName ? `Business: ${businessName}` : null,
    authorName ? `Reviewer: ${authorName}` : null,
    rating != null ? `Rating: ${rating}/5` : null,
  ]
    .filter(Boolean)
    .join('\n');

  if (hasDraft) {
    return (
      `${meta ? `${meta}\n\n` : ''}` +
      `Original review: "${reviewText}"\n\n` +
      `Draft reply: "${draftReply.trim()}"\n\n` +
      'Polish this draft reply. Keep any specific details the owner included.'
    );
  }

  return (
    `${meta ? `${meta}\n\n` : ''}` +
    `Original review: "${reviewText}"\n\n` +
    'Write a fresh reply to this review from the business owner. ' +
    'There is no draft yet — create the reply from scratch.'
  );
}

async function generateReply(apiKey, tone, userMessage) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const instruction = systemInstruction(tone === 'formal' ? 'formal' : 'casual');
  let lastError;
  let sawQuota = false;

  for (const modelName of MODELS) {
    try {
      console.log('[DEBUG] optimize-reply: calling Gemini', { model: modelName });
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: instruction,
      });
      const result = await model.generateContent(userMessage);
      const text = result?.response?.text?.().trim();
      if (text) {
        console.log('[DEBUG] optimize-reply: Gemini response received', {
          model: modelName,
          polishedReply: text,
        });
        return text;
      }
      lastError = new Error(`Model ${modelName} returned empty text`);
    } catch (err) {
      lastError = err;
      const status = err?.status ?? err?.statusCode;
      const msg = String(err?.message || '');
      if (status === 429 || /quota|rate.?limit|limit: 0/i.test(msg)) {
        sawQuota = true;
      }
      console.log('[DEBUG] optimize-reply: Gemini API call failed', {
        model: modelName,
        message: err?.message,
        status,
      });
      // Try the next model on overload / not-found / rate-limit.
      if (status === 503 || status === 429 || status === 404) continue;
      throw err;
    }
  }

  if (sawQuota && lastError) {
    lastError.sawQuota = true;
  }
  throw lastError || new Error('All Gemini models failed');
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function sendCorsPreflight(res, methods) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end();
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
    return sendCorsPreflight(res, 'POST, OPTIONS');
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

  const {
    reviewText = '',
    draftReply = '',
    tone = 'casual',
    businessName = '',
    rating,
    authorName = '',
  } = body ?? {};
  // TEMPORARY — remove once Optimize with AI failures are diagnosed
  console.log('[DEBUG] optimize-reply: parsed payload', {
    reviewText,
    draftReply,
    tone,
    businessName,
    rating,
    authorName,
  });

  if (typeof reviewText !== 'string' || !reviewText.trim()) {
    return sendJson(res, 400, { error: 'reviewText is required' });
  }

  const userMessage = buildUserMessage({
    reviewText,
    draftReply,
    businessName,
    rating,
    authorName,
  });

  try {
    const polishedReply = await generateReply(apiKey, tone, userMessage);
    return sendJson(res, 200, { polishedReply });
  } catch (err) {
    // TEMPORARY — remove once Optimize with AI failures are diagnosed
    console.log('[DEBUG] optimize-reply: outer catch', {
      message: err?.message,
      name: err?.name,
      status: err?.status ?? err?.statusCode,
    });
    console.error('Optimize reply request failed', err);
    const status = err?.status ?? err?.statusCode;
    const busy = status === 503 || status === 429;
    const quota =
      err?.sawQuota ||
      (busy &&
        typeof err?.message === 'string' &&
        /quota|rate.?limit|limit: 0/i.test(err.message));
    return sendJson(res, 502, {
      error: quota
        ? 'Gemini quota exceeded — wait a minute or create a new key at aistudio.google.com/apikey'
        : busy
          ? 'AI is busy right now — try again in a moment'
          : 'Failed to optimize reply',
    });
  }
}

function parseQuery(urlPath) {
  const qIndex = urlPath.indexOf('?');
  if (qIndex === -1) return {};
  const params = new URLSearchParams(urlPath.slice(qIndex + 1));
  const out = {};
  for (const [key, value] of params.entries()) out[key] = value;
  return out;
}

async function handleFetchReviews(req, res) {
  if (req.method === 'OPTIONS') {
    return sendCorsPreflight(res, 'GET, OPTIONS');
  }
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const query = parseQuery(req.url || '');
    const result = await fetchPageReviews({
      limit: query.limit != null ? Number(query.limit) : undefined,
      after: query.after,
    });
    return sendJson(res, 200, result);
  } catch (err) {
    console.error('[api/reviews] fetch failed', {
      message: err?.message,
      status: err?.status,
      facebook: err?.facebook
        ? {
            code: err.facebook.code,
            type: err.facebook.type,
            fbtraceId: err.facebook.fbtraceId,
          }
        : undefined,
    });
    const status = err?.status || 502;
    const body = {
      error: err?.message || 'Failed to fetch Facebook reviews',
    };
    if (err?.facebook) {
      body.code = err.facebook.code ?? undefined;
      body.fbtraceId = err.facebook.fbtraceId ?? undefined;
      if (err.facebook.details) body.details = err.facebook.details;
    }
    return sendJson(res, status, body);
  }
}

async function handleReplyReview(req, res) {
  if (req.method === 'OPTIONS') {
    return sendCorsPreflight(res, 'POST, OPTIONS');
  }
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON body' });
  }

  const openGraphStoryId =
    body.open_graph_story_id ?? body.openGraphStoryId ?? '';
  const message = body.message ?? '';

  try {
    const result = await replyToReview({ openGraphStoryId, message });
    return sendJson(res, 200, result);
  } catch (err) {
    console.error('[api/reviews/reply] reply failed', {
      message: err?.message,
      status: err?.status,
      facebook: err?.facebook
        ? {
            code: err.facebook.code,
            type: err.facebook.type,
            fbtraceId: err.facebook.fbtraceId,
          }
        : undefined,
    });
    const status = err?.status || 502;
    const bodyOut = {
      error: err?.message || 'Failed to post Facebook review reply',
    };
    if (err?.facebook) {
      bodyOut.code = err.facebook.code ?? undefined;
      bodyOut.fbtraceId = err.facebook.fbtraceId ?? undefined;
      if (err.facebook.details) bodyOut.details = err.facebook.details;
    }
    return sendJson(res, status, bodyOut);
  }
}

const server = http.createServer(async (req, res) => {
  const routePath = (req.url || '').split('?')[0];
  if (routePath === '/api/optimize-reply') {
    return handleOptimize(req, res);
  }
  if (routePath === '/api/reviews') {
    return handleFetchReviews(req, res);
  }
  if (routePath === '/api/reviews/reply') {
    return handleReplyReview(req, res);
  }
  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`[api] Listening on http://${HOST}:${PORT}`);
  console.log(`[api] GET  /api/reviews`);
  console.log(`[api] POST /api/reviews/reply`);
  console.log(`[api] POST /api/optimize-reply`);
  console.log(`[api] EXPO_PUBLIC_API_BASE_URL should be http://<LAN-IP>:${PORT}`);
});
