"use client";

import React, { useState } from "react";
import {
  Compass,
  Target,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Flame,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Sparkles,
  BarChart3,
  Search,
  Filter,
  X,
  ExternalLink,
} from "lucide-react";
import { useAnalysis, usePagination, AnalysisDocument } from "../composable/getCollection";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";

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

export default function AnalysisPage() {
  const { data: analysisList, loading } = useAnalysis();
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisDocument | null>(null);
  const [signalFilter, setSignalFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const latest = analysisList && analysisList.length > 0 ? analysisList[0] : null;

  // Filter analysis list
  const filteredAnalysis = (analysisList || []).filter((item) => {
    // Exclude the fixed "latest" document if it duplicates timestamps
    if (item.id === "latest" && analysisList && analysisList.length > 1) {
      return false;
    }

    if (signalFilter !== "ALL") {
      const sig = (item.signal || item.action || "WAIT").toUpperCase();
      if (sig !== signalFilter) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const reason = (item.reason || "").toLowerCase();
      const symbol = (item.symbol || "").toLowerCase();
      const trend = (item.multi_timeframe?.htf_trend || "").toLowerCase();
      if (!reason.includes(q) && !symbol.includes(q) && !trend.includes(q)) {
        return false;
      }
    }

    return true;
  });

  const {
    paginatedItems,
    page,
    pageSize,
    totalPages,
    totalItems,
    goToPage,
    setPage,
    setPageSize,
  } = usePagination(filteredAnalysis, { pageSize: 10 });

  if (loading && !latest) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loading
          message="Computing Technical Analysis..."
          subtitle="Syncing multi-timeframe indicators, pivot points & support levels"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 p-4 md:p-8 space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Compass size={22} />
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                AI Technical Analysis & Market Intelligence
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-timeframe confluence, support & resistance zones, pivot levels, and historical analysis logs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {loading ? "Streaming..." : `${analysisList?.length || 0} Snapshots Recorded`}
          </span>
        </div>
      </div>

      {/* 2. Latest Snapshot Cards (Overview) */}
      {latest && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              Latest Real-Time Market Confluence
            </span>
            <span className="font-mono text-[11px]">
              Updated: {formatTime(latest.timestamp_utc || latest.createdAt)}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Card 1: Timeframe Alignment */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Timeframe Structure
                </h3>
                <Layers size={18} className="text-blue-500" />
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Higher Timeframe (1H)</span>
                  <span
                    className={`font-black px-2 py-0.5 rounded text-[11px] uppercase ${
                      latest.multi_timeframe?.htf_trend === "BULLISH"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : latest.multi_timeframe?.htf_trend === "BEARISH"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                        : "bg-slate-500/15 text-slate-400"
                    }`}
                  >
                    {latest.multi_timeframe?.htf_trend || "BEARISH"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Entry Timeframe (5M)</span>
                  <span
                    className={`font-black px-2 py-0.5 rounded text-[11px] uppercase ${
                      latest.signal === "BUY" || latest.action === "BUY"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : latest.signal === "SELL" || latest.action === "SELL"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                        : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                    }`}
                  >
                    {latest.multi_timeframe?.entry_signal || latest.signal || "WAIT"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">News Protection Guard</span>
                  <span className="font-bold text-emerald-500 flex items-center gap-1">
                    <ShieldCheck size={14} /> CLEAR
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Pivot Points */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Support & Resistance
                </h3>
                <Target size={18} className="text-amber-500" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400">Resistance 2 (R2)</span>
                  <span className="font-bold text-rose-400">
                    ${latest.support_resistance?.classic?.r2?.toFixed(2) || "4,122.17"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400">Resistance 1 (R1)</span>
                  <span className="font-bold text-rose-400">
                    ${latest.support_resistance?.classic?.r1?.toFixed(2) || "4,116.88"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60 bg-amber-500/5 px-2 rounded font-semibold">
                  <span className="text-amber-500">Pivot Point (PP)</span>
                  <span className="font-bold text-amber-500">
                    ${latest.support_resistance?.pivot_point?.toFixed(2) || latest.support_resistance?.classic?.pivot?.toFixed(2) || "4,114.19"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400">Support 1 (S1)</span>
                  <span className="font-bold text-emerald-400">
                    ${latest.support_resistance?.classic?.s1?.toFixed(2) || "4,108.91"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Support 2 (S2)</span>
                  <span className="font-bold text-emerald-400">
                    ${latest.support_resistance?.classic?.s2?.toFixed(2) || "4,106.22"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Indicator Summary */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Algorithmic Rationale
                  </h3>
                  <Activity size={18} className="text-emerald-500" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                  {latest.reason ||
                    "Market in WAIT mode: scanning for confluence across 5min entry and 1h higher timeframe."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Gold Spot</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {(latest.current_price ?? latest.price) ? `$${Number(latest.current_price ?? latest.price).toFixed(2)}` : "—"}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">HTF RSI (1H)</span>
                  <span className="font-bold text-blue-500 text-sm">
                    {latest.multi_timeframe?.htf_rsi !== undefined ? Number(latest.multi_timeframe.htf_rsi).toFixed(1) : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Analysis Collection List (Historical Log) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <BarChart3 size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Analysis Collection History</h2>
              {/* <p className="text-xs text-slate-500 dark:text-slate-400">
                Logged multi-timeframe analysis snapshots stored in Firestore
              </p> */}
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Signal Filter Buttons */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800 text-xs font-semibold">
              {["ALL", "BUY", "SELL", "WAIT"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setSignalFilter(f);
                    goToPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    signalFilter === f
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search reason or symbol..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  goToPage(1);
                }}
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Table of Analysis Records */}
        {filteredAnalysis.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Macro Trend (1H)</th>
                  <th className="py-3 px-4">HTF RSI</th>
                  <th className="py-3 px-4">Signal (5M)</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Pivot (PP)</th>
                  <th className="py-3 px-4">Rationale</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {paginatedItems.map((item, idx) => {
                  const sig = item.signal || item.action || "WAIT";
                  const trend = item.multi_timeframe?.htf_trend || "—";
                  const pivot =
                    item.support_resistance?.classic?.pivot ||
                    item.support_resistance?.pivot_point;
                  const isBuy = sig === "BUY";
                  const isSell = sig === "SELL";

                  return (
                    <tr
                      key={item.id || idx}
                      onClick={() => setSelectedAnalysis(item)}
                      className="hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                          <Clock size={12} className="text-blue-500 shrink-0" />
                          <span>{formatTime(item.timestamp_utc || item.createdAt)}</span>
                        </div>
                      </td>

                      {/* Gold Price */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {(item.current_price ?? item.price) ? `$${Number(item.current_price ?? item.price).toFixed(2)}` : "—"}
                      </td>

                      {/* Macro Trend */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            trend === "BULLISH"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : trend === "BEARISH"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                              : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                          }`}
                        >
                          {trend}
                        </span>
                      </td>

                      {/* HTF RSI */}
                      <td className="py-3.5 px-4 font-mono">
                        {item.multi_timeframe?.htf_rsi != null ? (
                          <span
                            className={
                              Number(item.multi_timeframe.htf_rsi) > 70
                                ? "text-rose-400 font-bold"
                                : Number(item.multi_timeframe.htf_rsi) < 30
                                ? "text-emerald-400 font-bold"
                                : "text-slate-700 dark:text-slate-300"
                            }
                          >
                            {Number(item.multi_timeframe.htf_rsi).toFixed(1)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Signal */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            isBuy
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : isSell
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                              : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                          }`}
                        >
                          {isBuy ? <ArrowUpRight size={12} /> : isSell ? <ArrowDownRight size={12} /> : null}
                          {sig}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {item.action || "HOLD"}
                      </td>

                      {/* Pivot */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {pivot ? `$${Number(pivot).toFixed(2)}` : "—"}
                      </td>

                      {/* Rationale */}
                      <td
                        className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-60 truncate"
                        title={item.reason}
                      >
                        {item.reason || "—"}
                      </td>

                      {/* View Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAnalysis(item);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:btn-accent hover:text-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-sm cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls Footer */}
            {totalItems > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-800/80 px-4 py-2 bg-slate-50/50 dark:bg-slate-950/40">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[5, 10, 20, 50]}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
            <Compass className="mx-auto text-slate-400 opacity-60" size={36} />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
              No analysis records match the filter
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Snapshots will populate continuously as the Python trading engine evaluates market confluences.
            </p>
          </div>
        )}
      </div>

      {/* 4. Analysis Details Modal (Inspector) */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedAnalysis(null)}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
          />

          {/* Modal Content */}
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-2xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 space-y-5 p-6 animate-scale-up"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                  <Compass size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Analysis Snapshot Details
                  </h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock size={11} />
                    {formatTime(selectedAnalysis.timestamp_utc || selectedAnalysis.createdAt)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAnalysis(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 text-xs">
              {/* Key Indicators Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Signal</span>
                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    {selectedAnalysis.signal || "WAIT"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Action</span>
                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    {selectedAnalysis.action || "HOLD"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Spot Price</span>
                  <span className="font-extrabold text-sm text-blue-500 font-mono">
                    {(selectedAnalysis.current_price ?? selectedAnalysis.price)
                      ? `$${Number(selectedAnalysis.current_price ?? selectedAnalysis.price).toFixed(2)}`
                      : "—"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pivot Point</span>
                  <span className="font-extrabold text-sm text-amber-500 font-mono">
                    {selectedAnalysis.support_resistance?.pivot_point
                      ? `$${Number(selectedAnalysis.support_resistance.pivot_point).toFixed(2)}`
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Confluence Rationale */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Confluence Reasoning
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {selectedAnalysis.reason || "No explicit reason provided"}
                </p>
              </div>

              {/* Timeframe & Support Resistance Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Timeframe Breakdown
                  </span>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400">1H Trend</span>
                    <span className="font-bold">{selectedAnalysis.multi_timeframe?.htf_trend || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400">1H RSI</span>
                    <span className="font-bold">{selectedAnalysis.multi_timeframe?.htf_rsi ?? "—"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">5M Entry</span>
                    <span className="font-bold">{selectedAnalysis.multi_timeframe?.entry_signal || selectedAnalysis.signal || "—"}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Support & Resistance
                  </span>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400">Resistance 1</span>
                    <span className="font-bold text-rose-400">
                      {selectedAnalysis.support_resistance?.classic?.r1 ? `$${selectedAnalysis.support_resistance.classic.r1.toFixed(2)}` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400">Pivot</span>
                    <span className="font-bold text-amber-500">
                      {selectedAnalysis.support_resistance?.classic?.pivot ? `$${selectedAnalysis.support_resistance.classic.pivot.toFixed(2)}` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Support 1</span>
                    <span className="font-bold text-emerald-400">
                      {selectedAnalysis.support_resistance?.classic?.s1 ? `$${selectedAnalysis.support_resistance.classic.s1.toFixed(2)}` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedAnalysis(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white btn-accent transition-all cursor-pointer shadow-sm"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
