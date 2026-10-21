"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Globe } from "lucide-react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
    __googleTranslatePatched?: boolean;
  }
}

// --------------------------------------------------------------------------
// Robust Monkey-patch for React & Google Translate DOM reconciliation conflicts
// Prevents: "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
// --------------------------------------------------------------------------
if (typeof window !== "undefined" && !window.__googleTranslatePatched) {
  window.__googleTranslatePatched = true;

  if (typeof Node === "function" && Node.prototype) {
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child.parentNode !== this) {
        if (child.parentNode) {
          return child.parentNode.removeChild(child);
        }
        return child;
      }
      return originalRemoveChild.apply(this, arguments as any) as T;
    };

    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        if (referenceNode.parentNode) {
          return referenceNode.parentNode.insertBefore(newNode, referenceNode);
        }
        return newNode;
      }
      return originalInsertBefore.apply(this, arguments as any) as T;
    };
  }
}

export type Language = "en" | "km";

interface GoogleTranslateProps {
  variant?: "topbar" | "sidebar" | "collapsed";
  className?: string;
}

export default function GoogleTranslate({
  variant = "topbar",
  className = "",
}: GoogleTranslateProps) {
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  // Read current language from googtrans cookie
  const getStoredLang = useCallback((): Language => {
    if (typeof document === "undefined") return "en";
    const cookies = document.cookie.split(";");
    for (const c of cookies) {
      const trimmed = c.trim();
      if (trimmed.startsWith("googtrans=")) {
        const val = trimmed.substring("googtrans=".length);
        if (val.includes("/km")) return "km";
        if (val.includes("/en")) return "en";
      }
    }
    return "en";
  }, []);

  // Clean up Google Translate top banner whenever it renders
  const cleanupGoogleBanner = useCallback(() => {
    if (typeof document === "undefined") return;

    // 1. Force body top offset to 0
    if (document.body && document.body.style.top && document.body.style.top !== "0px") {
      document.body.style.top = "0px";
    }

    // 2. Hide all banner frames, skiptranslate wrappers, and iframe containers
    const bannerElements = document.querySelectorAll<HTMLElement>(
      ".goog-te-banner-frame, iframe.goog-te-banner-frame, body > .skiptranslate, iframe[id*=':1.container'], iframe[id*=':2.container'], .goog-te-banner"
    );
    bannerElements.forEach((el) => {
      if (el.closest && el.closest(".notranslate")) return;
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("height", "0", "important");
      el.style.setProperty("opacity", "0", "important");
      el.style.setProperty("pointer-events", "none", "important");
    });
  }, []);

  // Initialize Google Translate Script
  useEffect(() => {
    setMounted(true);
    const initialLang = getStoredLang();
    setCurrentLang(initialLang);

    // Inject highest-priority stylesheet into head to immediately hide the banner iframe
    if (!document.getElementById("google-translate-hide-banner-style")) {
      const styleEl = document.createElement("style");
      styleEl.id = "google-translate-hide-banner-style";
      styleEl.innerHTML = `
        body > .skiptranslate,
        body > iframe.skiptranslate,
        .skiptranslate iframe,
        .goog-te-banner-frame,
        .goog-te-banner-frame.skiptranslate,
        iframe.goog-te-banner-frame,
        iframe[class*="goog-te-banner-frame"],
        iframe[id*=":1.container"],
        iframe[id*=":2.container"],
        .goog-te-banner,
        #goog-gt-tt,
        .goog-te-balloon-frame,
        .goog-tooltip {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          width: 0 !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        body,
        html.translated-ltr body,
        html.translated-rtl body {
          top: 0px !important;
          position: static !important;
        }
      `;
      document.head.appendChild(styleEl);
    }

    // Ensure single hidden Google Translate container in DOM
    if (!document.getElementById("google_translate_element")) {
      const el = document.createElement("div");
      el.id = "google_translate_element";
      el.style.display = "none";
      document.body.appendChild(el);
    }

    // Define callback before injecting script
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,km",
            autoDisplay: false,
            layout: window.google.translate.TranslateElement?.InlineLayout?.SIMPLE,
          },
          "google_translate_element"
        );
      }
    };

    // Inject script if not already added
    const existingScript = document.getElementById("google-translate-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    cleanupGoogleBanner();

    const observer = new MutationObserver(() => {
      cleanupGoogleBanner();
    });

    observer.observe(document.body, {
      childList: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    // Listen for cross-component sync
    const handleLangSync = (e: CustomEvent<{ lang: Language }>) => {
      setCurrentLang(e.detail.lang);
      cleanupGoogleBanner();
    };
    window.addEventListener("client-lang-change" as any, handleLangSync);
    return () => {
      observer.disconnect();
      window.removeEventListener("client-lang-change" as any, handleLangSync);
    };
  }, [getStoredLang, cleanupGoogleBanner]);

  // Handle switching language
  const switchLanguage = (lang: Language) => {
    const cookieVal = lang === "km" ? "/en/km" : "/en/en";

    // Set cookie across path and current host
    const domain = window.location.hostname;
    document.cookie = `googtrans=${cookieVal}; path=/; max-age=31536000`;
    document.cookie = `googtrans=${cookieVal}; domain=${domain}; path=/; max-age=31536000`;
    if (domain.includes(".")) {
      const rootDomain = "." + domain.split(".").slice(-2).join(".");
      document.cookie = `googtrans=${cookieVal}; domain=${rootDomain}; path=/; max-age=31536000`;
    }

    setCurrentLang(lang);

    // Notify other switcher instances
    window.dispatchEvent(
      new CustomEvent("client-lang-change", { detail: { lang } })
    );

    // Try finding the native Google Translate select element
    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event("change"));
      setTimeout(cleanupGoogleBanner, 50);
      setTimeout(cleanupGoogleBanner, 300);
      setTimeout(cleanupGoogleBanner, 800);
    } else {
      // Reload page if combo not ready so cookie is processed by Google Translate script
      window.location.reload();
    }
  };


  const toggleLanguage = () => {
    const next = currentLang === "en" ? "km" : "en";
    switchLanguage(next);
  };

  if (!mounted) {
    // Avoid hydration mismatch
    return null;
  }

  // Collapsed Sidebar Variant (Small icon button with active flag/code)
  if (variant === "collapsed") {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`w-full flex items-center justify-center p-2 rounded-xl text-xs font-semibold transition-colors
          text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-800/60 notranslate ${className}`}
        title={currentLang === "en" ? "Switch to Khmer (ប្តូរជាភាសាខ្មែរ)" : "Switch to English"}
      >
        <div className="flex flex-col items-center gap-0.5">
          <Globe size={16} className="text-blue-500" />
          <span className="text-[9px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
            {currentLang === "en" ? "EN" : "KH"}
          </span>
        </div>
      </button>
    );
  }

  // Expanded Sidebar Variant (Full row with Globe icon and EN/KH toggle pills)
  if (variant === "sidebar") {
    return (
      <div className={`w-full ${className}`}>
        <button
          type="button"
          onClick={toggleLanguage}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 cursor-pointer notranslate"
          title={currentLang === "en" ? "Switch to Khmer (ប្តូរជាភាសាខ្មែរ)" : "Switch to English"}
        >
          <div className="flex items-center gap-2.5">
            <Globe size={17} className="text-blue-500 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {currentLang === "en" ? "English" : "ភាសាខ្មែរ"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                currentLang === "en"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              EN
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                currentLang === "km"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              KH
            </span>
          </div>
        </button>
      </div>
    );
  }

  // Topbar / Header Pill Variant (Dual-button compact pill)
  return (
    <div className={`inline-flex items-center notranslate ${className}`}>
      <div className="flex items-center rounded-xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 p-0.5 shadow-xs">
        <button
          type="button"
          onClick={() => switchLanguage("en")}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            currentLang === "en"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          title="Switch to English"
        >
          <span>🇬🇧</span>
          <span>EN</span>
        </button>

        <button
          type="button"
          onClick={() => switchLanguage("km")}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            currentLang === "km"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          title="ប្តូរជាភាសាខ្មែរ (Khmer)"
        >
          <span>🇰🇭</span>
          <span>KH</span>
        </button>
      </div>
    </div>
  );
}
