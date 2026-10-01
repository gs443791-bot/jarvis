import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  AlertCircle,
  Sparkles,
  Download,
  Trash2,
  Tag,
  Sunrise,
  Sun,
  Moon,
  CheckSquare
} from 'lucide-react';
import { TaskItem, CalendarEvent } from '../types';
import { playJarvisBeep, playChime } from '../utils/audio';

interface CalendarRoutinePanelProps {
  tasks: TaskItem[];
  events: CalendarEvent[];
  onAddTask: (task: TaskItem) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onAddXp: (amount: number, reason: string) => void;
}

export const CalendarRoutinePanel: React.FC<CalendarRoutinePanelProps> = ({
  tasks,
  events,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onAddEvent,
  onDeleteEvent,
  onAddXp
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'agenda' | 'routine'>('tasks');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskItem['category']>('Estudos Tech');
  const [taskPriority, setTaskPriority] = useState<TaskItem['priority']>('alta');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskNotes, setTaskNotes] = useState('');

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventStartTime, setEventStartTime] = useState('09:00');
  const [eventEndTime, setEventEndTime] = useState('10:00');
  const [eventCategory, setEventCategory] = useState<CalendarEvent['category']>('Trabalho');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      category: taskCategory,
      priority: taskPriority,
      dueDate: taskDueDate,
      completed: false,
      notes: taskNotes.trim() || undefined,
      xpReward: taskPriority === 'urgente' ? 100 : taskPriority === 'alta' ? 80 : 50
    };

    onAddTask(newTask);
    playChime();
    onAddXp(25, 'Nova meta adicionada à rotina');
    setTaskTitle('');
    setTaskNotes('');
    setIsTaskModalOpen(false);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: eventTitle.trim(),
      date: eventDate,
      startTime: eventStartTime,
      endTime: eventEndTime,
      category: eventCategory,
      priority: 'alta',
      reminderSet: true
    };

    onAddEvent(newEvent);
    playChime();
    setEventTitle('');
    setIsEventModalOpen(false);
  };

  const handleTaskCheck = (task: TaskItem) => {
    playJarvisBeep(1000, 0.06);
    onToggleTask(task.id);
    if (!task.completed) {
      playChime();
      onAddXp(task.xpReward, `Meta concluída: ${task.title}`);
    }
  };

  // Export events to .ics format
  const exportToICalendar = () => {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//JARVIS AI OS//Agenda Inteligente//PT\nCALSCALE:GREGORIAN\n`;

    events.forEach((evt) => {
      const cleanDate = evt.date.replace(/-/g, '');
      const cleanStart = evt.startTime.replace(/:/g, '') + '00';
      const cleanEnd = evt.endTime.replace(/:/g, '') + '00';
      icsContent += `BEGIN:VEVENT\nSUMMARY:${evt.title}\nDTSTART:${cleanDate}T${cleanStart}\nDTEND:${cleanDate}T${cleanEnd}\nDESCRIPTION:Compromisso sincronizado via J.A.R.V.I.S. AI OS (${evt.category})\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
    });

    icsContent += `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jarvis-agenda-${new Date().toISOString().split('T')[0]}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTasks = tasks.filter((t) => {
    if (categoryFilter === 'todos') return true;
    return t.category === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 hud-panel rounded-2xl border border-cyan-900/40">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-cyan-400" />
            <h2 className="font-hud font-bold text-lg text-cyan-100 tracking-wider">
              ROTINA DIÁRIA & CALENDÁRIO INTELIGENTE
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-tech mt-1">
            Organização tática de tarefas, prioridades do dia e sincronização de compromissos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToICalendar}
            className="px-3 py-2 rounded-xl border border-cyan-900 bg-slate-900/80 hover:border-cyan-400 text-cyan-300 text-xs font-tech flex items-center gap-1.5 transition-all"
            title="Exportar para Google Agenda ou Apple Calendar (.ics)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar .ICS</span>
          </button>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-slate-950 font-tech font-bold text-xs flex items-center gap-1.5 transition-all glow-cyan-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Meta</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-cyan-950 pb-2 text-xs font-tech">
        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'tasks'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Minhas Metas & Tarefas ({tasks.filter((t) => !t.completed).length} pendentes)
        </button>
        <button
          onClick={() => setActiveSubTab('agenda')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'agenda'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Calendário & Compromissos ({events.length})
        </button>
        <button
          onClick={() => setActiveSubTab('routine')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'routine'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Protocolo de Rotina Stark (Time-Blocking)
        </button>
      </div>

      {/* Sub Tab: Tasks List */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-4">
          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-tech">
            {['todos', 'Trabalho', 'Estudos Tech', 'Finanças', 'Espiritual', 'Saúde', 'Geral'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full border transition-all capitalize ${
                  categoryFilter === cat
                    ? 'border-cyan-400 bg-cyan-950 text-cyan-300'
                    : 'border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTasks.map((task) => {
              const priorityColors = {
                urgente: 'border-rose-500/60 bg-rose-950/30 text-rose-300',
                alta: 'border-amber-500/60 bg-amber-950/30 text-amber-300',
                media: 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300',
                baixa: 'border-slate-600 bg-slate-900/40 text-slate-400'
              };

              return (
                <div
                  key={task.id}
                  className={`hud-panel rounded-xl p-4 border transition-all flex items-start gap-3 ${
                    task.completed
                      ? 'border-slate-800/80 bg-slate-950/50 opacity-60'
                      : 'border-cyan-900/50 hover:border-cyan-500/50'
                  }`}
                >
                  <button
                    onClick={() => handleTaskCheck(task)}
                    className="mt-0.5 text-cyan-400 hover:text-cyan-300 flex-shrink-0 transition-transform active:scale-90"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-cyan-500/70" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-medium ${
                          task.completed
                            ? 'line-through text-slate-500'
                            : 'text-slate-100 font-semibold'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <span
                        className={`text-[10px] font-hud px-2 py-0.5 rounded-full border uppercase ${
                          priorityColors[task.priority]
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.notes && (
                      <p className="text-xs text-slate-400 font-sans mt-1 line-clamp-2">
                        {task.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[11px] font-tech text-slate-400">
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Tag className="w-3 h-3" />
                        {task.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {task.dueDate}
                      </span>
                      <span>•</span>
                      <span className="text-amber-400 font-hud">+{task.xpReward} XP</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 text-slate-600 hover:text-rose-400 transition-colors flex-shrink-0"
                    title="Excluir meta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-10 hud-panel rounded-2xl border border-cyan-900/30">
              <CheckSquare className="w-8 h-8 text-cyan-500 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-slate-400 font-tech">
                Nenhuma meta nesta categoria. Clique em "Adicionar Meta" para cadastrar novas prioridades.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sub Tab: Agenda & Events */}
      {activeSubTab === 'agenda' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-hud text-cyan-300">
              AGENDA DE COMPROMISSOS SINCRONIZADA
            </span>
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-700 hover:border-cyan-400 text-cyan-300 text-xs font-tech flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Compromisso</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="hud-panel rounded-xl p-4 border border-cyan-900/40 hover:border-cyan-500/50 flex items-start justify-between"
              >
                <div>
                  <span className="text-[10px] font-hud text-cyan-400 uppercase tracking-wider block mb-1">
                    {evt.category}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-100">{evt.title}</h4>
                  <div className="flex items-center gap-3 mt-2 text-xs font-tech text-slate-400">
                    <span className="text-cyan-300">
                      {evt.startTime} - {evt.endTime}
                    </span>
                    <span>•</span>
                    <span>{evt.date}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteEvent(evt.id)}
                  className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Tab: Stark Daily Time-blocking Routine */}
      {activeSubTab === 'routine' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Manhã */}
          <div className="hud-panel rounded-2xl p-4 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-hud text-xs border-b border-amber-900/30 pb-2">
              <Sunrise className="w-4 h-4" />
              <span>PROTOCOLO MATINAL (06:30 - 12:00)</span>
            </div>
            <ul className="space-y-2.5 text-xs font-sans text-slate-300">
              <li className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-amber-300 font-tech block">07:00 • Oração & Devocional</strong>
                Meditação na Palavra com versículo diário e gratidão.
              </li>
              <li className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-amber-300 font-tech block">07:45 • Briefing J.A.R.V.I.S.</strong>
                Revisão das 3 principais prioridades executivas do dia.
              </li>
              <li className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-amber-300 font-tech block">09:00 - 12:00 • Bloco Deep Work</strong>
                Trabalho de alto foco sem distrações ou redes sociais.
              </li>
            </ul>
          </div>

          {/* Tarde */}
          <div className="hud-panel rounded-2xl p-4 border border-cyan-500/30 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-hud text-xs border-b border-cyan-900/30 pb-2">
              <Sun className="w-4 h-4" />
              <span>PROTOCOLO VESPERTINO (13:30 - 18:30)</span>
            </div>
            <ul className="space-y-2.5 text-xs font-sans text-slate-300">
              <li className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-cyan-300 font-tech block">14:00 • Estudos Tech & Código</strong>
                Dedicar 1 a 2 horas para cursos gratuitos de IA/Programação.
              </li>
              <li className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-cyan-300 font-tech block">16:30 • Gestão & Finanças</strong>
                Conferência de despesas e alinhamento de metas mensais.
              </li>
              <li className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-cyan-300 font-tech block">18:00 • Pausa & Respiração</strong>
                Protocolo de Calma 4-4-4-4 para desaceleração.
              </li>
            </ul>
          </div>

          {/* Noite */}
          <div className="hud-panel rounded-2xl p-4 border border-indigo-500/30 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-hud text-xs border-b border-indigo-900/30 pb-2">
              <Moon className="w-4 h-4" />
              <span>PROTOCOLO NOTURNO (19:30 - 23:00)</span>
            </div>
            <ul className="space-y-2.5 text-xs font-sans text-slate-300">
              <li className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-indigo-300 font-tech block">20:00 • Descontração & Família</strong>
                Ativação do Modo Cinema ou descanso mental.
              </li>
              <li className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-indigo-300 font-tech block">22:00 • Revisão do Dia</strong>
                Marcação das metas concluídas e coleta de XP do Reator Arc.
              </li>
              <li className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong className="text-indigo-300 font-tech block">22:45 • Hibernação SmartThings</strong>
                Luzes desligadas, portas trancadas e clima ameno.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hud-panel rounded-2xl p-6 border border-cyan-500/50 bg-slate-950 w-full max-w-md space-y-4">
            <h3 className="font-hud text-sm text-cyan-300">CRIAR NOVA META OU TAREFA</h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs font-tech">
              <div>
                <label className="text-slate-400 block mb-1">Título da Meta</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Ex: Concluir módulo 2 de IA no Bootcamp Santander"
                  className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Categoria</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Estudos Tech">Estudos Tech</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Finanças">Finanças</option>
                    <option value="Espiritual">Espiritual</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Prioridade</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Data Limite</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Observações Táticas</label>
                <textarea
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="Dica ou detalhes adicionais..."
                  rows={2}
                  className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
                >
                  Confirmar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hud-panel rounded-2xl p-6 border border-cyan-500/50 bg-slate-950 w-full max-w-md space-y-4">
            <h3 className="font-hud text-sm text-cyan-300">NOVO COMPROMISSO NO CALENDÁRIO</h3>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs font-tech">
              <div>
                <label className="text-slate-400 block mb-1">Título do Evento</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Ex: Mentoria de Carreira Tech com JARVIS"
                  className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Data</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Horário Início</label>
                  <input
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                  </input>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Horário Término</label>
                  <input
                    type="time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Categoria</label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                >
                  <option value="Trabalho">Trabalho</option>
                  <option value="Estudos">Estudos</option>
                  <option value="Devocional">Devocional</option>
                  <option value="Finanças">Finanças</option>
                  <option value="Descanso">Descanso</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
                >
                  Salvar Compromisso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
