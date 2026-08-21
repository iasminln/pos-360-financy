import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useApolloClient, useLazyQuery } from "@apollo/client/react";
import { ME_QUERY } from "@/graphql/operations";
import { clearToken, getToken, setToken } from "@/lib/auth";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchMe] = useLazyQuery(ME_QUERY, { fetchPolicy: "network-only" });

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUserState(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await fetchMe();
      const me = (data as { me?: User } | undefined)?.me ?? null;
      setUserState(me);
      if (!me) clearToken();
    } catch {
      clearToken();
      setUserState(null);
    } finally {
      setLoading(false);
    }
  }, [fetchMe]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    (token: string, nextUser: User) => {
      setToken(token);
      setUserState(nextUser);
      // Drop previous user data so queries start clean for the new session
      void client.clearStore();
    },
    [client],
  );

  const logout = useCallback(() => {
    clearToken();
    setUserState(null);
    void client.clearStore();
  }, [client]);

  const setUser = useCallback((nextUser: User) => {
    setUserState(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      setUser,
      refreshUser,
    }),
    [user, loading, login, logout, setUser, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
