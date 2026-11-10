// LoginScreen — visual treatment matches OnboardingScreen: radial gradient, breathing orb,
// Fraunces display heading. Quiet entry to a quiet product.

import { useState } from "react";
import { useAuth } from "./AuthProvider";

interface LoginScreenProps {
  onSignedIn?: () => void;
  onNavigateRegister?: () => void;
  onNavigateForgot?: () => void;
}

export default function LoginScreen({ onSignedIn, onNavigateRegister, onNavigateForgot }: LoginScreenProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await signIn.email({ email: email.trim(), password });
      if ((res as { error?: { message?: string } }).error) {
        setError((res as { error: { message?: string } }).error.message ?? "Sign in failed.");
        return;
      }
      onSignedIn?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "radial-gradient(ellipse at center top, var(--accent-tint), var(--bg) 70%)",
      }}
    >
      <header style={{ padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="display" style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em" }}>engram</span>
      </header>

      <div className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 40px", textAlign: "center" }}>
        <div
          className="breathe"
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, var(--accent-soft), var(--accent))",
            boxShadow: "0 12px 64px color-mix(in oklab, var(--accent) 40%, transparent)",
            marginBottom: 32,
          }}
        />
        <h1 className="display" style={{ fontSize: 44, fontWeight: 400, letterSpacing: "-0.03em", margin: 0, maxWidth: 600 }}>
          Welcome back. <span style={{ fontStyle: "italic", color: "var(--ink-3)" }}>Take a breath.</span>
        </h1>
        <p style={{ fontSize: 16, color: "var(--ink-3)", marginTop: 14, marginBottom: 36, maxWidth: 480, lineHeight: 1.55 }}>
          Sign in to continue your reflection.
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 380 }}>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={inputStyle}
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={inputStyle}
          />
          {error && (
            <div style={{ fontSize: 13, color: "var(--plum)", textAlign: "left", paddingLeft: 4 }}>{error}</div>
          )}
          <button
            type="submit"
            disabled={submitting || !email.trim() || !password}
            style={{
              padding: "14px 28px",
              borderRadius: "var(--r-pill)",
              background: "var(--accent)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 500,
              border: "1px solid var(--accent)",
              opacity: submitting || !email.trim() || !password ? 0.5 : 1,
              transition: "transform 150ms var(--ease)",
              marginTop: 4,
            }}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: 18, display: "flex", gap: 18, fontSize: 13, color: "var(--ink-3)" }}>
          <button onClick={onNavigateForgot} style={ghostLink}>Forgot password?</button>
          <span style={{ color: "var(--ink-5)" }}>·</span>
          <button onClick={onNavigateRegister} style={ghostLink}>Create an account →</button>
        </div>
      </div>

      <footer style={{ padding: "24px 40px 32px", textAlign: "center", fontSize: 11, color: "var(--ink-4)" }}>
        Account-based access · Memory is used only when you enable it
      </footer>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "16px 22px",
  borderRadius: "var(--r-pill)",
  border: "1px solid var(--line-2)",
  background: "var(--bg-card)",
  fontSize: 16,
  fontFamily: "var(--font-sans)",
  outline: "none",
  textAlign: "center",
  boxShadow: "var(--shadow-sm)",
  color: "var(--ink)",
};

const ghostLink: React.CSSProperties = {
  color: "var(--ink-3)",
  background: "transparent",
  border: "none",
  fontSize: 13,
  cursor: "pointer",
  fontFamily: "inherit",
};
