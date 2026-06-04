"use client";

import { motion } from "framer-motion";

const hints = [
  "alt + 1..3 workspace",
  "alt + left/right focus",
  "alt + space launcher",
  "alt + m minimize",
  "esc reset focus",
];

export default function KeyboardHints() {
  return (
    <motion.aside
      className="self-end rounded-sm border border-[#222222] bg-[#121212] px-3 py-1 text-[10px] font-mono text-[#888888]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {hints.join(" · ")}
    </motion.aside>
  );
}
