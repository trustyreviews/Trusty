import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const DEFAULT_ACCOUNTS = [
  { id: 'google', label: 'Google Business Profile', connected: true },
  { id: 'yelp', label: 'Yelp', connected: false },
  { id: 'facebook', label: 'Facebook', connected: false },
];

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    scope: 'negative', // 'all' | 'negative'
  });
  const [tone, setTone] = useState('casual'); // 'casual' | 'formal'
  const [accounts, setAccounts] = useState(DEFAULT_ACCOUNTS);
  const [subscription, setSubscription] = useState({
    plan: 'Pro',
    price: '$29/mo',
    renewsOn: 'Aug 12, 2026',
    status: 'active', // 'active' | 'canceled'
  });

  const updateNotifications = useCallback((patch) => {
    setNotifications((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleAccount = useCallback((accountId) => {
    // Mock connect/disconnect — replace with real OAuth later.
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === accountId
          ? { ...account, connected: !account.connected }
          : account
      )
    );
  }, []);

  const cancelSubscription = useCallback(() => {
    setSubscription((prev) => ({
      ...prev,
      status: 'canceled',
      plan: 'Canceled',
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setNotifications({ push: true, email: true, scope: 'negative' });
    setTone('casual');
    setAccounts(DEFAULT_ACCOUNTS);
    setSubscription({
      plan: 'Pro',
      price: '$29/mo',
      renewsOn: 'Aug 12, 2026',
      status: 'active',
    });
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      updateNotifications,
      tone,
      setTone,
      accounts,
      toggleAccount,
      subscription,
      cancelSubscription,
      resetSettings,
    }),
    [
      notifications,
      updateNotifications,
      tone,
      accounts,
      toggleAccount,
      subscription,
      cancelSubscription,
      resetSettings,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}
