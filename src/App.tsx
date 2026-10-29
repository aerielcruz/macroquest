import { useCallback, useEffect, useMemo, useState } from 'react'
import { USE_SERVER, api, type User } from './api'
import { AccountChip } from './components/Account'
import { GoogleButton } from './components/GoogleButton'
import { lessonsForGoal } from './content/lessons'
import { Admin } from './screens/Admin'
import { Done } from './screens/Done'
import { GoalPick } from './screens/GoalPick'
import { LessonPath } from './screens/LessonPath'
import { LessonPlayer } from './screens/LessonPlayer'
import { Survey } from './screens/Survey'
import { Welcome } from './screens/Welcome'
import { usePreviewMode } from './prefs'
import { clearCurrent, loadAllSessions, loadCurrentId, newId, newParticipantCode, saveSession } from './storage'
import type { SessionRecord } from './types'

type View = { name: 'welcome' } | { name: 'path' } | { name: 'lesson'; id: string } | { name: 'survey' } | { name: 'done' }

function resume(): SessionRecord | null {
  const id = loadCurrentId()
  return id ? (loadAllSessions().find((s) => s.id === id) ?? null) : null
}

/** Keeps whichever copy of an unfinished session is further along. */
function pickNewer(local: SessionRecord | null, remote: SessionRecord | null) {
  if (!remote || remote.finishedAt) return local
  if (!local) return remote
  return remote.lessons.length >= local.lessons.length ? remote : local
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash)
  const [session, setSession] = useState<SessionRecord | null>(resume)
  const [view, setView] = useState<View>(() => (session ? { name: 'path' } : { name: 'welcome' }))
  const [user, setUser] = useState<User | null>(null)
  const [googleClientId, setGoogleClientId] = useState<string | null>(null)
  const [syncError, setSyncError] = useState(false)
  const preview = usePreviewMode()

  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // The app works without the server; these just stay empty if it is unreachable.
  useEffect(() => {
    if (!USE_SERVER) return
    api.config().then((c) => setGoogleClientId(c.googleClientId)).catch(() => {})
    api.me().then((r) => setUser(r.user)).catch(() => {})
  }, [])

  // When someone signs in, merge their saved progress with what is on this device.
  useEffect(() => {
    if (!user) return
    api
      .getProgress()
      .then(({ session: remote }) => {
        setSession((local) => {
          const chosen = pickNewer(local, remote)
          if (chosen && chosen !== local) setView({ name: 'path' })
          return chosen
        })
      })
      .catch(() => setSyncError(true))
  }, [user])

  // Save on every change: always locally, plus the anonymous study record and the user's progress.
  useEffect(() => {
    if (!session) return
    saveSession(session)
    if (!USE_SERVER) return
    const jobs = [api.putStudy(session)]
    if (user) jobs.push(api.putProgress(session))
    Promise.all(jobs)
      .then(() => setSyncError(false))
      .catch(() => setSyncError(true))
  }, [session, user])

  // Anything done in preview mode is test data, so tag the session before it is saved again.
  useEffect(() => {
    if (preview && session && !session.preview) setSession({ ...session, preview: true })
  }, [preview, session])

  const signIn = useCallback((credential: string) => {
    api
      .signInWithGoogle(credential)
      .then((r) => setUser(r.user))
      .catch(() => alert('Sorry, Google sign-in did not work. Your progress is still saved on this device.'))
  }, [])

  const signOut = useCallback(() => {
    api.signOut().catch(() => {})
    // Clear this device so the next person on a shared computer starts fresh.
    clearCurrent()
    setUser(null)
    setSession(null)
    setView({ name: 'welcome' })
  }, [])

  /** Leaves the current session (kept, but flagged as restarted) and goes back to the welcome screen. */
  function startOver() {
    if (session) {
      const abandoned = { ...session, restarted: true }
      saveSession(abandoned)
      if (USE_SERVER) {
        api.putStudy(abandoned).catch(() => {})
        // Otherwise signing in would bring the old progress straight back.
        if (user) api.deleteProgress().catch(() => {})
      }
    }
    clearCurrent()
    setSession(null)
    setView({ name: 'welcome' })
  }

  const lessons = useMemo(() => (session?.goal ? lessonsForGoal(session.goal) : []), [session?.goal])
  const completed = useMemo(() => new Set(session?.lessons.map((l) => l.lessonId)), [session?.lessons])

  if (hash === '#admin') return <Admin />

  const account = (
    <AccountChip user={user} googleClientId={googleClientId} syncError={syncError} onCredential={signIn} onSignOut={signOut} />
  )

  switch (view.name) {
    case 'welcome':
      return (
        <Welcome
          signIn={!user && googleClientId ? <GoogleButton clientId={googleClientId} onCredential={signIn} /> : undefined}
          onStart={(experience) => {
            const now = new Date().toISOString()
            setSession({
              id: newId(),
              participantCode: newParticipantCode(),
              startedAt: now,
              consentAt: now,
              experience,
              xp: 0,
              lessons: [],
              logTasks: [],
              ...(preview && { preview: true }),
            })
            setView({ name: 'path' })
          }}
        />
      )
    case 'path':
      if (!session) return null
      if (!session.goal) return <GoalPick onPick={(goal) => setSession({ ...session, goal })} />
      return (
        <LessonPath
          lessons={lessons}
          completed={completed}
          xp={session.xp}
          goal={session.goal}
          participantCode={session.participantCode}
          onStartOver={startOver}
          account={account}
          onOpen={(id) => setView({ name: 'lesson', id })}
          onSurvey={() => setView({ name: 'survey' })}
          endedEarly={!!session.endedEarly}
          onFinishEarly={() => {
            setSession({ ...session, endedEarly: true })
            setView({ name: 'survey' })
          }}
        />
      )
    case 'lesson': {
      const lesson = lessons.find((l) => l.id === view.id)
      if (!session || !lesson) return null
      return (
        <LessonPlayer
          lesson={lesson}
          replay={completed.has(lesson.id)}
          onExit={() => setView({ name: 'path' })}
          onComplete={(result, logTasks) => {
            const already = completed.has(lesson.id)
            setSession({
              ...session,
              xp: already ? session.xp : session.xp + result.xpEarned,
              lessons: already ? session.lessons : [...session.lessons, result],
              logTasks: already ? session.logTasks : [...session.logTasks, ...logTasks],
            })
            setView({ name: 'path' })
          }}
        />
      )
    }
    case 'survey':
      if (!session) return null
      return (
        <Survey
          sessionId={session.id}
          onSubmit={(survey) => {
            setSession({ ...session, survey, finishedAt: survey.submittedAt })
            setView({ name: 'done' })
          }}
          onBack={() => {
            // Going back to keep learning undoes "Finish early"; they can choose it again later.
            if (session.endedEarly) setSession({ ...session, endedEarly: false })
            setView({ name: 'path' })
          }}
        />
      )
    case 'done':
      if (!session) return null
      return (
        <Done
          session={session}
          onRestart={() => {
            clearCurrent()
            setSession(null)
            setView({ name: 'welcome' })
          }}
        />
      )
  }
}
