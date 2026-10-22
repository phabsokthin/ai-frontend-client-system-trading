"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  TrendingUp,
  Loader2,
  KeyRound,
  Check,
  ChevronLeft,
  Sun,
  Moon,
} from "lucide-react";
import useAuth from "../composable/useAuth";
import useCollection from "../composable/useCollection";
import { useTheme } from "../context/ThemeContext";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Authentication & Firestore Composable Hooks
  const {
    login: authLogin,
    loginWithGoogle,
    resetPassword: authResetPassword,
    user: currentUser,
    isPending: authPending,
    error: authError,
  } = useAuth();
  const { addcDocs } = useCollection("users");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Handle Standard Email/Password Sign-in
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await authLogin(email.trim(), password);

      if (!userCredential || !userCredential.user) {
        throw new Error(authError || "Invalid email or password. Please verify your credentials.");
      }

      // await addcDocs({
      //   uid: userCredential.user.uid,
      //   email: email.trim().toLowerCase(),
      //   lastLoginAt: new Date().toISOString(),
      //   action: "login",
      //   provider: "password",
      // });

      setSuccessMessage(`Welcome back, ${userCredential.user.displayName || userCredential.user.email?.split("@")[0] || "Trader"}!`);

      if (rememberMe) {
        localStorage.setItem("goldpilot_remember_email", email.trim());
      } else {
        localStorage.removeItem("goldpilot_remember_email");
      }

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      console.error("Login error:", errorObj);

      if (errorObj.code === "auth/invalid-credential" || errorObj.code === "auth/wrong-password" || errorObj.code === "auth/user-not-found") {
        setErrorMessage("Invalid email or password. Please verify your credentials or create a new account.");
      } else if (errorObj.code === "auth/invalid-email") {
        setErrorMessage("Please enter a valid email address.");
      } else if (errorObj.code === "auth/too-many-requests") {
        setErrorMessage("Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.");
      } else {
        setErrorMessage(errorObj.message || "Failed to sign in. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Popup Sign-in
  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsGoogleLoading(true);

    try {
      // 1. Authenticate with Google via useAuth
      const result = await loginWithGoogle();

      if (!result || !result.user) {
        if (authError) setErrorMessage(authError);
        return;
      }

      // 2. Store session in Firestore "users" collection through addcDocs
      // await addcDocs({
      //   uid: result.user.uid,
      //   fullName: result.user.displayName || "Google Trader",
      //   email: (result.user.email || "").toLowerCase(),
      //   photoURL: result.user.photoURL || null,
      //   lastLoginAt: new Date().toISOString(),
      //   action: "login",
      //   provider: "google",
      // });

      setSuccessMessage(`Welcome back, ${result.user.displayName || "Trader"}! Redirecting...`);
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      console.error("Google sign in error:", errorObj);
      if (errorObj.code !== "auth/popup-closed-by-user") {
        setErrorMessage(errorObj.message || "Google sign in failed. Please try again.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Instant Demo Trader Access (fills demo credentials)
  const handleDemoAccess = () => {
    setEmail("demo@goldpilot.ai");
    setPassword("Demo123456!");
    setSuccessMessage("Demo credentials loaded. Click 'Sign In to Terminal' to proceed.");
  };

  // Handle Forgot Password via useAuth
  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetStatus({ type: "error", text: "Please enter your account email address." });
      return;
    }

    setResetLoading(true);
    setResetStatus(null);

    try {
      const success = await authResetPassword(resetEmail.trim());
      if (success) {
        setResetStatus({
          type: "success",
          text: `Password reset link sent to ${resetEmail.trim()}! Please check your inbox or spam folder.`,
        });
        setTimeout(() => {
          setShowForgotModal(false);
          setResetStatus(null);
        }, 3500);
      } else {
        setResetStatus({
          type: "error",
          text: authError || "Failed to send reset email. Verify your email address.",
        });
      }
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      setResetStatus({
        type: "error",
        text: errorObj.message || "Failed to send reset email. Verify your email address.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Populate remembered email if previously saved
  useEffect(() => {
    const saved = localStorage.getItem("goldpilot_remember_email");
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 md:p-10 overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between mb-4 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>

        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-slate-200/60 dark:border-slate-800/60 cursor-pointer"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? (
            <Sun size={16} className="text-amber-400" />
          ) : (
            <Moon size={16} className="text-blue-600" />
          )}
        </button>
      </div>

      {/* Background Ambient Glow Elements */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-amber-400/3 blur-[100px]" />

      <div className="relative w-full max-w-md mx-auto z-10">
        {/* Top Floating Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 shadow-sm backdrop-blur-md">
            <Sparkles size={14} className="text-amber-500 animate-pulse" />
            <span className="tracking-wide">AI Institutional Trading Portal</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>

        {/* Card Container */}
        <div
          className="rounded-3xl border shadow-2xl backdrop-blur-xl transition-all duration-300 p-6 sm:p-8"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)",
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Header Brand */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-black shadow-lg shadow-amber-500/25 mb-3.5 transform hover:scale-105 transition-transform duration-200">
              <Zap size={28} className="fill-current text-slate-950" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              System Analysis
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              Sign in to access real-time autonomous gold signals
            </p>
          </div>

          {/* Alert / Status Feedback */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl text-xs sm:text-sm font-medium bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-start gap-2.5 animate-fade-in">
              <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl text-xs sm:text-sm font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 size={17} className="shrink-0 mt-0.5 text-emerald-500" />
              <div className="flex-1 leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* Already logged in indicator banner */}
          {currentUser && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-600 dark:text-slate-300 truncate">
                  Logged in as <strong className="text-slate-900 dark:text-white">{currentUser.email}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0 pl-2"
              >
                Go to Dashboard &rarr;
              </button>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={17} />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all outline-none border focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-900 dark:text-white"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-color)",
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={17} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm font-medium transition-all outline-none border focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-900 dark:text-white"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-color)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-500/30 cursor-pointer accent-amber-500"
                />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Remember my email
                </span>
              </label>

              {/* <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>SSL Encrypted</span>
              </div> */}
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="btn-accent w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div
                className="w-full border-t"
                style={{ borderColor: "var(--border-color)" }}
              />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span
                className="px-3 font-semibold text-slate-400"
                style={{ backgroundColor: "var(--bg-card)" }}
              >
                Or continue with
              </span>
            </div>
          </div>

          {/* Social & Alternative Sign-in Options */}
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-2.5">
            {/* Google Fast Sign-in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              {isGoogleLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.25 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.26C.46 8.16 0 9.98 0 12c0 2.02.46 3.84 1.26 5.43l4.02-3.14z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.57l4.02 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
                  />
                </svg>
              )}
              <span>Google Account</span>
            </button>

            {/* Quick Demo Access */}
            {/* <button
              type="button"
              onClick={handleDemoAccess}
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all hover:border-amber-500/50 hover:bg-amber-500/5 disabled:opacity-50 cursor-pointer text-amber-600 dark:text-amber-400"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-color)",
              }}
            >
              <Zap size={14} className="fill-current text-amber-500 shrink-0" />
              <span>Instant Demo</span>
            </button> */}
          </div>

          {/* Switch to Register link */}
          <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: "var(--border-color)" }}>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/register"
                className="font-bold text-amber-600 dark:text-amber-400 hover:underline transition-colors ml-1 inline-flex items-center gap-1"
              >
                <span>Create an Account</span>
                <ArrowRight size={14} />
              </Link>
            </p>
          </div>
        </div>

        {/* Feature Highlights Footer */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-slate-500/5 border border-slate-500/10">
            <span className="block text-xs font-extrabold text-slate-900 dark:text-white">99.8%</span>
            <span className="text-[10px] text-slate-400">Signal Uptime</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-500/5 border border-slate-500/10">
            <span className="block text-xs font-extrabold text-amber-500">Multi-TF</span>
            <span className="text-[10px] text-slate-400">M5 / M15 / H1</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-500/5 border border-slate-500/10">
            <span className="block text-xs font-extrabold text-emerald-500">&lt; 150ms</span>
            <span className="text-[10px] text-slate-400">AI Latency</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md rounded-2xl border shadow-2xl p-6 relative"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset Password</h3>
                <p className="text-xs text-slate-400">We will email you a secure link to reset it.</p>
              </div>
            </div>

            {resetStatus && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2 ${resetStatus.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-500"
                  }`}
              >
                {resetStatus.type === "success" ? (
                  <Check size={16} className="shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                )}
                <span>{resetStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleSendPasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Account Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-900 dark:text-white"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor: "var(--border-color)",
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetStatus(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="btn-accent px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Email</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}