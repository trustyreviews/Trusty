import Constants from 'expo-constants';
import {
  buildUserMessage,
  formatGeminiError,
  generatePolishedReply,
} from './geminiReplyCore';

function getApiBaseUrl() {
  const raw = Constants.expoConfig?.extra?.apiBaseUrl ?? '';
  return raw.replace(/\/$/, '');
}

function getDirectGeminiKey() {
  return Constants.expoConfig?.extra?.geminiApiKey?.trim() || '';
}

async function optimizeViaGemini({
  reviewText,
  draftReply = '',
  tone = 'casual',
  businessName = '',
  rating,
  authorName = '',
}) {
  const apiKey = getDirectGeminiKey();
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to .env, then restart Expo.'
    );
  }

  if (typeof reviewText !== 'string' || !reviewText.trim()) {
    throw new Error('reviewText is required');
  }

  const userMessage = buildUserMessage({
    reviewText,
    draftReply,
    businessName,
    rating,
    authorName,
  });

  try {
    return await generatePolishedReply(apiKey, tone, userMessage);
  } catch (err) {
    throw new Error(formatGeminiError(err));
  }
}

async function optimizeViaHttp({
  reviewText,
  draftReply = '',
  tone = 'casual',
  businessName = '',
  rating,
  authorName = '',
}) {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    throw new Error(
      'AI is not configured. Add GEMINI_API_KEY to .env for local use, ' +
        'or EXPO_PUBLIC_API_BASE_URL for a deployed API.'
    );
  }

  const url = `${API_BASE_URL}/api/optimize-reply`;
  const payload = {
    reviewText,
    draftReply,
    tone,
    businessName,
    rating,
    authorName,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  let data;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    throw new Error(`Optimize request returned non-JSON (status ${response.status})`);
  }

  if (!response.ok) {
    throw new Error(
      data?.error || `Optimize request failed with status ${response.status}`
    );
  }

  if (!data?.polishedReply) {
    throw new Error('Optimize response missing polishedReply');
  }

  return data.polishedReply;
}

export async function optimizeReply(params) {
  // Prefer direct Gemini when a key is available (local dev / demo builds).
  // Use the HTTP API only when no client key is set (production with server-side key).
  if (getDirectGeminiKey()) {
    return optimizeViaGemini(params);
  }
  return optimizeViaHttp(params);
}
