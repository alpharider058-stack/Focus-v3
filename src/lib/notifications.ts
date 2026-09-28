import { sound } from "./sound";
import * as Notifications from "expo-notifications";

// Set default notification presentation handler for foreground
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
} catch {
  // Not in native environment or unsupported
}

export interface NotificationSettings {
  enabled: boolean;
  morning: boolean;
  morningTime: string; // "08:00"
  midday: boolean;
  middayTime: string;  // "13:30"
  afternoon: boolean;
  afternoonTime: string; // "18:30"
  night: boolean;
  nightTime: string;   // "21:45"
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  morning: true,
  morningTime: "08:00",
  midday: true,
  middayTime: "13:30",
  afternoon: true,
  afternoonTime: "18:30",
  night: true,
  nightTime: "21:45",
};

export interface Quote {
  id: string;
  phrase: string;
  author: string;
  category: "morning" | "midday" | "afternoon" | "night" | "focus";
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  // Mañana (Amanecer / Disciplina)
  {
    id: "m1",
    phrase: "El respeto no se regala, se forja antes de que el mundo despierte.",
    author: "Marco Aurelio",
    category: "morning",
  },
  {
    id: "m2",
    phrase: "No negocies con la pereza. Tu yo del futuro te agradecerá la disciplina de hoy.",
    author: "Focus Code",
    category: "morning",
  },
  {
    id: "m3",
    phrase: "Al amanecer, cuando te cueste levantarte, piensa: me levanto para hacer la labor de un hombre.",
    author: "Marco Aurelio",
    category: "morning",
  },
  {
    id: "m4",
    phrase: "Gana la mañana y ganarás el día entero. Empieza con tus juramentos.",
    author: "Séneca",
    category: "morning",
  },

  // Mediodía (Empuje y Resistencia)
  {
    id: "d1",
    phrase: "El dolor de la disciplina pesa onzas; el del arrepentimiento pesa toneladas.",
    author: "Jim Rohn",
    category: "midday",
  },
  {
    id: "d2",
    phrase: "No cuentes los días, haz que los días cuenten. Mantén la concentración.",
    author: "Muhammad Ali",
    category: "midday",
  },
  {
    id: "d3",
    phrase: "Cero excusas. El cansancio es solo una emoción; tu compromiso es una decisión.",
    author: "David Goggins",
    category: "midday",
  },
  {
    id: "d4",
    phrase: "Quien tiene un porqué para vivir, puede soportar casi cualquier cómo.",
    author: "Friedrich Nietzsche",
    category: "midday",
  },

  // Tarde (Persistencia sin rendición)
  {
    id: "a1",
    phrase: "El guerrero no descansa en medio de la contienda. Mantén el estándar.",
    author: "Miyamoto Musashi",
    category: "afternoon",
  },
  {
    id: "a2",
    phrase: "Una sola hora de enfoque profundo supera a ocho horas de trabajo distraído.",
    author: "Cal Newport",
    category: "afternoon",
  },
  {
    id: "a3",
    phrase: "La excelencia no es un acto fortuito, es un hábito innegociable.",
    author: "Aristóteles",
    category: "afternoon",
  },

  // Noche (Examen de Conciencia y Cierre)
  {
    id: "n1",
    phrase: "Frente al espejo esta noche: ¿puedes mirarte a los ojos con orgullo?",
    author: "Focus Code",
    category: "night",
  },
  {
    id: "n2",
    phrase: "No te vayas a dormir sin haber vencido a tu debilidad al menos una vez hoy.",
    author: "Epicteto",
    category: "night",
  },
  {
    id: "n3",
    phrase: "La tranquilidad nocturna es el privilegio de quien no le debe nada a su pereza.",
    author: "Séneca",
    category: "night",
  },
  {
    id: "n4",
    phrase: "Cierra tus juramentos del día. El honor se demuestra en los pequeños detalles.",
    author: "Focus Code",
    category: "night",
  },
];

const STORAGE_SETTINGS_KEY = "focus_notification_settings_v1";
const STORAGE_LAST_FIRED_KEY = "focus_notifications_last_fired_v1";

export function loadNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    void syncScheduledNotifications(settings);
  } catch {
    // ignore
  }
}

export function isNotificationSupported(): boolean {
  if (typeof window !== "undefined" && "Notification" in window) return true;
  return Boolean(Notifications?.requestPermissionsAsync);
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.permission;
  }
  return "default";
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  let granted = false;

  // 1. Try Native iOS Notifications (expo-notifications)
  try {
    if (Notifications?.requestPermissionsAsync) {
      const response = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: false,
          allowCriticalAlerts: false,
          provideAppNotificationSettings: true,
        },
      });
      if (response.status === "granted") {
        granted = true;
      }
    }
  } catch {
    // ignore
  }

  // 2. Try Web Notifications API
  if (typeof window !== "undefined" && "Notification" in window) {
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") granted = true;
    } catch {
      // ignore
    }
  }

  if (granted) {
    const settings = loadNotificationSettings();
    await syncScheduledNotifications(settings);
    return "granted";
  }

  return "denied";
}

