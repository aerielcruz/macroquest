import { useState, type ReactNode } from 'react'
import { SettingsMenu } from '../components/SettingsMenu'
import { Button, Card, ConfirmDialog, Mascot, ProgressBar, Screen, XpBadge } from '../components/ui'
import { GOAL_LABELS } from '../content/lessons'
import { Tour, type TourStep } from '../components/Tour'
import { setPreviewMode, usePreviewMode } from '../prefs'
import { resetTour } from '../storage'
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
  participantCode: string
  /** Abandons this session and goes back to the welcome screen. */
  onStartOver: () => void
  account?: ReactNode
}

const TOUR: TourStep[] = [
  { target: 'current-lesson', text: 'Start here! Tap the glowing lesson to begin. New lessons unlock as you finish each one.' },
  { target: 'survey', text: 'Once you finish Unit 1, you can take the short survey from here.' },
  { target: 'settings', text: 'Settings: make the text bigger, turn sounds off, or start over.' },
  { target: 'participant-code', text: 'This is your participant code. Keep it if you might want your answers removed later.' },
]

// Zig-zag offsets give the path its Duolingo-style winding look.
const OFFSETS = ['translate-x-0', 'translate-x-12', 'translate-x-16', 'translate-x-12', 'translate-x-0', '-translate-x-12', '-translate-x-16', '-translate-x-12']

export function LessonPath({ lessons, completed, xp, goal, onOpen, onSurvey, onFinishEarly, endedEarly, participantCode, onStartOver, account }: Props) {
  const nextIndex = lessons.findIndex((l) => !completed.has(l.id))
  const allDone = nextIndex === -1
  const coreCount = lessons.filter((l) => l.track === 'core').length
  const coreCompleted = lessons.filter((l) => l.track === 'core' && completed.has(l.id)).length
  const coreDone = coreCompleted === coreCount
  const [confirmEarly, setConfirmEarly] = useState(false)
  const preview = usePreviewMode()
  const [tourRun, setTourRun] = useState(0)
  // Before every lesson is done, the survey goes through the "Finish early?" check.
  const surveyReady = allDone || endedEarly || preview

  return (
    <Screen>
      <header className="sticky top-0 z-10 -mx-4 mb-4 bg-slate-50/90 px-4 py-2 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap font-extrabold text-lime-600">
            <img src="/logo.svg" alt="" className="h-6 w-6" />
            MacroQuest
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <XpBadge xp={xp} />
            {account}
            <SettingsMenu
              progressSummary={`${completed.size} ${completed.size === 1 ? 'lesson' : 'lessons'}, ${xp} XP`}
              onShowTour={() => {
                resetTour('path')
                setTourRun((n) => n + 1)
              }}
              onStartOver={onStartOver}
            />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 border-slate-200 pt-2">
          <Button
            variant={surveyReady ? 'primary' : 'secondary'}
            size="sm"
            className="shrink-0 whitespace-nowrap"
            disabled={!coreDone && !surveyReady}
            data-tour="survey"
            onClick={surveyReady ? onSurvey : () => setConfirmEarly(true)}
          >
            {coreDone || surveyReady ? '📝' : '🔒'} Take the survey
          </Button>
          <p className="text-xs font-bold text-slate-500">
            {surveyReady
              ? 'All set! It takes about 3 minutes.'
              : coreDone
                ? 'Ready when you are, but finishing every lesson helps our study most.'
                : `Complete Unit 1 to take the survey (${coreCompleted} of ${coreCount} done).`}
          </p>
        </div>
      </header>

      {preview && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm">
          <span className="font-bold text-amber-800">🔓 Preview mode: every lesson is unlocked and this session is marked as test data.</span>
          <button type="button" onClick={() => setPreviewMode(false)} className="whitespace-nowrap font-extrabold text-amber-700 underline">
            Turn off
          </button>
        </div>
      )}

      <ProgressBar value={completed.size / lessons.length} />
      <p className="mt-2 text-sm font-bold text-slate-500">
        {completed.size} of {lessons.length} lessons complete
      </p>
      <ParticipantCode code={participantCode} />

      <div className="mt-6 flex flex-col items-center gap-5">
        {lessons.map((lesson, i) => {
          const done = completed.has(lesson.id)
          const current = i === nextIndex
          const locked = !preview && !done && !current
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
                  data-tour={current ? 'current-lesson' : undefined}
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

      {coreDone && !allDone && !endedEarly && !preview && (
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

      {surveyReady && (
        <Card className="mt-8 flex flex-col items-center gap-3 text-center">
          <Mascot mood="cheer" />
          <h2 className="text-xl font-extrabold">{allDone ? 'You finished every lesson!' : preview ? 'Preview the survey' : 'Thanks for taking part!'}</h2>
          <p className="text-slate-500">One last step: tell us what you thought. It takes about 3 minutes.</p>
          <Button className="w-full" onClick={onSurvey}>
            Take the survey
          </Button>
        </Card>
      )}

      <Tour key={tourRun} name="path" steps={TOUR} />

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

/**
 * Shown from the start so anyone who stops part-way can still ask for their data
 * to be withdrawn. Tapping copies the code.
 */
function ParticipantCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <p className="mt-1 text-xs text-slate-400" data-tour="participant-code">
      Your participant code:{' '}
      <button
        type="button"
        onClick={() => {
          navigator.clipboard
            ?.writeText(code)
            .then(() => setCopied(true))
            .catch(() => {})
        }}
        className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-extrabold tracking-wider text-slate-600 hover:bg-slate-200"
        title="Copy code"
      >
        {code}
      </button>{' '}
      {copied ? <span className="font-bold text-lime-600">Copied!</span> : 'Keep it if you might want your data removed later.'}
    </p>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 w-full rounded-2xl bg-lime-500 px-4 py-3 text-center font-extrabold text-white">{children}</div>
  )
}
