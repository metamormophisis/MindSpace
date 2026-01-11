
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { 
  Home, 
  BarChart2, 
  Wind, 
  User, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  X, 
  Flame, 
  Calendar,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Activity,
  Heart,
  Shield,
  Zap,
  Coffee,
  Moon,
  Sun,
  CloudRain,
  AlertTriangle,
  Phone,
  Sparkles,
  PenTool,
  Settings,
  HelpCircle,
  Hand,
  Ear,
  Lightbulb,
  Move,
  Trophy,
  Target
} from 'lucide-react';
import { Emotion, EmotionColors, EmotionTextColors, UserState, JournalEntry } from './types';

// --- Configuration & Constants ---

const QUOTES = [
  "Your feelings are valid, even the messy ones.",
  "Progress, not perfection.",
  "You're doing better than you think.",
  "It's okay to rest.",
  "You are enough, exactly as you are.",
  "Small steps every day add up to big changes.",
  "Be gentle with yourself, you're doing the best you can.",
  "This feeling is temporary, you are resilient.",
  "Breathe. You've got this.",
  "Happiness comes in waves, it'll find you again."
];

const WELLNESS_QUESTIONS = [
  "Did you sleep well last night?",
  "Have you eaten today?",
  "Did you drink water recently?",
  "Have you moved your body?",
  "Did you talk to someone today?"
];

// Helper to determine range
const getIntensityRange = (intensity: number): 'low' | 'medium' | 'high' => {
  if (intensity <= 3) return 'low';
  if (intensity <= 6) return 'medium';
  return 'high';
};

// --- Components ---

