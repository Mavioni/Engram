// Better Auth client — exposed to the rest of the app via auth-client + AuthProvider.
// Server side lives in `server/src/auth/better-auth.ts` (mythos-orochimaru).

import { createAuthClient } from "better-auth/react";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export const authClient = createAuthClient({
  baseURL,
});

export const { useSession, signIn, signUp, signOut, forgetPassword } = authClient;

export type AuthSession = ReturnType<typeof useSession>;
