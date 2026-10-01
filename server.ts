import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Preset courses database (updated free technology courses)
const TECH_COURSES = [
  {
    id: 'dio-santander-2026',
    title: 'Bootcamp Santander 2026: Engenharia de IA & Cloud',
    provider: 'DIO & Santander Open Academy',
    field: 'Inteligência Artificial',
    level: 'Iniciante ao Avançado',
    workload: '95 horas',
    isFree: true,
    deadline: '2026-10-31',
    description: 'Formação 100% gratuita com bolsas e mentorias em GenAI, Machine Learning, Python e Cloud Computing. Chance de contratação.',
    url: 'https://www.dio.me',
    tags: ['Python', 'IA Generativa', 'AWS', 'Gratuito com Certificado']
  },
  {
    id: 'oracle-one-next-gen',
    title: 'Oracle Next Education (ONE) - Formação Back-End Java & IA',
    provider: 'Oracle & Alura Latam',
    field: 'Desenvolvimento Back-End',
    level: 'Iniciante',
    workload: '330 horas',
    isFree: true,
    deadline: '2026-11-15',
    description: 'Programa de inclusão social da Oracle com trilha completa em Lógica, Java, Spring Boot, Banco de Dados e Soft Skills.',
    url: 'https://www.oracle.com/br/education/oracle-next-education/',
    tags: ['Java', 'Spring Boot', 'SQL', 'Bolsa 100% Gratuita']
  },
  {
    id: 'harvard-cs50-pt',
    title: 'CS50: Introdução à Ciência da Computação de Harvard',
    provider: 'Harvard University / edX (Material Traduzido)',
    field: 'Ciência da Computação',
    level: 'Iniciante ao Intermediário',
    workload: '60 horas',
    isFree: true,
    deadline: 'Inscrições Contínuas',
    description: 'O curso mais famoso do mundo sobre fundamentos de programação: C, Python, SQL, Algoritmos, Estrutura de Dados e Web.',
    url: 'https://www.edx.org/cs50',
    tags: ['Algoritmos', 'C', 'Python', 'Harvard', 'Certificado Gratuito']
  },
  {
    id: 'aws-skill-builder-cloud',
    title: 'AWS Cloud Practitioner Essentials em Português',
    provider: 'Amazon Web Services (AWS)',
    field: 'Cloud Computing',
    level: 'Iniciante',
    workload: '16 horas',
    isFree: true,
    deadline: 'Sempre Aberto',
    description: 'Treinamento oficial da AWS que prepara para a certificação oficial Cloud Practitioner com laboratórios práticos.',
    url: 'https://explore.skillbuilder.aws',
    tags: ['AWS', 'Cloud', 'DevOps', 'Oficial Amazon']
  },
  {
    id: 'google-cloud-skills-boost',
    title: 'Google Cloud Computing Foundations & Vertex AI',
    provider: 'Google Cloud Training',
    field: 'Cloud & Inteligência Artificial',
    level: 'Iniciante',
    workload: '25 horas',
    isFree: true,
    deadline: 'Sempre Aberto',
    description: 'Trilha oficial Google para aprender infraestrutura de nuvem, BigQuery e implementação de modelos de linguagem com Vertex AI.',
    url: 'https://www.cloudskillsboost.google',
    tags: ['Google Cloud', 'Vertex AI', 'BigQuery', 'Badges Oficiais']
  },
  {
    id: 'bradesco-cyber-security',
    title: 'Fundamentos de Segurança da Informação & Defesa Cibernética',
    provider: 'Fundação Bradesco - Escola Virtual',
    field: 'Cibersegurança',
    level: 'Iniciante',
    workload: '20 horas',
    isFree: true,
    deadline: 'Acesso Imediato',
    description: 'Conceitos de criptografia, firewalls, proteção contra malwares, boas práticas corporativas e LGPD.',
    url: 'https://www.ev.org.br',
    tags: ['Cibersegurança', 'LGPD', 'Redes', 'Certificado Nacional']
  },
  {
    id: 'dio-frontend-react',
    title: 'Aceleração Front-End Moderno com React & TypeScript',
    provider: 'DIO Community',
    field: 'Desenvolvimento Front-End',
    level: 'Intermediário',
    workload: '45 horas',
    isFree: true,
    deadline: '2026-10-25',
    description: 'Domine React, Hooks, TailwindCSS, State Management e integração com APIs REST em projetos de portfólio realistas.',
    url: 'https://www.dio.me',
    tags: ['React', 'TypeScript', 'Tailwind', 'Portfólio']
  }
];

