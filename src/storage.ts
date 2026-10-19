import type { SessionRecord } from './types'
import { RETRO_ITEMS, SATISFACTION_ITEMS } from './content/survey'

// No backend for the MVP: every session is kept in this browser's localStorage.
// The researcher exports them from the #admin page.
const SESSIONS_KEY = 'macroquest.sessions'
const CURRENT_KEY = 'macroquest.current'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or blocked; the session still works in memory.
  }
}

export function loadAllSessions(): SessionRecord[] {
  return read<SessionRecord[]>(SESSIONS_KEY, [])
}

export function loadCurrentId(): string | null {
  return read<string | null>(CURRENT_KEY, null)
}

export function saveSession(session: SessionRecord) {
  const all = loadAllSessions().filter((s) => s.id !== session.id)
  all.push(session)
  write(SESSIONS_KEY, all)
  write(CURRENT_KEY, session.finishedAt ? null : session.id)
}

export function clearCurrent() {
  write(CURRENT_KEY, null)
}

export function deleteAllSessions() {
  write(SESSIONS_KEY, [])
  write(CURRENT_KEY, null)
}

export function newId() {
  return crypto.randomUUID()
}

/** Short anonymous code a participant can quote if they want their data withdrawn. */
export function newParticipantCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function csvCell(v: unknown) {
  const s = v === undefined || v === null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** One row per session, wide format, ready for SPSS/R/Excel. */
export function sessionsToCsv(sessions: SessionRecord[]): string {
  const retroIds = RETRO_ITEMS.flatMap((g) => g.items.map((i) => i.id))
  const satIds = SATISFACTION_ITEMS.map((i) => i.id)
  const header = [
    'participant_code', 'started_at', 'finished_at', 'duration_min', 'experience', 'goal', 'xp',
    'lessons_completed', 'first_try_correct', 'questions_total', 'log_accuracy_mean_pct',
    ...retroIds.flatMap((id) => [`${id}_before`, `${id}_after`]),
    ...satIds, 'nps', 'nps_reason', 'comments',
  ]
  const rows = sessions.map((s) => {
    const first = s.lessons.reduce((a, l) => a + l.firstTryCorrect, 0)
    const total = s.lessons.reduce((a, l) => a + l.questionCount, 0)
    const acc = s.logTasks.length
      ? (s.logTasks.reduce((a, t) => a + t.accuracyPct, 0) / s.logTasks.length).toFixed(1)
      : ''
    const dur = s.finishedAt
      ? ((new Date(s.finishedAt).getTime() - new Date(s.startedAt).getTime()) / 60000).toFixed(1)
      : ''
    return [
      s.participantCode, s.startedAt, s.finishedAt, dur, s.experience, s.goal, s.xp,
      s.lessons.length, first, total, acc,
      ...retroIds.flatMap((id) => [s.survey?.retro[id]?.before, s.survey?.retro[id]?.after]),
      ...satIds.map((id) => s.survey?.satisfaction[id]),
      s.survey?.nps, s.survey?.npsReason, s.survey?.comments,
    ].map(csvCell).join(',')
  })
  return [header.join(','), ...rows].join('\n')
}

export function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
