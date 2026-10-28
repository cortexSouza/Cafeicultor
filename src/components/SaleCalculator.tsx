import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Share2,
  BookmarkPlus,
  Trash2,
  DollarSign,
  TrendingUp,
  Percent,
  Truck,
  Building,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Copy,
  ChevronDown,
} from 'lucide-react';
import { Quotation, SaleSimulation } from '../types/market';
import { LBS_PER_BAG, CURRENT_USD_BRL } from '../data/mockMarketData';

interface SaleCalculatorProps {
  initialQuote?: Quotation | null;
  savedSimulations: SaleSimulation[];
  onSaveSimulation: (sim: SaleSimulation) => void;
  onDeleteSimulation: (id: string) => void;
  highContrast: boolean;
}

export const SaleCalculator: React.FC<SaleCalculatorProps> = ({
  initialQuote,
  savedSimulations,
  onSaveSimulation,
  onDeleteSimulation,
  highContrast,
}) => {
  // Base market mode: NY, B3, CEPEA or Manual Custom
  const [baseMode, setBaseMode] = useState<'ny' | 'b3' | 'cepea_arabica' | 'cepea_conilon' | 'custom'>('ny');
  const [exchangeRate, setExchangeRate] = useState<number>(CURRENT_USD_BRL);
  
  // Input parameters
  const [nyCents, setNyCents] = useState<number>(288.65); // ¢/lb
  const [b3Usd, setB3Usd] = useState<number>(332.50); // US$/saca
  const [cepeaPrice, setCepeaPrice] = useState<number>(1915.50); // R$/saca
  const [customGrossPrice, setCustomGrossPrice] = useState<number>(1900.00); // R$/saca
  
  const [bagQuantity, setBagQuantity] = useState<number>(100); // sacas
  
  // Deductions & Local costs
  const [freightPerBag, setFreightPerBag] = useState<number>(15.00); // R$/saca
  const [brokeragePercent, setBrokeragePercent] = useState<number>(1.0); // % de corretagem
  const [funruralPercent, setFunruralPercent] = useState<number>(1.5); // % (Produtor Rural PF: 1.2% INSS + 0.1% RAT + 0.2% SENAR = 1.5%)
  const [storageAndGradingPerBag, setStorageAndGradingPerBag] = useState<number>(8.00); // R$/saca
  const [agioDesagioPerBag, setAgioDesagioPerBag] = useState<number>(25.00); // R$/saca (+ ágio por bebida dura/mole, - deságio por defeito)

  const [notes, setNotes] = useState<string>('Lote de café arábica colheita 2024/25, bebida dura, cooperativa.');
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // When initialQuote is passed from the quotes or regional list
  useEffect(() => {
    if (initialQuote) {
      if (initialQuote.id === 'ice_ny') {
        setBaseMode('ny');
        setNyCents(initialQuote.price);
      } else if (initialQuote.id === 'b3_icf') {
        setBaseMode('b3');
        setB3Usd(initialQuote.price);
      } else if (initialQuote.id === 'cepea_conilon') {
        setBaseMode('cepea_conilon');
        setCepeaPrice(initialQuote.price);
      } else if (initialQuote.id === 'cepea_arabica') {
        setBaseMode('cepea_arabica');
        setCepeaPrice(initialQuote.price);
      } else {
        setBaseMode('custom');
        setCustomGrossPrice(initialQuote.price);
        setNotes(`Cotação base: ${initialQuote.name}`);
      }
    }
  }, [initialQuote]);

  // Real-time gross price calculation
  const calculatedGrossPricePerBag = React.useMemo(() => {
    if (baseMode === 'ny') {
      // (cents / 100) * 132.277357 * USD_BRL
      return (nyCents / 100) * LBS_PER_BAG * exchangeRate;
    }
    if (baseMode === 'b3') {
      // US$/saca * USD_BRL
      return b3Usd * exchangeRate;
    }
    if (baseMode === 'cepea_arabica' || baseMode === 'cepea_conilon') {
      return cepeaPrice;
    }
    return customGrossPrice;
  }, [baseMode, nyCents, b3Usd, cepeaPrice, customGrossPrice, exchangeRate]);

  // Deductions calculation per bag
  const grossWithAgio = calculatedGrossPricePerBag + agioDesagioPerBag;
  const brokeragePerBag = (grossWithAgio * (brokeragePercent / 100));
  const funruralPerBag = (grossWithAgio * (funruralPercent / 100));
  
  const totalDeductionsPerBag = freightPerBag + brokeragePerBag + funruralPerBag + storageAndGradingPerBag;
  const netPricePerBag = Math.max(0, grossWithAgio - totalDeductionsPerBag);

  // Totals for the entire lot
  const grossTotal = grossWithAgio * bagQuantity;
  const totalDeductions = totalDeductionsPerBag * bagQuantity;
  const netTotal = netPricePerBag * bagQuantity;
  const netMarginPercent = grossTotal > 0 ? (netTotal / grossTotal) * 100 : 0;

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatNumber = (val: number, decimals = 2) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  // Build WhatsApp text message
  const handleCopyWhatsApp = () => {
    const text = `*PROPOSTA / SIMULAÇÃO DE VENDA DE CAFÉ* ☕
📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}
📦 *Volume:* ${bagQuantity} sacas de 60kg
📊 *Base de Mercado:* ${
      baseMode === 'ny' ? `Bolsa NY (${nyCents} ¢/lb @ Dólar R$ ${formatNumber(exchangeRate, 4)})` :
      baseMode === 'b3' ? `Bolsa B3 (${b3Usd} US$/sc @ Dólar R$ ${formatNumber(exchangeRate, 4)})` :
      baseMode === 'cepea_arabica' ? 'CEPEA/ESALQ Arábica' :
      baseMode === 'cepea_conilon' ? 'CEPEA/ESALQ Conilon' : 'Preço Físico Direto'
    }

*DEMONSTRATIVO POR SACA:*
• Preço Bruto Base: ${formatBRL(calculatedGrossPricePerBag)}
• Ágio/Deságio Bebida: ${agioDesagioPerBag >= 0 ? '+' : ''}${formatBRL(agioDesagioPerBag)}
• Preço Bruto Ajustado: ${formatBRL(grossWithAgio)}
• Frete Rodoviário: -${formatBRL(freightPerBag)}
• Corretagem (${brokeragePercent}%): -${formatBRL(brokeragePerBag)}
• Funrural (${funruralPercent}%): -${formatBRL(funruralPerBag)}
• Classificação & Armazém: -${formatBRL(storageAndGradingPerBag)}
----------------------------------
*PREÇO LÍQUIDO NA FAZENDA:* ${formatBRL(netPricePerBag)} / saca

*TOTAL GERAL DO LOTE (${bagQuantity} sacas):*
💰 *Valor Bruto:* ${formatBRL(grossTotal)}
✂️ *Deduções Totais:* ${formatBRL(totalDeductions)}
✅ *VALOR LÍQUIDO A RECEBER:* ${formatBRL(netTotal)}

_Gerado pelo App do Cafeicultor_`;

    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 3000);
  };

  // Save current simulation
  const handleSaveCurrent = () => {
    const newSim: SaleSimulation = {
      id: `sim_${Date.now()}`,
      title: `${bagQuantity} sacas · ${baseMode.toUpperCase()}`,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      baseQuoteType: baseMode,
      baseQuoteLabel: baseMode === 'ny' ? `ICE NY (${nyCents} ¢/lb)` : baseMode === 'b3' ? `B3 ICF (${b3Usd} US$/sc)` : 'Mercado Físico',
      baseQuoteValue: calculatedGrossPricePerBag,
      exchangeRate,
      bagQuantity,
      grossPricePerBag: grossWithAgio,
      freightPerBag,
      brokeragePercent,
      brokeragePerBag,
      funruralPercent,
      funruralPerBag,
      storageAndGradingPerBag,
      agioDesagioPerBag,
      totalDeductionsPerBag,
      netPricePerBag,
      grossTotal,
      totalDeductions,
      netTotal,
      netMarginPercent,
      notes,
    };

    onSaveSimulation(newSim);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`p-5 rounded-2xl border transition ${
        highContrast
          ? 'bg-black text-white border-white'
          : 'bg-stone-900 text-stone-100 border-stone-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Simulador de Preço Líquido na Fazenda</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Calculadora de Venda & Descontos do Café
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl mt-1 leading-relaxed">
              Descubra quanto realmente sobrará limpo na sua conta bancária após frete, corretagem, Funrural, classificação e ágio de bebida.
            </p>
          </div>

          {/* Net Price per Bag Hero Metric */}
          <div className="bg-emerald-950/80 border border-emerald-600/70 p-4 rounded-xl text-right shrink-0">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
              Preço Líquido Estimado na Porteira
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
              {formatBRL(netPricePerBag)}
            </div>
            <span className="text-xs text-emerald-300">
              por saca de 60kg
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Inputs & Deductions Configuration (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Market Base Selector */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              1. Escolha a Cotação Base para o Cálculo
            </h3>

            {/* Base Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setBaseMode('ny')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-left ${
                  baseMode === 'ny'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 ring-2 ring-emerald-600/20'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className="font-bold">Bolsa NY (ICE)</div>
                <div className="text-[10px] text-stone-500">¢/lb + Câmbio</div>
              </button>

              <button
                type="button"
                onClick={() => setBaseMode('b3')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-left ${
                  baseMode === 'b3'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 ring-2 ring-emerald-600/20'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className="font-bold">B3 Futuros (ICF)</div>
                <div className="text-[10px] text-stone-500">US$/saca</div>
              </button>

              <button
                type="button"
                onClick={() => setBaseMode('cepea_arabica')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-left ${
                  baseMode === 'cepea_arabica'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 ring-2 ring-emerald-600/20'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className="font-bold">CEPEA Arábica</div>
                <div className="text-[10px] text-stone-500">R$/saca físico</div>
              </button>

              <button
                type="button"
                onClick={() => setBaseMode('custom')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-left ${
                  baseMode === 'custom'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 ring-2 ring-emerald-600/20'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className="font-bold">Preço Fixo</div>
                <div className="text-[10px] text-stone-500">Oferta direta</div>
              </button>
            </div>

            {/* Dynamic Inputs according to Base Mode */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {baseMode === 'ny' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Cotação ICE Nova York (¢ de dólar / lb)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={nyCents}
                      onChange={(e) => setNyCents(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-700"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Ex: 288.65 ¢/lb = US$ 2,8865/lb
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Taxa de Câmbio Dólar (R$/US$)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-700"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      PTAX Banco Central oficial
                    </span>
                  </div>
                </>
              )}

              {baseMode === 'b3' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Cotação B3 Futuros ICF (US$/saca)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={b3Usd}
                      onChange={(e) => setB3Usd(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Taxa de Câmbio Dólar (R$/US$)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </>
              )}

              {baseMode === 'cepea_arabica' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Indicador CEPEA/ESALQ Arábica Físico (R$/saca)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={cepeaPrice}
                    onChange={(e) => setCepeaPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              )}

              {baseMode === 'custom' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Preço Bruto Ofertado pelo Comprador (R$/saca)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={customGrossPrice}
                    onChange={(e) => setCustomGrossPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              )}
            </div>

            {/* Quick Summary of Base Gross Conversion */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
              <span>Preço Bruto Convertido por Saca:</span>
              <strong className="font-mono text-base tabular-nums">
                {formatBRL(calculatedGrossPricePerBag)}
              </strong>
            </div>
          </div>

          {/* Bag Quantity & Presets */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              2. Volume do Lote a Negociar
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Quantidade de Sacas de 60kg:
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={bagQuantity}
                  onChange={(e) => setBagQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-base text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 self-end">
                {[50, 100, 250, 500, 1000].map(qty => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setBagQuantity(qty)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                      bagQuantity === qty
                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    {qty} sc
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Deductions & Quality Adjustment */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              3. Descontos Locais & Padrão de Bebida
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Ágio / Deságio de Bebida */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Ágio / Deságio de Qualidade (R$/saca)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="5"
                    value={agioDesagioPerBag}
                    onChange={(e) => setAgioDesagioPerBag(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Ex: +R$ 25 (Bebida Mole/CD) ou -R$ 40 (Defeitos/Catação)
                </span>
              </div>

              {/* Frete Rodoviário */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Frete Rodoviário Fazenda → Cooperativa (R$/saca)
                </label>
                <input
                  type="number"
                  step="1"
                  value={freightPerBag}
                  onChange={(e) => setFreightPerBag(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-700"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Custo médio: R$ 10 a R$ 25 / saca
                </span>
              </div>

              {/* Corretagem */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Comissão do Corretor / Intermediação (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.25"
                    value={brokeragePercent}
                    onChange={(e) => setBrokeragePercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-700"
                  />
                  <span className="font-mono text-stone-500 font-bold">%</span>
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Dedução: {formatBRL(brokeragePerBag)} / saca
                </span>
              </div>

              {/* Funrural */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Funrural / SENAR (% sobre receita bruta)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={funruralPercent}
                    onChange={(e) => setFunruralPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-700"
                  />
                  <span className="font-mono text-stone-500 font-bold">%</span>
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Padrão Pessoa Física: 1,5% ({formatBRL(funruralPerBag)}/saca)
                </span>
              </div>

              {/* Classificação / Catação / Armazenagem */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Taxas de Classificação, Armazenagem e Catação (R$/saca)
                </label>
                <input
                  type="number"
                  step="1"
                  value={storageAndGradingPerBag}
                  onChange={(e) => setStorageAndGradingPerBag(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Complete Statement & Totals (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Detailed Statement Card */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              Demonstrativo Financeiro do Lote
            </h3>

            {/* Per Bag Breakdown */}
            <div className="space-y-2 text-xs border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex justify-between py-1 text-stone-700 dark:text-stone-300">
                <span>Preço Base de Mercado:</span>
                <span className="font-mono font-semibold">{formatBRL(calculatedGrossPricePerBag)}</span>
              </div>

              <div className="flex justify-between py-1 text-stone-700 dark:text-stone-300">
                <span>Ágio / Deságio de Bebida:</span>
                <span className={`font-mono font-semibold ${agioDesagioPerBag >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {agioDesagioPerBag >= 0 ? '+' : ''}{formatBRL(agioDesagioPerBag)}
                </span>
              </div>

              <div className="flex justify-between py-1 text-stone-900 dark:text-white font-bold bg-stone-50 dark:bg-stone-800/50 px-2 rounded-md">
                <span>Preço Bruto Ajustado:</span>
                <span className="font-mono">{formatBRL(grossWithAgio)}</span>
              </div>

              <div className="flex justify-between py-1 text-stone-500">
                <span>(-) Frete por saca:</span>
                <span className="font-mono">-{formatBRL(freightPerBag)}</span>
              </div>

              <div className="flex justify-between py-1 text-stone-500">
                <span>(-) Corretagem ({brokeragePercent}%):</span>
                <span className="font-mono">-{formatBRL(brokeragePerBag)}</span>
              </div>

              <div className="flex justify-between py-1 text-stone-500">
                <span>(-) Funrural ({funruralPercent}%):</span>
                <span className="font-mono">-{formatBRL(funruralPerBag)}</span>
              </div>

              <div className="flex justify-between py-1 text-stone-500">
                <span>(-) Classificação & Armazém:</span>
                <span className="font-mono">-{formatBRL(storageAndGradingPerBag)}</span>
              </div>

              <div className="flex justify-between py-1.5 text-red-600 font-semibold bg-red-50 dark:bg-red-950/30 px-2 rounded-md">
                <span>Total de Descontos por Saca:</span>
                <span className="font-mono">-{formatBRL(totalDeductionsPerBag)}</span>
              </div>
            </div>

            {/* Total Results Box */}
            <div className="space-y-3 bg-stone-50 dark:bg-stone-800/60 p-4 rounded-xl">
              <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400">
                <span>Valor Total Bruto ({bagQuantity} sc):</span>
                <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{formatBRL(grossTotal)}</span>
              </div>

              <div className="flex justify-between text-xs text-red-600">
                <span>Total de Descontos ({bagQuantity} sc):</span>
                <span className="font-mono font-bold">-{formatBRL(totalDeductions)}</span>
              </div>

              <div className="pt-2 border-t border-stone-200 dark:border-stone-700">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Valor Total Líquido a Receber:
                </span>
                <div className="text-3xl font-extrabold font-mono text-emerald-800 dark:text-emerald-300 tabular-nums">
                  {formatBRL(netTotal)}
                </div>
                <div className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                  <span>Equivalente a:</span>
                  <strong className="text-stone-800 dark:text-stone-200 font-mono">
                    {formatBRL(netPricePerBag)} / saca
                  </strong>
                  <span>· Retenção líquida: {formatNumber(netMarginPercent, 1)}%</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: WhatsApp & Save */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
                {copyFeedback ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Copiado! Pronto para colar no WhatsApp</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Copiar Resumo para WhatsApp</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveCurrent}
                className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>Salvar Proposta no Histórico da Fazenda</span>
              </button>
            </div>
          </div>

          {/* Saved History */}
          {savedSimulations.length > 0 && (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Histórico de Propostas Salvas ({savedSimulations.length})
                </h4>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {savedSimulations.map(sim => (
                  <div
                    key={sim.id}
                    className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-900 dark:text-white">
                        {sim.bagQuantity} sacas · {formatBRL(sim.netPricePerBag)}/sc
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {sim.date} · Total: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{formatBRL(sim.netTotal)}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteSimulation(sim.id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition"
                      title="Excluir simulação"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
