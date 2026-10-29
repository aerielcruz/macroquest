import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { USE_SERVER } from '../api'
import { useHotkeys } from '../hotkeys'
import { Button } from './ui'

// Plain-language explanation of the app and the research behind it. Keep it in
// line with the consent text in screens/Welcome.tsx.

export function AboutStudy({ onClose }: { onClose: () => void }) {
  useHotkeys(
    (key) => {
      if (key === 'Escape') {
        onClose()
        return true
      }
    },
    { capture: true },
  )

  // On <body> so the sticky header's blur cannot trap it.
  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-3xl bg-white sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-slate-100 px-5 py-4">
          <h2 id="about-title" className="text-xl font-extrabold">
            About MacroQuest
          </h2>
          <button type="button" onClick={onClose} className="text-xl font-bold text-slate-400 hover:text-slate-600" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 py-4 text-slate-600">
          <Section emoji="🥑" title="What is MacroQuest?">
            A short, game-style app that teaches the skills behind calorie and macro tracking: what calories and macros are, reading
            nutrition labels, weighing food, estimating portions, logging a meal accurately, and setting targets for your goal.
          </Section>

          <Section emoji="🔬" title="Why this research?">
            Lots of people try tracking but find it confusing or give up. Small mistakes, like picking the raw entry for cooked rice,
            make a food log much less accurate. This research project looks at whether short, gamified lessons can help
            people learn these skills and feel confident using them.
          </Section>

          <Section emoji="🎓" title="Who is running it?">
            This is a research project by Aeriel Cruz as part of a course in their Master of Information Technology (specialisation in Software Development).
          </Section>

          <Section emoji="🎯" title="What we want to find out">
            <ol className="list-decimal space-y-1 pl-5">
              <li>Do people understand calories and macros better after the lessons?</li>
              <li>Do they feel more confident logging their food accurately?</li>
              <li>Do they find the app easy to use and enjoyable?</li>
            </ol>
          </Section>

          <Section emoji="🗺️" title="What you will do">
            About 10 to 15 minutes of lessons: 5 core lessons that everyone takes, then 2 for your goal (bulking, cutting or
            maintaining). Then a short survey of about 3 minutes. Once you finish the core lessons you can choose to stop and go to
            the survey.
          </Section>

          <Section emoji="📊" title="What is recorded">
            Your answers to the lesson questions, how accurate your practice meal logs are, how long the lessons take, how often you
            open the calculator, and your survey answers. Nothing about your own eating, weight or body is recorded.
          </Section>

          <Section emoji="🔒" title="Your privacy">
            Taking part is voluntary and anonymous. We never ask for your name or email: your answers are stored with a participant
            code instead{USE_SERVER ? ', in this browser and in the research database' : ', in this browser'}. To have your answers
            withdrawn, quote your participant code, shown on the lesson screen.
          </Section>

          <Section emoji="💚" title="Looking after yourself">
            The app teaches flexible, goal-based tracking and never rewards eating less. If thinking about food or tracking ever feels
            stressful, please stop. You can talk to your GP, or call or text 1737 any time for free support.
          </Section>
        </div>

        <div className="border-t-2 border-slate-100 px-5 py-4">
          <Button className="w-full" onClick={onClose} autoFocus>
            Got it
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function Section({ emoji, title, children }: { emoji: string; title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-1 flex items-center gap-2 font-extrabold text-slate-800">
        <span aria-hidden>{emoji}</span>
        {title}
      </h3>
      <div className="leading-relaxed">{children}</div>
    </section>
  )
}
