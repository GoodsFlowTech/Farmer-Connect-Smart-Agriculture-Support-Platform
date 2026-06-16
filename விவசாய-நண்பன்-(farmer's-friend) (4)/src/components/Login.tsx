import { motion, AnimatePresence } from 'motion/react';
import { Sprout, LogIn, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await login();
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAuthError = (err: any) => {
    if (err.code === 'auth/popup-closed-by-user') {
      setError("நுழைவு சாளரம் மூடப்பட்டது. (Login window closed.)");
    } else {
      setError("கூகுள் நுழைவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும். (Google login failed. Please try again.)");
    }
    console.error(err);
  };

  return (
    <div className="min-h-screen bg-natural-bg font-sans flex items-center justify-center p-4 relative overflow-hidden" id="login-container">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" id="login-bg-deco">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-natural-green rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-natural-olive rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-natural-olive/10 relative z-10"
        id="login-card"
      >
        <div className="text-center mb-8" id="login-header">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-16 h-16 bg-natural-bg rounded-full flex items-center justify-center mx-auto mb-4"
            id="login-sprout-icon"
          >
            <Sprout className="w-8 h-8 text-natural-green" />
          </motion.div>
          <h1 className="text-2xl font-black text-natural-green mb-1 tracking-tight" id="login-app-title">விவசாய நண்பன்</h1>
          <p className="text-natural-olive font-medium italic opacity-70 text-sm animate-pulse" id="login-app-desc">உழவனின் உற்ற தோழன்</p>
        </div>

        <div className="space-y-6" id="login-action-container">
          <div className="text-center mb-2" id="login-welcome-msg">
            <h2 className="text-xl font-bold text-gray-800">வரவேற்கிறோம்! (Welcome!)</h2>
            <p className="text-xs text-gray-400 mt-2 font-medium">பயன்பாட்டிற்குள் நுழைய கீழே உள்ள பொத்தானைக் கிளிக் செய்யவும் (Click below to enter the application)</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full bg-natural-green hover:bg-opacity-95 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-natural-green/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 cursor-pointer"
            id="btn-google-login"
          >
            {isLoggingIn ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" id="google-login-spinner"></div>
            ) : (
              <LogIn className="w-5 h-5 text-white" />
            )}
            <span id="label-google-login">செயலியைத் தொடங்கவும் (Enter App)</span>
          </button>

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 text-center"
              id="login-error-display"
            >
              {error}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
