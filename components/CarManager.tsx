import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_MAINTENANCE } from '../constants';
import { 
  Wrench, AlertTriangle, Gauge, History, PlusCircle, 
  Calendar, DollarSign, MapPin, ChevronRight, CheckCircle2,
  Droplets, Wind, Disc, Search, Settings, Filter,
  Edit2, Save, X, Trash2, RefreshCcw
} from 'lucide-react';
import { MaintenanceItem, MaintenanceRecord } from '../types';

// Helper to get specific icon for maintenance item
const getIconForItem = (name: string) => {
  if (name.includes('오일')) return Droplets;
  if (name.includes('필터') || name.includes('와이퍼')) return Wind;
  if (name.includes('브레이크') || name.includes('타이어')) return Disc;
  return Settings; // default
};

export const CarManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'status' | 'log' | 'add'>('status');
  const [items, setItems] = useState<MaintenanceItem[]>(INITIAL_MAINTENANCE);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [currentMileage, setCurrentMileage] = useState(49500);

  // Car Info State
  const [carModel, setCarModel] = useState('제네시스 GV70');
  const [carNumber, setCarNumber] = useState('123가 4567');
  const [isEditingCarInfo, setIsEditingCarInfo] = useState(false);
  const [tempModel, setTempModel] = useState('');
  const [tempNumber, setTempNumber] = useState('');

  // Editing Record State
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Derived State: Health Score
  const healthScore = useMemo(() => {
    let score = 100;
    items.forEach(item => {
      const distanceDriven = Math.max(0, currentMileage - item.lastServiceMileage);
      const usageRatio = distanceDriven / item.intervalKm;
      if (usageRatio > 1.0) score -= 15; // Overdue
      else if (usageRatio > 0.8) score -= 5; // Warning
    });
    return Math.max(0, score);
  }, [items, currentMileage]);

  // Form State
  const [selectedItemName, setSelectedItemName] = useState(items[0].name);
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceMileage, setServiceMileage] = useState(currentMileage);
  const [serviceCost, setServiceCost] = useState('');
  const [shopName, setShopName] = useState('');

  // Sync service mileage input when adding new record (only if not editing)
  useEffect(() => {
    if (activeTab === 'add' && !editingRecordId) {
      setServiceMileage(currentMileage);
    }
  }, [activeTab, currentMileage, editingRecordId]);

  // Helper: Update item status based on the latest record in the list
  const syncItemStatusWithRecords = (itemName: string, currentRecords: MaintenanceRecord[]) => {
    const itemRecords = currentRecords.filter(r => r.itemName === itemName);
    
    if (itemRecords.length > 0) {
      // Sort by mileage descending to find the latest service
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
    }
    // Note: If no records exist, we keep the current item state (likely initial state)
  };

  const handleSaveRecord = () => {
    if (!serviceDate || !serviceMileage) return;

    // Auto-update current mileage if service mileage is greater
    if (serviceMileage > currentMileage) {
      setCurrentMileage(serviceMileage);
    }

    let newRecords = [...records];

    if (editingRecordId) {
      // Edit existing record
      newRecords = newRecords.map(r => r.id === editingRecordId ? {
        ...r,
        itemName: selectedItemName,
        date: serviceDate,
        mileage: serviceMileage,
        cost: Number(serviceCost.replace(/,/g, '')),
        shopName
      } : r);
    } else {
      // Add new record
      const newRecord: MaintenanceRecord = {
        id: Date.now().toString(),
        itemName: selectedItemName,
        date: serviceDate,
        mileage: serviceMileage,
        cost: Number(serviceCost.replace(/,/g, '')),
        shopName
      };
      newRecords = [newRecord, ...newRecords];
    }

    // Sort records by date descending for display
    newRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setRecords(newRecords);
    syncItemStatusWithRecords(selectedItemName, newRecords);

    // Reset Form
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

  const startEditingCarInfo = () => {
    setTempModel(carModel);
    setTempNumber(carNumber);
    setIsEditingCarInfo(true);
  };

  const cancelEditingCarInfo = () => {
    setIsEditingCarInfo(false);
  };

  const saveCarInfo = () => {
    if (tempModel) setCarModel(tempModel);
    if (tempNumber) setCarNumber(tempNumber);
    setIsEditingCarInfo(false);
  };

  // Helper to calculate progress
  const getItemStatus = (item: MaintenanceItem) => {
    const driven = Math.max(0, currentMileage - item.lastServiceMileage);
    const ratio = Math.min(driven / item.intervalKm, 1.2); // Cap at 120%
    const percent = Math.floor(ratio * 100);
    const remaining = Math.max(0, item.intervalKm - driven);
    
    let statusText = '양호';
    let colorClass = 'text-green-500 bg-green-500';
    let bgClass = 'bg-green-100 dark:bg-green-900/30';

    if (ratio >= 1.0) {
      statusText = '교체 필요';
      colorClass = 'text-red-500 bg-red-500';
      bgClass = 'bg-red-50 dark:bg-red-900/20';
    } else if (ratio >= 0.8) {
      statusText = '점검 권장';
      colorClass = 'text-orange-500 bg-orange-500';
      bgClass = 'bg-orange-50 dark:bg-orange-900/20';
    }

    return { driven, percent, remaining, statusText, colorClass, bgClass, ratio };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 lg:pb-0">
      
      {/* 1. Car Header Card (Mycle Style) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
           <Gauge className="w-32 h-32 text-slate-900 dark:text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="w-full md:w-auto">
            {isEditingCarInfo ? (
               <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200 w-full md:w-64 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="text-xs text-slate-500 font-bold ml-1 mb-1 block">차종 이름</label>
                    <input 
                      type="text" 
                      value={tempModel}
                      onChange={(e) => setTempModel(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold ml-1 mb-1 block">차량 번호</label>
                    <input 
                      type="text" 
                      value={tempNumber}
                      onChange={(e) => setTempNumber(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-bold font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={saveCarInfo}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Save className="w-3 h-3" /> 저장
                    </button>
                    <button 
                      onClick={cancelEditingCarInfo}
                      className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <X className="w-3 h-3" /> 취소
                    </button>
                  </div>
               </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1 group">
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded-md">
                    내 차
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{carModel}</h2>
                  <button 
                    onClick={startEditingCarInfo} 
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-500 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="차량 정보 수정"
                  >
                     <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="group cursor-pointer" onClick={startEditingCarInfo}>
                    <p className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
                    {carNumber}
                    <span className="text-xs font-sans font-normal text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">클릭하여 수정</span>
                    </p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-end gap-4 w-full md:w-auto justify-end md:justify-start">
             <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">내 차 건강 점수</p>
                <div className="flex items-baseline gap-1 justify-end">
                   <span className={`text-3xl font-bold ${healthScore > 80 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-500'}`}>
                     {healthScore}
                   </span>
                   <span className="text-sm text-gray-400">점</span>
                </div>
             </div>
             <div className="w-px h-10 bg-gray-200 dark:bg-slate-700 mx-2 hidden md:block"></div>
             <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">현재 주행거리</p>
                <div className="flex items-center gap-2">
                   <span className="text-xl font-bold text-gray-800 dark:text-white">
                      {currentMileage.toLocaleString()}
                   </span>
                   <span className="text-sm text-gray-500">km</span>
                </div>
             </div>
          </div>
        </div>

        {/* Updated Mileage Input (Direct Input) */}
        <div className="mt-8 bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-slate-700/50">
           <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-blue-500">
              <Gauge className="w-6 h-6" />
           </div>
           <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">현재 주행거리 업데이트</label>
              <div className="relative">
                <input 
                  type="number"
                  value={currentMileage}
                  onChange={(e) => setCurrentMileage(Number(e.target.value))}
                  className="w-full bg-transparent text-xl font-bold text-gray-900 dark:text-white outline-none placeholder-gray-300"
                  placeholder="0"
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">km</span>
              </div>
           </div>
        </div>
      </div>

      {/* 2. Custom Tabs */}
      <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl flex relative">
        <button 
          onClick={() => { setActiveTab('status'); resetForm(); }}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 z-10 ${
            activeTab === 'status' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          소모품 관리
        </button>
        <button 
          onClick={() => { setActiveTab('log'); resetForm(); }}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 z-10 ${
            activeTab === 'log' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          정비 기록
        </button>
        <button 
          onClick={() => { setActiveTab('add'); resetForm(); }}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 z-10 ${
            activeTab === 'add' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          {editingRecordId ? '수정하기' : '+ 기록하기'}
        </button>
      </div>

      {/* 3. Content Views */}
      
      {/* VIEW: Status */}
      {activeTab === 'status' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {items.map(item => {
             const { percent, remaining, statusText, colorClass, bgClass } = getItemStatus(item);
             const ItemIcon = getIconForItem(item.name);
             
             return (
               <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 transition-all hover:shadow-md">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-2xl ${bgClass}`}>
                          <ItemIcon className={`w-6 h-6 ${statusText === '교체 필요' ? 'text-red-600' : 'text-slate-600 dark:text-slate-300'}`} />
                       </div>
                       <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                             교체주기: {item.intervalKm.toLocaleString()}km 마다
                          </p>
                       </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${bgClass} ${colorClass.split(' ')[0]}`}>
                       {statusText}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                       <span className="text-gray-600 dark:text-gray-300">
                         {remaining > 0 ? `${remaining.toLocaleString()}km 남음` : `${Math.abs(remaining).toLocaleString()}km 지남`}
                       </span>
                       <span className="text-gray-400">{percent}% 사용</span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                       <div 
                         className={`h-full rounded-full transition-all duration-1000 ${colorClass.split(' ')[1]}`} 
                         style={{ width: `${Math.min(percent, 100)}%` }}
                       ></div>
                    </div>
                 </div>
               </div>
             );
          })}
        </div>
      )}

      {/* VIEW: Log (With Edit/Delete) */}
      {activeTab === 'log' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <h3 className="font-bold text-lg mb-6 flex items-center gap-2 dark:text-white">
             <History className="w-5 h-5 text-gray-400" />
             최근 정비 이력
           </h3>
           
           {records.length === 0 ? (
             <div className="text-center py-12 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
               <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                 <Search className="w-6 h-6 text-gray-300" />
               </div>
               <p className="text-gray-500 dark:text-gray-400 font-medium">등록된 정비 기록이 없습니다.</p>
               <button onClick={() => setActiveTab('add')} className="mt-4 text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline">
                 기록하러 가기 &rarr;
               </button>
             </div>
           ) : (
             <div className="relative pl-4 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 dark:before:bg-slate-700">
                {records.map((record) => (
                  <div key={record.id} className="relative pl-8 group">
                     {/* Timeline Dot */}
                     <div className="absolute left-0 top-1 w-[10px] h-[10px] rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-800"></div>
                     
                     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <div>
                           <span className="text-xs font-bold text-gray-400 bg-gray-50 dark:bg-slate-700 px-2 py-0.5 rounded-md mb-2 inline-block">
                             {record.date}
                           </span>
                           <h4 className="text-lg font-bold text-gray-900 dark:text-white">{record.itemName}</h4>
                           {record.shopName && (
                             <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                               <MapPin className="w-3 h-3" /> {record.shopName}
                             </p>
                           )}
                        </div>
                        <div className="text-right mt-2 sm:mt-0">
                           <p className="font-bold text-gray-800 dark:text-gray-200">{record.cost.toLocaleString()}원</p>
                           <p className="text-sm text-gray-500 dark:text-gray-400">{record.mileage.toLocaleString()} km</p>
                           
                           {/* Action Buttons */}
                           <div className="flex gap-2 justify-end mt-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEditRecord(record)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="수정"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteRecord(record.id, record.itemName)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}

      {/* VIEW: Add/Edit Record */}
      {activeTab === 'add' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
           
           <div className="space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-gray-800 dark:text-white">
                   {editingRecordId ? '정비 기록 수정' : '어떤 정비를 하셨나요?'}
                </label>
                {editingRecordId && (
                  <button onClick={resetForm} className="text-xs text-gray-500 underline">새 기록 추가로 전환</button>
                )}
              </div>

              {/* Step 1: Item Selection Grid */}
              <div className="grid grid-cols-3 gap-3">
                {items.map(item => {
                  const ItemIcon = getIconForItem(item.name);
                  const isSelected = selectedItemName === item.name;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItemName(item.name)}
                      className={`
                        flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200
                        ${isSelected 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 transform scale-[1.02]' 
                          : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600'
                        }
                      `}
                    >
                      <ItemIcon className={`w-6 h-6 mb-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                      <span className="text-xs font-bold text-center break-keep">{item.name}</span>
                      {isSelected && <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>}
                    </button>
                  );
                })}
              </div>

              {/* Step 2: Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">날짜</label>
                    <div className="relative">
                       <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                       <input 
                         type="date"
                         value={serviceDate}
                         onChange={(e) => setServiceDate(e.target.value)}
                         className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium dark:text-white"
                       />
                    </div>
                 </div>
                 
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">주행거리 (km)</label>
                    <div className="relative">
                       <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                       <input 
                         type="number"
                         value={serviceMileage}
                         onChange={(e) => setServiceMileage(Number(e.target.value))}
                         className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium dark:text-white"
                       />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">비용 (원)</label>
                    <div className="relative">
                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                       <input 
                         type="text"
                         value={serviceCost}
                         onChange={(e) => {
                             const val = e.target.value.replace(/[^0-9]/g, '');
                             setServiceCost(Number(val).toLocaleString());
                         }}
                         placeholder="0"
                         className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium dark:text-white"
                       />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">정비소 (선택)</label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                       <input 
                         type="text"
                         value={shopName}
                         onChange={(e) => setShopName(e.target.value)}
                         placeholder="블루핸즈 역삼점"
                         className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium dark:text-white"
                       />
                    </div>
                 </div>
              </div>

              <div className="flex gap-3">
                {editingRecordId && (
                  <button 
                     onClick={() => { setActiveTab('log'); resetForm(); }}
                     className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold text-lg py-4 rounded-2xl transition-all"
                  >
                     취소
                  </button>
                )}
                <button 
                   onClick={handleSaveRecord}
                   className="flex-[2] bg-slate-900 dark:bg-blue-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-slate-900/10 dark:shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                   <CheckCircle2 className="w-5 h-5" />
                   {editingRecordId ? '수정 완료' : '정비 기록 저장'}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
