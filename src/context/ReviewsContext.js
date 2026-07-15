import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  fetchFacebookReviews,
  replyToFacebookReview,
} from '../api/facebookReviews';
import { fetchMockBusinessProfile } from '../data/mockData';

const ReviewsContext = createContext(null);

const FACEBOOK_BUSINESS = {
  name: 'Trusty Inc.',
  address: '',
  averageRating: 0,
  totalReviews: 0,
};

function computeBusinessStats(reviews, baseBusiness) {
  const rated = reviews.filter((r) => typeof r.rating === 'number');
  const averageRating = rated.length
    ? rated.reduce((sum, r) => sum + r.rating, 0) / rated.length
    : (baseBusiness?.averageRating ?? 0);
  return {
    ...(baseBusiness ?? FACEBOOK_BUSINESS),
    averageRating,
    totalReviews: reviews.length,
  };
}

function mergeFacebookReviews(prev, incoming) {
  const withoutFacebook = prev.filter((r) => r.source !== 'Facebook');
  const preserved = new Map(
    prev
      .filter((r) => r.source === 'Facebook')
      .map((r) => [
        r.id,
        {
          read: r.read,
          replied: r.replied,
          replyText: r.replyText,
          repliedAt: r.repliedAt,
        },
      ])
  );
  const mergedIncoming = incoming.map((r) => {
    const local = preserved.get(r.id);
    return local ? { ...r, ...local } : r;
  });
  return [...withoutFacebook, ...mergedIncoming];
}

export function ReviewsProvider({ children }) {
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [connected, setConnected] = useState(false);
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [syncingFacebook, setSyncingFacebook] = useState(false);
  const [facebookSyncError, setFacebookSyncError] = useState(null);

  const connectBusiness = useCallback(() => {
    // Demo flow — Riverside Coffee mock data.
    const profile = fetchMockBusinessProfile();
    setBusiness(profile.business);
    setReviews(profile.reviews);
    setConnected(true);
  }, []);

  const syncFacebookReviews = useCallback(async () => {
    setSyncingFacebook(true);
    setFacebookSyncError(null);
    try {
      const { reviews: fbReviews } = await fetchFacebookReviews();
      setReviews((prev) => {
        const next = mergeFacebookReviews(prev, fbReviews);
        setBusiness((current) =>
          computeBusinessStats(next, current ?? FACEBOOK_BUSINESS)
        );
        return next;
      });
      setFacebookConnected(true);
      setConnected(true);
      return fbReviews.length;
    } catch (err) {
      const message = err?.message || 'Failed to load Facebook reviews';
      setFacebookSyncError(message);
      throw err;
    } finally {
      setSyncingFacebook(false);
    }
  }, []);

  const disconnectFacebook = useCallback(() => {
    setReviews((prev) => prev.filter((r) => r.source !== 'Facebook'));
    setFacebookConnected(false);
    setFacebookSyncError(null);
  }, []);

  const disconnectBusiness = useCallback(() => {
    // Keeps local review cache until deleteAllData — only drops the "connected" session.
    setConnected(false);
    setFacebookConnected(false);
  }, []);

  const deleteAllData = useCallback(() => {
    setBusiness(null);
    setReviews([]);
    setConnected(false);
    setFacebookConnected(false);
    setFacebookSyncError(null);
  }, []);

  const markRead = useCallback((reviewId) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId ? { ...review, read: true } : review
      )
    );
  }, []);

  const toggleRead = useCallback((reviewId) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId ? { ...review, read: !review.read } : review
      )
    );
  }, []);

  const replyToReview = useCallback(async (reviewId, replyText) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;

    const review = reviews.find((r) => r.id === reviewId);
    if (review?.source === 'Facebook' && review.openGraphStoryId) {
      await replyToFacebookReview({
        openGraphStoryId: review.openGraphStoryId,
        message: trimmed,
      });
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              replied: true,
              replyText: trimmed,
              repliedAt: new Date().toISOString(),
              read: true,
            }
          : r
      )
    );
  }, [reviews]);

  /** Reload Riverside seed data while staying connected (demo reset). */
  const resetDemoData = useCallback(() => {
    const profile = fetchMockBusinessProfile();
    setBusiness(profile.business);
    setReviews(profile.reviews);
    setConnected(true);
    setFacebookConnected(false);
    setFacebookSyncError(null);
  }, []);

  /** Prepend a review (used for simulated live arrival in demo). */
  const prependReview = useCallback((review) => {
    if (!review?.id) return;
    setReviews((prev) => {
      if (prev.some((r) => r.id === review.id)) return prev;
      return [review, ...prev];
    });
  }, []);

  const sortedReviews = useMemo(
    () =>
      [...reviews].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [reviews]
  );

  const unreadNegativeCount = useMemo(
    () => reviews.filter((r) => !r.read && r.rating <= 2).length,
    [reviews]
  );

  const value = useMemo(
    () => ({
      business,
      reviews: sortedReviews,
      connected,
      facebookConnected,
      syncingFacebook,
      facebookSyncError,
      connectBusiness,
      syncFacebookReviews,
      disconnectFacebook,
      disconnectBusiness,
      deleteAllData,
      markRead,
      toggleRead,
      replyToReview,
      resetDemoData,
      prependReview,
      unreadNegativeCount,
    }),
    [
      business,
      sortedReviews,
      connected,
      facebookConnected,
      syncingFacebook,
      facebookSyncError,
      connectBusiness,
      syncFacebookReviews,
      disconnectFacebook,
      disconnectBusiness,
      deleteAllData,
      markRead,
      toggleRead,
      replyToReview,
      resetDemoData,
      prependReview,
      unreadNegativeCount,
    ]
  );

  return (
    <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) {
    throw new Error('useReviews must be used within ReviewsProvider');
  }
  return ctx;
}
