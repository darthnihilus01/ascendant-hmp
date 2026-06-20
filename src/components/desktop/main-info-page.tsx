"use client";

import { useState } from "react";
import Link from "next/link";

const PROJECTS = [
  {
    id: "01",
    title: "Register",
    year: "2026",
    description: "Brand Identity, Digital Ecosystem",
  },
  {
    id: "02",
    title: "ABOUT",
    year: "2026",
    description: "Architecture, Spatial Design",
  },
  {
    id: "03",
    title: "VERVE",
    year: "2025",
    description: "Motion Graphics, Social Media",
  },
  {
    id: "04",
    title: "AETHER",
    year: "2025",
    description: "UI/UX, Product Design",
  },
  {
    id: "05",
    title: "CLARION",
    year: "2024",
    description: "Editorial, Print Design",
  },
  {
    id: "06",
    title: "FORGE",
    year: "2024",
    description: "Web Development, CMS",
  },
];

export default function MainInfoPage() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 py-24 md:py-32">


        <div>
          {PROJECTS.map((project, i) => {
            const isRegister = project.title === "Register";
            const isAbout = project.title === "ABOUT";
            const item = (
              <div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="group flex items-baseline justify-between py-8 md:py-10 cursor-pointer transition-colors duration-300"
              >
                <div className="flex items-baseline gap-6 md:gap-12">
                  <span
                    className="text-[11px] text-white/25 tracking-wider tabular-nums"
                    style={{ fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace" }}
                  >
                    {project.id}
                  </span>
                  <span
                    className="text-[clamp(28px,4vw,56px)] font-bold tracking-[-0.02em] text-white uppercase leading-none transition-opacity duration-300"
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
                      opacity: hovered !== null && hovered !== i ? 0.2 : 1,
                    }}
                  >
                    {project.title}
                  </span>
                </div>

                <div className="text-right hidden sm:block">
                  <span
                    className="text-[11px] text-white/30 tabular-nums"
                    style={{ fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace" }}
                  >
                    {project.year}
                  </span>
                  <p
                    className="text-xs text-white/40 mt-1.5 max-w-[200px]"
                    style={{ fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace" }}
                  >
                    {project.description}
                  </p>
                </div>
              </div>
            );

            const wrapped = isRegister ? (
              <Link href="/register" className="block">{item}</Link>
            ) : isAbout ? (
              <Link href="/about" className="block">{item}</Link>
            ) : item;

            return (
              <div key={project.id}>
                {wrapped}
                {i < PROJECTS.length - 1 && (
                  <hr className="border-t border-white/10/10" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-32">
          <hr className="border-t border-white/10/10 mb-8" />
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 text-xs text-white/30">
            <p>Ascendant Studios — Est. 2024</p>
            <p className="tracking-[0.2em] uppercase">Ascendant 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
