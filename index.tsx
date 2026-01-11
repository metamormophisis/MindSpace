
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
  Ear
} from 'lucide-react';
import { Emotion, EmotionColors, EmotionTextColors, UserState, JournalEntry } from './types';

// --- Configuration & Constants ---

const QUOTES = [
  "Your feelings are valid, even the messy ones.",
  "Progress, not perfection.",
  "You're doing better than you think.",
  "It's okay to rest.",
  "You are enough, exactly as you are."
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

interface Question {
  id: string;
  text: string;
  options: string[];
}

// Detailed Contextual Questions based on Emotion and Intensity Range
const EMOTION_DATA: Record<Emotion, Record<'low' | 'medium' | 'high', Question[]>> = {
  [Emotion.Sad]: {
    low: [
      { id: 'l1', text: "You're feeling a bit down. Is it linked to a specific event?", options: ["Yes, something happened", "No, just a mood", "Not sure yet"] },
      { id: 'l2', text: "How long has this feeling been lingering?", options: ["Just started", "Since this morning", "A few days", "A while"] },
      { id: 'l3', text: "Do you feel low energy physically?", options: ["Yes, tired", "A little bit", "No, physically fine"] },
      { id: 'l4', text: "Is there something you're missing right now?", options: ["A person", "Comfort", "Clarity", "Nothing specific"] },
      { id: 'l5', text: "What usually helps when you feel like this?", options: ["Rest", "Talking", "Distraction", "Time"] }
    ],
    medium: [
      { id: 'm1', text: "This sadness feels present. Is it regarding...", options: ["Work/School", "Relationship", "Self-image", "Life in general"] },
      { id: 'm2', text: "Do you feel like crying?", options: ["Yes, need to let it out", "Maybe later", "No, just heavy", "Already have"] },
      { id: 'm3', text: "Are you tending to isolate yourself?", options: ["Yes, want to be alone", "No, seeking company", "Forced isolation", "Unsure"] },
      { id: 'm4', text: "How is your appetite affected?", options: ["Not hungry", "Eating for comfort", "Normal", "Forgot to eat"] },
      { id: 'm5', text: "Can you pinpoint the main emotion under the sadness?", options: ["Disappointment", "Loneliness", "Regret", "Exhaustion"] }
    ],
    high: [
      { id: 'h1', text: "It seems you are carrying a heavy weight. Are you safe right now?", options: ["Yes, I am safe", "I need help", "Not sure"] },
      { id: 'h2', text: "How does this sadness feel in your body?", options: ["Crushing weight", "Empty/Hollow", "Numbness", "Sharp pain"] },
      { id: 'h3', text: "Have you been able to sleep?", options: ["Too much sleep", "Insomnia", "Restless", "Normal"] },
      { id: 'h4', text: "Do you feel hopeless about the future?", options: ["A little", "Very much", "No, just the present", "It comes and goes"] },
      { id: 'h5', text: "Is there anyone you can trust to talk to right now?", options: ["Yes, family/friend", "Therapist", "No one", "I prefer writing"] }
    ]
  },
  [Emotion.Joyful]: {
    low: [
      { id: 'l1', text: "A nice spark of joy! What caused it?", options: ["A small win", "Good weather", "A text/call", "Just woke up happy"] },
      { id: 'l2', text: "How does it show on your face?", options: ["Small smile", "Relaxed eyes", "Inner glow", "Grinning"] },
      { id: 'l3', text: "Do you want to share this feeling?", options: ["Yes, with friends", "Keeping it to myself", "Maybe later"] },
      { id: 'l4', text: "Is this feeling related to relief?", options: ["Yes, stress ended", "No, pure addition", "A mix of both"] },
      { id: 'l5', text: "What's one color that matches this mood?", options: ["Yellow", "Pink", "Sky Blue", "Green"] }
    ],
    medium: [
      { id: 'm1', text: "You're feeling good! Who helped create this?", options: ["Just me", "Partner/Friend", "Family", "Colleagues"] },
      { id: 'm2', text: "Is this joy connected to an achievement?", options: ["Yes, big accomplishment", "Progress made", "No, situational", "Surprise luck"] },
      { id: 'm3', text: "How is your energy level?", options: ["Buzzing", "Steady & Warm", "Playful", "Content"] },
      { id: 'm4', text: "Does this make you feel motivated?", options: ["Yes, very", "A little", "Just want to relax", "Want to celebrate"] },
      { id: 'm5', text: "Are you grateful for something specific?", options: ["A person", "An opportunity", "My health", "Everything"] }
    ],
    high: [
      { id: 'h1', text: "Incredible joy! Do you feel like...", options: ["Dancing", "Shouting", "Crying happy tears", "Hugging everyone"] },
      { id: 'h2', text: "Is this a milestone moment?", options: ["Life changing", "Yearly highlight", "Long awaited", "Spontaneous bliss"] },
      { id: 'h3', text: "Where do you feel it most?", options: ["Chest/Heart", "Head/Mind", "Hands/Feet", "Whole body"] },
      { id: 'h4', text: "How long have you waited for this?", options: ["A long time", "Unexpected surprise", "Worked hard for it", "It just happened"] },
      { id: 'h5', text: "How will you remember this day?", options: ["Photos", "Journaling", "Celebration", "Quiet reflection"] }
    ]
  },
  [Emotion.Confused]: {
    low: [
      { id: 'l1', text: "A bit foggy? What's the general topic?", options: ["Schedule", "Small decision", "Social interaction", "Random thought"] },
      { id: 'l2', text: "Does it feel like you forgot something?", options: ["Yes", "No", "Maybe"] },
      { id: 'l3', text: "Are you tired?", options: ["Yes, sleepy", "Mentally drained", "No, awake"] },
      { id: 'l4', text: "Can you seek clarification?", options: ["Yes, can ask someone", "Need to Google it", "Just need time", "No clear answer"] },
      { id: 'l5', text: "Is this bothering you or just odd?", options: ["Mildly annoying", "Just weird", "Curious", "Indifferent"] }
    ],
    medium: [
      { id: 'm1', text: "You seem torn. Is this a dilemma?", options: ["Two choices", "Too many choices", "No good choice", "Moral conflict"] },
      { id: 'm2', text: "Who is involved in this confusion?", options: ["Just me", "Partner", "Family", "Boss/Teacher"] },
      { id: 'm3', text: "Is your gut telling you something?", options: ["Yes, but ignoring it", "Silence", "Conflicting signals", "Fear is louder"] },
      { id: 'm4', text: "Do you feel misunderstood?", options: ["Yes", "No", "I don't understand myself"] },
      { id: 'm5', text: "What information are you missing?", options: ["Facts", "Others' feelings", "Future outcome", "My own preference"] }
    ],
    high: [
      { id: 'h1', text: "Deep confusion. Do you feel lost?", options: ["Completely lost", "Stuck in a loop", "Spinning out", "Paralyzed"] },
      { id: 'h2', text: "Is this about your identity or path?", options: ["Career", "Identity/Self", "Relationship status", "Life purpose"] },
      { id: 'h3', text: "Does the confusion feel physical?", options: ["Dizziness", "Headache", "Nausea", "Disassociation"] },
      { id: 'h4', text: "Are you overwhelmed by advice?", options: ["Too many opinions", "No one helps", "Conflicting advice", "Scared to ask"] },
      { id: 'h5', text: "What's the worst case if you pick wrong?", options: ["Failure", "Regret", "Hurting someone", "Unknown"] }
    ]
  },
  [Emotion.Bored]: {
    low: [
      { id: 'l1', text: "Just a lull in the day?", options: ["Yes, routine", "Waiting for something", "Procrastinating", "Just woke up"] },
      { id: 'l2', text: "Do you have energy to do something?", options: ["Yes, but what?", "No, lazy", "Mental energy only"] },
      { id: 'l3', text: "Is your phone making it worse?", options: ["Yes, doomscrolling", "No, it helps", "Not using it"] },
      { id: 'l4', text: "What would happen if you did nothing?", options: ["It's fine", "I'd feel guilty", "I'd fall asleep"] },
      { id: 'l5', text: "Are you avoiding a task?", options: ["Yes, chores", "Yes, work", "No, truly free"] }
    ],
    medium: [
      { id: 'm1', text: "This feels deeper than waiting. Is it...", options: ["Lack of purpose", "Repetitive routine", "Loneliness", "Burnout"] },
      { id: 'm2', text: "Does anything seem appealing?", options: ["Food", "TV/Games", "Going out", "Nothing really"] },
      { id: 'm3', text: "Are you stuck in a place you don't like?", options: ["Yes, physically", "Yes, mentally", "No, just bored"] },
      { id: 'm4', text: "Do you feel under-stimulated?", options: ["Brain needs challenge", "Body needs movement", "Heart needs connection"] },
      { id: 'm5', text: "When was the last time you had fun?", options: ["Yesterday", "Last week", "Can't remember", "A while ago"] }
    ],
    high: [
      { id: 'h1', text: "This boredom feels painful. Is it apathy?", options: ["Yes, nothing matters", "I want to care but can't", "It feels empty", "Just restless"] },
      { id: 'h2', text: "Are you feeling trapped?", options: ["Yes, in life", "Yes, in this room", "By expectations", "By my mind"] },
      { id: 'h3', text: "Do you feel disconnected from others?", options: ["Yes, invisible", "No, just uninterested", "They seem boring too"] },
      { id: 'h4', text: "Is this a sign you need a big change?", options: ["Yes, new job", "Yes, new city", "Yes, new hobby", "Maybe"] },
      { id: 'h5', text: "What's the smallest step you could take?", options: ["Stand up", "Drink water", "Open a window", "Text someone"] }
    ]
  },
  [Emotion.Stressed]: {
    low: [
      { id: 'l1', text: "A bit of pressure. What's the source?", options: ["To-do list", "Running late", "Small conflict", "Upcoming plan"] },
      { id: 'l2', text: "Is it manageable?", options: ["Yes, just annoying", "Will pass soon", "Need to focus", "Could get worse"] },
      { id: 'l3', text: "Where is the tension?", options: ["Shoulders", "Jaw", "Stomach", "Mind"] },
      { id: 'l4', text: "Did you take a break recently?", options: ["Yes, No", "Can't right now"] },
      { id: 'l5', text: "Is this good stress (excitement)?", options: ["A little bit", "No, just stress", "Anticipation"] }
    ],
    medium: [
      { id: 'm1', text: "The pressure is rising. Is it deadlines?", options: ["Yes, work/school", "Financial", "Social expectation", "Internal pressure"] },
      { id: 'm2', text: "Are you multitasking?", options: ["Yes, too much", "Trying to", "No, hyper-focused", "Frozen"] },
      { id: 'm3', text: "How is your breathing?", options: ["Shallow", "Fast", "Holding it", "Normal"] },
      { id: 'm4', text: "Are you being hard on yourself?", options: ["Yes, perfectionist", "Feeling inadequate", "Just realistic", "No"] },
      { id: 'm5', text: "What can be dropped from the list?", options: ["One task", "Social event", "Chore", "Nothing"] }
    ],
    high: [
      { id: 'h1', text: "You seem overwhelmed. Are you nearing burnout?", options: ["Yes, fried", "Close to breaking", "Adrenaline only", "Unsure"] },
      { id: 'h2', text: "Is your body sounding an alarm?", options: ["Migraine", "Panic attacks", "Insomnia", "Digestive issues"] },
      { id: 'h3', text: "Do you feel like you have control?", options: ["None at all", "Slipping away", "Only over small things", "Chaos"] },
      { id: 'h4', text: "Are you neglecting basic needs?", options: ["Sleep", "Food", "Hygiene", "All of them"] },
      { id: 'h5', text: "What is the very next thing you must do?", options: ["Just breathe", "Ask for help", "Finish one thing", "Rest"] }
    ]
  },
  [Emotion.Angry]: {
    low: [
      { id: 'l1', text: "Something annoyed you. Was it...", options: ["A rude comment", "A minor inconvenience", "Tech issue", "Traffic/Delay"] },
      { id: 'l2', text: "Will this matter tomorrow?", options: ["Probably not", "Maybe", "No", "Yes"] },
      { id: 'l3', text: "Are you hungry or tired?", options: ["Hungry (Hangry)", "Tired", "Both", "Neither"] },
      { id: 'l4', text: "Did you express it?", options: ["Sighed", "Rolled eyes", "Kept it in", "Complained"] },
      { id: 'l5', text: "Can you shake it off?", options: ["Yes, easily", "Need a minute", "It's sticking", "Trying to"] }
    ],
    medium: [
      { id: 'm1', text: "You're frustrated. Was a boundary crossed?", options: ["Yes, disrespect", "My time wasted", "Ignored", "Unfairness"] },
      { id: 'm2', text: "Who is the target?", options: ["Partner/Family", "Colleague", "Stranger", "Myself"] },
      { id: 'm3', text: "Do you feel hot or tense?", options: ["Face hot", "Fists clenched", "Chest tight", "Restless"] },
      { id: 'm4', text: "Are you replaying the scene?", options: ["Yes, over and over", "Thinking of comebacks", "Trying to stop", "No"] },
      { id: 'm5', text: "What do you want to do?", options: ["Vent/Rant", "Fix it", "Leave", "Confront"] }
    ],
    high: [
      { id: 'h1', text: "This is rage. Do you feel explosive?", options: ["Yes, want to scream", "Want to break something", "Scary calm", "Shaking"] },
      { id: 'h2', text: "Is this a buildup of many things?", options: ["Yes, straw that broke camel's back", "Years of this", "No, sudden event", "Betrayal"] },
      { id: 'h3', text: "Do you feel unheard or powerless?", options: ["Unheard", "Powerless", "Disrespected", "Threatened"] },
      { id: 'h4', text: "How can you safely release this energy?", options: ["Exercise/Run", "Scream into pillow", "Write angry letter", "Deep breathing"] },
      { id: 'h5', text: "Is there a risk of hurting a relationship?", options: ["Yes, regret likely", "Don't care right now", "Trying to control it", "Maybe"] }
    ]
  }
};

// --- Components ---

// 1. Blob Character Component
const Blob = ({ emotion, intensity = 5, className = "w-32 h-32" }: { emotion: Emotion, intensity?: number, className?: string }) => {
  const getShape = () => {
    switch(emotion) {
      case Emotion.Sad: return "M50,15 Q80,25 80,60 Q80,95 50,95 Q20,95 20,60 Q20,25 50,15";
      case Emotion.Joyful: return "M50,15 Q65,0 80,15 Q95,30 80,50 Q95,70 80,85 Q65,100 50,85 Q35,100 20,85 Q5,70 20,50 Q5,30 20,15 Q35,0 50,15 Z";
      case Emotion.Confused: return "M50,5 L90,25 L90,75 L50,95 L10,75 L10,25 Z";
      case Emotion.Bored: return "M50, 5 A 45 45 0 1 1 50 95 A 45 45 0 1 1 50 5";
      case Emotion.Stressed: return "M50,10 L90,85 L10,85 Z";
      case Emotion.Angry: return "M10,10 L90,10 L90,90 L10,90 Z";
      default: return "M50, 5 A 45 45 0 1 1 50 95 A 45 45 0 1 1 50 5";
    }
  };

  const getFace = () => {
    const isHigh = intensity > 6;
    const color = EmotionTextColors[emotion] || '#333333'; // Fallback color
    switch(emotion) {
      case Emotion.Sad:
        return (
          <g transform="translate(50, 50)" fill={color}>
            <path d="M-15,-2 Q-10,2 -5,-2" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M5,-2 Q10,2 15,-2" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M-10,15 Q0,5 10,15" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round"/>
            {isHigh && <circle cx="12" cy="10" r="2" fill={color} opacity="0.6" />}
          </g>
        );
      case Emotion.Joyful:
        return (
          <g transform="translate(50, 50)" fill={color}>
            <path d="M-15,-5 Q-10,-15 -5,-5" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M5,-5 Q10,-15 15,-5" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M-12,10 Q0,25 12,10" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round"/>
          </g>
        );
      case Emotion.Confused:
        return (
          <g transform="translate(50, 50)">
             <path d="M-15,-5 A 4 4 0 0 1 -7 -5 A 4 4 0 0 1 -15 -5" stroke={color} fill="none" strokeWidth="3" />
             <path d="M7,-5 A 5 5 0 0 0 17 -5 A 5 5 0 0 0 7 -5" stroke={color} fill="none" strokeWidth="3" />
             <path d="M-5,15 L5,15" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        );
      case Emotion.Bored:
        return (
          <g transform="translate(50, 50)">
             <circle cx="-12" cy="-5" r="5" fill="white" />
             <circle cx="-10" cy="-5" r="2" fill={color} />
             <circle cx="12" cy="-5" r="5" fill="white" />
             <circle cx="14" cy="-5" r="2" fill={color} />
             <path d="M-8,15 L8,15" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        );
      case Emotion.Stressed:
        return (
          <g transform="translate(50, 60)">
             <path d="M-15,-10 L-5,-5" stroke={color} strokeWidth="4" strokeLinecap="round" />
             <path d="M-15,-5 L-5,-10" stroke={color} strokeWidth="4" strokeLinecap="round" />
             <path d="M5,-10 L15,-5" stroke={color} strokeWidth="4" strokeLinecap="round" />
             <path d="M5,-5 L15,-10" stroke={color} strokeWidth="4" strokeLinecap="round" />
             <path d="M-5,10 L0,5 L5,10" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );
      case Emotion.Angry:
        return (
          <g transform="translate(50, 50)">
            <path d="M-18,-15 L-5,-10" stroke={color} strokeWidth="4" strokeLinecap="round" />
            <path d="M18,-15 L5,-10" stroke={color} strokeWidth="4" strokeLinecap="round" />
            <circle cx="-10" cy="-5" r="3" fill={color} />
            <circle cx="10" cy="-5" r="3" fill={color} />
            <path d="M-10,15 L10,15" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        );
      default: return null;
    }
  };

  return (
    <div className={`${className} transition-transform duration-500 ease-in-out`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
         <path 
           d={getShape()} 
           fill={EmotionColors[emotion] || '#CCCCCC'} 
           className="transition-all duration-700 ease-in-out"
           style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }}
         >
         </path>
         {getFace()}
      </svg>
    </div>
  );
};

