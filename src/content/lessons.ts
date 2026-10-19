import type { Goal, Lesson } from '../types'

// Core skills everyone takes, in order. Sources: energy values and label maths are
// standard; goal targets follow Roberts et al. (2020) for cutting and Iraki et al.
// (2019) for bulking, as cited in the proposal.
export const CORE_LESSONS: Lesson[] = [
  {
    id: 'energy-balance',
    track: 'core',
    title: 'Energy balance',
    emoji: '⚡',
    cards: [
      {
        title: 'Calories are energy',
        body: 'Food energy is measured in kilocalories (kcal). Eat more than you burn over time and you gain weight (a surplus). Eat less and you lose weight (a deficit). Eat about the same and you maintain.',
      },
      {
        title: 'Macros carry the calories',
        body: 'Protein has 4 kcal per gram, carbohydrate has 4 kcal per gram, and fat has 9 kcal per gram. If you know the grams, you can work out the calories.',
      },
      {
        title: 'Think in weeks, not meals',
        body: 'Your body balances energy over days and weeks. One day above or below your target is normal and is not a failure. The trend is what counts.',
      },
    ],
    questions: [
      {
        kind: 'mcq',
        id: 'eb-1',
        prompt: 'Which macronutrient has the most calories per gram?',
        options: ['Protein', 'Carbohydrate', 'Fat'],
        correct: 2,
        explain: 'Fat has 9 kcal per gram, more than double protein and carbs (4 kcal each).',
      },
      {
        kind: 'numeric',
        id: 'eb-2',
        prompt: 'A snack has 10 g protein, 20 g carbs and 5 g fat. About how many calories is it?',
        unit: 'kcal',
        answer: 165,
        tolerance: 5,
        explain: '10 × 4 + 20 × 4 + 5 × 9 = 40 + 80 + 45 = 165 kcal.',
      },
      {
        kind: 'mcq',
        id: 'eb-3',
        prompt: 'If you keep eating about 300 kcal more than you burn each day, what will most likely happen over a few weeks?',
        options: ['You will gain weight', 'You will lose weight', 'Nothing will change'],
        correct: 0,
        explain: 'A consistent surplus adds up over time and leads to weight gain.',
      },
      {
        kind: 'mcq',
        id: 'eb-4',
        prompt: 'You ended up 200 kcal over your target today. What is the best thing to do?',
        options: [
          'Skip meals tomorrow to make up for it',
          'Carry on as normal tomorrow, since the weekly trend is what matters',
          'Stop tracking because the day is ruined',
        ],
        correct: 1,
        explain: 'Small day-to-day differences even out. Compensating by skipping meals is not needed and is not a healthy habit.',
      },
    ],
  },
  {
    id: 'reading-labels',
    track: 'core',
    title: 'Reading labels',
    emoji: '🏷️',
    cards: [
      {
        title: 'Serving size first',
        body: 'Every number on a label is for a stated amount. Check the serving size before anything else, because your portion is often bigger or smaller.',
      },
      {
        title: 'Per serving vs per 100 g',
        body: 'Most labels show values per serving and per 100 g. The per 100 g column makes maths easy: divide by 100, then multiply by the grams you ate.',
      },
      {
        title: 'kJ and kcal',
        body: 'Labels in New Zealand and Australia often show energy in kilojoules (kJ). 1 kcal is about 4.2 kJ, so divide kJ by 4.2 to get kcal.',
      },
    ],
    questions: [
      {
        kind: 'mcq',
        id: 'rl-1',
        prompt: 'What should you check first on a nutrition label?',
        options: ['The serving size', 'The sugar content', 'The brand name'],
        correct: 0,
        explain: 'Every other number depends on the serving size, so start there.',
      },
      {
        kind: 'numeric',
        id: 'rl-2',
        prompt: 'A cereal label says 1 serving = 30 g = 120 kcal. You pour 75 g. How many calories is that?',
        unit: 'kcal',
        answer: 300,
        tolerance: 5,
        explain: '120 ÷ 30 = 4 kcal per gram, and 4 × 75 = 300 kcal.',
      },
      {
        kind: 'numeric',
        id: 'rl-3',
        prompt: 'A label shows 840 kJ per serving. About how many kcal is that?',
        unit: 'kcal',
        answer: 200,
        tolerance: 10,
        explain: '840 ÷ 4.2 ≈ 200 kcal.',
      },
      {
        kind: 'numeric',
        id: 'rl-4',
        prompt: 'A yoghurt has 5 g protein per 100 g. You eat a 170 g pot. How much protein did you get?',
        unit: 'g',
        answer: 8.5,
        tolerance: 0.5,
        explain: '5 ÷ 100 × 170 = 8.5 g protein.',
      },
    ],
  },
  {
    id: 'weighing-food',
    track: 'core',
    title: 'Weighing food',
    emoji: '⚖️',
    cards: [
      {
        title: 'Use the tare button',
        body: 'Put your bowl on the scale, press tare to reset it to zero, then add your food. The scale shows only the food.',
      },
      {
        title: 'Raw and cooked weigh differently',
        body: 'Rice and pasta soak up water and get heavier when cooked. Meat loses water and gets lighter. The calories stay the same, only the weight changes. Always pick the database entry that matches how you weighed it.',
      },
      {
        title: 'Weigh the sneaky stuff',
        body: 'Oils, butter and sauces are small but calorie-dense. One tablespoon of oil is about 14 g and over 120 kcal.',
      },
    ],
    questions: [
      {
        kind: 'mcq',
        id: 'wf-1',
        prompt: 'You weighed your rice after cooking it. Which entry should you log?',
        options: ['White rice, raw (dry)', 'White rice, cooked', 'Either one, they are the same'],
        correct: 1,
        explain: 'Cooked rice has far fewer calories per gram than dry rice because of the water, so the entry must match.',
      },
      {
        kind: 'mcq',
        id: 'wf-2',
        prompt: 'What does the tare button on a kitchen scale do?',
        options: ['Converts grams to ounces', 'Resets the display to zero', 'Turns the scale off'],
        correct: 1,
        explain: 'Tare zeroes the scale so the weight of your plate or bowl is not counted.',
      },
      {
        kind: 'mcq',
        id: 'wf-3',
        prompt: '100 g of raw chicken becomes about 75 g after cooking. What happens to its calories?',
        options: ['They drop by a quarter', 'They stay about the same', 'They go up'],
        correct: 1,
        explain: 'Cooking drives out water, not energy. The same calories are now packed into fewer grams.',
      },
      {
        kind: 'numeric',
        id: 'wf-4',
        prompt: 'Olive oil has 884 kcal per 100 g. How many calories are in 14 g (one tablespoon)?',
        unit: 'kcal',
        answer: 124,
        tolerance: 6,
        explain: '884 ÷ 100 × 14 ≈ 124 kcal.',
      },
    ],
  },
  {
    id: 'portions',
    track: 'core',
    title: 'Estimating portions',
    emoji: '✋',
    cards: [
      {
        title: 'When you cannot weigh it',
        body: 'Eating out or at a friend’s place? Your hand is a handy measuring tool that is always with you.',
      },
      {
        title: 'The hand guide',
        body: 'A palm is roughly one portion of protein. A cupped hand is roughly one portion of carbs. A fist is roughly one portion of vegetables. A thumb is roughly one portion of fats like oil or butter.',
      },
      {
        title: 'Close enough is good enough',
        body: 'Restaurant food usually has more oil than home cooking, so round fats up a little. A sensible estimate beats skipping the log.',
      },
    ],
    questions: [
      {
        kind: 'mcq',
        id: 'pe-1',
        prompt: 'In the hand guide, which part of your hand is about one portion of fats?',
        options: ['Your palm', 'Your fist', 'Your thumb'],
        correct: 2,
        explain: 'A thumb-sized amount is about a tablespoon of oil, butter or nut butter.',
      },
      {
        kind: 'mcq',
        id: 'pe-2',
        prompt: 'You are at a restaurant and cannot weigh your meal. What should you do?',
        options: [
          'Skip logging it',
          'Estimate with hand portions and pick close entries',
          'Log nothing and eat less tomorrow',
        ],
        correct: 1,
        explain: 'A reasonable estimate keeps your log useful. Skipping or compensating later is not needed.',
      },
      {
        kind: 'mcq',
        id: 'pe-3',
        prompt: 'A takeaway stir-fry probably contains more of which macro than the same dish cooked at home?',
        options: ['Fat, from cooking oil', 'Protein', 'Fibre'],
        correct: 0,
        explain: 'Restaurants use generous amounts of oil, so it is worth logging a little extra fat.',
      },
    ],
  },
  {
    id: 'practice-log',
    track: 'core',
    title: 'Practice: log a meal',
    emoji: '📝',
    cards: [
      {
        title: 'Your turn',
        body: 'Now you will log two sample meals. For each food, choose the database entry that matches how it was weighed, then type in the grams.',
      },
      {
        title: 'Watch for look-alikes',
        body: 'Databases are full of entries that look similar: raw vs cooked, whole vs skim. Picking the right one matters as much as the weight.',
      },
    ],
    questions: [
      {
        kind: 'log',
        id: 'log-lunch',
        prompt: 'Log this lunch.',
        items: [
          { description: '150 g chicken breast, weighed after cooking', foodId: 'chicken_cooked', grams: 150, choices: ['chicken_raw', 'chicken_cooked'] },
          { description: '200 g white rice, weighed after cooking', foodId: 'rice_cooked', grams: 200, choices: ['rice_raw', 'rice_cooked'] },
          { description: '100 g boiled broccoli', foodId: 'broccoli_cooked', grams: 100, choices: ['broccoli_cooked'] },
          { description: '1 tablespoon (14 g) olive oil used for cooking', foodId: 'olive_oil', grams: 14, choices: ['butter', 'olive_oil'] },
        ],
        explain: 'The true total is about 666 kcal. The oil alone adds over 120 kcal, which is why it is worth logging.',
      },
      {
        kind: 'log',
        id: 'log-breakfast',
        prompt: 'Log this breakfast.',
        items: [
          { description: '40 g rolled oats, weighed dry before cooking', foodId: 'oats_dry', grams: 40, choices: ['oats_cooked', 'oats_dry'] },
          { description: '250 g whole milk', foodId: 'milk_whole', grams: 250, choices: ['milk_whole', 'milk_skim'] },
          { description: '1 medium banana (120 g, peeled)', foodId: 'banana', grams: 120, choices: ['banana_chips', 'banana'] },
          { description: '16 g smooth peanut butter', foodId: 'peanut_butter', grams: 16, choices: ['peanuts', 'peanut_butter'] },
        ],
        explain: 'The true total is about 505 kcal. Choosing skim instead of whole milk would have under-counted by over 60 kcal.',
      },
    ],
  },
]

