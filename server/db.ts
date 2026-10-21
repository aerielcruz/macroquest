import { MongoClient, type Collection, type Db } from 'mongodb'
import type { SessionRecord } from '../src/types'

export interface UserDoc {
  _id: string // Google account id ("sub")
  email: string
  name: string
  picture?: string
  createdAt: Date
  lastLoginAt: Date
}

/** A signed-in user's in-progress session, so they can resume on any device. */
export interface ProgressDoc {
  _id: string // user id
  session: SessionRecord
  updatedAt: Date
}

/**
 * Anonymous study record, one per participant session. Never linked to a user
 * account, so survey answers stay anonymous even when someone signs in.
 */
export interface StudyDoc extends SessionRecord {
  _id: string // session id
  updatedAt: Date
}

let db: Db | null = null

export async function connect(uri: string) {
  const client = new MongoClient(uri)
  await client.connect()
  db = client.db(process.env.MONGODB_DB || 'macroquest')
  await db.collection('studySessions').createIndex({ startedAt: 1 })
  console.log(`Connected to MongoDB database "${db.databaseName}"`)
}

function get(): Db {
  if (!db) throw new Error('Database not connected')
  return db
}

export const users = (): Collection<UserDoc> => get().collection<UserDoc>('users')
export const progress = (): Collection<ProgressDoc> => get().collection<ProgressDoc>('progress')
export const studySessions = (): Collection<StudyDoc> => get().collection<StudyDoc>('studySessions')
