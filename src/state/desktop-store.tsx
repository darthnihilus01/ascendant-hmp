"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

type WindowStatus = "normal" | "minimized";

type WindowLayout = {
  colSpan: number;
  rowSpan: number;
};

export type WindowContentBlock = {
  title: string;
  lines: string[];
};

export type WindowItem = {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  command: string;
  layout: WindowLayout;
  status: WindowStatus;
  content: WindowContentBlock[];
};

export type Workspace = {
  id: string;
  name: string;
  hint: string;
  windows: WindowItem[];
};

type DesktopState = {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  focusedId: string;
};

type DesktopAction =
  | { type: "SWITCH_WORKSPACE"; workspaceId: string }
  | { type: "SET_FOCUS"; focusId: string }
  | { type: "FOCUS_NEXT" }
  | { type: "FOCUS_PREV" }
  | { type: "TOGGLE_MINIMIZE"; windowId: string };

const initialState: DesktopState = {
  workspaces: [
    {
      id: "core",
      name: "Core",
      hint: "Ascendant 2026 / Core Ops",
      windows: [
        {
          id: "terminal",
          title: "Ascendant Shell",
          subtitle: "Session 04 · core",
          accent: "mocha-lavender",
          command: "ascendant@core:~$",
          layout: { colSpan: 7, rowSpan: 1 },
          status: "normal",
          content: [
            {
              title: "status",
              lines: [
                "registration: open",
                "tracks: 6",
                "teams: 128",
                "keymap: alt+1..4 | alt+arrow",
              ],
            },
            {
              title: "now",
              lines: [
                "opening ceremony in 00:12:18",
                "main stage: vector hall",
              ],
            },
          ],
        },
        {
          id: "schedule",
          title: "Timeline",
          subtitle: "Day 01",
          accent: "mocha-blue",
          command: "calendar --today",
          layout: { colSpan: 5, rowSpan: 1 },
          status: "normal",
          content: [
            {
              title: "checkpoint",
              lines: [
                "09:30 · gates open",
                "11:00 · keynote",
                "14:00 · build sprint",
                "19:30 · demo sync",
              ],
            },
          ],
        },
        {
          id: "systems",
          title: "System Monitor",
          subtitle: "Hyprland profile",
          accent: "mocha-teal",
          command: "sysctl -snapshot",
          layout: { colSpan: 6, rowSpan: 1 },
          status: "normal",
          content: [
            {
              title: "compute",
              lines: [
                "cpu: 46% · 5.2 ghz",
                "gpu: 61% · 84c",
                "ram: 28.3 gb / 64 gb",
              ],
            },
            {
              title: "network",
              lines: ["uplink: 1.2 gbps", "latency: 12 ms"],
            },
          ],
        },
        {
          id: "sponsors",
          title: "Allies",
          subtitle: "Field support",
          accent: "mocha-peach",
          command: "sponsors --active",
          layout: { colSpan: 6, rowSpan: 1 },
          status: "normal",
          content: [
            {
              title: "stack",
              lines: [
                "neon cloud lab",
                "forge hardware",
                "zenith ai collective",
              ],
            },
            {
              title: "notes",
              lines: ["perks staged in the plaza", "swag sync at 16:00"],
            },
          ],
        },
      ],
    },
    {
      id: "labs",
      name: "Labs",
      hint: "Prototype Bay",
      windows: [
        {
          id: "prototype",
          title: "Prototype Bay",
          subtitle: "Hot desk 07",
          accent: "mocha-green",
          command: "bay --slots",
          layout: { colSpan: 8, rowSpan: 1 },
          status: "normal",
          content: [
            {
              title: "availability",
              lines: [
                "open: 12 stations",
                "reserved: 4 stations",
                "queue: 9 teams",
              ],
            },
            {
              title: "gear",
              lines: ["3d printer pool", "laser table", "iot rack"],
            },
          ],
        },
        {
          id: "mentors",
          title: "Mentor Queue",
          subtitle: "Signal priority",
          accent: "mocha-yellow",
          command: "mentor --queue",
          layout: { colSpan: 4, rowSpan: 1 },
          status: "normal",
          content: [
            {
              title: "up next",
              lines: ["ui systems", "ml ops", "supply chain"],
            },
            {
              title: "eta",
              lines: ["avg wait: 14 min", "on deck: 3"],
            },
          ],
        },
        {
          id: "build",
          title: "Build Logs",
          subtitle: "Cluster 9",
          accent: "mocha-sapphire",
          command: "buildd --tail",
          layout: { colSpan: 12, rowSpan: 1 },
          status: "normal",
          content: [
            {
              title: "recent",
              lines: [
                "[ok] ui bundle ready",
                "[ok] api sync stable",
                "[warn] edge cache warmup",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "signal",
      name: "Signal",
      hint: "Announcements",
      windows: [
        {
          id: "broadcast",
          title: "Broadcast",
          subtitle: "Stage control",
          accent: "mocha-pink",
          command: "radio --feed",
          layout: { colSpan: 7, rowSpan: 1 },
          status: "normal",
          content: [
            {
              title: "priority",
              lines: [
                "workshop: zero-copy pipelines",
                "office hours: 15:00",
                "finals sync: 20:30",
              ],
            },
          ],
        },
        {
          id: "missions",
          title: "Missions",
          subtitle: "Side quests",
          accent: "mocha-mauve",
          command: "missions --live",
          layout: { colSpan: 5, rowSpan: 1 },
          status: "normal",
          content: [
            {
              title: "active",
              lines: [
                "rover telemetry",
                "ambient ui audio",
                "edge inference",
              ],
            },
            {
              title: "rewards",
              lines: ["bonus credits", "fast track demo"],
            },
          ],
        },
        {
          id: "dispatch",
          title: "Dispatch",
          subtitle: "Operations",
          accent: "mocha-red",
          command: "dispatch --status",
          layout: { colSpan: 12, rowSpan: 1 },
          status: "normal",
          content: [
            {
              title: "alerts",
              lines: [
                "help desk: light queue",
                "power grid: stable",
                "security: clear",
              ],
            },
          ],
        },
      ],
    },
  ],
  activeWorkspaceId: "core",
  focusedId: "window:terminal",
};

const focusablesForWorkspace = (state: DesktopState, workspaceId: string) => {
  const workspace = state.workspaces.find((item) => item.id === workspaceId);
  const windowIds = workspace
    ? workspace.windows.map((windowItem) => `window:${windowItem.id}`)
    : [];
  return ["status", ...windowIds, "launcher"];
};

const getFirstFocusable = (state: DesktopState, workspaceId: string) => {
  const focusables = focusablesForWorkspace(state, workspaceId);
  return focusables[1] ?? "launcher";
};

const updateWindowStatus = (
  windows: WindowItem[],
  windowId: string,
  status: WindowStatus
) =>
  windows.map((windowItem) =>
    windowItem.id === windowId ? { ...windowItem, status } : windowItem
  );

const reducer = (state: DesktopState, action: DesktopAction): DesktopState => {
  switch (action.type) {
    case "SWITCH_WORKSPACE": {
      if (action.workspaceId === state.activeWorkspaceId) {
        return state;
      }
      return {
        ...state,
        activeWorkspaceId: action.workspaceId,
        focusedId: getFirstFocusable(state, action.workspaceId),
      };
    }
    case "SET_FOCUS":
      return {
        ...state,
        focusedId: action.focusId,
      };
    case "FOCUS_NEXT": {
      const focusables = focusablesForWorkspace(
        state,
        state.activeWorkspaceId
      );
      const currentIndex = focusables.indexOf(state.focusedId);
      const nextIndex =
        currentIndex === -1 ? 0 : (currentIndex + 1) % focusables.length;
      return {
        ...state,
        focusedId: focusables[nextIndex],
      };
    }
    case "FOCUS_PREV": {
      const focusables = focusablesForWorkspace(
        state,
        state.activeWorkspaceId
      );
      const currentIndex = focusables.indexOf(state.focusedId);
      const prevIndex =
        currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1;
      return {
        ...state,
        focusedId: focusables[prevIndex],
      };
    }
    case "TOGGLE_MINIMIZE": {
      const workspaces = state.workspaces.map((workspace) => {
        if (workspace.id !== state.activeWorkspaceId) {
          return workspace;
        }
        const target = workspace.windows.find(
          (windowItem) => windowItem.id === action.windowId
        );
        if (!target) {
          return workspace;
        }
        const nextStatus = target.status === "normal" ? "minimized" : "normal";
        return {
          ...workspace,
          windows: updateWindowStatus(workspace.windows, action.windowId, nextStatus),
        };
      });
      const focusFallback = getFirstFocusable(state, state.activeWorkspaceId);
      const updatedFocus = state.focusedId === `window:${action.windowId}`
        ? focusFallback
        : state.focusedId;
      return {
        ...state,
        workspaces,
        focusedId: updatedFocus,
      };
    }
    default:
      return state;
  }
};

type DesktopContextValue = {
  state: DesktopState;
  activeWorkspace: Workspace;
  focusables: string[];
  switchWorkspace: (workspaceId: string) => void;
  focusNext: () => void;
  focusPrev: () => void;
  setFocusId: (focusId: string) => void;
  focusWindow: (windowId: string) => void;
  toggleMinimize: (windowId: string) => void;
};

const DesktopContext = createContext<DesktopContextValue | null>(null);

export function DesktopProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const activeWorkspace = useMemo(() => {
    return (
      state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId) ??
      state.workspaces[0]
    );
  }, [state.activeWorkspaceId, state.workspaces]);

  const focusables = useMemo(() => {
    return focusablesForWorkspace(state, state.activeWorkspaceId);
  }, [state]);

  useEffect(() => {
    const selector = `[data-focus-id="${state.focusedId}"]`;
    const target = document.querySelector(selector);
    if (target instanceof HTMLElement) {
      target.focus();
    }
  }, [state.focusedId, state.activeWorkspaceId]);

  const value = useMemo<DesktopContextValue>(
    () => ({
      state,
      activeWorkspace,
      focusables,
      switchWorkspace: (workspaceId) =>
        dispatch({ type: "SWITCH_WORKSPACE", workspaceId }),
      focusNext: () => dispatch({ type: "FOCUS_NEXT" }),
      focusPrev: () => dispatch({ type: "FOCUS_PREV" }),
      setFocusId: (focusId) => dispatch({ type: "SET_FOCUS", focusId }),
      focusWindow: (windowId) =>
        dispatch({ type: "SET_FOCUS", focusId: `window:${windowId}` }),
      toggleMinimize: (windowId) =>
        dispatch({ type: "TOGGLE_MINIMIZE", windowId }),
    }),
    [state, activeWorkspace, focusables]
  );

  return <DesktopContext.Provider value={value}>{children}</DesktopContext.Provider>;
}

export function useDesktop() {
  const context = useContext(DesktopContext);
  if (!context) {
    throw new Error("useDesktop must be used within DesktopProvider");
  }
  return context;
}

export function useKeyboardNavigation() {
  const {
    state,
    switchWorkspace,
    focusNext,
    focusPrev,
    toggleMinimize,
    setFocusId,
  } = useDesktop();

  const getWorkspaceByIndex = (index: number) =>
    state.workspaces[index]?.id ?? state.activeWorkspaceId;

  return {
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.altKey && event.key >= "1" && event.key <= "4") {
        const targetId = getWorkspaceByIndex(Number(event.key) - 1);
        switchWorkspace(targetId);
        event.preventDefault();
        return;
      }

      if (event.altKey && event.key === "ArrowRight") {
        focusNext();
        event.preventDefault();
        return;
      }

      if (event.altKey && event.key === "ArrowLeft") {
        focusPrev();
        event.preventDefault();
        return;
      }

      if (event.altKey && event.key.toLowerCase() === "m") {
        if (state.focusedId.startsWith("window:")) {
          toggleMinimize(state.focusedId.replace("window:", ""));
        }
        event.preventDefault();
        return;
      }

      if (event.altKey && event.code === "Space") {
        setFocusId("launcher");
        event.preventDefault();
        return;
      }

      if (event.altKey && event.key.toLowerCase() === "s") {
        setFocusId("status");
        event.preventDefault();
        return;
      }

      if (event.key === "Escape") {
        const fallback = getFirstFocusable(state, state.activeWorkspaceId);
        setFocusId(fallback);
      }
    },
  };
}
