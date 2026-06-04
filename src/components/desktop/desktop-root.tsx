"use client";

import { useEffect, useState } from "react";
import BootSequence from "@/components/desktop/boot-sequence";
import { DesktopProvider } from "@/state/desktop-store";
import DesktopShell from "@/components/desktop/desktop-shell";

const BOOT_KEY = "ascendant:booted";

type BootState = "checking" | "boot" | "skip";

export default function DesktopRoot() {
  const [bootState, setBootState] = useState<BootState>("checking");

  useEffect(() => {
    const booted = window.localStorage.getItem(BOOT_KEY) === "1";
    setBootState(booted ? "skip" : "boot");
  }, []);

  const handleComplete = () => {
    window.localStorage.setItem(BOOT_KEY, "1");
    setBootState("skip");
  };

  if (bootState === "checking") {
    return null;
  }

  if (bootState === "boot") {
    return <BootSequence onComplete={handleComplete} />;
  }

  return (
    <DesktopProvider>
      <DesktopShell />
    </DesktopProvider>
  );
}
