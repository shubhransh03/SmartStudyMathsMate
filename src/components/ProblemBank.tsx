import { useEffect, useMemo, useState } from 'react';
import ProblemCard from './ProblemCard';
import { generateBatch, listTopics, PracticeProblem } from '../learning/problemGenerators';
import { getEntry } from '../learning/learningModel';

export default function ProblemBank() {
  const topics = useMemo(() => listTopics(), []);
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [level, setLevel] = useState<1|2|3| 'ADAPTIVE'>('ADAPTIVE');
  const [items, setItems] = useState<PracticeProblem[]>([]);

  const resolveLevel = (topic: string): 1|2|3 => {
    if (level === 'ADAPTIVE') {
      if (topic === 'ALL') return 2;
      return getEntry(topic.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')).level;
    }
    return level;
  };

  const load = (count=20) => {
    const topicsArg = selectedTopic === 'ALL' ? 'ALL' : [selectedTopic] as any;
    const lvl = resolveLevel(selectedTopic) as 1|2|3;
    const batch = generateBatch(topicsArg, lvl, count);
    setItems(prev => [...prev, ...batch]);
  };

  useEffect(() => {
    setItems([]);
    load(20);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic, level]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <div className="text-xs text-gray-600">Topic</div>
          <select value={selectedTopic} onChange={e=>setSelectedTopic(e.target.value)} className="border rounded px-2 py-2">
            <option value="ALL">All Topics</option>
            {topics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <div className="text-xs text-gray-600">Difficulty</div>
          <select value={String(level)} onChange={e=>setLevel((e.target.value as any) === 'ADAPTIVE' ? 'ADAPTIVE' : Number(e.target.value) as 1|2|3)} className="border rounded px-2 py-2">
            <option value="ADAPTIVE">Adaptive</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <button onClick={() => { setItems([]); load(20); }} className="ml-auto px-3 py-2 rounded bg-indigo-600 text-white">Generate</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(p => <ProblemCard key={p.id} problem={p} />)}
      </div>
      <div className="text-center">
        <button onClick={()=>load(20)} className="px-3 py-2 rounded border">Load more</button>
      </div>
    </div>
  );
}
