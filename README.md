# MacroQuest

MVP artefact for the COMP903 proposal *A Gamified Web Application for Teaching Calorie and Macronutrient Literacy*. Duolingo-style lessons that teach calorie and macro tracking, followed by an end-of-session study survey.

## Stack

React 19, TypeScript, Vite and Tailwind CSS 4 on the front end. Node.js, Express 5 and MongoDB (official driver) on the back end, in `server/`. There are no image or audio files: lesson illustrations are SVG drawn in code and sound effects are synthesised with the Web Audio API.

## Run it

Needs Node.js 20 or newer.

```
cd MacroQuest
npm install
npm run dev
```

Open http://localhost:5173. The researcher page is http://localhost:5173/#admin.

By default the app is **browser-only**: progress and study data are saved in the browser's localStorage, and nothing else needs setting up. Because data stays on the device that ran the session, run participants on your own device or export from `#admin` after each one.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | App only, browser-only mode, on port 5173 |
| `npm run dev:full` | App plus the API (port 3001); Vite forwards `/api` to it |
| `npm run build` | Type-checks, then builds the app into `dist/` |
| `npm start` | Serves `dist/` and the API from one Node process on `PORT` |
| `npm run seed` | Adds 12 sample participants to MongoDB (`npm run seed -- --clear` removes them) |
| `npm run lint` | ESLint |

## MongoDB and Google sign-in

The back end in `server/` is optional. To turn it on:

1. Copy `.env.example` to `.env` and fill it in. `.env` is git-ignored, so never commit it or paste it anywhere public.
   - `MONGODB_URI`: your connection string. `MONGODB_DB`: the database name (default `macroquest`).
   - `SESSION_SECRET`: a long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   - `ADMIN_KEY`: a password for the researcher page.
   - `GOOGLE_CLIENT_ID`: optional, see below. Leave it empty to hide Google sign-in.
   - `VITE_USE_SERVER=true`.
2. Run `npm run dev:full`. Vite only reads `.env` when it starts, so restart it after changing anything.

### Google sign-in

1. In Google Cloud Console, create or pick a project, then open **APIs & Services > OAuth consent screen**. Choose **External**, fill in the app name and your email, and add yourself as a test user while it is in testing.
2. Open **APIs & Services > Credentials > Create credentials > OAuth client ID** and pick application type **Web application**.
3. Under **Authorised JavaScript origins**, add `http://localhost:5173` and `http://localhost`, plus your hosted URL later (for example `https://macroquest.onrender.com`). No redirect URI is needed.
4. Copy the client ID (ends in `.apps.googleusercontent.com`) into `GOOGLE_CLIENT_ID` in `.env` and restart.

### Hosting

In browser-only mode, `npm run build` makes a static site in `dist/` that you can host on Vercel or Netlify. With the server on, `npm run build` then `npm start` serves the built app and the API from one Node process on `PORT`. On Render, use a Web Service with build command `npm install && npm run build`, start command `npm start`, and the same variables as `.env` in its Environment tab. Set `NODE_ENV=production` there so login cookies are HTTPS-only. In MongoDB Atlas, allow the host's IP under Network Access.

## Storage and sign-in (when the server is on)

- **Everyone**: progress is saved in the browser's localStorage, so guests can close the tab and carry on later on the same device. Unsubmitted survey answers are saved as a draft too, so a refresh does not lose them.
- **Signed in with Google (optional)**: progress is also saved to the `progress` collection under their Google account, so they can resume on another device. Signing out clears the device.
- **Study data**: every participant's session, signed in or not, is saved to the `studySessions` collection after each step. It never contains a user id, name or email, so survey answers stay anonymous. The `users` collection holds only the Google id, name, email and picture.
- Once a survey is submitted the session is final: later saves for it are ignored.
- If the API is unreachable, the app keeps working from localStorage, and the researcher page can still export that browser's sessions.

## Session flow

1. Welcome, then the information sheet and consent: voluntary and anonymous, stop any time, an 18+ confirmation, and a wellbeing note (GP or 1737 for support).
2. Baseline tracking experience question.
3. Goal pick: bulking, cutting or maintaining.
4. Lesson map. A short first-time tour points out where to start, the survey button, settings and the participant code. The participant code is shown from the start so anyone who stops part-way can still ask for their data to be withdrawn.
5. Lessons: Unit 1 has 5 core lessons (energy balance, labels, weighing, portions, practice logging), then Unit 2 has 2 lessons for the chosen goal. Lessons unlock in order.
6. Survey, from the button at the top of the lesson map:
   - Locked until Unit 1 is finished ("Complete Unit 1 to take the survey").
   - After Unit 1 and before the last lesson, it asks "Finish early?" first, and the session is flagged `ended_early`. Going back from the survey to keep learning clears that flag.
   - Items: self-rated skills now (H1 knowledge, H2 logging confidence), satisfaction (H3), recommend 0-10 with a reason, optional comments.
