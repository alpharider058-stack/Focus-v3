import { sound } from "./sound";

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
  } catch {
    // ignore
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return "denied";
  }
}

export function sendBrowserNotification(title: string, body: string, icon = "/Logo.png"): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== "granted") return false;

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

    sound.playLevelUp();
    return true;
  } catch (err) {
    console.error("Error sending notification:", err);
    return false;
  }
}

export function getRandomQuote(category?: Quote["category"]): Quote {
  const filtered = category
    ? MOTIVATIONAL_QUOTES.filter((q) => q.category === category)
    : MOTIVATIONAL_QUOTES;
  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index] || MOTIVATIONAL_QUOTES[0];
}

export function sendTestMotivationNotification(): boolean {
  const quote = getRandomQuote();
  return sendBrowserNotification(
    "🔥 FOCUS · Frase del Día",
    `"${quote.phrase}" — ${quote.author}`
  );
}

// Check scheduled times and fire if it's the minute
export function checkAndFireScheduledNotifications(): void {
  const settings = loadNotificationSettings();
  if (!settings.enabled) return;
  if (getNotificationPermission() !== "granted") return;

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
      const sent = sendBrowserNotification(
        `FOCUS · ${slot.title}`,
        `"${quote.phrase}" — ${quote.author}`
      );

      if (sent) {
        lastFired[fireId] = new Date().toISOString();
        try {
          localStorage.setItem(STORAGE_LAST_FIRED_KEY, JSON.stringify(lastFired));
        } catch {}
      }
      break;
    }
  }
}
