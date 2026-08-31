import React, { useState } from "react";
import { 
  KeyRound, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Lock, 
  Loader2, 
  CheckCircle,
  Car,
  UserPlus,
  LogIn,
  Cpu
} from "lucide-react";
import { 
  loginUserApi, 
  registerUserApi,
  setUserSession 
} from "../utils/authStorage";

interface UserLandingGatewayProps {
  onLoginSuccess: (token: string, user: { email: string; role: string }) => void;
}

export default function UserLandingGateway({ onLoginSuccess }: UserLandingGatewayProps) {
  const [activeMode, setActiveMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    const trimmedEmail = email.toLowerCase().trim();

    setIsLoading(true);

    try {
      if (activeMode === "register") {
        const res = await registerUserApi(trimmedEmail, password);
        if (!res.success || !res.token || !res.user) {
          throw new Error(res.error || "Registration failed.");
        }

        const userObj = {
          email: res.user.email,
          role: res.user.role || "Showroom Admin",
        };

        setUserSession(res.token, userObj);
        setSuccessMessage("Admin profile created and saved to Centralized Database! Signing you in...");
        setTimeout(() => {
          onLoginSuccess(res.token!, userObj);
        }, 1000);
      } else {
        const res = await loginUserApi(trimmedEmail, password);
        if (!res.success || !res.token || !res.user) {
          throw new Error(res.error || "Invalid credentials. Please check your email and password.");
        }

        const userObj = {
          email: res.user.email,
          role: res.user.role || "User",
        };

        setUserSession(res.token, userObj);
        onLoginSuccess(res.token, userObj);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full py-12 px-4 flex flex-col justify-center items-center relative overflow-hidden font-sans select-none max-w-lg mx-auto">
      
      {/* Absolute high-tech glowing backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-slate-950 font-extrabold shadow-xl shadow-sky-500/15">
            <KeyRound className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
              Admin Access <span className="text-sky-500">Verification</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-mono uppercase tracking-widest">
              SECURE PRICING GATE v2.0
            </p>
          </div>
        </div>

        {/* Central Auth Glass Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Active Mode Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl">
            <button
              onClick={() => {
                setActiveMode("login");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-extrabold rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeMode === "login"
                  ? "bg-sky-500 text-slate-950 font-black shadow-md"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Admin Log In</span>
            </button>
            <button
              onClick={() => {
                setActiveMode("register");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-extrabold rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeMode === "register"
                  ? "bg-sky-500 text-slate-950 font-black shadow-md"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Admin</span>
            </button>
          </div>

          {/* Intro Text */}
          <div className="text-center space-y-1.5">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {activeMode === "login" ? "Verify Authorized Credentials" : "Initialize Central Admin Profile"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
              {activeMode === "login" 
                ? "Enter your administrator Email ID and password to access the customized inventory pricing console."
                : "Register a secure administrator profile to manage components and baseline pricing rates."
              }
            </p>
          </div>

          {/* Success message banner */}
          {successMessage && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 flex items-start gap-2.5 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-emerald-800 dark:text-emerald-200 text-xs font-bold block">Authorization Granted</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-[11px] leading-relaxed block font-mono">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Error Alert Bar */}
          {errorMessage && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-4 flex items-start gap-2.5 animate-fade-in">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-rose-800 dark:text-rose-200 text-xs font-bold block">Identity Verification Denied</span>
                <span className="text-rose-600 dark:text-rose-400 text-[11px] leading-relaxed block font-mono">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase block">
                Admin Email ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="e.g. user@autoguard.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  onBlur={(e) => validateEmail(e.target.value)}
                  disabled={isLoading}
                  className={`w-full bg-slate-50 dark:bg-slate-950 border ${
                    emailError ? "border-rose-500 focus:ring-rose-500/20" : "border-slate-200 dark:border-slate-800 focus:ring-sky-500/20"
                  } rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-4 transition duration-200 text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 font-mono`}
                />
              </div>
              {emailError && (
                <span className="text-rose-500 text-[10px] font-bold block pl-1">
                  {emailError}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={activeMode === "login" ? "Enter password" : "Create password (min 6 characters)"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-sky-500/20 rounded-xl pl-10 pr-10 py-3 text-xs focus:outline-none focus:ring-4 transition duration-200 text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 disabled:bg-slate-100 dark:disabled:bg-slate-950 disabled:text-slate-400 py-3.5 rounded-xl text-xs font-extrabold shadow-lg shadow-sky-500/10 transition duration-200 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  {activeMode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{activeMode === "login" ? "Authenticate & Decrypt Console" : "Create Admin Account"}</span>
                </>
              )}
            </button>
          </form>



        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500 leading-normal font-sans">
          This gateway establishes an encrypted session validated with standard JWT keys. By authenticating, you verify compatibility with digital claim evaluation.
        </p>
      </div>
    </div>
  );
}
