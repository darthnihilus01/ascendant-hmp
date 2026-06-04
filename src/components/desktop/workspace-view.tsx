"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useDesktop } from "@/state/desktop-store";
import Window from "@/components/desktop/window";

export default function WorkspaceView() {
  const { activeWorkspace, toggleMinimize } = useDesktop();
  const visibleWindows = activeWorkspace.windows.filter(
    (windowItem) => windowItem.status === "normal"
  );
  const minimizedWindows = activeWorkspace.windows.filter(
    (windowItem) => windowItem.status === "minimized"
  );

  return (
    <section className="flex flex-col gap-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeWorkspace.id}
          className="grid grid-cols-12 gap-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.35 }}
        >
          {visibleWindows.map((windowItem) => (
            <Window key={windowItem.id} windowItem={windowItem} />
          ))}
        </motion.div>
      </AnimatePresence>
      {minimizedWindows.length > 0 ? (
        <div className="flex flex-wrap gap-2 rounded-md border border-mocha-surface1/60 bg-mocha-mantle/70 px-3 py-2 text-xs text-mocha-subtext1">
          <span className="text-mocha-overlay2">minimized</span>
          {minimizedWindows.map((windowItem) => (
            <button
              key={windowItem.id}
              type="button"
              onClick={() => toggleMinimize(windowItem.id)}
              className="focus-ring rounded bg-mocha-surface0/70 px-2 py-1 text-mocha-subtext1 hover:text-mocha-text"
            >
              {windowItem.title}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
