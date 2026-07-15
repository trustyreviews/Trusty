/**
 * Shared Facebook Graph API helpers for Page ratings (reviews).
 *
 * Used by:
 * - api/reviews.js          (GET  /api/reviews)
 * - api/reviews/reply.js    (POST /api/reviews/reply)
 * - scripts/dev-api.js      (local API server)
 *
 * Env:
 * - FB_PAGE_ACCESS_TOKEN  (required) permanent Page Access Token
 * - FB_PAGE_ID            (optional) defaults to the Trusty Inc. Page
 * - FB_GRAPH_VERSION      (optional) defaults to v25.0
 */

const DEFAULT_PAGE_ID = '1231064900087363';
const DEFAULT_GRAPH_VERSION = 'v25.0';
const RATINGS_FIELDS =
  'open_graph_story,recommendation_type,review_text,rating,created_time,reviewer';

/**
 * @typedef {object} FacebookReview
 * @property {string} id                 open_graph_story.id — required to reply
 * @property {string} openGraphStoryId   same as id (explicit for clients)
 * @property {string} authorName
 * @property {string|null} authorId
 * @property {'Facebook'} source
 * @property {number|null} rating        1–5 when present; else inferred from recommendation
 * @property {'positive'|'negative'|string|null} recommendationType
 * @property {string} text
 * @property {string|null} date          ISO created_time from Meta
 * @property {boolean} replied           unknown without a comments fetch; always false here
 * @property {null} replyText
 * @property {boolean} read              app-local; default false
 */

function getConfig() {
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN?.trim() || '';
  const pageId = process.env.FB_PAGE_ID?.trim() || DEFAULT_PAGE_ID;
  const graphVersion =
    process.env.FB_GRAPH_VERSION?.trim() || DEFAULT_GRAPH_VERSION;
  return { accessToken, pageId, graphVersion };
}

function graphBaseUrl(graphVersion) {
  return `https://graph.facebook.com/${graphVersion}`;
}

/**
 * Normalize Meta Graph errors into a stable shape for HTTP responses.
 * Never includes the access token.
 */
function classifyGraphError(payload, httpStatus) {
  const err = payload?.error ?? {};
  const code = err.code;
  const message =
    typeof err.message === 'string' && err.message.trim()
      ? err.message
      : 'Facebook Graph API request failed';
  const type = err.type || null;
  const fbtraceId = err.fbtrace_id || null;

  // Invalid / expired token
  if (
    code === 190 ||
    type === 'OAuthException' ||
    /access token|session has expired|validating access token/i.test(message)
  ) {
    return {
      status: 401,
      error: 'Facebook Page Access Token is missing, invalid, or expired',
      code,
      type,
      fbtraceId,
      details: message,
    };
  }

  // Rate limiting / app-level throttling
  if (
    httpStatus === 429 ||
    code === 4 ||
    code === 17 ||
    code === 32 ||
    code === 613 ||
    /rate limit|too many calls|throttl/i.test(message)
  ) {
    return {
      status: 429,
      error: 'Facebook API rate limit reached — try again shortly',
      code,
      type,
      fbtraceId,
      details: message,
    };
  }

  // Permission / capability problems
  if (
    code === 10 ||
    code === 200 ||
    /permission|(#200)|not authorized|insufficient/i.test(message)
  ) {
    return {
      status: 403,
      error: 'Facebook API permission error — check Page token scopes',
      code,
      type,
      fbtraceId,
      details: message,
    };
  }

  return {
    status: httpStatus >= 400 && httpStatus < 600 ? httpStatus : 502,
    error: 'Facebook Graph API request failed',
    code,
    type,
    fbtraceId,
    details: message,
  };
}

/**
 * Map a raw Graph /{page-id}/ratings item into the Trusty frontend shape.
 * Reviews without open_graph_story.id cannot be replied to via the API.
 *
 * @param {object} item
 * @returns {FacebookReview|null}
 */
function mapFacebookReview(item) {
  if (!item || typeof item !== 'object') return null;

  const storyId =
    item.open_graph_story?.id != null
      ? String(item.open_graph_story.id)
      : null;

  if (!storyId) {
    // Cannot reply without this id — skip rather than return a broken record.
    return null;
  }

  const recommendationType = item.recommendation_type ?? null;
  let rating = typeof item.rating === 'number' ? item.rating : null;
  if (rating == null && recommendationType === 'positive') rating = 5;
  if (rating == null && recommendationType === 'negative') rating = 1;

  const reviewer = item.reviewer ?? {};

  return {
    id: storyId,
    openGraphStoryId: storyId,
    authorName:
      typeof reviewer.name === 'string' && reviewer.name.trim()
        ? reviewer.name.trim()
        : 'Facebook User',
    authorId: reviewer.id != null ? String(reviewer.id) : null,
    source: 'Facebook',
    rating,
    recommendationType,
    text: typeof item.review_text === 'string' ? item.review_text : '',
    date: item.created_time ?? null,
    replied: false,
    replyText: null,
    read: false,
  };
}

async function parseGraphResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.error) {
    const classified = classifyGraphError(payload, response.status);
    const error = new Error(classified.error);
    error.status = classified.status;
    error.facebook = classified;
    throw error;
  }

  return payload;
}

