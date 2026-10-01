import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Calculator,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { FinancialTransaction, FinancialGoal } from '../types';
import { playJarvisBeep, playChime } from '../utils/audio';

interface FinanceMentorPanelProps {
  transactions: FinancialTransaction[];
  goals: FinancialGoal[];
  onAddTransaction: (transaction: FinancialTransaction) => void;
  onResetFinances: () => void;
  onDeleteTransaction?: (id: string) => void;
  onAddXp: (amount: number, reason: string) => void;
}

export const FinanceMentorPanel: React.FC<FinanceMentorPanelProps> = ({
  transactions,
  goals,
  onAddTransaction,
  onResetFinances,
  onDeleteTransaction,
  onAddXp
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<FinancialTransaction['category']>('Alimentação');

  // Compound interest simulator states
  const [simInitial, setSimInitial] = useState(5000);
  const [simMonthly, setSimMonthly] = useState(600);
  const [simYears, setSimYears] = useState(5);
  const [simRate, setSimRate] = useState(12); // 12% ao ano (taxa Selic/CDB médio)

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!desc.trim() || isNaN(val) || val <= 0) return;

    const newTrans: FinancialTransaction = {
      id: `fin-${Date.now()}`,
      description: desc.trim(),
      amount: val,
      type,
      category,
      date: new Date().toISOString().split('T')[0]
    };

    onAddTransaction(newTrans);
    playChime();
    onAddXp(60, 'Registro de transação e disciplina financeira');
    setDesc('');
    setAmount('');
    setIsModalOpen(false);
  };

  // Calculate compound interest
  const calculateCompoundInterest = () => {
    const monthlyRate = Math.pow(1 + simRate / 100, 1 / 12) - 1;
    const totalMonths = simYears * 12;

    let futureValue = simInitial * Math.pow(1 + monthlyRate, totalMonths);
    for (let m = 1; m <= totalMonths; m++) {
      futureValue += simMonthly * Math.pow(1 + monthlyRate, totalMonths - m);
    }

    const totalInvested = simInitial + simMonthly * totalMonths;
    const totalInterest = futureValue - totalInvested;

    return {
      futureValue: Math.round(futureValue),
      totalInvested: Math.round(totalInvested),
      totalInterest: Math.round(totalInterest)
    };
  };

  const simResult = calculateCompoundInterest();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 hud-panel rounded-2xl border border-cyan-900/40">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="font-hud font-bold text-lg text-cyan-100 tracking-wider">
              MENTOR FINANCEIRO J.A.R.V.I.S.
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-tech mt-1">
            Gestão estratégica de caixa, blindagem de patrimônio, reserva de emergência e liberdade financeira.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              playJarvisBeep(620, 0.05);
              setIsResetConfirmOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl border border-rose-900/60 bg-rose-950/40 hover:bg-rose-900/60 hover:border-rose-500 text-rose-300 font-tech font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            title="Zerar todas as receitas, despesas e saldo registrado"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Zerar Finanças</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-tech font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Transação</span>
          </button>
        </div>
      </div>

      {/* Financial Health KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Líquido */}
        <div className="hud-panel rounded-2xl p-4 border border-cyan-900/50">
          <div className="flex justify-between items-start text-xs font-tech text-slate-400 mb-2">
            <span>Saldo Líquido Mensal</span>
            <span className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-hud font-bold text-cyan-200">
            R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-tech text-slate-400 mt-1 flex items-center gap-1">
            <span>Taxa de Poupança:</span>
            <strong className="text-emerald-400 font-hud">{savingsRate}%</strong>
          </div>
        </div>

        {/* Total Receitas */}
        <div className="hud-panel rounded-2xl p-4 border border-emerald-900/50">
          <div className="flex justify-between items-start text-xs font-tech text-slate-400 mb-2">
            <span>Receitas do Mês</span>
            <span className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-hud font-bold text-emerald-300">
            + R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-tech text-slate-400 mt-1">
            Fluxo positivo registrado
          </div>
        </div>

        {/* Total Despesas */}
        <div className="hud-panel rounded-2xl p-4 border border-rose-900/50">
          <div className="flex justify-between items-start text-xs font-tech text-slate-400 mb-2">
            <span>Despesas do Mês</span>
            <span className="p-1 rounded bg-rose-950 text-rose-400 border border-rose-800">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-hud font-bold text-rose-300">
            - R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-tech text-slate-400 mt-1">
            Custos essenciais e investimentos
          </div>
        </div>

        {/* Reserva de Emergência */}
        <div className="hud-panel rounded-2xl p-4 border border-amber-900/50">
          <div className="flex justify-between items-start text-xs font-tech text-slate-400 mb-2">
            <span>Reserva Blindada</span>
            <span className="p-1 rounded bg-amber-950 text-amber-400 border border-amber-800">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-hud font-bold text-amber-300">
            R$ {goals[0]?.currentAmount.toLocaleString('pt-BR') || '14.500'}
          </div>
          <div className="text-[11px] font-tech text-slate-400 mt-1">
            Meta: R$ {goals[0]?.targetAmount.toLocaleString('pt-BR') || '22.000'} (66%)
          </div>
        </div>
      </div>

      {/* JARVIS Mentor Strategic Advice Box */}
      <div className="hud-panel rounded-2xl p-5 border border-emerald-500/40 bg-gradient-to-r from-slate-900/90 via-slate-900/90 to-emerald-950/30 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-hud text-xs">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>DIAGNÓSTICO E PARECER DO MENTOR FINANCEIRO</span>
        </div>
        <p className="text-xs text-slate-200 font-sans leading-relaxed">
          “Senhor, sua taxa de economia de <strong className="text-emerald-300">{savingsRate}%</strong> está dentro da zona de excelência. Recomendo manter a divisão clássica Stark: <strong>50%</strong> para necessidades fundamentais, <strong>30%</strong> para qualidade de vida e crescimento pessoal, e <strong>20%</strong> invioláveis direcionados para sua reserva de emergência em renda fixa de liquidez diária (Tesouro Selic/CDB 100%). Evite dívidas de consumo e continue investindo em certificações tech — a valorização do seu intelecto é o maior ativo contra a inflação.”
        </p>
      </div>

      {/* Simulator & Goals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Compound Interest Simulator */}
        <div className="lg:col-span-7 hud-panel rounded-2xl p-5 border border-cyan-900/40 space-y-4">
          <div className="flex items-center gap-2 text-cyan-300 font-hud text-xs border-b border-cyan-900/40 pb-2">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span>SIMULADOR DE ACELERAÇÃO DE PATRIMÔNIO (JUROS COMPOSTOS)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-tech">
            <div>
              <label className="text-slate-400 block mb-1">Aporte Inicial (R$)</label>
              <input
                type="number"
                value={simInitial}
                onChange={(e) => setSimInitial(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Aporte Mensal (R$)</label>
              <input
                type="number"
                value={simMonthly}
                onChange={(e) => setSimMonthly(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Período (Anos)</label>
              <input
                type="number"
                value={simYears}
                onChange={(e) => setSimYears(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Taxa (% ao ano)</label>
              <input
                type="number"
                value={simRate}
                onChange={(e) => setSimRate(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
          </div>

          {/* Results summary card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-950 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-hud text-slate-400 uppercase">
                Patrimônio Estimado em {simYears} Anos
              </span>
              <div className="text-2xl font-hud font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                R$ {simResult.futureValue.toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="text-xs font-tech text-slate-400 space-y-1">
              <div>
                Total Investido do seu bolso: <strong className="text-slate-200">R$ {simResult.totalInvested.toLocaleString('pt-BR')}</strong>
              </div>
              <div>
                Rendimento Puro (Juros compostos): <strong className="text-emerald-400">R$ {simResult.totalInterest.toLocaleString('pt-BR')}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="lg:col-span-5 hud-panel rounded-2xl p-5 border border-cyan-900/40 space-y-4">
          <div className="flex items-center gap-2 text-cyan-300 font-hud text-xs border-b border-cyan-900/40 pb-2">
            <PiggyBank className="w-4 h-4 text-amber-400" />
            <span>METAS & RESERVA DE EMERGÊNCIA</span>
          </div>

          <div className="space-y-4">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              return (
                <div key={g.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-tech font-bold text-xs text-slate-100">{g.title}</h4>
                      <span className="text-[10px] text-cyan-400 font-tech">{g.category}</span>
                    </div>
                    <span className="text-xs font-hud text-amber-300">{pct}%</span>
                  </div>

                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] font-tech text-slate-400">
                    <span>R$ {g.currentAmount.toLocaleString('pt-BR')}</span>
                    <span>Alvo: R$ {g.targetAmount.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="hud-panel rounded-2xl p-5 border border-cyan-900/40 space-y-3">
        <div className="flex justify-between items-center text-xs font-hud text-cyan-300 border-b border-cyan-900/40 pb-2">
          <span>EXTRATO DE TRANSAÇÕES RECENTES</span>
          <span className="text-slate-500">{transactions.length} registros</span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-tech">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50" />
            <p className="text-xs text-slate-400">Suas finanças estão totalmente zeradas.</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Nenhuma receita ou despesa registrada. Clique em "Registrar Transação" para começar um novo período!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-cyan-950/60">
            {transactions.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      t.type === 'income'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>

                  <div>
                    <h5 className="font-tech font-bold text-xs text-slate-100">{t.description}</h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-sans">
                      <span>{t.category}</span>
                      <span>•</span>
                      <span>{t.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`font-hud font-bold text-xs ${
                      t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>

                  {onDeleteTransaction && (
                    <button
                      onClick={() => onDeleteTransaction(t.id)}
                      className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Excluir lançamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hud-panel rounded-2xl p-6 border border-cyan-500/50 bg-slate-950 w-full max-w-md space-y-4">
            <h3 className="font-hud text-sm text-cyan-300">REGISTRAR ENTRADA OU DESPESA</h3>

            <form onSubmit={handleSaveTransaction} className="space-y-3 text-xs font-tech">
              <div>
                <label className="text-slate-400 block mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Ex: Aporte Tesouro Direto ou Mercado"
                  className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="expense">Despesa (-)</option>
                    <option value="income">Receita (+)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                >
                  <option value="Moradia">Moradia</option>
                  <option value="Alimentação">Alimentação</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Educação">Educação / Cursos</option>
                  <option value="Investimentos">Investimentos / Reserva</option>
                  <option value="Lazer">Lazer</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação: Zerar Finanças */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="hud-panel rounded-3xl p-6 border border-rose-500/50 bg-slate-950 w-full max-w-md space-y-4 relative shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-400 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-hud font-bold text-slate-100">
                  Zerar Todas as Finanças
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Protocolo de redefinição de fluxo financeiro
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              Tem certeza que deseja zerar todas as suas finanças? Esta ação excluirá permanentemente todos os lançamentos de receitas e despesas registradas e seu saldo retornará para <strong className="text-rose-400">R$ 0,00</strong>.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-tech text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onResetFinances();
                  playJarvisBeep(520, 0.08);
                  setIsResetConfirmOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-tech font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Zerar Minhas Finanças</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
