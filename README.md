# MacroQuest

MVP artefact for the COMP903 proposal *A Gamified Web Application for Teaching Calorie and Macronutrient Literacy*. Duolingo-style lessons that teach calorie and macro tracking, followed by the end-of-session study survey.

## Stack

React 19, TypeScript, Vite and Tailwind CSS on the front end. Node.js, Express 5 and MongoDB (official driver) on the back end, in `server/`.

## Run it

Needs Node.js 20 or newer.

```
cd MacroQuest
npm install
npm run dev
```

Open http://localhost:5173. The researcher data page is http://localhost:5173/#admin.

By default the app is **browser-only**: progress and study data are saved in the browser's localStorage, and nothing else needs setting up. Because data stays on the device that ran the session, run participants on your own device or export from `#admin` after each one.

## Optional: MongoDB and Google sign-in

The back end in `server/` is built but switched off. To turn it on:

1. Copy `.env.example` to `.env` and fill it in. `.env` is git-ignored, so never commit it or paste it anywhere public.
   - `MONGODB_URI`: your connection string.
   - `SESSION_SECRET`: a long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   - `ADMIN_KEY`: a password for the researcher page.
   - `GOOGLE_CLIENT_ID`: optional, see below. Leave it empty to hide Google sign-in.
   - `VITE_USE_SERVER=true`.
2. Run `npm run dev:full`. This starts the API on port 3001 and the app on http://localhost:5173 (Vite forwards `/api` to the API).

### Google sign-in

1. In Google Cloud Console, create or pick a project, then open **APIs & Services > OAuth consent screen**. Choose **External**, fill in the app name and your email, and add yourself as a test user while it is in testing.
2. Open **APIs & Services > Credentials > Create credentials > OAuth client ID** and pick application type **Web application**.
3. Under **Authorised JavaScript origins**, add `http://localhost:5173` and `http://localhost`, plus your hosted URL later (for example `https://macroquest.onrender.com`). No redirect URI is needed.
4. Copy the client ID (ends in `.apps.googleusercontent.com`) into `GOOGLE_CLIENT_ID` in `.env` and restart `npm run dev`.

### Hosting

In browser-only mode, `npm run build` makes a static site in `dist/` that you can host on Vercel or Netlify. With the server on, `npm run build` then `npm start` serves the built app and the API from one Node process on `PORT`. On Render, use a Web Service with build command `npm install && npm run build`, start command `npm start`, and the same variables as `.env` in its Environment tab. Set `NODE_ENV=production` there so login cookies are HTTPS-only. In MongoDB Atlas, allow the host's IP under Network Access.

## Storage and sign-in (when the server is on)

- **Everyone**: progress is saved in the browser's localStorage, so guests can close the tab and carry on later on the same device.
- **Signed in with Google (optional)**: progress is also saved to the `progress` collection under their Google account, so they can resume on another device. Signing out clears the device.
- **Study data**: every participant's session, signed in or not, is saved to the `studySessions` collection after each step. It never contains a user id, name or email, so survey answers stay anonymous. The `users` collection holds only the Google id, name, email and picture.
- If the API is unreachable, the app keeps working from localStorage, and the researcher page can still export that browser's sessions.

## Session flow

1. Information sheet, consent, 18+ check, eating-disorder screening (exits politely if yes).
2. Baseline tracking experience question.
3. Goal pick: bulking, cutting or maintaining.
4. Lesson path: 5 core lessons (energy balance, labels, weighing, portions, practice logging), then 2 lessons for the chosen goal.
5. Survey: retrospective before/after items (H1 knowledge, H2 logging confidence), satisfaction items (H3), NPS 0-10 with a reason, optional comments.
6. Thank-you screen with an anonymous participant code for withdrawal requests.

## Gamification

- 10 XP per question answered right first time, plus 20 XP per lesson. Levels every 100 XP.
- Progress bar per lesson and across the path, "in a row" combo counter.
- Wrong answers show the explanation and come back at the end of the lesson. No hearts or penalties.
- Streaks are left out because the study is a single session.
- Nothing rewards eating less, and the participant's own intake is never recorded.

## Where to edit

| What | File |
| --- | --- |
| Lesson text and questions | `src/content/lessons.ts` |
| Practice food database (per 100 g, USDA FoodData Central) | `src/content/foods.ts` |
| Survey items and NPS wording | `src/content/survey.ts` |
| XP values and log-accuracy scoring | `src/scoring.ts` |
| CSV export columns | `src/storage.ts` |
| API routes | `server/index.ts` |
| Google token check and login cookie | `server/auth.ts` |

## Exported data

On `/#admin`, enter `ADMIN_KEY` to load every participant from the database, or switch to **This browser** for local sessions. One CSV row per participant: experience, goal, XP, lessons completed, first-try correct out of total questions, mean practice-logging accuracy (100% minus the percentage calorie error), every before/after item (`k1_before`, `k1_after`, ...), satisfaction items `s1`-`s6`, `nps`, `nps_reason`, `comments`. The JSON export also has per-lesson timings and each logged meal entry.
