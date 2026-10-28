import {
  Quotation,
  RegionalMarket,
  MarketNewsItem,
  HistoricalPriceSeries,
  PriceAlert,
} from '../types/market';

// Conversion helpers:
// 1 bag = 60 kg = 132.277357 lbs
// NY: ¢/lb -> (cents / 100) * 132.277357 * USD_BRL = R$/saca
// London: USD/ton -> (USD / 1000 * 60) * USD_BRL = R$/saca
// B3: USD/saca -> USD * USD_BRL = R$/saca
export const LBS_PER_BAG = 132.277357;
export const CURRENT_USD_BRL = 5.764;

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'cepea_arabica',
    name: 'Arábica CEPEA/ESALQ',
    symbol: 'CEPEA-ARA',
    category: 'physical',
    unit: 'R$/saca (60kg)',
    price: 1915.50,
    changePercent: 1.42,
    changeValue: 26.80,
    high: 1928.00,
    low: 1888.70,
    previousClose: 1888.70,
    volume: '38.450 sacas físicas',
    lastUpdated: 'Hoje, 17:15',
    convertedPriceBRL: 1915.50,
    marketStatus: 'closed',
    description: 'Indicador de referência do café arábica físico Tipo 6, bebida dura para melhor, posto na praça paulista e Sul de Minas.',
  },
  {
    id: 'cepea_conilon',
    name: 'Conilon CEPEA/ESALQ',
    symbol: 'CEPEA-CON',
    category: 'physical',
    unit: 'R$/saca (60kg)',
    price: 1448.20,
    changePercent: 0.85,
    changeValue: 12.20,
    high: 1455.00,
    low: 1436.00,
    previousClose: 1436.00,
    volume: '22.100 sacas físicas',
    lastUpdated: 'Hoje, 17:15',
    convertedPriceBRL: 1448.20,
    marketStatus: 'closed',
    description: 'Indicador do café robusta/conilon Tipo 7, peneira 13 acima, posto no Espírito Santo.',
  },
  {
    id: 'ice_ny',
    name: 'ICE Nova York (Arábica C)',
    symbol: 'KC=F',
    category: 'futures',
    unit: '¢/lb',
    price: 288.65,
    changePercent: 2.18,
    changeValue: 6.15,
    high: 291.20,
    low: 282.50,
    previousClose: 282.50,
    volume: '28.940 contratos',
    lastUpdated: 'Ao vivo (15 min delay)',
    // (288.65 / 100) * 132.277 * 5.764 = 2199.78
    convertedPriceBRL: Math.round((288.65 / 100) * LBS_PER_BAG * CURRENT_USD_BRL * 100) / 100,
    contractMonth: 'Mai/25 (Primeira posição)',
    marketStatus: 'open',
    description: 'Bolsa internacional de futuros de café arábica. Preço em cents de dólar por libra-peso.',
  },
  {
    id: 'ice_london',
    name: 'ICE Londres (Robusta)',
    symbol: 'RC=F',
    category: 'futures',
    unit: 'US$/tonelada',
    price: 4720.00,
    changePercent: 1.29,
    changeValue: 60.00,
    high: 4765.00,
    low: 4660.00,
    previousClose: 4660.00,
    volume: '14.280 contratos',
    lastUpdated: 'Ao vivo (15 min delay)',
    // (4720 * 0.06) * 5.764 = 1632.36
    convertedPriceBRL: Math.round((4720 * 0.06) * CURRENT_USD_BRL * 100) / 100,
    contractMonth: 'Mai/25 (Primeira posição)',
    marketStatus: 'open',
    description: 'Referência global para contratos futuros de café conilon/robusta em dólares por tonelada métrica.',
  },
  {
    id: 'b3_icf',
    name: 'B3 Futuros Arábica (ICF)',
    symbol: 'ICF',
    category: 'futures',
    unit: 'US$/saca (60kg)',
    price: 332.50,
    changePercent: 1.68,
    changeValue: 5.50,
    high: 334.00,
    low: 327.00,
    previousClose: 327.00,
    volume: '4.890 contratos',
    lastUpdated: 'Ao vivo (15 min delay)',
    convertedPriceBRL: Math.round(332.50 * CURRENT_USD_BRL * 100) / 100,
    contractMonth: 'Set/25 (Safra nova)',
    marketStatus: 'open',
    description: 'Contrato futuro de café arábica da Bolsa de Valores do Brasil (B3), cotado em dólares por saca de 60kg.',
  },
  {
    id: 'usd_brl',
    name: 'Dólar Comercial PTAX',
    symbol: 'USD/BRL',
    category: 'currency',
    unit: 'R$/US$',
    price: 5.7640,
    changePercent: -0.45,
    changeValue: -0.0260,
    high: 5.7950,
    low: 5.7510,
    previousClose: 5.7900,
    volume: 'US$ 3.8 bilhões',
    lastUpdated: 'Hoje, 17:00 PTAX Banco Central',
    marketStatus: 'closed',
    description: 'Taxa média de câmbio calculada pelo Banco Central do Brasil para liquidação de contratos de exportação.',
  },
];