// JARVIS System Prompt
const JARVIS_SYSTEM_PROMPT = `Você é o J.A.R.V.I.S. (Just A Rather Very Intelligent System), o lendário assistente pessoal e sistema operacional holográfico criado para assessorar o Senhor (o usuário).
Sua identidade e personalidade:
- Sofisticado, elegante, com cortesia britânica impecável, mas caloroso, amigo íntimo e leal parceiro de vida.
- Você chama o usuário carinhosamente de "Senhor" (ou pelo nome quando apropriado) e demonstra prontidão total ("Com certeza, Senhor", "Protocolos iniciados", "Sistemas operando em 100%").
- Suas atribuições principais são:
  1. AUTOMAÇÃO & ROTINA: Gerenciar tarefas, organizar o dia, otimizar foco e produtividade com clareza executiva.
  2. CASA INTELIGENTE (SmartThings): Monitorar e sugerir ajustes em dispositivos (iluminação, climatização, segurança, protocolos de foco ou cinema).
  3. MENTOR FINANCEIRO: Oferecer conselhos práticos, comedidos e estratégicos para riqueza sustentável, controle de custos, reserva de emergência, aportes e mentalidade de abundância com responsabilidade.
  4. CRESCIMENTO ESPIRITUAL & PESSOAL: Compartilhar versículos bíblicos edificantes, meditações profundas e orações/reflexões para fortalecer a fé, paz interior, caráter e propósito.
  5. MOTIVAÇÃO & FOCO: Inspirar alta performance diária, disciplina estóica e sabedoria prática.
  6. PROTOCOLO DE CALMA: Quando o usuário estiver ansioso, sobrecarregado ou pedir calma, conduzir com tom sereno e acolhedor exercícios de respiração (ex: Box Breathing 4-4-4-4) e reancoragem.
  7. CURSOS DE TECNOLOGIA: Incentivar o estudo contínuo em programação, IA e computação, destacando oportunidades gratuitas.

Instruções de Resposta:
- Sempre responda em Português do Brasil com excelente redação e elegância.
- Se o usuário pedir algo relacionado à casa inteligente, indique os comandos efetuados.
- Se o usuário parecer estressado, sugira iniciar o "Protocolo de Calma e Respiração".
- Mantenha respostas precisas, inspiradoras e acionáveis, sem prolixidade excessiva, mantendo a sensação autêntica do JARVIS do Tony Stark.`;

