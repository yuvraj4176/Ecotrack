/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CarbonProfile } from "../types";
import { calculateAnnualFootprint } from "../utils/carbonCalculator";
import { CheckCircle2, AlertTriangle, ShieldCheck, Terminal, HelpCircle } from "lucide-react";

export default function SelfTest() {
  const [testResults, setTestResults] = useState<Array<{ name: string; status: "pass" | "fail"; message: string }>>([]);
  const [running, setRunning] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string>("none");

  // Persona profiles for rapid simulation verification
  const PERSONAS: Record<string, { desc: string; profile: CarbonProfile }> = {
    suburbanCommuter: {
      desc: "Suburban high-driver, balanced diet, 2 long flights annually, natural gas boiler, medium waste.",
      profile: {
        carMilesPerWeek: 300,
        carType: "petrol",
        flightsShortPerYear: 2,
        flightsLongPerYear: 2,
        publicTransitHoursPerWeek: 0,
        electricityKwhPerMonth: 600,
        cleanEnergyPercentage: 0,
        heatingType: "gas",
        householdSize: 2,
        dietType: "meat-heavy",
        localFoodRatio: 10,
        foodWasteLevel: "high",
        shoppingFrequency: "frequent",
        recyclingHabit: "none",
      },
    },
    urbanVegan: {
      desc: "Zero private motor, vegan food preference, 100% green solar grid match, minimal consumption thursty.",
      profile: {
        carMilesPerWeek: 0,
        carType: "none",
        flightsShortPerYear: 0,
        flightsLongPerYear: 0,
        publicTransitHoursPerWeek: 6,
        electricityKwhPerMonth: 120,
        cleanEnergyPercentage: 100,
        heatingType: "electricity",
        householdSize: 3,
        dietType: "vegan",
        localFoodRatio: 80,
        foodWasteLevel: "low",
        shoppingFrequency: "minimal",
        recyclingHabit: "diligent",
      },
    },
  };

  const runAllUnitTests = () => {
    setRunning(true);
    const results: typeof testResults = [];

    // Test 1: Motor Carbon intensity delta (Petrol vs Electric comparison verification)
    const basePetrol: CarbonProfile = {
      carMilesPerWeek: 100,
      carType: "petrol",
      flightsShortPerYear: 0,
      flightsLongPerYear: 0,
      publicTransitHoursPerWeek: 0,
      electricityKwhPerMonth: 0,
      cleanEnergyPercentage: 0,
      heatingType: "none",
      householdSize: 1,
      dietType: "vegan",
      localFoodRatio: 0,
      foodWasteLevel: "low",
      shoppingFrequency: "minimal",
      recyclingHabit: "none",
    };

    const baseElectric: CarbonProfile = {
      ...basePetrol,
      carType: "electric",
    };

    const petrolOut = calculateAnnualFootprint(basePetrol);
    const electricOut = calculateAnnualFootprint(baseElectric);

    if (petrolOut.transport > electricOut.transport * 3) {
      results.push({
        name: "Motor Factor Assertions",
        status: "pass",
        message: `Passed. Petrol transport emission (${petrolOut.transport} kg) is verified > 3x greater than Electric emission (${electricOut.transport} kg).`,
      });
    } else {
      results.push({
        name: "Motor Factor Assertions",
        status: "fail",
        message: `Failed. Petrol: ${petrolOut.transport} kg, Electric: ${electricOut.transport} kg.`,
      });
    }

    // Test 2: Diet-type emissions grading (Vegan vs Red Meat)
    const meatHeavyDiet: CarbonProfile = {
      ...basePetrol,
      carMilesPerWeek: 0,
      dietType: "meat-heavy",
    };
    const veganDiet: CarbonProfile = {
      ...basePetrol,
      carMilesPerWeek: 0,
      dietType: "vegan",
    };

    const meatOut = calculateAnnualFootprint(meatHeavyDiet);
    const veganOut = calculateAnnualFootprint(veganDiet);

    if (meatOut.food > veganOut.food * 2) {
      results.push({
        name: "Diet Baseline Assertions",
        status: "pass",
        message: `Passed. Meat-heavy annual diet footprint (${meatOut.food} kg) is verified > 2x Vegan plant-based footprint (${veganOut.food} kg).`,
      });
    } else {
      results.push({
        name: "Diet Baseline Assertions",
        status: "fail",
        message: `Failed. Meat-heavy: ${meatOut.food} kg, Vegan: ${veganOut.food} kg.`,
      });
    }

    // Test 3: Clean solar grid offset factors
    const dirtyUtility: CarbonProfile = {
      ...basePetrol,
      carMilesPerWeek: 0,
      electricityKwhPerMonth: 300,
      cleanEnergyPercentage: 0,
      householdSize: 1,
    };
    const solarUtility: CarbonProfile = {
      ...basePetrol,
      carMilesPerWeek: 0,
      electricityKwhPerMonth: 300,
      cleanEnergyPercentage: 100,
      householdSize: 1,
    };

    const dirtyHome = calculateAnnualFootprint(dirtyUtility);
    const solarHome = calculateAnnualFootprint(solarUtility);

    if (dirtyHome.home > 0 && solarHome.home === 0) {
      results.push({
        name: "Solar Tariff Offset Factor Assertions",
        status: "pass",
        message: "Passed. 100% solar tariff energy usage correctly scales baseline home grid footprint down to exactly 0.",
      });
    } else {
      results.push({
        name: "Solar Tariff Offset Factor Assertions",
        status: "fail",
        message: `Failed index. Dirty utility output: ${dirtyHome.home} kg, Solar footprint: ${solarHome.home} kg.`,
      });
    }

    // Set mock latency simulation for testing runner aesthetic
    setTimeout(() => {
      setTestResults(results);
      setRunning(false);
    }, 600);
  };

  return (
    <div className="space-y-8" id="self-test-container font-sans">
      
      {/* Intro info card */}
      <div className="bg-white border border-slate-100 p-6 rounded-3xl space-y-2 max-w-full shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]">
        <h3 className="text-base font-extrabold text-[#1E293B] flex items-center gap-2">
          <ShieldCheck className="text-[#10B981]" size={18} />
          <span>Interactive Calculator Testbench & Verification</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          This developer testbench facilitates automated client-side testing and scenario planning.
          Trigger calculations regression assertion directly to ensure carbon factors follow guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Auto Unit Test Suite */}
        <div className="lg:col-span-6 bg-white border border-slate-100 p-6 rounded-3xl space-y-4 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h4 className="text-xs font-extrabold text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
              <Terminal size={16} className="text-[#10B981]" />
              <span>Unit Tests Assertion Runner</span>
            </h4>
            <button
              id="btn-run-tests"
              disabled={running}
              onClick={runAllUnitTests}
              className={`text-xs font-bold py-2 px-3.5 rounded-xl cursor-pointer transition ${
                running ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-[#10B981] hover:bg-[#059669] text-white shadow-sm"
              }`}
            >
              {running ? "Analyzing Assertions..." : "Run Calculus Suite"}
            </button>
          </div>

          {testResults.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              Assertions log empty. Click run above.
            </div>
          ) : (
            <div className="space-y-3" id="assertions-log-output">
              {testResults.map((test, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    test.status === "pass"
                      ? "bg-emerald-50/50 border-[#10B981] text-[#059669]"
                      : "bg-red-50/55 border-red-200 text-red-800"
                  }`}
                >
                  {test.status === "pass" ? (
                    <CheckCircle2 size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-extrabold text-xs text-slate-800">{test.name}</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{test.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Pre-configured Persona Simulator */}
        <div className="lg:col-span-6 bg-white border border-slate-100 p-6 rounded-3xl space-y-4 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]">
          <div className="pb-2 border-b border-slate-100">
            <h4 className="text-xs font-extrabold text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
              <HelpCircle size={16} className="text-[#10B981]" />
              <span>Diagnostic Persona Simulator</span>
            </h4>
          </div>

          <div className="space-y-3 select-none">
            <label htmlFor="select-simulator-persona" className="text-xs font-bold text-slate-600 uppercase">Select Scenario profile</label>
            <select
              id="select-simulator-persona"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl outline-none cursor-pointer focus:border-[#10B981] shadow-sm"
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value)}
            >
              <option value="none">No Preset Loaded</option>
              <option value="suburbanCommuter">Suburban Commuter (Fossil Intensive)</option>
              <option value="urbanVegan">Urban Net-Zero Vegan (Hyper-Efficient)</option>
            </select>
          </div>

          {selectedPersona !== "none" && (
            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-4" id="persona-diagnostic-details">
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-850 px-2.5 py-1 rounded-full uppercase font-bold tracking-wider">
                  Persona Breakdown
                </span>
                <p className="text-xs text-slate-500 mt-2.5 italic leading-relaxed font-semibold">
                  "{PERSONAS[selectedPersona].desc}"
                </p>
              </div>

              {/* Persona calculated breakdown */}
              {(() => {
                const results = calculateAnnualFootprint(PERSONAS[selectedPersona].profile);
                return (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-sm">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Transport Portion</span>
                      <strong className="text-sm font-mono text-amber-600 block mt-1">{results.transport.toLocaleString()} kg</strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-sm">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Residential energy</span>
                      <strong className="text-sm font-mono text-blue-600 block mt-1">{results.home.toLocaleString()} kg</strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-sm">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Dietary Portion</span>
                      <strong className="text-sm font-mono text-[#059669] block mt-1">{results.food.toLocaleString()} kg</strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-sm">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Footprint</span>
                      <strong className="text-sm font-mono text-red-600 block mt-1">{(results.total / 1000).toFixed(2)} tons</strong>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
