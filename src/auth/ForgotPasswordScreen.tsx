// ForgotPasswordScreen — magic-link reset via Better Auth's requestPasswordReset.

import { useState } from "react";
import { useAuth } from "./AuthProvider";

interface ForgotPasswordScreenProps {
  onNavigateLogin?: () => void;
}

export default function ForgotPasswordScreen({ onNavigateLogin }: ForgotPasswordScreenProps) {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await requestPasswordReset({ email: email.trim(), redirectTo: "/reset-password" });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email.");
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
        <button onClick={onNavigateLogin} style={{ color: "var(--ink-3)", fontSize: 13, background: "transparent", border: "none", cursor: "pointer" }}>
          ← Back to sign in
        </button>
      </header>

      <div className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 40px", textAlign: "center" }}>
        {sent ? (
          <>
            <div
              className="breathe"
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, var(--accent-soft), var(--accent))",
                marginBottom: 28,
              }}
            />
            <h1 className="display" style={{ fontSize: 36, fontWeight: 400, letterSpacing: "-0.025em", margin: 0, maxWidth: 520 }}>
              Check your email.
            </h1>
            <p style={{ fontSize: 15, color: "var(--ink-3)", marginTop: 16, maxWidth: 440, lineHeight: 1.55 }}>
              If an account exists for {email}, we've sent a reset link. Take your time.
            </p>
          </>
        ) : (
          <>
            <h1 className="display" style={{ fontSize: 36, fontWeight: 400, letterSpacing: "-0.025em", margin: 0, maxWidth: 520 }}>
              Reset your <span style={{ fontStyle: "italic", color: "var(--ink-3)" }}>password.</span>
            </h1>
            <p style={{ fontSize: 15, color: "var(--ink-3)", marginTop: 14, marginBottom: 32, maxWidth: 440, lineHeight: 1.55 }}>
              Enter your email and we'll send you a quiet way back in.
            </p>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 380 }}>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                style={{
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
                }}
              />
              {error && (
                <div style={{ fontSize: 13, color: "var(--plum)", textAlign: "left", paddingLeft: 4 }}>{error}</div>
              )}
              <button
                type="submit"
                disabled={submitting || !email.trim()}
                style={{
                  padding: "14px 28px",
                  borderRadius: "var(--r-pill)",
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 500,
                  border: "1px solid var(--accent)",
                  opacity: submitting || !email.trim() ? 0.5 : 1,
                  transition: "transform 150ms var(--ease)",
                  marginTop: 4,
                }}
              >
                {submitting ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        )}
      </div>

      <footer style={{ padding: "24px 40px 32px", textAlign: "center", fontSize: 11, color: "var(--ink-4)" }}>
        We won't reveal whether the email is registered.
      </footer>
    </div>
  );
}
