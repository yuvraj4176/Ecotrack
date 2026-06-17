/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CarbonProfile, PledgeAction, AIAnalysisResult, AppUser } from "./types";
import {
  calculateAnnualFootprint,
  DEFAULT_CARBON_PROFILE,
  DEFAULT_PLEDGES,
} from "./utils/carbonCalculator";
import Dashboard from "./components/Dashboard";
import CalculatorForm from "./components/CalculatorForm";
import ActionRoadmap from "./components/ActionRoadmap";
import EcoCoach from "./components/EcoCoach";
import SelfTest from "./components/SelfTest";
import AuthPage from "./components/AuthPage";
import { BarChart3, Calculator, Sparkles, ShieldAlert, CheckSquare, Leaf, LogOut, User as UserIcon } from "lucide-react";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  getUserDoc,
  getProfileDoc,
  getPledgesDoc,
  getAIAnalysisDoc,
  saveProfileDoc,
  savePledgesDoc,
  saveAIAnalysisDoc
} from "./lib/firestoreService";

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

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<CarbonProfile>(DEFAULT_CARBON_PROFILE);
  const [pledges, setPledges] = useState<PledgeAction[]>(DEFAULT_PLEDGES);
  const [activeTab, setActiveTab] = useState<"dashboard" | "calculate" | "action" | "coach" | "selftest">("dashboard");
  const [savedAnalysis, setSavedAnalysis] = useState<AIAnalysisResult | null>(null);

  // Listen to live Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const uid = fbUser.uid;
          const userDoc = await getUserDoc(uid);
          const appUser: AppUser = {
            email: fbUser.email || "",
            name: userDoc?.name || fbUser.displayName || "Eco Member",
            passwordHash: "",
            createdAt: userDoc?.createdAt || new Date().toISOString(),
            targetGoalTons: userDoc?.targetGoalTons !== undefined ? userDoc.targetGoalTons : 4.0,
          };
          setCurrentUser(appUser);
          await loadFirebaseUserData(uid, fbUser.email || "");
        } catch (err) {
          console.error("Failed loading user data from Firestore on auth change:", err);
          if (fbUser.email) loadUserData(fbUser.email);
        }
      } else {
        // No current Firebase user; let's check local session fallback
        const activeUserStr = localStorage.getItem("terra_active_user");
        if (activeUserStr) {
          const user: AppUser = JSON.parse(activeUserStr);
          setCurrentUser(user);
          loadUserData(user.email);
        } else {
          setCurrentUser(null);
          setProfile(DEFAULT_CARBON_PROFILE);
          setPledges(DEFAULT_PLEDGES);
          setSavedAnalysis(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Robust Firestore data syncing
  const loadFirebaseUserData = async (uid: string, email: string) => {
    try {
      // Load user profile
      const fsProfile = await getProfileDoc(uid);
      if (fsProfile) {
        setProfile(fsProfile);
      } else {
        const savedProfile = localStorage.getItem(`carbon_profile_${email}`);
        const initialProfile = savedProfile ? JSON.parse(savedProfile) : DEFAULT_CARBON_PROFILE;
        setProfile(initialProfile);
        await saveProfileDoc(uid, initialProfile);
      }

      // Load user pledges
      const fsPledges = await getPledgesDoc(uid);
      if (fsPledges) {
        setPledges(fsPledges);
      } else {
        const savedPledges = localStorage.getItem(`carbon_pledges_${email}`);
        const initialPledges = savedPledges ? JSON.parse(savedPledges) : DEFAULT_PLEDGES;
        setPledges(initialPledges);
        await savePledgesDoc(uid, initialPledges);
      }

      // Load user AI report
      const fsAi = await getAIAnalysisDoc(uid);
      if (fsAi) {
        setSavedAnalysis(fsAi);
      } else {
        const savedAi = localStorage.getItem(`carbon_ai_analysis_${email}`);
        if (savedAi) {
          const initialAi = JSON.parse(savedAi);
          setSavedAnalysis(initialAi);
          await saveAIAnalysisDoc(uid, initialAi);
        } else {
          setSavedAnalysis(null);
        }
      }
    } catch (err) {
      console.error("Failed to load Firebase user config records from Firestore:", err);
      loadUserData(email);
    }
  };

  // Helper to load user-specific profiles and pledges from localStorage
  const loadUserData = (email: string) => {
    try {
      const savedProfile = localStorage.getItem(`carbon_profile_${email}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        setProfile(DEFAULT_CARBON_PROFILE);
      }

      const savedPledges = localStorage.getItem(`carbon_pledges_${email}`);
      if (savedPledges) {
        setPledges(JSON.parse(savedPledges));
      } else {
        setPledges(DEFAULT_PLEDGES);
      }

      const savedAiReport = localStorage.getItem(`carbon_ai_analysis_${email}`);
      if (savedAiReport) {
        setSavedAnalysis(JSON.parse(savedAiReport));
      } else {
        setSavedAnalysis(null);
      }
    } catch (err) {
      console.error("Failed to load user records from cache:", err);
    }
  };

  // Switch session context to logged-in user
  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem("terra_active_user", JSON.stringify(user));
    if (auth.currentUser) {
      loadFirebaseUserData(auth.currentUser.uid, user.email);
    } else {
      loadUserData(user.email);
    }
  };

  // Disregard user session
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase Signout error:", e);
    }
    setCurrentUser(null);
    localStorage.removeItem("terra_active_user");
    setProfile(DEFAULT_CARBON_PROFILE);
    setPledges(DEFAULT_PLEDGES);
    setSavedAnalysis(null);
    setActiveTab("dashboard");
  };

  // Save changes to profile for current user
  const handleProfileChange = async (updated: CarbonProfile) => {
    setProfile(updated);
    if (currentUser) {
      localStorage.setItem(`carbon_profile_${currentUser.email}`, JSON.stringify(updated));
      if (auth.currentUser) {
        try {
          await saveProfileDoc(auth.currentUser.uid, updated);
        } catch (e) {
          console.error("Firestore background save failed:", e);
        }
      }
    } else {
      localStorage.setItem("carbon_profile", JSON.stringify(updated));
    }
  };

  // Save changes to pledges (enroll, complete)
  const handleTogglePledge = async (id: string, field: "enrolled" | "completed") => {
    const updated = pledges.map((p) => {
      if (p.id === id) {
        const nextVal = !p[field];
        if (field === "completed" && nextVal) {
          return { ...p, completed: nextVal, enrolled: true };
        }
        return { ...p, [field]: nextVal };
      }
      return p;
    });
    
    setPledges(updated);
    if (currentUser) {
      localStorage.setItem(`carbon_pledges_${currentUser.email}`, JSON.stringify(updated));
      if (auth.currentUser) {
        try {
          await savePledgesDoc(auth.currentUser.uid, updated);
        } catch (e) {
          console.error("Firestore background save failed:", e);
        }
      }
    } else {
      localStorage.setItem("carbon_pledges", JSON.stringify(updated));
    }
  };

  // Create custom pledge
  const handleAddCustomPledge = async (newPledge: Omit<PledgeAction, "id" | "enrolled" | "completed">) => {
    const fresh: PledgeAction = {
      ...newPledge,
      id: `custom-${Date.now()}`,
      enrolled: true,
      completed: false,
    };
    const updated = [...pledges, fresh];
    setPledges(updated);
    
    if (currentUser) {
      localStorage.setItem(`carbon_pledges_${currentUser.email}`, JSON.stringify(updated));
      if (auth.currentUser) {
        try {
          await savePledgesDoc(auth.currentUser.uid, updated);
        } catch (e) {
          console.error("Firestore background save failed:", e);
        }
      }
    } else {
      localStorage.setItem("carbon_pledges", JSON.stringify(updated));
    }
  };

  // Add pledge recommended by AI
  const handleAddPledgeFromAI = async (
    title: string,
    category: "transport" | "home" | "food" | "shopping",
    description: string,
    impactKg: number
  ) => {
    if (pledges.some((p) => p.title.toLowerCase() === title.toLowerCase())) return;

    const fresh: PledgeAction = {
      id: `ai-${Date.now()}`,
      title,
      category,
      description,
      impactKg,
      difficulty: "medium",
      enrolled: true,
      completed: false,
    };
    const updated = [...pledges, fresh];
    setPledges(updated);
    
    if (currentUser) {
      localStorage.setItem(`carbon_pledges_${currentUser.email}`, JSON.stringify(updated));
      if (auth.currentUser) {
        try {
          await savePledgesDoc(auth.currentUser.uid, updated);
        } catch (e) {
          console.error("Firestore background save failed:", e);
        }
      }
    } else {
      localStorage.setItem("carbon_pledges", JSON.stringify(updated));
    }
  };

  // Save AI Analysis
  const handleSaveAnalysis = async (analysis: AIAnalysisResult) => {
    setSavedAnalysis(analysis);
    if (currentUser) {
      localStorage.setItem(`carbon_ai_analysis_${currentUser.email}`, JSON.stringify(analysis));
      if (auth.currentUser) {
        try {
          await saveAIAnalysisDoc(auth.currentUser.uid, analysis);
        } catch (e) {
          console.error("Firestore background save failed:", e);
        }
      }
    } else {
      localStorage.setItem("carbon_ai_analysis", JSON.stringify(analysis));
    }
  };

  // Calculate stats
  const breakdown = calculateAnnualFootprint(profile);
  const activePledgeSavings = pledges
    .filter((p) => p.completed)
    .reduce((sum, p) => sum + p.impactKg, 0);

  const adjustedTotal = Math.max(0, breakdown.total - activePledgeSavings);

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F0FDF4] text-[#1E293B] flex flex-col antialiased select-none font-sans" id="app-root-shell">
      
      {/* Dynamic Header HUD */}
      <header className="bg-white border-b border-emerald-100/80 sticky top-0 z-50 shadow-sm shadow-emerald-100/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2.5" id="header-brand-logo-container">
            <CarbonStepsLogo size={42} />
            <div className="flex flex-col select-none">
              <div className="flex items-baseline font-black leading-none gap-0.5">
                <span className="text-[17px] font-black tracking-tight text-[#2563EB]">CARBON</span>
                <span className="text-[17px] font-black tracking-tight text-[#10B981]">STEPS</span>
                <div className="flex items-center gap-0.5 ml-1 select-none">
                  <span className="inline-block w-1.5 h-2 bg-[#10B981] rounded-full transform rotate-12" />
                  <span className="inline-block w-1.5 h-2 bg-[#10B981] rounded-full transform -translate-y-1.5 rotate-12" />
                </div>
              </div>
              <span className="text-[7.5px] font-extrabold text-[#475569] tracking-[0.15em] uppercase leading-none mt-1">
                Understand. Track. Reduce.
              </span>
            </div>
          </div>

          {/* Quick HUD current status count details */}
          <div className="hidden md:flex items-center gap-6 text-right">
            {currentUser.targetGoalTons !== undefined && (
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Target Carbon Cap</span>
                <span className="text-sm font-extrabold text-blue-600 font-mono">
                  {currentUser.targetGoalTons.toFixed(1)} tons / yr
                </span>
              </div>
            )}
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Adjusted Baseline</span>
              <span className="text-sm font-extrabold text-[#059669] font-mono" id="hud-adjusted-tons">
                {(adjustedTotal / 1000).toFixed(2)} tons / yr
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Completed Pledges</span>
              <span className="text-sm font-extrabold text-amber-600 font-mono" id="hud-completed-pledges">
                {pledges.filter(p => p.completed).length} active
              </span>
            </div>
          </div>

          {/* User Profile Info & Sign Out Button */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-100 p-2 rounded-2xl flex items-center gap-2 group max-w-[200px]" id="hud-profile-badge">
              <div className="bg-[#10B981] text-white p-1.5 rounded-xl shrink-0">
                <UserIcon size={14} />
              </div>
              <div className="text-left hidden sm:block overflow-hidden">
                <p className="text-[11px] font-black text-slate-800 tracking-tight truncate leading-tight">
                  {currentUser.name}
                </p>
                <span className="text-[9px] text-slate-400 font-bold tracking-wider font-mono uppercase block leading-none">
                  {currentUser.email.split('@')[0]}
                </span>
              </div>
            </div>

            <button
              id="btn-trigger-logout"
              onClick={handleLogout}
              className="bg-emerald-50 hover:bg-rose-50 text-[#059669] hover:text-rose-600 p-2.5 rounded-2xl border border-emerald-100/50 hover:border-rose-100/50 cursor-pointer shadow-sm transition hover:scale-[1.02] flex items-center justify-center gap-1.5 text-xs font-bold"
              title="Exit workspace session"
            >
              <LogOut size={15} />
              <span className="hidden lg:inline text-[10px] pr-0.5">Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Navigation Rail Left Sidebar */}
        <aside className="md:w-64 shrink-0 flex flex-col gap-2 bg-white p-5 rounded-3xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.03)] border border-emerald-100/40" role="navigation" aria-label="Main Navigation">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-3 mb-2 tracking-wider block">
            Workspace Panels
          </span>

          <button
            id="nav-btn-dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-2xl text-left transition duration-200 cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-[#10B981] text-white shadow-sm shadow-emerald-200"
                : "text-slate-600 hover:text-[#059669] hover:bg-emerald-50/80"
            }`}
          >
            <BarChart3 size={15} />
            <span>Footprint Dashboard</span>
          </button>

          <button
            id="nav-btn-calculate"
            onClick={() => setActiveTab("calculate")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-2xl text-left transition duration-200 cursor-pointer ${
              activeTab === "calculate"
                ? "bg-[#10B981] text-white shadow-sm shadow-emerald-200"
                : "text-slate-600 hover:text-[#059669] hover:bg-emerald-50/80"
            }`}
          >
            <Calculator size={15} />
            <span>Lifestyle Calculator</span>
          </button>

          <button
            id="nav-btn-action"
            onClick={() => setActiveTab("action")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-2xl text-left transition duration-200 cursor-pointer ${
              activeTab === "action"
                ? "bg-[#10B981] text-white shadow-sm shadow-emerald-200"
                : "text-slate-600 hover:text-[#059669] hover:bg-emerald-50/80"
            }`}
          >
            <CheckSquare size={15} />
            <span>Take Action Pledges</span>
          </button>

          <button
            id="nav-btn-coach"
            onClick={() => setActiveTab("coach")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-2xl text-left transition duration-200 cursor-pointer ${
              activeTab === "coach"
                ? "bg-[#10B981] text-white shadow-sm shadow-emerald-200"
                : "text-slate-600 hover:text-[#059669] hover:bg-emerald-50/80"
            }`}
          >
            <Sparkles size={15} />
            <span>Personalized AI Advisor</span>
          </button>

          <div className="h-px bg-slate-100 my-3" />

          <span className="text-[10px] font-bold text-slate-400 uppercase px-3 mb-2 tracking-wider block">
            Verification & Quality
          </span>

          <button
            id="nav-btn-selftest"
            onClick={() => setActiveTab("selftest")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-2xl text-left transition duration-200 cursor-pointer ${
              activeTab === "selftest"
                ? "bg-[#10B981] text-white shadow-sm shadow-emerald-200"
                : "text-slate-600 hover:text-[#059669] hover:bg-emerald-50/80"
            }`}
          >
            <ShieldAlert size={15} />
            <span>Interactive Testbench</span>
          </button>
        </aside>

        {/* Dynamic Display Canvas Right */}
        <section className="flex-1 min-w-0" id="main-content-viewport" aria-live="polite">
          {activeTab === "dashboard" && (
            <Dashboard breakdown={breakdown} activePledgeSavings={activePledgeSavings} targetGoalTons={currentUser?.targetGoalTons} />
          )}

          {activeTab === "calculate" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.03)]">
                <h2 className="text-lg font-extrabold text-slate-800">Lifestyle Variables</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust parameters across various categories to update your footprint. Calculations adjust live in real-time.
                </p>
              </div>
              <CalculatorForm profile={profile} onChange={handleProfileChange} />
            </div>
          )}

          {activeTab === "action" && (
            <ActionRoadmap
              pledges={pledges}
              onTogglePledge={handleTogglePledge}
              onAddCustomPledge={handleAddCustomPledge}
            />
          )}

          {activeTab === "coach" && (
            <EcoCoach
              profile={profile}
              emissions={breakdown}
              onAddPledgeFromAI={handleAddPledgeFromAI}
              savedAnalysis={savedAnalysis}
              onSaveAnalysis={handleSaveAnalysis}
            />
          )}

          {activeTab === "selftest" && <SelfTest />}
        </section>
      </main>

      {/* Humble, Professional Footer */}
      <footer className="bg-white/80 border-t border-emerald-100/50 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-700">EcoAware Carbon Steps Initiative — Committed to 1.5°C Global Alignment</p>
          <span className="text-[10px] text-slate-400 block mt-1 font-mono">Calculations follow Greenhouse Gas Protocol (GHG) Individual Standards</span>
        </div>
      </footer>
    </div>
  );
}
