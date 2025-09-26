import { useEffect, useState } from 'react';

type FnKind = 'linear' | 'quadratic';

export default function AnimatedTransformations({ kind = 'linear' as FnKind }: { kind?: FnKind }) {
  const [step, setStep] = useState(0);
  const maxStep = kind === 'linear' ? 3 : 4;

  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % (maxStep + 1)), 1400);
    return () => clearInterval(id);
  }, [maxStep]);

  // map function to points
  const points: Array<{x:number,y:number}> = [];
  for (let x = -10; x <= 10; x+=1) {
    let y = x;
    if (kind === 'linear') {
      // y = 0.5x initially, then shift and scale
      y = 0.5 * x;
      if (step >= 1) y = 0.5 * (x - 2); // shift right
      if (step >= 2) y = (0.5*2) * (x - 2); // scale slope
      if (step >= 3) y = (0.5*2) * (x - 2) + 1; // vertical shift
    } else {
      // y = x^2 baseline, then transformations
      y = x*x/10;
      if (step >= 1) y = (x-2)*(x-2)/10; // shift right
      if (step >= 2) y = 2*((x-2)*(x-2))/10; // vertical stretch
      if (step >= 3) y = 2*((x-2)*(x-2))/10 + 1; // up shift
      if (step >= 4) y = 2*((x-2)*(x-2))/10 + 1 - 0.5; // fine move
    }
    points.push({x,y});
  }

  // coordinate transform to SVG
  const toX = (x:number) => 200 + x * 10;
  const toY = (y:number) => 120 - y * 10;
  const path = points.map((p,i) => `${i===0?'M':'L'} ${toX(p.x)} ${toY(p.y)}`).join(' ');

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-gray-800">Animated Explanations</div>
        <div className="text-sm text-gray-500">Step {step}/{maxStep}</div>
      </div>
      <svg viewBox="0 0 400 240" className="w-full h-56 border rounded bg-white">
        {/* axes */}
        <line x1="0" y1="120" x2="400" y2="120" stroke="#9CA3AF" strokeWidth="1"/>
        <line x1="200" y1="0" x2="200" y2="240" stroke="#9CA3AF" strokeWidth="1"/>
        {/* path */}
        <path d={path} fill="none" stroke="#2563EB" strokeWidth="2"/>
      </svg>
      <div className="text-xs text-gray-500 mt-2">This animation shows step-by-step transformations of a {kind} function.</div>
    </div>
  );
}
