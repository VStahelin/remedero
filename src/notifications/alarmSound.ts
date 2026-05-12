type AudioSound = import("expo-av").Audio.Sound;

let activeSound: AudioSound | null = null;

function getAudio(): typeof import("expo-av").Audio | null {
  try {
    return (require("expo-av") as typeof import("expo-av")).Audio;
  } catch {
    return null;
  }
}

export async function startAlarmSound(uri: string): Promise<void> {
  const Audio = getAudio();
  if (!Audio) return;

  await stopAlarmSound();

  try {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
      playsInSilentModeIOS: true,
    });
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { isLooping: true, shouldPlay: true, volume: 1.0 },
    );
    activeSound = sound;
  } catch {
    // expo-av unavailable (Expo Go)
  }
}

export async function stopAlarmSound(): Promise<void> {
  if (!activeSound) return;
  const s = activeSound;
  activeSound = null;
  try {
    await s.stopAsync();
    await s.unloadAsync();
  } catch {}
}
