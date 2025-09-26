import { useEffect, useMemo, useRef, useState } from 'react';
import { generateProblem, listTopics, PracticeProblem } from '../learning/problemGenerators';
import { getEntry } from '../learning/learningModel';

export default function TimedPractice() {
  const topics = useMemo(()=>listTopics(), []);
  const [running, setRunning] = useState(false);
  const [duration, setDuration] = useState(300); // seconds default 5 minutes
  const [topic, setTopic] = useState<string>('ALL');
  const [current, setCurrent] = useState<PracticeProblem | null>(null);
  const [history, setHistory] = useState<{p: PracticeProblem, correct: boolean}[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<number | null>(null);

  const nextProblem = () => {
    const chosen = topic === 'ALL' ? topics[Math.floor(Math.random()*topics.length)] : topic as any;
    const lvl = topic === 'ALL' ? 2 : getEntry(topic.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')).level;
    setCurrent(generateProblem(chosen as any, lvl));
  };

  const start = () => {
    setHistory([]);
    setTimeLeft(duration);
    setRunning(true);
    nextProblem();
  };

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) { setRunning(false); return; }
    timerRef.current = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [running, timeLeft]);

  const submit = (correct: boolean) => {
    if (!current) return;
    setHistory(h => [...h, { p: current, correct }]);
    nextProblem();
  };

  const reset = () => {
    setRunning(false); setTimeLeft(0); setCurrent(null); setHistory([]);
  };

  const score = history.filter(h=>h.correct).length;

  return (
    <div className="space-y-4">
      {!running ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <div>
              <div className="text-xs text-gray-600">Topic</div>
              <select value={topic} onChange={e=>setTopic(e.target.value)} className="border rounded px-2 py-2">
                <option value="ALL">All Topics</option>
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div className="text-xs text-gray-600">Duration</div>
              <select value={duration} onChange={e=>setDuration(Number(e.target.value))} className="border rounded px-2 py-2">
                <option value={180}>3 minutes</option>
                <option value={300}>5 minutes</option>
                <option value={600}>10 minutes</option>
              </select>
            </div>
            <button onClick={start} className="ml-auto px-4 py-2 rounded bg-indigo-600 text-white">Start</button>
          </div>
          {history.length>0 && (
            <button onClick={reset} className="px-3 py-2 rounded border">Reset</button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="font-semibold">Time Left: {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
            <div className="ml-auto">Solved: {score} / {history.length}</div>
          </div>
          {current && (
            <div className="border rounded p-4 bg-white">
              <div className="text-xs text-gray-500 mb-1">{current.topic} • Level {current.difficulty}</div>
              <div className="font-medium text-gray-900 mb-3">{current.question}</div>
              <details className="mb-2">
                <summary className="cursor-pointer text-sm text-indigo-600">Reveal Answer</summary>
                <div className="mt-1 text-green-700 text-sm">{current.answer}</div>
              </details>
              <details>
                <summary className="cursor-pointer text-sm text-gray-700">Explanation</summary>
                <div className="mt-1 text-sm text-gray-800">{current.explanation}</div>
              </details>
              <div className="mt-3 flex gap-2">
                <button onClick={()=>submit(true)} className="px-3 py-2 rounded bg-emerald-600 text-white">I solved it</button>
                <button onClick={()=>submit(false)} className="px-3 py-2 rounded bg-red-600 text-white">I couldn’t</button>
              </div>
            </div>
          )}
        </div>
      )}

      {!running && history.length>0 && (
        <div className="p-4 bg-green-50 border rounded">
          <div className="font-semibold text-green-900">Session complete</div>
          <div className="text-sm text-green-800">You solved {score} out of {history.length} problems.</div>
        </div>
      )}
    </div>
  );
}
