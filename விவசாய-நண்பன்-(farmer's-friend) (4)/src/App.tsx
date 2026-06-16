/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Search, Mic, MicOff, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MONTHS, CROP_DATA, type Crop } from './data/crops';
import { getTamilDate } from './data/calendar';
import TamilCalendarView from './components/TamilCalendarView';
import YieldCalculator from './components/YieldCalculator';
import MarketPrices from './components/MarketPrices';
import CropDetailModal from './components/CropDetailModal';
import Reminders from './components/Reminders';
import { analyzeCropDisease } from './lib/gemini';
import { type CropDetail } from './data/cropDetails';
import { subscribeToReminders } from './services/reminderService';
import ChatBot from './components/ChatBot';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Header from './components/Header';
import DiseaseAnalysis from './components/DiseaseAnalysis';
import CropTable from './components/CropTable';

export default function App() {
  const { user, loading, logout } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>("ஜனவரி");
  const [searchQuery, setSearchQuery] = useState<string>("ஜனவரி மாதம் - பரிந்துரை");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<Crop[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [showTamilCalendar, setShowTamilCalendar] = useState(false);
  const [showYieldCalculator, setShowYieldCalculator] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'market'>('recommendations');
  const [selectedDetailedCrop, setSelectedDetailedCrop] = useState<CropDetail | null>(null);
  const [showReminders, setShowReminders] = useState(false);
  const [remindersCount, setRemindersCount] = useState(0);
  const recognitionRef = useRef<any>(null);

  const tamilDateInfo = getTamilDate(new Date());

  const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

  useEffect(() => {
    if (user) {
      setShowLoginSuccess(true);
      const timer = setTimeout(() => setShowLoginSuccess(false), 3000);
      
      const unsubscribe = subscribeToReminders(user.uid, (data) => {
        const pendingCount = data.filter(r => r.status === 'pending').length;
        setRemindersCount(pendingCount);
      });

      return () => {
        clearTimeout(timer);
        unsubscribe();
      };
    }
  }, [user]);

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ta-IN'; // Tamil support

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        executeSearch(transcript);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  useEffect(() => {
    setSearchResults(CROP_DATA[selectedMonth] || []);
    setSearchQuery(`${selectedMonth} மாதம் - பரிந்துரை`);
  }, [selectedMonth]);

  const executeSearch = (queryText: string) => {
    const query = queryText.trim();
    if (!query) return;

    if (MONTHS.some(m => query.includes(m))) {
      const foundMonth = MONTHS.find(m => query.includes(m))!;
      setSelectedMonth(foundMonth);
      setSearchResults(CROP_DATA[foundMonth] || []);
    } else {
      const results: Crop[] = [];
      Object.values(CROP_DATA).forEach(monthCrops => {
        monthCrops.forEach(crop => {
          if (crop.பெயர்.includes(query) || crop.வகை.includes(query)) {
            if (!results.find(r => r.id === crop.id)) {
              results.push(crop);
            }
          }
        });
      });
      setSearchResults(results);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setPrediction(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      const result = await analyzeCropDisease(base64, file.type);
      setPrediction(result);
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-natural-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-natural-green/30 border-t-natural-green rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-natural-bg font-sans flex flex-col relative overflow-x-hidden">
      {/* Login Success Notification */}
      <AnimatePresence>
        {showLoginSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-white text-natural-green px-6 py-3 rounded-2xl shadow-xl border-b-4 border-natural-green flex items-center gap-3 font-bold"
          >
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              ✅
            </div>
            வெற்றிகரமாக புகுபதிவு செய்யப்பட்டது! (Login Successful)
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-dot-pattern"></div>

      {/* Header */}
      <Header 
        user={user}
        remindersCount={remindersCount}
        tamilDateInfo={tamilDateInfo}
        setShowTamilCalendar={setShowTamilCalendar}
        setShowYieldCalculator={setShowYieldCalculator}
        setShowReminders={setShowReminders}
        logout={logout}
      />

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10 max-w-7xl mx-auto w-full">
        {/* Left Column (4/12) */}
        <div className="md:col-span-4 flex flex-col gap-8">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-natural-olive/10">
            <h3 className="text-lg font-bold text-natural-green mb-4 flex items-center gap-2">
              🗓️ பயிரிட வேண்டிய மாதம்
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={cn(
                    "px-3 py-2.5 rounded-2xl text-xs font-bold transition-all border duration-200 cursor-pointer",
                    selectedMonth === m 
                      ? "bg-natural-green text-white border-natural-green shadow-md translate-y-[-1px]" 
                      : "bg-natural-bg text-natural-olive border-natural-olive/5 hover:border-natural-green/30"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Tamil Date Display below the grid */}
            <div className="mt-8 pt-6 border-t border-natural-olive/10">
              <div className="bg-natural-bg/40 p-5 rounded-[2rem] border border-natural-olive/5 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-natural-green/5 rounded-full blur-xl group-hover:bg-natural-green/10 transition-all"></div>
                <p className="text-[10px] font-bold text-natural-olive/50 uppercase tracking-[0.2em] mb-2 leading-none">இன்றைய தமிழ் தேதி</p>
                <div className="flex flex-col items-center">
                  <p className="text-xl font-black text-natural-green tracking-tight mb-1">{tamilDateInfo.name} வருடம்</p>
                  <div className="flex items-center gap-2">
                    <div className="bg-natural-green px-3 py-1 rounded-full shadow-sm">
                      <p className="text-xs font-bold text-white tracking-wide">{tamilDateInfo.month}</p>
                    </div>
                    <div className="w-1 h-1 bg-natural-olive/20 rounded-full"></div>
                    <p className="text-lg font-black text-gray-700">{tamilDateInfo.day}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowTamilCalendar(true)}
                  className="mt-4 text-[10px] font-bold text-natural-olive/60 hover:text-natural-green transition-colors uppercase tracking-widest flex items-center gap-1.5"
                >
                  முழு நாட்காட்டி <TrendingUp className="w-2.5 h-2.5 rotate-90" />
                </button>
              </div>
            </div>
          </section>

          <DiseaseAnalysis 
            isAnalyzing={isAnalyzing}
            prediction={prediction}
            handleImageUpload={handleImageUpload}
          />
        </div>

        {/* Right Column (8/12) */}
        <div className="md:col-span-8 flex flex-col gap-8">
          {/* Tabs Section */}
          <div className="flex gap-4 p-1 bg-white/50 backdrop-blur-md rounded-3xl border border-natural-olive/10 w-fit">
            <button 
              onClick={() => setActiveTab('recommendations')}
              className={cn(
                "px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer",
                activeTab === 'recommendations' ? "bg-natural-green text-white shadow-lg" : "text-natural-olive hover:bg-natural-bg"
              )}
            >
              பயிர் பரிந்துரை
            </button>
            <button 
              onClick={() => setActiveTab('market')}
              className={cn(
                "px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer",
                activeTab === 'market' ? "bg-natural-green text-white shadow-lg" : "text-natural-olive hover:bg-natural-bg"
              )}
            >
              சந்தை நிலவரம்
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'market' ? (
              <motion.div
                key="market-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <MarketPrices />
              </motion.div>
            ) : (
              <motion.div
                key="recommendations-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-grow flex flex-col gap-8"
              >
                {/* Search Header */}
                <section className="bg-white p-2 md:p-3 rounded-full shadow-sm flex items-center gap-4 border border-natural-olive/10 px-6 pr-2">
                  <span className="text-natural-green hidden sm:inline"><Search className="w-5 h-5" /></span>
                  <form onSubmit={handleSearch} className="flex-1 flex gap-2 items-center">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="பயிர் அல்லது மாதம் தேடுக..." 
                      className="bg-transparent flex-1 outline-none text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={toggleVoiceSearch}
                      className={cn(
                        "p-2 rounded-full transition-all cursor-pointer",
                        isListening ? "bg-red-100 text-red-500 animate-pulse" : "bg-natural-bg text-natural-green hover:bg-natural-green hover:text-white"
                      )}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button 
                      type="submit"
                      className="bg-natural-green text-white px-8 py-3 rounded-full text-sm font-bold shadow-md hover:bg-opacity-95 transition-all cursor-pointer"
                    >
                      தேடுக
                    </button>
                  </form>
                </section>

                <CropTable 
                  searchResults={searchResults}
                  selectedMonth={selectedMonth}
                  onSelectDetailedCrop={(det) => setSelectedDetailedCrop(det)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white/50 border-t border-natural-olive/10 px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-natural-olive uppercase tracking-widest">
        <p>© 2026 விவசாய நண்பன் - தொழில்நுட்பம் மூலம் விவசாயம்</p>
        <div className="flex gap-6">
          <span className="hover:text-natural-green cursor-pointer transition-colors">சந்தை நிலவரம்</span>
          <span className="hover:text-natural-green cursor-pointer transition-colors">அரசு மானியங்கள்</span>
          <span className="hover:text-natural-green cursor-pointer transition-colors">உரம் மேலாண்மை</span>
        </div>
      </footer>

      {/* Floating Chat Bot */}
      <ChatBot />

      <AnimatePresence>
        {selectedDetailedCrop && (
          <CropDetailModal 
            crop={selectedDetailedCrop} 
            onClose={() => setSelectedDetailedCrop(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTamilCalendar && (
          <TamilCalendarView onClose={() => setShowTamilCalendar(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showYieldCalculator && (
          <YieldCalculator onClose={() => setShowYieldCalculator(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReminders && (
          <Reminders onClose={() => setShowReminders(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
