import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { getTamilDate, TAMIL_FESTIVALS, TAMIL_MONTHS } from '../data/calendar';

interface TamilCalendarViewProps {
  onClose: () => void;
}

export default function TamilCalendarView({ onClose }: TamilCalendarViewProps) {
  const [viewDate, setViewDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const days = [];
  const totalDays = daysInMonth(currentYear, currentMonth);
  const startDay = firstDayOfMonth(currentYear, currentMonth);

  // Padding days
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-natural-green p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold tracking-tight">தமிழ் நாட்காட்டி</h2>
              <p className="text-xs opacity-80 uppercase tracking-widest leading-tight">Tamil Calendar & Festivals</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <button onClick={prevMonth} className="p-2 hover:bg-natural-bg rounded-xl transition-colors">
              <ChevronLeft className="w-6 h-6 text-natural-green" />
            </button>
            <div className="text-center">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">{monthName} {currentYear}</h3>
              <p className="text-sm font-bold text-natural-olive uppercase tracking-widest mt-1">
                {getTamilDate(viewDate).name} வருடம்
              </p>
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-natural-bg rounded-xl transition-colors">
              <ChevronRight className="w-6 h-6 text-natural-green" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              if (day === null) return <div key={idx} className="h-20" />;

              const date = new Date(currentYear, currentMonth, day);
              const tamil = getTamilDate(date);
              const today = new Date().toDateString() === date.toDateString();
              
              const festival = TAMIL_FESTIVALS.find(f => f.month === tamil.month && f.day === tamil.day);

              return (
                <div 
                  key={idx} 
                  className={`h-24 md:h-28 p-2 rounded-2xl border transition-all flex flex-col justify-between
                    ${today ? 'bg-natural-green/10 border-natural-green ring-1 ring-natural-green/50' : 'bg-white border-gray-100 hover:border-natural-green/20 hover:bg-natural-bg/50'}
                    ${festival ? 'ring-2 ring-orange-200 bg-orange-50/30' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-lg font-bold ${today ? 'text-natural-green' : 'text-gray-800'}`}>
                      {day}
                    </span>
                    <span className="text-[10px] font-bold text-natural-olive opacity-80 leading-tight text-right">
                      {tamil.day}<br/>{tamil.month}
                    </span>
                  </div>
                  
                  {festival && (
                    <div className="mt-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-tighter leading-tight truncate" title={festival.description}>
                      {festival.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-6 bg-natural-bg rounded-[2rem] border border-natural-olive/10">
            <h4 className="text-sm font-black text-natural-green uppercase tracking-widest mb-4">இந்த மாத விசேஷங்கள்</h4>
            <div className="space-y-4">
              {days.filter(d => d !== null).map(day => {
                const date = new Date(currentYear, currentMonth, day as number);
                const tamil = getTamilDate(date);
                return TAMIL_FESTIVALS.find(f => f.month === tamil.month && f.day === tamil.day);
              }).filter(Boolean).map((festival, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-bold text-natural-green shadow-sm border border-natural-olive/10 flex-shrink-0">
                    {festival?.day}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{festival?.name}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{festival?.month} மாதம்</p>
                    <p className="text-[10px] text-gray-400 mt-1 italic">{festival?.description}</p>
                  </div>
                </div>
              ))}
              {days.filter(d => d !== null).every(day => {
                const date = new Date(currentYear, currentMonth, day as number);
                const tamil = getTamilDate(date);
                return !TAMIL_FESTIVALS.find(f => f.month === tamil.month && f.day === tamil.day);
              }) && (
                <p className="text-sm text-gray-400 italic text-center py-4">விசேஷங்கள் எதுவும் இல்லை</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
