/**
 * Interfaces TypeScript estritas para a resposta consolidada do serviço de mercado do café.
 * Segue rigorosamente a especificação do contrato JSON exigida pelo projeto e aplicativo mobile.
 */

/**
 * Status de integridade e proveniência dos dados consolidados:
 * - SUCCESS: Todas as fontes (BACEN, ICE NY, ICE Londres, CEPEA) responderam com dados atualizados.
 * - PARTIAL: Uma ou mais fontes utilizaram fallback ou cache intermediário.
 * - CACHED: Resposta integralmente servida do cache em memória/disco.
 * - ERROR: Exceção recuperada por salvaguarda de emergência.
 */
export type MarketStatus = 'SUCCESS' | 'PARTIAL' | 'CACHED' | 'ERROR';

/**
 * Cotação do Dólar Comercial (USD/BRL)
 */
export interface CurrencyInfo {
  usdToBrl: number;
  source: string;
}

/**
 * Contrato Futuro de Café Arábica (ICE Futures US - Nova York)
 * Ticker de referência: KC=F
 */
export interface ArabicaNYMarket {
  centsPerLb: number;
  calculatedParityBRLPerSack: number;
  unit: 'cents/lb';
}

/**
 * Contrato Futuro de Café Conilon/Robusta (ICE Futures Europe - Londres)
 * Ticker de referência: RC=F
 */
export interface RobustaLondonMarket {
  usdPerTon: number;
  calculatedParityBRLPerSack: number;
  unit: 'USD/Ton';
}

/**
 * Mercado Físico Nacional (CEPEA/ESALQ)
 * Preços médios à vista para a saca de 60kg em Reais (R$)
 */
export interface CepeaPhysicalMarket {
  arabicaBRLPerSack: number;
  conilonBRLPerSack: number;
  lastUpdate: string; // Formato YYYY-MM-DD
}

/**
 * Agrupamento consolidado dos mercados cafeeiros
 */
export interface MarketPayload {
  arabicaNY: ArabicaNYMarket;
  robustaLondon: RobustaLondonMarket;
  cepeaPhysical: CepeaPhysicalMarket;
}

/**
 * Fatores oficiais de conversão da saca de café (60kg) no agronegócio
 */
export interface ConversionFactors {
  lbsPerSack: number; // 132.277 libras por saca de 60kg
  sacksPerTon: number; // 16.6667 sacas de 60kg por tonelada métrica
}

/**
 * Metadados da resposta com fatores de conversão e rastreabilidade de fontes
 */
export interface MarketMetadata {
  conversionFactors: ConversionFactors;
  sourceDetails?: {
    currencySource?: string;
    arabicaNYSource?: string;
    robustaLondonSource?: string;
    cepeaSource?: string;
    cachedAt?: string;
    upstreamErrors?: string[];
  };
}

/**
 * Objeto JSON Consolidado Principal retornado pelo endpoint:
 * GET /api/market/coffee-consolidated
 */
export interface ConsolidatedMarketResponse {
  timestamp: string; // Formato ISO 8601 UTC (ex: 2026-03-30T14:30:00.000Z)
  status: MarketStatus;
  currency: CurrencyInfo;
  market: MarketPayload;
  metadata: MarketMetadata;
}
