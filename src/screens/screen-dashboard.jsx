// Today / Dashboard — premium edition: editorial layout, depth, refinement

function DashboardScreen({ onNavigate }) {
  return (
    <div className="scrollbar-hide" style={{ height: "100%", overflow: "auto", padding: "32px 44px 120px" }}>
      {/* Greeting */}
      <div className="fade-in" style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} className="pulse-soft" />
            <span className="label">Thursday · April 30 · 7:14 pm</span>
          </div>
          <h1 className="display" style={{
            fontSize: 44, fontWeight: 400,
            letterSpacing: "-0.03em",
            margin: 0, lineHeight: 1.05,
            maxWidth: 720,
          }}>
            Good evening, Mara.
          </h1>
          <p className="display-italic" style={{ fontSize: 22, color: "var(--ink-3)", margin: "10px 0 0", letterSpacing: "-0.005em" }}>
            How are you arriving?
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Pill onClick={() => onNavigate("checkin")}>+ Quick check-in</Pill>
        </div>
      </div>

      {/* Hero player card */}
      <PlayerCardHero onClick={() => onNavigate("playercard")} />

      {/* Today path */}
      <div style={{ marginTop: 40 }}>
        <SectionHeader title="A path through tonight" eyebrow="Curated for you" />
        <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <PathCard
            n="01"
            icon={<IconHeart size={20} />}
            title="Check in with how you feel"
            sub="A 4-step landing — mood, intensity, factors, optional note."
            time="2 min"
            tint="color-mix(in oklab, var(--accent) 14%, var(--bg-card))"
            onClick={() => onNavigate("checkin")}
          />
          <PathCard
            n="02"
            icon={<IconMoon size={20} />}
            title="Evening unwinding"
            sub="A guided practice with Maren. Gentle, body-led, eight minutes."
            time="8 min · audio"
            tint="color-mix(in oklab, var(--plum) 18%, var(--bg-card))"
            onClick={() => onNavigate("meditation")}
          />
          <PathCard
            n="03"
            icon={<IconBook size={20} />}
            title="Reflect — what stood out today?"
            sub="A blank page, with a nudge from IRIS if you'd like one."
            time="open length"
            tint="color-mix(in oklab, var(--warm) 22%, var(--bg-card))"
            onClick={() => onNavigate("journal")}
          />
        </div>
      </div>

      {/* Two-up: Mood trend + IRIS observation */}
      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <MoodTrendCard onClick={() => onNavigate("insights")} />
        <IRISObservationCard onClick={() => onNavigate("chat")} />
      </div>

      {/* Three-up: Continuity, Recent journal, Practice library */}
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr", gap: 16 }}>
        <StreakCard />
        <ReflectionsCompact onNavigate={onNavigate} />
        <PracticeShelf onClick={() => onNavigate("meditation")} />
      </div>

      {/* This week */}
      <div style={{ marginTop: 40 }}>
        <SectionHeader title="This week, by the numbers" eyebrow="Last 7 days" action={<Pill onClick={() => onNavigate("insights")}>Full insights →</Pill>} />
        <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard label="Check-ins" value="5" delta="+2 vs last week" up />
          <StatCard label="Journal words" value="2,148" delta="+38%" up />
          <StatCard label="Minutes practiced" value="47" delta="−6 min" />
          <StatCard label="Average mood" value="0.62" delta="rising" up suffix="/1.0" />
        </div>
      </div>
    </div>
  );
}

