import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { getEntry, unmetPrereqs, updateMastery, recommendedNextTopics, slugify } from '../learning/learningModel';

export default function AdaptivePanel({ topicName }: { topicName: string }) {
  const slug = useMemo(() => slugify(topicName), [topicName]);
  const [entry, setEntry] = useState(() => getEntry(slug));
  const [prereqs, setPrereqs] = useState<string[]>([]);
  const [recs, setRecs] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    setEntry(getEntry(slug));
    setPrereqs(unmetPrereqs(slug));
    setRecs(recommendedNextTopics().map(t => ({ name: t.name, slug: t.slug })));
  }, [slug]);

  const assess = (correct: boolean) => {
    updateMastery(slug, correct);
    setEntry(getEntry(slug));
    setPrereqs(unmetPrereqs(slug));
    setRecs(recommendedNextTopics().map(t => ({ name: t.name, slug: t.slug })));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-5 w-5 text-indigo-600"/>
        <div className="font-semibold text-gray-800">Adaptive Learning</div>
      </div>
      <div className="text-sm text-gray-700 space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600"/>
          <span>Mastery: <strong>{Math.round((entry.score||0)*100)}%</strong> • Difficulty Level: <strong>{entry.level}</strong></span>
        </div>
        {prereqs.length > 0 ? (
          <div className="flex items-start gap-2 text-amber-700">
            <AlertTriangle className="h-4 w-4 mt-0.5"/>
            <span>Prerequisites to improve: {prereqs.join(', ')}</span>
          </div>
        ) : (
          <div className="text-green-700">All prerequisites satisfied. You're good to proceed!</div>
        )}
        <div className="pt-2">
          <div className="text-xs text-gray-500 mb-1">Quick assessment (simulate correctness):</div>
          <div className="flex gap-2">
            <button onClick={() => assess(true)} className="px-2 py-1 text-xs rounded bg-green-600 text-white">I answered correctly</button>
            <button onClick={() => assess(false)} className="px-2 py-1 text-xs rounded bg-red-600 text-white">I answered wrong</button>
          </div>
        </div>
        {recs.length > 0 && (
          <div className="pt-2">
            <div className="text-xs text-gray-500 mb-1">Recommended next topics:</div>
            <ul className="list-disc ml-5 text-sm">
              {recs.map(r => <li key={r.slug}>{r.name}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
