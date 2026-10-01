import React, { useState } from 'react';
import {
  FileText,
  Shield,
  Zap,
  Flame,
  Award,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Lock,
  Unlock
} from 'lucide-react';
import { GamificationState, TaskItem, FinancialTransaction } from '../types';
import { ARC_LEVELS } from '../utils/storage';
import { playJarvisBeep, playChime } from '../utils/audio';

interface WeeklyReportPanelProps {
  gamification: GamificationState;
  tasks: TaskItem[];
  transactions: FinancialTransaction[];
  onAddXp: (amount: number, reason: string) => void;
}

export const WeeklyReportPanel: React.FC<WeeklyReportPanelProps> = ({
  gamification,
  tasks,
  transactions,
  onAddXp
}) => {
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const efficiencyScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 92;

  const currentLevelInfo = ARC_LEVELS.find((l) => l.level === gamification.level) || ARC_LEVELS[0];
  const nextLevelInfo = ARC_LEVELS.find((l) => l.level === gamification.level + 1);
  const progressToNext = nextLevelInfo
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((gamification.xp - currentLevelInfo.minXp) /
              (nextLevelInfo.minXp - currentLevelInfo.minXp)) *
              100
          )
        )
      )
    : 100;

  const handleGenerateReport = async () => {
    playJarvisBeep(1100, 0.06);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/jarvis/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: {
            gamificationLevel: gamification.levelName,
            xp: gamification.xp,
            streakDays: gamification.streakDays,
            tasksCompleted: `${completedTasks} de ${totalTasks}`,
            financialTransactionsCount: transactions.length,
            efficiencyScore: `${efficiencyScore}%`
          }
        })
      });

      const data = await response.json();
      setReportMarkdown(data.report || 'Relatório compilado com sucesso.');
      playChime();
      onAddXp(120, 'Geração de relatório semanal de alta performance');
    } catch (e) {
      setReportMarkdown(`## Relatório Semanal de Desempenho — Protocolo Mark VII
**Índice de Eficiência Geral:** ${efficiencyScore}%
- **Produtividade & Rotina:** ${completedTasks} de ${totalTasks} metas concluídas.
- **Finanças:** Registros atualizados e reserva de emergência resguardada.
- **Crescimento Espiritual:** Disciplina contínua nos versículos diários e oração.
- **Desenvolvimento Tecnológico:** Trilha em andamento com lembretes sincronizados.
**Parecer do JARVIS:** "Sua consistência é admirável, Senhor. Mantenha os olhos fixos nos objetivos de longo prazo."`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 hud-panel rounded-2xl border border-cyan-900/40">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="font-hud font-bold text-lg text-cyan-100 tracking-wider">
              RELATÓRIOS SEMANAIS & GAMIFICAÇÃO ARC REACTOR
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-tech mt-1">
            Análise consolidada de evolução pessoal, eficiência de rotina e desbloqueio de novas armaduras Stark.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-slate-950 font-tech font-bold text-xs flex items-center gap-2 transition-all shadow-md glow-cyan-sm disabled:opacity-50"
        >
          {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isGenerating ? 'Compilando Telemetria...' : 'Gerar Relatório com J.A.R.V.I.S.'}</span>
        </button>
      </div>

      {/* Gamification Level & Streak Banner */}
      <div className="hud-panel rounded-2xl p-6 border border-cyan-500/40 bg-gradient-to-r from-slate-900/90 via-cyan-950/30 to-slate-900/90 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl border-2 border-cyan-400 bg-cyan-950 flex items-center justify-center glow-cyan">
              <Zap className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <span className="text-[11px] font-hud text-cyan-400 uppercase tracking-widest">
                ESTÁGIO ATUAL DA ARMADURA
              </span>
              <h3 className="font-hud font-bold text-base text-white">
                Nível {gamification.level}: {gamification.levelName}
              </h3>
            </div>
          </div>

          {/* Streak indicator */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/50 bg-amber-950/40 text-amber-300">
            <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
            <div>
              <span className="text-[10px] font-hud uppercase block text-amber-400/80">Ofensiva Stark</span>
              <span className="font-hud font-bold text-sm text-amber-300">{gamification.streakDays} Dias Seguidos</span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-tech text-slate-300">
            <span>Progresso para a próxima Armadura:</span>
            <span className="text-cyan-300 font-hud">
              {gamification.xp} XP ({progressToNext}%)
            </span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-cyan-900">
            <div
              className="bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
          {nextLevelInfo && (
            <p className="text-[11px] text-slate-400 font-tech text-right">
              Próximo objetivo: {nextLevelInfo.name} ({nextLevelInfo.minXp} XP)
            </p>
          )}
        </div>
      </div>

      {/* Weekly Report Output or Default Summary */}
      <div className="hud-panel rounded-2xl p-6 border border-cyan-900/40 space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-900/40 pb-3">
          <h3 className="font-hud text-xs text-cyan-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            PARECER DE DESEMPENHO SEMANAL DO J.A.R.V.I.S.
          </h3>
          <span className="text-xs font-hud text-emerald-400">
            ÍNDICE DE EFICIÊNCIA: {efficiencyScore}%
          </span>
        </div>

        {reportMarkdown ? (
          <div className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap space-y-2">
            {reportMarkdown}
          </div>
        ) : (
          <div className="space-y-4 text-xs font-sans text-slate-300">
            <p>
              Senhor, clique em <strong>"Gerar Relatório com J.A.R.V.I.S."</strong> para compilar uma análise executiva profunda do seu desempenho nos últimos 7 dias. Enquanto isso, aqui está o resumo das suas métricas em tempo real:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-tech text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Tarefas Realizadas</span>
                <strong className="text-cyan-300 font-hud text-base">
                  {completedTasks} / {totalTasks}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Sequência Diária</span>
                <strong className="text-amber-300 font-hud text-base">
                  {gamification.streakDays} Dias
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">XP Total Acumulado</span>
                <strong className="text-emerald-300 font-hud text-base">
                  {gamification.xp} XP
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Conquistas Desbloqueadas</span>
                <strong className="text-purple-300 font-hud text-base">
                  {gamification.achievements.filter((a) => a.unlocked).length} / {gamification.achievements.length}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Achievements Showcase */}
      <div className="hud-panel rounded-2xl p-5 border border-cyan-900/40 space-y-4">
        <h3 className="font-hud text-xs text-cyan-300 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          INSÍGNIAS E CONQUISTAS DESBLOQUEÁVEIS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {gamification.achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                ach.unlocked
                  ? 'border-cyan-500/50 bg-cyan-950/30'
                  : 'border-slate-800 bg-slate-950/60 opacity-50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                  ach.unlocked
                    ? 'border-amber-400 bg-amber-950 text-amber-300 glow-gold'
                    : 'border-slate-700 bg-slate-900 text-slate-600'
                }`}
              >
                {ach.unlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-tech font-bold text-xs text-slate-100">{ach.title}</h4>
                  <span className="text-[10px] font-hud text-amber-400">+{ach.xpBonus} XP</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-tight">
                  {ach.description}
                </p>
                {ach.unlocked && ach.unlockedAt && (
                  <span className="text-[9px] font-tech text-cyan-400 block pt-0.5">
                    Conquistada em {ach.unlockedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
