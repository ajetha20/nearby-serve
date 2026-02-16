
import React, { useState, useMemo } from 'react';
import { Recipient } from '../types';
import { RecipientCard } from '../components/RecipientCard';
import { RecipientsMap } from '../components/RecipientsMap';
import { Users, AlertTriangle, Loader2, MapPin, Activity, ChefHat, ArrowDown, Sparkles, HeartHandshake, BrainCircuit, Search, Image as ImageIcon, Newspaper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFoodRescuePlan, findNearbyShelters, getHungerNews, generateImpactImage } from '../services/geminiService';

interface DonorHomeProps {
  recipients: Recipient[];
  onDonate: (r: Recipient) => void;
  userLocation: { lat: number; lng: number };
  isLoadingLocation: boolean;
}

export const DonorHome: React.FC<DonorHomeProps> = ({ recipients, onDonate, userLocation, isLoadingLocation }) => {
  const [filter, setFilter] = useState('All');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);

  // AI Hub State
  const [activeAiTab, setActiveAiTab] = useState<'rescue' | 'shelters' | 'news' | 'vision'>('rescue');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiImage, setAiImage] = useState<string | null>(null);
  
  // Inputs
  const [ingredients, setIngredients] = useState('');
  const [imagePrompt, setImagePrompt] = useState('A warm community kitchen in India feeding happy children, warm lighting, detailed, photorealistic');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');

  // Indian context food categories
  const categories = ['All', 'Cooked Meal', 'Ration', 'Fruits', 'Essentials'];

  const filteredRecipients = useMemo(() => {
    if (filter === 'All') return recipients;
    return recipients.filter(r => 
      r.needs.some(n => {
         const lowerN = n.toLowerCase();
         if (filter === 'Cooked Meal') return lowerN.match(/roti|dal|rice|sabzi|curry|meal|lunch|dinner|thali/);
         if (filter === 'Ration') return lowerN.match(/atta|rice|oil|sugar|salt|bread|biscuit/);
         if (filter === 'Fruits') return lowerN.match(/fruit|banana|apple|orange/);
         if (filter === 'Essentials') return lowerN.match(/milk|water|chai|juice/);
         return false;
      })
    );
  }, [recipients, filter]);

  const handlePinSelect = (id: string) => {
    setSelectedRecipientId(id);
    const el = document.getElementById(`card-${id}`);
    if (el) {
       el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // AI Feature Handlers
  const handleRescuePlan = async () => {
    if (!ingredients) return;
    setAiLoading(true);
    setAiResult(null);
    const res = await getFoodRescuePlan(ingredients);
    setAiResult(res);
    setAiLoading(false);
  };

  const handleFindShelters = async () => {
    setAiLoading(true);
    setAiResult(null);
    const res = await findNearbyShelters(userLocation);
    setAiResult(res);
    setAiLoading(false);
  };

  const handleGetNews = async () => {
    setAiLoading(true);
    setAiResult(null);
    const res = await getHungerNews("New Delhi"); // Defaulting to Delhi for demo
    setAiResult(res);
    setAiLoading(false);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    setAiLoading(true);
    setAiImage(null);
    const res = await generateImpactImage(imagePrompt, imageSize);
    setAiImage(res);
    setAiLoading(false);
  };

  return (
    <div className="w-full">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-40 pb-32 px-4 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-200/40 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/4 animate-blob"></div>
           <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/4 animate-blob animation-delay-2000"></div>
           <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm hover:scale-105 transition-transform cursor-default">
              <Sparkles className="w-3.5 h-3.5" />
              <span>City-Wide Food Network</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[1.05] mb-8">
              Share Food.<br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 animate-gradient-x">Spread Hope.</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
              Thousands sleep hungry in your city tonight. We connect your surplus food directly with verified people in need. 
              <span className="block mt-2 text-slate-500 text-lg">Donate yourself or request a volunteer pickup instantly.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
               <button 
                  onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-lg shadow-2xl shadow-slate-900/30 hover:shadow-slate-900/40 hover:-translate-y-1 transition-all flex items-center gap-3 group"
               >
                 Find People Nearby 
                 <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
               </button>
               
               <div className="flex items-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-md rounded-full shadow-lg shadow-slate-200/50 border border-white/50 hover:bg-white transition-colors cursor-default">
                  <div className="flex -space-x-3">
                     {[1,2,3].map(i => (
                       <div key={i} className={`w-9 h-9 rounded-full border-2 border-white shadow-sm bg-slate-200 bg-[url('https://i.pravatar.cc/100?img=${i+10}')] bg-cover`}></div>
                     ))}
                  </div>
                  <div className="text-left">
                     <span className="block text-sm font-extrabold text-slate-900">1,200+ Donors</span>
                     <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Joined Today</span>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="py-24 bg-white/50 border-y border-slate-200/60 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { icon: MapPin, title: "Locate", desc: "View real-time, verified locations where food is needed most.", color: "text-blue-500", bg: "bg-blue-50" },
                { icon: ChefHat, title: "Cook & Pack", desc: "Prepare fresh meals or buy essentials. Ensure hygiene.", color: "text-orange-500", bg: "bg-orange-50" },
                { icon: HeartHandshake, title: "Deliver Love", desc: "Visit yourself to connect, or request a verified volunteer.", color: "text-rose-500", bg: "bg-rose-50" }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className={`w-20 h-20 ${item.bg} ${item.color} rounded-3xl rotate-3 group-hover:rotate-6 transition-transform duration-300 flex items-center justify-center mb-6 shadow-sm`}>
                    <item.icon className="w-9 h-9" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed max-w-xs">{item.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* 3. MAP SECTION */}
      <section id="map-section" className="bg-slate-900 py-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
               <div className="text-white">
                  <div className="flex items-center gap-3 mb-3">
                     <span className="relative flex h-3 w-3">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                     </span>
                     <span className="text-green-400 font-bold tracking-widest text-xs uppercase">Live Feed</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black mb-4">Real-Time Hunger Radar</h2>
                  <p className="text-slate-400 text-lg max-w-lg">Crowdsourced data pinpointing where help is needed right now.</p>
               </div>
               
               {isLoadingLocation && (
                 <div className="bg-slate-800/80 backdrop-blur border border-slate-700 text-orange-400 px-5 py-3 rounded-full text-sm font-bold flex items-center shadow-lg">
                   <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                   Triangulating GPS...
                 </div>
               )}
            </div>

            <div className="h-[550px] w-full bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-700/50 relative group">
               <AnimatePresence>
                 {isLoadingLocation && (
                    <motion.div 
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900"
                    >
                      <div className="relative">
                         <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                         <Loader2 className="w-12 h-12 text-orange-500 animate-spin relative z-10" />
                      </div>
                      <h3 className="text-white font-bold text-xl mt-6">Locating You</h3>
                    </motion.div>
                 )}
               </AnimatePresence>

               <RecipientsMap 
                  recipients={filteredRecipients} 
                  centerLat={userLocation.lat} 
                  centerLng={userLocation.lng}
                  selectedId={selectedRecipientId}
                  onSelect={handlePinSelect}
               />
               
               <div className="absolute bottom-6 left-6 z-[1000] bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl text-white shadow-xl max-w-[220px]">
                  <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-3 border-b border-slate-700 pb-2">Map Key</div>
                  <div className="space-y-2.5 text-xs font-medium">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></div>
                        <span>You are Here</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_orange]"></div>
                        <span>Verified Need</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 4. CARDS SECTION */}
      <section className="py-24 bg-surface relative">
         <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Make an Impact</h2>
                <p className="text-slate-500 text-lg">Select a card to view details or donate.</p>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-4 pt-1 hide-scrollbar max-w-full px-1">
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setFilter(c);
                      setSelectedRecipientId(null);
                    }}
                    className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all border shadow-sm hover:shadow-md ${
                      filter === c 
                      ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-offset-2 ring-slate-900' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            
            <motion.div 
               layout
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20"
            >
              <AnimatePresence>
                {filteredRecipients.length > 0 ? (
                  filteredRecipients.map((r, i) => (
                    <motion.div
                      id={`card-${r.id}`}
                      key={r.id}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        scale: selectedRecipientId === r.id ? 1.02 : 1,
                        y: 0
                      }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      layout
                      className={`relative rounded-[2rem] transition-all duration-500 ${selectedRecipientId === r.id ? 'ring-4 ring-orange-500/30 shadow-2xl z-10 -translate-y-2' : 'hover:-translate-y-2'}`}
                      onClick={() => handlePinSelect(r.id)}
                    >
                      <RecipientCard recipient={r} onDonate={onDonate} />
                    </motion.div>
                  ))
                ) : (
                   <div className="col-span-full py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                      <div className="inline-block p-6 rounded-full bg-slate-50 mb-4">
                        <Users className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">No results found</h3>
                      <p className="text-slate-500 mt-1">Try changing the filter categories.</p>
                   </div>
                )}
              </AnimatePresence>
            </motion.div>
         </div>
      </section>

      {/* 5. COMMUNITY AI HUB (New Features) */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
           <div className="text-center mb-12">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
               <BrainCircuit className="w-4 h-4" />
               <span>Powered by Gemini</span>
             </div>
             <h2 className="text-4xl md:text-5xl font-black mb-4">Community AI Hub</h2>
             <p className="text-slate-400 text-lg max-w-2xl mx-auto">
               Advanced tools to help you donate smarter, find vetted centers, and visualize your impact.
             </p>
           </div>

           <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
             {/* Tabs */}
             <div className="flex flex-wrap justify-center gap-3 mb-10">
               {[
                 { id: 'rescue', label: 'Smart Rescue Guide', icon: ChefHat },
                 { id: 'shelters', label: 'Verified Centers', icon: MapPin },
                 { id: 'news', label: 'Hunger News', icon: Newspaper },
                 { id: 'vision', label: 'Impact Visualizer', icon: ImageIcon },
               ].map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => { setActiveAiTab(tab.id as any); setAiResult(null); setAiImage(null); }}
                   className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                     activeAiTab === tab.id 
                     ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 scale-105' 
                     : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                   }`}
                 >
                   <tab.icon className="w-4 h-4" /> {tab.label}
                 </button>
               ))}
             </div>

             {/* Content Area */}
             <div className="min-h-[300px] flex flex-col items-center">
                
                {/* 1. SMART RESCUE (Thinking Mode) */}
                {activeAiTab === 'rescue' && (
                  <div className="w-full max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-2xl font-bold mb-2">Leftover Food Safety & Rescue</h3>
                    <p className="text-slate-400 mb-6">Not sure if your leftover ingredients are safe to donate? Our Thinking AI analyzes safety risks and suggests dignity-first packaging.</p>
                    <textarea 
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      placeholder="e.g. I have 2kg of rice cooked yesterday morning, kept in the fridge. Also some stale bread."
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-white placeholder:text-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none h-32 mb-4"
                    />
                    <button 
                      onClick={handleRescuePlan}
                      disabled={aiLoading}
                      className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-orange-500 hover:text-white transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                      {aiLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <BrainCircuit className="w-4 h-4"/>}
                      {aiLoading ? 'Thinking Deeply...' : 'Analyze Safety'}
                    </button>
                    {aiResult && (
                      <div className="mt-8 bg-slate-900 rounded-2xl p-6 text-left border border-slate-700 leading-relaxed whitespace-pre-wrap">
                        {aiResult}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. VERIFIED CENTERS (Maps Grounding) */}
                {activeAiTab === 'shelters' && (
                  <div className="w-full max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-2xl font-bold mb-2">Find Official Centers</h3>
                    <p className="text-slate-400 mb-6">Locate verified top-rated homeless shelters and soup kitchens near your current location using Google Maps data.</p>
                    <button 
                      onClick={handleFindShelters}
                      disabled={aiLoading}
                      className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                      {aiLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <MapPin className="w-4 h-4"/>}
                      Search Nearby Shelters
                    </button>
                    {aiResult && (
                      <div className="mt-8 bg-slate-900 rounded-2xl p-6 text-left border border-slate-700 leading-relaxed whitespace-pre-wrap">
                        {aiResult}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. NEWS (Search Grounding) */}
                {activeAiTab === 'news' && (
                   <div className="w-full max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4">
                     <h3 className="text-2xl font-bold mb-2">Local Hunger Updates</h3>
                     <p className="text-slate-400 mb-6">Get the latest verified news and NGO initiatives happening in your city.</p>
                     <button 
                       onClick={handleGetNews}
                       disabled={aiLoading}
                       className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                     >
                       {aiLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <Search className="w-4 h-4"/>}
                       Fetch Latest Updates
                     </button>
                     {aiResult && (
                       <div className="mt-8 bg-slate-900 rounded-2xl p-6 text-left border border-slate-700 leading-relaxed whitespace-pre-wrap">
                         {aiResult}
                       </div>
                     )}
                   </div>
                )}

                {/* 4. VISUALIZER (Image Gen) */}
                {activeAiTab === 'vision' && (
                  <div className="w-full max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-2xl font-bold mb-2">Impact Visualizer</h3>
                    <p className="text-slate-400 mb-6">Generate a vision of what your donation could create. Inspire your community.</p>
                    <div className="flex gap-4 mb-4">
                      <input 
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        className="flex-1 bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-white placeholder:text-slate-600 focus:border-pink-500 outline-none"
                      />
                      <select 
                         value={imageSize}
                         onChange={(e) => setImageSize(e.target.value as any)}
                         className="bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-white outline-none"
                      >
                        <option value="1K">1K Res</option>
                        <option value="2K">2K Res</option>
                        <option value="4K">4K Res</option>
                      </select>
                    </div>
                    <button 
                      onClick={handleGenerateImage}
                      disabled={aiLoading}
                      className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-pink-500 hover:text-white transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                      {aiLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <ImageIcon className="w-4 h-4"/>}
                      Generate Vision
                    </button>
                    {aiImage && (
                      <div className="mt-8 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                        <img src={aiImage} alt="Generated impact" className="w-full h-auto" />
                      </div>
                    )}
                  </div>
                )}

             </div>
           </div>
        </div>
      </section>

    </div>
  );
};