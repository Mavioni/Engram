import { emptyNotebook, type Notebook, parseEntry } from "./model";

const DB_NAME = "engram-private-alpha";
const STORE = "vault";
type Envelope = { salt: number[]; iv: number[]; ciphertext: number[]; version: 1 };

async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Device storage could not be opened."));
  });
}
async function readEnvelope(): Promise<Envelope | undefined> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE).objectStore(STORE).get("notebook");
      request.onsuccess = () => resolve(request.result as Envelope | undefined);
      request.onerror = () => reject(new Error("The device vault could not be read."));
    });
  } finally {
    db.close();
  }
}
async function writeEnvelope(envelope: Envelope): Promise<void> {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(envelope, "notebook");
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(new Error("Could not save. Keep this page open and export your notes."));
      tx.onabort = () =>
        reject(new Error("Saving was interrupted. Your previous vault is unchanged."));
    });
  } finally {
    db.close();
  }
}
async function derive(passphrase: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}
export const vaultExists = async () => Boolean(await readEnvelope());
export type VaultSession = { notebook: Notebook; save: (notebook: Notebook) => Promise<void> };

export async function unlockVault(passphrase: string, create: boolean): Promise<VaultSession> {
  if (!crypto.subtle) throw new Error("Open Engram over HTTPS to use the encrypted vault.");
  const stored = await readEnvelope();
  if (create && stored) throw new Error("A vault already exists. Unlock it with its passphrase.");
  if (!stored && !create) throw new Error("No device vault was found.");
  if (create && passphrase.length < 12)
    throw new Error("Use a passphrase of at least 12 characters.");
  const salt = stored ? new Uint8Array(stored.salt) : crypto.getRandomValues(new Uint8Array(16));
  const key = await derive(passphrase, salt);
  let notebook = emptyNotebook();
  if (stored) {
    let plaintext: ArrayBuffer;
    try {
      plaintext = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(stored.iv) },
        key,
        new Uint8Array(stored.ciphertext),
      );
    } catch {
      throw new Error("That passphrase did not unlock the vault.");
    }
    const data = JSON.parse(new TextDecoder().decode(plaintext)) as Notebook;
    if (
      data.version !== 1 ||
      !Array.isArray(data.entries) ||
      !data.draft ||
      typeof data.draft.body !== "string"
    )
      throw new Error("This vault format is not supported.");
    notebook = {
      ...data,
      entries: data.entries
        .map(parseEntry)
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    };
  }
  // Chain writes so rapid draft saves cannot overwrite newer content.
  let queue: Promise<void> = Promise.resolve();
  const save = (value: Notebook) => {
    const snapshot = JSON.stringify(value);
    const pending = queue
      .catch(() => undefined)
      .then(async () => {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const ciphertext = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv },
          key,
          new TextEncoder().encode(snapshot),
        );
        await writeEnvelope({
          version: 1,
          salt: Array.from(salt),
          iv: Array.from(iv),
          ciphertext: Array.from(new Uint8Array(ciphertext)),
        });
      });
    queue = pending;
    return pending;
  };
  if (create) await save(notebook);
  return { notebook, save };
}
