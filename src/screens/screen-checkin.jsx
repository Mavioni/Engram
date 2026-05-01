// Mood check-in flow — premium, full-bleed, ritual

const { useState: useStateMood } = React;

const MOODS_PREMIUM = [
  { id: "radiant", label: "Radiant", v: 0.95, e: 0.8, color: "var(--warm)", subtitle: "lit from within" },
  { id: "content", label: "Content", v: 0.75, e: 0.4, color: "var(--accent-soft)", subtitle: "settled, easy" },
  { id: "calm", label: "Calm", v: 0.65, e: 0.25, color: "var(--accent-tint)", subtitle: "still water" },
  { id: "neutral", label: "Neutral", v: 0.5, e: 0.5, color: "var(--ink-5)", subtitle: "neither here nor there" },
  { id: "tender", label: "Tender", v: 0.4, e: 0.3, color: "var(--plum)", subtitle: "soft and porous" },
  { id: "anxious", label: "Anxious", v: 0.35, e: 0.85, color: "var(--sky)", subtitle: "buzzing, alert" },
  { id: "low", label: "Low", v: 0.2, e: 0.2, color: "var(--ink-4)", subtitle: "heavy, slow" },
  { id: "overwhelmed", label: "Overwhelmed", v: 0.15, e: 0.9, color: "var(--sky)", subtitle: "too much, too fast" },
];

const FACTORS_PREMIUM = [
  { f: "Sleep", icon: "◐" }, { f: "Work", icon: "▤" }, { f: "Relationships", icon: "◇" },
  { f: "Body", icon: "○" }, { f: "Solitude", icon: "·" }, { f: "Creativity", icon: "✦" },
  { f: "Movement", icon: "→" }, { f: "Rest", icon: "—" }, { f: "Conflict", icon: "⌇" }, { f: "Joy", icon: "✧" },
  { f: "News / world", icon: "◌" }, { f: "Money", icon: "$" },
];

