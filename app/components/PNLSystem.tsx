"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Award,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  BarChart2,
  List,
  Sparkles,
  Maximize2,
  CalendarCheck,
  CalendarDays,
  Eye,
  EyeOff,
  MoveHorizontal,
} from "lucide-react";
import { useTrades, TradeDocument, usePagination } from "../composable/getCollection";
import Loading from "../components/Loading";
import TradeDetailsModal from "../components/TradeDetailsModal";
import Pagination from "./Pagination";

/* =====================================================================
 *  HELPER FUNCTIONS
 * ===================================================================== */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getTradeDateKey(trade: TradeDocument): string | null {
  const rawDate = trade.exit_time || trade.entry_time || trade.createdAt;
  if (!rawDate) return null;
  try {
    const d =
      typeof rawDate === "object" && rawDate?.toDate
        ? rawDate.toDate()
        : new Date(rawDate);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
}

function getTradePnL(trade: TradeDocument): { profit: number; points: number } {
  const points = Number(trade.final_pnl_points ?? trade.pnl_points ?? 0) || 0;
  const profit =
    trade.profit !== undefined && trade.profit !== null && Number(trade.profit) !== 0
      ? Number(trade.profit)
      : points * (Number(trade.volume) || 1) * 10;
  return { profit, points };
}

function formatCurrency(val: number): string {
  const prefix = val >= 0 ? "+" : "";
  return `${prefix}$${Math.abs(val).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPoints(val: number): string {
  const prefix = val >= 0 ? "+" : "";
  return `${prefix}${val.toFixed(1)} pts`;
}

function formatTime(val: any): string {
  if (!val) return "—";
  try {
    const d = typeof val === "object" && val?.toDate ? val.toDate() : new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return String(val);
  }
}

/* =====================================================================
 *  MAIN PNL & CALENDAR PAGE COMPONENT
 * ===================================================================== */

export default function PNLSystem() {
  const { data: rawTrades, loading } = useTrades();

  // Selected Month & Year (Defaults to current date)
  const today = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());

  // Active Tab: "calendar" | "chart" | "journal"
  const [activeTab, setActiveTab] = useState<"calendar" | "chart" | "journal">("calendar");

  // Selected Day Drawer / Modal State
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  // Selected Trade Modal State
  const [selectedTrade, setSelectedTrade] = useState<TradeDocument | null>(null);

  // Filter only closed trades
  const closedTrades = useMemo(() => {
    return (rawTrades || []).filter((t) => t.status?.startsWith("CLOSED"));
  }, [rawTrades]);

  // Group trades by date key (YYYY-MM-DD)
  const tradesByDate = useMemo(() => {
    const map: Record<string, TradeDocument[]> = {};
    for (const t of closedTrades) {
      const key = getTradeDateKey(t);
      if (key) {
        if (!map[key]) map[key] = [];
        map[key].push(t);
      }
    }
    return map;
  }, [closedTrades]);

  // Navigate Months
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setSelectedDayKey(todayKey);
  };

  // Month Metrics Calculation
  const monthMetrics = useMemo(() => {
    const prefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
    let totalProfit = 0;
    let totalPoints = 0;
    let grossWins = 0;
    let grossLosses = 0;
    let winCount = 0;
    let lossCount = 0;
    let totalTrades = 0;

    const dailyProfitMap: Record<string, { profit: number; points: number; trades: number }> = {};
    let greenDays = 0;
    let redDays = 0;
    let breakevenDays = 0;
    let bestDay = { date: "", profit: -Infinity };
    let worstDay = { date: "", profit: Infinity };

    for (const [dateKey, dayTrades] of Object.entries(tradesByDate)) {
      if (dateKey.startsWith(prefix)) {
        let dayP = 0;
        let dayPts = 0;
        for (const t of dayTrades) {
          const { profit, points } = getTradePnL(t);
          totalProfit += profit;
          totalPoints += points;
          dayP += profit;
          dayPts += points;
          totalTrades += 1;

          if (profit > 0) {
            grossWins += profit;
            winCount += 1;
          } else if (profit < 0) {
            grossLosses += Math.abs(profit);
            lossCount += 1;
          }
        }

        dailyProfitMap[dateKey] = { profit: dayP, points: dayPts, trades: dayTrades.length };

        if (dayP > 0) {
          greenDays += 1;
          if (dayP > bestDay.profit) bestDay = { date: dateKey, profit: dayP };
        } else if (dayP < 0) {
          redDays += 1;
          if (dayP < worstDay.profit) worstDay = { date: dateKey, profit: dayP };
        } else {
          breakevenDays += 1;
        }
      }
    }

    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
    const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 99.9 : 0;
    const tradingDays = greenDays + redDays + breakevenDays;
    const dayWinRate = tradingDays > 0 ? (greenDays / tradingDays) * 100 : 0;
    const avgDailyProfit = tradingDays > 0 ? totalProfit / tradingDays : 0;
    const avgTrade = totalTrades > 0 ? totalProfit / totalTrades : 0;

    return {
      totalProfit,
      totalPoints,
      winRate,
      profitFactor,
      winCount,
      lossCount,
      totalTrades,
      greenDays,
      redDays,
      breakevenDays,
      tradingDays,
      dayWinRate,
      avgDailyProfit,
      avgTrade,
      bestDay: bestDay.profit !== -Infinity ? bestDay : null,
      worstDay: worstDay.profit !== Infinity ? worstDay : null,
      dailyProfitMap,
    };
  }, [tradesByDate, selectedYear, selectedMonth]);

  // Calendar Grid Builder (Weeks with Sunday-Saturday + Weekly Summary Column)
  const calendarWeeks = useMemo(() => {
    const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sun
    const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const prevMonthDays = new Date(selectedYear, selectedMonth, 0).getDate();

    const weeks: Array<{
      days: Array<{
        dayNumber: number;
        isCurrentMonth: boolean;
        dateKey: string;
        isToday: boolean;
        trades: TradeDocument[];
        dailyProfit: number;
        dailyPoints: number;
        winCount: number;
        lossCount: number;
      }>;
      weekSummary: {
        totalProfit: number;
        totalPoints: number;
        tradeCount: number;
        winCount: number;
        lossCount: number;
      };
    }> = [];

    let currentWeekDays: any[] = [];
    let weekProfit = 0;
    let weekPoints = 0;
    let weekTrades = 0;
    let weekWins = 0;
    let weekLosses = 0;

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevMonth = selectedMonth === 0 ? 12 : selectedMonth;
      const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
      const key = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      currentWeekDays.push({
        dayNumber: dayNum,
        isCurrentMonth: false,
        dateKey: key,
        isToday: false,
        trades: tradesByDate[key] || [],
        dailyProfit: 0,
        dailyPoints: 0,
        winCount: 0,
        lossCount: 0,
      });
    }

    const todayDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayTrades = tradesByDate[dateKey] || [];

      let dProfit = 0;
      let dPoints = 0;
      let dWins = 0;
      let dLosses = 0;

      for (const t of dayTrades) {
        const { profit, points } = getTradePnL(t);
        dProfit += profit;
        dPoints += points;
        if (profit > 0) dWins++;
        else if (profit < 0) dLosses++;
      }

      weekProfit += dProfit;
      weekPoints += dPoints;
      weekTrades += dayTrades.length;
      weekWins += dWins;
      weekLosses += dLosses;

      currentWeekDays.push({
        dayNumber: day,
        isCurrentMonth: true,
        dateKey,
        isToday: dateKey === todayDateKey,
        trades: dayTrades,
        dailyProfit: dProfit,
        dailyPoints: dPoints,
        winCount: dWins,
        lossCount: dLosses,
      });

      if (currentWeekDays.length === 7) {
        weeks.push({
          days: currentWeekDays,
          weekSummary: {
            totalProfit: weekProfit,
            totalPoints: weekPoints,
            tradeCount: weekTrades,
            winCount: weekWins,
            lossCount: weekLosses,
          },
        });
        currentWeekDays = [];
        weekProfit = 0;
        weekPoints = 0;
        weekTrades = 0;
        weekWins = 0;
        weekLosses = 0;
      }
    }

    // Next month filler days to complete the last week
    if (currentWeekDays.length > 0) {
      let nextDay = 1;
      const nextMonth = selectedMonth === 11 ? 1 : selectedMonth + 2;
      const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
      while (currentWeekDays.length < 7) {
        const key = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(nextDay).padStart(2, "0")}`;
        currentWeekDays.push({
          dayNumber: nextDay,
          isCurrentMonth: false,
          dateKey: key,
          isToday: false,
          trades: tradesByDate[key] || [],
          dailyProfit: 0,
          dailyPoints: 0,
          winCount: 0,
          lossCount: 0,
        });
        nextDay++;
      }
      weeks.push({
        days: currentWeekDays,
        weekSummary: {
          totalProfit: weekProfit,
          totalPoints: weekPoints,
          tradeCount: weekTrades,
          winCount: weekWins,
          lossCount: weekLosses,
        },
      });
    }

    return weeks;
  }, [selectedYear, selectedMonth, tradesByDate, today]);

  // Selected Day's Trades
  const selectedDayTrades = useMemo(() => {
    if (!selectedDayKey) return [];
    return tradesByDate[selectedDayKey] || [];
  }, [selectedDayKey, tradesByDate]);

  // Selected Day's Trades Pagination
  const {
    paginatedItems: paginatedDayTrades,
    page: dayTradesPage,
    pageSize: dayTradesPageSize,
    totalPages: dayTradesTotalPages,
    totalItems: dayTradesTotalItems,
    setPage: setDayTradesPage,
    setPageSize: setDayTradesPageSize,
  } = usePagination(selectedDayTrades, { pageSize: 8 });

  // Sorted Daily Entries for Journal View
  const sortedDailyEntries = useMemo(() => {
    return Object.entries(monthMetrics.dailyProfitMap).sort((a, b) =>
      b[0].localeCompare(a[0])
    );
  }, [monthMetrics.dailyProfitMap]);

  const {
    paginatedItems: paginatedDailyEntries,
    page: journalPage,
    pageSize: journalPageSize,
    totalPages: journalTotalPages,
    totalItems: journalTotalItems,
    setPage: setJournalPage,
    setPageSize: setJournalPageSize,
  } = usePagination(sortedDailyEntries, { pageSize: 10 });

  if (loading && !rawTrades) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loading
          message="Calculating PnL Metrics..."
          subtitle="Analyzing daily execution records & computing calendar performance"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 p-4 md:p-8 space-y-7">
      {/* 1. Header & Navigation Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-linear-to-tr from-emerald-500/20 to-blue-500/20 text-emerald-500 border border-emerald-500/30">
              <CalendarCheck size={22} />
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Trading PnL & Performance Calendar
              </h1>
              {/* <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-timeframe day-by-day profitability, win consistency, point distributions & journal logs.
              </p> */}
            </div>
          </div>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-xs md:text-sm font-bold min-w-32.5 text-center select-none font-mono">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={handleJumpToToday}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles size={13} />
            Today
          </button>
        </div>
      </div>

      {/* 2. Month Performance KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Net PnL */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Net Monthly PnL</span>
            <DollarSign size={15} className="text-emerald-500" />
          </div>
          <div
            className={`text-lg md:text-xl font-black font-mono tracking-tight ${
              monthMetrics.totalProfit >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatCurrency(monthMetrics.totalProfit)}
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>{formatPoints(monthMetrics.totalPoints)}</span>
          </div>
        </div>

        {/* Card 2: Win Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Trade Win Rate</span>
            <Percent size={15} className="text-blue-500" />
          </div>
          <div className="text-lg md:text-xl font-black font-mono text-slate-900 dark:text-white">
            {monthMetrics.winRate.toFixed(1)}%
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {monthMetrics.winCount}W / {monthMetrics.lossCount}L ({monthMetrics.totalTrades} trades)
          </div>
        </div>

        {/* Card 3: Day Consistency */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Green Days</span>
            <CalendarDays size={15} className="text-purple-500" />
          </div>
          <div className="text-lg md:text-xl font-black font-mono text-emerald-500">
            {monthMetrics.greenDays}{" "}
            <span className="text-xs font-normal text-slate-400">/ {monthMetrics.tradingDays} days</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {monthMetrics.dayWinRate.toFixed(1)}% consistency
          </div>
        </div>

        {/* Card 4: Profit Factor */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Profit Factor</span>
            <Award size={15} className="text-amber-500" />
          </div>
          <div className="text-lg md:text-xl font-black font-mono text-slate-900 dark:text-white">
            {monthMetrics.profitFactor.toFixed(2)}
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Avg: {formatCurrency(monthMetrics.avgDailyProfit)} / day
          </div>
        </div>

        {/* Card 5: Best Day */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Best Day</span>
            <TrendingUp size={15} className="text-emerald-500" />
          </div>
          <div className="text-lg md:text-xl font-black font-mono text-emerald-500">
            {monthMetrics.bestDay ? formatCurrency(monthMetrics.bestDay.profit) : "—"}
          </div>
          <div className="text-[11px] font-mono text-slate-400 truncate">
            {monthMetrics.bestDay?.date || "No trades yet"}
          </div>
        </div>

        {/* Card 6: Worst Day */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Worst Day</span>
            <TrendingDown size={15} className="text-rose-500" />
          </div>
          <div className="text-lg md:text-xl font-black font-mono text-rose-500">
            {monthMetrics.worstDay ? formatCurrency(monthMetrics.worstDay.profit) : "—"}
          </div>
          <div className="text-[11px] font-mono text-slate-400 truncate">
            {monthMetrics.worstDay?.date || "No trades yet"}
          </div>
        </div>
      </div>

      {/* 3. View Switcher Tabs & Calendar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap pb-1">
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "calendar"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <CalendarIcon size={14} />
            Calendar View
          </button>
          <button
            onClick={() => setActiveTab("chart")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "chart"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart2 size={14} />
            PnL Analytics Chart
          </button>
          <button
            onClick={() => setActiveTab("journal")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "journal"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <List size={14} />
            Daily Journal Log
          </button>
        </div>

        {selectedDayKey && (
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>Selected Date:</span>
            <span className="font-mono text-slate-900 dark:text-white font-bold bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {selectedDayKey} ({selectedDayTrades.length} trades)
            </span>
            <button
              onClick={() => setSelectedDayKey(null)}
              className="text-blue-500 hover:underline cursor-pointer text-[11px]"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* 4. Tab 1: CALENDAR VIEW */}
      {activeTab === "calendar" && (
        <div className="space-y-3">
          {/* Mobile Horizontal Scroll Hint */}
          <div className="md:hidden flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
            <span className="flex items-center gap-1.5">
              <MoveHorizontal size={13} className="text-amber-500 animate-pulse" />
              Scroll horizontally behind Weekly Total
            </span>
            <span className="text-[10px] text-blue-500 font-bold font-mono">
              Weekly Total Pinned →
            </span>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {/* Horizontal Scroll Wrapper */}
            <div className="overflow-x-auto scrollbar-thin">
              <div className="min-w-212.5 md:min-w-full">
                {/* Calendar Table Header (Sun-Sat + Sticky Right Weekly Total) */}
                <div className="grid grid-cols-[repeat(7,minmax(100px,1fr))_minmax(115px,130px)] border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 text-xs font-bold text-slate-500 dark:text-slate-400">
                  {WEEKDAYS.map((day) => (
                    <div key={day} className="py-3 px-2 text-center uppercase tracking-wider">
                      {day}
                    </div>
                  ))}
                  {/* Sticky Pinned Right Weekly Total Header */}
                  <div className="sticky right-0 z-20 py-3 px-2 text-center uppercase tracking-wider text-blue-500 border-l border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#070b14] shadow-[-6px_0_12px_-2px_rgba(0,0,0,0.12)] dark:shadow-[-8px_0_16px_-2px_rgba(0,0,0,0.6)]">
                    Weekly Total
                  </div>
                </div>

              {/* Calendar Grid Body */}
              <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {calendarWeeks.map((week, wIdx) => (
                  <div
                    key={wIdx}
                    className="grid grid-cols-[repeat(7,minmax(100px,1fr))_minmax(115px,130px)] min-h-26.25 md:min-h-30"
                  >
                    {week.days.map((day, dIdx) => {
                      const hasTrades = day.trades.length > 0;
                      const isProfit = day.dailyProfit > 0;
                      const isLoss = day.dailyProfit < 0;
                      const isSelected = selectedDayKey === day.dateKey;

                      return (
                        <div
                          key={dIdx}
                          onClick={() => setSelectedDayKey(day.dateKey)}
                          className={`relative z-0 p-2 md:p-2.5 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800/60 transition-all cursor-pointer select-none group ${
                            !day.isCurrentMonth
                              ? "bg-slate-50/40 dark:bg-slate-950/20 opacity-40 hover:opacity-75"
                              : isSelected
                              ? "ring-2 ring-blue-500 bg-blue-500/10 dark:bg-blue-500/15"
                              : isProfit
                              ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                              : isLoss
                              ? "bg-rose-500/5 hover:bg-rose-500/10"
                              : "hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          {/* Day Number Header */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                                day.isToday
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : isSelected
                                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                  : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                              }`}
                            >
                              {day.dayNumber}
                            </span>

                            {hasTrades && (
                              <span className="text-[10px] font-mono text-slate-400">
                                {day.trades.length}t
                              </span>
                            )}
                          </div>

                          {/* Middle PnL Metric */}
                          <div className="my-1">
                            {hasTrades ? (
                              <div className="space-y-0.5">
                                <div
                                  className={`text-xs md:text-sm font-black font-mono tracking-tight ${
                                    isProfit
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : isLoss
                                      ? "text-rose-600 dark:text-rose-400"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {formatCurrency(day.dailyProfit)}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400 truncate">
                                  {formatPoints(day.dailyPoints)}
                                </div>
                              </div>
                            ) : (
                              <div className="h-4" />
                            )}
                          </div>

                          {/* Bottom Indicator Dots / Win Loss Count */}
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            {hasTrades ? (
                              <span
                                className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                                  isProfit
                                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                                    : isLoss
                                    ? "bg-rose-500/20 text-rose-600 dark:text-rose-300"
                                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                }`}
                              >
                                {day.winCount}W / {day.lossCount}L
                              </span>
                            ) : (
                              <span />
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* 8th Column: Pinned Sticky Right Weekly Total */}
                    <div className="sticky right-0 z-10 p-2.5 flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b14] shadow-[-6px_0_12px_-2px_rgba(0,0,0,0.12)] dark:shadow-[-8px_0_16px_-2px_rgba(0,0,0,0.6)]">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Wk {wIdx + 1}
                      </div>

                      {week.weekSummary.tradeCount > 0 ? (
                        <div className="space-y-0.5 my-1">
                          <div
                            className={`text-xs md:text-sm font-black font-mono tracking-tight ${
                              week.weekSummary.totalProfit >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {formatCurrency(week.weekSummary.totalProfit)}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {formatPoints(week.weekSummary.totalPoints)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 font-mono">—</div>
                      )}

                      <div className="text-[10px] font-mono text-slate-400">
                        {week.weekSummary.tradeCount} trades
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Day Trade Details Drawer */}
          {selectedDayKey && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Clock size={16} className="text-blue-500" />
                    Trades Executed on {selectedDayKey}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing individual tickets, executions, stop-loss and take-profit points for this day.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedDayKey(null)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto"
                >
                  Close Day View
                </button>
              </div>

              {selectedDayTrades.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
                  No trades were executed on {selectedDayKey}.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                          <th className="py-2.5 px-3">Ticket / Symbol</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Entry Time</th>
                          <th className="py-2.5 px-3">Exit Time</th>
                          <th className="py-2.5 px-3">Entry Price</th>
                          <th className="py-2.5 px-3">Exit Price</th>
                          <th className="py-2.5 px-3">Points</th>
                          <th className="py-2.5 px-3 text-right">Profit ($)</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                        {paginatedDayTrades.map((trade) => {
                          const { profit, points } = getTradePnL(trade);
                          const isWin = profit > 0;
                          const isBuy = trade.direction === "BUY";

                          return (
                            <tr
                              key={trade.id || String(trade.ticket)}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900 dark:text-white">
                                  #{trade.ticket || trade.id?.slice(0, 8)}
                                </div>
                                <div className="text-[10px] text-slate-400 font-sans">
                                  {trade.symbol || "XAU/USD"}
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    isBuy
                                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                                  }`}
                                >
                                  {trade.direction || "SELL"}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                                {formatTime(trade.entry_time || trade.createdAt)}
                              </td>
                              <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                                {formatTime(trade.exit_time)}
                              </td>
                              <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                                ${Number(trade.entry_price || 0).toFixed(2)}
                              </td>
                              <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                                ${Number(trade.exit_price || 0).toFixed(2)}
                              </td>
                              <td
                                className={`py-3 px-3 font-bold ${
                                  points >= 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {formatPoints(points)}
                              </td>
                              <td
                                className={`py-3 px-3 text-right font-black ${
                                  isWin
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {formatCurrency(profit)}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => setSelectedTrade(trade)}
                                  className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-[11px] font-bold transition-all cursor-pointer"
                                >
                                  Inspect
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Day Trades Pagination Controls */}
                  {dayTradesTotalItems > dayTradesPageSize && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <Pagination
                        currentPage={dayTradesPage}
                        totalPages={dayTradesTotalPages}
                        totalItems={dayTradesTotalItems}
                        pageSize={dayTradesPageSize}
                        onPageChange={setDayTradesPage}
                        onPageSizeChange={setDayTradesPageSize}
                        pageSizeOptions={[5, 8, 15, 30]}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 2: PNL ANALYTICS CHART */}
      {activeTab === "chart" && (
        <div className="space-y-6">
          {/* Cumulative Profit Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Cumulative PnL Equity Curve ({MONTH_NAMES[selectedMonth]} {selectedYear})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual progress of account profit accumulation across trading days.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-500">
                Final: {formatCurrency(monthMetrics.totalProfit)}
              </span>
            </div>

            {/* Daily Bar Chart Representation */}
            <div className="pt-4 space-y-3">
              <div className="text-xs font-semibold text-slate-400">Daily Profit & Loss Distribution</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(monthMetrics.dailyProfitMap).map(([date, data]) => {
                  const isPos = data.profit >= 0;
                  return (
                    <div
                      key={date}
                      onClick={() => {
                        setSelectedDayKey(date);
                        setActiveTab("calendar");
                      }}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between cursor-pointer hover:border-blue-500/50 transition-all"
                    >
                      <div>
                        <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {date}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {data.trades} trades | {formatPoints(data.points)}
                        </div>
                      </div>
                      <div
                        className={`text-sm font-mono font-black ${
                          isPos
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {formatCurrency(data.profit)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab 3: DAILY JOURNAL LOG */}
      {activeTab === "journal" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Daily Performance Log Table
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete historical breakdown grouped by date with volume, win rates and net results.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {Object.keys(monthMetrics.dailyProfitMap).length} Active Trading Days
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Trades</th>
                  <th className="py-3 px-4">Win / Loss</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4">Net PnL ($)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {paginatedDailyEntries.map(([dateKey, data]) => {
                    const dayTrades = tradesByDate[dateKey] || [];
                    const wins = dayTrades.filter((t) => (t.final_pnl_points || t.profit || 0) > 0).length;
                    const losses = dayTrades.filter((t) => (t.final_pnl_points || t.profit || 0) < 0).length;
                    const isProfit = data.profit > 0;

                    return (
                      <tr
                        key={dateKey}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {dateKey}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                          {data.trades} trades
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isProfit
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {wins}W / {losses}L
                          </span>
                        </td>
                        <td
                          className={`py-3.5 px-4 font-bold ${
                            data.points >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {formatPoints(data.points)}
                        </td>
                        <td
                          className={`py-3.5 px-4 font-black ${
                            isProfit
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {formatCurrency(data.profit)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedDayKey(dateKey);
                              setActiveTab("calendar");
                            }}
                            className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-xs font-bold transition-all cursor-pointer"
                          >
                            View Day
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Journal Daily Performance Pagination Controls */}
          {journalTotalItems > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <Pagination
                currentPage={journalPage}
                totalPages={journalTotalPages}
                totalItems={journalTotalItems}
                pageSize={journalPageSize}
                onPageChange={setJournalPage}
                onPageSizeChange={setJournalPageSize}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            </div>
          )}
        </div>
      )}

      {/* 7. Modal: Individual Trade Details */}
      {selectedTrade && (
        <TradeDetailsModal
          trade={selectedTrade}
          isOpen={Boolean(selectedTrade)}
          onClose={() => setSelectedTrade(null)}
        />
      )}
    </div>
  );
}