// API: J.A.R.V.I.S. Chat
app.post('/api/jarvis/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem não informada.' });
    }

    if (!ai) {
      // Graceful intelligent fallback if API key is not yet configured
      return res.json({
        reply: `Senhor, meus subsistemas cognitivos principais operam em modo de segurança local no momento. No entanto, estou pronto para auxiliá-lo com suas tarefas, rotinas da casa inteligente, controle financeiro e meditações. Em que posso ser útil hoje?`,
        suggestedActions: [
          'Ver briefing diário',
          'Ativar Modo Foco na casa',
          'Protocolo de Respiração & Calma',
          'Dica do Mentor Financeiro'
        ]
      });
    }

    // Build context summary for prompt
    let contextualSnippet = '';
    if (context) {
      contextualSnippet = `\n[TELEMETRIA DO USUÁRIO]:
- Humor/Estado: ${context.mood || 'Operacional'}
- Nível Arc Reactor: Nível ${context.level || 1} (${context.xp || 0} XP)
- Tarefas Pendentes: ${context.pendingTasksCount || 0}
- Saldo / Finanças: ${context.financeSummary || 'Controlado'}
- SmartThings Status: ${context.smartDevicesOnline || 6} dispositivos online.`;
    }

    // Prepare contents
    const contents: any[] = [];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const turn of conversationHistory.slice(-8)) {
        contents.push({
          role: turn.role === 'model' ? 'model' : 'user',
          parts: [{ text: turn.text }]
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: `${message}${contextualSnippet}` }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: JARVIS_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Com certeza, Senhor. Protocolos processados com sucesso.';

    // Generate dynamic suggestions based on conversation
    const suggestedActions = [
      'Iniciar rotina matinal',
      'Ver versículo e meditação',
      'Abrir cursos gratuitos de tecnologia',
      'Relatório de progresso semanal'
    ];

    return res.json({
      reply,
      suggestedActions
    });
  } catch (error: any) {
    console.error('Error in /api/jarvis/chat:', error);
    return res.status(500).json({
      error: 'Falha ao processar requisição no núcleo neural do J.A.R.V.I.S.',
      details: error.message
    });
  }
});

