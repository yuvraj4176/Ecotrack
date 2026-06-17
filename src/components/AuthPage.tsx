import React, { useState } from "react";
import { AppUser } from "../types";
import {
  Leaf,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Globe2,
  ExternalLink,
} from "lucide-react";
import { auth } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { saveUserDoc, getUserDoc } from "../lib/firestoreService";

interface AuthPageProps {
  onLogin: (user: AppUser) => void;
}

const CarbonStepsLogo = ({ size = 38 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <defs>
      <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
      <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>

    {/* Elegant green outer arch representing path/orbit */}
    <path
      d="M 32 58 A 38 38 0 0 1 82 46"
      stroke="url(#grad-green)"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />

    {/* Five toes in green to blue colors */}
    <circle cx="34" cy="38" r="4.5" fill="url(#grad-blue)" />
    <circle cx="46" cy="30" r="5.5" fill="url(#grad-blue)" />
    <circle cx="60" cy="26" r="6" fill="url(#grad-green)" />
    <circle cx="75" cy="29" r="6.5" fill="url(#grad-green)" />
    <ellipse cx="92" cy="37" rx="7.5" ry="11" transform="rotate(15 92 37)" fill="url(#grad-emerald)" />

    {/* Leaf-shaped footprint footprint sole */}
    <path
      d="M 62 108 C 42 98, 26 78, 28 54 C 29 48, 41 57, 50 72 C 57 82, 60 96, 62 108 Z"
      fill="url(#grad-emerald)"
      opacity="0.95"
    />

    <path
      d="M 62 108 C 55 94, 48 76, 52 60 C 56 46, 72 62, 68 82 C 65 92, 63 102, 62 108 Z"
      fill="url(#grad-green)"
      opacity="0.9"
    />

    <path
      d="M 62 108 C 68 98, 76 90, 78 80 C 79 76, 74 80, 68 88 C 64 93, 63 100, 62 108 Z"
      fill="url(#grad-emerald)"
    />

    {/* Emerging blue upward arrow */}
    <path
      d="M 54 78 Q 68 70, 78 54"
      stroke="url(#grad-blue)"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M 69 53 L 79 53 L 78 64"
      stroke="url(#grad-blue)"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Tiny companion footprint trail elements */}
    <circle cx="82" cy="108" r="1.8" fill="url(#grad-emerald)" />
    <circle cx="90" cy="102" r="2.3" fill="url(#grad-emerald)" />
    <circle cx="97" cy="94" r="2.8" fill="url(#grad-green)" />
  </svg>
);

