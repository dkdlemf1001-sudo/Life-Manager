
import React, { useState, useEffect, Suspense, lazy, useCallback, memo } from 'react';
import { APPS } from './constants';
import { AppId } from './types';
import { db } from './db';
import { 
  Menu, X, LayoutDashboard, Bell, Settings, 
  Loader2, Cloud, RefreshCw, Sparkles, Car, TrendingUp, Target, Bot, Heart, CreditCard,
  Clock, CheckCircle, AlertCircle
} from 'lucide-react';

// Lazy Load App Components
const CarManager = lazy(() => import('./components/CarManager').then(module => ({ default: module.CarManager })));
const FinanceManager = lazy(() => import('./components/FinanceManager').then(module => ({ default: module.FinanceManager })));
const GoalTracker = lazy(() => import('./components/GoalTracker').then(module => ({ default: module.GoalTracker })));
const AIAssistant = lazy(() => import('./components/AIAssistant').then(module => ({ default: module.AIAssistant })));
const SystemSettings = lazy(() => import('./components/SystemSettings').then(module => ({ default: module.SystemSettings })));
const IdealTypeGallery = lazy(() => import('./components/IdealTypeGallery').then(module => ({ default: module.IdealTypeGallery })));
const GagebuManager = lazy(() => import('./components/GagebuManager').then(module => ({ default: module.GagebuManager })));

const SYNC_ID_KEY = 'LIFEOS_SYNC_ID';
const LAST_APP_KEY = 'LIFEOS_LAST_APP';
const LAST_SYNC_TIME_KEY = 'LIFEOS_LAST_SYNC_TIME';

const ClockWidget = memo(() => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const formatTime = (date: Date) => date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true });
  const formatDate = (date: Date) => date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
  return (
    <div className="text-right hidden xl:block">
       <p className="text-sm font-bold text-white shadow-black drop-shadow-sm">{formatTime(currentTime)}</p>
       <p className="text-xs text-white/50">{formatDate(currentTime)}</p>
    </div>
  );
});

