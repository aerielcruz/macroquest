import { FOODS } from './content/foods'
import type { Macros, MealItem } from './types'

export const XP_PER_CORRECT = 10
export const XP_LESSON_BONUS = 20
export const XP_PER_LEVEL = 100

export function levelFor(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function macrosFor(entries: { foodId: string; grams: number }[]): Macros {
  return entries.reduce<Macros>(
    (acc, { foodId, grams }) => {
      const f = FOODS[foodId]
      if (!f) return acc
      const k = grams / 100
      return {
        kcal: acc.kcal + f.kcal * k,
        protein: acc.protein + f.protein * k,
        carbs: acc.carbs + f.carbs * k,
        fat: acc.fat + f.fat * k,
      }
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

export function truthFor(items: MealItem[]): Macros {
  return macrosFor(items.map((i) => ({ foodId: i.foodId, grams: i.grams })))
}

/** 100 when logged calories match the truth exactly, falling linearly to 0 at 100% error. */
export function accuracyPct(logged: Macros, truth: Macros) {
  if (truth.kcal === 0) return 0
  return Math.max(0, 100 - (Math.abs(logged.kcal - truth.kcal) / truth.kcal) * 100)
}

/** A log counts as correct when calories are within 10% of the truth. */
export const LOG_PASS_PCT = 90

const CHEERS = ['Nice one!', 'Great work!', 'Spot on!', 'You got it!', 'Brilliant!', 'Nailed it!']
const NUDGES = ['Not quite, but you are learning.', 'Close! Here is how it works.', 'Good try. Let’s look at it together.']

export function cheer() {
  return CHEERS[Math.floor(Math.random() * CHEERS.length)]
}

export function nudge() {
  return NUDGES[Math.floor(Math.random() * NUDGES.length)]
}
