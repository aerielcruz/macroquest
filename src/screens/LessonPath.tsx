import { useState, type ReactNode } from 'react'
import { Button, Card, ConfirmDialog, Mascot, ProgressBar, Screen, TextSizeButton, XpBadge } from '../components/ui'
import { GOAL_LABELS } from '../content/lessons'
import { play } from '../sound'
import type { Goal, Lesson } from '../types'

interface Props {
  lessons: Lesson[]
  completed: Set<string>
  xp: number
  goal: Goal
  onOpen: (lessonId: string) => void
  onSurvey: () => void
  /** Ends the lessons now and goes to the survey. Offered once the core lessons are done. */
  onFinishEarly: () => void
  endedEarly: boolean
  account?: ReactNode
}

// Zig-zag offsets give the path its Duolingo-style winding look.
const OFFSETS = ['translate-x-0', 'translate-x-12', 'translate-x-16', 'translate-x-12', 'translate-x-0', '-translate-x-12', '-translate-x-16', '-translate-x-12']

export function LessonPath({ lessons, completed, xp, goal, onOpen, onSurvey, onFinishEarly, endedEarly, account }: Props) {
  const nextIndex = lessons.findIndex((l) => !completed.has(l.id))
  const allDone = nextIndex === -1
  const coreCount = lessons.filter((l) => l.track === 'core').length
  const coreDone = lessons.filter((l) => l.track === 'core').every((l) => completed.has(l.id))
  const [confirmEarly, setConfirmEarly] = useState(false)

  return (
    <Screen>
      <header className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between bg-slate-50/90 px-4 py-2 backdrop-blur">
        <span className="font-extrabold text-lime-600">🥑 MacroQuest</span>
        <div className="flex items-center gap-3">
          <XpBadge xp={xp} />
          <TextSizeButton />
          {account}
        </div>
      </header>

      <ProgressBar value={completed.size / lessons.length} />
      <p className="mt-2 text-sm font-bold text-slate-500">
        {completed.size} of {lessons.length} lessons complete
      </p>

      <div className="mt-6 flex flex-col items-center gap-5">
        {lessons.map((lesson, i) => {
          const done = completed.has(lesson.id)
          const current = i === nextIndex
          const locked = !done && !current
          return (
            <div key={lesson.id} className="flex w-full flex-col items-center">
              {i === 0 && <SectionLabel>Unit 1 · Core skills</SectionLabel>}
              {i === coreCount && (
                <SectionLabel>
                  Unit 2 · {GOAL_LABELS[goal].emoji} {GOAL_LABELS[goal].label}
                </SectionLabel>
              )}
              <div className={`flex flex-col items-center ${OFFSETS[i % OFFSETS.length]}`}>
                {current && (
                  <span className="mb-2 animate-bounce rounded-xl border-2 border-slate-200 bg-white px-3 py-1 text-sm font-extrabold text-lime-600">
                    START
                  </span>
                )}
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    play('start')
                    onOpen(lesson.id)
                  }}
                  aria-label={lesson.title}
                  className={`flex h-20 w-20 items-center justify-center rounded-full border-b-8 text-3xl transition active:translate-y-1 active:border-b-4 ${
                    done
                      ? 'border-amber-600 bg-amber-400'
                      : current
                        ? 'border-lime-700 bg-lime-500 ring-8 ring-lime-200'
                        : 'cursor-not-allowed border-slate-300 bg-slate-200 grayscale'
                  }`}
                >
                  {done ? '✓' : locked ? '🔒' : lesson.emoji}
                </button>
                <span className={`mt-2 max-w-40 text-center text-sm font-bold ${locked ? 'text-slate-400' : 'text-slate-700'}`}>
                  {lesson.title}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {coreDone && !allDone && !endedEarly && (
        <Card className="mt-8 flex flex-col items-center gap-2 text-center">
          <h2 className="font-extrabold">Short on time?</h2>
          <p className="text-sm text-slate-500">
            You have finished the core skills. You can stop here and go to the survey, but finishing every lesson helps our study most.
          </p>
          <Button variant="secondary" className="mt-1 w-full" onClick={() => setConfirmEarly(true)}>
            Finish early
          </Button>
        </Card>
      )}

      {(allDone || endedEarly) && (
        <Card className="mt-8 flex flex-col items-center gap-3 text-center">
          <Mascot mood="cheer" />
          <h2 className="text-xl font-extrabold">{allDone ? 'You finished every lesson!' : 'Thanks for taking part!'}</h2>
          <p className="text-slate-500">One last step: tell us what you thought. It takes about 3 minutes.</p>
          <Button className="w-full" onClick={onSurvey}>
            Take the survey
          </Button>
        </Card>
      )}

      {confirmEarly && (
        <ConfirmDialog
          title="Finish early?"
          confirmLabel="Finish and go to the survey"
          cancelLabel="Keep learning"
          onConfirm={() => {
            setConfirmEarly(false)
            onFinishEarly()
          }}
          onCancel={() => setConfirmEarly(false)}
        >
          You will skip the remaining {lessons.length - completed.size} lessons and go straight to the short survey.
        </ConfirmDialog>
      )}
    </Screen>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 w-full rounded-2xl bg-lime-500 px-4 py-3 text-center font-extrabold text-white">{children}</div>
  )
}
