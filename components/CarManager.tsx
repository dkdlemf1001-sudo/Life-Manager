import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_MAINTENANCE } from '../constants';
import { 
  Wrench, AlertTriangle, Gauge, History, PlusCircle, 
  Calendar, DollarSign, MapPin, ChevronRight, CheckCircle2,
  Droplets, Wind, Disc, Search, Settings, Filter,
  Edit2, Save, X, Trash2, RefreshCcw, Car as CarIcon,
  AlertCircle, ShieldCheck, Clock, Activity, Zap,
  Tool
} from 'lucide-react';
import { MaintenanceItem, MaintenanceRecord } from '../types';

// Helper to get specific icon for maintenance item
const getIconForItem = (name: string) => {
  if (name.includes('오일')) return Droplets;
  if (name.includes('필터') || name.includes('와이퍼')) return Wind;
  if (name.includes('브레이크') || name.includes('타이어')) return Disc;
  return Settings; 
};

export const CarManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'status' | 'log' | 'add'>('status');
  
  // Persistence Initialization
  const [items, setItems] = useState<MaintenanceItem[]>(() => {
    const saved = localStorage.getItem('LIFEOS_CAR_ITEMS');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
  });
  
  const [records, setRecords] = useState<MaintenanceRecord[]>(() => {
    const saved = localStorage.getItem('LIFEOS_CAR_RECORDS');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentMileage, setCurrentMileage] = useState(() => {
    const saved = localStorage.getItem('LIFEOS_CAR_MILEAGE');
    return saved ? Number(saved) : 49500;
  });

  const [carModel, setCarModel] = useState(() => localStorage.getItem('LIFEOS_CAR_MODEL') || '제네시스 GV70');
  const [carNumber, setCarNumber] = useState(() => localStorage.getItem('LIFEOS_CAR_NUMBER') || '123가 4567');

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('LIFEOS_CAR_ITEMS', JSON.stringify(items));
    localStorage.setItem('LIFEOS_CAR_RECORDS', JSON.stringify(records));
    localStorage.setItem('LIFEOS_CAR_MILEAGE', currentMileage.toString());
    localStorage.setItem('LIFEOS_CAR_MODEL', carModel);
    localStorage.setItem('LIFEOS_CAR_NUMBER', carNumber);
  }, [items, records, currentMileage, carModel, carNumber]);

  const [isEditingCarInfo, setIsEditingCarInfo] = useState(false);
  const [tempModel, setTempModel] = useState('');
  const [tempNumber, setTempNumber] = useState('');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Derived State: Health Score
  const healthScore = useMemo(() => {
    let score = 100;
    items.forEach(item => {
      const distanceDriven = Math.max(0, currentMileage - item.lastServiceMileage);
      const usageRatio = distanceDriven / item.intervalKm;
      if (usageRatio > 1.0) score -= 15; 
      else if (usageRatio > 0.8) score -= 5;
    });
    return Math.max(0, score);
  }, [items, currentMileage]);

  // Form State
  const [selectedItemName, setSelectedItemName] = useState(items[0].name);
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceMileage, setServiceMileage] = useState(currentMileage);
  const [serviceCost, setServiceCost] = useState('');
  const [shopName, setShopName] = useState('');

  useEffect(() => {
    if (activeTab === 'add' && !editingRecordId) {
      setServiceMileage(currentMileage);
    }
  }, [activeTab, currentMileage, editingRecordId]);

  const syncItemStatusWithRecords = (itemName: string, currentRecords: MaintenanceRecord[]) => {
    const itemRecords = currentRecords.filter(r => r.itemName === itemName);
    if (itemRecords.length > 0) {
      itemRecords.sort((a, b) => b.mileage - a.mileage);
      const latest = itemRecords[0];
      setItems(prev => prev.map(item => {
        if (item.name === itemName) {
          return {
            ...item,
            lastServiceDate: latest.date,
            lastServiceMileage: latest.mileage,
            status: '양호'
          };
        }
        return item;
      }));
    } else {
        const originalItem = INITIAL_MAINTENANCE.find(i => i.name === itemName);
        if (originalItem) {
            setItems(prev => prev.map(item => item.name === itemName ? originalItem : item));
        }
    }
  };

  const handleSaveRecord = () => {
    if (!serviceDate || !serviceMileage) return;

    if (serviceMileage > currentMileage) {
      setCurrentMileage(serviceMileage);
    }

    let newRecords = [...records];
    const costNum = Number(serviceCost.replace(/,/g, ''));

    if (editingRecordId) {
      newRecords = newRecords.map(r => r.id === editingRecordId ? {
        ...r,
        itemName: selectedItemName,
        date: serviceDate,
        mileage: serviceMileage,
        cost: costNum,
        shopName
      } : r);
    } else {
      const newRecord: MaintenanceRecord = {
        id: Date.now().toString(),
        itemName: selectedItemName,
        date: serviceDate,
        mileage: serviceMileage,
        cost: costNum,
        shopName
      };
      newRecords = [newRecord, ...newRecords];
    }

    newRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecords(newRecords);
    syncItemStatusWithRecords(selectedItemName, newRecords);
    resetForm();
    setActiveTab('log');
  };

  const handleEditRecord = (record: MaintenanceRecord) => {
    setEditingRecordId(record.id);
    setSelectedItemName(record.itemName);
    setServiceDate(record.date);
    setServiceMileage(record.mileage);
    setServiceCost(record.cost.toLocaleString());
    setShopName(record.shopName || '');
    setActiveTab('add');
  };

  const handleDeleteRecord = (id: string, itemName: string) => {
    if (window.confirm('정말로 이 정비 기록을 삭제하시겠습니까?')) {
      const newRecords = records.filter(r => r.id !== id);
      setRecords(newRecords);
      syncItemStatusWithRecords(itemName, newRecords);
    }
  };

  const resetForm = () => {
    setEditingRecordId(null);
    setServiceCost('');
    setShopName('');
    setServiceDate(new Date().toISOString().split('T')[0]);
    setServiceMileage(currentMileage);
  };

  const saveCarInfo = () => {
    if (tempModel) setCarModel(tempModel);
    if (tempNumber) setCarNumber(tempNumber);
    setIsEditingCarInfo(false);
  };

  const getItemHealth = (item: MaintenanceItem) => {
    const driven = Math.max(0, currentMileage - item.lastServiceMileage);
    const ratio = driven / item.intervalKm;
    const healthPercent = Math.max(0, Math.min(100, Math.floor((1 - ratio) * 100)));
    const remaining = Math.max(0, item.intervalKm - driven);
    
    let statusLabel = '양호';
    let statusColor = 'emerald';
    let severity = 'low';

    if (ratio >= 1.0) {
      statusLabel = '긴급 교체';
      statusColor = 'rose';
      severity = 'high';
    } else if (ratio >= 0.8) {
      statusLabel = '점검 필요';
      statusColor = 'amber';
      severity = 'medium';
    }

    return { driven, healthPercent, remaining, statusLabel, statusColor, severity, ratio };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      {/* 1. Header Card - Glassmorphic Dashboard */}
      <div className="relative overflow-hidden bg-slate-900 dark:bg-black rounded-[3rem] p-8 md:p-12 text-white shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            {isEditingCarInfo ? (
               <div className="space-y-4 animate-in zoom-in-95 duration-200 w-full max-w-sm bg-slate-800/40 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">차량 모델</label>
                    <input 
                      type="text" 
                      value={tempModel}
                      onChange={(e) => setTempModel(e.target.value)}
                      className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">차량 번호</label>
                    <input 
                      type="text" 
                      value={tempNumber}
                      onChange={(e) => setTempNumber(e.target.value)}
                      className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={saveCarInfo} className="flex-1 bg-white text-black text-xs py-3 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95">저장</button>
                    <button onClick={() => setIsEditingCarInfo(false)} className="flex-1 bg-slate-800 text-white text-xs py-3 rounded-xl font-bold hover:bg-slate-700 transition-all active:scale-95">취소</button>
                  </div>
               </div>
            ) : (
              <div onClick={() => { setTempModel(carModel); setTempNumber(carNumber); setIsEditingCarInfo(true); }} className="cursor-pointer group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-600/20 p-2.5 rounded-2xl border border-blue-500/30 shadow-inner">
                    <CarIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-3xl font-bold tracking-tight group-hover:text-blue-400 transition-colors">{carModel}</h2>
                      <Edit2 className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0" />
                    </div>
                    <p className="text-4xl font-mono font-bold text-slate-500 tracking-tighter mt-1">{carNumber}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-12 pt-8 md:pt-0 border-t border-white/5 md:border-none w-full md:w-auto">
             <div className="flex-1 md:flex-none">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">통합 차량 컨디션</p>
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
                        strokeDasharray={175.92} strokeDashoffset={175.92 - (175.92 * healthScore) / 100}
                        className={`${healthScore > 85 ? 'text-emerald-500' : healthScore > 60 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`} />
                    </svg>
                    <span className="absolute text-lg font-mono font-bold">{healthScore}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-tight">Status</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${healthScore > 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {healthScore > 85 ? '양호' : '주의 요망'}
                    </p>
                  </div>
                </div>
             </div>
             <div className="w-px h-16 bg-white/10 hidden md:block"></div>
             <div className="flex-1 md:flex-none text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">누적 주행거리</p>
                <div className="flex items-baseline justify-end gap-1.5">
                   <span className="text-5xl font-mono font-bold tracking-tighter tabular-nums">{currentMileage.toLocaleString()}</span>
                   <span className="text-xs font-bold text-slate-500 uppercase">KM</span>
                </div>
             </div>
          </div>
        </div>

        {/* Dynamic Mileage Input Area */}
        <div className="mt-12 group">
          <div className="relative flex items-center bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/5 hover:border-blue-500/30 p-2 pl-6 transition-all duration-300">
             <Gauge className="w-6 h-6 text-slate-500 group-hover:text-blue-400 transition-colors" />
             <input 
                type="number"
                inputMode="numeric"
                value={currentMileage}
                onChange={(e) => setCurrentMileage(Number(e.target.value))}
                className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-xl font-mono font-bold text-white placeholder:text-slate-700"
                placeholder="현재 주행거리를 입력하세요..."
             />
             <div className="hidden sm:flex items-center gap-2 pr-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <Activity className="w-4 h-4 text-blue-500" /> 실시간 동기화 중
             </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="sticky top-20 z-40 flex p-1.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-slate-700/50 shadow-xl shadow-black/5">
        {[
          { id: 'status', label: '상태 대시보드', icon: ShieldCheck },
          { id: 'log', label: '정비 히스토리', icon: History },
          { id: 'add', label: '새 기록 등록', icon: PlusCircle }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`
              flex-1 flex items-center justify-center gap-3 py-4 text-xs font-bold rounded-2xl transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-lg shadow-black/10 scale-100' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 scale-95 opacity-70'
              }
            `}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'status' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {items.map(item => {
               const { healthPercent, remaining, statusLabel, statusColor, severity } = getItemHealth(item);
               const Icon = getIconForItem(item.name);
               
               return (
                 <div key={item.id} className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] p-7 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/5 transition-all overflow-hidden">
                   {/* Left Highlight */}
                   <div className={`absolute top-0 left-0 w-2 h-full bg-${statusColor}-500/20 group-hover:bg-${statusColor}-500/50 transition-all`}></div>
                   
                   <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-5">
                         <div className={`p-4 rounded-3xl bg-${statusColor}-50 dark:bg-${statusColor}-500/10 border border-${statusColor}-100 dark:border-${statusColor}-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                            <Icon className={`w-8 h-8 text-${statusColor}-600 dark:text-${statusColor}-400`} />
                         </div>
                         <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-xl tracking-tight">{item.name}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">교체 주기: {item.intervalKm.toLocaleString()} KM</p>
                         </div>
                      </div>
                      <div className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] shadow-sm border
                        ${severity === 'high' ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' 
                        : severity === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'}`}>
                         {statusLabel}
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex justify-between items-end">
                         <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">잔여 수명</p>
                           <p className={`text-2xl font-mono font-bold tracking-tighter ${severity === 'high' ? 'text-rose-500 animate-pulse' : 'text-slate-800 dark:text-white'}`}>
                             {remaining > 0 ? `${remaining.toLocaleString()} KM` : `즉시 교체 필요`}
                           </p>
                         </div>
                         <div className="text-right">
                           <span className={`text-sm font-mono font-bold ${severity === 'high' ? 'text-rose-500' : 'text-slate-500'}`}>{healthPercent}%</span>
                         </div>
                      </div>
                      
                      <div className="relative h-3 w-full bg-slate-100 dark:bg-slate-900/50 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                         <div 
                           className={`h-full rounded-full transition-all duration-1000 ease-out bg-${statusColor}-500 shadow-[0_0_15px_rgba(var(--tw-color-${statusColor}-500),0.3)]`}
                           style={{ width: `${healthPercent}%` }}
                         ></div>
                      </div>
                   </div>
                   
                   <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-700/50 flex justify-between items-center">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">최근 점검</span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.lastServiceDate}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">점검 거리</span>
                          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">{item.lastServiceMileage.toLocaleString()} KM</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
                   </div>
                 </div>
               );
            })}
          </div>
        )}

        {activeTab === 'log' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center px-4">
                <h3 className="font-bold text-2xl dark:text-white tracking-tight">정비 로그 기록</h3>
                <div className="bg-blue-500/10 text-blue-500 px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
                  총 {records.length}건의 기록
                </div>
             </div>
             
             {records.length === 0 ? (
               <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-24 text-center border border-dashed border-slate-200 dark:border-slate-700">
                  <History className="w-16 h-16 mx-auto mb-6 text-slate-200 dark:text-slate-700" />
                  <p className="text-lg font-bold text-slate-400">아직 정비 기록이 없습니다. 첫 기록을 등록해보세요!</p>
               </div>
             ) : (
               <div className="space-y-4">
                  {records.map((record) => (
                    <div key={record.id} className="group relative bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner group-hover:scale-105 transition-all">
                                {React.createElement(getIconForItem(record.itemName), { className: 'w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors' })}
                             </div>
                             <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-[10px] font-black text-white bg-indigo-600 px-2.5 py-1 rounded-lg uppercase tracking-widest">{record.date}</span>
                                  {record.shopName && <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg"><MapPin className="w-3 h-3" /> {record.shopName}</span>}
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{record.itemName}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">ODO: {record.mileage.toLocaleString()} KM</span>
                                  {record.note && <span className="text-[10px] font-bold text-indigo-500 italic">"{record.note}"</span>}
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex items-center justify-between lg:justify-end gap-12 border-t lg:border-none border-slate-100 dark:border-slate-700/50 pt-6 lg:pt-0">
                             <div className="text-left lg:text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">정비 비용</p>
                                <p className="font-mono font-bold text-2xl text-slate-800 dark:text-slate-100">₩{record.cost.toLocaleString()}</p>
                             </div>
                             
                             <div className="flex gap-2">
                                <button onClick={() => handleEditRecord(record)} className="p-3.5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-2xl transition-all active:scale-90"><Edit2 className="w-5 h-5" /></button>
                                <button onClick={() => handleDeleteRecord(record.id, record.itemName)} className="p-3.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-90"><Trash2 className="w-5 h-5" /></button>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 md:p-16 shadow-sm border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="max-w-2xl mx-auto space-y-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-500">
                    <Zap className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold dark:text-white tracking-tight">{editingRecordId ? '기록 수정하기' : '신규 정비 기록 등록'}</h3>
                  <p className="text-sm text-slate-400 mt-2 font-medium tracking-wide">정확한 차량 관리를 위해 정비 상세 내역을 입력해주세요</p>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] ml-2 block">정비 항목 선택</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {items.map(item => (
                      <button 
                        key={item.id} 
                        onClick={() => setSelectedItemName(item.name)} 
                        className={`
                          group relative flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all duration-300
                          ${selectedItemName === item.name 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-600/30 scale-105' 
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-blue-500/30'
                          }
                        `}
                      >
                        {React.createElement(getIconForItem(item.name), { className: `w-7 h-7 mb-4 transition-colors ${selectedItemName === item.name ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}` })}
                        <span className="text-[11px] font-bold text-center leading-tight tracking-tight uppercase">{item.name}</span>
                        {selectedItemName === item.name && (
                           <div className="absolute -top-1.5 -right-1.5 bg-white text-blue-600 p-1 rounded-full shadow-lg">
                              <CheckCircle2 className="w-4 h-4" />
                           </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] ml-2 flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> 정비 날짜</label>
                      <input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-base dark:text-white transition-all" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] ml-2 flex items-center gap-2"><Gauge className="w-3.5 h-3.5" /> 정비 시 주행거리 (KM)</label>
                      <input type="number" inputMode="numeric" value={serviceMileage} onChange={(e) => setServiceMileage(Number(e.target.value))} className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-base dark:text-white transition-all" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] ml-2 flex items-center gap-2"><DollarSign className="w-3.5 h-3.5" /> 소요 비용 (KRW)</label>
                      <input type="text" inputMode="numeric" value={serviceCost} onChange={(e) => setServiceCost(e.target.value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ","))} placeholder="0" className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-base dark:text-white transition-all" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] ml-2 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> 정비소 위치</label>
                      <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="예: 제네시스 강남 서비스센터" className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-base dark:text-white transition-all" />
                   </div>
                </div>

                <button 
                  onClick={handleSaveRecord} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-6 rounded-[2rem] shadow-[0_20px_40px_rgba(37,99,235,0.25)] transition-all active:scale-95 flex items-center justify-center gap-4 group"
                >
                  <Save className="w-6 h-6 group-hover:rotate-12 transition-transform" /> 
                  {editingRecordId ? '정비 기록 수정 완료' : '정비 기록 저장하기'}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
