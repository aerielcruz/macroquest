import { useState } from 'react'
import { Button, Mascot, Screen } from '../components/ui'
import { GOAL_LABELS } from '../content/lessons'
import type { Goal } from '../types'

export function GoalPick({ onPick }: { onPick: (goal: Goal) => void }) {
  const [goal, setGoal] = useState<Goal | null>(null)
  return (
    <Screen>
      <div className="mb-6 flex items-center gap-4">
        <Mascot mood="think" size="text-5xl" />
        <div>
          <h1 className="text-2xl font-extrabold">What is your goal right now?</h1>
          <p className="text-slate-500">Everyone learns the core skills first. Your goal picks your final lessons.</p>
        </div>
      </div>
      <div className="space-y-3">
        {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => {
          const { label, emoji, blurb } = GOAL_LABELS[g]
          const selected = goal === g
          return (
            <button
              key={g}
              type="button"
              onClick={() => setGoal(g)}
              className={`flex w-full items-center gap-4 rounded-2xl border-2 border-b-4 p-4 text-left transition ${
                selected ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <span className="text-4xl">{emoji}</span>
              <span>
                <span className={`block text-lg font-extrabold ${selected ? 'text-sky-700' : ''}`}>{label}</span>
                <span className="text-slate-500">{blurb}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div className="mt-auto pt-6">
        <Button className="w-full" disabled={!goal} onClick={() => goal && onPick(goal)}>
          Start learning
        </Button>
      </div>
    </Screen>
  )
}
