import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { db } from '../db';
import { Muse } from '../types';
import { 
  Heart, Music, Star, Instagram, Share2, Download, Sparkles, 
  PlusCircle, Search, ArrowLeft, Twitter, X as XIcon, Loader2, ExternalLink
} from 'lucide-react';

export const IdealTypeGallery: React.FC = () => {
  const [muses, setMuses] = useState<Muse[]>([]);
  const [activeMuseId, setActiveMuseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // States for adding photos/profiles
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // New Profile Form
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileGroup, setNewProfileGroup] = useState('');
  
  // New Photo Form
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [searchLinks, setSearchLinks] = useState<{title: string, uri: string}[]>([]);

  // Load Data
  useEffect(() => {
    const loadMuses = async () => {
      try {
        await db.init();
        const data = await db.getAll<Muse>('muses');
        setMuses(data);
        // Default to Moka if she exists and no one is selected
        if (!activeMuseId && data.length > 0) {
           setActiveMuseId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to load muses", error);
      } finally {
        setLoading(false);
      }
    };
    loadMuses();
  }, [activeMuseId]);

  const activeMuse = muses.find(m => m.id === activeMuseId);

  // Handlers
  const handleAddProfile = async () => {
     if (!newProfileName) return;
     const id = newProfileName.toLowerCase().replace(/\s+/g, '');
     const newMuse: Muse = {
        id,
        name: newProfileName,
        koreanName: newProfileName, // Placeholder
        group: newProfileGroup || 'K-Pop',
        birthDate: '2000-01-01',
        role: 'Idol',
        description: 'New Muse',
        profileImage: 'https://via.placeholder.com/200',
        gallery: [],
        themeColor: 'pink'
     };
     
     const updated = [...muses, newMuse];
     setMuses(updated);
     await db.save('muses', newMuse);
     setShowAddProfileModal(false);
     setActiveMuseId(id);
     setNewProfileName('');
     setNewProfileGroup('');
  };

  const handleAddPhoto = async () => {
     if (!newPhotoUrl || !activeMuse) return;
     
     const newImage = {
        id: Date.now().toString(),
        url: newPhotoUrl,
        title: 'New Photo',
        span: 'col-span-1 row-span-1'
     };
     
     const updatedMuse = {
        ...activeMuse,
        gallery: [newImage, ...activeMuse.gallery]
     };
     
     setMuses(muses.map(m => m.id === activeMuse.id ? updatedMuse : m));
     await db.save('muses', updatedMuse);
     setNewPhotoUrl('');
     setShowAddPhotoModal(false);
  };

  const handleAISearch = async () => {
     if (!activeMuse) return;
     setIsSearching(true);
     setSearchLinks([]);

     try {
       const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
       const query = `${activeMuse.name} ${activeMuse.group} aesthetic high quality photos pinterest twitter`;
       
       const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: `Find 5 sources for high quality photos of ${activeMuse.name} from ${activeMuse.group}. 
                     Focus on Pinterest boards or Twitter (X) fan accounts.
                     Return a JSON list of links. Format: [{"title": "...", "uri": "..."}]`,
          config: {
             tools: [{ googleSearch: {} }]
          }
       });
       
       // Grounding Logic
       const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
       const links = chunks
         .filter((c: any) => c.web)
         .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
       
       setSearchLinks(links);
       
     } catch (e) {
        console.error(e);
     } finally {
        setIsSearching(false);
     }
  };

  const openSearchTab = (platform: 'pinterest' | 'twitter') => {
      if (!activeMuse) return;
      const q = encodeURIComponent(`${activeMuse.group} ${activeMuse.name} aesthetic`);
      const url = platform === 'pinterest' 
        ? `https://www.pinterest.com/search/pins/?q=${q}`
        : `https://twitter.com/search?q=${q}&src=typed_query&f=media`;
      window.open(url, '_blank');
  };

  if (loading) return <div className="text-center p-10"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 animate-in fade-in duration-500">
      
      {/* 1. Muse Selector (Top Bar) */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
         {muses.map(muse => (
            <button 
               key={muse.id}
               onClick={() => setActiveMuseId(muse.id)}
               className={`shrink-0 flex items-center gap-3 pl-2 pr-5 py-2 rounded-full border transition-all duration-300 ${activeMuseId === muse.id ? `bg-${muse.themeColor || 'pink'}-500 text-white border-${muse.themeColor || 'pink'}-400 shadow-lg` : 'bg-black/40 text-white/60 border-white/10 hover:bg-white/10'}`}
            >
               <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                  <img src={muse.profileImage} alt={muse.name} className="w-full h-full object-cover" />
               </div>
               <span className="font-bold tracking-wide uppercase">{muse.name}</span>
            </button>
         ))}
         <button 
            onClick={() => setShowAddProfileModal(true)}
            className="shrink-0 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
         >
            <PlusCircle className="w-6 h-6 text-white/50" />
         </button>
      </div>

      {activeMuse ? (
         <>
            {/* 2. Profile Hero Section */}
            <div className="relative overflow-hidden bg-black/40 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 text-white shadow-2xl border border-white/10 group">
               {/* Background Glow based on Theme */}
               <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-${activeMuse.themeColor || 'pink'}-500/20 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none`}></div>
               
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="relative shrink-0">
                     <div className={`w-40 h-40 md:w-56 md:h-56 rounded-full p-1.5 bg-gradient-to-tr from-${activeMuse.themeColor || 'pink'}-500 via-purple-500 to-indigo-500 shadow-2xl`}>
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-black/50">
                          <img 
                            src={activeMuse.profileImage} 
                            alt="Profile" 
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                     </div>
                     <div className="absolute bottom-2 right-2 bg-white text-black p-2.5 rounded-full shadow-lg border-2 border-pink-100">
                        <Sparkles className={`w-5 h-5 text-${activeMuse.themeColor || 'pink'}-500 fill-${activeMuse.themeColor || 'pink'}-500 animate-pulse`} />
                     </div>
                  </div>

                  <div className="text-center md:text-left space-y-4 max-w-lg">
                     <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-${activeMuse.themeColor || 'pink'}-500/20 border border-${activeMuse.themeColor || 'pink'}-500/30 backdrop-blur-md`}>
                        <span className={`w-2 h-2 rounded-full bg-${activeMuse.themeColor || 'pink'}-400 animate-ping`}></span>
                        <span className={`text-xs font-bold text-${activeMuse.themeColor || 'pink'}-300 uppercase tracking-widest`}>{activeMuse.role}</span>
                     </div>
                     <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg font-sans">
                        {activeMuse.name} <span className={`text-${activeMuse.themeColor || 'pink'}-400 text-3xl md:text-5xl font-thin opacity-70`}>{activeMuse.koreanName}</span>
                     </h1>
                     <p className="text-white/70 text-lg leading-relaxed font-medium">
                        {activeMuse.description}
                     </p>
                     
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                        <div className="px-5 py-2.5 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2 hover:bg-white/20 transition-colors cursor-pointer">
                           <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                           <span className="text-sm font-bold">{activeMuse.birthDate}</span>
                        </div>
                        <div className="px-5 py-2.5 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2 hover:bg-white/20 transition-colors cursor-pointer">
                           <Music className="w-4 h-4 text-indigo-400" />
                           <span className="text-sm font-bold">{activeMuse.group}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* 3. Photo Grid (Masonry Vibe) */}
            <div>
               <div className="flex items-center justify-between mb-6 px-4">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                     <Instagram className="w-6 h-6 text-pink-400" /> Photo Gallery
                  </h3>
                  <div className="flex gap-2">
                     <button onClick={() => setShowAddPhotoModal(true)} className="flex items-center gap-2 text-xs font-bold text-white/80 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all border border-white/10">
                        <PlusCircle className="w-4 h-4" /> Add Photo
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
                  {activeMuse.gallery.map((img, idx) => (
                     <div key={idx} className={`relative group rounded-[2rem] overflow-hidden shadow-lg cursor-pointer border border-white/10 ${img.span || 'col-span-1 row-span-1'}`}>
                        <img 
                           src={img.url} 
                           alt={img.title}
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                           onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x800/1a1a1a/ffffff?text=Image+Load+Error';
                           }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                           <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              <p className="text-white font-bold text-lg">{img.title}</p>
                              <div className="flex items-center gap-3 mt-2">
                                 <button className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors">
                                    <Heart className="w-5 h-5 text-white" />
                                 </button>
                                 <button className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors">
                                    <Download className="w-5 h-5 text-white" />
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
                  
                  {/* "Add More" Trigger */}
                  <div onClick={() => setShowAddPhotoModal(true)} className="col-span-1 row-span-1 border-2 border-dashed border-white/20 rounded-[2rem] flex flex-col items-center justify-center text-white/30 hover:text-white/60 hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer group">
                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Search className="w-6 h-6" />
                     </div>
                     <span className="text-xs font-bold uppercase tracking-widest">Find Photos</span>
                  </div>
               </div>
            </div>
         </>
      ) : (
         <div className="text-center py-20 text-white/50">
            <p className="text-xl font-bold">Select or Add a Muse to begin</p>
         </div>
      )}

      {/* Add Profile Modal */}
      {showAddProfileModal && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-white/10 p-8 rounded-[2rem] max-w-sm w-full">
               <h3 className="text-xl font-bold text-white mb-4">Add New Muse</h3>
               <input 
                  className="w-full bg-white/5 p-4 rounded-xl text-white mb-3 border border-white/10 focus:border-pink-500 outline-none" 
                  placeholder="Name (e.g. Minju)"
                  value={newProfileName}
                  onChange={e => setNewProfileName(e.target.value)}
               />
               <input 
                  className="w-full bg-white/5 p-4 rounded-xl text-white mb-6 border border-white/10 focus:border-pink-500 outline-none" 
                  placeholder="Group (e.g. ILLIT)"
                  value={newProfileGroup}
                  onChange={e => setNewProfileGroup(e.target.value)}
               />
               <div className="flex gap-2">
                  <button onClick={handleAddProfile} className="flex-1 bg-pink-600 text-white font-bold py-3 rounded-xl">Create</button>
                  <button onClick={() => setShowAddProfileModal(false)} className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl">Cancel</button>
               </div>
            </div>
         </div>
      )}

      {/* Add Photo / Search Modal */}
      {showAddPhotoModal && activeMuse && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-white/10 p-8 rounded-[2rem] max-w-md w-full relative">
               <button onClick={() => setShowAddPhotoModal(false)} className="absolute right-4 top-4 text-white/40 hover:text-white"><XIcon className="w-6 h-6"/></button>
               <h3 className="text-xl font-bold text-white mb-2">Add Photo</h3>
               <p className="text-sm text-white/50 mb-6">Enter a direct image URL or use AI Search to find sources.</p>
               
               {/* Manual Input */}
               <div className="mb-6">
                  <label className="text-[10px] uppercase font-bold text-white/40 mb-2 block">Direct Image URL</label>
                  <div className="flex gap-2">
                     <input 
                        className="flex-1 bg-white/5 p-3 rounded-xl text-white border border-white/10 focus:border-pink-500 outline-none text-sm" 
                        placeholder="https://..."
                        value={newPhotoUrl}
                        onChange={e => setNewPhotoUrl(e.target.value)}
                     />
                     <button onClick={handleAddPhoto} className="bg-pink-600 px-4 rounded-xl font-bold text-white text-sm">Add</button>
                  </div>
               </div>

               {/* AI Search Section */}
               <div className="border-t border-white/10 pt-6">
                  <div className="flex justify-between items-center mb-4">
                     <h4 className="font-bold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-400"/> AI Auto-Collect Helper</h4>
                     <button 
                        onClick={handleAISearch} 
                        disabled={isSearching}
                        className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                     >
                        {isSearching ? <Loader2 className="w-3 h-3 animate-spin"/> : <Search className="w-3 h-3"/>} Scan Web
                     </button>
                  </div>

                  {/* Quick Links */}
                  <div className="flex gap-2 mb-4">
                     <button onClick={() => openSearchTab('pinterest')} className="flex-1 py-3 bg-[#E60023]/20 text-[#E60023] hover:bg-[#E60023]/30 border border-[#E60023]/40 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-[#E60023]"></div> Pinterest
                     </button>
                     <button onClick={() => openSearchTab('twitter')} className="flex-1 py-3 bg-[#1DA1F2]/20 text-[#1DA1F2] hover:bg-[#1DA1F2]/30 border border-[#1DA1F2]/40 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                        <Twitter className="w-4 h-4" /> Twitter (X)
                     </button>
                  </div>

                  {/* AI Results */}
                  {searchLinks.length > 0 && (
                     <div className="space-y-2 max-h-32 overflow-y-auto">
                        <p className="text-[10px] text-white/40 uppercase font-bold">Found Sources (Click to Open)</p>
                        {searchLinks.map((link, i) => (
                           <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-400 truncate hover:underline hover:text-blue-300 p-2 bg-white/5 rounded-lg border border-white/5">
                              {link.title} <ExternalLink className="w-3 h-3 inline ml-1"/>
                           </a>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};