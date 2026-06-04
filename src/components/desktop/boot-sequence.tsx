"use client";

import { useEffect, useRef, useState } from "react";

type BootSequenceProps = {
  onComplete: () => void;
};

// Phase state machine
type Phase =
  | "cursor"   // just a blinking cursor
  | "typing"   // typing the command
  | "booting"  // boot log lines appearing one by one
  | "ready"    // "System ready." shown
  | "fading"   // logs fading out
  | "title"    // ASCENDANT 2026 fading in
  | "prompt";  // Press ENTER pulsing

const COMMAND = "ascendant@boot:~$ systemctl start ascendant.target";
const CHAR_DELAY_MS = 32;

const BOOT_LOG = [
  "[ OK ] Loading kernel modules",
  "[ OK ] Mounting /ascendant",
  "[ OK ] Starting innovation.service",
  "[ OK ] Initializing wayland compositor",
  "[ OK ] Loading hackathon assets",
  "[ OK ] Preparing workspaces",
  "[ OK ] Starting ascendant.target",
];

// Random delay between 500–900ms for each boot line
function lineDelay() {
  return 500 + Math.floor(Math.random() * 400);
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState<Phase>("cursor");
  const [typedChars, setTypedChars] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [showReady, setShowReady] = useState(false);
  const [logOpacity, setLogOpacity] = useState(1);
  const [titleOpacity, setTitleOpacity] = useState(0);
  const [promptOpacity, setPromptOpacity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let t = 0;

    // 0.5s — cursor blinks, then start typing
    t += 500;
    timers.push(setTimeout(() => setPhase("typing"), t));

    // Type COMMAND char by char
    for (let i = 1; i <= COMMAND.length; i++) {
      t += CHAR_DELAY_MS;
      const charCount = i;
      timers.push(setTimeout(() => setTypedChars(charCount), t));
    }

    // Pause after command before boot lines
    t += 300;

    // Boot log lines
    timers.push(setTimeout(() => setPhase("booting"), t));
    for (let i = 0; i < BOOT_LOG.length; i++) {
      t += lineDelay();
      const lineCount = i + 1;
      timers.push(setTimeout(() => setVisibleLines(lineCount), t));
    }

    // "System ready."
    t += 500;
    timers.push(setTimeout(() => {
      setShowReady(true);
      setPhase("ready");
    }, t));

    // 1.5s pause
    t += 1500;

    // Fade out logs
    timers.push(setTimeout(() => {
      setPhase("fading");
      setLogOpacity(0);
    }, t));

    // Fade in title (after fade-out transition completes ~600ms)
    t += 700;
    timers.push(setTimeout(() => {
      setPhase("title");
      setTitleOpacity(1);
    }, t));

    // Fade in prompt
    t += 900;
    timers.push(setTimeout(() => {
      setPhase("prompt");
      setPromptOpacity(1);
      containerRef.current?.focus();
    }, t));

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (phase === "prompt" && e.key === "Enter") {
      onComplete();
    }
  };

  const showCursor = phase === "cursor" || phase === "typing";
  const typedCommand = COMMAND.slice(0, typedChars);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 bg-black flex items-center justify-center outline-none"
      style={{ fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', 'Courier New', monospace" }}
      aria-label="Ascendant boot sequence"
    >
      {/* Boot log layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: logOpacity,
          transition: "opacity 0.6s ease",
          pointerEvents: logOpacity === 0 ? "none" : "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 560, padding: "0 2rem" }}>
          {/* Command line */}
          {(phase === "cursor" || phase === "typing" || phase === "booting" || phase === "ready") && (
            <div style={{ fontSize: 13, color: "#ffffff", marginBottom: 20, display: "flex", alignItems: "center" }}>
              <span>{typedCommand}</span>
              {showCursor && (
                <span className="boot-cursor" style={{ color: "#ffffff", marginLeft: 1 }}>█</span>
              )}
            </div>
          )}

          {/* Boot log lines */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {BOOT_LOG.slice(0, visibleLines).map((line, i) => {
              const isOk = line.startsWith("[ OK ]");
              const rest = isOk ? line.slice(6) : line;
              return (
                <div
                  key={i}
                  style={{
                    fontSize: 13,
                    color: "#ffffff",
                    animation: "fadeInLine 0.12s ease forwards",
                  }}
                >
                  {isOk && (
                    <span style={{ color: "#888888" }}>
                      {"[ "}
                      <span style={{ color: "#4ade80", fontWeight: "bold" }}>OK</span>
                      {" ]"}
                    </span>
                  )}
                  <span style={{ color: "#aaaaaa" }}>{rest}</span>
                </div>
              );
            })}
          </div>

          {/* System ready */}
          {showReady && (
            <div
              style={{
                marginTop: 20,
                fontSize: 13,
                color: "#ffffff",
                animation: "fadeInLine 0.2s ease forwards",
              }}
            >
              System ready.
            </div>
          )}
        </div>
      </div>

      {/* Title layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: titleOpacity,
          transition: "opacity 0.8s ease",
          pointerEvents: titleOpacity === 0 ? "none" : "auto",
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.3em",
            color: "#ffffff",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          ASCENDANT 2026
        </div>
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.2em",
            color: "#555555",
            textTransform: "uppercase",
            marginBottom: 48,
          }}
        >
          The Future Boots Here.
        </div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "#444444",
            textTransform: "uppercase",
            opacity: promptOpacity,
            transition: "opacity 0.6s ease",
            animation: promptOpacity === 1 ? "pulsePrompt 2.5s ease-in-out infinite" : "none",
          }}
        >
          Press ENTER to continue
        </div>
      </div>

      <style>{`
        @keyframes fadeInLine {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulsePrompt {
          0%, 100% { opacity: 0.25; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
