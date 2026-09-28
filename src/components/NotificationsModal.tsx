import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, Flame, Sparkles, Smartphone, ShieldCheck, Clock } from "lucide-react";
import {
  loadNotificationSettings,
  saveNotificationSettings,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestMotivationNotification,
  type NotificationSettings,
} from "@/lib/notifications";
import { sound } from "@/lib/sound";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [settings, setSettings] = useState<NotificationSettings>(loadNotificationSettings());
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(loadNotificationSettings());
      setPermission(getNotificationPermission());
      setTestSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    sound.playClick();
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === "granted") {
      sound.playLevelUp();
      const updated = { ...settings, enabled: true };
      setSettings(updated);
      saveNotificationSettings(updated);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    sound.playClick();
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleTimeChange = (key: keyof NotificationSettings, val: string) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleTestNow = async () => {
    sound.playClick();
    const sent = await sendTestMotivationNotification();
    setTestSuccess(sent);
    setTimeout(() => setTestSuccess(null), 4000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: "spring", stiffness: 450, damping: 30 }}
          className="w-full max-w-md bg-[#16161E] border border-[#262631] rounded-3xl p-5 sm:p-6 text-[#F5F5F7] shadow-2xl flex flex-col gap-4.5 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FF5A1F]/15 flex items-center justify-center text-[#FF5A1F]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#F5F5F7] tracking-tight">
                  Notificaciones Diarias
                </h3>
                <p className="text-xs text-[#A1A1AE]">
                  Frases de guerra, disciplina y respeto propio
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-[#111117] border border-[#262631] flex items-center justify-center text-[#A1A1AE] hover:text-[#F5F5F7] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* iOS / iPhone Status Banner */}
          <div className="bg-[#111117] rounded-2xl border border-[#262631] p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#8B7CFF]" />
                <span className="text-xs font-bold text-[#F5F5F7]">
                  Compatibilidad iPhone (iOS)
                </span>
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  permission === "granted"
                    ? "border-[#2ED47A]/30 bg-[#2ED47A]/15 text-[#2ED47A]"
                    : "border-[#FF5A1F]/30 bg-[#FF5A1F]/15 text-[#FF5A1F]"
                }`}
              >
                {permission === "granted" ? "Activo" : "Requiere permiso"}
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AE] leading-relaxed">
              En iPhone (iOS 16.4+), para recibir notificaciones fuera de la app, pulsa el botón{" "}
              <strong className="text-[#F5F5F7]">Compartir (↑)</strong> en Safari y selecciona{" "}
              <strong className="text-[#FF5A1F]">«Añadir a pantalla de inicio»</strong>.
            </p>

            {permission !== "granted" && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="mt-1 py-2 px-3 rounded-xl bg-[#FF5A1F] text-[#08080C] text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Permitir Notificaciones</span>
              </button>
            )}
          </div>

          {/* Notification Schedule Toggles */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-black tracking-wider uppercase text-[#A1A1AE]">
              Horarios de Recordatorio
            </span>

            {/* Mañana */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#111117] border border-[#262631]">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#F5F5F7] flex items-center gap-1.5">
                  <span>☀️</span> Amanecer & Juramentos
                </span>
                <span className="text-[10px] text-[#A1A1AE]">Marco Aurelio · Despertar con honor</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={settings.morningTime}
                  onChange={(e) => handleTimeChange("morningTime", e.target.value)}
                  className="bg-[#1D1D27] text-xs font-mono font-bold text-[#F5F5F7] border border-[#262631] rounded-lg px-2 py-1 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleToggle("morning")}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                    settings.morning ? "bg-[#FF5A1F]" : "bg-[#262631]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.morning ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Mediodía */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#111117] border border-[#262631]">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#F5F5F7] flex items-center gap-1.5">
                  <span>⚔️</span> Impulso de Mediodía
                </span>
                <span className="text-[10px] text-[#A1A1AE]">David Goggins · Cero quejas</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={settings.middayTime}
                  onChange={(e) => handleTimeChange("middayTime", e.target.value)}
                  className="bg-[#1D1D27] text-xs font-mono font-bold text-[#F5F5F7] border border-[#262631] rounded-lg px-2 py-1 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleToggle("midday")}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                    settings.midday ? "bg-[#FF5A1F]" : "bg-[#262631]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.midday ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Tarde */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#111117] border border-[#262631]">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#F5F5F7] flex items-center gap-1.5">
                  <span>🛡️</span> Tarde de Guerra
                </span>
                <span className="text-[10px] text-[#A1A1AE]">Musashi · Mantener el estándar</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={settings.afternoonTime}
                  onChange={(e) => handleTimeChange("afternoonTime", e.target.value)}
                  className="bg-[#1D1D27] text-xs font-mono font-bold text-[#F5F5F7] border border-[#262631] rounded-lg px-2 py-1 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleToggle("afternoon")}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                    settings.afternoon ? "bg-[#FF5A1F]" : "bg-[#262631]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.afternoon ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Noche */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#111117] border border-[#262631]">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#F5F5F7] flex items-center gap-1.5">
                  <span>🌙</span> Cierre & Rendición de Cuentas
                </span>
                <span className="text-[10px] text-[#A1A1AE]">Séneca · Frente al espejo</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={settings.nightTime}
                  onChange={(e) => handleTimeChange("nightTime", e.target.value)}
                  className="bg-[#1D1D27] text-xs font-mono font-bold text-[#F5F5F7] border border-[#262631] rounded-lg px-2 py-1 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleToggle("night")}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                    settings.night ? "bg-[#FF5A1F]" : "bg-[#262631]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.night ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Test Button */}
          <div className="pt-1 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleTestNow}
              className="w-full py-3 px-4 rounded-xl bg-[#1D1D27] hover:bg-[#252533] border border-[#262631] hover:border-[#FF5A1F]/50 text-xs font-extrabold text-[#F5F5F7] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
              <span>Probar Notificación Motivadora Ahora</span>
            </button>

            {testSuccess === true && (
              <p className="text-[11px] text-[#2ED47A] text-center font-bold">
                ✓ Notificación de prueba enviada con éxito.
              </p>
            )}
            {testSuccess === false && (
              <p className="text-[11px] text-[#FF4D5E] text-center font-bold">
                ⚠ Permiso no concedido en el navegador o dispositivo.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
