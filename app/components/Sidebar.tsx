"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  TrendingUp,
  History,
  Compass,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import GoogleTranslate from "./GoogleTranslate";

interface NavItem {
  name: string;
  mobileName: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    mobileName: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Live Signals",
    mobileName: "Signals",
    href: "/signals",
    icon: Zap,
    badge: "LIVE",
  },
  {
    name: "Active Trades",
    mobileName: "Trades",
    href: "/trades",
    icon: TrendingUp,
  },
  {
    name: "Trade History",
    mobileName: "History",
    href: "/history",
    icon: History,
  },
  {
    name: "AI Analysis",
    mobileName: "Analysis",
    href: "/analysis",
    icon: Compass,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (itemHref: string) => {
    if (itemHref === "/") return pathname === "/";
    return pathname.startsWith(itemHref);
  };

  return (
    <>
      {/* =====================================================================
       *  MOBILE TOP BAR (< md)
       * ===================================================================== */}
      <header className="md:hidden w-full shrink-0 flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-[#070b14]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/90 sticky top-0 z-40 transition-colors">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <Flame size={18} className="text-slate-950 fill-current" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white notranslate">GoldPilot</span>
            <span className="block text-[9px] font-bold text-amber-500 uppercase tracking-widest leading-none notranslate">AI Client</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Google Translate Switcher */}
          <GoogleTranslate variant="topbar" />

          {/* Live System Indicator */}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-slate-200/60 dark:border-slate-800/60"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? (
              <Sun size={17} className="text-amber-400" />
            ) : (
              <Moon size={17} className="text-blue-600" />
            )}
          </button>
        </div>
      </header>

      {/* =====================================================================
       *  MOBILE BOTTOM NAVIGATION BAR (< md)
       * ===================================================================== */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-2xl border-t border-slate-200/90 dark:border-slate-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.6)] px-2 pt-1.5 pb-safe transition-colors"
      >
        <div className="grid grid-cols-5 gap-1 items-center max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 group ${
                  active
                    ? "text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {/* Active Indicator Top Pill */}
                {active && (
                  <span className="absolute -top-1.5 w-7 h-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-sm shadow-blue-500/50" />
                )}

                {/* Icon wrapper */}
                <div
                  className={`relative p-1 rounded-lg transition-transform duration-200 ${
                    active ? "scale-110 bg-blue-500/10 dark:bg-blue-400/10" : "group-hover:scale-105"
                  }`}
                >
                  <Icon size={20} className="shrink-0" />

                  {/* Pulsing Dot Badge for Live Signals */}
                  {item.badge && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className={`text-[10px] tracking-tight mt-0.5 ${active ? "font-bold" : "font-medium"}`}>
                  {item.mobileName}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* =====================================================================
       *  DESKTOP SIDEBAR (>= md)
       * ===================================================================== */}
      <aside
        className={`hidden md:flex md:sticky top-0 left-0 h-screen z-40 shrink-0 flex-col justify-between transition-all duration-300 ease-in-out
          bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/80
          ${collapsed ? "w-20" : "w-64"}
        `}
      >
        {/* Top Header / Branding */}
        <div>
          <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-850 ${collapsed ? "justify-center" : "justify-between"}`}>
            <Link href="/" className="flex items-center gap-3 group overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform duration-200">
                <Flame size={22} className="text-slate-950 fill-slate-950" />
              </div>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors notranslate">
                    GoldPilot
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400/90 tracking-widest uppercase notranslate">
                    AI Client System
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Toggle */}
            {!collapsed && (
              <button
                onClick={() => setCollapsed(true)}
                className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>

          {/* Navigation Section */}
          <div className="px-3 py-4">
            {!collapsed && (
              <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                Workspace
              </div>
            )}

            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={`group relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150
                      ${collapsed ? "justify-center" : ""}
                      ${
                        active
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900/60"
                      }
                    `}
                  >
                    <Icon
                      size={19}
                      className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        active ? "text-white" : "text-slate-400 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                      }`}
                    />

                    {!collapsed && (
                      <span className="truncate flex-1 tracking-tight">
                        {item.name}
                      </span>
                    )}

                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
                        {item.badge}
                      </span>
                    )}

                    {/* Collapsed Tooltip */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 hidden group-hover:flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xl whitespace-nowrap z-50 pointer-events-none">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Status & Controls */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-850 flex flex-col gap-2.5">
          {/* Live System Connectivity Pill */}
          {!collapsed ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    Firestore Live
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400">
                    Auto Sync Active
                  </span>
                </div>
              </div>
              <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
            </div>
          ) : (
            <div className="flex justify-center py-2" title="Firestore Connected">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>
          )}

          {/* Language Switcher */}
          <GoogleTranslate variant={collapsed ? "collapsed" : "sidebar"} />

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors
              text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60
              ${collapsed ? "justify-center" : "justify-between"}
            `}
          >
            <div className="flex items-center gap-2.5">
              {theme === "dark" ? (
                <Sun size={17} className="text-amber-400 shrink-0" />
              ) : (
                <Moon size={17} className="text-blue-600 shrink-0" />
              )}
              {!collapsed && (
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              )}
            </div>

            {!collapsed && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {theme}
              </span>
            )}
          </button>

          {/* User / Client Card & Expand Toggle */}
          <div className="flex items-center justify-between pt-1">
            <div className={`flex items-center gap-2.5 overflow-hidden ${collapsed ? "justify-center w-full" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                CL
              </div>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    Client Portal
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium truncate">
                    Live Feed Only
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Expand Toggle when Collapsed */}
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors mx-auto mt-2"
                title="Expand sidebar"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
