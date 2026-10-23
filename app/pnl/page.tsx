"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  PlusCircle,
  BarChart2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import PNLSystem from "../components/PNLSystem";
import ManualPNLForm from "../components/ManualPNLForm";

export default function PNLPage() {
  const [activeTab, setActiveTab] = useState<"calendar" | "manual">("calendar");

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Floating Navigation Header with 2 Main PnL Tabs */}
      <div className="sticky top-0 z-30 bg-white/85 dark:bg-[#070b14]/85 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 px-4 md:px-8 py-3.5 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Hub Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-emerald-500 via-teal-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <BarChart2 size={19} />
            </div>
            <div>
              <div className="text-sm md:text-base font-extrabold tracking-tight flex items-center gap-2">
                <span>PnL System & Trading Journal</span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live
                </span>
              </div>
              {/* <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Switch between automated calendar analytics and self-logged trade entries
              </div> */}
            </div>
          </div>

          {/* 2 Primary Tabs: calancData & create pnl by self */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner self-start sm:self-auto">
            {/* Tab 1: Calendar Data */}
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "calendar"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <CalendarDays
                size={16}
                className={activeTab === "calendar" ? "text-emerald-500" : "text-slate-400"}
              />
              <span>PnL Calendar (calancData)</span>
            </button>

            {/* Tab 2: Create PnL by Self Form */}
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "manual"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <PlusCircle
                size={16}
                className={activeTab === "manual" ? "text-purple-500" : "text-slate-400"}
              />
              <span>Create PNL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Render Area */}
      <div className="flex-1">
        {activeTab === "calendar" ? (
          <PNLSystem />
        ) : (
          <div className="flex-1 p-4 md:p-8 space-y-7">
            <ManualPNLForm />
          </div>
        )}
      </div>
    </div>
  );
}