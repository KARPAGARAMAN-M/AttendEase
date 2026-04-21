import { createContext, useContext, useMemo, useState } from "react";
import { AuthApi } from "./api/services";
import { clearSession, loadSession, saveSession } from "./auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession());

  async function login(username, password, role) {
    const payload = await AuthApi.login(username, password, role);
    saveSession(payload.token, payload.user);
    setSession({ token: payload.token, user: payload.user });
    return payload.user;
  }

  function logout() {
    clearSession();
    setSession({ token: "", user: null });
  }

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      isAuthenticated: Boolean(session.token && session.user),
      login,
      logout,
      setSession,
    }),
    [session],
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
