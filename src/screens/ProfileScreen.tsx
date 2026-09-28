import { useState } from "react";
import { BarChart, Button, Card, Header, Loading, ProgressBar, Screen, SectionLabel, Stat } from "@/components/focus-web-ui";
import { FOCUS } from "@/constants/theme";
import {
  clearAll,
  computeStreak,
  getAchievements,
  getTotals,
  lastDays,
  levelInfo,
  type Snapshot,
} from "@/lib/focus-storage";
import { sound } from "@/lib/sound";
import { Star, Circle, Trash2, Award, Bell } from "lucide-react";

export default function ProfileScreen({
  data,
  refresh,
  onOpenNotifications,
}: {
  data: Snapshot | null;
  refresh: () => Promise<Snapshot>;
  onOpenNotifications?: () => void;
}) {
  const [showResetModal, setShowResetModal] = useState(false);

  if (!data) return <Loading />;

  const level = levelInfo(data.xp);
  const streak = computeStreak(data.logs);
  const totals = getTotals(data);
  const achievements = getAchievements({
    xp: data.xp,
    bestStreak: streak.best,
    totalHabits: totals.totalHabits,
    totalFocus: totals.totalFocus,
    wins: data.wins.length,
    mirrorDays: totals.mirrorDays,
  });
  const unlocked = achievements.filter((item) => item.unlocked).length;
  const week = lastDays(7).map((day) => ({
    key: day.key,
    label: day.label,
    value: data.logs[day.key]?.focusMinutes ?? 0,
  }));

  const handleReset = async () => {
    sound.playClick();
    await clearAll();
    setShowResetModal(false);
    await refresh();
  };

  return (
    <Screen>
      <Header
        eyebrow="PERFIL"
        title={data.profile?.name || "Tú"}
        subtitle={data.profile?.goal}
      />

      <Card accent={FOCUS.ember}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FF5A1F]/15 border-2 border-[#FF5A1F] flex items-center justify-center shrink-0">
            <span className="text-2xl font-black text-[#FF5A1F]">{level.level}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-black text-[#F5F5F7] tracking-tight">
              {level.title}
            </h2>
            <span className="text-xs text-[#A1A1AE] font-medium">
              {data.xp} XP · siguiente nivel en {level.next - data.xp} XP
            </span>
          </div>
        </div>
        <ProgressBar value={level.progress} />
      </Card>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <Stat
          label="Racha actual"
          value={String(streak.current)}
          suffix="días"
          color={FOCUS.ember}
        />
        <Stat
          label="Mejor racha"
          value={String(streak.best)}
          suffix="días"
          color={FOCUS.warning}
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <Stat
          label="Enfoque total"
          value={String(totals.totalFocus)}
          suffix="min"
          color={FOCUS.violet}
        />
        <Stat
          label="Hábitos cumplidos"
          value={String(totals.totalHabits)}
          color={FOCUS.success}
        />
      </div>

      <Card>
        <SectionLabel>Minutos de enfoque (7 días)</SectionLabel>
        <BarChart items={week} color={FOCUS.ember} />
      </Card>

      {Boolean(data.profile?.identity.length) && (
        <Card accent={FOCUS.violet}>
          <SectionLabel>Tu identidad</SectionLabel>
          <div className="flex flex-col gap-2 pt-1">
            {data.profile?.identity.map((item, index) => (
              <div key={`profile-identity-${index}`} className="flex items-start gap-2.5">
                <span className="text-[#8B7CFF] text-xs mt-1">◆</span>
                <span className="text-sm font-semibold text-[#F5F5F7]">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FF5A1F]" />
            <SectionLabel>Logros</SectionLabel>
          </div>
          <span className="text-xs font-black text-[#A1A1AE]">
            {unlocked}/{achievements.length}
          </span>
        </div>

        <div className="flex flex-col divide-y divide-[#262631]">
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3.5 py-3 first:pt-1 last:pb-1 transition-opacity ${
                item.unlocked ? "opacity-100" : "opacity-45"
              }`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                {item.unlocked ? (
                  <Star className="w-5 h-5 text-[#FF5A1F] fill-[#FF5A1F]" />
                ) : (
                  <Circle className="w-5 h-5 text-[#7C7C8A]" />
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-bold text-[#F5F5F7]">
                  {item.title}
                </span>
                <span className="text-xs text-[#A1A1AE]">
                  {item.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-2.5 mt-2">
        {onOpenNotifications && (
          <Button
            label="Notificaciones motivadoras diarias"
            variant="secondary"
            onClick={() => {
              sound.playClick();
              onOpenNotifications();
            }}
            icon={<Bell className="w-4 h-4 text-[#FF5A1F]" />}
          />
        )}

        <Button
          label="Revivir animación 3D de entrada"
          variant="secondary"
          onClick={() => {
            sound.playClick();
            try {
              sessionStorage.removeItem("focus_intro_seen");
            } catch {}
            window.location.reload();
          }}
          icon={<Award className="w-4 h-4 text-[#FF5A1F]" />}
        />

        <Button
          label="Borrar todos mis datos"
          variant="danger"
          onClick={() => setShowResetModal(true)}
          icon={<Trash2 className="w-4 h-4" />}
        />
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#16161E] border border-[#262631] rounded-2xl max-w-sm w-full p-5 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-lg font-black text-[#FF4D5E]">Borrar todos los datos</h3>
            <p className="text-sm text-[#A1A1AE] leading-relaxed">
              Perderás tu nivel, rachas, hábitos acumulados y registros históricos. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 justify-end mt-2">
              <Button
                label="Cancelar"
                variant="secondary"
                onClick={() => setShowResetModal(false)}
              />
              <Button
                label="Borrar todo"
                variant="danger"
                onClick={() => void handleReset()}
              />
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
