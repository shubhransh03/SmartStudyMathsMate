import { slugify } from './learningModel';

export type Level = 1 | 2 | 3;

export interface PracticeProblem {
  id: string;
  topic: string;
  slug: string;
  question: string;
  answer: string;
  hints: string[];
  explanation: string;
  difficulty: Level;
}

// Seeded RNG (LCG)
export function seedRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function randInt(min: number, max: number, rng: (() => number) | null = null) {
  const r = (rng ? rng() : Math.random());
  return Math.floor(r * (max - min + 1)) + min;
}

export const TOPIC_NAMES = [
  // Number Systems
  'Real Numbers',
  'Rational & Irrational Numbers',
  'Number Properties',

  // Algebra
  'Linear Equations (One Variable)',
  'Linear Equations (Two Variables)',
  'Quadratic Equations',
  'Polynomials',

  // Geometry
  'Basic Geometry',
  'Triangles & Congruence',
  'Coordinate Geometry',
  'Circles',
  'Surface Areas & Volumes',

  // Statistics & Probability
  'Data Handling',
  'Mean, Median, Mode',
  'Probability Theory',
  'Statistical Graphs',

  // Trigonometry
  'Basic Ratios',
  'Trigonometric Identities',
  'Heights & Distances',
  'Applications',
] as const;

export type TopicName = typeof TOPIC_NAMES[number];

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function listTopics(): TopicName[] { return [...TOPIC_NAMES]; }

