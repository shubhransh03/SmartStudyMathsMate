import { useEffect, useRef, useState } from 'react';
import MathFormula from './MathFormula';
import MathKeyboard from './MathKeyboard';

interface MathInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
}

export default function MathInput({ label, placeholder, value, onChange }: MathInputProps) {
  const [text, setText] = useState(value ?? 'x^2 + y^2 = r^2');
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (value !== undefined) setText(value); }, [value]);

  const insert = (t: string) => {
    const el = taRef.current;
    if (!el) return;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const next = text.slice(0, start) + t + text.slice(end);
    setText(next);
    onChange?.(next);
    // place cursor after inserted text
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + t.length;
    });
  };

  const setVal = (v: string) => { setText(v); onChange?.(v); };

  return (
    <div className="space-y-2">
      {label && <div className="text-sm text-gray-700 font-medium">{label}</div>}
      <textarea
        ref={taRef}
        className="w-full border rounded p-2 h-24"
        placeholder={placeholder || 'Enter an expression (supports KaTeX/TeX where applicable)'}
        value={text}
        onChange={e => setVal(e.target.value)}
      />
      <MathKeyboard onInsert={insert} />
      <div className="p-3 bg-white rounded border">
        <div className="text-xs text-gray-500 mb-1">Preview</div>
        <MathFormula formula={text} />
      </div>
    </div>
  );
}
