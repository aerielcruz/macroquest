import type { ReactNode } from 'react'

// Flat SVG illustrations for lesson cards and questions. Each one is drawn on a
// 320 × 180 canvas from a few shared pieces (labels, scales, charts) so the numbers
// in a picture always match the lesson text. Question pictures never show the answer.

const C = {
  ink: '#1e293b',
  sub: '#64748b',
  line: '#cbd5e1',
  soft: '#f1f5f9',
  white: '#ffffff',
  lime: '#65a30d',
  limeSoft: '#ecfccb',
  sky: '#0284c7',
  skySoft: '#e0f2fe',
  amber: '#d97706',
  amberSoft: '#fef3c7',
  rose: '#e11d48',
  roseSoft: '#ffe4e6',
}
const MACRO = { protein: C.rose, carbs: C.amber, fat: C.sky }

const W = 320
const H = 180

// --- Shared pieces -----------------------------------------------------------

function Txt({
  x,
  y,
  size = 12,
  weight = 700,
  fill = C.ink,
  anchor = 'middle',
  children,
}: {
  x: number
  y: number
  size?: number
  weight?: number
  fill?: string
  anchor?: 'start' | 'middle' | 'end'
  children: ReactNode
}) {
  return (
    <text x={x} y={y} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor} dominantBaseline="middle">
      {children}
    </text>
  )
}

/** An emoji used as a small picture inside a scene. */
function Emoji({ x, y, size = 36, children }: { x: number; y: number; size?: number; children: string }) {
  return (
    <text x={x} y={y} fontSize={size} textAnchor="middle" dominantBaseline="central">
      {children}
    </text>
  )
}

function Arrow({ x1, y1, x2, y2, color = C.sub }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const head = (d: number) => `${x2 - 9 * Math.cos(a + d)},${y2 - 9 * Math.sin(a + d)}`
  return (
    <g stroke={color} strokeWidth={3} strokeLinecap="round" fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <polyline points={`${head(0.5)} ${x2},${y2} ${head(-0.5)}`} strokeLinejoin="round" />
    </g>
  )
}

function Pill({ x, y, text, fill = C.soft, color = C.ink, w }: { x: number; y: number; text: string; fill?: string; color?: string; w?: number }) {
  const width = w ?? text.length * 7 + 20
  x = Math.min(Math.max(x, width / 2 + 4), W - width / 2 - 4)
  return (
    <g>
      <rect x={x - width / 2} y={y - 12} width={width} height={24} rx={12} fill={fill} />
      <Txt x={x} y={y + 1} size={12} weight={800} fill={color}>
        {text}
      </Txt>
    </g>
  )
}

interface LabelProps {
  x: number
  y: number
  w?: number
  serving: string
  /** Column headings; leave empty for a single unlabelled value column. */
  cols?: string[]
  rows: string[][]
  highlightServing?: boolean
  highlightRow?: number
  highlightCol?: number
}

/** A nutrition information panel like the ones on packaging. */
function NutritionLabel({ x, y, w = 180, serving, cols = [], rows, highlightServing, highlightRow, highlightCol }: LabelProps) {
  const nVals = Math.max(1, ...rows.map((r) => r.length - 1))
  const colRight = (i: number) => x + w - 10 - (nVals - 1 - i) * 66
  const headY = y + 62
  const rowsY = cols.length ? y + 80 : y + 64
  const h = rowsY - y + rows.length * 18 + 4
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={C.white} stroke={C.ink} strokeWidth={2} />
      <rect x={x} y={y} width={w} height={24} rx={8} fill={C.ink} />
      <rect x={x} y={y + 16} width={w} height={8} fill={C.ink} />
      <Txt x={x + w / 2} y={y + 13} size={11} weight={800} fill={C.white}>
        Nutrition Information
      </Txt>
      {highlightServing && <rect x={x + 5} y={y + 29} width={w - 10} height={18} rx={5} fill={C.amberSoft} stroke={C.amber} strokeWidth={2} />}
      <Txt x={x + 10} y={y + 39} size={11} anchor="start">
        Serving size: {serving}
      </Txt>
      <line x1={x + 8} x2={x + w - 8} y1={y + 51} y2={y + 51} stroke={C.ink} strokeWidth={2} />
      {highlightCol !== undefined && (
        <rect x={colRight(highlightCol) - 60} y={headY - 10} width={64} height={rowsY - headY + rows.length * 18} rx={5} fill={C.amberSoft} stroke={C.amber} strokeWidth={2} />
      )}
      {highlightRow !== undefined && (
        <rect x={x + 5} y={rowsY + highlightRow * 18 - 9} width={w - 10} height={18} rx={5} fill={C.amberSoft} stroke={C.amber} strokeWidth={2} />
      )}
      {cols.map((c, i) => (
        <Txt key={c} x={colRight(i)} y={headY} size={10} weight={800} fill={C.sub} anchor="end">
          {c}
        </Txt>
      ))}
      {rows.map(([name, ...vals], r) => (
        <g key={name}>
          <Txt x={x + 10} y={rowsY + r * 18} size={11} weight={r === 0 ? 800 : 600} anchor="start">
            {name}
          </Txt>
          {vals.map((v, i) => (
            <Txt key={i} x={colRight(i)} y={rowsY + r * 18} size={11} weight={r === 0 ? 800 : 600} anchor="end">
              {v}
            </Txt>
          ))}
        </g>
      ))}
    </g>
  )
}

