"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarArrowDown } from "lucide-react";

export default function FloatingPnLButton() {
  const pathname = usePathname();

  // Hide on auth pages or when already on the PnL page
  if (
    !pathname ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/pnl")
  ) {
    return null;
  }

  return (
    <aside
      aria-label="Floating PnL Quick Access"
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 transition-transform duration-300"
    >
      <Link
        href="/pnl"
        aria-label="Open PnL Journal and Calendar"
        title="Open PnL Journal & Calendar"
        className="group flex items-center gap-2.5 pl-2.5 pr-4 py-2 rounded-full bg-slate-950/90 dark:bg-slate-900/90 backdrop-blur-xl border border-amber-500/40 hover:border-amber-400 shadow-[0_8px_30px_rgba(245,158,11,0.25)] hover:shadow-[0_12px_36px_rgba(245,158,11,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-white"
      >
        {/* Glowing Icon Badge */}
        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/30 group-hover:rotate-12 transition-transform duration-300 shrink-0">
          <CalendarArrowDown size={16} className="text-slate-950 stroke-[2.5]" />
        </div>

        {/* Text Details */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold tracking-tight text-white group-hover:text-amber-300 transition-colors">
              PnL Journal
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <span className="text-[10px] font-semibold text-amber-400/90 tracking-wide uppercase">
            Track & Calendar
          </span>
        </div>
      </Link>
    </aside>
  );
}