export const REGIONAL_MARKETS: RegionalMarket[] = [
  {
    id: 'reg_sul_minas_dura',
    state: 'MG',
    stateName: 'Minas Gerais',
    region: 'Sul de Minas',
    mainCities: ['Guaxupé', 'Varginha', 'Machado', 'Alfenas', 'Poços de Caldas'],
    coffeeType: 'Arábica Tipo 6 Bebida Dura',
    coffeeGroup: 'arabica',
    drinkQuality: 'Dura',
    avgPrice: 1920.00,
    minPrice: 1890.00,
    maxPrice: 1950.00,
    changeValue: 25.00,
    changePercent: 1.32,
    benchmarkSource: 'Cooperativas Regionais & Comércio Local',
    liquidity: 'Alta',
    lastUpdated: 'Hoje, 16:30',
    observations: 'Maior polo cafeeiro do Brasil. Lotes com peneira 16/17 e boa catação recebem ágio adicional de até R$ 30/saca.',
  },
  {
    id: 'reg_sul_minas_cd',
    state: 'MG',
    stateName: 'Minas Gerais',
    region: 'Sul de Minas (Especiais / CD)',
    mainCities: ['Santo Antônio do Amparo', 'Carmo de Minas', 'Três Pontas'],
    coffeeType: 'Arábica Tipo 6 Cereja Descascado (Mole)',
    coffeeGroup: 'arabica',
    drinkQuality: 'Mole / CD',
    avgPrice: 1990.00,
    minPrice: 1960.00,
    maxPrice: 2040.00,
    changeValue: 30.00,
    changePercent: 1.53,
    benchmarkSource: 'Cooperativas & Exportadores Especializados',
    liquidity: 'Média',
    lastUpdated: 'Hoje, 16:30',
    observations: 'Cafés finos e certificados (Rainforest, Fairtrade, Utz) encontram forte demanda externa com ágios expressivos.',
  },
  {
    id: 'reg_cerrado_mineiro',
    state: 'MG',
    stateName: 'Minas Gerais',
    region: 'Cerrado Mineiro (D.O.)',
    mainCities: ['Patrocínio', 'Monte Carmelo', 'Araguari', 'Serra do Salitre'],
    coffeeType: 'Arábica Tipo 6 Bebida Dura (Denominação de Origem)',
    coffeeGroup: 'arabica',
    drinkQuality: 'Dura',
    avgPrice: 1940.00,
    minPrice: 1910.00,
    maxPrice: 1970.00,
    changeValue: 20.00,
    changePercent: 1.04,
    benchmarkSource: 'Expocaccer & Federação dos Cafeicultores',
    liquidity: 'Alta',
    lastUpdated: 'Hoje, 16:00',
    observations: 'Região reconhecida pela padronização e mecanização total. Café com selo de Denominação de Origem Cerrado Mineiro.',
  },
  {
    id: 'reg_matas_minas',
    state: 'MG',
    stateName: 'Minas Gerais',
    region: 'Matas de Minas',
    mainCities: ['Manhuaçu', 'Viçosa', 'Caratinga', 'Espera Feliz'],
    coffeeType: 'Arábica Tipo 6/7 Bebida Dura',
    coffeeGroup: 'arabica',
    drinkQuality: 'Dura',
    avgPrice: 1880.00,
    minPrice: 1850.00,
    maxPrice: 1910.00,
    changeValue: 15.00,
    changePercent: 0.80,
    benchmarkSource: 'Sindicatos Rurais & Armazéns Locais',
    liquidity: 'Média',
    lastUpdated: 'Hoje, 15:45',
    observations: 'Montanhas com colheita manual seletiva. Crescente valorização de lotes artesanais e cafés especiais.',
  },
  {
    id: 'reg_alta_mogiana',
    state: 'SP',
    stateName: 'São Paulo',
    region: 'Alta Mogiana',
    mainCities: ['Franca', 'Pedregulho', 'Batatais', 'Altinópolis'],
    coffeeType: 'Arábica Tipo 6 Bebida Dura Padrão Mogiana',
    coffeeGroup: 'arabica',
    drinkQuality: 'Dura',
    avgPrice: 1910.00,
    minPrice: 1880.00,
    maxPrice: 1935.00,
    changeValue: 20.00,
    changePercent: 1.06,
    benchmarkSource: 'Cooperativas de São Paulo & Corretores',
    liquidity: 'Alta',
    lastUpdated: 'Hoje, 16:15',
    observations: 'Tradição centenária e proximidade com o Porto de Santos reduzem custos de frete rodoviário.',
  },
  {
    id: 'reg_es_conilon',
    state: 'ES',
    stateName: 'Espírito Santo',
    region: 'Norte Capixaba (Conilon)',
    mainCities: ['São Gabriel da Palha', 'Colatina', 'Linhares', 'Marilândia'],
    coffeeType: 'Conilon Tipo 7 Padrão 13 Acima',
    coffeeGroup: 'conilon',
    drinkQuality: 'Conilon Padrão',
    avgPrice: 1450.00,
    minPrice: 1420.00,
    maxPrice: 1470.00,
    changeValue: 10.00,
    changePercent: 0.69,
    benchmarkSource: 'Cooabriel & Indústrias Solúveis',
    liquidity: 'Alta',
    lastUpdated: 'Hoje, 16:45',
    observations: 'Principal polo de conilon do país. Forte absorção pela indústria nacional de café solúvel e exportação.',
  },
  {
    id: 'reg_es_montanhas_arabica',
    state: 'ES',
    stateName: 'Espírito Santo',
    region: 'Montanhas do Espírito Santo',
    mainCities: ['Venda Nova do Imigrante', 'Afonso Cláudio', 'Brejetuba'],
    coffeeType: 'Arábica Tipo 6 Bebida Mole / Terreiro Suspenso',
    coffeeGroup: 'arabica',
    drinkQuality: 'Mole / CD',
    avgPrice: 1930.00,
    minPrice: 1890.00,
    maxPrice: 1980.00,
    changeValue: 25.00,
    changePercent: 1.31,
    benchmarkSource: 'Pronova & Armazéns Regionais',
    liquidity: 'Moderada',
    lastUpdated: 'Hoje, 15:30',
    observations: 'Cafés de altitude produzidos pela agricultura familiar com alta doçura e notas florais.',
  },
  {
    id: 'reg_bahia_planalto',
    state: 'BA',
    stateName: 'Bahia',
    region: 'Planalto da Bahia & Chapada Diamantina',
    mainCities: ['Vitória da Conquista', 'Barra do Choça', 'Piatã'],
    coffeeType: 'Arábica Tipo 6/7 Bebida Dura / Mole',
    coffeeGroup: 'arabica',
    drinkQuality: 'Dura',
    avgPrice: 1870.00,
    minPrice: 1840.00,
    maxPrice: 1900.00,
    changeValue: 15.00,
    changePercent: 0.81,
    benchmarkSource: 'Cooperativas Baianas & Comércio',
    liquidity: 'Média',
    lastUpdated: 'Hoje, 15:00',
    observations: 'Safra tardia em relação ao Sudeste, servindo como importante balizador de entressafra.',
  },
  {
    id: 'reg_rondonia_conilon',
    state: 'RO',
    stateName: 'Rondônia',
    region: 'Rondônia (Robustas Amazônicos)',
    mainCities: ['Cacoal', 'Rolim de Moura', 'Ji-Paraná', 'Alta Floresta D’Oeste'],
    coffeeType: 'Conilon / Robusta Amazônico Tipo 7',
    coffeeGroup: 'conilon',
    drinkQuality: 'Conilon Padrão',
    avgPrice: 1410.00,
    minPrice: 1380.00,
    maxPrice: 1440.00,
    changeValue: 12.00,
    changePercent: 0.86,
    benchmarkSource: 'Indústrias Solúveis & Exportadores Regionais',
    liquidity: 'Média',
    lastUpdated: 'Hoje, 14:30',
    observations: 'Variedades clonais de alta produtividade (BNC) e fermentações induzidas conquistando prêmios nacionais.',
  },
  {
    id: 'reg_riopardense_sul_minas',
    state: 'MG',
    stateName: 'Minas Gerais',
    region: 'Sul de Minas (Comercial / Rio)',
    mainCities: ['Passos', 'São Sebastião do Paraíso'],
    coffeeType: 'Arábica Tipo 7/8 Bebida Riopardense / Rio',
    coffeeGroup: 'arabica',
    drinkQuality: 'Rio / Riopardense',
    avgPrice: 1680.00,
    minPrice: 1640.00,
    maxPrice: 1710.00,
    changeValue: 10.00,
    changePercent: 0.60,
    benchmarkSource: 'Corretores do Mercado Físico',
    liquidity: 'Moderada',
    lastUpdated: 'Hoje, 14:00',
    observations: 'Café com aroma iodado característico demandado pelo mercado do Oriente Médio e blends de entrada.',
  },
];

