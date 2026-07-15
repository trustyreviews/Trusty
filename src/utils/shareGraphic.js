/** Helpers for positive-review social share graphics. */

export function canShareReview(review) {
  return Boolean(review && Number(review.rating) >= 4);
}

export function firstNameFromAuthor(authorName) {
  if (!authorName || typeof authorName !== 'string') return 'Guest';
  const part = authorName.trim().split(/\s+/)[0];
  return part || 'Guest';
}

/** Trim long quotes for share cards; keep word boundaries when possible. */
export function trimQuote(text, maxLen = 120) {
  const raw = String(text || '').trim();
  if (raw.length <= maxLen) return raw;
  const slice = raw.slice(0, maxLen - 1);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > maxLen * 0.5 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trimEnd()}…`;
}
