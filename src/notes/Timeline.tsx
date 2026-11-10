import { useState } from "react";
import { Icon } from "./Icon";
import { MOODS, countWords, dateLabel, moodOf, type Entry, type Mood } from "./model";

export function Timeline({ entries, open }: { entries: Entry[]; open: (entry: Entry) => void }) {
  const [view, setView] = useState<"river" | "grid" | "list" | "map">("river");
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const filtered = entries
    .filter(
      (entry) =>
        (!mood || entry.mood === mood) &&
        `${entry.title} ${entry.body} ${entry.tags.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  return (
    <section className="scroll-view timeline-screen">
      <div className="section-heading">
        <div>
          <span className="label">YOUR DAYS, IN YOUR WORDS</span>
          <h1>The shape of your days.</h1>
        </div>
        <span className="label">{entries.length} ENTRIES</span>
      </div>
      <div className="timeline-controls">
        <div className="segmented" role="group" aria-label="Timeline view">
          {(["river", "grid", "list", "map"] as const).map((item) => (
            <button
              key={item}
              aria-pressed={view === item}
              className={view === item ? "active" : ""}
              onClick={() => setView(item)}
            >
              <Icon name={item} size={14} />
              {item}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Icon name="search" size={15} />
          <input
            aria-label="Search entries"
            placeholder="Find a word, a day, a feeling…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <div className="timeline-filter">
        <button
          className={`filter-all${!mood ? " active" : ""}`}
          aria-pressed={!mood}
          onClick={() => setMood(null)}
        >
          All moods
        </button>
        {MOODS.map((item) => (
          <button
            className={`mood-filter${mood === item.id ? " active" : ""}`}
            key={item.id}
            aria-label={`Filter ${item.label}`}
            aria-pressed={mood === item.id}
            onClick={() => setMood(mood === item.id ? null : item.id)}
          >
            <span style={{ background: item.color }} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      {!filtered.length ? (
        <div className="empty-state">
          <Icon name={entries.length ? "search" : "pen"} size={28} />
          <h2>
            {entries.length ? "No entries match your search." : "Your story begins with a day."}
          </h2>
          <p>
            {entries.length
              ? "Try a different word or clear your filters."
              : "Save your first entry in Today. It will appear here."}
          </p>
          {entries.length > 0 && (
            <button
              className="secondary"
              onClick={() => {
                setQuery("");
                setMood(null);
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : view === "map" ? (
        <div className="memory-map">
          <div className="label">ENTRY MAP · YOUR MOODS AND TAGS</div>
          <div className="map-center">
            <Icon name="eye" size={28} />
            <span>YOUR DAYS</span>
          </div>
          <div className="map-nodes">
            {filtered.map((entry) => (
              <button key={entry.id} className="map-node" onClick={() => open(entry)}>
                <span
                  className="mood-dot"
                  style={{ background: moodOf(entry.mood)?.color ?? "var(--accent)" }}
                />
                <span>{entry.title || dateLabel(entry.date)}</span>
                <small>
                  {entry.tags.length
                    ? entry.tags.join(" · ")
                    : (moodOf(entry.mood)?.label ?? "Unmarked")}
                </small>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={`entries entries-${view}`}>
          {filtered.map((entry) => (
            <button className="entry-card" key={entry.id} onClick={() => open(entry)}>
              <div className="entry-date">
                <strong>{new Date(`${entry.date}T12:00:00`).getDate()}</strong>
                <span className="label">
                  {dateLabel(entry.date, { month: "short", weekday: "short" })}
                </span>
              </div>
              <div className="entry-preview">
                <div className="entry-card-meta">
                  <span
                    className="mood-dot"
                    style={{ background: moodOf(entry.mood)?.color ?? "var(--fg-3)" }}
                  />
                  <span className="label">{moodOf(entry.mood)?.label ?? "NO MOOD"}</span>
                  <span className="label">{countWords(entry.body)} WORDS</span>
                </div>
                <h2>{entry.title || "Untitled"}</h2>
                <p>{entry.body}</p>
                <div className="entry-tags">
                  {entry.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <Icon name="arrow" size={16} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export function EntryDetail({
  entry,
  close,
  put,
  remove,
  saving,
}: {
  entry: Entry;
  close: () => void;
  put: (entry: Entry) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  saving: boolean;
}) {
  const [draft, setDraft] = useState(entry);
  const [edit, setEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div className="modal-overlay">
      <section
        className="modal-body"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-dialog-title"
      >
        <header className="modal-header">
          <span className="label">
            {dateLabel(entry.date)} · {moodOf(entry.mood)?.label ?? "NO MOOD"}
          </span>
          <button className="icon-button" aria-label="Close entry" onClick={close}>
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-scroll">
          {edit ? (
            <>
              <label className="field-label">
                Title
                <input
                  aria-label="Edit entry title"
                  value={draft.title}
                  maxLength={160}
                  disabled={saving}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                />
              </label>
              <label className="field-label">
                Entry
                <textarea
                  aria-label="Edit entry body"
                  value={draft.body}
                  maxLength={6000}
                  disabled={saving}
                  onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                  rows={10}
                />
              </label>
            </>
          ) : (
            <>
              <h1 id="entry-dialog-title">{entry.title || "Untitled"}</h1>
              <p className="entry-full-body">{entry.body}</p>
              <div className="entry-tags">
                {entry.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
          <p className="fine-print">
            User-authored entry · {countWords(entry.body)} words · Source: your notebook
          </p>
          {confirmDelete && (
            <div className="delete-confirm">
              <p>Delete this entry from your notebook? This cannot be undone here.</p>
              <button
                className="danger"
                disabled={saving}
                onClick={async () => {
                  if (await remove(entry.id)) close();
                }}
              >
                Delete entry
              </button>
              <button className="secondary" onClick={() => setConfirmDelete(false)}>
                Keep entry
              </button>
            </div>
          )}
        </div>
        <footer className="modal-footer">
          {edit ? (
            <>
              <button
                className="primary"
                disabled={saving || !draft.body.trim()}
                onClick={async () => {
                  if (await put({ ...draft, updatedAt: Date.now() })) close();
                }}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button className="secondary" disabled={saving} onClick={() => setEdit(false)}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="secondary" onClick={() => setEdit(true)}>
                <Icon name="pen" size={15} />
                Edit entry
              </button>
              <button
                className="icon-button danger-text"
                aria-label="Delete entry"
                onClick={() => setConfirmDelete(true)}
              >
                <Icon name="trash" />
              </button>
            </>
          )}
        </footer>
      </section>
    </div>
  );
}
