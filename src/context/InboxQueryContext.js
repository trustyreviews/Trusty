import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { DEFAULT_INBOX_QUERY, isInboxQueryActive } from '../utils/inboxQuery';

const InboxQueryContext = createContext(null);

export function InboxQueryProvider({ children }) {
  const [query, setQuery] = useState(DEFAULT_INBOX_QUERY);

  const applyQuery = useCallback((next) => {
    setQuery({ ...DEFAULT_INBOX_QUERY, ...next });
  }, []);

  const resetQuery = useCallback(() => {
    setQuery(DEFAULT_INBOX_QUERY);
  }, []);

  const value = useMemo(
    () => ({
      query,
      applyQuery,
      resetQuery,
      isActive: isInboxQueryActive(query),
    }),
    [query, applyQuery, resetQuery]
  );

  return (
    <InboxQueryContext.Provider value={value}>{children}</InboxQueryContext.Provider>
  );
}

export function useInboxQuery() {
  const ctx = useContext(InboxQueryContext);
  if (!ctx) {
    throw new Error('useInboxQuery must be used within InboxQueryProvider');
  }
  return ctx;
}
