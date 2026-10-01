import React, { useState } from 'react';
import {
  Mic,
  Volume2,
  X,
  Play,
  Sparkles,
  Sliders,
  CheckCircle2,
  Radio,
  Headphones,
  Shield,
  Layers
} from 'lucide-react';
import {
  JarvisVoiceConfig,
  getStoredVoiceConfig,
  saveStoredVoiceConfig,
  speakJarvis,
  stopSpeaking,
  playJarvisBeep,
  playChime
} from '../utils/audio';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddXp: (amount: number, reason: string) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  onAddXp
}) => {
  const [config, setConfig] = useState<JarvisVoiceConfig>(() => getStoredVoiceConfig());
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = (updated: Partial<JarvisVoiceConfig>) => {
    const newConfig = { ...config, ...updated };
    setConfig(newConfig);
    saveStoredVoiceConfig(newConfig);
    playJarvisBeep(980, 0.04);
  };

  const testPhrase = async (phrase: string) => {
    setIsTesting(true);
    playJarvisBeep(1200, 0.05);

    try {
      await speakJarvis(phrase, config, () => {
        setIsTesting(false);
      });
      onAddXp(20, 'Calibração da voz do J.A.R.V.I.S.');
    } catch (e) {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="hud-panel rounded-3xl p-6 sm:p-8 border border-cyan-400/50 bg-slate-950 w-full max-w-xl space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => {
            stopSpeaking();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 text-xs font-hud">
            <Headphones className="w-3.5 h-3.5 text-cyan-400" />
            <span>CALIBRAÇÃO ACÚSTICA & VOZ DO FILME</span>
          </div>
          <h2 className="text-lg font-hud font-bold text-slate-100 mt-1">
            Configurar Voz Oficial do J.A.R.V.I.S.
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Personalize a voz, entonação britânica/brasileira e os efeitos acústicos de rádio do capacete Mark VII.
          </p>
        </div>

        {/* 1. Voice Engine Selection */}
        <div className="space-y-2">
          <label className="text-xs font-hud text-cyan-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>MOTOR DE GERAÇÃO VOCAL</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleUpdate({ engine: 'neural' })}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                config.engine === 'neural'
                  ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 glow-cyan-sm'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-tech font-bold text-xs text-slate-100">Voz Neural Gemini</span>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-tight">
                Áudio de alta fidelidade idêntico ao cinema com dicção aristocrática.
              </p>
            </button>

            <button
              onClick={() => handleUpdate({ engine: 'system' })}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                config.engine === 'system'
                  ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 glow-cyan-sm'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-tech font-bold text-xs text-slate-100">Voz do Sistema</span>
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-tight">
                Resposta instantânea em tempo real usando a síntese do navegador.
              </p>
            </button>
          </div>
        </div>

        {/* 2. Persona Preset */}
        <div className="space-y-2">
          <label className="text-xs font-hud text-cyan-300 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span>ESTILO VOCAL & DUBLAGEM</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                id: 'marco_antonio',
                title: 'Dublagem Brasil',
                sub: 'Marco Antônio Costa (Filmes Marvel)'
              },
              {
                id: 'paul_bettany',
                title: 'Paul Bettany Original',
                sub: 'Mordomo Britânico Clássico'
              },
              {
                id: 'mark_vii',
                title: 'Armadura Mark VII',
                sub: 'Tom Tático & Combate Imponente'
              }
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleUpdate({ voicePreset: preset.id as any })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  config.voicePreset === preset.id
                    ? 'border-cyan-400 bg-cyan-950 text-cyan-300 glow-cyan-sm'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-tech font-bold text-xs block text-slate-100">
                  {preset.title}
                </span>
                <span className="text-[10px] text-slate-400 font-sans block mt-0.5 leading-tight">
                  {preset.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Holographic DSP Acoustic Filter */}
        <div className="space-y-2">
          <label className="text-xs font-hud text-cyan-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>FILTRO ACÚSTICO HOLOGRÁFICO (DSP REAL-TIME)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                id: 'helmet_hud',
                title: 'Capacete HUD Mark VII',
                desc: 'Presença metálica de intercomunicador interno'
              },
              {
                id: 'malibu_lab',
                title: 'Laboratório Malibu',
                desc: 'Reflexões de sala de vidro de alta tecnologia'
              },
              {
                id: 'studio',
                title: 'Estúdio Puro',
                desc: 'Sem processamento espacial (Voz cristalina)'
              }
            ].map((filt) => (
              <button
                key={filt.id}
                onClick={() => handleUpdate({ acousticFilter: filt.id as any })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  config.acousticFilter === filt.id
                    ? 'border-cyan-400 bg-cyan-950 text-cyan-300 glow-cyan-sm'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-tech font-bold text-xs block text-slate-100">
                  {filt.title}
                </span>
                <span className="text-[10px] text-slate-400 font-sans block mt-0.5 leading-tight">
                  {filt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Fine Tune Sliders (Pitch and Rate) */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-cyan-950 text-xs font-tech">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Tom Vocal (Grave / Agudo)</span>
              <span className="text-cyan-400 font-hud">{config.pitch.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.85"
              max="1.15"
              step="0.01"
              value={config.pitch}
              onChange={(e) => handleUpdate({ pitch: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Cadência / Velocidade</span>
              <span className="text-cyan-400 font-hud">{config.rate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.85"
              max="1.15"
              step="0.01"
              value={config.rate}
              onChange={(e) => handleUpdate({ rate: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>

        {/* 5. Movie Voice Tester Quotes */}
        <div className="space-y-2 pt-2 border-t border-cyan-950">
          <label className="text-xs font-hud text-amber-300 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>TESTAR FRASES DO FILME</span>
          </label>

          <div className="space-y-2">
            {[
              'Às suas ordens, Senhor. Importando todas as preferências e iniciando telemetria do Reator Arc.',
              'Com certeza, Senhor. Como sempre, uma honra auxiliá-lo com seus protocolos.',
              'Reator Arc estabilizado em 100%. Todos os sistemas da residência e armadura estão prontos.'
            ].map((phrase, idx) => (
              <button
                key={idx}
                disabled={isTesting}
                onClick={() => testPhrase(phrase)}
                className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/60 text-left text-xs font-sans text-slate-200 flex items-center justify-between group transition-all disabled:opacity-50"
              >
                <span className="italic pr-2">"{phrase}"</span>
                <div className="p-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 group-hover:scale-110 flex-shrink-0">
                  <Play className="w-3 h-3 fill-cyan-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-cyan-950">
          <span className="text-[11px] font-tech text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Configuração salva automaticamente
          </span>
          <button
            onClick={() => {
              playChime();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-slate-950 font-tech font-bold text-xs shadow-md glow-cyan-sm"
          >
            Aplicar ao J.A.R.V.I.S.
          </button>
        </div>
      </div>
    </div>
  );
};
