/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CarbonProfile {
  // Transport factors
  carMilesPerWeek: number;
  carType: "petrol" | "diesel" | "hybrid" | "electric" | "none";
  flightsShortPerYear: number; // short-haul flights (< 3 hours)
  flightsLongPerYear: number;  // long-haul flights (> 3 hours)
  publicTransitHoursPerWeek: number;

  // Home energy factors
  electricityKwhPerMonth: number;
  cleanEnergyPercentage: number; // percentage of electricity from green/solar sources
  heatingType: "gas" | "electricity" | "oil" | "wood" | "none";
  householdSize: number; // division of common home utilities

  // Diet factors
  dietType: "meat-heavy" | "balanced" | "low-meat" | "vegetarian" | "vegan";
  localFoodRatio: number; // percentage of food sourced locally (0 - 100)
  foodWasteLevel: "high" | "medium" | "low";

  // Consumption/Shopping factors
  shoppingFrequency: "frequent" | "average" | "minimal";
  recyclingHabit: "none" | "partial" | "diligent";
}

export interface EmissionBreakdown {
  transport: number; // kg CO2e per year
  home: number;      // kg CO2e per year
  food: number;      // kg CO2e per year
  shopping: number;  // kg CO2e per year
  total: number;     // total kg CO2e per year
}

export interface PledgeAction {
  id: string;
  title: string;
  category: "transport" | "home" | "food" | "shopping";
  description: string;
  impactKg: number; // estimated annual kg CO2e reduction
  difficulty: "easy" | "medium" | "hard";
  enrolled: boolean;
  completed: boolean;
}

export interface HistoryItem {
  timestamp: string; // ISO string or short date
  breakdown: EmissionBreakdown;
}

export interface EcoQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AIAnalysisResult {
  coachFeedback: string;
  roadmap: Array<{
    title: string;
    description: string;
    category: "transport" | "home" | "food" | "shopping";
    potentialReductionKg: number;
  }>;
  tailoredInsights: string[];
  personalizedQuiz: EcoQuizQuestion[];
}

export interface AppUser {
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  targetGoalTons?: number;
}

