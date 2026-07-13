/**
 * Mock Google Business Profile data for UI demos.
 * Replace fetchMockBusinessProfile() with a real GBP API client when approved.
 */

export const MOCK_BUSINESS = {
  name: 'Riverside Coffee Co.',
  address: '123 Main St, Springfield',
  averageRating: 4.3,
  totalReviews: 47,
};

/**
 * Sample reviews shaped like Google Business Profile review payloads.
 * `read` is app-local UI state (not from Google) — tracks inbox unread/read.
 */
export const MOCK_REVIEWS = [
  {
    id: 'rev_01',
    authorName: 'Jordan Hale',
    source: 'Google Maps',
    rating: 5,
    text: 'Best latte in Springfield, hands down. The baristas remember my order and the riverside patio is perfect on weekends. Already planning my next visit.',
    date: '2026-07-11T14:22:00.000Z',
    replied: false,
    replyText: null,
    read: false,
  },
  {
    id: 'rev_02',
    authorName: 'Priya Nair',
    source: 'Yelp',
    rating: 1,
    text: 'Waited almost 25 minutes for a simple iced coffee during a quiet afternoon. Staff seemed more interested in chatting with each other than helping customers. Won’t be back.',
    date: '2026-07-10T09:05:00.000Z',
    replied: false,
    replyText: null,
    read: false,
  },
  {
    id: 'rev_03',
    authorName: 'Marcus Chen',
    source: 'Direct Feedback',
    rating: 4,
    text: 'Solid pour-over and a cozy atmosphere for remote work. Wi‑Fi was steady. Only knock is limited pastry options by mid-afternoon.',
    date: '2026-07-08T16:40:00.000Z',
    replied: false,
    replyText: null,
    read: true,
  },
  {
    id: 'rev_04',
    authorName: 'Elena Brooks',
    source: 'Google Maps',
    rating: 5,
    text: 'Took my parents here for brunch and everything was excellent — avocado toast, cappuccinos, and friendly service. Feels like a neighborhood gem.',
    date: '2026-07-06T11:18:00.000Z',
    replied: true,
    replyText:
      'Thank you so much, Elena! We’re glad your family felt at home — hope to see you all again soon.',
    repliedAt: '2026-07-06T20:05:00.000Z',
    read: true,
  },
  {
    id: 'rev_05',
    authorName: 'Derek Walsh',
    source: 'Yelp',
    rating: 2,
    text: 'Ordered a oat milk cortado and received a regular latte with dairy. I’m lactose intolerant, so this wasn’t a small mistake. Manager apologized but it ruined my morning.',
    date: '2026-07-03T08:55:00.000Z',
    replied: false,
    replyText: null,
    read: false,
  },
  {
    id: 'rev_06',
    authorName: 'Sofia Alvarez',
    source: 'Google Maps',
    rating: 5,
    text: 'Their seasonal lavender cold brew is incredible. Clean space, quick service, and they compost their grounds — love the values behind the brand.',
    date: '2026-06-30T15:12:00.000Z',
    replied: false,
    replyText: null,
    read: true,
  },
  {
    id: 'rev_07',
    authorName: 'Tom Nguyen',
    source: 'Direct Feedback',
    rating: 3,
    text: 'Coffee is good, but seating is packed after 8am and music gets loud. Fine for a quick grab-and-go; less ideal if you need to focus.',
    date: '2026-06-27T07:48:00.000Z',
    replied: false,
    replyText: null,
    read: true,
  },
  {
    id: 'rev_08',
    authorName: 'Aisha Rahman',
    source: 'Google Maps',
    rating: 4,
    text: 'Friendly team and consistently good espresso. Parking nearby can be tricky on Saturdays, but worth the stop.',
    date: '2026-06-22T13:30:00.000Z',
    replied: true,
    replyText:
      'Thanks for the note, Aisha — Saturday parking is a known pain, and we always appreciate you making the trip.',
    repliedAt: '2026-06-23T09:15:00.000Z',
    read: true,
  },
  {
    id: 'rev_09',
    authorName: 'Chris Patel',
    source: 'Yelp',
    rating: 1,
    text: 'Ordered online for pickup and the bag was missing half my order — no croissant, wrong size drink. Had to wait another 15 minutes while they remade everything. Frustrating before a meeting.',
    date: '2026-06-18T10:02:00.000Z',
    replied: false,
    replyText: null,
    read: false,
  },
  {
    id: 'rev_10',
    authorName: 'Morgan Lee',
    source: 'Google Maps',
    rating: 5,
    text: 'Finally a coffee shop that does flat whites properly. Smooth milk, balanced shot, and they never rush you out the door.',
    date: '2026-06-14T17:25:00.000Z',
    replied: true,
    replyText: 'Appreciate the kind words, Morgan! Flat whites are our love language.',
    repliedAt: '2026-06-14T22:10:00.000Z',
    read: true,
  },
  {
    id: 'rev_11',
    authorName: 'Hannah Ortiz',
    source: 'Direct Feedback',
    rating: 4,
    text: 'Great place to meet clients. Espresso drinks are reliable and the almond croissant sells out early for a reason.',
    date: '2026-06-09T09:41:00.000Z',
    replied: false,
    replyText: null,
    read: true,
  },
  {
    id: 'rev_12',
    authorName: 'Ben Torres',
    source: 'Yelp',
    rating: 2,
    text: 'Service was slow and my drink arrived lukewarm. Asked for it to be remade and still waited another ten minutes. Quality used to be better.',
    date: '2026-06-02T12:15:00.000Z',
    replied: false,
    replyText: null,
    read: false,
  },
  {
    id: 'rev_13',
    authorName: 'Nina Kowalski',
    source: 'Google Maps',
    rating: 5,
    text: 'Brought friends visiting from out of town and everyone raved about the house blend. Atmosphere is warm without being trendy for trendy’s sake.',
    date: '2026-05-26T18:05:00.000Z',
    replied: true,
    replyText:
      'Thanks for bringing friends by, Nina! Glad the house blend made the trip memorable — hope we see you all again.',
    repliedAt: '2026-05-27T11:40:00.000Z',
    read: true,
  },
  {
    id: 'rev_14',
    authorName: 'Sam Okonkwo',
    source: 'Direct Feedback',
    rating: 3,
    text: 'Decent drip coffee and fair prices. Bathroom could use more frequent cleaning, and the oat milk ran out mid-order which delayed things.',
    date: '2026-05-20T11:50:00.000Z',
    replied: false,
    replyText: null,
    read: true,
  },
];

/**
 * Simulates loading a connected Google Business Profile.
 * Swap this for a real API call (OAuth + accounts.locations.reviews.list).
 */
export function fetchMockBusinessProfile() {
  return {
    business: { ...MOCK_BUSINESS },
    reviews: MOCK_REVIEWS.map((review) => ({ ...review })),
  };
}
