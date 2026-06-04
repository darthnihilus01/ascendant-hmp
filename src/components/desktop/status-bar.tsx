"use client";

import { motion } from "framer-motion";
import { useDesktop } from "@/state/desktop-store";
import WorkspaceSwitcher from "@/components/desktop/workspace-switcher";

export default function StatusBar() {
  const { activeWorkspace, state, setFocusId } = useDesktop();
  const isFocused = state.focusedId === "status";

  return (
    <motion.header
      className={`flex items-center justify-between rounded-md border border-mocha-surface1/70 bg-mocha-mantle/70 px-4 py-2 backdrop-blur focus-ring ${
        isFocused ? "shadow-[0_0_18px_var(--desktop-glow)]" : ""
      }`}
      data-focus-id="status"
      tabIndex={0}
      onFocus={() => setFocusId("status")}
      onClick={() => setFocusId("status")}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-center gap-3 text-sm">
        <span className="rounded bg-mocha-surface0 px-2 py-1 text-xs text-mocha-subtext1">
          ASC-26
        </span>
        <span className="text-mocha-text">Ascendant Control</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-mocha-subtext0">
        <span>{activeWorkspace.hint}</span>
        <span className="text-mocha-teal">session: live</span>
      </div>
      <WorkspaceSwitcher />
    </motion.header>
  );
}
