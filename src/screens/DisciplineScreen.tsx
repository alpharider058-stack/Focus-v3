import { useState } from "react";
import { Button, Card, Chip, Field, HabitRow, Header, Loading, ProgressBar, Screen, SectionLabel } from "@/components/focus-web-ui";
import { FOCUS } from "@/constants/theme";
import {
  addHabit,
  dateKey,
  emptyLog,
  habitStreak,
  lastDays,
  removeHabit,
  SUGGESTED_HABITS,
  toggleHabit,
  type Habit,
  type Snapshot,
} from "@/lib/focus-storage";
import { sound } from "@/lib/sound";
import confetti from "canvas-confetti";
import { Plus, CheckCircle2 } from "lucide-react";

export default function DisciplineScreen({
  data,
  refresh,
}: {
  data: Snapshot | null;
  refresh: () => Promise<Snapshot>;
}) {
  const [title, setTitle] = useState("");
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  if (!data) return <Loading />;

  const today = dateKey();
  const log = data.logs[today] ?? emptyLog(today);
  const total = data.habits.length;
  const doneToday = data.habits.filter((habit) => log.habitsDone.includes(habit.id)).length;
  const days = lastDays(7).map((day) => {
    const dayLog = data.logs[day.key];
    const done = dayLog ? data.habits.filter((habit) => dayLog.habitsDone.includes(habit.id)).length : 0;
    return { ...day, done, ratio: total ? done / total : 0 };
  });
  const perfectDays = days.filter((day) => total > 0 && day.done >= total).length;
  const existing = new Set(data.habits.map((habit) => habit.title.toLowerCase()));
  const suggestions = SUGGESTED_HABITS.filter((item) => !existing.has(item.toLowerCase()));

  const create = async (value: string) => {
    const created = await addHabit(value);
    if (!created) return;
    sound.playClick();
    setTitle("");
    await refresh();
  };

  const toggle = async (id: string) => {
    sound.playClick();
    const isNowDone = await toggleHabit(id);
    if (isNowDone) {
      sound.playSuccess();
      if (doneToday + 1 >= total && total > 0) {
        sound.playLevelUp();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    }
    await refresh();
  };

  const confirmDelete = async () => {
    if (!habitToDelete) return;
    await removeHabit(habitToDelete.id);
    sound.playClick();
    setHabitToDelete(null);
    await refresh();
  };

  return (
    <Screen>
      <Header
        eyebrow="DISCIPLINA"
        title="Tus juramentos"
        subtitle="Lo que prometes, lo cumples. Sin negociar."
      />

      <Card>
        <div className="flex items-center justify-between">
          <SectionLabel>Últimos 7 días</SectionLabel>
          <span className="text-xs font-black text-[#2ED47A] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {perfectDays} días perfectos
          </span>
        </div>

        <div className="flex justify-between items-center py-2">
          {days.map((day) => {
            const isToday = day.key === today;
            const isFull = day.ratio >= 1;
            const isPartial = day.ratio > 0 && day.ratio < 1;

            return (
              <div key={day.key} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm transition-all border ${
                    isToday ? "ring-2 ring-[#FF5A1F] border-transparent" : "border-[#262631]"
                  } ${
                    isFull
                      ? "bg-[#2ED47A] text-[#08080C] border-[#2ED47A]"
                      : isPartial
                        ? "bg-[#FFB020]/20 text-[#FFB020] border-[#FFB020]/50"
                        : "bg-[#111117] text-[#7C7C8A]"
                  }`}
                >
                  {day.done}
                </div>
                <span
                  className={`text-[11px] font-black ${
                    isToday ? "text-[#FF5A1F]" : "text-[#A1A1AE]"
                  }`}
                >
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>

        <ProgressBar
          value={total ? doneToday / total : 0}
          color={FOCUS.success}
        />
        <span className="text-xs text-[#A1A1AE]">
          Hoy: {doneToday} de {total} cumplidos
        </span>
      </Card>

      <div className="flex flex-col gap-2.5">
        <SectionLabel>Hábitos</SectionLabel>
        {total === 0 ? (
          <Card>
            <span className="text-xs text-[#A1A1AE]">
              Sin hábitos todavía. Añade el primero abajo.
            </span>
          </Card>
        ) : (
          data.habits.map((habit) => (
            <HabitRow
              key={habit.id}
              title={habit.title}
              done={log.habitsDone.includes(habit.id)}
              meta={`Racha ${habitStreak(data.logs, habit.id)} días · +${habit.xp} XP`}
              onPress={() => void toggle(habit.id)}
              onDelete={() => setHabitToDelete(habit)}
            />
          ))
        )}
      </div>

      <Card>
        <SectionLabel>Nuevo juramento</SectionLabel>
        <div className="flex gap-2">
          <Field
            value={title}
            onChange={setTitle}
            placeholder="Ej: Estudiar 1 hora"
            maxLength={80}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && title.trim()) void create(title);
            }}
          />
          <Button
            label="Añadir"
            onClick={() => void create(title)}
            disabled={!title.trim()}
            icon={<Plus className="w-4 h-4" />}
          />
        </div>

        {suggestions.length > 0 && (
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-[11px] font-bold text-[#7C7C8A] uppercase tracking-wider">
              Sugerencias
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <Chip
                  key={item}
                  label={`+ ${item}`}
                  onClick={() => void create(item)}
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {habitToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#16161E] border border-[#262631] rounded-2xl max-w-sm w-full p-5 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-black text-[#F5F5F7]">Eliminar hábito</h3>
            <p className="text-sm text-[#A1A1AE]">
              ¿Seguro que quieres eliminar <strong className="text-[#F5F5F7]">"{habitToDelete.title}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 justify-end mt-2">
              <Button
                label="Cancelar"
                variant="secondary"
                onClick={() => setHabitToDelete(null)}
              />
              <Button
                label="Eliminar"
                variant="danger"
                onClick={() => void confirmDelete()}
              />
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
