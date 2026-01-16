import React, { useState } from 'react';
import { Heart, Music, Star, Instagram, Share2, Download, Sparkles } from 'lucide-react';

// Using the provided image and some placeholders that match the vibe
const GALLERY_IMAGES = [
  { id: 1, url: 'https://i.pinimg.com/originals/a0/0d/17/a00d1709403328221804f55331f7743d.jpg', title: 'Main Mood', span: 'col-span-2 row-span-2' },
  { id: 2, url: 'https://pbs.twimg.com/media/GIv_y8ibcAAtz3u.jpg', title: 'Selfie Mode', span: 'col-span-1 row-span-1' },
  { id: 3, url: 'https://i.pinimg.com/736x/2b/35/6b/2b356b73894452174304677732d84786.jpg', title: 'Stage Moment', span: 'col-span-1 row-span-2' },
  { id: 4, url: 'https://i.pinimg.com/736x/89/3e/32/893e3257008803734062168971f14d87.jpg', title: 'Casual Chic', span: 'col-span-1 row-span-1' },
  { id: 5, url: 'https://pbs.twimg.com/media/GH0_1hXbEAAr4qS?format=jpg&name=large', title: 'Dreamy', span: 'col-span-1 row-span-1' },
];

export const MokaGallery: React.FC = () => {
  const [likes, setLikes] = useState<Record<number, boolean>>({});

  const toggleLike = (id: number) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 animate-in fade-in duration-500">
      
      {/* 1. Profile Hero Section */}
      <div className="relative overflow-hidden bg-black/40 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 text-white shadow-2xl border border-white/10 group">
         {/* Background Glow */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="relative shrink-0">
               <div className="w-40 h-40 md:w-56 md:h-56 rounded-full p-1.5 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 shadow-2xl">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-black/50">
                    <img 
                      src="https://i.pinimg.com/originals/a0/0d/17/a00d1709403328221804f55331f7743d.jpg" 
                      alt="Moka Profile" 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
               </div>
               <div className="absolute bottom-2 right-2 bg-white text-black p-2.5 rounded-full shadow-lg border-2 border-pink-100">
                  <Sparkles className="w-5 h-5 text-pink-500 fill-pink-500 animate-pulse" />
               </div>
            </div>

            <div className="text-center md:text-left space-y-4 max-w-lg">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/20 border border-pink-500/30 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping"></span>
                  <span className="text-xs font-bold text-pink-300 uppercase tracking-widest">ILLIT Main Dancer</span>
               </div>
               <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg font-sans">
                  MOKA <span className="text-pink-400 text-3xl md:text-5xl font-thin opacity-70">모카</span>
               </h1>
               <p className="text-white/70 text-lg leading-relaxed font-medium">
                  "The coffee-like charm that wakes you up." <br/>
                  아일릿의 사랑스러운 모카와 함께하는 데일리 라이프.
               </p>
               
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                  <div className="px-5 py-2.5 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2 hover:bg-white/20 transition-colors cursor-pointer">
                     <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                     <span className="text-sm font-bold">2004. 10. 08</span>
                  </div>
                  <div className="px-5 py-2.5 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2 hover:bg-white/20 transition-colors cursor-pointer">
                     <Music className="w-4 h-4 text-indigo-400" />
                     <span className="text-sm font-bold">Hybe Label</span>
                  </div>
                  <button className="px-5 py-2.5 bg-pink-600 rounded-xl border border-pink-500 flex items-center gap-2 hover:bg-pink-500 transition-all shadow-lg shadow-pink-600/30 active:scale-95">
                     <Heart className="w-4 h-4 fill-white" />
                     <span className="text-sm font-bold">Cheer Up</span>
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* 2. Photo Grid (Masonry Vibe) */}
      <div>
         <div className="flex items-center justify-between mb-6 px-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
               <Instagram className="w-6 h-6 text-pink-400" /> Photo Gallery
            </h3>
            <span className="text-xs font-bold text-white/40 bg-white/5 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-white/5">
               Updated Today
            </span>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
            {GALLERY_IMAGES.map((img) => (
               <div key={img.id} className={`relative group rounded-[2rem] overflow-hidden shadow-lg cursor-pointer border border-white/10 ${img.span}`}>
                  <img 
                     src={img.url} 
                     alt={img.title}
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                     onError={(e) => {
                        // Fallback if image fails
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x800/1a1a1a/ffffff?text=Moka+Image';
                     }}
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                     <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white font-bold text-lg">{img.title}</p>
                        <div className="flex items-center gap-3 mt-2">
                           <button 
                              onClick={(e) => { e.stopPropagation(); toggleLike(img.id); }}
                              className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors"
                           >
                              <Heart className={`w-5 h-5 ${likes[img.id] ? 'fill-pink-500 text-pink-500' : 'text-white'}`} />
                           </button>
                           <button className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors">
                              <Download className="w-5 h-5 text-white" />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
            
            {/* "Add More" Placeholder */}
            <div className="col-span-1 row-span-1 border-2 border-dashed border-white/20 rounded-[2rem] flex flex-col items-center justify-center text-white/30 hover:text-white/60 hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer group">
               <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Share2 className="w-6 h-6" />
               </div>
               <span className="text-xs font-bold uppercase tracking-widest">Upload More</span>
            </div>
         </div>
      </div>
    </div>
  );
};