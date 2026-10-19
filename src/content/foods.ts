import type { FoodEntry } from '../types'

// Values per 100 g, rounded from USDA FoodData Central (fdc.nal.usda.gov).
// Look-alike entries (raw vs cooked, whole vs skim) are included on purpose:
// picking the wrong entry is one of the most common real logging mistakes.
export const FOODS: Record<string, FoodEntry> = {
  chicken_cooked: { id: 'chicken_cooked', name: 'Chicken breast, roasted (cooked)', kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  chicken_raw: { id: 'chicken_raw', name: 'Chicken breast, raw', kcal: 120, protein: 22.5, carbs: 0, fat: 2.6 },
  rice_cooked: { id: 'rice_cooked', name: 'White rice, cooked', kcal: 130, protein: 2.7, carbs: 28.2, fat: 0.3 },
  rice_raw: { id: 'rice_raw', name: 'White rice, raw (dry)', kcal: 365, protein: 7.1, carbs: 80, fat: 0.7 },
  broccoli_cooked: { id: 'broccoli_cooked', name: 'Broccoli, boiled', kcal: 35, protein: 2.4, carbs: 7.2, fat: 0.4 },
  olive_oil: { id: 'olive_oil', name: 'Olive oil', kcal: 884, protein: 0, carbs: 0, fat: 100 },
  butter: { id: 'butter', name: 'Butter, salted', kcal: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  oats_dry: { id: 'oats_dry', name: 'Oats, rolled, dry', kcal: 379, protein: 13.2, carbs: 67.7, fat: 6.5 },
  oats_cooked: { id: 'oats_cooked', name: 'Oatmeal, cooked with water', kcal: 71, protein: 2.5, carbs: 12, fat: 1.5 },
  milk_whole: { id: 'milk_whole', name: 'Milk, whole (3.25%)', kcal: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  milk_skim: { id: 'milk_skim', name: 'Milk, skim', kcal: 34, protein: 3.4, carbs: 5, fat: 0.1 },
  banana: { id: 'banana', name: 'Banana, raw', kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
  banana_chips: { id: 'banana_chips', name: 'Banana chips', kcal: 519, protein: 2.3, carbs: 58.4, fat: 33.6 },
  peanut_butter: { id: 'peanut_butter', name: 'Peanut butter, smooth', kcal: 588, protein: 25, carbs: 20, fat: 50 },
  peanuts: { id: 'peanuts', name: 'Peanuts, dry roasted', kcal: 585, protein: 24.4, carbs: 21.3, fat: 49.7 },
}
