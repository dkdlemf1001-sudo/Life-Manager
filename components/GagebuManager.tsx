import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../db';
import { ExpenseRecord } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { 
  CreditCard, Calendar, PlusCircle, TrendingUp, TrendingDown, 
  PieChart as PieIcon, Trash2, DollarSign, Wallet, ArrowUpRight, ArrowDownRight,
  Filter, CheckCircle2, History, Loader2, BarChart3
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, AreaChart, Area, CartesianGrid
} from 'recharts';

const COLORS = ['#f472b6', '#818cf8', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa', '#9ca3af'];

export const GagebuManager: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState('');

  // Load Data
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        await db.init();
        const data = await db.getAll<ExpenseRecord>('expenses');
        // Sort by date descending
        setExpenses(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        console.error("Failed to load expenses", error);
      } finally {
        setLoading(false);
      }
    };
    loadExpenses();
  }, []);

  const handleAddExpense = async () => {
    if (!amount) return;

    const newExpense: ExpenseRecord = {
      id: Date.now().toString(),
      date,
      amount: Number(amount.replace(/,/g, '')),
      category,
      note
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    await db.save('expenses', newExpense);

    // Reset Form (keep date)
    setAmount('');
    setNote('');
    // Optionally trigger a success visual feedback here
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('이 소비 기록을 삭제하시겠습니까?')) {
      const updatedExpenses = expenses.filter(e => e.id !== id);
      setExpenses(updatedExpenses);
      await db.delete('expenses', id);
    }
  };

  // Analytics Logic
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const prevMonthDate = new Date();
  prevMonthDate.setMonth(currentMonth - 1);
  const prevMonth = prevMonthDate.getMonth();
  const prevMonthYear = prevMonthDate.getFullYear();

  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const prevMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
  });

  const totalCurrent = currentMonthExpenses.reduce((acc, cur) => acc + cur.amount, 0);
  const totalPrev = prevMonthExpenses.reduce((acc, cur) => acc + cur.amount, 0);
  
  const diff = totalCurrent - totalPrev;
  const diffPercent = totalPrev > 0 ? ((diff / totalPrev) * 100).toFixed(1) : '0.0';

  // Category Chart Data
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonthExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [currentMonthExpenses]);

  // Monthly Trend Data (Last 6 Months)
  const monthlyTrendData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonth - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      
      const monthlyTotal = expenses
        .filter(e => {
           const ed = new Date(e.date);
           return ed.getMonth() === m && ed.getFullYear() === y;
        })
        .reduce((acc, cur) => acc + cur.amount, 0);
      
      data.push({
        name: `${m + 1}월`,
        amount: monthlyTotal
      });
    }
    return data;
  }, [expenses, currentMonth]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        <p className="text-white/60 font-bold">가계부 데이터 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 animate-in fade-in duration-500">
      
      {/* 1. Dashboard Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Card: Current Month Spending */}
        <div className="md:col-span-2 bg-gradient-to-r from-orange-600/80 to-pink-600/80 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-white/20 relative overflow-hidden text-white group">
           <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm border border-white/10">
                    <Wallet className="w-6 h-6 text-white" />
                 </div>
                 <h2 className="text-2xl font-bold tracking-tight">이번 달 총 지출</h2>
              </div>
              
              <div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-5xl md:text-7xl font-mono font-bold tracking-tighter drop-shadow-sm">
                       {totalCurrent.toLocaleString()}
                    </span>
                    <span className="text-2xl font-bold opacity-60">원</span>
                 </div>
                 
                 <div className="flex items-center gap-4 mt-4">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md ${diff > 0 ? 'bg-white/20 border-white/30 text-white' : 'bg-emerald-400/20 border-emerald-400/30 text-emerald-100'}`}>
                       {diff > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                       <span>전월 대비 {Math.abs(Number(diffPercent))}% {diff > 0 ? '증가' : '감소'}</span>
                    </div>
                    <span className="text-xs font-medium opacity-60">지난 달: {totalPrev.toLocaleString()}원</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Mini Chart Card */}
        <div className="bg-black/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 flex flex-col justify-between">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                 <BarChart3 className="w-5 h-5 text-orange-400" /> 월별 추이
              </h3>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">6 Months</span>
           </div>
           <div className="flex-1 min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={monthlyTrendData}>
                    <defs>
                       <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{fontSize: 10, fill: '#666'}} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                       contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                       formatter={(val: number) => [`${val.toLocaleString()}원`, '지출']}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* 2. Quick Input Form */}
         <div className="lg:col-span-1 bg-black/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 h-fit">
            <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-2">
               <PlusCircle className="w-5 h-5 text-orange-500" /> 지출 기록하기
            </h3>
            
            <div className="space-y-5">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">날짜</label>
                  <div className="relative">
                     <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer"
                     />
                     <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">금액</label>
                  <div className="relative">
                     <input 
                        type="text" 
                        inputMode="numeric"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ","))}
                        placeholder="0"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 pl-10 text-white font-mono font-bold text-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-white/20"
                     />
                     <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 font-bold">₩</span>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">카테고리</label>
                  <div className="grid grid-cols-2 gap-2">
                     {EXPENSE_CATEGORIES.map(cat => (
                        <button
                           key={cat}
                           onClick={() => setCategory(cat)}
                           className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${category === cat ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
                        >
                           {cat}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">메모 (선택)</label>
                  <input 
                     type="text"
                     value={note}
                     onChange={(e) => setNote(e.target.value)}
                     placeholder="내용을 입력하세요..."
                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-white/20"
                  />
               </div>

               <button 
                  onClick={handleAddExpense}
                  className="w-full bg-white text-black font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition-all hover:bg-white/90 flex items-center justify-center gap-2 mt-4"
               >
                  <CheckCircle2 className="w-5 h-5" /> 저장하기
               </button>
            </div>
         </div>

         {/* 3. Category Pie Chart & List */}
         <div className="lg:col-span-2 space-y-6">
            {/* Category Chart */}
            <div className="bg-black/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10">
               <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-xl text-white flex items-center gap-2">
                     <PieIcon className="w-5 h-5 text-pink-500" /> 카테고리별 지출
                  </h3>
                  <span className="text-xs font-bold text-white/40 bg-white/5 px-3 py-1 rounded-lg">This Month</span>
               </div>
               
               <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="h-64 w-64 shrink-0 relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={categoryData}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                           >
                              {categoryData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                              ))}
                           </Pie>
                           <RechartsTooltip 
                             contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                             formatter={(val: number) => `${val.toLocaleString()}원`}
                           />
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total</span>
                        <span className="text-sm font-mono font-bold text-white">{currentMonth + 1}월</span>
                     </div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                     {categoryData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                              <span className="text-xs font-bold text-white">{entry.name}</span>
                           </div>
                           <span className="text-xs font-mono font-bold text-white/60">{Math.round((entry.value / totalCurrent) * 100)}%</span>
                        </div>
                     ))}
                     {categoryData.length === 0 && <p className="col-span-2 text-center text-sm text-white/30 py-4">이번 달 지출 내역이 없습니다.</p>}
                  </div>
               </div>
            </div>

            {/* Recent Transaction List */}
            <div className="bg-black/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 min-h-[300px]">
               <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" /> 최근 내역
               </h3>
               
               <div className="space-y-3">
                  {expenses.length === 0 ? (
                     <div className="text-center py-12">
                        <p className="text-white/30 font-bold">아직 기록된 지출이 없습니다.</p>
                     </div>
                  ) : (
                     expenses.slice(0, 10).map((expense) => (
                        <div key={expense.id} className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xs bg-white/10 border border-white/10`}>
                                 {expense.date.substring(5).replace('-', '/')}
                              </div>
                              <div>
                                 <p className="font-bold text-white text-sm">{expense.note || expense.category}</p>
                                 <p className="text-xs font-bold text-white/40 mt-0.5">{expense.category}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className="font-mono font-bold text-white">- {expense.amount.toLocaleString()}</span>
                              <button 
                                 onClick={() => handleDeleteExpense(expense.id)}
                                 className="p-2 text-white/20 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};