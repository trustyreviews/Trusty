/**
 * GET /api/reviews
 *
 * Fetches Facebook Page ratings via the Graph API and returns a clean
 * review list for the Trusty frontend. Requires FB_PAGE_ACCESS_TOKEN.
 *
 * Query (optional):
 *   ?limit=25&after=<cursor>
 *
 * Response:
 *   { reviews, paging, meta }
 */

const { fetchPageReviews } = require('./lib/facebookReviews');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const limit = req.query?.limit;
    const after = req.query?.after;
    const result = await fetchPageReviews({
      limit: limit != null ? Number(limit) : undefined,
      after: typeof after === 'string' ? after : undefined,
    });
    return res.status(200).json(result);
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
      // Safe, human-readable Meta message — never the access token.
      if (err.facebook.details) body.details = err.facebook.details;
    }
    return res.status(status).json(body);
  }
};
