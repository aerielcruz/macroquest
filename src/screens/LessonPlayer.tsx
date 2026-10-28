import { useMemo, useRef, useState } from 'react'
import { Button, Card, Mascot, ProgressBar, Screen, TextSizeButton } from '../components/ui'
import { FOODS } from '../content/foods'
import { Illustration } from '../content/illustrations'
import {
  LOG_PASS_PCT,
  XP_LESSON_BONUS,
  XP_PER_CORRECT,
  accuracyPct,
  cheer,
  macrosFor,
  nudge,
  truthFor,
} from '../scoring'
import { useHotkeys } from '../hotkeys'
import { play, setMuted, useMuted } from '../sound'
import type { LessonResult, Lesson, LogQuestion, LogTaskResult, McqQuestion, NumericQuestion, Question } from '../types'
import { Choice } from './Welcome'

interface Props {
  lesson: Lesson
  /** The lesson was finished before: no XP, and the tips can be skipped. */
  replay?: boolean
  onExit: () => void
  onComplete: (result: LessonResult, logTasks: LogTaskResult[]) => void
}

interface Feedback {
  correct: boolean
  title: string
  detail: string
  extra?: React.ReactNode
  retry: boolean
}

export function LessonPlayer({ lesson, replay = false, onExit, onComplete }: Props) {
  const startedAt = useRef(Date.now())
  const [cardIndex, setCardIndex] = useState(0)
  // Questions answered wrongly go to the back of the queue, like Duolingo.
  const [queue, setQueue] = useState<number[]>(() => lesson.questions.map((_, i) => i))
  const [answered, setAnswered] = useState<Set<number>>(new Set())
  const [firstTry, setFirstTry] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [combo, setCombo] = useState(0)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [logTasks, setLogTasks] = useState<LogTaskResult[]>([])
  const [finished, setFinished] = useState(false)
  const [turn, setTurn] = useState(0)
  const [missed, setMissed] = useState<number[]>([])
  const [confirmQuit, setConfirmQuit] = useState(false)
  const attemptedOnce = useRef<Set<number>>(new Set())

  const inCards = cardIndex < lesson.cards.length
  const qIndex = queue[0]
  const question = lesson.questions[qIndex]
  const total = lesson.cards.length + lesson.questions.length
  const progress = (Math.min(cardIndex, lesson.cards.length) + answered.size) / total

  function grade(correct: boolean, detail: string, extra?: React.ReactNode, title?: string) {
    const first = !attemptedOnce.current.has(qIndex)
    attemptedOnce.current.add(qIndex)
    setAttempts((a) => a + 1)
    if (correct) {
      if (first) setFirstTry((f) => f + 1)
      setCombo((c) => c + 1)
      // A custom title means a within-tolerance numeric answer ("Close enough!").
      play(title ? 'close' : combo + 1 >= 3 ? 'combo' : 'correct')
    } else {
      setCombo(0)
      play('wrong')
      // Log tasks already list every fix in their feedback, so only review the others.
      if (question.kind !== 'log') setMissed((m) => (m.includes(qIndex) ? m : [...m, qIndex]))
    }
    setFeedback({ correct, title: title ?? (correct ? cheer() : nudge()), detail, extra, retry: !correct && question.kind !== 'log' })
  }

  function next() {
    if (!feedback) return
    const [head, ...rest] = queue
    const requeue = !feedback.correct && question.kind !== 'log'
    const newQueue = requeue ? [...rest, head] : rest
    if (feedback.correct || question.kind === 'log') setAnswered((s) => new Set(s).add(head))
    setFeedback(null)
    setTurn((t) => t + 1)
    setQueue(newQueue)
    if (newQueue.length === 0) {
      setFinished(true)
      play('complete')
    }
  }

  const xpEarned = firstTry * XP_PER_CORRECT + XP_LESSON_BONUS

  function finish() {
    onComplete(
      {
        lessonId: lesson.id,
        questionCount: lesson.questions.length,
        firstTryCorrect: firstTry,
        attempts,
        xpEarned,
        durationMs: Date.now() - startedAt.current,
        completedAt: new Date().toISOString(),
      },
      logTasks,
    )
  }

  /** Leaving straight away is fine until there is progress worth keeping. */
  function requestQuit() {
    if (cardIndex === 0 && attempts === 0) onExit()
    else setConfirmQuit(true)
  }

  useHotkeys((key) => {
    if (finished) {
      if (key !== 'Enter') return
      finish()
      return true
    }
    if (key === 'Escape') {
      requestQuit()
      return true
    }
  })

  if (finished) {
    const pct = Math.round((firstTry / lesson.questions.length) * 100)
    return (
      <Screen>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Mascot mood="cheer" size="text-8xl" />
          <h1 className="text-3xl font-extrabold text-amber-500">{replay ? 'Practice complete!' : 'Lesson complete!'}</h1>
          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            <Stat label="XP earned" value={replay ? '+0' : `+${xpEarned}`} tone="amber" />
            <Stat label="First try" value={`${pct}%`} tone="lime" />
          </div>
          <p className="max-w-sm text-slate-500">
            {replay
              ? 'XP only counts the first time, but practice still pays off.'
              : pct === 100
                ? 'Flawless. You clearly know your stuff.'
                : 'Every mistake you fixed is a skill you now own.'}
          </p>
          {missed.length > 0 && <MistakeReview questions={missed.map((i) => lesson.questions[i])} />}
        </div>
        <Button className="mt-6 w-full" onClick={finish}>
          Continue
        </Button>
      </Screen>
    )
  }

  return (
    <Screen>
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={requestQuit} className="text-2xl font-bold text-slate-400 hover:text-slate-600" aria-label="Quit lesson">
          ✕
        </button>
        <ProgressBar value={progress} />
        {combo >= 2 && <span className="whitespace-nowrap text-sm font-extrabold text-orange-500">🔥 {combo} in a row</span>}
        <TextSizeButton />
        <MuteButton />
      </div>

      {inCards ? (
        <TeachCard
          key={cardIndex}
          card={lesson.cards[cardIndex]}
          step={cardIndex + 1}
          of={lesson.cards.length}
          onNext={() => setCardIndex((i) => i + 1)}
          onSkip={replay ? () => setCardIndex(lesson.cards.length) : undefined}
        />
      ) : (
        <QuestionView
          key={turn}
          question={question}
          locked={!!feedback}
          onGrade={grade}
          onLog={(r) => setLogTasks((t) => (t.some((x) => x.questionId === r.questionId) ? t : [...t, { ...r, lessonId: lesson.id }]))}
        />
      )}

      {feedback && <FeedbackBar feedback={feedback} onNext={next} />}
      {confirmQuit && <QuitDialog onStay={() => setConfirmQuit(false)} onQuit={onExit} />}
    </Screen>
  )
}

