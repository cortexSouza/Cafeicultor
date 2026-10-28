import React, { useState, useMemo } from 'react';
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  Check,
  Calculator,
  Compass,
  Building2,
  ChevronRight,
  Award,
} from 'lucide-react';
import { RegionalMarket, Quotation } from '../types/market';

interface RegionalFilterProps {
  regionalMarkets: RegionalMarket[];
  onSelectForCalculator: (quote: Quotation) => void;
  highContrast: boolean;
}

export const RegionalFilter: React.FC<RegionalFilterProps> = ({
  regionalMarkets,
  onSelectForCalculator,
  highContrast,
}) => {
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<'all' | 'arabica' | 'conilon'>('all');
  const [selectedDrinkQuality, setSelectedDrinkQuality] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);

  // States available in the dataset
  const availableStates = useMemo(() => {
    const states = Array.from(new Set(regionalMarkets.map(m => m.state)));
    return ['ALL', ...states];
  }, [regionalMarkets]);

  // Drink qualities
  const availableQualities = [
    { id: 'ALL', label: 'Todas as Bebidas' },
    { id: 'Dura', label: 'Bebida Dura' },
    { id: 'Mole / CD', label: 'Bebida Mole / CD' },
    { id: 'Rio / Riopardense', label: 'Rio / Riopardense' },
    { id: 'Conilon Padrão', label: 'Conilon Padrão' },
  ];

  // Filtering
  const filteredMarkets = useMemo(() => {
    return regionalMarkets.filter(market => {
      if (selectedState !== 'ALL' && market.state !== selectedState) return false;
      if (selectedGroup !== 'all' && market.coffeeGroup !== selectedGroup) return false;
      if (selectedDrinkQuality !== 'ALL' && market.drinkQuality !== selectedDrinkQuality) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchRegion = market.region.toLowerCase().includes(q);
        const matchState = market.stateName.toLowerCase().includes(q);
        const matchCoffee = market.coffeeType.toLowerCase().includes(q);
        const matchCities = market.mainCities.some(city => city.toLowerCase().includes(q));
        if (!matchRegion && !matchState && !matchCoffee && !matchCities) return false;
      }

      return true;
    });
  }, [regionalMarkets, selectedState, selectedGroup, selectedDrinkQuality, searchQuery]);

  // Find max and min prices across current list
  const maxPriceMarket = useMemo(() => {
    if (filteredMarkets.length === 0) return null;
    return [...filteredMarkets].sort((a, b) => b.avgPrice - a.avgPrice)[0];
  }, [filteredMarkets]);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatNumber = (val: number) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      {/* Header and Explanation */}
      <div className={`p-5 rounded-2xl border transition ${
        highContrast
          ? 'bg-black text-white border-white'
          : 'bg-stone-900 text-stone-100 border-stone-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Mapeamento Regional de Preços</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Cotações por Praça e Região Produtora
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl mt-1 leading-relaxed">
              Consulte a média negociada nas cooperativas e corretores do Sul de Minas, Cerrado, Espírito Santo, Matas de Minas, Alta Mogiana, Rondônia e Bahia.
            </p>
          </div>

          {/* Top Regional Benchmark Highlight */}
          {maxPriceMarket && (
            <div className="bg-stone-800/90 border border-emerald-700/50 p-3.5 rounded-xl shrink-0 flex items-center gap-3">
              <Award className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Maior Cotação Regional Hoje
                </span>
                <div className="text-lg font-bold font-mono text-white tabular-nums">
                  {formatBRL(maxPriceMarket.avgPrice)}
                </div>
                <span className="text-xs text-stone-300 truncate block max-w-[200px]">
                  {maxPriceMarket.region} ({maxPriceMarket.state})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar Controls */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por município ou região (ex: Varginha, Guaxupé, Patrocínio, Franca)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        {/* Filter Segments */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
          {/* Coffee Species Group */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">
              Espécie:
            </span>
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
              <button
                onClick={() => setSelectedGroup('all')}
                className={`px-3 py-1.5 rounded-md font-semibold transition ${
                  selectedGroup === 'all'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setSelectedGroup('arabica')}
                className={`px-3 py-1.5 rounded-md font-semibold transition ${
                  selectedGroup === 'arabica'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Arábica
              </button>
              <button
                onClick={() => setSelectedGroup('conilon')}
                className={`px-3 py-1.5 rounded-md font-semibold transition ${
                  selectedGroup === 'conilon'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Conilon / Robusta
              </button>
            </div>
          </div>

          {/* State Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap mr-1">
              Estado:
            </span>
            {availableStates.map(st => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedState === st
                    ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {st === 'ALL' ? 'Todos os Estados' : st}
              </button>
            ))}
          </div>

          {/* Quality selector */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">
              Bebida:
            </span>
            <select
              value={selectedDrinkQuality}
              onChange={(e) => setSelectedDrinkQuality(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              {availableQualities.map(q => (
                <option key={q.id} value={q.id}>{q.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count and Regional Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1">
          <span>Mostrando <strong>{filteredMarkets.length}</strong> praças comerciais encontradas</span>
          <span className="text-[11px] text-stone-400">Preços postos na cooperativa / armazém local</span>
        </div>

        {filteredMarkets.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
            <p className="text-stone-500 text-sm">
              Nenhuma praça cafeeira encontrada para os filtros selecionados.
            </p>
            <button
              onClick={() => {
                setSelectedState('ALL');
                setSelectedGroup('all');
                setSelectedDrinkQuality('ALL');
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-800 transition"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMarkets.map(market => {
              const isPositive = market.changeValue >= 0;
              const isSelected = selectedMarketId === market.id;

              return (
                <div
                  key={market.id}
                  className={`bg-white dark:bg-stone-900 border rounded-2xl p-5 shadow-sm transition hover:shadow-md ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                      : 'border-stone-200 dark:border-stone-800'
                  }`}
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {market.state}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          {market.stateName}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-stone-900 dark:text-white mt-1">
                        {market.region}
                      </h3>
                      <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                        {market.coffeeType}
                      </div>
                    </div>

                    {/* Average Price Display */}
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-extrabold font-mono text-stone-900 dark:text-white tabular-nums tracking-tight">
                        {formatBRL(market.avgPrice)}
                      </div>
                      <div className={`text-xs font-bold font-mono tabular-nums flex items-center justify-end gap-1 ${
                        isPositive ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{isPositive ? '+' : ''}{formatBRL(market.changeValue)} ({isPositive ? '+' : ''}{formatNumber(market.changePercent)}%)</span>
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-0.5">por saca de 60kg</span>
                    </div>
                  </div>

                  {/* Main Municipalities in this Hub */}
                  <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] text-stone-500 font-medium">Municípios de referência:</span>
                    {market.mainCities.map(city => (
                      <span
                        key={city}
                        className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px]"
                      >
                        {city}
                      </span>
                    ))}
                  </div>

                  {/* Range & Source */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/40 p-2.5 rounded-xl">
                    <div>
                      <span className="text-[10px] uppercase text-stone-600 dark:text-stone-400 block font-semibold">Faixa Praticada (Mín / Máx)</span>
                      <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">
                        {formatBRL(market.minPrice)} - {formatBRL(market.maxPrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-stone-600 dark:text-stone-400 block font-semibold">Fonte & Liquidez</span>
                      <span className="font-medium text-stone-800 dark:text-stone-200 truncate block">
                        {market.benchmarkSource} · {market.liquidity}
                      </span>
                    </div>
                  </div>

                  {/* Observation snippet */}
                  {market.observations && (
                    <p className="mt-2.5 text-[11px] text-stone-500 dark:text-stone-400 italic leading-relaxed">
                      💡 {market.observations}
                    </p>
                  )}

                  {/* Simulate Sale Button */}
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400">
                      Atualizado: {market.lastUpdated}
                    </span>

                    <button
                      onClick={() => {
                        // Create a temporary quotation representation for the calculator
                        const quoteRep: Quotation = {
                          id: market.id,
                          name: `${market.region} (${market.coffeeType})`,
                          symbol: `${market.state}-REG`,
                          category: 'physical',
                          unit: 'R$/saca (60kg)',
                          price: market.avgPrice,
                          changePercent: market.changePercent,
                          changeValue: market.changeValue,
                          high: market.maxPrice,
                          low: market.minPrice,
                          previousClose: market.avgPrice - market.changeValue,
                          lastUpdated: market.lastUpdated,
                          convertedPriceBRL: market.avgPrice,
                          marketStatus: 'open',
                          description: market.observations || '',
                        };
                        onSelectForCalculator(quoteRep);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Simular Venda nesta Praça</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
