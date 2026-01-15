import React, { useState, useEffect, Suspense, lazy } from 'react';
import { APPS } from './constants';
import { AppId, AppDefinition } from './types';
import { Menu, X, ChevronRight, LayoutDashboard, Bell, Search, Settings, Loader2 } from 'lucide-react';

// Lazy Load App Components for Performance Optimization
const CarManager = lazy(() => import('./components/CarManager').then(module => ({ default: module.CarManager })));
const FinanceManager = lazy(() => import('./components/FinanceManager').then(module => ({ default: module.FinanceManager })));
const GoalTracker = lazy(() => import('./components/GoalTracker').then(module => ({ default: module.GoalTracker })));
const AIAssistant = lazy(() => import('./components/AIAssistant').then(module => ({ default: module.AIAssistant })));
const SystemSettings = lazy(() => import('./components/SystemSettings').then(module => ({ default: module.SystemSettings })));

const App: React.FC = () => {
  const [currentApp, setCurrentApp] = useState<AppId>(AppId.HOME);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Clock tick
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

  const getAppComponent = (id: AppId) => {
    switch (id) {
      case AppId.HOME: return <DashboardHome onChangeApp={setCurrentApp} />;
      case AppId.CAR: return <CarManager />;
      case AppId.FINANCE: return <FinanceManager />;
      case AppId.GOALS: return <GoalTracker />;
      case AppId.AI_ASSISTANT: return <AIAssistant />;
      case AppId.SETTINGS: return <SystemSettings />;
      default: return <div className="p-10 text-center">준비 중입니다.</div>;
    }
  };

  const activeAppDef = APPS.find(a => a.id === currentApp);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 font-sans flex flex-col md:flex-row overflow-hidden selection:bg-indigo-50 selection:text-white">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-gray-200 dark:border-slate-800 p-4 flex justify-between items-center z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-800 dark:text-white">LifeOS</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 active:bg-gray-100 rounded-lg">
           <Menu className="w-6 h-6 text-slate-700 dark:text-white" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 md:p-8 flex items-center justify-between">
             <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <LayoutDashboard className="text-white w-5 h-5" />
                </div>
                <div>
                   <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Life Manager</h1>
                   <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Personal OS v1.0</p>
                </div>
             </div>
             <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500">
               <X className="w-6 h-6" />
             </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
            <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-2">Main Menu</p>
            {APPS.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  setCurrentApp(app.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group relative
                  ${currentApp === app.id 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                {currentApp === app.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full"></div>
                )}
                <app.icon className={`w-5 h-5 ${currentApp === app.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                <span className={`text-[15px] ${currentApp === app.id ? 'font-bold' : 'font-medium'}`}>{app.name}</span>
                {currentApp === app.id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer / User Profile */}
          <div className="p-4 border-t border-gray-100 dark:border-slate-900">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm ring-2 ring-white dark:ring-slate-900 shadow-sm">
                ME
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">내 프로필</p>
                <p className="text-xs text-gray-500 truncate">관리자 설정</p>
              </div>
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gray-50/50 dark:bg-slate-900">
        {/* Top Header */}
        <header className="hidden md:flex h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-8 items-center justify-between z-10 sticky top-0">
           <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{activeAppDef?.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 hidden lg:block">{activeAppDef?.description}</p>
           </div>
           
           <div className="flex items-center gap-6">
              {/* Search Bar Placeholder */}
              <div className="relative hidden lg:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="기능 검색..." 
                   className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-900 rounded-full text-sm border-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
                 />
              </div>

              <div className="text-right hidden xl:block">
                 <p className="text-sm font-bold text-gray-800 dark:text-white">{formatTime(currentTime)}</p>
                 <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(currentTime)}</p>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-slate-800 hidden xl:block"></div>
              <button className="relative p-2.5 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700 text-gray-500 hover:text-indigo-600 dark:text-gray-400 transition-all">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
              </button>
           </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
           <div className="max-w-6xl mx-auto pb-10">
              <Suspense 
                fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-2">
                       <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                       <p className="text-sm text-gray-500">로딩 중...</p>
                    </div>
                  </div>
                }
              >
                {currentApp && getAppComponent(currentApp)}
              </Suspense>
           </div>
        </div>
      </main>
    </div>
  );
};

// Dashboard Home Component (Summary View)
const DashboardHome: React.FC<{ onChangeApp: (id: AppId) => void }> = ({ onChangeApp }) => {
  // Safe icon retrieval
  const FinanceIcon = APPS.find(app => app.id === AppId.FINANCE)?.icon || LayoutDashboard;
  const CarIcon = APPS.find(app => app.id === AppId.CAR)?.icon || LayoutDashboard;
  const GoalIcon = APPS.find(app => app.id === AppId.GOALS)?.icon || LayoutDashboard;
  const AiIcon = APPS.find(app => app.id === AppId.AI_ASSISTANT)?.icon || LayoutDashboard;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Welcome Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-10 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
         <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">안녕하세요, 관리자님! 👋</h1>
            <p className="text-indigo-100 max-w-xl text-lg leading-relaxed opacity-90">
              오늘도 목표를 향해 나아가고 계시네요.<br className="hidden md:block"/>
              현재 <span className="font-bold text-white underline decoration-white/30 decoration-2 underline-offset-4">차량 정비 1건</span>이 주의 단계입니다.
            </p>
         </div>
         {/* Abstract Background Shapes */}
         <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
         <div className="absolute -right-20 -bottom-32 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
         <div className="absolute right-20 -top-20 w-60 h-60 bg-purple-500/30 rounded-full blur-3xl"></div>
      </div>

      {/* 2. Main Widgets Grid (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Car Status Widget */}
         <div 
           onClick={() => onChangeApp(AppId.CAR)}
           className="cursor-pointer bg-white dark:bg-slate-800 p-7 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 dark:border-slate-700 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
         >
            <div className="flex justify-between items-start mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                 <CarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-bold bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span> 1건 주의
              </span>
            </div>
            <h3 className="font-bold text-gray-600 dark:text-gray-300 text-sm">차량 상태</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2 tracking-tight">85 <span className="text-lg text-gray-400 font-sans">점</span></p>
            <p className="text-xs text-gray-400 mt-2">다음 정비: 엔진 오일</p>
         </div>

         {/* Finance Widget */}
         <div 
           onClick={() => onChangeApp(AppId.FINANCE)}
           className="cursor-pointer bg-white dark:bg-slate-800 p-7 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 dark:border-slate-700 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
         >
            <div className="flex justify-between items-start mb-6">
              <div className="bg-green-100 dark:bg-green-900/30 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                 <FinanceIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-bold bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> +4.2%
              </span>
            </div>
            <h3 className="font-bold text-gray-600 dark:text-gray-300 text-sm">총 자산</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2 font-mono tracking-tight">$45,230</p>
            <p className="text-xs text-gray-400 mt-2">전월 대비 $1,820 증가</p>
         </div>

         {/* Goals Widget */}
         <div 
           onClick={() => onChangeApp(AppId.GOALS)}
           className="cursor-pointer bg-white dark:bg-slate-800 p-7 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 dark:border-slate-700 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
         >
            <div className="flex justify-between items-start mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                 <GoalIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h3 className="font-bold text-gray-600 dark:text-gray-300 text-sm">올해 목표</h3>
            <div className="mt-4 w-full bg-gray-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
               <div className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full" style={{ width: '45%' }}></div>
            </div>
            <p className="text-xs font-bold text-gray-400 mt-3 text-right">45% 진행중 (3/4 완료)</p>
         </div>
      </div>

      {/* 3. Recent Activity & AI Help */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
             <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" /> 최근 알림
             </h3>
             <div className="space-y-4">
                {[
                  { title: '엔진 오일 교체 시기가 도래했습니다.', time: '2시간 전', type: 'car', icon: CarIcon, color: 'text-blue-500 bg-blue-50' },
                  { title: '애플(AAPL) 주가가 2% 상승했습니다.', time: '5시간 전', type: 'stock', icon: FinanceIcon, color: 'text-green-500 bg-green-50' },
                ].map((notif, i) => (
                   <div key={i} className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors group cursor-default">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.color} dark:bg-slate-700`}>
                         <notif.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                         <p className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 transition-colors">{notif.title}</p>
                         <p className="text-xs text-gray-400 mt-1 font-medium">{notif.time}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-900/30 flex flex-col justify-center items-center text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl"></div>
             
             <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200/50 dark:shadow-none relative z-10">
                <AiIcon className="w-10 h-10 text-purple-600" />
             </div>
             <h3 className="font-bold text-xl dark:text-white mb-2 relative z-10">무엇이든 물어보세요</h3>
             <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-xs relative z-10">
               "이번 달 차량 유지비가 얼마나 들었어?"<br/>
               AI 비서가 내역을 분석해드립니다.
             </p>
             <button 
               onClick={() => onChangeApp(AppId.AI_ASSISTANT)}
               className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-50 text-white px-6 py-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-900/20 relative z-10"
             >
               AI 비서와 대화하기
             </button>
          </div>
      </div>
    </div>
  );
};

export default App;