/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CarbonProfile, EmissionBreakdown } from "../types";
import { calculateAnnualFootprint } from "../utils/carbonCalculator";
import { Car, Flame, Plane, Leaf, ShoppingBag, Trash2, Zap } from "lucide-react";

interface CalculatorFormProps {
  profile: CarbonProfile;
  onChange: (updated: CarbonProfile) => void;
}

export default function CalculatorForm({ profile, onChange }: CalculatorFormProps) {
  const [activeTab, setActiveTab] = useState<"transport" | "energy" | "diet" | "goods">("transport");

  const updateField = <K extends keyof CarbonProfile>(key: K, value: CarbonProfile[K]) => {
    const updated = { ...profile, [key]: value };
    onChange(updated);
  };

  // Live real-time single category contribution preview
  const currentBreakdown = calculateAnnualFootprint(profile);

  const tabClass = (tab: typeof activeTab) =>
    `flex items-center gap-2 px-5 py-4 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
      activeTab === tab
        ? "border-[#10B981] text-[#059669] bg-emerald-50/60"
        : "border-transparent text-slate-500 hover:text-[#059669] hover:bg-slate-50/50"
    }`;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_10px_15px_-3px_rgba(0,0,0,0.03)]" id="calc-form-container">
      {/* Tab bar header */}
      <div className="flex border-b border-slate-100 overflow-x-auto bg-slate-50/80 scrollbar-none" role="tablist">
        <button
          id="btn-tab-transport"
          className={tabClass("transport")}
          onClick={() => setActiveTab("transport")}
          role="tab"
          aria-selected={activeTab === "transport"}
        >
          <Car size={15} />
          <span>Transport</span>
        </button>
        <button
          id="btn-tab-energy"
          className={tabClass("energy")}
          role="tab"
          aria-selected={activeTab === "energy"}
          onClick={() => setActiveTab("energy")}
        >
          <Zap size={14} />
          <span>Home Energy</span>
        </button>
        <button
          id="btn-tab-diet"
          className={tabClass("diet")}
          role="tab"
          aria-selected={activeTab === "diet"}
          onClick={() => setActiveTab("diet")}
        >
          <Leaf size={14} />
          <span>Diet & Food</span>
        </button>
        <button
          id="btn-tab-goods"
          className={tabClass("goods")}
          role="tab"
          aria-selected={activeTab === "goods"}
          onClick={() => setActiveTab("goods")}
        >
          <ShoppingBag size={14} />
          <span>Shopping & Waste</span>
        </button>
      </div>

      {/* Tab contents */}
      <div className="p-6 md:p-8">
        {activeTab === "transport" && (
          <div className="space-y-6" id="section-transport-tab">
            <h3 className="text-base font-extrabold text-[#1E293B] flex items-center gap-2">
              <Car size={18} className="text-[#10B981]" />
              <span>Vehicles & Aircraft Commute</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Private burning of petroleum and airline operations are primary drivers of individual climate footprints.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Car Type Selection */}
              <div className="flex flex-col gap-2">
                <label htmlFor="select-car-type" className="text-xs font-bold text-slate-600">
                  Primary Motoring Engine
                </label>
                <select
                  id="select-car-type"
                  className="bg-slate-50 border border-slate-200 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-slate-800 text-sm rounded-2xl p-3 outline-none transition shadow-sm"
                  value={profile.carType}
                  onChange={(e) => updateField("carType", e.target.value as any)}
                >
                  <option value="petrol">Standard Petrol (Gasoline)</option>
                  <option value="diesel">Standard Diesel</option>
                  <option value="hybrid">Plug-in Hybrid/HEV</option>
                  <option value="electric">Clean EV (Electric Vehicle)</option>
                  <option value="none">No Private Car (Public Commute Only)</option>
                </select>
              </div>

              {/* Weekly Mileage Slider */}
              {profile.carType !== "none" && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-bold">
                    <label htmlFor="range-car-miles" className="text-slate-600">
                      Weekly Driving Mileage
                    </label>
                    <span className="text-[#059669]">{profile.carMilesPerWeek} miles / week</span>
                  </div>
                  <input
                    id="range-car-miles"
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={profile.carMilesPerWeek}
                    onChange={(e) => updateField("carMilesPerWeek", parseInt(e.target.value))}
                    className="w-full accent-[#10B981] bg-slate-100 border border-slate-200 rounded-lg cursor-pointer h-2"
                  />
                  <span className="text-[10px] text-slate-400 font-mono text-right">
                    Annual: ~{profile.carMilesPerWeek * 52} miles
                  </span>
                </div>
              )}

              {/* Transit Hours */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-bold">
                  <label htmlFor="range-transit-hours" className="text-slate-600">
                    Public Transit (Bus / Train) Usage
                  </label>
                  <span className="text-[#059669]">{profile.publicTransitHoursPerWeek} hrs / week</span>
                </div>
                <input
                  id="range-transit-hours"
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={profile.publicTransitHoursPerWeek}
                  onChange={(e) => updateField("publicTransitHoursPerWeek", parseInt(e.target.value))}
                  className="w-full accent-[#10B981] bg-slate-100 border border-slate-200 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Flight counts */}
              <div className="flex flex-col gap-2">
                <label htmlFor="input-flights-short" className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Plane size={14} className="text-blue-500" /> Short Flights Per Year (&lt; 3h flight)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-flights-short-dec"
                    type="button"
                    onClick={() => updateField("flightsShortPerYear", Math.max(0, profile.flightsShortPerYear - 1))}
                    className="bg-slate-100 text-slate-700 font-extrabold px-3 py-2 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                  >
                    -
                  </button>
                  <span id="label-flights-short" className="bg-white border border-slate-200 text-slate-800 px-4 py-1.5 rounded-xl font-mono font-bold w-12 text-center text-sm">
                    {profile.flightsShortPerYear}
                  </span>
                  <button
                    id="btn-flights-short-inc"
                    type="button"
                    onClick={() => updateField("flightsShortPerYear", profile.flightsShortPerYear + 1)}
                    className="bg-slate-100 text-slate-700 font-extrabold px-3 py-2 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="input-flights-long" className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Plane size={14} className="text-indigo-500" /> Long Flights Per Year (&gt; 3h flight)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-flights-long-dec"
                    type="button"
                    onClick={() => updateField("flightsLongPerYear", Math.max(0, profile.flightsLongPerYear - 1))}
                    className="bg-slate-100 text-slate-700 font-extrabold px-3 py-2 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                  >
                    -
                  </button>
                  <span id="label-flights-long" className="bg-white border border-slate-200 text-slate-800 px-4 py-1.5 rounded-xl font-mono font-bold w-12 text-center text-sm">
                    {profile.flightsLongPerYear}
                  </span>
                  <button
                    id="btn-flights-long-inc"
                    type="button"
                    onClick={() => updateField("flightsLongPerYear", profile.flightsLongPerYear + 1)}
                    className="bg-slate-100 text-slate-700 font-extrabold px-3 py-2 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Instant feedback banner */}
            <div className="bg-slate-50/80 p-4 border border-slate-100 rounded-2xl flex justify-between items-center mt-4">
              <span className="text-xs text-slate-500 font-semibold">Calculated Transit Sub-Emission:</span>
              <span className="text-sm font-mono font-black text-amber-600 animate-pulse" id="badge-sub-transit">
                {currentBreakdown.transport.toLocaleString()} kg CO₂e / yr
              </span>
            </div>
          </div>
        )}

        {activeTab === "energy" && (
          <div className="space-y-6" id="section-energy-tab">
            <h3 className="text-base font-extrabold text-[#1E293B] flex items-center gap-2">
              <Zap size={18} className="text-[#10B981]" />
              <span>Domestic Power and Heating</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The density of standard power grids means keeping lights on and warm radiators carries substantial latent footprints.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Electricity usage */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-bold">
                  <label htmlFor="range-electricity" className="text-slate-600">
                    Monthly Electricity Bill Usage
                  </label>
                  <span className="text-[#059669]">{profile.electricityKwhPerMonth} kWh / month</span>
                </div>
                <input
                  id="range-electricity"
                  type="range"
                  min="50"
                  max="1200"
                  step="25"
                  value={profile.electricityKwhPerMonth}
                  onChange={(e) => updateField("electricityKwhPerMonth", parseInt(e.target.value))}
                  className="w-full accent-[#10B981] bg-slate-100 border border-slate-200 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Clean Energy Grid Ratio */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-bold">
                  <label htmlFor="range-clean-energy" className="text-slate-600">
                    Clean Energy / Solar Electricity Mix
                  </label>
                  <span className="text-teal-600">{profile.cleanEnergyPercentage}% Clean</span>
                </div>
                <input
                  id="range-clean-energy"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={profile.cleanEnergyPercentage}
                  onChange={(e) => updateField("cleanEnergyPercentage", parseInt(e.target.value))}
                  className="w-full accent-teal-500 bg-slate-100 border border-slate-200 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Household Size */}
              <div className="flex flex-col gap-2">
                <label htmlFor="select-household-size" className="text-xs font-bold text-slate-600">
                  Household Occupants (Co-sharing division)
                </label>
                <select
                  id="select-household-size"
                  className="bg-slate-50 border border-slate-200 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-slate-800 text-sm rounded-2xl p-3 outline-none transition shadow-sm"
                  value={profile.householdSize}
                  onChange={(e) => updateField("householdSize", parseInt(e.target.value))}
                >
                  <option value={1}>1 Person (Single Occupant)</option>
                  <option value={2}>2 People</option>
                  <option value={3}>3 People (Average Family)</option>
                  <option value={4}>4 People</option>
                  <option value={6}>6+ People (Co-living)</option>
                </select>
              </div>

              {/* Heating Source */}
              <div className="flex flex-col gap-2">
                <label htmlFor="select-heating-type" className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Flame size={14} className="text-orange-500" /> Heating Source
                </label>
                <select
                  id="select-heating-type"
                  className="bg-slate-50 border border-slate-200 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-slate-800 text-sm rounded-2xl p-3 outline-none transition shadow-sm"
                  value={profile.heatingType}
                  onChange={(e) => updateField("heatingType", e.target.value as any)}
                >
                  <option value="gas">Natural Gas Burners</option>
                  <option value="electricity">Electric Radiators / Heat pump</option>
                  <option value="oil">Fuel Oil boiler</option>
                  <option value="wood">Biomass / Wood Furnaces</option>
                  <option value="none">No Space Heating Required</option>
                </select>
              </div>
            </div>

            {/* Instant energy badge */}
            <div className="bg-slate-50/80 p-4 border border-slate-100 rounded-2xl flex justify-between items-center mt-4">
              <span className="text-xs text-slate-500 font-semibold">Calculated Energy Sub-Emission:</span>
              <span className="text-sm font-mono font-black text-amber-600" id="badge-sub-energy">
                {currentBreakdown.home.toLocaleString()} kg CO₂e / yr
              </span>
            </div>
          </div>
        )}

        {activeTab === "diet" && (
          <div className="space-y-6" id="section-diet-tab">
            <h3 className="text-base font-extrabold text-[#1E293B] flex items-center gap-2">
              <Leaf size={18} className="text-[#10B981]" />
              <span>Dietary Decisions & Food Miles</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Agriculture accounts for over 22% of greenhouse gasses, highly heavy on beef/sheep transport relative to grains.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Diet Type */}
              <div className="flex flex-col gap-2">
                <label htmlFor="select-diet-type" className="text-xs font-bold text-slate-600">
                  Primary Diet Behavior
                </label>
                <select
                  id="select-diet-type"
                  className="bg-slate-50 border border-slate-200 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-slate-800 text-sm rounded-2xl p-3 outline-none transition shadow-sm"
                  value={profile.dietType}
                  onChange={(e) => updateField("dietType", e.target.value as any)}
                >
                  <option value="meat-heavy">Heavy Carnivore (Daily Red Meats)</option>
                  <option value="balanced">Omnivore/Balanced (Average Poultry/Beef)</option>
                  <option value="low-meat">Low Meat / Flexitarian (Fish / Limited poultry)</option>
                  <option value="vegetarian">Vegetarian (No meat, consumes dairy)</option>
                  <option value="vegan">100% Plant-Based Vegan</option>
                </select>
              </div>

              {/* Sourced Local Food Ratio */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-bold">
                  <label htmlFor="range-local-food" className="text-slate-600">
                    Locally-Sourced Produce Ratio (Zero Food Miles)
                  </label>
                  <span className="text-[#059669]">{profile.localFoodRatio}% Local</span>
                </div>
                <input
                  id="range-local-food"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={profile.localFoodRatio}
                  onChange={(e) => updateField("localFoodRatio", parseInt(e.target.value))}
                  className="w-full accent-[#10B981] bg-slate-100 border border-slate-200 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Food Waste */}
              <div className="flex flex-col gap-2">
                <label htmlFor="select-food-waste" className="text-xs font-bold text-slate-600">
                  Discarded Food / Waste Habits
                </label>
                <select
                  id="select-food-waste"
                  className="bg-slate-50 border border-slate-200 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-slate-800 text-sm rounded-2xl p-3 outline-none transition shadow-sm"
                  value={profile.foodWasteLevel}
                  onChange={(e) => updateField("foodWasteLevel", e.target.value as any)}
                >
                  <option value="low">Minimal (Cook backups, compost always)</option>
                  <option value="medium">Average (Occasional leftover throwaways)</option>
                  <option value="high">High Waste (Unconsumed items rot/landfill)</option>
                </select>
              </div>
            </div>

            {/* Instant food feedback */}
            <div className="bg-slate-50/80 p-4 border border-slate-100 rounded-2xl flex justify-between items-center mt-4">
              <span className="text-xs text-slate-500 font-semibold">Calculated Diet Sub-Emission:</span>
              <span className="text-sm font-mono font-black text-amber-600" id="badge-sub-food">
                {currentBreakdown.food.toLocaleString()} kg CO₂e / yr
              </span>
            </div>
          </div>
        )}

        {activeTab === "goods" && (
          <div className="space-y-6" id="section-goods-tab">
            <h3 className="text-base font-extrabold text-[#1E293B] flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#10B981]" />
              <span>Lifestyle Consumption & Recycling</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Manufacture of new clothes, appliances, and packing wrappers inject intense global manufacturing emissions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shopping Frequency */}
              <div className="flex flex-col gap-2">
                <label htmlFor="select-shopping" className="text-xs font-bold text-slate-600">
                  Shopping & Apparel Density
                </label>
                <select
                  id="select-shopping"
                  className="bg-slate-50 border border-slate-200 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-slate-800 text-sm rounded-2xl p-3 outline-none transition shadow-sm"
                  value={profile.shoppingFrequency}
                  onChange={(e) => updateField("shoppingFrequency", e.target.value as any)}
                >
                  <option value="frequent">Frequent (Buy new items/clothes weekly)</option>
                  <option value="average">Sustained Average (Monthly, standard replace)</option>
                  <option value="minimal">Minimalist / Eco-thrift (Pre-loved first)</option>
                </select>
              </div>

              {/* Recycling Habits */}
              <div className="flex flex-col gap-2">
                <label htmlFor="select-recycling" className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Trash2 size={14} className="text-blue-500" /> Recycling Diligence
                </label>
                <select
                  id="select-recycling"
                  className="bg-slate-50 border border-slate-200 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-slate-800 text-sm rounded-2xl p-3 outline-none transition shadow-sm"
                  value={profile.recyclingHabit}
                  onChange={(e) => updateField("recyclingHabit", e.target.value as any)}
                >
                  <option value="diligent">Diligent (Plastics, paper, metal, compost)</option>
                  <option value="partial">Partial (Separate cardboard/cans occasionally)</option>
                  <option value="none">None (All combined into landfill bins)</option>
                </select>
              </div>
            </div>

            {/* Instant shopping feedback */}
            <div className="bg-slate-50/80 p-4 border border-slate-100 rounded-2xl flex justify-between items-center mt-4">
              <span className="text-xs text-slate-500 font-semibold">Calculated Lifestyle Sub-Emission:</span>
              <span className="text-sm font-mono font-black text-amber-600" id="badge-sub-shopping">
                {currentBreakdown.shopping.toLocaleString()} kg CO₂e / yr
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
