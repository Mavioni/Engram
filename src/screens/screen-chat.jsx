// Chat with IRIS — premium edition

const { useState, useEffect, useRef, useMemo } = React;

const QUICK_PROMPTS = [
  { label: "I'm feeling stuck", icon: "—" },
  { label: "Help me unwind", icon: "◐" },
  { label: "Reflect on my day", icon: "✦" },
  { label: "I had a hard moment", icon: "○" },
  { label: "Set an intention", icon: "▲" },
];

const SUGGESTED_REPLIES_INITIAL = ["A little anxious", "Calm but tired", "Restless", "I don't know yet"];
const SUGGESTED_REPLIES_FOLLOWUP = ["Tell me more", "Suggest a practice", "Just listen", "Help me journal"];

function ChatScreen({ onNavigate }) {
  // Read live display name from the user store (Zustand). Falls back to "friend"
  // until the operator completes onboarding.
  const displayName = (window.useUserStore && window.useUserStore((s) => s.displayName)) || null;
  const greetingName = displayName ?? "friend";

  const seedMessages = useMemo(() => ([
    { role: "iris", text: `Hi ${greetingName}. I'm here. Before we begin — take one slow breath with me.`, showBreath: true },
    { role: "iris", text: "How are you arriving today? You can say it in a word, or a paragraph — whichever fits.", chips: SUGGESTED_REPLIES_INITIAL },
  ]), [greetingName]);

  const [messages, setMessages] = useState(seedMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const send = async (text) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);

    // TODO(orochimaru): wire to /api/iris streaming with prompt-cached system + thread prefix.
    try {
      const res = await fetch("/api/iris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (res.ok) {
        const payload = await res.json();
        setTyping(false);
        setMessages((m) => [...m, { role: "iris", text: payload.text, chips: payload.chips }]);
        return;
      }
    } catch {
      /* fall through to MVP-1 placeholder */
    }
    setTyping(false);
    setMessages((m) => [...m, {
      role: "iris",
      text: "I'm here. (IRIS will respond once you finish setup.)",
      chips: SUGGESTED_REPLIES_FOLLOWUP,
    }]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>
      {/* Ambient background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 60% 40% at 50% 0%, color-mix(in oklab, var(--accent) 10%, transparent), transparent 70%)",
      }} />

      {/* Glass header */}
      <header style={{
        padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "color-mix(in oklab, var(--bg) 70%, transparent)",
        backdropFilter: "blur(20px) saturate(140%)",
        borderBottom: "1px solid color-mix(in oklab, var(--ink) 6%, transparent)",
        zIndex: 5,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <IrisAvatar size={42} />
            <span style={{
              position: "absolute", bottom: 0, right: 0,
              width: 11, height: 11, borderRadius: "50%",
              background: "var(--accent)",
              border: "2px solid var(--bg)",
              boxShadow: "0 0 12px var(--accent)",
            }} className="pulse-soft" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="display" style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.01em" }}>IRIS</span>
              <span className="label" style={{ color: "var(--accent)" }}>Listening</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>Your reflection companion</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => onNavigate("journal")} style={ghostBtnStyle()}>Journal this</button>
          <button onClick={() => onNavigate("meditation")} style={ghostBtnStyle()}>End with practice</button>
          <div style={{ width: 1, height: 22, background: "var(--line)", margin: "0 4px" }} />
          <button style={iconBtnStyle()}><IconPlus size={16} /></button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="scrollbar-hide" style={{
        flex: 1, overflowY: "auto",
        padding: "40px 32px 220px",
        display: "flex", flexDirection: "column", gap: 22,
        position: "relative", zIndex: 1,
      }}>
        <SessionHeader />
        {messages.map((m, i) => <Message key={i} msg={m} onChip={send} />)}
        {typing && <TypingIndicator />}
      </div>

      {/* Floating composer */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "16px 32px 28px",
        background: "linear-gradient(to top, var(--bg) 65%, color-mix(in oklab, var(--bg) 80%, transparent) 90%, transparent)",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }} className="scrollbar-hide">
          {QUICK_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => send(p.label)} style={{
              padding: "9px 16px",
              borderRadius: "var(--r-pill)",
              fontSize: 13, fontWeight: 500,
              background: "var(--bg-card)",
              color: "var(--ink-2)",
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow-sm)",
              display: "inline-flex", alignItems: "center", gap: 8,
              whiteSpace: "nowrap",
              transition: "all 180ms var(--ease)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.borderColor = "var(--accent-soft)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "var(--line)"; }}
            >
              <span style={{ color: "var(--accent)", fontSize: 11 }}>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "var(--bg-card)",
          borderRadius: 28,
          padding: "10px 10px 10px 24px",
          boxShadow: "0 12px 40px color-mix(in oklab, var(--ink) 8%, transparent), 0 0 0 1px var(--line)",
          transition: "box-shadow 200ms var(--ease)",
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Tell IRIS what's on your mind…"
            style={{
              flex: 1, border: "none", outline: "none", background: "transparent",
              fontSize: 15, padding: "12px 0",
              fontFamily: "var(--font-sans)",
            }}
          />
          <button style={{ ...iconBtnStyle(), width: 38, height: 38 }} title="Voice"><IconMic size={17} /></button>
          <button onClick={() => send(input)} disabled={!input.trim()} style={{
            width: 44, height: 44, borderRadius: "50%",
            background: input.trim() ? "var(--ink)" : "var(--bg-soft)",
            color: input.trim() ? "var(--bg)" : "var(--ink-4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 180ms var(--ease)",
            cursor: input.trim() ? "pointer" : "default",
          }}>
            <IconSend size={17} />
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 10, fontSize: 11, color: "var(--ink-4)" }}>
          End-to-end encrypted · IRIS won't remember unless you ask her to
        </div>
      </div>
    </div>
  );
}

