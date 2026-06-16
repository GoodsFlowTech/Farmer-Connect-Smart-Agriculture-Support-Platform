import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Mic, MicOff, Volume2, Loader2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askChatBot, textToSpeech } from '../lib/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'user' | 'bot';
  text: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'வணக்கம் அண்ணா! வீட்ல எல்லாரும் சௌக்கியமா? விவசாயம் எப்படி போயிட்டு இருக்கு? எதாவது உதவி வேணும்னா தாராளமா சொல்லுங்க, நாம ரெண்டு பேரும் சேர்ந்து யோசிப்போம்! (Greetings! Is everyone well at home? How is the farming going? If you need any help, feel free to say, we\'ll think about it together!)' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Helper to map messages to Gemini history format
  const getGeminiHistory = () => {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ta-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Human-like: auto-send after voice input
        if (transcript.trim()) {
          handleSend(transcript);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    // Warm up speech synthesis voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.getVoices();
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', text };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');
    setIsTyping(true);

    // Pass history to ensure bot "ans the question which they have asking" (context)
    const history = currentMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const botResponse = await askChatBot(text, history.slice(0, -1)); // send history excluding current message
    const botMessage: Message = { role: 'bot', text: botResponse };
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);

    if (!muted) {
      playVoice(botResponse);
    }
  };

  const playVoice = async (text: string) => {
    setIsSpeaking(true);
    const result = await textToSpeech(text);
    
    if (result && result.data) {
      const audioSrc = `data:audio/wav;base64,${result.data}`;
      if (audioRef.current) {
        audioRef.current.src = audioSrc;
        audioRef.current.play().catch(e => {
          console.error("Audio play error:", e);
          fallbackSpeech(text);
        });
        audioRef.current.onended = () => setIsSpeaking(false);
      }
    } else {
      // Fallback to browser TTS if Gemini quota reached
      fallbackSpeech(text);
    }
  };

  const fallbackSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }

    // Stop early if already speaking
    window.speechSynthesis.cancel();

    // Clean text: remove English translations in parentheses for cleaner speech
    const cleanText = text.replace(/\(.*?\)/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt to find a Tamil voice
    const voices = window.speechSynthesis.getVoices();
    const tamilVoice = voices.find(v => v.lang.includes('ta'));
    if (tamilVoice) {
      utterance.voice = tamilVoice;
    }
    utterance.lang = 'ta-IN';
    utterance.rate = 0.9; // Slightly slower for clarity
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
      // Unlock audio on initial user gesture with silence
      if (audioRef.current) {
        const silence = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        audioRef.current.src = silence;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    // Unlock audio on click with a silent placeholder to avoid "no supported source" error
    if (!isOpen && audioRef.current) {
      const silence = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      audioRef.current.src = silence;
      audioRef.current.play().catch(() => {});
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
    if (!muted && audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <audio ref={audioRef} className="hidden" />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border border-natural-olive/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-natural-green p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-natural-cream rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-natural-green" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">AgriBot (விவசாய உதவியாளர்)</h4>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] opacity-70">செயலில் உள்ளது (Online)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleMute}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className={cn("w-4 h-4", isSpeaking && "animate-bounce")} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-natural-bg/30"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-2xl text-xs sm:text-sm shadow-sm relative group",
                    msg.role === 'user' 
                      ? "bg-natural-green text-white rounded-tr-none" 
                      : "bg-white text-gray-800 border border-natural-olive/5 rounded-tl-none pr-8"
                  )}>
                    {msg.text}
                    {msg.role === 'bot' && (
                      <button 
                        onClick={() => playVoice(msg.text)}
                        className="absolute right-1 bottom-1 p-1 text-natural-green opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                        title="மீண்டும் கேட்க (Speak Again)"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-1 ml-1">
                  <div className="w-1.5 h-1.5 bg-natural-green/40 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-natural-green/40 rounded-full animate-bounce-delay-1"></div>
                  <div className="w-1.5 h-1.5 bg-natural-green/40 rounded-full animate-bounce-delay-2"></div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleListening}
                  className={cn(
                    "p-2.5 rounded-full transition-all",
                    isListening ? "bg-red-100 text-red-500 scale-110" : "bg-natural-bg text-natural-green hover:bg-natural-green hover:text-white"
                  )}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="உங்கள் சந்தேகத்தைக் கேளுங்கள்..."
                  className="flex-1 bg-natural-bg border-none rounded-2xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-natural-green"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="p-2.5 bg-natural-green text-white rounded-full hover:bg-opacity-90 disabled:opacity-50 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">
                Can't speak Tamil? Ask in English, I'll help you.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className={cn(
          "w-14 h-14 bg-natural-green text-white rounded-full flex items-center justify-center shadow-2xl transition-all relative overflow-hidden",
          isOpen && "bg-white border-2 border-natural-green text-natural-green"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            <motion.div 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-white/20"
            />
          </>
        )}
      </motion.button>
    </div>
  );
}
