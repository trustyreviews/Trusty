// Serverless function (Vercel convention: files in /api become endpoints).
// POST { reviewText, draftReply } -> { polishedReply }
//
// The Gemini API key is read from a server-side env var (GEMINI_API_KEY) and is
// NEVER sent to the client. Set it in your hosting provider's dashboard (or a
// local .env for `vercel dev`).

import { GoogleGenerativeAI } from '@google/generative-ai';

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
      if (status === 503 || status === 429 || status === 404) continue;
      throw err;
    }
  }

  if (sawQuota && lastError) {
    lastError.sawQuota = true;
  }
  throw lastError || new Error('All Gemini models failed');
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);

  // TEMPORARY — remove once Optimize with AI failures are diagnosed
  console.log('[DEBUG] optimize-reply: request received', {
    method: req.method,
    body: req.body,
  });

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // TEMPORARY — remove once Optimize with AI failures are diagnosed
  // Log whether the key exists — NEVER log the actual key value.
  console.log('[DEBUG] optimize-reply: GEMINI_API_KEY defined?', Boolean(apiKey));

  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return res.status(500).json({ error: 'Server is not configured' });
  }

  // Vercel usually parses JSON bodies, but guard against a raw string too.
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
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
    return res.status(400).json({ error: 'reviewText is required' });
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
    return res.status(200).json({ polishedReply });
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
    return res.status(502).json({
      error: quota
        ? 'Gemini quota exceeded — wait a minute or create a new key at aistudio.google.com/apikey'
        : busy
          ? 'AI is busy right now — try again in a moment'
          : 'Failed to optimize reply',
    });
  }
}
