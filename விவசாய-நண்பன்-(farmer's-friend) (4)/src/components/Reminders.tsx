import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  X, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Droplets, 
  Sprout, 
  Tractor, 
  ShieldAlert,
  Clock,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  Reminder, 
  subscribeToReminders, 
  updateReminderStatus, 
  deleteReminder,
  createReminder
} from '../services/reminderService';
import { Timestamp } from 'firebase/firestore';

interface RemindersProps {
  onClose: () => void;
}

const TASK_ICONS: Record<string, any> = {
  'watering': Droplets,
  'fertilizing': Droplets,
  'harvesting': Sprout,
  'pesticide': ShieldAlert,
  'default': Tractor
};

const TASK_LABELS: Record<string, string> = {
  'watering': 'நீர் பாய்ச்சுதல் (Watering)',
  'fertilizing': 'உரமிடுதல் (Fertilizing)',
  'harvesting': 'அறுவடை (Harvesting)',
  'pesticide': 'பூச்சிக்கொல்லி (Pesticide)',
  'other': 'இதர பணிகள் (Other)'
};

export default function Reminders({ onClose }: RemindersProps) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newReminder, setNewReminder] = useState({
    cropName: '',
    taskType: 'watering',
    taskDate: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToReminders(user.uid, (data) => {
        setReminders(data);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newReminder.cropName || !newReminder.taskDate) return;

    try {
      await createReminder(user.uid, {
        cropName: newReminder.cropName,
        taskType: newReminder.taskType,
        taskDate: Timestamp.fromDate(new Date(newReminder.taskDate)),
        status: 'pending',
        notes: newReminder.notes
      });
      setIsAdding(false);
      setNewReminder({ cropName: '', taskType: 'watering', taskDate: '', notes: '' });
      
      // Request notifications permission
      if (Notification.permission !== 'granted') {
          Notification.requestPermission();
      }
    } catch (error) {
      console.error("Error adding reminder", error);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    await updateReminderStatus(id, currentStatus === 'pending' ? 'completed' : 'pending');
  };

  const handleDelete = async (id: string) => {
    await deleteReminder(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-natural-green p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold tracking-tight">நினைவூட்டல்கள்</h2>
              <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Task Reminders</p>
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
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="w-full py-4 border-2 border-dashed border-natural-green/20 rounded-2xl flex items-center justify-center gap-2 text-natural-green font-bold hover:bg-natural-green/5 transition-all"
          >
            {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {isAdding ? 'ரத்து செய் (Cancel)' : 'புதிய நினைவூட்டல் (Add New)'}
          </button>

          <AnimatePresence>
            {isAdding && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAdd}
                className="overflow-hidden space-y-4 bg-natural-bg/30 p-6 rounded-3xl"
              >
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">பயிர் (Crop)</label>
                  <input
                    type="text"
                    required
                    value={newReminder.cropName}
                    onChange={(e) => setNewReminder({ ...newReminder, cropName: e.target.value })}
                    className="w-full bg-white border border-natural-olive/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-natural-green"
                    placeholder="உதாரணம்: நெல்"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">பணி (Task)</label>
                  <select
                    value={newReminder.taskType}
                    onChange={(e) => setNewReminder({ ...newReminder, taskType: e.target.value })}
                    className="w-full bg-white border border-natural-olive/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-natural-green"
                  >
                    {Object.entries(TASK_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">தேதி & நேரம் (Date & Time)</label>
                  <input
                    type="datetime-local"
                    required
                    value={newReminder.taskDate}
                    onChange={(e) => setNewReminder({ ...newReminder, taskDate: e.target.value })}
                    className="w-full bg-white border border-natural-olive/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-natural-green"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-natural-green text-white py-3 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all"
                >
                  சேமி (Save Reminder)
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {reminders.length === 0 ? (
              <div className="text-center py-12 text-gray-400 italic text-sm">
                இன்னும் நினைவூட்டல்கள் எதுவும் இல்லை.
              </div>
            ) : (
              reminders.map((rem) => {
                const Icon = TASK_ICONS[rem.taskType] || TASK_ICONS.default;
                const date = rem.taskDate.toDate();
                const isOverdue = date < new Date() && rem.status === 'pending';

                return (
                  <motion.div
                    key={rem.id}
                    layout
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 
                      ${rem.status === 'completed' ? 'bg-gray-50 border-gray-100 opacity-60' : 
                        isOverdue ? 'bg-red-50 border-red-100' : 'bg-white border-natural-olive/10 shadow-sm'}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <button 
                        onClick={() => toggleStatus(rem.id, rem.status)}
                        className={`p-1.5 rounded-full transition-colors ${rem.status === 'completed' ? 'text-natural-green' : 'text-gray-300 hover:text-natural-green'}`}
                      >
                        {rem.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-natural-green'}`} />
                          <h4 className={`font-bold text-sm ${rem.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {rem.cropName} - {TASK_LABELS[rem.taskType] || rem.taskType}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <p className={`text-[10px] font-bold ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                            {date.toLocaleDateString('ta-IN')} | {date.toLocaleTimeString('ta-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDelete(rem.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
