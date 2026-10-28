import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
} from 'lucide-react';
import { PriceAlert } from '../types/market';

interface PriceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: PriceAlert[];
  onAddAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered'>) => void;
  onToggleAlert: (id: string) => void;
  onRemoveAlert: (id: string) => void;
  onResetTrigger: (id: string) => void;
  highContrast: boolean;
}

export const PriceAlertsModal: React.FC<PriceAlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onAddAlert,
  onToggleAlert,
  onRemoveAlert,
  onResetTrigger,
  highContrast,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAsset, setTargetAsset] = useState<string>('cepea_arabica');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetValue, setTargetValue] = useState<number>(1950);
  const [objective, setObjective] = useState<'trava' | 'venda_imediata' | 'protecao_custo' | 'monitoramento'>('trava');
  const [pushStatus, setPushStatus] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  if (!isOpen) return null;

  const assetOptions = [
    { id: 'cepea_arabica', name: 'Arábica CEPEA/ESALQ', unit: 'R$/saca', defaultVal: 1950 },
    { id: 'cepea_conilon', name: 'Conilon CEPEA/ESALQ', unit: 'R$/saca', defaultVal: 1480 },
    { id: 'ice_ny', name: 'Bolsa Nova York ICE (Arábica)', unit: '¢/lb', defaultVal: 295 },
    { id: 'ice_london', name: 'Bolsa Londres ICE (Robusta)', unit: 'US$/ton', defaultVal: 4800 },
    { id: 'b3_icf', name: 'B3 Futuros ICF', unit: 'US$/saca', defaultVal: 340 },
    { id: 'usd_brl', name: 'Dólar Comercial PTAX', unit: 'R$/US$', defaultVal: 5.85 },
    { id: 'regional_sul_minas', name: 'Sul de Minas (Mercado Físico)', unit: 'R$/saca', defaultVal: 1960 },
  ];

  const handleAssetChange = (assetId: string) => {
    setTargetAsset(assetId);
    const opt = assetOptions.find(o => o.id === assetId);
    if (opt) {
      setTargetValue(opt.defaultVal);
    }
  };

  const handleRequestPush = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const opt = assetOptions.find(o => o.id === targetAsset);
    const alertTitle = title.trim() || `${opt?.name || ''} ${condition === 'above' ? '≥' : '≤'} ${targetValue} ${opt?.unit}`;

    onAddAlert({
      title: alertTitle,
      targetAsset,
      targetAssetName: opt?.name || 'Ativo',
      condition,
      targetValue,
      unit: opt?.unit || '',
      objective,
      isActive: true,
    });

    setTitle('');
    setShowForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`w-full max-w-xl rounded-2xl shadow-2xl border p-6 space-y-5 my-8 transition ${
        highContrast
          ? 'bg-white text-black border-black'
          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white leading-tight">
                Alertas de Preço & Travas de Safra
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Notificações instantâneas quando o mercado atingir suas metas de venda.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Push Notification Permission Box */}
        {pushStatus !== 'granted' && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-amber-900 dark:text-amber-300 block">
                Ativar Notificações no Navegador / Celular
              </span>
              <p className="text-amber-800 dark:text-amber-400">
                Receba avisos sonoros e em tela cheia mesmo com o aplicativo fechado.
              </p>
            </div>
            <button
              onClick={handleRequestPush}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shrink-0 shadow-sm transition"
            >
              Ativar Push
            </button>
          </div>
        )}

        {/* Action button to open Create Form */}
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Alerta de Preço</span>
          </button>
        ) : (
          /* Create Alert Form */
          <form onSubmit={handleSubmit} className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200 dark:border-stone-700 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 dark:text-white uppercase tracking-wider text-[11px]">
                Configurar Regra de Alerta
              </span>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                Cancelar
              </button>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Nome ou Finalidade do Alerta (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ex: Trava de 30% da Safra 2025"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Ativo / Indicador:
                </label>
                <select
                  value={targetAsset}
                  onChange={(e) => handleAssetChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-semibold"
                >
                  {assetOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Disparar quando o preço estiver:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCondition('above')}
                    className={`py-2 px-2 rounded-lg font-bold transition text-center ${
                      condition === 'above'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    Acima de (≥)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCondition('below')}
                    className={`py-2 px-2 rounded-lg font-bold transition text-center ${
                      condition === 'below'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    Abaixo de (≤)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Preço Alvo ({assetOptions.find(o => o.id === targetAsset)?.unit}):
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={targetValue}
                  onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Objetivo Estratégico:
                </label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                >
                  <option value="trava">Trava de Preço Futuro (Hedge)</option>
                  <option value="venda_imediata">Venda no Físico / Cooperativa</option>
                  <option value="protecao_custo">Proteção de Custo de Insumo</option>
                  <option value="monitoramento">Apenas Acompanhamento</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
              >
                Salvar Alerta
              </button>
            </div>
          </form>
        )}

        {/* Existing Alerts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Alertas Cadastrados ({alerts.length})</span>
            <span>Status</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <p className="text-center py-6 text-stone-400 text-xs">
                Nenhum alerta cadastrado. Configure um alerta acima para monitorar travas de preço.
              </p>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
                    alert.isTriggered
                      ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/60'
                      : alert.isActive
                      ? 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700'
                      : 'bg-stone-100/50 dark:bg-stone-800/20 border-stone-200 dark:border-stone-800 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 dark:text-white">
                        {alert.title}
                      </span>
                      {alert.isTriggered && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Disparado {alert.triggeredAt ? `(${alert.triggeredAt})` : ''}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      {alert.targetAssetName} {alert.condition === 'above' ? '≥' : '≤'}{' '}
                      <strong className="font-mono text-stone-800 dark:text-stone-200">
                        {alert.targetValue.toLocaleString('pt-BR')} {alert.unit}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {alert.isTriggered && (
                      <button
                        onClick={() => onResetTrigger(alert.id)}
                        className="px-2 py-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 rounded text-[11px] font-semibold hover:bg-stone-50 flex items-center gap-1"
                        title="Rearmar alerta para novas oscilações"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Rearmar
                      </button>
                    )}

                    <button
                      onClick={() => onToggleAlert(alert.id)}
                      className="p-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                      title={alert.isActive ? 'Desativar alerta' : 'Ativar alerta'}
                    >
                      {alert.isActive ? (
                        <ToggleRight className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-stone-400" />
                      )}
                    </button>

                    <button
                      onClick={() => onRemoveAlert(alert.id)}
                      className="p-1 text-stone-400 hover:text-red-600"
                      title="Excluir alerta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-semibold"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
