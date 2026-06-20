"use client";

import { useEffect, useRef, useState } from "react";

const BRANDING_TEXT = "DPSBE HACKATHON";
const BRANDING_FONT_SIZE = 100;
const BRANDING_LETTER_SPACING = 0.15;
const REVEALED_TEXT = "FROM JULY 17-18";
const MAX_PROGRESS = 0.75;

interface Props {
  onRevealedChange?: (revealed: boolean) => void;
}

function pixelHash(x: number, y: number): number {
  let n = x * 374761393 + y * 668265263;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) & 0x7fffffff) / 0x7fffffff;
}

export default function PixelDisintegration({ onRevealedChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [typedText, setTypedText] = useState("");
  const [eraseCount, setEraseCount] = useState(BRANDING_TEXT.length);
  const stateRef = useRef({
    progress: 0,
    W: 0,
    H: 0,
    thresholds: new Float32Array(0),
    eraseChars: BRANDING_TEXT.length,
    typeChars: 0,
    wasRevealed: false,
  });
  const rafRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current!;
    const canvas = canvasRef.current!;
    const W = window.innerWidth;
    const H = window.innerHeight;

    stateRef.current.W = W;
    stateRef.current.H = H;

    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d")!;

    // Pre-compute per-pixel thresholds
    const totalPixels = W * H;
    const thresholds = new Float32Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
      thresholds[i] = pixelHash(i % W, Math.floor(i / W)) * MAX_PROGRESS;
    }
    stateRef.current.thresholds = thresholds;
    stateRef.current.eraseChars = BRANDING_TEXT.length;
    stateRef.current.typeChars = 0;

    // ── Text transition ──
    function updateText(p: number) {
      const eraseStart = 0.05;
      const eraseEnd = 0.25;
      const typeStart = 0.25;
      const typeEnd = 0.5;

      let eraseChars: number;
      let typeChars: number;

      if (p < eraseStart) {
        eraseChars = BRANDING_TEXT.length;
        typeChars = 0;
      } else if (p >= typeEnd) {
        eraseChars = 0;
        typeChars = REVEALED_TEXT.length;
      } else if (p >= eraseStart && p < eraseEnd) {
        const t = (p - eraseStart) / (eraseEnd - eraseStart);
        eraseChars = Math.ceil(BRANDING_TEXT.length * (1 - t));
        typeChars = 0;
      } else {
        eraseChars = 0;
        const t = (p - typeStart) / (typeEnd - typeStart);
        typeChars = Math.floor(REVEALED_TEXT.length * t);
      }

      stateRef.current.eraseChars = eraseChars;
      stateRef.current.typeChars = typeChars;
      setEraseCount(eraseChars);
      setTypedText(REVEALED_TEXT.slice(0, typeChars));
    }

    // ── Scroll → progress ──
    let drawPending = false;

    function scheduleDraw() {
      if (drawPending) return;
      drawPending = true;
      rafRef.current = requestAnimationFrame(() => {
        drawPending = false;
        render();
      });
    }

    function onScroll() {
      const rect = section.getBoundingClientRect();
      const rawP = -rect.top / rect.height;
      const p = Math.max(0, Math.min(MAX_PROGRESS, rawP));
      stateRef.current.progress = p;

      const nowRevealed = p >= MAX_PROGRESS;
      if (nowRevealed !== stateRef.current.wasRevealed) {
        stateRef.current.wasRevealed = nowRevealed;
        onRevealedChange?.(nowRevealed);
      }

      updateText(p);
      scheduleDraw();
    }

    // ── Render ──
    function render() {
      const { progress: p, W: w, H: h, thresholds: th, eraseChars } = stateRef.current;

      // Redraw canvas: white bg + remaining black DPSBE HACKATHON chars
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, w, h);

      // Black text = the remaining portion of DPSBE HACKATHON being erased
      if (eraseChars > 0) {
        const blackText = BRANDING_TEXT.slice(0, eraseChars);
        ctx.fillStyle = "#000000";
        ctx.textBaseline = "bottom";
        const fontSize = BRANDING_FONT_SIZE;
        ctx.font = `600 ${fontSize}px "JetBrains Mono", "Courier New", monospace`;
        const x = 32;
        const y = h - 32;
        const spacingPx = BRANDING_LETTER_SPACING * fontSize;
        let cx = x;
        for (let i = 0; i < blackText.length; i++) {
          ctx.fillText(blackText[i], cx, y);
          cx += ctx.measureText(blackText[i]).width + spacingPx;
        }
      }

      // Apply dissolve: turn pixels transparent where threshold < p
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      for (let i = 0; i < th.length; i++) {
        if (p >= th[i]) {
          data[i * 4 + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: "400vh" }}
    >
      <div
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: "100vh" }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center select-none"
          style={{ zIndex: 1 }}
        >
          <div className="flex flex-col items-center pt-[6vh]">
            <img src="/logo.svg" alt="Ascendant logo" className="w-[clamp(60px,10vw,140px)] h-auto mb-6" />
            <div
              className="text-[clamp(26px,5.2vw,55px)] font-bold tracking-[0.3em] text-white uppercase"
              style={{ fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', 'Courier New', monospace" }}
            >
              ASCENDANT 2026
            </div>
          </div>

          {/* White text being typed in — revealed through canvas dissolve */}
          {typedText && (
            <div
              className="absolute select-none"
              style={{
                bottom: 32,
                left: 32,
                fontSize: BRANDING_FONT_SIZE,
                letterSpacing: `${BRANDING_LETTER_SPACING}em`,
                color: "#ffffff",
                textTransform: "uppercase",
                fontWeight: 600,
                fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', 'Courier New', monospace",
              }}
            >
              {typedText}
            </div>
          )}
        </div>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 2 }}
        />
      </div>
    </section>
  );
}
