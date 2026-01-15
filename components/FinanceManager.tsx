import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { INITIAL_STOCKS } from '../constants';
import { StockHolding } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Plus, Trash2, DollarSign, 
  BarChart3, PieChart as PieIcon, ArrowUpRight, ArrowDownRight,
  PlusCircle, X, Save, RefreshCw, ExternalLink, AlertCircle, Loader2,
  Clock, Activity
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Generate dummy 24h history based on current price for visualization
const generateHistory = (price: number) => {
  const data = [];
  const base = price * 0.98;
  for (let i = 0; i < 7; i++) {
    data.push({ 
      time: `${9 + i * 2}:00`, 
      val: Number((base + (Math.random() * (price * 0.04))).toFixed(2)) 
    });
  }
  data[6].val = price; // Current price is last point
  return data;
};

export const FinanceManager: React.FC = () => {
  const [stocks, setStocks] = useState<StockHolding[]>(() => {
    const saved = localStorage.getItem('LIFEOS_STOCKS');
    return saved ? JSON.parse(saved) : INITIAL_STOCKS;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() => localStorage.getItem('LIFEOS_STOCKS_LAST_UPDATE') || 'N/A');
  const [newStock, setNewStock] = useState({ symbol: '', name: '', shares: '', avgPrice: '' });
  const [groundingLinks, setGroundingLinks] = useState<{title: string, uri: string}[]>([]);
  
  // Track "Base Prices" from last real fetch to prevent simulation drift
  const lastRealPricesRef = useRef<Record<string, number>>({});

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('LIFEOS_STOCKS', JSON.stringify(stocks));
    localStorage.setItem('LIFEOS_STOCKS_LAST_UPDATE', lastUpdated);
  }, [stocks, lastUpdated]);

  // Simulation Logic: Subtle fluctuations that stay within a small threshold of the last real price
  useEffect(() => {
    const interval = setInterval(() => {
      if (isUpdating) return;
      
      setStocks(prev => prev.map(stock => {
        const lastReal = lastRealPricesRef.current[stock.symbol] || stock.currentPrice;
        // Drift factor: try to stay close to the last real price to prioritize accuracy over mock drift
        const drift = (lastReal - stock.currentPrice) * 0.1;
        const randomChange = (Math.random() - 0.5) * (stock.currentPrice * 0.0005);
        
        return { 
          ...stock, 
          currentPrice: Number((stock.currentPrice + randomChange + drift).toFixed(2)) 
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [isUpdating]);

  const fetchRealtimePrices = async () => {
    if (stocks.length === 0 || isUpdating) return;
    setIsUpdating(true);
    setGroundingLinks([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const symbolsList = stocks.map(s => s.symbol).join(', ');
      
      // We use Gemini with Google Search tool to act as our "Financial API"
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Fetch the absolute latest real-time market prices for these stock/ETF symbols: ${symbolsList}. 
        Focus on current trading price. 
        Return ONLY a JSON object where the key is the symbol and the value is the numeric price. 
        No markdown, no explanation. Format: {"SYMBOL": price, ...}`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "";
      // Strip potential JSON code blocks
      const jsonStr = text.replace(/```json|```/g, '').trim();
      const priceMap: Record<string, number> = JSON.parse(jsonStr);

      // Extract sources as per Grounding requirements
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const links = chunks
        .filter((c: any) => c.web)
        .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
      setGroundingLinks(links);

      // Update state and reference prices
      setStocks(prev => prev.map(stock => {
        const fetchedPrice = priceMap[stock.symbol.toUpperCase()] || priceMap[stock.symbol];
        if (fetchedPrice) {
          lastRealPricesRef.current[stock.symbol] = fetchedPrice;
          return { ...stock, currentPrice: fetchedPrice };
        }
        return stock;
      }));
      
      setLastUpdated(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    } catch (error) {
      console.error("Finance update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const totalValue = useMemo(() => stocks.reduce((acc, s) => acc + (s.shares * s.currentPrice), 0), [stocks]);
  const totalCost = useMemo(() => stocks.reduce((acc, s) => acc + (s.shares * s.avgPrice), 0), [stocks]);
  const totalGain = totalValue - totalCost;
  const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const pieData = useMemo(() => stocks.map(s => ({
    name: s.symbol,
    value: s.shares * s.currentPrice
  })), [stocks]);

  // Aggregate history for the main chart based on totalValue
  const mainChartData = useMemo(() => generateHistory(totalValue), [totalValue]);

  const handleAddStock = () => {
    if (!newStock.symbol || !newStock.shares || !newStock.avgPrice) return;
    
    const stockToAdd: StockHolding = {
      symbol: newStock.symbol.toUpperCase(),
      name: newStock.name || newStock.symbol.toUpperCase(),
      shares: Number(newStock.shares),
      avgPrice: Number(newStock.avgPrice),
      currentPrice: Number(newStock.avgPrice)
    };

    setStocks(prev => [...prev, stockToAdd]);
    setNewStock({ symbol: '', name: '', shares: '', avgPrice: '' });
    setIsAddModalOpen(false);
  };

  const handleDeleteStock = (symbol: string) => {
    if (window.confirm(`${symbol} 종목을 포트폴리오에서 삭제하시겠습니까?`)) {
      setStocks(prev => prev.filter(s => s.symbol !== symbol));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Premium Portfolio Header */}
      <div className="bg-[#0c0e14] dark:bg-slate-950 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-slate-800/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -ml-20 -mb-20"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                   <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Global Portfolio</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  Last Updated: {lastUpdated}
                </div>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Estimated Net Worth</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl md:text-7xl font-mono font-bold tracking-tighter">
                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-slate-500 font-mono text-xl">USD</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-md ${totalGain >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {totalGain >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  <span className="text-xl font-bold font-mono">{totalGain >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%</span>
                </div>
                <div className="text-sm font-medium text-slate-400">
                   {totalGain >= 0 ? 'Profit of' : 'Loss of'} <span className={`font-mono font-bold ${totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>${Math.abs(totalGain).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button 
                onClick={fetchRealtimePrices}
                disabled={isUpdating}
                className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-8 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />}
                <span className="text-sm">실시간 시장가 갱신</span>
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <PlusCircle className="w-5 h-5" />
                <span className="text-sm">자산 추가하기</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sources Section as per Grounding guidelines */}
      {groundingLinks.length > 0 && (
        <div className="px-2">
          <div className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-4 flex flex-wrap items-center gap-4 border border-slate-200 dark:border-slate-800/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3" /> Data Sources
            </span>
            <div className="flex flex-wrap gap-2">
              {groundingLinks.map((link, idx) => (
                <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-indigo-500 hover:underline flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                  {link.title} <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Market Overview Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" /> Market Overview
              </h3>
              <p className="text-xs text-slate-400 mt-1">Total portfolio value trend (24h simulation)</p>
            </div>
            <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-xl">
              {['1D', '1W', '1M', '1Y'].map(t => (
                <button key={t} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${t === '1D' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 h-80 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mainChartData}>
                <defs>
                  <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Portfolio Value']}
                />
                <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMain)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Diversification (Pie Chart) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
           <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2 mb-8">
             <PieIcon className="w-5 h-5 text-indigo-500" /> Diversification
           </h3>
           <div className="relative h-64 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={75}
                    outerRadius={95}
                    paddingAngle={6}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={1200}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weight</span>
                 <span className="text-xl font-mono font-bold dark:text-white">100%</span>
              </div>
           </div>
           <div className="mt-8 grid grid-cols-2 gap-3">
              {stocks.map((stock, index) => (
                 <div key={stock.symbol} className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-transparent">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <div className="min-w-0 flex-1">
                       <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{stock.symbol}</p>
                       <p className="text-[9px] font-bold text-slate-400 font-mono">
                         {((stock.shares * stock.currentPrice / totalValue) * 100).toFixed(1)}%
                       </p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Asset Table View */}
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-xl tracking-tight">Active Portfolio Holdings</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Monitoring {stocks.length} assets in real-time</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl">
               <DollarSign className="w-4 h-4" /> Total Cost: ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] bg-slate-50/50 dark:bg-slate-900/20">
                <th className="px-8 py-5">Asset</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5">Allocation</th>
                <th className="px-8 py-5">Value</th>
                <th className="px-8 py-5">Profit/Loss</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {stocks.map((stock, idx) => {
                const currentVal = stock.shares * stock.currentPrice;
                const costVal = stock.shares * stock.avgPrice;
                const gain = currentVal - costVal;
                const gainPct = (gain / costVal) * 100;
                const weight = (currentVal / totalValue) * 100;

                return (
                  <tr key={stock.symbol} className="group hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg text-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                          {stock.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{stock.symbol}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stock.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-mono font-bold text-slate-900 dark:text-white">${stock.currentPrice.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Avg: ${stock.avgPrice.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="w-32">
                        <div className="flex justify-between text-[10px] font-bold mb-1.5 text-slate-500">
                          <span>{weight.toFixed(1)}%</span>
                          <span>{stock.shares} SH</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${weight}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-mono font-bold text-slate-900 dark:text-white">${currentVal.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${gain >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {gain >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {gainPct.toFixed(2)}%
                      </div>
                      <p className={`text-[10px] font-bold mt-1 ml-1 ${gain >= 0 ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>
                        {gain >= 0 ? '+' : ''}${gain.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDeleteStock(stock.symbol)}
                        className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/40 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-3xl border border-white/10 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold dark:text-white tracking-tight">Add New Asset</h3>
                  <p className="text-sm text-slate-500 mt-1">Include stocks, ETFs, or crypto to your list</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 block">Ticker Symbol</label>
                    <input 
                      type="text"
                      placeholder="e.g. AAPL, BTC-USD, VOO"
                      value={newStock.symbol}
                      onChange={e => setNewStock({...newStock, symbol: e.target.value.toUpperCase()})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:font-normal placeholder:text-slate-400"
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 block">Shares Owned</label>
                        <input 
                        type="number"
                        placeholder="0.00"
                        value={newStock.shares}
                        onChange={e => setNewStock({...newStock, shares: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 block">Average Cost ($)</label>
                        <input 
                        type="number"
                        placeholder="0.00"
                        value={newStock.avgPrice}
                        onChange={e => setNewStock({...newStock, avgPrice: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 block">Asset Name (Optional)</label>
                    <input 
                      type="text"
                      placeholder="e.g. Apple Inc."
                      value={newStock.name}
                      onChange={e => setNewStock({...newStock, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:font-normal"
                    />
                 </div>
              </div>

              <button 
                onClick={handleAddStock}
                className="w-full mt-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-[1.5rem] shadow-2xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
              >
                <Save className="w-5 h-5" /> Confirm and Add to List
              </button>
              
              <p className="text-center text-[10px] text-slate-400 mt-6 font-medium">
                The current price will be fetched automatically after adding.
              </p>
           </div>
        </div>
      )}
    </div>
  );
};