function PlayerCardHero({ onClick }) {
  return (
    <div onClick={onClick} className="scale-in" style={{
      position: "relative",
      borderRadius: "var(--r-2xl)",
      overflow: "hidden",
      cursor: "pointer",
      background: "linear-gradient(135deg, #0A0A0A 0%, #1F1F1F 60%, color-mix(in oklab, var(--accent) 22%, #1F1F1F) 100%)",
      color: "#F4F4F4",
      padding: "40px 44px",
      minHeight: 280,
      display: "grid",
      gridTemplateColumns: "1fr auto",
      alignItems: "center",
      gap: 32,
      boxShadow: "0 24px 60px rgba(26,38,32,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
      transition: "transform 280ms var(--ease), box-shadow 280ms var(--ease)",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 32px 72px rgba(26,38,32,0.24), 0 0 0 1px rgba(0,0,0,0.04)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 24px 60px rgba(26,38,32,0.18), 0 0 0 1px rgba(0,0,0,0.04)"; }}
    >
      {/* Decorative orbs */}
      <div style={{ position: "absolute", right: -100, top: -100, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,213,184,0.32), transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: -50, bottom: -120, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,201,168,0.18), transparent 60%)", pointerEvents: "none" }} />
      {/* Grid texture */}
      <svg style={{ position: "absolute", inset: 0, opacity: 0.06, pointerEvents: "none" }} width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
          <span className="label" style={{ color: "rgba(234,241,236,0.6)" }}>Your Engram</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(234,241,236,0.3)" }} />
          <span className="mono" style={{ fontSize: 11, color: "rgba(234,241,236,0.55)", letterSpacing: "0.05em" }}>4w5 · v0.847 · LK</span>
        </div>
        <h2 className="display" style={{
          fontSize: 52, fontWeight: 400, margin: 0,
          letterSpacing: "-0.035em", lineHeight: 1, maxWidth: 520,
        }}>
          The Lighthouse Keeper
        </h2>
        <p className="display-italic" style={{
          margin: "16px 0 28px", fontSize: 18,
          color: "rgba(234,241,236,0.7)", maxWidth: 480, lineHeight: 1.45,
        }}>
          You hold steady so others can find their way.
        </p>

        <div style={{ display: "flex", gap: 28, alignItems: "flex-end" }}>
          {[
            { label: "Cognitive", v: 0.78 },
            { label: "Emotional", v: 0.62 },
            { label: "Volitional", v: 0.71 },
            { label: "Relational", v: 0.55 },
            { label: "Existential", v: 0.84 },
          ].map((d) => (
            <div key={d.label}>
              <div style={{ fontSize: 10, letterSpacing: "0.08em", color: "rgba(234,241,236,0.5)", textTransform: "uppercase", marginBottom: 8 }}>{d.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span className="mono" style={{ fontSize: 18, fontWeight: 500 }}>{d.v.toFixed(2)}</span>
              </div>
              <div style={{ marginTop: 8, height: 3, width: 64, background: "rgba(244,244,244,0.13)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${d.v * 100}%`, height: "100%", background: "linear-gradient(90deg, var(--accent-2), var(--accent))" }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28, display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <span style={{ fontSize: 13 }}>Open your Engram profile</span>
          <IconArrowRight size={14} />
        </div>
      </div>

      <SacredMark />
    </div>
  );
}

function SacredMark() {
  return (
    <div style={{ position: "relative", width: 220, height: 220 }}>
      <svg width="220" height="220" viewBox="0 0 200 200" className="breathe">
        <defs>
          <radialGradient id="sage-glow">
            <stop offset="0%" style={{ stopColor: "var(--accent-soft)", stopOpacity: 0.55 }} />
            <stop offset="100%" style={{ stopColor: "var(--accent-soft)", stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="92" fill="url(#sage-glow)" />
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const r = 35;
          const x = 100 + r * Math.cos((deg - 90) * Math.PI / 180);
          const y = 100 + r * Math.sin((deg - 90) * Math.PI / 180);
          return <circle key={i} cx={x} cy={y} r="36" fill="none" stroke="rgba(168,213,184,0.45)" strokeWidth="1" />;
        })}
        <circle cx="100" cy="100" r="36" fill="none" stroke="rgba(168,213,184,0.7)" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(232,201,168,0.3)" strokeWidth="0.6" strokeDasharray="2 4" />
        <circle cx="100" cy="100" r="6" fill="var(--accent-soft)" />
      </svg>
    </div>
  );
}

function PathCard({ n, icon, title, sub, time, tint, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "var(--bg-card)",
      borderRadius: "var(--r-lg)",
      padding: 24,
      boxShadow: "var(--shadow-sm)",
      cursor: "pointer",
      transition: "all 220ms var(--ease)",
      display: "flex", flexDirection: "column", gap: 18,
      minHeight: 200,
      position: "relative", overflow: "hidden",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
    >
      <div style={{ position: "absolute", top: 24, right: 24 }} className="mono">
        <span style={{ fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.08em" }}>{n}</span>
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: tint, color: "var(--ink)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div className="display" style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.25, marginBottom: 8, letterSpacing: "-0.01em" }}>{title}</div>
        <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>{sub}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid var(--line)" }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.05em" }}>{time}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>
          Begin <IconArrowRight size={14} />
        </span>
      </div>
    </div>
  );
}

function MoodTrendCard({ onClick }) {
  const points = [0.5, 0.4, 0.55, 0.7, 0.45, 0.6, 0.65, 0.55, 0.75, 0.7, 0.6, 0.65, 0.55, 0.7];
  const w = 480, h = 100;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${(i / (points.length - 1)) * w},${h - p * h}`).join(" ");
  return (
    <div onClick={onClick} style={{
      background: "var(--bg-card)",
      borderRadius: "var(--r-lg)",
      padding: 28,
      boxShadow: "var(--shadow-sm)",
      cursor: "pointer",
      transition: "all 220ms var(--ease)",
    }}
    onMouseEnter={(e) => e.currentTarget.style.boxShadow = "var(--shadow-md)"}
    onMouseLeave={(e) => e.currentTarget.style.boxShadow = "var(--shadow-sm)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div className="label">14 days · gently rising</div>
          <div className="display" style={{ fontSize: 28, fontWeight: 400, marginTop: 6, letterSpacing: "-0.02em" }}>
            +12% mood
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>You showed up on 12 of 14 days.</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Pill>Insights →</Pill>
        </div>
      </div>
      <svg width="100%" height={h + 20} viewBox={`0 -10 ${w} ${h + 20}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="mt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L ${w},${h} L 0,${h} Z`} fill="url(#mt)" />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={(i / (points.length - 1)) * w} cy={h - p * h}
            r={i === points.length - 1 ? 6 : 0}
            fill={i === points.length - 1 ? "var(--accent)" : "transparent"}
            stroke={i === points.length - 1 ? "var(--bg-card)" : "transparent"}
            strokeWidth="3" />
        ))}
      </svg>
    </div>
  );
}

function IRISObservationCard({ onClick }) {
  return (
    <div onClick={onClick} style={{
      borderRadius: "var(--r-lg)",
      padding: 28,
      background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 14%, var(--bg-card)), var(--bg-card))",
      border: "1px solid color-mix(in oklab, var(--accent) 24%, transparent)",
      cursor: "pointer",
      display: "flex", flexDirection: "column", gap: 16,
      position: "relative", overflow: "hidden",
      transition: "all 220ms var(--ease)",
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <IrisAvatar size={32} />
        <div className="label" style={{ color: "var(--accent)" }}>What IRIS noticed today</div>
      </div>
      <p className="display-italic" style={{ fontSize: 19, color: "var(--ink)", margin: 0, lineHeight: 1.45, letterSpacing: "-0.005em" }}>
        Your evenings are gentler when there's been any movement. Even a ten-minute walk shows up in tomorrow morning.
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 8 }}>
        <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}>
          Talk to IRIS about it <IconArrowRight size={14} />
        </span>
      </div>
    </div>
  );
}