export function generateProblem(topic: TopicName, level: Level, rng: (() => number) | null = null): PracticeProblem {
  const id = makeId();
  const s = slugify(topic);
  // utility
  const pi = 3.14;

  switch (topic) {
    case 'Real Numbers': {
      const candidates = level === 1 ? [2,4,5,8,10,20,25,40,50] : level === 2 ? [3,6,12,15,30,45,75,125] : [7,9,11,14,18,21,27,28,33,55];
      const numerator = randInt(1, 9, rng);
      const denominator = candidates[randInt(0, candidates.length - 1, rng)];
      let d = denominator; const rm = (p:number)=>{while(d%p===0) d/=p;}; rm(2); rm(5);
      const isTerm = d === 1;
      return {
        id, topic, slug: s, difficulty: level,
        question: `Check whether ${numerator}/${denominator} has a terminating decimal expansion.`,
        answer: isTerm ? 'Terminating' : 'Non-terminating repeating',
        hints: [
          'Reduce denominator prime factors.',
          'A fraction has a terminating decimal iff denominator has no prime factors other than 2 and 5 (after simplification).',
        ],
        explanation: 'Remove factors 2 and 5 from the denominator. If it becomes 1, the decimal is terminating; otherwise, it is non-terminating repeating.'
      };
    }
    case 'Rational & Irrational Numbers': {
      const n = randInt(2, 50, rng);
      const q = `Is sqrt(${n}) rational or irrational?`;
      const r = Number.isInteger(Math.sqrt(n)) ? 'Rational' : 'Irrational';
      return {
        id, topic, slug: s, difficulty: level,
        question: q,
        answer: r,
        hints: ['A square root is rational only if n is a perfect square.'],
        explanation: Number.isInteger(Math.sqrt(n)) ? `${n} is a perfect square.` : `${n} is not a perfect square, so sqrt(${n}) is irrational.`
      };
    }
    case 'Number Properties': {
      const val = randInt(2, level===1?30:100, rng);
      const isPrime = (k:number)=>{ if(k<2) return false; for(let i=2;i*i<=k;i++){ if(k%i===0) return false; } return true; };
      const prop = isPrime(val) ? 'Prime' : (val%2===0 ? 'Composite (Even)' : 'Composite (Odd)');
      return { id, topic, slug: s, difficulty: level,
        question: `Classify ${val} as prime/composite and even/odd.`,
        answer: prop,
        hints: ['Check divisibility by small primes 2,3,5,7,...'],
        explanation: prop };
    }
    case 'Polynomials': {
      const a = randInt(1, level === 1 ? 3 : 5, rng);
      const b = randInt(1, level === 1 ? 5 : 9, rng);
      const c = randInt(0, level === 1 ? 5 : 12, rng);
      const x = randInt(1, 6, rng);
      const val = a*x*x + b*x + c;
      return {
        id, topic, slug: s, difficulty: level,
        question: `Evaluate P(x) = ${a}x^2 + ${b}x + ${c} at x = ${x}.` ,
        answer: String(val),
        hints: [
          'Substitute x into the polynomial.',
          'Compute x^2 first, then multiply by a and add the remaining terms.'
        ],
        explanation: `P(${x}) = ${a}·${x}^2 + ${b}·${x} + ${c} = ${a}·${x*x} + ${b*x} + ${c} = ${val}.`
      };
    }
    case 'Linear Equations (One Variable)': {
      const a = randInt(1, 10, rng);
      const b = randInt(1, 20, rng);
      const x = (-b/a).toFixed(2);
      return { id, topic, slug: s, difficulty: level,
        question: `Solve: ${a}x + ${b} = 0`,
        answer: `x = ${x}`,
        hints: ['Move constants to the other side.', 'Divide both sides by the coefficient of x.'],
        explanation: `x = −b/a = ${x}.` };
    }
    case 'Linear Equations (Two Variables)': {
      const coef = level === 1 ? [1,5] : level === 2 ? [2,9] : [5,15];
      const cons = level === 1 ? [1,20] : level === 2 ? [10,40] : [20,80];
      const a1 = randInt(coef[0], coef[1], rng), b1 = randInt(coef[0], coef[1], rng), c1 = randInt(cons[0], cons[1], rng);
      const a2 = randInt(coef[0], coef[1], rng), b2 = randInt(coef[0], coef[1], rng), c2 = randInt(cons[0], cons[1], rng);
      const det = a1*b2 - a2*b1;
      let ans = 'No unique solution'; let steps = 'Determinant (a1b2−a2b1) = 0 ⇒ no unique solution.';
      if (det !== 0) {
        const x = (c1*b2 - c2*b1) / det;
        const y = (a1*c2 - a2*c1) / det;
        ans = `x = ${x.toFixed(2)}, y = ${y.toFixed(2)}`;
        steps = `Use elimination/Cramer's rule: det=${det}. x=(c1b2−c2b1)/det, y=(a1c2−a2c1)/det.`;
      }
      return {
        id, topic, slug: s, difficulty: level,
        question: `Solve: ${a1}x + ${b1}y = ${c1}; ${a2}x + ${b2}y = ${c2}`,
        answer: ans,
        hints: [
          'Try elimination: make coefficients of x or y equal.',
          'Alternatively, use Cramer’s rule with determinants.'
        ],
        explanation: steps,
      };
    }
    case 'Quadratic Equations': {
      const r1 = randInt(level === 1 ? 1 : 5, level === 3 ? 25 : 15, rng);
      const r2 = randInt(level === 1 ? 1 : 5, level === 3 ? 25 : 15, rng);
      const b = -(r1 + r2);
      const c = r1 * r2;
      return {
        id, topic, slug: s, difficulty: level,
        question: `Find the roots of x^2 ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)} = 0`,
        answer: `x = ${r1}, ${r2}`,
        hints: [
          'Compare with x^2 − (sum)x + (product) = 0.',
          'Sum of roots = −b, product of roots = c.'
        ],
        explanation: `Factorization: (x − ${r1})(x − ${r2}) = 0 ⇒ roots ${r1} and ${r2}.`
      };
    }
    case 'Basic Geometry': {
      const l = randInt(2, level===1?10:20, rng);
      const w = randInt(2, level===1?10:20, rng);
      const peri = 2*(l+w);
      return { id, topic, slug: s, difficulty: level,
        question: `Find the perimeter of a rectangle with length ${l} and width ${w}.`,
        answer: String(peri),
        hints: ['Perimeter of rectangle = 2(l + w).'],
        explanation: `P = 2(l+w) = ${peri}.` };
    }
    case 'Triangles & Congruence': {
      const a = randInt(3, level === 1 ? 10 : 20, rng);
      const b = randInt(4, level === 1 ? 10 : 20, rng);
      const c = Math.sqrt(a*a + b*b).toFixed(2);
      return {
        id, topic, slug: s, difficulty: level,
        question: `Right triangle with legs ${a} and ${b}. Find hypotenuse length (2 dp).`,
        answer: c,
        hints: ['Pythagoras: c^2 = a^2 + b^2.'],
        explanation: `c = √(${a}^2 + ${b}^2) = ${c}.`
      };
    }
    
    case 'Coordinate Geometry': {
      const x1 = randInt(-10, 10, rng), y1 = randInt(-10, 10, rng);
      const x2 = randInt(-10, 10, rng), y2 = randInt(-10, 10, rng);
      const dist = Math.hypot(x2 - x1, y2 - y1).toFixed(2);
      return {
        id, topic, slug: s, difficulty: level,
        question: `Find the distance between A(${x1}, ${y1}) and B(${x2}, ${y2}). (2 dp)`,
        answer: dist,
        hints: ['Distance formula: √((x2−x1)^2 + (y2−y1)^2).', 'Compute differences, square, add, then take square root.'],
        explanation: `d = √((${x2}−${x1})^2 + (${y2}−${y1})^2) = ${dist}.`
      };
    }
    case 'Circles': {
      const r = randInt(1, level === 3 ? 15 : 10, rng);
      const which = randInt(0,1, rng) === 0 ? 'area' : 'circumference';
      const area = (pi * r * r).toFixed(2);
      const circ = (2 * pi * r).toFixed(2);
      return {
        id, topic, slug: s, difficulty: level,
        question: `A circle has radius r = ${r}. Find its ${which}. (π≈3.14)`,
        answer: which === 'area' ? area : circ,
        hints: ['Area = πr^2, Circumference = 2πr.', 'Plug r into the chosen formula.'],
        explanation: which === 'area' ? `A = πr^2 = ${area}.` : `C = 2πr = ${circ}.`
      };
    }
  case 'Surface Areas & Volumes': {
      const type = ['cuboid','cylinder','sphere','cone'][randInt(0,3,rng)];
      if (type === 'cuboid') {
        const l = randInt(2, level === 1 ? 6 : 12, rng);
        const b = randInt(2, level === 1 ? 6 : 12, rng);
        const h = randInt(2, level === 1 ? 6 : 12, rng);
        return { id, topic, slug: s, difficulty: level,
          question:`Find the volume of a cuboid ${l}×${b}×${h}.`,
          answer: String(l*b*h),
          hints: ['Volume of cuboid = l×b×h.'],
          explanation: `V = lbh = ${l*b*h}.` };
      }
      if (type === 'cylinder') {
        const r = randInt(2, level === 1 ? 6 : 10, rng);
        const h = randInt(3, level === 1 ? 10 : 20, rng);
        const vol = (pi*r*r*h).toFixed(2);
        return { id, topic, slug: s, difficulty: level,
          question:`Find the volume of a cylinder (r=${r}, h=${h}). (π≈3.14)`,
          answer: vol, hints: ['Volume = πr^2h.'], explanation: `V = πr^2h = ${vol}.` };
      }
      if (type === 'sphere') {
        const r = randInt(2, level === 1 ? 6 : 10, rng);
        const area = (4*pi*r*r).toFixed(2);
        return { id, topic, slug: s, difficulty: level,
          question:`Find the surface area of a sphere (r=${r}). (π≈3.14)`,
          answer: area, hints: ['Surface area = 4πr^2.'], explanation: `S = 4πr^2 = ${area}.` };
      }
      const r = randInt(2, level === 1 ? 6 : 10, rng);
      const h = randInt(3, level === 1 ? 10 : 20, rng);
      const vol = (pi*r*r*h/3).toFixed(2);
      return { id, topic, slug: s, difficulty: level,
        question:`Find the volume of a cone (r=${r}, h=${h}). (π≈3.14)`,
        answer: vol, hints: ['Volume = (1/3)πr^2h.'], explanation: `V = (1/3)πr^2h = ${vol}.` };
    }
    case 'Mean, Median, Mode': {
      const n = level === 1 ? 5 : level === 2 ? 7 : 9;
      const arr = Array.from({length:n}, () => randInt(1, 20, rng));
      const choice = level === 3 ? ['mean','median','mode'][randInt(0,2,rng)] : 'mean';
      if (choice === 'median') {
        const sorted = [...arr].sort((a,b)=>a-b);
        const med = sorted[Math.floor(n/2)];
        return { id, topic, slug: s, difficulty: level,
          question: `Find the median of the data set: [${arr.join(', ')}].`,
          answer: String(med), hints: ['Sort the data; median is the middle value.'],
          explanation: `Sorted: [${sorted.join(', ')}], median is ${med}.` };
      } else if (choice === 'mode') {
        const freq = new Map<number, number>(); arr.forEach(v=>freq.set(v,(freq.get(v)||0)+1));
        let best = arr[0], bestC = 0; for (const [k,c] of freq) { if (c>bestC) { best=k; bestC=c; } }
        return { id, topic, slug: s, difficulty: level,
          question: `Find the mode of the data set: [${arr.join(', ')}].`,
          answer: String(best), hints: ['Mode is the most frequent value.'],
          explanation: `Frequencies: ${[...freq.entries()].map(([k,c])=>`${k}:${c}`).join(', ')}; mode is ${best}.` };
      } else {
        const mean = (arr.reduce((a,b)=>a+b,0)/n).toFixed(2);
        return { id, topic, slug: s, difficulty: level,
          question: `Find the mean of the data set: [${arr.join(', ')}] (2 dp).`,
          answer: mean, hints: ['Mean = (sum of observations) / (number of observations).'],
          explanation: `Mean = (${arr.join(' + ')})/${n} = ${mean}.` };
      }
    }
    case 'Data Handling': {
      const n = level === 1 ? 5 : level === 2 ? 7 : 9;
      const arr = Array.from({length:n}, () => randInt(1, 50, rng));
      const range = Math.max(...arr) - Math.min(...arr);
      return { id, topic, slug: s, difficulty: level,
        question: `Find the range of the data set: [${arr.join(', ')}].`,
        answer: String(range),
        hints: ['Range = max − min.'],
        explanation: `max − min = ${range}.` };
    }
    case 'Probability Theory': {
      const need = level === 1 ? 'even number' : level === 2 ? 'a number > 3' : 'a prime number';
      let answer = '';
      if (need === 'even number') answer = '1/2';
      else if (need === 'a number > 3') answer = '1/2';
      else answer = '1/2'; // primes: 2,3,5
      return { id, topic, slug: s, difficulty: level,
        question: `A fair die is rolled once. What is the probability of getting ${need}?`,
        answer,
        hints: ['Count favorable outcomes / total outcomes.', 'For a die, total outcomes = 6.'],
        explanation: 'Favorable outcomes are 3, total is 6, probability = 3/6 = 1/2.' };
    }
    case 'Statistical Graphs': {
      const q = `Which graph is most suitable to compare categories across a single variable?`;
      const a = 'Bar graph';
      return { id, topic, slug: s, difficulty: level, question: q, answer: a, hints: ['Bar for categories, line for trends, pie for proportions.'], explanation: 'Bar charts compare categories effectively.' };
    }
    case 'Basic Ratios': {
      const angles = level === 1 ? [0,30,45,60,90] : [30,45,60];
      const funcs = ['sin','cos','tan'] as const;
      const ang = angles[randInt(0, angles.length-1, rng)];
      const fn = funcs[randInt(0, funcs.length-1, rng)];
      const table:any = {
        sin: {0:'0',30:'1/2',45:'1/√2',60:'√3/2',90:'1'},
        cos: {0:'1',30:'√3/2',45:'1/√2',60:'1/2',90:'0'},
        tan: {0:'0',30:'1/√3',45:'1',60:'√3',90:'undefined'}
      };
      return { id, topic, slug: s, difficulty: level, question: `Find ${fn} ${ang}°`, answer: table[fn][ang], hints: ['Use special-angle table.'], explanation: `From special angles, ${fn} ${ang}° = ${table[fn][ang]}.` };
    }
    case 'Trigonometric Identities': {
      const a = randInt(1, 5, rng);
      const b = randInt(1, 5, rng);
      const q = `Verify: sin^2θ + cos^2θ = 1 for θ = ${a}π/${b}`;
      return { id, topic, slug: s, difficulty: level, question: q, answer: 'Identity holds', hints: ['Use sin^2 + cos^2 = 1 for all θ.'], explanation: 'It is a fundamental identity for any angle θ.' };
    }
    case 'Heights & Distances': {
      const h = randInt(5, 30, rng); const d = randInt(5, 50, rng);
      const q = `An observer ${h} m tall stands ${d} m from a building. Approximate tan(θ) = opposite/adjacent. What is tan(θ)?`;
      const a = (h/d).toFixed(2);
      return { id, topic, slug: s, difficulty: level, question: q, answer: a, hints: ['tan θ = height/distance.'], explanation: `tan θ = ${h}/${d} = ${a}.` };
    }
    case 'Applications': {
      const r = randInt(5, 20, rng);
      const q = `A ladder reaches the top of a wall when inclined at 60°. If the foot is ${r} m from the wall, find the ladder length (hypotenuse).`;
      const a = (r/Math.cos(Math.PI/3)).toFixed(2);
      return { id, topic, slug: s, difficulty: level, question: q, answer: a, hints: ['Use cos θ = adjacent/hypotenuse.'], explanation: `L = adjacent/cos 60° = ${r}/0.5 = ${a}.` };
    }
    
  }
}

export function generateBatch(topics: TopicName[] | 'ALL', level: Level, count: number, rng: (() => number) | null = null): PracticeProblem[] {
  const list = topics === 'ALL' ? TOPIC_NAMES : topics;
  const out: PracticeProblem[] = [];
  for (let i=0;i<count;i++) {
    const t = list[randInt(0, list.length-1, rng)];
    out.push(generateProblem(t, level, rng));
  }
  return out;
}
