import 'dotenv/config'
import cookieParser from 'cookie-parser'
import express, { type Response } from 'express'
import { timingSafeEqual } from 'node:crypto'
import { existsSync } from 'node:fs'
import path from 'node:path'
import type { SessionRecord } from '../src/types'
import {
  type AuthedRequest,
  clearSessionCookie,
  readSession,
  requireUser,
  setSessionCookie,
  verifyGoogleToken,
} from './auth'
import { connect, progress, studySessions, users } from './db'

const { MONGODB_URI, SESSION_SECRET, GOOGLE_CLIENT_ID = '', ADMIN_KEY = '' } = process.env
const PORT = Number(process.env.PORT) || 3001

if (!MONGODB_URI) throw new Error('MONGODB_URI is missing. Copy .env.example to .env and fill it in.')
if (!SESSION_SECRET) throw new Error('SESSION_SECRET is missing. Copy .env.example to .env and fill it in.')

const app = express()
app.use(express.json({ limit: '200kb' }))
app.use(cookieParser())
app.use(readSession(SESSION_SECRET))

/** Minimal shape check so junk never lands in the database. */
function isSessionRecord(v: unknown): v is SessionRecord {
  const s = v as SessionRecord
  return !!s && typeof s.id === 'string' && typeof s.participantCode === 'string' && Array.isArray(s.lessons)
}

function fail(res: Response, status: number, error: string) {
  res.status(status).json({ error })
}

app.get('/api/config', (_req, res) => {
  res.json({ googleClientId: GOOGLE_CLIENT_ID || null })
})

// --- Google sign-in -------------------------------------------------------

app.post('/api/auth/google', async (req, res) => {
  if (!GOOGLE_CLIENT_ID) return fail(res, 503, 'Google sign-in is not configured')
  try {
    const g = await verifyGoogleToken(String(req.body?.credential ?? ''), GOOGLE_CLIENT_ID)
    const now = new Date()
    await users().updateOne(
      { _id: g.id },
      { $set: { email: g.email, name: g.name, picture: g.picture, lastLoginAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    )
    setSessionCookie(res, g.id, SESSION_SECRET)
    res.json({ user: { id: g.id, email: g.email, name: g.name, picture: g.picture } })
  } catch (err) {
    console.warn('Google sign-in failed:', (err as Error).message)
    fail(res, 401, 'Google sign-in failed')
  }
})

app.get('/api/auth/me', async (req: AuthedRequest, res) => {
  if (!req.userId) return res.json({ user: null })
  const u = await users().findOne({ _id: req.userId })
  res.json({ user: u ? { id: u._id, email: u.email, name: u.name, picture: u.picture } : null })
})

app.post('/api/auth/logout', (_req, res) => {
  clearSessionCookie(res)
  res.json({ ok: true })
})

// --- Saved progress for signed-in users -----------------------------------

app.get('/api/progress', requireUser, async (req: AuthedRequest, res) => {
  const doc = await progress().findOne({ _id: req.userId! })
  res.json({ session: doc?.session ?? null })
})

app.put('/api/progress', requireUser, async (req: AuthedRequest, res) => {
  const session = req.body?.session
  if (!isSessionRecord(session)) return fail(res, 400, 'Invalid session')
  await progress().replaceOne({ _id: req.userId! }, { session, updatedAt: new Date() }, { upsert: true })
  res.json({ ok: true })
})

app.delete('/api/progress', requireUser, async (req: AuthedRequest, res) => {
  await progress().deleteOne({ _id: req.userId! })
  res.json({ ok: true })
})

// --- Anonymous study data (every participant, signed in or not) -----------

app.put('/api/study/:id', async (req, res) => {
  const session = req.body?.session
  if (!isSessionRecord(session) || session.id !== req.params.id) return fail(res, 400, 'Invalid session')
  const existing = await studySessions().findOne({ _id: session.id }, { projection: { finishedAt: 1 } })
  // A submitted survey is final; later saves from the same browser are ignored.
  if (existing?.finishedAt) return res.json({ ok: true, ignored: true })
  await studySessions().replaceOne({ _id: session.id }, { ...session, updatedAt: new Date() }, { upsert: true })
  res.json({ ok: true })
})

// --- Researcher export -----------------------------------------------------

function isAdmin(key: unknown) {
  if (!ADMIN_KEY || typeof key !== 'string') return false
  const a = Buffer.from(key)
  const b = Buffer.from(ADMIN_KEY)
  return a.length === b.length && timingSafeEqual(a, b)
}

app.get('/api/admin/sessions', async (req, res) => {
  if (!isAdmin(req.get('x-admin-key'))) return fail(res, 401, 'Wrong admin key')
  const docs = await studySessions().find().sort({ startedAt: 1 }).toArray()
  res.json({ sessions: docs.map((d) => ({ ...d, _id: undefined })) })
})

app.use('/api', (_req, res) => fail(res, 404, 'Not found'))

// --- Serve the built app in production ------------------------------------

const dist = path.resolve(import.meta.dirname, '../dist')
if (existsSync(dist)) {
  app.use(express.static(dist))
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

connect(MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`MacroQuest API on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message)
    process.exit(1)
  })
