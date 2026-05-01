// RegisterScreen — same visual language as LoginScreen + OnboardingScreen.
// On success, lands the user in onboarding (the existing 3-step flow).

import { useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";

interface RegisterScreenProps {
  onRegistered?: () => void;
  onNavigateLogin?: () => void;
}

const MIN_PASSWORD_LEN = 12;

export default function RegisterScreen({ onRegistered, onNavigateLogin }: RegisterScreenProps) {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const valid =
    displayName.trim().length > 0 &&
    /.+@.+\..+/.test(email) &&
    password.length >= MIN_PASSWORD_LEN &&
    agreed;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await signUp.email({
        email: email.trim(),
        password,
        name: displayName.trim(),
      });
      if ((res as { error?: { message?: string } }).error) {
        setError((res as { error: { message?: string } }).error.message ?? "Could not create account.");
        return;
      }
      onRegistered?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
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
        overflow: "auto",
      }}
    >
      <header style={{ padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="display" style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em" }}>engram</span>
        <button onClick={onNavigateLogin} style={{ color: "var(--ink-3)", fontSize: 13, background: "transparent", border: "none", cursor: "pointer" }}>
          Sign in instead
        </button>
      </header>

      <div className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 40px 40px", textAlign: "center" }}>
        <div
          className="breathe"
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, var(--accent-soft), var(--accent))",
            boxShadow: "0 12px 48px color-mix(in oklab, var(--accent) 40%, transparent)",
            marginBottom: 24,
          }}
        />
        <h1 className="display" style={{ fontSize: 40, fontWeight: 400, letterSpacing: "-0.03em", margin: 0, maxWidth: 600 }}>
          Begin <span style={{ fontStyle: "italic", color: "var(--ink-3)" }}>quietly.</span>
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-3)", marginTop: 12, marginBottom: 28, maxWidth: 480, lineHeight: 1.55 }}>
          Create an account. Your reflections stay yours.
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 380 }}>
          <input
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="What should IRIS call you?"
            required
            style={inputStyle}
          />
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`Password (min ${MIN_PASSWORD_LEN} chars)`}
            required
            minLength={MIN_PASSWORD_LEN}
            style={inputStyle}
          />
          <StrengthBar score={strength} />
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--ink-3)", textAlign: "left", padding: "8px 4px" }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
            <span>I agree to the Terms and Privacy Policy.</span>
          </label>
          {error && (
            <div style={{ fontSize: 13, color: "var(--plum)", textAlign: "left", paddingLeft: 4 }}>{error}</div>
          )}
          <button
            type="submit"
            disabled={!valid || submitting}
            style={{
              padding: "14px 28px",
              borderRadius: "var(--r-pill)",
              background: "var(--accent)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 500,
              border: "1px solid var(--accent)",
              opacity: valid && !submitting ? 1 : 0.5,
              transition: "transform 150ms var(--ease)",
              marginTop: 4,
            }}
          >
            {submitting ? "Creating account…" : "Begin"}
          </button>
        </form>
      </div>

      <footer style={{ padding: "24px 40px 32px", textAlign: "center", fontSize: 11, color: "var(--ink-4)" }}>
        End-to-end encrypted · No ads · No selling of your data
      </footer>
    </div>
  );
}

function passwordStrength(pw: string): number {
  if (pw.length === 0) return 0;
  let score = 0;
  if (pw.length >= MIN_PASSWORD_LEN) score++;
  if (pw.length >= 16) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

function StrengthBar({ score }: { score: number }) {
  const colors = ["var(--ink-5)", "var(--plum)", "var(--warm)", "var(--accent-2)", "var(--accent)"];
  return (
    <div style={{ display: "flex", gap: 4, padding: "0 4px" }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            background: i < score ? colors[score] : "var(--line)",
            transition: "background 200ms var(--ease)",
          }}
        />
      ))}
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
