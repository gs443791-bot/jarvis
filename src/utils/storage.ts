import {
  SmartDevice,
  TaskItem,
  CalendarEvent,
  FinancialTransaction,
  FinancialGoal,
  TechCourse,
  SpiritualReflection,
  GamificationState
} from '../types';

const STORAGE_KEYS = {
  SMART_DEVICES: 'jarvis_smart_devices',
  SMARTTHINGS_TOKEN: 'jarvis_smartthings_token',
  TASKS: 'jarvis_tasks',
  CALENDAR_EVENTS: 'jarvis_calendar_events',
  FINANCES: 'jarvis_finances',
  FINANCIAL_GOALS: 'jarvis_financial_goals',
  TECH_COURSES: 'jarvis_tech_courses',
  GAMIFICATION: 'jarvis_gamification',
  SPIRITUAL_NOTES: 'jarvis_spiritual_notes',
  USER_PREFERENCES: 'jarvis_user_preferences'
};

export const INITIAL_DEVICES: SmartDevice[] = [
  {
    id: 'st-dev-01',
    name: 'Iluminação Sala Principal (RGB)',
    room: 'Sala de Estar',
    type: 'light',
    status: 'on',
    value: 80,
    powerConsumptionWatts: 14,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'st-dev-02',
    name: 'Ar-Condicionado Samsung WindFree',
    room: 'Quarto & Escritório',
    type: 'thermostat',
    status: 'on',
    value: 22,
    powerConsumptionWatts: 850,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'st-dev-03',
    name: 'Fechadura Biométrica Samsung Smart',
    room: 'Porta de Entrada',
    type: 'lock',
    status: 'locked',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'st-dev-04',
    name: 'Cortina Automatizada Blackout',
    room: 'Escritório',
    type: 'curtain',
    status: 'open',
    value: 100,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'st-dev-05',
    name: 'Tomada Inteligente Setup Gamer / Workstation',
    room: 'Escritório',
    type: 'switch',
    status: 'on',
    powerConsumptionWatts: 240,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'st-dev-06',
    name: 'Smart TV Samsung Neo QLED 65"',
    room: 'Sala de Estar',
    type: 'tv',
    status: 'off',
    powerConsumptionWatts: 0,
    lastUpdated: new Date().toISOString()
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Estudar 1 hora de Arquitetura de IA & Python',
    category: 'Estudos Tech',
    priority: 'alta',
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    notes: 'Avançar no módulo de IA Generativa do Santander Bootcamp',
    xpReward: 80
  },
  {
    id: 'task-2',
    title: 'Aporte de R$ 300 na Reserva de Emergência',
    category: 'Finanças',
    priority: 'alta',
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    notes: 'Manter a disciplina do método 50/30/20 recomendado pelo JARVIS',
    xpReward: 90
  },
  {
    id: 'task-3',
    title: 'Devocional & Meditação da Palavra (Salmo 23)',
    category: 'Espiritual',
    priority: 'media',
    dueDate: new Date().toISOString().split('T')[0],
    completed: true,
    notes: 'Agradecer pelas vitórias da semana e orar por discernimento',
    xpReward: 60
  },
  {
    id: 'task-4',
    title: 'Configurar automação Noturna SmartThings',
    category: 'Geral',
    priority: 'baixa',
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    notes: 'Criar rotina para trancar portas e apagar luzes às 23:30',
    xpReward: 50
  },
  {
    id: 'task-5',
    title: 'Revisar relatório semanal de gastos e investimentos',
    category: 'Finanças',
    priority: 'media',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    completed: false,
    xpReward: 70
  }
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Briefing Executivo & Oração Matinal',
    date: new Date().toISOString().split('T')[0],
    startTime: '07:30',
    endTime: '08:00',
    category: 'Devocional',
    priority: 'alta',
    reminderSet: true
  },
  {
    id: 'evt-2',
    title: 'Deep Work: Desenvolvimento & Código',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '12:00',
    category: 'Trabalho',
    priority: 'alta',
    reminderSet: true
  },
  {
    id: 'evt-3',
    title: 'Mentoria Financeira JARVIS & Aportes',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:30',
    endTime: '15:15',
    category: 'Finanças',
    priority: 'media',
    reminderSet: true
  },
  {
    id: 'evt-4',
    title: 'Estudo Curso Tech: AWS Cloud Practitioner',
    date: new Date().toISOString().split('T')[0],
    startTime: '19:00',
    endTime: '20:30',
    category: 'Estudos',
    priority: 'alta',
    reminderSet: true
  }
];

