import { useState } from 'react'
import { Button, Card, Mascot, Screen } from '../components/ui'
import { EXPERIENCE_OPTIONS } from '../content/survey'
import type { Experience } from '../types'

interface Props {
  onStart: (experience: Experience) => void
  onIneligible: () => void
}

export function Welcome({ onStart, onIneligible }: Props) {
  const [step, setStep] = useState<'intro' | 'consent' | 'experience'>('intro')
  const [adult, setAdult] = useState(false)
  const [readInfo, setReadInfo] = useState(false)
  const [noEd, setNoEd] = useState<boolean | null>(null)
  const [experience, setExperience] = useState<Experience | null>(null)

  if (step === 'intro') {
    return (
      <Screen>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Mascot size="text-8xl" />
          <h1 className="text-4xl font-extrabold text-lime-600">MacroQuest</h1>
          <p className="max-w-sm text-lg text-slate-600">
            Learn how to track calories and macros, one bite-sized lesson at a time.
          </p>
          <Button className="w-full max-w-xs" onClick={() => setStep('consent')}>
            Get started
          </Button>
        </div>
      </Screen>
    )
  }

  if (step === 'consent') {
    const canContinue = adult && readInfo && noEd !== null
    return (
      <Screen>
        <h1 className="mb-4 text-2xl font-extrabold">About this study</h1>
        <Card className="space-y-3 text-slate-600">
          <p>
            This app is part of a COMP903 research project on teaching calorie and macronutrient tracking. You will
            complete a set of short lessons (about 10 to 15 minutes), then answer one short survey.
          </p>
          <p>
            Taking part is voluntary and anonymous. We do not collect your name or email. You can stop at any time by
            closing the page. At the end you will get a short code you can quote if you want your answers withdrawn.
          </p>
          <p>
            The app teaches flexible, goal-based tracking. It never rewards eating less, and your own food intake is not
            recorded.
          </p>
        </Card>

        <div className="mt-5 space-y-3">
          <Check checked={readInfo} onChange={setReadInfo}>I have read the information above and agree to take part.</Check>
          <Check checked={adult} onChange={setAdult}>I am 18 years or older.</Check>
          <Card className="space-y-3 p-4">
            <p className="font-bold">Do you have a current or past eating disorder?</p>
            <div className="flex gap-2">
              <Choice selected={noEd === false} onClick={() => setNoEd(false)}>Yes</Choice>
              <Choice selected={noEd === true} onClick={() => setNoEd(true)}>No</Choice>
            </div>
          </Card>
        </div>

        <div className="mt-auto pt-6">
          <Button
            className="w-full"
            disabled={!canContinue}
            onClick={() => (noEd ? setStep('experience') : onIneligible())}
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

export function Ineligible() {
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <Mascot size="text-7xl" />
        <h1 className="text-2xl font-extrabold">Thank you for your honesty</h1>
        <p className="max-w-sm text-slate-600">
          To keep everyone safe, this study is not able to include people with a current or past eating disorder. No
          data has been recorded.
        </p>
        <p className="max-w-sm text-slate-600">
          If you would like support, Eating Disorders Association of New Zealand (EDANZ) is at{' '}
          <a className="font-bold text-sky-600 underline" href="https://www.ed.org.nz" target="_blank" rel="noreferrer">
            ed.org.nz
          </a>
          , or you can talk to your GP.
        </p>
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
      className={`rounded-2xl border-2 border-b-4 px-4 py-3 text-left font-bold transition ${block ? 'w-full' : 'flex-1 text-center'} ${
        selected ? 'border-sky-400 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  )
}
