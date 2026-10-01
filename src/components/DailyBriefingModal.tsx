import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  DollarSign,
  TrendingUp,
  Volume2,
  VolumeX,
  X,
  Play,
  Pause,
  CheckCircle2,
  Code,
  ShieldCheck
} from 'lucide-react';
import { ArcReactor } from './ArcReactor';
import { playJarvisBeep, playChime, speakText, stopSpeaking } from '../utils/audio';

interface DailyBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddXp: (amount: number, reason: string) => void;
}

export const DailyBriefingModal: React.FC<DailyBriefingModalProps> = ({
  isOpen,
  onClose,
  onAddXp
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [briefingData, setBriefingData] = useState({
    greeting: 'Bom dia, Senhor Gabriel. Protocolos matinais inicializados com 100% de eficiência.',
    motivationalQuote: '“A disciplina é a ponte inegociável entre seus objetivos e suas realizações.” — Jim Rohn',
    motivationalInsight: 'Hoje, mantenha a atenção no que realmente move o ponteiro. Cada linha de código e cada escolha financeira consciente forjam sua melhor versão.',
    biblicalVerse: '“Não fui eu que ordenei a você? Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.” — Josué 1:9',
    meditation: 'Respire fundo e ancore seu coração na soberania divina. Os desafios de hoje não são obstáculos para te parar, mas ferramentas para forjar sua resiliência e propósito.',
    prayer: 'Senhor Deus, conceda-me sabedoria para as decisões de hoje, integridade com minhas finanças e serenidade no coração. Amém.',
    financialTip: 'Mantenha a regra de ouro Stark: poupe seus 20% antes de pensar em despesas supérfluas. Pequenos vazamentos afundam grandes navios.',
    courseHighlight: 'Bootcamp Santander 2026: Engenharia de IA & Cloud (100% Gratuito - Inscrições Abertas)',
    smartHomeStatus: 'Modo Estudo e Foco ativado. 6 dispositivos sincronizados no SmartThings.'
  });

  if (!isOpen) return null;

  const handleToggleVoice = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    playJarvisBeep(1100, 0.05);
    setIsPlayingAudio(true);

    const fullScript = `${briefingData.greeting}. Frase motivacional para hoje: ${briefingData.motivationalQuote}. ${briefingData.motivationalInsight}. Versículo bíblico do dia: ${briefingData.biblicalVerse}. Meditação: ${briefingData.meditation}. Conselho do seu mentor financeiro: ${briefingData.financialTip}. Destaque de curso de tecnologia: ${briefingData.courseHighlight}. Todos os sistemas da casa inteligente estão prontos. Tenha um dia extraordinário, Senhor.`;

    speakText(fullScript, () => {
      setIsPlayingAudio(false);
      playChime();
      onAddXp(60, 'Briefing diário matinal concluído');
    });
  };

  const handleClose = () => {
    stopSpeaking();
    setIsPlayingAudio(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="hud-panel rounded-3xl p-6 sm:p-8 border border-amber-500/50 bg-slate-950 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6 relative shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header with mini Arc Reactor */}
        <div className="flex items-center gap-4 border-b border-amber-900/40 pb-4">
          <ArcReactor
            size={70}
            isSpeaking={isPlayingAudio}
            onClick={handleToggleVoice}
            title="Clique para ouvir o briefing"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800 text-[10px] font-hud text-amber-300">
              <Sparkles className="w-3 h-3 text-amber-400" />
              BRIEFING DIÁRIO EXECUTIVO
            </div>
            <h3 className="font-hud font-bold text-base text-slate-100 mt-1">
              J.A.R.V.I.S. Protocolo de Abertura
            </h3>
            <p className="text-xs text-slate-400 font-tech">
              {briefingData.greeting}
            </p>
          </div>
        </div>

        {/* Audio control bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs font-tech">
          <span className="text-amber-300 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-amber-400" />
            {isPlayingAudio ? 'J.A.R.V.I.S. narrando o briefing...' : 'Deseja ouvir a transmissão de áudio?'}
          </span>
          <button
            onClick={handleToggleVoice}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              isPlayingAudio
                ? 'bg-amber-400 text-slate-950 animate-pulse'
                : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950'
            }`}
          >
            {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlayingAudio ? 'Pausar Áudio' : 'Ouvir Briefing'}</span>
          </button>
        </div>

        {/* Content Cards */}
        <div className="space-y-4 text-xs font-sans">
          {/* Motivational Quote */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-900/40 space-y-1.5">
            <h4 className="font-hud text-[11px] text-cyan-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              FRASE MOTIVACIONAL & FOCO DO DIA
            </h4>
            <blockquote className="text-sm font-serif italic text-cyan-100">
              {briefingData.motivationalQuote}
            </blockquote>
            <p className="text-slate-300 leading-relaxed pt-1">
              {briefingData.motivationalInsight}
            </p>
          </div>

          {/* Spiritual Verse & Reflection */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-900/40 space-y-1.5">
            <h4 className="font-hud text-[11px] text-amber-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              VERSÍCULO BÍBLICO & CRESCIMENTO ESPIRITUAL
            </h4>
            <p className="font-serif italic text-amber-100 text-sm">
              {briefingData.biblicalVerse}
            </p>
            <p className="text-slate-300 leading-relaxed pt-1">
              {briefingData.meditation}
            </p>
            <p className="text-amber-200/90 italic pt-1">
              Oração: “{briefingData.prayer}”
            </p>
          </div>

          {/* Financial Advice */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-900/40 space-y-1.5">
            <h4 className="font-hud text-[11px] text-emerald-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              CONSELHO DO MENTOR FINANCEIRO
            </h4>
            <p className="text-slate-200 leading-relaxed">
              {briefingData.financialTip}
            </p>
          </div>

          {/* Tech Course Spotlight */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-900/40 space-y-1.5">
            <h4 className="font-hud text-[11px] text-cyan-300 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              RADAR DE CAPACITAÇÃO TECH
            </h4>
            <p className="text-slate-200">
              <strong className="text-cyan-300">{briefingData.courseHighlight}</strong>. Lembrete sincronizado na sua agenda.
            </p>
          </div>

          {/* Smart home state */}
          <div className="flex items-center justify-between text-[11px] font-tech text-slate-400 pt-2 border-t border-cyan-950">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              {briefingData.smartHomeStatus}
            </span>
            <button
              onClick={() => {
                handleClose();
                onAddXp(50, 'Briefing matinal absorvido');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-tech"
            >
              Iniciar Dia (+50 XP)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
