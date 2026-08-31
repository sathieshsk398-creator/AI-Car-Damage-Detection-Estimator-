import React, { useState } from "react";
import { 
  KeyRound, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Lock, 
  ArrowLeft, 
  Loader2, 
  CheckCircle,
  Building,
  UserPlus,
  LogIn,
  Database
} from "lucide-react";
import { 
  loginAdminApi, 
  registerAdminApi,
  setAdminSession
} from "../utils/authStorage";

interface AdminLoginProps {
  onLoginSuccess: (token: string, user: { email: string; role: string; shopName: string }) => void;
  onCancel: () => void;
}

export default function AdminLogin({ onLoginSuccess, onCancel }: AdminLoginProps) {
  const [activeMode, setActiveMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      setEmailError("Email address is required.");
      return false;
    } else if (!emailRegex.test(val)) {
      setEmailError("Please enter a valid email format.");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const isEmailValid = validateEmail(email);
    if (!isEmailValid) return;

    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }

    if (activeMode === "register" && password.length < 6) {
      setErrorMessage("Custom security password must be at least 6 characters long.");
      return;
    }

    const trimmedEmail = email.toLowerCase().trim();
    const effectiveShopName = shopName.trim() || "AutoGuard Custom Repairs";

    setIsLoading(true);

    try {
      if (activeMode === "register") {
        const res = await registerAdminApi(trimmedEmail, password, effectiveShopName);
        if (!res.success || !res.token || !res.user) {
          throw new Error(res.error || "Unable to register admin in centralized database.");
        }

        const adminToken = res.adminToken || res.token;
        const authUser = {
          email: res.user.email,
          role: res.user.role || "Showroom Admin",
          shopName: res.user.shopName || effectiveShopName,
        };

        setAdminSession(adminToken, authUser);
        setSuccessMessage("Admin profile saved to Centralized Database! Redirecting...");
        setTimeout(() => {
          onLoginSuccess(adminToken, authUser);
        }, 1000);
      } else {
        const res = await loginAdminApi(trimmedEmail, password);
        if (!res.success || !res.token || !res.user) {
          throw new Error(res.error || "Invalid credentials. Please verify your email and password.");
        }

        const adminToken = res.adminToken || res.token;
        const authUser = {
          email: res.user.email,
          role: res.user.role || "Showroom Admin",
          shopName: res.user.shopName || effectiveShopName,
        };

        setAdminSession(adminToken, authUser);
        onLoginSuccess(adminToken, authUser);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-12 animate-fade-in p-1">
      {/* Container with premium glassmorphic border, dark background card */}
      <div className="relative bg-slate-950/95 text-white rounded-3xl border border-slate-850 shadow-2xl p-8 backdrop-blur-xl overflow-hidden">
        
        {/* Glow effect in background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

        {/* Back navigation */}
        <button
          onClick={onCancel}
          className="group absolute top-5 left-5 text-slate-400 hover:text-white transition duration-200 flex items-center gap-1 text-xs cursor-pointer bg-slate-900/60 border border-slate-800 py-1.5 px-3 rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Exit Gate</span>
        </button>

        {/* Badge Indicator */}
        <div className="mt-8 flex justify-center mb-4">
          <span className="bg-emerald-500/10 text-emerald-400 font-extrabold text-[9px] px-3 py-1 rounded-full tracking-widest uppercase font-mono border border-emerald-500/20 flex items-center gap-1.5 animate-pulse">
            <Lock className="w-3 h-3" /> Shop Owner Verification Portal
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/80 border border-slate-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveMode("login");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMode === "login"
                ? "bg-emerald-500 text-slate-950 font-extrabold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Owner Log In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode("register");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMode === "register"
                ? "bg-emerald-500 text-slate-950 font-extrabold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Owner Sign Up</span>
          </button>
        </div>

        {/* Header Text */}
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            {activeMode === "login" ? "Owner Database Key" : "Register Owner Profile"}
          </h2>
          <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
            {activeMode === "login" 
              ? "Please verify your customized owner keys to release the administrative shields and edit catalog standard pricing rates."
              : "Create a customized owner profile linked directly to the pricing database control layer."
            }
          </p>
        </div>

        {/* Success Alert Bar */}
        {successMessage && (
          <div className="bg-emerald-950/40 border border-emerald-850/60 rounded-2xl p-4 mb-6 flex items-start gap-2.5 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-emerald-200 text-xs font-bold font-sans block">Authorization Decrypted</span>
              <span className="text-emerald-400 text-[11px] leading-relaxed block font-mono">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Error Alert Bar */}
        {errorMessage && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 mb-6 flex items-start gap-2.5 animate-fade-in">
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-rose-200 text-xs font-bold font-sans block">Database Shield Active</span>
              <span className="text-rose-400 text-[11px] leading-relaxed block font-mono">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Login / Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Shop Name Field (Register Mode Only) */}
          {activeMode === "register" && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-xs font-bold text-slate-400 font-mono tracking-wider block uppercase">
                Custom Workshop / Shop Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. AutoGuard Premium Repairs"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-slate-900 border border-slate-800 focus:ring-emerald-500/30 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-4 transition duration-200 text-white placeholder-slate-700 font-mono"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 font-mono tracking-wider block uppercase">
              Registered Owner Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="owner@autoguard.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={(e) => validateEmail(e.target.value)}
                disabled={isLoading}
                className={`w-full bg-slate-900 border ${
                  emailError ? "border-rose-600/80 focus:ring-rose-500/30" : "border-slate-800 focus:ring-emerald-500/30"
                } rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-4 transition duration-200 text-white placeholder-slate-700 font-mono`}
              />
            </div>
            {emailError && (
              <span className="text-rose-500 text-[10px] font-bold font-sans block pl-1">
                {emailError}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 font-mono tracking-wider block uppercase">
              Custom Security Phrase / Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter custom owner phrase"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-slate-900 border border-slate-800 focus:ring-emerald-500/30 rounded-xl pl-10 pr-10 py-3 text-xs focus:outline-none focus:ring-4 transition duration-200 text-white placeholder-slate-700 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-350 transition cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:bg-slate-900 disabled:text-slate-600 py-3.5 rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-500/10 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Decrypting Security Layer...</span>
              </>
            ) : (
              <>
                {activeMode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{activeMode === "login" ? "Authorize Admin Key" : "Register Custom Owner Key"}</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
