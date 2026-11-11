// Engram — shared primitives (Card, Button, Section header, NavBar, TopBar)

const Card = ({ children, className = "", style = {}, padded = true, soft = false, onClick, ...rest }) => (
  <div
    className={`eng-card ${onClick ? "hoverable" : ""} ${className}`}
    onClick={onClick}
    style={{
      background: soft ? "var(--bg-soft)" : "var(--bg-card)",
      borderRadius: "var(--r-lg)",
      padding: padded ? "20px" : 0,
      boxShadow: "var(--shadow-sm)",
      cursor: onClick ? "pointer" : "default",
      transition: "transform 200ms var(--ease), box-shadow 200ms var(--ease)",
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

const Button = ({ children, variant = "primary", size = "md", icon, iconRight, full, onClick, disabled, style = {}, ...rest }) => {
  const variants = {
    primary: { background: "var(--ink)", color: "var(--bg-card)", border: "1px solid var(--ink)" },
    accent: { background: "var(--accent)", color: "#fff", border: "1px solid var(--accent)" },
    ghost: { background: "transparent", color: "var(--ink)", border: "1px solid var(--line-2)" },
    soft: { background: "var(--bg-soft)", color: "var(--ink)", border: "1px solid transparent" },
    quiet: { background: "transparent", color: "var(--ink-2)", border: "1px solid transparent" },
  };
  const sizes = {
    sm: { padding: "8px 14px", fontSize: 13, borderRadius: "var(--r-pill)" },
    md: { padding: "12px 20px", fontSize: 14, borderRadius: "var(--r-pill)" },
    lg: { padding: "16px 28px", fontSize: 15, borderRadius: "var(--r-pill)" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        ...sizes[size],
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        width: full ? "100%" : undefined,
        opacity: disabled ? 0.5 : 1,
        transition: "transform 150ms var(--ease), background 150ms var(--ease)",
        ...style,
      }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = "translateY(-1px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
};

const Pill = ({ children, active, onClick, accent, style = {} }) => (
  <button
    onClick={onClick}
    style={{
      padding: "8px 14px",
      borderRadius: "var(--r-pill)",
      fontSize: 13,
      fontWeight: 500,
      background: active ? (accent ? "var(--accent)" : "var(--ink)") : "var(--bg-card)",
      color: active ? "#fff" : "var(--ink-2)",
      border: active ? "1px solid transparent" : "1px solid var(--line)",
      transition: "all 180ms var(--ease)",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </button>
);

const SectionHeader = ({ eyebrow, title, action, large }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
    <div>
      {eyebrow && <div className="label" style={{ marginBottom: 6 }}>{eyebrow}</div>}
      <h2 className="display" style={{
        margin: 0,
        fontSize: large ? 32 : 22,
        fontWeight: 400,
        letterSpacing: "-0.02em",
        color: "var(--ink)",
      }}>{title}</h2>
    </div>
    {action}
  </div>
);

// Premium nav — glass dock with active indicator, subtle CTA
const NavBar = ({ active, onChange, items }) => (
  <nav className="eng-nav" aria-label="Primary navigation" style={{
    position: "absolute",
    bottom: 18,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "color-mix(in oklab, var(--bg-card) 88%, transparent)",
    backdropFilter: "blur(24px) saturate(140%)",
    WebkitBackdropFilter: "blur(24px) saturate(140%)",
    borderRadius: "var(--r-pill)",
    boxShadow: "0 18px 40px color-mix(in oklab, var(--ink) 14%, transparent), 0 2px 8px color-mix(in oklab, var(--ink) 8%, transparent)",
    padding: 6,
    zIndex: 30,
    border: "1px solid var(--line)",
  }}>
    {items.map((item) => {
      const isActive = active === item.id;
      const Ic = item.icon;
      return (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          title={item.label}
          aria-label={item.label}
          aria-current={isActive ? "page" : undefined}
          className="eng-nav-item"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: isActive ? "10px 18px" : "10px 12px",
            borderRadius: "var(--r-pill)",
            background: isActive ? "var(--ink)" : "transparent",
            color: isActive ? "var(--bg-card)" : "var(--ink-3)",
            fontSize: 13,
            fontWeight: 500,
            transition: "all 240ms var(--ease)",
            position: "relative",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "var(--ink)"; }}
          onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "var(--ink-3)"; }}
        >
          <Ic size={17} />
          <span className="eng-nav-label" style={{ letterSpacing: "-0.005em" }}>{item.label}</span>
        </button>
      );
    })}
    {/* Divider + CTA */}
    <span className="eng-nav-divider" aria-hidden="true" style={{ width: 1, height: 22, background: "var(--line)", margin: "0 4px" }} />
    <button className="eng-nav-checkin" aria-label="Quick mood check-in" title="Quick check-in" onClick={() => onChange("checkin")} style={{
      width: 38, height: 38, borderRadius: "50%",
      background: "var(--accent)",
      color: "white",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 6px 18px color-mix(in oklab, var(--accent) 40%, transparent)",
      transition: "all 200ms var(--ease)",
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.06)"}
    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
      <IconPlus size={16} />
    </button>
  </nav>
);

// Top bar inside the app
const TopBar = ({ title, eyebrow, leftAction, rightAction, sticky = true }) => (
  <header style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 28px 12px",
    background: "transparent",
    position: sticky ? "sticky" : "static",
    top: 0,
    zIndex: 5,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {leftAction}
      <div>
        {eyebrow && <div className="label" style={{ marginBottom: 2 }}>{eyebrow}</div>}
        <h1 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 400, letterSpacing: "-0.01em" }}>{title}</h1>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {rightAction}
    </div>
  </header>
);

// Mood orb — abstract circle whose color/shape encodes valence
const MoodOrb = ({ valence = 0.5, energy = 0.5, size = 64, label, animated }) => {
  // valence 0..1, energy 0..1
  // Color: low=plum, mid=accent-soft, high=warm
  const hue = valence < 0.33 ? "var(--plum)" : valence < 0.66 ? "var(--accent-soft)" : "var(--warm)";
  const wobble = 4 + energy * 8;
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        className={animated ? "breathe" : ""}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, color-mix(in oklab, ${hue} 70%, white), ${hue})`,
          boxShadow: `inset 0 -${wobble}px ${wobble * 2}px rgba(0,0,0,0.08), 0 4px 16px color-mix(in oklab, ${hue} 50%, transparent)`,
          transition: "all 400ms var(--ease)",
        }}
      />
      {label && <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 500 }}>{label}</div>}
    </div>
  );
};

// Avatar — IRIS represented as a sage geometric mark
const IrisAvatar = ({ size = 32, animated }) => (
  <div style={{
    width: size,
    height: size,
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--accent-soft), var(--accent))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)",
  }}>
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" fill="white" opacity="0.95" />
      <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1" opacity="0.6" />
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="0.8" opacity="0.3" />
    </svg>
  </div>
);

Object.assign(window, { Card, Button, Pill, SectionHeader, NavBar, TopBar, MoodOrb, IrisAvatar });
