// Player Card — premium edition: editorial layout, hand-set type, depth, ritual

function PlayerCardScreen({ onNavigate }) {
  const useStore = window.useUserStore;
  const assessmentComplete = (useStore && useStore((s) => s.assessmentComplete)) || false;
  const archetype = (useStore && useStore((s) => s.archetype)) || null;

  const sealStamp = formatPlayerCardStamp(new Date());

  if (!assessmentComplete) {
    return (
      <PlayerCardEmptyState onNavigate={onNavigate} />
    );
  }

  return (
    <div className="scrollbar-hide" style={{ height: "100%", overflow: "auto", padding: "28px 44px 80px", background: "var(--bg)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <button onClick={() => onNavigate("dashboard")} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-3)", fontSize: 13 }}>
          <IconArrowLeft size={16} /> Dashboard
        </button>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          <span className="label">Engram · IRIS-derived</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ink-4)" }} />
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em" }}>{sealStamp}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="ghost" size="sm">Re-take</Button>
          <Button variant="ghost" size="sm">Share</Button>
        </div>
      </header>

      {/* Hero — editorial layout */}
      <div className="scale-in" style={{
        position: "relative",
        borderRadius: "var(--r-2xl)",
        background: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, color-mix(in oklab, var(--accent) 28%, #1A1A1A) 100%)",
        color: "#F4F4F4",
        padding: "60px 64px 56px",
        overflow: "hidden",
        marginBottom: 28,
        boxShadow: "0 32px 80px rgba(20,30,24,0.24), 0 0 0 1px rgba(0,0,0,0.04)",
      }}>
        {/* Decorative orbs */}
        <div style={{ position: "absolute", right: -120, top: -120, width: 460, height: 460, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,213,184,0.36), transparent 60%)" }} />
        <div style={{ position: "absolute", left: -80, bottom: -160, width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,201,168,0.18), transparent 60%)" }} />
        <svg style={{ position: "absolute", inset: 0, opacity: 0.07, pointerEvents: "none" }} width="100%" height="100%">
          <defs>
            <pattern id="pcgrid" width="44" height="44" patternUnits="userSpaceOnUse">
              <path d="M 44 0 L 0 0 0 44" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pcgrid)" />
        </svg>

        {/* Top meta strip */}
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36, paddingBottom: 24, borderBottom: "1px solid rgba(234,241,236,0.1)" }}>
          <div className="mono" style={{ fontSize: 11, color: "rgba(234,241,236,0.55)", letterSpacing: "0.12em" }}>
            ENGRAM
          </div>
          <div className="mono" style={{ fontSize: 11, color: "rgba(234,241,236,0.55)", letterSpacing: "0.12em" }}>
            ARCHETYPE · {archetype?.name?.toUpperCase() ?? "—"}
          </div>
          <div className="mono" style={{ fontSize: 11, color: "rgba(234,241,236,0.55)", letterSpacing: "0.12em" }}>
            VECTOR · {archetype?.vector != null ? archetype.vector.toFixed(3) : "—"}
          </div>
        </div>

        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr auto", gap: 56, alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <span className="mono" style={{ fontSize: 13, color: "rgba(234,241,236,0.7)", letterSpacing: "0.16em" }}>{archetype?.code ?? "—"}</span>
            </div>
            <h1 className="display" style={{ fontSize: 76, fontWeight: 400, margin: 0, letterSpacing: "-0.04em", lineHeight: 0.95 }}>
              {archetype?.name ?? "Your archetype"}
            </h1>
            <div style={{ height: 1, width: 80, background: "rgba(234,241,236,0.4)", margin: "32px 0" }} />
            <p className="display-italic" style={{ fontSize: 22, color: "rgba(234,241,236,0.78)", margin: 0, maxWidth: 560, lineHeight: 1.5, letterSpacing: "-0.005em" }}>
              IRIS is composing your reading. Your archetype emerges through reflection — it isn't fixed at first read.
            </p>
          </div>
          <SacredMarkLarge />
        </div>

        {/* Bottom rarity strip */}
        <div style={{ position: "relative", marginTop: 44, paddingTop: 24, borderTop: "1px solid rgba(234,241,236,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(234,241,236,0.5)" }}>RARITY</div>
              <div className="display" style={{ fontSize: 18, marginTop: 4, fontWeight: 500 }}>—</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(234,241,236,0.5)" }}>DRIFT (90d)</div>
              <div className="display" style={{ fontSize: 18, marginTop: 4, fontWeight: 500 }}>—</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(234,241,236,0.5)" }}>CONFIDENCE</div>
              <div className="display" style={{ fontSize: 18, marginTop: 4, fontWeight: 500 }}>—</div>
            </div>
          </div>
          <div className="display-italic" style={{ fontSize: 13, color: "rgba(234,241,236,0.55)" }}>
            emerges with each session
          </div>
        </div>
      </div>

      {/* Domains — refined hex */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginBottom: 28 }}>
        <Card padded={false} style={{ padding: 32 }}>
          <SectionHeader title="The five domains" eyebrow="Vector signature" />
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <RadarChart />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              {["Cognitive", "Emotional", "Volitional", "Relational", "Existential"].map((label, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 1fr 50px", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <div style={{ color: "var(--ink-2)", fontWeight: 500 }}>{label}</div>
                  <div style={{ height: 3, background: "var(--bg-soft)", borderRadius: 2, position: "relative" }} />
                  <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", textAlign: "right" }}>—</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card padded={false} style={{ padding: 32, background: "linear-gradient(135deg, color-mix(in oklab, var(--plum) 14%, var(--bg-card)), var(--bg-card))" }}>
          <div className="label">Shadow</div>
          <div className="display" style={{ fontSize: 28, fontWeight: 400, marginTop: 8, letterSpacing: "-0.02em", lineHeight: 1.15 }}>The withdrawing reflex</div>
          <p className="display-italic" style={{ fontSize: 16, color: "var(--ink-2)", marginTop: 14, lineHeight: 1.55 }}>
            When overwhelmed, your nervous system reaches first for distance. Useful, sometimes. Costly when overused.
          </p>
          <div style={{ marginTop: 24, padding: "14px 16px", background: "var(--bg-soft)", borderRadius: 12, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>
            <div className="label" style={{ marginBottom: 6 }}>Working with it</div>
            Name the urge to withdraw before acting on it. Stay 90 seconds longer than feels natural — that's where the work is.
          </div>
        </Card>
      </div>

      {/* Facets — editorial grid (placeholder until IRIS readings populate) */}
      <Card style={{ marginBottom: 28, padding: 36 }}>
        <SectionHeader title="The 24 facets" eyebrow="High signal · low signal · counter-balance" action={<Pill>Browse all →</Pill>} />
        <div style={{ padding: "32px 0", textAlign: "center", color: "var(--ink-3)", fontSize: 14, fontStyle: "italic" }}>
          Facets emerge as IRIS gathers signal. Keep showing up.
        </div>
      </Card>

      {/* Narrative — IRIS reading (waits for real reading) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <Card style={{ padding: 36, background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 10%, var(--bg-card)), var(--bg-card))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <IrisAvatar size={28} />
            <div className="label">IRIS' reading</div>
          </div>
          <p className="display-italic" style={{ fontSize: 18, lineHeight: 1.55, margin: 0, color: "var(--ink-2)", maxWidth: 540, letterSpacing: "-0.005em" }}>
            Your reading is composed from the conversations you bring. After a few sessions, IRIS will offer one here.
          </p>
        </Card>
        <Card style={{ padding: 36 }}>
          <SectionHeader title="What this season asks of you" />
          <div style={{ padding: "24px 0", color: "var(--ink-3)", fontSize: 14, fontStyle: "italic" }}>
            Three intentions land here once your archetype settles.
          </div>
        </Card>
      </div>

      {/* Companions placeholder */}
      <Card style={{ padding: 36 }}>
        <SectionHeader title="Companions in your archetype" eyebrow="People you might recognize" />
        <div style={{ padding: "24px 0", color: "var(--ink-3)", fontSize: 14, fontStyle: "italic", textAlign: "center" }}>
          Companions appear once IRIS confirms your archetype.
        </div>
      </Card>
    </div>
  );
}

function PlayerCardEmptyState({ onNavigate }) {
  return (
    <div className="scrollbar-hide" style={{ height: "100%", overflow: "auto", padding: "28px 44px 80px", background: "var(--bg)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <button onClick={() => onNavigate("dashboard")} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-3)", fontSize: 13 }}>
          <IconArrowLeft size={16} /> Dashboard
        </button>
        <div className="label">Engram · awaiting your first reading</div>
        <div style={{ width: 120 }} />
      </header>

      <div className="scale-in" style={{
        position: "relative",
        borderRadius: "var(--r-2xl)",
        background: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, color-mix(in oklab, var(--accent) 28%, #1A1A1A) 100%)",
        color: "#F4F4F4",
        padding: "72px 64px",
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(20,30,24,0.24), 0 0 0 1px rgba(0,0,0,0.04)",
        display: "grid", gridTemplateColumns: "1fr auto", gap: 56, alignItems: "center",
        minHeight: 420,
      }}>
        <div style={{ position: "absolute", right: -120, top: -120, width: 460, height: 460, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,213,184,0.36), transparent 60%)" }} />
        <div style={{ position: "absolute", left: -80, bottom: -160, width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,201,168,0.18), transparent 60%)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="mono" style={{ fontSize: 11, color: "rgba(234,241,236,0.55)", letterSpacing: "0.16em", marginBottom: 24 }}>
            BEGIN · IRIS ASSESSMENT
          </div>
          <h1 className="display" style={{ fontSize: 64, fontWeight: 400, margin: 0, letterSpacing: "-0.04em", lineHeight: 1.0 }}>
            Your archetype<br/>
            <span className="display-italic">emerges here.</span>
          </h1>
          <p className="display-italic" style={{ fontSize: 20, color: "rgba(234,241,236,0.78)", margin: "28px 0 0", maxWidth: 540, lineHeight: 1.5 }}>
            Engram reads the texture of how you reflect, not a fixed quiz. Begin a conversation with IRIS — your reading composes itself.
          </p>
          <button
            onClick={() => onNavigate("chat")}
            style={{
              marginTop: 36,
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "14px 22px", borderRadius: 999,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.16)",
              color: "#F4F4F4", fontSize: 14, fontWeight: 500,
              cursor: "pointer",
              transition: "all 200ms var(--ease)",
            }}
          >
            Begin your IRIS assessment <IconArrowRight size={14} />
          </button>
        </div>
        <SacredMarkLarge />
      </div>
    </div>
  );
}

function formatPlayerCardStamp(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `SEAL · ${date.getFullYear()} · ${month}.${day}`;
}

function RadarChart() {
  const points = [0.78, 0.62, 0.71, 0.55, 0.84];
  const labels = ["Cog", "Emo", "Vol", "Rel", "Exi"];
  const cx = 110, cy = 110, R = 80;
  const angle = (i) => (i / 5) * Math.PI * 2 - Math.PI / 2;
  const polyPoints = points.map((v, i) => `${cx + Math.cos(angle(i)) * R * v},${cy + Math.sin(angle(i)) * R * v}`).join(" ");
  return (
    <svg width="220" height="220" viewBox="0 0 220 220">
      {[0.25, 0.5, 0.75, 1].map((r, i) => (
        <polygon key={i}
          points={Array.from({length:5}, (_,j) => `${cx + Math.cos(angle(j))*R*r},${cy + Math.sin(angle(j))*R*r}`).join(" ")}
          fill="none" stroke="var(--line-2)" strokeWidth="0.5"
        />
      ))}
      {Array.from({length:5}).map((_,i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(angle(i))*R} y2={cy + Math.sin(angle(i))*R} stroke="var(--line-2)" strokeWidth="0.5" />
      ))}
      <polygon points={polyPoints} fill="var(--accent)" fillOpacity="0.18" stroke="var(--accent)" strokeWidth="1.5" />
      {points.map((v, i) => (
        <circle key={i} cx={cx + Math.cos(angle(i))*R*v} cy={cy + Math.sin(angle(i))*R*v} r="3" fill="var(--accent)" />
      ))}
      {labels.map((l, i) => (
        <text key={i} x={cx + Math.cos(angle(i))*(R+18)} y={cy + Math.sin(angle(i))*(R+18) + 3}
          textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--ink-3)" letterSpacing="0.08em">{l.toUpperCase()}</text>
      ))}
    </svg>
  );
}

function SacredMarkLarge() {
  return (
    <div style={{ position: "relative", width: 280, height: 280 }} className="breathe">
      <svg width="280" height="280" viewBox="0 0 200 200">
        <defs>
          <radialGradient id="sage-glow-lg">
            <stop offset="0%" style={{ stopColor: "var(--accent-soft)", stopOpacity: 0.55 }} />
            <stop offset="100%" style={{ stopColor: "var(--accent-soft)", stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="95" fill="url(#sage-glow-lg)" />
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const r = 35;
          const x = 100 + r * Math.cos((deg - 90) * Math.PI / 180);
          const y = 100 + r * Math.sin((deg - 90) * Math.PI / 180);
          return <circle key={i} cx={x} cy={y} r="36" fill="none" stroke="rgba(168,213,184,0.5)" strokeWidth="1" />;
        })}
        <circle cx="100" cy="100" r="36" fill="none" stroke="rgba(168,213,184,0.85)" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(232,201,168,0.32)" strokeWidth="0.8" strokeDasharray="2 4" />
        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(168,213,184,0.22)" strokeWidth="0.6" />
        <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(232,201,168,0.18)" strokeWidth="0.5" strokeDasharray="1 3" />
        <circle cx="100" cy="100" r="8" fill="var(--accent-soft)" />
        <circle cx="100" cy="100" r="3" fill="#fff" />
      </svg>
    </div>
  );
}

window.PlayerCardScreen = PlayerCardScreen;
