"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  text?: string;
}

const WORDS = ["Say", "wallahi", "bro"];

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let rafId: number;
    const particles: Particle[] = [];
    const mouse = { x: -200, y: -200, lx: -200, ly: -200 };
    let wordIdx = 0;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function onMove(e: MouseEvent) {
      mouse.lx = mouse.x;
      mouse.ly = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    window.addEventListener("mousemove", onMove);

    function getMode() {
      return document.body.dataset.cursorMode || "text";
    }

    function draw() {
      const W = canvas!.width;
      const H = canvas!.height;
      const mode = getMode();

      ctx.clearRect(0, 0, W, H);

      const dx = mouse.x - mouse.lx;
      const dy = mouse.y - mouse.ly;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (mode === "text") {
        if (dist > 8) {
          const word = WORDS[wordIdx % WORDS.length];
          wordIdx++;
          particles.push({
            x: mouse.x + (Math.random() - 0.5) * 20,
            y: mouse.y + (Math.random() - 0.5) * 20,
            vx: 0,
            vy: 0,
            life: 0,
            maxLife: 50 + Math.random() * 30,
            size: 14 + Math.random() * 8,
            text: word,
          });
        }
      } else {
        if (dist > 2) {
          const count = Math.min(3, Math.floor(dist / 4));
          for (let i = 0; i < count; i++) {
            const t = i / Math.max(count, 1);
            const px = mouse.lx + dx * t + (Math.random() - 0.5) * 8;
            const py = mouse.ly + dy * t + (Math.random() - 0.5) * 8;
            particles.push({
              x: px,
              y: py,
              vx: 0,
              vy: 0,
              life: 0,
              maxLife: 70 + Math.random() * 50,
              size: 5 + Math.random() * 12,
            });
          }
        }
      }

      ctx.save();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        if (p.life > p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const progress = p.life / p.maxLife;

        if (mode === "text") {
          p.y -= 0.6;
          p.x += (Math.random() - 0.5) * 0.4;

          const alpha = (1 - progress) * (1 - progress);
          const size = p.size * (1 + progress * 0.5);

          ctx.globalAlpha = alpha;
          ctx.font = `bold ${size}px 'JetBrains Mono', monospace`;
          ctx.fillStyle = "#39ff14";
          ctx.shadowColor = "#39ff14";
          ctx.shadowBlur = 10;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.text!, p.x, p.y);
        } else {
          p.vx += (mouse.x - p.x) * 0.0012;
          p.vy += (mouse.y - p.y) * 0.0012 - 0.015;
          p.vx *= 0.97;
          p.vy *= 0.97;
          p.x += p.vx;
          p.y += p.vy;

          const alpha = (1 - progress) * (1 - progress) * 0.3;
          const radius = p.size * (1 + progress * 1.2);

          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
          grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 1.5})`);
          grad.addColorStop(0.4, `rgba(220, 220, 230, ${alpha})`);
          grad.addColorStop(1, `rgba(200, 200, 210, 0)`);
          ctx.fillStyle = grad;

          ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
          ctx.shadowBlur = 8;
          ctx.fill();
        }
      }

      if (mode !== "text") {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const ddx = a.x - b.x;
            const ddy = a.y - b.y;
            const d = Math.sqrt(ddx * ddx + ddy * ddy);
            if (d < 120) {
              const alpha = (1 - d / 120) * 0.04;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      ctx.restore();

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}
