"use client";

import { DesktopProvider } from "@/state/desktop-store";
import DesktopShell from "@/components/desktop/desktop-shell";

export default function DesktopRoot() {
  return (
    <DesktopProvider>
      <DesktopShell />
    </DesktopProvider>
  );
}
