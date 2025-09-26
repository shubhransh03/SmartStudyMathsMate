import { useState } from 'react';
import { BookOpenCheck, CalendarDays, Timer } from 'lucide-react';
import ProblemBank from '../components/ProblemBank';
import DailyChallenge from '../components/DailyChallenge';
import TimedPractice from '../components/TimedPractice';

type Tab = 'bank' | 'daily' | 'timed';

export default function Practice() {
  const [tab, setTab] = useState<Tab>('bank');

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold">Math Practice</h1>
          <p className="opacity-90">Problem Bank • Daily Challenge • Timed Practice</p>
        </div>
      </div>

      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={()=>setTab('bank')} className={`px-3 py-2 rounded flex items-center gap-2 transition-all duration-150 ${tab==='bank'?'bg-blue-600 text-white':'border hover:border-blue-300 hover:bg-blue-50'}`}><BookOpenCheck className="h-4 w-4"/> Problem Bank</button>
            <button onClick={()=>setTab('daily')} className={`px-3 py-2 rounded flex items-center gap-2 transition-all duration-150 ${tab==='daily'?'bg-blue-600 text-white':'border hover:border-blue-300 hover:bg-blue-50'}`}><CalendarDays className="h-4 w-4"/> Daily Challenge</button>
            <button onClick={()=>setTab('timed')} className={`px-3 py-2 rounded flex items-center gap-2 transition-all duration-150 ${tab==='timed'?'bg-blue-600 text-white':'border hover:border-blue-300 hover:bg-blue-50'}`}><Timer className="h-4 w-4"/> Timed Practice</button>
          </div>
          <div className="transition-all duration-150 transform will-change-transform">
            {tab === 'bank' && (
              <div className="bg-white rounded-xl shadow-lg p-2 hover:shadow-xl transform-gpu">
                <ProblemBank />
              </div>
            )}
            {tab === 'daily' && (
              <div className="bg-white rounded-xl shadow-lg p-2 hover:shadow-xl transform-gpu">
                <DailyChallenge />
              </div>
            )}
            {tab === 'timed' && (
              <div className="bg-white rounded-xl shadow-lg p-2 hover:shadow-xl transform-gpu">
                <TimedPractice />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