// 2. Shared UI Components

const Button = ({ children, onClick, variant = 'primary', className = "", disabled=false }: any) => {
  const baseStyle = "px-6 py-3 rounded-full font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm";
  const variants = {
    primary: "bg-[#333333] text-white hover:bg-black",
    secondary: "bg-white text-[#333333] border border-gray-200 hover:bg-gray-50",
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
  <div onClick={onClick} className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
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
    <div className="h-full w-full bg-[#FAF9F6] flex flex-col font-sans">
      <div className="flex-1 overflow-hidden relative">
        {renderView()}
      </div>
      {view !== 'auth' && view !== 'journal' && (
        <div className="bg-white border-t border-gray-100 h-20 pb-4 px-6 flex justify-around items-center absolute bottom-0 w-full z-50">
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
  <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 transition-colors ${active ? 'text-[#333333]' : 'text-gray-400'}`}>
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-xs font-semibold">{label}</span>
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
    <div className="h-full w-full flex flex-col items-center justify-center p-8 relative overflow-hidden bg-gradient-to-b from-[#FAF9F6] to-[#E6F3FF]">
      <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-[#FFD93D] rounded-full opacity-20 blur-2xl animate-pulse-slow"></div>
      <div className="absolute bottom-[-20px] right-[-20px] w-60 h-60 bg-[#95E1D3] rounded-full opacity-20 blur-2xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md z-10 flex flex-col items-center">
        <Blob emotion={Emotion.Joyful} className="w-32 h-32 mb-6 animate-float" />
        <h1 className="text-3xl font-display font-bold text-[#333333] mb-2">MindfulSpace</h1>
        <p className="text-gray-500 mb-8">Your Safe Space for Feelings</p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input type="email" placeholder="Email" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#95E1D3] focus:ring-2 focus:ring-[#95E1D3]/20 outline-none transition-all bg-white" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input type="password" placeholder="Password" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#95E1D3] focus:ring-2 focus:ring-[#95E1D3]/20 outline-none transition-all bg-white" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-[#FF6B6B] text-sm text-center bg-[#FF6B6B]/10 py-2 rounded-lg">{error}</p>}
          <Button onClick={handleSubmit} className="w-full shadow-lg shadow-teal-100">
            {isLogin ? 'Login' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-4">
          <button className="text-sm text-gray-500 hover:text-[#333333]">Forgot Password?</button>
          <div className="flex items-center gap-2 w-full">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-gray-400 text-xs uppercase">Or</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          <button onClick={() => setIsLogin(!isLogin)} className="text-[#333333] font-semibold text-sm hover:underline">
            {isLogin ? "New here? Create Account" : "Have an account? Login"}
          </button>
        </div>
      </div>
      <div className="absolute bottom-6 flex flex-col items-center gap-1 opacity-60">
        <Shield className="w-4 h-4 text-teal-600" />
        <p className="text-[10px] text-gray-500">Your data is encrypted & private</p>
      </div>
    </div>
  );
};

const HomeView = ({ user, onStartJournal }: { user: UserState, onStartJournal: (e: Emotion) => void }) => {
  const [dailyQuote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [wellnessAnswered, setWellnessAnswered] = useState(false);

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-24">
      <div className="p-6 pt-12 pb-8 bg-white rounded-b-[40px] shadow-sm mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-[#333333]">Hi {user.name}! <span className="inline-block animate-bounce">👋</span></h1>
            <p className="text-gray-500">How are you feeling today?</p>
          </div>
          <div className="flex flex-col items-center bg-orange-50 px-3 py-2 rounded-2xl border border-orange-100">
            <Flame className="text-orange-500 w-5 h-5 fill-current" />
            <span className="text-xs font-bold text-orange-600">{user.streak} days</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4 mb-4">
          {Object.values(Emotion).map((emotion) => (
            <button key={emotion} onClick={() => onStartJournal(emotion)} className="flex flex-col items-center gap-2 group">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all transform group-hover:scale-110 group-active:scale-95 shadow-sm">
                <Blob emotion={emotion} className="w-20 h-20 drop-shadow-md" />
              </div>
              <span className="text-xs font-bold text-gray-600">{emotion}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="px-6 grid gap-4">
        <Card className="bg-[#FAF9F6] border-none !bg-opacity-50">
           <div className="flex items-start gap-3">
             <div className="bg-purple-100 p-2 rounded-full"><Zap className="w-4 h-4 text-purple-600" /></div>
             <div>
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Daily Reflection</h3>
               <p className="text-[#333333] font-display font-medium italic">"{dailyQuote}"</p>
             </div>
           </div>
        </Card>
        {!wellnessAnswered ? (
          <Card>
            <h3 className="font-bold text-[#333333] mb-1">Quick Check</h3>
            <p className="text-sm text-gray-500 mb-4">{WELLNESS_QUESTIONS[0]}</p>
            <div className="flex gap-3">
              <button onClick={() => setWellnessAnswered(true)} className="flex-1 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors">Yes</button>
              <button onClick={() => setWellnessAnswered(true)} className="flex-1 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">No</button>
            </div>
          </Card>
        ) : (
           <Card className="bg-green-50 border-green-100 flex items-center gap-3">
             <div className="bg-green-100 p-2 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
             <p className="text-green-800 font-medium text-sm">Thanks for checking in!</p>
           </Card>
        )}
      </div>
    </div>
  );
};

const JournalFlow = ({ emotion, intensity, setIntensity, onComplete }: any) => {
  const [step, setStep] = useState(1); 
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [journalText, setJournalText] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [crisisDetected, setCrisisDetected] = useState(false);

  const bgColor = EmotionColors[emotion] || '#f0f0f0';
  const textColor = EmotionTextColors[emotion] || '#333333';
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(1, s - 1));
  const intensityRange = getIntensityRange(intensity);

  // Step 1: Intensity
  if (step === 1) {
    return (
      <div className="h-full flex flex-col p-8 transition-colors duration-500" style={{ backgroundColor: bgColor }}>
        <button onClick={onComplete} className="self-start p-2 bg-white/20 rounded-full text-white/80 hover:bg-white/40 mb-4"><X size={24} /></button>
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold font-display mb-8" style={{ color: textColor }}>How {emotion.toLowerCase()} are you?</h2>
          <div className="mb-12 scale-150"><Blob emotion={emotion} intensity={intensity} className="w-40 h-40" /></div>
          <div className="w-full max-w-xs relative h-12 flex items-center">
            <div className="absolute w-full h-2 bg-black/10 rounded-full"></div>
            <input type="range" min="1" max="10" value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))} className="w-full absolute z-10 opacity-0 cursor-pointer h-12" />
            <div className="absolute h-6 w-6 bg-white rounded-full shadow-lg pointer-events-none transition-all duration-75 ease-out flex items-center justify-center text-xs font-bold" style={{ left: `calc(${(intensity - 1) * 11}% - 12px)`, color: textColor }}>{intensity}</div>
          </div>
          <div className="flex justify-between w-full max-w-xs mt-4 text-sm font-semibold opacity-60" style={{ color: textColor }}><span>A little</span><span>Very {emotion}</span></div>
        </div>
        <Button onClick={nextStep} className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white shadow-none">Next <ChevronRight className="inline ml-1 w-4 h-4" /></Button>
      </div>
    );
  }

  // Step 2: Questions
  if (step === 2) {
    // Safety check: Ensure the emotion and range exist in EMOTION_DATA
    const questions = EMOTION_DATA[emotion as Emotion]?.[intensityRange] || [];
    const currentQIndex = Object.keys(answers).length;
    const currentQ = questions[currentQIndex];

    const generateJournalPrompt = async () => {
      setIsGeneratingPrompt(true);
      setStep(3);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        const prompt = `User is feeling ${emotion} (intensity ${intensity}/10). They answered: ${JSON.stringify(answers)}. Generate a short, warm, single-sentence journaling prompt. Direct address ("you"). Return ONLY the text.`;
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        setGeneratedPrompt(response.text.trim() || `What's on your mind about feeling ${emotion}?`);
      } catch (e) {
        setGeneratedPrompt(`What is occupying your thoughts while feeling ${emotion} right now?`);
      } finally {
        setIsGeneratingPrompt(false);
        setStep(4);
      }
    };

    if (!currentQ) {
       if (!isGeneratingPrompt && step === 2) { generateJournalPrompt(); }
       return null;
    }

    return (
      <div className="h-full flex flex-col p-6 transition-colors duration-500" style={{ backgroundColor: bgColor }}>
        <div className="flex justify-between items-center mb-8">
           <button onClick={prevStep} className="text-white/60 hover:text-white"><ChevronLeft /></button>
           <button onClick={generateJournalPrompt} className="text-sm font-bold text-white/60 hover:text-white">Skip</button>
        </div>
        <div className="flex-1">
           <div className="bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-semibold text-white/80 mb-6 uppercase tracking-wider">Question {currentQIndex + 1} of {questions.length}</div>
           <h2 className="text-2xl font-bold font-display mb-8 leading-snug" style={{ color: textColor }}>{currentQ.text}</h2>
           <div className="space-y-3">
             {currentQ.options.map((opt) => (
               <button key={opt} onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt }))} className="w-full p-4 rounded-xl bg-white/30 backdrop-blur-sm text-left font-semibold text-white/90 hover:bg-white/50 transition-all active:scale-98">{opt}</button>
             ))}
           </div>
        </div>
        <div className="flex justify-center gap-2 mb-4">
           {questions.map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full ${i <= currentQIndex ? 'bg-white' : 'bg-white/30'}`} />))}
        </div>
      </div>
    );
  }

  // Step 3: Loading
  if (step === 3) {
    return (
       <div className="h-full flex flex-col items-center justify-center p-8 transition-colors duration-500" style={{ backgroundColor: bgColor }}>
          <div className="relative">
             <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse"></div>
             <Sparkles className="w-16 h-16 text-white relative z-10 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold font-display text-white mt-8 mb-2">Crafting your reflection...</h2>
       </div>
    );
  }

  // Step 4: Write
  if (step === 4) {
    const promptText = generatedPrompt;
    const checkCrisis = (text: string) => {
       const keywords = ["suicide", "kill myself", "die", "end it", "better off dead"];
       setCrisisDetected(keywords.some(k => text.toLowerCase().includes(k)));
       setJournalText(text);
    };

    const handleSubmitJournal = async () => {
      if (crisisDetected) return; 
      setIsLoadingAi(true);
      setStep(5);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        const prompt = `User: ${emotion} (${intensity}/10). Text: "${journalText}". Context: ${JSON.stringify(answers)}. Respond JSON: { "acknowledgment": string, "observation": string, "reframe": string }. Supportive, no medical advice.`;
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt, config: { responseMimeType: "application/json" } });
        setAiResponse(response.text);
      } catch (e) {
        setAiResponse(JSON.stringify({ acknowledgment: "Thank you for sharing.", observation: "You're carrying a lot.", reframe: "Be gentle with yourself." }));
      } finally { setIsLoadingAi(false); }
    };

    if (crisisDetected) {
       return (
         <div className="h-full bg-red-50 p-6 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">I'm worried about you.</h2>
            <div className="w-full bg-white p-6 rounded-2xl shadow-sm mb-6 border border-red-100">
               <h3 className="font-bold text-gray-800 mb-4">Please reach out:</h3>
               <div className="space-y-3">
                 <button className="w-full flex items-center justify-center gap-2 p-3 bg-red-100 text-red-700 rounded-xl font-bold"><Phone size={18} /> Call 988 (US)</button>
               </div>
            </div>
            <button onClick={() => setCrisisDetected(false)} className="text-gray-400 text-sm underline">I am safe, go back</button>
         </div>
       );
    }

    return (
      <div className="h-full flex flex-col bg-[#FAF9F6]">
         <div className="p-4 flex items-center bg-white border-b border-gray-100">
            <button onClick={() => setStep(2)}><ChevronLeft className="text-gray-400" /></button>
            <span className="flex-1 text-center font-bold text-gray-600">Journal</span>
            <div className="w-6"></div>
         </div>
         <div className="flex-1 p-6 overflow-y-auto">
            <div className="bg-yellow-50/50 p-6 rounded-xl border border-yellow-100 mb-6 relative shadow-sm">
              <div className="absolute -left-1 top-6 w-1 h-8 bg-yellow-400 rounded-r"></div>
              <div className="flex items-start gap-3"><PenTool className="w-5 h-5 text-yellow-600 mt-1 shrink-0" /><p className="text-[#333333] font-display font-medium italic text-lg leading-relaxed">"{promptText}"</p></div>
            </div>
            <textarea className="w-full h-64 bg-transparent border-none outline-none text-lg text-[#333333] placeholder-gray-300 resize-none leading-relaxed mt-4" style={{ backgroundImage: 'linear-gradient(transparent, transparent 31px, #E5E7EB 31px)', backgroundSize: '100% 32px', lineHeight: '32px' }} placeholder="Start typing here..." value={journalText} onChange={(e) => checkCrisis(e.target.value)} autoFocus />
         </div>
         <div className="p-6 bg-white border-t border-gray-100"><Button onClick={handleSubmitJournal} className="w-full" disabled={journalText.length < 5}>Complete Check-in</Button></div>
      </div>
    );
  }

  // Step 5: Analysis
  if (step === 5) {
     if (isLoadingAi) {
        return (
          <div className="h-full flex flex-col items-center justify-center bg-white">
             <Blob emotion={emotion} className="w-32 h-32 animate-float mb-6" />
             <p className="text-gray-500 font-medium animate-pulse">Reflecting on your thoughts...</p>
          </div>
        );
     }
     const analysis = aiResponse ? JSON.parse(aiResponse) : {};
     return (
       <div className="h-full flex flex-col p-6 overflow-y-auto" style={{ backgroundColor: bgColor + '30' }}>
          <div className="mt-8 mb-6 flex justify-center"><div className="bg-white p-4 rounded-full shadow-sm"><Blob emotion={emotion} intensity={3} className="w-20 h-20" /></div></div>
          <div className="space-y-4">
             <Card className="animate-in slide-in-from-bottom-4 duration-700 fade-in">
                <div className="flex items-center gap-2 mb-2 text-purple-600"><Heart size={16} fill="currentColor" /><span className="text-xs font-bold uppercase tracking-wide">I hear you</span></div>
                <p className="text-lg font-display text-[#333333] leading-relaxed">{analysis.acknowledgment}</p>
             </Card>
             <Card className="animate-in slide-in-from-bottom-8 duration-1000 fade-in" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-2 mb-2 text-blue-600"><Eye size={16} /><span className="text-xs font-bold uppercase tracking-wide">What I notice</span></div>
                <p className="text-gray-700">{analysis.observation}</p>
             </Card>
             <Card className="animate-in slide-in-from-bottom-12 duration-1000 fade-in" style={{ animationDelay: '400ms' }}>
                 <div className="flex items-center gap-2 mb-2 text-teal-600"><Sun size={16} /><span className="text-xs font-bold uppercase tracking-wide">A gentle thought</span></div>
                <p className="text-gray-700 italic">{analysis.reframe}</p>
             </Card>
          </div>
          <div className="flex-1"></div>
          <div className="mt-8">
             <p className="text-center text-sm text-gray-500 mb-4">Let's try a quick exercise to help.</p>
             <Button onClick={() => setStep(6)} className="w-full bg-[#333333] text-white">Let's try this</Button>
             <button onClick={onComplete} className="w-full py-4 text-gray-500 text-sm font-semibold">Maybe later</button>
          </div>
       </div>
     );
  }

  // Step 6: Exercise
  if (step === 6) {
    if (emotion === Emotion.Angry || emotion === Emotion.Stressed) {
       return <BreathingExercise onFinish={onComplete} autoStart={true} />;
    }
    if (emotion === Emotion.Sad || emotion === Emotion.Confused) {
       return <GroundingExercise onFinish={onComplete} />;
    }
    return <GratitudeExercise onFinish={onComplete} />;
  }
  return null;
};

// --- Missing Views ---

const DashboardView = () => (
  <div className="h-full p-6 pb-24 overflow-y-auto">
    <h1 className="text-2xl font-bold font-display text-[#333333] mb-6">Your Insights</h1>
    <Card className="mb-4">
      <div className="flex items-center gap-3 mb-4"><div className="bg-orange-100 p-2 rounded-full"><Flame className="w-5 h-5 text-orange-600" /></div><h3 className="font-bold text-gray-800">Current Streak</h3></div>
      <div className="text-4xl font-bold text-[#333333] mb-1">5 Days</div>
    </Card>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <Card><h3 className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-2">Top Emotion</h3><div className="text-xl font-bold text-gray-800">Joyful</div></Card>
      <Card><h3 className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-2">Total Entries</h3><div className="text-xl font-bold text-gray-800">24</div></Card>
    </div>
    <Card>
      <h3 className="font-bold text-gray-800 mb-4">Weekly Mood</h3>
      <div className="h-32 flex items-end justify-between px-2 gap-2">
        {[4, 6, 3, 7, 5, 8, 6].map((h, i) => (<div key={i} className="w-full bg-blue-100 rounded-t-lg relative group"><div className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all" style={{ height: `${h * 10}%` }}></div></div>))}
      </div>
    </Card>
  </div>
);

const CalmView = () => {
  const [activeSession, setActiveSession] = useState<string | null>(null);

  if (activeSession) {
    return (
      <div className="h-full relative">
        <button onClick={() => setActiveSession(null)} className="absolute top-6 left-6 z-10 p-2 bg-white/50 rounded-full hover:bg-white"><X size={24} className="text-gray-600" /></button>
        <BreathingExercise onFinish={() => setActiveSession(null)} autoStart={false} />
      </div>
    );
  }

  return (
    <div className="h-full p-6 pb-24 overflow-y-auto bg-teal-50/30">
      <h1 className="text-2xl font-bold font-display text-[#333333] mb-2">Calm Space</h1>
      <p className="text-gray-500 mb-6">Take a moment to breathe and center yourself.</p>
      <div className="space-y-4">
        <Card onClick={() => setActiveSession('breathing')} className="bg-white border-teal-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
           <div className="h-32 bg-teal-100 flex items-center justify-center relative overflow-hidden">
               <div className="absolute w-64 h-64 bg-teal-200/50 rounded-full blur-3xl -top-10 -right-10"></div>
               <Wind className="w-12 h-12 text-teal-600 relative z-10" />
           </div>
           <div className="p-4">
              <h3 className="font-bold text-gray-800 text-lg">4-7-8 Breathing</h3>
              <p className="text-gray-500 text-sm mt-1">A simple technique to reduce anxiety.</p>
              <div className="mt-3 flex items-center text-teal-600 text-sm font-bold">Start Session <ChevronRight size={16} /></div>
           </div>
        </Card>
      </div>
    </div>
  );
};

const ProfileView = ({ user, onLogout }: { user: UserState, onLogout: () => void }) => (
  <div className="h-full p-6 pb-24 overflow-y-auto">
    <h1 className="text-2xl font-bold font-display text-[#333333] mb-8">Profile</h1>
    <div className="flex items-center gap-4 mb-8">
       <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl">{user.name.charAt(0).toUpperCase()}</div>
       <div><h2 className="text-xl font-bold text-gray-800">{user.name}</h2><p className="text-gray-500 text-sm">{user.email}</p></div>
    </div>
    <div className="space-y-2">
       <div className="p-4 bg-white rounded-xl flex items-center justify-between shadow-sm border border-gray-100"><div className="flex items-center gap-3 text-gray-700"><Settings className="w-5 h-5 text-gray-400" /><span className="font-medium">Settings</span></div><ChevronRight size={18} className="text-gray-400" /></div>
       <div className="p-4 bg-white rounded-xl flex items-center justify-between shadow-sm border border-gray-100"><div className="flex items-center gap-3 text-gray-700"><Shield className="w-5 h-5 text-gray-400" /><span className="font-medium">Privacy & Data</span></div><ChevronRight size={18} className="text-gray-400" /></div>
    </div>
    <button onClick={onLogout} className="mt-8 w-full py-3 text-red-500 font-bold bg-red-50 rounded-xl hover:bg-red-100 transition-colors">Log Out</button>
  </div>
);

const BreathingExercise = ({ onFinish, autoStart = false }: { onFinish: () => void, autoStart?: boolean }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'ready'>('ready');
  const [cycles, setCycles] = useState(0);
  
  const startSession = () => {
    setPhase('inhale');
    setCycles(0);
  };

  useEffect(() => {
    if (phase === 'ready') {
      if (autoStart) startSession();
      return;
    }

    let timeoutId: any;
    if (phase === 'inhale') {
      timeoutId = setTimeout(() => setPhase('hold'), 5000);
    } else if (phase === 'hold') {
      timeoutId = setTimeout(() => setPhase('exhale'), 4000);
    } else if (phase === 'exhale') {
      timeoutId = setTimeout(() => {
        if (cycles + 1 >= 3) {
           onFinish();
        } else {
           setCycles(c => c + 1);
           setPhase('inhale');
        }
      }, 5000);
    }
    return () => clearTimeout(timeoutId);
  }, [phase, autoStart, cycles]);

  const getDuration = () => {
    switch(phase) {
      case 'inhale': return 5000;
      case 'hold': return 4000;
      case 'exhale': return 5000;
      default: return 1000;
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-blue-50 p-6 relative overflow-hidden">
       <div 
          className={`w-64 h-64 bg-blue-300 rounded-full blur-3xl absolute transition-all ease-in-out ${phase === 'inhale' ? 'scale-150 opacity-60' : phase === 'exhale' ? 'scale-50 opacity-20' : 'scale-100 opacity-40'}`}
          style={{ transitionDuration: `${getDuration()}ms` }}
       ></div>
       <div className="z-10 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-8 transition-all" style={{ transitionDuration: '500ms' }}>
            {phase === 'ready' && "Breathing Space"}
            {phase === 'inhale' && "Breathe In..."}
            {phase === 'hold' && "Hold..."}
            {phase === 'exhale' && "Breathe Out..."}
          </h2>
          {phase === 'ready' ? (
             <Button onClick={startSession} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">Start Session</Button>
          ) : (
            <div 
              className={`w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-lg transition-all ease-in-out ${phase === 'inhale' ? 'scale-125' : phase === 'exhale' ? 'scale-90' : 'scale-100'}`}
              style={{ transitionDuration: `${getDuration()}ms` }}
            >
               <span className="text-4xl font-bold text-blue-500">{cycles + 1}/3</span>
            </div>
          )}
       </div>
       <button onClick={onFinish} className="absolute bottom-10 text-blue-400 font-semibold hover:text-blue-600">{phase === 'ready' ? 'Go Back' : 'End Session'}</button>
    </div>
  );
};

const GratitudeExercise = ({ onFinish }: { onFinish: () => void }) => {
  const [items, setItems] = useState(['', '', '']);
  const updateItem = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index] = val;
    setItems(newItems);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-pink-50">
       <h2 className="text-2xl font-bold text-pink-900 mb-2 mt-8">Three Good Things</h2>
       <p className="text-pink-700 mb-8">Shift your focus by listing three small things you are grateful for right now.</p>
       <div className="space-y-4 flex-1">
         {items.map((item, i) => (
           <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center font-bold shrink-0 mt-2">{i + 1}</div>
              <input value={item} onChange={(e) => updateItem(i, e.target.value)} placeholder="I am grateful for..." className="w-full p-4 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-pink-300 outline-none" />
           </div>
         ))}
       </div>
       <Button onClick={onFinish} className="w-full bg-pink-500 hover:bg-pink-600 text-white shadow-pink-200 shadow-lg" disabled={items.some(i => !i.trim())}>Complete</Button>
    </div>
  );
};

const GroundingExercise = ({ onFinish }: { onFinish: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { count: 5, label: "Things you can see", icon: Eye, color: "text-blue-600", bg: "bg-blue-100" },
    { count: 4, label: "Things you can touch", icon: Hand, color: "text-teal-600", bg: "bg-teal-100" },
    { count: 3, label: "Things you can hear", icon: Ear, color: "text-purple-600", bg: "bg-purple-100" },
    { count: 2, label: "Things you can smell", icon: Wind, color: "text-orange-600", bg: "bg-orange-100" },
    { count: 1, label: "Thing you can taste", icon: Coffee, color: "text-pink-600", bg: "bg-pink-100" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      onFinish();
    }
  };

  const stepData = steps[currentStep];
  const Icon = stepData.icon;

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-white transition-all duration-500">
       <h2 className="text-2xl font-bold font-display text-[#333333] mb-2">Grounding Technique</h2>
       <p className="text-gray-500 mb-12 text-center">Bring yourself back to the present moment.</p>

       <div className={`w-32 h-32 rounded-full ${stepData.bg} flex items-center justify-center mb-8 transition-colors duration-500`}>
          <Icon size={48} className={stepData.color} />
       </div>

       <div className="text-center mb-12">
          <div className={`text-6xl font-bold mb-2 ${stepData.color}`}>{stepData.count}</div>
          <div className="text-xl text-gray-700 font-medium">{stepData.label}</div>
          <p className="text-gray-400 text-sm mt-2">Look around and name them mentally.</p>
       </div>

       <Button onClick={handleNext} className="w-full max-w-xs">
          {currentStep === steps.length - 1 ? "Complete" : "Next"}
       </Button>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
