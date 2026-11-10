// Journal — premium editorial writing surface

const { useState: useStateJ } = React;

const JOURNAL_PROMPTS = [
  "What stood out today, and why?",
  "What pulled you out of the present?",
  "What did your body need?",
  "Who held space for you — or who needed you to hold space?",
  "What can you forgive yourself for, this week?",
];

const PAST_ENTRIES = [
  { date: "Apr 30", day: "Today", title: "A quiet sort of grateful", preview: "Walked at dusk. The magnolia is finally open. Something about the slowness…", words: 312, mood: { v: 0.7, e: 0.4 } },
  { date: "Apr 28", day: "Tuesday", title: "The work-spiral", preview: "The deadline pulled me out of my body again. I got the thing done. I lost the day.", words: 488, mood: { v: 0.3, e: 0.7 } },
  { date: "Apr 27", day: "Monday", title: "Magnolia, finally", preview: "Five years in this apartment and I never noticed the tree across the street.", words: 124, mood: { v: 0.78, e: 0.3 } },
  { date: "Apr 26", day: "Sunday", title: "Sat with Mom for a while", preview: "She told the story about the ferry again. I didn't interrupt this time.", words: 671, mood: { v: 0.55, e: 0.4 } },
  { date: "Apr 24", day: "Friday", title: "Monday morning, no agenda", preview: "Coffee. Two hours of nothing. I'd forgotten I could do that.", words: 209, mood: { v: 0.82, e: 0.25 } },
];

