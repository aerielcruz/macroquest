import { Button, Card, Mascot, Screen } from '../components/ui'
import { levelFor } from '../scoring'
import type { SessionRecord } from '../types'

export function Done({ session, onRestart }: { session: SessionRecord; onRestart: () => void }) {
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <Mascot mood="cheer" size="text-8xl" />
        <h1 className="text-3xl font-extrabold text-lime-600">Thank you!</h1>
        <p className="max-w-sm text-slate-600">
          Your answers have been saved. You reached <b>level {levelFor(session.xp)}</b> with <b>{session.xp} XP</b>.
        </p>
        <Card className="w-full max-w-sm">
          <p className="text-sm font-bold uppercase text-slate-400">Your participant code</p>
          <p className="mt-1 font-mono text-3xl font-extrabold tracking-widest">{session.participantCode}</p>
          <p className="mt-2 text-sm text-slate-500">Keep this code if you ever want your answers withdrawn from the study.</p>
        </Card>
      </div>
      <Button variant="ghost" onClick={onRestart}>
        Start a new participant session
      </Button>
    </Screen>
  )
}
