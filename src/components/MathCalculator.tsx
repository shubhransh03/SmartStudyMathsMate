import { useState } from 'react';
import { Calculator, Trash2 } from 'lucide-react';
import { evaluate } from 'mathjs';

const MathCalculator = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onCalculate = () => {
    try {
      setError(null);
      // Evaluate using mathjs
      const value = evaluate(expression);
      setResult(String(value));
    } catch (e: any) {
      setResult(null);
      setError('Invalid expression');
    }
  };

  const clearAll = () => {
    setExpression('');
    setResult(null);
    setError(null);
  };

  const keys = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','(',')','+'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calculator className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-800">Scientific Calculator</h3>
      </div>

      <input
        className="w-full border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
        placeholder="Enter expression e.g. sin(pi/4)^2 + cos(pi/4)^2"
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
      />

      <div className="grid grid-cols-4 gap-2 mb-3">
        {keys.map(k => (
          <button
            key={k}
            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded border"
            onClick={() => setExpression(prev => prev + k)}
          >{k}</button>
        ))}
        <button className="col-span-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded" onClick={onCalculate}>=</button>
        <button className="col-span-2 px-3 py-2 bg-red-50 hover:bg-red-100 rounded border flex items-center justify-center" onClick={clearAll}>
          <Trash2 className="h-4 w-4 mr-1"/> Clear
        </button>
      </div>

      {result !== null && (
        <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
          <div className="text-sm text-green-800"><strong>Result:</strong> {result}</div>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
          <div className="text-sm text-red-800"><strong>Error:</strong> {error}</div>
        </div>
      )}
    </div>
  );
};

export default MathCalculator;
