"use client";

import { motion } from "framer-motion";
import { useDesktop, type WindowItem } from "@/state/desktop-store";

const accentClasses: Record<string, string> = {
  "mocha-lavender": "bg-mocha-lavender",
  "mocha-blue": "bg-mocha-blue",
  "mocha-teal": "bg-mocha-teal",
  "mocha-peach": "bg-mocha-peach",
  "mocha-green": "bg-mocha-green",
  "mocha-yellow": "bg-mocha-yellow",
  "mocha-sapphire": "bg-mocha-sapphire",
  "mocha-pink": "bg-mocha-pink",
  "mocha-mauve": "bg-mocha-mauve",
  "mocha-red": "bg-mocha-red",
};

const windowVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.98 },
};

type WindowProps = {
  windowItem: WindowItem;
};

export default function Window({ windowItem }: WindowProps) {
  const { state, focusWindow, toggleMinimize } = useDesktop();
  const focusId = `window:${windowItem.id}`;
  const isFocused = state.focusedId === focusId;
  const accentClass = accentClasses[windowItem.accent] ?? "bg-mocha-lavender";

  return (
    <motion.section
      className={`flex h-full flex-col overflow-hidden rounded-lg border border-mocha-surface1/60 bg-mocha-mantle/80 shadow-[0_12px_32px_var(--desktop-shadow)] backdrop-blur focus-ring ${
        isFocused ? "shadow-[0_0_24px_var(--desktop-glow)]" : ""
      }`}
      style={{
        gridColumn: `span ${windowItem.layout.colSpan} / span ${
          windowItem.layout.colSpan
        }`,
        gridRow: `span ${windowItem.layout.rowSpan} / span ${
          windowItem.layout.rowSpan
        }`,
      }}
      data-focus-id={focusId}
      tabIndex={0}
      onFocus={() => focusWindow(windowItem.id)}
      onClick={() => focusWindow(windowItem.id)}
      variants={windowVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35 }}
      layout
    >
      <header className="flex items-center justify-between border-b border-mocha-surface1/60 bg-mocha-crust/70 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-mocha-red" />
            <span className="h-2.5 w-2.5 rounded-full bg-mocha-yellow" />
            <span className="h-2.5 w-2.5 rounded-full bg-mocha-green" />
          </div>
          <div>
            <div className="text-sm text-mocha-text">{windowItem.title}</div>
            <div className="text-xs text-mocha-subtext0">{windowItem.subtitle}</div>
          </div>
        </div>
        <button
          type="button"
          className="focus-ring rounded border border-mocha-surface1/70 px-2 py-1 text-xs text-mocha-subtext1 hover:text-mocha-text"
          onClick={() => toggleMinimize(windowItem.id)}
        >
          {windowItem.status === "normal" ? "minimize" : "restore"}
        </button>
      </header>
      <div className="flex flex-1 flex-col gap-4 px-4 py-4 text-xs text-mocha-subtext1">
        <div className="flex items-center gap-2 text-mocha-overlay2">
          <span className={`h-1.5 w-1.5 rounded-full ${accentClass}`} />
          <span>{windowItem.command}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {windowItem.content.map((block) => (
            <div
              key={block.title}
              className="rounded border border-mocha-surface1/60 bg-mocha-surface0/60 px-3 py-2"
            >
              <div className="text-[10px] uppercase tracking-widest text-mocha-overlay1">
                {block.title}
              </div>
              <ul className="mt-2 space-y-1 text-xs text-mocha-text">
                {block.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
