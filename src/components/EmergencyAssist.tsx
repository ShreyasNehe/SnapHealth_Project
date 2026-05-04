import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Activity, HeartPulse, Wind, Droplets, Thermometer, 
  ChevronRight, ArrowLeft, Phone, Info, AlertCircle, PlayCircle, StopCircle, RefreshCcw
} from 'lucide-react';
import { cn } from '../types';

interface EmergencyMode {
  id: string;
  title: string;
  icon: any;
  color: string;
  steps: { text: string; sub: string; action?: string }[];
  warning: string;
}

const MODES: EmergencyMode[] = [
  {
    id: 'cpr',
    title: 'Adult CPR',
    icon: HeartPulse,
    color: 'bg-red-600',
    warning: 'Confirm the patient is unresponsive and not breathing before starting.',
    steps: [
      { text: 'Check for Responsiveness', sub: 'Tap shoulders and shout. Look for chest rising.' },
      { text: 'Call 911 Immediately', sub: 'Put your phone on speaker and place it near you.' },
      { text: 'Push Hard and Fast', sub: 'Interlock hands in the center of the chest. Push 2 inches deep.', action: '100-120 BPM' },
      { text: 'Allow Chest Recoil', sub: 'Let the chest return to its normal position between compressions.' },
      { text: 'Minimize Interruptions', sub: 'Keep going until paramedics take over or the person moves.' }
    ]
  },
  {
    id: 'choking',
    title: 'Choking (Heimlich)',
    icon: Wind,
    color: 'bg-orange-600',
    warning: 'Ask "Are you choking?" if they can cough or speak, do NOT perform maneuvers.',
    steps: [
      { text: 'Stand Behind Them', sub: 'Wrap your arms around their waist.' },
      { text: 'Make a Fist', sub: 'Place thumb-side of your fist above their navel, below ribs.' },
      { text: 'Thrust Inward and Upward', sub: 'Pull hard. Imagine you are trying to lift the person.' },
      { text: 'Repeat Maneuver', sub: 'Continue until the object is forced out or patient becomes unconscious.' }
    ]
  },
  {
    id: 'bleeding',
    title: 'Severe Bleeding',
    icon: Droplets,
    color: 'bg-red-700',
    warning: 'Always wear gloves if available to prevent infection transmission.',
    steps: [
      { text: 'Apply Direct Pressure', sub: 'Use a clean cloth or gauze. Press hard with both hands.' },
      { text: 'Maintain Pressure', sub: 'Do not lift the cloth to check. If it bleeds through, add more on top.' },
      { text: 'Apply Tourniquet', sub: 'Only for limb bleeding that direct pressure cannot stop. Place 2-3 inches above wound.' },
      { text: 'Elevate Limb', sub: 'Keep the wound above heart level if possible.' }
    ]
  },
  {
    id: 'burns',
    title: 'Major Burns',
    icon: Thermometer,
    color: 'bg-amber-600',
    warning: 'Do NOT apply ice, butter, or ointments to a severe burn.',
    steps: [
      { text: 'Stop the Burning', sub: 'Extinguish flames or remove chemical agent.' },
      { text: 'Cool with Water', sub: 'Run cool (not cold) water for at least 10 minutes.' },
      { text: 'Remove Jewelry', sub: 'Take off rings or restrictive clothing before swelling starts.' },
      { text: 'Cover Loosely', sub: 'Use sterile gauze or a clean plastic wrap (do not wrap tightly).' }
    ]
  }
];

interface EmergencyAssistProps {
  onBack?: () => void;
}