export const INITIAL_FINANCES: FinancialTransaction[] = [
  {
    id: 'fin-1',
    description: 'Salário & Renda Principal',
    amount: 5800.0,
    type: 'income',
    category: 'Investimentos',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'fin-2',
    description: 'Aporte Tesouro Selic (Reserva)',
    amount: 600.0,
    type: 'expense',
    category: 'Investimentos',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'fin-3',
    description: 'Aluguel & Condomínio',
    amount: 1450.0,
    type: 'expense',
    category: 'Moradia',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'fin-4',
    description: 'Supermercado Mensal',
    amount: 720.0,
    type: 'expense',
    category: 'Alimentação',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'fin-5',
    description: 'Internet Fibra Óptica 1Gbps',
    amount: 140.0,
    type: 'expense',
    category: 'Educação',
    date: new Date().toISOString().split('T')[0]
  }
];

export const INITIAL_FINANCIAL_GOALS: FinancialGoal[] = [
  {
    id: 'goal-1',
    title: 'Reserva de Emergência Blindada (6 Meses)',
    currentAmount: 14500.0,
    targetAmount: 22000.0,
    deadline: '2026-12-31',
    category: 'Segurança Financeira'
  },
  {
    id: 'goal-2',
    title: 'Fundo para Certificações Internacionais Tech (AWS & GCP)',
    currentAmount: 1800.0,
    targetAmount: 3000.0,
    deadline: '2026-11-30',
    category: 'Carreira'
  }
];

export const INITIAL_GAMIFICATION: GamificationState = {
  xp: 1480,
  level: 3,
  levelName: 'Armadura Mark III (Aprimorada)',
  streakDays: 5,
  lastActiveDate: new Date().toISOString().split('T')[0],
  achievements: [
    {
      id: 'ach-1',
      title: 'Iniciação Stark',
      description: 'Conectou os subsistemas principais do JARVIS e realizou o primeiro briefing.',
      icon: 'zap',
      unlocked: true,
      unlockedAt: '2026-09-25',
      xpBonus: 100
    },
    {
      id: 'ach-2',
      title: 'Mente Serena',
      description: 'Completou 3 sessões do Protocolo de Respiração & Calma.',
      icon: 'wind',
      unlocked: true,
      unlockedAt: '2026-09-28',
      xpBonus: 150
    },
    {
      id: 'ach-3',
      title: 'Guardião do Lar',
      description: 'Automatizou a casa inteligente com rotinas de SmartThings.',
      icon: 'home',
      unlocked: true,
      unlockedAt: '2026-09-29',
      xpBonus: 120
    },
    {
      id: 'ach-4',
      title: 'Investidor de Ferro',
      description: 'Manteve a reserva de emergência e registrou despesas por 7 dias seguidos.',
      icon: 'trending-up',
      unlocked: false,
      xpBonus: 200
    },
    {
      id: 'ach-5',
      title: 'Mestre do Código',
      description: 'Inscreveu-se em um curso de tecnologia gratuito recomendado pelo JARVIS.',
      icon: 'code',
      unlocked: true,
      unlockedAt: '2026-09-30',
      xpBonus: 180
    },
    {
      id: 'ach-6',
      title: 'Guerreiro da Fé',
      description: 'Completou 7 dias consecutivos de meditação e versículos bíblicos diários.',
      icon: 'heart',
      unlocked: false,
      xpBonus: 250
    },
    {
      id: 'ach-7',
      title: 'Protocolo Nanotech Mark LXXXV',
      description: 'Alcançou o nível máximo do Reator Arc com produtividade e disciplina total.',
      icon: 'shield',
      unlocked: false,
      xpBonus: 500
    }
  ]
};

