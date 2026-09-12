import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Tag,
  ArrowDownRight,
  ArrowUpRight,
  Activity,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { PricePoint, PriceTrendSummary } from '../../types/priceTrend';
import {
  generate30DayPriceHistory,
  calculatePriceTrendSummary,
  formatIQD,
} from '../../utils/priceTrendUtils';

interface PriceTrendChartProps {
  productId: string;
  productName: string;
  currentPrice: number;
  originalPrice?: number;
  category?: string;
  customHistory?: PricePoint[];
  compact?: boolean;
}

export default function PriceTrendChart({
  productId,
  productName,
  currentPrice,
  originalPrice,
  category = 'general',
  customHistory,
  compact = false,
}: PriceTrendChartProps) {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'ku') as 'ku' | 'ar' | 'en';
  const isRtl = currentLang !== 'en';

  const [timeRange, setTimeRange] = useState<'7' | '14' | '30'>('30');
  const [showAverageLine, setShowAverageLine] = useState(true);

  // Generate or use custom 30-day history
  const fullHistory = useMemo(() => {
    if (customHistory && customHistory.length > 0) {
      return customHistory;
    }
    return generate30DayPriceHistory(productId, currentPrice, originalPrice, category, currentLang);
  }, [productId, currentPrice, originalPrice, category, currentLang, customHistory]);

  // Filter based on selected time range
  const displayHistory = useMemo(() => {
    const days = parseInt(timeRange, 10);
    return fullHistory.slice(Math.max(0, fullHistory.length - days));
  }, [fullHistory, timeRange]);

  // Calculate summary metrics
  const summary: PriceTrendSummary = useMemo(() => {
    return calculatePriceTrendSummary(displayHistory, currentPrice);
  }, [displayHistory, currentPrice]);

  // Determine min and max for Y-Axis with 10% breathing room
  const yDomain = useMemo(() => {
    const prices = displayHistory.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = Math.max(500, (max - min) * 0.15);
    return [Math.max(0, Math.floor((min - padding) / 250) * 250), Math.ceil((max + padding) / 250) * 250];
  }, [displayHistory]);

  // Find lowest point for reference dot
  const lowestPoint = useMemo(() => {
    if (!displayHistory.length) return null;
    return displayHistory.reduce((lowest, current) =>
      current.price < lowest.price ? current : lowest
    );
  }, [displayHistory]);

  // Deal verdict labels & styles
  const getVerdictDetails = () => {
    switch (summary.verdict) {
      case 'best_deal':
        return {
          title: isRtl ? 'باشترین کات بۆ کڕین' : 'Best Time to Buy',
          badge: isRtl ? 'نزیک لە کەمترین نرخی ٣٠ ڕۆژ' : 'At 30-Day Low',
          desc: isRtl
            ? 'ئەم کاڵایە لە نزیکترین یان کەمترین ئاستی نرخی ٣٠ ڕۆژی ڕابردوودایە.'
            : 'This item is at or near its 30-day lowest recorded price.',
          color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
          icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
        };
      case 'good_price':
        return {
          title: isRtl ? 'نرخێکی باش و گونجاو' : 'Good Value',
          badge: isRtl ? 'لە خوار تێکڕای نرخەوەیە' : 'Below Average Price',
          desc: isRtl
            ? `نرخی ئێستا بە ڕێژەی ${Math.abs(
                Math.round(
                  ((summary.currentPrice - summary.averagePrice30d) / summary.averagePrice30d) * 100
                )
              )}٪ لە خوار تێکڕای نرخی مانگی ڕابردووەوەیە.`
            : `Currently ${Math.abs(
                Math.round(
                  ((summary.currentPrice - summary.averagePrice30d) / summary.averagePrice30d) * 100
                )
              )}% below the 30-day market average.`,
          color: 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800',
          icon: <TrendingDown className="w-4 h-4 text-teal-600" />,
        };
      case 'fair_price':
        return {
          title: isRtl ? 'نرخی ئاسایی و جێگیر' : 'Fair Market Price',
          badge: isRtl ? 'تێکڕای نرخی بازاڕ' : 'Average Market Price',
          desc: isRtl
            ? 'نرخی کاڵاکە لە دەوری تێکڕای نرخی ئاسایی مانگانەیە.'
            : 'Price is stable around the 30-day historical average.',
          color: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800',
          icon: <Activity className="w-4 h-4 text-sky-600" />,
        };
      case 'above_average':
      default:
        return {
          title: isRtl ? 'نرخ لە تێکڕا بەرزترە' : 'Above Average Price',
          badge: isRtl ? 'بەرزبوونەوەی کاتی' : 'Recent Price Increase',
          desc: isRtl
            ? 'نرخی ئێستا لە تێکڕای ٣٠ ڕۆژی ڕابردوو بەرزترە.'
            : 'Price is currently higher than the 30-day average.',
          color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
          icon: <TrendingUp className="w-4 h-4 text-amber-600" />,
        };
    }
  };

  const verdict = getVerdictDetails();

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: PricePoint = payload[0].payload;
      const diffFromAvg = data.price - summary.averagePrice30d;
      const isLowest = data.price === summary.lowestPrice30d;
      const isHighest = data.price === summary.highestPrice30d;

      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs backdrop-blur-md min-w-[190px] animate-in fade-in zoom-in-95 duration-150 z-50">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[11px] text-slate-400">
            <span className="font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3 text-primary-400" />
              {data.formattedDate}
            </span>
            {isLowest && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                {isRtl ? 'کەمترین نرخ' : '30d Low'}
              </span>
            )}
            {isHighest && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                {isRtl ? 'بەرزترین نرخ' : '30d High'}
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <span className="text-slate-300">{isRtl ? 'نرخ لەو ڕۆژەدا:' : 'Price:'}</span>
            <span className="font-mono font-bold text-sm text-white">
              {formatIQD(data.price, currentLang)}
            </span>
          </div>

          {data.note && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center gap-1 text-[11px] text-amber-300">
              <Tag className="w-3 h-3 shrink-0" />
              <span>{data.note}</span>
            </div>
          )}

          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
            <span>{isRtl ? 'جیاوازی لە تێکڕا:' : 'Vs Average:'}</span>
            <span
              className={`font-semibold ${
                diffFromAvg < 0
                  ? 'text-emerald-400'
                  : diffFromAvg > 0
                  ? 'text-rose-400'
                  : 'text-slate-300'
              }`}
            >
              {diffFromAvg === 0
                ? '0 IQD'
                : `${diffFromAvg > 0 ? '+' : ''}${formatIQD(diffFromAvg, currentLang)}`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id={`price-trend-${productId}`}
      className={`rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all ${
        compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'
      }`}
    >
      {/* 1. Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              {isRtl ? 'شیکاری و مێژووی نرخی ٣٠ ڕۆژ' : '30-Day Price Fluctuations & Trend'}
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isRtl
              ? 'چاودێری گۆڕانکارییەکانی نرخ لە بازاڕی کوردستان'
              : 'Historical price points and deal intelligence'}
          </p>
        </div>

        {/* Timeframe selector (7D / 14D / 30D) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          {(['7', '14', '30'] as const).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setTimeRange(days)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                timeRange === days
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {days}
              {isRtl ? ' ڕۆژ' : 'D'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5">
        {/* Metric 1: Current Price */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
            {isRtl ? 'نرخی ئێستا' : 'Current Price'}
          </span>
          <div className="font-bold font-mono text-sm sm:text-base text-slate-900 dark:text-white truncate">
            {formatIQD(summary.currentPrice, currentLang)}
          </div>
          {summary.priceChange30d !== 0 && (
            <div
              className={`flex items-center gap-0.5 text-[11px] font-bold mt-1 ${
                summary.priceChange30d < 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {summary.priceChange30d < 0 ? (
                <ArrowDownRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5" />
              )}
              <span>
                {Math.abs(summary.priceChangePercent30d)}% ({formatIQD(Math.abs(summary.priceChange30d), currentLang)})
              </span>
            </div>
          )}
        </div>

        {/* Metric 2: 30-Day Lowest Price */}
        <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              {isRtl ? 'کەمترین نرخ (٣٠ ڕۆژ)' : '30-Day Lowest'}
            </span>
            {summary.isLowestIn30Days && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            )}
          </div>
          <div className="font-bold font-mono text-sm sm:text-base text-emerald-700 dark:text-emerald-300 truncate">
            {formatIQD(summary.lowestPrice30d, currentLang)}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
            {summary.isLowestIn30Days
              ? isRtl
                ? '⭐ ئێستا لە کەمترین ئاستە'
                : '⭐ Lowest price recorded today'
              : isRtl
              ? `${lowestPoint?.formattedDate || ''}`
              : `Recorded on ${lowestPoint?.date || ''}`}
          </span>
        </div>

        {/* Metric 3: 30-Day Average Price */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
            {isRtl ? 'تێکڕای نرخ' : 'Average Price'}
          </span>
          <div className="font-bold font-mono text-sm sm:text-base text-slate-900 dark:text-white truncate">
            {formatIQD(summary.averagePrice30d, currentLang)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {isRtl ? 'تێکڕای هاوسەنگ' : 'Weighted average'}
          </span>
        </div>

        {/* Metric 4: 30-Day Highest Price / Max Savings */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
            {isRtl ? 'بەرزترین نرخ' : '30-Day Peak'}
          </span>
          <div className="font-bold font-mono text-sm sm:text-base text-slate-900 dark:text-white truncate">
            {formatIQD(summary.highestPrice30d, currentLang)}
          </div>
          {summary.savingsVsHighest > 0 ? (
            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 block mt-1">
              {isRtl
                ? `داشکاندنی ${formatIQD(summary.savingsVsHighest, currentLang)}`
                : `Save ${formatIQD(summary.savingsVsHighest, currentLang)} vs Peak`}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 block mt-1">
              {isRtl ? 'بەرزترین لەم ماوەیەدا' : 'Peak in this period'}
            </span>
          )}
        </div>
      </div>

      {/* 3. Recharts Area Chart Visualization */}
      <div className="w-full h-56 sm:h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={displayHistory}
            margin={{ top: 12, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`priceGradient-${productId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id={`lowestGradient-${productId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800/80"
            />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              minTickGap={20}
              interval="preserveStartEnd"
            />

            <YAxis
              domain={yDomain}
              orientation={isRtl ? 'right' : 'left'}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              width={35}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Reference Line for 30-Day Average */}
            {showAverageLine && (
              <ReferenceLine
                y={summary.averagePrice30d}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: isRtl ? 'تێکڕای نرخ' : 'Average',
                  position: isRtl ? 'insideRight' : 'insideLeft',
                  fill: '#d97706',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}

            {/* Reference Line for 30-Day Lowest Price */}
            <ReferenceLine
              y={summary.lowestPrice30d}
              stroke="#10b981"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{
                value: isRtl ? 'کەمترین نرخ' : 'Lowest (30d)',
                position: isRtl ? 'insideTopLeft' : 'insideTopRight',
                fill: '#059669',
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            {/* Area Line */}
            <Area
              type="monotone"
              dataKey="price"
              stroke="#0284c7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#priceGradient-${productId})`}
              activeDot={{
                r: 6,
                fill: '#0284c7',
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
            />

            {/* Highlight lowest dot if in range */}
            {lowestPoint && (
              <ReferenceDot
                x={lowestPoint.date}
                y={lowestPoint.price}
                r={5}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Chart Legend & Average Line Toggle */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
            <span className="w-3 h-1 bg-sky-600 rounded-full" />
            <span>{isRtl ? 'مێژووی نرخ' : 'Price History'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500" />
            <span>{isRtl ? 'کەمترین نرخی تۆمارکراو' : 'Lowest Price Marker'}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAverageLine(!showAverageLine)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md transition-colors ${
              showAverageLine
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500" />
            <span>{isRtl ? 'هێڵی تێکڕا' : 'Avg Line'}</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-primary-500 shrink-0" />
          <span>{isRtl ? 'نوێکراوەتەوە: ڕاستەوخۆ لە سیستەمی شاخ' : 'Verified by SHAKH Pricing Engine'}</span>
        </div>
      </div>

      {/* 5. Deal Intelligence Verdict Card */}
      <div className={`mt-4 p-3.5 rounded-2xl border flex items-start gap-3 ${verdict.color}`}>
        <div className="p-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 shrink-0 shadow-xs">
          {verdict.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs sm:text-sm">{verdict.title}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/90 dark:bg-slate-900/90 shadow-2xs">
              {verdict.badge}
            </span>
          </div>
          <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{verdict.desc}</p>
        </div>
      </div>
    </div>
  );
}
