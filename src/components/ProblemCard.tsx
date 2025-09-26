import { useState } from 'react';
import { Eye, EyeOff, Lightbulb, FileText, CheckCircle2 } from 'lucide-react';
import { PracticeProblem } from '../learning/problemGenerators';
import { updateMastery } from '../learning/learningModel';

export default function ProblemCard({ problem }: { problem: PracticeProblem }) {
  const [revealed, setRevealed] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="text-gray-500 text-xs mb-1">{problem.topic} • Level {problem.difficulty}</div>
      <div className="font-medium text-gray-900">{problem.question}</div>

      {hintIndex > 0 && (
        <div className="mt-3 p-2 bg-yellow-50 border text-yellow-800 text-sm rounded">
          <Lightbulb className="inline h-4 w-4 mr-1"/> Hint {hintIndex}: {problem.hints[hintIndex-1]}
        </div>
      )}

      {revealed && (
        <div className="mt-3 p-2 bg-green-50 border text-green-800 text-sm rounded flex items-center">
          <CheckCircle2 className="h-4 w-4 mr-1"/> Answer: <span className="ml-2 font-semibold">{problem.answer}</span>
        </div>
      )}

      {showExplanation && (
        <div className="mt-3 p-2 bg-blue-50 border text-blue-800 text-sm rounded">
          <FileText className="inline h-4 w-4 mr-1"/> {problem.explanation}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <button onClick={() => setRevealed(r=>!r)} className="px-3 py-2 rounded bg-indigo-600 text-white flex items-center">
          {revealed ? <EyeOff className="h-4 w-4 mr-1"/> : <Eye className="h-4 w-4 mr-1"/>}
          {revealed ? 'Hide Answer' : 'Reveal Answer'}
        </button>
        <button onClick={() => setHintIndex(i => Math.min(problem.hints.length, i+1))} className="px-3 py-2 rounded border">Show Hint</button>
        <button onClick={() => setShowExplanation(s=>!s)} className="px-3 py-2 rounded border">{showExplanation ? 'Hide' : 'Show'} Explanation</button>
        <div className="ml-auto flex gap-2">
          <button onClick={() => updateMastery(problem.slug, true)} className="px-2 py-1 text-xs rounded bg-green-600 text-white">I got it right</button>
          <button onClick={() => updateMastery(problem.slug, false)} className="px-2 py-1 text-xs rounded bg-red-600 text-white">I need help</button>
        </div>
      </div>
    </div>
  );
}
