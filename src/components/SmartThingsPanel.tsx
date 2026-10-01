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
  Film,
  ExternalLink,
  Download,
  Sparkles,
  Plus,
  Trash2,
  X
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
  onSetAllDevices?: (devices: SmartDevice[]) => void;
  onAddDevice: (newDevice: SmartDevice) => void;
  onRemoveDevice: (deviceId: string) => void;
}

export const SmartThingsPanel: React.FC<SmartThingsPanelProps> = ({
  devices,
  smartThingsToken,
  onSaveToken,
  onUpdateDevice,
  onExecuteCommand,
  onAddXp,
  onSetAllDevices,
  onAddDevice,
  onRemoveDevice
}) => {
  const [tokenInput, setTokenInput] = useState(smartThingsToken);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isTestingToken, setIsTestingToken] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [detectedRealDevices, setDetectedRealDevices] = useState<any[]>([]);
  
  // Add & Remove Device Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<SmartDevice | null>(null);

  // New device form inputs
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceRoom, setNewDeviceRoom] = useState('Sala de Estar');
  const [newDeviceType, setNewDeviceType] = useState<SmartDevice['type']>('light');
  const [newDeviceWatts, setNewDeviceWatts] = useState(15);
  const [newSmartThingsId, setNewSmartThingsId] = useState('');

  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString('pt-BR')}] Hub SmartThings inicializado. ${devices.length} dispositivos sincronizados.`,
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
    setDetectedRealDevices([]);
    try {
      if (!tokenInput.trim()) {
        setTestResult({
          success: true,
          message: 'Modo de Simulação Avançada ativo. Todos os dispositivos respondem localmente.'
        });
        onSaveToken('');
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
        const data = await res.json().catch(() => ({}));
        const realItems = data.items || [];
        setDetectedRealDevices(realItems);

        setTestResult({
          success: true,
          message: `Conexão autenticada com sucesso! ${realItems.length} dispositivo(s) real(is) detectado(s) na sua conta Samsung SmartThings.`
        });
        onSaveToken(tokenInput.trim());
        addLog(`Nuvem Samsung SmartThings conectada. ${realItems.length} dispositivos disponíveis.`);
        playChime();
        onAddXp(50, 'Conexão com Samsung SmartThings API');
      } else {
        setTestResult({
          success: false,
          message: `Código de erro ${res.status}: Verifique se seu token foi copiado integralmente e possui as permissões 'devices:read' e 'devices:write'.`
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: 'Não foi possível conectar à API da Samsung. Verifique sua conexão à internet ou o token informado.'
      });
    } finally {
      setIsTestingToken(false);
    }
  };

  const handleImportRealDevices = () => {
    if (!detectedRealDevices.length || !onSetAllDevices) return;

    const importedList: SmartDevice[] = detectedRealDevices.map((item: any) => {
      const name = item.label || item.name || 'Dispositivo SmartThings';
      const id = item.deviceId;
      const lower = name.toLowerCase();

      let type: SmartDevice['type'] = 'light';
      let status: SmartDevice['status'] = 'off';
      let value: number | undefined = undefined;

      if (lower.includes('ar') || lower.includes('clima') || lower.includes('windfree') || lower.includes('ac')) {
        type = 'thermostat';
        value = 22;
      } else if (lower.includes('fechadura') || lower.includes('tranca') || lower.includes('porta') || lower.includes('lock')) {
        type = 'lock';
        status = 'locked';
      } else if (lower.includes('cortina') || lower.includes('persiana') || lower.includes('shade')) {
        type = 'curtain';
        status = 'open';
      } else if (lower.includes('tv') || lower.includes('televis')) {
        type = 'tv';
      } else if (lower.includes('tomada') || lower.includes('plug') || lower.includes('energy')) {
        type = 'switch';
      } else {
        type = 'light';
        value = 80;
      }

      return {
        id,
        name,
        room: item.roomName || 'Residência',
        type,
        status,
        value,
        powerConsumptionWatts: type === 'tv' ? 120 : type === 'thermostat' ? 850 : type === 'switch' ? 45 : 12,
        lastUpdated: new Date().toISOString()
      };
    });

    onSetAllDevices(importedList);
    playChime();
    addLog(`${importedList.length} dispositivos reais do Samsung SmartThings sincronizados.`);
    onAddXp(60, 'Sincronização de dispositivos reais SmartThings');
    setTestResult({
      success: true,
      message: `${importedList.length} dispositivo(s) real(is) importado(s) para o controle do J.A.R.V.I.S.!`
    });
  };

  const handleCreateDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;

    const newId = newSmartThingsId.trim() || `device-${Date.now()}`;
    const newDevice: SmartDevice = {
      id: newId,
      name: newDeviceName.trim(),
      room: newDeviceRoom.trim() || 'Residência',
      type: newDeviceType,
      status: newDeviceType === 'lock' ? 'locked' : newDeviceType === 'curtain' ? 'open' : 'off',
      value: newDeviceType === 'thermostat' ? 22 : newDeviceType === 'light' ? 80 : undefined,
      powerConsumptionWatts: Number(newDeviceWatts) || 15,
      lastUpdated: new Date().toISOString()
    };

    onAddDevice(newDevice);
    playChime();
    addLog(`Dispositivo '${newDevice.name}' adicionado à ${newDevice.room}.`);
    onAddXp(25, 'Novo dispositivo conectado ao Stark Hub');

    // Reset form
    setNewDeviceName('');
    setNewSmartThingsId('');
    setIsAddModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deviceToDelete) return;
    const devName = deviceToDelete.name;
    onRemoveDevice(deviceToDelete.id);
    playJarvisBeep(640, 0.08);
    addLog(`Dispositivo '${devName}' desconectado e removido do sistema.`);
    setDeviceToDelete(null);
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
              CENTRAL DE CASA INTELIGENTE
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
            onClick={() => {
              playJarvisBeep(920, 0.05);
              setIsAddModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-slate-950 text-xs font-tech font-bold flex items-center gap-1.5 shadow-md glow-cyan-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Dispositivo</span>
          </button>

          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="px-3 py-2 rounded-xl border border-cyan-800 bg-slate-900/80 hover:border-cyan-400 text-cyan-300 text-xs font-tech flex items-center gap-2 transition-all"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Configurar Token</span>
          </button>
        </div>
      </div>

      {/* Token configuration drawer */}
      {isConfigOpen && (
        <div className="p-6 hud-panel rounded-3xl border border-cyan-400/50 bg-slate-950/95 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-cyan-900/50 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-hud font-bold text-cyan-200 tracking-wide">
                COMO INTEGRAR COM O APLICATIVO SAMSUNG SMARTTHINGS
              </h3>
            </div>
            <button
              onClick={() => setIsConfigOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-900"
            >
              Fechar
            </button>
          </div>

          {/* 4-Step Visual Tutorial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl border border-cyan-900/50 bg-slate-900/60 space-y-2">
              <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-hud font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h4 className="font-tech font-bold text-xs text-slate-100">Portal de Tokens</h4>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Acesse o portal oficial de tokens de desenvolvedor da Samsung no seu navegador.
              </p>
              <a
                href="https://account.smartthings.com/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-tech text-cyan-400 hover:underline pt-1"
              >
                <span>Abrir portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3.5 rounded-2xl border border-cyan-900/50 bg-slate-900/60 space-y-2">
              <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-hud font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h4 className="font-tech font-bold text-xs text-slate-100">Mesma Conta Samsung</h4>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Faça login usando o mesmo email e senha da conta Samsung cadastrada no SmartThings do seu smartphone.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-cyan-900/50 bg-slate-900/60 space-y-2">
              <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-hud font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h4 className="font-tech font-bold text-xs text-slate-100">Gerar Token (PAT)</h4>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Clique em <strong>"Generate new token"</strong>, nomeie <code className="text-cyan-300">JARVIS</code> e marque as caixas de <em>Devices</em>, <em>Locations</em> e <em>Scenes</em>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-cyan-900/50 bg-slate-900/60 space-y-2">
              <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-hud font-bold text-xs flex items-center justify-center">
                4
              </div>
              <h4 className="font-tech font-bold text-xs text-slate-100">Validar & Sincronizar</h4>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Cole o código do token abaixo. O J.A.R.V.I.S. vai testar a conexão e importar seus aparelhos reais!
              </p>
            </div>
          </div>

          {/* Token Input Bar */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-hud text-cyan-300 block">
              SEU SMARTTHINGS PERSONAL ACCESS TOKEN (PAT)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Cole seu SmartThings Personal Access Token aqui (ex: 8b7a9f...)"
                className="flex-1 bg-slate-900 border border-cyan-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
              />
              <button
                onClick={handleTestToken}
                disabled={isTestingToken}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-tech font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                {isTestingToken ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{tokenInput.trim() ? 'Validar Conexão' : 'Ativar Modo Simulação'}</span>
              </button>
            </div>
          </div>

          {/* Result Banner & Real Devices Importer */}
          {testResult && (
            <div
              className={`p-4 rounded-2xl text-xs font-tech space-y-3 ${
                testResult.success
                  ? 'bg-emerald-950/70 border border-emerald-500/60 text-emerald-200'
                  : 'bg-rose-950/70 border border-rose-500/60 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                )}
                <span className="font-semibold">{testResult.message}</span>
              </div>

              {testResult.success && detectedRealDevices.length > 0 && onSetAllDevices && (
                <div className="pt-2 border-t border-emerald-800/40 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-emerald-300 font-sans">
                    Deseja substituir os aparelhos de demonstração pelos {detectedRealDevices.length} dispositivos reais da sua casa?
                  </span>
                  <button
                    onClick={handleImportRealDevices}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-tech font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Sincronizar Dispositivos Reais ({detectedRealDevices.length})</span>
                  </button>
                </div>
              )}
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

                  <div className="flex items-center gap-1.5">
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

                    {/* Delete Device Button */}
                    <button
                      onClick={() => {
                        playJarvisBeep(600, 0.05);
                        setDeviceToDelete(device);
                      }}
                      className="p-2.5 rounded-xl border border-transparent hover:border-rose-900/60 bg-slate-900/40 hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition-all"
                      title={`Remover ${device.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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

      {/* MODAL: Adicionar Novo Dispositivo */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="hud-panel rounded-3xl p-6 sm:p-7 border border-cyan-400/50 bg-slate-950 w-full max-w-lg space-y-5 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 text-xs font-hud">
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>EXPANSÃO RESIDENCIAL STARK HUB</span>
              </div>
              <h3 className="text-lg font-hud font-bold text-slate-100 mt-1">
                Adicionar Novo Dispositivo
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Cadastre um novo dispositivo inteligente para monitoramento, automações e controle por voz do J.A.R.V.I.S.
              </p>
            </div>

            <form onSubmit={handleCreateDevice} className="space-y-4">
              <div>
                <label className="text-xs font-hud text-cyan-300 block mb-1">
                  NOME DO DISPOSITIVO *
                </label>
                <input
                  type="text"
                  required
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="ex: Lâmpada de Leitura, Ar Quarto Casal, TV QLED..."
                  className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-hud text-cyan-300 block mb-1">
                    CÔMODO / LOCAL
                  </label>
                  <select
                    value={newDeviceRoom}
                    onChange={(e) => setNewDeviceRoom(e.target.value)}
                    className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-sans"
                  >
                    <option value="Sala de Estar">Sala de Estar</option>
                    <option value="Quarto Principal">Quarto Principal</option>
                    <option value="Escritório / Setup">Escritório / Setup</option>
                    <option value="Cozinha">Cozinha</option>
                    <option value="Varanda Gourmet">Varanda Gourmet</option>
                    <option value="Entrada / Hall">Entrada / Hall</option>
                    <option value="Garagem">Garagem</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-hud text-cyan-300 block mb-1">
                    CONSUMO ESTIMADO (WATTS)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5000"
                    value={newDeviceWatts}
                    onChange={(e) => setNewDeviceWatts(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-cyan-900 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-hud text-cyan-300 block mb-1.5">
                  TIPO DE DISPOSITIVO
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-tech">
                  {[
                    { type: 'light', label: 'Lâmpada', icon: Lightbulb, watts: 15 },
                    { type: 'thermostat', label: 'Ar-Condicionado', icon: Wind, watts: 850 },
                    { type: 'lock', label: 'Fechadura Digital', icon: Lock, watts: 5 },
                    { type: 'curtain', label: 'Cortina / Persiana', icon: Sliders, watts: 20 },
                    { type: 'tv', label: 'Smart TV', icon: Tv, watts: 120 },
                    { type: 'switch', label: 'Tomada Inteligente', icon: Zap, watts: 45 }
                  ].map((item) => {
                    const IconComponent = item.icon;
                    const isSelected = newDeviceType === item.type;
                    return (
                      <button
                        type="button"
                        key={item.type}
                        onClick={() => {
                          setNewDeviceType(item.type as any);
                          setNewDeviceWatts(item.watts);
                        }}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 glow-cyan-sm'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span className="font-semibold text-[11px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-hud text-slate-400 block mb-1">
                  ID SMARTTHINGS (OPCIONAL)
                </label>
                <input
                  type="text"
                  value={newSmartThingsId}
                  onChange={(e) => setNewSmartThingsId(e.target.value)}
                  placeholder="Deixe em branco para gerar ID automático local"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-cyan-950">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-tech text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-slate-950 font-tech font-bold text-xs shadow-md glow-cyan-sm"
                >
                  Salvar Dispositivo (+25 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirmação de Remoção de Dispositivo */}
      {deviceToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="hud-panel rounded-3xl p-6 border border-rose-500/50 bg-slate-950 w-full max-w-md space-y-4 relative shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-hud font-bold text-slate-100">
                  Desconectar Dispositivo
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Confirmação de exclusão do Stark Hub
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              Tem certeza que deseja remover o dispositivo{' '}
              <strong className="text-cyan-300">"{deviceToDelete.name}"</strong> localizado em{' '}
              <span className="text-slate-200">({deviceToDelete.room})</span>? Ele deixará de responder aos comandos de voz e rotinas.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeviceToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-tech text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-tech font-bold text-xs shadow-md transition-all"
              >
                Confirmar Remoção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
