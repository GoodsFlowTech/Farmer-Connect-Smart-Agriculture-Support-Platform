import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DiseaseAnalysisProps {
  isAnalyzing: boolean;
  prediction: any;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DiseaseAnalysis({
  isAnalyzing,
  prediction,
  handleImageUpload
}: DiseaseAnalysisProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="bg-natural-olive text-natural-bg p-8 rounded-3xl shadow-md flex-1 flex flex-col">
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-3 flex items-center gap-3 outline-none">
          🔍 நோய் ஆய்வு
        </h3>
        <p className="text-sm opacity-80 leading-relaxed">
          உங்கள் பயிரில் நோய் அறிகுறிகள் உள்ளதா? புகைப்படம் பதிவேற்றி உடனே தீர்வு பெறுங்கள்.
        </p>
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isAnalyzing}
        className={`border-2 border-dashed border-natural-bg/40 rounded-2xl p-8 text-center hover:bg-white/5 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
          isAnalyzing ? "animate-pulse bg-white/10" : ""
        }`}
      >
        {isAnalyzing ? (
          <Loader2 className="w-10 h-10 animate-spin opacity-50" />
        ) : (
          <div className="text-center">
            <span className="text-4xl block mb-2">📸</span>
            <p className="text-xs font-medium uppercase tracking-widest">இங்கே பதிவேற்றவும்</p>
          </div>
        )}
      </button>

      <AnimatePresence>
        {prediction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 p-5 rounded-2xl mt-6 border border-white/10 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-orange-300" />
              <p className="text-[10px] uppercase tracking-wider opacity-60">கடைசி ஆய்வு முடிவு</p>
            </div>
            <p className="text-sm font-bold text-natural-cream mb-1">{prediction.நோய்}</p>
            <p className="text-xs opacity-70 line-clamp-2">{prediction.அறிகுறி}</p>
            <div className="mt-4 pt-3 border-t border-white/10">
               <p className="text-[10px] uppercase tracking-wider opacity-60 mb-2">தீர்வு முறை</p>
               <div className="prose prose-invert prose-sm text-xs opacity-80">
                  <ReactMarkdown>{prediction.தீர்வு_முறை}</ReactMarkdown>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
