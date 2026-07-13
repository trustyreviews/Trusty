import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Logged-in person account (not the business). Mock session until real auth is wired.
const DEFAULT_USER = {
  name: 'Drew Morgan',
  email: 'drew@riversidecoffee.co',
};

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);

  const updateUser = useCallback(({ name, email }) => {
    setUser((prev) => ({
      name: name?.trim() || prev.name,
      email: email?.trim() || prev.email,
    }));
  }, []);

  const resetUser = useCallback(() => {
    setUser(DEFAULT_USER);
  }, []);

  const initials = useMemo(() => {
    const parts = user.name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase() || '?';
  }, [user.name]);

  const value = useMemo(
    () => ({
      user,
      initials,
      updateUser,
      resetUser,
    }),
    [user, initials, updateUser, resetUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
}