function StreakCard() {
  const days = [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1];
  return (
    <div style={{ background: "var(--bg-card)", borderRadius: "var(--r-lg)", padding: 24, boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="label">Continuity</div>
        <IconFlame size={16} color="var(--warm)" />
      </div>
      <div className="display" style={{ fontSize: 38, fontWeight: 400, marginTop: 12, letterSpacing: "-0.025em" }}>
        12 <span style={{ fontSize: 18, color: "var(--ink-3)", fontStyle: "italic" }}>days</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 18 }}>of showing up</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
        {days.map((d, i) => (
          <div key={i} style={{
            aspectRatio: "1", borderRadius: 5,
            background: d ? `color-mix(in oklab, var(--accent) ${50 + (i / days.length) * 50}%, var(--bg-soft))` : "var(--bg-soft)",
            transition: "background 200ms var(--ease)",
          }} />
        ))}
      </div>
    </div>
  );
}

function ReflectionsCompact({ onNavigate }) {
  const items = [
    { date: "Yesterday", mood: { valence: 0.7, energy: 0.4 }, title: "A quiet sort of grateful", preview: "Walked at dusk. Noticed the magnolia is finally open. Something about the slowness…" },
    { date: "Tuesday", mood: { valence: 0.3, energy: 0.7 }, title: "The work-spiral", preview: "The deadline pulled me out of my body again. I got the thing done. I lost the day." },
  ];
  return (
    <div style={{ background: "var(--bg-card)", borderRadius: "var(--r-lg)", padding: 24, boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div className="label">Recent reflections</div>
        <button onClick={() => onNavigate("journal")} style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>All entries →</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        {items.map((r, i) => (
          <div key={i} onClick={() => onNavigate("journal")} style={{ display: "flex", gap: 14, cursor: "pointer", paddingBottom: i === 0 ? 16 : 0, borderBottom: i === 0 ? "1px solid var(--line)" : "none" }}>
            <MoodOrb {...r.mood} size={42} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <div className="display" style={{ fontSize: 16, fontWeight: 500 }}>{r.title}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.05em" }}>{r.date}</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {r.preview}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PracticeShelf({ onClick }) {
  const items = [
    { title: "3-minute reset", time: "3 min", color: "var(--accent)" },
    { title: "Body scan", time: "12 min", color: "var(--plum)" },
    { title: "Grief, gently held", time: "15 min", color: "var(--sky)" },
  ];
  return (
    <div style={{ background: "var(--bg-card)", borderRadius: "var(--r-lg)", padding: 24, boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div className="label">Practices</div>
        <button onClick={onClick} style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>Library →</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((p, i) => (
          <button key={i} onClick={onClick} style={{
            textAlign: "left",
            padding: "12px 14px",
            background: "var(--bg-soft)",
            borderRadius: 12,
            display: "flex", alignItems: "center", gap: 12,
            transition: "all 150ms var(--ease)",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-deep)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-soft)"}
          >
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: `radial-gradient(circle at 35% 30%, color-mix(in oklab, ${p.color} 60%, white), ${p.color})`,
              display: "flex", alignItems: "center", justifyContent: "center", color: "white",
            }}>
              <IconPlay size={12} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 1 }}>{p.title}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{p.time}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, up, suffix }) {
  return (
    <div style={{ background: "var(--bg-card)", borderRadius: "var(--r-lg)", padding: 22, boxShadow: "var(--shadow-sm)" }}>
      <div className="label" style={{ marginBottom: 12 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span className="display" style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em" }}>{value}</span>
        {suffix && <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{suffix}</span>}
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: up ? "var(--accent)" : "var(--ink-3)", display: "flex", alignItems: "center", gap: 4 }}>
        {up && "↑"} {delta}
      </div>
    </div>
  );
}

window.DashboardScreen = DashboardScreen;
