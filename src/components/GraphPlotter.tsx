import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { TrendingUp } from 'lucide-react';
import MathInput from './MathInput';
import { evaluate } from 'mathjs';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const GraphPlotter = () => {
  const [expr, setExpr] = useState('sin(x)');
  const [range, setRange] = useState({ min: -10, max: 10 });
  const [step, setStep] = useState(0.1);
  const [error, setError] = useState<string | null>(null);
  const [advanced, setAdvanced] = useState(false);

  const data = useMemo(() => {
    try {
      setError(null);
      const xs: number[] = [];
      const ys: number[] = [];
      for (let x = range.min; x <= range.max; x = +(x + step).toFixed(10)) {
        const y = evaluate(expr, { x });
        if (typeof y === 'number' && isFinite(y)) {
          xs.push(x);
          ys.push(y);
        } else {
          xs.push(x);
          ys.push(NaN);
        }
      }
      return {
        labels: xs.map(v => v.toFixed(2)),
        datasets: [
          {
            label: `y = ${expr}`,
            data: ys,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            spanGaps: true,
          }
        ]
      };
    } catch (e) {
      setError('Invalid expression');
      return { labels: [], datasets: [] } as any;
    }
  }, [expr, range.min, range.max, step]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="h-6 w-6 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-800">Graph Plotter</h3>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-gray-700">{advanced ? 'Interactive Mode' : 'Quick Mode'}</div>
        <button onClick={()=>setAdvanced(a=>!a)} className="px-3 py-1 text-sm rounded border">{advanced ? 'Switch to Quick' : 'Switch to Interactive'}</button>
      </div>

      {advanced ? (
        <div className="mb-4">
          <MathInput label="Function y =" value={expr} onChange={setExpr} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <input className="border rounded px-3 py-2" type="number" value={range.min} onChange={e => setRange(r => ({ ...r, min: Number(e.target.value) }))} placeholder="Min x" />
            <input className="border rounded px-3 py-2" type="number" value={range.max} onChange={e => setRange(r => ({ ...r, max: Number(e.target.value) }))} placeholder="Max x" />
            <input className="border rounded px-3 py-2" type="number" step="0.1" value={step} onChange={e => setStep(Number(e.target.value))} placeholder="Step" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input className="border rounded px-3 py-2 md:col-span-2" value={expr} onChange={e => setExpr(e.target.value)} placeholder="Enter function of x, e.g. sin(x), x^2, exp(-x)" />
          <input className="border rounded px-3 py-2" type="number" value={range.min} onChange={e => setRange(r => ({ ...r, min: Number(e.target.value) }))} placeholder="Min x" />
          <input className="border rounded px-3 py-2" type="number" value={range.max} onChange={e => setRange(r => ({ ...r, max: Number(e.target.value) }))} placeholder="Max x" />
          <input className="border rounded px-3 py-2" type="number" step="0.1" value={step} onChange={e => setStep(Number(e.target.value))} placeholder="Step" />
        </div>
      )}

      <div className="bg-white">
        <Line data={data} options={{ animation: false, scales: { y: { ticks: { color: '#374151' } }, x: { ticks: { color: '#374151', maxRotation: 0 } } } }} />
      </div>

      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
    </div>
  );
};

export default GraphPlotter;
