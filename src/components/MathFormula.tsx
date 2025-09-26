import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathFormulaProps {
  formula: string;
  inline?: boolean;
  className?: string;
}

const MathFormula = ({ formula, inline = false, className = '' }: MathFormulaProps) => {
  try {
    if (inline) {
      // react-katex components don't accept className; wrap with a span
      return (
        <span className={className}>
          <InlineMath math={formula} />
        </span>
      );
    }
    return (
      <div className={className}>
        <BlockMath math={formula} />
      </div>
    );
  } catch (error) {
    // Fallback to plain text if LaTeX parsing fails
    return <span className={`text-red-500 ${className}`}>Error rendering: {formula}</span>;
  }
};

export default MathFormula;