import React, { useState, useEffect } from 'react';
import {
  Mail,
  RefreshCw,
  Send,
  Sparkles,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  ExternalLink,
  ChevronRight,
  LogOut,
  Inbox,
  PenTool,
  Bot,
  ShieldCheck,
  Check
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken
} from '../utils/googleAuth';
import {
  fetchRecentEmails,
  sendEmailMessage,
  EmailMessage
} from '../utils/gmailApi';
import { playJarvisBeep, playChime, speakText } from '../utils/audio';

interface GmailPanelProps {
  onAddXp: (amount: number, reason: string) => void;
}

export const GmailPanel: React.FC<GmailPanelProps> = ({ onAddXp }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  // Selected email for viewing & JARVIS summary
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [jarvisSummary, setJarvisSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Compose modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isConfirmSendOpen, setIsConfirmSendOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setIsLoadingAuth(false);
        loadEmails(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setIsLoadingAuth(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const loadEmails = async (tokenToUse?: string) => {
    const token = tokenToUse || accessToken;
    if (!token) return;

    setIsLoadingEmails(true);
    setErrorMessage(null);
    try {
      const msgs = await fetchRecentEmails(token, 15);
      setEmails(msgs);
    } catch (e: any) {
      console.error('Error fetching emails:', e);
      setErrorMessage(
        e.message || 'Falha ao sincronizar emails da sua caixa de entrada.'
      );
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleLogin = async () => {
    playJarvisBeep(1000, 0.05);
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        playChime();
        onAddXp(100, 'Integração com Gmail ativada com sucesso');
        await loadEmails(result.accessToken);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMessage(
        'Não foi possível concluir a autenticação com sua conta Google. Tente novamente.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    playJarvisBeep(600, 0.04);
    await logout();
    setCurrentUser(null);
    setAccessToken(null);
    setEmails([]);
    setSelectedEmail(null);
  };

  // Summarize email using JARVIS intelligence
  const handleSummarizeWithJarvis = async (email: EmailMessage) => {
    setIsSummarizing(true);
    playJarvisBeep(1100, 0.06);

    try {
      const prompt = `Como J.A.R.V.I.S., analise este email recebido pelo Senhor e forneça um resumo executivo ultra-preciso em 3 pontos:
Remetente: ${email.from}
Assunto: ${email.subject}
Conteúdo: ${email.bodyText || email.snippet}

Formato da resposta:
- Resumo principal em 1 frase
- Itens de ação ou prazos identificados
- Sugestão tática de resposta curta caso necessário.`;

      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });

      if (!res.ok) throw new Error('Falha no resumo');
      const data = await res.json();
      setJarvisSummary(data.reply);
      playChime();
      speakText('Resumo executivo do email compilado com sucesso, Senhor.');
      onAddXp(30, 'Análise neural de email pelo JARVIS');
    } catch (e) {
      setJarvisSummary(`**Resumo Executivo J.A.R.V.I.S.:**
- **De:** ${email.from}
- **Assunto:** ${email.subject}
- **Conteúdo:** ${email.snippet}
*Parecer:* Email informativo recebido. Recomendo responder se houver solicitação explícita.`);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Mandatory confirmation dialog before sending
  const handleInitiateSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) return;
    setIsConfirmSendOpen(true);
  };

  const handleConfirmAndSend = async () => {
    if (!accessToken) return;
    setIsSending(true);
    try {
      await sendEmailMessage(accessToken, composeTo.trim(), composeSubject.trim(), composeBody.trim());
      playChime();
      onAddXp(80, 'Email enviado com confirmação executiva');
      setIsConfirmSendOpen(false);
      setIsComposeOpen(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      speakText('Email enviado com sucesso, Senhor.');
      await loadEmails();
    } catch (err: any) {
      alert(`Erro ao enviar email: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const filteredEmails = emails.filter((em) => {
    const matchesSearch =
      em.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      em.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      em.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnread = !filterUnreadOnly || em.unread;
    return matchesSearch && matchesUnread;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 hud-panel rounded-2xl border border-cyan-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            <h2 className="font-hud font-bold text-lg text-cyan-100 tracking-wider">
              CENTRAL DE COMUNICAÇÃO GMAIL J.A.R.V.I.S.
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-tech mt-1">
            Sincronização da sua caixa postal com resumos executivos neurais e despacho com confirmação tática.
          </p>
        </div>

        {/* User profile & actions */}
        {currentUser && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playJarvisBeep(1000, 0.04);
                setIsComposeOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-slate-950 font-tech font-bold text-xs flex items-center gap-1.5 transition-all shadow-md glow-cyan-sm"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Redigir Email</span>
            </button>

            <button
              onClick={() => loadEmails()}
              disabled={isLoadingEmails}
              className="p-2.5 rounded-xl border border-cyan-900 bg-slate-900 text-cyan-400 hover:text-white hover:border-cyan-400 transition-all disabled:opacity-50"
              title="Recarregar emails"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingEmails ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl border border-rose-900/60 bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition-all"
              title="Desconectar conta Google"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Auth state: Not logged in */}
      {!currentUser && !isLoadingAuth && (
        <div className="hud-panel rounded-3xl p-8 border border-cyan-500/40 text-center space-y-6 max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl border-2 border-cyan-400 bg-cyan-950 flex items-center justify-center mx-auto glow-cyan">
            <Mail className="w-8 h-8 text-cyan-300" />
          </div>

          <div className="space-y-2">
            <h3 className="font-hud font-bold text-lg text-slate-100">
              CONECTAR SUA CAIXA POSTAL GMAIL
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Permita que o J.A.R.V.I.S. acesse seus emails recentes com permissão segura para ler mensagens, priorizar recados urgentes e elaborar resumos estratégicos para economizar seu tempo.
            </p>
          </div>

          {/* Official Google Sign-in button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="gsi-material-button flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-slate-800 hover:bg-slate-100 font-sans font-semibold text-sm shadow-xl transition-all active:scale-95 disabled:opacity-50"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 flex-shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isLoggingIn ? 'Conectando ao Google...' : 'Sign in with Google (Conectar Gmail)'}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] font-tech text-slate-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Autenticação direta via Google OAuth 2.0 com permissões granulares</span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-tech flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Logged in state */}
      {currentUser && (
        <div className="space-y-4">
          {/* Status bar */}
          <div className="p-3.5 hud-panel rounded-xl border border-cyan-900/40 flex flex-wrap items-center justify-between gap-3 text-xs font-tech">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold">
                {currentUser.displayName ? currentUser.displayName[0] : 'U'}
              </div>
              <div>
                <span className="text-slate-200 font-semibold">{currentUser.displayName || 'Usuário Google'}</span>
                <span className="text-slate-400 block text-[11px]">{currentUser.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar nos emails..."
                  className="bg-slate-900 border border-cyan-900 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-48 font-sans"
                />
              </div>

              {/* Unread toggle */}
              <button
                onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  filterUnreadOnly
                    ? 'border-cyan-400 bg-cyan-950 text-cyan-300'
                    : 'border-slate-800 text-slate-400'
                }`}
              >
                Apenas Não Lidos
              </button>
            </div>
          </div>

          {/* Email list */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List column */}
            <div className={`${selectedEmail ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-2`}>
              {isLoadingEmails ? (
                <div className="py-12 text-center hud-panel rounded-2xl border border-cyan-900/40 space-y-2">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                  <p className="text-xs text-cyan-300 font-tech">Sincronizando com os servidores do Gmail...</p>
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="py-12 text-center hud-panel rounded-2xl border border-cyan-900/40 space-y-2">
                  <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-tech">Nenhum email encontrado na caixa de entrada.</p>
                </div>
              ) : (
                filteredEmails.map((email) => {
                  const isSelected = selectedEmail?.id === email.id;

                  return (
                    <div
                      key={email.id}
                      onClick={() => {
                        playJarvisBeep(900, 0.03);
                        setSelectedEmail(email);
                        setJarvisSummary(null);
                      }}
                      className={`hud-panel rounded-xl p-3.5 border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/50 glow-cyan-sm'
                          : email.unread
                          ? 'border-cyan-700/60 bg-slate-900/90'
                          : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          {email.unread && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 animate-pulse" />
                          )}
                          <span
                            className={`text-xs truncate ${
                              email.unread ? 'font-bold text-slate-100' : 'text-slate-300'
                            }`}
                          >
                            {email.from.split('<')[0].replace(/"/g, '')}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-tech flex-shrink-0">
                          {email.date}
                        </span>
                      </div>

                      <h4
                        className={`text-xs truncate mb-1 ${
                          email.unread ? 'font-semibold text-cyan-200' : 'text-slate-300'
                        }`}
                      >
                        {email.subject}
                      </h4>

                      <p className="text-[11px] text-slate-400 font-sans line-clamp-2">
                        {email.snippet}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Detail / JARVIS Reading Pane */}
            {selectedEmail && (
              <div className="lg:col-span-7 hud-panel rounded-2xl p-5 border border-cyan-500/40 bg-slate-950 space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-cyan-900/40 pb-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-hud text-cyan-400 uppercase tracking-widest block">
                      DE: {selectedEmail.from}
                    </span>
                    <h3 className="font-tech font-bold text-base text-slate-100">
                      {selectedEmail.subject}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-tech">
                      {selectedEmail.date}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSummarizeWithJarvis(selectedEmail)}
                    disabled={isSummarizing}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-tech font-bold text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
                  >
                    {isSummarizing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Bot className="w-3.5 h-3.5" />
                    )}
                    <span>{isSummarizing ? 'Analisando...' : 'Resumo J.A.R.V.I.S.'}</span>
                  </button>
                </div>

                {/* AI Executive Summary Box if requested */}
                {jarvisSummary && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900/90 border border-amber-500/50 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-hud text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>PARECER EXECUTIVO J.A.R.V.I.S.</span>
                    </div>
                    <div className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                      {jarvisSummary}
                    </div>
                  </div>
                )}

                {/* Full Body / Snippet */}
                <div className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-4 rounded-xl border border-slate-800 max-h-80 overflow-y-auto">
                  {selectedEmail.bodyText || selectedEmail.snippet}
                </div>

                {/* Quick reply button */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setComposeTo(selectedEmail.from.match(/<([^>]+)>/)?.[1] || selectedEmail.from);
                      setComposeSubject(`Re: ${selectedEmail.subject}`);
                      setIsComposeOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-tech font-bold text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Responder com J.A.R.V.I.S.</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Email Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hud-panel rounded-2xl p-6 border border-cyan-500/50 bg-slate-950 w-full max-w-lg space-y-4">
            <h3 className="font-hud text-sm text-cyan-300 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-cyan-400" />
              <span>REDIGIR NOVO EMAIL (GMAIL)</span>
            </h3>

            <form onSubmit={handleInitiateSend} className="space-y-3 text-xs font-tech">
              <div>
                <label className="text-slate-400 block mb-1">Destinatário (Para:)</label>
                <input
                  type="email"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Assunto</label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Assunto da mensagem"
                  className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mensagem</label>
                <textarea
                  required
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Escreva sua mensagem aqui..."
                  rows={6}
                  className="w-full bg-slate-900 border border-cyan-900 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-cyan-400 font-sans leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Avançar para Confirmação</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog before sending */}
      {isConfirmSendOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="hud-panel rounded-2xl p-6 border border-amber-500/60 bg-slate-950 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-hud text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>CONFIRMAÇÃO EXECUTIVA DE ENVIO</span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Você confirma o envio desta mensagem através da sua conta do Gmail?
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-tech space-y-1 text-slate-300">
              <div>
                <strong className="text-slate-400">Para:</strong> {composeTo}
              </div>
              <div>
                <strong className="text-slate-400">Assunto:</strong> {composeSubject}
              </div>
              <div className="text-[11px] text-slate-400 font-sans pt-1 border-t border-slate-800 line-clamp-3">
                {composeBody}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmSendOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-tech"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSend}
                disabled={isSending}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-tech font-bold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isSending ? 'Transmitindo...' : 'Confirmar & Enviar Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
