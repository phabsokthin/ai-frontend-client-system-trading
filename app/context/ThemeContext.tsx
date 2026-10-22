"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark";
export type BgTheme = "midnight" | "oled" | "slate" | "matrix" | "cyber" | "navy" | "cream" | "ice";
export type AccentColor = "blue" | "emerald" | "cyan" | "amber" | "purple" | "rose" | "aurora" | "sunset";
export type SidebarColorOption = "sync" | AccentColor;
export type SidebarBgTheme = "match" | "midnight" | "oled" | "slate" | "matrix" | "cyber" | "ocean" | "white";
export type FontSize = "small" | "medium" | "large" | "xlarge";
export type PricePrecision = 2 | 3;

export interface AppSettings {
  theme: Theme;
  bgTheme: BgTheme;
  sidebarBgTheme: SidebarBgTheme;
  accentColor: AccentColor;
  sidebarActiveColor: SidebarColorOption;
  fontSize: FontSize;
  soundAlerts: boolean;
  soundVolume: number;
  compactMode: boolean;
  pricePrecision: PricePrecision;
  autoRefreshInterval: number; // in seconds: 2, 4, 10, 30
  highContrast: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  bgTheme: "midnight",
  sidebarBgTheme: "midnight",
  accentColor: "blue",
  sidebarActiveColor: "sync",
  fontSize: "medium",
  soundAlerts: true,
  soundVolume: 0.6,
  compactMode: false,
  pricePrecision: 2,
  autoRefreshInterval: 4,
  highContrast: false,
};

export const BG_THEMES: Record<BgTheme, {
  name: string;
  type: Theme;
  preview: string;
  description: string;
  vars: {
    bgPrimary: string;
    bgSurface: string;
    bgCard: string;
    bgCardHover: string;
    borderColor: string;
    borderSubtle: string;
    sidebarBg: string;
  };
}> = {
  midnight: {
    name: "Midnight Navy",
    type: "dark",
    preview: "#090d16",
    description: "Deep navy-blue dark mode (GoldPilot Default)",
    vars: {
      bgPrimary: "#090d16",
      bgSurface: "#0f172a",
      bgCard: "#131c31",
      bgCardHover: "#18233e",
      borderColor: "#1e293b",
      borderSubtle: "#172033",
      sidebarBg: "#070b14",
    },
  },
  oled: {
    name: "OLED Pitch Black",
    type: "dark",
    preview: "#000000",
    description: "Absolute #000000 blacks for maximum contrast and battery saving",
    vars: {
      bgPrimary: "#000000",
      bgSurface: "#09090b",
      bgCard: "#121214",
      bgCardHover: "#18181b",
      borderColor: "#27272a",
      borderSubtle: "#18181b",
      sidebarBg: "#000000",
    },
  },
  slate: {
    name: "Slate Charcoal",
    type: "dark",
    preview: "#0f172a",
    description: "Modern neutral slate gray with soft contrast",
    vars: {
      bgPrimary: "#0f172a",
      bgSurface: "#1e293b",
      bgCard: "#1e293b",
      bgCardHover: "#334155",
      borderColor: "#334155",
      borderSubtle: "#1e293b",
      sidebarBg: "#0f172a",
    },
  },
  matrix: {
    name: "Emerald Matrix",
    type: "dark",
    preview: "#041411",
    description: "FinTech emerald & forest tint tailored for FX traders",
    vars: {
      bgPrimary: "#041411",
      bgSurface: "#08211d",
      bgCard: "#0d2c27",
      bgCardHover: "#123a33",
      borderColor: "#174b43",
      borderSubtle: "#0e312b",
      sidebarBg: "#03120f",
    },
  },
  cyber: {
    name: "Cyber Neon",
    type: "dark",
    preview: "#0b0d1e",
    description: "Vibrant neon-indigo cybernetic ambiance",
    vars: {
      bgPrimary: "#0b0d1e",
      bgSurface: "#131633",
      bgCard: "#191d44",
      bgCardHover: "#202556",
      borderColor: "#29306e",
      borderSubtle: "#1b204a",
      sidebarBg: "#090a18",
    },
  },
  navy: {
    name: "Royal Ocean",
    type: "dark",
    preview: "#061325",
    description: "Deep oceanic blue styling with sapphire reflections",
    vars: {
      bgPrimary: "#061325",
      bgSurface: "#0b1e38",
      bgCard: "#0f274a",
      bgCardHover: "#143360",
      borderColor: "#1c457d",
      borderSubtle: "#112c53",
      sidebarBg: "#050e1c",
    },
  },
  cream: {
    name: "Warm Cream",
    type: "light",
    preview: "#faf8f5",
    description: "Soothing warm ivory paper palette for daylight readability",
    vars: {
      bgPrimary: "#faf8f5",
      bgSurface: "#ffffff",
      bgCard: "#ffffff",
      bgCardHover: "#f5efe6",
      borderColor: "#e8dfd3",
      borderSubtle: "#f2ece4",
      sidebarBg: "#ffffff",
    },
  },
  ice: {
    name: "Cool Ice White",
    type: "light",
    preview: "#f0f6ff",
    description: "Clean modern blue-tinted daylight design",
    vars: {
      bgPrimary: "#f0f6ff",
      bgSurface: "#ffffff",
      bgCard: "#ffffff",
      bgCardHover: "#e2efff",
      borderColor: "#c7dfff",
      borderSubtle: "#e0eeff",
      sidebarBg: "#ffffff",
    },
  },
};

