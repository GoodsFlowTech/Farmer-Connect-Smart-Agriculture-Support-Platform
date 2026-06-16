import { Sprout, Calculator, Bell, User as UserIcon, LogOut, Calendar } from 'lucide-react';

interface HeaderProps {
  user: any;
  remindersCount: number;
  tamilDateInfo: any;
  setShowTamilCalendar: (show: boolean) => void;
  setShowYieldCalculator: (show: boolean) => void;
  setShowReminders: (show: boolean) => void;
  logout: () => void;
}

export default function Header({
  user,
  remindersCount,
  tamilDateInfo,
  setShowTamilCalendar,
  setShowYieldCalculator,
  setShowReminders,
  logout
}: HeaderProps) {
  return (
    <header className="bg-natural-green text-white px-8 py-4 flex items-center justify-between shadow-lg z-10 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-natural-cream rounded-full flex items-center justify-center">
          <Sprout className="w-6 h-6 text-natural-green" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">விவசாய நண்பன்</h1>
          <span className="text-[10px] md:text-xs font-normal block opacity-80 italic tracking-wider">உழவனின் உற்ற தோழன்</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Tamil Calendar Info */}
        <button 
          onClick={() => setShowTamilCalendar(true)}
          className="hidden lg:flex items-center gap-3 bg-natural-cream/20 px-4 py-2 rounded-2xl border border-white/10 text-white hover:bg-white/20 transition-all text-left"
        >
          <Calendar className="w-4 h-4 opacity-70" />
          <div className="text-[10px] leading-tight">
            <p className="opacity-70 uppercase tracking-tighter">தமிழ் வருடம்: {tamilDateInfo.name}</p>
            <p className="font-bold">{tamilDateInfo.month}</p>
          </div>
        </button>

        <button 
          onClick={() => setShowYieldCalculator(true)}
          className="flex items-center gap-3 bg-natural-green border border-white/20 px-4 py-2 rounded-2xl text-white hover:bg-natural-olive transition-all shadow-lg"
        >
          <Calculator className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">மகசூல் கணக்கீடு</span>
        </button>

        <button 
          onClick={() => setShowReminders(true)}
          className="p-2.5 bg-white/10 hover:bg-natural-green/20 text-white rounded-xl transition-all border border-white/10 hover:border-natural-green/30 relative"
          title="நினைவூட்டல்கள்"
        >
          <Bell className="w-5 h-5" />
          {remindersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {remindersCount}
            </span>
          )}
        </button>

        <div className="hidden md:flex items-center gap-4 bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
          <div className="text-right text-[10px] uppercase tracking-widest leading-tight">
            <p className="opacity-70">வரவேற்கிறோம்</p>
            <p className="font-bold truncate max-w-[150px]">{user.displayName || 'விவசாயி'}</p>
          </div>
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-white/20" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
              <UserIcon className="w-4 h-4" />
            </div>
          )}
        </div>
        <button 
          onClick={logout}
          className="p-2.5 bg-white/10 hover:bg-red-500/20 text-white rounded-xl transition-all border border-white/10 hover:border-red-500/30 group"
          title="வெளியேற"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </header>
  );
}
