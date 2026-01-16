import React, { useState, useEffect, Suspense, lazy, useCallback, memo } from 'react';
import { APPS } from './constants';
import { AppId } from './types';
import { db } from './db';
import { 
  Menu, X, LayoutDashboard, Bell, Search, Settings, 
  Loader2, Cloud, RefreshCw, Sparkles, Car, TrendingUp, Target, Bot, Heart, CreditCard
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

// Optimized Clock Component to isolate re-renders
const ClockWidget = memo(() => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
  }

  return (
    <div className="text-right hidden xl:block">
       <p className="text-sm font-bold text-white shadow-black drop-shadow-sm">{formatTime(currentTime)}</p>
       <p className="text-xs text-white/50">{formatDate(currentTime)}</p>
    </div>
  );
});

const App: React.FC = () => {
  const [currentApp, setCurrentApp] = useState<AppId>(AppId.HOME);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Sync State
  const [syncId, setSyncId] = useState<string>(() => localStorage.getItem(SYNC_ID_KEY) || '');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Cloud Sync Functions
  const handleCloudSync = useCallback(async (action: 'push' | 'pull', targetId?: string) => {
    const id = targetId || syncId;
    if (!id) return;

    setSyncStatus('syncing');
    try {
      await db.init(); // Ensure DB is open

      if (action === 'push') {
        const localData = await db.exportAllData();

        // Using npoint.io as a simple public JSON storage for this LifeOS project
        await fetch(`https://api.npoint.io/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localData)
        });
        setSyncStatus('success');
      } else {
        const response = await fetch(`https://api.npoint.io/${id}`);
        if (!response.ok) throw new Error('Not found');
        const cloudData = await response.json();

        // Update IndexedDB
        await db.importAllData(cloudData);
        
        setSyncStatus('success');
        window.location.reload(); // Reload to refresh all component states
      }
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
      default: return <div className="p-10 text-center">준비 중입니다.</div>;
    }
  };

  const activeAppDef = APPS.find(a => a.id === currentApp);

  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] text-gray-100 font-sans overflow-hidden">
      
      {/* Mobile Header (Glass) */}
      <div className="md:hidden bg-black/40 backdrop-blur-xl border-b border-white/10 p-4 flex justify-between items-center z-[60] sticky top-0 safe-top">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-pink-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">LifeOS</span>
        </div>
        <div className="flex items-center gap-2">
          {syncId && (
            <button onClick={() => handleCloudSync('push')} className={`p-2 rounded-lg ${syncStatus === 'syncing' ? 'animate-spin text-pink-400' : 'text-white/60'}`}>
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 active:scale-95 transition-transform rounded-lg text-white">
             <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Sidebar Navigation (Glass) */}
      <aside className={`fixed md:static inset-y-0 left-0 z-[100] w-72 bg-black/40 backdrop-blur-2xl border-r border-white/10 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-full flex flex-col">
          <div className="p-6 md:p-8 flex items-center justify-between">
             <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <LayoutDashboard className="text-white w-5 h-5" />
                </div>
                <div>
                   <h1 className="font-bold text-xl tracking-tight text-white">Life OS</h1>
                   <p className="text-xs text-white/50 font-medium tracking-wide">Moka Edition</p>
                </div>
             </div>
             <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-white/50 hover:bg-white/10 rounded-lg">
               <X className="w-6 h-6" />
             </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto no-scrollbar scroll-container">
            <p className="px-4 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3 mt-2">Main Menu</p>
            {APPS.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  setCurrentApp(app.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${currentApp === app.id ? 'bg-white/10 text-white shadow-lg border border-white/5' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                {currentApp === app.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-pink-500 rounded-r-full shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>}
                <app.icon className={`w-5 h-5 ${currentApp === app.id ? 'text-pink-400' : 'text-white/40 group-hover:text-white/80'}`} />
                <span className={`text-[15px] ${currentApp === app.id ? 'font-bold' : 'font-medium'}`}>{app.name}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5 space-y-3">
            {syncId && (
              <div className="px-3 py-2 bg-black/20 rounded-xl flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${syncStatus === 'success' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : syncStatus === 'error' ? 'bg-rose-500' : 'bg-pink-500 animate-pulse'}`}></div>
                   <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Cloud Sync</span>
                </div>
                <button onClick={() => handleCloudSync('push')} className="p-1 hover:bg-white/10 rounded transition-colors text-white/70">
                   <RefreshCw className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left border border-transparent hover:border-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center text-pink-300 font-bold text-sm ring-1 ring-white/10 shadow-inner">ME</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">내 프로필</p>
                <p className="text-xs text-white/40 truncate">{syncId ? `ID: ${syncId}` : '로컬 모드'}</p>
              </div>
              <Settings className="w-4 h-4 text-white/30" />
            </button>
          </div>
        </div>
      </aside>
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-[90] md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative">
        <header className="hidden md:flex h-20 bg-black/20 backdrop-blur-md border-b border-white/5 px-8 items-center justify-between z-10 sticky top-0">
           <div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                {activeAppDef?.name}
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-pink-500/30 text-pink-400 bg-pink-500/10 uppercase tracking-wider">v1.2</span>
              </h2>
              <p className="text-sm text-white/40 hidden lg:block">{activeAppDef?.description}</p>
           </div>
           
           <div className="flex items-center gap-6">
              {syncId && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md ${syncStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : syncStatus === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-white/5 border-white/10 text-white/50'}`}>
                   {syncStatus === 'syncing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                   <span className="text-xs font-bold uppercase tracking-widest">{syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'success' ? 'Synced' : syncStatus === 'error' ? 'Error' : 'Cloud Connected'}</span>
                </div>
              )}
              
              {/* Optimized Clock Component */}
              <ClockWidget />

              <button onClick={() => handleCloudSync('push')} disabled={!syncId || syncStatus === 'syncing'} className="relative p-2.5 bg-white/5 rounded-full hover:bg-white/10 border border-white/10 text-white/60 hover:text-pink-400 transition-all active:scale-95 disabled:opacity-20 backdrop-blur-md">
                 <RefreshCw className={`w-5 h-5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-container p-4 md:p-8">
           <div className="max-w-6xl mx-auto pb-24 md:pb-10">
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="flex flex-col items-center gap-3"><Loader2 className="w-10 h-10 animate-spin text-pink-500" /><p className="text-sm font-medium text-white/50 animate-pulse">로딩 중...</p></div></div>}>
                {currentApp && getAppComponent(currentApp)}
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
      {/* Hero Card */}
      <div className="bg-gradient-to-r from-violet-600/80 to-pink-600/80 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl border border-white/20 relative overflow-hidden group">
         <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight drop-shadow-md">Hi, Manager! 👋</h1>
            <p className="text-white/90 max-w-xl text-sm md:text-lg leading-relaxed font-medium">
              오늘 하루도 아일릿 모카처럼 상큼하게 시작해볼까요?<br className="hidden md:block"/>
              모든 데이터는 안전하게 동기화되고 있습니다.
            </p>
         </div>
         {/* Decorative Elements */}
         <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
         <div className="absolute -right-20 -bottom-32 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl group-hover:bg-pink-400/40 transition-all duration-700"></div>
         <div className="absolute right-40 -top-20 w-60 h-60 bg-violet-400/30 rounded-full blur-3xl"></div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
         <div onClick={() => onChangeApp(AppId.CAR)} className="cursor-pointer bg-black/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-white/10 active:scale-[0.98] md:hover:-translate-y-1 md:hover:border-pink-500/50 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-blue-500/20 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300 border border-blue-500/30"><Car className="w-6 h-6 text-blue-400" /></div>
              <span className="text-xs font-bold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span> 주의</span>
            </div>
            <h3 className="font-bold text-white/60 text-xs md:text-sm uppercase tracking-wider">차량 건강 상태</h3>
            <p className="text-3xl md:text-4xl font-bold text-white mt-2 tracking-tight">85 <span className="text-lg text-white/30 font-sans">점</span></p>
         </div>
         
         {/* GAGEBU CARD */}
         <div onClick={() => onChangeApp(AppId.GAGEBU)} className="cursor-pointer bg-black/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-white/10 active:scale-[0.98] md:hover:-translate-y-1 md:hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-orange-500/20 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300 border border-orange-500/30"><CreditCard className="w-6 h-6 text-orange-400" /></div>
            </div>
            <h3 className="font-bold text-white/60 text-xs md:text-sm uppercase tracking-wider">이번 달 지출</h3>
            <p className="text-3xl md:text-4xl font-bold text-white mt-2 font-mono tracking-tight">
              <span className="text-sm text-white/40 align-top mr-1">₩</span>
              2,450,000
            </p>
         </div>

         <div onClick={() => onChangeApp(AppId.FINANCE)} className="cursor-pointer bg-black/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-white/10 active:scale-[0.98] md:hover:-translate-y-1 md:hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-green-500/20 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300 border border-green-500/30"><TrendingUp className="w-6 h-6 text-green-400" /></div>
              <span className="text-xs font-bold bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-full flex items-center gap-1 backdrop-blur-md">+4.2%</span>
            </div>
            <h3 className="font-bold text-white/60 text-xs md:text-sm uppercase tracking-wider">포트폴리오 가치</h3>
            <p className="text-3xl md:text-4xl font-bold text-white mt-2 font-mono tracking-tight">$45,230</p>
         </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div onClick={() => onChangeApp(AppId.IDEAL_TYPE)} className="cursor-pointer bg-black/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-white/10 active:scale-[0.98] md:hover:-translate-y-1 md:hover:border-pink-500/50 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-pink-500/20 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300 border border-pink-500/30"><Heart className="w-6 h-6 text-pink-400" /></div>
          </div>
          <h3 className="font-bold text-white/60 text-xs md:text-sm uppercase tracking-wider">Ideal Type Gallery</h3>
          <div className="mt-2 flex items-center gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">MY MUSES</span>
              <span className="text-xs font-medium text-pink-300 bg-pink-500/10 px-2 py-1 rounded-lg">New</span>
          </div>
        </div>

        <div onClick={() => onChangeApp(AppId.GOALS)} className="cursor-pointer bg-black/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-white/10 active:scale-[0.98] md:hover:-translate-y-1 md:hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-red-500/20 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300 border border-red-500/30"><Target className="w-6 h-6 text-red-400" /></div>
          </div>
          <h3 className="font-bold text-white/60 text-xs md:text-sm uppercase tracking-wider">연간 목표 달성</h3>
          <div className="mt-4 w-full bg-white/10 h-3 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{ width: '45%' }}></div>
          </div>
          <p className="text-xs font-bold text-white/50 mt-3 text-right">45% 진행 중</p>
        </div>
      </div>

      {/* Notifications & AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 bg-black/40 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 border border-white/10">
             <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2"><Bell className="w-5 h-5 text-pink-500" /> 알림 내역</h3>
             <div className="space-y-3">
                {[
                  { title: '엔진 오일 교체 시기가 되었습니다.', time: '2시간 전', type: 'car', icon: Car, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                  { title: '애플(AAPL) 주가가 2% 상승했습니다.', time: '5시간 전', type: 'stock', icon: TrendingUp, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
                ].map((notif, i) => (
                   <div key={i} className="flex items-start gap-4 p-4 hover:bg-white/5 rounded-3xl transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${notif.color}`}><notif.icon className="w-6 h-6" /></div>
                      <div className="flex-1 py-1">
                         <p className="text-sm font-bold text-white/90 group-hover:text-pink-400 transition-colors">{notif.title}</p>
                         <p className="text-xs text-white/40 mt-1 font-medium">{notif.time}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 border border-indigo-500/20 flex flex-col justify-center items-center text-center relative overflow-hidden min-h-[280px]">
             <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-[60px]"></div>
             <div className="w-18 h-18 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white/10 relative z-10 p-4"><Bot className="w-10 h-10 text-pink-300" /></div>
             <h3 className="font-bold text-xl text-white mb-2 relative z-10">AI 비서에게 질문하기</h3>
             <p className="text-xs text-white/60 mb-8 leading-relaxed max-w-xs relative z-10">"이번 달 소비 패턴을 분석해줘"<br/>모카 같은 AI가 답변해드립니다.</p>
             <button onClick={() => onChangeApp(AppId.AI_ASSISTANT)} className="w-full bg-white text-black hover:bg-pink-100 px-6 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95 relative z-10 flex items-center justify-center gap-2">
               <Sparkles className="w-4 h-4 text-pink-500" /> AI 비서 시작하기
             </button>
          </div>
      </div>
    </div>
  );
};

export default App;