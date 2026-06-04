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
      className="self-end rounded-md border border-mocha-surface1/60 bg-mocha-mantle/70 px-3 py-2 text-[11px] text-mocha-subtext0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {hints.join(" · ")}
    </motion.aside>
  );
}
