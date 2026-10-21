"use client";

import React, { useState } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Filter, Clock } from "lucide-react";
import { useTrades, usePagination, TradeDocument } from "../composable/getCollection";
import Loading from "../components/Loading";
import TradeDetailsModal from "../components/TradeDetailsModal";
import Pagination from "../components/Pagination";

function formatTime(val: any): string {
  if (!val) return "—";
  try {
    const d = typeof val === "object" && val?.toDate ? val.toDate() : new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleString("en-US", {
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

export default function TradesPage() {
  const { data: trades, loading } = useTrades();
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [selectedTrade, setSelectedTrade] = useState<TradeDocument | null>(null);

  const filtered = (trades || []).filter((t) => {
    if (filter === "OPEN") return t.status === "OPEN";
    if (filter === "CLOSED") return t.status?.startsWith("CLOSED");
    return true;
  });

  const {
    paginatedItems: paginatedTrades,
    page,
    pageSize,
    totalPages,
    totalItems,
    goToPage,
    setPage,
    setPageSize,
  } = usePagination(filtered, { pageSize: 10 });

  if (loading && !trades) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loading message="Syncing Orders & Execution..." subtitle="Fetching MetaTrader 5 active positions & historical trades" />
      </div>
    );
  }

  const handleFilterChange = (newFilter: "ALL" | "OPEN" | "CLOSED") => {
    setFilter(newFilter);
    goToPage(1);
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp size={20} />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight">Active & Closed Trades</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            MetaTrader 5 live execution bridge and trading performance history.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => handleFilterChange("ALL")}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === "ALL"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All ({trades?.length || 0})
          </button>
          <button
            onClick={() => handleFilterChange("OPEN")}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === "OPEN"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Open ({trades?.filter((t) => t.status === "OPEN").length || 0})
          </button>
          <button
            onClick={() => handleFilterChange("CLOSED")}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === "CLOSED"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Closed ({trades?.filter((t) => t.status?.startsWith("CLOSED")).length || 0})
          </button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
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
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors">
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
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={t.exit_reason || t.reason}>
                        {t.exit_reason || t.reason || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrade(t);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-600 dark:text-slate-300 transition-all shadow-sm"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
          <TrendingUp className="mx-auto text-slate-400 opacity-60" size={36} />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
            No trades match the selected filter
          </h3>
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
