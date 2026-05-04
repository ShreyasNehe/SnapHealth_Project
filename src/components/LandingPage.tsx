import React from 'react';
import { motion } from 'motion/react';
import { HeartPulse, ChevronRight, Activity, ShieldCheck, Stethoscope, Camera, Globe, BrainCircuit, Droplets, User, Eye, Zap, Sparkles, MessageSquare, ClipboardCheck, Info, Scissors } from 'lucide-react';
import { cn } from '../types';

interface LandingPageProps {
  onStartProtocol: () => void;
  onStartLab: () => void;
  onStartEmergency: () => void;
  onStartCabinet: () => void;
  onStartSpeech: () => void;
  onStartNutrition: () => void;
  onStartFacial: () => void;
  onStartOcular: () => void;
  onStartOdontic: () => void;
  onStartTrichology: () => void;
  onStartProScan: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartProtocol, 
  onStartLab, 
  onStartEmergency, 
  onStartCabinet,
  onStartSpeech,
  onStartNutrition,
  onStartFacial,
  onStartOcular,
  onStartOdontic,
  onStartTrichology,
  onStartProScan
}) => {
  const mainFeatures = [
    {
      icon: ShieldCheck,
      title: "Pro-Scan Engine",
      subtitle: "Premium Ecosystem",
      color: "bg-indigo-900 border-2 border-amber-500/20",
      action: onStartProScan,
      desc: "Holistic head & face neural diagnostics.",
      isPremium: true,
      fullWidth: true
    },
    {
      icon: Activity,
      title: "Clinical Triage",
      subtitle: "System Architecture",
      color: "bg-blue-600",
      action: onStartProtocol,
      desc: "Emergency-grade prioritization logic."
    },
    {
      icon: User,
      title: "Facial-Scan",
      subtitle: "Stress & Nutrition",
      color: "bg-emerald-500",
      action: onStartFacial,
      desc: "Live dermal & emotional analysis."
    },
    {
      icon: Eye,
      title: "Ocular Sentinel",
      subtitle: "Vitality Biometrics",
      color: "bg-indigo-600",
      action: onStartOcular,
      desc: "Biometric eye health screening."
    },
    {
      icon: BrainCircuit,
      title: "Vocal Screen",
      subtitle: "Neurological Guard",
      color: "bg-purple-600",
      action: onStartSpeech,
      desc: "Neuro-vocal biomarker inference."
    },
    {
      icon: Globe,
      title: "Nutri-Scan",
      subtitle: "Metabolic Impact",
      color: "bg-amber-500",
      action: onStartNutrition,
      desc: "Visual glycemic load prediction."
    },
    {
      icon: Camera,
      title: "Lab Intelligence",
      subtitle: "Cognitive OCR",
      color: "bg-slate-900",
      action: onStartLab,
      desc: "Automated vision report parsing."
    },
    {
      icon: Droplets,
      title: "Med Cabinet",
      subtitle: "Live Safety Sync",
      color: "bg-cyan-500",
      action: onStartCabinet,
      desc: "Real-time pill identification."
    },
    {
      icon: Stethoscope,
      title: "Odontic Guard",
      subtitle: "Dental & Gum Scan",
      color: "bg-rose-500",
      action: onStartOdontic,
      desc: "Vision-based oral health screen."
    },
    {
      icon: Scissors,
      title: "Hair Scan",
      subtitle: "Follicle Vitality",
      color: "bg-orange-600",
      action: onStartTrichology,
      desc: "Scalp & hair density analysis."
    },
    {
      icon: ShieldCheck,
      title: "Panic Mode",
      subtitle: "Emergency Relay",
      color: "bg-red-600",
      action: onStartEmergency,
      desc: "Instant critical care escalations.",
      fullWidth: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* 3D Glass Hero Section */}
      <section className="relative pt-32 pb-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:flex-1 space-y-12"
            >
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-white rounded-full shadow-sm border border-slate-100">
                <Zap className="w-4 h-4 text-amber-500 fill-current" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Advanced Medical OS v4.0</span>
              </div>
              
              <h1 className="text-8xl lg:text-9xl font-black text-[#0F172A] tracking-tighter leading-[0.8] mb-8 uppercase">
                Future <br />
                <span className="text-[#1A6BCC] drop-shadow-sm">Healthcare,</span> <br />
                Now.
              </h1>
              
              <p className="text-2xl font-bold text-slate-400 leading-tight tracking-tight uppercase max-w-xl">
                 High-fidelity AI triage & biometric screening systems for decentralized diagnostics.
              </p>

              <div className="flex flex-wrap gap-8 pt-4">
                 <div className="flex flex-col">
                    <span className="text-4xl font-black text-[#0F172A]">99.8%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inference Accuracy</span>
                 </div>
                 <div className="w-px h-12 bg-slate-200" />
                 <div className="flex flex-col">
                    <span className="text-4xl font-black text-[#0F172A]">0.4s</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latency Floor</span>
                 </div>
                 <div className="w-px h-12 bg-slate-200" />
                 <div className="flex flex-col">
                    <span className="text-4xl font-black text-[#0F172A]">HL7</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Standard Compliant</span>
                 </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="lg:flex-1 relative perspective-1000"
            >
              {/* Main 3D Mockup Container */}
              <div className="relative w-full aspect-[4/5] bg-white rounded-[64px] shadow-[0_50px_100px_-20px_rgba(15,23,42,0.2)] border-[12px] border-slate-100 overflow-hidden transform-gpu rotate-3 hover:rotate-0 transition-transform duration-700">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900" />
                
                {/* Simulated Glass UI */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <div className="p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                         <Activity className="w-8 h-8 text-white animate-pulse" />
                      </div>
                      <div className="p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 text-white text-right">
                         <p className="text-[10px] font-black opacity-60 uppercase">System Status</p>
                         <p className="text-sm font-black uppercase">Core Active</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="p-6 bg-white/95 rounded-[32px] shadow-2xl flex items-center gap-4 border border-white">
                         <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg"><User className="w-6 h-6" /></div>
                         <div className="flex-1">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Scanning facial markers...</p>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                               <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} className="h-full bg-emerald-500" />
                            </div>
                         </div>
                      </div>

                      <div className="p-8 bg-slate-900 rounded-[40px] shadow-2xl border border-white/10 space-y-4">
                         <div className="flex justify-between items-center text-blue-400">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Triage</span>
                            <Sparkles className="w-4 h-4" />
                         </div>
                         <p className="text-2xl font-black text-white leading-none uppercase tracking-tighter">Cluster <br/>Inference <br/><span className="text-blue-500">Positive</span></p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Floating Decorative Orbs for 3D depth */}
              <motion.div 
                animate={{ y: [0, -20, 0] }} 
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-12 -left-12 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" 
              />
              <motion.div 
                animate={{ y: [0, 20, 0] }} 
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" 
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Advanced Capabilities Hub */}
      <section className="bg-white py-32 border-y border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
             <div className="space-y-4">
                <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Operations Hub</h2>
                <p className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">Diagnostic <br/>Control Center.</p>
             </div>
             <p className="text-lg font-bold text-slate-400 uppercase tracking-tight max-w-sm text-right">
                Select a specialized medical protocol to begin AI-powered bio-metric induction.
             </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainFeatures.map((f, i) => (
              <motion.button
                key={i}
                whileHover={{ y: -8 }}
                onClick={f.action}
                className={cn(
                  "relative p-8 rounded-[48px] bg-slate-50 border border-slate-200 transition-all text-left overflow-hidden group",
                  f.fullWidth && "sm:col-span-2 bg-red-600 border-red-700 hover:bg-red-700"
                )}
              >
                 <div className={cn(
                   "w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-xl transition-transform duration-500 group-hover:scale-110",
                   f.fullWidth ? "bg-white/20 text-white" : `${f.color} text-white`
                 )}>
                    <f.icon className="w-8 h-8" />
                 </div>
                 
                 <div className="space-y-1">
                    <p className={cn("text-[8px] font-black uppercase tracking-widest", f.fullWidth ? "text-white/60" : "text-slate-400")}>{f.subtitle}</p>
                    <h3 className={cn("text-2xl font-black uppercase tracking-tighter leading-none mb-4", f.fullWidth ? "text-white" : "text-slate-900")}>{f.title}</h3>
                 </div>
                 
                 <p className={cn("text-xs font-bold uppercase tracking-tight", f.fullWidth ? "text-white/80" : "text-slate-500")}>
                    {f.desc}
                 </p>

                 {f.isPremium && (
                   <div className="absolute top-8 right-24 px-3 py-1 bg-amber-500 rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-lg shadow-amber-500/20">PRO FEATURE</div>
                 )}
                 <div className="absolute top-8 right-8 w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center bg-white group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                 </div>

                 {/* Subtle 3D Depth Card Overlay */}
                 <div className="absolute bottom-0 right-0 w-full h-1 bg-slate-200 group-hover:bg-[#1A6BCC] transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* The "Process" Screenshot/Visualization Section */}
      <section className="py-40 bg-slate-950 text-white relative flex overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center relative z-10">
           <div className="space-y-12">
              <h2 className="text-7xl font-black leading-[0.9] tracking-tighter uppercase italic">
                 The <br/><span className="text-blue-500">Induction</span> <br/>Sequence.
              </h2>
              
              <div className="space-y-12 relative">
                 <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/10" />
                 
                 {[
                   { icon: User, title: "1. Bio-Metadata Induction", desc: "Profile syncing with medication and allergy context." },
                   { icon: Activity, title: "2. Visual Symptom Mapping", desc: "Advanced body-mapping and vision AI upload." },
                   { icon: MessageSquare, title: "3. Neural Intake Scan", desc: "Iterative clinical interview guided by medical LLMs." },
                   { icon: ClipboardCheck, title: "4. Logic-Based Triage", desc: "Analysis results cross-verified against search grounded data." }
                 ].map((step, i) => (
                   <div key={i} className="flex gap-8 items-start relative">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black shrink-0 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                         <step.icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-2">
                         <h4 className="text-xl font-black uppercase tracking-tight">{step.title}</h4>
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-tight leading-relaxed max-w-sm">{step.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="relative">
              {/* Screenshot Mockups Stack */}
              <div className="relative z-10 space-y-8">
                 <motion.div 
                   whileInView={{ x: 0, opacity: 1 }}
                   initial={{ x: 100, opacity: 0 }}
                   className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl skew-y-3"
                 >
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-3 h-3 rounded-full bg-red-500" />
                       <div className="w-3 h-3 rounded-full bg-amber-500" />
                       <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <div className="space-y-6">
                       <div className="h-4 w-2/3 bg-white/10 rounded-full" />
                       <div className="h-4 w-full bg-white/10 rounded-full" />
                       <div className="h-4 w-1/2 bg-white/20 rounded-full" />
                    </div>
                 </motion.div>

                 <motion.div 
                   whileInView={{ x: 0, opacity: 1 }}
                   initial={{ x: 100, opacity: 0 }}
                   transition={{ delay: 0.2 }}
                   className="bg-blue-600 rounded-[32px] p-10 shadow-[0_40px_80px_rgba(37,99,235,0.3)] -translate-x-12 relative overflow-hidden"
                 >
                    <div className="flex justify-between items-center mb-8">
                       <Info className="w-6 h-6" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Final Assessment</span>
                    </div>
                    <p className="text-3xl font-black tracking-tighter uppercase leading-none">Status: <br/>Urgent Care <br/>Required.</p>
                    <div className="mt-8 flex gap-2">
                       <div className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase">94% Confidence</div>
                       <div className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase">Search Grounded</div>
                    </div>
                 </motion.div>
              </div>

              {/* Background Glows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/30 blur-[150px] rounded-full" />
           </div>
        </div>
      </section>

      {/* Global Safety Footer */}
      <footer className="py-24 bg-white border-t border-slate-200">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="space-y-6 text-center md:text-left">
               <div className="flex items-center gap-3 justify-center md:justify-start">
                 <div className="bg-blue-600 p-2 rounded-xl text-white"><HeartPulse className="w-6 h-6" /></div>
                 <span className="text-3xl font-black tracking-tighter text-slate-900">SNAPHEALTH <span className="text-blue-600">AI</span></span>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Decentralized Clinical Infrastructure • v4.0.8</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Diagnostic Hub</p>
                  <ul className="space-y-2 text-[10px] font-bold text-slate-400 uppercase">
                     <li>Vocal Screener</li>
                     <li>Nutri Predictor</li>
                     <li>Dermal Mapping</li>
                  </ul>
               </div>
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Security</p>
                  <ul className="space-y-2 text-[10px] font-bold text-slate-400 uppercase">
                     <li>HL7 Compliance</li>
                     <li>AES-256 Auth</li>
                     <li>MD Verification</li>
                  </ul>
               </div>
               <div className="space-y-4 col-span-2 sm:col-span-1">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Emergency</p>
                  <button onClick={onStartEmergency} className="text-[10px] font-bold text-red-600 uppercase hover:underline">Launch Panic Mode</button>
               </div>
            </div>
         </div>

         <div className="max-w-3xl mx-auto px-6 mt-20 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
               NOT A SUBSTITUTE FOR PROFESSIONAL DIAGNOSIS. IF YOU ARE EXPERIENCING A MEDICAL EMERGENCY, 
               CEASE SYSTEM INTERACTION AND CONTACT LOCAL EMERGENCY RESPONDERS IMMEDIATELY.
            </p>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
