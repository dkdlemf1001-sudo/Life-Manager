import React, { useState } from 'react';
import { INITIAL_GOALS } from '../constants';
import { Goal } from '../types';
import { Check, Trophy } from 'lucide-react';

export const GoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);

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
    <div className="max-w-4xl mx-auto space-y-6 pb-24 lg:pb-0">
      {/* Overview Card */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">{new Date().getFullYear()}년 목표</h2>
            <p className="text-orange-100 mt-1">당신의 꿈을 현실로 만드세요</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="mt-8">
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span>연간 달성률</span>
            <span>{completedCount} / {goals.length} 달성</span>
          </div>
          <div className="h-3 bg-black/20 rounded-full overflow-hidden">
             <div 
               className="h-full bg-white rounded-full transition-all duration-1000 shadow-sm"
               style={{ width: `${(completedCount / goals.length) * 100}%` }}
             ></div>
          </div>
        </div>
      </div>

      {/* Goal List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
             <div>
                <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${getCategoryColor(goal.category)}`}>
                        {goal.category}
                    </span>
                    {goal.progress === 100 && (
                        <div className="bg-green-500 text-white p-1 rounded-full">
                            <Check className="w-4 h-4" />
                        </div>
                    )}
                </div>
                <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-1">{goal.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">마감일: {goal.targetDate}</p>
             </div>

             <div className="mt-6">
               <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                 <span>진행률</span>
                 <span>{goal.progress}%</span>
               </div>
               <div className="relative pt-1">
                <input 
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => updateProgress(goal.id, Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