export const SIDEBAR_BG_THEMES: Record<SidebarBgTheme, {
  name: string;
  type: "both" | "dark" | "light";
  preview: string;
  bg: string;
  border: string;
  description: string;
}> = {
  match: {
    name: "Match App Background",
    type: "both",
    preview: "transparent",
    bg: "var(--bg-primary)",
    border: "var(--border-color)",
    description: "Seamlessly blends sidebar with active background theme",
  },
  midnight: {
    name: "Midnight Navy",
    type: "dark",
    preview: "#070b14",
    bg: "#070b14",
    border: "#162032",
    description: "Classic deep obsidian navy-blue sidebar",
  },
  oled: {
    name: "OLED Pitch Black",
    type: "dark",
    preview: "#000000",
    bg: "#000000",
    border: "#1a1a1a",
    description: "Pure #000000 black sidebar with sharp borders",
  },
  slate: {
    name: "Slate Charcoal",
    type: "dark",
    preview: "#0f172a",
    bg: "#0f172a",
    border: "#1e293b",
    description: "Clean modern charcoal slate panel",
  },
  matrix: {
    name: "Emerald Forest",
    type: "dark",
    preview: "#03120f",
    bg: "#03120f",
    border: "#0e312b",
    description: "Deep emerald forest tone for trading stations",
  },
  cyber: {
    name: "Cyber Violet",
    type: "dark",
    preview: "#090a18",
    bg: "#090a18",
    border: "#1b1d3d",
    description: "Dark sci-fi violet ambiance",
  },
  ocean: {
    name: "Royal Sapphire",
    type: "dark",
    preview: "#050e1c",
    bg: "#050e1c",
    border: "#0f2342",
    description: "Deep ocean night blue",
  },
  white: {
    name: "Clean Daylight White",
    type: "light",
    preview: "#ffffff",
    bg: "#ffffff",
    border: "#e2e8f0",
    description: "Crisp white minimalist sidebar",
  },
};

export const ACCENT_COLORS: Record<AccentColor, {
  name: string;
  hex: string;
  secondaryHex: string;
  hoverHex: string;
  gradient: string;
  glow: string;
  twClass: string;
}> = {
  blue: {
    name: "Electric Blue",
    hex: "#3b82f6",
    secondaryHex: "#4f46e5",
    hoverHex: "#2563eb",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
    glow: "rgba(59, 130, 246, 0.4)",
    twClass: "bg-blue-600",
  },
  emerald: {
    name: "Emerald Green",
    hex: "#10b981",
    secondaryHex: "#059669",
    hoverHex: "#059669",
    gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
    glow: "rgba(16, 185, 129, 0.4)",
    twClass: "bg-emerald-600",
  },
  cyan: {
    name: "Cyber Cyan",
    hex: "#06b6d4",
    secondaryHex: "#0284c7",
    hoverHex: "#0891b2",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)",
    glow: "rgba(6, 182, 212, 0.4)",
    twClass: "bg-cyan-500",
  },
  amber: {
    name: "Gold Amber",
    hex: "#f59e0b",
    secondaryHex: "#d97706",
    hoverHex: "#d97706",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
    glow: "rgba(245, 158, 11, 0.4)",
    twClass: "bg-amber-500",
  },
  purple: {
    name: "Neon Purple",
    hex: "#8b5cf6",
    secondaryHex: "#6366f1",
    hoverHex: "#7c3aed",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
    glow: "rgba(139, 92, 246, 0.4)",
    twClass: "bg-purple-600",
  },
  rose: {
    name: "Crimson Rose",
    hex: "#f43f5e",
    secondaryHex: "#e11d48",
    hoverHex: "#e11d48",
    gradient: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
    glow: "rgba(244, 63, 94, 0.4)",
    twClass: "bg-rose-500",
  },
  aurora: {
    name: "Cyber Aurora",
    hex: "#06b6d4",
    secondaryHex: "#8b5cf6",
    hoverHex: "#0891b2",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)",
    glow: "rgba(139, 92, 246, 0.4)",
    twClass: "bg-cyan-500",
  },
  sunset: {
    name: "Golden Sunset",
    hex: "#f59e0b",
    secondaryHex: "#f43f5e",
    hoverHex: "#d97706",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)",
    glow: "rgba(244, 63, 94, 0.4)",
    twClass: "bg-amber-500",
  },
};

