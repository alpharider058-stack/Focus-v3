export async function startNativeLiveActivity(
  title: string,
  totalMinutes: number,
  endTimeMillis: number
): Promise<string | null> {
  try {
    // Dynamic import to prevent bundler failure on web
    const { requireNativeModule } = await import("expo-modules-core");
    const mod = requireNativeModule("FocusLiveActivity");
    if (mod?.startLiveActivity) {
      return await mod.startLiveActivity(title, totalMinutes, endTimeMillis);
    }
    return null;
  } catch {
    return null;
  }
}

export async function updateNativeLiveActivity(
  activityId: string,
  isPaused: boolean,
  remainingSeconds?: number
): Promise<void> {
  try {
    const { requireNativeModule } = await import("expo-modules-core");
    const mod = requireNativeModule("FocusLiveActivity");
    if (mod?.updateLiveActivity) {
      await mod.updateLiveActivity(activityId, isPaused, remainingSeconds);
    }
  } catch {
    // ignore
  }
}

export async function endNativeLiveActivity(activityId?: string): Promise<void> {
  try {
    const { requireNativeModule } = await import("expo-modules-core");
    const mod = requireNativeModule("FocusLiveActivity");
    if (mod?.endLiveActivity) {
      await mod.endLiveActivity(activityId);
    }
  } catch {
    // ignore
  }
}
