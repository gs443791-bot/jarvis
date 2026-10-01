/**
 * Web Audio API synthesizer for HUD sound effects,
 * Holographic Movie-Grade Audio DSP Filters (Iron Man HUD Intercom & Malibu Lab acoustics),
 * and Web Speech API / Gemini Neural TTS voice pipeline.
 */

export interface JarvisVoiceConfig {
  engine: 'neural' | 'system';
  voicePreset: 'paul_bettany' | 'marco_antonio' | 'mark_vii';
  acousticFilter: 'helmet_hud' | 'malibu_lab' | 'studio';
  pitch: number;
  rate: number;
}

export const DEFAULT_VOICE_CONFIG: JarvisVoiceConfig = {
  engine: 'neural',
  voicePreset: 'marco_antonio', // Dublagem clássica Brasil
  acousticFilter: 'helmet_hud', // Efeito acústico de capacete HUD
  pitch: 0.94,
  rate: 0.98
};

const VOICE_CONFIG_KEY = 'jarvis_voice_configuration';

export function getStoredVoiceConfig(): JarvisVoiceConfig {
  try {
    const item = localStorage.getItem(VOICE_CONFIG_KEY);
    if (!item) return DEFAULT_VOICE_CONFIG;
    return { ...DEFAULT_VOICE_CONFIG, ...JSON.parse(item) };
  } catch (e) {
    return DEFAULT_VOICE_CONFIG;
  }
}

export function saveStoredVoiceConfig(cfg: JarvisVoiceConfig) {
  try {
    localStorage.setItem(VOICE_CONFIG_KEY, JSON.stringify(cfg));
  } catch (e) {}
}

let audioCtx: AudioContext | null = null;
let currentSourceNode: AudioBufferSourceNode | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play UI Tech Beep
export function playJarvisBeep(frequency = 880, duration = 0.08, type: OscillatorType = 'sine') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

// Chime for task completions
export function playChime() {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + index * 0.07;
      const duration = 0.35;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.06, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    });
  } catch (e) {}
}

// 432Hz Calming Tone
let calmingOscillator: OscillatorNode | null = null;
let calmingGain: GainNode | null = null;

export function startCalmingTone(frequency = 432) {
  try {
    const ctx = getAudioContext();
    if (calmingOscillator) return;

    calmingOscillator = ctx.createOscillator();
    calmingGain = ctx.createGain();

    calmingOscillator.type = 'sine';
    calmingOscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    calmingGain.gain.setValueAtTime(0.001, ctx.currentTime);
    calmingGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2.5);

    calmingOscillator.connect(filter);
    filter.connect(calmingGain);
    calmingGain.connect(ctx.destination);

    calmingOscillator.start();
  } catch (e) {}
}

export function stopCalmingTone() {
  try {
    if (calmingGain && audioCtx) {
      calmingGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
      setTimeout(() => {
        if (calmingOscillator) {
          try {
            calmingOscillator.stop();
            calmingOscillator.disconnect();
          } catch (_) {}
          calmingOscillator = null;
        }
        calmingGain = null;
      }, 1600);
    }
  } catch (e) {
    calmingOscillator = null;
    calmingGain = null;
  }
}

// Rain Generator
let rainSource: AudioBufferSourceNode | null = null;
let rainGain: GainNode | null = null;

export function startRainSound() {
  try {
    const ctx = getAudioContext();
    if (rainSource) return;

    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    rainSource = ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, ctx.currentTime);

    rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.001, ctx.currentTime);
    rainGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2);

    rainSource.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(ctx.destination);

    rainSource.start();
  } catch (e) {}
}

export function stopRainSound() {
  try {
    if (rainGain && audioCtx) {
      rainGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      setTimeout(() => {
        if (rainSource) {
          try {
            rainSource.stop();
            rainSource.disconnect();
          } catch (_) {}
          rainSource = null;
        }
        rainGain = null;
      }, 1300);
    }
  } catch (e) {
    rainSource = null;
    rainGain = null;
  }
}

/**
 * Real-Time Web Audio DSP Filter Chain:
 * Imparts the signature Stark Helmet HUD intercom texture or Malibu glass lab reflections!
 */
