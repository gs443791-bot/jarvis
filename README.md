# ⚡ J.A.R.V.I.S. — Sistema Operacional Inteligente Stark

> **Just A Rather Very Intelligent System** — Assistente pessoal de alta fidelidade inspirado no Homem de Ferro de Tony Stark. Integra automação residencial (Samsung SmartThings), gestão executiva de rotina e calendário, mentoria financeira, reflexões e versículos bíblicos diários, radar de cursos gratuitos de tecnologia com lembretes automáticos, protocolo de calma anti-ansiedade e leitura/envio de emails via Gmail.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/jarvis-ai-os)
![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.8_Flash-4285F4?logo=google)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

---

## 🚀 Como Publicar no GitHub e na Vercel (Guia Rápido)

Este projeto já está **100% configurado** com `vercel.json` e rotas Serverless (`/api`) prontas para rodar na Vercel sem nenhuma configuração manual de infraestrutura!

### 1️⃣ Publicar no GitHub

No seu terminal local, execute:

```bash
# 1. Crie um novo repositório vazio no seu GitHub (ex: jarvis-ai-os)
# 2. Na pasta do projeto, adicione o repositório remoto e envie o código:
git remote add origin https://github.com/SEU_USUARIO/jarvis-ai-os.git
git branch -M main
git push -u origin main
```

*(O repositório já foi inicializado com `.gitignore`, commit inicial estruturado e arquivos prontos).*

---

### 2️⃣ Publicar na Vercel (1 Clique)

1. Acesse **[vercel.com](https://vercel.com)** e faça login com sua conta do GitHub.
2. Clique em **"Add New..."** > **"Project"**.
3. Selecione o repositório **`jarvis-ai-os`** que você acabou de subir.
4. O Vercel detectará automaticamente as configurações através do `vercel.json`:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Na seção **Environment Variables**, adicione sua chave do Google Gemini:
   - `GEMINI_API_KEY`: *(Sua chave gratuita obtida no [Google AI Studio](https://aistudio.google.com/app/apikey))*
6. Clique em **"Deploy"**! 🚀

---

## ⚙️ Variáveis de Ambiente (.env)

Copie o `.env.example` para `.env`:

```bash
cp .env.example .env
```

| Variável | Obrigatória | Descrição |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | **Sim** | Chave de API do Google Gemini para raciocínio, voz neural e resumos executivos. Obtenha grátis em [aistudio.google.com](https://aistudio.google.com). |
| `APP_URL` | Opcional | URL base do aplicativo para redirecionamentos e callbacks. |

---

## 🛠️ Tecnologias e Arquitetura

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend / Serverless:** Express.js montado em desenvolvimento e exportado como Vercel Serverless Function em `/api/index.ts`.
- **Inteligência Artificial:** SDK Oficial `@google/genai` (Modelo `gemini-3.8-flash` e voz neural `gemini-3.8-flash-lite-tts`).
- **Automação Residencial:** Samsung SmartThings REST API (Modo real com Personal Access Token ou simulação interativa de alta fidelidade).
- **Google Workspace Gmail:** Autenticação client-side Firebase Auth com OAuth 2.0 para leitura e envio seguro de emails com diálogo de confirmação prévia.
- **Áudio Sintético:** Web Audio API nativo (síntese de ondas binaurais 432 Hz, som de chuva relaxante e beeps de telemetria futurista) + Web Speech API (reconhecimento de fala e síntese vocal).

---

## 🌟 Principais Recursos

1. **Reator Arc Holográfico Interativo**: Núcleo animado que responde visualmente quando o J.A.R.V.I.S. fala ou escuta comandos de voz em português.
2. **Central de Automação SmartThings**: Controle de lâmpadas RGB, ar-condicionado Samsung WindFree, fechaduras biométricas, cortinas blackout, tomadas com monitor de Watts e rotinas rápidas (*Modo Cinema*, *Foco*, *Hibernação*).
3. **Mentor Financeiro Stark**: Gestão de fluxo de caixa, controle da Reserva de Emergência Blindada, conselhos baseados na regra 50/30/20 e simulador de juros compostos.
4. **Espiritualidade & Versículos Diários**: Versículo do dia, reflexão contextual, aplicação prática, oração guiada e player de áudio com frequência relaxante de 432 Hz.
5. **Protocolo de Calma & Anti-Ansiedade**: Respiração quadrada Box Breathing (4-4-4-4) com orbe pulsante e sons relaxantes para desacelerar batimentos cardíacos.
6. **Radar de Cursos Gratuitos Tech**: Cursos com bolsa 100% gratuita (IA, Python, Cloud, Cibersegurança) com botão de lembrete automático para sincronizar prazos no calendário.
7. **Integração com Gmail**: Conexão segura via Google para ler mensagens recentes, gerar resumos executivos neurais com o J.A.R.V.I.S. e redigir respostas com confirmação.
8. **Gamificação Arc Reactor**: Sistema de níveis de armadura (*Mark I* até *Mark LXXXV Nanotech*), ofensiva de dias seguidos (*streak*) e insígnias desbloqueáveis.
9. **Exportação de Agenda (.ICS)**: Compatível com Google Agenda e Apple Calendar.

---

## 💻 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento (Porta 3000)
npm run dev

# Compilar para produção
npm run build
```

---

Desenvolvido para máxima produtividade, foco e crescimento integral. 🛡️⚡
