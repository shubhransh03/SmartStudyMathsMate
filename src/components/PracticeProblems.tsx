import { useMemo, useState } from 'react';
import { RefreshCw, CheckCircle2, HelpCircle, Eye, EyeOff, Lightbulb, FileText } from 'lucide-react';
import { getEntry, updateMastery, slugify, TOPICS } from '../learning/learningModel';
import { PracticeProblem as GenProblem, generateProblem, TOPIC_NAMES } from '../learning/problemGenerators';

interface Problem { question: string; answer: number | string; topic: string; hints?: string[]; explanation?: string; }

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generators = {
  'Real Numbers': (level: 1|2|3): Problem => {
    // Terminating/non-terminating based on prime factors of denominator (2 & 5 only)
    const denomCandidates = level === 1 ? [2,4,5,8,10,20,25,40,50] : level === 2 ? [3,6,12,15,30,45,75,125] : [7,9,11,14,18,21,27,28,33,55];
    const numerator = randInt(1, 9);
    const denominator = denomCandidates[randInt(0, denomCandidates.length - 1)];
    const isTerminating = ((): boolean => {
      let d = denominator;
      const remove = (p:number) => { while (d % p === 0) d /= p; };
      remove(2); remove(5);
      return d === 1;
    })();
    return {
      topic: 'Real Numbers',
      question: `Check whether ${numerator}/${denominator} has a terminating decimal expansion.`,
      answer: isTerminating ? 'Terminating' : 'Non-terminating repeating',
    };
  },
  'Polynomials': (level: 1|2|3): Problem => {
    // Evaluate polynomial at x=k or factor simple quadratic/cubic patterns
    const a = randInt(1, level === 1 ? 3 : 5);
    const b = randInt(1, level === 1 ? 5 : 9);
    const c = randInt(0, level === 1 ? 5 : 12);
    const x = randInt(1, 6);
    const val = a*x*x + b*x + c;
    return {
      topic: 'Polynomials',
      question: `Evaluate P(x) = ${a}x^2 + ${b}x + ${c} at x = ${x}.`,
      answer: val,
    };
  },
  'Linear Equations (Two Variables)': (level: 1|2|3): Problem => {
    const coef = level === 1 ? [1,5] : level === 2 ? [2,9] : [5,15];
    const cons = level === 1 ? [1,20] : level === 2 ? [10,40] : [20,80];
    const a1 = randInt(coef[0], coef[1]), b1 = randInt(coef[0], coef[1]), c1 = randInt(cons[0], cons[1]);
    const a2 = randInt(coef[0], coef[1]), b2 = randInt(coef[0], coef[1]), c2 = randInt(cons[0], cons[1]);
    const det = a1 * b2 - a2 * b1;
    let ans: string = 'No unique solution';
    if (det !== 0) {
      const x = (c1 * b2 - c2 * b1) / det;
      const y = (a1 * c2 - a2 * c1) / det;
      ans = `x = ${x.toFixed(2)}, y = ${y.toFixed(2)}`;
    }
    return {
      topic: 'Linear Equations (Two Variables)',
      question: `Solve: ${a1}x + ${b1}y = ${c1}; ${a2}x + ${b2}y = ${c2}`,
      answer: ans,
    };
  },
  'Quadratic Equations': (level: 1|2|3): Problem => {
    const rRange = level === 1 ? [1,10] : level === 2 ? [5,15] : [10,25];
    const r1 = randInt(rRange[0], rRange[1]);
    const r2 = randInt(rRange[0], rRange[1]);
    const b = -(r1 + r2);
    const c = r1 * r2;
    return {
      topic: 'Quadratic Equations',
      question: `Find the roots of x^2 ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)} = 0`,
      answer: `x = ${r1}, ${r2}`,
    };
  },
  // Legacy fallbacks retained for older routes; prefer centralized generator below
  'Coordinate Geometry': (level: 1|2|3): Problem => {
    const range = level === 1 ? [0,5] : level === 2 ? [-5,8] : [-10,10];
    const x1 = randInt(range[0], range[1]);
    const y1 = randInt(range[0], range[1]);
    const x2 = randInt(range[0], range[1]);
    const y2 = randInt(range[0], range[1]);
    const dist = Math.hypot(x2 - x1, y2 - y1);
    return {
      topic: 'Coordinate Geometry',
      question: `Find the distance between A(${x1}, ${y1}) and B(${x2}, ${y2}). (2 decimal places)`,
      answer: dist.toFixed(2),
    };
  },
  'Triangles': (level: 1|2|3): Problem => {
    const a = randInt(3, level === 1 ? 10 : 20);
    const b = randInt(4, level === 1 ? 10 : 20);
    const c = Math.sqrt(a*a + b*b);
    return { topic: 'Triangles', question: `Right triangle with legs ${a} and ${b}. Find hypotenuse length (2 dp).`, answer: c.toFixed(2) };
  },
  'Circles': (level: 1|2|3): Problem => {
    const r = randInt(level === 1 ? 1 : 3, level === 3 ? 15 : 10);
    const which = randInt(0,1) === 0 ? 'area' : 'circumference';
    const area = (Math.PI * r * r).toFixed(2);
    const circ = (2 * Math.PI * r).toFixed(2);
    return {
      topic: 'Circles',
      question: `A circle has radius r = ${r}. Find its ${which}. (π≈3.14)`,
      answer: which === 'area' ? `${area}` : `${circ}`,
    };
  },
  'Surface Areas and Volumes': (level: 1|2|3): Problem => {
    const type = ['cuboid','cylinder','sphere','cone'][randInt(0,3)];
    if (type === 'cuboid') {
      const l = randInt(2, level === 1 ? 6 : 12);
      const b = randInt(2, level === 1 ? 6 : 12);
      const h = randInt(2, level === 1 ? 6 : 12);
      return { topic:'Surface Areas and Volumes', question:`Find the volume of a cuboid ${l}×${b}×${h}.`, answer: l*b*h };
    }
    if (type === 'cylinder') {
      const r = randInt(2, level === 1 ? 6 : 10);
      const h = randInt(3, level === 1 ? 10 : 20);
      return { topic:'Surface Areas and Volumes', question:`Find the volume of a cylinder (r=${r}, h=${h}). (π≈3.14)`, answer: (Math.PI*r*r*h).toFixed(2) };
    }
    if (type === 'sphere') {
      const r = randInt(2, level === 1 ? 6 : 10);
      return { topic:'Surface Areas and Volumes', question:`Find the surface area of a sphere (r=${r}). (π≈3.14)`, answer: (4*Math.PI*r*r).toFixed(2) };
    }
    // cone
    const r = randInt(2, level === 1 ? 6 : 10);
    const h = randInt(3, level === 1 ? 10 : 20);
    return { topic:'Surface Areas and Volumes', question:`Find the volume of a cone (r=${r}, h=${h}). (π≈3.14)`, answer: (Math.PI*r*r*h/3).toFixed(2) };
  },
  'Statistics': (level: 1|2|3): Problem => {
    const n = level === 1 ? 5 : level === 2 ? 7 : 9;
    const arr = Array.from({length:n}, () => randInt(1, 20));
    const mean = (arr.reduce((a,b)=>a+b,0)/n).toFixed(2);
    return { topic: 'Statistics', question: `Find the mean of the data set: [${arr.join(', ')}] (2 dp).`, answer: mean };
  },
  'Probability': (level: 1|2|3): Problem => {
    // Dice roll probability
    const need = level === 1 ? 'even number' : level === 2 ? 'a number > 3' : 'a prime number';
    let answer = '';
    if (need === 'even number') answer = '1/2';
    else if (need === 'a number > 3') answer = '1/2';
    else answer = '1/2'; // primes on a die: 2,3,5 => 3/6=1/2
    return {
      topic: 'Probability',
      question: `A fair die is rolled once. What is the probability of getting ${need}?`,
      answer,
    };
  },
  'Trigonometry': (level: 1|2|3): Problem => {
    const angles = level === 1 ? [0,30,45,60,90] : level === 2 ? [30,45,60] : [0,30,45,60,90];
    const funcs = ['sin','cos','tan'] as const;
    const ang = angles[randInt(0, angles.length-1)];
    const fn = funcs[randInt(0, funcs.length-1)];
    const table:any = {
      sin: {0:'0',30:'1/2',45:'1/√2',60:'√3/2',90:'1'},
      cos: {0:'1',30:'√3/2',45:'1/√2',60:'1/2',90:'0'},
      tan: {0:'0',30:'1/√3',45:'1',60:'√3',90:'undefined'}
    };
    return {
      topic: 'Trigonometry',
      question: `Find ${fn} ${ang}°`,
      answer: table[fn][ang],
    };
  },
} as const;