function QuitDialog({ onStay, onQuit }: { onStay: () => void; onQuit: () => void }) {
  useHotkeys(
    (key) => {
      if (key === 'Escape') {
        onStay()
        return true
      }
    },
    { capture: true },
  )
  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quit-title"
    >
      <Card className="w-full max-w-sm text-center">
        <Mascot mood="think" size="text-5xl" />
        <h2 id="quit-title" className="mt-2 text-xl font-extrabold">
          Quit this lesson?
        </h2>
        <p className="mt-1 text-slate-500">Your answers in this lesson will be lost. Lessons you have already finished stay saved.</p>
        <Button className="mt-5 w-full" onClick={onStay} autoFocus>
          Keep learning
        </Button>
        <Button variant="ghost" className="mt-2 w-full text-rose-500 hover:text-rose-600" onClick={onQuit}>
          Quit
        </Button>
      </Card>
    </div>
  )
}

function answerText(q: Question) {
  if (q.kind === 'mcq') return q.options[q.correct]
  if (q.kind === 'numeric') return `${q.answer.toLocaleString()} ${q.unit}`
  return ''
}

function MistakeReview({ questions }: { questions: Question[] }) {
  return (
    <div className="w-full text-left">
      <h2 className="mb-2 text-lg font-extrabold">Worth another look</h2>
      <div className="space-y-3">
        {questions.map((q) => (
          <Card key={q.id} className="p-4">
            <p className="font-bold">{q.prompt}</p>
            <p className="mt-2 font-extrabold text-lime-700">Answer: {answerText(q)}</p>
            <p className="mt-1 text-sm text-slate-600">{q.explain}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'amber' | 'lime' }) {
  const cls = tone === 'amber' ? 'border-amber-400 text-amber-500' : 'border-lime-500 text-lime-600'
  return (
    <div className={`rounded-2xl border-2 bg-white p-3 ${cls}`}>
      <div className="text-xs font-extrabold uppercase">{label}</div>
      <div className="text-2xl font-extrabold">{value}</div>
    </div>
  )
}

function TeachCard({
  card,
  step,
  of,
  onNext,
  onSkip,
}: {
  card: Lesson['cards'][number]
  step: number
  of: number
  onNext: () => void
  onSkip?: () => void
}) {
  useHotkeys((key) => {
    if (key === 'Enter' || key === 'ArrowRight') {
      onNext()
      return true
    }
  })
  return (
    <>
      <div className="flex items-end gap-3">
        <Mascot size="text-5xl" />
        <span className="mb-2 text-sm font-bold uppercase text-slate-400">
          Tip {step} of {of}
        </span>
      </div>
      <Card className="mt-3">
        {card.image && <Illustration id={card.image} className="mb-4" />}
        <h2 className="mb-2 text-xl font-extrabold">{card.title}</h2>
        <p className="text-lg leading-relaxed text-slate-600">{card.body}</p>
      </Card>
      <div className="mt-auto pt-6">
        <Button className="w-full" onClick={onNext}>
          {step === of ? 'Let’s practise' : 'Next'}
        </Button>
        {onSkip && step < of && (
          <Button variant="ghost" className="mt-2 w-full" onClick={onSkip}>
            Skip to questions
          </Button>
        )}
        <KeyHint>Enter for next</KeyHint>
      </div>
    </>
  )
}

interface QuestionViewProps {
  question: Question
  locked: boolean
  onGrade: (correct: boolean, detail: string, extra?: React.ReactNode, title?: string) => void
  onLog: (r: Omit<LogTaskResult, 'lessonId'>) => void
}

function QuestionView(props: QuestionViewProps) {
  switch (props.question.kind) {
    case 'mcq':
      return <McqView {...props} question={props.question} />
    case 'numeric':
      return <NumericView {...props} question={props.question} />
    case 'log':
      return <LogView {...props} question={props.question} />
  }
}

function McqView({ question, locked, onGrade }: QuestionViewProps & { question: McqQuestion }) {
  const [choice, setChoice] = useState<number | null>(null)

  function pick(i: number) {
    if (locked) return
    play('tap')
    setChoice(i)
  }

  function check() {
    if (locked || choice === null) return
    onGrade(
      choice === question.correct,
      choice === question.correct ? question.explain : `Answer: ${question.options[question.correct]}. ${question.explain}`,
    )
  }

  useHotkeys((key) => {
    if (locked) return
    const n = Number(key)
    if (n >= 1 && n <= question.options.length) {
      pick(n - 1)
      return true
    }
    if (key === 'Enter' && choice !== null) {
      check()
      return true
    }
  })

  return (
    <>
      {question.image && <Illustration id={question.image} className="mb-4" />}
      <h2 className="mb-5 text-xl font-extrabold">{question.prompt}</h2>
      <div className="space-y-3">
        {question.options.map((o, i) => (
          <Choice key={i} block selected={choice === i} onClick={() => pick(i)}>
            <kbd className="mr-3 hidden rounded-md border-2 border-slate-200 px-1.5 font-sans text-xs text-slate-400 sm:inline">{i + 1}</kbd>
            {o}
          </Choice>
        ))}
      </div>
      {!locked && (
        <div className="mt-auto pt-6">
          <Button className="w-full" disabled={choice === null} onClick={check}>
            Check
          </Button>
          <KeyHint>Press 1–{question.options.length} to choose, Enter to check</KeyHint>
        </div>
      )}
    </>
  )
}

function NumericView({ question, locked, onGrade }: QuestionViewProps & { question: NumericQuestion }) {
  const [value, setValue] = useState('')
  const n = parseFloat(value.replace(/,/g, ''))
  return (
    <>
      {question.image && <Illustration id={question.image} className="mb-4" />}
      <h2 className="mb-5 text-xl font-extrabold">{question.prompt}</h2>
      <div className="flex items-center gap-3">
        <input
          inputMode="decimal"
          autoFocus
          disabled={locked}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !Number.isNaN(n) && !locked && submit()}
          className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-2xl font-bold outline-none focus:border-sky-400"
          placeholder="Your answer"
        />
        <span className="text-xl font-bold text-slate-500">{question.unit}</span>
      </div>
      {!locked && (
        <div className="mt-auto pt-6">
          <Button className="w-full" disabled={Number.isNaN(n)} onClick={submit}>
            Check
          </Button>
          <KeyHint>Enter to check</KeyHint>
        </div>
      )}
    </>
  )

  function submit() {
    const diff = Math.abs(n - question.answer)
    const correct = diff <= question.tolerance
    const exact = diff === 0
    const answer = `${question.answer.toLocaleString()} ${question.unit}`
    if (correct && !exact) {
      onGrade(true, `Exact answer: ${answer}. ${question.explain}`, undefined, 'Close enough!')
    } else {
      onGrade(correct, correct ? question.explain : `Answer: ${answer}. ${question.explain}`)
    }
  }
}

function LogView({ question, locked, onGrade, onLog }: QuestionViewProps & { question: LogQuestion }) {
  const [foods, setFoods] = useState<(string | null)[]>(() => question.items.map((i) => (i.choices.length === 1 ? i.choices[0] : null)))
  const [grams, setGrams] = useState<string[]>(() => question.items.map(() => ''))

  const entries = question.items.map((_, i) => ({ foodId: foods[i] ?? '', grams: parseFloat(grams[i]) || 0 }))
  const logged = useMemo(() => macrosFor(entries), [entries])
  const complete = foods.every(Boolean) && grams.every((g) => parseFloat(g) > 0)

  function submit() {
    const truth = truthFor(question.items)
    const acc = accuracyPct(logged, truth)
    onLog({ questionId: question.id, entries, logged, truth, accuracyPct: Math.round(acc * 10) / 10 })
    const misses = question.items.filter((item, i) => foods[i] !== item.foodId || Math.abs(entries[i].grams - item.grams) > item.grams * 0.05)
    const correct = acc >= LOG_PASS_PCT
    onGrade(
      correct,
      `You logged ${Math.round(logged.kcal)} kcal. ${question.explain} Your accuracy: ${Math.floor(acc)}%.`,
      misses.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-sm">
          {misses.map((m) => (
            <li key={m.foodId}>
              {m.description}: use <b>{FOODS[m.foodId].name}</b>, {m.grams} g
            </li>
          ))}
        </ul>
      ),
    )
  }

  return (
    <>
      {question.image && <Illustration id={question.image} className="mb-4" />}
      <h2 className="mb-1 text-xl font-extrabold">{question.prompt}</h2>
      <p className="mb-4 text-slate-500">Pick the matching entry and enter the weight in grams.</p>
      <div className="space-y-4">
        {question.items.map((item, i) => (
          <Card key={i} className="space-y-3 p-4">
            <p className="font-bold">🍽️ {item.description}</p>
            <div className="grid gap-2">
              {item.choices.map((id) => {
                const f = FOODS[id]
                return (
                  <Choice
                    key={id}
                    block
                    selected={foods[i] === id}
                    onClick={() => {
                      if (locked) return
                      play('tap')
                      setFoods((fs) => fs.map((x, j) => (j === i ? id : x)))
                    }}
                  >
                    <span className="block">{f.name}</span>
                    <span className="text-xs font-semibold text-slate-500">
                      per 100 g: {f.kcal} kcal · P {f.protein} g · C {f.carbs} g · F {f.fat} g
                    </span>
                  </Choice>
                )
              })}
            </div>
            <label className="flex items-center gap-2">
              <input
                inputMode="decimal"
                disabled={locked}
                value={grams[i]}
                onChange={(e) => setGrams((gs) => gs.map((x, j) => (j === i ? e.target.value : x)))}
                className="w-28 rounded-xl border-2 border-slate-300 px-3 py-2 font-bold outline-none focus:border-sky-400"
                placeholder="0"
              />
              <span className="font-bold text-slate-500">grams</span>
            </label>
          </Card>
        ))}
      </div>
      <Card className="mt-4 grid grid-cols-4 gap-2 p-4 text-center">
        <Macro label="kcal" value={logged.kcal} />
        <Macro label="Protein" value={logged.protein} unit="g" />
        <Macro label="Carbs" value={logged.carbs} unit="g" />
        <Macro label="Fat" value={logged.fat} unit="g" />
      </Card>
      {!locked && (
        <div className="pt-6 pb-40">
          <Button className="w-full" disabled={!complete} onClick={submit}>
            Check my log
          </Button>
        </div>
      )}
      {locked && <div className="pb-48" />}
    </>
  )
}

function Macro({ label, value, unit = '' }: { label: string; value: number; unit?: string }) {
  return (
    <div>
      <div className="text-lg font-extrabold">
        {Math.round(value)}
        {unit}
      </div>
      <div className="text-xs font-bold uppercase text-slate-400">{label}</div>
    </div>
  )
}

function FeedbackBar({ feedback, onNext }: { feedback: Feedback; onNext: () => void }) {
  const ok = feedback.correct
  useHotkeys((key) => {
    if (key === 'Enter') {
      onNext()
      return true
    }
  })
  return (
    <div className={`fixed inset-x-0 bottom-0 z-20 border-t-2 ${ok ? 'border-lime-300 bg-lime-100' : 'border-amber-300 bg-amber-50'}`}>
      <div className="mx-auto max-w-xl px-4 py-5">
        <p className={`text-xl font-extrabold ${ok ? 'text-lime-700' : 'text-amber-700'}`}>
          {ok ? '✅ ' : '💡 '}
          {feedback.title}
        </p>
        <p className={`mt-1 ${ok ? 'text-lime-800' : 'text-amber-800'}`}>{feedback.detail}</p>
        {feedback.extra && <div className="text-amber-800">{feedback.extra}</div>}
        {feedback.retry && <p className="mt-1 text-sm text-amber-700">You will see this one again at the end.</p>}
        <Button className="mt-4 w-full" variant={ok ? 'primary' : 'secondary'} onClick={onNext} autoFocus>
          Continue
        </Button>
      </div>
    </div>
  )
}

function MuteButton() {
  const muted = useMuted()
  return (
    <button
      type="button"
      onClick={() => {
        setMuted(!muted)
        if (muted) play('tap')
      }}
      className="text-xl text-slate-400 hover:text-slate-600"
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      title={muted ? 'Turn sound on' : 'Turn sound off'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}

/** Keyboard tip, only on screens wide enough to likely have a keyboard. */
function KeyHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 hidden text-center text-xs font-bold text-slate-400 sm:block">{children}</p>
}
