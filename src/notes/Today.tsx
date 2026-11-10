import { useState } from "react";
import { Icon } from "./Icon";
import {
  MOODS,
  countWords,
  emptyDraft,
  localDate,
  type Draft,
  type Entry,
  type Layout,
} from "./model";

type Props = {
  draft: Draft;
  updateDraft: (draft: Draft) => void;
  save: (entry: Entry) => Promise<boolean>;
  layout: Layout;
  setLayout: (layout: Layout) => void;
  saving: boolean;
  disabled: boolean;
  draftStatus: string;
  onIris: () => void;
  onMirror: () => void;
};
const layouts: { id: Layout; label: string; icon: "pen" | "list" | "mic" | "chat" }[] = [
  { id: "classic", label: "Classic", icon: "pen" },
  { id: "compact", label: "Compact", icon: "list" },
  { id: "voice", label: "Voice", icon: "mic" },
  { id: "chat", label: "Chat", icon: "chat" },
];
export function Today({
  draft,
  updateDraft,
  save,
  layout,
  setLayout,
  saving,
  disabled,
  draftStatus,
  onIris,
  onMirror,
}: Props) {
  const thought = draft.pendingThought ?? "";
  const [tag, setTag] = useState("");
  const [saved, setSaved] = useState(false);
  const update = (patch: Partial<Draft>) => {
    setSaved(false);
    updateDraft({ ...draft, ...patch });
  };
  const body = [draft.body, thought.trim()].filter(Boolean).join("\n\n");
  const addThought = () => {
    if (thought.trim()) update({ body: body.slice(0, 6000), pendingThought: "" });
  };
  return (
    <section className="today-workspace" aria-label="Today notebook">
      <div className="draft-meta">
        <span className="label accent">● TODAY · {saved ? "SAVED" : "DRAFT"}</span>
        <span className="label today-date">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </span>
        <span className="label word-count">{countWords(body)} WORDS</span>
      </div>
      <div className="composer-toolbar">
        <div className="mood-picker" role="group" aria-label="Today's mood">
          <span className="label">MOOD</span>
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              className={`mood-pick${draft.mood === mood.id ? " active" : ""}`}
              aria-label={mood.label}
              aria-pressed={draft.mood === mood.id}
              title={mood.label}
              onClick={() => update({ mood: draft.mood === mood.id ? null : mood.id })}
            >
              <span style={{ background: mood.color }} />
            </button>
          ))}
        </div>
        <div className="layout-picker" role="group" aria-label="Composer layout">
          {layouts.map((item) => (
            <button
              key={item.id}
              className={`layout-pill${layout === item.id ? " active" : ""}`}
              aria-pressed={layout === item.id}
              onClick={() => {
                addThought();
                setLayout(item.id);
              }}
            >
              <Icon name={item.icon} size={12} />
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="notebook-columns">
        <div className="writing-column">
          <input
            className="entry-title-input"
            aria-label="Entry title"
            placeholder="Give today a title…"
            value={draft.title}
            maxLength={160}
            onChange={(event) => update({ title: event.target.value })}
          />
          {layout === "chat" ? (
            <>
              <div className="capture-chat">
                {!draft.body && (
                  <div className="writing-prompt">
                    <span className="label">A LITTLE SPACE TO BEGIN</span>
                    <h2>
                      How did today
                      <br />
                      <em>actually feel?</em>
                    </h2>
                    <p>Capture a thought at a time. Open IRIS when you want a conversation.</p>
                  </div>
                )}
                {draft.body
                  .split("\n\n")
                  .filter(Boolean)
                  .map((text, index) => (
                    <div className="chat-bubble-user" key={index}>
                      {text}
                    </div>
                  ))}
              </div>
              <form
                className="capture-input"
                onSubmit={(event) => {
                  event.preventDefault();
                  addThought();
                }}
              >
                <textarea
                  aria-label="Capture a thought"
                  placeholder="One thought at a time…"
                  rows={2}
                  value={thought}
                  disabled={saving}
                  maxLength={Math.max(0, 5998 - draft.body.length)}
                  onChange={(event) => update({ pendingThought: event.target.value })}
                />
                <button
                  aria-label="Add thought"
                  className="icon-button accent"
                  disabled={!thought.trim() || saving}
                >
                  <Icon name="arrow" />
                </button>
              </form>
            </>
          ) : layout === "voice" ? (
            <div className="voice-panel">
              <div className="voice-ring">
                <Icon name="mic" size={32} />
              </div>
              <h2>Make room for your voice.</h2>
              <p>
                Voice recording is a planned connection. Use your keyboard’s microphone to dictate
                into the editor today.
              </p>
              <textarea
                className="voice-draft"
                aria-label="Voice notes"
                value={draft.body}
                maxLength={6000}
                onChange={(event) => update({ body: event.target.value })}
                placeholder="Tap here, then use keyboard dictation…"
              />
            </div>
          ) : (
            <textarea
              className={`main-editor ${layout}`}
              aria-label="Journal entry"
              value={draft.body}
              maxLength={6000}
              onChange={(event) => update({ body: event.target.value })}
              placeholder="Start wherever you are…"
            />
          )}
          <div className="tag-input-row">
            <span className="label">TAGS</span>
            {draft.tags.map((item) => (
              <button
                key={item}
                className="tag"
                aria-label={`Remove tag ${item}`}
                onClick={() => update({ tags: draft.tags.filter((value) => value !== item) })}
              >
                {item} ×
              </button>
            ))}
            <input
              aria-label="Add tag"
              placeholder="add tag…"
              maxLength={40}
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  const next = tag.trim().toLowerCase();
                  if (next && !draft.tags.includes(next) && draft.tags.length < 10)
                    update({ tags: [...draft.tags, next] });
                  setTag("");
                }
              }}
            />
          </div>
          <div className="save-row">
            <button
              className="primary"
              disabled={!body.trim() || saving || disabled}
              onClick={async () => {
                const now = Date.now();
                const success = await save({
                  title: draft.title,
                  mood: draft.mood,
                  tags: draft.tags,
                  body: body.trim(),
                  id: crypto.randomUUID(),
                  date: localDate(),
                  createdAt: now,
                  updatedAt: now,
                });
                if (success) {
                  updateDraft(emptyDraft());
                  setSaved(true);
                }
              }}
            >
              {saving ? "Saving…" : saved ? "Entry saved" : "Save entry"}
              <Icon name={saved ? "check" : "arrow"} size={15} />
            </button>
            <span className="save-status" role="status">
              {saved
                ? "Find it in your Timeline."
                : layout === "chat" && thought.trim()
                  ? "Add your thought to save the draft."
                  : draftStatus}
            </span>
          </div>
        </div>
        <aside className="observer-panel">
          <div className="observer-heading">
            <div className="iris-mini" />
            <span className="label">ENGRAM · SELF MIRROR</span>
            <span className="label accent">OBSERVE</span>
          </div>
          <div className="observer-content">
            <div className="iris-orb" aria-hidden="true">
              <span />
            </div>
            <h2>
              A clearer view
              <br />
              <em>of you.</em>
            </h2>
            <p>
              Your words become a record you can return to. Your mirror reflects what you choose to
              share.
            </p>
            <button className="secondary" onClick={onIris}>
              <Icon name="chat" size={16} />
              Talk with IRIS
              <Icon name="arrow" size={14} />
            </button>
            <button className="text-button" onClick={onMirror}>
              Explore your Self Mirror <Icon name="arrow" size={14} />
            </button>
            <div className="observer-note">
              <Icon name="lock" size={12} />
              <span>You remain the author. Memory sharing is optional.</span>
            </div>
          </div>
        </aside>
      </div>
      <button className="mobile-iris-launch" onClick={onIris}>
        <span className="iris-mini" />
        <span>IRIS</span>
        <span className="label">OPEN A REFLECTION</span>
        <Icon name="arrow" size={16} />
      </button>
    </section>
  );
}
