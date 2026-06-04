"use client";

import { motion } from "framer-motion";
import { useDesktop } from "@/state/desktop-store";
import WorkspaceSwitcher from "@/components/desktop/workspace-switcher";

export default function StatusBar() {
  const { activeWorkspace, state, setFocusId } = useDesktop();
  const isFocused = state.focusedId === "status";

  return (
    <motion.header
      className={`flex items-center justify-between rounded-sm border px-4 py-1.5 bg-[#121212]/90 backdrop-blur focus-ring transition-all duration-150 ${
        isFocused ? "border-white" : "border-[#222222]"
      }`}
      data-focus-id="status"
      tabIndex={0}
      onFocus={() => setFocusId("status")}
      onClick={() => setFocusId("status")}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-center gap-3 text-xs font-mono">
        <span className="bg-white text-black px-2 py-0.5 font-bold rounded-sm uppercase tracking-wider">
          sys
        </span>
        <span className="text-white font-semibold">ascendant-hmp</span>
      </div>
      <div className="flex items-center gap-4 text-xs font-mono text-[#888888]">
        <span className="border-r border-[#222222] pr-4">{activeWorkspace.hint.toLowerCase()}</span>
        <span className="text-emerald-500 font-bold">● live</span>
      </div>
      <WorkspaceSwitcher />
    </motion.header>
  );
}