export const BIBLICAL_REFLECTIONS: SpiritualReflection[] = [
  {
    verse: '“Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus. E a paz de Deus, que excede todo o entendimento, guardará o coração e a mente de vocês em Cristo Jesus.”',
    reference: 'Filipenses 4:6-7',
    theme: 'Paz Interior & Vitória sobre a Ansiedade',
    meditation: 'Quando a mente é bombardeada por prazos, preocupações financeiras e incertezas do futuro, o antídoto não é absorver o caos, mas entregá-lo em oração sincera. A paz de Deus não depende de circunstâncias favoráveis; ela é uma fortaleza que guarda seus sentimentos e pensamentos mesmo em meio à tempestade.',
    practicalAction: 'Escreva agora em um papel uma preocupação que rouba sua energia hoje e declare: "Deus está no comando disto". Respire aliviado e concentre-se na sua próxima ação.',
    prayer: 'Senhor meu Deus, entrego em Tuas mãos todas as minhas ansiedades e medos. Concede-me a Tua paz sobrenatural que acalma meu peito e clareia minha mente. Ensina-me a ser grato em cada detalhe. Amém.'
  },
  {
    verse: '“Consagre ao Senhor tudo o que você faz, e os seus planos serão bem-sucedidos.”',
    reference: 'Provérbios 16:3',
    theme: 'Propósito, Trabalho & Prosperidade',
    meditation: 'O trabalho com excelência ganha um peso sagrado quando você o dedica a um propósito maior do que o mero retorno financeiro. Consagrar seus estudos de tecnologia, suas decisões de negócios e seus projetos significa agir com integridade, diligência e fé inabalável.',
    practicalAction: 'Antes de iniciar sua próxima tarefa de trabalho ou estudo, faça uma pausa de 10 segundos e dedique aquele esforço a Deus com foco total.',
    prayer: 'Pai Amado, coloco meus planos profissionais, minhas metas e meus estudos diante do Teu altar. Que o meu trabalho seja motivo de honra e que minhas mãos sejam instrumentos de bênção. Amém.'
  },
  {
    verse: '“O Senhor é o meu pastor; de nada terei falta. Em verdes pastagens me faz repousar e me conduz a águas tranquilas; restaura-me o vigor.”',
    reference: 'Salmos 23:1-3',
    theme: 'Descanso, Restauração & Confiança',
    meditation: 'Nossa cultura glorifica a exaustão, mas Deus instituiu o descanso como remédio. Você não precisa carregar o mundo nas costas. O Bom Pastor conduz sua alma para águas serenas para que suas forças se renovem.',
    practicalAction: 'Tire uma pausa de 5 minutos longe de telas agora. Olhe para o céu ou feche os olhos e sinta o vigor da vida preenchendo seu corpo.',
    prayer: 'Senhor, obrigado porque Tu és o meu pastor e cuidas de mim em cada detalhe. Restaura minhas energias físicas e espirituais para que eu continue minha jornada com entusiasmo. Amém.'
  },
  {
    verse: '“Pois não nos deu Deus espírito de covardia, mas de poder, de amor e de moderação.”',
    reference: '2 Timóteo 1:7',
    theme: 'Coragem, Autocontrole & Disciplina',
    meditation: 'O medo paralisa o potencial que Deus colocou em você. Você foi equipado com mente lúcida (autocontrole/moderação), força para superar adversidades e amor para guiar suas ações.',
    practicalAction: 'Encare hoje a tarefa que você vinha procrastinando por receio. Dê o primeiro passo com decisão firme.',
    prayer: 'Deus, retira de mim toda paralisia e dúvida. Enche-me do Teu Santo Espírito com coragem inabalável, foco inquebrantável e sabedoria prática. Amém.'
  }
];

export const ARC_LEVELS = [
  { level: 1, name: 'Reator Mark I (Iniciação)', minXp: 0, maxXp: 500 },
  { level: 2, name: 'Armadura Mark II (Prototipagem)', minXp: 500, maxXp: 1200 },
  { level: 3, name: 'Armadura Mark III (Aprimorada)', minXp: 1200, maxXp: 2200 },
  { level: 4, name: 'Armadura Mark VII (Operações Avançadas)', minXp: 2200, maxXp: 3500 },
  { level: 5, name: 'Hulkbuster Mark XLIV (Força Pesada)', minXp: 3500, maxXp: 5200 },
  { level: 6, name: 'Armadura Mark XLVI (Guerra Civil)', minXp: 5200, maxXp: 7200 },
  { level: 7, name: 'Armadura Mark L (Nanotecnologia Pura)', minXp: 7200, maxXp: 10000 },
  { level: 8, name: 'Armadura Mark LXXXV (Protocolo Supremo)', minXp: 10000, maxXp: 99999 }
];

export function getStoredData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    return fallback;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export { STORAGE_KEYS };
