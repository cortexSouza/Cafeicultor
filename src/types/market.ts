export type CoffeeGroup = 'arabica' | 'conilon' | 'all';

export interface Quotation {
  id: string;
  name: string;
  symbol: string;
  category: 'physical' | 'futures' | 'currency';
  unit: string;
  price: number;
  changePercent: number;
  changeValue: number;
  high: number;
  low: number;
  previousClose: number;
  volume?: string;
  lastUpdated: string;
  convertedPriceBRL?: number; // Converted to R$/saca (60kg) for direct parity
  contractMonth?: string;
  marketStatus: 'open' | 'closed';
  description: string;
}

export interface RegionalMarket {
  id: string;
  state: 'MG' | 'ES' | 'SP' | 'BA' | 'RO' | 'PR';
  stateName: string;
  region: string;
  mainCities: string[];
  coffeeType: string;
  coffeeGroup: 'arabica' | 'conilon';
  drinkQuality: 'Dura' | 'Mole / CD' | 'Rio / Riopardense' | 'Conilon Padrão' | 'Conilon Especial';
  avgPrice: number; // R$/saca 60kg
  minPrice: number;
  maxPrice: number;
  changeValue: number;
  changePercent: number;
  benchmarkSource: string;
  liquidity: 'Alta' | 'Média' | 'Moderada';
  lastUpdated: string;
  observations?: string;
}

export interface SaleSimulation {
  id: string;
  title?: string;
  date: string;
  baseQuoteType: 'ny' | 'b3' | 'cepea_arabica' | 'cepea_conilon' | 'custom';
  baseQuoteLabel: string;
  baseQuoteValue: number;
  exchangeRate: number; // USD/BRL
  bagQuantity: number;
  grossPricePerBag: number;
  
  // Deductions
  freightPerBag: number;
  brokeragePercent: number;
  brokeragePerBag: number;
  funruralPercent: number; // Usually 1.5%
  funruralPerBag: number;
  storageAndGradingPerBag: number;
  agioDesagioPerBag: number; // positive = agio, negative = desagio
  
  // Results
  totalDeductionsPerBag: number;
  netPricePerBag: number;
  grossTotal: number;
  totalDeductions: number;
  netTotal: number;
  netMarginPercent: number;
  notes?: string;
}

export interface PriceAlert {
  id: string;
  title: string;
  targetAsset: string;
  targetAssetName: string;
  condition: 'above' | 'below' | 'percent_change_up' | 'percent_change_down';
  targetValue: number;
  unit: string;
  objective: 'trava' | 'venda_imediata' | 'protecao_custo' | 'monitoramento';
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: string;
  createdAt: string;
}

export interface MarketNewsItem {
  id: string;
  title: string;
  summary: string;
  fullBody: string;
  category: 'clima' | 'estoques_usda' | 'cambio_macro' | 'analise_comercial';
  categoryLabel: string;
  impact: 'alta' | 'baixa' | 'neutro';
  source: string;
  date: string;
  readTime: string;
  producerTip: string;
  imageKey?: string;
}

export interface HistoricalPriceSeries {
  assetId: string;
  assetName: string;
  unit: string;
  timeframe: '7d' | '30d' | '6m' | '1a' | '5a';
  points: {
    date: string;
    label: string;
    price: number;
    volume?: number;
  }[];
  variationPercent: number;
  variationValue: number;
  high: number;
  low: number;
  average: number;
  trendAnalysis: string;
}
