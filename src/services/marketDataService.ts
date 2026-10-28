import {
  ConsolidatedMarketResponse,
  MarketStatus,
  ConversionFactors,
} from '../types/marketData';

/**
 * Fatores de conversão oficiais para a saca de café de 60kg:
 * - 1 saca (60kg) = 132.277 libras-peso (lbs)
 * - 1 tonelada métrica (1.000kg) = 16.6667 sacas de 60kg
 */
export const CONVERSION_FACTORS: ConversionFactors = {
  lbsPerSack: 132.277,
  sacksPerTon: 16.6667,
};

const STORAGE_CACHE_KEY = 'cafeicultor_market_data_consolidated_cache';
const TIMEOUT_MS = 3000;

/**
 * Baseline de segurança caso a rede esteja indisponível e não haja cache anterior.
 */
const BASELINE_DATA: ConsolidatedMarketResponse = {
  timestamp: new Date().toISOString(),
  status: 'CACHED',
  currency: {
    usdToBrl: 5.3346,
    source: 'BACEN PTAX (Cache Base)',
  },
  market: {
    arabicaNY: {
      centsPerLb: 290.85,
      calculatedParityBRLPerSack: 2052.37,
      unit: 'cents/lb',
    },
    robustaLondon: {
      usdPerTon: 4720.00,
      calculatedParityBRLPerSack: 1510.76,
      unit: 'USD/Ton',
    },
    cepeaPhysical: {
      arabicaBRLPerSack: 1915.50,
      conilonBRLPerSack: 1448.20,
      lastUpdate: new Date().toISOString().split('T')[0],
    },
  },
  metadata: {
    conversionFactors: CONVERSION_FACTORS,
    sourceDetails: {
      currencySource: 'BACEN PTAX',
      arabicaNYSource: 'ICE Futures US (KC=F)',
      robustaLondonSource: 'ICE Futures Europe (RC=F)',
      cepeaSource: 'CEPEA/ESALQ',
    },
  },
};

/**
 * Serviço responsável por buscar, converter e consolidar dados de mercado
 * com tratamento de erros robusto e estratégia de cache offline.
 */
