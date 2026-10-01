export interface SmartDevice {
  id: string;
  name: string;
  room: string;
  type: 'light' | 'thermostat' | 'lock' | 'curtain' | 'switch' | 'tv' | 'sensor';
  status: 'on' | 'off' | 'locked' | 'unlocked' | 'open' | 'closed';
  value?: number; // e.g., brightness %, temperature °C
  powerConsumptionWatts?: number;
  lastUpdated: string;
}

export interface SmartRoutine {
  id: string;
  name: string;
  description: string;
  iconName: string;
  actions: { deviceId: string; command: string; value?: number }[];
}

export interface TaskItem {
  id: string;
  title: string;
  category: 'Trabalho' | 'Estudos Tech' | 'Finanças' | 'Espiritual' | 'Saúde' | 'Geral';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  dueDate: string;
  completed: boolean;
  notes?: string;
  xpReward: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  category: 'Trabalho' | 'Estudos' | 'Devocional' | 'Finanças' | 'Descanso';
  priority: 'alta' | 'media' | 'baixa';
  reminderSet: boolean;
}

export interface FinancialTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'Moradia' | 'Alimentação' | 'Transporte' | 'Educação' | 'Investimentos' | 'Lazer' | 'Outros';
  date: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  deadline: string;
  category: string;
}

export interface TechCourse {
  id: string;
  title: string;
  provider: string;
  field: string;
  level: string;
  workload: string;
  isFree: boolean;
  deadline: string;
  description: string;
  url: string;
  tags: string[];
  status?: 'interessado' | 'inscrito' | 'em_andamento' | 'concluido';
  reminderDate?: string;
}

export interface SpiritualReflection {
  verse: string;
  reference: string;
  theme: string;
  meditation: string;
  practicalAction: string;
  prayer: string;
}

export interface GamificationState {
  xp: number;
  level: number;
  levelName: string;
  streakDays: number;
  lastActiveDate: string;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  xpBonus: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
  timestamp: string;
  audioBase64?: string;
  actions?: string[];
}
