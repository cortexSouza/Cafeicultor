import {
  Quotation,
  RegionalMarket,
  SaleSimulation,
  PriceAlert,
  MarketNewsItem,
} from '../types/market';
import {
  INITIAL_QUOTATIONS,
  REGIONAL_MARKETS,
  INITIAL_PRICE_ALERTS,
  MARKET_NEWS,
} from '../data/mockMarketData';

const STORAGE_KEYS = {
  QUOTATIONS: 'cafeicultor_quotations_cache',
  REGIONAL_MARKETS: 'cafeicultor_regional_cache',
  LAST_SYNC: 'cafeicultor_last_sync_timestamp',
  ALERTS: 'cafeicultor_price_alerts',
  SIMULATIONS: 'cafeicultor_sale_simulations',
  HIGH_CONTRAST: 'cafeicultor_daylight_contrast',
  FAVORITE_REGIONS: 'cafeicultor_favorite_regions',
  PREFERRED_CURRENCY_USD_BRL: 'cafeicultor_pref_usd_brl',
};

export const storageService = {
  getQuotations(): Quotation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return INITIAL_QUOTATIONS;
  },

  saveQuotations(quotes: Quotation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotes));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  getLastSyncDate(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch {
      return null;
    }
  },

  getRegionalMarkets(): RegionalMarket[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REGIONAL_MARKETS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return REGIONAL_MARKETS;
  },

  saveRegionalMarkets(markets: RegionalMarket[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REGIONAL_MARKETS, JSON.stringify(markets));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  getAlerts(): PriceAlert[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return INITIAL_PRICE_ALERTS;
  },

  saveAlerts(alerts: PriceAlert[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  getSavedSimulations(): SaleSimulation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SIMULATIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return [];
  },

  saveSimulation(sim: SaleSimulation): SaleSimulation[] {
    const list = this.getSavedSimulations();
    const updated = [sim, ...list.filter(s => s.id !== sim.id)].slice(0, 30);
    try {
      localStorage.setItem(STORAGE_KEYS.SIMULATIONS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage error:', e);
    }
    return updated;
  },

  deleteSimulation(id: string): SaleSimulation[] {
    const list = this.getSavedSimulations().filter(s => s.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.SIMULATIONS, JSON.stringify(list));
    } catch (e) {
      console.warn('Storage error:', e);
    }
    return list;
  },

  getHighContrast(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST) === 'true';
    } catch {
      return false;
    }
  },

  setHighContrast(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, enabled ? 'true' : 'false');
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  getFavoriteRegions(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITE_REGIONS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return ['reg_sul_minas_dura', 'reg_cerrado_mineiro', 'reg_es_conilon'];
  },

  saveFavoriteRegions(ids: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITE_REGIONS, JSON.stringify(ids));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },
};
