import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, Chip, Field, Header, Loading, ProgressBar, Screen, SectionLabel, Stat } from "@/components/focus-web-ui";
import { FOCUS } from "@/constants/theme";
import {
  completeFocus,
  dateKey,
  emptyLog,
  focusElapsedSeconds,
  makeId,
  saveActiveFocus,
  type ActiveFocus,
  type Snapshot,
} from "@/lib/focus-storage";
import { sound } from "@/lib/sound";
import { sendBrowserNotification } from "@/lib/notifications";
import { startPictureInPicture, isPictureInPictureSupported } from "@/lib/pip-island";
import confetti from "canvas-confetti";
import { Play, Pause, Check, X, Award, Flame, Maximize2, Smartphone } from "lucide-react";

const PRESETS = [
  { minutes: 15, label: "Sprint" },
  { minutes: 25, label: "Clásico" },
  { minutes: 50, label: "Profundo" },
  { minutes: 90, label: "Monje" },
];

function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function FocusScreen({
  data,
  refresh,
}: {
  data: Snapshot | null;
  refresh: () => Promise<Snapshot>;
}) {
  const [duration, setDuration] = useState(25);
  const [intent, setIntent] = useState("");
  const [active, setActive] = useState<ActiveFocus | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [reward, setReward] = useState<number | null>(null);
  const [pipActive, setPipActive] = useState(false);
  const hasNotifiedCompletionRef = useRef(false);

  // Restore running or paused session
  useEffect(() => {
    if (data) {
      setActive(data.active);
      setNow(Date.now());
    }
  }, [data]);

  const elapsed = active ? focusElapsedSeconds(active, now) : 0;
  const totalSeconds = (active?.durationMin ?? duration) * 60;
  const remainingSeconds = Math.max(0, totalSeconds - elapsed);
  const finished = Boolean(active) && elapsed >= totalSeconds;
  const running = Boolean(active) && !active?.paused && !finished;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [running]);

  // Update Document Title with remaining countdown for background visibility
  useEffect(() => {
    if (active) {
      const timeStr = formatTime(remainingSeconds);
      const stateStr = active.paused ? "⏸ Pausa" : finished ? "✓ Completado" : "🔥 Enfoque";
      document.title = `[${timeStr}] ${stateStr} - Focus`;
    } else {
      document.title = "Focus - Disciplina y Enfoque";
    }

    return () => {
      document.title = "Focus - Disciplina y Enfoque";
    };
  }, [active, remainingSeconds, finished]);

  // Notify completion if running and time expires
  useEffect(() => {
    if (finished && !hasNotifiedCompletionRef.current) {
      hasNotifiedCompletionRef.current = true;
      sound.playLevelUp();
      sendBrowserNotification(
        "🏆 ¡Sesión de Enfoque Completada!",
        `Has conquistado tus ${active?.durationMin || duration} minutos de enfoque. Reclama tu XP ahora.`
      );
    } else if (!finished) {
      hasNotifiedCompletionRef.current = false;
    }
  }, [finished, active, duration]);

  if (!data) return <Loading />;

  const today = dateKey();
  const todayMinutes = (data.logs[today] ?? emptyLog(today)).focusMinutes;
  const elapsedMinutes = Math.floor(elapsed / 60);
  const progressRatio = totalSeconds > 0 ? Math.min(1, elapsed / totalSeconds) : 0;

  const start = async () => {
    sound.playClick();
    const next: ActiveFocus = {
      id: makeId("active"),
      intent: intent.trim(),
      durationMin: duration,
      startedAt: Date.now(),
      elapsedBefore: 0,
      paused: false,
    };
    setReward(null);
    setNow(Date.now());
    setActive(next);
    hasNotifiedCompletionRef.current = false;
    await saveActiveFocus(next);
  };

  const togglePause = async () => {
    if (!active) return;
    sound.playClick();
    const time = Date.now();
    const next: ActiveFocus = active.paused
      ? { ...active, paused: false, startedAt: time }
      : { ...active, paused: true, elapsedBefore: focusElapsedSeconds(active, time) };
    setNow(time);
    setActive(next);
    await saveActiveFocus(next);
  };

  const finish = async () => {
    if (!active) return;
    const minutes = finished ? active.durationMin : Math.floor(focusElapsedSeconds(active) / 60);
    sound.playComplete();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } });
    const xp = await completeFocus(active.intent, minutes);
    setActive(null);
    setIntent("");
    setReward(xp);
    await refresh();
  };

  const cancel = async () => {
    sound.playClick();
    await saveActiveFocus(null);
    setActive(null);
    await refresh();
  };

  const handleLaunchPip = async () => {
    if (!active) return;
    sound.playClick();
    setPipActive(true);
    const success = await startPictureInPicture(() => {
      const currentNow = Date.now();
      const currentElapsed = focusElapsedSeconds(active, currentNow);
      const currentRemaining = Math.max(0, active.durationMin * 60 - currentElapsed);
      return {
        remainingSeconds: currentRemaining,
        totalSeconds: active.durationMin * 60,
        intent: active.intent || "Enfoque Profundo",
        isPaused: Boolean(active.paused),
      };
    });
    setPipActive(success);
  };

  const status = !active ? "LISTO" : finished ? "COMPLETADO" : active.paused ? "EN PAUSA" : "EN ENFOQUE";
  const accent = finished ? FOCUS.success : FOCUS.ember;

  // Circular ring calculations
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <Screen>
      <Header
        eyebrow="ENFOQUE"
        title="Modo bestia"
        subtitle="Una tarea. Cero distracciones. El móvil boca abajo."
      />

      {/* Main Luxury Timer Display */}
      <Card
        accent={finished ? FOCUS.success : active ? FOCUS.ember : undefined}
        className="flex flex-col items-center justify-center py-10 sm:py-12 gap-5 relative overflow-hidden"
      >
        {/* Animated breathing pulse ring */}
        {running && (
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.05, 0.35] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            style={{ backgroundColor: accent }}
            className="absolute w-72 h-72 rounded-full blur-3xl pointer-events-none"
          />
        )}

        {/* Circular SVG Progress Ring */}
        <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 260 260">
            {/* Background Track */}
            <circle
              cx="130"
              cy="130"
              r={radius}
              className="text-[#16161E] stroke-current"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Glow Fill */}
            <circle
              cx="130"
              cy="130"
              r={radius}
              stroke={accent}
              strokeWidth="10"
              strokeLinecap="round"
              fill="transparent"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: "stroke-dashoffset 0.5s ease-out, stroke 0.3s ease",
              }}
            />
          </svg>

          {/* Center Info inside Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center px-4">
            <span
              style={{ color: finished ? FOCUS.success : FOCUS.ember }}
              className="text-[11px] font-black tracking-[0.25em] uppercase mb-1 drop-shadow-sm"
            >
              {status}
            </span>

            <motion.div
              key={status}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl sm:text-6xl font-black text-[#F5F5F7] tracking-tight tabular-nums font-mono drop-shadow-md"
            >
              {formatTime(remainingSeconds)}
            </motion.div>

            {active?.intent ? (
              <p className="text-xs font-bold text-[#A1A1AE] mt-2 max-w-[190px] truncate">
                {active.intent}
              </p>
            ) : (
              <span className="text-[11px] text-[#7C7C8A] font-semibold mt-1">
                {duration} MINUTOS
              </span>
            )}
          </div>
        </div>

        {/* Linear progress bar backup */}
        <div className="w-full max-w-xs px-2">
          <ProgressBar
            value={progressRatio}
            color={accent}
            height={6}
          />
        </div>
      </Card>

      {!active ? (
        <div className="flex flex-col gap-4">
          <Card>
            <SectionLabel>¿En qué vas a enfocarte?</SectionLabel>
            <Field
              value={intent}
              onChange={setIntent}
              placeholder="Ej: Terminar el informe"
              maxLength={120}
              onKeyDown={(e) => {
                if (e.key === "Enter") void start();
              }}
            />

            <SectionLabel>Duración</SectionLabel>
            <div className="flex flex-wrap gap-2 pt-1">
              {PRESETS.map((preset) => (
                <Chip
                  key={preset.minutes}
                  label={`${preset.label} · ${preset.minutes} min`}
                  active={duration === preset.minutes}
                  onClick={() => setDuration(preset.minutes)}
                />
              ))}
            </div>
          </Card>

          <Button
            label={`Empezar ${duration} minutos`}
            onClick={() => void start()}
            icon={<Play className="w-4 h-4 fill-current" />}
            className="py-4 text-base"
          />
        </div>
      ) : finished ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Button
            label={`Reclamar +${active.durationMin} XP`}
            onClick={() => void finish()}
            icon={<Award className="w-5 h-5" />}
            className="w-full py-4 text-base bg-[#2ED47A] hover:bg-[#3ce58c] text-[#08080C]"
          />
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              label={active.paused ? "Reanudar" : "Pausar"}
              variant="secondary"
              onClick={() => void togglePause()}
              icon={active.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            />
            <Button
              label={elapsedMinutes >= 1 ? `Terminar (+${elapsedMinutes} XP)` : "Terminar"}
              onClick={() => void finish()}
              disabled={elapsedMinutes < 1}
              icon={<Check className="w-4 h-4" />}
            />
          </div>

          {/* Floating iPhone Dynamic Island / PiP Trigger */}
          {isPictureInPictureSupported() && (
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleLaunchPip}
              className="py-3 px-4 rounded-xl bg-[#16161E] hover:bg-[#20202C] border border-[#262631] hover:border-[#FF5A1F]/50 text-xs font-bold text-[#F5F5F7] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Maximize2 className="w-4 h-4 text-[#FF5A1F]" />
              <span>Flotar temporizador en iPhone (PiP / Isla)</span>
            </motion.button>
          )}

          <Button
            label="Abandonar sesión (sin XP)"
            variant="danger"
            onClick={() => void cancel()}
            icon={<X className="w-4 h-4" />}
          />
        </div>
      )}

      {/* Dynamic Island explanation card for iPhone users */}
      <Card accent={FOCUS.violet}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#8B7CFF]/15 flex items-center justify-center text-[#8B7CFF] shrink-0 mt-0.5">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-[#F5F5F7]">
              Dynamic Island en iPhone
            </span>
            <p className="text-xs text-[#A1A1AE] leading-relaxed">
              Mientras tengas una sesión activa, verás la <strong className="text-[#F5F5F7]">Dynamic Island</strong> en la parte superior al navegar por la app. Si sales al inicio del iPhone, pulsa <strong className="text-[#FF5A1F]">«Flotar temporizador»</strong> para mantener la cuenta regresiva flotando sobre cualquier otra app.
            </p>
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {reward !== null && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
          >
            <Card accent={FOCUS.success}>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#2ED47A]" />
                <span className="text-2xl font-black text-[#2ED47A]">+{reward} XP</span>
              </div>
              <p className="text-sm text-[#A1A1AE]">
                Así se construye el respeto propio. Una sesión cada vez.
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3">
        <Stat
          label="Hoy"
          value={String(todayMinutes)}
          suffix="min"
          color={FOCUS.violet}
        />
        <Stat
          label="Sesiones"
          value={String(data.sessions.length)}
          color={FOCUS.ember}
        />
      </div>

      {data.sessions.length > 0 && (
        <Card>
          <SectionLabel>Sesiones recientes</SectionLabel>
          <div className="flex flex-col divide-y divide-[#262631]">
            {data.sessions.slice(0, 6).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
              >
                <span className="text-sm font-bold text-[#F5F5F7] truncate max-w-[240px] sm:max-w-md">
                  {session.intent || "Enfoque"}
                </span>
                <span className="text-xs text-[#A1A1AE] font-semibold whitespace-nowrap ml-3">
                  {session.minutes} min · {new Date(session.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </Screen>
  );
}