// 1. Updated Mound-Style Blob Component
const Blob = ({ emotion, intensity = 5, className = "w-32 h-32" }: { emotion: Emotion, intensity?: number, className?: string }) => {
  const getBodyPath = () => {
    switch(emotion) {
       case Emotion.Joyful:
          return "M 10,90 L 90,90 L 90,45 Q 90,5 50,5 Q 10,5 10,45 Z"; // Perky, high mound
       case Emotion.Sad:
          return "M 5,95 L 95,95 L 95,60 Q 95,30 50,30 Q 5,30 5,60 Z"; // Lower, flatter mound
       case Emotion.Stressed:
          return "M 15,90 L 85,90 L 85,45 Q 85,15 50,20 Q 15,15 15,45 Z"; // Tense, slightly squeezed
       case Emotion.Angry:
          return "M 10,90 L 90,90 L 90,40 Q 90,20 50,10 Q 10,20 10,40 Z"; // Sharp shoulders
       default:
          return "M 10,90 L 90,90 L 90,50 Q 90,10 50,10 Q 10,10 10,50 Z"; // Standard
    }
  };

  const getFace = () => {
    const isHigh = intensity > 7;
    const color = EmotionTextColors[emotion] || '#333333'; 

    const Blink = (
       <animate attributeName="ry" values="5;0.5;5" dur="4s" repeatCount="indefinite" begin="1s" />
    );

    switch(emotion) {
      case Emotion.Joyful:
        const smilePath = isHigh ? "M 25,60 Q 50,85 75,60" : "M 30,65 Q 50,75 70,65";
        return (
          <g>
            <ellipse cx="35" cy="45" rx="5" ry="5" fill={color}>{Blink}</ellipse>
            <ellipse cx="65" cy="45" rx="5" ry="5" fill={color}>{Blink}</ellipse>
            <path d={smilePath} stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
            {isHigh && <path d="M 25,60 L 22,65 M 75,60 L 78,65" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.5"/>}
          </g>
        );
      case Emotion.Sad:
        const frownPath = isHigh ? "M 30,75 Q 50,55 70,75" : "M 30,70 Q 50,60 70,70";
        return (
          <g>
             <circle cx="35" cy="50" r="4" fill={color} />
             <circle cx="65" cy="50" r="4" fill={color} />
             <path d={frownPath} stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
             {isHigh && <path d="M 15,40 Q 25,35 35,40 M 65,40 Q 75,35 85,40" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />}
          </g>
        );
      case Emotion.Stressed:
        return (
          <g>
             <circle cx="35" cy="45" r={isHigh ? 6 : 4} fill={color} />
             <circle cx="65" cy="45" r={isHigh ? 6 : 4} fill={color} />
             <path d="M 30,70 Q 40,65 50,70 Q 60,75 70,70" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
             <path d="M 20,45 L 15,50 M 80,45 L 85,50" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
          </g>
        );
      case Emotion.Angry:
        return (
          <g>
            <circle cx="35" cy="50" r="4" fill={color} />
            <circle cx="65" cy="50" r="4" fill={color} />
            <path d="M 25,40 L 45,45" stroke={color} strokeWidth="4" strokeLinecap="round" />
            <path d="M 75,40 L 55,45" stroke={color} strokeWidth="4" strokeLinecap="round" />
            <path d={isHigh ? "M 35,75 Q 50,65 65,75" : "M 35,70 L 65,70"} stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        );
      case Emotion.Confused:
         return (
            <g>
               <circle cx="35" cy="45" r="6" fill={color} />
               <circle cx="65" cy="45" r="4" fill={color} />
               <path d="M 35,70 Q 50,65 65,75" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
               <path d="M 70,35 L 80,30" stroke={color} strokeWidth="3" strokeLinecap="round" />
            </g>
         );
       case Emotion.Bored:
          return (
             <g>
                <path d="M 30,45 L 40,45" stroke={color} strokeWidth="4" strokeLinecap="round" />
                <path d="M 60,45 L 70,45" stroke={color} strokeWidth="4" strokeLinecap="round" />
                <path d="M 35,70 L 65,70" stroke={color} strokeWidth="4" strokeLinecap="round" />
             </g>
          );
      default: return null;
    }
  };

  return (
    <div className={`${className} transition-transform duration-500 ease-in-out`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-xl">
         <path 
           d={getBodyPath()} 
           fill={EmotionColors[emotion] || '#CCCCCC'} 
           className="transition-all duration-700 ease-in-out"
         />
         {getFace()}
      </svg>
    </div>
  );
};

// 2. Shared UI Components

const Button = ({ children, onClick, variant = 'primary', className = "", disabled=false }: any) => {
  const baseStyle = "px-8 py-4 rounded-2xl font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-lg tracking-wide";
  const variants = {
    primary: "bg-[#333333] text-white hover:bg-black",
    secondary: "bg-white text-[#333333] border-2 border-gray-100 hover:bg-gray-50",
    ghost: "bg-transparent text-[#666666] hover:bg-gray-100",
    success: "bg-[#A8E6CF] text-[#1B5E4F] hover:opacity-90",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${(variants as any)[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "", onClick }: any) => (
  <div onClick={onClick} className={`bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 ${className}`}>
    {children}
  </div>
);

// --- App Navigation Structure ---

const App = () => {
  const [view, setView] = useState('auth'); 
  const [user, setUser] = useState<UserState | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [journalIntensity, setJournalIntensity] = useState(5);
  
  const handleLogin = (u: UserState) => {
    setUser(u);
    setView('home');
  };

  const startJournaling = (emotion: Emotion) => {
    setCurrentEmotion(emotion);
    setJournalIntensity(5); 
    setView('journal');
  };

  const renderView = () => {
    switch(view) {
      case 'auth': return <AuthView onLogin={handleLogin} />;
      case 'home': return <HomeView user={user!} onStartJournal={startJournaling} />;
      case 'journal': return <JournalFlow emotion={currentEmotion!} intensity={journalIntensity} setIntensity={setJournalIntensity} onComplete={() => setView('home')} />;
      case 'dashboard': return <DashboardView />;
      case 'calm': return <CalmView />;
      case 'profile': return <ProfileView user={user!} onLogout={() => setView('auth')} />;
      default: return <HomeView user={user!} onStartJournal={startJournaling} />;
    }
  };

  return (
    <div className="h-full w-full bg-[#FAF9F6] flex flex-col font-sans text-[#333333]">
      <div className="flex-1 overflow-hidden relative">
        {renderView()}
      </div>
      {view !== 'auth' && view !== 'journal' && (
        <div className="bg-white/90 backdrop-blur-md border-t border-gray-100 h-24 pb-6 px-8 flex justify-between items-center absolute bottom-0 w-full z-50 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <NavIcon icon={Home} label="Home" active={view === 'home'} onClick={() => setView('home')} />
          <NavIcon icon={Calendar} label="Stats" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavIcon icon={Wind} label="Calm" active={view === 'calm'} onClick={() => setView('calm')} />
          <NavIcon icon={User} label="Profile" active={view === 'profile'} onClick={() => setView('profile')} />
        </div>
      )}
    </div>
  );
};

const NavIcon = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 ${active ? 'text-[#333333] transform scale-110' : 'text-gray-300'}`}>
    <Icon size={28} strokeWidth={active ? 2.5 : 2} />
    {active && <span className="w-1.5 h-1.5 bg-[#333333] rounded-full mt-1"></span>}
  </button>
);

// --- Views ---

const AuthView = ({ onLogin }: { onLogin: (u: UserState) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    onLogin({
      isLoggedIn: true,
      name: email.split('@')[0],
      email: email,
      uid: '12345',
      streak: 0
    });
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 relative overflow-hidden bg-[#FAF9F6]">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FFD93D] rounded-full opacity-10 blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#95E1D3] rounded-full opacity-10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-sm z-10 flex flex-col items-center">
        <div className="mb-8 scale-150">
           <Blob emotion={Emotion.Joyful} className="w-32 h-32 animate-float" />
        </div>
        <h1 className="text-4xl font-display font-bold text-[#333333] mb-3">MindfulSpace</h1>
        <p className="text-gray-400 font-medium mb-12">Your daily emotional companion</p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative group">
            <Mail className="absolute left-5 top-4 text-gray-400 w-5 h-5 group-focus-within:text-[#333333] transition-colors" />
            <input type="email" placeholder="Email" className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border-2 border-gray-100 focus:border-[#333333] outline-none transition-all font-semibold text-[#333333] placeholder-gray-300" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="relative group">
            <Lock className="absolute left-5 top-4 text-gray-400 w-5 h-5 group-focus-within:text-[#333333] transition-colors" />
            <input type="password" placeholder="Password" className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border-2 border-gray-100 focus:border-[#333333] outline-none transition-all font-semibold text-[#333333] placeholder-gray-300" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-[#FF6B6B] text-sm text-center font-bold bg-[#FF6B6B]/10 py-3 rounded-xl">{error}</p>}
          <Button onClick={handleSubmit} className="w-full mt-4 shadow-xl shadow-gray-200">
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="mt-8 text-gray-400 font-bold text-sm hover:text-[#333333] transition-colors">
            {isLogin ? "New here? Create Account" : "Have an account? Login"}
        </button>
      </div>
    </div>
  );
};

const HomeView = ({ user, onStartJournal }: { user: UserState, onStartJournal: (e: Emotion) => void }) => {
  const [dailyQuote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-32 bg-[#FAF9F6]">
      {/* Header */}
      <div className="px-8 pt-12 pb-6 flex justify-between items-end">
        <div>
           <div className="text-gray-400 font-bold text-sm mb-1 uppercase tracking-wider">Welcome back</div>
           <h1 className="text-3xl font-display font-bold text-[#333333]">{user.name}</h1>
        </div>
        <div className="bg-white p-2 rounded-full border border-gray-100 shadow-sm">
           <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">{user.name[0]}</div>
        </div>
      </div>

      {/* Mood Selector - Grid Layout */}
      <div className="mt-2">
        <h2 className="px-8 text-xl font-bold font-display mb-4">How are you feeling?</h2>
        <div className="px-8 grid grid-cols-2 gap-3 pb-4">
          {Object.values(Emotion).map((emotion) => (
            <button 
              key={emotion} 
              onClick={() => onStartJournal(emotion)} 
              className="w-full rounded-[24px] flex flex-col items-center justify-center py-5 px-2 transition-all transform hover:scale-[1.02] active:scale-95 group relative overflow-hidden shadow-sm hover:shadow-md"
              style={{ backgroundColor: EmotionColors[emotion] + '30' }} // 30% opacity bg
            >
               {/* Background Circle */}
               <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20" style={{ backgroundColor: EmotionColors[emotion] }}></div>
               
               <div className="mb-2 transition-transform duration-500 group-hover:-translate-y-1">
                  <Blob emotion={emotion} className="w-16 h-16 drop-shadow-sm" />
               </div>
               <div className="w-full text-center">
                  <span className="block font-bold text-sm font-display uppercase tracking-wide opacity-90" style={{ color: EmotionTextColors[emotion] }}>{emotion}</span>
               </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="px-8 space-y-6 mt-4">
        {/* Quote Card */}
        <div className="bg-[#333333] rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-gray-200">
           <Sparkles className="absolute top-6 right-6 text-white/20 w-12 h-12" />
           <p className="font-display text-xl font-medium leading-relaxed relative z-10">"{dailyQuote}"</p>
           <div className="mt-6 flex items-center gap-2 text-white/60 text-sm font-bold uppercase tracking-wider">
              <div className="w-6 h-1 bg-white/20 rounded-full"></div>
              Daily Wisdom
           </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
           <Card className="flex flex-col items-center justify-center py-8 !bg-white">
              <Flame className="w-8 h-8 text-orange-500 mb-2" fill="currentColor" />
              <div className="text-3xl font-bold font-display text-[#333333]">{user.streak}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Day Streak</div>
           </Card>
           <Card className="flex flex-col items-center justify-center py-8 !bg-white">
              <Activity className="w-8 h-8 text-blue-500 mb-2" />
              <div className="text-3xl font-bold font-display text-[#333333]">12</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Entries</div>
           </Card>
        </div>
      </div>
    </div>
  );
};

const JournalFlow = ({ emotion, intensity, setIntensity, onComplete }: any) => {
  const [step, setStep] = useState(1); 
  // State for AI Chat in Step 2
  const [chatHistory, setChatHistory] = useState<Array<{role: 'model' | 'user', text: string}>>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [allAnswers, setAllAnswers] = useState<string[]>([]);

  // State for Step 3 & 4
  const [journalText, setJournalText] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [crisisDetected, setCrisisDetected] = useState(false);

  const bgColor = EmotionColors[emotion]; 
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  // Step 1: Intensity Slider (Full Screen Visual)
  if (step === 1) {
    return (
      <div className="h-full flex flex-col p-8 transition-colors duration-700 relative overflow-hidden" style={{ backgroundColor: bgColor }}>
        <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-[100px]"></div>
        <button onClick={onComplete} className="self-start p-3 bg-white/20 rounded-full text-white hover:bg-white/40 mb-4 transition-colors z-10"><X size={24} /></button>
        <div className="flex-1 flex flex-col items-center justify-center z-10">
          <h2 className="text-3xl font-bold font-display mb-12 text-center text-white/90 drop-shadow-sm">How much do you feel this?</h2>
          <div className="mb-16 scale-[2.5] transition-transform duration-300">
             <Blob emotion={emotion} intensity={intensity} className="w-32 h-32 drop-shadow-2xl" />
          </div>
          <div className="w-full max-w-xs relative h-16 bg-black/10 rounded-full p-2 flex items-center">
            <div className="absolute inset-0 rounded-full border border-white/20"></div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={intensity} 
              onChange={(e) => setIntensity(parseInt(e.target.value))} 
              className="w-full h-full absolute inset-0 z-20 opacity-0 cursor-pointer" 
            />
            <div 
               className="h-full bg-white rounded-full shadow-lg transition-all duration-100 ease-out flex items-center justify-center relative"
               style={{ width: `${(intensity / 10) * 100}%`, minWidth: '48px' }}
            >
               <div className="absolute right-4 w-1 h-4 bg-gray-300 rounded-full"></div>
            </div>
          </div>
          <div className="flex justify-between w-full max-w-xs mt-4 px-2 text-white/80 font-bold text-sm">
             <span>A little</span>
             <span>Intensely</span>
          </div>
        </div>
        <div className="z-10">
           <Button onClick={() => {
              setStep(2);
              // Initialize first question
              setIsAiLoading(true);
              const init = async () => {
                try {
                  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
                  const prompt = `User is feeling ${emotion} (intensity ${intensity}/10). Ask a gentle, short, open-ended question to help them process this feeling. Direct address ("you"). Return ONLY the question text.`;
                  const resp = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
                  setCurrentQuestion(resp.text.trim());
                  setChatHistory([{ role: 'model', text: resp.text.trim() }]);
                } catch(e) {
                   setCurrentQuestion(`What is making you feel ${emotion} right now?`);
                } finally {
                  setIsAiLoading(false);
                }
              };
              init();
           }} className="w-full bg-white text-[#333333] hover:bg-white/90 shadow-xl border-none h-16 text-xl">Continue</Button>
        </div>
      </div>
    );
  }

  // Step 2: AI-Driven Chat Questionnaire
  if (step === 2) {
    const handleAnswerSubmit = async () => {
      if (!userAnswer.trim()) return;
      
      const newHistory = [...chatHistory, { role: 'user' as const, text: userAnswer }];
      setChatHistory(newHistory);
      setAllAnswers([...allAnswers, `Q: ${currentQuestion} A: ${userAnswer}`]);
      setUserAnswer("");
      
      if (questionCount >= 4) {
         // Done with 5 questions (0-4), move to Journal
         setStep(4);
         return;
      }

      setIsAiLoading(true);
      setQuestionCount(c => c + 1);
      
      try {
         const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
         // Create context from history
         let historyText = newHistory.map(h => `${h.role === 'user' ? 'User' : 'AI'}: ${h.text}`).join('\n');
         const prompt = `
Context: User feels ${emotion} (${intensity}/10).
Conversation history:
${historyText}

Task: Ask the next short, empathetic follow-up question to dig deeper. Keep it simple and warm. Return ONLY the question text.
`;
         const resp = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
         const nextQ = resp.text.trim();
         setCurrentQuestion(nextQ);
         setChatHistory([...newHistory, { role: 'model', text: nextQ }]);
      } catch (e) {
         setStep(4); // Fallback if AI fails
      } finally {
         setIsAiLoading(false);
      }
    };

    return (
      <div className="h-full flex flex-col p-8 transition-colors duration-500" style={{ backgroundColor: bgColor }}>
        <div className="flex justify-between items-center mb-6">
           <button onClick={prevStep} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30"><ChevronLeft /></button>
           <div className="flex gap-1">
              {[0,1,2,3,4].map((i) => (<div key={i} className={`h-2 rounded-full transition-all duration-500 ${i <= questionCount ? 'bg-white w-6' : 'bg-white/30 w-2'}`} />))}
           </div>
           <button onClick={() => setStep(4)} className="text-sm font-bold text-white/70 hover:text-white px-3 py-1 rounded-lg hover:bg-white/10">Skip</button>
        </div>
        
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
           <div className="min-h-[120px] flex items-center justify-center">
             {isAiLoading ? (
                <div className="flex gap-2">
                   <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                   <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                   <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
             ) : (
                <h2 className="text-2xl md:text-3xl font-bold font-display leading-snug text-white drop-shadow-md text-center animate-in fade-in slide-in-from-bottom-4">{currentQuestion}</h2>
             )}
           </div>

           <div className="mt-12 w-full">
              <textarea 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="w-full p-6 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 text-white text-lg placeholder-white/50 focus:bg-white/30 outline-none resize-none h-40 shadow-sm transition-all"
                onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAnswerSubmit();
                  }
                }}
              />
              <div className="mt-4 flex justify-end">
                 <button 
                   onClick={handleAnswerSubmit}
                   disabled={!userAnswer.trim() || isAiLoading}
                   className="bg-white text-[#333333] px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                 >
                   <ChevronRight />
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // Step 3 (Skipped - integrated flow) -> Step 4: Final Journal / Summary
  if (step === 4) {
    const checkCrisis = (text: string) => {
       const keywords = ["suicide", "kill myself", "die", "end it", "better off dead"];
       setCrisisDetected(keywords.some(k => text.toLowerCase().includes(k)));
       setJournalText(text);
    };

    const handleSubmitJournal = async () => {
      if (crisisDetected) return; 
      setIsAiLoading(true);
      setStep(5);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        // Include previous Q&A in context
        const context = allAnswers.join("\n");
        const prompt = `User: ${emotion} (${intensity}/10). 
Journal/Summary: "${journalText}". 
Context from Chat:
${context}

Respond JSON: { "acknowledgment": string, "observation": string, "reframe": string }. 
Make it supportive, concise, and warm. No medical advice.`;
        
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt, config: { responseMimeType: "application/json" } });
        setAiResponse(response.text);
      } catch (e) {
        setAiResponse(JSON.stringify({ acknowledgment: "Thank you for sharing your thoughts.", observation: "It sounds like you're processing a lot.", reframe: "Be gentle with yourself as you move forward." }));
      } finally { setIsAiLoading(false); }
    };

    if (crisisDetected) {
       return (
         <div className="h-full bg-red-50 p-6 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="w-20 h-20 text-red-500 mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">I'm worried about you.</h2>
            <div className="w-full bg-white p-8 rounded-3xl shadow-xl mb-6 border border-red-100">
               <h3 className="font-bold text-gray-800 mb-6 text-lg">Please reach out:</h3>
               <button className="w-full flex items-center justify-center gap-3 p-4 bg-red-500 text-white rounded-2xl font-bold text-lg hover:bg-red-600 transition-colors"><Phone size={24} /> Call 988 (US)</button>
            </div>
            <button onClick={() => setCrisisDetected(false)} className="text-gray-400 font-bold text-sm underline">I am safe, go back</button>
         </div>
       );
    }

    return (
      <div className="h-full flex flex-col bg-[#FAF9F6]">
         <div className="px-6 py-4 flex items-center bg-white border-b border-gray-100">
            <button onClick={() => setStep(2)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft className="text-gray-600" /></button>
            <span className="flex-1 text-center font-bold text-gray-800 text-lg">Final Thoughts</span>
            <div className="w-10"></div>
         </div>
         <div className="flex-1 p-6 overflow-y-auto">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 mb-6 shadow-sm">
               <p className="text-gray-500 font-medium mb-2">You've reflected on:</p>
               <div className="space-y-2">
                  {allAnswers.map((a, i) => (
                    <div key={i} className="text-sm text-gray-400 border-l-2 border-gray-200 pl-3 line-clamp-2 italic">{a.split('A: ')[1]}</div>
                  ))}
               </div>
            </div>
            <p className="text-[#333333] font-display font-bold text-xl mb-4">Anything else you want to get off your chest?</p>
            <div className="relative">
               <textarea className="w-full h-80 bg-transparent border-none outline-none text-xl text-[#333333] placeholder-gray-300 resize-none leading-10 p-0" style={{ backgroundImage: 'linear-gradient(transparent, transparent 39px, #E5E7EB 39px)', backgroundSize: '100% 40px', lineHeight: '40px' }} placeholder="Write here..." value={journalText} onChange={(e) => checkCrisis(e.target.value)} autoFocus />
            </div>
         </div>
         <div className="p-6 bg-white border-t border-gray-100"><Button onClick={handleSubmitJournal} className="w-full h-14 text-lg">Complete Check-in</Button></div>
      </div>
    );
  }

  // Step 5: Analysis
  if (step === 5) {
     if (isAiLoading) {
        return (
          <div className="h-full flex flex-col items-center justify-center bg-white">
             <div className="scale-125 mb-8"><Blob emotion={emotion} className="w-32 h-32 animate-float" /></div>
             <p className="text-gray-400 font-bold animate-pulse text-lg">Reflecting on your thoughts...</p>
          </div>
        );
     }
     const analysis = aiResponse ? JSON.parse(aiResponse) : {};
     return (
       <div className="h-full flex flex-col p-6 overflow-y-auto" style={{ backgroundColor: bgColor + '20' }}>
          <div className="mt-8 mb-8 flex justify-center">
             <div className="bg-white p-6 rounded-[40px] shadow-lg shadow-black/5">
                <Blob emotion={emotion} intensity={3} className="w-24 h-24" />
             </div>
          </div>
          <div className="space-y-4">
             <Card className="animate-in slide-in-from-bottom-4 duration-700 fade-in border-l-8" style={{ borderLeftColor: bgColor }}>
                <div className="flex items-center gap-2 mb-3 opacity-60 font-bold text-sm uppercase tracking-wider"><Heart size={16} fill="currentColor" /> I hear you</div>
                <p className="text-lg font-display font-medium text-[#333333] leading-relaxed">{analysis.acknowledgment}</p>
             </Card>
             <Card className="animate-in slide-in-from-bottom-8 duration-1000 fade-in" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-2 mb-3 opacity-60 font-bold text-sm uppercase tracking-wider"><Eye size={16} /> What I notice</div>
                <p className="text-gray-700 text-lg">{analysis.observation}</p>
             </Card>
             <Card className="animate-in slide-in-from-bottom-12 duration-1000 fade-in !bg-[#333333] !text-white" style={{ animationDelay: '400ms' }}>
                 <div className="flex items-center gap-2 mb-3 opacity-60 font-bold text-sm uppercase tracking-wider text-yellow-300"><Sun size={16} /> A gentle thought</div>
                <p className="italic text-lg leading-relaxed opacity-90">{analysis.reframe}</p>
             </Card>
          </div>
          <div className="flex-1"></div>
          <div className="mt-8 mb-20">
             <Button onClick={() => setStep(6)} className="w-full shadow-xl">Let's try a quick activity</Button>
             <button onClick={onComplete} className="w-full py-4 text-gray-400 font-bold mt-2">No thanks, maybe later</button>
          </div>
       </div>
     );
  }

  // Step 6: Post-Journaling Activity
  if (step === 6) {
    const handleActivityFinish = () => setStep(7);

    // Unique Activity for EACH emotion
    switch(emotion) {
      case Emotion.Joyful:
        return <GratitudeExercise onFinish={handleActivityFinish} />;
      case Emotion.Sad:
        return <ComfortExercise onFinish={handleActivityFinish} />; // New Comfort
      case Emotion.Angry:
        return <PhysicalExercise onFinish={handleActivityFinish} />; // New Physical
      case Emotion.Stressed:
        return <BreathingExercise onFinish={handleActivityFinish} autoStart={true} />; // Fixed 5-4-5
      case Emotion.Confused:
        return <GroundingExercise onFinish={handleActivityFinish} />; // Grounding
      case Emotion.Bored:
        return <NoveltyExercise onFinish={handleActivityFinish} />; // New Novelty
      default:
        return <GratitudeExercise onFinish={handleActivityFinish} />;
    }
  }

  // Step 7: Completion Screen
  if (step === 7) {
      // Use ref to keep quote stable across re-renders of this step
      const quoteRef = useRef(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
      
      // Animation state
      const [show, setShow] = useState(false);
      
      useEffect(() => {
          const timer = setTimeout(() => setShow(true), 100);
          return () => clearTimeout(timer);
      }, []);

      return (
          <div className="h-full flex flex-col items-center justify-center p-8 transition-colors duration-500 relative overflow-hidden" style={{ backgroundColor: bgColor }}>
               {/* Decorative background blobs */}
              <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

              <div className={`transition-all duration-700 ease-out transform ${show ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                  <div className="bg-white p-6 rounded-full shadow-2xl mb-8">
                     <Check size={48} className="text-[#333333]" strokeWidth={4} />
                  </div>
              </div>

              <h2 className={`text-4xl font-bold font-display text-white mb-2 transition-all duration-700 delay-200 ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>Well done.</h2>
              <p className={`text-white/80 text-lg font-medium mb-12 transition-all duration-700 delay-300 ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>You've taken a great step for yourself.</p>

              <div className={`w-full max-w-sm bg-white/20 backdrop-blur-md border border-white/30 p-8 rounded-[32px] text-center mb-16 transition-all duration-700 delay-500 ${show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                 <p className="text-white font-display text-xl font-medium italic leading-relaxed">"{quoteRef.current}"</p>
              </div>

              <div className={`w-full transition-all duration-700 delay-700 ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                 <Button onClick={onComplete} className="w-full bg-white text-[#333333] hover:bg-white/90 shadow-xl h-16 text-lg">Return Home</Button>
              </div>
          </div>
      )
  }
  return null;
};

// --- Added Missing Views & Exercises ---

const DashboardView = () => {
  const today = new Date();
  const currentMonthName = today.toLocaleString('default', { month: 'long' });
  const year = today.getFullYear();
  const month = today.getMonth();
  
  // Generate random stats and calendar data
  const mockData = useRef(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const data: Record<number, Emotion> = {};
    const emotions = Object.values(Emotion);
    
    // Simulate streak: last 5 days
    let streakCount = 5;
    
    // Randomly fill about 70% of the days
    for (let i = 1; i <= daysInMonth; i++) {
        if (Math.random() > 0.3 || i > daysInMonth - 5) { // Ensure last 5 days are filled for streak
            data[i] = emotions[Math.floor(Math.random() * emotions.length)];
        }
    }
    
    return { data, streakCount, totalSessions: Object.keys(data).length };
  }).current();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  
  // Stats
  const emotionCounts = Object.values(mockData.data).reduce((acc: any, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {});
  
  const topEmotion = Object.entries(emotionCounts).sort((a: any, b: any) => b[1] - a[1])[0] as [string, number] | undefined;

  return (
    <div className="h-full p-6 overflow-y-auto bg-[#FAF9F6]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-display font-bold text-[#333333]">Your Journey</h2>
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
             <span className="w-2 h-2 rounded-full bg-green-400"></span>
             <span className="text-xs font-bold text-gray-500 uppercase">{currentMonthName}</span>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
         <div className="bg-[#333333] rounded-[28px] p-5 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Flame size={48} /></div>
             <div className="text-3xl font-bold font-display mb-1">{mockData.streakCount} <span className="text-base font-normal opacity-60">days</span></div>
             <div className="text-xs font-bold uppercase tracking-wider opacity-60">Current Streak</div>
         </div>
         <div className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-500"><Target size={48} /></div>
             <div className="text-3xl font-bold font-display mb-1 text-[#333333]">{mockData.totalSessions}</div>
             <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Check-ins</div>
         </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-6">
         <h3 className="font-bold text-[#333333] mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" /> 
            Monthly Overview
         </h3>
         
         <div className="grid grid-cols-7 gap-2 mb-2">
            {['S','M','T','W','T','F','S'].map(d => (
                <div key={d} className="text-center text-xs font-bold text-gray-300">{d}</div>
            ))}
         </div>
         
         <div className="grid grid-cols-7 gap-2">
             {/* Empty slots for previous month */}
             {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                 <div key={`empty-${i}`} className="aspect-square"></div>
             ))}
             
             {/* Days */}
             {Array.from({ length: daysInMonth }).map((_, i) => {
                 const day = i + 1;
                 const emotion = mockData.data[day];
                 const isToday = day === today.getDate();
                 
                 return (
                     <div 
                        key={day} 
                        className={`aspect-square rounded-full flex items-center justify-center text-xs font-bold relative group transition-all duration-300 ${isToday ? 'ring-2 ring-offset-2 ring-[#333333]' : ''}`}
                        style={{ 
                            backgroundColor: emotion ? EmotionColors[emotion] : '#F3F4F6',
                            color: emotion ? EmotionTextColors[emotion] : '#D1D5DB'
                        }}
                     >
                         {day}
                         {emotion && (
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                                {emotion}
                            </div>
                         )}
                     </div>
                 );
             })}
         </div>
      </div>
      
      {/* Top Emotion Card */}
      {topEmotion && (
         <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex items-center gap-6">
             <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: EmotionColors[topEmotion[0] as Emotion] + '40' }}>
                 <Blob emotion={topEmotion[0] as Emotion} className="w-12 h-12" />
             </div>
             <div>
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Most Frequent</div>
                 <div className="text-xl font-bold text-[#333333]">{topEmotion[0]}</div>
                 <div className="text-sm font-medium text-gray-400">{topEmotion[1]} times this month</div>
             </div>
         </div>
      )}
    </div>
  );
};

