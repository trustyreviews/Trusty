import { normalizeSource } from './analytics';

export const DEFAULT_INBOX_QUERY = {
  sort: 'newest', // newest | oldest | lowest | unreplied
  sources: [], // empty = all sources
  ratings: [], // empty = all; values: 'low' | 'mid' | 'high'
  dateRange: 'all', // all | 7 | 30
  replyStatus: 'all', // all | replied | unreplied
};

export const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'lowest', label: 'Lowest rating first' },
  { id: 'unreplied', label: 'Unreplied first' },
];

export const SOURCE_OPTIONS = [
  { id: 'Google', label: 'Google' },
  { id: 'Yelp', label: 'Yelp' },
  { id: 'Direct', label: 'Direct Feedback' },
];

export const RATING_OPTIONS = [
  { id: 'low', label: '1–2 stars' },
  { id: 'mid', label: '3 stars' },
  { id: 'high', label: '4–5 stars' },
];

export const DATE_OPTIONS = [
  { id: '7', label: 'Last 7 days' },
  { id: '30', label: 'Last 30 days' },
  { id: 'all', label: 'All time' },
];

export const REPLY_STATUS_OPTIONS = [
  { id: 'all', label: 'Any status' },
  { id: 'replied', label: 'Replied' },
  { id: 'unreplied', label: 'Not replied' },
];

export function isInboxQueryActive(query) {
  return (
    query.sort !== DEFAULT_INBOX_QUERY.sort ||
    query.sources.length > 0 ||
    query.ratings.length > 0 ||
    query.dateRange !== DEFAULT_INBOX_QUERY.dateRange ||
    query.replyStatus !== DEFAULT_INBOX_QUERY.replyStatus
  );
}

function ratingBucket(rating) {
  if (rating <= 2) return 'low';
  if (rating === 3) return 'mid';
  return 'high';
}

function withinDateRange(iso, dateRange) {
  if (dateRange === 'all') return true;
  const days = dateRange === '7' ? 7 : 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(iso).getTime() >= cutoff;
}

function matchesQuery(review, query) {
  if (query.sources.length > 0) {
    const source = normalizeSource(review.source);
    if (!query.sources.includes(source)) return false;
  }

  if (query.ratings.length > 0) {
    if (!query.ratings.includes(ratingBucket(review.rating))) return false;
  }

  if (!withinDateRange(review.date, query.dateRange)) return false;

  if (query.replyStatus === 'replied' && !review.replied) return false;
  if (query.replyStatus === 'unreplied' && review.replied) return false;

  return true;
}

function sortReviews(list, sort) {
  const next = [...list];
  switch (sort) {
    case 'oldest':
      return next.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    case 'lowest':
      return next.sort((a, b) => {
        if (a.rating !== b.rating) return a.rating - b.rating;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    case 'unreplied':
      return next.sort((a, b) => {
        if (a.replied !== b.replied) return a.replied ? 1 : -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    case 'newest':
    default:
      return next.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }
}

/** Apply advanced sheet query on top of the current tab list. */
export function applyInboxQuery(reviews, query) {
  const filtered = reviews.filter((review) => matchesQuery(review, query));
  return sortReviews(filtered, query.sort);
}
