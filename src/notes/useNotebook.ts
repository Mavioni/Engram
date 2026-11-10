import { useCallback, useEffect, useRef, useState } from "react";
import { loadEntries, removeEntry, saveEntry } from "./api";
import { emptyNotebook, type Draft, type Entry, type Notebook } from "./model";
import type { VaultSession } from "./vault";

export function useNotebook(vault?: VaultSession) {
  const [notebook, setNotebook] = useState<Notebook>(vault?.notebook ?? emptyNotebook());
  const current = useRef(notebook);
  const [loading, setLoading] = useState(!vault);
  const [saving, setSaving] = useState(false);
  const [draftStatus, setDraftStatus] = useState(
    vault ? "Draft encrypted on this device" : "Draft stays in this session",
  );
  const [error, setError] = useState("");
  const busy = useRef(false);
  const revision = useRef(0);
  const commit = useCallback((next: Notebook) => {
    current.current = next;
    setNotebook(next);
  }, []);

  useEffect(() => {
    if (vault) return;
    let active = true;
    loadEntries()
      .then((entries) => {
        if (active) commit({ ...current.current, entries });
      })
      .catch((reason) => {
        if (active) setError(String(reason instanceof Error ? reason.message : reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [vault, commit]);

  const updateDraft = (draft: Draft) => {
    if (busy.current) return;
    const next = { ...current.current, draft };
    commit(next);
    if (!vault) return;
    const id = ++revision.current;
    setDraftStatus("Encrypting draft…");
    void vault
      .save(next)
      .then(() => {
        if (id === revision.current) setDraftStatus("Draft encrypted on this device");
      })
      .catch((reason) => {
        setError(reason.message);
        setDraftStatus("Draft not saved");
      });
  };

  const put = async (entry: Entry): Promise<boolean> => {
    if (busy.current || loading) return false;
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      const exists = current.current.entries.some((item) => item.id === entry.id);
      const saved = vault ? entry : await saveEntry(entry, exists);
      const next = {
        ...current.current,
        entries: [saved, ...current.current.entries.filter((item) => item.id !== entry.id)].sort(
          (a, b) => b.createdAt - a.createdAt,
        ),
      };
      if (vault) await vault.save(next);
      // Preserve any draft changes made while the network request was running.
      commit({ ...next, draft: current.current.draft });
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The entry was not saved.");
      return false;
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    if (busy.current || loading) return false;
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      if (!vault) await removeEntry(id);
      const next = {
        ...current.current,
        entries: current.current.entries.filter((item) => item.id !== id),
      };
      if (vault) await vault.save(next);
      commit({ ...next, draft: current.current.draft });
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The entry was not deleted.");
      return false;
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  const importEntries = async (entries: Entry[]) => {
    let count = 0;
    for (const entry of entries) {
      if (!(await put(entry))) break;
      count++;
    }
    return count;
  };
  return {
    notebook,
    loading,
    saving,
    draftStatus,
    error,
    updateDraft,
    put,
    remove,
    importEntries,
    clearError: () => setError(""),
  };
}
