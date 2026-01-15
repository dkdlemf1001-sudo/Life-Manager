import React from 'react';
import { INITIAL_STOCKS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MOCK_HISTORY = [
  { name: '1월', val: 45000 },
  { name: '2월', val: 47000 },
  { name: '3월', val: 46500 },
  { name: '4월', val: 49000 },
  { name: '5월', val: 52000 },
  { name: '6월', val: 54300 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export const FinanceManager: React.FC = () => {
  const totalValue = INITIAL_STOCKS.reduce((acc, stock) => acc + (stock.shares * stock.currentPrice), 0);
  const totalCost = INITIAL_STOCKS.reduce((acc, stock) => acc + (stock.shares * stock.avgPrice), 0);
  const totalGain = totalValue - totalCost;
  const gainPercent = (totalGain / totalCost) * 100;

  const pieData = INITIAL_STOCKS.map(stock => ({
    name: stock.symbol,
    value: stock.shares * stock.currentPrice
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 lg:pb-0">
      {/* Portfolio Summary Card */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <p className="text-emerald-200 font-medium mb-1">총 자산 가치</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-bold tracking-tight">${totalValue.toLocaleString()}</span>
                    <span className="text-emerald-300/80 text-lg">USD</span>
                </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                <div className={`flex items-center font-bold text-lg ${totalGain >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                    {totalGain >= 0 ? <TrendingUp className="w-5 h-5 mr-1.5" /> : <TrendingDown className="w-5 h-5 mr-1.5" />}
                    {Math.abs(gainPercent).toFixed(2)}%
                </div>
                <div className="h-4 w-px bg-white/20"></div>
                <span className="text-emerald-100 font-mono">
                    {totalGain >= 0 ? '+' : '-'}${Math.abs(totalGain).toLocaleString()}
                </span>
            </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">6개월 수익률 추이</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_HISTORY}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '평가액']}
                />
                <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">포트폴리오 비중</h3>
           <div className="h-64 flex items-center justify-between">
              <div className="h-full w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3 pl-4">
                {INITIAL_STOCKS.map((stock, index) => (
                   <div key={stock.symbol} className="flex items-center justify-between text-sm">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="font-medium text-gray-700 dark:text-gray-200">{stock.symbol}</span>
                     </div>
                     <span className="text-gray-500 font-mono">
                        {((stock.shares * stock.currentPrice / totalValue) * 100).toFixed(0)}%
                     </span>
                   </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* Holdings List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">보유 종목 현황</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {INITIAL_STOCKS.map(stock => {
            const gain = (stock.currentPrice - stock.avgPrice) / stock.avgPrice * 100;
            return (
              <div key={stock.symbol} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center font-bold text-xl text-gray-700 dark:text-gray-300">
                    {stock.symbol[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{stock.name}</h4>
                    <p className="text-sm text-gray-500">{stock.shares}주 보유 • 평단가 ${stock.avgPrice}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg dark:text-white">${stock.currentPrice}</p>
                  <p className={`text-sm font-medium ${gain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {gain >= 0 ? '+' : ''}{gain.toFixed(2)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