const DEFAULT_USERS = "terra_users_list";

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [targetGoal, setTargetGoal] = useState<number>(4); // standard target: 4 tons

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Quick helper to fetch simulated user list
  const getUsersList = (): AppUser[] => {
    try {
      const stored = localStorage.getItem(DEFAULT_USERS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to read user directory", e);
    }
    return [
      // Pre-configured Demo account for developers or quick previewers
      {
        email: "eco@advisor.org",
        name: "Eco Champion",
        passwordHash: "password123", // simple hash mock
        createdAt: new Date().toISOString(),
        targetGoalTons: 3.5,
      },
    ];
  };

  // Helper to save simulated user list
  const saveUsersList = (users: AppUser[]) => {
    localStorage.setItem(DEFAULT_USERS, JSON.stringify(users));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all standard credentials.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Retrieve the custom goal tons and additional profile details from Firestore
      const userDoc = await getUserDoc(userCredential.user.uid);
      
      const appUser: AppUser = {
        email: userCredential.user.email || email.trim().toLowerCase(),
        name: userDoc?.name || userCredential.user.displayName || "Eco Member",
        passwordHash: "",
        createdAt: userDoc?.createdAt || new Date().toISOString(),
        targetGoalTons: userDoc?.targetGoalTons !== undefined ? userDoc.targetGoalTons : 4.0,
      };

      setSuccess(`Welcome back, ${appUser.name}!`);
      setTimeout(() => {
        onLogin(appUser);
      }, 800);
    } catch (err: any) {
      console.error("Firebase sign-in error details:", err);
      let errMsg = "Invalid email address or incorrect password.";
      if (err.code === "auth/operation-not-allowed") {
        errMsg = "Email/Password provider is not enabled in Firebase Console. Please enable it under Auth > Sign-in method, or use the Google Sign-In button below!";
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        errMsg = "Invalid email address or incorrect password credentials.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Please enter a valid email address.";
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !name || !password || !confirmPassword) {
      setError("Please fill in all registration fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please provide a valid email structure.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(userCredential.user, { displayName: name.trim() });
      
      const newUser: Omit<AppUser, "passwordHash"> = {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        createdAt: new Date().toISOString(),
        targetGoalTons: targetGoal || 4,
      };

      // Save user profile metadata to Firestore
      await saveUserDoc(userCredential.user.uid, newUser);

      setSuccess("Account registered successfully on Firebase! Directing to dashboard...");
      setTimeout(() => {
        onLogin({
          ...newUser,
          passwordHash: "",
        });
      }, 1000);
    } catch (err: any) {
      console.error("Firebase registration error details:", err);
      let errMsg = "Failed to register account via Firebase.";
      if (err.code === "auth/operation-not-allowed") {
        errMsg = "Email/Password provider is not enabled in Firebase Console. Please enable it under Auth > Sign-in method, or use the Google Sign-In button below!";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "An account is already registered with this email address.";
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Retrieve the custom goal tons and additional profile details from Firestore
      const userDoc = await getUserDoc(userCredential.user.uid);
      
      const appUser: AppUser = {
        email: userCredential.user.email || "",
        name: userDoc?.name || userCredential.user.displayName || "Eco Member",
        passwordHash: "",
        createdAt: userDoc?.createdAt || new Date().toISOString(),
        targetGoalTons: userDoc?.targetGoalTons !== undefined ? userDoc.targetGoalTons : 4.0,
      };

      if (!userDoc) {
        // Save initial user profile metadata to Firestore
        await saveUserDoc(userCredential.user.uid, {
          email: appUser.email,
          name: appUser.name,
          createdAt: appUser.createdAt,
          targetGoalTons: appUser.targetGoalTons,
        });
      }

      setSuccess(`Welcome back, ${appUser.name}! (Signed in via Google)`);
      setTimeout(() => {
        onLogin(appUser);
      }, 800);
    } catch (err: any) {
      console.error("Firebase Google sign-in error details:", err);
      let errMsg = "Google Sign-In failed.";
      if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    }
  };

  // Quick start bypass handle
  const handleQuickDemoBypass = async () => {
    setEmail("eco@advisor.org");
    setPassword("password123");
    setIsSignUp(false);
    
    setError("");
    setSuccess("Connecting you to the ecological workspace as Eco Champion...");
    
    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, "eco@advisor.org", "password123");
      } catch (e: any) {
        // If developer demo user account doesn't exist yet on client's firebase, bootstrap it!
        if (e.code === "auth/user-not-found" || e.code === "auth/invalid-credential") {
          userCredential = await createUserWithEmailAndPassword(auth, "eco@advisor.org", "password123");
          await updateProfile(userCredential.user, { displayName: "Eco Champion" });
          await saveUserDoc(userCredential.user.uid, {
            email: "eco@advisor.org",
            name: "Eco Champion",
            createdAt: new Date().toISOString(),
            targetGoalTons: 3.5,
          });
        } else {
          throw e; // Rethrow other initialization errors to enter local fallback
        }
      }

      const userDoc = await getUserDoc(userCredential.user.uid);
      const demoUser: AppUser = {
        email: "eco@advisor.org",
        name: "Eco Champion",
        passwordHash: "",
        createdAt: userDoc?.createdAt || new Date().toISOString(),
        targetGoalTons: userDoc?.targetGoalTons || 3.5,
      };
      
      setSuccess("Successfully connected to live Firebase as Eco Champion!");
      setTimeout(() => {
        onLogin(demoUser);
      }, 600);
    } catch (err: any) {
      console.warn("Live Firebase connection unavailable, using safe local-fallback:", err);
      
      // Standalone sandbox mock fallback to protect active app visualization during console config
      const demoUser: AppUser = {
        email: "eco@advisor.org",
        name: "Eco Champion (Local)",
        passwordHash: "password123",
        createdAt: new Date().toISOString(),
        targetGoalTons: 3.5,
      };
      setSuccess("Logged in as Local Eco Champion (Offline fallback)");
      setTimeout(() => {
        onLogin(demoUser);
      }, 800);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "bg-slate-200", width: "w-0" };
    if (password.length < 6) return { label: "Too Short", color: "bg-rose-500", width: "w-1/3" };
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    if (hasLetters && hasNumbers && password.length >= 8) {
      return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
    }
    return { label: "Fair", color: "bg-amber-500", width: "w-2/3" };
  };

  const pStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans transition-all duration-500 antialiased" id="auth-page-root">
      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(5,150,105,0.08)] border border-emerald-100 flex flex-col md:flex-row min-h-[600px]" id="auth-card-container">
        
        {/* Left Side: Brand Marketing & Motivator panel */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#059669] to-[#047857] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden shrink-0" id="auth-showcase-panel">
          {/* Wave background pattern decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#10B981]/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          {/* Header branding */}
          <div className="flex items-start gap-3 relative z-10" id="auth-header-brand-logo-container">
            <div className="bg-white p-1 rounded-2xl shadow-md shrink-0">
              <CarbonStepsLogo size={42} />
            </div>
            <div className="flex flex-col select-none">
              <div className="flex items-baseline font-black leading-none gap-0.5">
                <span className="text-lg font-extrabold tracking-tight text-white animate-pulse">CARBON</span>
                <span className="text-lg font-extrabold tracking-tight text-[#34D399]">STEPS</span>
                <div className="flex items-center gap-0.5 ml-1 select-none">
                  <span className="inline-block w-1.5 h-2 bg-[#34D399] rounded-full transform rotate-12" />
                  <span className="inline-block w-1.5 h-2 bg-[#34D399] rounded-full transform -translate-y-1 rotate-12" />
                </div>
              </div>
              <span className="text-[8px] text-emerald-100 tracking-[0.165em] font-extrabold uppercase mt-1 block leading-none">
                Understand. Track. Reduce.
              </span>
            </div>
          </div>

          {/* Core messages */}
          <div className="my-10 space-y-8 relative z-10">
            <div className="space-y-3">
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                Align with the 1.5°C Global Initiative
              </h3>
              <p className="text-xs text-emerald-50 font-medium leading-relaxed">
                Take control of your personal ecological metrics. Track baseline household energy, commuter aviation levels, and dietary habits sequentially inside a beautiful live dashboard.
              </p>
            </div>

            {/* Quick mini indicators */}
            <div className="space-y-4 pt-4 border-t border-emerald-500/30">
              <div className="flex items-start gap-3">
                <div className="bg-white/10 p-1.5 rounded-lg mt-0.5">
                  <TrendingDown size={14} className="text-[#34D399]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-sans">Adaptive Reduction Metrics</h4>
                  <p className="text-[11px] text-emerald-100 font-medium mt-0.5">Watch metrics recalculate instantly upon pledging actions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white/10 p-1.5 rounded-lg mt-0.5">
                  <Sparkles size={14} className="text-[#34D399]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-sans">Gemini-Engine Advisor</h4>
                  <p className="text-[11px] text-emerald-100 font-medium mt-0.5">Gain custom-tailored mitigation advisories and specific ecosystem trivia.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white/10 p-1.5 rounded-lg mt-0.5">
                  <Globe2 size={14} className="text-[#34D399]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-sans">Durable Local Accounting</h4>
                  <p className="text-[11px] text-emerald-100 font-medium mt-0.5">Your calculations are saved securely under your user account.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer of panel */}
          <div className="text-left relative z-10 pt-4 border-t border-emerald-500/15">
            <span className="text-[10px] text-emerald-200/95 font-medium leading-relaxed block">
              Coaligned with Greenhouse Gas Protocol Standard
            </span>
          </div>
        </div>

        {/* Right Side: Sign-In / Sign-Up Form Panel */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white" id="auth-forms-panel">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Form Header Tabs */}
            <div className="flex justify-between items-center pb-2">
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-[#1E293B]">
                  {isSignUp ? "Create a Free Account" : "Access Personal Dashboard"}
                </h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  {isSignUp 
                    ? "Start tracking and syncing carbon footprints in seconds." 
                    : "Welcome back! Enter your ecological keys to sign in."}
                </p>
              </div>
            </div>

            {/* Error & Success Alert Bars */}
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs px-4 py-3.5 rounded-2xl flex flex-col gap-2.5 animate-fadeIn font-semibold" id="auth-alert-error">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                
                {/* Special Iframe / Popup help links */}
                {(error.toLowerCase().includes("tab") || error.toLowerCase().includes("iframe") || error.toLowerCase().includes("popup") || error.toLowerCase().includes("closed")) && (
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start mt-1 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[10px] tracking-wide uppercase transition hover:scale-[1.02] flex items-center gap-1.5"
                  >
                    <ExternalLink size={12} />
                    Open App in New Tab
                  </a>
                )}

                {/* Special Google Console / Email provider help guide */}
                {error.includes("Firebase Console") && (
                  <div className="mt-1 p-3 bg-white/70 border border-slate-200 rounded-xl space-y-1.5 text-[10px] text-slate-600 font-medium">
                    <p className="font-extrabold text-slate-700">How to authorize sign-ins on your new Firebase project:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Open the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline font-bold">Firebase Console</a></li>
                      <li>Select your active project (e.g. <span className="font-mono bg-rose-100/60 px-1 py-0.5 rounded text-rose-700 font-bold border border-rose-200">grand-eye-495216-c1</span>)</li>
                      <li>Go to <strong className="text-slate-700">Build &gt; Authentication &gt; Sign-in method</strong></li>
                      <li>Enable <strong className="text-slate-700">Email/Password</strong> and <strong className="text-slate-700">Google</strong> providers, then click save.</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-100 text-[#059669] text-xs px-4 py-3.5 rounded-2xl flex items-center gap-2.5 animate-fadeIn" id="auth-alert-success">
                <CheckCircle2 size={16} className="text-[#10B981] shrink-0" />
                <span className="font-extrabold">{success}</span>
              </div>
            )}

            {/* Main Form Fields */}
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4" id="auth-form">
              
              {isSignUp && (
                <div className="space-y-1.5" id="field-signup-name">
                  <label htmlFor="input-auth-name" className="text-xs font-bold text-slate-600 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <User size={15} />
                    </span>
                    <input
                      id="input-auth-name"
                      type="text"
                      required
                      placeholder="e.g. Alex Greenwell"
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl pl-10 pr-3 py-3 text-xs text-slate-800 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition shadow-sm font-semibold"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5" id="field-login-email">
                <label htmlFor="input-auth-email" className="text-xs font-bold text-slate-600 block">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail size={15} />
                  </span>
                  <input
                    id="input-auth-email"
                    type="email"
                    required
                    placeholder="e.g. user@example.com"
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl pl-10 pr-3 py-3 text-xs text-slate-800 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition shadow-sm font-semibold"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5" id="field-login-password">
                <div className="flex justify-between items-center">
                  <label htmlFor="input-auth-password" className="text-xs font-bold text-slate-600 block">
                    Password
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={handleQuickDemoBypass}
                      className="text-[10px] text-[#10B981] hover:text-[#059669] font-extrabold cursor-pointer"
                    >
                      Bypass / Use Demo?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock size={15} />
                  </span>
                  <input
                    id="input-auth-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter security passphrase"
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl pl-10 pr-10 py-3 text-xs text-slate-800 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition shadow-sm font-semibold"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    id="btn-toggle-password-view"
                    type="button"
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-3 pt-1" id="signup-extra-inputs">
                  {/* Password Strength Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400">Passphrase Security:</span>
                      <span className={password ? "text-slate-600" : "text-slate-400"}>
                        {pStrength.label || "None"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${pStrength.color} ${pStrength.width} transition-all duration-300`} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="input-auth-confirm" className="text-xs font-bold text-slate-600 block">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Lock size={15} />
                      </span>
                      <input
                        id="input-auth-confirm"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Retype password"
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl pl-10 pr-3 py-3 text-xs text-slate-800 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none transition shadow-sm font-semibold"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Target Goal Selector */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label htmlFor="range-target-goal" className="font-bold text-slate-600">
                        Target Carbon Cap Strategy
                      </label>
                      <span className="text-[#059669] font-extrabold font-mono">{targetGoal} tons / year</span>
                    </div>
                    <input
                      id="range-target-goal"
                      type="range"
                      min="2"
                      max="12"
                      step="0.5"
                      value={targetGoal}
                      onChange={(e) => setTargetGoal(parseFloat(e.target.value))}
                      className="w-full accent-[#10B981] bg-slate-100 border border-slate-200 rounded-lg cursor-pointer h-1.5"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                      <span>Eco Warrior (2t)</span>
                      <span>Average Standard (8t)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button Trigger */}
              <button
                id="btn-auth-submit"
                type="submit"
                className="w-full mt-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-150 cursor-pointer transition hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>{isSignUp ? "Register Carbon Account" : "Access Climate Canvas"}</span>
                <ArrowRight size={15} />
              </button>
            </form>

            {/* Google Sign-In Button */}
            <button
              id="btn-google-auth"
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full mt-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 border border-slate-200 shadow-sm transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSignUp ? "Register with Google" : "Sign In with Google"}</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-white">OR</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Quick-Click Demo Profile Card Container */}
            {!isSignUp && (
              <div 
                onClick={handleQuickDemoBypass}
                className="bg-slate-50/50 hover:bg-emerald-50/20 border border-dashed border-slate-200 hover:border-[#10B981] p-3.5 rounded-2xl cursor-pointer transition flex items-center justify-between group"
                id="box-demo-quickstart"
              >
                <div className="space-y-0.5">
                  <p className="text-[11px] font-extrabold text-slate-700 group-hover:text-[#059669] transition">
                    Quick Sandbox Sign In
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Instant login with test account (<span className="font-mono text-[9px] text-slate-500">eco@advisor.org</span>)
                  </p>
                </div>
                <div className="text-[10px] bg-slate-150 text-slate-600 font-extrabold px-2.5 py-1.5 rounded-xl group-hover:bg-[#10B981] group-hover:text-white transition">
                  Quick Access
                </div>
              </div>
            )}

            {/* Account Switch Toggles */}
            <div className="text-center text-xs">
              <span className="text-slate-400 font-semibold">
                {isSignUp ? "Already registered with Carbon Steps?" : "Are you new to our greenhouse tracking tools?"}{" "}
              </span>
              <button
                id="btn-toggle-auth-state"
                type="button"
                className="text-[#10B981] hover:text-[#059669] font-extrabold hover:underline cursor-pointer transition"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setSuccess("");
                }}
              >
                {isSignUp ? "Sign In instead" : "Sign Up for free registration"}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