function SessionHeader() {
  return (
    <div style={{ textAlign: "center", marginBottom: 12 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px", borderRadius: 999, background: "var(--bg-card)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }} className="pulse-soft" />
        <span className="label" style={{ letterSpacing: "0.1em" }}>Session · {formatSessionStamp(new Date())}</span>
      </div>
      <div className="display-italic" style={{ fontSize: 19, color: "var(--ink-3)", marginTop: 18, maxWidth: 540, marginLeft: "auto", marginRight: "auto", lineHeight: 1.45 }}>
        "The cure for anything is salt water — sweat, tears, or the sea."
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 6, letterSpacing: "0.06em" }}>— ISAK DINESEN</div>
    </div>
  );
}

function Message({ msg, onChip }) {
  const isUser = msg.role === "user";
  return (
    <div className="slide-up" style={{
      display: "flex", flexDirection: isUser ? "row-reverse" : "row",
      gap: 12, maxWidth: "82%",
      alignSelf: isUser ? "flex-end" : "flex-start",
    }}>
      {!isUser && <IrisAvatar size={32} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", gap: 10 }}>
        <div style={{
          background: isUser ? "var(--ink)" : "var(--bg-card)",
          color: isUser ? "var(--bg)" : "var(--ink)",
          padding: "16px 20px",
          borderRadius: isUser ? "22px 22px 6px 22px" : "22px 22px 22px 6px",
          fontSize: isUser ? 15 : 16,
          lineHeight: 1.55,
          boxShadow: isUser ? "0 4px 16px color-mix(in oklab, var(--ink) 18%, transparent)" : "var(--shadow-sm)",
          fontFamily: !isUser ? "var(--font-display)" : "var(--font-sans)",
          fontWeight: !isUser ? 400 : 500,
          letterSpacing: !isUser ? "-0.005em" : "-0.005em",
          maxWidth: 540,
        }}>
          {msg.text}
        </div>
        {msg.showBreath && <BreathDot />}
        {msg.chips && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
            {msg.chips.map((c, i) => (
              <button key={i} onClick={() => onChip(c)} style={{
                padding: "9px 16px",
                borderRadius: "var(--r-pill)",
                fontSize: 13, fontWeight: 500,
                background: "transparent",
                color: "var(--accent)",
                border: "1px solid var(--accent-soft)",
                transition: "all 180ms var(--ease)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "var(--accent-soft)"; }}>
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BreathDot() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 12,
      padding: "10px 16px",
      borderRadius: "var(--r-pill)",
      background: "color-mix(in oklab, var(--accent) 10%, var(--bg-card))",
      border: "1px solid var(--accent-soft)",
    }}>
      <div className="breathe" style={{
        width: 14, height: 14, borderRadius: "50%",
        background: "var(--accent)",
        boxShadow: "0 0 16px var(--accent)",
      }} />
      <span style={{ fontSize: 12, color: "var(--ink-2)", fontFamily: "var(--font-display)", fontStyle: "italic" }}>Breathe with me — in for 4, out for 6</span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <IrisAvatar size={32} />
      <div style={{
        padding: "16px 18px",
        background: "var(--bg-card)",
        borderRadius: "22px 22px 22px 6px",
        boxShadow: "var(--shadow-sm)",
        display: "flex", gap: 5,
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--accent)",
            animation: `bounce 1.4s infinite ${i * 0.15}s`,
          }} />
        ))}
        <style>{`@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4 } 40% { transform: translateY(-5px); opacity: 1 } }`}</style>
      </div>
    </div>
  );
}

function formatSessionStamp(date) {
  const weekday = date.toLocaleDateString(undefined, { weekday: "long" });
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).toLowerCase();
  return `${weekday} ${time}`;
}

function ghostBtnStyle() {
  return {
    padding: "8px 14px", borderRadius: "var(--r-pill)",
    fontSize: 13, fontWeight: 500,
    background: "transparent", color: "var(--ink-2)",
    border: "1px solid var(--line)",
    transition: "all 150ms var(--ease)",
  };
}
function iconBtnStyle() {
  return {
    width: 36, height: 36, borderRadius: "50%",
    background: "var(--bg-soft)", color: "var(--ink-2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 150ms var(--ease)",
  };
}

window.ChatScreen = ChatScreen;
