import { useState, useEffect, useCallback } from 'react';
import {
  Quotation,
  RegionalMarket,
  PriceAlert,
  SaleSimulation,
} from '../types/market';
import {
  INITIAL_QUOTATIONS,
  REGIONAL_MARKETS,
  LBS_PER_BAG,
} from '../data/mockMarketData';
import { storageService } from '../services/storageService';
import { fetchMarketData } from '../services/marketDataService';

export function useMarketData() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    return storageService.getQuotations();
  });

  const [regionalMarkets, setRegionalMarkets] = useState<RegionalMarket[]>(() => {
    return storageService.getRegionalMarkets();
  });

  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    return storageService.getAlerts();
  });

  const [simulations, setSimulations] = useState<SaleSimulation[]>(() => {
    return storageService.getSavedSimulations();
  });

  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    const cached = storageService.getLastSyncDate();
    if (cached) {
      const d = new Date(cached);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return '17:15';
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationBanner, setNotificationBanner] = useState<{ message: string; type: 'info' | 'success' | 'alert' } | null>(null);

  // Monitor online / offline network state
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNotificationBanner({
        message: 'Conexão restabelecida! Atualizando cotações...',
        type: 'success',
      });
      setTimeout(() => setNotificationBanner(null), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNotificationBanner({
        message: 'Modo Offline ativado. Exibindo dados salvos em cache na lavoura.',
        type: 'info',
      });
      setTimeout(() => setNotificationBanner(null), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check alerts against current prices
  const checkAlerts = useCallback((currentQuotes: Quotation[], currentRegional: RegionalMarket[]) => {
    const updatedAlerts = alerts.map(alert => {
      if (!alert.isActive || alert.isTriggered) return alert;

      let currentVal = 0;
      if (alert.targetAsset === 'cepea_arabica') {
        currentVal = currentQuotes.find(q => q.id === 'cepea_arabica')?.price || 0;
      } else if (alert.targetAsset === 'cepea_conilon') {
        currentVal = currentQuotes.find(q => q.id === 'cepea_conilon')?.price || 0;
      } else if (alert.targetAsset === 'ice_ny') {
        currentVal = currentQuotes.find(q => q.id === 'ice_ny')?.price || 0;
      } else if (alert.targetAsset === 'b3_icf') {
        currentVal = currentQuotes.find(q => q.id === 'b3_icf')?.price || 0;
      } else if (alert.targetAsset === 'usd_brl') {
        currentVal = currentQuotes.find(q => q.id === 'usd_brl')?.price || 0;
      } else if (alert.targetAsset === 'regional_sul_minas') {
        currentVal = currentRegional.find(r => r.id === 'reg_sul_minas_dura')?.avgPrice || 0;
      }

      let triggered = false;
      if (alert.condition === 'above' && currentVal >= alert.targetValue) {
        triggered = true;
      } else if (alert.condition === 'below' && currentVal <= alert.targetValue) {
        triggered = true;
      }

      if (triggered) {
        // Trigger browser notification if supported and granted
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`🚨 Alerta de Preço: ${alert.title}`, {
              body: `${alert.targetAssetName} atingiu ${currentVal} ${alert.unit}! Meta era ${alert.targetValue}.`,
              icon: '/favicon.ico',
            });
          } catch {
            // ignore
          }
        }

        setNotificationBanner({
          message: `🚨 Alerta disparado: ${alert.title} atingiu ${currentVal.toLocaleString('pt-BR')} ${alert.unit}!`,
          type: 'alert',
        });

        return {
          ...alert,
          isTriggered: true,
          triggeredAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
      }

      return alert;
    });

    setAlerts(updatedAlerts);
    storageService.saveAlerts(updatedAlerts);
  }, [alerts]);

  // Refresh market data (queries the backend ingestion service with fallback)
  const refreshMarketData = useCallback(async () => {
    setIsRefreshing(true);

    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    try {
      // 1. Consulta consolidada via fetchMarketData (Promise.allSettled + Paridades + Fallback Cache)
      const json = await fetchMarketData(true);

      if (json && json.currency && json.market) {
        const usdRate = json.currency.usdToBrl || 5.764;
        const nyCents = json.market.arabicaNY.centsPerLb || 288.65;
        const nyParity = json.market.arabicaNY.calculatedParityBRLPerSack || 2199.78;
        const londonUsd = json.market.robustaLondon.usdPerTon || 4720.00;
        const londonParity = json.market.robustaLondon.calculatedParityBRLPerSack || 1632.36;
        const cepeaAra = json.market.cepeaPhysical.arabicaBRLPerSack || 1915.50;
        const cepeaCon = json.market.cepeaPhysical.conilonBRLPerSack || 1448.20;

        const updatedQuotes = quotations.map(q => {
          if (q.id === 'usd_brl') {
            return {
              ...q,
              price: usdRate,
              lastUpdated: `Hoje, ${nowTime} (${json.currency.source})`,
            };
          }
          if (q.id === 'ice_ny') {
            return {
              ...q,
              price: nyCents,
              convertedPriceBRL: nyParity,
              lastUpdated: `Hoje, ${nowTime} (${json.metadata.sourceDetails?.arabicaNYSource || 'ICE US'})`,
            };
          }
          if (q.id === 'ice_london') {
            return {
              ...q,
              price: londonUsd,
              convertedPriceBRL: londonParity,
              lastUpdated: `Hoje, ${nowTime} (${json.metadata.sourceDetails?.robustaLondonSource || 'ICE Europe'})`,
            };
          }
          if (q.id === 'cepea_arabica') {
            return {
              ...q,
              price: cepeaAra,
              convertedPriceBRL: cepeaAra,
              lastUpdated: `Hoje, ${nowTime} (CEPEA/ESALQ)`,
            };
          }
          if (q.id === 'cepea_conilon') {
            return {
              ...q,
              price: cepeaCon,
              convertedPriceBRL: cepeaCon,
              lastUpdated: `Hoje, ${nowTime} (CEPEA/ESALQ)`,
            };
          }
          if (q.id === 'b3_icf') {
            return {
              ...q,
              convertedPriceBRL: Math.round(q.price * usdRate * 100) / 100,
              lastUpdated: `Hoje, ${nowTime}`,
            };
          }
          return q;
        });

        setQuotations(updatedQuotes);
        storageService.saveQuotations(updatedQuotes);
        setLastSyncTime(nowTime);
        checkAlerts(updatedQuotes, regionalMarkets);
        setIsRefreshing(false);
        return;
      }
    } catch {
      // Fallback
    }

    // Fallback: simulation jitter for offline demonstration
    await new Promise(resolve => setTimeout(resolve, 350));
    setLastSyncTime(nowTime);

    const usdQuote = quotations.find(q => q.id === 'usd_brl');
    const currentUsd = usdQuote ? usdQuote.price : 5.764;

    const newQuotes = quotations.map(q => {
      const deltaFactor = 1 + (Math.random() * 0.004 - 0.002);
      let newPrice = Math.round(q.price * deltaFactor * 100) / 100;
      if (q.category === 'currency') {
        newPrice = Math.round(q.price * deltaFactor * 10000) / 10000;
      }

      const diff = Math.round((newPrice - q.previousClose) * 100) / 100;
      const pct = Math.round(((newPrice - q.previousClose) / q.previousClose) * 10000) / 100;

      let convertedBRL = newPrice;
      if (q.id === 'ice_ny') {
        convertedBRL = Math.round((newPrice / 100) * LBS_PER_BAG * currentUsd * 100) / 100;
      } else if (q.id === 'ice_london') {
        convertedBRL = Math.round(newPrice * 0.06 * currentUsd * 100) / 100;
      } else if (q.id === 'b3_icf') {
        convertedBRL = Math.round(newPrice * currentUsd * 100) / 100;
      }

      return {
        ...q,
        price: newPrice,
        changeValue: diff,
        changePercent: pct,
        high: Math.max(q.high, newPrice),
        low: Math.min(q.low, newPrice),
        convertedPriceBRL: convertedBRL,
        lastUpdated: `Hoje, ${nowTime}`,
      };
    });

    setQuotations(newQuotes);
    storageService.saveQuotations(newQuotes);
    checkAlerts(newQuotes, regionalMarkets);
    setIsRefreshing(false);
  }, [quotations, regionalMarkets, checkAlerts]);

  // Sincronização inicial automática ao abrir o app
  useEffect(() => {
    refreshMarketData();
  }, []);

  // Alert management
  const addAlert = (newAlert: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered'>) => {
    const alert: PriceAlert = {
      ...newAlert,
      id: `alert_${Date.now()}`,
      createdAt: 'Hoje',
      isTriggered: false,
    };
    const updated = [alert, ...alerts];
    setAlerts(updated);
    storageService.saveAlerts(updated);
    setNotificationBanner({
      message: `Alerta "${alert.title}" criado com sucesso!`,
      type: 'success',
    });
    setTimeout(() => setNotificationBanner(null), 3000);
  };

  const toggleAlert = (id: string) => {
    const updated = alerts.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a);
    setAlerts(updated);
    storageService.saveAlerts(updated);
  };

  const removeAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    storageService.saveAlerts(updated);
  };

  const resetAlertTrigger = (id: string) => {
    const updated = alerts.map(a => a.id === id ? { ...a, isTriggered: false, triggeredAt: undefined } : a);
    setAlerts(updated);
    storageService.saveAlerts(updated);
  };

  // Simulation management
  const saveSimulation = (sim: SaleSimulation) => {
    const updated = storageService.saveSimulation(sim);
    setSimulations(updated);
    setNotificationBanner({
      message: 'Simulação salva no histórico da fazenda!',
      type: 'success',
    });
    setTimeout(() => setNotificationBanner(null), 3000);
  };

  const deleteSimulation = (id: string) => {
    const updated = storageService.deleteSimulation(id);
    setSimulations(updated);
  };

  return {
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
    setNotificationBanner,
  };
}
