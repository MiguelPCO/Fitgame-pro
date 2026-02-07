let audioContext: AudioContext | null = null;

/**
 * Get or create the AudioContext (lazy initialization)
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play a notification sound (double beep)
 */
export function playNotificationSound(): void {
  try {
    const ctx = getAudioContext();

    // Resume context if suspended (required for some browsers)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Double beep sound pattern
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error('Audio play failed', e);
  }
}

/**
 * Trigger haptic feedback if available
 */
export function triggerHapticFeedback(pattern: number[] = [200, 100, 200]): void {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    console.error('Haptic feedback failed', e);
  }
}

/**
 * Play notification sound and trigger haptic feedback
 */
export function playNotification(): void {
  playNotificationSound();
  triggerHapticFeedback();
}
