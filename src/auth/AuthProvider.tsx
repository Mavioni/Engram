// AuthProvider — React context bridge between Better Auth's hook surface and the
// rest of the app. App.tsx wraps the screen tree in <AuthProvider> and reads `status`
// to decide between login/register/onboarding/home.

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { authClient, useSession } from "./auth-client";

type AuthStatus = "loading" | "signed-in" | "signed-out";

interface SessionUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  status: AuthStatus;
  signIn: typeof authClient.signIn;
  signUp: typeof authClient.signUp;
  signOut: typeof authClient.signOut;
  forgetPassword: typeof authClient.forgetPassword;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSession();

  const isPending = (session as { isPending?: boolean }).isPending ?? false;
  const sessionUser = (session.data as { user?: SessionUser } | null)?.user ?? null;

  const status: AuthStatus = isPending
    ? "loading"
    : sessionUser
      ? "signed-in"
      : "signed-out";

  // Sync displayName into the Zustand user-store when the user signs in.
  // mythos-sasuke owns user-store; mythos-indra's bridge mounts it on window.
  useEffect(() => {
    if (sessionUser) {
      const store = (window as unknown as { useUserStore?: { getState: () => { setDisplayName: (n: string) => void } } }).useUserStore;
      store?.getState().setDisplayName(sessionUser.name ?? sessionUser.email.split("@")[0] ?? "friend");
    }
  }, [sessionUser]);

  const value: AuthContextValue = {
    user: sessionUser,
    status,
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    signOut: authClient.signOut,
    forgetPassword: authClient.forgetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
