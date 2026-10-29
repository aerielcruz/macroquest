import { useState, type ReactNode } from 'react'
import { AboutStudy } from '../components/AboutStudy'
import { Button, Card, Mascot, Screen } from '../components/ui'
import { USE_SERVER } from '../api'
import { EXPERIENCE_OPTIONS } from '../content/survey'
import type { Experience } from '../types'

interface Props {
  onStart: (experience: Experience) => void
  /** Shown on the first screen so returning users can sign in and resume. */
  signIn?: ReactNode
}

export function Welcome({ onStart, signIn }: Props) {
  const [step, setStep] = useState<'intro' | 'consent' | 'experience'>('intro')
  const [aboutOpen, setAboutOpen] = useState(false)
  const [adult, setAdult] = useState(false)
  const [readInfo, setReadInfo] = useState(false)
  const [experience, setExperience] = useState<Experience | null>(null)

  if (step === 'intro') {
    return (
      <Screen>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <img src="/logo.svg" alt="" className="h-32 w-32" />
          <h1 className="text-4xl font-extrabold text-lime-600">MacroQuest</h1>
          <p className="max-w-sm text-lg text-slate-600">
            Learn how to track calories and macros, one bite-sized lesson at a time.
          </p>
          <Button className="w-full max-w-xs" onClick={() => setStep('consent')}>
            Get started
          </Button>
          <button type="button" onClick={() => setAboutOpen(true)} className="text-sm font-extrabold text-sky-600 hover:text-sky-700 hover:underline">
            Learn more about this study
          </button>
          {signIn && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-bold text-slate-500">Already started on another device?</p>
              {signIn}
            </div>
          )}
        </div>
        {aboutOpen && <AboutStudy onClose={() => setAboutOpen(false)} />}
      </Screen>
    )
  }

  if (step === 'consent') {
    const canContinue = adult && readInfo
    return (
      <Screen>
        <h1 className="mb-4 text-2xl font-extrabold">About this study</h1>
        <Card className="space-y-3 text-slate-600">
          <p>
            This app is part of a research project by Aeriel Cruz, conducted as part of a Master of Information Technology
            specialisation in Software Development course. The project explores how gamified lessons can help people understand calorie
            and macronutrient tracking.
          </p>
          <p>
            You will complete a set of short lessons (approximately 10–15 minutes in total), followed by a short survey.
          </p>
          <p>
            Taking part is voluntary and anonymous. We will not ask for your name or email address. You can stop participating at
            any time by closing the page. A participant code will be displayed on the lesson screen, which you can use if you wish
            to request the withdrawal of your answers.
          </p>
          <p>
            If thinking about food or tracking feels stressful, you can stop at any time. You can also talk to your doctor or GP if you need support.
          </p>
          <p>
            Your progress is saved in your browser
            {USE_SERVER ? ', and your survey responses are stored anonymously in the research database.' : '.'}
          </p>
          <p>
            The app teaches flexible, goal-based tracking. It does not reward eating less, and it does not record your personal
            food intake.
          </p>
        </Card>

        <div className="mt-5 space-y-3">
          <Check checked={readInfo} onChange={setReadInfo}>I have read the information above and agree to take part.</Check>
          <Check checked={adult} onChange={setAdult}>I am 18 years or older.</Check>
        </div>

        <div className="mt-auto pt-6">
          <Button
            className="w-full"
            disabled={!canContinue}
            onClick={() => setStep('experience')}
          >
            Continue
          </Button>
        </div>
      </Screen>
    )
  }

  return (
    <Screen>
      <div className="mb-6 flex items-center gap-4">
        <Mascot mood="think" size="text-5xl" />
        <h1 className="text-2xl font-extrabold">How much tracking have you done before?</h1>
      </div>
      <div className="space-y-3">
        {EXPERIENCE_OPTIONS.map((o) => (
          <Choice key={o.value} selected={experience === o.value} onClick={() => setExperience(o.value)} block>
            {o.label}
          </Choice>
        ))}
      </div>
      <div className="mt-auto pt-6">
        <Button className="w-full" disabled={!experience} onClick={() => experience && onStart(experience)}>
          Continue
        </Button>
      </div>
    </Screen>
  )
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4">
      <input type="checkbox" className="mt-1 h-5 w-5 accent-lime-500" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  )
}

export function Choice({
  selected,
  onClick,
  children,
  block,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  block?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border-2 border-b-4 px-4 py-3 text-left font-bold transition ${block ? 'w-full' : 'flex-1 text-center'} ${selected ? 'border-sky-400 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white hover:bg-slate-50'
        }`}
    >
      {children}
    </button>
  )
}