const CalmView = () => (
  <div className="h-full p-8 bg-[#E0F7FA] overflow-y-auto">
    <h2 className="text-3xl font-display font-bold text-[#006064] mb-6">Breathe & Relax</h2>
    <div className="space-y-4">
       <Card onClick={() => {}} className="cursor-pointer hover:shadow-md transition-shadow !bg-white/80 backdrop-blur-sm border-none">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-100 p-3 rounded-full text-cyan-600"><Wind size={24} /></div>
            <div>
                <h3 className="font-bold text-lg text-cyan-900">4-7-8 Breathing</h3>
                <p className="text-cyan-700/70 text-sm">Relax your nervous system.</p>
            </div>
          </div>
       </Card>
       <Card onClick={() => {}} className="cursor-pointer hover:shadow-md transition-shadow !bg-white/80 backdrop-blur-sm border-none">
          <div className="flex items-center gap-4">
             <div className="bg-teal-100 p-3 rounded-full text-teal-600"><Move size={24} /></div>
             <div>
                <h3 className="font-bold text-lg text-teal-900">Box Breathing</h3>
                <p className="text-teal-700/70 text-sm">Focus and calm your mind.</p>
             </div>
          </div>
       </Card>
    </div>
  </div>
);

const ProfileView = ({ user, onLogout }: { user: UserState, onLogout: () => void }) => (
  <div className="h-full p-8 flex flex-col items-center bg-[#FAF9F6]">
    <div className="w-24 h-24 bg-white border-4 border-gray-100 rounded-full flex items-center justify-center text-4xl font-bold text-gray-400 mb-4 shadow-sm">
      {user.name[0]}
    </div>
    <h2 className="text-2xl font-bold text-[#333333] mb-1">{user.name}</h2>
    <p className="text-gray-400 mb-8 font-medium">{user.email}</p>
    
    <div className="w-full space-y-3">
       {[{icon: Settings, label: 'Settings'}, {icon: Shield, label: 'Privacy'}, {icon: HelpCircle, label: 'Support'}].map((item, i) => (
           <button key={i} className="w-full p-4 bg-white rounded-2xl flex items-center justify-between shadow-sm hover:bg-gray-50 transition-colors text-left text-[#333333] font-bold border border-gray-100">
              <div className="flex items-center gap-3"><item.icon size={20} className="text-gray-400" /> {item.label}</div>
              <ChevronRight size={20} className="text-gray-300" />
           </button>
       ))}
    </div>

    <div className="flex-1"></div>
    <Button onClick={onLogout} variant="ghost" className="text-red-500 hover:bg-red-50 w-full mb-20">Sign Out</Button>
  </div>
);

