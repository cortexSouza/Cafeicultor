import { ConversionFactors } from '../types/market.types';

/**
 * Standard Brazilian Agrotech Commodity Conversion Factors
 * 1 Coffee Sack = 60 kg = 132.277 lbs
 * 1 Metric Ton = 1,000 kg = 16.6667 sacks (60kg)
 */
export const CONVERSION_FACTORS: ConversionFactors = {
  lbsPerSack: 132.277,
  sacksPerTon: 16.6667,
};

/**
 * Resilient Timeout in Milliseconds for all external upstream calls.
 * If an external API does not respond within this window, fallback to cached data.
 */
export const UPSTREAM_TIMEOUT_MS = 3000;

/**
 * Cache TTL in Milliseconds (e.g. 5 minutes for financial data)
 */
export const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Public API Endpoints
 */
export const ENDPOINTS = {
  // Banco Central do Brasil - PTAX por Período (Sempre retorna a cotação oficial mais recente sem falhar fora do horário bancário)
  BACEN_PTAX_PERIODO: 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)',
  // ExchangeRate API public mirror (Alta disponibilidade sem rate-limit agressivo)
  EXCHANGE_RATE_API: 'https://open.er-api.com/v6/latest/USD',
  // Frankfurter API
  FRANKFURTER_API: 'https://api.frankfurter.app/latest?from=USD&to=BRL',
  // AwesomeAPI - Dólar Comercial
  AWESOME_API_USD: 'https://economia.awesomeapi.com.br/last/USD-BRL',
  // CEPEA Coffee physical market page
  CEPEA_BASE_URL: 'https://www.cepea.esalq.usp.br/br/indicador/cafe.aspx',
};

/**
 * Baseline Emergency Data:
 * Guaranteed fallback if external services are completely unreachable and no prior cache exists.
 */
export const BASELINE_FALLBACK = {
  currency: {
    usdToBrl: 5.7640,
    source: 'EMERGENCY_BASELINE_CACHE',
  },
  arabicaNY: {
    centsPerLb: 288.65,
    source: 'EMERGENCY_BASELINE_CACHE',
  },
  robustaLondon: {
    usdPerTon: 4720.00,
    source: 'EMERGENCY_BASELINE_CACHE',
  },
  cepea: {
    arabicaBRLPerSack: 1915.50,
    conilonBRLPerSack: 1448.20,
    lastUpdate: new Date().toISOString().split('T')[0],
    source: 'EMERGENCY_BASELINE_CACHE',
  },
};
