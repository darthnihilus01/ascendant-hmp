"use client";

import { useEffect, useRef, useState } from "react";

const BRUSH_RADIUS = 163;
const BRANDING_TEXT = "DPSBE HACKATHON";
const BRANDING_FONT_SIZE = 100;
const BRANDING_LETTER_SPACING = 0.15;

const CANVAS_KEY = "ascendant-canvas";

export default function CursorPaintReveal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [typedText, setTypedText] = useState("");
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const revealedRef = useRef(false);
  const progressCheckThrottleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const cvs = canvas;
    const dpr = window.devicePixelRatio || 1;

    function drawBrandingText(w: number, h: number) {
      const fontSize = BRANDING_FONT_SIZE;
      const font = `600 ${fontSize}px "JetBrains Mono", "Courier New", monospace`;
      ctx.font = font;
      ctx.fillStyle = "#000000";
      ctx.textBaseline = "bottom";
      const x = 32;
      const y = h - 32;
      const spacingPx = BRANDING_LETTER_SPACING * fontSize;
      let cx = x;
      for (let i = 0; i < BRANDING_TEXT.length; i++) {
        ctx.fillText(BRANDING_TEXT[i], cx, y);
        cx += ctx.measureText(BRANDING_TEXT[i]).width + spacingPx;
      }
    }

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      cvs.width = w * dpr;
      cvs.height = h * dpr;
      cvs.style.width = `${w}px`;
      cvs.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, w, h);
      drawBrandingText(w, h);
    }

    // Restore saved canvas or start fresh
    const saved = sessionStorage.getItem(CANVAS_KEY);
    if (saved) {
      const img = new Image();
      img.onload = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        cvs.width = w * dpr;
        cvs.height = h * dpr;
        cvs.style.width = `${w}px`;
        cvs.style.height = `${h}px`;
        ctx.scale(dpr, dpr);
        ctx.drawImage(img, 0, 0, w, h);
        ctx.globalCompositeOperation = "source-atop";
        drawBrandingText(w, h);
        ctx.globalCompositeOperation = "destination-out";
      };
      img.src = saved;
    } else {
      resize();
    }

    lastRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    function drawBrush(x: number, y: number) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();
    }

    function interpolate(x1: number, y1: number, x2: number, y2: number) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.ceil(dist / 3));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        drawBrush(x1 + dx * t, y1 + dy * t);
      }
    }

    function checkProgress(): number {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const rw = 440;
      const rh = 180;
      const rx = Math.floor((W - rw) / 2);
      const ry = Math.floor((H - rh) / 2);
      const s = dpr;
      const imgData = ctx.getImageData(rx * s, ry * s, rw * s, rh * s);
      const px = imgData.data;
      let transparent = 0;
      const total = px.length / 4;
      for (let i = 3; i < px.length; i += 4) {
        if (px[i] < 128) transparent++;
      }
      return transparent / total;
    }

    function tryMarkRevealed() {
      if (revealedRef.current) return;
      const now = performance.now();
      if (now - progressCheckThrottleRef.current < 200) return;
      progressCheckThrottleRef.current = now;
      const p = checkProgress();
      if (p > 0.6) {
        revealedRef.current = true;
      }
    }

    function onMove(e: MouseEvent) {
      const cur = { x: e.clientX, y: e.clientY };
      if (lastRef.current) {
        interpolate(lastRef.current.x, lastRef.current.y, cur.x, cur.y);
      } else {
        drawBrush(cur.x, cur.y);
      }
      lastRef.current = cur;
      tryMarkRevealed();
    }

    function onTouchMove(e: TouchEvent) {
      const touch = e.touches[0];
      if (!touch) return;
      const cur = { x: touch.clientX, y: touch.clientY };
      if (lastRef.current) {
        interpolate(lastRef.current.x, lastRef.current.y, cur.x, cur.y);
      } else {
        drawBrush(cur.x, cur.y);
      }
      lastRef.current = cur;
      tryMarkRevealed();
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    function onResize() {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = cvs.width;
      tempCanvas.height = cvs.height;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.drawImage(cvs, 0, 0);

      const w = window.innerWidth;
      const h = window.innerHeight;
      cvs.width = w * dpr;
      cvs.height = h * dpr;
      cvs.style.width = `${w}px`;
      cvs.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      ctx.drawImage(tempCanvas, 0, 0);
      // Redraw text crisp, only on non-transparent areas so brush holes stay clear
      ctx.globalCompositeOperation = "source-atop";
      drawBrandingText(w, h);
      ctx.globalCompositeOperation = "destination-out";
    }

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
      sessionStorage.setItem(CANVAS_KEY, cvs.toDataURL());
    };
  }, []);

  useEffect(() => {
    const fullText = "\"Anakin, You were the chosen one! It was said that you would destroy the Sith, not join them! Bring balance to the Force, not leave it in darkness\"";
    let i = 0;
    let paused = false;
    const timer = setInterval(() => {
      if (paused) return;
      i++;
      if (i > fullText.length) {
        paused = true;
        setTimeout(() => {
          i = 0;
          setTypedText("");
          paused = false;
        }, 6000);
        return;
      }
      setTypedText(fullText.slice(0, i));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen outline-none overflow-hidden"
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
        {/* White text behind canvas — revealed where brush erases the black ink */}
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
          {BRANDING_TEXT}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 2 }}
      />

      <div
        className="fixed top-6 right-6 max-w-[260px] z-30 pointer-events-none text-right"
        style={{ fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', 'Courier New', monospace" }}
      >
        <span className="text-[10px] leading-relaxed text-white/40">
          {typedText}
          <span className="animate-pulse">▌</span>
        </span>
      </div>
    </div>
  );
}