const BreathingExercise = ({ onFinish }: { onFinish: () => void, autoStart?: boolean }) => {
   const [phase, setPhase] = useState('Inhale');
   const [timeLeft, setTimeLeft] = useState(4);
   
   useEffect(() => {
      const timer = setInterval(() => {
          setTimeLeft(t => {
             if (t <= 1) {
                if (phase === 'Inhale') { setPhase('Hold'); return 4; }
                if (phase === 'Hold') { setPhase('Exhale'); return 4; }
                if (phase === 'Exhale') { setPhase('Inhale'); return 4; }
             }
             return t - 1;
          });
      }, 1000);
      return () => clearInterval(timer);
   }, [phase]);

   return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-blue-50">
         <h2 className="text-3xl font-display font-bold text-blue-800 mb-12">Box Breathing</h2>
         <div className={`w-64 h-64 bg-blue-200 rounded-full flex items-center justify-center transition-all duration-1000 ${phase === 'Inhale' ? 'scale-125' : phase === 'Exhale' ? 'scale-75' : 'scale-100'}`}>
            <div className="text-center">
               <div className="text-2xl font-bold text-blue-800 uppercase tracking-widest mb-2">{phase}</div>
               <div className="text-6xl font-bold text-white">{timeLeft}</div>
            </div>
         </div>
         <p className="mt-12 text-blue-600/70 text-center max-w-xs font-medium">Focus on your breath. Inhale, Hold, Exhale, Hold.</p>
         <Button onClick={onFinish} className="mt-8 bg-blue-600 text-white w-full max-w-xs shadow-lg shadow-blue-200">Done</Button>
      </div>
   );
};

