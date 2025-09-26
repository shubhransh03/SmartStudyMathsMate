
interface MathKeyboardProps {
  onInsert: (text: string) => void;
}

const rows: string[][] = [
  ['(', ')', '[', ']', '{', '}'],
  ['^', 'sqrt(', 'abs(', 'pi', 'e'],
  ['sin(', 'cos(', 'tan(', 'log(', 'ln('],
  ['*', '/', '+', '-', '='],
  ['<', '>', '<=', '>=', '!='],
];

export default function MathKeyboard({ onInsert }: MathKeyboardProps) {
  return (
    <div className="border rounded-lg p-2 bg-gray-50">
      {rows.map((r, i) => (
        <div key={i} className="flex flex-wrap gap-2 mb-2">
          {r.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onInsert(t)}
              className="px-2 py-1 text-sm rounded bg-white border hover:border-indigo-300"
            >
              {t}
            </button>
          ))}
        </div>
      ))}
      <div className="text-xs text-gray-500">Tip: Functions auto-insert an opening parenthesis.</div>
    </div>
  );
}
