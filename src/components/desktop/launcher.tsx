"use client";

import { motion } from "framer-motion";
import { useDesktop } from "@/state/desktop-store";

export default function Launcher() {
  const { state, focusables, setFocusId } = useDesktop();
  const isFocused = state.focusedId === "launcher";

  return (
    <motion.section
      className={`flex items-center justify-between rounded-md border border-mocha-surface1/70 bg-mocha-crust/70 px-4 py-3 text-xs focus-ring ${
        isFocused ? "shadow-[0_0_18px_var(--desktop-glow)]" : ""
      }`}
      data-focus-id="launcher"
      tabIndex={0}
      onFocus={() => setFocusId("launcher")}
      onClick={() => setFocusId("launcher")}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex flex-col gap-1">
        <span className="text-mocha-subtext0">launcher</span>
        <span className="text-mocha-text">ascendant://command</span>
      </div>
      <div className="text-mocha-overlay2">focus nodes: {focusables.length}</div>
    </motion.section>
  );
}
