"use client";

import { useEffect, useRef } from "react";

const CHARS = [".", ":", "·", "+", "*", "#", "@", "%"];

const BASE = 0;
const FAR = 1;
const MID = 3;
const CLOSE = 5;
const CENTER = 6;

const CELL_W = 14;
const CELL_H = 20;
const FONT_SIZE = 12;

const MOUSE_RADIUS = 400;

export default function AsciiField({ progress = 1 }: { progress?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const gridRef = useRef<{
    cols: number;
    rows: number;
    chars: Uint8Array;
    nextUpdate: Float64Array;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId = 0;
    let lastTime = 0;

    function buildGrid() {
      const cols = Math.ceil(window.innerWidth / CELL_W) + 1;
      const rows = Math.ceil(window.innerHeight / CELL_H) + 1;
      const len = cols * rows;
      const chars = new Uint8Array(len);
      const nextUpdate = new Float64Array(len);
      const now = performance.now();
      for (let i = 0; i < len; i++) {
        chars[i] = Math.floor(Math.random() * 3);
        nextUpdate[i] = now + Math.random() * 8000;
      }
      gridRef.current = { cols, rows, chars, nextUpdate };
    }

    function resize() {
      const cvs = canvas!;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      cvs.width = w * dpr;
      cvs.height = h * dpr;
      cvs.style.width = `${w}px`;
      cvs.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      buildGrid();
    }

    resize();

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    function onResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    }

    window.addEventListener("resize", onResize);

    function onMouse(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }
    function onLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }

    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave", onLeave);

    function draw(now: number) {
      animId = requestAnimationFrame(draw);
      const grid = gridRef.current;
      if (!grid) return;

      const { cols, rows, chars, nextUpdate } = grid;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Batch similar states
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const x = c * CELL_W;
          const y = r * CELL_H;

          // Random evolution
          if (now >= nextUpdate[i]) {
            const roll = Math.random();
            if (roll < 0.4) {
              // stay
            } else if (roll < 0.7) {
              chars[i] = Math.max(0, chars[i] - 1);
            } else if (roll < 0.9) {
              chars[i] = Math.min(CHARS.length - 1, chars[i] + 1);
            } else {
              chars[i] = Math.floor(Math.random() * (FAR + 1));
            }
            nextUpdate[i] = now + 2000 + Math.random() * 6000;
          }

          // Mouse interaction
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let charIdx = chars[i];
          if (dist < 50) {
            charIdx = CENTER;
          } else if (dist < 150) {
            charIdx = CLOSE;
          } else if (dist < 300) {
            charIdx = MID;
          } else if (dist < MOUSE_RADIUS) {
            charIdx = FAR;
          }

          // Opacity based on distance and random flicker
          const baseOpacity = dist < MOUSE_RADIUS
            ? 0.6 + 0.2 * (1 - dist / MOUSE_RADIUS)
            : 0.4 + Math.random() * 0.15;
          const flicker = 0.85 + Math.sin(now * 0.0008 + i * 1.7) * 0.15;
          const opacity = Math.min(0.8, Math.max(0.4, baseOpacity * flicker)) * progressRef.current;

          ctx.globalAlpha = opacity;
          ctx.fillStyle = "#ffffff";
          ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
          ctx.fillText(CHARS[charIdx], x, y + CELL_H - 4);
        }
      }
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