export const GOAL_LESSONS: Record<Goal, Lesson[]> = {
  cut: [
    {
      id: 'cut-target',
      track: 'cut',
      title: 'Cutting: set your target',
      emoji: '🎯',
      cards: [
        {
          title: 'A modest deficit',
          body: 'Start from your maintenance calories and take away roughly 300 to 500 kcal. Aim to lose about 0.5 to 1% of your bodyweight per week.',
        },
        {
          title: 'Slower keeps more muscle',
          body: 'Losing weight slowly is easier to stick to and helps you hold on to muscle. Faster is not better.',
        },
        {
          title: 'Look after yourself',
          body: 'A target is a guide, not a test. If tracking ever starts to feel stressful or obsessive, take a break and talk to a health professional.',
        },
      ],
      questions: [
        {
          kind: 'numeric',
          id: 'ct-1',
          prompt: 'Your maintenance is 2,500 kcal and you choose a 400 kcal deficit. What is your daily target?',
          unit: 'kcal',
          answer: 2100,
          tolerance: 0,
          explain: '2,500 − 400 = 2,100 kcal per day.',
        },
        {
          kind: 'mcq',
          id: 'ct-2',
          prompt: 'For an 80 kg person, what is a sensible rate of weight loss?',
          options: ['About 0.4 to 0.8 kg per week', 'About 2 to 3 kg per week', 'As fast as possible'],
          correct: 0,
          explain: '0.5 to 1% of 80 kg is 0.4 to 0.8 kg per week.',
        },
        {
          kind: 'mcq',
          id: 'ct-3',
          prompt: 'The scale is 0.3 kg up the morning after a salty dinner. What does it most likely mean?',
          options: ['You gained fat', 'Normal water fluctuation, so watch the weekly average', 'You should cut calories further'],
          correct: 1,
          explain: 'Salt and carbs make you hold water overnight. The weekly average tells the real story.',
        },
      ],
    },
    {
      id: 'cut-macros',
      track: 'cut',
      title: 'Cutting: protein and fat',
      emoji: '🥩',
      cards: [
        {
          title: 'Protein protects muscle',
          body: 'On a cut, aim for about 1.8 to 2.7 g of protein per kg of bodyweight. It helps you keep muscle while in a deficit and keeps you fuller.',
        },
        {
          title: 'Fat a bit lower, carbs for training',
          body: 'Keep fat moderate, around 15 to 30% of calories. The calories left over go to carbohydrates, which fuel your training.',
        },
      ],
      questions: [
        {
          kind: 'numeric',
          id: 'cm-1',
          prompt: 'You weigh 70 kg and choose 2.2 g of protein per kg. How many grams of protein per day is that?',
          unit: 'g',
          answer: 154,
          tolerance: 2,
          explain: '70 × 2.2 = 154 g protein.',
        },
        {
          kind: 'numeric',
          id: 'cm-2',
          prompt: 'Your target is 2,000 kcal with 150 g protein and 60 g fat. How many grams of carbs are left?',
          unit: 'g',
          answer: 215,
          tolerance: 3,
          explain: 'Protein 150 × 4 = 600 and fat 60 × 9 = 540. 2,000 − 600 − 540 = 860 kcal, and 860 ÷ 4 = 215 g carbs.',
        },
        {
          kind: 'mcq',
          id: 'cm-3',
          prompt: 'Why is protein set higher when cutting?',
          options: ['It helps keep muscle while in a deficit', 'It has fewer calories than carbs', 'It burns fat directly'],
          correct: 0,
          explain: 'Higher protein helps preserve muscle when energy is limited. It has the same 4 kcal per gram as carbs.',
        },
      ],
    },
  ],
  bulk: [
    {
      id: 'bulk-target',
      track: 'bulk',
      title: 'Bulking: set your target',
      emoji: '🎯',
      cards: [
        {
          title: 'A small surplus',
          body: 'Add a small amount on top of maintenance, often around 200 to 300 kcal a day. Aim to gain about 0.25 to 0.5% of your bodyweight per week.',
        },
        {
          title: 'More is not faster muscle',
          body: 'Muscle grows slowly. A big surplus mostly adds extra fat, which you would have to lose later.',
        },
      ],
      questions: [
        {
          kind: 'numeric',
          id: 'bt-1',
          prompt: 'Your maintenance is 2,600 kcal and you add a 250 kcal surplus. What is your daily target?',
          unit: 'kcal',
          answer: 2850,
          tolerance: 0,
          explain: '2,600 + 250 = 2,850 kcal per day.',
        },
        {
          kind: 'mcq',
          id: 'bt-2',
          prompt: 'For a 70 kg lifter, what is a sensible rate of weight gain?',
          options: ['About 0.2 to 0.35 kg per week', 'About 1 to 2 kg per week', 'No gain at all'],
          correct: 0,
          explain: '0.25 to 0.5% of 70 kg is roughly 0.18 to 0.35 kg per week.',
        },
        {
          kind: 'mcq',
          id: 'bt-3',
          prompt: 'You have been gaining 1 kg every week for a month. What should you change?',
          options: ['Nothing, faster is better', 'Reduce the surplus a little', 'Stop eating carbs'],
          correct: 1,
          explain: 'That rate is likely adding a lot of fat. Trim the surplus by 100 to 200 kcal and recheck.',
        },
      ],
    },
    {
      id: 'bulk-macros',
      track: 'bulk',
      title: 'Bulking: protein and carbs',
      emoji: '🍚',
      cards: [
        {
          title: 'Enough protein',
          body: 'Around 1.6 to 2.2 g of protein per kg of bodyweight is plenty for building muscle in a surplus.',
        },
        {
          title: 'Carbs fuel the work',
          body: 'Carbohydrates make up most of the extra calories and power your training. Keep fat moderate and fill the rest with carbs.',
        },
      ],
      questions: [
        {
          kind: 'numeric',
          id: 'bm-1',
          prompt: 'You weigh 75 kg and choose 2.0 g of protein per kg. How many grams of protein per day is that?',
          unit: 'g',
          answer: 150,
          tolerance: 2,
          explain: '75 × 2.0 = 150 g protein.',
        },
        {
          kind: 'numeric',
          id: 'bm-2',
          prompt: 'Your target is 3,000 kcal with 160 g protein and 80 g fat. How many grams of carbs are left?',
          unit: 'g',
          answer: 410,
          tolerance: 3,
          explain: 'Protein 160 × 4 = 640 and fat 80 × 9 = 720. 3,000 − 640 − 720 = 1,640 kcal, and 1,640 ÷ 4 = 410 g carbs.',
        },
        {
          kind: 'mcq',
          id: 'bm-3',
          prompt: 'You struggle to eat enough on a bulk. What is the easiest fix?',
          options: ['Add calorie-dense foods like nuts, oils or milk', 'Eat more salad', 'Skip breakfast'],
          correct: 0,
          explain: 'Calorie-dense foods add energy without making you feel overly full.',
        },
      ],
    },
  ],
  maintain: [
    {
      id: 'maintain-find',
      track: 'maintain',
      title: 'Maintaining: find your number',
      emoji: '🎯',
      cards: [
        {
          title: 'What maintenance means',
          body: 'Maintenance is the calorie intake where your weight stays about the same. Online calculators give a starting guess, and your own data confirms it.',
        },
        {
          title: 'Check it with real data',
          body: 'Track your intake for two weeks and look at your weekly average weight. Each 1 kg of change is roughly 7,700 kcal, so you can adjust your estimate.',
        },
        {
          title: 'Daily weight jumps around',
          body: 'Body weight can swing by 1 to 2 kg from day to day because of water, salt and food in your gut. Use weekly averages.',
        },
      ],
      questions: [
        {
          kind: 'mcq',
          id: 'mf-1',
          prompt: 'What is the most reliable way to confirm your maintenance calories?',
          options: [
            'Use one online calculator and trust it forever',
            'Track intake for two weeks and compare weekly average weight',
            'Weigh yourself once',
          ],
          correct: 1,
          explain: 'Real intake plus a weight trend shows what your body actually does.',
        },
        {
          kind: 'numeric',
          id: 'mf-2',
          prompt: 'You ate 2,300 kcal a day for two weeks and lost 0.25 kg per week. Using 7,700 kcal per kg, roughly what is your maintenance?',
          unit: 'kcal',
          answer: 2575,
          tolerance: 100,
          explain: '0.25 × 7,700 ≈ 1,925 kcal per week, or about 275 per day. 2,300 + 275 ≈ 2,575 kcal.',
        },
        {
          kind: 'mcq',
          id: 'mf-3',
          prompt: 'You are 0.8 kg heavier on Monday than on Friday. What is the most likely reason?',
          options: ['Normal water and food fluctuation', 'You gained 0.8 kg of fat', 'Your maintenance has changed'],
          correct: 0,
          explain: 'Short-term swings are mostly water. Fat changes show up slowly in the weekly trend.',
        },
      ],
    },
    {
      id: 'maintain-flex',
      track: 'maintain',
      title: 'Maintaining: stay flexible',
      emoji: '🧘',
      cards: [
        {
          title: 'Aim for a range',
          body: 'Treat your target as a range of about 100 to 200 kcal either side. Some days are higher, some lower, and the average is what matters.',
        },
        {
          title: 'Protein first, then preference',
          body: 'Get enough protein, then split the rest between carbs and fat however suits your food preferences and training.',
        },
      ],
      questions: [
        {
          kind: 'numeric',
          id: 'mx-1',
          prompt: 'Your intake this week was 2,300, 2,500, 2,400, 2,600, 2,200, 2,700 and 2,100 kcal. What was your daily average?',
          unit: 'kcal',
          answer: 2400,
          tolerance: 10,
          explain: 'The total is 16,800 kcal, and 16,800 ÷ 7 = 2,400 kcal per day.',
        },
        {
          kind: 'mcq',
          id: 'mx-2',
          prompt: 'Your maintenance is 2,400 kcal and the week above averaged 2,400. How did you do?',
          options: ['Right on track', 'Off track because some days were over', 'Off track because some days were under'],
          correct: 0,
          explain: 'Individual days varied, but the average hit the target. That is exactly how flexible tracking works.',
        },
        {
          kind: 'mcq',
          id: 'mx-3',
          prompt: 'You are going to a friend’s dinner and will not know the calories. What is the best plan?',
          options: ['Estimate, enjoy it and carry on as normal', 'Do not go', 'Eat nothing all day beforehand'],
          correct: 0,
          explain: 'Tracking should fit into your life. A rough estimate is fine and one meal will not change your trend.',
        },
      ],
    },
  ],
}

export function lessonsForGoal(goal: Goal): Lesson[] {
  return [...CORE_LESSONS, ...GOAL_LESSONS[goal]]
}

export const GOAL_LABELS: Record<Goal, { label: string; emoji: string; blurb: string }> = {
  bulk: { label: 'Bulking', emoji: '💪', blurb: 'Build muscle with a small calorie surplus' },
  cut: { label: 'Cutting', emoji: '🔥', blurb: 'Lose fat while keeping muscle' },
  maintain: { label: 'Maintaining', emoji: '⚖️', blurb: 'Keep your weight steady and eat flexibly' },
}
