// Audio is opt-in and only synthesized in response to a visitor's interaction.
export function createShopAudio() {
  let context: AudioContext | undefined;
  let enabled = false;
  return {
    async enable(value: boolean) {
      enabled = value;
      if (!value) {
        await context?.suspend().catch(() => {});
        return;
      }
      try {
        context ??= new AudioContext();
        await context.resume();
      } catch {
        enabled = false;
      }
    },
    click(stamp = false) {
      if (
        !enabled ||
        !context ||
        context.state !== "running" ||
        document.hidden
      )
        return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(
        stamp ? 130 : 420,
        context.currentTime,
      );
      oscillator.frequency.exponentialRampToValueAtTime(
        45,
        context.currentTime + 0.07,
      );
      gain.gain.setValueAtTime(0.035, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.09);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.1);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    },
    dispose() {
      enabled = false;
      void context?.close().catch(() => {});
      context = undefined;
    },
  };
}