export async function sendBrowserNotification(title: string, body: string, icon = "/Logo.png"): Promise<boolean> {
  let sent = false;

  // 1. Native iOS Notification via expo-notifications
  try {
    if (Notifications?.scheduleNotificationAsync) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: "default",
        },
        trigger: null, // immediate
      });
      sent = true;
    }
  } catch {
    // fallback to web
  }

  // 2. Web Notifications fallback
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      const notification = new Notification(title, {
        body,
        icon,
        badge: icon,
        tag: "focus-motivation",
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      sent = true;
    } catch {
      // ignore
    }
  }

  if (sent) {
    sound.playLevelUp();
  }

  return sent;
}

export function getRandomQuote(category?: Quote["category"]): Quote {
  const filtered = category
    ? MOTIVATIONAL_QUOTES.filter((q) => q.category === category)
    : MOTIVATIONAL_QUOTES;
  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index] || MOTIVATIONAL_QUOTES[0];
}

export async function sendTestMotivationNotification(): Promise<boolean> {
  const quote = getRandomQuote();
  return await sendBrowserNotification(
    "🔥 FOCUS · Frase de Guerra",
    `"${quote.phrase}" — ${quote.author}`
  );
}

// Sync native repeating iOS notifications for daily quotes
export async function syncScheduledNotifications(settings: NotificationSettings): Promise<void> {
  if (!Notifications?.cancelAllScheduledNotificationsAsync) return;

  try {
    // Cancel existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!settings.enabled) return;

    const slots: { key: keyof NotificationSettings; timeKey: keyof NotificationSettings; cat: Quote["category"]; title: string }[] = [
      { key: "morning", timeKey: "morningTime", cat: "morning", title: "☀️ Despierta con Honor" },
      { key: "midday", timeKey: "middayTime", cat: "midday", title: "⚔️ Impulso de Mediodía" },
      { key: "afternoon", timeKey: "afternoonTime", cat: "afternoon", title: "🛡️ Tarde de Disciplina" },
      { key: "night", timeKey: "nightTime", cat: "night", title: "🌙 Rendición de Cuentas" },
    ];

    for (const slot of slots) {
      if (settings[slot.key]) {
        const timeVal = settings[slot.timeKey] as string;
        const [hoursStr, minsStr] = timeVal.split(":");
        const hour = parseInt(hoursStr, 10);
        const minute = parseInt(minsStr, 10);

        if (!isNaN(hour) && !isNaN(minute)) {
          const quote = getRandomQuote(slot.cat);
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `FOCUS · ${slot.title}`,
              body: `"${quote.phrase}" — ${quote.author}`,
              sound: "default",
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour,
              minute,
            },
          });
        }
      }
    }
  } catch (err) {
    console.warn("Error scheduling native notifications:", err);
  }
}

// Fallback in-app checker for open tabs
export function checkAndFireScheduledNotifications(): void {
  const settings = loadNotificationSettings();
  if (!settings.enabled) return;

  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, "0");
  const currentMinutes = String(now.getMinutes()).padStart(2, "0");
  const currentTime = `${currentHours}:${currentMinutes}`;
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

  let lastFired: Record<string, string> = {};
  try {
    const raw = localStorage.getItem(STORAGE_LAST_FIRED_KEY);
    if (raw) lastFired = JSON.parse(raw);
  } catch {}

  const slots: { key: keyof NotificationSettings; timeKey: keyof NotificationSettings; cat: Quote["category"]; title: string }[] = [
    { key: "morning", timeKey: "morningTime", cat: "morning", title: "☀️ Despierta con Honor" },
    { key: "midday", timeKey: "middayTime", cat: "midday", title: "⚔️ Impulso de Mediodía" },
    { key: "afternoon", timeKey: "afternoonTime", cat: "afternoon", title: "🛡️ Tarde de Disciplina" },
    { key: "night", timeKey: "nightTime", cat: "night", title: "🌙 Rendición de Cuentas" },
  ];

  for (const slot of slots) {
    if (settings[slot.key] && settings[slot.timeKey] === currentTime) {
      const fireId = `${todayKey}-${slot.key}`;
      if (lastFired[fireId]) continue; // Already fired today

      const quote = getRandomQuote(slot.cat);
      void sendBrowserNotification(
        `FOCUS · ${slot.title}`,
        `"${quote.phrase}" — ${quote.author}`
      );

      lastFired[fireId] = new Date().toISOString();
      try {
        localStorage.setItem(STORAGE_LAST_FIRED_KEY, JSON.stringify(lastFired));
      } catch {}
      break;
    }
  }
}
