export default function AutoDiagram({ topic }: { topic: string }) {
  const t = topic.toLowerCase();
  // choose a simple diagram based on topic hints
  const isTriangle = t.includes('triangle') || t.includes('trigonometry');
  const isCircle = t.includes('circle');
  const isCoordinate = t.includes('coordinate') || t.includes('geometry');

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="font-semibold text-gray-800 mb-2">Auto Diagram</div>
      <svg viewBox="0 0 400 240" className="w-full h-56 border rounded bg-white">
        {/* grid */}
        <defs>
          <pattern id="grid10" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid10)" />

        {isCoordinate && (
          <>
            <line x1="20" y1="120" x2="380" y2="120" stroke="#9CA3AF"/>
            <line x1="200" y1="20" x2="200" y2="220" stroke="#9CA3AF"/>
          </>
        )}

        {isTriangle && (
          <polygon points="120,180 220,60 300,180" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
        )}

        {isCircle && (
          <circle cx="200" cy="120" r="70" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2" />
        )}

        {!isTriangle && !isCircle && !isCoordinate && (
          <text x="200" y="120" textAnchor="middle" dominantBaseline="middle" fill="#6B7280">
            No specific diagram for this topic
          </text>
        )}
      </svg>
      <div className="text-xs text-gray-500 mt-2">Automatically picks a relevant diagram based on topic.</div>
    </div>
  );
}
