// Onboarding — 3 steps before chat

const { useState: useStateO } = React;

function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useStateO(0);
  const [name, setName] = useStateO("");
  const [intent, setIntent] = useStateO(null);

  const next = () => step < 2 ? setStep(s => s + 1) : onComplete();

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: `radial-gradient(ellipse at center top, var(--accent-tint), var(--bg) 70%)` }}>
      <header style={{ padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="display" style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em" }}>engram</span>
        <button onClick={onComplete} style={{ color: "var(--ink-3)", fontSize: 13 }}>Skip intro</button>
      </header>

      <div className="fade-in" key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 40px", textAlign: "center" }}>
        {step === 0 && <Welcome />}
        {step === 1 && <NameStep name={name} setName={setName} />}
        {step === 2 && <IntentStep intent={intent} setIntent={setIntent} />}
      </div>

      <footer style={{ padding: "24px 40px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: i === step ? 24 : 8, height: 4, borderRadius: 2,
              background: i <= step ? "var(--accent)" : "var(--line-2)",
              transition: "all 250ms var(--ease)",
            }} />
          ))}
        </div>
        <Button variant="accent" iconRight={<IconArrowRight size={16} />}
          onClick={next}
          disabled={(step === 1 && !name.trim()) || (step === 2 && !intent)}>
          {step < 2 ? "Continue" : "Begin with IRIS"}
        </Button>
      </footer>
    </div>
  );
}

function Welcome() {
  return (
    <>
      <div className="breathe" style={{
        width: 140, height: 140, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, var(--accent-soft), var(--accent))",
        boxShadow: "0 12px 64px color-mix(in oklab, var(--accent) 40%, transparent)",
        marginBottom: 40,
      }} />
      <h1 className="display" style={{ fontSize: 56, fontWeight: 400, letterSpacing: "-0.035em", margin: 0, maxWidth: 600 }}>
        Welcome. <span style={{ fontStyle: "italic", color: "var(--ink-3)" }}>Take your time.</span>
      </h1>
      <p style={{ fontSize: 17, color: "var(--ink-2)", marginTop: 20, maxWidth: 520, lineHeight: 1.55 }}>
        Engram is a quiet companion for your inner life. Reflect, journal, breathe. IRIS is here to listen, not to fix.
      </p>
    </>
  );
}

function NameStep({ name, setName }) {
  return (
    <>
      <h1 className="display" style={{ fontSize: 48, fontWeight: 400, letterSpacing: "-0.03em", margin: "0 0 12px", maxWidth: 600 }}>
        What should IRIS <span style={{ fontStyle: "italic", color: "var(--ink-3)" }}>call you?</span>
      </h1>
      <p style={{ fontSize: 16, color: "var(--ink-3)", marginBottom: 48 }}>Just a first name, or a nickname. Whatever feels honest.</p>

      <input value={name} onChange={(e) => setName(e.target.value)} autoFocus
        placeholder="Your name"
        style={{
          padding: "20px 28px",
          borderRadius: "var(--r-pill)",
          border: "1px solid var(--line-2)",
          background: "var(--bg-card)",
          fontSize: 22,
          fontFamily: "var(--font-display)",
          textAlign: "center",
          outline: "none",
          minWidth: 360,
          boxShadow: "var(--shadow-sm)",
        }} />
    </>
  );
}

function IntentStep({ intent, setIntent }) {
  const intents = [
    { id: "understand", label: "Understand myself better", sub: "Patterns, archetype, depth" },
    { id: "regulate", label: "Regulate hard feelings", sub: "Anxiety, grief, overwhelm" },
    { id: "habit", label: "Build a daily practice", sub: "Journal, breath, check-in" },
    { id: "explore", label: "I'm just exploring", sub: "Show me around" },
  ];
  return (
    <>
      <h1 className="display" style={{ fontSize: 44, fontWeight: 400, letterSpacing: "-0.03em", margin: "0 0 12px", maxWidth: 640 }}>
        What brings you <span style={{ fontStyle: "italic", color: "var(--ink-3)" }}>here?</span>
      </h1>
      <p style={{ fontSize: 16, color: "var(--ink-3)", marginBottom: 40 }}>This shapes how IRIS opens the conversation. You can change it any time.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, maxWidth: 600, width: "100%" }}>
        {intents.map((it) => {
          const active = intent === it.id;
          return (
            <button key={it.id} onClick={() => setIntent(it.id)} style={{
              padding: "20px 22px",
              borderRadius: "var(--r-lg)",
              background: "var(--bg-card)",
              boxShadow: active ? "0 0 0 2px var(--accent), var(--shadow-md)" : "var(--shadow-sm)",
              textAlign: "left",
              transition: "all 200ms var(--ease)",
              transform: active ? "translateY(-2px)" : "translateY(0)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{it.label}</span>
                {active && <IconCheck size={18} color="var(--accent)" />}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{it.sub}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}

window.OnboardingScreen = OnboardingScreen;
