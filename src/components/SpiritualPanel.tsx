import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Heart,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Plus,
  Bookmark,
  CheckCircle2,
  Send,
  Calendar,
  Flame
} from 'lucide-react';
import { BIBLICAL_REFLECTIONS } from '../utils/storage';
import {
  playJarvisBeep,
  playChime,
  speakText,
  stopSpeaking,
  startCalmingTone,
  stopCalmingTone
} from '../utils/audio';

interface SpiritualPanelProps {
  onAddXp: (amount: number, reason: string) => void;
}

export const SpiritualPanel: React.FC<SpiritualPanelProps> = ({ onAddXp }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [gratitudeInput, setGratitudeInput] = useState('');
  const [journalEntries, setJournalEntries] = useState<
    { id: string; date: string; text: string }[]
  >([
    {
      id: 'entry-1',
      date: new Date().toLocaleDateString('pt-BR'),
      text: 'Grato pela clareza mental nos estudos de IA hoje e pela paz concedida para liderar meus projetos com serenidade.'
    }
  ]);

  const current = BIBLICAL_REFLECTIONS[selectedIndex];

  const handleToggleMeditationAudio = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      stopCalmingTone();
      setIsPlayingAudio(false);
      return;
    }

    playJarvisBeep(880, 0.05);
    setIsPlayingAudio(true);
    startCalmingTone(432); // soothing background healing frequency

    const script = `Meditação com J.A.R.V.I.S. ${current.reference}. ${current.verse}. Reflexão: ${current.meditation}. Aplicação prática para o seu dia: ${current.practicalAction}. Vamos orar: ${current.prayer}`;

    speakText(script, () => {
      stopCalmingTone();
      setIsPlayingAudio(false);
      playChime();
      onAddXp(80, 'Meditação espiritual e versículo bíblico concluído');
    });
  };

  const handleSaveGratitude = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gratitudeInput.trim()) return;

    const newEntry = {
      id: `grat-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      text: gratitudeInput.trim()
    };

    setJournalEntries([newEntry, ...journalEntries]);
    setGratitudeInput('');
    playChime();
    onAddXp(60, 'Registro de gratidão e crescimento espiritual');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 hud-panel rounded-2xl border border-cyan-900/40">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="font-hud font-bold text-lg text-cyan-100 tracking-wider">
              CRESCIMENTO ESPIRITUAL & VERSÍCULOS BÍBLICOS
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-tech mt-1">
            Alimento diário para o espírito, fortalecimento da fé, oração e sabedoria prática para a vida.
          </p>
        </div>

        {/* Audio narration button */}
        <button
          onClick={handleToggleMeditationAudio}
          className={`px-4 py-2 rounded-xl text-xs font-tech font-bold flex items-center gap-2 transition-all shadow-md ${
            isPlayingAudio
              ? 'bg-amber-500 text-slate-950 animate-pulse glow-gold'
              : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950'
          }`}
        >
          {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isPlayingAudio ? 'Pausar Meditação Narrada' : 'Ouvir Meditação Guiada'}</span>
        </button>
      </div>

      {/* Selector pills for themes */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-tech">
        {BIBLICAL_REFLECTIONS.map((ref, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (isPlayingAudio) {
                stopSpeaking();
                stopCalmingTone();
                setIsPlayingAudio(false);
              }
              setSelectedIndex(idx);
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedIndex === idx
                ? 'border-amber-400 bg-amber-950/80 text-amber-300 glow-gold'
                : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>{ref.theme}</span>
          </button>
        ))}
      </div>

      {/* Main Verse & Meditation Display */}
      <div className="hud-panel rounded-2xl p-6 border border-amber-500/40 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-amber-950/20 space-y-6">
        {/* Verse Heading */}
        <div className="border-b border-amber-900/40 pb-4">
          <div className="flex items-center justify-between text-xs font-hud text-amber-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              VERSÍCULO & EDIFICAÇÃO DO DIA
            </span>
            <span className="text-[11px] font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800">
              {current.reference}
            </span>
          </div>

          <blockquote className="text-base sm:text-lg font-serif italic text-amber-100 leading-relaxed pl-4 border-l-2 border-amber-400">
            {current.verse}
          </blockquote>
        </div>

        {/* Reflection & Practical Application */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="font-hud text-xs text-amber-300 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400" />
              MEDITAÇÃO & REFLEXÃO PROFUNDA
            </h4>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {current.meditation}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-hud text-xs text-cyan-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              APLICAÇÃO PRÁTICA PARA HOJE
            </h4>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {current.practicalAction}
            </p>
          </div>
        </div>

        {/* Guided Prayer Box */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-900/40 space-y-2">
          <h4 className="font-hud text-xs text-amber-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            ORAÇÃO GUIADA DO J.A.R.V.I.S.
          </h4>
          <p className="text-xs text-amber-200/90 italic font-serif leading-relaxed">
            “{current.prayer}”
          </p>
        </div>
      </div>

      {/* Gratitude & Spiritual Diary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-5 hud-panel rounded-2xl p-5 border border-cyan-900/40 space-y-4">
          <div className="flex items-center gap-2 text-cyan-300 font-hud text-xs border-b border-cyan-900/40 pb-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>DIÁRIO DE GRATIDÃO & INTENÇÕES</span>
          </div>

          <p className="text-xs text-slate-400 font-sans">
            Registrar 3 motivos de gratidão todos os dias recalibra sua mente para foco, resiliência e abundância.
          </p>

          <form onSubmit={handleSaveGratitude} className="space-y-3">
            <textarea
              required
              value={gratitudeInput}
              onChange={(e) => setGratitudeInput(e.target.value)}
              placeholder="Pelo que você é grato a Deus hoje? (Ex: Saúde da família, novo aprendizado em código, paz nas tempestades...)"
              rows={3}
              className="w-full bg-slate-900 border border-cyan-900 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
            />

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-tech font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gravar no Diário (+60 XP)</span>
            </button>
          </form>
        </div>

        {/* Entries List */}
        <div className="lg:col-span-7 hud-panel rounded-2xl p-5 border border-cyan-900/40 space-y-3">
          <div className="flex justify-between items-center text-xs font-hud text-cyan-300 border-b border-cyan-900/40 pb-2">
            <span>MEMÓRIAS DE GRATIDÃO GRAVADAS</span>
            <span className="text-slate-500">{journalEntries.length} memórias</span>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {journalEntries.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1"
              >
                <div className="flex items-center gap-2 text-[10px] font-tech text-amber-400">
                  <Calendar className="w-3 h-3" />
                  <span>{item.date}</span>
                </div>
                <p className="font-sans leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
