"use client";

import { useDesktop } from "@/state/desktop-store";

export default function WorkspaceSwitcher() {
  const { state, switchWorkspace } = useDesktop();

  return (
    <div className="flex items-center gap-2 text-xs">
      {state.workspaces.map((workspace, index) => {
        const isActive = workspace.id === state.activeWorkspaceId;
        return (
          <button
            key={workspace.id}
            type="button"
            onClick={() => switchWorkspace(workspace.id)}
            className={`focus-ring rounded px-2 py-1 transition ${
              isActive
                ? "bg-mocha-lavender/20 text-mocha-lavender"
                : "bg-mocha-crust/40 text-mocha-subtext1 hover:text-mocha-text"
            }`}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}
