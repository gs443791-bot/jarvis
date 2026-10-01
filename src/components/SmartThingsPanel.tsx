import React, { useState } from 'react';
import {
  Shield,
  Lightbulb,
  Lock,
  Unlock,
  Tv,
  Wind,
  Zap,
  Power,
  Sliders,
  Settings,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sun,
  Moon,
  Laptop,
  Film
} from 'lucide-react';
import { SmartDevice } from '../types';
import { playJarvisBeep, playChime } from '../utils/audio';

interface SmartThingsPanelProps {
  devices: SmartDevice[];
  smartThingsToken: string;
  onSaveToken: (token: string) => void;
  onUpdateDevice: (updatedDevice: SmartDevice) => void;
  onExecuteCommand: (deviceId: string, command: string, value?: number) => void;
  onAddXp: (amount: number, reason: string) => void;
}

export const SmartThingsPanel: React.FC<SmartThingsPanelProps> = ({
  devices,
  smartThingsToken,
  onSaveToken,
  onUpdateDevice,
  onExecuteCommand,
  onAddXp
}) => {
  const [tokenInput, setTokenInput] = useState(smartThingsToken);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isTestingToken, setIsTestingToken] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString('pt-BR')}] Hub SmartThings inicializado. 6 dispositivos sincronizados.`,
    `[${new Date().toLocaleTimeString('pt-BR')}] Protocolo de automação residencial monitorando telemetria.`
  ]);

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const handleToggleDevice = (device: SmartDevice) => {
    playJarvisBeep(880, 0.04);
    let newStatus = device.status;
    let command = '';

    if (device.type === 'lock') {
      newStatus = device.status === 'locked' ? 'unlocked' : 'locked';
      command = newStatus === 'locked' ? 'lock' : 'unlock';
    } else if (device.type === 'curtain') {
      newStatus = device.status === 'open' ? 'closed' : 'open';
      command = newStatus === 'open' ? 'open' : 'close';
    } else {
      newStatus = device.status === 'on' ? 'off' : 'on';
      command = newStatus === 'on' ? 'on' : 'off';
    }

    const updated: SmartDevice = {
      ...device,
      status: newStatus,
      lastUpdated: new Date().toISOString()
    };

    onUpdateDevice(updated);
    onExecuteCommand(device.id, command, device.value);
    addLog(`Comando '${command}' enviado para '${device.name}' via SmartThings API.`);
    onAddXp(15, 'Comando residencial SmartThings');
  };

  const handleValueChange = (device: SmartDevice, newValue: number) => {
    const updated: SmartDevice = {
      ...device,
      value: newValue,
      lastUpdated: new Date().toISOString()
    };
    onUpdateDevice(updated);
    onExecuteCommand(device.id, 'setLevel', newValue);
  };

  // Tactical preset scenes
  const runPresetScene = (sceneName: string) => {
    playChime();
    addLog(`Iniciando automação '${sceneName}' no SmartThings Core.`);

    if (sceneName === 'Foco Total (Deep Work)') {
      devices.forEach((d) => {
        if (d.type === 'light') onUpdateDevice({ ...d, status: 'on', value: 85 });
        if (d.type === 'thermostat') onUpdateDevice({ ...d, status: 'on', value: 22 });
        if (d.type === 'curtain') onUpdateDevice({ ...d, status: 'open', value: 50 });
        if (d.type === 'switch') onUpdateDevice({ ...d, status: 'on' });
      });
      addLog('Protocolo Foco: Luzes 85% branca, ar 22°C, cortinas 50%.');
    } else if (sceneName === 'Modo Cinema') {
      devices.forEach((d) => {
        if (d.type === 'light') onUpdateDevice({ ...d, status: 'on', value: 15 });
        if (d.type === 'tv') onUpdateDevice({ ...d, status: 'on' });
        if (d.type === 'curtain') onUpdateDevice({ ...d, status: 'closed', value: 0 });
        if (d.type === 'thermostat') onUpdateDevice({ ...d, status: 'on', value: 21 });
      });
      addLog('Modo Cinema: Luzes em 15% ciano, TV ligada, cortinas 100% blackout.');
    } else if (sceneName === 'Protocolo Hibernação / Noite') {
      devices.forEach((d) => {
        if (d.type === 'light') onUpdateDevice({ ...d, status: 'off', value: 0 });
        if (d.type === 'tv') onUpdateDevice({ ...d, status: 'off' });
        if (d.type === 'lock') onUpdateDevice({ ...d, status: 'locked' });
        if (d.type === 'curtain') onUpdateDevice({ ...d, status: 'closed', value: 0 });
        if (d.type === 'thermostat') onUpdateDevice({ ...d, status: 'on', value: 23 });
      });
      addLog('Hibernação: Luzes apagadas, portas trancadas com biometria, climatização em 23°C modo sono.');
    } else if (sceneName === 'Protocolo Bom Dia') {
      devices.forEach((d) => {
        if (d.type === 'light') onUpdateDevice({ ...d, status: 'on', value: 60 });
        if (d.type === 'curtain') onUpdateDevice({ ...d, status: 'open', value: 100 });
        if (d.type === 'thermostat') onUpdateDevice({ ...d, status: 'on', value: 24 });
      });
      addLog('Bom Dia: Cortinas totalmente abertas, luz solar e iluminação suave ativadas.');
    }

    onAddXp(50, `Cena de automação SmartThings: ${sceneName}`);
  };

  const handleTestToken = async () => {
    setIsTestingToken(true);
    setTestResult(null);
    try {
      if (!tokenInput.trim()) {
        setTestResult({
          success: true,
          message: 'Modo de Simulação Avançada ativo. Todos os dispositivos respondem localmente.'
        });
        setIsTestingToken(false);
        return;
      }

      // Test against SmartThings API
      const res = await fetch('https://api.smartthings.com/v1/devices', {
        headers: {
          Authorization: `Bearer ${tokenInput.trim()}`
        }
      });

      if (res.ok) {
        setTestResult({
          success: true,
          message: 'Conexão com a nuvem Samsung SmartThings autenticada com sucesso!'
        });
        onSaveToken(tokenInput.trim());
      } else {
        setTestResult({
          success: false,
          message: `Código ${res.status}: Verifique se seu token possui as permissões 'devices:read' e 'devices:write'.`
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: 'Não foi possível validar o token diretamente. O modo híbrido de contingência continuará operando.'
      });
    } finally {
      setIsTestingToken(false);
    }
  };

  // Calculate total power consumption
  const totalWatts = devices.reduce((sum, d) => {
    if (d.status === 'on' && d.powerConsumptionWatts) {
      return sum + d.powerConsumptionWatts;
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 hud-panel rounded-2xl border border-cyan-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="font-hud font-bold text-lg text-cyan-100 tracking-wider">
              CENTRAL DE AUTOMAÇÃO SAMSUNG SMARTTHINGS
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-tech mt-1">
            Controle integrado de dispositivos, sensores de segurança e rotinas da sua casa inteligente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-hud text-slate-400 block uppercase">
              Consumo em Tempo Real
            </span>
            <span className="text-sm font-hud font-bold text-cyan-300">
              {totalWatts} W
            </span>
          </div>

          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="px-3 py-2 rounded-xl border border-cyan-800 bg-slate-900/80 hover:border-cyan-400 text-cyan-300 text-xs font-tech flex items-center gap-2 transition-all"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>Configurar SmartThings Token</span>
          </button>
        </div>
      </div>

      {/* Token configuration drawer */}
      {isConfigOpen && (
        <div className="p-5 hud-panel rounded-2xl border border-cyan-500/40 bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-hud font-semibold text-cyan-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              INTEGRAÇÃO OFICIAL SAMSUNG SMARTTHINGS (REST API)
            </h3>
            <button
              onClick={() => setIsConfigOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Fechar
            </button>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Você pode conectar seus dispositivos reais do Samsung SmartThings inserindo seu{' '}
            <strong className="text-cyan-300">Personal Access Token (PAT)</strong> gerado em{' '}
            <a
              href="https://account.smartthings.com/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline hover:text-cyan-300"
            >
              account.smartthings.com/tokens
            </a>
            . Se preferir rodar no ambiente de demonstração e simulação de alta precisão, deixe vazio.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Cole seu SmartThings Personal Access Token aqui (ex: 8b7a...)"
              className="flex-1 bg-slate-950 border border-cyan-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <button
              onClick={handleTestToken}
              disabled={isTestingToken}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-tech font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              {isTestingToken ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{tokenInput.trim() ? 'Validar & Salvar' : 'Ativar Modo Simulação'}</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs font-tech flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/50 text-rose-300'
              }`}
            >
              {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Tactical Preset Scenes */}
      <div className="hud-panel rounded-2xl p-5 border border-cyan-900/40">
        <h3 className="font-hud text-xs text-cyan-300 tracking-wider mb-3 flex items-center gap-2">
          <Play className="w-3.5 h-3.5 text-cyan-400" />
          PROTOCOLOS DE AUTOMAÇÃO RÁPIDA (CENAS INTELIGENTES)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => runPresetScene('Foco Total (Deep Work)')}
            className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-cyan-950/60 border border-cyan-900/40 hover:border-cyan-400 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
              <Laptop className="w-4 h-4" />
            </div>
            <h4 className="font-tech font-bold text-xs text-slate-100 group-hover:text-cyan-300">
              Protocolo Foco
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Luz 85%, Ar 22°C, Setup ON</p>
          </button>

          <button
            onClick={() => runPresetScene('Modo Cinema')}
            className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-cyan-950/60 border border-cyan-900/40 hover:border-cyan-400 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
              <Film className="w-4 h-4" />
            </div>
            <h4 className="font-tech font-bold text-xs text-slate-100 group-hover:text-cyan-300">
              Modo Cinema
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Luz 15%, TV ON, Blackout</p>
          </button>

          <button
            onClick={() => runPresetScene('Protocolo Hibernação / Noite')}
            className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-cyan-950/60 border border-cyan-900/40 hover:border-cyan-400 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
              <Moon className="w-4 h-4" />
            </div>
            <h4 className="font-tech font-bold text-xs text-slate-100 group-hover:text-cyan-300">
              Hibernação Noturna
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Luzes OFF, Trancas ativadas</p>
          </button>

          <button
            onClick={() => runPresetScene('Protocolo Bom Dia')}
            className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-cyan-950/60 border border-cyan-900/40 hover:border-cyan-400 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
              <Sun className="w-4 h-4" />
            </div>
            <h4 className="font-tech font-bold text-xs text-slate-100 group-hover:text-cyan-300">
              Protocolo Bom Dia
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Cortinas 100%, Luz suave</p>
          </button>
        </div>
      </div>

      {/* Connected Devices Grid */}
      <div>
        <h3 className="font-hud text-xs text-cyan-300 tracking-wider mb-3 flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          DISPOSITIVOS SMARTTHINGS CONECTADOS ({devices.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => {
            const isOn = device.status === 'on' || device.status === 'open' || device.status === 'locked';

            return (
              <div
                key={device.id}
                className={`hud-panel rounded-2xl p-4 border transition-all ${
                  isOn
                    ? 'border-cyan-500/50 bg-gradient-to-br from-slate-900/90 to-cyan-950/40'
                    : 'border-slate-800/80 bg-slate-950/80 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                        isOn
                          ? 'border-cyan-400 bg-cyan-950 text-cyan-300 glow-cyan-sm'
                          : 'border-slate-800 bg-slate-900 text-slate-500'
                      }`}
                    >
                      {device.type === 'light' && <Lightbulb className="w-5 h-5" />}
                      {device.type === 'thermostat' && <Wind className="w-5 h-5" />}
                      {device.type === 'lock' && (device.status === 'locked' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5 text-amber-400" />)}
                      {device.type === 'curtain' && <Sliders className="w-5 h-5" />}
                      {device.type === 'switch' && <Zap className="w-5 h-5" />}
                      {device.type === 'tv' && <Tv className="w-5 h-5" />}
                    </div>

                    <div>
                      <h4 className="font-tech font-bold text-sm text-slate-100">
                        {device.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-sans">
                        {device.room}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => handleToggleDevice(device)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isOn
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
                        : 'border-slate-700 bg-slate-900 text-slate-500 hover:text-slate-300'
                    }`}
                    title="Alternar estado"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>

                {/* Sub-controls for level/temperature */}
                {device.type === 'light' && device.status === 'on' && (
                  <div className="mt-4 pt-3 border-t border-cyan-900/30">
                    <div className="flex justify-between text-[11px] font-tech text-slate-300 mb-1">
                      <span>Brilho da Iluminação</span>
                      <span className="text-cyan-300 font-hud">{device.value || 80}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={device.value || 80}
                      onChange={(e) => handleValueChange(device, parseInt(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>
                )}

                {device.type === 'thermostat' && device.status === 'on' && (
                  <div className="mt-4 pt-3 border-t border-cyan-900/30">
                    <div className="flex justify-between text-[11px] font-tech text-slate-300 mb-1">
                      <span>Temperatura Desejada</span>
                      <span className="text-cyan-300 font-hud">{device.value || 22}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleValueChange(device, Math.max(16, (device.value || 22) - 1))}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min="16"
                        max="28"
                        value={device.value || 22}
                        onChange={(e) => handleValueChange(device, parseInt(e.target.value))}
                        className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <button
                        onClick={() => handleValueChange(device, Math.min(28, (device.value || 22) + 1))}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {device.type === 'curtain' && (
                  <div className="mt-4 pt-3 border-t border-cyan-900/30">
                    <div className="flex justify-between text-[11px] font-tech text-slate-300 mb-1">
                      <span>Abertura da Cortina</span>
                      <span className="text-cyan-300 font-hud">{device.value || 0}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={device.value || 0}
                      onChange={(e) => handleValueChange(device, parseInt(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>
                )}

                {/* Footer telemetry */}
                <div className="mt-3 pt-2 border-t border-cyan-950 flex items-center justify-between text-[10px] font-tech text-slate-400">
                  <span>
                    Status: <strong className={isOn ? 'text-cyan-400' : 'text-slate-500'}>{device.status.toUpperCase()}</strong>
                  </span>
                  {device.powerConsumptionWatts !== undefined && (
                    <span className="text-slate-400">
                      {isOn ? `${device.powerConsumptionWatts}W` : '0W'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Log */}
      <div className="hud-panel rounded-2xl p-4 border border-cyan-900/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-hud text-cyan-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            REGISTRO DE COMANDOS RESIDENCIAIS (TELEMETRIA SMARTTHINGS)
          </span>
          <span className="text-[10px] text-slate-500 font-tech">Conexão WebSocket Ativa</span>
        </div>
        <div className="bg-slate-950/80 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-300 border border-cyan-950">
          {logs.map((log, idx) => (
            <div key={idx} className="leading-relaxed">
              <span className="text-cyan-500">&gt;</span> {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
