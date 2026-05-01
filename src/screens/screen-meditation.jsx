// Meditation player — cinematic, ambient, premium

const { useState: useStateM, useEffect: useEffectM, useRef: useRefM } = React;

const SESSIONS_M = [
  { id: "unwind", title: "Evening unwind", subtitle: "Settle the body before sleep", duration: 8, voice: "Maren", style: "soft, body-led", color: "var(--plum)", chapters: ["Arrive", "Soften the jaw", "Three long breaths", "Body scan, downward", "Rest"] },
  { id: "reset", title: "A 3-minute reset", subtitle: "When the day's pulled you thin", duration: 3, voice: "Theo", style: "steady, grounded", color: "var(--accent)", chapters: ["Ground", "Breathe", "Return"] },
  { id: "grief", title: "Sitting with what hurts", subtitle: "Gentle company for hard feelings", duration: 12, voice: "Maren", style: "tender", color: "var(--sky)", chapters: ["Arrive", "Acknowledge", "Make room", "Hand on heart", "Stay", "Release"] },
  { id: "morning", title: "Set the tone", subtitle: "Begin the day with intention", duration: 6, voice: "Theo", style: "alert, kind", color: "var(--warm)", chapters: ["Wake the body", "An intention", "First breath of the day"] },
];

function MeditationScreen({ onNavigate }) {
  const [active, setActive] = useStateM(SESSIONS_M[0]);
  const [playing, setPlaying] = useStateM(false);
  const [progress, setProgress] = useStateM(0.18);

  useEffectM(() => {
    if (!playing) return;
    const t = setInterval(() => setProgress(p => Math.min(1, p + 0.0015)), 100);
    return () => clearInterval(t);
  }, [playing]);

  useEffectM(() => { setProgress(0); setPlaying(false); }, [active.id]);

  const total = active.duration * 60;
  const elapsed = Math.floor(total * progress);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const chapterIdx = Math.min(active.chapters.length - 1, Math.floor(progress * active.chapters.length));

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
      background: "var(--bg)",
    }}>
      {/* Cinematic ambient background */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklab, ${active.color} 36%, transparent), transparent 60%),
          radial-gradient(ellipse 100% 70% at 50% 100%, color-mix(in oklab, ${active.color} 18%, transparent), transparent 70%),
          var(--bg)
        `,
        transition: "background 600ms var(--ease)",
      }} />
      <AmbientParticles color={active.color} playing={playing} />

      <header style={{ position: "relative", zIndex: 2, padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => onNavigate("dashboard")} style={{ color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "8px 14px", borderRadius: 999, background: "color-mix(in oklab, var(--bg-card) 70%, transparent)", backdropFilter: "blur(12px)", border: "1px solid var(--line)" }}>
          <IconArrowLeft size={16} /> Done
        </button>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px", borderRadius: 999, background: "color-mix(in oklab, var(--bg-card) 60%, transparent)", backdropFilter: "blur(12px)", border: "1px solid var(--line)" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: active.color }} className={playing ? "pulse-soft" : ""} />
          <span className="label">{playing ? "Now playing" : "Ready"}</span>
        </div>
        <button style={{ color: "var(--ink-3)", fontSize: 14, width: 36, height: 36, borderRadius: 999, background: "color-mix(in oklab, var(--bg-card) 70%, transparent)", backdropFilter: "blur(12px)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}>•••</button>
      </header>

      <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 40px" }}>
        <BreathRingPremium progress={progress} color={active.color} playing={playing} />

        <div style={{ textAlign: "center", marginTop: 32, maxWidth: 560 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
            <span className="label">{active.voice}</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ink-4)" }} />
            <span className="label" style={{ fontStyle: "italic", letterSpacing: "0.02em", textTransform: "none" }}>{active.style}</span>
          </div>
          <h1 className="display" style={{ fontSize: 40, fontWeight: 400, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            {active.title}
          </h1>
          <p className="display-italic" style={{ fontSize: 18, color: "var(--ink-3)", marginTop: 12 }}>
            {active.subtitle}
          </p>
        </div>

        {/* Chapter pills */}
        <div style={{ marginTop: 28, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          {active.chapters.map((c, i) => (
            <span key={i} style={{
              padding: "5px 11px",
              borderRadius: 999,
              fontSize: 11,
              letterSpacing: "0.04em",
              fontFamily: "var(--font-mono)",
              color: i <= chapterIdx ? "var(--ink)" : "var(--ink-4)",
              background: i === chapterIdx ? `color-mix(in oklab, ${active.color} 22%, var(--bg-card))` : "transparent",
              border: i === chapterIdx ? `1px solid color-mix(in oklab, ${active.color} 40%, transparent)` : "1px solid var(--line)",
              transition: "all 300ms var(--ease)",
            }}>{String(i+1).padStart(2,"0")} {c}</span>
          ))}
        </div>

        <div style={{ width: "100%", maxWidth: 560, marginTop: 28 }}>
          <WaveformPremium progress={progress} color={active.color} playing={playing} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.05em" }} className="mono">
            <span>{fmt(elapsed)}</span>
            <span>−{fmt(total - elapsed)}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 28 }}>
          <button style={ctrlBtnM(44)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11 5l-9 7 9 7V5zm10 0l-9 7 9 7V5z" /></svg>
          </button>
          <button onClick={() => setPlaying(!playing)} style={{
            width: 76, height: 76, borderRadius: "50%",
            background: `radial-gradient(circle at 35% 30%, color-mix(in oklab, ${active.color} 30%, var(--ink)), var(--ink))`,
            color: "var(--bg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 12px 32px color-mix(in oklab, ${active.color} 35%, transparent), 0 4px 12px rgba(0,0,0,0.08)`,
            transition: "transform 200ms var(--ease)",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {playing ? <IconPause size={26} /> : <IconPlay size={26} />}
          </button>
          <button style={ctrlBtnM(44)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 5l9 7-9 7V5zM3 5l9 7-9 7V5z" /></svg>
          </button>
        </div>
      </div>

      {/* Session selector strip */}
      <div style={{ position: "relative", zIndex: 2, padding: "16px 32px 24px" }}>
        <div className="label" style={{ marginBottom: 10, paddingLeft: 4 }}>More for tonight</div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto" }} className="scrollbar-hide">
          {SESSIONS_M.map(s => {
            const isActive = s.id === active.id;
            return (
              <button key={s.id} onClick={() => setActive(s)} style={{
                padding: "12px 16px",
                borderRadius: 14,
                background: isActive ? "var(--bg-card)" : "color-mix(in oklab, var(--bg-card) 50%, transparent)",
                backdropFilter: "blur(8px)",
                border: "1px solid " + (isActive ? `color-mix(in oklab, ${s.color} 40%, transparent)` : "var(--line)"),
                display: "flex", alignItems: "center", gap: 12,
                minWidth: 220,
                textAlign: "left",
                transition: "all 200ms var(--ease)",
                cursor: "pointer",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: `radial-gradient(circle at 35% 30%, color-mix(in oklab, ${s.color} 50%, white), ${s.color})`,
                  flexShrink: 0,
                  boxShadow: `0 0 12px color-mix(in oklab, ${s.color} 40%, transparent)`,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.04em", marginTop: 2 }}>{s.duration} MIN · {s.voice.toUpperCase()}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ctrlBtnM(size) {
  return {
    width: size, height: size, borderRadius: "50%",
    background: "color-mix(in oklab, var(--bg-card) 80%, transparent)",
    backdropFilter: "blur(12px)",
    color: "var(--ink-2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "1px solid var(--line)",
    transition: "all 150ms var(--ease)",
  };
}

function BreathRingPremium({ progress, color, playing }) {
  const size = 300, stroke = 1.5, r = (size - 60) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* Outer dotted ring */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={size/2 - 6} fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="2 6" />
      </svg>
      {/* Progress ring */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={`color-mix(in oklab, ${color} 50%, white)`} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line-2)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#ring-grad)" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - progress)} style={{ transition: "stroke-dashoffset 200ms linear" }} />
      </svg>
      {/* Tick marks */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }}>
        {Array.from({length: 60}).map((_, i) => {
          const angle = (i * 6 - 90) * Math.PI / 180;
          const isMajor = i % 5 === 0;
          const r1 = r - (isMajor ? 8 : 5);
          const r2 = r - 2;
          return (
            <line key={i}
              x1={size/2 + Math.cos(angle) * r1} y1={size/2 + Math.sin(angle) * r1}
              x2={size/2 + Math.cos(angle) * r2} y2={size/2 + Math.sin(angle) * r2}
              stroke={isMajor ? "var(--ink-4)" : "var(--line-2)"}
              strokeWidth={isMajor ? 1 : 0.5}
            />
          );
        })}
      </svg>
      {/* Inner orb */}
      <div className={playing ? "breathe" : ""} style={{
        position: "absolute", inset: 56,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 25%, color-mix(in oklab, ${color} 30%, white), color-mix(in oklab, ${color} 80%, transparent) 60%, color-mix(in oklab, ${color} 95%, transparent))`,
        boxShadow: `0 0 100px color-mix(in oklab, ${color} 50%, transparent), inset 0 -20px 60px color-mix(in oklab, ${color} 60%, transparent)`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        color: "white",
        transition: "all 600ms var(--ease)",
      }}>
        <div className="display-italic" style={{ fontSize: 22, textShadow: "0 1px 8px rgba(0,0,0,0.2)" }}>
          {playing ? "breathe in…" : "begin when ready"}
        </div>
        <div className="mono" style={{ fontSize: 10, marginTop: 8, opacity: 0.8, letterSpacing: "0.1em" }}>
          IN 4 · OUT 6
        </div>
      </div>
    </div>
  );
}

function WaveformPremium({ progress, color, playing }) {
  const bars = 96;
  const heights = useRefM(Array.from({ length: bars }, (_, i) =>
    0.25 + 0.75 * Math.abs(Math.sin(i * 0.4) + Math.cos(i * 0.18) * 0.6 + Math.sin(i * 0.07) * 0.3) * 0.5
  )).current;
  const playhead = Math.floor(progress * bars);
  return (
    <div style={{ display: "flex", alignItems: "center", height: 44, gap: 2 }}>
      {heights.map((h, i) => {
        const isPast = i < playhead;
        const isPlayhead = i === playhead;
        const isNear = Math.abs(i - playhead) < 3;
        const animH = playing && isNear ? h * (0.85 + Math.sin(Date.now() / 200 + i) * 0.15) : h;
        return (
          <div key={i} style={{
            flex: 1,
            height: `${animH * 100}%`,
            minHeight: 2,
            borderRadius: 1,
            background: isPlayhead ? color : isPast ? `color-mix(in oklab, ${color} 70%, transparent)` : "var(--line-2)",
            transition: "background 200ms var(--ease), height 80ms ease-out",
          }} />
        );
      })}
    </div>
  );
}

function AmbientParticles({ color, playing }) {
  const particles = useRefM(Array.from({length: 18}, () => ({
    x: Math.random() * 100,
    y: 50 + Math.random() * 50,
    r: 1 + Math.random() * 3,
    speed: 8 + Math.random() * 16,
    delay: Math.random() * 10,
  }))).current;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", opacity: playing ? 1 : 0.4, transition: "opacity 600ms var(--ease)" }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${p.x}%`, bottom: `-${p.r * 2}px`,
          width: p.r * 2, height: p.r * 2, borderRadius: "50%",
          background: `radial-gradient(circle, ${color}, transparent 70%)`,
          opacity: 0.4,
          animation: `float-up ${p.speed}s linear ${p.delay}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-100vh) translateX(${Math.random() > 0.5 ? '20' : '-20'}px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

window.MeditationScreen = MeditationScreen;
