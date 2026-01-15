import React, { useState } from 'react';
import { 
  Smartphone, Github, Globe, Terminal, Info, Cloud, 
  Database, RefreshCw, Key, Copy, Check, Download, Upload, AlertTriangle 
} from 'lucide-react';

interface SettingsProps {
  onSync: (action: 'push' | 'pull', targetId?: string) => void;
  syncId: string;
  setSyncId: (id: string) => void;
}

export const SystemSettings: React.FC<SettingsProps> = ({ onSync, syncId, setSyncId }) => {
  const [copied, setCopied] = useState(false);
  const [inputSyncId, setInputSyncId] = useState('');
  const [showIdInput, setShowIdInput] = useState(false);

  const generateNewId = () => {
    const newId = Math.random().toString(36).substring(2, 10);
    setSyncId(newId);
    localStorage.setItem('LIFEOS_SYNC_ID', newId);
    onSync('push', newId);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(syncId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLink = () => {
    if (inputSyncId.trim()) {
      setSyncId(inputSyncId);
      localStorage.setItem('LIFEOS_SYNC_ID', inputSyncId);
      onSync('pull', inputSyncId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 lg:pb-0 text-gray-800 dark:text-gray-200">
      {/* 1. Database & Cloud Sync Section */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Database className="w-48 h-48" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-2xl">
              <Cloud className="w-8 h-8 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold dark:text-white">Cloud Database Sync</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">여러 기기에서 동일한 데이터를 실시간으로 동기화합니다.</p>
            </div>
          </div>

          {!syncId ? (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-slate-100 dark:border-slate-700">
                  <Key className="w-8 h-8 text-indigo-500" />
                </div>
                <div>
                   <h3 className="text-xl font-bold dark:text-white">클라우드 동기화 시작하기</h3>
                   <p className="text-sm text-slate-400 mt-2">새 동기화 ID를 생성하거나 기존 기기의 ID를 입력하여 연결하세요.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button 
                    onClick={generateNewId}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" /> 새 ID 생성
                  </button>
                  <button 
                    onClick={() => setShowIdInput(true)}
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    기존 ID 연결
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Your Sync Key</p>
                      <div className="flex items-center gap-3">
                         <span className="text-3xl font-mono font-bold text-indigo-500 tracking-tighter">{syncId}</span>
                         <button onClick={handleCopy} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:text-indigo-500 transition-colors">
                            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                         </button>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => onSync('push')} className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all">
                        <Upload className="w-4 h-4" /> Cloud Save
                      </button>
                      <button onClick={() => onSync('pull')} className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all">
                        <Download className="w-4 h-4" /> Fetch Update
                      </button>
                   </div>
                </div>
              </div>
              <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex items-start gap-4">
                 <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                 <p className="text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
                   <strong>중요:</strong> 이 ID를 다른 기기에서 입력하면 현재 데이터를 그대로 가져올 수 있습니다. ID를 분실하면 데이터를 복구할 수 없으니 안전한 곳에 메모해두세요.
                 </p>
              </div>
            </div>
          )}

          {showIdInput && !syncId && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-3xl border border-white/10">
                  <h3 className="text-2xl font-bold dark:text-white mb-2">기존 기기 연결</h3>
                  <p className="text-sm text-slate-500 mb-8">다른 기기에서 생성한 8자리 ID를 입력하세요.</p>
                  
                  <input 
                    type="text"
                    value={inputSyncId}
                    onChange={(e) => setInputSyncId(e.target.value)}
                    placeholder="예: x2kj91ab"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-xl font-mono font-bold dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/20 mb-8"
                  />
                  
                  <div className="flex gap-3">
                    <button onClick={handleLink} className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20">데이터 불러오기</button>
                    <button onClick={() => setShowIdInput(false)} className="px-6 bg-slate-100 dark:bg-slate-800 font-bold py-4 rounded-2xl">취소</button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-slate-700 h-full">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-blue-500" />
            모바일 설치 방법
            </h3>
            <ol className="list-decimal list-inside space-y-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            <li className="pl-1">
                <strong>웹 배포:</strong> GitHub Pages나 Vercel 등을 통해 이 사이트를 배포하세요.
            </li>
            <li className="pl-1">
                <strong>브라우저 접속:</strong> 스마트폰에서 Safari(iOS) 또는 Chrome(안드로이드)으로 접속합니다.
            </li>
            <li className="pl-1">
                <strong>홈 화면에 추가:</strong>
                <ul className="list-disc list-inside ml-6 mt-3 text-xs opacity-80 space-y-2">
                <li>iOS: "공유" 버튼 → "홈 화면에 추가"</li>
                <li>안드로이드: 메뉴(점 3개) → "홈 화면에 추가"</li>
                </ul>
            </li>
            <li className="pl-1 font-bold text-indigo-500">
                <strong>실행:</strong> 앱 아이콘이 생성되며 네이티브 앱처럼 전체 화면으로 실행됩니다.
            </li>
            </ol>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-slate-700 h-full">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
            <Info className="w-6 h-6 text-slate-400" />
            시스템 정보
            </h3>
            
            <div className="space-y-6">
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700/50">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Version</span>
                   <span className="text-sm font-bold dark:text-white">LifeOS 1.2.4</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700/50">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform</span>
                   <span className="text-sm font-bold dark:text-white">React 19 / Vite</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700/50">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Engine</span>
                   <span className="text-sm font-bold dark:text-white">Gemini 3 Pro</span>
                </div>
                
                <div className="pt-4">
                  <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-tighter font-bold">
                    This LifeOS dashboard is optimized for personal use and data privacy. 
                    Local data is stored in your browser's LocalStorage and only moved to the cloud when you initiate a Cloud Sync.
                  </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};