export const FONT_SIZES: Record<FontSize, { label: string; scale: number; rootPx: string; desc: string }> = {
  small: { label: "Compact", scale: 0.875, rootPx: "14px", desc: "Dense view for multi-panel desktop screens" },
  medium: { label: "Standard", scale: 1.0, rootPx: "16px", desc: "Default balanced typography (Recommended)" },
  large: { label: "Comfortable", scale: 1.125, rootPx: "18px", desc: "Relaxed viewing for large or high-DPI displays" },
  xlarge: { label: "Expanded", scale: 1.25, rootPx: "20px", desc: "Maximum readability & presentation layout" },
};

export function playTradeAlertSound(type: "BUY" | "SELL" | "CHIME" = "CHIME", volume: number = 0.6) {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const vol = Math.max(0.01, Math.min(volume, 1)) * 0.35;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    if (type === "BUY") {
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    } else if (type === "SELL") {
      osc.frequency.setValueAtTime(783.99, now); // G5
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.15); // C5
    } else {
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.18); // C6
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {
    console.debug("Audio cue error:", e);
  }
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  setBgTheme: (bg: BgTheme) => void;
  setSidebarBgTheme: (bg: SidebarBgTheme) => void;
  setAccentColor: (accent: AccentColor) => void;
  setSidebarActiveColor: (color: SidebarColorOption) => void;
  setFontSize: (size: FontSize) => void;
  resetDefaults: () => void;
  playAlertSound: (type?: "BUY" | "SELL" | "CHIME") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = "ai_trading_settings_v2";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  // Apply CSS variables and classes to the DOM
  const applySettingsToDOM = useCallback((s: AppSettings) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    // 1. Theme class
    const isDark = s.theme === "dark";
    root.classList.toggle("dark", isDark);

    // 2. Background theme variables
    let bgConfig = BG_THEMES[s.bgTheme];
    if (!bgConfig || (isDark && bgConfig.type === "light") || (!isDark && bgConfig.type === "dark")) {
      bgConfig = isDark ? BG_THEMES.midnight : BG_THEMES.ice;
    }

    const vars = bgConfig.vars;
    root.style.setProperty("--bg-primary", vars.bgPrimary);
    root.style.setProperty("--bg-surface", vars.bgSurface);
    root.style.setProperty("--bg-card", vars.bgCard);
    root.style.setProperty("--bg-card-hover", vars.bgCardHover);
    root.style.setProperty("--border-color", vars.borderColor);
    root.style.setProperty("--border-subtle", vars.borderSubtle);

    // 3. Sidebar Background & Border Styling
    const sBgKey = s.sidebarBgTheme || "midnight";
    let sBgConfig = SIDEBAR_BG_THEMES[sBgKey];
    if (!sBgConfig) sBgConfig = isDark ? SIDEBAR_BG_THEMES.midnight : SIDEBAR_BG_THEMES.white;

    let resolvedSidebarBg = sBgConfig.bg;
    let resolvedSidebarBorder = sBgConfig.border;
    if (sBgKey === "match") {
      resolvedSidebarBg = vars.bgPrimary;
      resolvedSidebarBorder = vars.borderColor;
    } else if (!isDark && sBgConfig.type === "dark") {
      resolvedSidebarBg = "#ffffff";
      resolvedSidebarBorder = "#e2e8f0";
    }

    root.style.setProperty("--sidebar-bg", resolvedSidebarBg);
    root.style.setProperty("--sidebar-border", resolvedSidebarBorder);

    // 4. Primary Accent Color & Gradient (applies to buttons, highlights, badges all over the app)
    const accent = ACCENT_COLORS[s.accentColor] || ACCENT_COLORS.blue;
    root.style.setProperty("--accent-primary", accent.hex);
    root.style.setProperty("--accent-secondary", accent.secondaryHex);
    root.style.setProperty("--accent-hover", accent.hoverHex);
    root.style.setProperty("--accent-gradient", accent.gradient);
    root.style.setProperty("--accent-glow", accent.glow);
    root.style.setProperty("--accent-blue", accent.hex); // maps legacy or tailwind classes

    // 5. Sidebar Active Button Color & Gradient
    const sidebarColorKey = s.sidebarActiveColor === "sync" ? s.accentColor : s.sidebarActiveColor;
    const sidebarAccent = ACCENT_COLORS[sidebarColorKey] || accent;
    root.style.setProperty("--sidebar-active-bg", sidebarAccent.hex);
    root.style.setProperty("--sidebar-active-secondary", sidebarAccent.secondaryHex);
    root.style.setProperty("--sidebar-active-gradient", sidebarAccent.gradient);
    root.style.setProperty("--sidebar-active-glow", sidebarAccent.glow);

    // 6. Font size scaling
    const fontConf = FONT_SIZES[s.fontSize] || FONT_SIZES.medium;
    root.style.fontSize = fontConf.rootPx;

    // 7. Classes
    root.classList.toggle("high-contrast", s.highContrast);
    root.classList.toggle("compact-mode", s.compactMode);
  }, []);

  // Load saved settings from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged: AppSettings = { ...DEFAULT_SETTINGS, ...parsed };
        setSettings(merged);
        applySettingsToDOM(merged);
        return;
      }

      // Legacy fallback for ai_theme
      const legacyTheme = localStorage.getItem("ai_theme") as Theme | null;
      if (legacyTheme === "light" || legacyTheme === "dark") {
        const initial: AppSettings = {
          ...DEFAULT_SETTINGS,
          theme: legacyTheme,
          bgTheme: legacyTheme === "dark" ? "midnight" : "ice",
          sidebarBgTheme: legacyTheme === "dark" ? "midnight" : "white",
        };
        setSettings(initial);
        applySettingsToDOM(initial);
        return;
      }
    } catch (e) {
      console.warn("Could not parse saved settings:", e);
    }

    applySettingsToDOM(DEFAULT_SETTINGS);
  }, [applySettingsToDOM]);

  // Persist and apply setting updates
  const saveAndApply = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    applySettingsToDOM(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      localStorage.setItem("ai_theme", newSettings.theme);
    } catch (e) {
      console.warn("Could not save settings to localStorage:", e);
    }
  }, [applySettingsToDOM]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveAndApply(next);
      return next;
    });
  }, [saveAndApply]);

  const setTheme = useCallback((newTheme: Theme) => {
    setSettings((prev) => {
      // Pick matching bgTheme if previous was opposite mode
      const currentBg = BG_THEMES[prev.bgTheme];
      const needsBgChange = !currentBg || currentBg.type !== newTheme;
      const nextBg: BgTheme = needsBgChange ? (newTheme === "dark" ? "midnight" : "ice") : prev.bgTheme;
      const nextSidebarBg: SidebarBgTheme = newTheme === "dark" ? "midnight" : "white";

      const next = { ...prev, theme: newTheme, bgTheme: nextBg, sidebarBgTheme: nextSidebarBg };
      saveAndApply(next);
      return next;
    });
  }, [saveAndApply]);

  const toggleTheme = useCallback(() => {
    setTheme(settings.theme === "dark" ? "light" : "dark");
  }, [settings.theme, setTheme]);

  const setBgTheme = useCallback((bg: BgTheme) => {
    const config = BG_THEMES[bg];
    setSettings((prev) => {
      const next = {
        ...prev,
        bgTheme: bg,
        theme: config ? config.type : prev.theme,
      };
      saveAndApply(next);
      return next;
    });
  }, [saveAndApply]);

  const setSidebarBgTheme = useCallback((bg: SidebarBgTheme) => {
    updateSetting("sidebarBgTheme", bg);
  }, [updateSetting]);

  const setAccentColor = useCallback((accent: AccentColor) => {
    updateSetting("accentColor", accent);
  }, [updateSetting]);

  const setSidebarActiveColor = useCallback((color: SidebarColorOption) => {
    updateSetting("sidebarActiveColor", color);
  }, [updateSetting]);

  const setFontSize = useCallback((size: FontSize) => {
    updateSetting("fontSize", size);
  }, [updateSetting]);

  const resetDefaults = useCallback(() => {
    saveAndApply(DEFAULT_SETTINGS);
  }, [saveAndApply]);

  const playAlertSound = useCallback((type: "BUY" | "SELL" | "CHIME" = "CHIME") => {
    if (settings.soundAlerts) {
      playTradeAlertSound(type, settings.soundVolume);
    }
  }, [settings.soundAlerts, settings.soundVolume]);

  return (
    <ThemeContext.Provider
      value={{
        theme: settings.theme,
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
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
