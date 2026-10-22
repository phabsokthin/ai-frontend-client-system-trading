"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import Sidebar from "./Sidebar";
import { Zap, Loader2, ShieldCheck } from "lucide-react";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);

  const isAuthPage =
    pathname?.startsWith("/login") || pathname?.startsWith("/register");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!user && !isAuthPage) {
      router.replace("/login");
    } else if (user && isAuthPage) {
      router.replace("/");
    }
  }, [authReady, user, isAuthPage, router]);

  const showLoading = !authReady && !isAuthPage;
  const showRedirectToLogin = authReady && !user && !isAuthPage;
  const showRedirectToDashboard = authReady && user && isAuthPage;

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full max-w-full overflow-x-hidden">
      {!isAuthPage && user && <Sidebar />}
      <div
        className={`flex-1 min-w-0 w-full max-w-full flex flex-col overflow-x-hidden ${isAuthPage ? "min-h-screen" : "pb-20 md:pb-0"
          }`}
      >
        {showLoading ? (
          <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-(--bg-primary) text-(--text-primary)">
            <div className="flex flex-col items-center gap-4 animate-fade-in text-center max-w-sm">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-amber-500/25 animate-pulse">
                  <Zap size={32} className="fill-current" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center">
                  <ShieldCheck size={14} className="text-emerald-400" />
                </div>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  GoldPilot AI Terminal
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                  <Loader2 size={13} className="animate-spin text-amber-500" />
                  <span>Checking authentication status...</span>
                </p>
              </div>
            </div>
            {/* Kept in tree to allow Next.js segment validation for instant navigation */}
            <div className="hidden" aria-hidden="true">
              {children}
            </div>
          </div>
        ) : showRedirectToLogin ? (
          <div className="min-h-screen w-full flex items-center justify-center bg-(--bg-primary)">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 size={16} className="animate-spin text-amber-500" />
              <span>Redirecting to login...</span>
            </div>
            {/* Kept in tree to allow Next.js segment validation for instant navigation */}
            <div className="hidden" aria-hidden="true">
              {children}
            </div>
          </div>
        ) : showRedirectToDashboard ? (
          <div className="min-h-screen w-full flex items-center justify-center bg-(--bg-primary)">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 size={16} className="animate-spin text-amber-500" />
              <span>Already signed in. Returning to dashboard...</span>
            </div>
            {/* Kept in tree to allow Next.js segment validation for instant navigation */}
            <div className="hidden" aria-hidden="true">
              {children}
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
