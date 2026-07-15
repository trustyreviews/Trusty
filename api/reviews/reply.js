/**
 * POST /api/reviews/reply
 *
 * Posts a Page comment on a Facebook rating using open_graph_story.id.
 * Requires FB_PAGE_ACCESS_TOKEN.
 *
 * Body (JSON):
 *   {
 *     "open_graph_story_id": "<id from GET /api/reviews>",
 *     "message": "Thanks for the review!"
 *   }
 *
 * Also accepts camelCase: openGraphStoryId
 *
 * Response:
 *   { success: true, commentId, openGraphStoryId }
 */

const { replyToReview } = require('../lib/facebookReviews');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function parseBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  return body ?? {};
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = parseBody(req);
  const openGraphStoryId =
    body.open_graph_story_id ?? body.openGraphStoryId ?? '';
  const message = body.message ?? '';

  try {
    const result = await replyToReview({ openGraphStoryId, message });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[api/reviews/reply] reply failed', {
      message: err?.message,
      status: err?.status,
      openGraphStoryId:
        typeof openGraphStoryId === 'string' ? openGraphStoryId : undefined,
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
    return res.status(status).json(bodyOut);
  }
};
