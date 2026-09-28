import { useEffect, useState } from "react";
import { BarChart, Button, Card, Chip, Field, Header, Loading, Screen, SectionLabel } from "@/components/focus-web-ui";
import { FOCUS } from "@/constants/theme";
import { affirmationFor } from "@/data/affirmations";
import {
  addWin,
  dateKey,
  lastDays,
  removeWin,
  saveMirror,
  WIN_KINDS,
  XP_REWARDS,
  type Snapshot,
  type Win,
  type WinKind,
} from "@/lib/focus-storage";
import { sound } from "@/lib/sound";
import confetti from "canvas-confetti";
import { RefreshCw, Sparkles, X, CheckCircle2 } from "lucide-react";

const KIND_META: Record<WinKind, { label: string; color: string; placeholder: string }> = {
  victoria: { label: "Victoria", color: FOCUS.ember, placeholder: "¿Qué has conquistado hoy?" },
  gratitud: { label: "Gratitud", color: FOCUS.success, placeholder: "¿Por qué estás agradecido?" },
  leccion: { label: "Lección", color: FOCUS.violet, placeholder: "¿Qué has aprendido?" },
};

const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function EgoScreen({
  data,
  refresh,
}: {
  data: Snapshot | null;
  refresh: () => Promise<Snapshot>;
}) {
  const [offset, setOffset] = useState(0);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [mirrorMessage, setMirrorMessage] = useState<string | null>(null);
  const [winText, setWinText] = useState("");
  const [kind, setKind] = useState<WinKind>("victoria");
  const [winToDelete, setWinToDelete] = useState<Win | null>(null);

  useEffect(() => {
    if (!data || hydrated) return;
    const log = data.logs[dateKey()];
    setConfidence(log?.confidence ?? null);
    setNote(log?.mirrorNote ?? "");
    setHydrated(true);
  }, [data, hydrated]);

  if (!data) return <Loading />;

  const today = dateKey();
  const alreadyChecked = data.logs[today]?.confidence != null;
  const week = lastDays(7).map((day) => ({
    key: day.key,
    label: day.label,
    value: data.logs[day.key]?.confidence ?? 0,
  }));

  const saveCheckIn = async () => {
    if (confidence === null) return;
    sound.playSuccess();
    const first = await saveMirror(confidence, note);
    if (first) {
      sound.playLevelUp();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }
    setMirrorMessage(first ? `Check-in guardado. +${XP_REWARDS.mirror} XP` : "Check-in actualizado.");
    await refresh();
  };

  const saveWin = async () => {
    const win = await addWin(winText, kind);
    if (!win) return;
    sound.playSuccess();
    setWinText("");
    await refresh();
  };

  const confirmRemove = async () => {
    if (!winToDelete) return;
    sound.playClick();
    await removeWin(winToDelete.id);
    setWinToDelete(null);
    await refresh();
  };

  return (
    <Screen>
      <Header
        eyebrow="EGO"
        title="Frente al espejo"
        subtitle="La confianza no se pide. Se construye con pruebas."
      />

      <Card accent={FOCUS.violet}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#8B7CFF]" />
          <SectionLabel>Afirmación</SectionLabel>
        </div>
        <p className="text-xl sm:text-2xl font-black text-[#F5F5F7] leading-snug italic transition-all">
          "{affirmationFor(today, offset)}"
        </p>
        <div className="flex gap-2 pt-1">
          <Button
            label="Otra afirmación"
            variant="secondary"
            onClick={() => {
              sound.playClick();
              setOffset((v) => v + 1);
            }}
            icon={<RefreshCw className="w-4 h-4" />}
            className="w-full sm:w-auto"
          />
        </div>
        <p className="text-xs text-[#A1A1AE]">
          Léela en voz alta. Dos veces. Mirándote a los ojos.
        </p>
      </Card>

      <Card>
        <SectionLabel>
          {alreadyChecked ? "Check-in de hoy (hecho)" : "Check-in de hoy"}
        </SectionLabel>
        <p className="text-sm sm:text-base font-bold text-[#F5F5F7]">
          Del 1 al 10, ¿cuánto te respetas hoy?
        </p>

        <div className="flex flex-wrap gap-2 py-1">
          {SCORES.map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => {
                sound.playClick();
                setConfidence(score);
              }}
              style={
                confidence === score
                  ? { backgroundColor: FOCUS.violet, borderColor: FOCUS.violet, color: "#08080C" }
                  : undefined
              }
              className={`w-11 h-11 rounded-xl font-black text-sm flex items-center justify-center border transition-all cursor-pointer active:scale-90 ${
                confidence === score
                  ? "bg-[#8B7CFF] text-[#08080C] border-[#8B7CFF] shadow-lg shadow-[#8B7CFF]/25"
                  : "bg-[#111117] text-[#F5F5F7] border-[#262631] hover:border-[#8B7CFF]/60"
              }`}
            >
              {score}
            </button>
          ))}
        </div>

        <Field
          value={note}
          onChange={setNote}
          placeholder="Hoy me respeto porque..."
          maxLength={280}
          multiline
        />

        <Button
          label={alreadyChecked ? "Actualizar check-in" : `Guardar (+${XP_REWARDS.mirror} XP)`}
          onClick={() => void saveCheckIn()}
          disabled={confidence === null}
        />

        {mirrorMessage && (
          <div className="text-xs font-bold text-[#2ED47A] flex items-center gap-1.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{mirrorMessage}</span>
          </div>
        )}
      </Card>

      <Card>
        <SectionLabel>Tu confianza esta semana</SectionLabel>
        <BarChart items={week} color={FOCUS.violet} height={80} />
      </Card>

      <Card>
        <SectionLabel>Diario de pruebas</SectionLabel>
        <p className="text-xs text-[#A1A1AE]">
          Cada registro es una prueba de quién eres. +{XP_REWARDS.win} XP.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {WIN_KINDS.map((item) => (
            <Chip
              key={item}
              label={KIND_META[item].label}
              active={kind === item}
              color={KIND_META[item].color}
              onClick={() => {
                sound.playClick();
                setKind(item);
              }}
            />
          ))}
        </div>

        <Field
          value={winText}
          onChange={setWinText}
          placeholder={KIND_META[kind].placeholder}
          maxLength={280}
          multiline
        />

        <Button
          label="Registrar"
          onClick={() => void saveWin()}
          disabled={!winText.trim()}
        />
      </Card>

      <div className="flex flex-col gap-3">
        {data.wins.slice(0, 20).map((win) => {
          const meta = KIND_META[win.kind] ?? KIND_META.victoria;

          return (
            <div
              key={win.id}
              style={{ borderLeftColor: meta.color }}
              className="flex items-start justify-between gap-3 bg-[#16161E] rounded-2xl border border-[#262631] border-l-4 p-4 shadow-sm"
            >
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <span
                  style={{ color: meta.color }}
                  className="text-[11px] font-black tracking-wider uppercase"
                >
                  {meta.label} · {new Date(win.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </span>
                <p className="text-sm sm:text-base text-[#F5F5F7] leading-relaxed break-words">
                  {win.text}
                </p>
              </div>

              <button
                type="button"
                aria-label="Eliminar registro"
                onClick={() => setWinToDelete(win)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7C7C8A] hover:text-[#FF4D5E] hover:bg-[#FF4D5E]/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Delete Win Modal */}
      {winToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#16161E] border border-[#262631] rounded-2xl max-w-sm w-full p-5 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-black text-[#F5F5F7]">Eliminar registro</h3>
            <p className="text-sm text-[#A1A1AE]">
              Se restarán los 5 XP que te otorgó este registro. ¿Continuar?
            </p>
            <div className="flex gap-2 justify-end mt-2">
              <Button
                label="Cancelar"
                variant="secondary"
                onClick={() => setWinToDelete(null)}
              />
              <Button
                label="Eliminar"
                variant="danger"
                onClick={() => void confirmRemove()}
              />
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
