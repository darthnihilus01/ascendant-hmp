"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

type BootSequenceProps = {
  onComplete: () => void;
};

type BootLine = {
  text: string;
  entryDelayMs: number;
  charDelayMs: number;
};

const bootLines: BootLine[] = [
  { text: "[ OK ] Loading kernel modules", entryDelayMs: 700, charDelayMs: 28 },
  { text: "[ OK ] Mounting /ascendant", entryDelayMs: 700, charDelayMs: 28 },
  { text: "[ OK ] Starting innovation.service", entryDelayMs: 700, charDelayMs: 26 },
  { text: "[ OK ] Loading hackathon data", entryDelayMs: 700, charDelayMs: 28 },
  { text: "[ OK ] Preparing workspaces", entryDelayMs: 700, charDelayMs: 28 },
  { text: "[ OK ] Starting ascendant.target", entryDelayMs: 700, charDelayMs: 26 },
  { text: "System ready.", entryDelayMs: 700, charDelayMs: 30 },
];

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [typedLines, setTypedLines] = useState(() =>
    bootLines.map(() => "")
  );
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers: number[] = [];
    let cancelled = false;

    const typeLine = (lineIndex: number, charIndex: number) => {
      if (cancelled) {
        return;
      }
      const line = bootLines[lineIndex];
      setActiveLineIndex(lineIndex);
      setTypedLines((prev) => {
        const next = [...prev];
        next[lineIndex] = line.text.slice(0, charIndex);
        return next;
      });

      if (charIndex < line.text.length) {
        timers.push(
          window.setTimeout(
            () => typeLine(lineIndex, charIndex + 1),
            line.charDelayMs
          )
        );
        return;
      }

      if (lineIndex < bootLines.length - 1) {
        const nextIndex = lineIndex + 1;
        timers.push(
          window.setTimeout(
            () => typeLine(nextIndex, 1),
            bootLines[nextIndex].entryDelayMs
          )
        );
        return;
      }

      timers.push(
        window.setTimeout(() => {
          setIsComplete(true);
          setShowTitle(false);
          timers.push(
            window.setTimeout(() => {
              setShowTitle(true);
            }, 1500)
          );
        }, 100)
      );
    };

    timers.push(
      window.setTimeout(
        () => typeLine(0, 1),
        bootLines[0].entryDelayMs
      )
    );

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    containerRef.current?.focus();
  }, [isComplete]);

  const visibleLines = useMemo(
    () =>
      typedLines
        .map((text, index) => ({ text, index }))
        .filter((line) => line.text.length > 0),
    [typedLines]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isComplete) {
      return;
    }
    if (event.key === "Enter") {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen w-screen bg-black text-white">
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="flex min-h-screen items-center justify-center px-6 py-16 focus-ring outline-none"
        aria-label="Ascendant boot sequence"
      >
        <div className="w-full max-w-[600px]">
          <div className="space-y-3 text-left text-sm uppercase tracking-[0.24em] text-[#8b8b8b]">
            {visibleLines.map((line) => (
              <motion.div
                key={`${line.index}-${line.text.length}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="whitespace-pre"
              >
                <span>{line.text}</span>
                {line.index === activeLineIndex && !showTitle ? (
                  <span className="boot-cursor text-[#cba6f7]">█</span>
                ) : null}
              </motion.div>
            ))}
            {visibleLines.length === 0 ? (
              <span className="boot-cursor text-[#cba6f7]">█</span>
            ) : null}
          </div>

          {showTitle ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-12 text-center"
            >
              <div className="text-4xl uppercase tracking-[0.4em] text-white">
                ASCENDANT 2026
              </div>
              <div className="mt-3 text-lg uppercase tracking-[0.25em] text-[#8b8b8b]">
                The Future Boots Here.
              </div>
              <motion.div
                className="mt-6 text-xs uppercase tracking-[0.4em] text-[#8b8b8b]"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              >
                Press ENTER to continue
              </motion.div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
