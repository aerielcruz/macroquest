import { useState } from 'react'
import { Button, Card, Screen } from '../components/ui'
import { deleteAllSessions, download, loadAllSessions, sessionsToCsv } from '../storage'

// Researcher view at #admin. Lists sessions stored in this browser and exports them.
export function Admin() {
  const [sessions, setSessions] = useState(loadAllSessions)
  const finished = sessions.filter((s) => s.survey)
  const stamp = new Date().toISOString().slice(0, 10)

  return (
    <Screen>
      <h1 className="mb-1 text-2xl font-extrabold">Researcher data</h1>
      <p className="mb-6 text-slate-500">
        Sessions saved in this browser only. Export after each participant if they used a different device.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="text-3xl font-extrabold">{finished.length}</div>
          <div className="text-sm font-bold text-slate-400">Completed surveys</div>
        </Card>
        <Card className="p-4">
          <div className="text-3xl font-extrabold">{sessions.length - finished.length}</div>
          <div className="text-sm font-bold text-slate-400">Unfinished sessions</div>
        </Card>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Button disabled={!sessions.length} onClick={() => download(`macroquest-${stamp}.csv`, sessionsToCsv(sessions), 'text/csv')}>
          Download CSV
        </Button>
        <Button
          variant="secondary"
          disabled={!sessions.length}
          onClick={() => download(`macroquest-${stamp}.json`, JSON.stringify(sessions, null, 2), 'application/json')}
        >
          Download JSON
        </Button>
        <Button
          variant="danger"
          disabled={!sessions.length}
          onClick={() => {
            if (confirm(`Delete all ${sessions.length} sessions from this browser? Download them first.`)) {
              deleteAllSessions()
              setSessions([])
            }
          }}
        >
          Delete all
        </Button>
      </div>

      <div className="space-y-2">
        {[...sessions].reverse().map((s) => (
          <Card key={s.id} className="flex items-center justify-between p-3 text-sm">
            <span className="font-mono font-bold">{s.participantCode}</span>
            <span>{s.goal ?? '—'}</span>
            <span>{s.lessons.length} lessons</span>
            <span>{s.survey ? `NPS ${s.survey.nps}` : 'no survey'}</span>
            <span className="text-slate-400">{new Date(s.startedAt).toLocaleString()}</span>
          </Card>
        ))}
      </div>

      <a href="#" className="mt-8 font-bold text-sky-600 underline">
        Back to the app
      </a>
    </Screen>
  )
}
