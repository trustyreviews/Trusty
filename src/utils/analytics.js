// Analytics aggregations over the local review inbox.
// Period buckets are filled so charts show continuous week/month axes even when
// some buckets have zero reviews.

export const SOURCES = [
  { key: 'Google', label: 'Google', match: /google/i, color: '#2dd4bf' },
  { key: 'Yelp', label: 'Yelp', match: /yelp/i, color: '#f0a53e' },
  { key: 'Direct', label: 'Direct', match: /direct/i, color: '#8b9bb4' },
];

export function normalizeSource(source) {
  const found = SOURCES.find((s) => s.match.test(source ?? ''));
  return found?.key ?? 'Direct';
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0 Sun … 6 Sat
  const diff = (day + 6) % 7; // Monday-start
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date) {
  const d = new Date(date);
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

function addMonths(date, n) {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d;
}

function periodKey(date, granularity) {
  const d = granularity === 'week' ? startOfWeek(date) : startOfMonth(date);
  return d.toISOString().slice(0, 10);
}

function formatPeriodLabel(isoKey, granularity) {
  const d = new Date(`${isoKey}T00:00:00.000Z`);
  if (granularity === 'month') {
    return d.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });
  }
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function buildPeriodRange(reviews, granularity) {
  if (!reviews.length) return [];

  const times = reviews.map((r) => new Date(r.date).getTime());
  let cursor =
    granularity === 'week'
      ? startOfWeek(new Date(Math.min(...times)))
      : startOfMonth(new Date(Math.min(...times)));
  const end =
    granularity === 'week'
      ? startOfWeek(new Date(Math.max(...times)))
      : startOfMonth(new Date(Math.max(...times)));

  const keys = [];
  while (cursor.getTime() <= end.getTime()) {
    keys.push(cursor.toISOString().slice(0, 10));
    cursor = granularity === 'week' ? addDays(cursor, 7) : addMonths(cursor, 1);
  }
  return keys;
}

export function buildRatingTrend(reviews, granularity = 'week') {
  const keys = buildPeriodRange(reviews, granularity);
  const buckets = Object.fromEntries(
    keys.map((key) => [key, { sum: 0, count: 0 }])
  );

  for (const review of reviews) {
    const key = periodKey(review.date, granularity);
    if (!buckets[key]) continue;
    buckets[key].sum += review.rating;
    buckets[key].count += 1;
  }

  return keys.map((key) => ({
    key,
    label: formatPeriodLabel(key, granularity),
    average: buckets[key].count
      ? buckets[key].sum / buckets[key].count
      : null,
    count: buckets[key].count,
  }));
}

export function buildVolumeBySource(reviews, granularity = 'week') {
  const keys = buildPeriodRange(reviews, granularity);
  const empty = () =>
    Object.fromEntries(SOURCES.map((s) => [s.key, 0]));

  const buckets = Object.fromEntries(keys.map((key) => [key, empty()]));

  for (const review of reviews) {
    const key = periodKey(review.date, granularity);
    if (!buckets[key]) continue;
    buckets[key][normalizeSource(review.source)] += 1;
  }

  return keys.map((key) => ({
    key,
    label: formatPeriodLabel(key, granularity),
    ...buckets[key],
    total: SOURCES.reduce((sum, s) => sum + buckets[key][s.key], 0),
  }));
}

export function buildSourceBreakdown(reviews) {
  const counts = Object.fromEntries(SOURCES.map((s) => [s.key, 0]));
  for (const review of reviews) {
    counts[normalizeSource(review.source)] += 1;
  }
  const total = reviews.length || 1;
  return SOURCES.map((s) => ({
    key: s.key,
    label: s.label,
    color: s.color,
    count: counts[s.key],
    percent: Math.round((counts[s.key] / total) * 100),
  }));
}

export function buildResponseStats(reviews) {
  const total = reviews.length;
  const replied = reviews.filter((r) => r.replied);
  const responseRate = total ? (replied.length / total) * 100 : 0;

  const replyHours = replied
    .filter((r) => r.repliedAt)
    .map((r) => {
      const start = new Date(r.date).getTime();
      const end = new Date(r.repliedAt).getTime();
      return Math.max(0, (end - start) / (1000 * 60 * 60));
    });

  const avgHours =
    replyHours.length > 0
      ? replyHours.reduce((a, b) => a + b, 0) / replyHours.length
      : null;

  return {
    total,
    repliedCount: replied.length,
    unrepliedCount: total - replied.length,
    responseRate,
    avgReplyHours: avgHours,
  };
}

export function formatReplySpeed(hours) {
  if (hours == null) return '—';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 48) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}
