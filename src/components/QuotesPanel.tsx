import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
  Calculator,
} from 'lucide-react';
import { Quotation } from '../types/market';
import { PriceChart } from './PriceChart';

interface QuotesPanelProps {
  quotations: Quotation[];
  onSelectForCalculator: (quote: Quotation) => void;
  highContrast: boolean;
  onOpenAlertsForAsset?: (assetId: string) => void;
}

export const QuotesPanel: React.FC<QuotesPanelProps> = ({
  quotations,
  onSelectForCalculator,
  highContrast,
  onOpenAlertsForAsset,
}) => {
  const [selectedChartAsset, setSelectedChartAsset] = useState<string>('cepea_arabica');
  const [detailModalQuote, setDetailModalQuote] = useState<Quotation | null>(null);

  const cepeaArabica = quotations.find(q => q.id === 'cepea_arabica');
  const cepeaConilon = quotations.find(q => q.id === 'cepea_conilon');
  const iceNy = quotations.find(q => q.id === 'ice_ny');
  const iceLondon = quotations.find(q => q.id === 'ice_london');
  const b3Icf = quotations.find(q => q.id === 'b3_icf');
  const usdBrl = quotations.find(q => q.id === 'usd_brl');

  // Format currency helpers
  const formatBRL = (val?: number) => {
    if (val === undefined || isNaN(val)) return 'R$ 0,00';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatNumber = (val: number, decimals = 2) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Quick Summary & Parity Indicator */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition ${
        highContrast
          ? 'bg-black text-white border-white'
          : 'bg-gradient-to-br from-stone-900 to-stone-850 text-stone-100 border-stone-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Paridade de Exportação & Câmbio
              </span>
              <span className="text-stone-400 text-xs">·</span>
              <span className="text-xs text-stone-400">
                1 Saca = 60kg = 132,27 lb
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Painel Geral de Cotações do Café
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
              Acompanhe os principais balizadores do mercado físico (CEPEA) e bolsas futuras (ICE Nova York, Londres e B3), convertidos automaticamente para Reais por saca.
            </p>
          </div>

          {/* Dólar Quick Badge */}
          {usdBrl && (
            <div className="flex items-center gap-3 bg-stone-800/90 border border-stone-700/80 px-4 py-3 rounded-xl shrink-0">
              <div>
                <div className="text-[11px] font-medium text-stone-400">
                  Dólar Comercial PTAX
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                  R$ {formatNumber(usdBrl.price, 4)}
                </div>
              </div>
              <div className={`text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 ${
                usdBrl.changePercent >= 0 ? 'text-emerald-300 bg-emerald-950/80' : 'text-red-300 bg-red-950/80'
              }`}>
                {usdBrl.changePercent >= 0 ? '+' : ''}{formatNumber(usdBrl.changePercent, 2)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Main Commodity Quotations (RF-MVP-01) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quotations.map(quote => {
          const isSelectedChart = selectedChartAsset === quote.id;
          const isPositive = quote.changePercent >= 0;

          return (
            <div
              key={quote.id}
              onClick={() => setSelectedChartAsset(quote.id)}
              className={`relative rounded-2xl p-5 border cursor-pointer transition duration-150 ${
                isSelectedChart
                  ? 'border-emerald-600 bg-white shadow-md ring-2 ring-emerald-600/20 dark:bg-stone-900'
                  : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 hover:shadow-sm'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      {quote.category === 'physical' ? 'Mercado Físico' : quote.category === 'futures' ? 'Bolsa Futura' : 'Câmbio Oficial'}
                    </span>
                    {quote.contractMonth && (
                      <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                        {quote.contractMonth}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-white leading-snug">
                    {quote.name}
                  </h3>
                </div>

                {/* Variation Pill */}
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums shrink-0 ${
                    isPositive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{isPositive ? '+' : ''}{formatNumber(quote.changePercent, 2)}%</span>
                </div>
              </div>

              {/* Main Price Tag (Big, readable, high-contrast) */}
              <div className="my-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono text-stone-900 dark:text-white tabular-nums tracking-tight">
                    {quote.category === 'currency' ? `R$ ${formatNumber(quote.price, 4)}` : formatNumber(quote.price, 2)}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">
                    {quote.unit}
                  </span>
                </div>

                {/* Equivalent in R$/saca (60kg) when it's an international exchange! */}
                {quote.convertedPriceBRL && quote.unit !== 'R$/saca (60kg)' && quote.category !== 'currency' && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 px-2 py-1 rounded-md">
                    <span>Equiv. no Brasil:</span>
                    <strong className="font-mono text-sm tabular-nums">
                      {formatBRL(quote.convertedPriceBRL)}
                    </strong>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400">/saca</span>
                  </div>
                )}
              </div>

              {/* High / Low / Volume row */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-400">
                <div>
                  <span className="text-[10px] uppercase text-stone-600 dark:text-stone-400 block font-semibold">Mín / Máx do Dia</span>
                  <span className="font-mono tabular-nums font-semibold text-stone-800 dark:text-stone-200">
                    {formatNumber(quote.low, 2)} - {formatNumber(quote.high, 2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-stone-600 dark:text-stone-400 block font-semibold">Atualização</span>
                  <span className="text-stone-800 dark:text-stone-200 text-[11px] font-medium flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    {quote.lastUpdated}
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-3 pt-2.5 flex items-center justify-between gap-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailModalQuote(quote);
                  }}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white flex items-center gap-1 py-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  Detalhes
                </button>

                {quote.category !== 'currency' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectForCalculator(quote);
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md transition"
                    title="Simular preço líquido na fazenda com esta cotação"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    Simular Venda
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Historical Trend Chart Component (RF-MVP-05) */}
      <div className="mt-8">
        <PriceChart
          assetId={selectedChartAsset}
          assetName={quotations.find(q => q.id === selectedChartAsset)?.name || 'Arábica CEPEA/ESALQ'}
          highContrast={highContrast}
          onSelectAsset={setSelectedChartAsset}
        />
      </div>

      {/* Details Modal */}
      {detailModalQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  Ficha Técnica da Cotação
                </span>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                  {detailModalQuote.name}
                </h3>
              </div>
              <button
                onClick={() => setDetailModalQuote(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {detailModalQuote.description}
            </p>

            <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-200 dark:border-stone-700">
                <span className="text-stone-500">Símbolo de Negociação:</span>
                <span className="font-mono font-bold text-stone-900 dark:text-white">{detailModalQuote.symbol}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200 dark:border-stone-700">
                <span className="text-stone-500">Fechamento Anterior:</span>
                <span className="font-mono font-bold text-stone-900 dark:text-white">
                  {formatNumber(detailModalQuote.previousClose, 2)} {detailModalQuote.unit}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200 dark:border-stone-700">
                <span className="text-stone-500">Volume Registrado:</span>
                <span className="font-semibold text-stone-900 dark:text-white">{detailModalQuote.volume || 'N/A'}</span>
              </div>
              {detailModalQuote.convertedPriceBRL && (
                <div className="flex justify-between py-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span>Equivalência em R$/saca (60kg):</span>
                  <span className="font-mono text-sm">{formatBRL(detailModalQuote.convertedPriceBRL)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  onSelectForCalculator(detailModalQuote);
                  setDetailModalQuote(null);
                }}
                className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
              >
                <Calculator className="w-4 h-4" />
                Usar no Simulador de Venda
              </button>
              <button
                onClick={() => setDetailModalQuote(null)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-sm font-semibold transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
