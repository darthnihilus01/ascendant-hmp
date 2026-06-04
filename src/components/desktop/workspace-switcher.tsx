"use client";

import { useDesktop } from "@/state/desktop-store";

export default function WorkspaceSwitcher() {
  const { state, switchWorkspace } = useDesktop();

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
      {state.workspaces.map((workspace, index) => {
        const isActive = workspace.id === state.activeWorkspaceId;
        return (
          <button
            key={workspace.id}
            type="button"
            onClick={() => switchWorkspace(workspace.id)}
            className={`focus-ring px-2 py-0.5 rounded-sm transition-all duration-150 ${
              isActive
                ? "bg-white text-black"
                : "bg-[#222222]/40 text-[#888888] hover:bg-[#222222]/80 hover:text-white"
            }`}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}
