// Client for the /api/optimize-reply serverless function.
//
// Native devices/simulators have no implicit host, so a relative "/api/..." path
// fails with "Network request failed". Always use EXPO_PUBLIC_API_BASE_URL —
// typically http://<LAN-IP>:3000 for local `vercel dev` (not localhost).

function getApiBaseUrl() {
  const raw = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
  return raw.replace(/\/$/, '');
}

export async function optimizeReply({ reviewText, draftReply }) {
  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL is not set. Add it to .env ' +
        '(e.g. http://192.168.1.64:3000), then restart Expo.'
    );
  }

  const url = `${API_BASE_URL}/api/optimize-reply`;
  const payload = { reviewText, draftReply };

  // TEMPORARY — remove once Optimize with AI failures are diagnosed
  console.log('[DEBUG] optimizeReply: about to fetch', { url, payload, API_BASE_URL });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    let data;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch (parseErr) {
      // TEMPORARY — remove once Optimize with AI failures are diagnosed
      console.log('[DEBUG] optimizeReply: response was not JSON', {
        status: response.status,
        statusText: response.statusText,
        rawText,
        parseError: parseErr,
      });
      throw new Error(`Optimize request returned non-JSON (status ${response.status})`);
    }

    // TEMPORARY — remove once Optimize with AI failures are diagnosed
    console.log('[DEBUG] optimizeReply: raw response received', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
    });

    if (!response.ok) {
      throw new Error(`Optimize request failed with status ${response.status}`);
    }

    if (!data?.polishedReply) {
      throw new Error('Optimize response missing polishedReply');
    }

    return data.polishedReply;
  } catch (error) {
    // TEMPORARY — remove once Optimize with AI failures are diagnosed
    console.log('[DEBUG] optimizeReply: catch/error', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      // Network/fetch errors often include cause or additional fields
      cause: error?.cause,
      fullError: error,
    });
    throw error;
  }
}