const topics = [...TOPIC_NAMES] as Array<string>;

const PracticeProblems = ({ topic: topicProp }: { topic?: string }) => {
  const resolveTopic = (name?: string): typeof topics[number] => {
    if (!name) return 'Real Numbers';
    const target = slugify(name);
    const found = topics.find(t => slugify(t) === target) || topics.find(t => name.toLowerCase().includes(t.toLowerCase()));
    return found || 'Real Numbers';
  };
  const initial = resolveTopic(topicProp);
  const [topic, setTopic] = useState<typeof topics[number]>(initial);
  const [revealed, setRevealed] = useState(false);
  const chosenSlug = useMemo(() => {
    if (topicProp) {
      const found = TOPICS.find(t => t.name === topicProp);
      return found ? found.slug : slugify(topicProp);
    }
    return slugify(topic);
  }, [topicProp, topic]);
  const level = getEntry(chosenSlug).level;
  const [problem, setProblem] = useState<Problem>(() => {
    try {
      const gp: GenProblem = generateProblem(initial as any, level);
      return { topic: gp.topic, question: gp.question, answer: gp.answer, hints: gp.hints, explanation: gp.explanation };
    } catch {
      const g = (generators as any)[initial];
      return g ? g(level) : { topic: initial, question: 'Practice question unavailable for this topic.', answer: '' };
    }
  });
  const [hintIndex, setHintIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const regenerate = () => {
    setRevealed(false);
    setHintIndex(0);
    setShowExplanation(false);
    // Try to use richer generator (with hints/explanation), fallback to local simple one
    try {
      const gp: GenProblem = generateProblem(topic as any, getEntry(chosenSlug).level);
      setProblem({ topic: gp.topic, question: gp.question, answer: gp.answer, hints: gp.hints, explanation: gp.explanation });
    } catch {
      const g = (generators as any)[topic];
      setProblem(g ? g(getEntry(chosenSlug).level) : { topic, question: 'Practice question unavailable for this topic.', answer: '' });
    }
  };

  // Ensure question updates when topic changes
  useMemo(() => {
    setRevealed(false);
    setHintIndex(0);
    setShowExplanation(false);
    try {
      const gp: GenProblem = generateProblem(topic as any, getEntry(chosenSlug).level);
      setProblem({ topic: gp.topic, question: gp.question, answer: gp.answer, hints: gp.hints, explanation: gp.explanation });
    } catch {
      const g = (generators as any)[topic];
      setProblem(g ? g(getEntry(chosenSlug).level) : { topic, question: 'Practice question unavailable for this topic.', answer: '' });
    }
  }, [topic, chosenSlug]);

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="h-6 w-6 text-indigo-600" />
        <h3 className="text-lg font-bold text-gray-900">Practice Problems</h3>
      </div>
      {!topicProp && (
        <div className="flex flex-wrap gap-2 mb-3">
          {topics.map(t => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`px-3 py-1 rounded-full border text-sm transition-colors ${topic === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'}`}
            >{t}</button>
          ))}
        </div>
      )}

      <div className="p-4 bg-indigo-50/60 rounded-xl ring-1 ring-indigo-100 mb-3">
        <p className="text-gray-900 font-medium">{problem.question}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
          <span>Difficulty Level: {level}</span>
        </div>
      </div>

      {hintIndex > 0 && problem.hints && problem.hints[hintIndex-1] && (
        <div className="mt-2 p-2 bg-yellow-50 border text-yellow-800 text-sm rounded">
          <Lightbulb className="inline h-4 w-4 mr-1"/> Hint {hintIndex}: {problem.hints[hintIndex-1]}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button onClick={regenerate} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 border flex items-center shadow-sm">
          <RefreshCw className="h-4 w-4 mr-1"/> New Problem
        </button>
        <button onClick={() => setRevealed(r=>!r)} className="px-3 py-2 rounded-lg bg-indigo-600 text-white flex items-center shadow-sm">
          {revealed ? <EyeOff className="h-4 w-4 mr-1"/> : <Eye className="h-4 w-4 mr-1"/>}
          {revealed ? 'Hide Answer' : 'Reveal Answer'}
        </button>
        <button onClick={() => setHintIndex(i => Math.min((problem.hints?.length||0), i+1))} className="px-3 py-2 rounded-lg border shadow-sm">Show Hint</button>
        <button onClick={() => setShowExplanation(s=>!s)} className="px-3 py-2 rounded-lg border shadow-sm">{showExplanation ? 'Hide' : 'Show'} Explanation</button>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => { updateMastery(chosenSlug, true); setRevealed(true); }} className="px-2 py-1 text-xs rounded-lg bg-green-600 text-white flex items-center shadow-sm"><CheckCircle2 className="h-4 w-4 mr-1"/> I got it right</button>
          <button onClick={() => {
            updateMastery(chosenSlug, false);
            setRevealed(true);
            // Hand off to AI Problem Solver
            const payload = `Problem: ${problem.question}`;
            const evt = new CustomEvent('studymate:solve-problem', { detail: { prompt: payload, autoSolve: true, scroll: true } });
            window.dispatchEvent(evt);
          }} className="px-2 py-1 text-xs rounded-lg bg-red-600 text-white shadow-sm">I need help</button>
        </div>
      </div>

      {revealed && (
        <div className="mt-3 p-3 bg-green-50 border rounded-lg flex items-center text-green-800 text-sm transition-all duration-200 transform animate-[fadeIn_0.2s_ease-out]">
          <CheckCircle2 className="h-4 w-4 mr-2"/> Answer: <span className="ml-2 font-semibold">{problem.answer}</span>
        </div>
      )}

      {showExplanation && problem.explanation && (
        <div className="mt-3 p-3 bg-blue-50 border rounded-lg text-blue-800 text-sm transition-all duration-200 transform animate-[fadeIn_0.2s_ease-out]">
          <FileText className="inline h-4 w-4 mr-1"/> {problem.explanation}
        </div>
      )}
    </div>
  );
};

export default PracticeProblems;
