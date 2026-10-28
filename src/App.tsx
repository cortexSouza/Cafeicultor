import React, { useState } from 'react';
import {
  TrendingUp,
  MapPin,
  Calculator,
  Newspaper,
  WifiOff,
  Bell,
  Sun,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useMarketData } from './hooks/useMarketData';
import { storageService } from './services/storageService';
import { Header } from './components/Header';
import { QuotesPanel } from './components/QuotesPanel';
import { RegionalFilter } from './components/RegionalFilter';
import { SaleCalculator } from './components/SaleCalculator';
import { MarketNewsFeed } from './components/MarketNewsFeed';
import { PriceAlertsModal } from './components/PriceAlertsModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { ApiConsoleModal } from './components/ApiConsoleModal';
import { Quotation } from './types/market';

export default function App() {
  const {
    isOnline,
    quotations,
    regionalMarkets,
    alerts,
    simulations,
    lastSyncTime,
    isRefreshing,
    notificationBanner,
    refreshMarketData,
    addAlert,
    toggleAlert,
    removeAlert,
    resetAlertTrigger,
    saveSimulation,
    deleteSimulation,
  } = useMarketData();

  const [activeTab, setActiveTab] = useState<'quotes' | 'regional' | 'calculator' | 'news'>('quotes');
  const [highContrast, setHighContrast] = useState<boolean>(() => storageService.getHighContrast());
  const [selectedQuoteForCalc, setSelectedQuoteForCalc] = useState<Quotation | null>(null);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isApiConsoleOpen, setIsApiConsoleOpen] = useState(false);

  const toggleHighContrast = () => {
    const nextVal = !highContrast;
    setHighContrast(nextVal);
    storageService.setHighContrast(nextVal);
  };

  const handleSelectForCalculator = (quote: Quotation) => {
    setSelectedQuoteForCalc(quote);
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggeredAlertsCount = alerts.filter(a => a.isTriggered).length;

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      highContrast
        ? 'bg-stone-200 text-black high-contrast-field'
        : 'bg-stone-100 text-stone-900 dark:bg-stone-950 dark:text-stone-100'
    }`}>
      {/* Top Application Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        lastSyncTime={lastSyncTime}
        isRefreshing={isRefreshing}
        onRefresh={refreshMarketData}
        highContrast={highContrast}
        onToggleHighContrast={toggleHighContrast}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        alertCount={alerts.length}
        triggeredAlertCount={triggeredAlertsCount}
        onOpenInstallModal={() => setIsInstallOpen(true)}
        onOpenApiConsole={() => setIsApiConsoleOpen(true)}
      />

      {/* Offline Mode Alert Banner (RNF-MVP-02: Modo Campo / Sem internet na lavoura) */}
      {!isOnline && (
        <div className="bg-amber-600 text-amber-950 font-medium px-4 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2 border-b border-amber-700 shadow-inner">
          <WifiOff className="w-4 h-4 text-amber-950 shrink-0" />
          <span>
            <strong>Modo Campo (Offline):</strong> Sem conexão no cafezal. Exibindo últimas cotações salvas em cache às <strong>{lastSyncTime}</strong>.
          </span>
        </div>
      )}

      {/* Floating System / Alert Toast */}
      {notificationBanner && (
        <div className="fixed top-20 right-4 z-50 max-w-sm rounded-xl p-3.5 shadow-xl border bg-stone-900 text-white border-stone-700 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
          {notificationBanner.type === 'alert' ? (
            <Bell className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          ) : notificationBanner.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 leading-snug font-medium">
            {notificationBanner.message}
          </div>
        </div>
      )}

      {/* Main Viewport Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 pb-28 md:pb-12">
        {activeTab === 'quotes' && (
          <QuotesPanel
            quotations={quotations}
            onSelectForCalculator={handleSelectForCalculator}
            highContrast={highContrast}
            onOpenAlertsForAsset={() => setIsAlertsOpen(true)}
          />
        )}

        {activeTab === 'regional' && (
          <RegionalFilter
            regionalMarkets={regionalMarkets}
            onSelectForCalculator={handleSelectForCalculator}
            highContrast={highContrast}
          />
        )}

        {activeTab === 'calculator' && (
          <SaleCalculator
            initialQuote={selectedQuoteForCalc}
            savedSimulations={simulations}
            onSaveSimulation={saveSimulation}
            onDeleteSimulation={deleteSimulation}
            highContrast={highContrast}
          />
        )}

        {activeTab === 'news' && (
          <MarketNewsFeed highContrast={highContrast} />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Thumb ergonomic zone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 pb-safe shadow-lg">
        <div className="grid grid-cols-4 items-center h-16 px-1">
          <button
            onClick={() => setActiveTab('quotes')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition ${
              activeTab === 'quotes'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Cotações</span>
          </button>

          <button
            onClick={() => setActiveTab('regional')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition ${
              activeTab === 'regional'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Praças</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition ${
              activeTab === 'calculator'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
          >
            <Calculator className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Simulador</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition ${
              activeTab === 'news'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
          >
            <Newspaper className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Notícias</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <PriceAlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onAddAlert={addAlert}
        onToggleAlert={toggleAlert}
        onRemoveAlert={removeAlert}
        onResetTrigger={resetAlertTrigger}
        highContrast={highContrast}
      />

      <PWAInstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />

      <ApiConsoleModal
        isOpen={isApiConsoleOpen}
        onClose={() => setIsApiConsoleOpen(false)}
      />
    </div>
  );
}
