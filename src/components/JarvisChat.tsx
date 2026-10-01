import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  Zap,
  Activity,
  Terminal,
  ShieldAlert,
  Loader2,
  Headphones
} from 'lucide-react';
import { ArcReactor } from './ArcReactor';
import { ChatMessage, SmartDevice, TaskItem, GamificationState } from '../types';
import {
  playJarvisBeep,
  playChime,
  speakJarvis,
  stopSpeaking,
  createSpeechRecognizer
} from '../utils/audio';

interface JarvisChatProps {
  smartDevices: SmartDevice[];
  tasks: TaskItem[];
  gamification: GamificationState;
  onExecuteDeviceCommand: (deviceId: string, command: string, value?: number) => void;
  onOpenCalm: () => void;
  onOpenBriefing: () => void;
  onOpenVoiceSettings: () => void;
  onNavigateTab: (tabId: string) => void;
  onAddXp: (amount: number, reason: string) => void;
}

export const JarvisChat: React.FC<JarvisChatProps> = ({
  smartDevices,
  tasks,
  gamification,
  onExecuteDeviceCommand,
  onOpenCalm,
  onOpenBriefing,
  onOpenVoiceSettings,
  onNavigateTab,
  onAddXp
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'jarvis',
      text: `Bom dia, Senhor. J.A.R.V.I.S. operacional e conectado à sua residência inteligente via SmartThings.

Seus sistemas estão com telemetria excelente. O Reator Arc opera em Nível ${gamification.level} (${gamification.levelName}).

Estou à sua inteira disposição para automatizar a casa, organizar suas tarefas, orientar seus investimentos financeiros, compartilhar versículos bíblicos edificantes ou conduzir um protocolo de calma caso o estresse se aproxime.

Como posso servi-lo agora?`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      actions: [
        'Status da casa inteligente',
        'Integrar meus emails (Gmail)',
        'Versículo do dia & Meditação',
        'Conselho do mentor financeiro',
        'Cursos gratuitos de tecnologia',
        'Protocolo de Calma & Respiração'
      ]
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoVoiceReply, setAutoVoiceReply] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognizerRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Voice recognition setup
  const toggleListening = () => {
    if (isListening) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      playJarvisBeep(1200, 0.05);
      const recognizer = createSpeechRecognizer(
        (transcript) => {
          setIsListening(false);
          if (transcript && transcript.trim()) {
            setInputText(transcript);
            handleSendMessage(transcript);
          }
        },
        (error) => {
          console.warn('Speech recognition error:', error);
          setIsListening(false);
        }
      );

      if (!recognizer) {
        alert('Seu navegador não suporta reconhecimento de voz direto. Você pode digitar normalmente.');
        return;
      }

      recognizerRef.current = recognizer;
      recognizer.start();
      setIsListening(true);
    } catch (e) {
      setIsListening(false);
    }
  };

  // Helper to detect local smart home / routine triggers from text
  const checkQuickCommands = (text: string): string | null => {
    const lower = text.toLowerCase();

    // Calm protocol
    if (
      lower.includes('calma') ||
      lower.includes('respirar') ||
      lower.includes('ansioso') ||
      lower.includes('ansiedade') ||
      lower.includes('estressado') ||
      lower.includes('estresse')
    ) {
      setTimeout(() => onOpenCalm(), 1500);
      return 'Com certeza, Senhor. Iniciando o Protocolo de Calma e Respiração imediatamente. Desacelere e acompanhe meu ritmo.';
    }

    // Smart home light
    if (lower.includes('apagar luz') || lower.includes('desligar luz')) {
      const light = smartDevices.find((d) => d.type === 'light');
      if (light) {
        onExecuteDeviceCommand(light.id, 'off');
        return 'Luzes da sala apagadas conforme solicitado no SmartThings, Senhor.';
      }
    }
    if (lower.includes('acender luz') || lower.includes('ligar luz')) {
      const light = smartDevices.find((d) => d.type === 'light');
      if (light) {
        onExecuteDeviceCommand(light.id, 'on');
        return 'Luzes da sala acesas a 80% de brilho, Senhor.';
      }
    }

    // Smart lock
    if (lower.includes('trancar') || lower.includes('fechadura')) {
      const lock = smartDevices.find((d) => d.type === 'lock');
      if (lock) {
        onExecuteDeviceCommand(lock.id, 'lock');
        return 'Fechadura biométrica trancada e sistema de segurança ativado, Senhor.';
      }
    }

    // Routine shortcuts
    if (lower.includes('modo cinema') || lower.includes('cinema')) {
      const light = smartDevices.find((d) => d.type === 'light');
      const tv = smartDevices.find((d) => d.type === 'tv');
      const curtain = smartDevices.find((d) => d.type === 'curtain');
      if (light) onExecuteDeviceCommand(light.id, 'on', 20);
      if (tv) onExecuteDeviceCommand(tv.id, 'on');
      if (curtain) onExecuteDeviceCommand(curtain.id, 'close', 0);
      return 'Protocolo Cinema ativado, Senhor. Luzes reduzidas para 20%, cortinas fechadas e TV ligada.';
    }

    // Tech courses navigation
    if (lower.includes('curso') || lower.includes('cursos') || lower.includes('programação')) {
      setTimeout(() => onNavigateTab('courses'), 2000);
    }

    // Email / Gmail navigation
    if (lower.includes('email') || lower.includes('e-mail') || lower.includes('gmail') || lower.includes('mensagem')) {
      setTimeout(() => onNavigateTab('emails'), 1800);
      return 'Abrindo a Central de Comunicação Gmail, Senhor. Você pode conectar sua conta Google para ler mensagens recentes, obter resumos executivos e redigir respostas com confirmação.';
    }

    // Finance navigation
    if (lower.includes('finança') || lower.includes('investimento') || lower.includes('dinheiro')) {
      setTimeout(() => onNavigateTab('finance'), 2500);
    }

    return null;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    playJarvisBeep(980, 0.05);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Check for immediate local command overrides
    const quickResponse = checkQuickCommands(text);

    try {
      let reply = quickResponse;
      let suggestedActions = [
        'Ver briefing matinal',
        'Como estão minhas finanças?',
        'Recomende um curso tech',
        'Protocolo de Calma'
      ];

      if (!reply) {
        // Send request to server-side Gemini API endpoint
        const response = await fetch('/api/jarvis/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            conversationHistory: messages.map((m) => ({
              role: m.sender === 'user' ? 'user' : 'model',
              text: m.text
            })),
            context: {
              level: gamification.level,
              xp: gamification.xp,
              pendingTasksCount: tasks.filter((t) => !t.completed).length,
              smartDevicesOnline: smartDevices.length
            }
          })
        });

        if (!response.ok) {
          throw new Error('Falha de resposta do servidor neural');
        }

        const data = await response.json();
        reply = data.reply || 'Compreendido, Senhor. Executando protocolos.';
        if (data.suggestedActions) {
          suggestedActions = data.suggestedActions;
        }
      }

      const jarvisMsg: ChatMessage = {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        text: reply || 'Compreendido, Senhor. Executando protocolos.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        actions: suggestedActions
      };

      setMessages((prev) => [...prev, jarvisMsg]);
      playChime();
      onAddXp(20, 'Interação com J.A.R.V.I.S.');

      // Voice synthesis (Movie Grade with Holographic DSP)
      if (autoVoiceReply && reply) {
        setIsSpeaking(true);
        // Clean markdown symbols for cleaner voice pronunciation
        const cleanForSpeech = reply.replace(/[*#_`>]/g, '');
        speakJarvis(cleanForSpeech, undefined, () => {
          setIsSpeaking(false);
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: `jarvis-err-${Date.now()}`,
        sender: 'jarvis',
        text: `Senhor, detectei uma oscilação na conexão com a rede neural externa. Mantendo operações em contingência local. Estou pronto para ajudar com seus dispositivos, rotinas ou meditações.`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopAudio = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Arc Reactor Core & Telemetry */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Arc Reactor Panel */}
        <div className="hud-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] font-hud text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            STARK ARC CORE
          </div>

          <div className="absolute top-3 right-4 text-[10px] font-hud text-slate-400">
            MARK VII
          </div>

          {/* Central Interactive Arc Reactor */}
          <div className="my-4">
            <ArcReactor
              size={190}
              isSpeaking={isSpeaking}
              isListening={isListening}
              energyPercent={98}
              onClick={() => {
                if (isSpeaking) {
                  handleStopAudio();
                } else {
                  toggleListening();
                }
              }}
              title="Clique para falar com o J.A.R.V.I.S. ou pausar a voz"
            />
          </div>

          <div className="w-full mt-2">
            <h3 className="font-hud font-bold text-base text-cyan-200 tracking-wider">
              {isSpeaking ? 'TRANSMITINDO VOZ' : isListening ? 'OUVINDO COMANDO...' : 'SISTEMA EM ESPERA'}
            </h3>
            <p className="text-xs text-slate-400 font-tech mt-1">
              {isSpeaking
                ? 'J.A.R.V.I.S. sintetizando resposta vocal neural'
                : isListening
                ? 'Fale em português claramente'
                : 'Toque no Reator Arc ou no microfone para falar'}
            </p>
          </div>

          {/* Voice controls */}
          <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-cyan-900/30 w-full">
            <button
              onClick={() => setAutoVoiceReply(!autoVoiceReply)}
              className={`px-3 py-1.5 rounded-lg text-xs font-tech flex items-center gap-1.5 transition-all border ${
                autoVoiceReply
                  ? 'border-cyan-500/50 bg-cyan-950/60 text-cyan-300'
                  : 'border-slate-800 bg-slate-900/60 text-slate-500'
              }`}
              title="Voz do JARVIS ao responder"
            >
              {autoVoiceReply ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>Voz: {autoVoiceReply ? 'Ligada' : 'Muda'}</span>
            </button>

            <button
              onClick={onOpenVoiceSettings}
              className="px-3 py-1.5 rounded-lg text-xs font-tech border border-cyan-800 bg-slate-900/80 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all flex items-center gap-1.5"
              title="Calibrar Voz do Filme (Dublagem Brasil / Paul Bettany & Efeito Capacete HUD)"
            >
              <Headphones className="w-3.5 h-3.5 text-cyan-400" />
              <span>Voz do Filme</span>
            </button>

            {isSpeaking && (
              <button
                onClick={handleStopAudio}
                className="px-3 py-1.5 rounded-lg text-xs font-tech bg-rose-950/50 border border-rose-500/50 text-rose-300 hover:bg-rose-900/60 transition-all flex items-center gap-1"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Interromper</span>
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Status Panel */}
        <div className="hud-panel rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-hud text-cyan-400 border-b border-cyan-900/30 pb-2">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              TELEMETRIA DO SISTEMA
            </span>
            <span className="text-[10px] text-emerald-400">NORMAL</span>
          </div>

          <div className="space-y-2.5 text-xs font-tech">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Carga do Reator Arc</span>
                <span className="text-cyan-300 font-hud">98.4%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-cyan-950">
                <div className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full w-[98%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Hub SmartThings (Dispositivos)</span>
                <span className="text-emerald-300 font-hud">
                  {smartDevices.filter((d) => d.status === 'on' || d.status === 'locked').length}/
                  {smartDevices.length} Ativos
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-cyan-950">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[85%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Tarefas Diárias Concluídas</span>
                <span className="text-amber-300 font-hud">
                  {tasks.filter((t) => t.completed).length}/{tasks.length}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-cyan-950">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full"
                  style={{
                    width: `${tasks.length ? (tasks.filter((t) => t.completed).length / tasks.length) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-cyan-900/30 flex items-center justify-between text-[11px] text-slate-400">
            <span>Protocolo de Defesa: Ativo</span>
            <span className="text-cyan-400 font-hud">Latência: 14ms</span>
          </div>
        </div>
      </div>

      {/* Right Column: Dialogue Interface & Interactive Stream */}
      <div className="lg:col-span-8 flex flex-col h-[700px] hud-panel rounded-2xl overflow-hidden border border-cyan-900/40">
        {/* Terminal Header */}
        <div className="px-5 py-3 border-b border-cyan-900/40 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-hud text-xs text-cyan-300 tracking-wider">
              INTERFACE DE COMUNICAÇÃO NEURAL J.A.R.V.I.S.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-tech text-slate-400 uppercase">
              Voz & Texto Ativos
            </span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans text-sm">
          {messages.map((msg) => {
            const isJarvis = msg.sender === 'jarvis';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[88%] ${isJarvis ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border ${
                    isJarvis
                      ? 'border-cyan-400/50 bg-cyan-950 text-cyan-400 glow-cyan-sm'
                      : 'border-amber-400/50 bg-amber-950 text-amber-300'
                  }`}
                >
                  {isJarvis ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Content Box */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-tech text-slate-400">
                    <span className={isJarvis ? 'text-cyan-400 font-semibold' : 'text-amber-400 font-semibold'}>
                      {isJarvis ? 'J.A.R.V.I.S.' : 'Senhor Gabriel'}
                    </span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-4 rounded-xl leading-relaxed whitespace-pre-wrap ${
                      isJarvis
                        ? 'bg-slate-900/90 border border-cyan-900/40 text-slate-200'
                        : 'bg-cyan-950/70 border border-cyan-700/60 text-cyan-50'
                    }`}
                  >
                    {msg.text}

                    {/* Quick Action Chips attached to message */}
                    {isJarvis && msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-cyan-900/40 flex flex-wrap gap-1.5">
                        {msg.actions.map((act, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(act)}
                            className="px-2.5 py-1 rounded-md text-xs font-tech bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-800/80 hover:border-cyan-400 transition-all flex items-center gap-1 shadow-sm"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>{act}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-cyan-400/50 bg-cyan-950 text-cyan-400 animate-spin">
                <Loader2 className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 rounded-xl bg-slate-900/90 border border-cyan-900/40 text-xs font-tech text-cyan-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Processando comando nos núcleos de IA do J.A.R.V.I.S...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Controls */}
        <div className="p-3 sm:p-4 border-t border-cyan-900/40 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Mic voice button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl border transition-all flex-shrink-0 ${
                isListening
                  ? 'border-emerald-400 bg-emerald-950 text-emerald-300 animate-pulse glow-cyan'
                  : 'border-cyan-900/60 bg-slate-900/80 text-cyan-400 hover:border-cyan-500 hover:text-white'
              }`}
              title={isListening ? 'Parar de ouvir' : 'Falar por voz com o JARVIS'}
            >
              {isListening ? <MicOff className="w-5 h-5 text-emerald-400" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'Ouvindo sua voz...' : 'Fale com o J.A.R.V.I.S. ou digite seu comando aqui...'}
              className="flex-1 bg-slate-900/90 border border-cyan-900/60 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all font-sans"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-slate-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 glow-cyan-sm"
              title="Enviar mensagem"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Quick suggestions footer */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 text-[11px] text-slate-400 font-tech">
            <span className="text-cyan-400 flex items-center gap-1 whitespace-nowrap">
              <Zap className="w-3 h-3 text-cyan-400" /> Atalhos rápidos:
            </span>
            <button
              onClick={() => handleSendMessage('Apagar todas as luzes')}
              className="hover:text-cyan-300 underline whitespace-nowrap"
            >
              "Apagar luzes"
            </button>
            <span>•</span>
            <button
              onClick={() => handleSendMessage('Ativar Modo Cinema')}
              className="hover:text-cyan-300 underline whitespace-nowrap"
            >
              "Modo Cinema"
            </button>
            <span>•</span>
            <button
              onClick={() => handleSendMessage('Preciso me acalmar')}
              className="hover:text-teal-300 underline whitespace-nowrap"
            >
              "Protocolo Calma"
            </button>
            <span>•</span>
            <button
              onClick={() => handleSendMessage('Qual o versículo e reflexão de hoje?')}
              className="hover:text-amber-300 underline whitespace-nowrap"
            >
              "Versículo de hoje"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
