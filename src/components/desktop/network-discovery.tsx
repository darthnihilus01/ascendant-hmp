"use client";

import { useEffect, useRef, useState } from "react";

type NetworkDiscoveryProps = {
  onComplete: () => void;
};

interface NodeData {
  x: number;
  y: number;
  r: number;
  appearAt: number;
  purple: boolean;
}

interface ConnectionData {
  fromIdx: number;
  toIdx: number;
  startAt: number;
  duration: number;
}

export default function NetworkDiscovery({ onComplete }: NetworkDiscoveryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // ── Nodes ────────────────────────────────────────────────────────────────
    const nodeCount = 80 + Math.floor(Math.random() * 70); // 80–150
    const nodes: NodeData[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() < 0.25 ? 2.5 : Math.random() < 0.5 ? 2 : 1.5,
        appearAt: Math.random() * 1100,   // all nodes visible by ~1.1s
        purple: Math.random() < 0.06,     // ~6% get a subtle purple tint
      });
    }

    // ── Connections ───────────────────────────────────────────────────────────
    // 80–140 total connections. Appear between 700ms–3200ms.
    // We bias the distribution toward the later window so growth "accelerates".
    const connectionCount = 80 + Math.floor(Math.random() * 60);
    const connections: ConnectionData[] = [];

    for (let i = 0; i < connectionCount; i++) {
      let fromIdx = Math.floor(Math.random() * nodeCount);
      let toIdx   = Math.floor(Math.random() * nodeCount);
      while (toIdx === fromIdx) toIdx = Math.floor(Math.random() * nodeCount);

      // Power-bias: sqrt(r) maps [0,1] → more values near 1 → more late connections
      const r = Math.random();
      const startAt = 700 + Math.pow(r, 0.45) * 2500; // 700ms → 3200ms, accelerating

      connections.push({
        fromIdx,
        toIdx,
        startAt,
        duration: 120 + Math.random() * 380, // 120–500ms draw time per line
      });
    }

    // ── Animation loop ────────────────────────────────────────────────────────
    let startTime: number | null = null;
    let rafId: number;
    let labelShown    = false;
    let completeCalled = false;

    const TOTAL_MS    = 7000;  // when onComplete fires
    const LABEL_AT_MS = 6000;  // "NETWORK ONLINE" appears here

    function draw(ts: number) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;

      // Clear
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      // ── Draw connections (under nodes) ──
      for (const conn of connections) {
        if (elapsed < conn.startAt) continue;

        const A = nodes[conn.fromIdx];
        const B = nodes[conn.toIdx];

        // Don't draw if either node hasn't appeared yet
        if (elapsed < A.appearAt || elapsed < B.appearAt) continue;

        const rawProgress = Math.min(1, (elapsed - conn.startAt) / conn.duration);
        const easeProgress = 1 - Math.pow(1 - rawProgress, 3);

        const ex = A.x + (B.x - A.x) * easeProgress;
        const ey = A.y + (B.y - A.y) * easeProgress;

        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1.2;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // ── Draw nodes (on top) ──
      for (const node of nodes) {
        if (elapsed < node.appearAt) continue;

        // Fade in over 250ms
        const alpha = Math.min(1, (elapsed - node.appearAt) / 250);

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);

        if (node.purple) {
          ctx.fillStyle = `rgba(160, 120, 210, ${alpha * 0.8})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.88})`;
        }
        ctx.fill();
      }

      // ── Milestones ──
      if (elapsed >= LABEL_AT_MS && !labelShown) {
        labelShown = true;
        setShowLabel(true);
      }

      if (elapsed >= TOTAL_MS && !completeCalled) {
        completeCalled = true;
        onComplete();
        return;
      }

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black">
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, display: "block" }}
      />

      {/* "NETWORK ONLINE" label */}
      {showLabel && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', 'Courier New', monospace",
              fontSize: 13,
              letterSpacing: "0.4em",
              color: "#ffffff",
              fontWeight: 700,
              textTransform: "uppercase",
              opacity: 0,
              animation: "netLabelIn 0.6s ease forwards",
            }}
          >
            NETWORK ONLINE
          </span>
        </div>
      )}

      <style>{`
        @keyframes netLabelIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
