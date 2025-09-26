import { useMemo, useState } from 'react';
import { generateBatch, seedRng, PracticeProblem } from '../learning/problemGenerators';

function todaySeed() {
  const d = new Date();
  const key = Number(`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`);
  return key;
}

export default function DailyChallenge() {
  const seed = todaySeed();
  const rng = useMemo(()=>seedRng(seed), [seed]);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, 'right'|'wrong'|undefined>>({});
  const problems = useMemo<PracticeProblem[]>(() => generateBatch('ALL', 2, 5, rng), [rng]);

  const score = Object.values(answers).filter(v=>v==='right').length;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-indigo-50 border rounded">
        <div className="font-semibold text-indigo-900">Today’s Challenge</div>
        <div className="text-sm text-indigo-800">A fixed set of 5 problems generated for {new Date().toDateString()}.</div>
      </div>

      {!started ? (
        <button onClick={()=>setStarted(true)} className="px-4 py-2 rounded bg-indigo-600 text-white">Start Challenge</button>
      ) : !completed ? (
        <div className="space-y-4">
          {problems.map((p, idx) => (
            <div key={p.id} className="border rounded-lg p-4 bg-white">
              <div className="text-xs text-gray-500 mb-1">Q{idx+1}. {p.topic} • Level {p.difficulty}</div>
              <div className="font-medium text-gray-900 mb-2">{p.question}</div>
              {/* Lightweight reveal */}
              <details className="mb-2">
                <summary className="cursor-pointer text-sm text-indigo-600">Reveal Answer</summary>
                <div className="mt-1 text-green-700 text-sm">{p.answer}</div>
              </details>
              <details>
                <summary className="cursor-pointer text-sm text-gray-700">Explanation</summary>
                <div className="mt-1 text-sm text-gray-800">{p.explanation}</div>
              </details>
              <div className="mt-3 flex gap-2">
                <button onClick={()=>setAnswers(a=>({...a, [p.id]:'right'}))} className={`px-2 py-1 text-xs rounded ${answers[p.id]==='right'?'bg-green-600 text-white':'border'}`}>I solved it</button>
                <button onClick={()=>setAnswers(a=>({...a, [p.id]:'wrong'}))} className={`px-2 py-1 text-xs rounded ${answers[p.id]==='wrong'?'bg-red-600 text-white':'border'}`}>I couldn’t</button>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-700">Progress: {score}/{problems.length}</div>
            <button onClick={()=>setCompleted(true)} className="ml-auto px-4 py-2 rounded bg-emerald-600 text-white">Complete Challenge</button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-green-50 border rounded">
          <div className="font-semibold text-green-900">Great job!</div>
          <div className="text-sm text-green-800">You scored {score} out of {problems.length}.</div>
        </div>
      )}
    </div>
  );
}
