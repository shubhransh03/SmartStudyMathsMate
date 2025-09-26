import { useState } from 'react';
import { Eraser, Sigma, Copy } from 'lucide-react';
import MathFormula from './MathFormula';

const TOKENS = [
  'x','y','z','a','b','c','+','-','\\times','\\div','^','(',' )','\\sqrt{}','\\frac{}{}','\\sin','\\cos','\\tan','\\pi','e','=' ,'\\theta'
];

const FormulaBuilder = () => {
  const [latex, setLatex] = useState<string>('');

  const insert = (token: string) => {
    // Place cursor replacements for braces tokens
    if (token.includes('{}')) {
      setLatex(prev => prev + token.replace('{}', '{ }'));
    } else if (token.includes('{}{}')) {
      setLatex(prev => prev + token.replace('{}{}', '{ }{ }'));
    } else {
      setLatex(prev => prev + token);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(latex);
    } catch {}
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Sigma className="h-6 w-6 text-emerald-600" />
        <h3 className="text-lg font-bold text-gray-800">Formula Builder</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {TOKENS.map(t => (
          <button key={t} className="px-2 py-1 rounded border bg-gray-50 hover:bg-gray-100" onClick={() => insert(t)}>{t}</button>
        ))}
      </div>

      <textarea
        className="w-full border rounded p-2 h-24 mb-3 font-mono"
        value={latex}
        onChange={e => setLatex(e.target.value)}
        placeholder="Build your LaTeX here..."
      />

      <div className="bg-gray-50 rounded p-3 border">
        <MathFormula formula={latex || ' '} />
      </div>

      <div className="flex gap-2 mt-3">
        <button className="px-3 py-2 rounded bg-emerald-600 text-white flex items-center" onClick={copy}><Copy className="h-4 w-4 mr-1"/> Copy LaTeX</button>
        <button className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 border flex items-center" onClick={() => setLatex('')}><Eraser className="h-4 w-4 mr-1"/> Clear</button>
      </div>
    </div>
  );
};

export default FormulaBuilder;