const App: React.FC = () => {
  const [currentApp, setCurrentApp] = useState<AppId>(() => {
    const saved = localStorage.getItem(LAST_APP_KEY);
    return (saved as AppId) || AppId.HOME;
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [syncId, setSyncId] = useState<string>(() => localStorage.getItem(SYNC_ID_KEY) || '');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => localStorage.getItem(LAST_SYNC_TIME_KEY) || '');

  useEffect(() => {
    localStorage.setItem(LAST_APP_KEY, currentApp);
  }, [currentApp]);

  const handleCloudSync = useCallback(async (action: 'push' | 'pull' | 'create', targetId?: string) => {
    setSyncStatus('syncing');
    try {
      await db.init();
      const localData = await db.exportAllData();

      if (action === 'create') {
        // 1. 새로운 Cloud Bin 생성
        const response = await fetch('https://api.npoint.io/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localData)
        });
        const result = await response.json();
        if (result.id) {
          const newId = result.id;
          setSyncId(newId);
          localStorage.setItem(SYNC_ID_KEY, newId);
          setSyncStatus('success');
        } else {
          throw new Error('ID 발급 실패');
        }
      } else if (action === 'push') {
        // 2. 기존 Cloud Bin에 데이터 덮어쓰기
        const id = targetId || syncId;
        if (!id) throw new Error('ID가 없습니다');
        
        const response = await fetch(`https://api.npoint.io/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localData)
        });
        if (!response.ok) throw new Error('Push 실패');
        setSyncStatus('success');
      } else if (action === 'pull') {
        // 3. Cloud에서 데이터 가져오기
        const id = targetId || syncId;
        if (!id) throw new Error('ID가 없습니다');

        const response = await fetch(`https://api.npoint.io/${id}`);
        if (!response.ok) throw new Error('데이터를 찾을 수 없습니다');
        const cloudData = await response.json();
        
        await db.importAllData(cloudData);
        setSyncStatus('success');
        setTimeout(() => window.location.reload(), 1000);
      }

      const now = new Date().toLocaleString();
      setLastSyncTime(now);
      localStorage.setItem(LAST_SYNC_TIME_KEY, now);
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Sync Error:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  }, [syncId]);

  const getAppComponent = (id: AppId) => {
    switch (id) {
      case AppId.HOME: return <DashboardHome onChangeApp={setCurrentApp} />;
      case AppId.CAR: return <CarManager />;
      case AppId.FINANCE: return <FinanceManager />;
      case AppId.GOALS: return <GoalTracker />;
      case AppId.IDEAL_TYPE: return <IdealTypeGallery />;
      case AppId.GAGEBU: return <GagebuManager />;
      case AppId.AI_ASSISTANT: return <AIAssistant />;
      case AppId.SETTINGS: return <SystemSettings onSync={handleCloudSync} syncId={syncId} setSyncId={setSyncId} />;
      default: return <DashboardHome onChangeApp={setCurrentApp} />;
    }
  };

  const activeAppDef = APPS.find(a => a.id === currentApp);

  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] text-gray-100 font-sans overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-black/60 backdrop-blur-xl border-b border-white/10 p-4 flex justify-between items-center z-[60] sticky top-0 safe-top">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-pink-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white">LifeOS</span>
        </div>
        <div className="flex items-center gap-2">
          {syncId && (
            <button onClick={() => handleCloudSync('push')} className={`p-2 transition-all ${syncStatus === 'syncing' ? 'animate-spin text-pink-400' : 'text-white/60'}`}>
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white"><Menu className="w-6 h-6" /></button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:static inset-y-0 left-0 z-[100] w-72 bg-black/40 backdrop-blur-2xl border-r border-white/10 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-full flex flex-col">
          <div className="p-8 flex items-center justify-between">
             <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                  <LayoutDashboard className="text-white w-5 h-5" />
                </div>
                <div>
                   <h1 className="font-bold text-xl text-white">Life OS</h1>
                   <p className="text-xs text-white/40">Cloud Integrated</p>
                </div>
             </div>
             <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-white/50"><X className="w-6 h-6" /></button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
            {APPS.map((app) => (
              <button
                key={app.id}
                onClick={() => { setCurrentApp(app.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${currentApp === app.id ? 'bg-white/10 text-white shadow-lg border border-white/5' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                {currentApp === app.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-pink-500 rounded-r-full"></div>}
                <app.icon className={`w-5 h-5 ${currentApp === app.id ? 'text-pink-400' : 'text-white/40'}`} />
                <span className={`text-[15px] ${currentApp === app.id ? 'font-bold' : 'font-medium'}`}>{app.name}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5 space-y-3">
            <button 
              onClick={() => setCurrentApp(AppId.SETTINGS)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center text-pink-300 font-bold text-sm ring-1 ring-white/10">ME</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">User Profile</p>
                <p className="text-[9px] text-white/30 truncate uppercase tracking-widest">{syncId ? `ID: ${syncId}` : 'NOT SYNCED'}</p>
              </div>
              <Settings className="w-4 h-4 text-white/30" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative">
        <header className="hidden md:flex h-20 bg-black/20 backdrop-blur-md border-b border-white/5 px-8 items-center justify-between z-10 sticky top-0">
           <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">{activeAppDef?.name}</h2>
              {syncId && (
                <div className="text-[10px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                   Last Sync: {lastSyncTime || 'Never'}
                </div>
              )}
           </div>
           
           <div className="flex items-center gap-6">
              {syncId && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md transition-all ${syncStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : syncStatus === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-white/5 border-white/10 text-white/50'}`}>
                   {syncStatus === 'syncing' ? <Loader2 className="w-4 h-4 animate-spin" /> : syncStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : syncStatus === 'error' ? <AlertCircle className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
                   <span className="text-[10px] font-black uppercase tracking-widest">
                     {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'success' ? 'Cloud Updated' : syncStatus === 'error' ? 'Sync Failed' : 'Cloud Connected'}
                   </span>
                </div>
              )}
              <ClockWidget />
              <button 
                onClick={() => handleCloudSync('push')} 
                disabled={!syncId || syncStatus === 'syncing'} 
                className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 border border-white/10 text-white/60 hover:text-pink-400 transition-all active:scale-95 disabled:opacity-20 backdrop-blur-md"
              >
                 <RefreshCw className={`w-5 h-5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-container p-4 md:p-8">
           <div className="max-w-6xl mx-auto pb-24 md:pb-10">
              <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-10 h-10 animate-spin text-pink-500" /></div>}>
                {getAppComponent(currentApp)}
              </Suspense>
           </div>
        </div>
      </main>
    </div>
  );
};

const DashboardHome: React.FC<{ onChangeApp: (id: AppId) => void }> = ({ onChangeApp }) => {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-gradient-to-r from-violet-600/80 to-pink-600/80 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl border border-white/20 relative overflow-hidden group">
         <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tighter italic uppercase">Welcome to LifeOS</h1>
            <p className="text-white/80 max-w-xl text-sm md:text-lg leading-relaxed font-medium">모든 아카이브가 클라우드와 로컬 DB에 안전하게 보관 중입니다.</p>
         </div>
         <div className="absolute -right-20 -bottom-32 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {APPS.filter(app => app.id !== AppId.HOME && app.id !== AppId.SETTINGS).map(app => (
            <div key={app.id} onClick={() => onChangeApp(app.id)} className="cursor-pointer bg-black/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all group">
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <app.icon className="w-6 h-6 text-pink-400" />
               </div>
               <h3 className="font-black text-white text-xl uppercase italic tracking-tighter">{app.name}</h3>
               <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">{app.description}</p>
            </div>
         ))}
      </div>
    </div>
  );
};

export default App;