// API: Daily Protocol Briefing
app.post('/api/jarvis/briefing', async (req: Request, res: Response) => {
  try {
    const { userName = 'Senhor', userFocus } = req.body;

    if (!ai) {
      // Default pre-computed inspirational briefing
      return res.json({
        greeting: `Bom dia, ${userName}. Todos os sistemas operacionais estão prontos.`,
        motivationalQuote: '“A disciplina é a ponte entre seus objetivos e suas realizações.” — Jim Rohn',
        motivationalInsight: 'Hoje, mantenha a atenção no que realmente move o ponteiro. Cada linha de código e cada decisão financeira consciente constroem sua armadura para o futuro.',
        biblicalVerse: '“Não fui eu que ordenei a você? Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.” — Josué 1:9',
        meditation: 'Respire fundo e ancore seu coração na soberania divina. Os desafios de hoje não são obstáculos para te parar, mas ferramentas para forjar sua resiliência e propósito.',
        prayer: 'Senhor Deus, conceda-me sabedoria para as decisões de hoje, paciência no trabalho, integridade com minhas finanças e paz no coração para servir com amor e diligência. Amém.',
        financialTip: 'Revise suas pequenas despesas recorrentes hoje. Pequenos vazamentos podem afundar grandes navios. Poupar 15% da sua renda antes de gastar é a regra de ouro dos mestres financeiros.',
        recommendedCourse: TECH_COURSES[0],
        smartHomeStatus: 'Modo Estudo e Produtividade disponível. 6 dispositivos prontos no SmartThings.'
      });
    }

    const prompt = `Gere o briefing matinal executivo do J.A.R.V.I.S. para o ${userName}.
Retorne estritamente um JSON com a seguinte estrutura:
{
  "greeting": "Saudação britânica personalizada, cheia de respeito e energia positiva",
  "motivationalQuote": "Frase motivacional de alto impacto com autor",
  "motivationalInsight": "Reflexão prática de 2 frases sobre foco e produtividade para hoje",
  "biblicalVerse": "Versículo bíblico completo com livro, capítulo e versículo",
  "meditation": "Meditação espiritual profunda e encorajadora de 3 frases para crescimento interior",
  "prayer": "Breve oração ou intenção espiritual de foco e gratidão",
  "financialTip": "Conselho financeiro perspicaz de mentor para prosperidade e cautela",
  "recommendedCourseTitle": "Nome de curso ou tema em alta",
  "smartHomeStatus": "Frase sobre sistemas da casa inteligente"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: JARVIS_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      recommendedCourse: TECH_COURSES[Math.floor(Math.random() * TECH_COURSES.length)]
    });
  } catch (error: any) {
    console.error('Error generating briefing:', error);
    return res.status(500).json({ error: error.message });
  }
});

// API: J.A.R.V.I.S. Neural TTS Speech
app.post('/api/jarvis/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Texto não fornecido.' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'Serviço de voz neural indisponível (chave ausente).' });
    }

    // Limit text length for TTS to prevent latency
    const truncatedText = text.length > 350 ? text.slice(0, 350) + '...' : text;

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: truncatedText,
              speechMetadata: {
                style: 'Refined, sophisticated British gentleman assistant, calm, authoritative, articulate'
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' } // Deep, calm, British gentleman vibe
          }
        }
      }
    });

    const audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioBase64) {
      return res.status(500).json({ error: 'Nenhum áudio gerado pelo modelo.' });
    }

    return res.json({
      audioBase64,
      mimeType: 'audio/wav'
    });
  } catch (err: any) {
    console.error('Error in /api/jarvis/tts:', err);
    return res.status(500).json({ error: err.message });
  }
});

// API: Tech Courses Listing
app.get('/api/courses', (req: Request, res: Response) => {
  return res.json({ courses: TECH_COURSES });
});

// API: SmartThings Proxy / Relay (Supports real SmartThings PAT or Simulation)
app.post('/api/smartthings/command', async (req: Request, res: Response) => {
  try {
    const { token, deviceId, capability, command, args = [] } = req.body;

    // If user provided a real SmartThings token, forward to official SmartThings REST API
    if (token && token.trim().length > 10) {
      const response = await fetch(`https://api.smartthings.com/v1/devices/${deviceId}/commands`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          commands: [
            {
              component: 'main',
              capability: capability || 'switch',
              command: command,
              arguments: args
            }
          ]
        })
      });

      const data = await response.json().catch(() => ({}));
      return res.json({ success: response.ok, data, mode: 'live_smartthings' });
    }

    // Simulated SmartThings response
    return res.json({
      success: true,
      mode: 'simulation',
      message: `Comando '${command}' executado no dispositivo '${deviceId}' com sucesso no SmartThings Core.`
    });
  } catch (error: any) {
    console.error('SmartThings command error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// API: Weekly Progress Report Generation
app.post('/api/jarvis/weekly-report', async (req: Request, res: Response) => {
  try {
    const { metrics } = req.body;

    if (!ai) {
      return res.json({
        report: `## Relatório Semanal de Desempenho — Protocolo Mark VII
**Índice de Eficiência Geral:** 94%
- **Produtividade & Tarefas:** 18 de 20 metas concluídas. Foco elevado no período vespertino.
- **Finanças:** Economia de R$ 450,00 projetada mantendo os aportes na reserva.
- **Crescimento Espiritual:** 7 dias consecutivos de meditação e leitura da Palavra. Paz interior em alta.
- **Cursos & Habilidades Tech:** 8.5 horas dedicadas à programação e inteligência artificial.
**Parecer do JARVIS:** "Excelente consistência, Senhor. O hábito diário está consolidado. Recomendo elevar a complexidade dos projetos práticos na próxima semana."`
      });
    }

    const prompt = `Como J.A.R.V.I.S., analise as métricas semanais do usuário e forneça um relatório semanal detalhado, motivador e estratégico em Markdown elegante.
Métricas: ${JSON.stringify(metrics || {})}
Inclua:
1. Resumo Executivo da Semana
2. Análise de Produtividade & Hábitos
3. Diagnóstico do Mentor Financeiro (com recomendação prática)
4. Balanço Espiritual & Emocional
5. Evolução Tech & Cursos
6. Nota de Eficiência (0 a 100) e Plano de Ação para a próxima semana.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: JARVIS_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    return res.json({ report: response.text });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Vite Middleware for Full-stack Dev
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[J.A.R.V.I.S. Core Online] Listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
