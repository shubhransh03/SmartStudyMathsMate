import { useState } from 'react';

interface Point { x:number; y:number }

export default function GraphPaper() {
  const [points, setPoints] = useState<Point[]>([]);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const { x, y } = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    // snap to grid of 20px
    const gx = Math.round(x / 20) * 20;
    const gy = Math.round(y / 20) * 20;
    setPoints(prev => [...prev, { x: gx, y: gy }]);
  };

  const clear = () => setPoints([]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="font-semibold text-gray-800">Graph Paper Mode</div>
        <button onClick={clear} className="ml-auto px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 border">Clear</button>
      </div>
      <svg viewBox="0 0 600 360" className="w-full h-72 border rounded bg-white" onClick={handleClick}>
        <defs>
          <pattern id="grid20" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid20)" />
        {points.map((p,i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="#DC2626" />
        ))}
      </svg>
      <div className="text-xs text-gray-500 mt-2">Click on the grid to plot points. Points snap to the nearest grid intersection.</div>
    </div>
  );
}
