import { GoogleGenerativeAI } from '@google/generative-ai';

const MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-2.0-flash',
];

export function systemInstruction(tone) {
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

export function buildUserMessage({
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

export async function generatePolishedReply(apiKey, tone, userMessage) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const instruction = systemInstruction(tone === 'formal' ? 'formal' : 'casual');
  let lastError;
  let sawQuota = false;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: instruction,
      });
      const result = await model.generateContent(userMessage);
      const text = result?.response?.text?.().trim();
      if (text) return text;
      lastError = new Error(`Model ${modelName} returned empty text`);
    } catch (err) {
      lastError = err;
      const status = err?.status ?? err?.statusCode;
      const msg = String(err?.message || '');
      if (status === 429 || /quota|rate.?limit|limit: 0/i.test(msg)) {
        sawQuota = true;
      }
      if (status === 503 || status === 429 || status === 404) continue;
      throw err;
    }
  }

  if (sawQuota && lastError) {
    lastError.sawQuota = true;
  }
  throw lastError || new Error('All Gemini models failed');
}

export function formatGeminiError(err) {
  const status = err?.status ?? err?.statusCode;
  const busy = status === 503 || status === 429;
  const quota =
    err?.sawQuota ||
    (busy &&
      typeof err?.message === 'string' &&
      /quota|rate.?limit|limit: 0/i.test(err.message));
  if (quota) {
    return 'Gemini quota exceeded — wait a minute or create a new key at aistudio.google.com/apikey';
  }
  if (busy) {
    return 'AI is busy right now — try again in a moment';
  }
  return err?.message || 'Failed to optimize reply';
}