function CheckinScreen({ onNavigate }) {
  const [step, setStep] = useStateMood(0);
  const [mood, setMood] = useStateMood(null);
  const [intensity, setIntensity] = useStateMood(0.6);
  const [factors, setFactors] = useStateMood([]);
  const [note, setNote] = useStateMood("");

  const next = () => setStep(s => Math.min(3, s + 1));
  const back = () => step === 0 ? onNavigate("dashboard") : setStep(s => s - 1);

  const bgColor = mood?.color || "var(--accent-soft)";

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
      background: `radial-gradient(ellipse 70% 50% at 50% 30%, color-mix(in oklab, ${bgColor} 24%, var(--bg)), var(--bg) 70%)`,
      transition: "background 600ms var(--ease)",
    }}>
      <header style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 5 }}>
        <button onClick={back} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-3)", fontSize: 13, padding: "8px 14px", borderRadius: 999, background: "color-mix(in oklab, var(--bg-card) 70%, transparent)", backdropFilter: "blur(12px)", border: "1px solid var(--line)" }}>
          <IconArrowLeft size={16} /> Back
        </button>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                width: i === step ? 32 : 8,
                height: 4,
                borderRadius: 2,
                background: i <= step ? "var(--accent)" : "var(--line-2)",
                transition: "all 280ms var(--ease)",
              }} />
            ))}
          </div>
          <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.12em" }}>STEP {step + 1} ⁄ 4 · CHECK-IN</span>
        </div>
        <button onClick={() => onNavigate("dashboard")} style={{ color: "var(--ink-3)", fontSize: 13, padding: "8px 14px" }}>Skip</button>
      </header>

      <div className="fade-in" key={step} style={{ flex: 1, overflow: "auto", padding: "24px 40px 40px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
        {step === 0 && <MoodPickPremium mood={mood} setMood={setMood} />}
        {step === 1 && <IntensityPremium mood={mood} intensity={intensity} setIntensity={setIntensity} />}
        {step === 2 && <FactorsPremium factors={factors} setFactors={setFactors} />}
        {step === 3 && <NotePremium note={note} setNote={setNote} mood={mood} />}
      </div>

      <div style={{ padding: "16px 40px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, position: "relative", zIndex: 5, background: "linear-gradient(to top, var(--bg) 50%, transparent)" }}>
        <div style={{ fontSize: 12, color: "var(--ink-4)", display: "flex", alignItems: "center", gap: 8 }}>
          {mood && <>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, color-mix(in oklab, ${mood.color} 60%, white), ${mood.color})` }} />
            <span>{mood.label.toLowerCase()}{step >= 1 && ` · ${Math.round(intensity * 100)}%`}{step >= 2 && factors.length > 0 && ` · ${factors.length} factor${factors.length>1?"s":""}`}</span>
          </>}
        </div>
        {step < 3 ? (
          <Button variant="accent" iconRight={<IconArrowRight size={16} />} onClick={next} disabled={step === 0 && !mood}>
            Continue
          </Button>
        ) : (
          <Button variant="accent" iconRight={<IconCheck size={16} />} onClick={() => onNavigate("dashboard")}>
            Save reflection
          </Button>
        )}
      </div>
    </div>
  );
}

function MoodPickPremium({ mood, setMood }) {
  return (
    <>
      <div style={{ textAlign: "center", maxWidth: 560, marginBottom: 36 }}>
        <h2 className="display" style={{ fontSize: 44, fontWeight: 400, letterSpacing: "-0.03em", margin: "0 0 12px", lineHeight: 1.05 }}>
          How are you feeling,<br/>
          <span className="display-italic" style={{ color: "var(--ink-3)" }}>right now?</span>
        </h2>
        <p style={{ color: "var(--ink-3)", fontSize: 16, margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic" }}>
          One word is enough. You can refine it next.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, maxWidth: 760, width: "100%" }}>
        {MOODS_PREMIUM.map((m) => {
          const active = mood?.id === m.id;
          return (
            <button key={m.id} onClick={() => setMood(m)} style={{
              padding: "26px 16px 22px",
              borderRadius: 18,
              background: "var(--bg-card)",
              boxShadow: active ? `0 0 0 2px ${m.color}, 0 16px 40px color-mix(in oklab, ${m.color} 30%, transparent)` : "var(--shadow-sm)",
              border: active ? "none" : "1px solid var(--line)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              transition: "all 240ms var(--ease)",
              transform: active ? "translateY(-3px)" : "translateY(0)",
              cursor: "pointer",
              position: "relative", overflow: "hidden",
            }}>
              {active && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: `radial-gradient(ellipse at 50% 100%, color-mix(in oklab, ${m.color} 12%, transparent), transparent 70%)`,
                  pointerEvents: "none",
                }} />
              )}
              <div className={active ? "breathe" : ""} style={{
                width: active ? 64 : 52, height: active ? 64 : 52, borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%, color-mix(in oklab, ${m.color} 50%, white), ${m.color})`,
                boxShadow: active ? `0 6px 20px color-mix(in oklab, ${m.color} 40%, transparent)` : `0 4px 12px color-mix(in oklab, ${m.color} 24%, transparent)`,
                transition: "all 240ms var(--ease)",
              }} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div className="display" style={{ fontSize: 16, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em" }}>{m.label}</div>
                <div className="display-italic" style={{ fontSize: 11, color: "var(--ink-3)" }}>{m.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function IntensityPremium({ mood, intensity, setIntensity }) {
  const c = mood?.color || "var(--accent)";
  return (
    <>
      <div style={{ textAlign: "center", maxWidth: 560, marginBottom: 32 }}>
        <h2 className="display" style={{ fontSize: 44, fontWeight: 400, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
          How <span className="display-italic" style={{ color: "var(--ink-3)" }}>{mood?.label.toLowerCase() || ""}</span>?
        </h2>
        <p style={{ color: "var(--ink-3)", margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 15 }}>Find the right shape.</p>
      </div>

      <div style={{ position: "relative", width: 320, height: 320, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        {/* Outer ripple rings */}
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            position: "absolute",
            width: 80 + intensity * 240 + i * 24, height: 80 + intensity * 240 + i * 24,
            borderRadius: "50%",
            border: `1px solid color-mix(in oklab, ${c} ${20 - i*5}%, transparent)`,
            transition: "all 350ms var(--ease)",
          }} />
        ))}
        <div className="breathe" style={{
          width: 80 + intensity * 200, height: 80 + intensity * 200, borderRadius: "50%",
          background: `radial-gradient(circle at 35% 25%, color-mix(in oklab, ${c} 30%, white), ${c} 70%)`,
          transition: "all 350ms var(--ease)",
          boxShadow: `0 0 80px color-mix(in oklab, ${c} 40%, transparent), inset 0 -16px 40px color-mix(in oklab, ${c} 60%, transparent)`,
        }} />
        <div style={{
          position: "absolute",
          color: "white",
          fontSize: 44,
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          letterSpacing: "-0.02em",
          textShadow: "0 2px 12px rgba(0,0,0,0.18)",
        }}>{Math.round(intensity * 100)}</div>
      </div>

      <div style={{ width: "100%", maxWidth: 520 }}>
        <input type="range" min="0" max="1" step="0.01" value={intensity}
          onChange={(e) => setIntensity(parseFloat(e.target.value))}
          style={{ width: "100%", accentColor: c, height: 4 }} />
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ink-3)", fontSize: 11, marginTop: 12, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
          <span>BARELY</span><span>NOTICEABLY</span><span>COMPLETELY</span>
        </div>
      </div>
    </>
  );
}

function FactorsPremium({ factors, setFactors }) {
  const toggle = (f) => setFactors(factors.includes(f) ? factors.filter(x => x !== f) : [...factors, f]);
  return (
    <>
      <div style={{ textAlign: "center", maxWidth: 560, marginBottom: 36 }}>
        <h2 className="display" style={{ fontSize: 44, fontWeight: 400, letterSpacing: "-0.03em", margin: "0 0 12px", lineHeight: 1.05 }}>
          What's <span className="display-italic" style={{ color: "var(--ink-3)" }}>shaping</span> the day?
        </h2>
        <p style={{ color: "var(--ink-3)", margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 15 }}>Pick any that feel true. Or none.</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 680 }}>
        {FACTORS_PREMIUM.map(({ f, icon }) => {
          const active = factors.includes(f);
          return (
            <button key={f} onClick={() => toggle(f)} style={{
              padding: "12px 18px",
              borderRadius: "var(--r-pill)",
              fontSize: 14, fontWeight: 500,
              background: active ? "var(--ink)" : "var(--bg-card)",
              color: active ? "var(--bg)" : "var(--ink-2)",
              border: active ? "1px solid var(--ink)" : "1px solid var(--line)",
              boxShadow: active ? "0 6px 16px color-mix(in oklab, var(--ink) 18%, transparent)" : "var(--shadow-sm)",
              transition: "all 200ms var(--ease)",
              display: "inline-flex", alignItems: "center", gap: 10,
              transform: active ? "translateY(-1px)" : "translateY(0)",
            }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: active ? "var(--accent-soft)" : "var(--accent)" }}>{icon}</span>
              {f}
            </button>
          );
        })}
      </div>

      {factors.length > 0 && (
        <div className="fade-in" style={{ marginTop: 36, padding: "14px 18px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--line)", maxWidth: 460, fontSize: 13, color: "var(--ink-3)", textAlign: "center" }}>
          <span className="display-italic">noted — {factors.length} factor{factors.length > 1 ? "s" : ""} woven in</span>
        </div>
      )}
    </>
  );
}

