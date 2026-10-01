import React, { useState, useEffect } from 'react';
import {
  Heart,
  Wind,
  Volume2,
  VolumeX,
  Play,
  Pause,
  X,
  Sparkles,
  CloudRain,
  Music,
  CheckCircle2,
  Smile
} from 'lucide-react';
import {
  playJarvisBeep,
  playChime,
  startCalmingTone,
  stopCalmingTone,
  startRainSound,
  stopRainSound,
  speakText,
  stopSpeaking
} from '../utils/audio';

interface CalmProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddXp: (amount: number, reason: string) => void;
}

type BreathingPhase = 'inspire' | 'segure' | 'expire' | 'pausa';

export const CalmProtocolModal: React.FC<CalmProtocolModalProps> = ({
  isOpen,
  onClose,
  onAddXp
}) => {
  const [isActive, setIsActive] = useState(false);
  const [soundMode, setSoundMode] = useState<'432hz' | 'rain' | 'none'>('432hz');
  const [phase, setPhase] = useState<BreathingPhase>('inspire');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [affirmationIndex, setAffirmationIndex] = useState(0);

  const AFFIRMATIONS = [
    '“Senhor, você está seguro. Respire fundo e solte todo o peso que não lhe pertence.”',
    '“A ansiedade mente sobre o futuro; sua presença e força existem no agora.”',
    '“Deus não lhe deu espírito de medo, mas de fortaleza, serenidade e mente lúcida.”',
    '“Cada batimento cardíaco é um lembrete: você é capaz de superar qualquer sobrecarga.”',
    '“Desacelere os ombros. Solte o maxilar. O universo está em ordem.”'
  ];

  // Box Breathing cycle: 4s inspire -> 4s hold -> 4s expire -> 4s pause
  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Transition phase
            setPhase((currentPhase) => {
              if (currentPhase === 'inspire') return 'segure';
              if (currentPhase === 'segure') return 'expire';
              if (currentPhase === 'expire') return 'pausa';
              // Completed 1 full cycle
              setCyclesCompleted((c) => {
                const next = c + 1;
                if (next % 2 === 0) {
                  setAffirmationIndex((idx) => (idx + 1) % AFFIRMATIONS.length);
                }
                return next;
              });
              return 'inspire';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  // Audio soundscape controls
  useEffect(() => {
    if (!isOpen) {
      stopCalmingTone();
      stopRainSound();
      stopSpeaking();
      setIsActive(false);
      return;
    }

    if (isActive) {
      if (soundMode === '432hz') {
        stopRainSound();
        startCalmingTone(432);
      } else if (soundMode === 'rain') {
        stopCalmingTone();
        startRainSound();
      } else {
        stopCalmingTone();
        stopRainSound();
      }
    } else {
      stopCalmingTone();
      stopRainSound();
    }
  }, [isActive, soundMode, isOpen]);

  const handleStart = () => {
    playJarvisBeep(520, 0.08);
    setIsActive(true);
    setPhase('inspire');
    setSecondsLeft(4);
    // Voice prompt
    speakText('Iniciando Protocolo de Calma. Inspire lentamente pelas narinas... Encha os pulmões.');
  };

  const handlePause = () => {
    setIsActive(false);
    stopSpeaking();
  };

  const handleFinish = () => {
    handlePause();
    playChime();
    if (cyclesCompleted >= 2) {
      onAddXp(80, 'Protocolo de Calma e Respiração concluído');
    }
    onClose();
  };

  if (!isOpen) return null;

  const phaseInstruction = {
    inspire: { text: 'INSPIRE PROFUNDAMENTE', sub: 'Pelo nariz, expandindo o abdômen', scale: 'scale-125', color: 'from-cyan-400 to-teal-400' },
    segure: { text: 'SEGURE O AR', sub: 'Mantenha os pulmões cheios e calmos', scale: 'scale-125', color: 'from-teal-400 to-emerald-400' },
    expire: { text: 'EXPIRE DEVAGAR', sub: 'Pela boca, soltando toda a tensão', scale: 'scale-90', color: 'from-sky-400 to-blue-500' },
    pausa: { text: 'PAUSA & VAZIO', sub: 'Permaneça em paz antes do próximo ciclo', scale: 'scale-90', color: 'from-indigo-400 to-cyan-500' }
  }[phase];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="hud-panel rounded-3xl p-6 sm:p-8 border border-teal-500/50 bg-slate-950 w-full max-w-lg space-y-6 relative overflow-hidden shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleFinish}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/40 bg-teal-950/60 text-teal-300 text-xs font-hud">
            <Heart className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>PROTOCOLO DE CALMA & EQUILÍBRIO STARK</span>
          </div>
          <h2 className="text-lg font-hud font-bold text-slate-100 mt-2">
            Respiração Quadrada (Box Breathing 4-4-4-4)
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Técnica utilizada por Navy SEALs e astronautas para reduzir o cortisol e desacelerar a frequência cardíaca instantaneamente.
          </p>
        </div>

        {/* Central Breathing Orb */}
        <div className="flex flex-col items-center justify-center py-6 relative">
          {/* Animated pulse rings */}
          <div
            className={`w-48 h-48 rounded-full border-2 border-teal-500/30 flex items-center justify-center transition-all duration-1000 ${
              isActive ? phaseInstruction.scale : 'scale-100'
            }`}
          >
            <div
              className={`w-36 h-36 rounded-full bg-gradient-to-br ${
                phaseInstruction.color
              } opacity-80 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(20,184,166,0.5)] transition-all duration-1000`}
            >
              <span className="font-hud font-extrabold text-3xl text-slate-950">
                {secondsLeft}s
              </span>
              <span className="text-[11px] font-tech font-bold text-slate-950 uppercase tracking-wider">
                {phase}
              </span>
            </div>
          </div>

          {/* Phase text label */}
          <div className="mt-4 text-center">
            <h3 className="font-hud font-bold text-base text-teal-300 tracking-wider">
              {phaseInstruction.text}
            </h3>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              {phaseInstruction.sub}
            </p>
          </div>
        </div>

        {/* Reassuring JARVIS message */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-teal-900/50 text-center">
          <p className="text-xs font-serif italic text-teal-200 leading-relaxed">
            {AFFIRMATIONS[affirmationIndex]}
          </p>
        </div>

        {/* Sound Selection Bar */}
        <div className="flex items-center justify-center gap-2 text-xs font-tech">
          <span className="text-slate-400 flex items-center gap-1">
            <Music className="w-3.5 h-3.5 text-teal-400" />
            Trilha Sonora:
          </span>
          <button
            onClick={() => setSoundMode('432hz')}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              soundMode === '432hz'
                ? 'border-teal-400 bg-teal-950 text-teal-300'
                : 'border-slate-800 text-slate-400'
            }`}
          >
            Frequência 432Hz
          </button>
          <button
            onClick={() => setSoundMode('rain')}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              soundMode === 'rain'
                ? 'border-teal-400 bg-teal-950 text-teal-300'
                : 'border-slate-800 text-slate-400'
            }`}
          >
            Chuva Suave
          </button>
          <button
            onClick={() => setSoundMode('none')}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              soundMode === 'none'
                ? 'border-teal-400 bg-teal-950 text-teal-300'
                : 'border-slate-800 text-slate-400'
            }`}
          >
            Silêncio
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-teal-950">
          <div className="text-xs font-tech text-slate-400">
            Ciclos Concluídos: <strong className="text-teal-300 font-hud">{cyclesCompleted}</strong>
          </div>

          <div className="flex items-center gap-2">
            {!isActive ? (
              <button
                onClick={handleStart}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-tech font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Iniciar Respiração</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-teal-500 text-teal-300 hover:bg-slate-800 font-tech font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Pause className="w-4 h-4" />
                <span>Pausar</span>
              </button>
            )}

            <button
              onClick={handleFinish}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-tech transition-all"
            >
              Concluir (+80 XP)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
