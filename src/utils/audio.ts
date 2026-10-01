/**
 * Web Audio API synthesizer for HUD sound effects,
 * Calming soundscapes (432Hz binaural & rain noise),
 * and Web Speech API text-to-speech & speech recognition.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Tech beep for UI actions
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
  } catch (e) {
    // Ignore audio autoplay restrictions gracefully
  }
}

// Chime for task completions / level up
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

// 432Hz Healing / Calming Tone Generator
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

    // Warm filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    calmingGain.gain.setValueAtTime(0.001, ctx.currentTime);
    calmingGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2.5); // Smooth fade-in

    calmingOscillator.connect(filter);
    filter.connect(calmingGain);
    calmingGain.connect(ctx.destination);

    calmingOscillator.start();
  } catch (e) {
    console.error('Error starting calming tone:', e);
  }
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

// Synthetic soothing rain noise generator
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

    // Generate brown/pink noise (sounds like soft rain)
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    rainSource = ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    // Filter to sound like soft gentle rain outside
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
  } catch (e) {
    console.error('Error starting rain audio:', e);
  }
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

// Text to Speech using Web Speech API (fallback or instant zero-latency speech)
export function speakText(text: string, onEnd?: () => void): SpeechSynthesisUtterance | null {
  if (!('speechSynthesis' in window)) return null;

  window.speechSynthesis.cancel(); // cancel previous speaking

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.rate = 1.02;
  utterance.pitch = 0.95; // slightly lower pitch for JARVIS elegance

  // Find preferred voice
  const voices = window.speechSynthesis.getVoices();
  const ptVoice = voices.find(v => v.lang.startsWith('pt') && (v.name.includes('Luciana') || v.name.includes('Daniel') || v.name.includes('Google') || v.name.includes('Brazil')));
  if (ptVoice) {
    utterance.voice = ptVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Web Speech Recognition for voice commands
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
