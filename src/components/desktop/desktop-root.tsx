"use client";

import { useEffect, useState } from "react";
import BootSequence from "@/components/desktop/boot-sequence";
import NetworkDiscovery from "@/components/desktop/network-discovery";
import MainInfoPage from "@/components/desktop/main-info-page";

type AppState = "boot" | "network" | "desktop";

export default function DesktopRoot() {
  const [appState, setAppState] = useState<AppState>("boot");

  useEffect(() => {
    if (appState === "desktop") {
      document.body.dataset.cursorMode = "fluid";
    } else {
      document.body.dataset.cursorMode = "text";
    }
  }, [appState]);

  if (appState === "boot") {
    return (
      <BootSequence
        onComplete={() => {
          setAppState("network");
        }}
      />
    );
  }

  if (appState === "network") {
    return (
      <NetworkDiscovery
        onComplete={() => setAppState("desktop")}
      />
    );
  }

  return <MainInfoPage />;
}