function applyHolographicAudioDSP(
  source: AudioNode,
  ctx: AudioContext,
  filterType: JarvisVoiceConfig['acousticFilter']
): AudioNode {
  if (filterType === 'studio') {
    return source;
  }

  // 1. Highpass filter to eliminate mud & give radio presence
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.setValueAtTime(filterType === 'helmet_hud' ? 140 : 90, ctx.currentTime);

  // 2. Peaking filter for the metallic helmet presence sheen
  const peaking = ctx.createBiquadFilter();
  peaking.type = 'peaking';
  peaking.frequency.setValueAtTime(3200, ctx.currentTime);
  peaking.Q.setValueAtTime(1.4, ctx.currentTime);
  peaking.gain.setValueAtTime(filterType === 'helmet_hud' ? 3.5 : 1.5, ctx.currentTime);

  // 3. Early reflection delay (simulates armor helmet interior or glass lab)
  const delay = ctx.createDelay();
  delay.delayTime.setValueAtTime(filterType === 'helmet_hud' ? 0.014 : 0.028, ctx.currentTime);

  const delayGain = ctx.createGain();
  delayGain.gain.setValueAtTime(filterType === 'helmet_hud' ? 0.12 : 0.18, ctx.currentTime);

  // 4. Dynamics Compressor for tight broadcast intercom leveling
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-18, ctx.currentTime);
  compressor.ratio.setValueAtTime(4.0, ctx.currentTime);
  compressor.attack.setValueAtTime(0.003, ctx.currentTime);
  compressor.release.setValueAtTime(0.15, ctx.currentTime);

  // Wire connections
  source.connect(highpass);
  highpass.connect(peaking);

  // Dry path
  peaking.connect(compressor);

  // Wet delay reflection path
  peaking.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(compressor);

  return compressor;
}

/**
 * Play Base64 Audio Buffer through the Holographic DSP Chain
 */
export async function playProcessedWav(
  base64Audio: string,
  filterType: JarvisVoiceConfig['acousticFilter'] = 'helmet_hud',
  onEnd?: () => void
): Promise<void> {
  stopSpeaking();

  const ctx = getAudioContext();
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  currentSourceNode = source;

  const dspOutput = applyHolographicAudioDSP(source, ctx, filterType);
  dspOutput.connect(ctx.destination);

  source.onended = () => {
    currentSourceNode = null;
    if (onEnd) onEnd();
  };

  source.start(0);
}

/**
 * High-Level JARVIS Voice Dispatcher:
 * Combines Gemini Neural Movie Voice + Holographic DSP Filter,
 * with graceful browser SpeechSynthesis fallback!
 */
export async function speakJarvis(
  text: string,
  customConfig?: Partial<JarvisVoiceConfig>,
  onEnd?: () => void
): Promise<void> {
  const config = { ...getStoredVoiceConfig(), ...customConfig };

  // Attempt Neural Voice first if selected
  if (config.engine === 'neural') {
    try {
      const res = await fetch('/api/jarvis/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voicePreset: config.voicePreset
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          await playProcessedWav(data.audioBase64, config.acousticFilter, onEnd);
          return;
        }
      }
    } catch (e) {
      console.warn('Neural TTS fallback to Web Speech:', e);
    }
  }

  // Web Speech API Fallback or Default
  speakText(text, onEnd, config);
}

// Text to Speech using Web Speech API with Movie Presets
export function speakText(
  text: string,
  onEnd?: () => void,
  customConfig?: Partial<JarvisVoiceConfig>
): SpeechSynthesisUtterance | null {
  if (!('speechSynthesis' in window)) return null;

  stopSpeaking();

  const config = { ...getStoredVoiceConfig(), ...customConfig };
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.rate = config.rate;
  utterance.pitch = config.pitch;

  const voices = window.speechSynthesis.getVoices();

  if (config.voicePreset === 'paul_bettany') {
    // English Paul Bettany voice
    const enVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('George') ||
          v.name.includes('Oliver') ||
          v.name.includes('Arthur') ||
          v.name.includes('Daniel') ||
          v.name.includes('UK') ||
          v.name.includes('British'))
    );
    if (enVoice) {
      utterance.voice = enVoice;
      utterance.lang = enVoice.lang;
    } else {
      utterance.lang = 'en-GB';
    }
  } else {
    // Portuguese Marco Antônio Costa style voice
    utterance.lang = 'pt-BR';
    const ptVoice = voices.find(
      (v) =>
        v.lang.startsWith('pt') &&
        (v.name.includes('Daniel') ||
          v.name.includes('Felipe') ||
          v.name.includes('Google') ||
          v.name.includes('Luciana') ||
          v.name.includes('Brazil'))
    );
    if (ptVoice) {
      utterance.voice = ptVoice;
    }
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if (currentSourceNode) {
    try {
      currentSourceNode.stop();
      currentSourceNode.disconnect();
    } catch (_) {}
    currentSourceNode = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Web Speech Recognition
export function createSpeechRecognizer(
  onResult: (transcript: string) => void,
  onError?: (error: any) => void
) {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  if (onError) {
    recognition.onerror = onError;
  }

  return recognition;
}
