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
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// A review needs action when it's a low rating that hasn't been addressed yet.
export function needsAction(review) {
  return review.rating <= 2 && !review.replied;
}

// Deterministic first-draft reply used to prefill the inline editor.
// Tone comes from Settings → Reply tone (casual | formal).
export function suggestDraft(review, businessName, tone = 'casual') {
  const firstName = review.authorName?.split(/\s+/)[0] ?? 'there';
  const formal = tone === 'formal';

  if (review.rating <= 2) {
    return formal
      ? `Dear ${firstName}, thank you for sharing your feedback. We sincerely apologize that your experience fell short of our standards. We are reviewing this with our team and would welcome the opportunity to make things right. Please contact us at your convenience.`
      : `Hi ${firstName}, I'm so sorry to hear about your experience. This isn't the standard we hold ourselves to, and I'd like to make it right. I'm addressing this with the team directly — please reach out so we can follow up with you personally.`;
  }
  if (review.rating === 3) {
    return formal
      ? `Dear ${firstName}, thank you for your thoughtful feedback. We appreciate you taking the time to share it and are using your notes to improve. We hope to welcome you again soon.`
      : `Thanks for the honest feedback, ${firstName}. We're glad you stopped by and we're taking your notes to heart as we keep improving. Hope to serve you an even better visit next time.`;
  }
  return formal
    ? `Dear ${firstName}, thank you for your kind review. We are delighted you enjoyed your visit to ${businessName} and look forward to serving you again.`
    : `Thank you so much, ${firstName}! We're thrilled you enjoyed your visit to ${businessName}. Reviews like yours make our day — we can't wait to welcome you back.`;
}

// Placeholder "AI polish" pass: tightens and warms up the current draft locally.
// TODO: Swap for a real AI request; keep the same (text) -> text signature.
export function optimizeDraft(text, businessName) {
  const trimmed = text.trim();
  if (!trimmed) {
    return `Thank you for taking the time to share your feedback with ${businessName}. We truly appreciate it and would love the chance to make your next visit even better.`;
  }
  const withSignoff = /—\s*the .* team/i.test(trimmed)
    ? trimmed
    : `${trimmed}\n\n— The ${businessName} team`;
  return withSignoff;
}
