import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IndianRupee, MapPin, TrendingUp, TrendingDown, Minus, Calendar, ShoppingBag, X, LineChart, Info } from 'lucide-react';
import { MARKET_DATA, MarketPrice } from '../data/marketPrices';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MarketPrices() {
  const [selectedRegion, setSelectedRegion] = useState(MARKET_DATA[0]);
  const [selectedItemHistory, setSelectedItemHistory] = useState<MarketPrice | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-natural-olive/10 flex flex-col h-full relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-natural-green flex items-center gap-3">
            <IndianRupee className="w-7 h-7" />
            சந்தை நிலவரம்
          </h3>
          <p className="text-sm text-natural-olive/60 font-medium uppercase tracking-widest mt-1">Real-time Market Prices</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {MARKET_DATA.map((region) => (
            <button
              key={region.region}
              onClick={() => setSelectedRegion(region)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0",
                selectedRegion.region === region.region
                  ? "bg-natural-green text-white border-natural-green shadow-lg"
                  : "bg-natural-bg text-natural-olive border-natural-olive/5 hover:border-natural-green/30"
              )}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                {region.region.split(' (')[0]}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRegion.region}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 gap-4"
          >
            {selectedRegion.prices.map((item) => (
              <PriceCard 
                key={item.id} 
                item={item} 
                onViewHistory={() => setSelectedItemHistory(item)} 
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <Calendar className="w-3 h-3" />
          கடைசியாக புதுப்பிக்கப்பட்டது: {currentTime.toLocaleDateString('ta-IN')} | {currentTime.toLocaleTimeString('ta-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <button className="text-natural-green text-xs font-bold flex items-center gap-1 hover:underline">
          அனைத்து விவரங்கள் <ShoppingBag className="w-3 h-3" />
        </button>
      </div>

      <AnimatePresence>
        {selectedItemHistory && (
          <HistoryModal 
            item={selectedItemHistory} 
            onClose={() => setSelectedItemHistory(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function PriceCard({ item, onViewHistory }: { item: MarketPrice, onViewHistory: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-natural-bg/30 border border-natural-olive/5 p-4 rounded-3xl flex items-center justify-between group transition-colors hover:bg-white hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-natural-olive/5">
          <span className="text-xl">
            {item.commodity.includes("மஞ்சள்") && "🟡"}
            {item.commodity.includes("நெல்") && "🌾"}
            {item.commodity.includes("தேங்காய்") && "🥥"}
            {item.commodity.includes("மல்லிகை") && "🌸"}
            {item.commodity.includes("தக்காளி") && "🍅"}
            {item.commodity.includes("வெங்காயம்") && "🧅"}
            {item.commodity.includes("வாழை") && "🍌"}
            {item.commodity.includes("மாம்பழம்") && "🥭"}
            {item.commodity.includes("மரவள்ளி") && "🍠"}
            {item.commodity.includes("காபி") && "☕"}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-800 text-sm sm:text-base leading-tight">{item.commodity}</h4>
            <button 
              onClick={onViewHistory}
              className="p-1 rounded-full text-gray-300 hover:text-natural-green hover:bg-natural-green/10 transition-all opacity-0 group-hover:opacity-100"
              title="வரலாற்றுத் தரவு"
            >
              <LineChart className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-tighter mt-1">
            மார்க்கெட்: <span className="text-natural-olive">{item.market}</span>
          </p>
        </div>
      </div>

      <div className="text-right flex flex-col items-end gap-1">
        <div className="flex items-baseline gap-1">
          <span className="text-lg sm:text-xl font-black text-natural-green">₹{item.modalPrice.toLocaleString('ta-IN')}</span>
          <span className="text-[10px] font-bold text-gray-400">/ {item.unit}</span>
        </div>
        
        <div className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer hover:scale-105 transition-transform",
          item.change > 0 ? "bg-green-100 text-green-700" : 
          item.change < 0 ? "bg-red-100 text-red-700" : 
          "bg-gray-100 text-gray-700"
        )} onClick={onViewHistory}>
          {item.change > 0 ? <TrendingUp className="w-3 h-3" /> : 
           item.change < 0 ? <TrendingDown className="w-3 h-3" /> : 
           <Minus className="w-3 h-3" />}
          {Math.abs(item.change)}%
        </div>
      </div>
    </motion.div>
  );
}

function HistoryModal({ item, onClose }: { item: MarketPrice, onClose: () => void }) {
  const chartData = item.history || [
    { date: "முந்தைய", price: item.modalPrice / (1 + item.change/100) },
    { date: "இன்று", price: item.modalPrice }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-natural-green/10 rounded-2xl flex items-center justify-center">
              <LineChart className="w-6 h-6 text-natural-green" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{item.commodity} - விலை மாற்றங்கள்</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{item.market} | {item.unit}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-natural-bg/30 p-4 rounded-3xl border border-natural-olive/5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">குறைந்தபட்சம்</p>
              <p className="text-lg font-black text-gray-700">₹{item.minPrice.toLocaleString('ta-IN')}</p>
            </div>
            <div className="bg-natural-green/10 p-4 rounded-3xl border border-natural-green/20">
              <p className="text-[10px] font-bold text-natural-green uppercase tracking-widest mb-1">மதிப்பு</p>
              <p className="text-lg font-black text-natural-green">₹{item.modalPrice.toLocaleString('ta-IN')}</p>
            </div>
            <div className="bg-natural-bg/30 p-4 rounded-3xl border border-natural-olive/5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">அதிகபட்சம்</p>
              <p className="text-lg font-black text-gray-700">₹{item.maxPrice.toLocaleString('ta-IN')}</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d5a27" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2d5a27" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                />
                <YAxis 
                  hide 
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 800, color: '#2d5a27' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#2d5a27" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <Info className="w-5 h-5 text-blue-600" />
            <p className="text-xs text-blue-800 font-medium">
              கடந்த 7 நாட்களில் இந்த விளைபொருளின் விலை {item.change > 0 ? 'அதிகரித்துள்ளது' : 'குறைந்துள்ளது'}. சந்தை வருகை மற்றும் தேவையைப் பொறுத்து விலைகள் மாறக்கூடும்.
            </p>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-natural-green text-white rounded-full font-bold text-sm shadow-lg hover:opacity-95"
          >
            சரி
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
