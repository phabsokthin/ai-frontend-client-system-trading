"use client";

import React, { useState } from "react";
import {
  Palette,
  Type,
  Volume2,
  VolumeX,
  Sliders,
  RotateCcw,
  Check,
  Sun,
  Moon,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Eye,
  BellRing,
  Download,
  Upload,
  CheckCircle2,
  Maximize2,
  Zap,
  Layout,
} from "lucide-react";
import {
  useTheme,
  BG_THEMES,
  SIDEBAR_BG_THEMES,
  ACCENT_COLORS,
  FONT_SIZES,
  BgTheme,
  SidebarBgTheme,
  AccentColor,
  SidebarColorOption,
  FontSize,
  PricePrecision,
} from "../context/ThemeContext";

type ActiveTab = "appearance" | "typography" | "audio" | "trading";

export default function SettingsPage() {
  const {
    theme,
    toggleTheme,
    setTheme,
    settings,
    updateSetting,
    setBgTheme,
    setSidebarBgTheme,
    setAccentColor,
    setSidebarActiveColor,
    setFontSize,
    resetDefaults,
    playAlertSound,
  } = useTheme();

  const [activeTab, setActiveTab] = useState<ActiveTab>("appearance");
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleReset = () => {
    if (confirm("Reset all settings to default values?")) {
      resetDefaults();
      triggerToast("All settings reset to system defaults");
    }
  };

  const handleExport = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `goldpilot_settings_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast("Settings profile exported successfully");
    } catch {
      triggerToast("Failed to export settings");
    }
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (typeof parsed === "object" && parsed !== null) {
        Object.entries(parsed).forEach(([k, v]) => {
          updateSetting(k as any, v as any);
        });
        setShowImportModal(false);
        setImportJsonText("");
        triggerToast("Settings imported and applied");
      }
    } catch {
      alert("Invalid JSON format. Please paste valid settings JSON.");
    }
  };

  // Filter background themes by active theme mode (dark vs light)
  const currentBgThemes = Object.entries(BG_THEMES).filter(
    ([, config]) => config.type === theme
  ) as [BgTheme, typeof BG_THEMES[BgTheme]][];

  // Active accent config
  const currentAccent = ACCENT_COLORS[settings.accentColor] || ACCENT_COLORS.blue;

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 pb-28 md:pb-12 box-border overflow-x-hidden min-w-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl border border-slate-700 dark:border-slate-200 animate-fade-in text-sm font-medium">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & System Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 w-full min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div
              className="p-2 sm:p-2.5 rounded-2xl text-white shadow-md transition-colors shrink-0"
              style={{ backgroundColor: currentAccent.hex }}
            >
              <Palette size={20} className="sm:w-5.5 sm:h-5.5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                Workstation Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                Customize colors, background styling, typography, sound alerts, and trading view
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions - Responsive Grid on Mobile */}
        <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700/60 min-w-0"
            title="Download settings JSON"
          >
            <Download size={14} className="shrink-0" />
            <span className="truncate">Export</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700/60 min-w-0"
            title="Import settings JSON"
          >
            <Upload size={14} className="shrink-0" />
            <span className="truncate">Import</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 transition-colors border border-rose-500/20 min-w-0"
            title="Reset to default settings"
          >
            <RotateCcw size={14} className="shrink-0" />
            <span className="truncate">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation - Responsive Grid (2x2 on mobile, 4 columns on sm+, no sideways scroll) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 w-full min-w-0">
        <button
          onClick={() => setActiveTab("appearance")}
          className={`w-full flex items-center justify-center sm:justify-start gap-2 px-3 py-2 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer min-w-0 ${
            activeTab === "appearance"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Palette size={16} className="shrink-0" style={{ color: activeTab === "appearance" ? currentAccent.hex : undefined }} />
          <span className="truncate">Appearance</span>
        </button>

        <button
          onClick={() => setActiveTab("typography")}
          className={`w-full flex items-center justify-center sm:justify-start gap-2 px-3 py-2 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer min-w-0 ${
            activeTab === "typography"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Type size={16} className="shrink-0" style={{ color: activeTab === "typography" ? currentAccent.hex : undefined }} />
          <span className="truncate">Font & Scale</span>
        </button>

        <button
          onClick={() => setActiveTab("audio")}
          className={`w-full flex items-center justify-center sm:justify-start gap-2 px-3 py-2 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer min-w-0 ${
            activeTab === "audio"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <BellRing size={16} className="shrink-0" style={{ color: activeTab === "audio" ? currentAccent.hex : undefined }} />
          <span className="truncate">Audio Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab("trading")}
          className={`w-full flex items-center justify-center sm:justify-start gap-2 px-3 py-2 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer min-w-0 ${
            activeTab === "trading"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sliders size={16} className="shrink-0" style={{ color: activeTab === "trading" ? currentAccent.hex : undefined }} />
          <span className="truncate">Workstation</span>
        </button>
      </div>

      {/* Grid: Settings Panel (Left/Center) + Real-Time Live Preview (Right) */}
      <div className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Active Tab Settings (8 cols) */}
        <div className="w-full min-w-0 lg:col-span-7 xl:col-span-8 space-y-5 sm:space-y-6">
          {/* TAB 1: APPEARANCE & THEMES */}
          {activeTab === "appearance" && (
            <div className="space-y-5 sm:space-y-6 animate-fade-in">
              {/* Theme Mode Card */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-500 shrink-0" />
                      Display Mode
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Toggle between Light and Dark interface modes
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    {theme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-400" />}
                    <span>Switch to {theme === "dark" ? "Light" : "Dark"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all text-left ${
                      theme === "dark"
                        ? "border-blue-500 bg-blue-500/10 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-slate-950 text-indigo-400 shadow-inner">
                      <Moon size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Pro trading standard</div>
                    </div>
                    {theme === "dark" && <Check size={18} className="ml-auto text-blue-500" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all text-left ${
                      theme === "light"
                        ? "border-blue-500 bg-blue-500/10 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 border border-amber-200/50">
                      <Sun size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">Light Mode</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">High-illumination spaces</div>
                    </div>
                    {theme === "light" && <Check size={18} className="ml-auto text-blue-500" />}
                  </button>
                </div>
              </div>

              {/* Background Color Palettes */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 w-full min-w-0">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers size={18} className="text-blue-500 shrink-0" />
                    <span>Background Color Themes ({theme === "dark" ? "Dark Palettes" : "Light Palettes"})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select a tailored background atmosphere for your workspace
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
                  {currentBgThemes.map(([key, config]) => {
                    const isSelected = settings.bgTheme === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setBgTheme(key);
                          triggerToast(`Applied ${config.name} background`);
                        }}
                        className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group w-full min-w-0 ${
                          isSelected
                            ? "border-blue-500 shadow-md ring-2 ring-blue-500/20"
                            : "border-slate-200/90 dark:border-slate-800/90 hover:border-slate-400 dark:hover:border-slate-600"
                        }`}
                        style={{ backgroundColor: config.vars.bgCard }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-4 h-4 rounded-full border border-white/20 shadow-xs shrink-0"
                              style={{ backgroundColor: config.preview }}
                            />
                            <span className="text-sm font-bold text-white drop-shadow-xs truncate">
                              {config.name}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="p-1 rounded-full bg-blue-500 text-white shrink-0">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-300 line-clamp-1">
                          {config.description}
                        </p>

                        {/* Color swatch stripes */}
                        <div className="flex items-center flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-white/10">
                          <span className="text-[9px] font-mono text-slate-400 uppercase">Palette:</span>
                          <span className="w-3 h-3 rounded-sm border border-white/20" style={{ backgroundColor: config.vars.bgPrimary }} title="Primary" />
                          <span className="w-3 h-3 rounded-sm border border-white/20" style={{ backgroundColor: config.vars.bgSurface }} title="Surface" />
                          <span className="w-3 h-3 rounded-sm border border-white/20" style={{ backgroundColor: config.vars.bgCard }} title="Card" />
                          <span className="w-3 h-3 rounded-sm border border-white/20" style={{ backgroundColor: config.vars.borderColor }} title="Border" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Palette */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 w-full min-w-0">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Palette size={18} className="shrink-0" style={{ color: currentAccent.hex }} />
                    <span>Primary Accent Color</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Colors key indicators, active navigation badges, action buttons, and active tabs
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 w-full">
                  {(Object.entries(ACCENT_COLORS) as [AccentColor, typeof ACCENT_COLORS[AccentColor]][]).map(
                    ([key, config]) => {
                      const isSelected = settings.accentColor === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setAccentColor(key);
                            triggerToast(`Accent color set to ${config.name}`);
                          }}
                          className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2 sm:gap-3 transition-all text-left w-full min-w-0 ${
                            isSelected
                              ? "border-slate-900 dark:border-white shadow-md ring-2 ring-blue-500/20 bg-slate-50 dark:bg-slate-800/60"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <span
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full shrink-0 shadow-sm flex items-center justify-center text-white"
                            style={{ backgroundColor: config.hex }}
                          >
                            {isSelected && <Check size={11} strokeWidth={3} />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {config.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 truncate">
                              {config.hex}
                            </div>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Sidebar Background Theme */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 w-full min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layout size={18} className="text-indigo-500 shrink-0" />
                      <span>Sidebar Background Color</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Choose the background theme and border styling for the navigation sidebar
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full">
                  {(Object.entries(SIDEBAR_BG_THEMES) as [SidebarBgTheme, typeof SIDEBAR_BG_THEMES[SidebarBgTheme]][]).map(
                    ([key, config]) => {
                      const isSelected = settings.sidebarBgTheme === key;
                      const isMatch = key === "match";

                      return (
                        <button
                          key={`sidebar-bg-theme-${key}`}
                          type="button"
                          onClick={() => {
                            setSidebarBgTheme(key);
                            triggerToast(`Sidebar background set to ${config.name}`);
                          }}
                          className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer w-full min-w-0 ${
                            isSelected
                              ? "border-blue-500 shadow-md ring-2 ring-blue-500/20"
                              : "border-slate-200/90 dark:border-slate-800/90 hover:border-slate-400 dark:hover:border-slate-600"
                          }`}
                          style={{
                            backgroundColor: isMatch ? "var(--bg-card)" : config.bg,
                            borderColor: isSelected ? undefined : config.border,
                          }}
                        >
                          <div className="flex items-center justify-between mb-1.5 min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-4 h-4 rounded-full border border-white/20 shadow-xs shrink-0"
                                style={{
                                  backgroundColor: isMatch ? "var(--bg-primary)" : config.preview,
                                }}
                              />
                              <span
                                className={`text-xs font-bold truncate ${
                                  config.type === "light" && !isMatch
                                    ? "text-slate-900"
                                    : "text-white"
                                }`}
                              >
                                {config.name}
                              </span>
                            </div>
                            {isSelected && (
                              <span className="p-1 rounded-full bg-blue-500 text-white shrink-0 ml-1">
                                <Check size={11} strokeWidth={3} />
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-[10px] line-clamp-1 ${
                              config.type === "light" && !isMatch
                                ? "text-slate-500"
                                : "text-slate-300"
                            }`}
                          >
                            {config.description}
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Sidebar Active Button Color */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 w-full min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layout size={18} className="text-amber-500 shrink-0" />
                      <span>Sidebar Active Button Color</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Choose the active menu highlight style for the desktop sidebar & mobile navigation bar
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 w-full">
                  {/* Option 1: Sync with Accent */}
                  <button
                    type="button"
                    onClick={() => {
                      setSidebarActiveColor("sync");
                      triggerToast("Sidebar active button synced with Primary Accent Color");
                    }}
                    className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2 sm:gap-3 transition-all text-left w-full min-w-0 ${
                      settings.sidebarActiveColor === "sync"
                        ? "border-slate-900 dark:border-white shadow-md ring-2 ring-blue-500/20 bg-slate-50 dark:bg-slate-800/60"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <span
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full shrink-0 shadow-sm flex items-center justify-center text-white"
                      style={{ background: currentAccent.gradient }}
                    >
                      {settings.sidebarActiveColor === "sync" && <Check size={11} strokeWidth={3} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Sync with Accent
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Matches {currentAccent.name}
                      </div>
                    </div>
                  </button>

                  {/* Independent Accent Color options */}
                  {(Object.entries(ACCENT_COLORS) as [AccentColor, typeof ACCENT_COLORS[AccentColor]][]).map(
                    ([key, config]) => {
                      const isSelected = settings.sidebarActiveColor === key;
                      return (
                        <button
                          key={`sidebar-btn-color-${key}`}
                          type="button"
                          onClick={() => {
                            setSidebarActiveColor(key);
                            triggerToast(`Sidebar active button set to ${config.name}`);
                          }}
                          className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2 sm:gap-3 transition-all text-left w-full min-w-0 ${
                            isSelected
                              ? "border-slate-900 dark:border-white shadow-md ring-2 ring-blue-500/20 bg-slate-50 dark:bg-slate-800/60"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <span
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full shrink-0 shadow-sm flex items-center justify-center text-white"
                            style={{ background: config.gradient }}
                          >
                            {isSelected && <Check size={11} strokeWidth={3} />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {config.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 truncate">
                              {config.hex}
                            </div>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TYPOGRAPHY & FONT SIZE */}
          {activeTab === "typography" && (
            <div className="space-y-5 sm:space-y-6 animate-fade-in w-full min-w-0">
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 sm:space-y-5 w-full min-w-0">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Type size={18} className="text-blue-500 shrink-0" />
                    <span>Typography & Interface Scaling</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Adjust root font size to scale the entire trading interface to your screen resolution
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 w-full">
                  {(Object.entries(FONT_SIZES) as [FontSize, typeof FONT_SIZES[FontSize]][]).map(
                    ([key, config]) => {
                      const isSelected = settings.fontSize === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setFontSize(key);
                            triggerToast(`Font size set to ${config.label} (${config.rootPx})`);
                          }}
                          className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all relative w-full min-w-0 ${
                            isSelected
                              ? "border-blue-500 shadow-sm bg-blue-500/10 ring-2 ring-blue-500/20"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5 min-w-0 gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {config.label}
                            </span>
                            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                              {config.rootPx} ({Math.round(config.scale * 100)}%)
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {config.desc}
                          </p>
                          {isSelected && (
                            <div className="absolute top-3 right-3 text-blue-500">
                              <Check size={16} strokeWidth={2.5} />
                            </div>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Typography Live Specimen */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2 w-full min-w-0 overflow-hidden wrap-break-word">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Live Typography Preview
                  </div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white wrap-break-word">
                    XAU/USD Gold Spot $2,745.50
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 wrap-break-word">
                    AI Confluence Zone: Strong Bullish breakout confirmed across 1H / 5M timeframes.
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 wrap-break-word">
                    RSI 14 at 58.4 | EMA 9/21 Golden Cross | ATR 4.25 pts
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIO & SIGNAL ALERTS */}
          {activeTab === "audio" && (
            <div className="space-y-5 sm:space-y-6 animate-fade-in w-full min-w-0">
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 sm:space-y-5 w-full min-w-0">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BellRing size={18} className="text-emerald-500 shrink-0" />
                    <span>Real-Time Signal Sound Alerts</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Audio cues notify you immediately when new BUY or SELL setups are confirmed
                  </p>
                </div>

                {/* Sound On / Off Toggle */}
                <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 gap-3 w-full min-w-0">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div
                      className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${
                        settings.soundAlerts
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                      }`}
                    >
                      {settings.soundAlerts ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        Audio Alert Chimes
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {settings.soundAlerts ? "Enabled — Synthesized sound cues active" : "Muted — Silent mode"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !settings.soundAlerts;
                      updateSetting("soundAlerts", next);
                      if (next) playAlertSound("CHIME");
                    }}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                      settings.soundAlerts ? "bg-emerald-500 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                  </button>
                </div>

                {/* Volume Slider */}
                {settings.soundAlerts && (
                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 w-full min-w-0">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Sound Volume</span>
                      <span>{Math.round(settings.soundVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={settings.soundVolume}
                      onChange={(e) => updateSetting("soundVolume", parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                )}

                {/* Sound Test Buttons */}
                <div className="space-y-2 w-full min-w-0">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Test Audio Chimes:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 w-full">
                    <button
                      type="button"
                      onClick={() => playAlertSound("BUY")}
                      className="flex items-center justify-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer min-w-0"
                    >
                      <TrendingUp size={15} className="shrink-0" />
                      <span className="truncate">Test BUY Chime</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => playAlertSound("SELL")}
                      className="flex items-center justify-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors cursor-pointer min-w-0"
                    >
                      <TrendingDown size={15} className="shrink-0" />
                      <span className="truncate">Test SELL Chime</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => playAlertSound("CHIME")}
                      className="flex items-center justify-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 transition-colors cursor-pointer min-w-0"
                    >
                      <Volume2 size={15} className="shrink-0" />
                      <span className="truncate">Standard Chime</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRADING WORKSTATION PREFERENCES */}
          {activeTab === "trading" && (
            <div className="space-y-5 sm:space-y-6 animate-fade-in w-full min-w-0">
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 sm:space-y-5 w-full min-w-0">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders size={18} className="text-indigo-500 shrink-0" />
                    <span>Workstation Preferences</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Data precision, auto-refresh frequency, and compact layout mode
                  </p>
                </div>

                {/* Price Precision */}
                <div className="space-y-2 w-full min-w-0">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    XAU/USD Gold Price Precision
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => updateSetting("pricePrecision", 2)}
                      className={`p-3 rounded-xl border text-left transition-all w-full min-w-0 ${
                        settings.pricePrecision === 2
                          ? "border-blue-500 bg-blue-500/10 font-bold"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">2 Decimals ($2,745.50)</div>
                      <div className="text-xs text-slate-500 truncate">Standard forex/gold convention</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateSetting("pricePrecision", 3)}
                      className={`p-3 rounded-xl border text-left transition-all w-full min-w-0 ${
                        settings.pricePrecision === 3
                          ? "border-blue-500 bg-blue-500/10 font-bold"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">3 Decimals ($2,745.505)</div>
                      <div className="text-xs text-slate-500 truncate">Sub-pip high precision view</div>
                    </button>
                  </div>
                </div>

                {/* Auto Refresh Frequency */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 w-full min-w-0">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Live Data Refresh Interval
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                    {[
                      { sec: 2, label: "2s (Fast)" },
                      { sec: 4, label: "4s (Norm)" },
                      { sec: 10, label: "10s (Eco)" },
                      { sec: 30, label: "30s (Slow)" },
                    ].map((item) => (
                      <button
                        key={item.sec}
                        type="button"
                        onClick={() => {
                          updateSetting("autoRefreshInterval", item.sec);
                          triggerToast(`Auto-refresh set to ${item.sec} seconds`);
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all truncate ${
                          settings.autoRefreshInterval === item.sec
                            ? "border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* High Contrast Mode Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 gap-3 w-full min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      High Contrast Borders
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Accentuates panel borders for low-contrast monitors
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting("highContrast", !settings.highContrast)}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors shrink-0 ${
                      settings.highContrast ? "bg-blue-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Compact Density Mode Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 gap-3 w-full min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Compact Density Layout
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Tightens padding to fit more data onto single desktop viewports
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting("compactMode", !settings.compactMode)}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors shrink-0 ${
                      settings.compactMode ? "bg-blue-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Real-Time Live Preview Workstation (4 cols) */}
        <div className="w-full min-w-0 lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-4 w-full min-w-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye size={16} style={{ color: currentAccent.hex }} />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Real-Time Live Preview
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                ACTIVE STATE
              </span>
            </div>

            {/* Preview Card Mockup */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-inner space-y-3 bg-(--bg-card) w-full min-w-0 overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full animate-ping shrink-0"
                    style={{ backgroundColor: currentAccent.hex }}
                  />
                  <span className="text-xs font-bold tracking-tight text-(--text-primary) truncate">
                    XAU/USD (Gold)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shrink-0">
                  BUY SIGNAL
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs text-(--text-muted)">Live Price</span>
                <span className="text-xl font-black font-mono text-(--text-primary)">
                  ${(2745.5).toFixed(settings.pricePrecision)}
                </span>
              </div>

              {/* SL / TP Mock */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-(--border-color)">
                <div className="p-2 rounded-lg bg-(--bg-surface) border border-(--border-color) min-w-0">
                  <span className="text-[10px] uppercase font-mono text-(--text-muted) block">Stop Loss</span>
                  <span className="font-mono font-bold text-rose-500 truncate block">
                    ${(2738.0).toFixed(settings.pricePrecision)}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-(--bg-surface) border border-(--border-color) min-w-0">
                  <span className="text-[10px] uppercase font-mono text-(--text-muted) block">Take Profit</span>
                  <span className="font-mono font-bold text-emerald-500 truncate block">
                    ${(2758.0).toFixed(settings.pricePrecision)}
                  </span>
                </div>
              </div>

              {/* Action Button styled with accent color */}
              <button
                type="button"
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 btn-accent cursor-pointer truncate"
              >
                <Zap size={14} className="shrink-0" />
                <span className="truncate">Primary Button (All Pages Styled)</span>
              </button>

              {/* Sidebar Component Live Preview */}
              <div
                className="p-3 rounded-xl border space-y-2 transition-all"
                style={{
                  backgroundColor: "var(--sidebar-bg, #070b14)",
                  borderColor: "var(--sidebar-border, #1e293b)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    Sidebar Theme & Active Button
                  </span>
                  <span className="text-[10px] font-semibold text-slate-300">
                    {SIDEBAR_BG_THEMES[settings.sidebarBgTheme]?.name || "Midnight Navy"}
                  </span>
                </div>
                <div
                  className="p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-white shadow-md cursor-pointer transition-all sidebar-active-btn"
                  style={{
                    background: "var(--sidebar-active-gradient, var(--accent-gradient))",
                    boxShadow: "0 4px 14px var(--sidebar-active-glow, var(--accent-glow))",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Zap size={14} />
                    <span>Live Signals (Active)</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-white/20 font-mono">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>

            {/* Active Configuration Summary */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Theme:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{settings.theme}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Background:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{BG_THEMES[settings.bgTheme]?.name}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Sidebar Background:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {SIDEBAR_BG_THEMES[settings.sidebarBgTheme]?.name || "Midnight Navy"}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Accent Color:</span>
                <span className="font-semibold" style={{ color: currentAccent.hex }}>{currentAccent.name}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Sidebar Active:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {settings.sidebarActiveColor === "sync"
                    ? `Sync (${currentAccent.name})`
                    : ACCENT_COLORS[settings.sidebarActiveColor]?.name}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Font Size:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{FONT_SIZES[settings.fontSize]?.label} ({FONT_SIZES[settings.fontSize]?.rootPx})</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Audio Alerts:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{settings.soundAlerts ? "Active" : "Muted"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload size={18} className="text-blue-500" />
              Import Settings Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste your exported JSON configuration below to restore or share your workstation setup:
            </p>
            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{"theme": "dark", "bgTheme": "midnight", ...}'
              className="w-full p-3 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportJsonText("");
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                Apply Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}