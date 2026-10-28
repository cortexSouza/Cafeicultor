/**
 * Strongly typed domain interfaces for the Coffee Market Data Ingestion & Consolidation Engine.
 * Conforms strictly to the SRS and Mobile Agrotech JSON Contract.
 */

export type MarketStatus = 'SUCCESS' | 'PARTIAL' | 'CACHED' | 'ERROR';

export interface CurrencyData {
  usdToBrl: number;
  source: string;
}

export interface ArabicaNYData {
  centsPerLb: number;
  calculatedParityBRLPerSack: number;
  unit: 'cents/lb';
}

export interface RobustaLondonData {
  usdPerTon: number;
  calculatedParityBRLPerSack: number;
  unit: 'USD/Ton';
}

export interface CepeaPhysicalData {
  arabicaBRLPerSack: number;
  conilonBRLPerSack: number;
  lastUpdate: string;
}

export interface ConversionFactors {
  lbsPerSack: number; // 132.277
  sacksPerTon: number; // 16.6667
}

export interface MetadataPayload {
  conversionFactors: ConversionFactors;
  sourceDetails?: {
    currencySource: string;
    arabicaNYSource: string;
    robustaLondonSource: string;
    cepeaSource: string;
    cachedAt?: string;
    upstreamErrors?: string[];
  };
}

/**
 * Expected JSON output contract for mobile app consumption.
 */
export interface ConsolidatedCoffeeMarketResponse {
  timestamp: string;
  status: MarketStatus;
  currency: CurrencyData;
  market: {
    arabicaNY: ArabicaNYData;
    robustaLondon: RobustaLondonData;
    cepeaPhysical: CepeaPhysicalData;
  };
  metadata: MetadataPayload;
}

/**
 * Internal result structures returned by upstream adapters.
 */
export interface UpstreamResult<T> {
  success: boolean;
  data: T;
  source: string;
  isCached?: boolean;
  error?: string;
}

export interface UpstreamCurrency {
  usdToBrl: number;
}

export interface UpstreamFutureQuote {
  price: number;
  symbol: string;
  exchange: string;
}

export interface UpstreamCepeaQuotes {
  arabicaBRLPerSack: number;
  conilonBRLPerSack: number;
  lastUpdate: string;
}
