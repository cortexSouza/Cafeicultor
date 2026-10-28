import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Code2,
  Server,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ApiConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConsoleModal: React.FC<ApiConsoleModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [responseJson, setResponseJson] = useState<any>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [activeTab, setActiveTab] = useState<'response' | 'architecture' | 'contract'>('response');

  const executeApiCall = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const url = `/api/market/coffee-consolidated${forceRefresh ? '?forceRefresh=true' : ''}`;
      const res = await fetch(url);
      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setHttpStatus(res.status);
      const data = await res.json();
      setResponseJson(data);
    } catch (err: any) {
      setHttpStatus(500);
      setResponseJson({ error: err?.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !responseJson) {
      executeApiCall();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const curlCommand = `curl -X GET "http://localhost:3000/api/market/coffee-consolidated${forceRefresh ? '?forceRefresh=true' : ''}" -H "Accept: application/json"`;

  const copyToClipboard = (text: string, isCurl = false) => {
    navigator.clipboard.writeText(text);
    if (isCurl) {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2500);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-stone-900 text-stone-100 rounded-2xl shadow-2xl border border-stone-800 flex flex-col max-h-[90vh] my-4 overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between gap-4 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/80 text-emerald-300 flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Console Agrotech Backend API
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                  TypeScript Node.js 18+
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Microsserviço de Ingestão, Cálculo de Paridade & Consolidação do Mercado Cafeeiro
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Action Bar / Endpoint Bar */}
        <div className="px-5 py-3 border-b border-stone-800 bg-stone-900/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white font-mono font-bold text-[11px]">
              GET
            </span>
            <code className="text-xs font-mono text-emerald-300 bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800 flex-1 truncate">
              /api/market/coffee-consolidated{forceRefresh ? '?forceRefresh=true' : ''}
            </code>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-stone-400 hover:text-stone-200">
              <input
                type="checkbox"
                checked={forceRefresh}
                onChange={(e) => setForceRefresh(e.target.checked)}
                className="rounded bg-stone-800 border-stone-700 text-emerald-600 focus:ring-0"
              />
              <span className="text-[11px]">Bypass Cache</span>
            </label>

            <button
              onClick={executeApiCall}
              disabled={loading}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Consultando...' : 'Executar API'}</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="px-5 pt-3 flex gap-2 border-b border-stone-800 bg-stone-950/40 text-xs">
          <button
            onClick={() => setActiveTab('response')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition ${
              activeTab === 'response'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Resposta JSON Unificada
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition ${
              activeTab === 'architecture'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Arquitetura & Resiliência
          </button>
          <button
            onClick={() => setActiveTab('contract')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition ${
              activeTab === 'contract'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Fórmulas & Conversões
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'response' && (
            <div className="space-y-3">
              {/* Telemetry info row */}
              <div className="flex items-center justify-between text-xs bg-stone-950 px-3.5 py-2 rounded-xl border border-stone-800">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="text-stone-500">Status:</span>
                    <strong className="text-emerald-400 font-mono font-bold">
                      {httpStatus ? `${httpStatus} OK` : 'Aguardando'}
                    </strong>
                  </span>
                  {latencyMs !== null && (
                    <span className="flex items-center gap-1 text-stone-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-stone-500" />
                      {latencyMs}ms
                    </span>
                  )}
                  {responseJson?.status && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      STATUS: {responseJson.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(curlCommand, true)}
                    className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[11px] font-medium flex items-center gap-1 transition"
                  >
                    {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCurl ? 'Copiado!' : 'Copiar cURL'}</span>
                  </button>

                  <button
                    onClick={() => copyToClipboard(JSON.stringify(responseJson, null, 2))}
                    className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[11px] font-medium flex items-center gap-1 transition"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
                  </button>
                </div>
              </div>

              {/* JSON Code Viewer */}
              <div className="bg-stone-950 rounded-xl p-4 border border-stone-800 overflow-x-auto font-mono text-xs leading-relaxed text-emerald-300">
                <pre>{responseJson ? JSON.stringify(responseJson, null, 2) : '// Carregando dados...'}</pre>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4 text-xs text-stone-300 leading-relaxed">
              <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Estratégia de Ingestão Paralela & Resiliência
                </h4>
                <p>
                  O serviço foi construído seguindo os mais altos padrões para ambientes rurais e conexões de baixa latência:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-stone-400 mt-2">
                  <li>
                    <strong className="text-white">Promise.allSettled:</strong> As fontes (BACEN PTAX, ICE NY, ICE Londres e CEPEA) são consultadas em paralelo com isolamento total de falhas. Uma falha em uma bolsa nunca aborta as demais requisições.
                  </li>
                  <li>
                    <strong className="text-white">Timeout Estrito de 3000ms:</strong> Toda chamada HTTP possui um <code className="text-emerald-400 font-mono">AbortController</code> com limite de 3 segundos. Se a API do governo ou bolsa demorar, a requisição é cancelada e o cache é acionado.
                  </li>
                  <li>
                    <strong className="text-white">Fallback em Camadas:</strong> BACEN PTAX → AwesomeAPI → ExchangeRate API → Cache em Memória → Baseline de Emergência.
                  </li>
                  <li>
                    <strong className="text-white">Contrato de Status:</strong> Resposta contém <code className="text-emerald-400 font-mono">SUCCESS</code>, <code className="text-emerald-400 font-mono">PARTIAL</code>, <code className="text-emerald-400 font-mono">CACHED</code> ou <code className="text-emerald-400 font-mono">ERROR</code>, informando a integridade da cotação ao app móvel.
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  Módulos TypeScript Implementados
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800">
                    <span className="text-emerald-400 block font-bold">server/services/coffeeMarketConsolidator.ts</span>
                    <span className="text-stone-400">Orquestrador central de paridades e status</span>
                  </div>
                  <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800">
                    <span className="text-emerald-400 block font-bold">server/services/currencyService.ts</span>
                    <span className="text-stone-400">BACEN PTAX + AwesomeAPI + Fallback</span>
                  </div>
                  <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800">
                    <span className="text-emerald-400 block font-bold">server/services/futuresMarketService.ts</span>
                    <span className="text-stone-400">ICE NY (KC=F) e ICE Londres (RC=F)</span>
                  </div>
                  <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800">
                    <span className="text-emerald-400 block font-bold">server/services/cepeaService.ts</span>
                    <span className="text-stone-400">CEPEA Arábica e Conilon com Scraping</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contract' && (
            <div className="space-y-4 text-xs text-stone-300 leading-relaxed">
              <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Fórmulas Matemáticas de Paridade de Exportação
                </h4>

                <div className="p-3 bg-stone-900 rounded-lg border border-stone-800 space-y-1">
                  <span className="font-bold text-emerald-400 block">1. Café Arábica (ICE Nova York):</span>
                  <div className="font-mono text-stone-200 bg-stone-950 p-2 rounded border border-stone-800">
                    Preço da Saca (R$) = ((Preço NY [¢/lb] × 132.277) ÷ 100) × Dólar (R$)
                  </div>
                  <span className="text-[11px] text-stone-400 block">
                    Fator: 1 saca de café de 60 kg = exatamente 132.277 libras-peso (lbs).
                  </span>
                </div>

                <div className="p-3 bg-stone-900 rounded-lg border border-stone-800 space-y-1">
                  <span className="font-bold text-emerald-400 block">2. Café Conilon/Robusta (ICE Londres):</span>
                  <div className="font-mono text-stone-200 bg-stone-950 p-2 rounded border border-stone-800">
                    Preço da Saca (R$) = (Preço Londres [USD/Ton] ÷ 16.6667) × Dólar (R$)
                  </div>
                  <span className="text-[11px] text-stone-400 block">
                    Fator: 1 Tonelada métrica (1.000 kg) = 16.6667 sacas de 60 kg (ou 0.06 ton/saca).
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between text-xs text-stone-400">
          <span>Pronto para integração via cURL, React Native, Flutter ou Kotlin/Swift.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg font-semibold"
          >
            Fechar Console
          </button>
        </div>
      </div>
    </div>
  );
};