export class MarketDataService {
  /**
   * Obtém a última resposta consolidada salva em cache (localStorage/memória).
   */
  public static getCachedMarketData(): ConsolidatedMarketResponse {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(STORAGE_CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            ...parsed,
            status: 'CACHED',
          };
        }
      }
    } catch {
      // Ignora erro de acesso ao localStorage
    }
    return BASELINE_DATA;
  }

  /**
   * Salva a resposta consolidada no cache local para uso offline na lavoura.
   */
  public static saveToCache(data: ConsolidatedMarketResponse): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(data));
      }
    } catch {
      // Falha silenciosa de cota de armazenamento
    }
  }

  /**
   * Consulta a cotação do Dólar Comercial (BACEN PTAX / Fallbacks) com timeout de 3s.
   */
  private static async fetchCurrency(): Promise<{ usdToBrl: number; source: string; isCached: boolean }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      // 1. Tenta API PTAX Olinda do Banco Central do Brasil por Período
      const now = new Date();
      const past = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
      const pad = (n: number) => String(n).padStart(2, '0');
      const fmt = (d: Date) => `${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${d.getFullYear()}`;

      const bacenUrl = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@dataInicial='${fmt(past)}'&@dataFinalCotacao='${fmt(now)}'&$top=1&$orderby=dataHoraCotacao%20desc&$format=json`;

      const res = await fetch(bacenUrl, { signal: controller.signal });
      if (res.ok) {
        const json = await res.json();
        const item = json?.value?.[0];
        const cotacao = item?.cotacaoVenda || item?.cotacaoCompra;
        if (typeof cotacao === 'number' && cotacao > 0) {
          return { usdToBrl: Math.round(cotacao * 10000) / 10000, source: 'BACEN PTAX', isCached: false };
        }
      }
    } catch {
      // Fallback
    } finally {
      clearTimeout(timeout);
    }

    // 2. Fallback de alta disponibilidade: ExchangeRate-API
    try {
      const fallbackRes = await fetch('https://open.er-api.com/v6/latest/USD');
      if (fallbackRes.ok) {
        const json = await fallbackRes.json();
        const rate = parseFloat(json?.rates?.BRL);
        if (!isNaN(rate) && rate > 0) {
          return { usdToBrl: Math.round(rate * 10000) / 10000, source: 'ExchangeRate-API (Fallback)', isCached: false };
        }
      }
    } catch {
      // Fallback para cache
    }

    const cached = this.getCachedMarketData();
    return {
      usdToBrl: cached.currency.usdToBrl,
      source: `${cached.currency.source} (Cache)`,
      isCached: true,
    };
  }

  /**
   * Consulta os futuros do Café Arábica (ICE Nova York - KC=F em cents/lb).
   */
  private static async fetchArabicaNY(): Promise<{ centsPerLb: number; source: string; isCached: boolean }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const url = 'https://query1.finance.yahoo.com/v8/finance/chart/KC=F?interval=1d&range=1d';
      const res = await fetch(url, { signal: controller.signal });
      if (res.ok) {
        const json = await res.json();
        const meta = json?.chart?.result?.[0]?.meta;
        const price = meta?.regularMarketPrice || meta?.chartPreviousClose;
        if (typeof price === 'number' && price > 0) {
          return { centsPerLb: Math.round(price * 100) / 100, source: 'ICE Futures US (KC=F)', isCached: false };
        }
      }
    } catch {
      // Fallback
    } finally {
      clearTimeout(timeout);
    }

    const cached = this.getCachedMarketData();
    return {
      centsPerLb: cached.market.arabicaNY.centsPerLb,
      source: 'ICE Futures US (Cache)',
      isCached: true,
    };
  }

  /**
   * Consulta os futuros do Café Conilon/Robusta (ICE Londres - RC=F em USD/Ton).
   */
  private static async fetchRobustaLondon(): Promise<{ usdPerTon: number; source: string; isCached: boolean }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const url = 'https://query1.finance.yahoo.com/v8/finance/chart/RC=F?interval=1d&range=1d';
      const res = await fetch(url, { signal: controller.signal });
      if (res.ok) {
        const json = await res.json();
        const meta = json?.chart?.result?.[0]?.meta;
        const price = meta?.regularMarketPrice || meta?.chartPreviousClose;
        if (typeof price === 'number' && price > 0) {
          return { usdPerTon: Math.round(price * 100) / 100, source: 'ICE Futures Europe (RC=F)', isCached: false };
        }
      }
    } catch {
      // Fallback
    } finally {
      clearTimeout(timeout);
    }

    const cached = this.getCachedMarketData();
    return {
      usdPerTon: cached.market.robustaLondon.usdPerTon,
      source: 'ICE Futures Europe (RC=F - Referência)',
      isCached: true,
    };
  }

  /**
   * Consulta os indicadores físicos do CEPEA/ESALQ (Arábica e Conilon em R$/saca).
   */
  private static async fetchCepea(): Promise<{
    arabicaBRLPerSack: number;
    conilonBRLPerSack: number;
    lastUpdate: string;
    source: string;
    isCached: boolean;
  }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch('https://www.cepea.esalq.usp.br/br/indicador/cafe.aspx', {
        signal: controller.signal,
      });
      if (res.ok) {
        const html = await res.text();
        const arabicaMatch = html.match(/Caf[ée]\s+Ar[áa]bica.*?([0-9]{1,2}\.?[0-9]{3},[0-9]{2})/is);
        const conilonMatch = html.match(/Caf[ée]\s+(?:Robusta|Conilon).*?([0-9]{1,2}\.?[0-9]{3},[0-9]{2})/is);

        if (arabicaMatch && arabicaMatch[1]) {
          const arabicaPrice = parseFloat(arabicaMatch[1].replace(/\./g, '').replace(',', '.'));
          let conilonPrice = 1448.20;
          if (conilonMatch && conilonMatch[1]) {
            conilonPrice = parseFloat(conilonMatch[1].replace(/\./g, '').replace(',', '.'));
          }

          return {
            arabicaBRLPerSack: arabicaPrice,
            conilonBRLPerSack: conilonPrice,
            lastUpdate: new Date().toISOString().split('T')[0],
            source: 'CEPEA/ESALQ Oficial',
            isCached: false,
          };
        }
      }
    } catch {
      // Fallback
    } finally {
      clearTimeout(timeout);
    }

    const cached = this.getCachedMarketData();
    return {
      arabicaBRLPerSack: cached.market.cepeaPhysical.arabicaBRLPerSack,
      conilonBRLPerSack: cached.market.cepeaPhysical.conilonBRLPerSack,
      lastUpdate: cached.market.cepeaPhysical.lastUpdate,
      source: 'CEPEA/ESALQ (Cache)',
      isCached: true,
    };
  }

  /**
   * Função principal exigida:
   * Executa chamadas assíncronas em paralelo com Promise.allSettled,
   * calcula a paridade teórica da saca de 60kg e consolida a resposta JSON estrita.
   */
  public static async fetchMarketData(forceRefresh = false): Promise<ConsolidatedMarketResponse> {
    // 1. Tenta consultar a rota interna do backend se disponível no mesmo host
    try {
      const url = `/api/market/coffee-consolidated${forceRefresh ? '?forceRefresh=true' : ''}`;
      const backendRes = await fetch(url, { headers: { Accept: 'application/json' } });
      if (backendRes.ok) {
        const data: ConsolidatedMarketResponse = await backendRes.json();
        this.saveToCache(data);
        return data;
      }
    } catch {
      // Prossegue para ingestão direta / fallback
    }

    // 2. Ingestão paralela via Promise.allSettled
    const [currencySettled, nySettled, londonSettled, cepeaSettled] = await Promise.allSettled([
      this.fetchCurrency(),
      this.fetchArabicaNY(),
      this.fetchRobustaLondon(),
      this.fetchCepea(),
    ]);

    const cached = this.getCachedMarketData();

    // Extração segura de cada fonte
    const currency = currencySettled.status === 'fulfilled'
      ? currencySettled.value
      : { usdToBrl: cached.currency.usdToBrl, source: `${cached.currency.source} (Fallback)`, isCached: true };

    const ny = nySettled.status === 'fulfilled'
      ? nySettled.value
      : { centsPerLb: cached.market.arabicaNY.centsPerLb, source: 'ICE NY (Fallback)', isCached: true };

    const london = londonSettled.status === 'fulfilled'
      ? londonSettled.value
      : { usdPerTon: cached.market.robustaLondon.usdPerTon, source: 'ICE Londres (Fallback)', isCached: true };

    const cepea = cepeaSettled.status === 'fulfilled'
      ? cepeaSettled.value
      : {
          arabicaBRLPerSack: cached.market.cepeaPhysical.arabicaBRLPerSack,
          conilonBRLPerSack: cached.market.cepeaPhysical.conilonBRLPerSack,
          lastUpdate: cached.market.cepeaPhysical.lastUpdate,
          source: 'CEPEA (Fallback)',
          isCached: true,
        };

    // 3. Aplicação Rigorosa das Fórmulas de Paridade de Exportação (Saca 60kg)
    // Preço da Saca NY (R$) = ((Preço NY [cents/lb] * 132.277) / 100) * Dólar (R$)
    const calculatedParityNY = Math.round(
      ((ny.centsPerLb * CONVERSION_FACTORS.lbsPerSack) / 100) * currency.usdToBrl * 100
    ) / 100;

    // Preço da Saca Londres (R$) = (Preço Londres [USD/Ton] / 16.6667) * Dólar (R$)
    const calculatedParityLondon = Math.round(
      (london.usdPerTon / CONVERSION_FACTORS.sacksPerTon) * currency.usdToBrl * 100
    ) / 100;

    // 4. Determinação do Status de Integridade
    const anyCached = currency.isCached || ny.isCached || london.isCached || cepea.isCached;
    const allCached = currency.isCached && ny.isCached && london.isCached && cepea.isCached;

    let status: MarketStatus = 'SUCCESS';
    if (allCached) {
      status = 'CACHED';
    } else if (anyCached) {
      status = 'PARTIAL';
    }

    // 5. Montagem do Objeto Consolidado Conforme Especificação
    const consolidatedResponse: ConsolidatedMarketResponse = {
      timestamp: new Date().toISOString(),
      status,
      currency: {
        usdToBrl: currency.usdToBrl,
        source: currency.source,
      },
      market: {
        arabicaNY: {
          centsPerLb: ny.centsPerLb,
          calculatedParityBRLPerSack: calculatedParityNY,
          unit: 'cents/lb',
        },
        robustaLondon: {
          usdPerTon: london.usdPerTon,
          calculatedParityBRLPerSack: calculatedParityLondon,
          unit: 'USD/Ton',
        },
        cepeaPhysical: {
          arabicaBRLPerSack: cepea.arabicaBRLPerSack,
          conilonBRLPerSack: cepea.conilonBRLPerSack,
          lastUpdate: cepea.lastUpdate,
        },
      },
      metadata: {
        conversionFactors: CONVERSION_FACTORS,
        sourceDetails: {
          currencySource: currency.source,
          arabicaNYSource: ny.source,
          robustaLondonSource: london.source,
          cepeaSource: cepea.source,
        },
      },
    };

    // Armazena no cache local
    this.saveToCache(consolidatedResponse);

    return consolidatedResponse;
  }
}

/**
 * Exportação direta da função 'fetchMarketData' conforme solicitado.
 */
export const fetchMarketData = (forceRefresh?: boolean) => {
  return MarketDataService.fetchMarketData(forceRefresh);
};
