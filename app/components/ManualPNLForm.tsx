"use client";

import React, { useState, useMemo } from "react";
import {
  PlusCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Award,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Sparkles,
  Edit3,
  Trash2,
  Calendar,
  Tag,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Target,
  RefreshCw,
  Search,
  Eye,
  Check,
  ChevronDown,
} from "lucide-react";
import { Timestamp, serverTimestamp } from "firebase/firestore";
import useAuth from "../composable/useAuth";
import { usePNLTrading, TradeDocument, COLLECTIONS, usePagination } from "../composable/getCollection";
import useCollection from "../composable/useCollection";
import TradeDetailsModal from "./TradeDetailsModal";
import Pagination from "./Pagination";

/* =====================================================================
 *  CONSTANTS & PRESETS
 * ===================================================================== */

const POPULAR_SYMBOLS = [
  "XAU/USD",
  "EUR/USD",
  "GBP/USD",
  "BTC/USD",
  "US30",
  "NAS100",
];

const COMMON_LOTS = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0];

const STRATEGY_PRESETS = [
  "Breakout",
  "Trend Following",
  "Order Block / SMC",
  "Liquidity Sweep",
  "Support / Resistance",
  "Scalping",
  "News Trading",
  "Discretionary",
];

const TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1"];

const SESSIONS = ["London", "New York", "Asian", "Overlap"];