// Historical data series generator for chart exploration
export function getHistoricalSeries(assetId: string, timeframe: '7d' | '30d' | '6m' | '1a' | '5a'): HistoricalPriceSeries {
  const isArabica = assetId.includes('arabica') || assetId === 'ice_ny' || assetId === 'b3_icf';
  const isConilon = assetId.includes('conilon') || assetId === 'ice_london';
  const isCurrency = assetId === 'usd_brl';

  let basePrice = 1915;
  let unit = 'R$/saca (60kg)';
  let assetName = 'Arábica CEPEA/ESALQ';

  if (assetId === 'cepea_conilon') {
    basePrice = 1448;
    unit = 'R$/saca (60kg)';
    assetName = 'Conilon CEPEA/ESALQ';
  } else if (assetId === 'ice_ny') {
    basePrice = 288.65;
    unit = '¢/lb';
    assetName = 'ICE Nova York (KC)';
  } else if (assetId === 'ice_london') {
    basePrice = 4720;
    unit = 'US$/ton';
    assetName = 'ICE Londres (RC)';
  } else if (assetId === 'b3_icf') {
    basePrice = 332.50;
    unit = 'US$/saca';
    assetName = 'B3 Futuros (ICF)';
  } else if (assetId === 'usd_brl') {
    basePrice = 5.764;
    unit = 'R$/US$';
    assetName = 'Dólar Comercial PTAX';
  }

  // Generate realistic data points based on timeframe
  const points: { date: string; label: string; price: number }[] = [];
  let count = 7;
  let daysStep = 1;
  let volatility = 0.015;
  let generalTrend = 1.0;

  if (timeframe === '7d') {
    count = 7;
    daysStep = 1;
    volatility = 0.008;
  } else if (timeframe === '30d') {
    count = 30;
    daysStep = 1;
    volatility = 0.012;
  } else if (timeframe === '6m') {
    count = 26; // weekly points
    daysStep = 7;
    volatility = 0.025;
  } else if (timeframe === '1a') {
    count = 52; // weekly points
    daysStep = 7;
    volatility = 0.035;
  } else if (timeframe === '5a') {
    count = 60; // monthly points
    daysStep = 30;
    volatility = 0.055;
  }

  // Pre-calculated seed trajectory
  const now = new Date();
  const rawValues: number[] = [];

  // Working backwards from current price
  let currentVal = basePrice;
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - (count - 1 - i) * daysStep * 24 * 60 * 60 * 1000);
    const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: timeframe === '5a' ? '2-digit' : undefined });
    
    // Wave pattern with upward trend over the medium term due to tight global coffee fundamentals
    const cycle = Math.sin(i * 0.45) * 0.03;
    const upwardDrift = (i - count / 2) * 0.003;
    const factor = 1 - (cycle + upwardDrift);
    
    const calculatedPrice = i === count - 1 
      ? basePrice 
      : Math.round((basePrice * factor) * (isCurrency ? 10000 : 100)) / (isCurrency ? 10000 : 100);

    rawValues.push(calculatedPrice);
    points.push({
      date: d.toISOString().split('T')[0],
      label: dateStr,
      price: calculatedPrice,
    });
  }

  const prices = points.map(p => p.price);
  const minVal = Math.min(...prices);
  const maxVal = Math.max(...prices);
  const avgVal = Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100;
  const firstPrice = points[0].price;
  const lastPrice = points[points.length - 1].price;
  const varVal = Math.round((lastPrice - firstPrice) * 100) / 100;
  const varPct = Math.round(((lastPrice - firstPrice) / firstPrice) * 10000) / 100;

  let trendAnalysis = 'Mercado em patamar historicamente elevado. Produtor deve avaliar travas de safra futura para garantir margens operacionais acima do custo de produção.';
  if (varPct > 5) {
    trendAnalysis = `Tendência de forte valorização (+${varPct}%) no período. Demanda aquecida por estoques baixos nos países consumidores e quebra de safra no Sudeste Asiático sustentam as cotações.`;
  } else if (varPct > 0) {
    trendAnalysis = `Mercado firme com valorização moderada (+${varPct}%). Oportunidade para vendas escalonadas de lotes disponíveis aproveitando repiques de alta.`;
  } else {
    trendAnalysis = `Mercado em acomodação técnica (${varPct}%). Atenção às janelas climáticas e relatórios da CONAB antes de fechar grandes volumes.`;
  }

  return {
    assetId,
    assetName,
    unit,
    timeframe,
    points,
    variationPercent: varPct,
    variationValue: varVal,
    high: maxVal,
    low: minVal,
    average: avgVal,
    trendAnalysis,
  };
}

