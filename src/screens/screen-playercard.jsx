// Player Card — premium edition: editorial layout, hand-set type, depth, ritual

function PlayerCardScreen({ onNavigate }) {
  return (
    <div className="scrollbar-hide" style={{ height: "100%", overflow: "auto", padding: "28px 44px 80px", background: "var(--bg)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <button onClick={() => onNavigate("dashboard")} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-3)", fontSize: 13 }}>
          <IconArrowLeft size={16} /> Dashboard
        </button>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          <span className="label">Engram · v4 · IRIS-derived</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ink-4)" }} />
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em" }}>SEAL · MMXXVI · 04.30</span>
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
            ENGRAM · 04 ⁄ 24
          </div>
          <div className="mono" style={{ fontSize: 11, color: "rgba(234,241,236,0.55)", letterSpacing: "0.12em" }}>
            ARCHETYPE · WORLD No. 142
          </div>
          <div className="mono" style={{ fontSize: 11, color: "rgba(234,241,236,0.55)", letterSpacing: "0.12em" }}>
            VECTOR · 0.847 LK
          </div>
        </div>

        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr auto", gap: 56, alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <span className="mono" style={{ fontSize: 13, color: "rgba(234,241,236,0.7)", letterSpacing: "0.16em" }}>04 · w5 · sp/sx</span>
              <span style={{ width: 24, height: 1, background: "rgba(234,241,236,0.3)" }} />
              <span className="display-italic" style={{ fontSize: 16, color: "rgba(234,241,236,0.8)" }}>"individuant"</span>
            </div>
            <h1 className="display" style={{ fontSize: 76, fontWeight: 400, margin: 0, letterSpacing: "-0.04em", lineHeight: 0.95 }}>
              The Lighthouse<br/>
              <span className="display-italic" style={{ fontWeight: 400 }}>Keeper</span>
            </h1>
            <div style={{ height: 1, width: 80, background: "rgba(234,241,236,0.4)", margin: "32px 0" }} />
            <p className="display-italic" style={{ fontSize: 22, color: "rgba(234,241,236,0.78)", margin: 0, maxWidth: 560, lineHeight: 1.5, letterSpacing: "-0.005em" }}>
              You hold steady so others can find their way. Sensitivity disguised as solitude. Inner depth misread as distance.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 32 }}>
              {["introspective", "quietly intense", "orienting", "loyal"].map(t => (
                <span key={t} style={{
                  padding: "8px 14px", borderRadius: 999,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  fontSize: 12, fontWeight: 500,
                  color: "rgba(234,241,236,0.95)",
                  letterSpacing: "0.02em",
                }}>{t}</span>
              ))}
            </div>
          </div>
          <SacredMarkLarge />
        </div>

        {/* Bottom rarity strip */}
        <div style={{ position: "relative", marginTop: 44, paddingTop: 24, borderTop: "1px solid rgba(234,241,236,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(234,241,236,0.5)" }}>RARITY</div>
              <div className="display" style={{ fontSize: 18, marginTop: 4, fontWeight: 500 }}>1 in 47</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(234,241,236,0.5)" }}>DRIFT (90d)</div>
              <div className="display" style={{ fontSize: 18, marginTop: 4, fontWeight: 500 }}>+0.04 ↑</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(234,241,236,0.5)" }}>CONFIDENCE</div>
              <div className="display" style={{ fontSize: 18, marginTop: 4, fontWeight: 500 }}>0.92</div>
            </div>
          </div>
          <div className="display-italic" style={{ fontSize: 13, color: "rgba(234,241,236,0.55)" }}>
            updated each Sunday
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
              {[
                { l: "Cognitive", v: 0.78, note: "Pattern-led" },
                { l: "Emotional", v: 0.62, note: "Deep current" },
                { l: "Volitional", v: 0.71, note: "Quiet stubborn" },
                { l: "Relational", v: 0.55, note: "Close circle" },
                { l: "Existential", v: 0.84, note: "Meaning-driven" },
              ].map((d, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 1fr 50px", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <div style={{ color: "var(--ink-2)", fontWeight: 500 }}>{d.l}</div>
                  <div style={{ height: 3, background: "var(--bg-soft)", borderRadius: 2, position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, width: `${d.v * 100}%`, background: `linear-gradient(90deg, var(--accent-soft), var(--accent))`, borderRadius: 2 }} />
                  </div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", textAlign: "right" }}>{d.v.toFixed(2)}</div>
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

      {/* Facets — editorial grid */}
      <Card style={{ marginBottom: 28, padding: 36 }}>
        <SectionHeader title="The 24 facets" eyebrow="High signal · low signal · counter-balance" action={<Pill>Browse all →</Pill>} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {[
            { n: "Reflection", v: 0.92, t: "high", note: "you stay with questions" },
            { n: "Aesthetic sense", v: 0.88, t: "high", note: "form matters to you" },
            { n: "Loyalty", v: 0.81, t: "high", note: "long horizons" },
            { n: "Inner sovereignty", v: 0.79, t: "high", note: "self-authored" },
            { n: "Conflict tolerance", v: 0.34, t: "low", note: "you avoid heat" },
            { n: "Public visibility", v: 0.28, t: "low", note: "private engine" },
            { n: "Repair instinct", v: 0.66, t: "mid", note: "good first try" },
            { n: "Domain bravery", v: 0.71, t: "high", note: "go your own way" },
          ].map((f, i) => {
            const accent = f.t === "high" ? "var(--accent)" : f.t === "low" ? "var(--plum)" : "var(--warm)";
            return (
              <div key={i} style={{ borderLeft: `2px solid ${accent}`, paddingLeft: 16, paddingTop: 4, paddingBottom: 4 }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: "0.12em", color: "var(--ink-4)", marginBottom: 6 }}>{String(i+1).padStart(2,"0")} · {f.t.toUpperCase()}</div>
                <div className="display" style={{ fontSize: 16, fontWeight: 500, marginBottom: 6, letterSpacing: "-0.01em" }}>{f.n}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 18, fontWeight: 500 }}>{f.v.toFixed(2)}</span>
                  <div style={{ flex: 1, height: 2, background: "var(--bg-soft)", borderRadius: 1 }}>
                    <div style={{ width: `${f.v * 100}%`, height: "100%", background: accent, borderRadius: 1 }} />
                  </div>
                </div>
                <div className="display-italic" style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.4 }}>{f.note}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Narrative — pull quote */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <Card style={{ padding: 36, background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 10%, var(--bg-card)), var(--bg-card))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <IrisAvatar size={28} />
            <div className="label">IRIS' reading</div>
          </div>
          <p className="display-italic" style={{ fontSize: 22, lineHeight: 1.5, margin: 0, color: "var(--ink)", maxWidth: 540, letterSpacing: "-0.005em" }}>
            "You arrived here through reflection, not through asking. Your attention is itself a gift — but the cost of that attention is occasional withdrawal."
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ink-2)", marginTop: 20, maxWidth: 540 }}>
            Your work this season is not to perform more, but to let your closest few people see how steady you actually are.
          </p>
        </Card>
        <Card style={{ padding: 36 }}>
          <SectionHeader title="What this season asks of you" />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { n: "01", t: "Be seen by one person, slowly." },
              { n: "02", t: "Stay with discomfort 90 seconds longer." },
              { n: "03", t: "Make something small, share it before it's ready." },
            ].map((x, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, alignItems: "baseline", paddingBottom: 14, borderBottom: i < 2 ? "1px solid var(--line)" : "none" }}>
                <span className="mono" style={{ fontSize: 12, color: "var(--ink-4)", letterSpacing: "0.08em" }}>{x.n}</span>
                <span className="display" style={{ fontSize: 17, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.4 }}>{x.t}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Companions */}
      <Card style={{ padding: 36 }}>
        <SectionHeader title="Companions in your archetype" eyebrow="People you might recognize" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { n: "Mary Oliver", r: "the noticing", c: "var(--accent)" },
            { n: "Tarkovsky", r: "patient depth", c: "var(--plum)" },
            { n: "James Baldwin", r: "moral clarity", c: "var(--warm)" },
            { n: "Agnes Martin", r: "quiet making", c: "var(--sky)" },
          ].map((p, i) => (
            <div key={i} style={{ padding: 18, borderRadius: 14, background: "var(--bg-soft)" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, color-mix(in oklab, ${p.c} 50%, white), ${p.c})`, marginBottom: 12 }} />
              <div className="display" style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>{p.n}</div>
              <div className="display-italic" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{p.r}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
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