const GratitudeExercise = ({ onFinish }: { onFinish: () => void }) => {
  const [items, setItems] = useState(['', '', '']);
  return (
    <div className="h-full p-8 flex flex-col bg-yellow-50">
       <h2 className="text-3xl font-bold font-display text-yellow-800 mb-2">Three Good Things</h2>
       <p className="text-yellow-700/80 mb-8 font-medium">What are 3 things you're grateful for today?</p>
       <div className="space-y-4">
          {items.map((val, i) => (
             <input key={i} value={val} onChange={(e) => {
                const newItems = [...items];
                newItems[i] = e.target.value;
                setItems(newItems);
             }} className="w-full p-4 rounded-xl border-2 border-yellow-200 bg-white focus:border-yellow-400 outline-none text-yellow-900 placeholder-yellow-300 font-medium" placeholder={`I am grateful for...`} />
          ))}
       </div>
       <div className="flex-1"></div>
       <Button onClick={onFinish} className="w-full bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-none shadow-lg shadow-yellow-200">I Feel Better</Button>
    </div>
  );
};

const ComfortExercise = ({ onFinish }: { onFinish: () => void }) => (
    <div className="h-full p-8 flex flex-col items-center justify-center bg-indigo-50 text-center">
       <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mb-8 text-indigo-400 animate-pulse-slow">
          <Heart size={48} fill="currentColor" />
       </div>
       <h2 className="text-2xl font-bold text-indigo-900 mb-4 font-display">Be Gentle With Yourself</h2>
       <p className="text-indigo-700/80 max-w-xs mb-12 text-lg font-medium">"It's okay to not be okay. You are doing the best you can, and that is enough."</p>
       <Button onClick={onFinish} className="bg-indigo-600 text-white w-full max-w-xs shadow-lg shadow-indigo-200">I Accept This</Button>
    </div>
);

