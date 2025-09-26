import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Download, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { TOPICS, getEntry, recommendedNextTopics, unmetPrereqs, getState, saveState } from '../learning/learningModel';

export default function Progress() {
  const [stateVersion, setStateVersion] = useState(0);
  const state = useMemo(() => getState(), [stateVersion]);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const overall = useMemo(() => {
    const scores = TOPICS.map(t => state[t.slug]?.score ?? 0);
    const avg = scores.length ? scores.reduce((a,b)=>a+b,0) / scores.length : 0;
    return Math.round(avg * 100);
  }, [state]);

  const recs = useMemo(() => recommendedNextTopics(), [stateVersion]);

  const doReset = () => {
    // reset by clearing all entries and saving fresh state
    const fresh = { ...state };
    for (const t of TOPICS) {
      fresh[t.slug] = { attempts: 0, correct: 0, score: 0, level: 1 };
    }
    saveState(fresh);
    setStateVersion(v=>v+1);
  };

  const doExport = async () => {
    const txt = JSON.stringify(state, null, 2);
    try {
      await navigator.clipboard.writeText(txt);
      alert('Progress copied to clipboard.');
    } catch {
      // fallback: open a prompt
      window.prompt('Copy your progress JSON:', txt);
    }
  };

  const doImport = () => {
    try {
      const parsed = JSON.parse(importText);
      saveState(parsed);
      setStateVersion(v=>v+1);
      setShowImport(false);
      setImportText('');
    } catch (e) {
      alert('Invalid JSON. Please paste a valid progress export.');
    }
  };

  return (
    <div className="min-h-screen">
  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <BarChart className="h-10 w-10" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Your Progress</h1>
            <p className="opacity-90">Track mastery, prerequisites, and recommended next steps</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={doReset} className="px-3 py-2 rounded bg-white/15 hover:bg-white/25">Reset</button>
            <button onClick={doExport} className="px-3 py-2 rounded bg-white/15 hover:bg-white/25 flex items-center gap-2"><Download className="h-4 w-4"/> Export</button>
            <button onClick={() => setShowImport(s=>!s)} className="px-3 py-2 rounded bg-white/15 hover:bg-white/25 flex items-center gap-2"><Upload className="h-4 w-4"/> Import</button>
          </div>
        </div>
      </div>

      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Overall summary */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-150 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Overall mastery</div>
                <div className="text-3xl font-bold text-gray-800">{overall}%</div>
              </div>
              <div className="w-40 h-3 bg-gray-100 rounded">
                <div className="h-3 rounded bg-indigo-600" style={{ width: `${overall}%` }} />
              </div>
            </div>
          </div>

          {/* Recommended next topics */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-150 hover:shadow-xl">
            <div className="font-semibold text-gray-800 mb-3">Recommended Next Topics</div>
            {recs.length ? (
              <div className="flex flex-wrap gap-2">
                {recs.map(r => (
                  <Link key={r.slug} to={`/subject/maths/${r.slug}`} className="px-3 py-2 rounded border hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    {r.name}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-gray-600">You’re all caught up. Explore any topic!</div>
            )}
          </div>

          {/* Topic table */}
          <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto transition-all duration-150 hover:shadow-xl">
            <div className="font-semibold text-gray-800 mb-3">All Topics</div>
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr>
                  <th className="py-2 pr-4">Topic</th>
                  <th className="py-2 pr-4">Mastery</th>
                  <th className="py-2 pr-4">Level</th>
                  <th className="py-2 pr-4">Attempts</th>
                  <th className="py-2 pr-4">Prereqs</th>
                  <th className="py-2 pr-4">Go</th>
                </tr>
              </thead>
              <tbody>
                {TOPICS.map(t => {
                  const e = getEntry(t.slug);
                  const missing = unmetPrereqs(t.slug);
                  const mastery = Math.round((e.score||0)*100);
                  return (
                    <tr key={t.slug} className="border-t">
                      <td className="py-2 pr-4 font-medium text-gray-800">{t.name}</td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-100 rounded"><div className="h-2 rounded bg-blue-600" style={{ width: `${mastery}%` }} /></div>
                          <span className="text-gray-700">{mastery}%</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4">{e.level}</td>
                      <td className="py-2 pr-4">{e.attempts}</td>
                      <td className="py-2 pr-4">
                        {missing.length ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 text-xs"><AlertTriangle className="h-4 w-4"/> {missing.join(', ')}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-green-700 text-xs"><CheckCircle2 className="h-4 w-4"/> Ready</span>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        <Link to={`/subject/maths/${t.slug}`} className="text-blue-600 hover:underline">Open</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Import area */}
          {showImport && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="font-semibold text-gray-800 mb-2">Import Progress JSON</div>
              <textarea value={importText} onChange={(e)=>setImportText(e.target.value)} className="w-full h-40 border rounded p-2" placeholder="Paste exported JSON here" />
              <div className="mt-2 flex gap-2">
                <button onClick={doImport} className="px-3 py-2 rounded bg-indigo-600 text-white">Import</button>
                <button onClick={()=>{setShowImport(false); setImportText('');}} className="px-3 py-2 rounded border">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