function NotePremium({ note, setNote, mood }) {
  const prompts = [
    "What am I really saying when I say I feel this way…",
    "If I were honest with one person right now, I'd tell them…",
    "The smallest true thing about today is…",
  ];
  const [promptIdx, setPromptIdx] = useStateMood(0);
  return (
    <>
      <div style={{ textAlign: "center", maxWidth: 560, marginBottom: 28 }}>
        <h2 className="display" style={{ fontSize: 44, fontWeight: 400, letterSpacing: "-0.03em", margin: "0 0 12px", lineHeight: 1.05 }}>
          Anything <span className="display-italic" style={{ color: "var(--ink-3)" }}>else</span>?
        </h2>
        <p style={{ color: "var(--ink-3)", margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 15 }}>Optional. A line, a fragment, a whole story — your call.</p>
      </div>

      <div style={{ width: "100%", maxWidth: 640 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {prompts.map((p, i) => (
            <button key={i} onClick={() => setPromptIdx(i)} style={{
              padding: "7px 12px", borderRadius: 999, fontSize: 12,
              background: promptIdx === i ? "color-mix(in oklab, var(--accent) 14%, var(--bg-card))" : "var(--bg-card)",
              color: promptIdx === i ? "var(--accent)" : "var(--ink-3)",
              border: promptIdx === i ? "1px solid color-mix(in oklab, var(--accent) 40%, transparent)" : "1px solid var(--line)",
              fontFamily: "var(--font-display)", fontStyle: "italic",
              transition: "all 180ms var(--ease)",
            }}>nudge {i+1}</button>
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={prompts[promptIdx]}
            rows={8}
            style={{
              width: "100%",
              padding: "24px 26px",
              borderRadius: 18,
              border: "1px solid var(--line)",
              background: "var(--bg-card)",
              fontSize: 17,
              fontFamily: "var(--font-display)",
              fontStyle: note ? "normal" : "italic",
              lineHeight: 1.6,
              outline: "none",
              resize: "none",
              boxShadow: "var(--shadow-sm)",
              color: "var(--ink)",
              letterSpacing: "-0.005em",
            }}
          />
          <div style={{ position: "absolute", bottom: 14, right: 18, fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
            {note.length} char · private
          </div>
        </div>
      </div>
    </>
  );
}

window.CheckinScreen = CheckinScreen;
