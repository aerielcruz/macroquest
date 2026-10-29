import { useMemo, useRef, useState } from 'react'
import { Calculator, CalculatorIcon } from '../components/Calculator'
import { Tour, type TourStep } from '../components/Tour'
import { Button, Card, ConfirmDialog, Mascot, ProgressBar, Screen, TextSizeButton } from '../components/ui'
import { FOODS, foodEmoji } from '../content/foods'
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
import type { LessonResult, Lesson, LogQuestion, LogTaskResult, Macros, McqQuestion, NumericQuestion, Question } from '../types'
import { Choice } from './Welcome'

interface Props {
  lesson: Lesson
  /** The lesson was finished before: no XP, and the tips can be skipped. */
  replay?: boolean
  onExit: () => void
  onComplete: (result: LessonResult, logTasks: LogTaskResult[]) => void
}

const TOUR: TourStep[] = [
  { target: 'progress', text: 'This bar fills up as you work through the lesson.' },
  { target: 'calculator', text: 'Need to do some maths? Open the calculator here.' },
  { target: 'text-size', text: 'Make the text bigger or smaller.' },
  { target: 'sound', text: 'Turn sound effects and vibration on or off.' },
  { target: 'quit', text: 'Tap ✕ to leave the lesson. Lessons you have finished stay saved.' },
]

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
  const [calcOpen, setCalcOpen] = useState(false)
  const [calcOpens, setCalcOpens] = useState(0)
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
    } else {
      play('next')
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
        calculatorOpens: calcOpens,
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
        <button
          type="button"
          onClick={requestQuit}
          className="text-2xl font-bold text-slate-400 hover:text-slate-600"
          aria-label="Quit lesson"
          data-tour="quit"
        >
          ✕
        </button>
        <div className="flex-1" data-tour="progress">
          <ProgressBar value={progress} />
        </div>
        {combo >= 2 && <span className="whitespace-nowrap text-sm font-extrabold text-orange-500">🔥 {combo} in a row</span>}
        <button
          type="button"
          onClick={() => {
            if (!calcOpen) setCalcOpens((n) => n + 1)
            setCalcOpen(!calcOpen)
          }}
          className={`shrink-0 rounded-lg p-0.5 transition ${calcOpen ? 'bg-lime-100 opacity-100' : 'opacity-60 hover:opacity-100'}`}
          aria-label={calcOpen ? 'Close calculator' : 'Open calculator'}
          aria-pressed={calcOpen}
          title="Calculator"
          data-tour="calculator"
        >
          <CalculatorIcon />
        </button>
        <TextSizeButton />
        <MuteButton />
      </div>

      {inCards ? (
        <TeachCard
          key={cardIndex}
          card={lesson.cards[cardIndex]}
          step={cardIndex + 1}
          of={lesson.cards.length}
          onNext={() => {
            play('next')
            setCardIndex((i) => i + 1)
          }}
          onSkip={
            replay
              ? () => {
                  play('next')
                  setCardIndex(lesson.cards.length)
                }
              : undefined
          }
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
      {calcOpen && <Calculator onClose={() => setCalcOpen(false)} />}
      <Tour name="lesson" steps={TOUR} />
      {confirmQuit && (
        <ConfirmDialog
          title="Quit this lesson?"
          confirmLabel="Quit"
          cancelLabel="Keep learning"
          danger
          onConfirm={onExit}
          onCancel={() => setConfirmQuit(false)}
        >
          Your answers in this lesson will be lost. Lessons you have already finished stay saved.
        </ConfirmDialog>
      )}
    </Screen>
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

  // The input handles its own Enter; this covers Enter after clicking elsewhere on the page.
  useHotkeys((key) => {
    if (key === 'Enter' && !locked && !Number.isNaN(n)) {
      submit()
      return true
    }
  })

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

  useHotkeys((key) => {
    if (key === 'Enter' && !locked && complete) {
      submit()
      return true
    }
  })

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

  function pickFood(i: number, id: string) {
    if (locked) return
    play('tap')
    setFoods((fs) => fs.map((x, j) => (j === i ? id : x)))
  }

  return (
    <>
      {question.image && <Illustration id={question.image} className="mb-4" />}
      <h2 className="mb-1 text-xl font-extrabold">{question.prompt}</h2>
      <p className="mb-4 text-slate-500">For each food, pick the matching database entry and enter how much you ate.</p>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-3xl bg-slate-800 px-4 py-3 text-white">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-300">Food diary · Today</div>
            <div className="text-lg font-extrabold">{question.meal}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold leading-none">{Math.round(logged.kcal)}</div>
            <div className="text-xs font-bold text-slate-300">kcal</div>
          </div>
        </div>

        {question.items.map((item, i) => {
          const chosen = foods[i] ? FOODS[foods[i]] : null
          const g = parseFloat(grams[i]) || 0
          const entryKcal = chosen && g > 0 ? Math.round((chosen.kcal * g) / 100) : null
          const inputId = `${question.id}-grams-${i}`
          return (
            <div key={i} className="rounded-3xl border-2 border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl" aria-hidden>
                  {foodEmoji(item.foodId)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-snug">{item.description}</p>
                  <p className={`text-xs font-bold ${entryKcal !== null ? 'text-lime-600' : 'text-slate-400'}`}>
                    {entryKcal !== null ? `✓ Logged · ${entryKcal} kcal` : 'Not logged yet'}
                  </p>
                </div>
              </div>

              <div className="mt-3 overflow-hidden rounded-2xl border-2 border-slate-200">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 text-sm">
                  <span aria-hidden>🔍</span>
                  <span className="font-bold text-slate-600">Database results</span>
                  <span className="ml-auto text-xs font-bold text-slate-400">
                    {item.choices.length} {item.choices.length === 1 ? 'result' : 'results'}
                  </span>
                </div>
                <div role="radiogroup" aria-label={`Database entry for ${item.description}`}>
                  {item.choices.map((id) => {
                    const f = FOODS[id]
                    const selected = foods[i] === id
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={locked}
                        onClick={() => pickFood(i, id)}
                        className={`flex w-full items-center gap-3 border-t-2 border-slate-100 px-3 py-2.5 text-left transition ${
                          selected ? 'bg-sky-50' : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <RadioDot checked={selected} />
                        <span className="min-w-0 flex-1">
                          <span className={`block font-bold ${selected ? 'text-sky-700' : ''}`}>{f.name}</span>
                          <span className="text-xs font-semibold text-slate-500">
                            100 g · P {f.protein} g · C {f.carbs} g · F {f.fat} g
                          </span>
                        </span>
                        <span className="text-right">
                          <span className="block font-extrabold">{f.kcal}</span>
                          <span className="text-xs font-bold text-slate-400">kcal</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <label htmlFor={inputId} className="text-sm font-bold text-slate-600">
                  How many grams?
                </label>
                <span className="flex items-center rounded-xl border-2 border-slate-300 bg-white focus-within:border-sky-400">
                  <input
                    id={inputId}
                    inputMode="decimal"
                    disabled={locked}
                    value={grams[i]}
                    onChange={(e) => setGrams((gs) => gs.map((x, j) => (j === i ? e.target.value : x)))}
                    onKeyDown={(e) => e.key === 'Enter' && complete && !locked && submit()}
                    className="w-20 bg-transparent px-3 py-2 font-bold outline-none"
                    placeholder="0"
                  />
                  <span className="pr-3 font-bold text-slate-400">g</span>
                </span>
              </div>
            </div>
          )
        })}

        <MacroTotals macros={logged} />
      </div>

      {!locked && (
        <div className="pt-6 pb-40">
          <Button className="w-full" disabled={!complete} onClick={submit}>
            Check my log
          </Button>
          <KeyHint>Enter to check once every food has an entry and a weight</KeyHint>
        </div>
      )}
      {locked && <div className="pb-48" />}
    </>
  )
}

/** Radio-style circle so a list of options reads as "pick one". */
function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${checked ? 'border-sky-500' : 'border-slate-300 bg-white'}`}
    >
      {checked && <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />}
    </span>
  )
}

const MACRO_STYLE = [
  { key: 'protein', label: 'Protein', kcalPerG: 4, bar: 'bg-rose-500', text: 'text-rose-600' },
  { key: 'carbs', label: 'Carbs', kcalPerG: 4, bar: 'bg-amber-500', text: 'text-amber-600' },
  { key: 'fat', label: 'Fat', kcalPerG: 9, bar: 'bg-sky-500', text: 'text-sky-600' },
] as const

/** Diary footer: grams of each macro and a bar showing their share of the calories. */
function MacroTotals({ macros }: { macros: Macros }) {
  const kcal = MACRO_STYLE.map((m) => macros[m.key] * m.kcalPerG)
  const total = kcal.reduce((a, b) => a + b, 0)
  return (
    <div className="rounded-3xl border-2 border-slate-200 bg-white px-4 py-3">
      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Meal totals</div>
      <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-slate-200">
        {total > 0 && MACRO_STYLE.map((m, i) => <div key={m.key} className={m.bar} style={{ width: `${(kcal[i] / total) * 100}%` }} />)}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {MACRO_STYLE.map((m, i) => (
          <div key={m.key}>
            <div className={`text-xs font-extrabold ${m.text}`}>{m.label}</div>
            <div className="font-extrabold">
              {Math.round(macros[m.key])} g
              {total > 0 && <span className="ml-1 text-xs font-bold text-slate-400">{Math.round((kcal[i] / total) * 100)}%</span>}
            </div>
          </div>
        ))}
      </div>
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
      data-tour="sound"
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
