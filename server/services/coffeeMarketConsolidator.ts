import {
  ConsolidatedCoffeeMarketResponse,
  MarketStatus,
} from '../types/market.types';
import { CONVERSION_FACTORS } from '../config/constants';
import { CurrencyService } from './currencyService';
import { FuturesMarketService } from './futuresMarketService';
import { CepeaService } from './cepeaService';
import { cacheService } from './cacheService';

/**
 * Core Ingestion, Parity Calculation and Consolidation Engine for the Coffee Market.
 * Designed for High Availability and Low Latency on Mobile Agrotech apps.
 */
export class CoffeeMarketConsolidator {
  /**
   * Main orchestrator function: executes parallel async ingestion with Promise.allSettled,
   * performs exact math parity calculations, and generates the unified JSON output.
   *
   * @param forceRefresh - If true, bypasses top-level consolidated cache.
   */
  public static async getConsolidatedMarketData(forceRefresh = false): Promise<ConsolidatedCoffeeMarketResponse> {
    // 1. Check consolidated cache if refresh not forced
    if (!forceRefresh) {
      const cachedResponse = cacheService.getConsolidated();
      if (cachedResponse) {
        return {
          ...cachedResponse,
          status: 'CACHED',
        };
      }
    }

    const upstreamErrors: string[] = [];

    // 2. Execute parallel non-blocking requests with Promise.allSettled
    const [currencyResult, nyResult, londonResult, cepeaResult] = await Promise.allSettled([
      CurrencyService.getUsdToBrl(),
      FuturesMarketService.getArabicaNY(),
      FuturesMarketService.getRobustaLondon(),
      CepeaService.getCepeaPhysicalQuotes(),
    ]);

    // Extract Currency USD/BRL
    let usdToBrl = 5.7640;
    let currencySource = 'FALLBACK';
    let isCurrencyCached = false;

    if (currencyResult.status === 'fulfilled') {
      usdToBrl = currencyResult.value.data.usdToBrl;
      currencySource = currencyResult.value.source;
      isCurrencyCached = !!currencyResult.value.isCached;
    } else {
      upstreamErrors.push(`Currency API: ${currencyResult.reason?.message || 'Rejected'}`);
      const cached = cacheService.getCurrency();
      if (cached) {
        usdToBrl = cached.data.usdToBrl;
        currencySource = `${cached.source} (STALE)`;
        isCurrencyCached = true;
      }
    }

    // Extract Arabica ICE NY (cents/lb)
    let nyCents = 288.65;
    let nySource = 'FALLBACK';
    let isNyCached = false;

    if (nyResult.status === 'fulfilled') {
      nyCents = nyResult.value.data.price;
      nySource = nyResult.value.source;
      isNyCached = !!nyResult.value.isCached;
    } else {
      upstreamErrors.push(`Arabica NY: ${nyResult.reason?.message || 'Rejected'}`);
      const cached = cacheService.getArabicaNY();
      if (cached) {
        nyCents = cached.data.price;
        nySource = `${cached.source} (STALE)`;
        isNyCached = true;
      }
    }

    // Extract Robusta ICE London (USD/Ton)
    let londonUsdPerTon = 4720.00;
    let londonSource = 'FALLBACK';
    let isLondonCached = false;

    if (londonResult.status === 'fulfilled') {
      londonUsdPerTon = londonResult.value.data.price;
      londonSource = londonResult.value.source;
      isLondonCached = !!londonResult.value.isCached;
    } else {
      upstreamErrors.push(`Robusta London: ${londonResult.reason?.message || 'Rejected'}`);
      const cached = cacheService.getRobustaLondon();
      if (cached) {
        londonUsdPerTon = cached.data.price;
        londonSource = `${cached.source} (STALE)`;
        isLondonCached = true;
      }
    }

    // Extract CEPEA Physical Market (R$/saca)
    let cepeaArabica = 1915.50;
    let cepeaConilon = 1448.20;
    let cepeaLastUpdate = new Date().toISOString().split('T')[0];
    let cepeaSource = 'FALLBACK';
    let isCepeaCached = false;

    if (cepeaResult.status === 'fulfilled') {
      cepeaArabica = cepeaResult.value.data.arabicaBRLPerSack;
      cepeaConilon = cepeaResult.value.data.conilonBRLPerSack;
      cepeaLastUpdate = cepeaResult.value.data.lastUpdate;
      cepeaSource = cepeaResult.value.source;
      isCepeaCached = !!cepeaResult.value.isCached;
    } else {
      upstreamErrors.push(`CEPEA Physical: ${cepeaResult.reason?.message || 'Rejected'}`);
      const cached = cacheService.getCepea();
      if (cached) {
        cepeaArabica = cached.data.arabicaBRLPerSack;
        cepeaConilon = cached.data.conilonBRLPerSack;
        cepeaLastUpdate = cached.data.lastUpdate;
        cepeaSource = `${cached.source} (STALE)`;
        isCepeaCached = true;
      }
    }

    // 3. Business Logic & Parity Calculations
    // Formula 1: Arabica NY Parity
    // Preço da Saca (R$) = ((Preço NY (cents/lb) * 132.277) / 100) * Dólar (R$)
    const arabicaCalculatedParity = Math.round(
      ((nyCents * CONVERSION_FACTORS.lbsPerSack) / 100) * usdToBrl * 100
    ) / 100;

    // Formula 2: Robusta London Parity
    // Preço da Saca (R$) = (Preço Londres (USD/Ton) / 16.6667) * Dólar (R$)
    const robustaCalculatedParity = Math.round(
      (londonUsdPerTon / CONVERSION_FACTORS.sacksPerTon) * usdToBrl * 100
    ) / 100;

    // 4. Determine Status
    const anyCached = isCurrencyCached || isNyCached || isLondonCached || isCepeaCached;
    const allCached = isCurrencyCached && isNyCached && isLondonCached && isCepeaCached;

    let status: MarketStatus = 'SUCCESS';
    if (upstreamErrors.length > 0 && allCached) {
      status = 'CACHED';
    } else if (anyCached || upstreamErrors.length > 0) {
      status = 'PARTIAL';
    }

    // 5. Build Unified Response Matching JSON Specification
    const response: ConsolidatedCoffeeMarketResponse = {
      timestamp: new Date().toISOString(),
      status,
      currency: {
        usdToBrl,
        source: currencySource,
      },
      market: {
        arabicaNY: {
          centsPerLb: nyCents,
          calculatedParityBRLPerSack: arabicaCalculatedParity,
          unit: 'cents/lb',
        },
        robustaLondon: {
          usdPerTon: londonUsdPerTon,
          calculatedParityBRLPerSack: robustaCalculatedParity,
          unit: 'USD/Ton',
        },
        cepeaPhysical: {
          arabicaBRLPerSack: cepeaArabica,
          conilonBRLPerSack: cepeaConilon,
          lastUpdate: cepeaLastUpdate,
        },
      },
      metadata: {
        conversionFactors: CONVERSION_FACTORS,
        sourceDetails: {
          currencySource,
          arabicaNYSource: nySource,
          robustaLondonSource: londonSource,
          cepeaSource,
          upstreamErrors: upstreamErrors.length > 0 ? upstreamErrors : undefined,
        },
      },
    };

    // Store in consolidated cache
    cacheService.setConsolidated(response);

    return response;
  }
}
