import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Maximize2,
  BarChart2,
  Sparkles,
} from 'lucide-react';
import { getHistoricalSeries } from '../data/mockMarketData';

interface PriceChartProps {
  assetId: string;
  assetName: string;
  highContrast: boolean;
  onSelectAsset?: (assetId: string) => void;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  assetId,
  assetName,
  highContrast,
  onSelectAsset,
}) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '6m' | '1a' | '5a'>('30d');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const series = useMemo(() => {
    return getHistoricalSeries(assetId, timeframe);
  }, [assetId, timeframe]);

  const points = series.points;
  const isPositive = series.variationPercent >= 0;

  // Compute SVG dimensions and paths
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minPrice = series.low * 0.995;
  const maxPrice = series.high * 1.005;
  const priceRange = maxPrice - minPrice || 1;

  const getX = (index: number) => {
    if (points.length <= 1) return padding.left;
    return padding.left + (index / (points.length - 1)) * chartWidth;
  };

  const getY = (price: number) => {
    return padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  // Generate SVG path strings
  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, point, i) => {
      const x = getX(i);
      const y = getY(point.price);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [points, minPrice, maxPrice]);

  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const firstX = getX(0);
    const lastX = getX(points.length - 1);
    const bottomY = padding.top + chartHeight;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathD, points]);

  // Active hover point
  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : points[points.length - 1];

  const formatNumber = (val: number, decimals = 2) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  return (
    <div className={`p-5 sm:p-6 rounded-2xl border transition shadow-sm ${
      highContrast
        ? 'bg-white text-black border-black'
        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
    }`}>
      {/* Top Header & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
            <BarChart2 className="w-4 h-4" />
            <span>Análise Gráfica de Tendência</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white mt-0.5">
            Histórico de Cotação: {series.assetName}
          </h2>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl self-start sm:self-auto">
          {(['7d', '30d', '6m', '1a', '5a'] as const).map(tf => {
            const labelMap = {
              '7d': '7 Dias',
              '30d': '30 Dias',
              '6m': '6 Meses',
              '1a': '1 Ano',
              '5a': '5 Anos',
            };
            const active = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                  active
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {labelMap[tf]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 bg-stone-50 dark:bg-stone-800/50 p-3.5 rounded-xl text-xs">
        <div>
          <span className="text-stone-600 dark:text-stone-400 block text-[11px] font-semibold">
            {hoverIndex !== null ? 'Preço na Data Selecionada' : 'Cotação Recente'}
          </span>
          <span className="text-lg font-bold font-mono text-stone-900 dark:text-white tabular-nums">
            {series.assetId === 'usd_brl' ? `R$ ${formatNumber(activePoint.price, 4)}` : formatNumber(activePoint.price, 2)}
          </span>
          <span className="text-[10px] text-stone-600 dark:text-stone-400 block font-medium">
            {activePoint.label}
          </span>
        </div>

        <div>
          <span className="text-stone-600 dark:text-stone-400 block text-[11px] font-semibold">Variação no Período</span>
          <div className={`text-base font-bold font-mono tabular-nums flex items-center gap-1 ${
            isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
          }`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{formatNumber(series.variationPercent, 2)}%</span>
          </div>
          <span className="text-[10px] text-stone-600 dark:text-stone-400 block font-medium">
            ({isPositive ? '+' : ''}{formatNumber(series.variationValue, 2)} {series.unit})
          </span>
        </div>

        <div>
          <span className="text-stone-600 dark:text-stone-400 block text-[11px] font-semibold">Mínima / Máxima</span>
          <span className="text-sm font-semibold font-mono text-stone-800 dark:text-stone-200 tabular-nums">
            {formatNumber(series.low, 2)} / {formatNumber(series.high, 2)}
          </span>
          <span className="text-[10px] text-stone-600 dark:text-stone-400 block font-medium">
            Amplitude: {formatNumber(series.high - series.low, 2)}
          </span>
        </div>

        <div>
          <span className="text-stone-600 dark:text-stone-400 block text-[11px] font-semibold">Preço Médio Ponderado</span>
          <span className="text-sm font-semibold font-mono text-stone-800 dark:text-stone-200 tabular-nums">
            {formatNumber(series.average, 2)} {series.unit}
          </span>
          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block font-semibold">
            {activePoint.price >= series.average ? '▲ Acima da média' : '▼ Abaixo da média'}
          </span>
        </div>
      </div>

      {/* Interactive SVG Chart Container */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 sm:h-72 touch-none overflow-visible"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * width;
            const clampedX = Math.max(padding.left, Math.min(width - padding.right, mouseX));
            const ratio = (clampedX - padding.left) / chartWidth;
            const idx = Math.round(ratio * (points.length - 1));
            setHoverIndex(Math.max(0, Math.min(points.length - 1, idx)));
          }}
          onTouchMove={(e) => {
            if (!e.touches[0]) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const touchX = ((e.touches[0].clientX - rect.left) / rect.width) * width;
            const clampedX = Math.max(padding.left, Math.min(width - padding.right, touchX));
            const ratio = (clampedX - padding.left) / chartWidth;
            const idx = Math.round(ratio * (points.length - 1));
            setHoverIndex(Math.max(0, Math.min(points.length - 1, idx)));
          }}
          onMouseLeave={() => setHoverIndex(null)}
          onTouchEnd={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + chartHeight * ratio;
            const val = maxPrice - ratio * priceRange;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-stone-500 font-medium"
                >
                  {formatNumber(val, series.assetId === 'usd_brl' ? 2 : 0)}
                </text>
              </g>
            );
          })}

          {/* Fill Area under curve */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Trend Stroke line */}
          <path
            d={pathD}
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Hover crosshair & circle indicator */}
          {hoverIndex !== null && points[hoverIndex] && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={padding.top + chartHeight}
                stroke="#047857"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(points[hoverIndex].price)}
                r="6"
                fill="#ffffff"
                stroke="#047857"
                strokeWidth="3"
                className="drop-shadow-sm"
              />
            </g>
          )}

          {/* X Axis Date Labels */}
          {points.map((p, i) => {
            // Pick 5 to 6 balanced labels
            const step = Math.max(1, Math.floor(points.length / 5));
            if (i % step === 0 || i === points.length - 1) {
              const x = getX(i);
              return (
                <text
                  key={i}
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-[10px] font-medium fill-stone-500"
                >
                  {p.label}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>

      {/* Practical Trend Insight Box for the Coffee Producer */}
      <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-start gap-3 text-xs leading-relaxed text-emerald-950 dark:text-emerald-200">
        <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-emerald-900 dark:text-emerald-300">
            Inteligência de Mercado para Tomada de Decisão:
          </strong>
          {series.trendAnalysis}
        </div>
      </div>
    </div>
  );
};
