/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CarbonProfile, EmissionBreakdown } from "../types";

export const DEFAULT_CARBON_PROFILE: CarbonProfile = {
  carMilesPerWeek: 120,
  carType: "petrol",
  flightsShortPerYear: 2,
  flightsLongPerYear: 1,
  publicTransitHoursPerWeek: 3,
  electricityKwhPerMonth: 350,
  cleanEnergyPercentage: 10,
  heatingType: "gas",
  householdSize: 2,
  dietType: "balanced",
  localFoodRatio: 20,
  foodWasteLevel: "medium",
  shoppingFrequency: "average",
  recyclingHabit: "partial",
};

/**
 * Calculates annual carbon footprint in kg CO2e.
 */
export function calculateAnnualFootprint(profile: CarbonProfile): EmissionBreakdown {
  // --- 1. TRANSPORT ---
  let carFactor = 0;
  switch (profile.carType) {
    case "petrol":
      carFactor = 0.40; // kg CO2e per mile
      break;
    case "diesel":
      carFactor = 0.38;
      break;
    case "hybrid":
      carFactor = 0.22;
      break;
    case "electric":
      carFactor = 0.08;
      break;
    default:
      carFactor = 0;
  }
  const carAnnualEmissions = profile.carMilesPerWeek * 52 * carFactor;
  const publicTransitEmissions = profile.publicTransitHoursPerWeek * 52 * 1.8; // ~1.8 kg CO2e per hour of travel (bus/train mix)
  const flightEmissions = (profile.flightsShortPerYear * 280) + (profile.flightsLongPerYear * 1150); // kg CO2e per flight
  const transportTotal = carAnnualEmissions + publicTransitEmissions + flightEmissions;

  // --- 2. HOME ENERGY ---
  // US/EU mixed average is roughly 0.45 kg CO2e per kWh
  const annualElectricityUsage = profile.electricityKwhPerMonth * 12;
  const electricityEmissions = (annualElectricityUsage * 0.45 * (1 - profile.cleanEnergyPercentage / 100)) / Math.max(1, profile.householdSize);

  let heatingAnnualBase = 0;
  switch (profile.heatingType) {
    case "gas":
      heatingAnnualBase = 2100;
      break;
    case "oil":
      heatingAnnualBase = 3200;
      break;
    case "electricity":
      heatingAnnualBase = 1400 * (1 - profile.cleanEnergyPercentage / 100);
      break;
    case "wood":
      heatingAnnualBase = 800;
      break;
    default:
      heatingAnnualBase = 0;
  }
  const heatingEmissions = heatingAnnualBase / Math.max(1, profile.householdSize);
  const homeTotal = electricityEmissions + heatingEmissions;

  // --- 3. DIET & FOOD ---
  let dietBase = 0;
  switch (profile.dietType) {
    case "meat-heavy":
      dietBase = 2900;
      break;
    case "balanced":
      dietBase = 1950;
      break;
    case "low-meat":
      dietBase = 1400;
      break;
    case "vegetarian":
      dietBase = 1000;
      break;
    case "vegan":
      dietBase = 650;
      break;
  }

  // Sourcing food locally reduces transportation waste by up to 15%
  const localReductionFactor = 1 - (0.15 * (profile.localFoodRatio / 100));
  let finalDiet = dietBase * localReductionFactor;

  // Food waste addition
  if (profile.foodWasteLevel === "high") {
    finalDiet += 350;
  } else if (profile.foodWasteLevel === "medium") {
    finalDiet += 120;
  }
  const foodTotal = finalDiet;

  // --- 4. CONSUMPTION & SHOPPING ---
  let shoppingBase = 0;
  switch (profile.shoppingFrequency) {
    case "frequent":
      shoppingBase = 2400;
      break;
    case "average":
      shoppingBase = 1350;
      break;
    case "minimal":
      shoppingBase = 500;
      break;
  }

  let recyclingDiscount = 0;
  if (profile.recyclingHabit === "diligent") {
    recyclingDiscount = 250;
  } else if (profile.recyclingHabit === "partial") {
    recyclingDiscount = 100;
  }
  const shoppingTotal = Math.max(150, shoppingBase - recyclingDiscount);

  // Rounded values
  const transport = Math.round(transportTotal);
  const home = Math.round(homeTotal);
  const food = Math.round(foodTotal);
  const shopping = Math.round(shoppingTotal);
  const total = transport + home + food + shopping;

  return {
    transport,
    home,
    food,
    shopping,
    total,
  };
}

/**
 * Provides static default mitigation actions if AI is not available yet
 */
export const DEFAULT_PLEDGES = [
  {
    id: "p1",
    title: "Switch to LED Bulb Upgrades",
    category: "home" as const,
    description: "Replace remaining old incandescent bulbs with high-efficiency energy-saving LEDs.",
    impactKg: 150,
    difficulty: "easy" as const,
    enrolled: false,
    completed: false,
  },
  {
    id: "p2",
    title: "Adopt Meat-Free Mondays",
    category: "food" as const,
    description: "Incorporate one fully vegetarian or vegan day each week into your household meals.",
    impactKg: 280,
    difficulty: "easy" as const,
    enrolled: false,
    completed: false,
  },
  {
    id: "p3",
    title: "Eco-Friendly Commuting Switch",
    category: "transport" as const,
    description: "Replace 30 miles of private gas commuting weekly with cycling, walking, or public transit.",
    impactKg: 620,
    difficulty: "medium" as const,
    enrolled: false,
    completed: false,
  },
  {
    id: "p4",
    title: "Composting & Waste Minimization",
    category: "food" as const,
    description: "Compost kitchen scraps to drop food waste to minimal and avoid landfill methane generation.",
    impactKg: 230,
    difficulty: "medium" as const,
    enrolled: false,
    completed: false,
  },
  {
    id: "p5",
    title: "Purchase Pre-owned First",
    category: "shopping" as const,
    description: "Acknowledge eco-thrift shopping first. Commit to sourcing clothes and gear pre-loved.",
    impactKg: 350,
    difficulty: "medium" as const,
    enrolled: false,
    completed: false,
  },
  {
    id: "p6",
    title: "Install Solar/Clean Grid Power Mix",
    category: "home" as const,
    description: "Pledge to enroll of solar panel grid or specify a green energy provider on utility bill.",
    impactKg: 950,
    difficulty: "hard" as const,
    enrolled: false,
    completed: false,
  },
];
