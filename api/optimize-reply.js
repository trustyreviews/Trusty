// Serverless function (Vercel convention: files in /api become endpoints).
// POST { reviewText, draftReply } -> { polishedReply }
//
// The Gemini API key is read from a server-side env var (GEMINI_API_KEY) and is
// NEVER sent to the client. Set it in your hosting provider's dashboard (or a
// local .env for `vercel dev`).

import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = 'gemini-flash-latest';

const SYSTEM_INSTRUCTION =
  'You are helping a small business owner polish a draft reply to a customer review. ' +
  'Given a rough draft reply, rewrite it to be: warm and genuine, not corporate or robotic; ' +
  'concise, 2-3 sentences max; professional but human; keep any specific details from the ' +
  'original draft (apologies, offers, specifics mentioned). Return ONLY the rewritten reply text, ' +
  'nothing else — no preamble, no explanation, no quotation marks.';

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
  const { reviewText = '', draftReply = '' } = body ?? {};

  // TEMPORARY — remove once Optimize with AI failures are diagnosed
  console.log('[DEBUG] optimize-reply: parsed payload', { reviewText, draftReply });

  if (typeof draftReply !== 'string' || !draftReply.trim()) {
    return res.status(400).json({ error: 'draftReply is required' });
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
        statusText: geminiErr?.statusText,
        // GoogleGenerativeAIError often nests details here
        errorDetails: geminiErr?.errorDetails,
        cause: geminiErr?.cause,
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
      return res.status(502).json({ error: 'Failed to optimize reply' });
    }

    return res.status(200).json({ polishedReply });
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
    return res.status(502).json({ error: 'Failed to optimize reply' });
  }
}
