// Presentation helpers for the review inbox. Pure functions, no side effects —
// safe to reuse when the real Google Business Profile API is wired in later.

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function formatRelativeDate(iso) {
  const date = new Date(iso);
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (days <= 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 30) return `${days}d ago`;
  if (days < 60) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// A review needs action when it's a low rating that hasn't been addressed yet.
export function needsAction(review) {
  return review.rating <= 2 && !review.replied;
}

/**
 * Inbox status chip language (matches row UI filters).
 * - replied: answered mid/high rating
 * - resolved: answered low rating
 * - not_resolved: unanswered low rating
 * - pending: unanswered mid/high rating
 */
export function getReviewStatus(review) {
  if (review.replied) {
    return review.rating <= 2 ? 'resolved' : 'replied';
  }
  return review.rating <= 2 ? 'not_resolved' : 'pending';
}
