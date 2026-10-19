// End-of-session survey. Item ids are stable so exported data stays comparable
// across versions of the app.

export interface SurveyItem {
  id: string
  text: string
}

/** Retrospective before/after items, 1-5 agreement. H1 = knowledge, H2 = logging confidence. */
export const RETRO_ITEMS: { hypothesis: 'H1' | 'H2'; heading: string; items: SurveyItem[] }[] = [
  {
    hypothesis: 'H1',
    heading: 'Tracking knowledge',
    items: [
      { id: 'k1', text: 'I understand how calories and macronutrients relate to energy balance.' },
      { id: 'k2', text: 'I can read a nutrition label to find the calories and macros in my portion.' },
      { id: 'k3', text: 'I know how to set calorie and macro targets for my goal.' },
      { id: 'k4', text: 'I understand why targets differ between bulking, cutting and maintaining.' },
    ],
  },
  {
    hypothesis: 'H2',
    heading: 'Logging confidence',
    items: [
      { id: 'c1', text: 'I am confident I can weigh and log my food accurately.' },
      { id: 'c2', text: 'I am confident I can choose the correct entry in a food database.' },
      { id: 'c3', text: 'I am confident I can estimate portions when I cannot weigh my food.' },
    ],
  },
]

/** H3 satisfaction and engagement items, 1-5 agreement. */
export const SATISFACTION_ITEMS: SurveyItem[] = [
  { id: 's1', text: 'The app was easy to use.' },
  { id: 's2', text: 'The lessons were engaging.' },
  { id: 's3', text: 'The points, levels and progress bar motivated me to keep going.' },
  { id: 's4', text: 'I trusted the information in the app.' },
  { id: 's5', text: 'Overall, I am satisfied with the app.' },
  { id: 's6', text: 'I would like to keep using this app.' },
]

export const LIKERT_LABELS = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree']

export const NPS_QUESTION =
  'How likely are you to recommend this app to a friend who wants to learn calorie and macro tracking?'

export const EXPERIENCE_OPTIONS = [
  { value: 'none', label: 'I have never tracked calories or macros' },
  { value: 'tried', label: 'I have tried it a few times' },
  { value: 'under6m', label: 'I have tracked regularly for less than 6 months' },
  { value: 'over6m', label: 'I have tracked regularly for 6 months or more' },
] as const
