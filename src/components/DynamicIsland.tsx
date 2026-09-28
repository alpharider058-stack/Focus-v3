import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ExternalLink, Minimize2, Flame, Maximize2 } from "lucide-react";
import { sound } from "@/lib/sound";
import { startPictureInPicture, isPictureInPictureSupported } from "@/lib/pip-island";
import type { ActiveFocus } from "@/lib/focus-storage";
import { focusElapsedSeconds } from "@/lib/focus-storage";

interface DynamicIslandProps {
  active: ActiveFocus | null;
  onNavigateToFocus: () => void;
  onTogglePause: () => void;
}

function formatMinSec(totalSeconds: number): string {
  const safe = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function DynamicIsland({
  active,
  onNavigateToFocus,
  onTogglePause,
}: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPipLaunching, setIsPipLaunching] = useState(false);

  if (!active) return null;

  const now = Date.now();
  const elapsed = focusElapsedSeconds(active, now);
  const total = active.durationMin * 60;
  const remaining = Math.max(0, total - elapsed);
  const isFinished = elapsed >= total;
  const isPaused = Boolean(active.paused);

  const handleToggleExpand = () => {
    sound.playClick();
    setIsExpanded((prev) => !prev);
  };

  const handleLaunchPip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPipLaunching(true);
    sound.playClick();

    await startPictureInPicture(() => {
      const currentNow = Date.now();
      const currentElapsed = focusElapsedSeconds(active, currentNow);
      const currentRemaining = Math.max(0, active.durationMin * 60 - currentElapsed);
      return {
        remainingSeconds: currentRemaining,
        totalSeconds: active.durationMin * 60,
        intent: active.intent || "Sesión de Enfoque",
        isPaused: Boolean(active.paused),
      };
    });

    setIsPipLaunching(false);
  };

  return (
    <div className="fixed top-2 sm:top-3 left-0 right-0 z-50 flex justify-center pointer-events-none px-3">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
        onClick={handleToggleExpand}
        className={`pointer-events-auto bg-[#000000] border border-[#262631] text-[#F5F5F7] shadow-[0_12px_36px_rgba(0,0,0,0.85)] cursor-pointer select-none overflow-hidden transition-all ${
          isExpanded
            ? "w-full max-w-[360px] rounded-[32px] p-4.5"
            : "w-auto min-w-[210px] max-w-[280px] h-[38px] rounded-full px-3.5 py-1.5 flex items-center justify-between"
        }`}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            /* Compact Hardware Pill State */
            <motion.div
              key="compact-island"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center justify-between gap-3"
            >
              {/* Left: Icon & status */}
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isPaused
                        ? "bg-[#7C7C8A]"
                        : isFinished
                        ? "bg-[#2ED47A] animate-ping"
                        : "bg-[#FF5A1F] animate-pulse"
                    }`}
                  />
                  <div
                    className={`absolute w-2 h-2 rounded-full ${
                      isPaused ? "bg-[#7C7C8A]" : isFinished ? "bg-[#2ED47A]" : "bg-[#FF5A1F]"
                    }`}
                  />
                </div>
                <span className="text-[11px] font-black tracking-wider text-[#A1A1AE] uppercase truncate max-w-[100px]">
                  {active.intent || "ENFOQUE"}
                </span>
              </div>

              {/* Right: Timer & Wave */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs font-black font-mono tabular-nums ${
                    isFinished ? "text-[#2ED47A]" : isPaused ? "text-[#A1A1AE]" : "text-[#FF5A1F]"
                  }`}
                >
                  {formatMinSec(remaining)}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]/60" />
              </div>
            </motion.div>
          ) : (
            /* Expanded Dynamic Island Card */
            <motion.div
              key="expanded-island"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3.5"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#FF5A1F]/15 flex items-center justify-center">
                    <Flame className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF5A1F]">
                      DYNAMIC ISLAND
                    </span>
                    <h4 className="text-xs font-bold text-[#F5F5F7] truncate max-w-[200px]">
                      {active.intent || "Sesión de Enfoque"}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleExpand();
                  }}
                  className="w-7 h-7 rounded-full bg-[#16161E] flex items-center justify-center text-[#A1A1AE] hover:text-[#F5F5F7] transition-colors"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Center Countdown & Progress */}
              <div className="flex items-center justify-between bg-[#0E0E14] border border-[#22222E] rounded-2xl p-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#7C7C8A] uppercase tracking-wider">
                    {isFinished ? "COMPLETADO" : isPaused ? "EN PAUSA" : "TIEMPO RESTANTE"}
                  </span>
                  <span className="text-2xl font-black font-mono tracking-tight text-[#F5F5F7] tabular-nums">
                    {formatMinSec(remaining)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Play / Pause Quick Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      onTogglePause();
                    }}
                    className="w-10 h-10 rounded-xl bg-[#1D1D27] hover:bg-[#262633] text-[#F5F5F7] flex items-center justify-center border border-[#30303D] transition-colors"
                  >
                    {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* iPhone PiP / Go to Screen Action buttons */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                {isPictureInPictureSupported() && (
                  <button
                    type="button"
                    disabled={isPipLaunching}
                    onClick={handleLaunchPip}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#16161E] hover:bg-[#20202B] border border-[#262631] text-xs font-bold text-[#A1A1AE] hover:text-[#F5F5F7] transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#FF5A1F]" />
                    <span>Flotar (PiP)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    setIsExpanded(false);
                    onNavigateToFocus();
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#FF5A1F] text-[#08080C] text-xs font-extrabold shadow-sm transition-colors ${
                    isPictureInPictureSupported() ? "" : "col-span-2"
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ir a Enfoque</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
