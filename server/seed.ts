import 'dotenv/config'
import { RETRO_ITEMS, SATISFACTION_ITEMS } from '../src/content/survey'
import { lessonsForGoal } from '../src/content/lessons'
import type { Experience, Goal, LessonResult, LogTaskResult, SessionRecord, SurveyResponse } from '../src/types'
import { connect, studySessions } from './db'

// Inserts fake finished participants into studySessions so the #admin page has data.
//   npm run seed            add (or refresh) the sample participants
//   npm run seed -- --clear remove them again
// Sample ids start with "sample-", so real participant data is never touched.

const COUNT = 12
const XP_PER_CORRECT = 10
const XP_LESSON_BONUS = 20

// Seeded random numbers so every run produces the same sample data.
let seed = 42
function rand() {
  seed = (seed * 1664525 + 1013904223) % 2 ** 32
  return seed / 2 ** 32
}
const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1))
const pick = <T>(xs: readonly T[]) => xs[int(0, xs.length - 1)]
const clamp = (n: number) => Math.max(1, Math.min(5, n))

const EXPERIENCES: Experience[] = ['none', 'tried', 'under6m', 'over6m']
const GOALS: Goal[] = ['bulk', 'cut', 'maintain']
const REASONS = [
  'Short lessons that actually stuck.',
  'The food logging practice was really useful.',
  'Good, but I wanted more lessons.',
  'Made macros way less confusing.',
  'Fun streaks, felt like a game.',
  'Some questions were a bit tricky.',
]
const COMMENTS = ['', '', 'Would love a barcode scanner.', 'More examples for eating out please.', 'Great intro for beginners.']

function sampleSession(i: number): SessionRecord {
  const goal = pick(GOALS)
  const experience = pick(EXPERIENCES)
  const start = new Date(Date.UTC(2026, 9, 1 + i, int(8, 20), int(0, 59)))
  let t = start.getTime() + 60_000

  const lessons: LessonResult[] = lessonsForGoal(goal).map((lesson) => {
    const questionCount = lesson.questions.length
    const firstTryCorrect = int(Math.max(0, questionCount - 2), questionCount)
    const durationMs = int(90, 300) * 1000
    t += durationMs + int(10, 60) * 1000
    return {
      lessonId: lesson.id,
      questionCount,
      firstTryCorrect,
      attempts: questionCount + (questionCount - firstTryCorrect),
      xpEarned: firstTryCorrect * XP_PER_CORRECT + XP_LESSON_BONUS,
      durationMs,
      completedAt: new Date(t).toISOString(),
    }
  })

  const logTasks: LogTaskResult[] = ['log-lunch', 'log-breakfast'].map((questionId) => {
    const truth = { kcal: int(400, 700), protein: int(20, 45), carbs: int(40, 80), fat: int(10, 25) }
    const off = 1 + (rand() - 0.5) * 0.2
    const logged = {
      kcal: Math.round(truth.kcal * off),
      protein: Math.round(truth.protein * off),
      carbs: Math.round(truth.carbs * off),
      fat: Math.round(truth.fat * off),
    }
    const accuracyPct = Math.round((100 - (Math.abs(logged.kcal - truth.kcal) / truth.kcal) * 100) * 10) / 10
    return { lessonId: 'practice-log', questionId, entries: [], logged, truth, accuracyPct }
  })

  // Participants usually rate themselves higher after the app than before.
  const retro: SurveyResponse['retro'] = {}
  for (const group of RETRO_ITEMS) {
    for (const item of group.items) {
      const before = clamp(int(1, 3) + (experience === 'over6m' ? 1 : 0))
      retro[item.id] = { before, after: clamp(before + int(0, 2)) }
    }
  }
  const satisfaction = Object.fromEntries(SATISFACTION_ITEMS.map((item) => [item.id, int(3, 5)]))

  t += int(60, 180) * 1000
  const submittedAt = new Date(t).toISOString()

  return {
    id: `sample-${String(i + 1).padStart(2, '0')}`,
    participantCode: `SMP${String(i + 1).padStart(3, '0')}`,
    startedAt: start.toISOString(),
    consentAt: start.toISOString(),
    finishedAt: submittedAt,
    experience,
    goal,
    xp: lessons.reduce((sum, l) => sum + l.xpEarned, 0),
    lessons,
    logTasks,
    survey: {
      retro,
      satisfaction,
      nps: int(5, 10),
      npsReason: pick(REASONS),
      comments: pick(COMMENTS),
      submittedAt,
    },
  }
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is missing. Copy .env.example to .env and fill it in.')
  await connect(uri)

  const removed = await studySessions().deleteMany({ _id: { $regex: '^sample-' } })
  if (process.argv.includes('--clear')) {
    console.log(`Removed ${removed.deletedCount} sample participants.`)
    return
  }

  const now = new Date()
  const docs = Array.from({ length: COUNT }, (_, i) => sampleSession(i)).map((s) => ({ ...s, _id: s.id, updatedAt: now }))
  await studySessions().insertMany(docs)
  console.log(`Inserted ${docs.length} sample participants into studySessions.`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message)
    process.exit(1)
  })
