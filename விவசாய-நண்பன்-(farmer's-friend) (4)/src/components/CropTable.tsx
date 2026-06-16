import { motion, AnimatePresence } from 'motion/react';
import { type Crop } from '../data/crops';
import { CROP_DETAILS } from '../data/cropDetails';

interface CropTableProps {
  searchResults: Crop[];
  selectedMonth: string;
  onSelectDetailedCrop: (detail: any) => void;
}

export default function CropTable({
  searchResults,
  selectedMonth,
  onSelectDetailedCrop
}: CropTableProps) {
  // Helper to merge classes
  const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

  return (
    <section className="bg-white rounded-[2rem] shadow-sm border border-natural-olive/10 flex-grow flex flex-col overflow-hidden">
      <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-bold text-natural-green text-xl">✅ {selectedMonth} மாதத்திற்கான பயிர் பரிந்துரை</h3>
        <span className="px-4 py-1.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-tighter border border-green-100">
          ஏற்ற பருவம்
        </span>
      </div>
      
      <div className="flex-grow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#fcfbf9] text-natural-olive text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-8 py-5">பெயர்</th>
              <th className="px-8 py-5">வகை</th>
              <th className="px-8 py-5 text-center">நீர் அளவு</th>
              <th className="px-8 py-5">மண் வகை</th>
              <th className="px-8 py-5">முதலீடு / லாபம்</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <AnimatePresence mode="popLayout">
              {searchResults.length > 0 ? (
                searchResults.map((crop, idx) => (
                  <motion.tr
                    key={crop.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-green-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => {
                          const detail = CROP_DETAILS[crop.பெயர்] || CROP_DETAILS[crop.பெயர்.split(' ')[0]];
                          if (detail) {
                            onSelectDetailedCrop(detail);
                          } else {
                            alert("தகவல் விரைவில் வரும்...");
                          }
                        }}
                        className="font-bold text-gray-800 group-hover:text-natural-green transition-colors text-left"
                      >
                        {crop.பெயர்}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500">{crop.வகை}</td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center gap-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-2.5 h-2.5 rounded-full",
                              i < (crop.நீர் === 'அதிகம்' ? 4 : crop.நீர் === 'மிதமான' ? 3 : 2) 
                                ? "bg-blue-400" 
                                : "bg-gray-200"
                            )}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-medium text-natural-olive italic">{crop.மண்}</td>
                    <td className="px-8 py-6">
                      <p className="text-[10px] font-medium text-gray-400 mb-0.5">{crop.முதலீடு}</p>
                      <p className="text-sm font-bold text-green-600">{crop.லாபம்}</p>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-gray-400 italic">
                    தேடப்பட்ட தகவல்கள் எதுவும் இல்லை.
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Bottom Warning Alert */}
      <div className="mt-auto p-6 bg-orange-50 border-t border-orange-100 flex items-center gap-5">
        <span className="text-3xl filter drop-shadow-sm" aria-hidden="true">⚠️</span>
        <div className="text-xs text-orange-900">
          <p className="font-bold uppercase tracking-tight mb-1">வானிலை எச்சரிக்கை</p>
          <p className="opacity-80">அடுத்த 48 மணி நேரத்தில் உங்கள் பகுதியில் மிதமான மழைக்கு வாய்ப்பு உள்ளது. அறுவடை செய்த பயிர்களைப் பாதுகாக்கவும்.</p>
        </div>
      </div>
    </section>
  );
}
