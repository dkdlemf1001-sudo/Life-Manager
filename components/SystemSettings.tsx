
import React, { useState } from 'react';
import { 
  Smartphone, Info, Cloud, Database, RefreshCw, Key, Copy, Check, Download, Upload, AlertTriangle, ExternalLink
} from 'lucide-react';

interface SettingsProps {
  onSync: (action: 'push' | 'pull' | 'create', targetId?: string) => void;
  syncId: string;
  setSyncId: (id: string) => void;
}

export const SystemSettings: React.FC<SettingsProps> = ({ onSync, syncId, setSyncId }) => {
  const [copied, setCopied] = useState(false);
  const [inputSyncId, setInputSyncId] = useState('');
  const [showIdInput, setShowIdInput] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(syncId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLink = () => {
    if (inputSyncId.trim()) {
      onSync('pull', inputSyncId.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 text-white animate-in fade-in duration-500">
      {/* 1. Cloud Sync Section */}
      <div className="bg-black/40 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Database className="w-48 h-48 text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
              <Cloud className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase">Cloud Intelligence Sync</h2>
              <p className="text-sm text-white/40 font-medium tracking-tight">기기 간 데이터 실시간 동기화 보관함</p>
            </div>
          </div>

          {!syncId ? (
            <div className="bg-white/5 rounded-[3rem] p-10 text-center border-2 border-dashed border-white/10 backdrop-blur-md">
              <div className="max-w-md mx-auto space-y-8">
                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto shadow-2xl border border-white/10">
                  <Key className="w-10 h-10 text-indigo-400" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Activate Cloud Sync</h3>
                   <p className="text-sm text-white/30 mt-3 leading-relaxed">
                     데이터를 클라우드에 처음 저장하여 ID를 발급받거나,<br/>
                     기존에 사용하던 기기의 ID를 입력하여 연결하세요.
                   </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button 
                    onClick={() => onSync('create')}
                    className="flex-1 bg-white text-black font-black py-5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl uppercase text-xs"
                  >
                    <RefreshCw className="w-4 h-4" /> Create New Cloud ID
                  </button>
                  <button 
                    onClick={() => setShowIdInput(true)}
                    className="flex-1 bg-white/5 border border-white/10 font-black py-5 rounded-2xl hover:bg-white/10 transition-all text-white/60 uppercase text-xs"
                  >
                    Connect Existing ID
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">Your Unique Archive ID</p>
                      <div className="flex items-center gap-4">
                         <span className="text-4xl font-mono font-black text-indigo-400 tracking-tighter drop-shadow-xl">{syncId}</span>
                         <button onClick={handleCopy} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:text-indigo-400 transition-all active:scale-90">
                            {copied ? <Check className="w-6 h-6 text-emerald-400" /> : <Copy className="w-6 h-6" />}
                         </button>
                      </div>
                   </div>
                   <div className="flex flex-wrap gap-3">
                      <button onClick={() => onSync('push')} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all border border-indigo-500/30 uppercase">
                        <Upload className="w-4 h-4" /> Push to Cloud
                      </button>
                      <button onClick={() => onSync('pull')} className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-xs hover:bg-white/10 active:scale-95 transition-all text-white/60 uppercase">
                        <Download className="w-4 h-4" /> Pull Update
                      </button>
                   </div>
                </div>
              </div>
              <div className="p-6 bg-amber-500/10 rounded-[1.5rem] border border-amber-500/20 flex items-start gap-4">
                 <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                 <p className="text-xs font-bold text-amber-200/70 leading-relaxed uppercase">
                   이 ID는 당신의 개인 보관함 주소입니다. 다른 기기에서 이 코드를 입력하면 사진 갤러리, 차 관리 내역 등을 그대로 불러올 수 있습니다. <span className="text-amber-400 underline cursor-pointer">ID를 외부에 노출하지 마세요.</span>
                 </p>
              </div>
            </div>
          )}

          {showIdInput && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-xl bg-black/80 animate-in fade-in">
               <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-[3rem] p-12 shadow-3xl">
                  <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">Connect Archive</h3>
                  <p className="text-sm text-white/30 mb-8 uppercase tracking-widest font-bold">Enter your 8-digit unique code</p>
                  
                  <input 
                    type="text"
                    value={inputSyncId}
                    onChange={(e) => setInputSyncId(e.target.value.toLowerCase())}
                    placeholder="e.g. x2kj91ab"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-2xl font-mono font-black text-white outline-none focus:border-indigo-500 transition-all mb-8 placeholder:text-white/10 text-center"
                  />
                  
                  <div className="flex gap-4">
                    <button onClick={handleLink} className="flex-1 bg-white text-black font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-xs">Sync Now</button>
                    <button onClick={() => setShowIdInput(false)} className="px-8 bg-white/5 border border-white/10 font-black py-5 rounded-2xl text-white/40 uppercase text-xs">Cancel</button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-black/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/10 space-y-6">
            <h3 className="font-black text-xl italic text-white flex items-center gap-3 uppercase tracking-tighter">
              <Smartphone className="w-6 h-6 text-pink-500" /> Mobile Setup
            </h3>
            <div className="space-y-4 text-xs font-bold text-white/50 leading-loose uppercase tracking-wider">
               <p>1. 노트북에서 'Push to Cloud'로 데이터 저장</p>
               <p>2. 발급된 ID를 복사</p>
               <p>3. 모바일 브라우저로 접속 후 'Connect Existing ID' 선택</p>
               <p>4. ID 입력 후 'Sync Now' 클릭 시 연동 완료</p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
               <ExternalLink size={12}/> Browser persistence: enabled
            </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/10">
            <h3 className="font-black text-xl italic text-white mb-8 uppercase tracking-tighter">System Analytics</h3>
            <div className="space-y-6">
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                   <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Version</span>
                   <span className="text-sm font-black text-white">2.0.0 (Cloud Native)</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                   <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Engine</span>
                   <span className="text-sm font-black text-white text-pink-400">Gemini 3 Pro</span>
                </div>
                <div className="flex items-center justify-between py-3">
                   <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Database</span>
                   <span className="text-sm font-black text-white">IndexedDB (Locked)</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
