"use client";

import { useKeyboardNavigation } from "@/state/desktop-store";
import KeyboardHints from "@/components/desktop/keyboard-hints";
import Launcher from "@/components/desktop/launcher";
import StatusBar from "@/components/desktop/status-bar";
import WorkspaceView from "@/components/desktop/workspace-view";

export default function DesktopShell() {
  const keyboard = useKeyboardNavigation();

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-mocha-base text-mocha-text">
      <div className="absolute inset-0 desktop-grid opacity-35" />
      <div className="absolute inset-0 noise-overlay" />
      <div className="absolute inset-0 scanlines opacity-40" />
      <div
        className="relative flex min-h-screen flex-col gap-4 px-6 py-4 focus-ring outline-none"
        tabIndex={0}
        onKeyDown={keyboard.onKeyDown}
        aria-label="Ascendant desktop"
        role="application"
        data-focus-id="root"
      >
        <StatusBar />
        <main className="flex-1">
          <WorkspaceView />
        </main>
        <Launcher />
        <KeyboardHints />
      </div>
    </div>
  );
}
