import React from 'react';
import {
  Sun,
  RefreshCw,
  Bell,
  Wifi,
  WifiOff,
  TrendingUp,
  MapPin,
  Calculator,
  Newspaper,
  Download,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'quotes' | 'regional' | 'calculator' | 'news';
  setActiveTab: (tab: 'quotes' | 'regional' | 'calculator' | 'news') => void;
  isOnline: boolean;
  lastSyncTime: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  onOpenAlerts: () => void;
  alertCount: number;
  triggeredAlertCount: number;
  onOpenInstallModal?: () => void;
  onOpenApiConsole?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  lastSyncTime,
  isRefreshing,
  onRefresh,
  highContrast,
  onToggleHighContrast,
  onOpenAlerts,
  alertCount,
  triggeredAlertCount,
  onOpenInstallModal,
  onOpenApiConsole,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      {/* Primary Top Bar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-inner font-bold text-lg">
            ☕
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white leading-none">
              Cafeicultor
            </span>
            <span className="text-[11px] text-stone-400 font-medium tracking-wide">
              Inteligência de Mercado & Cotações
            </span>
          </div>
        </div>

        {/* Center Zone: Desktop / Tablet Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-800/80 p-1 rounded-xl border border-stone-700/60">
          <button
            onClick={() => setActiveTab('quotes')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'quotes'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Cotações em Tempo Real
          </button>

          <button
            onClick={() => setActiveTab('regional')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'regional'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Praças & Regiões
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Simulador de Venda
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'news'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            Notícias & Clima
          </button>
        </nav>

        {/* Right Zone: Controls & Offline Status */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Online / Offline status badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
              isOnline
                ? 'bg-emerald-950/60 border-emerald-700/40 text-emerald-300'
                : 'bg-amber-950/70 border-amber-600/50 text-amber-200'
            }`}
            title={isOnline ? 'Conexão ativa com bolsas e CEPEA' : 'Modo Campo: dados gravados na memória'}
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{isOnline ? `Sync: ${lastSyncTime}` : 'Modo Campo (Offline)'}</span>
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 rounded-lg text-xs font-medium transition active:scale-95 disabled:opacity-50"
            title="Atualizar cotações agora"
            aria-label="Atualizar cotações"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden xl:inline">Atualizar</span>
          </button>

          {/* High Contrast Field Mode Toggle (Outdoor daylight helper) */}
          <button
            onClick={onToggleHighContrast}
            className={`p-2 rounded-lg text-xs font-medium border transition ${
              highContrast
                ? 'bg-amber-400 border-amber-300 text-stone-950 shadow-sm'
                : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-300'
            }`}
            title="Modo Sol Forte (Alto contraste para uso no cafezal)"
            aria-label="Alternar Modo Sol Forte"
          >
            <Sun className="w-4 h-4" />
          </button>

          {/* Price Alerts Bell Button */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 transition"
            title="Gerenciar Alertas de Trava e Preço"
            aria-label="Alertas de Preço"
          >
            <Bell className="w-4 h-4" />
            {triggeredAlertCount > 0 ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {triggeredAlertCount}
              </span>
            ) : alertCount > 0 ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                {alertCount}
              </span>
            ) : null}
          </button>

          {/* API Backend Console trigger button */}
          {onOpenApiConsole && (
            <button
              onClick={onOpenApiConsole}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-emerald-400 rounded-lg text-xs font-mono font-medium transition"
              title="Testar Microsserviço de Ingestão e Cálculo JSON"
            >
              <span>{'{ }'}</span>
              <span className="hidden xl:inline">API Backend</span>
            </button>
          )}

          {/* PWA Install Trigger button */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow transition"
              title="Instalar no Celular"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
