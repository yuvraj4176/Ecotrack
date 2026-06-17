/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { PledgeAction } from "../types";
import { CheckCircle2, Circle, Plus, Filter, Sparkles, Smile } from "lucide-react";

interface ActionRoadmapProps {
  pledges: PledgeAction[];
  onTogglePledge: (id: string, field: "enrolled" | "completed") => void;
  onAddCustomPledge: (pledge: Omit<PledgeAction, "id" | "enrolled" | "completed">) => void;
}

export default function ActionRoadmap({ pledges, onTogglePledge, onAddCustomPledge }: ActionRoadmapProps) {
  // Filtering states
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  // Custom Pledge creation Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customCategory, setCustomCategory] = useState<"transport" | "home" | "food" | "shopping">("home");
  const [customDesc, setCustomDesc] = useState("");
  const [customImpact, setCustomImpact] = useState<number>(100);
  const [customDifficulty, setCustomDifficulty] = useState<"easy" | "medium" | "hard">("easy");

  // Handle addition
  const handleCreateCustomPledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customDesc.trim()) return;

    onAddCustomPledge({
      title: customTitle,
      category: customCategory,
      description: customDesc,
      impactKg: Number(customImpact) || 100,
      difficulty: customDifficulty,
    });

    // Reset Form
    setCustomTitle("");
    setCustomDesc("");
    setCustomImpact(100);
    setCustomDifficulty("easy");
    setShowAddForm(false);
  };

  // Filtered pledges
  const filteredPledges = pledges.filter((p) => {
    const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
    const matchesDiff = difficultyFilter === "all" || p.difficulty === difficultyFilter;
    return matchesCat && matchesDiff;
  });

  // Calculate stats
  const totalEnrolled = pledges.filter((p) => p.enrolled).length;
  const totalCompleted = pledges.filter((p) => p.completed).length;
  const pledgedImpactSavings = pledges
    .filter((p) => p.completed)
    .reduce((sum, p) => sum + p.impactKg, 0);

  return (
    <div className="space-y-8" id="action-roadmap-main">
      {/* Overview stats header */}
      <div className="bg-white border border-emerald-100/50 p-6 rounded-3xl flex flex-wrap gap-8 items-center justify-between shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]" id="action-roadmap-topbar">
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-[#1E293B] flex items-center gap-2">
            <Sparkles className="text-[#10B981]" size={18} />
            <span>Ecological Habits & Pledges</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pledge simple actions to curb and subtract carbon units from your actual metrics in real-time.
          </p>
        </div>

        <div className="flex gap-6 items-center">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Pledges</span>
            <p className="text-xl font-extrabold font-mono text-amber-600" id="stat-active-pledges-count">{totalEnrolled}</p>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Completed Habits</span>
            <p className="text-xl font-extrabold font-mono text-[#059669]" id="stat-completed-pledges-count">{totalCompleted}</p>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Reduction</span>
            <p className="text-xl font-extrabold font-mono text-teal-600" id="stat-active-reduction-weight">-{pledgedImpactSavings.toLocaleString()} kg</p>
          </div>
        </div>
      </div>

      {/* Grid: Filters and Action Creator left (or top), actual pledges checklist list right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Controls & Custom Pledge form */}
        <div className="space-y-6 lg:col-span-4" id="section-pledges-controls">
          
          {/* Quick Filters Card */}
          <div className="bg-white border border-slate-100 p-5 rounded-3xl space-y-4 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Filter className="text-[#10B981]" size={16} />
              <h4 className="text-xs font-extrabold text-[#1E293B] uppercase tracking-wider">Refine Habits</h4>
            </div>

            {/* Category Filter selector */}
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="filter-category" className="text-xs text-slate-600 font-bold">Category</label>
              <select
                id="filter-category"
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-3 outline-none focus:border-[#10B981] transition shadow-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="transport">Transport</option>
                <option value="home">Home Energy</option>
                <option value="food">Diet & Food</option>
                <option value="shopping">Shopping & Waste</option>
              </select>
            </div>

            {/* Difficulty Filter Selector */}
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="filter-difficulty" className="text-xs text-slate-600 font-bold">Difficulty Level</label>
              <select
                id="filter-difficulty"
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-3 outline-none focus:border-[#10B981] transition shadow-sm"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="all">Any Difficulty</option>
                <option value="easy">Easy (Instantly doable)</option>
                <option value="medium">Medium (Moderate adjustment)</option>
                <option value="hard">Hard (Structural commitment)</option>
              </select>
            </div>
          </div>

          {/* Add Custom Pledge Card Button / Form */}
          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]">
            {!showAddForm ? (
              <button
                id="btn-trigger-add-form"
                onClick={() => setShowAddForm(true)}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-150 transition cursor-pointer"
              >
                <Plus size={16} />
                <span>Create Custom Pledge</span>
              </button>
            ) : (
              <form onSubmit={handleCreateCustomPledge} className="space-y-4" id="form-add-custom-pledge">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-extrabold text-[#1E293B] uppercase tracking-wider">Custom Pledge</h4>
                  <button
                    id="btn-cancel-custom-pledge"
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-slate-500 hover:text-[#059669] text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {/* Custom Title Input */}
                <div className="space-y-1">
                  <label htmlFor="input-custom-title" className="text-xs text-slate-600 font-bold">Pledge Name</label>
                  <input
                    id="input-custom-title"
                    type="text"
                    required
                    placeholder="e.g. Bring Reusable Cup"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:border-[#10B981] outline-none transition shadow-sm"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                  />
                </div>

                {/* Custom Category Selection */}
                <div className="space-y-1">
                  <label htmlFor="select-custom-cat" className="text-xs text-slate-600 font-bold">Category Tag</label>
                  <select
                    id="select-custom-cat"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:border-[#10B981] outline-none transition shadow-sm"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                  >
                    <option value="transport">Transport</option>
                    <option value="home">Home Energy</option>
                    <option value="food">Diet & Food</option>
                    <option value="shopping">Shopping & Waste</option>
                  </select>
                </div>

                {/* Custom Description text area */}
                <div className="space-y-1">
                  <label htmlFor="input-custom-desc" className="text-xs text-slate-600 font-bold">Goal Description</label>
                  <textarea
                    id="input-custom-desc"
                    required
                    rows={2}
                    placeholder="What specific adjustment will you achieve?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:border-[#10B981] outline-none transition resize-none shadow-sm"
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                  />
                </div>

                {/* Custom Impact input */}
                <div className="space-y-1">
                  <label htmlFor="input-custom-impact" className="text-xs text-slate-600 font-bold flex justify-between">
                    <span>Est. Annual Carbon Saved</span>
                    <span className="text-[#059669] font-extrabold font-mono">{customImpact || 0} kg CO₂</span>
                  </label>
                  <input
                    id="input-custom-impact"
                    type="number"
                    min="10"
                    max="2000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:border-[#10B981] outline-none transition shadow-sm"
                    value={customImpact}
                    onChange={(e) => setCustomImpact(parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* Custom Difficulty selection */}
                <div className="space-y-1">
                  <label htmlFor="select-custom-diff" className="text-xs text-slate-600 font-bold">Execution Difficulty</label>
                  <select
                    id="select-custom-diff"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:border-[#10B981] outline-none transition shadow-sm"
                    value={customDifficulty}
                    onChange={(e) => setCustomDifficulty(e.target.value as any)}
                  >
                    <option value="easy">Easy (Drop-in action)</option>
                    <option value="medium">Medium (Habit shift)</option>
                    <option value="hard">Hard (Structural challenge)</option>
                  </select>
                </div>

                <button
                  id="btn-submit-custom-pledge"
                  type="submit"
                  className="w-full bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-250 transition cursor-pointer"
                >
                  Confirm Addition
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Side: Active Pledges Checklist */}
        <div className="lg:col-span-8 flex flex-col gap-4" id="section-pledges-list-view">
          <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Matching Action Cards ({filteredPledges.length})</span>
            <span className="text-[11px] text-slate-400 font-medium">Check the circles to complete units!</span>
          </div>

          {filteredPledges.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-500 flex flex-col items-center gap-3">
              <Smile className="text-slate-400" size={32} />
              <p className="text-sm font-medium">No actions match current select conditions.</p>
              <button
                id="btn-clear-filters"
                onClick={() => {
                  setCategoryFilter("all");
                  setDifficultyFilter("all");
                }}
                className="text-xs text-[#10B981] hover:underline font-bold cursor-pointer"
              >
                Clear all active filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPledges.map((pledge) => (
                <div
                  key={pledge.id}
                  className={`border rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 group select-none relative overflow-hidden ${
                    pledge.completed
                      ? "bg-emerald-50/50 border-[#10B981] shadow-sm shadow-emerald-100/50"
                      : "bg-white hover:bg-emerald-50/10 border-slate-100 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]"
                  }`}
                  id={`action-card-${pledge.id}`}
                >
                  {/* Category Pill Tag */}
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex gap-1.5 items-center">
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        pledge.category === "transport" ? "bg-amber-100 text-amber-800" :
                        pledge.category === "home" ? "bg-blue-100 text-blue-800" :
                        pledge.category === "food" ? "bg-emerald-100 text-emerald-800" :
                        "bg-purple-100 text-purple-800"
                      }`}>
                        {pledge.category}
                      </span>
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full capitalize ${
                        pledge.difficulty === "easy" ? "bg-slate-100 text-slate-700" :
                        pledge.difficulty === "medium" ? "bg-orange-100 text-orange-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {pledge.difficulty}
                      </span>
                    </div>

                    {/* Checkbox trigger right */}
                    <button
                      id={`btn-complete-${pledge.id}`}
                      type="button"
                      onClick={() => onTogglePledge(pledge.id, "completed")}
                      className="text-slate-300 hover:text-[#10B981] transition cursor-pointer"
                      aria-label={`Mark as ${pledge.completed ? "uncompleted" : "completed"}`}
                    >
                      {pledge.completed ? (
                        <CheckCircle2 size={22} className="text-[#10B981] fill-white" />
                      ) : (
                        <Circle size={22} className="text-slate-300 hover:text-[#10B981]" />
                      )}
                    </button>
                  </div>

                  {/* Body textual info */}
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-slate-800 group-hover:text-[#059669] text-sm">{pledge.title}</h5>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{pledge.description}</p>
                  </div>

                  {/* Impact bottom section */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Expected Savings</span>
                    <span className="text-xs font-mono font-extrabold text-[#059669]">-{pledge.impactKg} kg CO₂ / yr</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
