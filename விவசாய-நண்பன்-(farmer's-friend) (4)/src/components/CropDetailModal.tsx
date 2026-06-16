import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sprout, ShieldAlert, Tractor, Droplets, BellPlus, CheckCircle } from 'lucide-react';
import { CropDetail } from '../data/cropDetails';
import { useAuth } from '../context/AuthContext';
import { createReminder } from '../services/reminderService';
import { Timestamp } from 'firebase/firestore';

interface CropDetailModalProps {
  crop: CropDetail;
  onClose: () => void;
}

export default function CropDetailModal({ crop, onClose }: CropDetailModalProps) {
  const { user } = useAuth();
  const [successTask, setSuccessTask] = useState<string | null>(null);

  const handleQuickReminder = async (taskType: string) => {
    if (!user) return;
    
    // Set for tomorrow at 8 AM by default for quick demo
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    try {
      await createReminder(user.uid, {
        cropName: crop.name.split(' (')[0],
        taskType,
        taskDate: Timestamp.fromDate(tomorrow),
        status: 'pending',
        notes: `தானாக உருவாக்கப்பட்ட நினைவூட்டல் (${crop.name})`
      });
      setSuccessTask(taskType);
      setTimeout(() => setSuccessTask(null), 3000);
      
      if (Notification.permission !== 'granted') {
          Notification.requestPermission();
      }
    } catch (error) {
      console.error("Error creating quick reminder", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-natural-green p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">{crop.name}</h2>
              <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">பயிர் தொழில்நுட்ப விபரங்கள்</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Planting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-natural-green font-bold text-lg">
                <Tractor className="w-5 h-5" /> நடவு முறைகள் (Planting)
              </h3>
              <button 
                onClick={() => handleQuickReminder('watering')}
                className="flex items-center gap-1.5 text-[10px] font-bold text-natural-green border border-natural-green/20 px-3 py-1.5 rounded-full hover:bg-natural-green hover:text-white transition-all"
              >
                {successTask === 'watering' ? <CheckCircle className="w-3 h-3" /> : <BellPlus className="w-3 h-3" />}
                {successTask === 'watering' ? 'சேமிக்கப்பட்டது' : 'நினைவூட்டு'}
              </button>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed bg-natural-bg/30 p-4 rounded-2xl">
              {crop.planting}
            </p>
          </div>

          {/* Fertilizer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-natural-green font-bold text-lg">
                <Droplets className="w-5 h-5" /> உர மேலாண்மை (Fertilizer)
              </h3>
              <button 
                onClick={() => handleQuickReminder('fertilizing')}
                className="flex items-center gap-1.5 text-[10px] font-bold text-natural-green border border-natural-green/20 px-3 py-1.5 rounded-full hover:bg-natural-green hover:text-white transition-all"
              >
                {successTask === 'fertilizing' ? <CheckCircle className="w-3 h-3" /> : <BellPlus className="w-3 h-3" />}
                {successTask === 'fertilizing' ? 'சேமிக்கப்பட்டது' : 'நினைவூட்டு'}
              </button>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed bg-natural-bg/30 p-4 rounded-2xl">
              {crop.fertilizer}
            </p>
          </div>

          {/* Pest Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-red-600 font-bold text-lg">
                <ShieldAlert className="w-5 h-5" /> பூச்சி மேலாண்மை (Pest Management)
              </h3>
              <button 
                onClick={() => handleQuickReminder('pesticide')}
                className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 border border-red-100 px-3 py-1.5 rounded-full hover:bg-red-600 hover:text-white transition-all"
              >
                {successTask === 'pesticide' ? <CheckCircle className="w-3 h-3" /> : <BellPlus className="w-3 h-3" />}
                {successTask === 'pesticide' ? 'சேமிக்கப்பட்டது' : 'நினைவூட்டு'}
              </button>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed bg-red-50/50 p-4 rounded-2xl border border-red-100">
              {crop.pestManagement}
            </p>
          </div>

          {/* Harvesting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-orange-600 font-bold text-lg">
                <Sprout className="w-5 h-5" /> அறுவடை (Harvesting)
              </h3>
              <button 
                onClick={() => handleQuickReminder('harvesting')}
                className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 border border-orange-100 px-3 py-1.5 rounded-full hover:bg-orange-600 hover:text-white transition-all"
              >
                {successTask === 'harvesting' ? <CheckCircle className="w-3 h-3" /> : <BellPlus className="w-3 h-3" />}
                {successTask === 'harvesting' ? 'சேமிக்கப்பட்டது' : 'நினைவூட்டு'}
              </button>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
              {crop.harvesting}
            </p>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-natural-green text-white rounded-full font-bold text-sm shadow-lg hover:shadow-natural-green/20 transition-all"
          >
            சரி (Close)
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
