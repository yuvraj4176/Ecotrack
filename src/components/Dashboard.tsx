/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EmissionBreakdown } from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { AlertCircle, Leaf, Globe, Flame, Award, TrendingDown } from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  breakdown: EmissionBreakdown;
  activePledgeSavings: number;
  targetGoalTons?: number;
}

export default function Dashboard({ breakdown, activePledgeSavings, targetGoalTons }: DashboardProps) {
  // Compute adjusted values taking pledges into account
  const currentTotal = breakdown.total;
  const targetTotal = Math.max(0, currentTotal - activePledgeSavings);

  // Targets and baselines calculations
  const targetCapTons = targetGoalTons !== undefined ? targetGoalTons : 4.0;
  const targetCapKg = targetCapTons * 1000;
  
  const reductionPercentage = currentTotal > 0 ? (activePledgeSavings / currentTotal) * 100 : 0;
  const compliancePercentage = Math.min(100, Math.max(0, (targetTotal / targetCapKg) * 100));
  const isOverCap = targetTotal > targetCapKg;

  // Pie chart data
  const pieData = [
    { name: "Transport", value: breakdown.transport, color: "#f59e0b" }, // Amber
    { name: "Home Energy", value: breakdown.home, color: "#3b82f6" },     // Blue
    { name: "Diet & Food", value: breakdown.food, color: "#10b981" },     // Emerald
    { name: "Shopping & Goods", value: breakdown.shopping, color: "#8b5cf6" }, // Violet
  ];

  // Benchmarking horizontal bar chart data
  const benchmarkData = [
    { name: "Your Initial Footprint", emissions: currentTotal, fill: "#f59e0b" },
    { name: "With Active Pledges", emissions: targetTotal, fill: "#10b981" },
    { name: "Paris Accord 2030 Target", emissions: 2000, fill: "#14b8a6" },
    { name: "Global Avg Cap", emissions: 4800, fill: "#64748b" },
    { name: "US Individual Avg", emissions: 15500, fill: "#ef4444" },
  ];

  const formatEmissions = (val: number) => {
    return `${(val / 1000).toFixed(2)} metric tons (CO₂e)`;
  };

  const getPercentageReduction = () => {
    if (currentTotal === 0) return 0;
    return Math.round((activePledgeSavings / currentTotal) * 100);
  };

  return (
    <div className="space-y-8" id="dashboard-main-container">
      {/* Top statistics overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total emissions card */}
        <div className="bg-white border border-emerald-100/60 p-6 rounded-3xl relative overflow-hidden shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]" id="card-total-footprint">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Dynamic Baseline</span>
            <Flame className="text-amber-500" size={18} />
          </div>
          <h4 className="text-4xl font-extrabold text-slate-800 tracking-tight font-mono">
            {(currentTotal / 1000).toFixed(2)} <span className="text-xs font-normal text-slate-400">tons/yr</span>
          </h4>
          <p className="text-xs text-slate-500 mt-2">
            Baseline annual greenhouse gas weight calculated from lifestyle choices.
          </p>
        </div>

        {/* Real-time reduction impact card */}
        <div className="bg-white border border-emerald-100/60 p-6 rounded-3xl relative overflow-hidden shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]" id="card-pledges-saving">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Pledged Savings</span>
            <TrendingDown className="text-[#10B981]" size={18} />
          </div>
          <h4 className="text-4xl font-extrabold text-[#10B981] tracking-tight font-mono">
            -{(activePledgeSavings / 1000).toFixed(2)} <span className="text-xs font-normal text-slate-400">tons/yr</span>
          </h4>
          <p className="text-xs text-slate-500 mt-2">
            Deflated footprint based on completed ecological habits. {getPercentageReduction() > 0 && (
              <span className="text-[#059669] font-bold">({getPercentageReduction()}% Cut!)</span>
            )}
          </p>
        </div>

        {/* Comparison Indicator */}
        <div className="bg-white border border-emerald-100/60 p-6 rounded-3xl relative overflow-hidden shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]" id="card-comparison-status">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Climate Goal Target</span>
            <Award className="text-teal-500" size={18} />
          </div>
          <h4 className="text-4xl font-extrabold text-teal-600 tracking-tight font-mono">
            2.00 <span className="text-xs font-normal text-slate-400">tons/yr</span>
          </h4>
          <p className="text-xs text-slate-500 mt-2">
            {targetTotal <= 2000 ? (
              <span className="text-[#059669] font-semibold">🎉 Complies with 1.5°C stabilization thresholds!</span>
            ) : (
              <span className="text-slate-500">
                You are <strong className="text-amber-600 font-mono">{((targetTotal - 2000) / 1000).toFixed(2)} tons</strong> above sustainable target.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Dynamic Animated Progress Cards */}
      <div className="bg-white border border-emerald-100 p-6 rounded-3xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)] space-y-6" id="dashboard-progress-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-50/60 pb-4 gap-2">
          <div>
            <h4 className="text-sm font-extrabold text-[#1E293B] flex items-center gap-2">
              <TrendingDown size={18} className="text-[#10B981]" />
              <span>Target & Pledged Carbon Progress</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Active tracking of emission reductions and ecological thresholds.
            </p>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono self-start sm:self-auto">
            Live Metrics
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Progress Bar 1: Pledge Impact Reductions */}
          <div className="space-y-3" id="progress-card-reductions">
            <div className="flex justify-between items-end text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Completed Habit Reduction</span>
                <span className="font-extrabold text-[#10B981] flex items-center gap-1">
                  Saved -{(activePledgeSavings / 1000).toFixed(2)} tons / yr
                </span>
              </div>
              <span className="font-extrabold text-[#059669] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg text-[11px]">
                {reductionPercentage.toFixed(1)}% Red.
              </span>
            </div>

            {/* Custom Track with Motion Fill */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/40">
              <motion.div
                className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${reductionPercentage}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                {/* Visual scanning shine bar */}
                <span className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.25)_50%,transparent_100%)] w-2/3 bg-[length:200%_100%] animate-[pulse_3s_infinite]" />
              </motion.div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {reductionPercentage > 0 ? (
                <span>🎉 Dynamic baseline reduced from <strong className="text-slate-700">{(currentTotal/1000).toFixed(2)}</strong> down to <strong className="text-[#059669] font-mono">{(targetTotal/1000).toFixed(2)} tons/yr</strong>. Wonderful ecological progress!</span>
              ) : (
                <span className="text-slate-400">No active carbon reductions yet. Complete pledges under the "Take Action" dashboard to subtract weight!</span>
              )}
            </p>
          </div>

          {/* Progress Bar 2: Compliance Target Carbon Cap */}
          <div className="space-y-3" id="progress-card-compliance">
            {/* Left label and right percentage badge */}
            <div className="flex justify-between items-end text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cap Compliance level</span>
                <span className="font-extrabold text-slate-700">
                  Active footprint: {(targetTotal / 1000).toFixed(2)} tons / yr
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Carbon Cap</span>
                <span className="font-extrabold text-blue-600 font-mono">
                  {targetCapTons.toFixed(1)} tons / yr
                </span>
              </div>
            </div>

            {/* Compliance Track with Motion */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/40">
              <motion.div
                className={`h-full rounded-full relative ${
                  isOverCap ? "bg-gradient-to-r from-amber-500 to-rose-500" : "bg-gradient-to-r from-teal-400 to-blue-500"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${compliancePercentage}%` }}
                transition={{ duration: 1.4, ease: "easeOut" }}
              >
                <span className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.25)_50%,transparent_100%)] w-2/3 bg-[length:200%_100%] animate-[pulse_3s_infinite]" />
              </motion.div>
            </div>

            <div className="flex items-center justify-between text-[11px] mt-1.5">
              <span className={`font-semibold ${isOverCap ? "text-amber-600" : "text-teal-600"}`}>
                {isOverCap ? (
                  <span>⚠️ Exceeding your ideal carbon cap threshold by {((targetTotal - targetCapKg) / 1000).toFixed(2)} tons.</span>
                ) : (
                  <span>🏆 Securely in clean standing! {((targetCapKg - targetTotal) / 1000).toFixed(2)} tons of headroom remains.</span>
                )}
              </span>
              <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                {compliancePercentage.toFixed(0)}% Capacity
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Layout (Bento Grid Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pies / Breakdown breakdown */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.03)] lg:col-span-5" id="sector-chart-breakdown">
          <h4 className="text-sm font-extrabold text-[#1E293B] mb-6 flex items-center gap-2">
            <AlertCircle size={16} className="text-teal-500" />
            <span>Emission Breakdown by Activity</span>
          </h4>

          <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value.toLocaleString()} kg CO₂e`, "Emissions"]}
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#f1f5f9", borderRadius: "16px", color: "#1e293b", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.04)" }}
                  labelStyle={{ color: "#64748b" }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Centered overall indicator */}
            <div className="absolute text-center select-none cursor-default">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Emissions</span>
              <p className="text-2xl font-black font-mono text-[#059669] my-0.5">{currentTotal.toLocaleString()}</p>
              <span className="text-[10px] text-slate-400 font-mono">kg CO₂e/yr</span>
            </div>
          </div>

          {/* Color Indicators Legend */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {pieData.map((item, index) => {
              const portion = currentTotal > 0 ? Math.round((item.value / currentTotal) * 100) : 0;
              return (
                <div key={index} className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-700 font-bold truncate">{item.name}</p>
                    <span className="text-[10px] text-slate-400 font-mono block">{portion}% ({item.value.toLocaleString()} kg)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Benchmark Comparison Chart */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.03)] lg:col-span-7" id="benchmarks-comparison-section">
          <h4 className="text-sm font-extrabold text-[#1E293B] mb-6 flex items-center gap-2">
            <Globe size={16} className="text-[#10B981]" />
            <span>How Your Footprint Compares Locally & Globally</span>
          </h4>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={benchmarkData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={11} unit=" kg" />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={130} />
                <Tooltip
                  formatter={(value: any) => [`${value.toLocaleString()} kg CO₂e`, "Emissions Weight"]}
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#f1f5f9", borderRadius: "16px", color: "#1e293b", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.04)" }}
                />
                <Bar dataKey="emissions" radius={[0, 4, 4, 0]}>
                  {benchmarkData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-4.5 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl flex gap-3 text-xs text-slate-600 items-start">
            <Leaf className="text-[#10B981] shrink-0 mt-0.5" size={16} />
            <div>
              <p className="font-extrabold text-[#059669]">Targeting Carbon Neutrality</p>
              <span className="mt-0.5 block leading-relaxed">
                By selecting pledges under the <strong>Take Action</strong> tab, you can actively reduce your carbon budget, getting closer to the sustainable Paris goal of 2 metric tons annually.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