/** Kitchen scale with something on it and a reading on the display. */
function KitchenScale({ x, y, item, reading, tare }: { x: number; y: number; item: string; reading: string; tare?: boolean }) {
  return (
    <g>
      <Emoji x={x} y={y - 22} size={40}>
        {item}
      </Emoji>
      <rect x={x - 54} y={y} width={108} height={8} rx={4} fill={C.line} />
      <path d={`M${x - 46} ${y + 8} h92 l8 52 h-108 z`} fill={C.white} stroke={C.ink} strokeWidth={2} strokeLinejoin="round" />
      <rect x={x - 34} y={y + 18} width={68} height={22} rx={4} fill={C.ink} />
      <Txt x={x} y={y + 30} size={13} weight={800} fill="#bef264">
        {reading}
      </Txt>
      <rect x={x - 18} y={y + 45} width={36} height={11} rx={5.5} fill={tare ? C.amber : C.line} />
      <Txt x={x} y={y + 51} size={7} weight={900} fill={tare ? C.white : C.sub}>
        TARE
      </Txt>
    </g>
  )
}

/** Horizontal bars: a starting number, a change, and the result (which may be "?"). */
function CalcBars({ base, delta, baseText, deltaText, resultText }: { base: number; delta: number; baseText: string; deltaText: string; resultText: string }) {
  const scale = 190 / Math.max(base, base + delta)
  const x0 = 110
  const baseW = base * scale
  const resW = (base + delta) * scale
  const deltaColor = delta < 0 ? C.rose : C.lime
  return (
    <g>
      <Txt x={x0 - 10} y={50} size={13} anchor="end">
        Maintenance
      </Txt>
      <rect x={x0} y={36} width={baseW} height={28} rx={8} fill={C.sky} />
      {baseText && (
        <Txt x={x0 + baseW - 10} y={51} size={13} weight={800} fill={C.white} anchor="end">
          {baseText}
        </Txt>
      )}
      <Txt x={x0 - 10} y={124} size={13} anchor="end">
        Your target
      </Txt>
      <rect x={x0} y={110} width={resW} height={28} rx={8} fill={C.lime} />
      {delta < 0 ? (
        <rect x={x0 + resW} y={110} width={-delta * scale} height={28} rx={8} fill="none" stroke={C.rose} strokeWidth={2} strokeDasharray="5 4" />
      ) : (
        <rect x={x0 + baseW} y={110} width={delta * scale} height={28} rx={8} fill="#a3e635" />
      )}
      <Txt x={x0 + 12} y={125} size={13} weight={800} fill={C.white} anchor="start">
        {resultText}
      </Txt>
      <Pill x={x0 + baseW + (delta < 0 ? delta * scale / 2 : delta * scale / 2)} y={88} text={deltaText} fill={delta < 0 ? C.roseSoft : C.limeSoft} color={deltaColor} />
    </g>
  )
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

/** A week of daily calories as bars, with an optional target line, range band and labels. */
function WeekBars({ values, target, band, showValues, caption }: { values: number[]; target?: number; band?: number; showValues?: boolean; caption?: string }) {
  const lo = Math.min(...values, target ?? Infinity) - 600
  const hi = Math.max(...values, target ?? 0) + 200
  const top = 26
  const bottom = 146
  const yOf = (v: number) => bottom - ((v - lo) / (hi - lo)) * (bottom - top)
  const step = 36
  const x0 = 46
  return (
    <g>
      {band && target && <rect x={x0 - 12} y={yOf(target + band)} width={step * 7 + 8} height={yOf(target - band) - yOf(target + band)} fill={C.limeSoft} rx={4} />}
      {values.map((v, i) => {
        const inBand = band && target ? Math.abs(v - target) <= band : true
        return (
          <g key={i}>
            <rect x={x0 + i * step - 10} y={yOf(v)} width={22} height={bottom - yOf(v)} rx={5} fill={inBand ? C.sky : '#7dd3fc'} />
            {showValues && (
              <Txt x={x0 + i * step + 1} y={yOf(v) - 8} size={9} weight={800} fill={C.sub}>
                {v.toLocaleString()}
              </Txt>
            )}
            <Txt x={x0 + i * step + 1} y={bottom + 12} size={11} fill={C.sub}>
              {DAYS[i]}
            </Txt>
          </g>
        )
      })}
      <line x1={x0 - 16} x2={x0 + step * 6 + 16} y1={bottom} y2={bottom} stroke={C.line} strokeWidth={2} />
      {target && (
        <>
          <line x1={x0 - 16} x2={x0 + step * 6 + 16} y1={yOf(target)} y2={yOf(target)} stroke={C.lime} strokeWidth={2.5} strokeDasharray="6 4" />
          <Txt x={x0 + step * 6 + 20} y={yOf(target)} size={10} weight={800} fill={C.lime} anchor="start">
            target
          </Txt>
        </>
      )}
      {caption && (
        <Txt x={W / 2} y={14} size={12} weight={800} fill={C.sub}>
          {caption}
        </Txt>
      )}
    </g>
  )
}

interface Series {
  points: number[]
  color: string
  label?: string
}

/** Weight over time as one or more lines, with an optional dashed average. */
function Trend({ series, xLabels, avg, yLabel = 'weight', notes = [], minSpan = 1 }: { series: Series[]; xLabels: string[]; avg?: number; yLabel?: string; notes?: { i: number; text: string }[]; minSpan?: number }) {
  const all = series.flatMap((s) => s.points)
  const lo = Math.min(...all, avg ?? Infinity)
  const hi = Math.max(...all, avg ?? -Infinity)
  const pad = (hi - lo) * 0.25 + Math.max(0, minSpan - (hi - lo)) / 2
  const top = 26
  const bottom = 144
  const left = 40
  const right = 280
  const n = xLabels.length
  const xOf = (i: number) => left + (i * (right - left)) / (n - 1)
  const yOf = (v: number) => bottom - ((v - lo + pad) / (hi - lo + 2 * pad)) * (bottom - top)
  return (
    <g>
      <line x1={left - 14} x2={left - 14} y1={top - 6} y2={bottom} stroke={C.line} strokeWidth={2} />
      <line x1={left - 14} x2={right + 14} y1={bottom} y2={bottom} stroke={C.line} strokeWidth={2} />
      <text x={14} y={(top + bottom) / 2} fontSize={10} fontWeight={700} fill={C.sub} textAnchor="middle" transform={`rotate(-90 14 ${(top + bottom) / 2})`}>
        {yLabel}
      </text>
      {xLabels.map((l, i) => (
        <Txt key={i} x={xOf(i)} y={bottom + 13} size={10} fill={C.sub}>
          {l}
        </Txt>
      ))}
      {avg !== undefined && (
        <>
          <line x1={left - 14} x2={right + 14} y1={yOf(avg)} y2={yOf(avg)} stroke={C.lime} strokeWidth={2.5} strokeDasharray="6 4" />
          <Txt x={left - 8} y={yOf(avg) + 10} size={10} weight={800} fill={C.lime} anchor="start">
            weekly average
          </Txt>
        </>
      )}
      {series.map((s, k) => (
        <g key={k}>
          <polyline points={s.points.map((v, i) => `${xOf(i)},${yOf(v)}`).join(' ')} fill="none" stroke={s.color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {s.points.map((v, i) => (
            <circle key={i} cx={xOf(i)} cy={yOf(v)} r={4} fill={C.white} stroke={s.color} strokeWidth={2.5} />
          ))}
          {s.label && (
            <Txt
              x={xOf(s.points.length - 1) - 6}
              y={yOf(s.points[s.points.length - 1]) + (s.points[s.points.length - 1] < s.points[0] ? 16 : -14)}
              size={11}
              weight={800}
              fill={s.color}
              anchor="end"
            >
              {s.label}
            </Txt>
          )}
        </g>
      ))}
      {notes.map((note) => (
        <Txt key={note.i} x={xOf(note.i)} y={top - 10} size={11} weight={800} fill={C.sub}>
          {note.text}
        </Txt>
      ))}
    </g>
  )
}

/** Ring split by calories, with a legend on the right. */
function Donut({ parts, center }: { parts: { label: string; kcal: number; color: string; text: string }[]; center: string }) {
  const total = parts.reduce((s, p) => s + p.kcal, 0)
  const cx = 92
  const cy = 90
  const r = 52
  const circ = 2 * Math.PI * r
  let offset = 0
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.soft} strokeWidth={26} />
      {parts.map((p) => {
        const len = (p.kcal / total) * circ
        const el = (
          <circle
            key={p.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={p.color}
            strokeWidth={26}
            strokeDasharray={`${len - 2} ${circ - len + 2}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        )
        offset += len
        return el
      })}
      <Txt x={cx} y={cy} size={13} weight={900}>
        {center}
      </Txt>
      {parts.map((p, i) => (
        <g key={p.label}>
          <rect x={178} y={52 + i * 30} width={16} height={16} rx={4} fill={p.color} />
          <Txt x={202} y={61 + i * 30} size={13} anchor="start">
            {p.label}
          </Txt>
          <Txt x={308} y={61 + i * 30} size={13} weight={900} anchor="end" fill={p.color}>
            {p.text}
          </Txt>
        </g>
      ))}
    </g>
  )
}

function Plate({ x, y, r = 56, foods }: { x: number; y: number; r?: number; foods: [string, number, number][] }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={C.white} stroke={C.line} strokeWidth={3} />
      <circle cx={x} cy={y} r={r - 12} fill="none" stroke={C.soft} strokeWidth={2} />
      {foods.map(([e, dx, dy]) => (
        <Emoji key={e} x={x + dx} y={y + dy} size={34}>
          {e}
        </Emoji>
      ))}
    </g>
  )
}

function OilSpoon({ bottleText, spoonText, resultText }: { bottleText: string; spoonText: string; resultText: string }) {
  return (
    <g>
      <path d="M62 40 h20 v18 q22 12 22 34 v58 q0 8 -8 8 h-48 q-8 0 -8 -8 v-58 q0 -22 22 -34 z" fill="#fde68a" stroke={C.ink} strokeWidth={2} strokeLinejoin="round" />
      <rect x={60} y={30} width={24} height={12} rx={3} fill={C.lime} />
      <rect x={46} y={100} width={52} height={36} rx={4} fill={C.white} stroke={C.ink} strokeWidth={1.5} />
      <Txt x={72} y={112} size={9} weight={900}>
        OLIVE OIL
      </Txt>
      <Txt x={72} y={126} size={7} weight={800} fill={C.sub}>
        {bottleText}
      </Txt>
      <ellipse cx={190} cy={104} rx={34} ry={18} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <ellipse cx={190} cy={104} rx={24} ry={10} fill="#facc15" />
      <path d="M223 100 L292 84 q8 -2 9 5 q1 6 -6 8 L224 110 z" fill={C.soft} stroke={C.ink} strokeWidth={2} strokeLinejoin="round" />
      <Txt x={190} y={142} size={13} weight={800}>
        {spoonText}
      </Txt>
      <Pill x={190} y={162} text={resultText} fill={C.amberSoft} color={C.amber} />
    </g>
  )
}

function Carton({ x, name, sub, fill }: { x: number; name: string; sub: string; fill: string }) {
  return (
    <g>
      <path d={`M${x - 34} 58 l14 -22 h40 l14 22 v96 h-68 z`} fill={C.white} stroke={C.ink} strokeWidth={2} strokeLinejoin="round" />
      <path d={`M${x - 34} 58 h68`} stroke={C.ink} strokeWidth={2} />
      <rect x={x - 34} y={78} width={68} height={40} fill={fill} />
      <Txt x={x} y={92} size={12} weight={900} fill={C.white}>
        {name}
      </Txt>
      <Txt x={x} y={107} size={10} weight={800} fill={C.white}>
        MILK
      </Txt>
      <Txt x={x} y={168} size={11} weight={800} fill={C.sub}>
        {sub}
      </Txt>
    </g>
  )
}

function Frame({ alt, children }: { alt: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={alt} className="block h-auto w-full" fontFamily="inherit">
      {children}
    </svg>
  )
}

// --- Illustrations -----------------------------------------------------------

const ILLUSTRATIONS = {
  // Energy balance
  'energy-balance': {
    alt: 'A see-saw balancing energy in from food against energy out from activity.',
    draw: () => (
      <>
        <polygon points="160,112 140,148 180,148" fill={C.ink} />
        <rect x={40} y={104} width={240} height={10} rx={5} fill={C.sub} />
        <Emoji x={78} y={78} size={44}>
          🍽️
        </Emoji>
        <Emoji x={242} y={78} size={44}>
          🏃
        </Emoji>
        <Txt x={78} y={132} size={13}>
          Energy in
        </Txt>
        <Txt x={242} y={132} size={13}>
          Energy out
        </Txt>
        <Pill x={70} y={164} text="More in: gain" fill={C.limeSoft} color={C.lime} />
        <Pill x={250} y={164} text="More out: lose" fill={C.roseSoft} color={C.rose} />
      </>
    ),
  },
  'macro-kcal': {
    alt: 'Bars comparing calories per gram: protein 4, carbohydrate 4, fat 9.',
    draw: () => (
      <>
        {(
          [
            ['🥩', 'Protein', 4, MACRO.protein],
            ['🍞', 'Carbs', 4, MACRO.carbs],
            ['🥑', 'Fat', 9, MACRO.fat],
          ] as const
        ).map(([e, name, kcal, color], i) => {
          const x = 70 + i * 90
          const h = kcal * 11
          return (
            <g key={name}>
              <rect x={x - 22} y={140 - h} width={44} height={h} rx={8} fill={color} />
              <Txt x={x} y={128 - h} size={13} weight={900} fill={color}>
                {kcal} kcal/g
              </Txt>
              <Emoji x={x} y={140 - h / 2} size={24}>
                {e}
              </Emoji>
              <Txt x={x} y={158} size={13}>
                {name}
              </Txt>
            </g>
          )
        })}
      </>
    ),
  },
  'week-trend': {
    alt: 'A week of daily calories going above and below a target line, averaging out.',
    draw: () => <WeekBars values={[2350, 2600, 2250, 2450, 2300, 2700, 2150]} target={2400} caption="Some days over, some under. The week evens out." />,
  },
  'snack-label': {
    alt: 'A snack bar and its label: 10 g protein, 20 g carbs and 5 g fat.',
    draw: () => (
      <>
        <Emoji x={70} y={90} size={64}>
          🍫
        </Emoji>
        <NutritionLabel x={124} y={20} w={176} serving="1 bar" rows={[['Energy', '? kcal'], ['Protein', '10 g'], ['Carbohydrate', '20 g'], ['Fat', '5 g']]} />
      </>
    ),
  },
  'surplus-trend': {
    alt: 'Bodyweight creeping upwards week after week.',
    draw: () => <Trend series={[{ points: [70, 70.3, 70.5, 70.9, 71.2], color: C.amber, label: '+300 kcal a day' }]} xLabels={['Now', 'Wk 1', 'Wk 2', 'Wk 3', 'Wk 4']} />,
  },

  // Reading labels
  'label-serving': {
    alt: 'A nutrition label with the serving size line highlighted.',
    draw: () => (
      <>
        <Emoji x={56} y={70} size={48}>
          🔍
        </Emoji>
        <Txt x={56} y={116} size={12} fill={C.amber}>
          Check this
        </Txt>
        <Txt x={56} y={131} size={12} fill={C.amber}>
          first
        </Txt>
        <Arrow x1={88} y1={60} x2={112} y2={58} color={C.amber} />
        <NutritionLabel x={120} y={20} serving="30 g (¾ cup)" rows={[['Energy', '120 kcal'], ['Protein', '3 g'], ['Carbohydrate', '22 g'], ['Fat', '2 g']]} highlightServing />
      </>
    ),
  },
  'label-columns': {
    alt: 'A nutrition label with a per serving column and a highlighted per 100 g column.',
    draw: () => (
      <NutritionLabel
        x={50}
        y={14}
        w={220}
        serving="30 g"
        cols={['Per serve', 'Per 100 g']}
        rows={[['Energy', '120 kcal', '400 kcal'], ['Protein', '3 g', '10 g'], ['Carbohydrate', '22 g', '73 g'], ['Fat', '2 g', '6.7 g']]}
        highlightCol={1}
      />
    ),
  },
  'kj-kcal': {
    alt: 'Converting energy: kilojoules divided by 4.2 gives kilocalories.',
    draw: () => (
      <>
        <rect x={20} y={58} width={100} height={60} rx={14} fill={C.skySoft} />
        <Txt x={70} y={80} size={20} weight={900} fill={C.sky}>
          kJ
        </Txt>
        <Txt x={70} y={101} size={11} fill={C.sub}>
          on NZ/AU labels
        </Txt>
        <Arrow x1={128} y1={88} x2={192} y2={88} />
        <Pill x={160} y={64} text="÷ 4.2" fill={C.amberSoft} color={C.amber} />
        <rect x={200} y={58} width={100} height={60} rx={14} fill={C.limeSoft} />
        <Txt x={250} y={80} size={20} weight={900} fill={C.lime}>
          kcal
        </Txt>
        <Txt x={250} y={101} size={11} fill={C.sub}>
          in most apps
        </Txt>
        <Txt x={160} y={150} size={13} fill={C.sub}>
          1 kcal ≈ 4.2 kJ
        </Txt>
      </>
    ),
  },
  'cereal-pour': {
    alt: 'A cereal label showing 120 kcal per 30 g serving, next to a bowl of cereal weighing 75 g.',
    draw: () => (
      <>
        <NutritionLabel x={14} y={30} w={170} serving="30 g" rows={[['Energy', '120 kcal'], ['Protein', '3 g'], ['Carbohydrate', '22 g']]} highlightServing highlightRow={0} />
        <KitchenScale x={246} y={92} item="🥣" reading="75 g" />
      </>
    ),
  },
  'label-kj': {
    alt: 'A nutrition label showing 840 kJ of energy per serving.',
    draw: () => (
      <>
        <NutritionLabel x={30} y={28} w={176} serving="1 slice (45 g)" rows={[['Energy', '840 kJ'], ['Protein', '4 g'], ['Carbohydrate', '30 g']]} highlightRow={0} />
        <Arrow x1={214} y1={92} x2={244} y2={92} />
        <Pill x={278} y={92} text="? kcal" fill={C.limeSoft} color={C.lime} w={64} />
      </>
    ),
  },
  'yoghurt-pot': {
    alt: 'A 170 g yoghurt pot whose label shows 5 g protein per 100 g.',
    draw: () => (
      <>
        <path d="M44 62 h86 l-10 92 q-1 6 -7 6 h-52 q-6 0 -7 -6 z" fill={C.white} stroke={C.ink} strokeWidth={2} strokeLinejoin="round" />
        <rect x={38} y={52} width={98} height={12} rx={4} fill={C.sky} />
        <Txt x={87} y={100} size={14} weight={900} fill={C.sky}>
          Yoghurt
        </Txt>
        <Txt x={87} y={124} size={14} weight={900}>
          170 g
        </Txt>
        <NutritionLabel x={152} y={32} w={156} serving="170 g" cols={['Per 100 g']} rows={[['Energy', '60 kcal'], ['Protein', '5 g'], ['Fat', '1 g']]} highlightRow={1} />
      </>
    ),
  },

  // Weighing food
  'scale-tare': {
    alt: 'An empty bowl on a kitchen scale reading 0 g after pressing the tare button.',
    draw: () => (
      <>
        <KitchenScale x={110} y={84} item="🥣" reading="0 g" tare />
        <Arrow x1={190} y1={150} x2={136} y2={142} color={C.amber} />
        <Txt x={250} y={58} size={13} anchor="middle">
          1. Bowl on scale
        </Txt>
        <Txt x={250} y={82} size={13} fill={C.amber}>
          2. Press TARE
        </Txt>
        <Txt x={250} y={106} size={13}>
          3. Add food
        </Txt>
      </>
    ),
  },
  'raw-cooked': {
    alt: '100 g of dry rice becomes about 280 g once cooked, with the same calories.',
    draw: () => (
      <>
        <KitchenScale x={70} y={70} item="🌾" reading="100 g" />
        <Arrow x1={136} y1={96} x2={184} y2={96} />
        <Txt x={160} y={80} size={11} fill={C.sky}>
          + water
        </Txt>
        <KitchenScale x={250} y={70} item="🍚" reading="280 g" />
        <Pill x={160} y={160} text="Same ≈ 365 kcal, different weight" fill={C.limeSoft} color={C.lime} />
      </>
    ),
  },
  'oil-spoon': {
    alt: 'A tablespoon of olive oil weighs about 14 g and has over 120 kcal.',
    draw: () => <OilSpoon bottleText="Calorie dense" spoonText="1 tablespoon ≈ 14 g" resultText="120+ kcal" />,
  },
  'rice-cooked': {
    alt: 'A bowl of cooked rice on a kitchen scale.',
    draw: () => (
      <>
        <KitchenScale x={120} y={80} item="🍚" reading="180 g" />
        <Pill x={250} y={92} text="Weighed after cooking" fill={C.skySoft} color={C.sky} w={150} />
      </>
    ),
  },
  'chicken-cooking': {
    alt: 'Chicken weighing 100 g raw and 75 g after cooking.',
    draw: () => (
      <>
        <KitchenScale x={70} y={78} item="🍗" reading="100 g" />
        <Txt x={70} y={162} size={12} fill={C.sub}>
          Raw
        </Txt>
        <Arrow x1={136} y1={104} x2={184} y2={104} />
        <Emoji x={160} y={80} size={22}>
          🔥
        </Emoji>
        <KitchenScale x={250} y={78} item="🍗" reading="75 g" />
        <Txt x={250} y={162} size={12} fill={C.sub}>
          Cooked
        </Txt>
      </>
    ),
  },
  'oil-maths': {
    alt: 'An olive oil bottle labelled 884 kcal per 100 g and a 14 g tablespoon.',
    draw: () => <OilSpoon bottleText="884 kcal/100 g" spoonText="1 tablespoon = 14 g" resultText="? kcal" />,
  },

  // Portions
  'eating-out': {
    alt: 'A restaurant meal with no scale around, only your hand.',
    draw: () => (
      <>
        <Plate x={110} y={92} foods={[['🍝', 0, 0]]} />
        <Emoji x={40} y={92} size={30}>
          🍴
        </Emoji>
        <Emoji x={238} y={88} size={60}>
          ✋
        </Emoji>
        <Txt x={238} y={140} size={12} fill={C.sub}>
          Always with you
        </Txt>
      </>
    ),
  },
  'hand-guide': {
    alt: 'The hand portion guide: palm for protein, cupped hand for carbs, fist for vegetables, thumb for fats.',
    draw: () => (
      <>
        {(
          [
            ['✋', 'Palm', 'Protein', MACRO.protein, '#fff1f2'],
            ['🤲', 'Cupped', 'Carbs', MACRO.carbs, C.amberSoft],
            ['✊', 'Fist', 'Veg', C.lime, C.limeSoft],
            ['👍', 'Thumb', 'Fats', MACRO.fat, C.skySoft],
          ] as const
        ).map(([e, part, food, color, bg], i) => {
          const x = 44 + i * 77
          return (
            <g key={part}>
              <rect x={x - 34} y={24} width={68} height={136} rx={14} fill={bg} />
              <Emoji x={x} y={66} size={38}>
                {e}
              </Emoji>
              <Txt x={x} y={112} size={12} fill={C.sub}>
                {part}
              </Txt>
              <Txt x={x} y={134} size={13} weight={900} fill={color}>
                {food}
              </Txt>
            </g>
          )
        })}
      </>
    ),
  },
  'close-enough': {
    alt: 'A dart landing close to the centre of a target.',
    draw: () => (
      <>
        {[60, 44, 28, 12].map((r, i) => (
          <circle key={r} cx={110} cy={90} r={r} fill={i % 2 ? C.white : C.roseSoft} stroke={C.rose} strokeWidth={2} />
        ))}
        <circle cx={120} cy={82} r={6} fill={C.ink} />
        <line x1={120} y1={82} x2={150} y2={52} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
        <Txt x={240} y={74} size={14} weight={900} fill={C.lime}>
          Close enough
        </Txt>
        <Txt x={240} y={96} size={12} fill={C.sub}>
          beats skipping
        </Txt>
        <Txt x={240} y={112} size={12} fill={C.sub}>
          the log
        </Txt>
      </>
    ),
  },
  'takeaway-vs-home': {
    alt: 'A takeaway stir-fry next to the same dish cooked at home.',
    draw: () => (
      <>
        <Emoji x={86} y={78} size={64}>
          🥡
        </Emoji>
        <Txt x={86} y={134} size={13}>
          Takeaway
        </Txt>
        <Txt x={160} y={80} size={20} weight={900} fill={C.sub}>
          vs
        </Txt>
        <Emoji x={234} y={78} size={64}>
          🍳
        </Emoji>
        <Txt x={234} y={134} size={13}>
          Home-cooked
        </Txt>
      </>
    ),
  },

  // Practice log
  'log-app': {
    alt: 'A phone showing a food log with each food and its weight.',
    draw: () => (
      <>
        <rect x={100} y={8} width={120} height={168} rx={18} fill={C.ink} />
        <rect x={108} y={22} width={104} height={146} rx={10} fill={C.white} />
        <Txt x={160} y={36} size={11} weight={900}>
          Lunch
        </Txt>
        {(
          [
            ['🍗', 'Chicken', '150 g'],
            ['🍚', 'Rice', '200 g'],
            ['🥦', 'Broccoli', '100 g'],
            ['🫒', 'Olive oil', '14 g'],
          ] as const
        ).map(([e, name, g], i) => (
          <g key={name}>
            <rect x={114} y={48 + i * 29} width={92} height={24} rx={6} fill={C.soft} />
            <Emoji x={126} y={60 + i * 29} size={14}>
              {e}
            </Emoji>
            <Txt x={137} y={60 + i * 29} size={9} anchor="start">
              {name}
            </Txt>
            <Txt x={201} y={60 + i * 29} size={9} weight={900} fill={C.sky} anchor="end">
              {g}
            </Txt>
          </g>
        ))}
        <Emoji x={56} y={90} size={40}>
          ⚖️
        </Emoji>
        <Emoji x={266} y={90} size={40}>
          📝
        </Emoji>
      </>
    ),
  },
  'look-alikes': {
    alt: 'Two similar milk cartons: whole milk at 61 kcal and skim milk at 34 kcal per 100 g.',
    draw: () => (
      <>
        <Carton x={100} name="WHOLE" sub="61 kcal / 100 g" fill={C.sky} />
        <Carton x={220} name="SKIM" sub="34 kcal / 100 g" fill="#7dd3fc" />
        <Txt x={160} y={100} size={22} weight={900} fill={C.rose}>
          ≠
        </Txt>
      </>
    ),
  },
  'lunch-plate': {
    alt: 'A lunch plate of chicken, rice and broccoli, with olive oil on the side.',
    draw: () => (
      <>
        <Plate x={140} y={90} r={74} foods={[['🍗', -28, -20], ['🍚', 26, -16], ['🥦', 0, 30]]} />
        <Emoji x={264} y={104} size={44}>
          🫒
        </Emoji>
        <Txt x={264} y={142} size={11} fill={C.sub}>
          1 tbsp oil
        </Txt>
      </>
    ),
  },
  'breakfast-bowl': {
    alt: 'A breakfast of oats, milk, a banana and peanut butter.',
    draw: () => (
      <>
        {(
          [
            ['🥣', 'Oats'],
            ['🥛', 'Milk'],
            ['🍌', 'Banana'],
            ['🥜', 'Peanut butter'],
          ] as const
        ).map(([e, name], i) => (
          <g key={name}>
            <circle cx={44 + i * 77} cy={80} r={32} fill={C.amberSoft} />
            <Emoji x={44 + i * 77} y={80} size={36}>
              {e}
            </Emoji>
            <Txt x={44 + i * 77} y={132} size={11} fill={C.sub}>
              {name}
            </Txt>
          </g>
        ))}
      </>
    ),
  },

  // Cutting
  deficit: {
    alt: 'Your target is maintenance minus a 300 to 500 kcal deficit.',
    draw: () => <CalcBars base={2500} delta={-400} baseText="" deltaText="− 300 to 500 kcal" resultText="Target" />,
  },
  'slow-cut': {
    alt: 'A gentle weight-loss line compared with a steep, too-fast one.',
    draw: () => (
      <Trend
        series={[
          { points: [80, 79.6, 79.2, 78.8, 78.4], color: C.lime, label: '0.5–1% a week' },
          { points: [80, 78.5, 77, 75.5, 74], color: C.rose, label: 'Too fast' },
        ]}
        xLabels={['Now', 'Wk 1', 'Wk 2', 'Wk 3', 'Wk 4']}
      />
    ),
  },
  'self-care': {
    alt: 'A heart: your target is a guide, not a test.',
    draw: () => (
      <>
        <Emoji x={110} y={86} size={72}>
          💚
        </Emoji>
        <Txt x={230} y={74} size={15} weight={900}>
          A guide,
        </Txt>
        <Txt x={230} y={96} size={15} weight={900}>
          not a test
        </Txt>
        <Txt x={230} y={124} size={11} fill={C.sub}>
          Breaks are OK
        </Txt>
      </>
    ),
  },
  'cut-calc': {
    alt: 'Maintenance of 2,500 kcal minus a 400 kcal deficit gives an unknown target.',
    draw: () => <CalcBars base={2500} delta={-400} baseText="2,500" deltaText="− 400 kcal" resultText="?" />,
  },
  'salty-dinner': {
    alt: 'Daily weigh-ins over a week with a small bump the morning after a salty dinner.',
    draw: () => (
      <Trend
        series={[{ points: [80, 79.9, 79.9, 80.2, 79.8, 79.8, 79.7], color: C.sky }]}
        xLabels={DAYS}
        avg={79.9}
        notes={[{ i: 3, text: '🧂 salty dinner' }]}
      />
    ),
  },

  // Macros
  'protein-cut': {
    alt: 'Protein foods: about 1.8 to 2.7 g of protein per kg of bodyweight on a cut.',
    draw: () => <ProteinScene range="1.8–2.7 g per kg" />,
  },
  'protein-bulk': {
    alt: 'Protein foods: about 1.6 to 2.2 g of protein per kg of bodyweight on a bulk.',
    draw: () => <ProteinScene range="1.6–2.2 g per kg" />,
  },
  'cut-split': {
    alt: 'Set protein first, keep fat at 15 to 30% of calories, and give the rest to carbs.',
    draw: () => (
      <Donut
        center="Your day"
        parts={[
          { label: 'Protein', kcal: 30, color: MACRO.protein, text: 'first' },
          { label: 'Fat', kcal: 25, color: MACRO.fat, text: '15–30%' },
          { label: 'Carbs', kcal: 45, color: MACRO.carbs, text: 'the rest' },
        ]}
      />
    ),
  },
  'cut-donut': {
    alt: 'A 2,000 kcal day with 150 g protein, 60 g fat and an unknown amount of carbs.',
    draw: () => (
      <Donut
        center="2,000 kcal"
        parts={[
          { label: 'Protein', kcal: 600, color: MACRO.protein, text: '150 g' },
          { label: 'Fat', kcal: 540, color: MACRO.fat, text: '60 g' },
          { label: 'Carbs', kcal: 860, color: MACRO.carbs, text: '? g' },
        ]}
      />
    ),
  },

  // Bulking
  surplus: {
    alt: 'Your target is maintenance plus a small 200 to 300 kcal surplus.',
    draw: () => <CalcBars base={2600} delta={250} baseText="" deltaText="+ 200 to 300 kcal" resultText="Target" />,
  },
  'slow-bulk': {
    alt: 'A slow, steady weight gain line compared with a steep one that adds mostly fat.',
    draw: () => (
      <Trend
        series={[
          { points: [70, 70.25, 70.5, 70.75, 71], color: C.lime, label: 'Mostly muscle' },
          { points: [70, 71, 72, 73, 74], color: C.rose, label: 'Mostly extra fat' },
        ]}
        xLabels={['Now', 'Wk 1', 'Wk 2', 'Wk 3', 'Wk 4']}
      />
    ),
  },
  'bulk-calc': {
    alt: 'Maintenance of 2,600 kcal plus a 250 kcal surplus gives an unknown target.',
    draw: () => <CalcBars base={2600} delta={250} baseText="2,600" deltaText="+ 250 kcal" resultText="?" />,
  },
  'fast-gain': {
    alt: 'Bodyweight rising by 1 kg every week for a month.',
    draw: () => <Trend series={[{ points: [70, 71, 72, 73, 74], color: C.rose, label: '+1 kg a week' }]} xLabels={['Start', 'Wk 1', 'Wk 2', 'Wk 3', 'Wk 4']} />,
  },
  'carbs-fuel': {
    alt: 'Carbohydrate foods like rice, bread and pasta fuel your training.',
    draw: () => (
      <>
        {['🍚', '🍞', '🍝'].map((e, i) => (
          <Emoji key={e} x={44 + i * 52} y={86} size={40}>
            {e}
          </Emoji>
        ))}
        <Arrow x1={180} y1={86} x2={222} y2={86} />
        <Emoji x={266} y={84} size={56}>
          🏋️
        </Emoji>
        <Txt x={160} y={150} size={13} fill={C.sub}>
          Carbs power your training
        </Txt>
      </>
    ),
  },
  'bulk-donut': {
    alt: 'A 3,000 kcal day with 160 g protein, 80 g fat and an unknown amount of carbs.',
    draw: () => (
      <Donut
        center="3,000 kcal"
        parts={[
          { label: 'Protein', kcal: 640, color: MACRO.protein, text: '160 g' },
          { label: 'Fat', kcal: 720, color: MACRO.fat, text: '80 g' },
          { label: 'Carbs', kcal: 1640, color: MACRO.carbs, text: '? g' },
        ]}
      />
    ),
  },

  // Maintaining
  maintenance: {
    alt: 'Bodyweight staying level over several weeks at maintenance calories.',
    draw: () => <Trend series={[{ points: [70, 70.1, 69.9, 70, 70.1], color: C.lime, label: 'Steady' }]} minSpan={3} xLabels={['Now', 'Wk 1', 'Wk 2', 'Wk 3', 'Wk 4']} />,
  },
  'two-weeks': {
    alt: 'Two weeks of ticked-off tracking days, then compare weekly average weights.',
    draw: () => (
      <>
        {Array.from({ length: 14 }, (_, i) => {
          const x = 30 + (i % 7) * 30
          const y = 40 + Math.floor(i / 7) * 54
          return (
            <g key={i}>
              <rect x={x} y={y} width={24} height={24} rx={6} fill={C.limeSoft} stroke={C.lime} strokeWidth={1.5} />
              <Txt x={x + 12} y={y + 13} size={13} weight={900} fill={C.lime}>
                ✓
              </Txt>
            </g>
          )
        })}
        <Txt x={30} y={28} size={11} fill={C.sub} anchor="start">
          Week 1
        </Txt>
        <Txt x={30} y={82} size={11} fill={C.sub} anchor="start">
          Week 2
        </Txt>
        <Emoji x={276} y={78} size={44}>
          ⚖️
        </Emoji>
        <Txt x={276} y={120} size={11} fill={C.sub}>
          compare
        </Txt>
        <Txt x={276} y={134} size={11} fill={C.sub}>
          averages
        </Txt>
        <Pill x={130} y={154} text="1 kg ≈ 7,700 kcal" fill={C.amberSoft} color={C.amber} />
      </>
    ),
  },
  'daily-wobble': {
    alt: 'Daily weigh-ins jumping up and down around a steady weekly average.',
    draw: () => <Trend series={[{ points: [70.2, 69.4, 70.6, 69.8, 70.9, 69.6, 70.3], color: C.sky }]} xLabels={DAYS} avg={70.1} />,
  },
  'maintenance-maths': {
    alt: 'Eating 2,300 kcal a day while weight drops 0.25 kg each week for two weeks.',
    draw: () => (
      <>
        <Pill x={160} y={14} text="2,300 kcal every day" fill={C.skySoft} color={C.sky} />
        <g transform="translate(0 10)">
          <Trend series={[{ points: [75, 74.75, 74.5], color: C.sky, label: '−0.25 kg / week' }]} xLabels={['Start', 'Week 1', 'Week 2']} />
        </g>
      </>
    ),
  },
  'fri-to-mon': {
    alt: 'Weight on Friday compared with a higher reading on Monday.',
    draw: () => <Trend series={[{ points: [70, 70.4, 70.6, 70.8], color: C.sky, label: '+0.8 kg' }]} xLabels={['Fri', 'Sat', 'Sun', 'Mon']} />,
  },
  'range-band': {
    alt: 'Daily calories inside a target range band, a little above and below the target.',
    draw: () => <WeekBars values={[2350, 2520, 2280, 2450, 2300, 2580, 2310]} target={2400} band={150} caption="Aim for a range, not an exact number" />,
  },
  'protein-first': {
    alt: 'Protein is set first; carbs and fat share the rest however you like.',
    draw: () => (
      <Donut
        center="Your day"
        parts={[
          { label: 'Protein', kcal: 30, color: MACRO.protein, text: 'set first' },
          { label: 'Carbs', kcal: 40, color: MACRO.carbs, text: 'your call' },
          { label: 'Fat', kcal: 30, color: MACRO.fat, text: 'your call' },
        ]}
      />
    ),
  },
  'week-intake': {
    alt: 'Bars for each day: 2,300, 2,500, 2,400, 2,600, 2,200, 2,700 and 2,100 kcal.',
    draw: () => <WeekBars values={[2300, 2500, 2400, 2600, 2200, 2700, 2100]} showValues caption="This week’s intake (kcal)" />,
  },
  'week-vs-target': {
    alt: 'The same week of intake against a 2,400 kcal target line.',
    draw: () => <WeekBars values={[2300, 2500, 2400, 2600, 2200, 2700, 2100]} target={2400} caption="Maintenance 2,400 kcal" />,
  },
  'dinner-party': {
    alt: 'A shared dinner at a friend’s place.',
    draw: () => (
      <>
        <Plate x={160} y={92} r={62} foods={[['🍲', 0, 0]]} />
        <Emoji x={56} y={92} size={40}>
          🥂
        </Emoji>
        <Emoji x={264} y={92} size={40}>
          🎉
        </Emoji>
      </>
    ),
  },
} satisfies Record<string, { alt: string; draw: () => ReactNode }>

function ProteinScene({ range }: { range: string }) {
  return (
    <>
      {['🥩', '🥚', '🐟', '🫘'].map((e, i) => (
        <Emoji key={e} x={40 + i * 46} y={78} size={36}>
          {e}
        </Emoji>
      ))}
      <Arrow x1={214} y1={78} x2={242} y2={78} />
      <Emoji x={276} y={76} size={48}>
        💪
      </Emoji>
      <Pill x={160} y={142} text={range} fill={C.roseSoft} color={C.rose} />
    </>
  )
}

export type IllustrationId = keyof typeof ILLUSTRATIONS

export function Illustration({ id, className = '' }: { id: IllustrationId; className?: string }) {
  const { alt, draw } = ILLUSTRATIONS[id]
  return (
    <div className={`mx-auto w-full max-w-sm ${className}`}>
      <Frame alt={alt}>{draw()}</Frame>
    </div>
  )
}
