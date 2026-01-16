
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../db';
import { Muse } from '../types';
import { 
  Heart, Sparkles, PlusCircle, X as XIcon, Loader2, 
  Plus, Camera, Trash2, Calendar, ZoomIn, 
  User, Image as ImageIcon, Info, Instagram, Youtube, Star, Link as LinkIcon
} from 'lucide-react';

export const IdealTypeGallery: React.FC = () => {
  const [muses, setMuses] = useState<Muse[]>([]);
  const [activeMuseId, setActiveMuseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Overlay States
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // New Muse Profile State
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileGroup, setNewProfileGroup] = useState('');
  const [newProfileImage, setNewProfileImage] = useState('');
  const [newProfileType, setNewProfileType] = useState<'Idol' | 'Influencer'>('Idol');
  const [newProfileColor, setNewProfileColor] = useState('pink');
  
  // New Photo State
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  useEffect(() => {
    const loadMuses = async () => {
      try {
        await db.init();
        const data = await db.getAll<Muse>('muses');
        setMuses(data);
        if (data.length > 0) setActiveMuseId(data[0].id);
      } catch (error) {
        console.error("Failed to load muses", error);
      } finally {
        setLoading(false);
      }
    };
    loadMuses();
  }, []);

  const activeMuse = useMemo(() => muses.find(m => m.id === activeMuseId), [muses, activeMuseId]);

  const handleAddProfile = async () => {
     if (!newProfileName) return;
     const id = newProfileName.toLowerCase().replace(/\s+/g, '') + Date.now();
     const newMuse: Muse = {
        id,
        name: newProfileName.toUpperCase(),
        koreanName: newProfileName,
        group: newProfileGroup || (newProfileType === 'Idol' ? 'Solo' : 'Instagram'),
        birthDate: new Date().toISOString().split('T')[0],
        role: newProfileType,
        description: `${newProfileName} 아카이브 공간`,
        profileImage: newProfileImage || 'https://i.pinimg.com/736x/8a/7a/b1/8a7ab1cc08b17846513364f776269224.jpg',
        gallery: [],
        themeColor: newProfileColor
     };
     
     const updated = [...muses, newMuse];
     setMuses(updated);
     await db.save('muses', newMuse);
     
     setShowAddProfileModal(false);
     setActiveMuseId(id);
     setNewProfileName('');
     setNewProfileGroup('');
     setNewProfileImage('');
  };

  const handleAddPhoto = useCallback(async () => {
     if (!newPhotoUrl.trim() || !activeMuse) return;
     
     const trimmedUrl = newPhotoUrl.trim();
     const newImage = {
        id: Date.now().toString(),
        url: trimmedUrl,
        title: 'Archived',
        span: 'col-span-1 row-span-1'
     };
     
     const updatedMuse = {
        ...activeMuse,
        gallery: [newImage, ...activeMuse.gallery]
     };
     
     const updatedMuses = muses.map(m => m.id === activeMuse.id ? updatedMuse : m);
     setMuses(updatedMuses);
     await db.save('muses', updatedMuse); // DB에 영구 저장
     
     setNewPhotoUrl('');
     setShowAddPhotoModal(false);
  }, [newPhotoUrl, activeMuse, muses]);

  const handleDeletePhoto = async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeMuse || !window.confirm('이 사진을 아카이브에서 삭제하시겠습니까?')) return;
    
    const updatedMuse = {
      ...activeMuse,
      gallery: activeMuse.gallery.filter(p => p.id !== photoId)
    };
    
    setMuses(muses.map(m => m.id === activeMuse.id ? updatedMuse : m));
    await db.save('muses', updatedMuse); // DB 업데이트
  };

  const handleDeleteMuse = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('이 프로필을 완전히 삭제하시겠습니까? 관련 사진도 모두 삭제됩니다.')) return;
    const updated = muses.filter(m => m.id !== id);
    setMuses(updated);
    await db.delete('muses', id);
    if (activeMuseId === id) setActiveMuseId(updated.length > 0 ? updated[0].id : null);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
      <Loader2 className="w-16 h-16 animate-spin text-pink-500" />
      <p className="text-white/40 font-bold tracking-widest uppercase text-[10px]">Accessing Database Archive</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-40 animate-in fade-in duration-700">
      
      {/* Muse Navigation */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1">
         {muses.map(muse => (
            <div key={muse.id} className="relative group shrink-0">
               <button 
                  onClick={() => setActiveMuseId(muse.id)}
                  className={`flex items-center gap-3 pl-2 pr-5 py-2 rounded-full border transition-all duration-300 ${activeMuseId === muse.id ? `bg-white text-black border-white shadow-xl scale-105` : 'bg-black/40 text-white/40 border-white/5 hover:border-white/20'}`}
               >
                  <div className="w-9 h-9 rounded-full overflow-hidden">
                     <img src={muse.profileImage} alt={muse.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-black tracking-tighter text-[11px] uppercase">{muse.name}</span>
               </button>
               <button 
                  onClick={(e) => handleDeleteMuse(muse.id, e)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
               >
                  <XIcon size={10} />
               </button>
            </div>
         ))}
         <button 
            onClick={() => setShowAddProfileModal(true)}
            className="shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/20 hover:text-white transition-all"
         >
            <Plus className="w-5 h-5" />
         </button>
      </div>

      {activeMuse ? (
         <>
            {/* Profile Hero Section */}
            <div className="relative bg-black/40 backdrop-blur-3xl rounded-[3rem] p-10 md:p-14 border border-white/10 shadow-3xl overflow-hidden">
               <div className={`absolute top-0 right-0 w-[600px] h-[600px] bg-${activeMuse.themeColor}-500/10 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40`}></div>
               
               <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                  <div className="relative group">
                     <div className={`w-48 h-48 md:w-64 md:h-64 rounded-[2.5rem] overflow-hidden border-4 border-white/10 bg-slate-900 shadow-2xl ring-4 ring-${activeMuse.themeColor}-500/20`}>
                        <img src={activeMuse.profileImage} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                     </div>
                     <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-[#0a0a0a]">
                        {activeMuse.role === 'Idol' ? (
                          <Star className={`text-${activeMuse.themeColor}-500 fill-${activeMuse.themeColor}-500 w-5 h-5 animate-pulse`} />
                        ) : (
                          <Instagram className={`text-${activeMuse.themeColor}-500 w-5 h-5 animate-pulse`} />
                        )}
                     </div>
                  </div>

                  <div className="text-center md:text-left space-y-6 flex-1">
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-widest text-white/40 uppercase flex items-center gap-2">
                           {activeMuse.role === 'Idol' ? <Star size={12}/> : <Instagram size={12}/>}
                           {activeMuse.role}
                        </span>
                        <span className={`px-4 py-1.5 rounded-full bg-${activeMuse.themeColor}-500/10 border border-${activeMuse.themeColor}-500/20 text-[10px] font-black tracking-widest text-${activeMuse.themeColor}-400 uppercase`}>
                           {activeMuse.group}
                        </span>
                     </div>
                     
                     <div className="space-y-2">
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-none">{activeMuse.name}</h1>
                        <p className="text-lg text-white/40 font-medium italic">"{activeMuse.description}"</p>
                     </div>
                     
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                        <div className="flex items-center gap-2 bg-white/5 px-5 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
                           <Calendar className="w-4 h-4 text-white/30" />
                           <span className="text-xs font-mono font-black text-white/70">{activeMuse.birthDate}</span>
                        </div>
                        <button 
                          onClick={() => setShowAddPhotoModal(true)}
                          className={`flex items-center gap-3 bg-white text-black px-8 py-3 rounded-2xl font-black text-xs hover:bg-gray-200 transition-all active:scale-95 shadow-xl uppercase`}
                        >
                           <PlusCircle className="w-4 h-4" /> Add to Archive
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Photo Gallery Grid */}
            <div className="space-y-8">
               <div className="flex items-center justify-between px-6">
                  <h3 className="text-xl font-black italic tracking-tighter flex items-center gap-3 uppercase">
                     <ImageIcon className={`text-${activeMuse.themeColor}-500 w-5 h-5`} /> {activeMuse.name} Collection
                  </h3>
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                     {activeMuse.gallery.length} ITEMS STORED
                  </div>
               </div>

               {activeMuse.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                     {activeMuse.gallery.map((img) => (
                        <div 
                           key={img.id} 
                           onClick={() => setSelectedImage(img.url)}
                           className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-white/10 shadow-xl cursor-pointer bg-white/5"
                        >
                           <img 
                              src={img.url} 
                              alt="" 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              loading="lazy"
                           />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                              <ZoomIn size={24} className="text-white scale-75 group-hover:scale-100 transition-transform" />
                              <button 
                                 onClick={(e) => handleDeletePhoto(img.id, e)} 
                                 className="absolute top-4 right-4 p-2 bg-rose-500/20 hover:bg-rose-500 rounded-full text-rose-500 hover:text-white transition-all"
                              >
                                 <Trash2 size={16}/>
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div 
                     onClick={() => setShowAddPhotoModal(true)}
                     className="py-32 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center gap-4 text-white/10 hover:text-white/30 hover:bg-white/5 transition-all cursor-pointer group"
                  >
                     <Camera className="w-12 h-12 group-hover:scale-110 transition-transform" />
                     <p className="text-[10px] font-black uppercase tracking-[0.4em]">Archive is empty. Tap to add your favorite shots.</p>
                  </div>
               )}
            </div>
         </>
      ) : (
         <div className="text-center py-40 bg-black/20 rounded-[3rem] border border-dashed border-white/5">
            <User className="w-16 h-16 text-white/5 mx-auto mb-6" />
            <p className="text-white/20 font-black uppercase tracking-widest">Select or create an archive profile to start</p>
         </div>
      )}

      {/* Lightbox Overlay */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/98 backdrop-blur-2xl animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-8 right-8 p-3 text-white/40 hover:text-white transition-colors bg-white/5 rounded-full"><XIcon size={32}/></button>
          <img src={selectedImage} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500" alt="Preview" />
        </div>
      )}

      {/* Create Profile Modal */}
      {showAddProfileModal && (
         <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#0a0a0a] border border-white/10 p-10 rounded-[3rem] max-w-sm w-full shadow-3xl">
               <h3 className="text-2xl font-black mb-8 italic text-white uppercase tracking-tighter">New Archive Identity</h3>
               
               <div className="space-y-6 mb-10">
                  {/* Category Selection */}
                  <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                    <button 
                      onClick={() => setNewProfileType('Idol')}
                      className={`flex-1 py-2 text-[11px] font-black uppercase rounded-xl transition-all ${newProfileType === 'Idol' ? 'bg-white text-black' : 'text-white/40'}`}
                    >
                      Idol
                    </button>
                    <button 
                      onClick={() => setNewProfileType('Influencer')}
                      className={`flex-1 py-2 text-[11px] font-black uppercase rounded-xl transition-all ${newProfileType === 'Influencer' ? 'bg-white text-black' : 'text-white/40'}`}
                    >
                      Influencer
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Display Name</label>
                    <input className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-pink-500 font-bold text-white transition-all" placeholder="Enter Name" value={newProfileName} onChange={e => setNewProfileName(e.target.value)} />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{newProfileType === 'Idol' ? 'Group / Label' : 'Platform Link'}</label>
                    <input className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-pink-500 font-bold text-white transition-all" placeholder={newProfileType === 'Idol' ? 'e.g. ILLIT' : 'e.g. Instagram'} value={newProfileGroup} onChange={e => setNewProfileGroup(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Profile Image URL (Direct)</label>
                    <input className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-pink-500 font-bold text-white transition-all" placeholder="https://...image.jpg" value={newProfileImage} onChange={e => setNewProfileImage(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Theme Color</label>
                    <div className="flex gap-2">
                       {['pink', 'blue', 'purple', 'emerald', 'orange'].map(c => (
                         <button key={c} onClick={() => setNewProfileColor(c)} className={`w-8 h-8 rounded-full bg-${c}-500 border-2 ${newProfileColor === c ? 'border-white scale-110' : 'border-transparent opacity-50'}`}></button>
                       ))}
                    </div>
                  </div>
               </div>
               
               <div className="flex gap-3">
                  <button onClick={handleAddProfile} className="flex-1 bg-white text-black font-black py-4 rounded-2xl active:scale-95 transition-all text-xs uppercase">Save Profile</button>
                  <button onClick={() => setShowAddProfileModal(false)} className="px-6 bg-white/5 font-black py-4 rounded-2xl text-white/40 uppercase text-xs">Cancel</button>
               </div>
            </div>
         </div>
      )}

      {/* Add Photo Modal */}
      {showAddPhotoModal && activeMuse && (
         <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#0a0a0a] border border-white/10 p-10 rounded-[3rem] max-w-md w-full shadow-3xl">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black italic text-white tracking-tighter uppercase">Add to Collection</h3>
                  <button onClick={() => setShowAddPhotoModal(false)} className="text-white/20 hover:text-white transition-colors"><XIcon/></button>
               </div>
               
               <div className="space-y-6">
                  <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex items-start gap-4">
                     <Info className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                     <p className="text-[10px] font-bold text-white/50 leading-relaxed uppercase">
                        이미지 파일의 '직접 주소'(.jpg, .png 등)를 입력해야 브라우저에 정상적으로 저장됩니다.
                     </p>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Direct Image URL</label>
                     <div className="flex gap-3">
                        <input 
                           className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-pink-500 text-sm font-bold text-white transition-all" 
                           placeholder="https://..." 
                           value={newPhotoUrl} 
                           onChange={e => setNewPhotoUrl(e.target.value)} 
                           onKeyDown={(e) => e.key === 'Enter' && handleAddPhoto()}
                        />
                        <button 
                           onClick={handleAddPhoto} 
                           disabled={!newPhotoUrl.trim()}
                           className="bg-white text-black px-6 rounded-2xl font-black text-xs shadow-xl disabled:opacity-20 active:scale-95 transition-all uppercase"
                        >
                           Store
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
