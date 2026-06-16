import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Reminder {
  id: string;
  userId: string;
  cropName: string;
  taskType: string;
  taskDate: Timestamp;
  status: 'pending' | 'completed';
  notes?: string;
  createdAt: any;
}

// Guest Mode Local Storage Support
const GUEST_STORAGE_KEY = 'fn_guest_reminders';

const getLocalReminders = (): Reminder[] => {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((item: any) => ({
      ...item,
      taskDate: item.taskDate ? new Timestamp(item.taskDate.seconds, item.taskDate.nanoseconds) : Timestamp.now(),
      createdAt: item.createdAt ? new Timestamp(item.createdAt.seconds, item.createdAt.nanoseconds) : Timestamp.now()
    }));
  } catch (e) {
    console.error('Error parsing local reminders:', e);
    return [];
  }
};

const saveLocalReminders = (reminders: Reminder[]) => {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(reminders));
};

const triggerStorageUpdate = () => {
  window.dispatchEvent(new Event('fn_reminders_updated'));
};

export const createReminder = async (userId: string, reminder: Omit<Reminder, 'id' | 'userId' | 'createdAt'>) => {
  if (userId.startsWith('guest_')) {
    const local = getLocalReminders();
    const newRem: Reminder = {
      ...reminder,
      id: 'local_rem_' + Math.random().toString(36).substring(2, 10),
      userId,
      createdAt: Timestamp.now()
    };
    local.push(newRem);
    // Sort logic to match firestore's orderBy('taskDate', 'asc')
    local.sort((a, b) => {
      const timeA = a.taskDate.toMillis ? a.taskDate.toMillis() : 0;
      const timeB = b.taskDate.toMillis ? b.taskDate.toMillis() : 0;
      return timeA - timeB;
    });
    saveLocalReminders(local);
    triggerStorageUpdate();
    return newRem;
  }

  return addDoc(collection(db, 'reminders'), {
    ...reminder,
    userId,
    createdAt: serverTimestamp()
  });
};

export const subscribeToReminders = (userId: string, callback: (reminders: Reminder[]) => void) => {
  if (userId.startsWith('guest_')) {
    const handleUpdate = () => {
      callback(getLocalReminders());
    };
    // Initial fetch
    callback(getLocalReminders());
    window.addEventListener('fn_reminders_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('fn_reminders_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }

  const q = query(
    collection(db, 'reminders'), 
    where('userId', '==', userId),
    orderBy('taskDate', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const reminders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Reminder[];
    callback(reminders);
  });
};

export const updateReminderStatus = async (reminderId: string, status: 'pending' | 'completed') => {
  if (reminderId.startsWith('local_rem_')) {
    const local = getLocalReminders();
    const index = local.findIndex(r => r.id === reminderId);
    if (index !== -1) {
      local[index].status = status;
      saveLocalReminders(local);
      triggerStorageUpdate();
    }
    return;
  }

  const reminderRef = doc(db, 'reminders', reminderId);
  return updateDoc(reminderRef, { status });
};

export const deleteReminder = async (reminderId: string) => {
  if (reminderId.startsWith('local_rem_')) {
    const local = getLocalReminders();
    const filtered = local.filter(r => r.id !== reminderId);
    if (filtered.length !== local.length) {
      saveLocalReminders(filtered);
      triggerStorageUpdate();
    }
    return;
  }

  const reminderRef = doc(db, 'reminders', reminderId);
  return deleteDoc(reminderRef);
};
