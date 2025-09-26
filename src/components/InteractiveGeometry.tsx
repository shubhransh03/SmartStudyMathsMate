import { useRef, useState } from 'react';

type Shape =
  | { id: string; kind: 'circle'; cx: number; cy: number; r: number; color: string }
  | { id: string; kind: 'rect'; x: number; y: number; w: number; h: number; color: string }
  | { id: string; kind: 'triangle'; x1: number; y1: number; x2: number; y2: number; x3: number; y3: number; color: string };

const colors = ['#2563EB', '#16A34A', '#DC2626', '#9333EA', '#F59E0B'];

export default function InteractiveGeometry() {
  const [shapes, setShapes] = useState<Shape[]>([{
    id: 'c1', kind: 'circle', cx: 120, cy: 120, r: 40, color: colors[0]
  },{
    id: 'r1', kind: 'rect', x: 200, y: 80, w: 100, h: 70, color: colors[1]
  },{
    id: 't1', kind: 'triangle', x1: 80, y1: 220, x2: 140, y2: 180, x3: 180, y3: 240, color: colors[2]
  }]);
  const [dragId, setDragId] = useState<string | null>(null);
  const dragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const pickColor = () => colors[Math.floor(Math.random() * colors.length)];

  const onDown = (e: React.MouseEvent | React.TouchEvent, id: string, center?: { x: number; y: number }) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const target = e.currentTarget as SVGElement;
    const svg = target.ownerSVGElement as SVGSVGElement;
    const pt = svg.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    const { x, y } = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const cx = center?.x ?? x; const cy = center?.y ?? y;
    dragOffset.current = { dx: cx - x, dy: cy - y };
    setDragId(id);
  };

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragId) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const svg = (e.currentTarget as SVGSVGElement);
    const pt = svg.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    const { x, y } = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const { dx, dy } = dragOffset.current;
    setShapes(prev => prev.map(s => {
      if (s.id !== dragId) return s;
      if (s.kind === 'circle') return { ...s, cx: x + dx, cy: y + dy };
      if (s.kind === 'rect') return { ...s, x: x + dx - s.w/2, y: y + dy - s.h/2 };
      return { ...s, 
        x1: x + dx - 20, y1: y + dy - 20,
        x2: x + dx + 20, y2: y + dy - 20,
        x3: x + dx,     y3: y + dy + 20,
      };
    }));
  };

  const onUp = () => setDragId(null);

  const addCircle = () => setShapes(prev => [...prev, { id: `c${prev.length+1}`, kind: 'circle', cx: 100, cy: 100, r: 30, color: pickColor() }]);
  const addRect = () => setShapes(prev => [...prev, { id: `r${prev.length+1}`, kind: 'rect', x: 160, y: 120, w: 90, h: 60, color: pickColor() }]);
  const addTriangle = () => setShapes(prev => [...prev, { id: `t${prev.length+1}`, kind: 'triangle', x1: 60, y1: 60, x2: 100, y2: 60, x3: 80, y3: 100, color: pickColor() }]);
  const reset = () => setShapes([]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex flex-wrap gap-2 mb-3">
        <button onClick={addCircle} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Add Circle</button>
        <button onClick={addRect} className="px-3 py-1 rounded bg-green-600 text-white text-sm">Add Rectangle</button>
        <button onClick={addTriangle} className="px-3 py-1 rounded bg-purple-600 text-white text-sm">Add Triangle</button>
        <button onClick={reset} className="ml-auto px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 border text-sm">Clear</button>
      </div>
      <svg
        viewBox="0 0 600 360"
        className="w-full h-72 border rounded bg-gray-50 touch-none"
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchMove={onMove}
        onTouchEnd={onUp}
      >
        {/* grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {shapes.map(s => {
          if (s.kind === 'circle') return (
            <circle key={s.id} cx={s.cx} cy={s.cy} r={s.r} fill={s.color}
              onMouseDown={(e) => onDown(e, s.id, { x: s.cx, y: s.cy })}
              onTouchStart={(e) => onDown(e, s.id, { x: s.cx, y: s.cy })}
              style={{ cursor: 'grab' }}
            />
          );
          if (s.kind === 'rect') return (
            <rect key={s.id} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.color}
              onMouseDown={(e) => onDown(e, s.id, { x: s.x + s.w/2, y: s.y + s.h/2 })}
              onTouchStart={(e) => onDown(e, s.id, { x: s.x + s.w/2, y: s.y + s.h/2 })}
              style={{ cursor: 'grab' }}
            />
          );
          return (
            <polygon key={s.id} points={`${s.x1},${s.y1} ${s.x2},${s.y2} ${s.x3},${s.y3}`} fill={s.color}
              onMouseDown={(e) => onDown(e, s.id, { x: (s.x1+s.x2+s.x3)/3, y: (s.y1+s.y2+s.y3)/3 })}
              onTouchStart={(e) => onDown(e, s.id, { x: (s.x1+s.x2+s.x3)/3, y: (s.y1+s.y2+s.y3)/3 })}
              style={{ cursor: 'grab' }}
            />
          );
        })}
      </svg>
    </div>
  );
}
