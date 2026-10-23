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
  User,
  Settings,
  ChartBar,
  LogOut,
  LogsIcon,
  CandlestickChart,
  Database,
  Lock,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import useAuth from "../composable/useAuth";
import GoogleTranslate from "./GoogleTranslate";

interface NavItem {
  name: string;
  mobileName: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>;
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
    name: "AI Analysis",
    mobileName: "Analysis",
    href: "/analysis",
    icon: CandlestickChart,
  },
  {
    name: "Trade History",
    mobileName: "History",
    href: "/history",
    icon: History,
  },
  {
    name: "Settings",
    mobileName: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme, settings } = useTheme();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (itemHref: string) => {
    if (itemHref === "/") return pathname === "/";
    return pathname.startsWith(itemHref);
  };

  // Hide sidebar and mobile bars on login and register pages
  if (pathname?.startsWith("/login") || pathname?.startsWith("/register")) {
    return null;
  }

  return (
    <>
      {/* =====================================================================
       *  MOBILE TOP BAR (< md)
       * ===================================================================== */}
      <header
        style={{
          backgroundColor: "var(--sidebar-bg, #070b14)",
          borderColor: "var(--sidebar-border, #1e293b)",
        }}
        className="md:hidden w-full max-w-full shrink-0 flex items-center justify-between px-3 sm:px-4 py-3 backdrop-blur-xl border-b sticky top-0 z-40 transition-colors box-border"
      >
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 shrink-0">
            <User size={18} className="text-slate-950 fill-current" />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white notranslate truncate block">Signal System</span>
            <span className="block text-[9px] font-bold text-amber-500 uppercase tracking-widest leading-none notranslate truncate">AI Client</span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-slate-200/60 dark:border-slate-800/60 cursor-pointer shrink-0"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? (
              <Sun size={17} className="text-amber-400" />
            ) : (
              <Moon size={17} className="text-blue-600" />
            )}
          </button>

          {/* Account / Logout Link */}
          {user ? (
            <button
              onClick={() => logout()}
              aria-label="Sign Out"
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 transition-colors border border-slate-200/60 dark:border-slate-800/60 cursor-pointer shrink-0"
              title={`Sign Out (${user.email || "Trader"})`}
            >
              <LogOut size={16} />
            </button>
          ) : (
            <Link
              href="/login"
              aria-label="Account Login"
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-slate-200/60 dark:border-slate-800/60 cursor-pointer shrink-0"
              title="Account Login"
            >
              <User size={17} />
            </Link>
          )}
        </div>
      </header>

      {/* =====================================================================
       *  MOBILE BOTTOM NAVIGATION BAR (< md)
       * ===================================================================== */}
      <nav
        aria-label="Mobile Navigation"
        style={{
          backgroundColor: "var(--sidebar-bg, #070b14)",
          borderColor: "var(--sidebar-border, #1e293b)",
        }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-2xl border-t shadow-[0_-4px_20px_rgba(0,0,0,0.15)] px-2 pt-1.5 pb-safe transition-colors max-w-full overflow-hidden"
      >
        <div className="grid grid-cols-5 gap-1 items-center max-w-lg mx-auto w-full">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                style={active ? { color: "var(--sidebar-active-bg, var(--accent-primary))" } : undefined}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 group ${
                  active
                    ? "font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {/* Active Indicator Top Pill */}
                {active && (
                  <span
                    className="absolute -top-1.5 w-7 h-1 rounded-full mobile-active-pill"
                    style={{
                      background: "var(--sidebar-active-gradient, var(--accent-gradient, var(--accent-primary)))",
                      boxShadow: "0 2px 8px var(--sidebar-active-glow, var(--accent-glow, rgba(59, 130, 246, 0.4)))",
                    }}
                  />
                )}

                {/* Icon wrapper */}
                <div
                  className={`relative p-1 rounded-lg transition-transform duration-200 ${
                    active ? "scale-110 mobile-active-icon" : "group-hover:scale-105"
                  }`}
                  style={active ? {
                    backgroundColor: "color-mix(in srgb, var(--sidebar-active-bg, var(--accent-primary)) 15%, transparent)",
                    color: "var(--sidebar-active-bg, var(--accent-primary))",
                  } : undefined}
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
      {/* Spacer to hold desktop sidebar width in layout flow so main content doesn't jump or overlap */}
      <div
        className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out ${
          collapsed ? "w-20" : "w-64"
        }`}
        aria-hidden="true"
      />

      <aside
        className={`hidden md:flex fixed top-0 bottom-0 left-0 h-screen z-40 shrink-0 flex-col justify-between transition-all duration-300 ease-in-out
          backdrop-blur-xl border-r overflow-y-auto no-scrollbar
          ${collapsed ? "w-20" : "w-64"}
        `}
        style={{
          backgroundColor: "var(--sidebar-bg, #070b14)",
          borderColor: "var(--sidebar-border, #1e293b)",
        }}
      >
        {/* Top Header / Branding */}
        <div>
          <div
            className={`flex items-center gap-3 px-4 py-5 border-b ${collapsed ? "justify-center" : "justify-between"}`}
            style={{ borderColor: "var(--sidebar-border, #1e293b)" }}
          >
            <Link href="/" className="flex items-center gap-3 group overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-linear-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform duration-200">
                <User size={22} className="text-slate-950 fill-slate-950" />
              </div>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors notranslate">
                    Signal System
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
                    style={
                      active
                        ? {
                            background: "var(--sidebar-active-gradient, var(--accent-gradient, var(--accent-primary)))",
                            boxShadow: "0 4px 16px var(--sidebar-active-glow, var(--accent-glow, rgba(59, 130, 246, 0.35)))",
                            color: "#ffffff",
                          }
                        : undefined
                    }
                    className={`group relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150
                      ${collapsed ? "justify-center" : ""}
                      ${active
                        ? "sidebar-active-btn font-semibold text-white! shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900/60"
                      }
                    `}
                  >
                    <Icon
                      size={19}
                      className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        active
                          ? "text-white!"
                          : "text-slate-400 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                      }`}
                    />

                    {!collapsed && (
                      <span className="truncate flex-1 tracking-tight" style={active ? { color: "#ffffff" } : undefined}>
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
        <div
          className="p-3 border-t flex flex-col gap-2.5"
          style={{ borderColor: "var(--sidebar-border, #1e293b)" }}
        >
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
                    Analysis Live
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
            {user ? (
              <div
                className={`flex items-center gap-2.5 overflow-hidden flex-1 min-w-0 ${
                  collapsed ? "justify-center w-full" : ""
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    background: "var(--sidebar-active-gradient, var(--accent-gradient))",
                    boxShadow: "0 2px 8px var(--sidebar-active-glow, var(--accent-glow))",
                  }}
                  title={user.email || "Trader"}
                >
                  {user.displayName?.charAt(0).toUpperCase() ||
                    user.email?.charAt(0).toUpperCase() || <User size={16} />}
                </div>
                {!collapsed && (
                  <div className="flex flex-col truncate flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {user.displayName || user.email?.split("@")[0] || "Trader"}
                    </span>
                    <span className="text-[10px] text-emerald-500 font-semibold truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Live Account
                    </span>
                  </div>
                )}
                {!collapsed && (
                  <button
                    onClick={() => logout()}
                    title="Sign Out"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                  >
                    <LogOut size={15} />
                  </button>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                title="Sign In / Account"
                className={`flex items-center gap-2.5 overflow-hidden group hover:opacity-90 transition-all ${
                  collapsed ? "justify-center w-full" : ""
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform"
                  style={{
                    background: "var(--sidebar-active-gradient, var(--accent-gradient))",
                    boxShadow: "0 2px 8px var(--sidebar-active-glow, var(--accent-glow))",
                  }}
                >
                  <User size={17} />
                </div>
                {!collapsed && (
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-500 transition-colors truncate">
                      Client Portal
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium truncate">
                      Sign In / Account
                    </span>
                  </div>
                )}
              </Link>
            )}

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
