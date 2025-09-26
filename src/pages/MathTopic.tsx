import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Loader2, ChevronDown, ChevronUp, Calculator as CalcIcon, LineChart, Wrench, Shapes } from 'lucide-react';
import MathCalculator from '../components/MathCalculator';
import GraphPlotter from '../components/GraphPlotter';
import FormulaReference from '../components/FormulaReference';
import FormulaBuilder from '../components/FormulaBuilder';
import PracticeProblems from '../components/PracticeProblems';
import ProblemSolver from '../components/ProblemSolver.tsx';
import InteractiveGeometry from '../components/InteractiveGeometry';
import AnimatedTransformations from '../components/AnimatedTransformations';
import GraphPaper from '../components/GraphPaper';
import AutoDiagram from '../components/AutoDiagram';
import Solid3DViewer from '../components/Solid3DViewer';
import AdaptivePanel from '../components/AdaptivePanel';
import { TOPICS } from '../learning/learningModel';

const API_BASE = 'http://localhost:3001';

// slugify no longer needed here; using TOPICS slugs

export default function MathTopic() {
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const navigate = useNavigate();
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCalc, setOpenCalc] = useState(false);
  const [openPlot, setOpenPlot] = useState(false);
  const [openFormulas, setOpenFormulas] = useState(false);
  const [openBuilder, setOpenBuilder] = useState(false);
  const [openGeom, setOpenGeom] = useState(false);
  const [openAnim, setOpenAnim] = useState(false);
  const [openPaper, setOpenPaper] = useState(false);
  const [openAutoDiagram, setOpenAutoDiagram] = useState(false);
  const [open3D, setOpen3D] = useState(false);
  const [openAdaptive, setOpenAdaptive] = useState(true);
  const [retryIn, setRetryIn] = useState<number | null>(null);
  const retryTimerRef = useRef<number | null>(null);

  const topicName = useMemo(() => {
    const found = TOPICS.find((t) => t.slug === topicSlug)?.name;
    return found || 'Topic';
  }, [topicSlug]);

  useEffect(() => {
    let mounted = true;
    const clearRetry = () => {
      if (retryTimerRef.current) {
        window.clearInterval(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      setRetryIn(null);
    };

    async function load(forceGemini: boolean, isRetry = false) {
      try {
        if (!isRetry) setLoading(true);
        setError(null);
        const url = `${API_BASE}/api/explain/maths/${encodeURIComponent(topicName)}${forceGemini ? '?force=gemini' : ''}`;
        const res = await fetch(url);
        if (!res.ok) {
          // Handle 429 RATE_LIMIT explicitly
          if (res.status === 429) {
            const data = await res.json().catch(() => ({}));
            const wait = Number(data?.retryAfterSeconds) || 60;
            if (!mounted) return;
            setExplanation('AI explanation is temporarily rate-limited. We\'ll retry automatically.');
            setRetryIn(wait);
            if (retryTimerRef.current) window.clearInterval(retryTimerRef.current);
            retryTimerRef.current = window.setInterval(() => {
              setRetryIn((v) => {
                if (v == null) return null;
                if (v <= 1) {
                  // time to retry
                  window.clearInterval(retryTimerRef.current!);
                  retryTimerRef.current = null;
                  // Try Gemini again
                  void load(true, true);
                  return 0;
                }
                return v - 1;
              });
            }, 1000);
            return;
          }
          const txt = await res.text();
          throw new Error(txt || `Request failed (${res.status})`);
        }
        const data = await res.json();
        if (!mounted) return;
        let text = data.explanation || 'Explanation not available.';
        if (data.rateLimited && data.retryAfterSeconds != null) {
          // Server-side backoff fallback (non-429): show note, but also schedule an auto-retry once
          const wait = Number(data.retryAfterSeconds) || 60;
          setRetryIn(wait);
          if (retryTimerRef.current) window.clearInterval(retryTimerRef.current);
          retryTimerRef.current = window.setInterval(() => {
            setRetryIn((v) => {
              if (v == null) return null;
              if (v <= 1) {
                window.clearInterval(retryTimerRef.current!);
                retryTimerRef.current = null;
                // Try Gemini again after server-advised cooldown
                void load(true, true);
                return 0;
              }
              return v - 1;
            });
          }, 1000);
          text += `\n\nNote: Detailed AI explanation is temporarily rate-limited. Retrying in about ${wait}s...`;
        } else {
          clearRetry();
        }
        setExplanation(text);
      } catch (e: any) {
        if (mounted) setError(e.message || 'Failed to load explanation');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load(true);
    return () => {
      mounted = false;
      if (retryTimerRef.current) window.clearInterval(retryTimerRef.current);
    };
  }, [topicName]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Back */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 pt-10 pb-12 rounded-b-3xl shadow">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wide bg-white/20 text-white px-2 py-1 rounded-full">Mathematics</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{topicName}</h1>
          </div>
          <button
            onClick={() => navigate('/subject/maths')}
            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/40 text-white px-4 py-2 rounded-lg transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Mathematics
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        <div className="container-app grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Explanation + Practice Problems + AI Solver */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 transition-all duration-150 hover:shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Detailed Explanation</h3>
              </div>
              {loading ? (
                <div className="flex items-center text-blue-600"><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Loading...</div>
              ) : error ? (
                <div className="text-red-600">{error}</div>
              ) : (
                <div>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{explanation}</p>
                  {retryIn != null && retryIn > 0 && (
                    <div className="mt-3 p-3 rounded border bg-yellow-50 text-yellow-800 text-sm flex items-center justify-between">
                      <span>AI is cooling down. Auto-retrying in {retryIn}s…</span>
                      <button onClick={() => setRetryIn(1)} className="px-3 py-1 rounded bg-yellow-600 text-white">Try now</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Practice Problems after explanation */}
            <div className="card p-1 transition-all duration-150 hover:shadow-xl">
              <PracticeProblems topic={topicName} />
            </div>

            {/* AI Problem Solver after explanation */}
            <div className="card p-1 transition-all duration-150 hover:shadow-xl">
              <ProblemSolver />
            </div>
          </div>

          {/* Right: Tools (click to expand) */}
          <div className="space-y-6 lg:sticky lg:top-6 self-start">
            {/* Adaptive Learning */}
            <div className="card overflow-hidden transition-all duration-200 hover:shadow-xl">
              <button aria-expanded={openAdaptive} onClick={() => setOpenAdaptive(v=>!v)} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between group">
                <span className="flex items-center gap-2 text-gray-900 font-semibold">
                  <span className="transition-transform duration-150 group-hover:translate-x-0.5">Adaptive Learning</span>
                </span>
                {openAdaptive ? <ChevronUp className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/> : <ChevronDown className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/>}
              </button>
              {openAdaptive && (
                <div className="p-4">
                  <AdaptivePanel topicName={topicName} />
                </div>
              )}
            </div>
            {/* Scientific Calculator */}
            <div className="card overflow-hidden transition-all duration-200 hover:shadow-xl">
              <button
                aria-expanded={openCalc}
                onClick={() => setOpenCalc(v => !v)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between group"
              >
                <span className="flex items-center gap-2 text-gray-900 font-semibold">
                  <CalcIcon className="h-5 w-5 text-indigo-600 transition-transform duration-150 group-hover:scale-110"/>
                  <span className="transition-transform duration-150 delay-75 group-hover:translate-x-0.5">Scientific Calculator</span>
                </span>
                {openCalc ? <ChevronUp className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/> : <ChevronDown className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/>}
              </button>
              {openCalc && (
                <div className="p-4">
                  <MathCalculator />
                </div>
              )}
            </div>

            {/* Graph Plotter */}
            <div className="card overflow-hidden transition-all duration-200 hover:shadow-xl">
              <button
                aria-expanded={openPlot}
                onClick={() => setOpenPlot(v => !v)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between group"
              >
                <span className="flex items-center gap-2 text-gray-900 font-semibold">
                  <LineChart className="h-5 w-5 text-emerald-600 transition-transform duration-150 group-hover:scale-110"/>
                  <span className="transition-transform duration-150 delay-75 group-hover:translate-x-0.5">Graph Plotter</span>
                </span>
                {openPlot ? <ChevronUp className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/> : <ChevronDown className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/>}
              </button>
              {openPlot && (
                <div className="p-4">
                  <GraphPlotter />
                </div>
              )}
            </div>

            {/* Formula Reference */}
            <div className="card overflow-hidden transition-all duration-200 hover:shadow-xl">
              <button
                aria-expanded={openFormulas}
                onClick={() => setOpenFormulas(v => !v)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between group"
              >
                <span className="flex items-center gap-2 text-gray-900 font-semibold">
                  <BookOpen className="h-5 w-5 text-blue-600 transition-transform duration-150 group-hover:scale-110"/>
                  <span className="transition-transform duration-150 delay-75 group-hover:translate-x-0.5">Formula Reference</span>
                </span>
                {openFormulas ? <ChevronUp className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/> : <ChevronDown className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/>}
              </button>
              {openFormulas && (
                <div className="p-4">
                  <FormulaReference topic={topicName} />
                </div>
              )}
            </div>

            {/* Formula Builder */}
            <div className="card overflow-hidden transition-all duration-200 hover:shadow-xl">
              <button
                aria-expanded={openBuilder}
                onClick={() => setOpenBuilder(v => !v)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between group"
              >
                <span className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Wrench className="h-5 w-5 text-pink-600 transition-transform duration-150 group-hover:scale-110"/>
                  <span className="transition-transform duration-150 delay-75 group-hover:translate-x-0.5">Formula Builder</span>
                </span>
                {openBuilder ? <ChevronUp className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/> : <ChevronDown className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/>}
              </button>
              {openBuilder && (
                <div className="p-4">
                  <FormulaBuilder />
                </div>
              )}
            </div>

            {/* Interactive Geometry */}
            <div className="card overflow-hidden transition-all duration-200 hover:shadow-xl">
              <button aria-expanded={openGeom} onClick={() => setOpenGeom(v=>!v)} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between group">
                <span className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Shapes className="h-5 w-5 text-violet-600 transition-transform duration-150 group-hover:scale-110"/>
                  <span className="transition-transform duration-150 delay-75 group-hover:translate-x-0.5">Interactive Geometry</span>
                </span>
                {openGeom ? <ChevronUp className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/> : <ChevronDown className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/>}
              </button>
              {openGeom && (
                <div className="p-4">
                  <InteractiveGeometry />
                </div>
              )}
            </div>

            {/* Animated Explanations */}
            <div className="card overflow-hidden transition-all duration-200 hover:shadow-xl">
              <button aria-expanded={openAnim} onClick={() => setOpenAnim(v=>!v)} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between group">
                <span className="flex items-center gap-2 text-gray-900 font-semibold">
                  <span className="transition-transform duration-150 group-hover:translate-x-0.5">Animated Explanations</span>
                </span>
                {openAnim ? <ChevronUp className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/> : <ChevronDown className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/>}
              </button>
              {openAnim && (
                <div className="p-4">
                  <AnimatedTransformations kind={topicName.toLowerCase().includes('quadratic') ? 'quadratic' : 'linear'} />
                </div>
              )}
            </div>

            {/* Graph Paper Mode */}
            <div className="card overflow-hidden transition-all duration-200 hover:shadow-xl">
              <button aria-expanded={openPaper} onClick={() => setOpenPaper(v=>!v)} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between group">
                <span className="flex items-center gap-2 text-gray-900 font-semibold">
                  <span className="transition-transform duration-150 group-hover:translate-x-0.5">Graph Paper Mode</span>
                </span>
                {openPaper ? <ChevronUp className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/> : <ChevronDown className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/>}
              </button>
              {openPaper && (
                <div className="p-4">
                  <GraphPaper />
                </div>
              )}
            </div>

            {/* Auto Diagram */}
            <div className="card overflow-hidden transition-all duration-200 hover:shadow-xl">
              <button aria-expanded={openAutoDiagram} onClick={() => setOpenAutoDiagram(v=>!v)} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between group">
                <span className="flex items-center gap-2 text-gray-900 font-semibold">
                  <span className="transition-transform duration-150 group-hover:translate-x-0.5">Mathematical Diagram</span>
                </span>
                {openAutoDiagram ? <ChevronUp className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/> : <ChevronDown className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/>}
              </button>
              {openAutoDiagram && (
                <div className="p-4">
                  <AutoDiagram topic={topicName} />
                </div>
              )}
            </div>

            {/* 3D Visualizations */}
            <div className="card overflow-hidden transition-all duration-200 hover:shadow-xl">
              <button aria-expanded={open3D} onClick={() => setOpen3D(v=>!v)} className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between group">
                <span className="flex items-center gap-2 text-gray-900 font-semibold">
                  <span className="transition-transform duration-150 group-hover:translate-x-0.5">3D Visualizations</span>
                </span>
                {open3D ? <ChevronUp className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/> : <ChevronDown className="h-5 w-5 text-gray-600 transition-transform duration-150 delay-100 group-hover:translate-x-0.5"/>}
              </button>
              {open3D && (
                <div className="p-4">
                  <Solid3DViewer />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
