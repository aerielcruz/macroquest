import type { NextFunction, Request, Response } from 'express'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'

const COOKIE = 'mq_session'
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

export interface AuthedRequest extends Request {
  userId?: string
}

const googleClient = new OAuth2Client()

/** Verifies a Google Identity Services ID token and returns the account details. */
export async function verifyGoogleToken(credential: string, clientId: string) {
  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId })
  const p = ticket.getPayload()
  if (!p?.sub || !p.email) throw new Error('Google token is missing account details')
  return { id: p.sub, email: p.email, name: p.name ?? p.email, picture: p.picture }
}

export function setSessionCookie(res: Response, userId: string, secret: string) {
  const token = jwt.sign({ sub: userId }, secret, { expiresIn: '30d' })
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE_MS,
  })
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE)
}

/** Sets req.userId when a valid session cookie is present. Never rejects. */
export function readSession(secret: string) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[COOKIE]
    if (token) {
      try {
        const payload = jwt.verify(token, secret) as { sub: string }
        req.userId = payload.sub
      } catch {
        // Expired or tampered cookie: treat as signed out.
      }
    }
    next()
  }
}

export function requireUser(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.userId) {
    res.status(401).json({ error: 'Not signed in' })
    return
  }
  next()
}
