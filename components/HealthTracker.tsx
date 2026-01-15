import React from 'react';
import { Activity, Droplets, Moon, Info } from 'lucide-react';

export const HealthTracker: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 lg:pb-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-pink-500 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute right-[-20px] top-[-20px] bg-white/10 w-32 h-32 rounded-full group-hover:scale-110 transition-transform"></div>
          <Activity className="w-8 h-8 mb-4 opacity-90 relative z-10" />
          <h3 className="text-lg font-bold relative z-10">오늘의 걸음</h3>
          <p className="text-4xl font-bold mt-2 relative z-10">6,234</p>
          <p className="text-sm opacity-80 mt-1 relative z-10">목표: 10,000보</p>
        </div>
        <div className="bg-blue-500 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute right-[-20px] top-[-20px] bg-white/10 w-32 h-32 rounded-full group-hover:scale-110 transition-transform"></div>
          <Droplets className="w-8 h-8 mb-4 opacity-90 relative z-10" />
          <h3 className="text-lg font-bold relative z-10">수분 섭취</h3>
          <p className="text-4xl font-bold mt-2 relative z-10">1.2L</p>
          <p className="text-sm opacity-80 mt-1 relative z-10">목표: 2.5L</p>
        </div>
      </div>
      
      <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-lg flex justify-between items-center">
        <div>
           <div className="flex items-center gap-2 mb-3">
             <Moon className="w-6 h-6 text-indigo-300" />
             <h3 className="text-xl font-bold">수면 분석</h3>
           </div>
           <p className="text-3xl font-bold">7시간 20분</p>
           <p className="text-sm text-indigo-300 mt-1">어제 밤 수면 시간</p>
        </div>
        <div className="h-24 w-24 rounded-full border-8 border-indigo-500 flex items-center justify-center bg-indigo-800">
          <div className="text-center">
            <span className="block text-xl font-bold">82</span>
            <span className="text-xs text-indigo-300">점수</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold dark:text-white">데일리 습관 체크</h3>
             <Info className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
           {['아침 스트레칭', '비타민 섭취', '설탕 줄이기', '30분 독서'].map(habit => (
             <label key={habit} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <span className="font-medium text-gray-700 dark:text-gray-200">{habit}</span>
                <input type="checkbox" className="w-6 h-6 rounded border-gray-300 text-pink-500 focus:ring-pink-500 transition duration-150 ease-in-out" />
             </label>
           ))}
        </div>
      </div>
    </div>
  );
};
