import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSnapshot } from "@/hooks/use-snapshot";
import OnboardingWeb from "@/components/OnboardingWeb";
import ThreeEntrance from "@/components/ThreeEntrance";
import DynamicIsland from "@/components/DynamicIsland";
import NotificationsModal from "@/components/NotificationsModal";
import HomeScreen from "@/screens/HomeScreen";
import DisciplineScreen from "@/screens/DisciplineScreen";
import FocusScreen from "@/screens/FocusScreen";
import EgoScreen from "@/screens/EgoScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import { Loading } from "@/components/focus-web-ui";
import { sound } from "@/lib/sound";
import { checkAndFireScheduledNotifications } from "@/lib/notifications";
import { saveActiveFocus, focusElapsedSeconds } from "@/lib/focus-storage";
import { Flame, CheckSquare, Clock, Sparkles, User, Box, Bell } from "lucide-react";

type Tab = "hoy" | "disciplina" | "enfoque" | "ego" | "perfil";

export default function App() {
  const { data, refresh } = useSnapshot();
  const [activeTab, setActiveTab] = useState<Tab>("hoy");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEntrance, setShowEntrance] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("focus_intro_seen") !== "true";
    } catch {
      return true;
    }
  });

  // Scheduled notifications runner
  useEffect(() => {
    checkAndFireScheduledNotifications();
    const interval = setInterval(() => {
      checkAndFireScheduledNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFinishEntrance = () => {
    try {
      sessionStorage.setItem("focus_intro_seen", "true");
    } catch {
      // ignore
    }
    setShowEntrance(false);
  };

  const handleReplay3D = () => {
    sound.playClick();
    setShowEntrance(true);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-[#08080C] text-[#F5F5F7] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // 3D Entrance Sequence
  if (showEntrance) {
    return <ThreeEntrance onComplete={handleFinishEntrance} />;
  }

  if (!data.profile) {
    return <OnboardingWeb onFinished={() => void refresh()} />;
  }

  const hasRunningFocus = Boolean(data.active && !data.active.paused);

  const tabs: { id: Tab; label: string; icon: typeof Flame }[] = [
    { id: "hoy", label: "Hoy", icon: Flame },
    { id: "disciplina", label: "Disciplina", icon: CheckSquare },
    { id: "enfoque", label: "Enfoque", icon: Clock },
    { id: "ego", label: "Ego", icon: Sparkles },
    { id: "perfil", label: "Perfil", icon: User },
  ];

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab) return;
    sound.playClick();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#08080C] text-[#F5F5F7] flex flex-col font-sans selection:bg-[#FF5A1F] selection:text-black">
      {/* Floating Dynamic Island when active focus session is running/paused outside Enfoque tab */}
      {data.active && activeTab !== "enfoque" && (
        <DynamicIsland
          active={data.active}
          onNavigateToFocus={() => handleTabChange("enfoque")}
          onTogglePause={async () => {
            if (!data.active) return;
            const time = Date.now();
            const next = data.active.paused
              ? { ...data.active, paused: false, startedAt: time }
              : { ...data.active, paused: true, elapsedBefore: focusElapsedSeconds(data.active, time) };
            await saveActiveFocus(next);
            await refresh();
          }}
        />
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#08080C]/85 backdrop-blur-md border-b border-[#262631]/70 px-4 py-3 sm:px-6 transition-colors">
        <div className="max-w-[760px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.img
              whileHover={{ rotate: 10, scale: 1.05 }}
              src="/Logo.png"
              alt="Focus Logo"
              className="w-7 h-7 rounded-lg object-contain cursor-pointer"
              onClick={handleReplay3D}
            />
            <span className="font-black text-sm tracking-[0.25em] text-[#FF5A1F] select-none">
              FOCUS
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sound.playClick();
                setShowNotifications(true);
              }}
              title="Notificaciones motivadoras diarias"
              className="p-2 text-xs font-bold text-[#A1A1AE] hover:text-[#FF5A1F] bg-[#16161E] border border-[#262631] hover:border-[#FF5A1F]/40 rounded-full cursor-pointer transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReplay3D}
              title="Ver animación 3D"
              className="flex items-center gap-1.5 text-xs font-bold text-[#A1A1AE] hover:text-[#FF5A1F] bg-[#16161E] border border-[#262631] hover:border-[#FF5A1F]/40 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
            >
              <Box className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Intro 3D</span>
            </motion.button>

            <span className="text-xs font-extrabold text-[#F5F5F7] bg-[#16161E] border border-[#262631] px-3 py-1 rounded-full tabular-nums">
              {data.xp} XP
            </span>
          </div>
        </div>
      </header>

      {/* Main Screen Content with fluid spring transitions */}
      <main className="flex-1 flex flex-col overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "hoy" && (
            <motion.div
              key="tab-hoy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <HomeScreen
                data={data}
                refresh={refresh}
                onNavigate={(t) => handleTabChange(t as Tab)}
                onOpenNotifications={() => setShowNotifications(true)}
              />
            </motion.div>
          )}
          {activeTab === "disciplina" && (
            <motion.div
              key="tab-disciplina"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <DisciplineScreen data={data} refresh={refresh} />
            </motion.div>
          )}
          {activeTab === "enfoque" && (
            <motion.div
              key="tab-enfoque"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <FocusScreen data={data} refresh={refresh} />
            </motion.div>
          )}
          {activeTab === "ego" && (
            <motion.div
              key="tab-ego"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <EgoScreen data={data} refresh={refresh} />
            </motion.div>
          )}
          {activeTab === "perfil" && (
            <motion.div
              key="tab-perfil"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProfileScreen
                data={data}
                refresh={refresh}
                onOpenNotifications={() => setShowNotifications(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Fixed Bottom Navigation Bar with sliding active indicator */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#111117]/95 backdrop-blur-xl border-t border-[#262631] py-2 px-3 pb-safe shadow-2xl">
        <div className="max-w-[500px] mx-auto flex items-center justify-around relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isFocusActive = tab.id === "enfoque" && hasRunningFocus;

            return (
              <motion.button
                key={tab.id}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-xl cursor-pointer relative z-10 transition-colors ${
                  isActive ? "text-[#FF5A1F]" : "text-[#7C7C8A] hover:text-[#A1A1AE]"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
                  {isFocusActive && (
                    <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#FF5A1F] animate-ping" />
                  )}
                </div>
                <span className="text-[11px] font-black tracking-wider uppercase">
                  {tab.label}
                </span>

                {/* Sliding native pill indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1 w-6 h-0.5 rounded-full bg-[#FF5A1F] shadow-[0_0_8px_#FF5A1F]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Daily Motivational Notifications Configuration Modal */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
}
