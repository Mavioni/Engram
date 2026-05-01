// Insights — premium editorial: rich charts, more sections, IRIS observations woven in

const { useState: useStateI } = React;

function InsightsScreen({ onNavigate }) {
  const [range, setRange] = useStateI("30d");
  return (
    <div className="scrollbar-hide" style={{ height: "100%", overflow: "auto", padding: "32px 44px 100px", background: "var(--bg)" }}>
      {/* Header */}
      <div className="fade-in" style={{ marginBottom: 32, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="label" style={{ marginBottom: 8 }}>The last 30 days · April 1 — April 30</div>
          <h1 className="display" style={{ fontSize: 48, fontWeight: 400, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.05, maxWidth: 720 }}>
            Patterns, <span className="display-italic" style={{ color: "var(--ink-3)" }}>not verdicts.</span>
          </h1>
          <p className="display-italic" style={{ fontSize: 18, color: "var(--ink-3)", margin: "12px 0 0", maxWidth: 560 }}>
            What the last month is showing about how you live.
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["7d", "30d", "90d", "year"].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: "8px 14px", borderRadius: 999,
              fontSize: 12, fontWeight: 500,
              fontFamily: "var(--font-mono)", letterSpacing: "0.05em",
              background: range === r ? "var(--ink)" : "var(--bg-card)",
              color: range === r ? "var(--bg)" : "var(--ink-3)",
              border: range === r ? "1px solid var(--ink)" : "1px solid var(--line)",
              transition: "all 180ms var(--ease)",
            }}>{r.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Headline metrics — magazine bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0, marginBottom: 28, padding: "28px 32px", background: "var(--bg-card)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-sm)" }}>
        {[
          { l: "Mean mood", v: "0.62", d: "+0.08", up: true, suffix: "/1.0" },
          { l: "Check-ins", v: "23", d: "of 30 days" },
          { l: "Words written", v: "4,892", d: "+38%", up: true },
          { l: "Minutes practiced", v: "112", d: "−14 min" },
          { l: "Longest streak", v: "12", d: "days", up: true },
        ].map((s, i) => (
          <div key={i} style={{ paddingLeft: i ? 24 : 0, borderLeft: i ? "1px solid var(--line)" : "none" }}>
            <div className="label" style={{ marginBottom: 10 }}>{s.l}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span className="display" style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em" }}>{s.v}</span>
              {s.suffix && <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{s.suffix}</span>}
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: s.up ? "var(--accent)" : "var(--ink-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
              {s.up && "↑ "}{s.d}
            </div>
          </div>
        ))}
      </div>

      {/* Pull-quote IRIS observation */}
      <div style={{
        padding: "36px 40px",
        borderRadius: "var(--r-xl)",
        background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 16%, var(--bg-card)) 0%, var(--bg-card) 100%)",
        border: "1px solid color-mix(in oklab, var(--accent) 24%, transparent)",
        marginBottom: 28,
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 28,
        alignItems: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -80, top: -80, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 24%, transparent), transparent 60%)", pointerEvents: "none" }} />
        <IrisAvatar size={56} />
        <div style={{ position: "relative" }}>
          <div className="label" style={{ marginBottom: 10, color: "var(--accent)" }}>What IRIS noticed this month</div>
          <p className="display-italic" style={{ fontSize: 26, lineHeight: 1.42, margin: 0, letterSpacing: "-0.01em", color: "var(--ink)" }}>
            "Your evenings are gentler when there's been any movement — even ten minutes. Tuesdays carry more friction than the rest of the week."
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            <Pill onClick={() => onNavigate("chat")}>Talk about this →</Pill>
            <Pill>Save observation</Pill>
            <Pill>What else?</Pill>
          </div>
        </div>
      </div>

      {/* Mood arc — large */}
      <Card style={{ marginBottom: 16, padding: 36 }}>
        <SectionHeader title="The arc of your mood" eyebrow="30-day curve · with check-in days" action={
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
              <span style={{ width: 16, height: 2, background: "var(--accent)" }} /> MOOD
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--warm)" }} /> CHECK-IN
            </span>
          </div>
        } />
        <MoodArc />
      </Card>

      {/* Mood by hour + Factor bars */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 32 }}>
          <SectionHeader title="Mood across the day" eyebrow="By hour, last 30 days" />
          <MoodHeatmap />
          <div className="display-italic" style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            You're warmest at 7am and 8pm. The 3–5pm dip is real — and recurring.
          </div>
        </Card>
        <Card style={{ padding: 32 }}>
          <SectionHeader title="What lifts you" eyebrow="Factor correlation" />
          <FactorBars />
        </Card>
      </div>

      {/* Domains radar + Calendar heatmap */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 32 }}>
          <SectionHeader title="The shape of your week" eyebrow="6 dimensions" />
          <DomainsRadar />
        </Card>
        <Card style={{ padding: 32 }}>
          <SectionHeader title="Continuity" eyebrow="Daily check-ins" />
          <CalendarHeat />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            <div className="display-italic" style={{ fontSize: 14, color: "var(--ink-2)" }}>23 of 30 days. The two gaps were both a Sunday.</div>
            <Pill>Set a reminder</Pill>
          </div>
        </Card>
      </div>

      {/* Recurring words + Time of day distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 32 }}>
          <SectionHeader title="Recurring words" eyebrow="From your journal entries" action={<Pill onClick={() => onNavigate("journal")}>Open journal →</Pill>} />
          <WordCloud />
        </Card>
        <Card style={{ padding: 32 }}>
          <SectionHeader title="When you wrote" eyebrow="Time of day" />
          <TimeOfDayBars />
        </Card>
      </div>

      {/* Three small stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <Card style={{ padding: 28 }}>
          <div className="label">Your gentlest day</div>
          <div className="display" style={{ fontSize: 24, fontWeight: 400, marginTop: 8, letterSpacing: "-0.015em" }}>Saturday, April 13</div>
          <div className="display-italic" style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 6 }}>Walked. Made soup. Wrote 612 words.</div>
        </Card>
        <Card style={{ padding: 28 }}>
          <div className="label">Most-used factor</div>
          <div className="display" style={{ fontSize: 24, fontWeight: 400, marginTop: 8, letterSpacing: "-0.015em" }}>Sleep · 17 days</div>
          <div className="display-italic" style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 6 }}>Followed by Work (14) and Body (11).</div>
        </Card>
        <Card style={{ padding: 28 }}>
          <div className="label">A pattern worth naming</div>
          <div className="display" style={{ fontSize: 24, fontWeight: 400, marginTop: 8, letterSpacing: "-0.015em" }}>The Sunday lift</div>
          <div className="display-italic" style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 6 }}>Solitude on Sundays predicts a softer Monday.</div>
        </Card>
      </div>
    </div>
  );
}

function MoodArc() {
  const days = 30;
  const points = Array.from({ length: days }, (_, i) => {
    const base = 0.5 + Math.sin(i * 0.4) * 0.18 + Math.cos(i * 0.13) * 0.12;
    return Math.max(0.15, Math.min(0.95, base + (i / days) * 0.18));
  });
  const w = 1000, h = 200;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${(i / (points.length - 1)) * w},${h - p * h}`).join(" ");
  const checkinDays = [0, 1, 2, 4, 5, 6, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 28, 29];
  return (
    <div>
      <svg width="100%" height={h + 40} viewBox={`0 -10 ${w} ${h + 40}`} preserveAspectRatio="none" style={{ display: "block" }}>
        <defs>
          <linearGradient id="arc-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.34" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g, i) => (
          <line key={i} x1="0" y1={h - g * h} x2={w} y2={h - g * h} stroke="var(--line-2)" strokeWidth="0.5" strokeDasharray="3 4" />
        ))}
        <path d={`${path} L ${w},${h} L 0,${h} Z`} fill="url(#arc-grad)" />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {checkinDays.map(d => (
          <circle key={d} cx={(d / (points.length - 1)) * w} cy={h - points[d] * h} r="3" fill="var(--warm)" stroke="var(--bg-card)" strokeWidth="2" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
        <span>APR 1</span><span>APR 8</span><span>APR 15</span><span>APR 22</span><span>APR 30</span>
      </div>
    </div>
  );
}

function MoodHeatmap() {
  const cols = 24, rows = 7;
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const data = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const morn = c >= 7 && c <= 11 ? 0.8 : 0;
      const eve = c >= 18 && c <= 22 ? 0.7 : 0;
      const dip = (r === 1 || r === 3) && c >= 14 && c <= 17 ? -0.3 : 0;
      return Math.max(0, Math.min(1, morn + eve + dip + (Math.sin(r + c) * 0.2)));
    })
  );
  return (
    <div>
      <div style={{ display: "flex", marginBottom: 8, paddingLeft: 38, fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
        {[0, 6, 12, 18].map((h, i) => (
          <div key={h} style={{ flex: 1, textAlign: i === 0 ? "left" : "center" }}>{h === 0 ? "12am" : h === 12 ? "12pm" : `${h % 12}${h < 12 ? "am" : "pm"}`}</div>
        ))}
      </div>
      {data.map((row, r) => (
        <div key={r} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <div style={{ width: 30, fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{days[r]}</div>
          <div style={{ display: "flex", gap: 2, flex: 1 }}>
            {row.map((v, c) => (
              <div key={c} style={{
                flex: 1, height: 18, borderRadius: 3,
                background: v > 0.05 ? `color-mix(in oklab, var(--accent) ${v * 80 + 8}%, var(--bg-soft))` : "var(--bg-soft)",
                transition: "background 200ms var(--ease)",
              }} />
            ))}
          </div>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 14, fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
        <span>LESS</span>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map(v => (
          <div key={v} style={{ width: 14, height: 14, borderRadius: 2, background: `color-mix(in oklab, var(--accent) ${v * 80}%, var(--bg-soft))` }} />
        ))}
        <span>MORE</span>
      </div>
    </div>
  );
}

function FactorBars() {
  const data = [
    { label: "Movement", v: 0.85, dir: 1 },
    { label: "Sleep > 7h", v: 0.78, dir: 1 },
    { label: "Solitude", v: 0.62, dir: 1 },
    { label: "Creative work", v: 0.55, dir: 1 },
    { label: "Meetings > 4", v: 0.55, dir: -1 },
    { label: "Late screens", v: 0.71, dir: -1 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
            <span style={{ color: "var(--ink)", fontWeight: 500 }}>{d.label}</span>
            <span className="mono" style={{ color: d.dir > 0 ? "var(--accent)" : "var(--plum)", fontWeight: 500 }}>
              {d.dir > 0 ? "+" : "−"}{Math.round(d.v * 30)}%
            </span>
          </div>
          <div style={{ height: 6, background: "var(--bg-soft)", borderRadius: 3, position: "relative" }}>
            <div style={{
              position: "absolute", left: "50%", height: "100%",
              width: `${d.v * 50}%`,
              background: d.dir > 0 ? `linear-gradient(90deg, color-mix(in oklab, var(--accent) 50%, transparent), var(--accent))` : `linear-gradient(270deg, color-mix(in oklab, var(--plum) 50%, transparent), var(--plum))`,
              borderRadius: 3,
              transform: d.dir > 0 ? "none" : "translateX(-100%)",
            }} />
            <div style={{ position: "absolute", left: "50%", top: -2, bottom: -2, width: 1, background: "var(--ink-4)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DomainsRadar() {
  const dims = [
    { l: "Cognitive", v: 0.78 },
    { l: "Emotional", v: 0.62 },
    { l: "Volitional", v: 0.71 },
    { l: "Relational", v: 0.55 },
    { l: "Existential", v: 0.84 },
    { l: "Shadow", v: 0.42 },
  ];
  const cx = 160, cy = 150, R = 110;
  const pt = (v, i) => {
    const a = (i / dims.length) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v];
  };
  const lp = (i) => {
    const a = (i / dims.length) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * (R + 18), cy + Math.sin(a) * (R + 18)];
  };
  return (
    <svg width="100%" height="320" viewBox="0 0 320 320">
      {[0.25, 0.5, 0.75, 1].map((s, i) => (
        <polygon key={i} points={dims.map((_, j) => {
          const a = (j / dims.length) * Math.PI * 2 - Math.PI / 2;
          return `${cx + Math.cos(a) * R * s},${cy + Math.sin(a) * R * s}`;
        }).join(" ")}
          fill="none" stroke="var(--line-2)" strokeWidth="0.5" />
      ))}
      {dims.map((_, i) => {
        const a = (i / dims.length) * Math.PI * 2 - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * R} y2={cy + Math.sin(a) * R} stroke="var(--line-2)" strokeWidth="0.4" />;
      })}
      <polygon points={dims.map((d, i) => pt(d.v, i).join(",")).join(" ")} fill="var(--accent)" fillOpacity="0.18" stroke="var(--accent)" strokeWidth="2" />
      {dims.map((d, i) => {
        const [x, y] = pt(d.v, i);
        const [lx, ly] = lp(i);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="3.5" fill="var(--accent)" stroke="var(--bg-card)" strokeWidth="1.5" />
            <text x={lx} y={ly} textAnchor="middle" fontSize="10" fill="var(--ink-3)" fontFamily="var(--font-mono)" letterSpacing="0.06em" dy="3">{d.l.toUpperCase()}</text>
          </g>
        );
      })}
    </svg>
  );
}

function CalendarHeat() {
  const days = Array.from({ length: 35 }, (_, i) => {
    if (i < 5) return -1;
    if (i === 7 || i === 21) return 0;
    return 0.4 + Math.random() * 0.5;
  });
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} style={{ fontSize: 10, color: "var(--ink-4)", textAlign: "center", marginBottom: 4, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{d}</div>
        ))}
        {days.map((v, i) => (
          <div key={i} style={{
            aspectRatio: "1",
            borderRadius: 7,
            background: v < 0 ? "transparent" : v < 0.1 ? "var(--bg-soft)" : `color-mix(in oklab, var(--accent) ${v * 70 + 15}%, var(--bg-soft))`,
            transition: "background 200ms var(--ease)",
          }} />
        ))}
      </div>
    </>
  );
}

function WordCloud() {
  const words = [
    { w: "tired", s: 30 }, { w: "magnolia", s: 26 }, { w: "deadline", s: 18 },
    { w: "mom", s: 30 }, { w: "morning", s: 22 }, { w: "breath", s: 28 },
    { w: "alone", s: 19 }, { w: "walk", s: 38 }, { w: "soft", s: 17 },
    { w: "again", s: 23 }, { w: "quiet", s: 26 }, { w: "tender", s: 16 },
    { w: "Tuesday", s: 14 }, { w: "enough", s: 28 }, { w: "noticing", s: 22 },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 16px", alignItems: "baseline", padding: "12px 0", lineHeight: 1.3 }}>
      {words.map((wd, i) => (
        <span key={i} style={{
          fontFamily: "var(--font-display)",
          fontSize: wd.s,
          fontStyle: i % 3 === 0 ? "italic" : "normal",
          color: i % 4 === 0 ? "var(--accent)" : "var(--ink)",
          fontWeight: wd.s > 26 ? 500 : 400,
          letterSpacing: "-0.005em",
        }}>{wd.w}</span>
      ))}
    </div>
  );
}

function TimeOfDayBars() {
  const buckets = [
    { l: "Early morning", t: "5–8am", v: 0.18 },
    { l: "Morning", t: "8–12pm", v: 0.34 },
    { l: "Afternoon", t: "12–5pm", v: 0.10 },
    { l: "Evening", t: "5–9pm", v: 0.46 },
    { l: "Late night", t: "9pm–1am", v: 0.22 },
  ];
  const max = Math.max(...buckets.map(b => b.v));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {buckets.map((b, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{b.l}</span>
            <span style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{b.t}</span>
          </div>
          <div style={{ height: 8, background: "var(--bg-soft)", borderRadius: 4 }}>
            <div style={{ width: `${(b.v / max) * 100}%`, height: "100%", background: "linear-gradient(90deg, var(--accent-soft), var(--accent))", borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

window.InsightsScreen = InsightsScreen;