const PhysicalExercise = ({ onFinish }: { onFinish: () => void }) => (
    <div className="h-full p-8 flex flex-col items-center justify-center bg-red-50 text-center">
       <Move size={64} className="text-red-400 mb-8 animate-bounce" />
       <h2 className="text-3xl font-bold text-red-900 mb-4 font-display">Shake It Off</h2>
       <p className="text-red-700/80 max-w-xs mb-12 text-lg font-medium">Stand up and shake your body for 30 seconds. Release the tension.</p>
       <Button onClick={onFinish} className="bg-red-500 text-white w-full max-w-xs shadow-lg shadow-red-200">Done</Button>
    </div>
);

const GroundingExercise = ({ onFinish }: { onFinish: () => void }) => {
    const steps = [
        { count: 5, label: "Things you can see", icon: Eye, color: "text-blue-600", bg: "bg-blue-100", placeholder: "e.g., A blue cup, the sky..." },
        { count: 4, label: "Things you can touch", icon: Hand, color: "text-teal-600", bg: "bg-teal-100", placeholder: "e.g., The cool table, soft fabric..." },
        { count: 3, label: "Things you can hear", icon: Ear, color: "text-purple-600", bg: "bg-purple-100", placeholder: "e.g., Distant traffic, wind..." },
        { count: 2, label: "Things you can smell", icon: Wind, color: "text-orange-600", bg: "bg-orange-100", placeholder: "e.g., Fresh coffee, rain..." },
        { count: 1, label: "Thing you can taste", icon: Coffee, color: "text-pink-600", bg: "bg-pink-100", placeholder: "e.g., Mint, tea..." },
    ];
    
    const [currentStep, setCurrentStep] = useState(0);
    const [inputs, setInputs] = useState<string[]>([]);
    const [animating, setAnimating] = useState(false);

    // Initialize inputs when step changes
    useEffect(() => {
        setInputs(new Array(steps[currentStep].count).fill(''));
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setAnimating(true);
            setTimeout(() => {
                setCurrentStep(c => c + 1);
                setAnimating(false);
            }, 300);
        } else {
            onFinish();
        }
    };

    const updateInput = (idx: number, val: string) => {
        const newInputs = [...inputs];
        newInputs[idx] = val;
        setInputs(newInputs);
    };

    const stepData = steps[currentStep];
    const Icon = stepData.icon;
    const isStepComplete = inputs.every(i => i.trim().length > 0);

    return (
        <div className={`h-full flex flex-col p-8 bg-white transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
            <h2 className="text-3xl font-bold font-display text-[#333333] mb-2">Grounding</h2>
            <p className="text-gray-400 font-medium mb-6 text-lg">Bring yourself back to the present.</p>
            
            <div className="flex items-center gap-4 mb-8">
                <div className={`w-16 h-16 rounded-full ${stepData.bg} flex items-center justify-center transition-colors duration-500`}>
                    <Icon size={32} className={`${stepData.color}`} />
                </div>
                <div>
                     <div className={`text-3xl font-bold font-display ${stepData.color}`}>{stepData.count}</div>
                     <div className="text-lg font-bold text-gray-700">{stepData.label}</div>
                </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                {inputs.map((val, i) => (
                    <div key={i} className="animate-in slide-in-from-bottom-2 fade-in duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                        <input 
                            value={val}
                            onChange={(e) => updateInput(i, e.target.value)}
                            placeholder={`${stepData.placeholder} (${i+1})`}
                            className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-gray-200 outline-none transition-all font-medium text-gray-700"
                            autoFocus={i === 0}
                        />
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <Button 
                    onClick={handleNext} 
                    disabled={!isStepComplete} 
                    className={`w-full h-14 text-lg shadow-xl transition-all duration-300 ${isStepComplete ? stepData.bg.replace('100', '500') + ' text-white hover:brightness-110' : 'bg-gray-200 text-gray-400'}`}
                >
                    {currentStep === steps.length - 1 ? "Complete" : "Next Sense"}
                </Button>
            </div>
        </div>
    );
};

const NoveltyExercise = ({ onFinish }: { onFinish: () => void }) => {
    const facts = [
        "Octopuses have three hearts.",
        "Bananas are berries, but strawberries aren't.",
        "Honey never spoils.",
        "A group of flamingos is called a 'flamboyance'.",
        "Wombat poop is cube-shaped."
    ];
    const [fact] = useState(facts[Math.floor(Math.random() * facts.length)]);

    return (
        <div className="h-full p-8 flex flex-col items-center justify-center bg-teal-50 text-center">
            <Lightbulb size={48} className="text-teal-500 mb-6 animate-pulse" />
            <h2 className="text-2xl font-bold text-teal-900 mb-4 font-display">Did you know?</h2>
            <div className="bg-white p-6 rounded-2xl shadow-sm mb-12 border border-teal-100">
                <p className="text-xl text-teal-800 font-medium leading-relaxed">{fact}</p>
            </div>
            <Button onClick={onFinish} className="bg-teal-600 text-white w-full max-w-xs shadow-lg shadow-teal-200">Cool!</Button>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
