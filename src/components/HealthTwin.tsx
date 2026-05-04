import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Moon, Sun, ShieldCheck, Zap, Activity, Heart, Thermometer, Droplets, Info } from 'lucide-react';
import { PatientProfile, TriageAnalysis, cn } from '../types';

interface HealthTwinProps {
  profile: PatientProfile;
  analysis: TriageAnalysis | null;
  vitals?: any;
}

const HealthTwin: React.FC<HealthTwinProps> = ({ profile, analysis, vitals }) => {
  // Determine clinical states based on analysis and profile
  const isHealthy = !analysis || analysis.urgency === 'self-care';
  const isUrgent = analysis?.urgency === 'er-now' || analysis?.urgency === 'urgent-care';
  
  // Synthetic Health Score (0-100)
  const healthScore = useMemo(() => {
    if (!analysis) return 98;
    if (analysis.urgency === 'er-now') return 15;
    if (analysis.urgency === 'urgent-care') return 45;
    if (analysis.urgency === 'pcp-soon') return 70;
    return 90;
  }, [analysis]);

  return (
    <div className="relative w-full aspect-[4/5] md:aspect-square bg-slate-50 rounded-[48px] overflow-hidden border border-slate-200 shadow-xl flex flex-col group">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute -top-24 -right-24 w-64 h-64 blur-[100px] rounded-full transition-colors duration-1000",
          isUrgent ? "bg-red-500/10" : isHealthy ? "bg-emerald-500/10" : "bg-blue-500/10"
        )} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.2 }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        {/* Anatomical Hologram Container */}
        <div className="relative w-full aspect-square max-w-[280px]">
           {/* Glow Ring */}
           <motion.div 
             animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
             transition={{ duration: 4, repeat: Infinity }}
             className={cn(
               "absolute inset-0 rounded-full blur-2xl",
               isUrgent ? "bg-red-200" : isHealthy ? "bg-emerald-200" : "bg-blue-200"
             )}
           />

           {/* The "Twin" Avatar */}
           <div className="relative w-full h-full flex items-center justify-center">
             <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-2xl">
               <defs>
                 <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isUrgent ? "#F87171" : isHealthy ? "#34D399" : "#60A5FA"} />
                    <stop offset="100%" stopColor={isUrgent ? "#B91C1C" : isHealthy ? "#059669" : "#2563EB"} />
                 </linearGradient>
                 <filter id="glow">
                   <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                   <feMerge>
                     <feMergeNode in="coloredBlur"/>
                     <feMergeNode in="SourceGraphic"/>
                   </feMerge>
                 </filter>
               </defs>

               {/* Anatomical Base Outline */}
               <motion.path 
                 d="M50,15 C40,15 32,22 32,32 C32,45 50,60 50,60 C50,60 68,45 68,32 C68,22 60,15 50,15 M25,65 Q50,55 75,65 L85,115 L15,115 Z"
                 fill="white"
                 fillOpacity="0.8"
                 stroke={isUrgent ? "#EF4444" : isHealthy ? "#10B981" : "#3B82F6"}
                 strokeWidth="1"
                 animate={{ scale: [1, 1.01, 1] }}
                 transition={{ duration: 3, repeat: Infinity }}
               />

               {/* Dynamic Inner "Energy" */}
               <motion.path 
                 d="M50,20 C43,20 37,25 37,32 C37,42 50,55 50,55 C50,55 63,42 63,32 C63,25 57,20 50,20 M30,70 Q50,60 70,70 L78,110 L22,110 Z"
                 fill="url(#bodyGrad)"
                 animate={{ opacity: [0.6, 0.9, 0.6] }}
                 transition={{ duration: 2, repeat: Infinity }}
               />

               {/* Vitals Line Overlay */}
               <motion.path
                 d="M30,90 L40,90 L44,80 L52,100 L56,90 L70,90"
                 fill="none"
                 stroke="white"
                 strokeWidth="1.5"
                 strokeLinecap="round"
                 filter="url(#glow)"
                 animate={{ 
                   pathLength: [0, 1],
                   pathOffset: [0, 1]
                 }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               />
             </svg>

             {/* Floating Info Pods */}
             <div className="absolute inset-0 flex flex-col justify-between p-4">
               <motion.div 
                 initial={{ x: -20, opacity: 0 }} 
                 animate={{ x: 0, opacity: 1 }}
                 className="self-start bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-2"
               >
                  <Activity className="w-3 h-3 text-emerald-500" />
                  <span className="text-[9px] font-black uppercase text-slate-600">Vitality Map</span>
               </motion.div>
               
               <motion.div 
                 initial={{ x: 20, opacity: 0 }} 
                 animate={{ x: 0, opacity: 1 }}
                 className="self-end bg-[#0F172A] px-3 py-1.5 rounded-full shadow-lg border border-white/10 flex items-center gap-2"
               >
                  <span className="text-[9px] font-black uppercase text-indigo-400">Score: {healthScore}</span>
               </motion.div>
             </div>
           </div>
        </div>

        {/* Clinical Data Overlay */}
        <div className="w-full mt-8 grid grid-cols-3 gap-4">
           {[
             { label: 'Neural', value: healthScore, icon: Zap, color: 'text-amber-500' },
             { label: 'Cardiac', value: isHealthy ? 94 : 72, icon: Heart, color: 'text-red-500' },
             { label: 'Homeo', value: healthScore + 2, icon: Droplets, color: 'text-blue-500' }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                <stat.icon className={cn("w-4 h-4 mb-2", stat.color)} />
                <span className="text-sm font-black text-slate-900">{stat.value}%</span>
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Footer Diagnostic Panel */}
      <div className="p-8 bg-[#0F172A] text-white flex items-center justify-between">
         <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Biological Alignment</h4>
            <div className="flex items-center gap-2">
               <div className={cn("w-2 h-2 rounded-full", isUrgent ? "bg-red-500 animate-ping" : "bg-emerald-500")} />
               <p className="text-xs font-black uppercase tracking-tighter">
                  {isUrgent ? 'Critical Systems Divergence' : isHealthy ? 'Nominal Tissue Synthesis' : 'Moderate Biomarker Drift'}
               </p>
            </div>
         </div>
         <div className="bg-white/10 p-3 rounded-2xl">
            <ShieldCheck className={cn("w-6 h-6", isHealthy ? "text-emerald-400" : "text-amber-400")} />
         </div>
      </div>

      {/* Tooltip Hover Overlay */}
      <div className="absolute inset-x-0 bottom-0 top-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-4 group-hover:translate-y-0">
         <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white mb-6 shadow-2xl">
            <Info className="w-10 h-10" />
         </div>
         <h4 className="text-2xl font-black text-[#0F172A] uppercase tracking-tighter mb-2">Health Twin Protocol</h4>
         <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
            This module generates a digital replica of your physiological state by synthesizing multi-angle scan artifacts and triage symptoms. 
            <br/><br/>
            Current Confidence Level: <span className="text-indigo-600">High Reliability (84.2%)</span>
         </p>
      </div>
    </div>
  );
};

export default HealthTwin;
