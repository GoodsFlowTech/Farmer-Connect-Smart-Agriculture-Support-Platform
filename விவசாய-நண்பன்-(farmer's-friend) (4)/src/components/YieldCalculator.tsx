import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, X, Wheat, CloudSun, Sprout, TrendingUp, Info } from 'lucide-react';

interface YieldCalculatorProps {
  onClose: () => void;
}

const CROP_BASE_YIELD: Record<string, { yield: number; unit: string; label: string }> = {
  "நெல் (Paddy)": { yield: 2400, unit: "கி.கி (kg)", label: "நெல்" },
  "கரும்பு (Sugarcane)": { yield: 40000, unit: "கி.கி (kg)", label: "கரும்பு" },
  "மக்காச்சோளம் (Maize)": { yield: 3000, unit: "கி.கி (kg)", label: "மக்காச்சோளம்" },
  "மஞ்சள் (Turmeric)": { yield: 2000, unit: "கி.கி (kg)", label: "மஞ்சள்" },
  "வாழை (Banana)": { yield: 15000, unit: "கி.கி (kg)", label: "வாழை" }
};

export default function YieldCalculator({ onClose }: YieldCalculatorProps) {
  const [crop, setCrop] = useState("நெல் (Paddy)");
  const [area, setArea] = useState<number>(1);
  const [seedType, setSeedType] = useState("hybrid");
  const [weather, setWeather] = useState("normal");
  const [result, setResult] = useState<number | null>(null);

  const calculateYield = () => {
    const base = CROP_BASE_YIELD[crop].yield;
    let multiplier = 1.0;

    // Seed Factor
    if (seedType === "hybrid") multiplier *= 1.25;
    if (seedType === "local") multiplier *= 1.0;

    // Weather Factor
    if (weather === "good") multiplier *= 1.15;
    if (weather === "normal") multiplier *= 1.0;
    if (weather === "bad") multiplier *= 0.7;

    const total = base * area * multiplier;
    setResult(total);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* Header */}
        <div className="bg-natural-green p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold tracking-tight">மகசூல் கணக்கீடு</h2>
              <p className="text-xs opacity-80 uppercase tracking-widest leading-tight">Crop Yield Estimator</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Instructions */}
          <div className="bg-natural-bg p-4 rounded-2xl border border-natural-olive/10 flex gap-3">
            <Info className="w-5 h-5 text-natural-green shrink-0 mt-0.5" />
            <p className="text-xs text-natural-olive leading-relaxed">
              உங்கள் நிலத்தின் அளவு மற்றும் இதர விவரங்களை உள்ளிட்டு, எதிர்பார்க்கப்படும் தோராயமான மகசூலைத் தெரிந்து கொள்ளுங்கள்.
            </p>
          </div>

          <div className="space-y-4">
            {/* Crop Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                பயிர் வகை (Crop Type)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.keys(CROP_BASE_YIELD).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCrop(c)}
                    className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all border
                      ${crop === c 
                        ? 'bg-natural-green text-white border-natural-green shadow-md' 
                        : 'bg-white text-gray-600 border-gray-100 hover:border-natural-green/30'}`}
                  >
                    {c.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Area Input */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                நிலத்தின் அளவு (எக்கர் - Acres)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="w-full bg-natural-bg border-none rounded-2xl px-5 py-4 text-lg font-bold outline-none focus:ring-2 focus:ring-natural-green"
                  placeholder="எக்டேர் அளவில்..."
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-natural-olive opacity-50">ACRES</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seed Type */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  விதை வகை (Seed Type)
                </label>
                <div className="flex bg-natural-bg rounded-2xl p-1">
                  <button
                    onClick={() => setSeedType('hybrid')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all
                      ${seedType === 'hybrid' ? 'bg-white text-natural-green shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    வீரிய ரகம் (Hybrid)
                  </button>
                  <button
                    onClick={() => setSeedType('local')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all
                      ${seedType === 'local' ? 'bg-white text-natural-green shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    நாட்டு ரகம் (Local)
                  </button>
                </div>
              </div>

              {/* Weather */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  வானிலை (Weather)
                </label>
                <div className="flex bg-natural-bg rounded-2xl p-1">
                  <button
                    onClick={() => setWeather('good')}
                    className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold transition-all
                      ${weather === 'good' ? 'bg-white text-natural-green shadow-sm' : 'text-gray-400'}`}
                  >
                    சிறப்பானது
                  </button>
                  <button
                    onClick={() => setWeather('normal')}
                    className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold transition-all
                      ${weather === 'normal' ? 'bg-white text-natural-green shadow-sm' : 'text-gray-400'}`}
                  >
                    சாதாரண
                  </button>
                  <button
                    onClick={() => setWeather('bad')}
                    className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold transition-all
                      ${weather === 'bad' ? 'bg-white text-natural-green shadow-sm' : 'text-gray-400'}`}
                  >
                    மோசமான
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={calculateYield}
            className="w-full bg-natural-green text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl shadow-natural-green/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <TrendingUp className="w-6 h-6" />
            மகசூலை கணக்கிடு
          </button>

          <AnimatePresence>
            {result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-natural-green/5 border-2 border-natural-green/20 rounded-[2.5rem] text-center"
              >
                <p className="text-xs font-bold text-natural-olive uppercase tracking-[0.2em] mb-2">தோராயமான மகசூல்</p>
                <div className="text-4xl font-black text-natural-green flex items-baseline justify-center gap-2">
                  {result.toLocaleString('ta-IN')} 
                  <span className="text-lg font-bold">{CROP_BASE_YIELD[crop].unit}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-natural-green/10 grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">பயிர்</p>
                    <p className="text-xs font-bold text-gray-700">{crop.split(' (')[0]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">பரப்பளவு</p>
                    <p className="text-xs font-bold text-gray-700">{area} எக்கர்</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
