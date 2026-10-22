"use client";

import React, { useEffect } from "react";
import {
  X,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Target,
  Clock,
  Activity,
  Layers,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Flame,
  DollarSign,
} from "lucide-react";
import { TradeDocument } from "../composable/getCollection";

interface TradeDetailsModalProps {
  trade: TradeDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatTime(val: any): string {
  if (!val) return "—";
  try {
    const d =
      typeof val === "object" && val?.toDate ? val.toDate() : new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return String(val);
  }
}

export default function TradeDetailsModal({
  trade,
  isOpen,
  onClose,
}: TradeDetailsModalProps) {
  const [copied, setCopied] = React.useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !trade) return null;

  const isBuy = trade.direction === "BUY" || trade.action === "BUY";
  const pnlPoints = Number(trade.final_pnl_points) || Number(trade.pnl_points) || 0;
  const isWin = pnlPoints > 0;
  const isOpenTrade = trade.status === "OPEN";

  const sl = trade.stop_loss || trade.sl;
  const tp = trade.take_profit || trade.tp;
  const entry = trade.entry_price || 0;
  const exit = trade.exit_price;

  const copyTicket = () => {
    const text = String(trade.ticket || trade.id || "");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity animate-fade-in"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 transition-all animate-fade-in"
      >
        {/* Glow accent bar at top */}
        <div
          className={`h-1.5 w-full bg-linear-to-r ${
            isBuy
              ? "from-emerald-500 via-teal-400 to-blue-500"
              : "from-rose-500 via-amber-400 to-purple-500"
          }`}
        />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-850">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase ${
                  isBuy
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                }`}
              >
                {isBuy ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                {trade.direction || trade.action || "BUY"}
              </span>

              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {trade.symbol || "XAU/USD"}
              </span>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  isOpenTrade
                    ? "bg-blue-500/15 text-blue-500 border border-blue-500/30 animate-pulse"
                    : trade.status === "CLOSED_TP"
                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                }`}
              >
                {trade.status || "CLOSED"}
              </span>

              {trade.timeframe && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {trade.timeframe}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-0.5">
              <span>Ticket:</span>
              <code className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {trade.ticket ? `#${trade.ticket}` : trade.id}
              </code>
              <button
                onClick={copyTicket}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Copy ticket"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Price & Outcome Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#070b14]/80 border border-slate-100 dark:border-slate-800/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Entry Price
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {entry ? `$${entry.toFixed(2)}` : "—"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {isOpenTrade ? "Current Price" : "Exit Price"}
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {exit ? `$${exit.toFixed(2)}` : isOpenTrade ? "Live" : "—"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                PnL (Points)
              </span>
              <span
                className={`text-base sm:text-lg font-black ${
                  isOpenTrade
                    ? "text-blue-500"
                    : isWin
                    ? "text-emerald-500"
                    : pnlPoints < 0
                    ? "text-rose-500"
                    : "text-slate-400"
                }`}
              >
                {isOpenTrade
                  ? "Running"
                  : pnlPoints > 0
                  ? `+${pnlPoints.toFixed(2)}`
                  : pnlPoints.toFixed(2)}{" "}
                <span className="text-xs font-normal">pts</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                USD Profit
              </span>
              <span
                className={`text-base sm:text-lg font-black ${
                  (trade.profit || 0) > 0
                    ? "text-emerald-500"
                    : (trade.profit || 0) < 0
                    ? "text-rose-500"
                    : "text-slate-400"
                }`}
              >
                {trade.profit !== undefined
                  ? `${trade.profit >= 0 ? "+" : ""}$${trade.profit.toFixed(2)}`
                  : "—"}
              </span>
            </div>
          </div>

          {/* Target Levels Grid: SL, TP, TP1, TP2, TP3 */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Target size={14} className="text-blue-500" /> Key Execution Boundaries
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">
                  Stop Loss (SL)
                </span>
                <span className="font-bold text-rose-500 text-sm">
                  {sl ? `$${sl.toFixed(2)}` : "—"}
                </span>
                {sl && entry && (
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    {Math.abs(entry - sl).toFixed(2)} pts risk
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">
                  Take Profit (Final)
                </span>
                <span className="font-bold text-emerald-500 text-sm">
                  {tp ? `$${tp.toFixed(2)}` : "—"}
                </span>
                {tp && entry && (
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    {Math.abs(tp - entry).toFixed(2)} pts reward
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">
                  Take Profit 1 (TP1)
                </span>
                <span className="font-bold text-emerald-400 text-sm">
                  {trade.tp1 ? `$${trade.tp1.toFixed(2)}` : "—"}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">1st milestone</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">
                  Volume / Lots
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {trade.volume !== undefined ? `${trade.volume} Lot` : "0.01 Lot"}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Standard MT5</span>
              </div>
            </div>
          </div>

          {/* Entry & Exit Rationale */}
          <div className="space-y-3">
            {trade.entry_reason || trade.reason ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  AI Confluence Entry Rationale
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {trade.entry_reason || trade.reason}
                </p>
              </div>
            ) : null}

            {trade.exit_reason ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Position Closure Outcome
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {trade.exit_reason}
                </p>
              </div>
            ) : null}
          </div>

          {/* Timing & Meta Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-850">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-blue-500" /> Entry Time
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatTime(trade.entry_time || trade.createdAt)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-amber-500" /> Exit Time
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {isOpenTrade ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-500 font-bold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Running (In Progress)
                  </span>
                ) : (
                  formatTime(trade.exit_time || trade.updatedAt || trade.createdAt)
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>MT5 MetaTrader Verified</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white btn-accent transition-all shadow-sm cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
