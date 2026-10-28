import { useState } from 'react'
import { USE_SERVER, api } from '../api'
import { Button, Card, Screen } from '../components/ui'
import { setPreviewMode, usePreviewMode } from '../prefs'
import { deleteAllSessions, download, loadAllSessions, sessionsToCsv } from '../storage'
import type { SessionRecord } from '../types'

// Researcher view at #admin. "Database" shows every participant saved to MongoDB;
// "This browser" shows sessions kept in this device's local storage.
export function Admin() {
  const [source, setSource] = useState<'server' | 'local'>(USE_SERVER ? 'server' : 'local')
  const [key, setKey] = useState('')
  const [serverSessions, setServerSessions] = useState<SessionRecord[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [localSessions, setLocalSessions] = useState(loadAllSessions)

  const [showTest, setShowTest] = useState(false)
  const preview = usePreviewMode()

  const all = source === 'server' ? (serverSessions ?? []) : localSessions
  const testCount = all.filter(isTest).length
  const sessions = showTest ? all : all.filter((s) => !isTest(s))
  // Preview mode is only offered once the admin key has been accepted (or there is no server).
  const unlocked = !USE_SERVER || serverSessions !== null
  const finished = sessions.filter((s) => s.survey)
  const stamp = new Date().toISOString().slice(0, 10)

  function loadServer() {
    setError(null)
    api
      .adminSessions(key)
      .then((r) => setServerSessions(r.sessions))
      .catch((e: Error) => setError(e.message))
  }

  return (
    <Screen>
      <h1 className="mb-4 text-2xl font-extrabold">Researcher data</h1>

      <div className={`mb-6 flex gap-2 ${USE_SERVER ? '' : 'hidden'}`}>
        {(['server', 'local'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSource(s)}
            className={`flex-1 rounded-2xl border-2 border-b-4 py-2 font-bold ${source === s ? 'border-sky-400 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white'}`}
          >
            {s === 'server' ? 'Database' : 'This browser'}
          </button>
        ))}
      </div>

      {source === 'server' && serverSessions === null ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            loadServer()
          }}
        >
          <label className="block">
            <span className="mb-1 block font-bold">Admin key</span>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 outline-none focus:border-sky-400"
              placeholder="Enter admin key"
            />
          </label>
          {error && <p className="text-sm font-bold text-rose-600">{error}</p>}
          <Button className="w-full" disabled={!key}>
            Load participants
          </Button>
        </form>
      ) : (
        <>
          <p className="mb-4 text-slate-500">
            {source === 'server'
              ? 'Every participant session saved to MongoDB, from any device.'
              : USE_SERVER
                ? 'Sessions saved in this browser only. Use this if the server was unreachable during a session.'
                : 'Sessions saved in this browser only. Run participants on this device, or export after each one.'}
          </p>

          {unlocked && (
            <Card className="mb-4 flex items-center justify-between gap-4 p-4">
              <div>
                <div className="font-extrabold">Preview mode</div>
                <p className="text-sm text-slate-500">
                  Unlock every lesson and the survey on this device. Sessions used while it is on are marked as test data.
                </p>
              </div>
              <Button variant={preview ? 'primary' : 'secondary'} className="whitespace-nowrap" onClick={() => setPreviewMode(!preview)}>
                {preview ? 'On' : 'Off'}
              </Button>
            </Card>
          )}

          {testCount > 0 && (
            <label className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-600">
              <input type="checkbox" checked={showTest} onChange={(e) => setShowTest(e.target.checked)} className="h-4 w-4 accent-sky-500" />
              Include {testCount} test sessions (seeded samples and previews) in the counts and downloads
            </label>
          )}

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
            <Button disabled={!sessions.length} onClick={() => download(`macroquest-${source}-${stamp}.csv`, sessionsToCsv(sessions), 'text/csv')}>
              Download CSV
            </Button>
            <Button
              variant="secondary"
              disabled={!sessions.length}
              onClick={() => download(`macroquest-${source}-${stamp}.json`, JSON.stringify(sessions, null, 2), 'application/json')}
            >
              Download JSON
            </Button>
            {source === 'server' ? (
              <Button variant="secondary" onClick={loadServer}>
                Refresh
              </Button>
            ) : (
              <Button
                variant="danger"
                disabled={!sessions.length}
                onClick={() => {
                  if (confirm(`Delete all ${sessions.length} sessions from this browser? Download them first.`)) {
                    deleteAllSessions()
                    setLocalSessions([])
                  }
                }}
              >
                Delete all
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {[...sessions].reverse().map((s) => (
              <Card key={s.id} className="flex items-center justify-between gap-2 p-3 text-sm">
                <span className="font-mono font-bold">
                  {s.participantCode}
                  {isTest(s) && (
                    <span className="ml-1 rounded bg-amber-100 px-1 text-xs text-amber-700">{s.preview ? 'preview' : 'sample'}</span>
                  )}
                </span>
                <span>{s.goal ?? '—'}</span>
                <span>
                  {s.lessons.length} lessons{s.endedEarly && ' (ended early)'}
                </span>
                <span>{s.survey ? `NPS ${s.survey.nps}` : 'no survey'}</span>
                <span className="text-slate-400">{new Date(s.startedAt).toLocaleString()}</span>
              </Card>
            ))}
          </div>
        </>
      )}

      <a href="#" className="mt-8 font-bold text-sky-600 underline">
        Back to the app
      </a>
    </Screen>
  )
}

/** Not a real participant: added by server/seed.ts or used in preview mode. */
function isTest(s: SessionRecord) {
  return s.id.startsWith('sample-') || !!s.preview
}
