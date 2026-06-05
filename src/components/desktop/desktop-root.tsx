"use client";

import { useState, useEffect } from "react";
import CursorPaintReveal from "@/components/cursor-paint-reveal";
import BootSequence from "@/components/desktop/boot-sequence";
import NetworkDiscovery from "@/components/desktop/network-discovery";
import MainInfoPage from "@/components/desktop/main-info-page";

type AppState = "boot" | "network" | "landing" | "entering";

function getInitialState(): AppState {
  if (typeof window !== "undefined") {
    const saved = sessionStorage.getItem("ascendant-state") as AppState | null;
    if (saved === "network" || saved === "landing" || saved === "entering") return saved;
  }
  return "boot";
}

export default function DesktopRoot() {
  const [appState, setAppState] = useState<AppState>(getInitialState);
  const [landingVisible, setLandingVisible] = useState(
    () => getInitialState() === "landing"
  );
  useEffect(() => {
    sessionStorage.setItem("ascendant-gate", "1");
  }, []);

  useEffect(() => {
    sessionStorage.setItem("ascendant-state", appState);
  }, [appState]);

  // On fresh "entering" or session resume, fade in landing after a delay
  useEffect(() => {
    if (appState === "entering") {
      const t = setTimeout(() => {
        setLandingVisible(true);
        setAppState("landing");
      }, 800);
      return () => clearTimeout(t);
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
        onComplete={() => setAppState("entering")}
      />
    );
  }

  return (
    <div
      className="relative"
      style={{
        opacity: landingVisible ? 1 : 0,
        transition: "opacity 1s ease",
      }}
    >
      <CursorPaintReveal />
      <MainInfoPage />
    </div>
  );
}
