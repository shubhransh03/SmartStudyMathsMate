import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import MathInput from './MathInput';
import StepNavigator from './StepNavigator';

const API_BASE = 'http://localhost:3001';

const ProblemSolver = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [prompt, setPrompt] = useState('Solve: x^2 - 5x + 6 = 0');
  const [solution, setSolution] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

  const steps = useMemo(() => {
    // Try to split into steps if backend returns numbered lines or bullets
    if (!solution) return [] as { title?: string; content: string }[];
    const lines = solution.split(/\n+/).map(s=>s.trim()).filter(Boolean);
    const groups: string[] = [];
    let cur: string[] = [];
    for (const ln of lines) {
      if (/^(step\s*\d+|\d+\.|\-)/i.test(ln) && cur.length) { groups.push(cur.join('\n')); cur = [ln]; }
      else cur.push(ln);
    }
    if (cur.length) groups.push(cur.join('\n'));
    if (groups.length <= 1) return [];
    return groups.map((g,i)=>({ title: `Step ${i+1}`, content: g }));
  }, [solution]);

  const solve = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setRetryAfter(null);
      setRetryCountdown(null);
      setSolution(null);
      const res = await fetch(`${API_BASE}/api/solve?force=gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) {
        const t = await res.json().catch(async () => ({ detail: await res.text() }));
        if (res.status === 429 && (t?.retryAfterSeconds || t?.error === 'RATE_LIMIT')) {
          const wait = Number(t?.retryAfterSeconds) || 60;
          setRetryAfter(wait);
          setRetryCountdown(wait);
          setError('Rate limit exceeded. Please wait and try again.');
        } else {
          setError((t?.message || t?.error || 'Request failed'));
        }
        return;
      }
      const data = await res.json();
      setSolution(data.solution || data.explanation || 'No solution returned');
    } catch (e: any) {
      setError(e.message || 'Failed to solve');
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  // Simple countdown timer if rate limited
  useEffect(() => {
    if (retryAfter == null) return;
    if (retryCountdown == null) setRetryCountdown(retryAfter);
    if (retryCountdown === 0) return;
    const id = setInterval(() => {
      setRetryCountdown((v) => (v == null ? null : Math.max(0, v - 1)));
    }, 1000);
    return () => clearInterval(id);
  }, [retryAfter, retryCountdown]);

  // If the user edits the prompt, clear any prior rate-limit/error state to allow immediate retry
  useEffect(() => {
    if (retryCountdown != null || retryAfter != null || (error && /rate limit/i.test(error))) {
      setRetryAfter(null);
      setRetryCountdown(null);
      if (error && /rate limit/i.test(error)) setError(null);
    }
  }, [prompt]);

  // Listen for cross-component requests to solve a problem
  useEffect(() => {
    const handler = (ev: Event) => {
      const e = ev as CustomEvent<{ prompt?: string; autoSolve?: boolean; scroll?: boolean; annotate?: boolean }>;
      const incoming = e.detail?.prompt;
      if (incoming) setPrompt(incoming);
      if (e.detail?.scroll && containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (e.detail?.autoSolve) {
        // slight delay to allow state update
        setTimeout(() => { void solve(); }, 50);
      }
    };
    window.addEventListener('studymate:solve-problem', handler as EventListener);
    return () => window.removeEventListener('studymate:solve-problem', handler as EventListener);
  }, [solve]);

  return (
    <div ref={containerRef} id="ai-problem-solver" className="bg-white rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl">
      <div className="flex items-center space-x-2 mb-4">
        <Wand2 className="h-6 w-6 text-pink-600" />
        <h3 className="text-lg font-bold text-gray-800">AI Problem Solver</h3>
      </div>

      <div className="mb-3">
        <MathInput label="Problem" value={prompt} onChange={setPrompt} />
      </div>

      <button
        onClick={solve}
        disabled={loading || (retryCountdown != null && retryCountdown > 0)}
        className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-60 flex items-center shadow-sm"
      >
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} 
        {retryCountdown != null && retryCountdown > 0 ? `Please wait ${retryCountdown}s` : 'Solve with AI'}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded">
          <div>{error}</div>
          {retryCountdown != null && (
            <div className="mt-1 text-red-700">Retry available in {retryCountdown}s</div>
          )}
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => { if (retryCountdown === 0 || retryCountdown == null) solve(); }}
              disabled={loading || (retryCountdown != null && retryCountdown > 0)}
              className="px-3 py-1 rounded bg-red-600 text-white disabled:opacity-50"
            >Try again</button>
          </div>
        </div>
      )}
      {solution && steps.length > 0 && (
        <div className="mt-4 transition-all duration-200 transform animate-[fadeIn_0.2s_ease-out]">
          <div className="font-semibold text-gray-800 mb-2">Solution Steps</div>
          <StepNavigator steps={steps} />
        </div>
      )}

      {solution && steps.length === 0 && (
        <div className="mt-4 p-4 bg-gray-50 border rounded-lg transition-all duration-200 transform animate-[fadeIn_0.2s_ease-out]">
          <div className="font-semibold text-gray-800 mb-2">Solution:</div>
          <div className="prose whitespace-pre-wrap text-gray-800">{solution}</div>
        </div>
      )}
    </div>
  );
};

export default ProblemSolver;
