"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    User as UserIcon,
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
    Loader2,
    Check,
    X,
    ChevronLeft,
    Sun,
    Moon,
} from "lucide-react";
import useAuth from "../composable/useAuth";
import useCollection from "../composable/useCollection";
import { useTheme } from "../context/ThemeContext";

export default function RegisterPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    // Authentication & Firestore Composable Hooks
    const {
        register: authRegister,
        loginWithGoogle,
        user: authUser,
        isPending: authPending,
        error: authError,
    } = useAuth();
    const { addcDocs, isPending: isSavingDoc } = useCollection("users");

    // Form State
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(true);

    // Status & Feedback
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Real-time Password Strength Calculations
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialOrUpper = /[A-Z!@#$%^&*(),.?":{}|<>]/.test(password);

    const calculateStrength = () => {
        if (!password) return 0;
        let score = 0;
        if (password.length >= 6) score += 1;
        if (hasMinLength) score += 1;
        if (hasNumber) score += 1;
        if (hasSpecialOrUpper) score += 1;
        return score;
    };

    const strengthScore = calculateStrength();
    const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
    const strengthColors = [
        "bg-rose-500",
        "bg-amber-500",
        "bg-blue-500",
        "bg-emerald-500",
    ];

    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

    // Handle Register Submit
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!fullName.trim()) {
            setErrorMessage("Please enter your full name.");
            return;
        }

        if (!email.trim() || !password) {
            setErrorMessage("Please fill in your email address and password.");
            return;
        }

        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match. Please re-check.");
            return;
        }

        if (!agreeTerms) {
            setErrorMessage("You must agree to the Terms of Service and Risk Disclosure to register.");
            return;
        }

        setIsLoading(true);

        try {

            const credential = await authRegister(email.trim(), password, fullName.trim());

            if (!credential || !credential.user) {
                throw new Error(authError || "Registration failed. Please check your credentials.");
            }


            await addcDocs({
                uid: credential.user.uid,
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                password: password,
                role: "client",
                tier: "VIP",
                status: "active",
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                provider: "password",
            });

            setSuccessMessage(`Account created successfully! Welcome aboard, ${fullName.trim()}.`);
            setTimeout(() => {
                router.push("/");
            }, 1200);
        } catch (err: unknown) {
            const errorObj = err as { code?: string; message?: string };
            console.error("Registration error:", errorObj);

            if (errorObj.code === "auth/email-already-in-use") {
                setErrorMessage("An account with this email address already exists. Try signing in instead.");
            } else if (errorObj.code === "auth/invalid-email") {
                setErrorMessage("Please enter a valid email address.");
            } else if (errorObj.code === "auth/weak-password") {
                setErrorMessage("Password is too weak. Please use a stronger combination of letters and numbers.");
            } else {
                setErrorMessage(errorObj.message || "Failed to create account. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Google Fast Sign-up
    const handleGoogleSignUp = async () => {
        setErrorMessage("");
        setSuccessMessage("");
        setIsGoogleLoading(true);

        try {
            const result = await loginWithGoogle();

            if (!result || !result.user) {
                if (authError) setErrorMessage(authError);
                return;
            }

            await addcDocs({
                uid: result.user.uid,
                fullName: result.user.displayName || "Google Trader",
                email: (result.user.email || "").toLowerCase(),
                photoURL: result.user.photoURL || null,
                role: "client",
                tier: "VIP",
                status: "active",
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                provider: "google",
            });

            setSuccessMessage(`Welcome, ${result.user.displayName || "Trader"}! Account connected.`);
            setTimeout(() => {
                router.push("/");
            }, 1000);
        } catch (err: unknown) {
            const errorObj = err as { code?: string; message?: string };
            console.error("Google sign up error:", errorObj);
            if (errorObj.code !== "auth/popup-closed-by-user") {
                setErrorMessage(errorObj.message || "Google registration failed. Please try again.");
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

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
            <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-amber-400/3 blur-[100px]" />

            <div className="relative w-full max-w-md mx-auto z-10">
                {/* Top Floating Badge */}
                <div className="flex justify-center mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 shadow-sm backdrop-blur-md">
                        <Sparkles size={14} className="text-amber-500 animate-pulse" />
                        <span className="tracking-wide">Join Elite Trading AI Network</span>
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
                            Create Account
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                            Get live access to institutional gold signals & AI setups
                        </p>
                    </div>

                    {/* Feedback Alerts */}
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

                    {/* Registration Form */}
                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label
                                htmlFor="register-name"
                                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                            >
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <UserIcon size={17} />
                                </div>
                                <input
                                    id="register-name"
                                    type="text"
                                    required
                                    autoComplete="name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="e.g. full name"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all outline-none border focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-900 dark:text-white"
                                    style={{
                                        backgroundColor: "var(--bg-surface)",
                                        borderColor: "var(--border-color)",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="register-email"
                                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Mail size={17} />
                                </div>
                                <input
                                    id="register-email"
                                    type="email"
                                    required
                                    autoComplete="email"
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
                            <label
                                htmlFor="register-password"
                                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={17} />
                                </div>
                                <input
                                    id="register-password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 8 characters"
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

                            {/* Password Strength Meter */}
                            {password.length > 0 && (
                                <div className="mt-2 space-y-1.5 animate-fade-in">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400">Strength:</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            {strengthLabels[strengthScore - 1] || "Too Weak"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-1.5 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-full rounded-full transition-all duration-300 ${strengthScore >= level
                                                        ? strengthColors[strengthScore - 1]
                                                        : "bg-transparent"
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Micro rules */}
                                    <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400">
                                        <span className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-500 font-semibold" : ""}`}>
                                            {hasMinLength ? <Check size={11} /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                                            8+ chars
                                        </span>
                                        <span className={`flex items-center gap-1 ${hasNumber ? "text-emerald-500 font-semibold" : ""}`}>
                                            {hasNumber ? <Check size={11} /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                                            Number
                                        </span>
                                        <span className={`flex items-center gap-1 ${hasSpecialOrUpper ? "text-emerald-500 font-semibold" : ""}`}>
                                            {hasSpecialOrUpper ? <Check size={11} /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                                            Symbol or Uppercase
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label
                                htmlFor="register-confirm-password"
                                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={17} />
                                </div>
                                <input
                                    id="register-confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                    className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-sm font-medium transition-all outline-none border focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-900 dark:text-white ${passwordsMatch
                                            ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                                            : passwordsMismatch
                                                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                                                : ""
                                        }`}
                                    style={{
                                        backgroundColor: "var(--bg-surface)",
                                        borderColor:
                                            passwordsMatch
                                                ? "#10b981"
                                                : passwordsMismatch
                                                    ? "#ef4444"
                                                    : "var(--border-color)",
                                    }}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-1.5">
                                    {passwordsMatch && (
                                        <Check size={16} className="text-emerald-500 animate-fade-in" />
                                    )}
                                    {passwordsMismatch && (
                                        <X size={16} className="text-rose-500 animate-fade-in" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Terms and Risk Disclosure Checkbox */}
                        <div className="pt-1">
                            <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    required
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-500/30 cursor-pointer accent-amber-500 shrink-0"
                                />
                                <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    I agree to GoldPilot&apos;s{" "}
                                    <span className="text-amber-600 dark:text-amber-400 underline">Terms of Service</span>,{" "}
                                    <span className="text-amber-600 dark:text-amber-400 underline">Privacy Policy</span>, and understand that trading carries inherent financial risk.
                                </span>
                            </label>
                        </div>

                        {/* Primary Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || isGoogleLoading}
                            className="btn-accent w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
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
                                Or register with
                            </span>
                        </div>
                    </div>

                    {/* Social Sign Up */}
                    <div>
                        <button
                            type="button"
                            onClick={handleGoogleSignUp}
                            disabled={isLoading || isGoogleLoading}
                            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-50 cursor-pointer"
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
                            <span>Continue with Google</span>
                        </button>
                    </div>

                    {/* Switch to Login link */}
                    <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: "var(--border-color)" }}>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            Already have a account?{" "}
                            <Link
                                href="/login"
                                className="font-bold text-amber-600 dark:text-amber-400 hover:underline transition-colors ml-1 inline-flex items-center gap-1"
                            >
                                <span>Sign In</span>
                                <ArrowRight size={14} />
                            </Link>
                        </p>
                    </div>
                </div>

               
            </div>
        </div>
    );
}