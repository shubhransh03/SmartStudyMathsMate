import { Fragment } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
// Note: KaTeX CSS should be imported once globally (see main.tsx)

type Props = {
  text: string;
  className?: string;
};

// Very lightweight parser for $...$ (inline) and $$...$$ (block) math within plain text.
// Handles multi-line block math and preserves paragraphs.
export default function MathText({ text, className }: Props) {
  if (!text) return null;

  // Normalize Windows newlines and trim trailing spaces per line
  const normalized = text.replace(/\r\n?/g, '\n').replace(/\t/g, '  ');

  // Split by paragraphs first to keep spacing natural
  const paragraphs = normalized.split(/\n\n+/);

  return (
    <div className={className}>
      {paragraphs.map((para, i) => (
        <Fragment key={i}>
          <ParagraphWithMath text={para} />
          {i < paragraphs.length - 1 && <div className="h-3" />}
        </Fragment>
      ))}
    </div>
  );
}

function ParagraphWithMath({ text }: { text: string }) {
  // First, split out block math $$...$$ which may span lines
  const blockParts = text.split(/(\$\$[\s\S]+?\$\$)/g);

  return (
    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
      {blockParts.map((part, idx) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const expr = part.slice(2, -2).trim();
          return (
            <BlockMath key={idx}>{expr}</BlockMath>
          );
        }
        // For non-block segments, further split inline $...$ occurrences
        const inlineParts = part.split(/(\$[^$]+\$)/g);
        return inlineParts.map((seg, jdx) => {
          if (seg.startsWith('$') && seg.endsWith('$') && seg.length > 2) {
            const expr = seg.slice(1, -1).trim();
            return <InlineMath key={`${idx}-${jdx}`}>{expr}</InlineMath>;
          }
          // Replace escaped dollar \$ with literal $
          const literal = seg.replace(/\\\$/g, '$');
          return <Fragment key={`${idx}-${jdx}`}>{literal}</Fragment>;
        });
      })}
    </p>
  );
}
