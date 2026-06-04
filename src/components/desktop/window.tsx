"use client";

import { motion } from "framer-motion";
import { useDesktop, type WindowItem } from "@/state/desktop-store";

const windowVariants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 12, scale: 0.99 },
};

type WindowProps = {
  windowItem: WindowItem;
};

export default function Window({ windowItem }: WindowProps) {
  const { state, focusWindow, toggleMinimize } = useDesktop();
  const focusId = `window:${windowItem.id}`;
  const isFocused = state.focusedId === focusId;

  return (
    <motion.section
      className={`flex h-full flex-col overflow-hidden rounded-sm border-2 bg-[#161616] backdrop-blur focus-ring transition-colors duration-150 ${
        isFocused ? "border-white" : "border-[#222222]"
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
      transition={{ duration: 0.25 }}
      layout
    >
      <header className="flex items-center justify-between border-b border-[#222222] bg-[#121212] px-3.5 py-1.5 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#888888] font-bold">[term]</span>
          <span className="text-xs font-semibold text-white">{windowItem.title.toLowerCase()}</span>
          <span className="text-[10px] text-[#888888] font-light">· {windowItem.subtitle.toLowerCase()}</span>
        </div>
        <button
          type="button"
          className="focus-ring rounded-sm border border-[#222222] px-1.5 py-0.5 text-[10px] text-[#888888] hover:text-white hover:bg-[#222222]/50 transition"
          onClick={(e) => {
            e.stopPropagation();
            toggleMinimize(windowItem.id);
          }}
        >
          [min]
        </button>
      </header>
      
      <div className="flex flex-1 flex-col gap-3 px-4 py-3.5 text-xs text-[#888888] font-mono">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">❯</span>
          <span className="text-[#a0a0a0]">{windowItem.command}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {windowItem.content.map((block) => (
            <div
              key={block.title}
              className="rounded-sm border border-[#222222] bg-[#121212] px-3 py-2"
            >
              <div className="text-[9px] uppercase tracking-wider text-white font-bold">
                :: {block.title}
              </div>
              <ul className="mt-1.5 space-y-1 text-xs text-[#a0a0a0]">
                {block.lines.map((line) => (
                  <li key={line} className="flex items-start gap-1">
                    <span className="text-[#444444]">·</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
