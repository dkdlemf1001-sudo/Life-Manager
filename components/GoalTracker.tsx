import React, { useState, useEffect } from 'react';
import { INITIAL_GOALS } from '../constants';
import { Goal } from '../types';
import { Check, Trophy } from 'lucide-react';

export const GoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('LIFEOS_GOALS');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  useEffect(() => {
    localStorage.setItem('LIFEOS_GOALS', JSON.stringify(goals));
  }, [goals]);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case '금융': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case '개인': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case '건강': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case '커리어': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const updateProgress = (id: string, newProgress: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, progress: Number(newProgress) } : g));
  };

  const completedCount = goals.filter(g => g.progress === 100).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">{new Date().getFullYear()}년 목표 현황</h2>
            <p className="text-orange-100 mt-1">꿈을 현실로 만들기 위한 여정</p>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="mt-8">
          <div className="flex justify-between text-sm mb-3 font-bold uppercase tracking-wider opacity-90">
            <span>Overall Progress</span>
            <span>{completedCount} / {goals.length} Completed</span>
          </div>
          <div className="h-3.5 bg-black/20 rounded-full overflow-hidden border border-white/10">
             <div 
               className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
               style={{ width: `${(completedCount / goals.length) * 100}%` }}
             ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-shadow">
             <div>
                <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${getCategoryColor(goal.category)}`}>
                        {goal.category}
                    </span>
                    {goal.progress === 100 && (
                        <div className="bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                            <Check className="w-4 h-4" />
                        </div>
                    )}
                </div>
                <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-1">{goal.title}</h3>
                <p className="text-xs text-slate-400">Target Date: {goal.targetDate}</p>
             </div>

             <div className="mt-6">
               <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                 <span className="uppercase tracking-widest">Progress</span>
                 <span>{goal.progress}%</span>
               </div>
               <div className="relative pt-1">
                <input 
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => updateProgress(goal.id, Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
