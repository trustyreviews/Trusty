import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DEMO_FOCUS_REVIEW_ID,
  createDemoIncomingReview,
} from '../data/mockData';
import { useInboxQuery } from './InboxQueryContext';
import { useReviews } from './ReviewsContext';

export { DEMO_FOCUS_REVIEW_ID };

/** Checklist items shown in the floating demo panel. */
export const DEMO_CHECKLIST = [
  {
    id: 'open',
    label: 'Open the 1★ recovery review',
    detail: 'Priya Nair — wait time complaint',
  },
  {
    id: 'draft',
    label: 'Draft a reply with AI',
    detail: 'One tap from the reply editor',
  },
  {
    id: 'reply',
    label: 'Post your reply',
    detail: 'Send it as Riverside Coffee Co.',
  },
  {
    id: 'live',
    label: 'Catch a new review arriving',
    detail: 'Watch the inbox update live',
  },
];

const LIVE_DELAY_MS = 28000;
const LIVE_AFTER_REPLY_MS = 3500;

const DemoContext = createContext(null);

function emptyCompleted() {
  return { open: false, draft: false, reply: false, live: false };
}

export function DemoProvider({ children }) {
  const { connected, reviews, resetDemoData, prependReview, connectBusiness } =
    useReviews();
  const { resetQuery } = useInboxQuery();

  const [demoActive, setDemoActive] = useState(false);
  const [completed, setCompleted] = useState(emptyCompleted);
  const [tourStep, setTourStep] = useState('spotlight'); // spotlight | ai | send | done
  const [checklistOpen, setChecklistOpen] = useState(true);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistDismissed, setWaitlistDismissed] = useState(false);
  const [liveToast, setLiveToast] = useState(null);
  const [focusRequestId, setFocusRequestId] = useState(0);

  const liveTimerRef = useRef(null);
  const liveInjectedRef = useRef(false);

  const clearLiveTimer = useCallback(() => {
    if (liveTimerRef.current) {
      clearTimeout(liveTimerRef.current);
      liveTimerRef.current = null;
    }
  }, []);

  const markCompleted = useCallback((id) => {
    setCompleted((prev) => {
      if (prev[id]) return prev;
      return { ...prev, [id]: true };
    });
  }, []);

  const injectLiveReview = useCallback(() => {
    if (liveInjectedRef.current) return;
    liveInjectedRef.current = true;
    clearLiveTimer();
    const incoming = createDemoIncomingReview();
    prependReview(incoming);
    markCompleted('live');
    setLiveToast({
      id: incoming.id,
      authorName: incoming.authorName,
      rating: incoming.rating,
    });
  }, [clearLiveTimer, prependReview, markCompleted]);

  const scheduleLiveReview = useCallback(
    (delayMs = LIVE_DELAY_MS) => {
      clearLiveTimer();
      if (liveInjectedRef.current) return;
      liveTimerRef.current = setTimeout(() => {
        injectLiveReview();
      }, delayMs);
    },
    [clearLiveTimer, injectLiveReview]
  );

  const beginDemoSession = useCallback(() => {
    setDemoActive(true);
    setCompleted(emptyCompleted());
    setTourStep('spotlight');
    setChecklistOpen(true);
    setWaitlistOpen(false);
    setWaitlistDismissed(false);
    setLiveToast(null);
    liveInjectedRef.current = false;
    setFocusRequestId((n) => n + 1);
    scheduleLiveReview(LIVE_DELAY_MS);
  }, [scheduleLiveReview]);

  const startDemo = useCallback(() => {
    connectBusiness();
    beginDemoSession();
  }, [connectBusiness, beginDemoSession]);

  const resetDemo = useCallback(() => {
    clearLiveTimer();
    resetQuery();
    resetDemoData();
    beginDemoSession();
  }, [clearLiveTimer, resetQuery, resetDemoData, beginDemoSession]);

  // Keep demoActive in sync with connection; leave demo when disconnected.
  useEffect(() => {
    if (!connected) {
      setDemoActive(false);
      clearLiveTimer();
      liveInjectedRef.current = false;
      setLiveToast(null);
      setWaitlistOpen(false);
    }
  }, [connected, clearLiveTimer]);

  // Derive checklist progress from review mutations.
  useEffect(() => {
    if (!demoActive) return;
    const focus = reviews.find((r) => r.id === DEMO_FOCUS_REVIEW_ID);
    if (focus?.read) markCompleted('open');
    if (focus?.replied) {
      markCompleted('open');
      markCompleted('reply');
      setTourStep('done');
      if (!liveInjectedRef.current) {
        scheduleLiveReview(LIVE_AFTER_REPLY_MS);
      }
    }
    if (reviews.some((r) => r.id === 'rev_demo_live')) {
      markCompleted('live');
      liveInjectedRef.current = true;
    }
  }, [demoActive, reviews, markCompleted, scheduleLiveReview]);

  const allComplete = useMemo(
    () => DEMO_CHECKLIST.every((step) => completed[step.id]),
    [completed]
  );

  useEffect(() => {
    if (demoActive && allComplete && !waitlistDismissed) {
      setWaitlistOpen(true);
    }
  }, [demoActive, allComplete, waitlistDismissed]);

  const notifyOpenedFocus = useCallback(() => {
    markCompleted('open');
    setTourStep((prev) => (prev === 'spotlight' ? 'ai' : prev));
  }, [markCompleted]);

  const notifyDraftedWithAi = useCallback(() => {
    markCompleted('draft');
    setTourStep((prev) =>
      prev === 'spotlight' || prev === 'ai' ? 'send' : prev
    );
  }, [markCompleted]);

  const dismissLiveToast = useCallback(() => setLiveToast(null), []);

  const dismissWaitlist = useCallback(() => {
    setWaitlistOpen(false);
    setWaitlistDismissed(true);
  }, []);

  const skipTour = useCallback(() => setTourStep('done'), []);

  const value = useMemo(
    () => ({
      demoActive,
      completed,
      allComplete,
      tourStep,
      checklistOpen,
      setChecklistOpen,
      waitlistOpen,
      setWaitlistOpen,
      dismissWaitlist,
      liveToast,
      dismissLiveToast,
      focusRequestId,
      focusReviewId: DEMO_FOCUS_REVIEW_ID,
      startDemo,
      beginDemoSession,
      resetDemo,
      notifyOpenedFocus,
      notifyDraftedWithAi,
      skipTour,
      injectLiveReview,
    }),
    [
      demoActive,
      completed,
      allComplete,
      tourStep,
      checklistOpen,
      waitlistOpen,
      dismissWaitlist,
      liveToast,
      dismissLiveToast,
      focusRequestId,
      startDemo,
      beginDemoSession,
      resetDemo,
      notifyOpenedFocus,
      notifyDraftedWithAi,
      skipTour,
      injectLiveReview,
    ]
  );

  return (
    <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error('useDemo must be used within DemoProvider');
  }
  return ctx;
}