7. Thank-you screen with the participant code.

## Lesson features

- **Teaching cards** before the questions, each with an illustration (`src/content/illustrations.tsx`). Question illustrations show the numbers needed but never the answer.
- **Question types**: multiple choice; numeric answers with a tolerance (within tolerance but not exact shows "Close enough!" and the exact answer); and practice meal logs styled as a food diary, where the participant picks the right database entry and enters grams.
- **Feedback** after every answer with an explanation. Wrong answers come back at the end of the lesson, and the lesson-complete screen lists them under "Worth another look".
- **Replay** finished lessons for practice: no extra XP, and the tips can be skipped.
- **Calculator** drawer from the lesson header. How often it is opened is recorded per lesson.
- **Keyboard shortcuts**: 1-3 to pick an answer, Enter to check, continue and move to the next tip, Esc to quit (with a confirmation once there is progress).
- **Sound effects and vibration** (phones), with a mute button. Settings are remembered per browser.
- **Accessibility**: larger-text option, animations off when the device asks for reduced motion, labelled controls.

## Gamification

- 10 XP per question answered right first time, plus 20 XP per lesson. Levels every 100 XP.
- Progress bar per lesson and across the path, "in a row" combo counter.
- No hearts or penalties. Streaks are left out because the study is a single session.
- Nothing rewards eating less, and the participant's own intake is never recorded.

## Settings menu

The gear at the top right of the lesson map has: larger text, sound and vibration, show the quick tour again, and **Start over**. Start over asks for confirmation, then returns to the welcome screen with a new participant code. The abandoned session is kept but flagged `restarted`, and a signed-in user's saved progress is cleared so it does not come back on sign-in.

## Researcher page (`/#admin`)

- Enter `ADMIN_KEY` to load every participant from the database, or switch to **This browser** for local sessions.
- **Preview mode** (shown once the key is accepted) unlocks every lesson and the survey on that device. Sessions used while it is on are flagged `preview`. Turn it off from the banner on the lesson map. Do not switch it on while a real participant's session is in progress on the same device, because that session would be flagged too.
- **Test data** (seeded samples with ids starting `sample-`, and preview sessions) is hidden from the counts and downloads by default. A checkbox includes it.
- Download CSV (one row per participant) or JSON (everything, including per-lesson timings and each logged meal entry).

## Exported data (CSV)

| Column | Meaning |
| --- | --- |
| `participant_code` | Anonymous code shown to the participant |
| `started_at`, `finished_at`, `duration_min` | Session timing (finished = survey submitted) |
| `experience`, `goal` | Baseline tracking experience and chosen goal |
| `xp` | Total XP |
| `preview` | 1 if used in preview mode (test data) |
| `restarted` | 1 if the participant chose Start over and began a new session |
| `lessons_completed`, `ended_early` | Lessons finished, and 1 if they chose Finish early after Unit 1 |
| `first_try_correct`, `questions_total` | Questions right first time, out of all questions in completed lessons |
| `calculator_opens` | Times the calculator was opened, across all lessons |
| `log_accuracy_mean_pct` | Mean practice-logging accuracy (100% minus the percentage calorie error) |
| `k1`-`k4`, `c1`-`c3` | Self-rated knowledge (H1) and logging confidence (H2), 1-5 |
| `s1`-`s6` | Satisfaction and engagement (H3), 1-5 |
| `nps`, `nps_reason`, `comments` | Likelihood to recommend (0-10), reason, optional comments |

Item wording is in `src/content/survey.ts`. Older records from the earlier before/after survey export their "after" rating in the `k`/`c` columns.

## Where to edit

| What | File |
| --- | --- |
| Lesson text, questions and which illustration each uses | `src/content/lessons.ts` |
| Illustrations | `src/content/illustrations.tsx` |
| Practice food database (per 100 g, USDA FoodData Central) and food icons | `src/content/foods.ts` |
| Survey items and NPS wording | `src/content/survey.ts` |
| Consent and welcome text | `src/screens/Welcome.tsx` |
| "Learn more about this study" text (keep in line with the consent text) | `src/components/AboutStudy.tsx` |
| XP values and log-accuracy scoring | `src/scoring.ts` |
| Sound effects and vibration patterns | `src/sound.ts` |
| First-time tour steps | `TOUR` at the top of `src/screens/LessonPath.tsx` and `src/screens/LessonPlayer.tsx` |
| CSV export columns, local storage | `src/storage.ts` |
| API routes | `server/index.ts` |
| Google token check and login cookie | `server/auth.ts` |
| Sample participants | `server/seed.ts` |