export const INITIAL_PRICE_ALERTS: PriceAlert[] = [
  {
    id: 'alert_1',
    title: 'Meta de Trava Safra Nova (B3 / ICF)',
    targetAsset: 'b3_icf',
    targetAssetName: 'B3 Futuros Arábica (Set/25)',
    condition: 'above',
    targetValue: 335.00,
    unit: 'US$/saca',
    objective: 'trava',
    isActive: true,
    isTriggered: false,
    createdAt: 'Ontem',
  },
  {
    id: 'alert_2',
    title: 'Venda de Lote Físico no Sul de Minas',
    targetAsset: 'cepea_arabica',
    targetAssetName: 'Arábica CEPEA/ESALQ',
    condition: 'above',
    targetValue: 1900.00,
    unit: 'R$/saca',
    objective: 'venda_imediata',
    isActive: true,
    isTriggered: true,
    triggeredAt: 'Hoje às 14:20',
    createdAt: '3 dias atrás',
  },
  {
    id: 'alert_3',
    title: 'Monitoramento de Dólar para Exportação',
    targetAsset: 'usd_brl',
    targetAssetName: 'Dólar Comercial PTAX',
    condition: 'above',
    targetValue: 5.80,
    unit: 'R$/US$',
    objective: 'protecao_custo',
    isActive: true,
    isTriggered: false,
    createdAt: '5 dias atrás',
  },
  {
    id: 'alert_4',
    title: 'Pico de Preço Conilon no Espírito Santo',
    targetAsset: 'cepea_conilon',
    targetAssetName: 'Conilon CEPEA/ESALQ',
    condition: 'above',
    targetValue: 1460.00,
    unit: 'R$/saca',
    objective: 'venda_imediata',
    isActive: false,
    isTriggered: false,
    createdAt: '1 semana atrás',
  },
];

