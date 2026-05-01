/**
 * secure-storage.ts — Capacitor Preferences wrapper for non-session sensitive data.
 *
 * SCOPE: Push tokens, device binding identifiers, onboarding state, offline draft
 *        reference IDs, UI-adjacent user preferences that must survive app restart.
 *
 * OUT OF SCOPE: Better Auth session tokens. Session state is cookie-bound (HttpOnly,
 *               SameSite=Lax) and MUST NOT be stored here. See CLAUDE.md invariant #2
 *               and docs/SECURITY_PERIMETER.md §Token Storage.
 *
 * Platform behavior:
 *   iOS    — Capacitor Preferences maps to UserDefaults (NOT Keychain). Sensitive
 *             identifiers should migrate to @capacitor-community/secure-storage-plugin
 *             post-MVP to get Keychain backing (see docs/SECURITY_PERIMETER.md §Gap).
 *   Android — Capacitor Preferences maps to SharedPreferences, which is NOT
 *             encrypted at rest by default. Same upgrade path applies.
 *   Web     — Falls back to localStorage. Do not store secrets in web context.
 */

import { Preferences } from '@capacitor/preferences';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Options for the strict getter variant. */
export interface GetOptions {
  /**
   * When true, throws if the key is absent or the stored value is null.
   * When false (default), returns null for missing keys.
   */
  strict?: boolean;
}

/** Thrown by getToken when strict:true and key is absent. */
export class SecureStorageMissError extends Error {
  constructor(key: string) {
    super(`secure-storage: key "${key}" not found`);
    this.name = 'SecureStorageMissError';
  }
}

// ---------------------------------------------------------------------------
// Core operations
// ---------------------------------------------------------------------------

/**
 * Retrieve a value by key.
 *
 * @param key    Storage key.
 * @param opts   Pass { strict: true } to throw SecureStorageMissError on miss.
 * @returns      Stored string, or null when key is absent and strict is false.
 */
export async function getToken(key: string, opts?: GetOptions): Promise<string | null>;
export async function getToken(key: string, opts: GetOptions & { strict: true }): Promise<string>;
export async function getToken(
  key: string,
  opts: GetOptions = {},
): Promise<string | null> {
  const { value } = await Preferences.get({ key });

  if (value === null && opts.strict === true) {
    throw new SecureStorageMissError(key);
  }

  return value;
}

/**
 * Store a value under key.
 *
 * @param key    Storage key.
 * @param value  String value to store.
 */
export async function setToken(key: string, value: string): Promise<void> {
  if (typeof value !== 'string') {
    throw new TypeError(`secure-storage: value for key "${key}" must be a string`);
  }
  await Preferences.set({ key, value });
}

/**
 * Remove a single key.
 *
 * @param key  Storage key to remove.
 */
export async function clearToken(key: string): Promise<void> {
  await Preferences.remove({ key });
}

/**
 * Remove ALL keys from Capacitor Preferences for this app.
 *
 * Use with care — this wipes every preference stored by the app,
 * not only auth-related keys. Intended for logout / account deletion flows.
 */
export async function clearAll(): Promise<void> {
  await Preferences.clear();
}
