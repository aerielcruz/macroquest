# MacroQuest

MVP artefact for the COMP903 proposal *A Gamified Web Application for Teaching Calorie and Macronutrient Literacy*. Duolingo-style lessons that teach calorie and macro tracking, followed by the end-of-session study survey.

## Run it

Needs Node.js 20 or newer.

```
cd web-app
npm install
npm run dev
```

Open http://localhost:5173. The researcher data page is http://localhost:5173/#admin.

`npm run build` makes a static site in `dist/` that can be hosted on Vercel, Netlify or Render.

## Stack

React 19, TypeScript, Vite and Tailwind CSS. No backend: sessions are saved in the browser's localStorage and exported as CSV or JSON from `#admin`. Because data stays on the device that ran the session, either run sessions on your own device or export after each participant. A Node/Express/MongoDB backend (as in the proposal's Resources section) can replace `src/storage.ts` later.

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

## Exported data

One CSV row per participant: experience, goal, XP, lessons completed, first-try correct out of total questions, mean practice-logging accuracy (100% minus the percentage calorie error), every before/after item (`k1_before`, `k1_after`, ...), satisfaction items `s1`-`s6`, `nps`, `nps_reason`, `comments`. The JSON export also has per-lesson timings and each logged meal entry.