const EmergencyAssist: React.FC<EmergencyAssistProps> = ({ onBack }) => {
  const [selectedMode, setSelectedMode] = useState<EmergencyMode | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [metronomeInterval, setMetronomeInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedMode?.id === 'cpr' && isRunning) {
      const interval = setInterval(() => {
        // Just visual feedback for now
        console.log('Metronome tick');
      }, 500); // 120 BPM
      setMetronomeInterval(interval);
    } else {
      if (metronomeInterval) clearInterval(metronomeInterval);
      setMetronomeInterval(null);
    }
    return () => { if (metronomeInterval) clearInterval(metronomeInterval); };
  }, [isRunning, selectedMode]);

  const handleModeSelect = (mode: EmergencyMode) => {
    setSelectedMode(mode);
    setCurrentStep(0);
    setIsRunning(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {!selectedMode ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between mb-4">
              {onBack && (
                <button 
                  onClick={onBack}
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all uppercase text-[10px] font-black tracking-widest"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Safety Hub
                </button>
              )}
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-red-600 text-white rounded-3xl shadow-2xl animate-pulse ring-8 ring-red-50 mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Panic Mode</h1>
              <p className="text-lg font-bold text-red-600 uppercase tracking-widest">Immediate Tactical Assistance • No Latency Protocol</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode)}
                  className="bg-white p-8 rounded-[40px] border-4 border-white shadow-xl hover:shadow-2xl transition-all text-left flex items-start gap-6 group hover:scale-[1.02]"
                >
                  <div className={cn("p-6 rounded-3xl text-white transition-all shadow-lg group-hover:rotate-6", mode.color)}>
                    <mode.icon className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#0F172A] uppercase tracking-tighter mb-1">{mode.title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Protocol: EMER-ACC-09</p>
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-50 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest transition-all group-hover:bg-medical-blue group-hover:text-white">
                      Start Guidance <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="card-bold p-8 bg-red-900 text-white flex items-center justify-between rounded-[40px] shadow-2xl">
               <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/10 rounded-2xl">
                     <Phone className="w-8 h-8 text-white" />
                  </div>
                  <div>
                     <h4 className="text-xl font-black uppercase tracking-tight">Need Immediate Rescue?</h4>
                     <p className="text-xs font-bold opacity-70 uppercase tracking-widest italic">Global Emergency Signal Active</p>
                  </div>
               </div>
               <button onClick={() => window.location.href = 'tel:911'} className="bg-white text-red-700 px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-100 transition-all">
                  CALL 911
               </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="assist"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
               <button 
                 onClick={() => setSelectedMode(null)}
                 className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all uppercase text-[10px] font-black tracking-widest"
               >
                 <ArrowLeft className="w-4 h-4" /> Exit Panic Mode
               </button>
               <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Live Voice Sync Active</span>
               </div>
            </div>

            <div className={cn("p-12 rounded-[50px] shadow-2xl border-8 border-white text-white relative overflow-hidden min-h-[500px] flex flex-col justify-between", selectedMode.color)}>
               <div className="relative z-10 space-y-10">
                  <div className="flex items-center gap-6">
                     <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                        <selectedMode.icon className="w-10 h-10" />
                     </div>
                     <div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{selectedMode.title}</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mt-1">Step {currentStep + 1} of {selectedMode.steps.length}</p>
                     </div>
                  </div>

                  <motion.div 
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                     <h3 className="text-6xl font-black tracking-tighter uppercase leading-[0.9]">{selectedMode.steps[currentStep].text}</h3>
                     <p className="text-2xl font-bold opacity-90 leading-tight border-l-4 border-white/30 pl-8 uppercase tracking-tight">{selectedMode.steps[currentStep].sub}</p>
                  </motion.div>

                  {selectedMode.id === 'cpr' && currentStep === 2 && (
                    <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[40px] flex items-center justify-between border border-white/20 shadow-inner">
                       <div className="flex items-center gap-6">
                          <Activity className={cn("w-16 h-16 transition-all", isRunning && "animate-[pulse_0.5s_infinite]")} />
                          <div>
                             <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">Rhythm Guidance</p>
                             <p className="text-4xl font-black tracking-tighter uppercase">120 BEATS / MIN</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => setIsRunning(!isRunning)}
                         className="p-8 bg-white text-[#0F172A] rounded-[32px] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                       >
                         {isRunning ? <StopCircle className="w-10 h-10 fill-current" /> : <PlayCircle className="w-10 h-10 fill-current" />}
                       </button>
                    </div>
                  )}
               </div>

               <div className="relative z-10 flex gap-4 pt-10">
                  <button 
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="flex-1 bg-white/10 border-2 border-white/20 py-8 rounded-[32px] font-black uppercase tracking-widest disabled:opacity-30 flex items-center justify-center gap-3"
                  >
                    <ArrowLeft className="w-6 h-6" /> Previous
                  </button>
                  {currentStep < selectedMode.steps.length - 1 ? (
                    <button 
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      className="flex-[2] bg-white text-[#0F172A] py-8 rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:bg-slate-100"
                    >
                      Next Action <ChevronRight className="w-6 h-6" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setSelectedMode(null)}
                      className="flex-[2] bg-green-500 text-white py-8 rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3"
                    >
                      Done / Complete <RefreshCcw className="w-6 h-6" />
                    </button>
                  )}
               </div>

               {/* Background Texture / Animation */}
               <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
                  <HeartPulse className="w-96 h-96 animate-pulse" />
               </div>
            </div>

            <div className="p-8 bg-red-50 border-4 border-red-100 rounded-[40px] flex items-start gap-6">
                <AlertCircle className="w-8 h-8 text-red-600 shrink-0" />
                <div>
                   <h4 className="text-lg font-black text-red-800 uppercase tracking-tight mb-2">Safety Warning</h4>
                   <p className="text-sm font-bold text-red-900/60 uppercase tracking-tighter leading-relaxed">{selectedMode.warning}</p>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmergencyAssist;
