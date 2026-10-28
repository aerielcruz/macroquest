import type { IllustrationId } from './content/illustrations'

export type Goal = 'bulk' | 'cut' | 'maintain'
export type Track = 'core' | Goal

export type Experience = 'none' | 'tried' | 'under6m' | 'over6m'

export interface McqQuestion {
  kind: 'mcq'
  id: string
  prompt: string
  /** Optional picture shown above the prompt. */
  image?: IllustrationId
  options: string[]
  correct: number
  explain: string
}

export interface NumericQuestion {
  kind: 'numeric'
  id: string
  prompt: string
  /** Optional picture shown above the prompt. */
  image?: IllustrationId
  unit: string
  answer: number
  /** Accepted if within this many units of the answer. */
  tolerance: number
  explain: string
}

/** A food entry in the practice database, values per 100 g (USDA FoodData Central). */
export interface FoodEntry {
  id: string
  name: string
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface MealItem {
  /** What the participant is told they ate. */
  description: string
  /** Correct database entry and weight. */
  foodId: string
  grams: number
  /** Database entries offered for this item, including look-alike wrong ones. */
  choices: string[]
}

export interface LogQuestion {
  kind: 'log'
  id: string
  prompt: string
  /** Optional picture shown above the prompt. */
  image?: IllustrationId
  items: MealItem[]
  explain: string
}

export type Question = McqQuestion | NumericQuestion | LogQuestion

export interface Lesson {
  id: string
  track: Track
  title: string
  emoji: string
  /** Short teaching cards shown before the questions. */
  cards: { title: string; body: string; image?: IllustrationId }[]
  questions: Question[]
}

export interface LessonResult {
  lessonId: string
  questionCount: number
  firstTryCorrect: number
  attempts: number
  xpEarned: number
  durationMs: number
  completedAt: string
}

export interface LogTaskResult {
  lessonId: string
  questionId: string
  entries: { foodId: string; grams: number }[]
  logged: Macros
  truth: Macros
  /** 0-100, how close the logged calories were to the true calories. */
  accuracyPct: number
}

export interface Macros {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface SurveyResponse {
  /** Skill items (SKILL_ITEMS), 1-5 agreement, rated after using the app. */
  ratings: Record<string, number>
  /** Older records only: the earlier survey asked for before and after ratings. */
  retro?: Record<string, { before: number; after: number }>
  satisfaction: Record<string, number>
  nps: number
  npsReason: string
  comments: string
  submittedAt: string
}

export interface SessionRecord {
  id: string
  participantCode: string
  startedAt: string
  finishedAt?: string
  consentAt: string
  experience: Experience
  goal?: Goal
  xp: number
  lessons: LessonResult[]
  logTasks: LogTaskResult[]
  survey?: SurveyResponse
  /** Chose "Finish early" after the core lessons instead of completing every lesson. */
  endedEarly?: boolean
}
