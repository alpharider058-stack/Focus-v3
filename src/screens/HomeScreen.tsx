import { Button, Card, HabitRow, Header, Loading, ProgressBar, Screen, SectionLabel, Stat } from "@/components/focus-web-ui";
import { FOCUS } from "@/constants/theme";
import { affirmationFor } from "@/data/affirmations";
import { computeStreak, dateKey, emptyLog, habitStreak, levelInfo, toggleHabit, type Snapshot } from "@/lib/focus-storage";
import { sound } from "@/lib/sound";
import confetti from "canvas-confetti";
import { Flame, CheckCircle, Clock, Sparkles, Bell } from "lucide-react";

function greeting(hour: number): string {
  if (hour < 6) return "Aún despierto";
  if (hour < 13) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

export default function HomeScreen({
  data,
  refresh,
  onNavigate,
  onOpenNotifications,
}: {
  data: Snapshot | null;
  refresh: () => Promise<Snapshot>;
  onNavigate: (tab: string) => void;
  onOpenNotifications?: () => void;
}) {
  if (!data) return <Loading />;

  const today = dateKey();
  const log = data.logs[today] ?? emptyLog(today);
  const streak = computeStreak(data.logs);
  const level = levelInfo(data.xp);
  const done = data.habits.filter((habit) => log.habitsDone.includes(habit.id)).length;
  const total = data.habits.length;
  const allDone = total > 0 && done >= total;
  const identity = data.profile?.identity ?? [];

  const onToggle = async (id: string) => {
    sound.playClick();
    const isNowDone = await toggleHabit(id);
    if (isNowDone) {
      sound.playSuccess();
      if (done + 1 >= total && total > 0) {
        sound.playLevelUp();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    }
    await refresh();
  };

  return (
    <Screen>
      <Header
        eyebrow={greeting(new Date().getHours()).toUpperCase()}
        title={data.profile?.name || "Hoy"}
        subtitle={data.profile?.goal ? `Objetivo: ${data.profile.goal}` : undefined}
      />

      <Card accent={FOCUS.ember}>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-black tracking-[0.2em] text-[#FF5A1F] block">
              NIVEL {level.level}
            </span>
            <span className="text-2xl font-black text-[#F5F5F7] tracking-tight">
              {level.title}
            </span>
          </div>
          <span className="text-lg font-black text-[#F5F5F7] tabular-nums">
            {data.xp} XP
          </span>
        </div>
        <ProgressBar value={level.progress} />
        <span className="text-xs text-[#A1A1AE] font-medium">
          {level.next - data.xp} XP para el nivel {level.level + 1}
        </span>
      </Card>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <Stat
          label="Racha"
          value={String(streak.current)}
          suffix="días"
          color={FOCUS.ember}
        />
        <Stat
          label="Hábitos"
          value={`${done}/${total}`}
          color={FOCUS.success}
        />
        <Stat
          label="Enfoque"
          value={String(log.focusMinutes)}
          suffix="min"
          color={FOCUS.violet}
        />
      </div>

      <Card>
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
          <SectionLabel>Afirmación de hoy</SectionLabel>
        </div>
        <p className="text-lg sm:text-xl font-bold text-[#F5F5F7] leading-snug italic">
          "{affirmationFor(today)}"
        </p>
      </Card>

      {onOpenNotifications && (
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenNotifications();
          }}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-[#16161E] border border-[#262631] hover:border-[#FF5A1F]/40 transition-colors cursor-pointer text-left group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FF5A1F]/15 flex items-center justify-center text-[#FF5A1F] group-hover:scale-105 transition-transform">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-[#F5F5F7]">
                Notificaciones Motivadoras iPhone
              </span>
              <span className="text-[11px] text-[#A1A1AE]">
                Frases de guerra por la mañana, mediodía y noche
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-[#FF5A1F] group-hover:translate-x-0.5 transition-transform">
            Configurar →
          </span>
        </button>
      )}

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <SectionLabel>
            {allDone ? "Día perfecto. Todo cumplido." : "Tus juramentos de hoy"}
          </SectionLabel>
          {allDone && (
            <span className="text-xs font-bold text-[#2ED47A] flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> 100%
            </span>
          )}
        </div>

        {total === 0 ? (
          <Card>
            <p className="text-sm text-[#A1A1AE]">
              Aún no tienes hábitos. Añádelos en la sección de Disciplina.
            </p>
            <Button
              label="Ir a Disciplina"
              variant="secondary"
              onClick={() => onNavigate("disciplina")}
              className="mt-2"
            />
          </Card>
        ) : (
          data.habits.map((habit) => (
            <HabitRow
              key={habit.id}
              title={habit.title}
              done={log.habitsDone.includes(habit.id)}
              meta={`Racha ${habitStreak(data.logs, habit.id)} · +${habit.xp} XP`}
              onPress={() => void onToggle(habit.id)}
            />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
        <Button
          label="Iniciar enfoque"
          onClick={() => onNavigate("enfoque")}
          icon={<Clock className="w-4 h-4" />}
        />
        <Button
          label="Check-in de ego"
          variant="secondary"
          onClick={() => onNavigate("ego")}
          icon={<Flame className="w-4 h-4 text-[#8B7CFF]" />}
        />
      </div>

      {identity.length > 0 && (
        <Card accent={FOCUS.violet}>
          <SectionLabel>Recuerda quién eres</SectionLabel>
          <div className="flex flex-col gap-2 pt-1">
            {identity.map((item, index) => (
              <div key={`home-identity-${index}`} className="flex items-start gap-2.5">
                <span className="text-[#8B7CFF] text-xs mt-1">◆</span>
                <span className="text-sm font-semibold text-[#F5F5F7] leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </Screen>
  );
}