export const MARKET_NEWS: MarketNewsItem[] = [
  {
    id: 'news_1',
    title: 'Frente fria traz chuvas fracas ao Sul de Minas e calor segue no Cerrado',
    summary: 'Precipitações pontuais aliviam estresse hídrico no Sul de Minas, mas o pegamento da florada nas lavouras do Cerrado exige atenção do produtor.',
    fullBody: 'A passagem de uma frente fria pelo Sudeste do Brasil trouxe pancadas irregulares de chuva em municípios do Sul de Minas Gerais como Varginha, Guaxupé e Alfenas. No entanto, o Cerrado Mineiro e o Norte Pioneiro do Paraná registraram volumes inferiores a 15mm na última semana. Especialistas agronômicos destacam que a fase atual é crítica para o pegamento do chumbinho (frutificação). Caso as chuvas de verão não se regularizem nas próximas duas semanas, o mercado poderá antecipar nova redução na estimativa de safra brasileira, sustentando as cotações em Nova York.',
    category: 'clima',
    categoryLabel: 'Clima & Lavouras',
    impact: 'alta',
    source: 'Boletim Agrometeorológico Rural',
    date: 'Hoje, 09:30',
    readTime: '3 min',
    producerTip: 'Não apresse a venda de todo o estoque. Monitore o pegamento dos chumbinhos na sua lavoura para dimensionar a safra antes de travar mais de 30% da produção estimada.',
    imageKey: 'coffee_plantation_landscape',
  },
  {
    id: 'news_2',
    title: 'Estoques certificados na Bolsa de Nova York registram nova queda semanal',
    summary: 'Volume de sacas auditadas nos armazéns da ICE cai para níveis críticos, forçando tradings multinacionais a buscar reposição rápida no Brasil.',
    fullBody: 'Os armazéns certificados da Intercontinental Exchange (ICE Futures US) registraram uma queda de 18.400 sacas de café arábica na última semana, encerrando o período próximo de 790 mil sacas. A escassez de café de qualidade nas origens da América Central e Colômbia direciona compradores internacionais diretamente para as cooperativas e exportadores brasileiros. Essa pressão compradora mantém o ágio (diferencial de base) para o café brasileiro em patamares historicamente favoráveis.',
    category: 'estoques_usda',
    categoryLabel: 'Estoques & Demanda',
    impact: 'alta',
    source: 'Relatório ICE Commodities',
    date: 'Ontem, 16:45',
    readTime: '2 min',
    producerTip: 'Com estoques baixos no exterior, corretores estão mais flexíveis em negociar prazos de entrega e bonificação por qualidade de bebida (Dura limpa e Cereja Descascado).',
    imageKey: 'coffee_cherries_harvest',
  },
  {
    id: 'news_3',
    title: 'Vietnã enfrenta atraso na colheita de Robusta e impulsiona Conilon no ES e RO',
    summary: 'Chuvas tardias nas Terras Altas Centrais do Vietnã prejudicam a secagem do grão, mantendo preços do Conilon brasileiro acima de R$ 1.400/saca.',
    fullBody: 'Relatórios do Departamento de Agricultura dos EUA (USDA) e exportadores de Ho Chi Minh indicam que os produtores vietnamitas estão com colheita atrasada e segurando as vendas à espera de preços mais altos. Esse cenário fortaleceu a procura internacional pelo café Conilon brasileiro produzido no Espírito Santo e Rondônia, tanto para exportação direta quanto para substituir arábica em misturas industriais no mercado doméstico.',
    category: 'analise_comercial',
    categoryLabel: 'Inteligência de Venda',
    impact: 'alta',
    source: 'Análise de Mercado Internacional',
    date: '2 dias atrás',
    readTime: '3 min',
    producerTip: 'Para o produtor de Conilon: momento propício para fixar custos de insumos (adubos e defensivos) via barter ou travas com a cooperativa.',
    imageKey: 'coffee_cupping_grading',
  },
  {
    id: 'news_4',
    title: 'Dólar volátil frente ao Real: como o cafeicultor deve se posicionar nas travas',
    summary: 'Com a moeda americana oscilando próxima a R$ 5,75, a conversão em reais por saca atinge picos atrativos mesmo em dias de correção técnica na ICE.',
    fullBody: 'A oscilação do câmbio internacional decorrente de taxas de juros americanas e incertezas fiscais domésticas mantém o dólar em patamares elevados. Para o cafeicultor brasileiro, a combinação de cotação internacional em centavos de dólar multiplicada pelo câmbio resulta em preços líquidos em reais superiores a R$ 1.900/saca para arábica. Consultores de mercado recomendam a estratégia de "venda escalonada", fixando parcelas do estoque conforme metas pré-definidas de rentabilidade.',
    category: 'cambio_macro',
    categoryLabel: 'Câmbio & Economia',
    impact: 'neutro',
    source: 'Consultoria Agrícola de Comercialização',
    date: '3 dias atrás',
    readTime: '4 min',
    producerTip: 'Defina seu Custo Operacional Efetivo (COE). Se o preço atual cobre seu custo e garante margem líquida superior a 35%, garanta uma parcela da trava sem tentar adivinhar o topo do dólar.',
  },
];

export const DAILY_MARKET_BULLETIN = {
  date: 'Boletim Diário · Comercialização do Café',
  temperature: 'favoravel' as const, // 'favoravel' | 'neutro' | 'cautela'
  headline: 'Momento altamente favorável para comercialização fracionada',
  keyTakeaways: [
    'Arábica no físico sustenta patamar acima de R$ 1.900/saca no Sul de Minas e Cerrado, com boa liquidez nas cooperativas.',
    'Bolsa de Nova York (ICE) opera firme próxima de 290 ¢/lb com estoques internacionais em queda e estoques de passagem apertados.',
    'Dólar acima de R$ 5,70 maximiza o resultado em reais para o produtor rural.',
  ],
  recommendedAction: 'Aproveite o repique para fixar entre 15% e 25% da safra futura na B3 ou via cooperativa para travar os custos de fertilizantes da safra.',
};
