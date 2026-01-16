
import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../db';
import { 
  Wrench, AlertTriangle, Gauge, History, PlusCircle, 
  Calendar, DollarSign, MapPin, ChevronRight, CheckCircle2,
  Droplets, Wind, Disc, Search, Settings, Filter,
  Edit2, Save, X, Trash2, RefreshCcw, Car as CarIcon,
  AlertCircle, ShieldCheck, Clock, Activity, Zap,
  Plus, CalendarDays, Loader2, Sliders
} from 'lucide-react';
import { MaintenanceItem, MaintenanceRecord } from '../types';

const getIconForItem = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('오일')) return Droplets;
  if (lower.includes('필터') || lower.includes('와이퍼')) return Wind;
  if (lower.includes('브레이크') || lower.includes('타이어')) return Disc;
  return Settings; 
};

export const CarManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'status' | 'log' | 'add' | 'manage'>('status');
  const [loading, setLoading] = useState(true);
  
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [currentMileage, setCurrentMileage] = useState(0);
  const [carModel, setCarModel] = useState('My Car');
  const [carNumber, setCarNumber] = useState('00가 0000');

  // Interval Editing State
  const [editingIntervalItem, setEditingIntervalItem] = useState<MaintenanceItem | null>(null);
  const [editKm, setEditKm] = useState('');
  const [editMonths, setEditMonths] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        await db.init();
        const [loadedItems, loadedRecords, loadedMileage, loadedModel, loadedPlate] = await Promise.all([
          db.getAll<MaintenanceItem>('maintenance_items'),
          db.getAll<MaintenanceRecord>('maintenance_records'),
          db.getSetting('car_mileage'),
          db.getSetting('car_model'),
          db.getSetting('car_plate')
        ]);

        setItems(loadedItems);
        setRecords(loadedRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setCurrentMileage(Number(loadedMileage) || 49500);
        setCarModel(loadedModel || '제네시스 GV70');
        setCarNumber(loadedPlate || '123가 4567');
      } catch (error) {
        console.error("Failed to load car data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const updateMileage = async (newMileage: number) => {
      setCurrentMileage(newMileage);
      await db.setSetting('car_mileage', newMileage);
  };

  const handleUpdateInterval = async () => {
    if (!editingIntervalItem || !editKm || !editMonths) return;
    
    const updatedItem: MaintenanceItem = {
      ...editingIntervalItem,
      intervalKm: Number(editKm),
      intervalMonths: Number(editMonths)
    };

    const newItems = items.map(item => item.id === updatedItem.id ? updatedItem : item);
    setItems(newItems);
    await db.save('maintenance_items', updatedItem);
    setEditingIntervalItem(null);
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

  const handleSaveRecord = async () => {
    if (!serviceDate || !serviceMileage) return;
    if (serviceMileage > currentMileage) await updateMileage(serviceMileage);

    const costNum = Number(serviceCost.replace(/,/g, ''));
    const newRecord: MaintenanceRecord = {
      id: Date.now().toString(),
      itemName: selectedItemName,
      date: serviceDate,
      mileage: serviceMileage,
      cost: costNum,
      shopName
    };

    const newRecords = [newRecord, ...records];
    setRecords(newRecords);
    await db.save('maintenance_records', newRecord);

    const updatedItems = items.map(item => {
      if (item.name === selectedItemName) {
        return { ...item, lastServiceDate: serviceDate, lastServiceMileage: serviceMileage, status: '양호' as const };
      }
      return item;
    });
    setItems(updatedItems);
    await db.saveAll('maintenance_items', updatedItems);
    setActiveTab('status');
  };

  const [selectedItemName, setSelectedItemName] = useState('');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceMileage, setServiceMileage] = useState(0);
  const [serviceCost, setServiceCost] = useState('');
  const [shopName, setShopName] = useState('');

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      {/* Header Info Card */}
      <div className="bg-black/40 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-500/20 rounded-3xl border border-blue-500/30 shadow-inner">
              <CarIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{carModel}</h2>
              <p className="text-2xl font-mono text-white/40 tracking-tighter">{carNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Distance</p>
            <div className="flex items-baseline gap-2 justify-end">
              <span className="text-5xl font-mono font-bold text-white">{currentMileage.toLocaleString()}</span>
              <span className="text-xs font-bold text-white/30">KM</span>
            </div>
          </div>
        </div>
        <div className="mt-8">
           <div className="flex items-center bg-white/5 rounded-3xl p-1 border border-white/5">
             <div className="p-3"><Gauge className="text-white/30 w-5 h-5" /></div>
             <input 
               type="number" 
               value={currentMileage} 
               onChange={(e) => updateMileage(Number(e.target.value))}
               className="bg-transparent border-none outline-none flex-1 py-3 text-lg font-mono font-bold text-white"
               placeholder="Update current mileage..."
             />
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-black/40 backdrop-blur-md p-1.5 rounded-3xl border border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: 'status', label: '차량 상태', icon: ShieldCheck },
          { id: 'log', label: '정비 히스토리', icon: History },
          { id: 'add', label: '기록 등록', icon: PlusCircle },
          { id: 'manage', label: '교체 주기 설정', icon: Settings }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'status' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map(item => {
              const { healthPercent, remaining, statusLabel, statusColor, severity } = getItemHealth(item);
              const Icon = getIconForItem(item.name);
              return (
                <div key={item.id} className="bg-black/40 backdrop-blur-md rounded-[2.5rem] p-7 border border-white/10 hover:border-blue-500/30 transition-all relative group">
                  <button 
                    onClick={() => {
                      setEditingIntervalItem(item);
                      setEditKm(item.intervalKm.toString());
                      setEditMonths(item.intervalMonths.toString());
                    }}
                    className="absolute top-6 right-6 p-2 text-white/20 hover:text-white hover:bg-white/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="주기 수정"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-4 rounded-2xl bg-${statusColor}-500/10 border border-${statusColor}-500/20`}>
                      <Icon className={`w-7 h-7 text-${statusColor}-400`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{item.name}</h3>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">교체 주기: {item.intervalKm.toLocaleString()} KM</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end text-xs font-bold text-white">
                       <span className="text-white/40 uppercase">잔여 거리</span>
                       <span className={severity === 'high' ? 'text-rose-500' : ''}>{remaining.toLocaleString()} KM</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className={`h-full bg-${statusColor}-500 transition-all duration-700`} style={{ width: `${healthPercent}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-white/30">
                       <span className="uppercase">{statusLabel}</span>
                       <span>{healthPercent}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Manage Tab Improvements */}
        {activeTab === 'manage' && (
           <div className="bg-black/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/10 space-y-8">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white"><Sliders className="text-blue-500"/> 소모품 교체 주기 관리</h3>
              <p className="text-xs text-white/40">운전 습관에 맞춰 권장 교체 주기를 직접 수정할 수 있습니다.</p>
              <div className="space-y-4">
                 {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-blue-500/30 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/5 rounded-xl"><Wrench className="w-5 h-5 text-white/40" /></div>
                          <div>
                             <p className="font-bold text-white">{item.name}</p>
                             <p className="text-xs text-white/40 font-mono">현재 설정: {item.intervalKm.toLocaleString()} KM / {item.intervalMonths}개월</p>
                          </div>
                       </div>
                       <button 
                          onClick={() => {
                            setEditingIntervalItem(item);
                            setEditKm(item.intervalKm.toString());
                            setEditMonths(item.intervalMonths.toString());
                          }}
                          className="px-6 py-3 bg-white/10 hover:bg-white text-white hover:text-black font-black text-[10px] uppercase rounded-2xl transition-all"
                       >
                          Edit Interval
                       </button>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* Add Record Tab */}
        {activeTab === 'add' && (
           <div className="bg-black/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/10 max-w-2xl mx-auto space-y-8">
              <div className="text-center">
                 <h3 className="text-2xl font-bold text-white uppercase tracking-tighter italic">Register Maintenance</h3>
                 <p className="text-xs text-white/30 mt-1 uppercase tracking-widest">새로운 정비 내역을 아카이브하세요.</p>
              </div>
              <div className="space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">정비 항목</label>
                      <select 
                        value={selectedItemName} 
                        onChange={(e) => setSelectedItemName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none appearance-none"
                      >
                         <option value="" disabled className="bg-slate-900">항목을 선택하세요</option>
                         {items.map(i => <option key={i.id} value={i.name} className="bg-slate-900">{i.name}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">날짜</label>
                      <input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">주행거리 (KM)</label>
                      <input type="number" value={serviceMileage} onChange={(e) => setServiceMileage(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none" />
                   </div>
                 </div>
                 <button onClick={handleSaveRecord} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-3xl shadow-2xl transition-all active:scale-95 uppercase tracking-widest">Save Record</button>
              </div>
           </div>
        )}
      </div>

      {/* Interval Edit Modal */}
      {editingIntervalItem && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <div className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] max-w-sm w-full shadow-3xl animate-in zoom-in-95">
               <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20"><Sliders className="text-blue-400 w-6 h-6"/></div>
                  <div>
                     <h4 className="font-black text-white text-xl uppercase tracking-tighter italic">{editingIntervalItem.name}</h4>
                     <p className="text-[10px] text-white/40 uppercase tracking-widest">Custom Interval Setup</p>
                  </div>
               </div>
               <div className="space-y-6 mb-10">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">교체 거리 (KM)</label>
                     <input 
                        type="number" 
                        value={editKm} 
                        onChange={(e) => setEditKm(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-mono font-black outline-none focus:border-blue-500" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">교체 기간 (월)</label>
                     <input 
                        type="number" 
                        value={editMonths} 
                        onChange={(e) => setEditMonths(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-mono font-black outline-none focus:border-blue-500" 
                     />
                  </div>
               </div>
               <div className="flex gap-4">
                  <button onClick={handleUpdateInterval} className="flex-1 bg-white text-black font-black py-5 rounded-2xl hover:bg-blue-100 transition-all active:scale-95 uppercase text-xs">Update</button>
                  <button onClick={() => setEditingIntervalItem(null)} className="flex-1 bg-white/5 text-white/40 font-black py-5 rounded-2xl hover:text-white transition-all uppercase text-xs">Cancel</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
