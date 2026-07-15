/**
 * Client helpers for Facebook review API routes.
 * Token stays server-side — these only call /api/reviews*.
 */

import Constants from 'expo-constants';

function getApiBaseUrl() {
  const raw = Constants.expoConfig?.extra?.apiBaseUrl ?? '';
  return raw.replace(/\/$/, '');
}

async function parseJsonResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const message =
      payload?.error ||
      payload?.details ||
      `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

/**
 * GET /api/reviews
 * @param {{ limit?: number, after?: string }} [options]
 */
export async function fetchFacebookReviews(options = {}) {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL is not set. Point it at your API server.'
    );
  }

  const params = new URLSearchParams();
  if (options.limit != null) params.set('limit', String(options.limit));
  if (options.after) params.set('after', options.after);

  const qs = params.toString();
  const url = `${base}/api/reviews${qs ? `?${qs}` : ''}`;
  const response = await fetch(url, { method: 'GET' });
  return parseJsonResponse(response);
}

/**
 * POST /api/reviews/reply
 * @param {{ openGraphStoryId: string, message: string }} input
 */
export async function replyToFacebookReview({ openGraphStoryId, message }) {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL is not set. Point it at your API server.'
    );
  }

  const response = await fetch(`${base}/api/reviews/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      open_graph_story_id: openGraphStoryId,
      message,
    }),
  });
  return parseJsonResponse(response);
}
