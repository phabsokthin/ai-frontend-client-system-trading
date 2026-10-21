"use client";

import React from "react";
import { Flame, Radio, Activity } from "lucide-react";

interface LoadingProps {
  message?: string;
  subtitle?: string;
  fullScreen?: boolean;
}

export default function Loading({
  message = "Connecting to Trading Engine...",
  subtitle = "Streaming live signals, market analysis & MT5 telemetry",
  fullScreen = false,
}: LoadingProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4"
    : "flex flex-col items-center justify-center min-h-[380px] w-full p-6";

  return (
    <div className={containerClasses}>
      <div className="relative flex flex-col items-center max-w-sm text-center">
        {/* Glow halo behind the icon */}
        <div className="absolute -top-10 w-44 h-44 rounded-full bg-gradient-to-tr from-amber-500/25 via-blue-500/15 to-transparent blur-3xl pointer-events-none animate-pulse" />

        {/* Concentric rotating glowing spinners */}
        <div className="relative w-20 h-20 flex items-center justify-center mb-6">
          {/* Outer dashed spinning ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 border-r-amber-400/50 animate-spin" style={{ animationDuration: "1.6s" }} />

          {/* Middle counter-spinning ring */}
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-blue-500 border-l-blue-400/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "2.4s" }} />

          {/* Inner core badge */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
            <Flame size={24} className="fill-slate-950 animate-bounce" style={{ animationDuration: "1.8s" }} />
          </div>
        </div>

        {/* Text Details */}
        <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <span>{message}</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xs">
          {subtitle}
        </p>

        {/* Animated Shimmer Bar */}
        <div className="w-48 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800/80 mt-5 overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-blue-500 to-amber-400 w-1/2 rounded-full animate-[shimmer_1.5s_infinite_linear]" style={{
            animation: "shimmerSlide 1.4s ease-in-out infinite alternate"
          }} />
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 mt-5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            AI System
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Radio size={12} className="text-blue-500" /> XAU/USD
          </span>
        </div>
      </div>
    </div>
  );
}
