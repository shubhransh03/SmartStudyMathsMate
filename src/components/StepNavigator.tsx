import { useState } from 'react';

export interface StepItem {
  title?: string;
  content: string;
}

export default function StepNavigator({ steps }: { steps: StepItem[] }) {
  const [idx, setIdx] = useState(0);
  const total = steps.length;
  const canPrev = idx > 0;
  const canNext = idx < total - 1;

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-gray-800">Step {idx+1} of {total}</div>
        <div className="flex gap-2">
          <button disabled={!canPrev} onClick={()=>setIdx(i=>Math.max(0,i-1))} className={`px-3 py-1 rounded border ${!canPrev?'opacity-50':''}`}>Prev</button>
          <button disabled={!canNext} onClick={()=>setIdx(i=>Math.min(total-1,i+1))} className={`px-3 py-1 rounded border ${!canNext?'opacity-50':''}`}>Next</button>
        </div>
      </div>
      {steps[idx]?.title && <div className="text-sm text-gray-600 mb-1">{steps[idx].title}</div>}
      <div className="text-gray-900 whitespace-pre-wrap">{steps[idx]?.content}</div>
    </div>
  );
}
