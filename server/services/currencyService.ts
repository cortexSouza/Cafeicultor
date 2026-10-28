import { UpstreamCurrency, UpstreamResult } from '../types/market.types';
import { ENDPOINTS, UPSTREAM_TIMEOUT_MS } from '../config/constants';
import { cacheService } from './cacheService';

/**
 * Service responsible for fetching real-time and daily PTAX USD/BRL commercial currency rate.
 */
export class CurrencyService {
  /**
   * Main entry point: tries BACEN PTAX -> Fallback to ExchangeRate/Frankfurter -> AwesomeAPI -> Cache.
   */
  public static async getUsdToBrl(): Promise<UpstreamResult<UpstreamCurrency>> {
    // 1. Try Primary: BACEN PTAX (Official Brazilian Central Bank)
    try {
      const bacenResult = await this.fetchBacenPtax();
      if (bacenResult && bacenResult.usdToBrl > 0) {
        cacheService.setCurrency(bacenResult, 'BACEN PTAX');
        return {
          success: true,
          data: bacenResult,
          source: 'BACEN PTAX',
          isCached: false,
        };
      }
    } catch {
      // Graceful fallback without breaking error budgets
    }

    // 2. Try Fallback 1: High-availability ExchangeRate API (Unthrottled)
    try {
      const erResult = await this.fetchExchangeRateApi();
      if (erResult && erResult.usdToBrl > 0) {
        cacheService.setCurrency(erResult, 'ExchangeRate-API');
        return {
          success: true,
          data: erResult,
          source: 'ExchangeRate-API',
          isCached: false,
        };
      }
    } catch {
      // Continue to next fallback
    }

    // 3. Try Fallback 2: Frankfurter API (European Central Bank mirror)
    try {
      const frankfurterResult = await this.fetchFrankfurterApi();
      if (frankfurterResult && frankfurterResult.usdToBrl > 0) {
        cacheService.setCurrency(frankfurterResult, 'Frankfurter (ECB)');
        return {
          success: true,
          data: frankfurterResult,
          source: 'Frankfurter (ECB)',
          isCached: false,
        };
      }
    } catch {
      // Continue to next fallback
    }

    // 4. Try Fallback 3: AwesomeAPI (Real-time commercial dollar, handles 429 rate limit safely)
    try {
      const awesomeResult = await this.fetchAwesomeApi();
      if (awesomeResult && awesomeResult.usdToBrl > 0) {
        cacheService.setCurrency(awesomeResult, 'AwesomeAPI (USD/BRL Comercial)');
        return {
          success: true,
          data: awesomeResult,
          source: 'AwesomeAPI (USD/BRL Comercial)',
          isCached: false,
        };
      }
    } catch {
      // Proceed to cache
    }

    // 5. Final Fallback: Local Cache
    const cached = cacheService.getCurrency();
    if (cached) {
      return {
        success: true,
        data: cached.data,
        source: `${cached.source} (CACHED)`,
        isCached: true,
      };
    }

    // Emergency safety net
    return {
      success: false,
      data: { usdToBrl: 5.7640 },
      source: 'EMERGENCY_FALLBACK',
      isCached: true,
      error: 'All currency providers failed or timed out.',
    };
  }

  /**
   * Primary Source: BACEN PTAX
   * Calls BCB Olinda OData API with Period query (MM-DD-YYYY range)
   * This guarantees that it always returns the latest published PTAX closing rate,
   * even outside banking hours, holidays, or early morning.
   */
  private static async fetchBacenPtax(): Promise<UpstreamCurrency | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    try {
      const now = new Date();
      const past = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days window

      const pad = (n: number) => String(n).padStart(2, '0');
      const fmt = (d: Date) => `${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${d.getFullYear()}`;

      const dataInicial = `'${fmt(past)}'`;
      const dataFinal = `'${fmt(now)}'`;

      const url = `${ENDPOINTS.BACEN_PTAX_PERIODO}?@dataInicial=${dataInicial}&@dataFinalCotacao=${dataFinal}&$top=1&$orderby=dataHoraCotacao%20desc&$format=json`;

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`BACEN HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json && json.value && json.value.length > 0) {
        const item = json.value[0];
        const cotacaoVenda = item.cotacaoVenda || item.cotacaoCompra;
        if (typeof cotacaoVenda === 'number' && cotacaoVenda > 0) {
          return { usdToBrl: Math.round(cotacaoVenda * 10000) / 10000 };
        }
      }

      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Fallback 1: ExchangeRate API
   */
  private static async fetchExchangeRateApi(): Promise<UpstreamCurrency | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    try {
      const res = await fetch(ENDPOINTS.EXCHANGE_RATE_API, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      if (json && json.rates && json.rates.BRL) {
        const rate = parseFloat(json.rates.BRL);
        if (!isNaN(rate) && rate > 0) {
          return { usdToBrl: Math.round(rate * 10000) / 10000 };
        }
      }

      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Fallback 2: Frankfurter API (European Central Bank)
   */
  private static async fetchFrankfurterApi(): Promise<UpstreamCurrency | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    try {
      const res = await fetch(ENDPOINTS.FRANKFURTER_API, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      if (json && json.rates && json.rates.BRL) {
        const rate = parseFloat(json.rates.BRL);
        if (!isNaN(rate) && rate > 0) {
          return { usdToBrl: Math.round(rate * 10000) / 10000 };
        }
      }

      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Fallback 3: AwesomeAPI (USD-BRL)
   * Safely handles HTTP 429 without throwing or logging alarm warnings.
   */
  private static async fetchAwesomeApi(): Promise<UpstreamCurrency | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    try {
      const res = await fetch(ENDPOINTS.AWESOME_API_USD, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });

      if (res.status === 429 || !res.ok) {
        // Return null silently so other fallbacks take over seamlessly
        return null;
      }

      const json = await res.json();
      if (json && json.USDBRL && json.USDBRL.bid) {
        const bid = parseFloat(json.USDBRL.bid);
        if (!isNaN(bid) && bid > 0) {
          return { usdToBrl: Math.round(bid * 10000) / 10000 };
        }
      }

      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