/**
 * Fetch Page ratings from Graph API and return a clean review list.
 *
 * @param {{ limit?: number, after?: string }} [options]
 */
async function fetchPageReviews(options = {}) {
  const { accessToken, pageId, graphVersion } = getConfig();

  if (!accessToken) {
    const error = new Error(
      'FB_PAGE_ACCESS_TOKEN is not set — add it to your server .env'
    );
    error.status = 500;
    throw error;
  }

  const params = new URLSearchParams({
    fields: RATINGS_FIELDS,
    access_token: accessToken,
  });

  const limit = Number(options.limit);
  if (Number.isFinite(limit) && limit > 0) {
    params.set('limit', String(Math.min(Math.floor(limit), 100)));
  }
  if (typeof options.after === 'string' && options.after.trim()) {
    params.set('after', options.after.trim());
  }

  const url = `${graphBaseUrl(graphVersion)}/${pageId}/ratings?${params}`;
  const response = await fetch(url, { method: 'GET' });
  const payload = await parseGraphResponse(response);

  const rawItems = Array.isArray(payload?.data) ? payload.data : [];
  const reviews = [];
  let skippedMissingStoryId = 0;

  for (const item of rawItems) {
    const mapped = mapFacebookReview(item);
    if (mapped) {
      reviews.push(mapped);
    } else {
      skippedMissingStoryId += 1;
    }
  }

  return {
    reviews,
    paging: {
      cursors: payload?.paging?.cursors ?? null,
      next: Boolean(payload?.paging?.next),
      previous: Boolean(payload?.paging?.previous),
    },
    meta: {
      pageId,
      fetched: rawItems.length,
      mapped: reviews.length,
      skippedMissingStoryId,
    },
  };
}

/**
 * Post a Page comment on a rating's open_graph_story.
 *
 * @param {{ openGraphStoryId: string, message: string }} input
 */
async function replyToReview({ openGraphStoryId, message }) {
  const { accessToken, graphVersion } = getConfig();

  if (!accessToken) {
    const error = new Error(
      'FB_PAGE_ACCESS_TOKEN is not set — add it to your server .env'
    );
    error.status = 500;
    throw error;
  }

  const storyId =
    typeof openGraphStoryId === 'string' ? openGraphStoryId.trim() : '';
  const text = typeof message === 'string' ? message.trim() : '';

  if (!storyId) {
    const error = new Error('open_graph_story_id is required');
    error.status = 400;
    throw error;
  }
  if (!text) {
    const error = new Error('message is required');
    error.status = 400;
    throw error;
  }

  // Token stays in the body (not query string) to reduce accidental log leakage.
  const body = new URLSearchParams({
    message: text,
    access_token: accessToken,
  });

  const url = `${graphBaseUrl(graphVersion)}/${encodeURIComponent(storyId)}/comments`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const payload = await parseGraphResponse(response);

  const commentId = payload?.id != null ? String(payload.id) : null;
  if (!commentId) {
    const error = new Error(
      'Facebook accepted the reply but did not return a comment id'
    );
    error.status = 502;
    throw error;
  }

  return {
    success: true,
    commentId,
    openGraphStoryId: storyId,
  };
}

const FACEBOOK_DEFAULTS = {
  DEFAULT_PAGE_ID,
  DEFAULT_GRAPH_VERSION,
  RATINGS_FIELDS,
};

module.exports = {
  classifyGraphError,
  mapFacebookReview,
  fetchPageReviews,
  replyToReview,
  FACEBOOK_DEFAULTS,
};