function JournalScreen({ onNavigate }) {
  const [text, setText] = useStateJ("");
  const [title, setTitle] = useStateJ("");
  const [prompt, setPrompt] = useStateJ(JOURNAL_PROMPTS[0]);
  const [showPast, setShowPast] = useStateJ(true);
  const [activeId, setActiveId] = useStateJ(null);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const readMins = Math.max(1, Math.round(wordCount / 220));

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: showPast ? "320px 1fr" : "1fr", overflow: "hidden", transition: "grid-template-columns 320ms var(--ease)", background: "var(--bg)" }}>
      {showPast && <PastEntriesPremium onClose={() => setShowPast(false)} activeId={activeId} setActiveId={setActiveId} />}

      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {/* Subtle paper background */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in oklab, var(--accent) 6%, transparent), transparent 60%)",
        }} />

        <header style={{ position: "relative", zIndex: 2, padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {!showPast && (
              <button onClick={() => setShowPast(true)} style={{
                padding: "8px 12px", borderRadius: 10, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 6, fontSize: 13,
                background: "var(--bg-card)", border: "1px solid var(--line)",
              }}>
                <IconBook size={16} /> Past entries
              </button>
            )}
            <div className="label">Thursday · April 30 · 7:14 pm</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.05em" }}>{wordCount} WORDS · {readMins} MIN READ</span>
            <span style={{ width: 1, height: 18, background: "var(--line)" }} />
            <button style={{ fontSize: 13, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} className="pulse-soft" /> Saved
            </button>
            <Button variant="accent" size="sm" onClick={() => onNavigate("dashboard")}>Done</Button>
          </div>
        </header>

        <div className="scrollbar-hide" style={{ position: "relative", zIndex: 1, flex: 1, overflow: "auto", display: "flex", justifyContent: "center", padding: "56px 60px 80px" }}>
          <div style={{ width: "100%", maxWidth: 720 }}>
            {/* Date stamp */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.12em" }}>ENTRY № 47</span>
              <span style={{ width: 24, height: 1, background: "var(--line-2)" }} />
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.12em" }}>30 · IV · MMXXVI</span>
              <span style={{ width: 24, height: 1, background: "var(--line-2)" }} />
              <span className="display-italic" style={{ fontSize: 13, color: "var(--ink-3)" }}>magnolia week</span>
            </div>

            {/* IRIS nudge — quieter, inline */}
            <div style={{
              padding: "20px 24px",
              borderRadius: 14,
              background: "color-mix(in oklab, var(--accent) 8%, var(--bg-card))",
              border: "1px solid color-mix(in oklab, var(--accent) 22%, transparent)",
              marginBottom: 36,
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
            }}>
              <IrisAvatar size={28} />
              <div style={{ flex: 1 }}>
                <div className="label" style={{ marginBottom: 6, color: "var(--accent)" }}>A nudge from IRIS</div>
                <div className="display-italic" style={{ fontSize: 18, color: "var(--ink)", lineHeight: 1.4, letterSpacing: "-0.005em" }}>
                  {prompt}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button onClick={() => setPrompt(JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)])}
                    style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    Another nudge →
                  </button>
                  <button style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 500 }}>Hide nudges</button>
                </div>
              </div>
            </div>

            {/* Title */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              className="display"
              style={{
                width: "100%", border: "none", outline: "none", background: "transparent",
                fontSize: 44, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1.1,
                color: title ? "var(--ink)" : "var(--ink-4)",
                marginBottom: 8,
                fontFamily: "var(--font-display)",
              }}
            />
            <div className="display-italic" style={{ fontSize: 14, color: "var(--ink-3)", marginBottom: 28 }}>
              for me · stays private unless I share it
            </div>

            {/* Editor with a leading drop-cap rule */}
            <div style={{ position: "relative" }}>
              {!text && (
                <div style={{
                  position: "absolute", top: 0, left: 0,
                  fontSize: 19, lineHeight: 1.75, fontFamily: "var(--font-display)", fontStyle: "italic",
                  color: "var(--ink-4)", pointerEvents: "none",
                }}>
                  Begin where you are. The words don't need to be good — they just need to be true.
                </div>
              )}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: 420,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 19,
                  lineHeight: 1.75,
                  fontFamily: "var(--font-display)",
                  resize: "none",
                  color: "var(--ink)",
                  letterSpacing: "-0.005em",
                }}
              />
            </div>

            {/* Footer rituals */}
            <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <Pill>+ Mood</Pill>
                <Pill>+ Photo</Pill>
                <Pill>+ Voice note</Pill>
              </div>
              <div className="display-italic" style={{ fontSize: 13, color: "var(--ink-4)" }}>
                "What you write here belongs to you."
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PastEntriesPremium({ onClose, activeId, setActiveId }) {
  return (
    <aside className="scrollbar-hide" style={{
      borderRight: "1px solid var(--line)",
      background: "var(--bg-tint)",
      padding: "20px 18px",
      overflow: "auto",
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, padding: "0 4px" }}>
        <div>
          <div className="label">Your journal</div>
          <div className="display" style={{ fontSize: 19, fontWeight: 500, marginTop: 2, letterSpacing: "-0.01em" }}>47 entries</div>
        </div>
        <button onClick={onClose} style={{ color: "var(--ink-3)", width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><IconClose size={16} /></button>
      </div>

      <button style={{
        margin: "0 0 16px",
        padding: "12px 14px",
        borderRadius: 12,
        background: "var(--ink)", color: "var(--bg)",
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 13, fontWeight: 500,
      }}>
        <IconPlus size={14} /> New entry
      </button>

      <div style={{ display: "flex", gap: 4, marginBottom: 14, padding: "0 4px" }}>
        {["All", "Mornings", "Hard days", "Tagged"].map((t, i) => (
          <button key={t} style={{
            padding: "6px 10px", borderRadius: 999, fontSize: 11,
            fontFamily: "var(--font-mono)", letterSpacing: "0.05em",
            background: i === 0 ? "var(--bg-card)" : "transparent",
            color: i === 0 ? "var(--ink)" : "var(--ink-3)",
            border: i === 0 ? "1px solid var(--line)" : "1px solid transparent",
          }}>{t.toUpperCase()}</button>
        ))}
      </div>

      <div className="label" style={{ marginBottom: 8, padding: "0 4px" }}>April</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {PAST_ENTRIES.map((e, i) => {
          const isActive = (activeId ?? 0) === i;
          return (
            <button key={i} onClick={() => setActiveId(i)} style={{
              textAlign: "left",
              padding: "12px 14px",
              borderRadius: 12,
              background: isActive ? "var(--bg-card)" : "transparent",
              boxShadow: isActive ? "var(--shadow-sm)" : "none",
              border: isActive ? "1px solid var(--line)" : "1px solid transparent",
              transition: "all 150ms var(--ease)",
              display: "flex", gap: 12, alignItems: "flex-start",
            }}
            onMouseEnter={(ev) => { if (!isActive) ev.currentTarget.style.background = "color-mix(in oklab, var(--bg-card) 60%, transparent)"; }}
            onMouseLeave={(ev) => { if (!isActive) ev.currentTarget.style.background = "transparent"; }}
            >
              <div style={{
                width: 14, height: 14, borderRadius: "50%", marginTop: 4, flexShrink: 0,
                background: `radial-gradient(circle at 35% 30%, color-mix(in oklab, ${e.mood.v > 0.6 ? "var(--accent)" : e.mood.v < 0.4 ? "var(--plum)" : "var(--warm)"} 50%, white), ${e.mood.v > 0.6 ? "var(--accent)" : e.mood.v < 0.4 ? "var(--plum)" : "var(--warm)"})`,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}>
                  <div className="display" style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em" }}>{e.title}</div>
                  <div className="mono" style={{ fontSize: 9, color: "var(--ink-4)", letterSpacing: "0.06em", flexShrink: 0 }}>{e.date.toUpperCase()}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {e.preview}
                </div>
                <div className="mono" style={{ fontSize: 9, color: "var(--ink-4)", marginTop: 6, letterSpacing: "0.05em" }}>{e.words} WORDS · {e.day.toUpperCase()}</div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

window.JournalScreen = JournalScreen;
