import { useState } from 'react'
import { Button, Card, Mascot, ProgressBar, Screen } from '../components/ui'
import { LIKERT_LABELS, NPS_QUESTION, RETRO_ITEMS, SATISFACTION_ITEMS } from '../content/survey'
import type { RetroAnswer, SurveyResponse } from '../types'

const RETRO_IDS = RETRO_ITEMS.flatMap((g) => g.items.map((i) => i.id))

export function Survey({ onSubmit }: { onSubmit: (r: SurveyResponse) => void }) {
  const [page, setPage] = useState(0)
  const [retro, setRetro] = useState<Record<string, Partial<RetroAnswer>>>({})
  const [sat, setSat] = useState<Record<string, number>>({})
  const [nps, setNps] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [comments, setComments] = useState('')

  const retroDone = RETRO_IDS.every((id) => retro[id]?.before && retro[id]?.after)
  const satDone = SATISFACTION_ITEMS.every((i) => sat[i.id])
  const pages = 3

  function setRetroValue(id: string, which: keyof RetroAnswer, v: number) {
    setRetro((r) => ({ ...r, [id]: { ...r[id], [which]: v } }))
  }

  function go(p: number) {
    setPage(p)
    window.scrollTo({ top: 0 })
  }

  return (
    <Screen>
      <ProgressBar value={(page + 1) / pages} className="mb-6" />

      {page === 0 && (
        <>
          <Intro title="Before and after">
            For each statement, rate how much you agreed <b>before</b> using the app, then how much you agree <b>now</b>.
            There are no right answers, so please be honest.
          </Intro>
          {RETRO_ITEMS.map((group) => (
            <section key={group.hypothesis} className="mb-6 space-y-4">
              <h2 className="text-lg font-extrabold text-slate-500">{group.heading}</h2>
              {group.items.map((item) => (
                <Card key={item.id} className="space-y-4 p-4">
                  <p className="font-bold">{item.text}</p>
                  <LikertRow label="Before" value={retro[item.id]?.before} onChange={(v) => setRetroValue(item.id, 'before', v)} />
                  <LikertRow label="Now" value={retro[item.id]?.after} onChange={(v) => setRetroValue(item.id, 'after', v)} />
                </Card>
              ))}
            </section>
          ))}
          <Button className="w-full" disabled={!retroDone} onClick={() => go(1)}>
            Next
          </Button>
        </>
      )}

      {page === 1 && (
        <>
          <Intro title="Your experience">How much do you agree with each statement about the app?</Intro>
          <div className="mb-6 space-y-4">
            {SATISFACTION_ITEMS.map((item) => (
              <Card key={item.id} className="space-y-3 p-4">
                <p className="font-bold">{item.text}</p>
                <LikertRow value={sat[item.id]} onChange={(v) => setSat((s) => ({ ...s, [item.id]: v }))} />
              </Card>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => go(0)}>
              Back
            </Button>
            <Button className="flex-1" disabled={!satDone} onClick={() => go(2)}>
              Next
            </Button>
          </div>
        </>
      )}

      {page === 2 && (
        <>
          <Intro title="Last one!">{NPS_QUESTION}</Intro>
          <Card className="mb-4 p-4">
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
              {Array.from({ length: 11 }, (_, n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNps(n)}
                  className={`h-11 rounded-xl border-2 border-b-4 font-extrabold transition ${
                    nps === n ? 'border-sky-400 bg-sky-100 text-sky-700' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs font-bold text-slate-400">
              <span>0 = Not at all likely</span>
              <span>10 = Extremely likely</span>
            </div>
          </Card>
          <label className="mb-4 block">
            <span className="mb-2 block font-bold">What is the main reason for your score?</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border-2 border-slate-300 bg-white p-3 outline-none focus:border-sky-400"
            />
          </label>
          <label className="mb-6 block">
            <span className="mb-2 block font-bold">Anything else you would like to tell us? (optional)</span>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border-2 border-slate-300 bg-white p-3 outline-none focus:border-sky-400"
            />
          </label>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => go(1)}>
              Back
            </Button>
            <Button
              className="flex-1"
              disabled={nps === null}
              onClick={() =>
                nps !== null &&
                onSubmit({
                  retro: Object.fromEntries(RETRO_IDS.map((id) => [id, retro[id] as RetroAnswer])),
                  satisfaction: sat,
                  nps,
                  npsReason: reason.trim(),
                  comments: comments.trim(),
                  submittedAt: new Date().toISOString(),
                })
              }
            >
              Submit
            </Button>
          </div>
        </>
      )}
    </Screen>
  )
}

function Intro({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <Mascot mood="think" size="text-5xl" />
      <div>
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <p className="text-slate-600">{children}</p>
      </div>
    </div>
  )
}

function LikertRow({ label, value, onChange }: { label?: string; value?: number; onChange: (v: number) => void }) {
  return (
    <div>
      {label && <div className="mb-1 text-xs font-extrabold uppercase text-slate-400">{label}</div>}
      <div className="grid grid-cols-5 gap-1.5">
        {LIKERT_LABELS.map((l, i) => {
          const v = i + 1
          return (
            <button
              key={v}
              type="button"
              title={l}
              onClick={() => onChange(v)}
              className={`rounded-xl border-2 border-b-4 px-1 py-2 text-[11px] font-bold leading-tight transition ${
                value === v ? 'border-sky-400 bg-sky-100 text-sky-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="block text-base font-extrabold">{v}</span>
              {l}
            </button>
          )
        })}
      </div>
    </div>
  )
}
