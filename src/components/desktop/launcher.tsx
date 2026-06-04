"use client";

import { motion } from "framer-motion";
import { useDesktop } from "@/state/desktop-store";

export default function Launcher() {
  const { state, focusables, setFocusId } = useDesktop();
  const isFocused = state.focusedId === "launcher";

  return (
    <motion.section
      className={`flex items-center justify-between rounded-sm border-2 bg-[#121212] px-4 py-2.5 text-xs font-mono focus-ring transition-all duration-150 ${
        isFocused ? "border-white" : "border-[#222222]"
      }`}
      data-focus-id="launcher"
      tabIndex={0}
      onFocus={() => setFocusId("launcher")}
      onClick={() => setFocusId("launcher")}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-center gap-3">
        <span className="bg-white text-black font-bold px-1.5 py-0.5 rounded-sm text-[10px] uppercase tracking-wider">
          run
        </span>
        <span className="text-white font-semibold">ascendant://command</span>
        {isFocused && <span className="boot-cursor text-white font-bold">█</span>}
      </div>
      <div className="text-[#888888] text-[10px]">
        [nodes: {focusables.length}]
      </div>
    </motion.section>
  );
}
