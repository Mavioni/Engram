import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { SOURCE_URL } from "./api";
import { unlockVault, vaultExists, type VaultSession } from "./vault";

export function VaultGate({
  onUnlocked,
  onCloud,
}: {
  onUnlocked: (session: VaultSession) => void;
  onCloud?: () => void;
}) {
  const [exists, setExists] = useState<boolean | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    void vaultExists()
      .then(setExists)
      .catch(() =>
        setError(
          "Device storage is unavailable. Try your regular browser instead of private browsing.",
        ),
      );
  }, []);
  return (
    <main className="vault-gate">
      <div className="gate-brand">
        <span className="brand-dot" /> ENGRAM <span className="label">PRIVATE ALPHA</span>
      </div>
      <div className="gate-content">
        <div className="gate-icon">
          <Icon name="lock" size={25} />
        </div>
        <div className="label accent">YOUR WORDS. YOUR SPACE.</div>
        <h1>{exists ? "Return to yourself." : "A place for your mind."}</h1>
        <p>
          {exists
            ? "Unlock your private notebook to pick up where you left off."
            : "Notes, memories, and a clearer view of your days. Begin with a private notebook on this device."}
        </p>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            try {
              if (!exists && passphrase !== confirm)
                throw new Error("The two passphrases do not match.");
              const session = await unlockVault(passphrase, !exists);
              setPassphrase("");
              setConfirm("");
              onUnlocked(session);
            } catch (reason) {
              setError(reason instanceof Error ? reason.message : "The vault could not be opened.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Vault passphrase
            <input
              autoComplete={exists ? "current-password" : "new-password"}
              type="password"
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
              minLength={exists ? 1 : 12}
              required
              disabled={exists === null}
              placeholder={exists ? "Your private passphrase" : "At least 12 characters"}
            />
          </label>
          {exists === false && (
            <label>
              Confirm passphrase
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                minLength={12}
                required
                placeholder="Enter it once more"
              />
            </label>
          )}
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          <button className="primary" disabled={busy || exists === null}>
            {busy ? "Opening…" : exists ? "Unlock notebook" : "Create private notebook"}{" "}
            <Icon name="arrow" size={16} />
          </button>
        </form>
        <p className="fine-print">
          Encrypted on this device. Keep your passphrase safe: it cannot be recovered. Export a
          backup from Settings. AI and cloud sync require a connected Engram server.
        </p>
        {onCloud && (
          <button className="text-button" onClick={onCloud}>
            Sign in to Engram Cloud
          </button>
        )}
      </div>
      <footer>
        Your note-taking interface, evolved. <a href={SOURCE_URL}>Source · AGPL-3.0</a>
      </footer>
    </main>
  );
}