const EMOTIONS = [
  { label: "Disciplined", icon: "🧘‍♂️", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { label: "Patient Entry", icon: "⏳", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { label: "Followed Rules", icon: "🎯", color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
  { label: "FOMO", icon: "⚡", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { label: "Chased Move", icon: "🏃‍♂️", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { label: "Revenge Trade", icon: "😡", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  { label: "Over-leveraged", icon: "⚠️", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
];

function getLocalDateTimeString(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function ManualPNLForm() {
  const { user } = useAuth();
  const currentUid = user?.uid || null;

  // Use dedicated collection "PNLTrading" for self-notes
  const { data: rawTrades, loading } = usePNLTrading();
  const { addDoc, updateDocs, deleteDocs, isPending } = useCollection<TradeDocument>(COLLECTIONS.PNL_TRADING);

  // Form Fields State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string>("XAU/USD");
  const [direction, setDirection] = useState<"BUY" | "SELL">("BUY");
  const [volume, setVolume] = useState<number | string>(0.1);
  const [entryPrice, setEntryPrice] = useState<number | string>("");
  const [exitPrice, setExitPrice] = useState<number | string>("");
  const [profit, setProfit] = useState<number | string>("");
  const [pnlPoints, setPnlPoints] = useState<number | string>("");
  const [stopLoss, setStopLoss] = useState<number | string>("");
  const [takeProfit, setTakeProfit] = useState<number | string>("");
  const [entryTime, setEntryTime] = useState<string>(getLocalDateTimeString());
  const [exitTime, setExitTime] = useState<string>(getLocalDateTimeString());
  const [setup, setSetup] = useState<string>("Breakout");
  const [timeframe, setTimeframe] = useState<string>("M15");
  const [session, setSession] = useState<string>("London");
  const [emotion, setEmotion] = useState<string>("Disciplined");
  const [notes, setNotes] = useState<string>("");

  // Feedback State
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Selected trade to view modal
  const [selectedTrade, setSelectedTrade] = useState<TradeDocument | null>(null);

  // Filter & Search State for History Table
  const [searchQuery, setSearchQuery] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<"ALL" | "WIN" | "LOSS">("ALL");

  // Auto calculate Points and Profit when Entry, Exit, Volume, or Direction changes
  const calculateDerivedMetrics = (
    dir: "BUY" | "SELL",
    en: number,
    ex: number,
    vol: number,
    sym: string
  ) => {
    if (isNaN(en) || isNaN(ex) || en <= 0 || ex <= 0) return;

    let points = 0;
    if (dir === "BUY") {
      points = ex - en;
    } else {
      points = en - ex;
    }

    // Default profit multiplier calculation:
    // For Gold (XAU/USD): 1 point ($1 price diff) * 100 per 1.0 lot ($10 per 0.10 lot)
    // Points rounded to 2 decimals
    const roundedPoints = Number(points.toFixed(2));
    setPnlPoints(roundedPoints);

    const safeVol = isNaN(vol) || vol <= 0 ? 0.1 : vol;
    let computedProfit = 0;
    if (sym.includes("XAU") || sym.includes("GOLD")) {
      computedProfit = roundedPoints * safeVol * 100;
    } else if (sym.includes("BTC")) {
      computedProfit = roundedPoints * safeVol;
    } else {
      // General forex standard: ~10 pts per pip * vol
      computedProfit = roundedPoints * safeVol * 10;
    }

    setProfit(Number(computedProfit.toFixed(2)));
  };

  const handleEntryPriceChange = (val: string) => {
    setEntryPrice(val);
    const numEn = parseFloat(val);
    const numEx = parseFloat(String(exitPrice));
    const numVol = parseFloat(String(volume));
    if (!isNaN(numEn) && !isNaN(numEx)) {
      calculateDerivedMetrics(direction, numEn, numEx, numVol, symbol);
    }
  };

  const handleExitPriceChange = (val: string) => {
    setExitPrice(val);
    const numEn = parseFloat(String(entryPrice));
    const numEx = parseFloat(val);
    const numVol = parseFloat(String(volume));
    if (!isNaN(numEn) && !isNaN(numEx)) {
      calculateDerivedMetrics(direction, numEn, numEx, numVol, symbol);
    }
  };

  const handleDirectionChange = (newDir: "BUY" | "SELL") => {
    setDirection(newDir);
    const numEn = parseFloat(String(entryPrice));
    const numEx = parseFloat(String(exitPrice));
    const numVol = parseFloat(String(volume));
    if (!isNaN(numEn) && !isNaN(numEx)) {
      calculateDerivedMetrics(newDir, numEn, numEx, numVol, symbol);
    }
  };

  const handleVolumeChange = (newVol: number | string) => {
    setVolume(newVol);
    const numEn = parseFloat(String(entryPrice));
    const numEx = parseFloat(String(exitPrice));
    const numVol = parseFloat(String(newVol));
    if (!isNaN(numEn) && !isNaN(numEx)) {
      calculateDerivedMetrics(direction, numEn, numEx, numVol, symbol);
    }
  };

  // Reset form
  const handleResetForm = () => {
    setEditingId(null);
    setSymbol("XAU/USD");
    setDirection("BUY");
    setVolume(0.1);
    setEntryPrice("");
    setExitPrice("");
    setProfit("");
    setPnlPoints("");
    setStopLoss("");
    setTakeProfit("");
    setEntryTime(getLocalDateTimeString());
    setExitTime(getLocalDateTimeString());
    setSetup("Breakout");
    setTimeframe("M15");
    setSession("London");
    setEmotion("Disciplined");
    setNotes("");
  };

  // Edit existing trade
  const handleStartEdit = (t: TradeDocument) => {
    setEditingId(t.id || null);
    setSymbol(t.symbol || "XAU/USD");
    const dir = (t.direction || t.action || "BUY").toUpperCase().includes("SELL") ? "SELL" : "BUY";
    setDirection(dir);
    setVolume(t.volume ?? 0.1);
    setEntryPrice(t.entry_price !== undefined ? t.entry_price : "");
    setExitPrice(t.exit_price !== undefined ? t.exit_price : "");
    setProfit(t.profit !== undefined ? t.profit : "");
    setPnlPoints(t.final_pnl_points ?? t.pnl_points ?? "");
    setStopLoss(t.stop_loss ?? t.sl ?? "");
    setTakeProfit(t.take_profit ?? t.tp ?? "");
    setSetup(t.reason || t.strategy || "Breakout");
    setTimeframe(t.timeframe || "M15");
    setSession(t.session || "London");
    setEmotion(t.emotion || "Disciplined");
    setNotes(t.comment || t.notes || "");

    if (t.entry_time) {
      try {
        const d = new Date(t.entry_time);
        if (!isNaN(d.getTime())) setEntryTime(getLocalDateTimeString(d));
      } catch {}
    }
    if (t.exit_time) {
      try {
        const d = new Date(t.exit_time);
        if (!isNaN(d.getTime())) setExitTime(getLocalDateTimeString(d));
      } catch {}
    }

    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit / Save Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const numProfit = parseFloat(String(profit));
    const numPoints = parseFloat(String(pnlPoints));
    const numEntry = parseFloat(String(entryPrice));
    const numExit = parseFloat(String(exitPrice));
    const numVol = parseFloat(String(volume));

    if (isNaN(numProfit) && (isNaN(numEntry) || isNaN(numExit))) {
      setFeedback({
        type: "error",
        message: "Please enter either Profit ($) directly or both Entry & Exit prices.",
      });
      return;
    }

    const finalProfit = !isNaN(numProfit)
      ? numProfit
      : !isNaN(numPoints) && !isNaN(numVol)
      ? numPoints * numVol * 10
      : 0;

    const finalPoints = !isNaN(numPoints)
      ? numPoints
      : !isNaN(numEntry) && !isNaN(numExit)
      ? direction === "BUY"
        ? numExit - numEntry
        : numEntry - numExit
      : 0;

    const outcome = finalProfit > 0 ? "WIN" : finalProfit < 0 ? "LOSS" : "BREAKEVEN";

    try {
      const entryDateObj = new Date(entryTime);
      const exitDateObj = new Date(exitTime || entryTime);

      const tradePayload: any = {
        uid: currentUid || "anonymous",
        userEmail: user?.email || "",
        symbol: symbol.trim().toUpperCase(),
        direction,
        action: direction,
        volume: !isNaN(numVol) && numVol > 0 ? numVol : 0.1,
        entry_price: !isNaN(numEntry) ? numEntry : 0,
        exit_price: !isNaN(numExit) ? numExit : 0,
        stop_loss: stopLoss !== "" ? parseFloat(String(stopLoss)) : null,
        take_profit: takeProfit !== "" ? parseFloat(String(takeProfit)) : null,
        sl: stopLoss !== "" ? parseFloat(String(stopLoss)) : null,
        tp: takeProfit !== "" ? parseFloat(String(takeProfit)) : null,
        profit: Number(finalProfit.toFixed(2)),
        pnl_points: Number(finalPoints.toFixed(2)),
        final_pnl_points: Number(finalPoints.toFixed(2)),
        status: "CLOSED",
        reason: setup || "Manual Entry",
        strategy: setup || "Manual Entry",
        session,
        emotion,
        comment: notes || "",
        notes: notes || "",
        exit_reason: outcome,
        entry_time: entryDateObj.toISOString(),
        exit_time: exitDateObj.toISOString(),
        timeframe,
        source: "manual_web",
        createdAt: Timestamp.fromDate(entryDateObj),
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        // Update existing document
        const success = await updateDocs(editingId, tradePayload);
        if (success) {
          setFeedback({
            type: "success",
            message: `Trade for ${symbol} successfully updated!`,
          });
          handleResetForm();
        } else {
          setFeedback({
            type: "error",
            message: "Failed to update trade in database. Please try again.",
          });
        }
      } else {
        // Add new document
        tradePayload.ticket = `MANUAL-${Date.now()}`;
        const ref = await addDoc(tradePayload);
        if (ref) {
          setFeedback({
            type: "success",
            message: `Manual trade recorded! Added ${symbol} with ${
              finalProfit >= 0 ? "+$" : "-$"
            }${Math.abs(finalProfit).toFixed(2)} to your PnL.`,
          });
          handleResetForm();
        } else {
          setFeedback({
            type: "error",
            message: "Failed to record manual trade. Please check your connection.",
          });
        }
      }
    } catch (err: any) {
      console.error("Error saving manual trade:", err);
      setFeedback({
        type: "error",
        message: err?.message || "An unexpected error occurred while saving.",
      });
    }
  };

  // Delete trade handler
  const handleDelete = async (id: string, sym: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${sym} trade record?`)) {
      return;
    }
    try {
      const ok = await deleteDocs(id);
      if (ok) {
        setFeedback({
          type: "success",
          message: `Trade record deleted successfully.`,
        });
        if (editingId === id) handleResetForm();
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      setFeedback({ type: "error", message: "Failed to delete trade record." });
    }
  };

  // Filter Self-Created Trades exclusively for this user's UID from collection PNLTrading
  const manualTrades = useMemo(() => {
    if (!rawTrades) return [];
    if (!currentUid) {
      // If user is guest / not signed in, show notes without uid or anonymous
      return rawTrades.filter((t) => !t.uid || t.uid === "anonymous");
    }
    // Strict isolation: only show trades where trade.uid matches current user's UID
    return rawTrades.filter((t) => t.uid === currentUid);
  }, [rawTrades, currentUid]);

  // Self Trades KPI Statistics
  const manualStats = useMemo(() => {
    let totalProfit = 0;
    let totalPoints = 0;
    let winCount = 0;
    let lossCount = 0;
    let bestWin = 0;
    let worstLoss = 0;

    for (const t of manualTrades) {
      const p = Number(t.profit ?? 0);
      const pts = Number(t.final_pnl_points ?? t.pnl_points ?? 0);
      totalProfit += p;
      totalPoints += pts;

      if (p > 0) {
        winCount++;
        if (p > bestWin) bestWin = p;
      } else if (p < 0) {
        lossCount++;
        if (p < worstLoss) worstLoss = p;
      }
    }

    const total = manualTrades.length;
    const winRate = total > 0 ? (winCount / total) * 100 : 0;
    const avgProfit = total > 0 ? totalProfit / total : 0;

    return {
      total,
      totalProfit,
      totalPoints,
      winCount,
      lossCount,
      winRate,
      bestWin,
      worstLoss,
      avgProfit,
    };
  }, [manualTrades]);

  // Filtered list for Table
  const filteredTrades = useMemo(() => {
    return manualTrades.filter((t) => {
      // Outcome filter
      const p = Number(t.profit ?? 0);
      if (outcomeFilter === "WIN" && p <= 0) return false;
      if (outcomeFilter === "LOSS" && p >= 0) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const sym = (t.symbol || "").toLowerCase();
        const r = (t.reason || t.strategy || "").toLowerCase();
        const n = (t.comment || t.notes || "").toLowerCase();
        if (!sym.includes(q) && !r.includes(q) && !n.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [manualTrades, outcomeFilter, searchQuery]);

  // Pagination for Manual Trades Table
  const {
    paginatedItems: paginatedTrades,
    page,
    pageSize,
    totalPages,
    totalItems,
    goToPage,
    setPage,
    setPageSize,
  } = usePagination(filteredTrades, { pageSize: 10 });

  const handleOutcomeFilterChange = (filter: "ALL" | "WIN" | "LOSS") => {
    setOutcomeFilter(filter);
    goToPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    goToPage(1);
  };

  return (
    <div className="space-y-7 w-full">
      {/* 1. Header & Summary Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-linear-to-tr from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30">
              <PlusCircle size={22} />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Self PnL Creator & Journal
                </h1>
                {/* <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Collection: PNLTrading
                </span> */}
              </div>
              {/* <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Private discretionary trading notes isolated and stored under your authenticated User ID (<code className="text-purple-400 font-mono text-[11px]">{currentUid ? `${currentUid.slice(0, 8)}...` : "Guest"}</code>).
              </p> */}
            </div>
          </div>
        </div>

        {/* UID Status & Collection Indicator */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-xs">
            <span className={`w-2 h-2 rounded-full ${currentUid ? "bg-emerald-400" : "bg-amber-400"}`} />
            <span className="font-medium">
              {currentUid ? (
                <>User: <strong className="text-slate-800 dark:text-slate-200 font-mono">{user?.email || currentUid.slice(0, 6)}</strong></>
              ) : (
                "Guest Mode (Anonymous UID)"
              )}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Self Net PnL</span>
            <DollarSign size={14} className="text-emerald-400" />
          </div>
          <div
            className={`text-xl font-black mt-2 tracking-tight ${
              manualStats.totalProfit >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {manualStats.totalProfit >= 0 ? "+" : ""}$
            {manualStats.totalProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {manualStats.totalPoints >= 0 ? "+" : ""}
            {manualStats.totalPoints.toFixed(1)} total pts
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Win Rate</span>
            <Award size={14} className="text-blue-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {manualStats.winRate.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span className="text-emerald-500 font-bold">{manualStats.winCount}W</span> /{" "}
            <span className="text-rose-500 font-bold">{manualStats.lossCount}L</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Self Trades</span>
            <Layers size={14} className="text-purple-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {manualStats.total}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Recorded manually</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Avg Trade</span>
            <TrendingUp size={14} className="text-teal-400" />
          </div>
          <div
            className={`text-xl font-black mt-2 tracking-tight ${
              manualStats.avgProfit >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {manualStats.avgProfit >= 0 ? "+" : ""}$
            {manualStats.avgProfit.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Per manual entry</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Best Winner</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-500 mt-2 tracking-tight">
            +${manualStats.bestWin.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Top manual gain</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Worst Loss</span>
            <TrendingDown size={14} className="text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-500 mt-2 tracking-tight">
            ${manualStats.worstLoss.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Max manual drawdown</div>
        </div>
      </div>

      {/* 2. Main Form & Live Preview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: The Interactive Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden backdrop-blur-md">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Form Header */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Edit3 size={18} className="text-purple-500" />
                {editingId ? "Edit Manual Trade Entry" : "Record New Trade Entry"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {editingId
                  ? "Update the details and values of this trade."
                  : "Fill in trade execution parameters. PnL & points auto-calculate on the fly."}
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`mb-6 p-4 rounded-2xl flex items-start gap-3 text-sm ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{feedback.message}</div>
              <button
                onClick={() => setFeedback(null)}
                className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ROW 1: Symbol & Direction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Asset Symbol */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Asset / Symbol
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {POPULAR_SYMBOLS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSymbol(s)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                          symbol === s
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="e.g. XAU/USD, EUR/USD"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-sm font-semibold focus:outline-hidden focus:border-purple-500 transition-colors uppercase"
                  />
                </div>
              </div>

              {/* Direction Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Trade Direction
                </label>
                <div className="grid grid-cols-2 gap-3 h-10.5 mt-7">
                  <button
                    type="button"
                    onClick={() => handleDirectionChange("BUY")}
                    className={`flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      direction === "BUY"
                        ? "bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <TrendingUp size={16} />
                    BUY (Long)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDirectionChange("SELL")}
                    className={`flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      direction === "SELL"
                        ? "bg-linear-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <TrendingDown size={16} />
                    SELL (Short)
                  </button>
                </div>
              </div>
            </div>

            {/* ROW 2: Lot Size & Execution Date/Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Lot Size */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Volume / Lot Size
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {COMMON_LOTS.map((lot) => (
                      <button
                        key={lot}
                        type="button"
                        onClick={() => handleVolumeChange(lot)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                          Number(volume) === lot
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {lot.toFixed(2)}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    value={volume}
                    onChange={(e) => handleVolumeChange(e.target.value)}
                    required
                    placeholder="0.10"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-sm font-semibold focus:outline-hidden focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Execution Date & Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Execution Date & Time
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const now = getLocalDateTimeString();
                        setEntryTime(now);
                        setExitTime(now);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-purple-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      Set to Now
                    </button>
                  </div>
                  <input
                    type="datetime-local"
                    value={entryTime}
                    onChange={(e) => {
                      setEntryTime(e.target.value);
                      if (!exitTime) setExitTime(e.target.value);
                    }}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-sm font-semibold focus:outline-hidden focus:border-purple-500 transition-colors text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* ROW 3: Price Calculation Block (Entry Price, Exit Price, Live Points & Profit) */}
            <div className="p-4 md:p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Sparkles size={14} /> Price Execution & Dynamic PnL Calculator
                </span>
                <span className="text-[11px] text-slate-500">Auto-derives from entry & exit</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Entry Price */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Entry Price
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={entryPrice}
                    onChange={(e) => handleEntryPriceChange(e.target.value)}
                    placeholder="e.g. 2680.50"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                {/* Exit Price */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Exit Price
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={exitPrice}
                    onChange={(e) => handleExitPriceChange(e.target.value)}
                    placeholder="e.g. 2692.80"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                {/* Net Profit ($) */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                    <span>Net Profit ($)</span>
                    <span className="text-[10px] text-slate-400">Direct or Calc</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={profit}
                      onChange={(e) => setProfit(e.target.value)}
                      placeholder="+245.00"
                      required
                      className={`w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono font-black focus:outline-hidden ${
                        Number(profit) > 0
                          ? "text-emerald-500"
                          : Number(profit) < 0
                          ? "text-rose-500"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    />
                  </div>
                </div>

                {/* Points / Pips */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Points (pts)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={pnlPoints}
                    onChange={(e) => setPnlPoints(e.target.value)}
                    placeholder="+12.30"
                    className={`w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold focus:outline-hidden ${
                      Number(pnlPoints) > 0
                        ? "text-emerald-500"
                        : Number(pnlPoints) < 0
                        ? "text-rose-500"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  />
                </div>
              </div>

              {/* Stop Loss & Take Profit (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/50 dark:border-slate-700/40">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-rose-400" /> Stop Loss (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    placeholder="e.g. 2675.00"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Target size={12} className="text-emerald-400" /> Take Profit (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    placeholder="e.g. 2695.00"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* ROW 4: Strategy Setup, Timeframe & Trading Session */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Setup / Strategy */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Strategy / Setup
                </label>
                <select
                  value={setup}
                  onChange={(e) => setSetup(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-sm font-semibold focus:outline-hidden focus:border-purple-500 transition-colors"
                >
                  {STRATEGY_PRESETS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timeframe */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Timeframe
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-sm font-semibold focus:outline-hidden focus:border-purple-500 transition-colors"
                >
                  {TIMEFRAMES.map((tf) => (
                    <option key={tf} value={tf}>
                      {tf}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Session
                </label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-sm font-semibold focus:outline-hidden focus:border-purple-500 transition-colors"
                >
                  {SESSIONS.map((sess) => (
                    <option key={sess} value={sess}>
                      {sess} Session
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ROW 5: Psychology / Emotion Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Psychology & Discipline State
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {EMOTIONS.map((em) => (
                  <button
                    key={em.label}
                    type="button"
                    onClick={() => setEmotion(em.label)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      emotion === em.label
                        ? "bg-purple-600 border-purple-500 text-white shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{em.icon}</span>
                    <span>{em.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ROW 6: Notes & Reflection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Trade Notes / Journal Reflection
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Why did you enter? What went right? Any plan deviation or key observation?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-sm focus:outline-hidden focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Submit & Reset Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Reset Fields
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-3 rounded-2xl bg-linear-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Saving Trade Record...
                  </>
                ) : editingId ? (
                  <>
                    <Check size={16} />
                    Update Trade Record
                  </>
                ) : (
                  <>
                    <PlusCircle size={16} />
                    Save Trade Entry
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Live Ticket Preview & Psychology Tip */}
        <div className="space-y-5">
          {/* Live Preview Card */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={14} className="text-blue-400" /> Live Ticket Preview
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20">
                Self Entry
              </span>
            </div>

            {/* Ticket Card */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                Number(profit) > 0
                  ? "bg-emerald-500/5 border-emerald-500/30"
                  : Number(profit) < 0
                  ? "bg-rose-500/5 border-rose-500/30"
                  : "bg-slate-500/5 border-slate-500/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase ${
                      direction === "BUY"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {direction}
                  </span>
                  <span className="font-extrabold text-sm tracking-tight">{symbol || "XAU/USD"}</span>
                  <span className="text-xs text-slate-400">({volume} lot)</span>
                </div>
                <div
                  className={`text-base font-black ${
                    Number(profit) > 0
                      ? "text-emerald-500"
                      : Number(profit) < 0
                      ? "text-rose-500"
                      : "text-slate-400"
                  }`}
                >
                  {Number(profit) >= 0 ? "+" : ""}$
                  {Number(profit || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/40 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Entry Price</span>
                  <span className="font-mono font-bold">{entryPrice || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Exit Price</span>
                  <span className="font-mono font-bold">{exitPrice || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Points</span>
                  <span className="font-mono font-bold">
                    {Number(pnlPoints) >= 0 ? "+" : ""}
                    {Number(pnlPoints || 0).toFixed(1)} pts
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Timeframe / Session</span>
                  <span className="font-semibold">
                    {timeframe} • {session}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/40 text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-medium">
                  {setup}
                </span>
                <span className="text-slate-400 italic truncate max-w-35">
                  {notes || "No notes entered"}
                </span>
              </div>
            </div>
          </div>

          {/* Tips / Disciplined Trading Card */}
          <div className="p-5 rounded-3xl bg-linear-to-br from-indigo-950/40 to-slate-900/40 border border-indigo-500/20 text-slate-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-400 text-sm">
              <ShieldCheck size={16} /> Journal Discipline Rule
            </div>
            <p className="leading-relaxed text-slate-400 text-[11px]">
              Top 1% traders maintain consistent trade logs. Logging your emotional state, entry reasons, and profit targets transforms random results into reproducible edge.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Self-Created Trades History Table */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm backdrop-blur-md space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Calendar size={18} className="text-purple-500" />
              My PNL Notes ({manualTrades.length})
            </h2>
            {/* <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personal trade notes from collection <code className="text-purple-400 font-mono text-[11px]">PNLTrading</code> for UID <code className="text-purple-400 font-mono text-[11px]">{currentUid || "anonymous"}</code>. Click any row to inspect details.
            </p> */}
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Outcome Filter Buttons */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <button
                onClick={() => handleOutcomeFilterChange("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  outcomeFilter === "ALL"
                    ? "bg-purple-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-white"
                }`}
              >
                All ({manualTrades.length})
              </button>
              <button
                onClick={() => handleOutcomeFilterChange("WIN")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  outcomeFilter === "WIN"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-white"
                }`}
              >
                Wins ({manualStats.winCount})
              </button>
              <button
                onClick={() => handleOutcomeFilterChange("LOSS")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  outcomeFilter === "LOSS"
                    ? "bg-rose-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-white"
                }`}
              >
                Losses ({manualStats.lossCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search symbol, setup..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-hidden focus:border-purple-500 w-44 md:w-56"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredTrades.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
              <PlusCircle size={24} />
            </div>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No manual trade records found
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || outcomeFilter !== "ALL"
                ? "Try adjusting your search query or outcome filter."
                : "Fill out the form above to record your first manual trade. It will instantly show up in both this journal and the PnL Calendar!"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Asset</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Lots</th>
                    <th className="py-3 px-3">Entry → Exit</th>
                    <th className="py-3 px-3">Points</th>
                    <th className="py-3 px-3">PnL ($)</th>
                    <th className="py-3 px-3">Setup</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {paginatedTrades.map((t) => {
                    const dir = (t.direction || t.action || "BUY").toUpperCase().includes("SELL")
                      ? "SELL"
                      : "BUY";
                    const p = Number(t.profit ?? 0);
                    const pts = Number(t.final_pnl_points ?? t.pnl_points ?? 0);
                    const isWin = p > 0;
                    const isLoss = p < 0;

                    let dateStr = "—";
                    if (t.entry_time || t.createdAt) {
                      try {
                        const d =
                          typeof t.entry_time === "object" && (t.entry_time as any)?.toDate
                            ? (t.entry_time as any).toDate()
                            : new Date(t.entry_time || t.createdAt);
                        if (!isNaN(d.getTime())) {
                          dateStr = d.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        }
                      } catch {}
                    }

                    return (
                      <tr
                        key={t.id || t.ticket}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                        onClick={() => setSelectedTrade(t)}
                      >
                        {/* Date */}
                        <td className="py-3.5 px-3 font-mono text-slate-500 dark:text-slate-400">
                          {dateStr}
                        </td>

                        {/* Symbol */}
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                          {t.symbol || "XAU/USD"}
                        </td>

                        {/* Direction */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                              dir === "BUY"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {dir === "BUY" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {dir}
                          </span>
                        </td>

                        {/* Volume */}
                        <td className="py-3.5 px-3 font-mono">{t.volume ?? 0.1}</td>

                        {/* Entry -> Exit */}
                        <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                          <span>{t.entry_price || "—"}</span>
                          <span className="text-slate-400 mx-1.5">→</span>
                          <span className="text-slate-900 dark:text-slate-200 font-bold">
                            {t.exit_price || "—"}
                          </span>
                        </td>

                        {/* Points */}
                        <td className="py-3.5 px-3 font-mono font-bold">
                          <span className={pts >= 0 ? "text-emerald-500" : "text-rose-500"}>
                            {pts >= 0 ? "+" : ""}
                            {pts.toFixed(1)} pts
                          </span>
                        </td>

                        {/* PnL Profit */}
                        <td className="py-3.5 px-3 font-mono font-black text-sm">
                          <span className={p >= 0 ? "text-emerald-500" : "text-rose-500"}>
                            {p >= 0 ? "+" : ""}${Math.abs(p).toFixed(2)}
                          </span>
                        </td>

                        {/* Setup Tag */}
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700/60">
                            {t.reason || t.strategy || "Manual"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td
                          className="py-3.5 px-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(t)}
                              title="Edit Trade"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => t.id && handleDelete(t.id, t.symbol || "trade")}
                              title="Delete Trade"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
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
          </>
        )}
      </div>

      {/* Trade Details Modal (Clicking any row) */}
      <TradeDetailsModal
        trade={selectedTrade}
        isOpen={Boolean(selectedTrade)}
        onClose={() => setSelectedTrade(null)}
      />
    </div>
  );
}
