import React, { useState, useEffect } from 'react';
import {
  Shield,
  Zap,
  Activity,
  Heart,
  Volume2,
  VolumeX,
  FileText,
  Clock,
  Sparkles,
  Mail,
  Headphones
} from 'lucide-react';
import { GamificationState } from '../types';
import { playJarvisBeep } from '../utils/audio';

interface NavbarProps {
  gamification: GamificationState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCalm: () => void;
  onOpenBriefing: () => void;
  onOpenVoiceSettings: () => void;
  isAudioMuted: boolean;
  setIsAudioMuted: (muted: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  gamification,
  activeTab,
  setActiveTab,
  onOpenCalm,
  onOpenBriefing,
  onOpenVoiceSettings,
  isAudioMuted,
  setIsAudioMuted
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'hud', label: 'J.A.R.V.I.S. Core', icon: Zap },
    { id: 'smartthings', label: 'Casa SmartThings', icon: Shield },
    { id: 'routine', label: 'Rotina & Calendário', icon: Clock },
    { id: 'finance', label: 'Mentor Financeiro', icon: Activity },
    { id: 'spiritual', label: 'Espiritual & Versículos', icon: Sparkles },
    { id: 'emails', label: 'Emails (Gmail)', icon: Mail },
    { id: 'courses', label: 'Cursos Tech Gratuitos', icon: Zap },
    { id: 'report', label: 'Relatórios & Arc Mark', icon: FileText }
  ];

  const handleTabClick = (id: string) => {
    playJarvisBeep(980, 0.04);
    setActiveTab(id);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-cyan-950/60 bg-slate-950/90 backdrop-blur-xl">
      {/* Top telemetry strip */}
      <div className="px-4 py-1.5 border-b border-cyan-900/30 flex items-center justify-between text-[11px] font-hud text-cyan-500/80">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SISTEMAS OPERACIONAIS: 100% ONLINE
          </span>
          <span className="hidden md:inline-block text-slate-500">|</span>
          <span className="hidden md:flex items-center gap-1 text-slate-400">
            STARK PROTOCOL: <strong className="text-cyan-300">MARK VII ACTIVE</strong>
          </span>
          <span className="hidden lg:inline-block text-slate-500">|</span>
          <span className="hidden lg:flex items-center gap-1 text-slate-400">
            SMARTTHINGS HUB: <span className="text-emerald-400">SINCRONIZADO</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio toggle */}
          <button
            onClick={() => {
              playJarvisBeep(isAudioMuted ? 880 : 440, 0.05);
              setIsAudioMuted(!isAudioMuted);
            }}
            className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
            title={isAudioMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar Efeitos Sonoros'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          <span className="text-slate-500">|</span>

          {/* Time & Date HUD */}
          <div className="flex items-center gap-2 text-cyan-300">
            <span className="text-slate-400">{currentDate}</span>
            <span className="font-bold tracking-widest text-cyan-400">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => handleTabClick('hud')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg border border-cyan-400/40 bg-cyan-950/40 flex items-center justify-center glow-cyan-sm group-hover:border-cyan-300 transition-all">
              <Zap className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-hud font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300">
                  J.A.R.V.I.S.
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-hud bg-cyan-950 text-cyan-400 border border-cyan-800">
                  AI OS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-tech uppercase tracking-wider">
                Sistema Operacional Inteligente
              </p>
            </div>
          </div>
        </div>

        {/* Center / Action Bar: Quick Calm Protocol & Briefing */}
        <div className="flex items-center gap-2">
          {/* Anti-anxiety Calm Protocol Button */}
          <button
            onClick={() => {
              playJarvisBeep(660, 0.08);
              onOpenCalm();
            }}
            className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-teal-950/60 to-cyan-950/60 hover:from-teal-900/80 hover:to-cyan-900/80 text-cyan-300 hover:text-white flex items-center gap-2 text-xs font-tech font-semibold transition-all shadow-sm hover:shadow-[0_0_15px_rgba(20,184,166,0.4)]"
            title="Iniciar exercício de respiração guiada e relaxamento"
          >
            <Heart className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>Protocolo Calma</span>
          </button>

          {/* Daily Briefing Button */}
          <button
            onClick={() => {
              playJarvisBeep(1100, 0.06);
              onOpenBriefing();
            }}
            className="px-3 py-1.5 rounded-lg border border-amber-500/40 bg-gradient-to-r from-amber-950/50 to-orange-950/50 hover:from-amber-900/70 hover:to-orange-900/70 text-amber-300 hover:text-white flex items-center gap-2 text-xs font-tech font-semibold transition-all shadow-sm hover:shadow-[0_0_15px_rgba(245,158,11,0.35)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Briefing Matinal</span>
            <span className="sm:hidden">Briefing</span>
          </button>

          {/* Voice of Movie Configuration Button */}
          <button
            onClick={() => {
              playJarvisBeep(1000, 0.05);
              onOpenVoiceSettings();
            }}
            className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-slate-900/80 hover:border-cyan-400 text-cyan-300 hover:text-white flex items-center gap-1.5 text-xs font-tech font-semibold transition-all shadow-sm"
            title="Calibrar a voz do J.A.R.V.I.S. (Dublagem Brasil / Paul Bettany & Efeito Capacete HUD)"
          >
            <Headphones className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Voz do Filme</span>
          </button>
        </div>

        {/* Gamification Level & XP Badge */}
        <div
          onClick={() => handleTabClick('report')}
          className="flex items-center gap-3 px-3 py-1 rounded-lg border border-cyan-900/60 bg-slate-900/60 hover:border-cyan-500/60 cursor-pointer transition-all"
          title="Ver detalhes de XP e Níveis do Reator Arc"
        >
          <div className="w-7 h-7 rounded-full border border-cyan-400 bg-cyan-950 flex items-center justify-center glow-cyan-sm">
            <span className="text-xs font-hud font-bold text-cyan-300">
              M{gamification.level}
            </span>
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-hud text-cyan-200">
                {gamification.levelName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden border border-cyan-900">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full"
                  style={{ width: `${Math.min(100, (gamification.xp % 1000) / 10)}%` }}
                />
              </div>
              <span className="text-[10px] font-hud text-cyan-400">{gamification.xp} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs row */}
      <nav className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`px-3 py-2 rounded-t-md font-tech tracking-wide whitespace-nowrap flex items-center gap-1.5 transition-all border-b-2 ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40 glow-text-cyan'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
