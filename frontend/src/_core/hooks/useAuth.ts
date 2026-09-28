import { useCallback, useEffect, useState } from "react";
import { localDb, User } from "@/lib/localStorage";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(() => {
    try {
      const currentUser = localDb.auth.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    // Listen for custom event if auth changes across components
    const handleAuthChange = () => fetchUser();
    window.addEventListener("nivaas-auth-change", handleAuthChange);
    return () => window.removeEventListener("nivaas-auth-change", handleAuthChange);
  }, [fetchUser]);

  const logout = useCallback(async () => {
    localDb.auth.logout();
    window.dispatchEvent(new Event("nivaas-auth-change"));
    if (redirectPath) {
      window.location.href = redirectPath;
    } else {
      window.location.href = "/login";
    }
  }, [redirectPath]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (user) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;

    if (redirectPath) {
      window.location.href = redirectPath;
    } else {
      window.location.href = "/login";
    }
  }, [redirectOnUnauthenticated, redirectPath, loading, user]);

  return {
    user,
    loading,
    error: null,
    isAuthenticated: Boolean(user),
    refresh: fetchUser,
    logout,
  };
}
