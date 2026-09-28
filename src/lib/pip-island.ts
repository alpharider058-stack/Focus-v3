/**
 * Picture-in-Picture (PiP) Floating Live Timer for iPhone and Desktop.
 * Renders a high-contrast dark Dynamic Island widget to an off-screen HTML5 Canvas,
 * streamed into a hidden HTML5 Video element and popped into native Picture-in-Picture.
 *
 * When the user exits the browser or locks/switches apps, iOS / iPadOS / macOS
 * keeps this floating live widget on top of all other apps.
 */

let canvas: HTMLCanvasElement | null = null;
let video: HTMLVideoElement | null = null;
let animationFrameId: number | null = null;
let isPipActive = false;

export function isPictureInPictureSupported(): boolean {
  if (typeof document === "undefined") return false;
  return (
    "pictureInPictureEnabled" in document ||
    // Safari / iOS WebKit Presentation Mode
    typeof HTMLVideoElement !== "undefined" &&
      "webkitSupportsPresentationMode" in HTMLVideoElement.prototype
  );
}

function initPipElements(): { canvas: HTMLCanvasElement; video: HTMLVideoElement } {
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.width = 360;
    canvas.height = 160;
    canvas.style.display = "none";
    document.body.appendChild(canvas);
  }

  if (!video) {
    video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.style.position = "fixed";
    video.style.left = "-9999px";
    video.style.width = "1px";
    video.style.height = "1px";
    video.style.opacity = "0";
    video.style.pointerEvents = "none";
    document.body.appendChild(video);

    video.addEventListener("leavepictureinpicture", () => {
      isPipActive = false;
      stopDrawingLoop();
    });
  }

  return { canvas, video };
}

function drawDynamicIslandFrame(
  ctx: CanvasRenderingContext2D,
  remainingSeconds: number,
  totalSeconds: number,
  intent: string,
  isPaused: boolean
) {
  const width = 360;
  const height = 160;

  // Clear background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  // Dynamic Island Rounded Pill Container
  const pillX = 20;
  const pillY = 16;
  const pillW = 320;
  const pillH = 128;
  const radius = 38;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, radius);
  ctx.fillStyle = "#0D0D12";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = isPaused ? "#7C7C8A" : "#FF5A1F";
  ctx.stroke();
  ctx.restore();

  // Left: Ember Glowing Core or Pause symbol
  const iconCenterX = 66;
  const iconCenterY = 80;

  if (isPaused) {
    ctx.fillStyle = "#A1A1AE";
    ctx.fillRect(iconCenterX - 8, iconCenterY - 12, 5, 24);
    ctx.fillRect(iconCenterX + 3, iconCenterY - 12, 5, 24);
  } else {
    // Glowing Ember Circle
    const grad = ctx.createRadialGradient(
      iconCenterX,
      iconCenterY,
      2,
      iconCenterX,
      iconCenterY,
      26
    );
    grad.addColorStop(0, "#FF8A5B");
    grad.addColorStop(0.5, "#FF5A1F");
    grad.addColorStop(1, "rgba(255, 90, 31, 0.15)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(iconCenterX, iconCenterY, 22, 0, Math.PI * 2);
    ctx.fill();

    // Inner diamond glyph
    ctx.fillStyle = "#08080C";
    ctx.beginPath();
    ctx.moveTo(iconCenterX, iconCenterY - 9);
    ctx.lineTo(iconCenterX + 8, iconCenterY);
    ctx.lineTo(iconCenterX, iconCenterY + 9);
    ctx.lineTo(iconCenterX - 8, iconCenterY);
    ctx.closePath();
    ctx.fill();
  }

  // Right / Center: Formatted Countdown
  const safe = Math.max(0, Math.ceil(remainingSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  const timeStr = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  ctx.fillStyle = "#F5F5F7";
  ctx.font = "bold 44px monospace, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(timeStr, 114, 66);

  // Status & Intent Label
  ctx.fillStyle = isPaused ? "#A1A1AE" : "#FF5A1F";
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, sans-serif";
  const statusLabel = isPaused ? "PAUSA · FOCUS" : "ENFOQUE ACTIVO";
  ctx.fillText(statusLabel, 115, 102);

  if (intent) {
    ctx.fillStyle = "#A1A1AE";
    ctx.font = "12px -apple-system, sans-serif";
    const truncated = intent.length > 18 ? intent.slice(0, 18) + "..." : intent;
    ctx.fillText(`• ${truncated}`, 210, 102);
  }

  // Bottom Sleek Progress Line
  const progressRatio = totalSeconds > 0 ? Math.min(1, (totalSeconds - remainingSeconds) / totalSeconds) : 0;
  const lineY = 126;
  const lineStartX = 114;
  const lineMaxW = 200;

  ctx.fillStyle = "#262631";
  ctx.beginPath();
  ctx.roundRect(lineStartX, lineY, lineMaxW, 4, 2);
  ctx.fill();

  ctx.fillStyle = isPaused ? "#7C7C8A" : "#FF5A1F";
  ctx.beginPath();
  ctx.roundRect(lineStartX, lineY, Math.max(4, lineMaxW * progressRatio), 4, 2);
  ctx.fill();
}

function stopDrawingLoop() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

export async function startPictureInPicture(
  getRemaining: () => { remainingSeconds: number; totalSeconds: number; intent: string; isPaused: boolean }
): Promise<boolean> {
  try {
    const { canvas: cv, video: vd } = initPipElements();
    const ctx = cv.getContext("2d");
    if (!ctx) return false;

    // Connect canvas stream to video
    const canvasAny = cv as HTMLCanvasElement & { captureStream?: (fps?: number) => MediaStream };
    if (!vd.srcObject && canvasAny.captureStream) {
      vd.srcObject = canvasAny.captureStream(24);
    }

    const loop = () => {
      const { remainingSeconds, totalSeconds, intent, isPaused } = getRemaining();
      drawDynamicIslandFrame(ctx, remainingSeconds, totalSeconds, intent, isPaused);
      animationFrameId = requestAnimationFrame(loop);
    };

    stopDrawingLoop();
    loop();

    await vd.play();

    // Trigger native Picture-in-Picture
    if (document.pictureInPictureElement) {
      isPipActive = true;
      return true;
    }

    if (vd.requestPictureInPicture) {
      await vd.requestPictureInPicture();
      isPipActive = true;
      return true;
    }

    // @ts-expect-error Safari webkitSetPresentationMode
    if (vd.webkitSetPresentationMode) {
      // @ts-expect-error Safari
      vd.webkitSetPresentationMode("picture-in-picture");
      isPipActive = true;
      return true;
    }

    return false;
  } catch (err) {
    console.warn("Picture in Picture request failed:", err);
    return false;
  }
}

export async function exitPictureInPicture(): Promise<void> {
  stopDrawingLoop();
  isPipActive = false;
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    }
  } catch {}
}

export function isCurrentlyInPip(): boolean {
  return isPipActive || Boolean(document.pictureInPictureElement);
}
