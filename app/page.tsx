"use client";

import React, { useState } from "react";
import {
  Zap,
  Compass,
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Layers,
  Sparkles,
  BarChart3,
  Flame,
  ChevronRight,
  Radio,
  Search,
  Filter,
} from "lucide-react";
import {
  useSignals,
  useAnalysis,
  useTrades,
  usePagination,
  SignalDocument,
  AnalysisDocument,
  TradeDocument,
} from "./composable/getCollection";
import Loading from "./components/Loading";
import TradeDetailsModal from "./components/TradeDetailsModal";
import Pagination from "./components/Pagination";

// Helper for formatted timestamps
function formatTime(val: any): string {
  if (!val) return "—";
  try {
    const date =
      typeof val === "object" && val?.toDate ? val.toDate() : new Date(val);
    if (isNaN(date.getTime())) return String(val);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return String(val);
  }
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"all" | "signals" | "analysis" | "trades">("all");
  const [tradeFilter, setTradeFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [selectedTrade, setSelectedTrade] = useState<TradeDocument | null>(null);

  // Real-time Firestore hooks
  const { data: signals, loading: signalsLoading } = useSignals();
  const { data: analysisList, loading: analysisLoading } = useAnalysis();
  const { data: trades, loading: tradesLoading } = useTrades();

  // Get most recent items
  const latestSignal: SignalDocument | null = signals && signals.length > 0 ? signals[0] : null;
  const latestAnalysis: AnalysisDocument | null = analysisList && analysisList.length > 0 ? analysisList[0] : null;

  // Calculate trade stats
  const totalTrades = trades?.length || 0;
  const openTrades = trades?.filter((t) => t.status === "OPEN") || [];
  const closedTrades = trades?.filter((t) => t.status?.startsWith("CLOSED")) || [];
  const winningTrades = closedTrades.filter(
    (t) => (t.final_pnl_points && t.final_pnl_points > 0) || (t.profit && t.profit > 0)
  );
  const winRate =
    closedTrades.length > 0
      ? Math.round((winningTrades.length / closedTrades.length) * 100)
      : 0;

  const totalPnlPoints = closedTrades.reduce(
    (acc, t) => acc + (Number(t.final_pnl_points) || 0),
    0
  );

  const filteredTrades =
    tradeFilter === "ALL"
      ? trades || []
      : tradeFilter === "OPEN"
      ? openTrades
      : closedTrades;

  const {
    paginatedItems: paginatedTrades,
    page: tradePage,
    pageSize: tradePageSize,
    totalPages: tradeTotalPages,
    totalItems: tradeTotalItems,
    goToPage: setTradePage,
    setPageSize: setTradePageSize,
  } = usePagination(filteredTrades, { pageSize: 10 });

  const handleTradeFilterChange = (filter: "ALL" | "OPEN" | "CLOSED") => {
    setTradeFilter(filter);
    setTradePage(1);
  };

  if (signalsLoading && analysisLoading && tradesLoading && !signals && !analysisList && !trades) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <Loading
          message="Connecting to Live Intelligence..."
          subtitle="Streaming XAU/USD signals, algorithmic analysis & MT5 telemetry"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 p-4 md:p-8 space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Flame size={14} className="fill-amber-500" /> XAU/USD Gold Spot
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Analysis Trading Intelligence
          </h1>
          {/* <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Real-time feed streaming algorithmic signals, deep technical analysis, and automated execution logs.
          </p> */}
        </div>

        {/* Quick Tabs Pill */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900/90 border border-slate-300/60 dark:border-slate-800 text-xs font-semibold w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 sm:flex-initial text-center px-3 sm:px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "all"
                ? "filter-pill-active font-bold shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("signals")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === "signals"
                ? "filter-pill-active font-bold shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Zap size={14} /> Signals ({signals?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("analysis")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === "analysis"
                ? "filter-pill-active font-bold shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Compass size={14} /> Analysis ({analysisList?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("trades")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === "trades"
                ? "filter-pill-active font-bold shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp size={14} /> Trades ({trades?.length || 0})
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Latest AI Signal */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Current Signal
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Zap size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span
              className={`text-2xl font-black tracking-tight uppercase ${
                latestSignal?.signal === "BUY"
                  ? "text-emerald-500"
                  : latestSignal?.signal === "SELL"
                  ? "text-rose-500"
                  : "text-amber-500"
              }`}
            >
              {latestSignal?.signal || "WAIT / SCANNING"}
            </span>
            {latestSignal?.confidence && (
              <span className="text-xs font-bold text-slate-400 uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                {latestSignal.confidence}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
            {latestSignal?.reason || "System monitoring key confluence zones"}
          </p>
        </div>

        {/* KPI 2: Market Bias & Structure */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              HTF Trend & Bias
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Compass size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {latestAnalysis?.multi_timeframe?.htf_trend || "BEARISH"}
            </span>
            <span className="text-xs text-slate-400 font-medium">1H Timeframe</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Zone: <span className="font-semibold text-slate-700 dark:text-slate-200">{latestAnalysis?.support_resistance?.zone || "CONSOLIDATION"}</span>
          </p>
        </div>

        {/* KPI 3: Open Positions */}
        <div
          onClick={() => {
            if (openTrades.length > 0) setSelectedTrade(openTrades[0]);
          }}
          className={`p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden transition-all ${
            openTrades.length > 0 ? "cursor-pointer hover:border-blue-500/50 hover:shadow-md" : ""
          }`}
          title={openTrades.length > 0 ? "Click to view active position details" : undefined}
        >
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Positions
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Activity size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {openTrades.length}
            </span>
            <span className="text-xs text-slate-400">orders open</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span>Total trades: <strong className="font-semibold text-slate-700 dark:text-slate-300">{totalTrades}</strong></span>
            {openTrades.length > 0 && (
              <span className="text-[10px] font-bold text-blue-500 flex items-center gap-0.5">
                View Active <ChevronRight size={12} />
              </span>
            )}
          </div>
        </div>

        {/* KPI 4: Win Rate & Net PnL */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Closed Win Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <BarChart3 size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-emerald-500">
              {winRate}%
            </span>
            <span className="text-xs text-slate-400">
              ({winningTrades.length}W / {closedTrades.length - winningTrades.length}L)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Net PnL:{" "}
            <span
              className={`font-bold ${
                totalPnlPoints >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {totalPnlPoints >= 0 ? `+${totalPnlPoints.toFixed(2)}` : totalPnlPoints.toFixed(2)} pts
            </span>
          </p>
        </div>
      </div>

      {/* SECTION 1: SIGNALS LIST */}
      {(activeTab === "all" || activeTab === "signals") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Zap size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">AI Trading Signals</h2>
                {/* <p className="text-xs text-slate-500 dark:text-slate-400">
                  Live Firestore signal setups with entry, Stop Loss, and multi-tier Take Profit targets
                </p> */}
              </div>
            </div>
            {signalsLoading && (
              <span className="text-xs text-slate-400 animate-pulse">Syncing signals...</span>
            )}
          </div>

          {signals && signals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signals.map((sig) => {
                const isBuy = sig.signal === "BUY";
                const isSell = sig.signal === "SELL";
                const borderClass = isBuy
                  ? "border-emerald-500/30 hover:border-emerald-500/60"
                  : isSell
                  ? "border-rose-500/30 hover:border-rose-500/60"
                  : "border-slate-200 dark:border-slate-800";

                return (
                  <div
                    key={sig.id}
                    className={`p-5 rounded-2xl bg-white dark:bg-slate-900/80 border ${borderClass} shadow-sm transition-all hover:shadow-md space-y-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase ${
                            isBuy
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : isSell
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                              : "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30"
                          }`}
                        >
                          {sig.signal || "WAIT"}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          {sig.symbol || "XAU/USD"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {formatTime(sig.timestamp_utc || sig.createdAt)}
                      </span>
                    </div>

                    {/* Setup Parameters */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Entry Price</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {sig.price || sig.setup?.entry_price ? `$${(sig.price || sig.setup?.entry_price)?.toFixed(2)}` : "Market"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Stop Loss</span>
                        <span className="font-bold text-rose-500">
                          {sig.stop_loss || sig.setup?.stop_loss ? `$${(sig.stop_loss || sig.setup?.stop_loss)?.toFixed(2)}` : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Take Profit (TP1)</span>
                        <span className="font-bold text-emerald-500">
                          {sig.tp1 || sig.setup?.tp1 ? `$${(sig.tp1 || sig.setup?.tp1)?.toFixed(2)}` : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Final TP</span>
                        <span className="font-bold text-emerald-500">
                          {sig.take_profit || sig.setup?.take_profit ? `$${(sig.take_profit || sig.setup?.take_profit)?.toFixed(2)}` : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    {sig.reason && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {sig.reason}
                      </p>
                    )}

                    {/* Risk/Reward & Confidence Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                      <span className="text-slate-400">
                        Risk/Reward:{" "}
                        <strong className="text-slate-700 dark:text-slate-200">
                          {sig.setup?.risk_reward_ratio ? `1:${sig.setup.risk_reward_ratio}` : "1:2.0"}
                        </strong>
                      </span>
                      <span className="text-slate-400">
                        Confidence:{" "}
                        <strong className="text-amber-500 uppercase font-semibold">
                          {sig.confidence || sig.setup?.confidence || "Normal"}
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
              <Zap className="mx-auto text-slate-400 opacity-60" size={32} />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                No active signals yet in Firestore
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Signals will populate automatically as the python gold trading backend computes confluences.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: TECHNICAL ANALYSIS */}
      {(activeTab === "all" || activeTab === "analysis") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Compass size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Market Technical Analysis</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Multi-timeframe trend alignment, support & resistance pivots, and news filter status
                </p>
              </div>
            </div>
            {analysisLoading && (
              <span className="text-xs text-slate-400 animate-pulse">Syncing analysis...</span>
            )}
          </div>

          {latestAnalysis ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Card 1: Multi-Timeframe Alignment */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Timeframe Confluence
                  </span>
                  <Layers size={16} className="text-blue-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Higher Timeframe (1H)</span>
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                        latestAnalysis.multi_timeframe?.htf_trend === "BULLISH"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-rose-500/15 text-rose-400"
                      }`}
                    >
                      {latestAnalysis.multi_timeframe?.htf_trend || "BEARISH"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Entry Timeframe (5M)</span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400">
                      {latestAnalysis.multi_timeframe?.entry_signal || latestAnalysis.signal || "WAIT"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-xs text-slate-500 dark:text-slate-400">News Calendar Guard</span>
                    <span
                      className={`text-xs font-extrabold flex items-center gap-1 ${
                        latestAnalysis.news_filter?.allowed !== false
                          ? "text-emerald-500"
                          : "text-amber-500"
                      }`}
                    >
                      <ShieldCheck size={14} />
                      {latestAnalysis.news_filter?.allowed !== false ? "CLEAR / PERMITTED" : "BLOCKED"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Support & Resistance Levels */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Pivot & Key Price Levels
                  </span>
                  <Target size={16} className="text-amber-500" />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400">Resistance 2 (R2)</span>
                    <span className="font-bold text-rose-400">
                      ${latestAnalysis.support_resistance?.classic?.r2?.toFixed(2) || "4,122.17"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400">Resistance 1 (R1)</span>
                    <span className="font-bold text-rose-400">
                      ${latestAnalysis.support_resistance?.classic?.r1?.toFixed(2) || "4,116.88"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60 font-semibold bg-amber-500/5 px-2 rounded">
                    <span className="text-amber-500">Pivot Point (PP)</span>
                    <span className="font-bold text-amber-500">
                      ${latestAnalysis.support_resistance?.pivot_point?.toFixed(2) || "4,114.19"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400">Support 1 (S1)</span>
                    <span className="font-bold text-emerald-400">
                      ${latestAnalysis.support_resistance?.classic?.s1?.toFixed(2) || "4,108.91"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Support 2 (S2)</span>
                    <span className="font-bold text-emerald-400">
                      ${latestAnalysis.support_resistance?.classic?.s2?.toFixed(2) || "4,106.22"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Technical Indicators & Rationales */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Indicator Overlays
                    </span>
                    <Activity size={16} className="text-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {latestAnalysis.reason ||
                      "Market in WAIT mode: scanning for confluence across 5min entry and 1h higher timeframe."}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <span>Last computed</span>
                  <span className="font-semibold text-slate-300">
                    {formatTime(latestAnalysis.timestamp_utc || latestAnalysis.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
              <Compass className="mx-auto text-slate-400 opacity-60" size={32} />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                No analysis snapshots recorded in Firestore yet
              </p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: TRADES TABLE */}
      {(activeTab === "all" || activeTab === "trades") && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Execution Trades Log</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time MetaTrader 5 execution and backtest position outcomes
                </p>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800 text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => handleTradeFilterChange("ALL")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  tradeFilter === "ALL"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All ({trades?.length || 0})
              </button>
              <button
                onClick={() => handleTradeFilterChange("OPEN")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  tradeFilter === "OPEN"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Open ({openTrades.length})
              </button>
              <button
                onClick={() => handleTradeFilterChange("CLOSED")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  tradeFilter === "CLOSED"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Closed ({closedTrades.length})
              </button>
            </div>
          </div>

          {filteredTrades.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Ticket / ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Side</th>
                    <th className="py-3 px-4">Entry</th>
                    <th className="py-3 px-4">SL / TP</th>
                    <th className="py-3 px-4">Exit</th>
                    <th className="py-3 px-4">PnL Points</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Exit Reason</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {paginatedTrades.map((t) => {
                    const isBuy = t.direction === "BUY" || t.action === "BUY";
                    const pnl = Number(t.final_pnl_points) || Number(t.pnl_points) || 0;
                    const isWin = pnl > 0;

                    return (
                      <tr
                        key={t.id || t.ticket}
                        onClick={() => setSelectedTrade(t)}
                        className="hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 truncate max-w-35 group-hover:text-blue-500 transition-colors">
                          {t.ticket ? `#${t.ticket}` : t.id?.replace("trade_", "") || "—"}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                              <Clock size={12} className="text-blue-500 shrink-0" />
                              <span>{formatTime(t.entry_time || t.createdAt)}</span>
                            </div>
                            {t.status === "OPEN" ? (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Running Position
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                Exit: {formatTime(t.exit_time || t.updatedAt || t.createdAt)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                              isBuy
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {isBuy ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {t.direction || t.action || "BUY"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                          {t.entry_price ? `$${t.entry_price.toFixed(2)}` : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                          <span className="text-rose-400">{t.stop_loss ? `$${t.stop_loss.toFixed(2)}` : t.sl ? `$${t.sl.toFixed(2)}` : "—"}</span>
                          {" / "}
                          <span className="text-emerald-400">{t.take_profit ? `$${t.take_profit.toFixed(2)}` : t.tp ? `$${t.tp.toFixed(2)}` : "—"}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {t.exit_price ? `$${t.exit_price.toFixed(2)}` : "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          {t.status === "OPEN" ? (
                            <span className="text-blue-500 font-semibold animate-pulse">Running</span>
                          ) : (
                            <span
                              className={`font-bold ${
                                isWin ? "text-emerald-500" : pnl < 0 ? "text-rose-500" : "text-slate-400"
                              }`}
                            >
                              {pnl > 0 ? `+${pnl.toFixed(2)}` : pnl.toFixed(2)} pts
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              t.status === "OPEN"
                                ? "bg-blue-500/15 text-blue-500 border border-blue-500/30 animate-pulse"
                                : t.status === "CLOSED_TP"
                                ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-50 truncate" title={t.exit_reason || t.reason}>
                          {t.exit_reason || t.reason || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTrade(t);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:btn-accent hover:text-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-sm cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Table pagination footer */}
              {tradeTotalItems > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-800/80 px-4 py-2 bg-slate-50/50 dark:bg-slate-950/40">
                  <Pagination
                    currentPage={tradePage}
                    totalPages={tradeTotalPages}
                    totalItems={tradeTotalItems}
                    pageSize={tradePageSize}
                    onPageChange={setTradePage}
                    onPageSizeChange={setTradePageSize}
                    pageSizeOptions={[5, 10, 20]}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
              <TrendingUp className="mx-auto text-slate-400 opacity-60" size={32} />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                No trades match current filter
              </p>
            </div>
          )}
        </div>
      )}

      {/* Trade Details Popup Modal */}
      <TradeDetailsModal
        trade={selectedTrade}
        isOpen={Boolean(selectedTrade)}
        onClose={() => setSelectedTrade(null)}
      />
    </div>
  );
}
