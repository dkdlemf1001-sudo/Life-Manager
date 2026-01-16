import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Goal } from '../types';
import { Check, Trophy, Loader2 } from 'lucide-react';

export const GoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from DB
  useEffect(() => {
      const loadGoals = async () => {
          try {
              await db.init();
              const loadedGoals = await db.getAll<Goal>('goals');
              setGoals(loadedGoals);
          } catch (e) {
              console.error(e);
          } finally {
              setLoading(false);
          }
      };
      loadGoals();
  }, []);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case '금융': return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case '개인': return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case '건강': return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case '커리어': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const updateProgress = async (id: string, newProgress: number) => {
    const updatedGoals = goals.map(g => g.id === id ? { ...g, progress: Number(newProgress) } : g);
    setGoals(updatedGoals);
    
    // Save specific goal update to DB
    const goal = updatedGoals.find(g => g.id === id);
    if(goal) {
        await db.save('goals', goal);
    }
  };

  const completedCount = goals.filter(g => g.progress === 100).length;

  if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            <p className="text-white/60 font-bold">목표 데이터 로딩 중...</p>
        </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="bg-gradient-to-r from-orange-500/80 to-rose-500/80 backdrop-blur-md rounded-3xl p-8 text-white shadow-2xl border border-white/20">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold drop-shadow-sm">{new Date().getFullYear()}년 목표 현황</h2>
            <p className="text-orange-100 mt-1 font-medium">꿈을 현실로 만들기 위한 여정</p>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
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
               className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.8)]"
               style={{ width: `${goals.length > 0 ? (completedCount / goals.length) * 100 : 0}%` }}
             ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => (
          <div key={goal.id} className="bg-black/40 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/10 flex flex-col justify-between hover:shadow-2xl hover:border-white/20 transition-all group">
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
                <h3 className="font-bold text-xl text-white mb-1 group-hover:text-pink-300 transition-colors">{goal.title}</h3>
                <p className="text-xs text-white/40">Target Date: {goal.targetDate}</p>
             </div>

             <div className="mt-6">
               <div className="flex justify-between text-xs font-bold text-white/50 mb-2">
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
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-pink-500 transition-all"
                />
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};