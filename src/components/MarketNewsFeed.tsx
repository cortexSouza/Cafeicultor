import React, { useState } from 'react';
import {
  Newspaper,
  CloudSun,
  Flame,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { MARKET_NEWS, DAILY_MARKET_BULLETIN } from '../data/mockMarketData';
import { MarketNewsItem } from '../types/market';

// Generated image assets paths
const IMAGE_MAP: Record<string, string> = {
  coffee_cherries_harvest: '/src/assets/images/coffee_cherries_harvest_1793178627790.jpg',
  coffee_plantation_landscape: '/src/assets/images/coffee_plantation_landscape_1793178628759.jpg',
  coffee_cupping_grading: '/src/assets/images/coffee_cupping_grading_1793178630451.jpg',
};

interface MarketNewsFeedProps {
  highContrast: boolean;
}

export const MarketNewsFeed: React.FC<MarketNewsFeedProps> = ({ highContrast }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [readingArticle, setReadingArticle] = useState<MarketNewsItem | null>(null);

  const categories = [
    { id: 'all', label: 'Todas as Análises' },
    { id: 'clima', label: 'Clima & Lavouras' },
    { id: 'estoques_usda', label: 'Estoques & USDA' },
    { id: 'analise_comercial', label: 'Dicas de Comercialização' },
    { id: 'cambio_macro', label: 'Câmbio & Economia' },
  ];

  const filteredNews = MARKET_NEWS.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Daily Market Bulletin (Termômetro do Mercado) */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition shadow-sm ${
        highContrast
          ? 'bg-black text-white border-white'
          : 'bg-stone-900 text-stone-100 border-stone-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{DAILY_MARKET_BULLETIN.date}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              {DAILY_MARKET_BULLETIN.headline}
            </h1>
          </div>

          {/* Market Thermometer Badge */}
          <div className="flex items-center gap-2.5 bg-emerald-950/80 border border-emerald-600/70 px-4 py-2.5 rounded-xl shrink-0">
            <Flame className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Termômetro de Venda
              </span>
              <span className="text-sm font-bold text-white">
                FAVORÁVEL PARA TRAVAS
              </span>
            </div>
          </div>
        </div>

        {/* 3 Key Takeaways (Sem economês) */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {DAILY_MARKET_BULLETIN.keyTakeaways.map((point, idx) => (
            <div
              key={idx}
              className="bg-stone-800/60 border border-stone-700/60 p-3.5 rounded-xl text-xs text-stone-300 leading-relaxed flex items-start gap-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-800/80 text-emerald-200 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p>{point}</p>
            </div>
          ))}
        </div>

        {/* Executive Practical Action */}
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-900/30 border border-emerald-700/50 flex items-center gap-3 text-xs text-emerald-200">
          <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <strong className="text-white font-semibold">Orientação para a Porteira: </strong>
            {DAILY_MARKET_BULLETIN.recommendedAction}
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* News Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredNews.map(item => {
          const imageSrc = item.imageKey ? IMAGE_MAP[item.imageKey] : null;

          return (
            <div
              key={item.id}
              onClick={() => setReadingArticle(item)}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              {/* Optional Photo Header */}
              {imageSrc && (
                <div className="h-44 w-full relative overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src={imageSrc}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider">
                    {item.categoryLabel}
                  </div>
                </div>
              )}

              {/* Text Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-400 mb-1.5">
                    <span>{item.source}</span>
                    <span>·</span>
                    <span>{item.date}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 dark:text-white leading-snug hover:text-emerald-700 transition">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Practical Tip Callout */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl flex items-start gap-2 text-[11px] text-emerald-900 dark:text-emerald-300">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block">Dica para a fazenda:</strong>
                      <span className="line-clamp-2">{item.producerTip}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <span>Ler análise completa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Article Detail Reading Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8">
            {readingArticle.imageKey && IMAGE_MAP[readingArticle.imageKey] && (
              <div className="h-56 w-full relative">
                <img
                  src={IMAGE_MAP[readingArticle.imageKey]}
                  alt={readingArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setReadingArticle(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center font-bold hover:bg-black/80 transition"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="p-6 space-y-4">
              {!readingArticle.imageKey && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setReadingArticle(null)}
                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-2">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {readingArticle.categoryLabel}
                  </span>
                  <span>·</span>
                  <span>{readingArticle.source}</span>
                  <span>·</span>
                  <span>{readingArticle.date}</span>
                </div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-white leading-snug">
                  {readingArticle.title}
                </h2>
              </div>

              <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-xl text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm font-bold block mb-1">
                    Dica Prática para o Cafeicultor:
                  </strong>
                  <p className="leading-relaxed">{readingArticle.producerTip}</p>
                </div>
              </div>

              <div className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed space-y-3 font-normal">
                <p>{readingArticle.fullBody}</p>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                <button
                  onClick={() => setReadingArticle(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-semibold"
                >
                  Fechar Notícia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
