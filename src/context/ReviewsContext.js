import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { fetchMockBusinessProfile } from '../data/mockData';

const ReviewsContext = createContext(null);

export function ReviewsProvider({ children }) {
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [connected, setConnected] = useState(false);

  const connectBusiness = useCallback(() => {
    // TODO: Replace this mock load with real Google OAuth + Business Profile API.
    // Flow later: AuthSession → access token → accounts.locations.get + reviews.list
    const profile = fetchMockBusinessProfile();
    setBusiness(profile.business);
    setReviews(profile.reviews);
    setConnected(true);
  }, []);

  const disconnectBusiness = useCallback(() => {
    // Keeps local review cache until deleteAllData — only drops the "connected" session.
    setConnected(false);
  }, []);

  const deleteAllData = useCallback(() => {
    setBusiness(null);
    setReviews([]);
    setConnected(false);
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

  const replyToReview = useCallback((reviewId, replyText) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;

    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              replied: true,
              replyText: trimmed,
              repliedAt: new Date().toISOString(),
              read: true,
            }
          : review
      )
    );
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
      connectBusiness,
      disconnectBusiness,
      deleteAllData,
      markRead,
      toggleRead,
      replyToReview,
      unreadNegativeCount,
    }),
    [
      business,
      sortedReviews,
      connected,
      connectBusiness,
      disconnectBusiness,
      deleteAllData,
      markRead,
      toggleRead,
      replyToReview,
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
