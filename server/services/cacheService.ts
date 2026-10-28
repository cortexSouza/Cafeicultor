import {
  ConsolidatedCoffeeMarketResponse,
  UpstreamCurrency,
  UpstreamFutureQuote,
  UpstreamCepeaQuotes,
} from '../types/market.types';
import { CACHE_TTL_MS, BASELINE_FALLBACK } from '../config/constants';

interface CacheEntry<T> {
  data: T;
  source: string;
  timestamp: number;
}

/**
 * High-performance Cache Layer.
 * Ensures zero-downtime for mobile clients even during severe network instability on rural cellular connections.
 */
class CacheService {
  private consolidatedCache: CacheEntry<ConsolidatedCoffeeMarketResponse> | null = null;
  private currencyCache: CacheEntry<UpstreamCurrency> | null = null;
  private arabicaNYCache: CacheEntry<UpstreamFutureQuote> | null = null;
  private robustaLondonCache: CacheEntry<UpstreamFutureQuote> | null = null;
  private cepeaCache: CacheEntry<UpstreamCepeaQuotes> | null = null;

  constructor() {
    // Seed with baseline fallbacks to guarantee immediate data readiness
    this.currencyCache = {
      data: { usdToBrl: BASELINE_FALLBACK.currency.usdToBrl },
      source: BASELINE_FALLBACK.currency.source,
      timestamp: Date.now(),
    };
    this.arabicaNYCache = {
      data: { price: BASELINE_FALLBACK.arabicaNY.centsPerLb, symbol: 'KC=F', exchange: 'ICE US' },
      source: BASELINE_FALLBACK.arabicaNY.source,
      timestamp: Date.now(),
    };
    this.robustaLondonCache = {
      data: { price: BASELINE_FALLBACK.robustaLondon.usdPerTon, symbol: 'RC=F', exchange: 'ICE Europe' },
      source: BASELINE_FALLBACK.robustaLondon.source,
      timestamp: Date.now(),
    };
    this.cepeaCache = {
      data: {
        arabicaBRLPerSack: BASELINE_FALLBACK.cepea.arabicaBRLPerSack,
        conilonBRLPerSack: BASELINE_FALLBACK.cepea.conilonBRLPerSack,
        lastUpdate: BASELINE_FALLBACK.cepea.lastUpdate,
      },
      source: BASELINE_FALLBACK.cepea.source,
      timestamp: Date.now(),
    };
  }

  // --- Consolidated Response Cache ---
  public getConsolidated(): ConsolidatedCoffeeMarketResponse | null {
    if (!this.consolidatedCache) return null;
    const isExpired = Date.now() - this.consolidatedCache.timestamp > CACHE_TTL_MS;
    if (isExpired) return null;
    return this.consolidatedCache.data;
  }

  public getStaleConsolidated(): ConsolidatedCoffeeMarketResponse | null {
    return this.consolidatedCache ? this.consolidatedCache.data : null;
  }

  public setConsolidated(data: ConsolidatedCoffeeMarketResponse): void {
    this.consolidatedCache = {
      data,
      source: 'CONSOLIDATED_CACHE',
      timestamp: Date.now(),
    };
  }

  // --- Currency Cache ---
  public getCurrency(): CacheEntry<UpstreamCurrency> | null {
    return this.currencyCache;
  }

  public setCurrency(data: UpstreamCurrency, source: string): void {
    this.currencyCache = {
      data,
      source,
      timestamp: Date.now(),
    };
  }

  // --- Arabica NY Cache ---
  public getArabicaNY(): CacheEntry<UpstreamFutureQuote> | null {
    return this.arabicaNYCache;
  }

  public setArabicaNY(data: UpstreamFutureQuote, source: string): void {
    this.arabicaNYCache = {
      data,
      source,
      timestamp: Date.now(),
    };
  }

  // --- Robusta London Cache ---
  public getRobustaLondon(): CacheEntry<UpstreamFutureQuote> | null {
    return this.robustaLondonCache;
  }

  public setRobustaLondon(data: UpstreamFutureQuote, source: string): void {
    this.robustaLondonCache = {
      data,
      source,
      timestamp: Date.now(),
    };
  }

  // --- CEPEA Cache ---
  public getCepea(): CacheEntry<UpstreamCepeaQuotes> | null {
    return this.cepeaCache;
  }

  public setCepea(data: UpstreamCepeaQuotes, source: string): void {
    this.cepeaCache = {
      data,
      source,
      timestamp: Date.now(),
    };
  }
}

export const cacheService = new CacheService();
