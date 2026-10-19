import { useEffect, useMemo, useState } from 'react'
import { lessonsForGoal } from './content/lessons'
import { Admin } from './screens/Admin'
import { Done } from './screens/Done'
import { GoalPick } from './screens/GoalPick'
import { LessonPath } from './screens/LessonPath'
import { LessonPlayer } from './screens/LessonPlayer'
import { Survey } from './screens/Survey'
import { Ineligible, Welcome } from './screens/Welcome'
import { clearCurrent, loadAllSessions, loadCurrentId, newId, newParticipantCode, saveSession } from './storage'
import type { SessionRecord } from './types'

type View = { name: 'welcome' } | { name: 'ineligible' } | { name: 'path' } | { name: 'lesson'; id: string } | { name: 'survey' } | { name: 'done' }

function resume(): SessionRecord | null {
  const id = loadCurrentId()
  return id ? (loadAllSessions().find((s) => s.id === id) ?? null) : null
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash)
  const [session, setSession] = useState<SessionRecord | null>(resume)
  const [view, setView] = useState<View>(() => (session ? { name: 'path' } : { name: 'welcome' }))

  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (session) saveSession(session)
  }, [session])

  const lessons = useMemo(() => (session?.goal ? lessonsForGoal(session.goal) : []), [session?.goal])
  const completed = useMemo(() => new Set(session?.lessons.map((l) => l.lessonId)), [session?.lessons])

  if (hash === '#admin') return <Admin />

  switch (view.name) {
    case 'welcome':
      return (
        <Welcome
          onIneligible={() => setView({ name: 'ineligible' })}
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
            })
            setView({ name: 'path' })
          }}
        />
      )
    case 'ineligible':
      return <Ineligible />
    case 'path':
      if (!session) return null
      if (!session.goal) return <GoalPick onPick={(goal) => setSession({ ...session, goal })} />
      return (
        <LessonPath
          lessons={lessons}
          completed={completed}
          xp={session.xp}
          goal={session.goal}
          onOpen={(id) => setView({ name: 'lesson', id })}
          onSurvey={() => setView({ name: 'survey' })}
        />
      )
    case 'lesson': {
      const lesson = lessons.find((l) => l.id === view.id)
      if (!session || !lesson) return null
      return (
        <LessonPlayer
          lesson={lesson}
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
          onSubmit={(survey) => {
            setSession({ ...session, survey, finishedAt: survey.submittedAt })
            setView({ name: 'done' })
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
