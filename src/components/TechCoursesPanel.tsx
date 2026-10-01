import React, { useState } from 'react';
import {
  Code,
  ExternalLink,
  Calendar,
  Clock,
  Award,
  Sparkles,
  Bell,
  CheckCircle2,
  Filter,
  BookmarkPlus,
  BookOpen,
  Zap
} from 'lucide-react';
import { TechCourse } from '../types';
import { playJarvisBeep, playChime } from '../utils/audio';

interface TechCoursesPanelProps {
  courses: TechCourse[];
  onAddCourseReminder: (course: TechCourse) => void;
  onUpdateCourseStatus: (courseId: string, status: TechCourse['status']) => void;
  onAddXp: (amount: number, reason: string) => void;
}

export const TechCoursesPanel: React.FC<TechCoursesPanelProps> = ({
  courses,
  onAddCourseReminder,
  onUpdateCourseStatus,
  onAddXp
}) => {
  const [selectedField, setSelectedField] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const fields = ['Todos', 'Inteligência Artificial', 'Desenvolvimento Back-End', 'Desenvolvimento Front-End', 'Ciência da Computação', 'Cloud Computing', 'Cibersegurança'];

  const filteredCourses = courses.filter((c) => {
    const matchesField = selectedField === 'Todos' || c.field === selectedField;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesField && matchesSearch;
  });

  const handleReminderClick = (course: TechCourse) => {
    playChime();
    onAddCourseReminder(course);
    onAddXp(40, `Lembrete criado para o curso: ${course.title}`);
  };

  const handleStatusChange = (course: TechCourse, status: TechCourse['status']) => {
    playJarvisBeep(980, 0.05);
    onUpdateCourseStatus(course.id, status);
    if (status === 'inscrito') {
      playChime();
      onAddXp(100, `Inscrição confirmada no curso: ${course.title}`);
    } else if (status === 'concluido') {
      playChime();
      onAddXp(200, `Certificado/Curso concluído: ${course.title}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 hud-panel rounded-2xl border border-cyan-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-cyan-400" />
            <h2 className="font-hud font-bold text-lg text-cyan-100 tracking-wider">
              RADAR DE CURSOS GRATUITOS DE TECNOLOGIA
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-tech mt-1">
            Oportunidades de alto nível em IA, Programação, Cloud e Segurança com lembretes automáticos para não perder prazos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Python, IA, AWS, Java..."
            className="bg-slate-900 border border-cyan-900 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-56 font-sans"
          />
        </div>
      </div>

      {/* Field selection tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-tech">
        {fields.map((field) => (
          <button
            key={field}
            onClick={() => setSelectedField(field)}
            className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
              selectedField === field
                ? 'border-cyan-400 bg-cyan-950 text-cyan-300 glow-cyan-sm'
                : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
            }`}
          >
            {field}
          </button>
        ))}
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.map((course) => {
          const isUrgent = course.deadline && course.deadline !== 'Sempre Aberto' && course.deadline !== 'Acesso Imediato';

          return (
            <div
              key={course.id}
              className="hud-panel rounded-2xl p-5 border border-cyan-900/50 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                {/* Provider and tags */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-tech text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
                    {course.provider}
                  </span>
                  <span className="text-[10px] font-hud text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
                    100% GRATUITO
                  </span>
                </div>

                <h3 className="font-tech font-bold text-base text-slate-100 leading-snug">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-3">
                  {course.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {course.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-tech text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Meta details & Action footer */}
              <div className="space-y-3 pt-3 border-t border-cyan-950">
                <div className="flex items-center justify-between text-[11px] font-tech text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-500" />
                    Carga Horária: {course.workload}
                  </span>
                  <span className="flex items-center gap-1 text-amber-300 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Prazo: {course.deadline}
                  </span>
                </div>

                {/* Status Dropdown & Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <select
                    value={course.status || 'interessado'}
                    onChange={(e) => handleStatusChange(course, e.target.value as any)}
                    className="bg-slate-900 border border-cyan-900 rounded-xl px-2.5 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-tech"
                  >
                    <option value="interessado">Interessado</option>
                    <option value="inscrito">Inscrito (+100 XP)</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído (+200 XP)</option>
                  </select>

                  <div className="flex items-center gap-2">
                    {/* Auto Reminder button */}
                    <button
                      onClick={() => handleReminderClick(course)}
                      className="px-3 py-1.5 rounded-xl border border-amber-600/50 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-tech flex items-center gap-1.5 transition-all"
                      title="Adicionar lembrete automático à minha agenda para não perder a inscrição"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Criar Lembrete</span>
                    </button>

                    {/* Direct link */}
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-tech font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>Acessar</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
