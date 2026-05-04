import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, Loader2, AlertCircle, ShieldCheck, Zap, Sparkles, ChevronRight, User, Eye, Scissors, Info, Stethoscope, Search, Maximize2, Video, X, CheckCircle2, ExternalLink, Activity as ActivityIcon, FileText } from 'lucide-react';
import { generateContent } from '../lib/gemini';
import { cn } from '../types';

// ai initialized via server-side proxy

interface HeadFaceProScanProps {
  onBack?: () => void;
}

type ScanModule = 'face' | 'eyes' | 'teeth' | 'hair';
type ScanAngle = 'front' | 'right' | 'left';

interface ModuleRef {
  id: ScanModule;
  label: string;
  icon: any;
  desc: string;
}

const HeadFaceProScan: React.FC<HeadFaceProScanProps> = ({ onBack }) => {
  const [activeModule, setActiveModule] = useState<ScanModule | null>(null);
  const [capturedData, setCapturedData] = useState<Record<ScanModule, Record<ScanAngle, string | null>>>({
    face: { front: null, right: null, left: null },
    eyes: { front: null, right: null, left: null },
    teeth: { front: null, right: null, left: null },
    hair: { front: null, right: null, left: null },
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeExplain, setActiveExplain] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [captureAngle, setCaptureAngle] = useState<ScanAngle>('front');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const modules: ModuleRef[] = [
    { id: 'face', label: 'Full Face', icon: User, desc: 'Dermal & structural analysis.' },
    { id: 'eyes', label: 'Ocular Focus', icon: Eye, desc: 'Sclera & vascular health.' },
    { id: 'teeth', label: 'Oral/Teeth', icon: Stethoscope, desc: 'Gum health & enamel check.' },
    { id: 'hair', label: 'Scalp/Hair', icon: Scissors, desc: 'Follicle & density scan.' },
  ];

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isLive) {
      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
          setError("Pro-Scan Hub requires camera access. Please ensure permissions are granted.");
          setIsLive(false);
        }
      };
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isLive]);

  const startModuleScan = (moduleId: ScanModule) => {
    setActiveModule(moduleId);
    setCaptureAngle('front');
    setIsLive(true);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && activeModule) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      setCapturedData(prev => ({
        ...prev,
        [activeModule]: {
          ...prev[activeModule],
          [captureAngle]: dataUrl
        }
      }));

      if (captureAngle === 'front') {
        setCaptureAngle('right');
      } else if (captureAngle === 'right') {
        setCaptureAngle('left');
      } else {
        setIsLive(false);
        setActiveModule(null);
      }
    }
  };

  const runAllDiagnostics = async () => {
    const hasData = Object.values(capturedData).some(moduleAngles => 
      Object.values(moduleAngles).some(img => img !== null)
    );

    if (!hasData) {
      setError("Please capture at least one diagnostic module to begin inference.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const prompt = `You are SnapHealth AI's Multi-Angle Pro-Scan Engine. 
        Analyze these high-resolution biometric images. 
        Each module provided (Face, Eyes, Teeth, Hair) has Front, Right, and Left angle captures.
        
        Perform a systemic clinical analysis. Identify trends in dermal health, vascular signals, oral vitality, and trichology.
        
        RETURN A JSON OBJECT WITH THESE KEYS:
        1. facial_diagnostics: { observation, signals: string[], score }
        2. ocular_analysis: { observation, signals: string[], score }
        3. dermal_scan: { observation, signals: string[], score }
        4. trichology: { observation, signals: string[], score }
        5. odontic_assessment: { observation, signals: string[], score }
        6. structural_neurological: { observation, signals: string[], score }
        7. clinical_priority: "Low" | "Moderate" | "High"
        8. trust_builder: { [module]: { x, y, label } }
        9. nutritional_recommendations: { name: string, reason: string, veg_source: string, non_veg_source: string }[] 
        
        Use SIMPLE ENGLISH suitable for a patient.
      `;

      // Build multimodel parts
      const parts: any[] = [{ text: prompt }];
      
      Object.entries(capturedData).forEach(([modName, angles]) => {
        Object.entries(angles).forEach(([angle, data]) => {
          if (data) {
            parts.push({
              inlineData: {
                mimeType: "image/jpeg",
                data: data.split(',')[1]
              }
            });
          }
        });
      });

      const result = await generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: 'user', parts }],
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(result.text);
      setAnalysis(data);
    } catch (err) {
      console.error(err);
      setError("Analysis Engine Overload. Please ensure images are clear.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getModuleProgress = (moduleId: ScanModule) => {
    const counts = Object.values(capturedData[moduleId]).filter(v => v !== null).length;
    return counts;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
       {/* Indigo Premium Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
             <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-indigo-50 rounded-full transition-all md:hidden text-indigo-600"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-3 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="px-3 py-1 bg-violet-500 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-violet-500/20">BIO-PREMIUM</div>
             </div>
             <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Pro-Scan <br/>Diagnostic Hub.</h1>
          </div>
          <p className="text-lg font-bold text-slate-400 uppercase tracking-tight max-w-sm text-left md:text-right">
             Multi-angle diagnostic inference across 4 clinical biosystems.
          </p>
       </div>

       {!analysis ? (
         <div className="space-y-12">
            {!isLive ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {modules.map((mod) => {
                   const progress = getModuleProgress(mod.id);
                   const isComplete = progress === 3;
                   return (
                     <button 
                       key={mod.id} 
                       onClick={() => startModuleScan(mod.id)}
                       className={cn(
                         "group relative aspect-[3/4] rounded-[48px] border-4 p-8 flex flex-col items-center justify-center text-center transition-all overflow-hidden",
                         isComplete ? "bg-emerald-50 border-emerald-500" : "bg-white border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/30 shadow-xl shadow-slate-200/50"
                       )}
                     >
                        <div className={cn(
                          "w-20 h-20 rounded-[32px] flex items-center justify-center mb-6 transition-all shadow-inner",
                          isComplete ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white"
                        )}>
                           {isComplete ? <CheckCircle2 className="w-10 h-10" /> : <mod.icon className="w-10 h-10" />}
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-[#0F172A]">{mod.label}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-2">{mod.desc}</p>
                        
                        <div className="absolute bottom-10 flex gap-1">
                           {[1,2,3].map(i => (
                             <div key={i} className={cn("w-2 h-2 rounded-full", progress >= i ? "bg-emerald-500" : "bg-slate-200")} />
                           ))}
                        </div>
                     </button>
                   );
                 })}
              </div>
            ) : (
              <div className="relative aspect-video bg-indigo-950 rounded-[64px] border-8 border-indigo-900/20 shadow-2xl overflow-hidden group">
                 <div className="w-full h-full relative">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale-[0.3]" />
                    
                    {/* HUD Overlay */}
                    <div className="absolute inset-0 pointer-events-none p-12">
                       <div className="w-full h-full border-2 border-indigo-500/30 rounded-[40px] flex items-center justify-center">
                          <div className="relative w-72 h-72 border border-indigo-400/20 rounded-full animate-spin-slow">
                             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-500 rounded-full blur-sm" />
                          </div>
                          
                          <div className="absolute top-12 left-12 flex items-center gap-3 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                             <span className="text-[10px] font-black text-white uppercase tracking-widest">{activeModule?.toUpperCase()} MODE ACTIVE</span>
                          </div>

                          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-center">
                             <motion.div 
                               key={captureAngle}
                               initial={{ scale: 0.9, opacity: 0 }}
                               animate={{ scale: 1, opacity: 1 }}
                               className="bg-indigo-600 text-white px-10 py-4 rounded-[24px] text-xs font-black uppercase tracking-[0.25em] shadow-2xl border border-indigo-400"
                             >
                                {captureAngle === 'front' ? 'Face Forward' : captureAngle === 'right' ? 'Turn Right [45°]' : 'Turn Left [45°]'}
                             </motion.div>
                             <div className="flex gap-2">
                                {[1,2,3].map(i => (
                                  <div key={i} className={cn("w-2 h-2 rounded-full", i === (captureAngle==='front'?1 : captureAngle==='right'?2 : 3) ? "bg-indigo-400" : "bg-white/20")} />
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={captureImage} 
                      className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-indigo-500 text-white w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)] border-8 border-indigo-400/50 hover:scale-110 active:scale-95 transition-all group pointer-events-auto"
                    >
                       <Camera className="w-10 h-10" />
                    </button>
                    
                    <button 
                      onClick={() => {setIsLive(false); setActiveModule(null);}} 
                      className="absolute top-12 right-12 w-12 h-12 bg-white/10 hover:bg-red-500/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition-all border border-white/20 pointer-events-auto"
                    >
                       <X className="w-6 h-6" />
                    </button>
                 </div>
              </div>
            )}

            {!isLive && (
              <div className="flex flex-col items-center gap-6">
                <button 
                  onClick={runAllDiagnostics}
                  disabled={isAnalyzing}
                  className="w-full md:w-auto px-20 py-8 bg-indigo-600 text-white rounded-[32px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-4"
                >
                  {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                  {isAnalyzing ? "Processing Cross-System Analysis..." : "Initiate Biometric Inference"}
                </button>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complete at least one module session to begin neural synthesis.</p>
              </div>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
         </div>
       ) : (
         <motion.div 
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           className="space-y-12 p-8"
         >
           {/* Results Dashboard - Indigo Theme */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                 <div className="bg-indigo-950 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 space-y-8">
                       <div className="flex justify-between items-center">
                          <h2 className="text-3xl font-black uppercase tracking-tighter">Diagnostic Signal Maps</h2>
                          <div className={cn(
                             "px-6 py-2 rounded-full text-[10px] font-black uppercase transform skew-x-[-12deg]",
                             analysis.clinical_priority === 'High' ? "bg-orange-600" : "bg-indigo-600"
                          )}>
                             Priority: {analysis.clinical_priority}
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          {Object.entries(analysis).map(([key, value]: [string, any]) => {
                             if (typeof value !== 'object' || !value.score) return null;
                             return (
                               <button 
                                 key={key} 
                                 onClick={() => setSelectedDetail(key)}
                                 className={cn(
                                   "p-6 rounded-[32px] border-2 transition-all flex flex-col items-start gap-4 text-left group",
                                   activeExplain === key ? "bg-white text-indigo-900 border-white shadow-xl" : "bg-white/5 border-white/10 hover:border-white/30"
                                 )}
                               >
                                  <div className="flex justify-between items-start w-full">
                                     <div className={cn("p-2 rounded-xl", "bg-white/10 text-white/60 group-hover:bg-indigo-600 group-hover:text-white transition-colors")}>
                                        {key.includes('facial') ? <User className="w-4 h-4" /> : key.includes('ocular') ? <Eye className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                                     </div>
                                     <div className="flex items-center gap-2">
                                       <span className="text-xs font-black text-white/40">{value.score}/100</span>
                                       <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-indigo-400" />
                                     </div>
                                  </div>
                                  <div>
                                     <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{key.replace('_', ' ')}</p>
                                     <p className="text-sm font-black uppercase tracking-tighter leading-none group-hover:text-indigo-400 transition-colors">{value.signals[0]}</p>
                                  </div>
                                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                     <motion.div 
                                       initial={{ width: 0 }} 
                                       animate={{ width: `${value.score}%` }} 
                                       className="h-full bg-white shadow-[0_0_10px_white]"
                                     />
                                  </div>
                               </button>
                             );
                          })}
                       </div>
                    </div>

                    <AnimatePresence>
                      {activeExplain && analysis.trust_builder && analysis.trust_builder[activeExplain] && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                        >
                           <div 
                             className="absolute w-40 h-40 bg-indigo-500 blur-[80px] rounded-full"
                             style={{ left: `${analysis.trust_builder[activeExplain].x}%`, top: `${analysis.trust_builder[activeExplain].y}%` }}
                           />
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>

                 <div className="bg-white p-10 rounded-[48px] border border-indigo-100 shadow-xl space-y-6">
                    <div className="flex items-center gap-3 text-indigo-600">
                       <h3 className="text-xl font-black uppercase tracking-tighter text-indigo-950">AI Explainability Layer</h3>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
                       {activeExplain ? (
                         <span>Focusing on <span className="text-indigo-600">{activeExplain.replace('_', ' ')}</span>: {analysis[activeExplain].observation}</span>
                       ) : "Select a module above to see the granular logic and visual hotspots that triggered the finding."}
                    </p>
                    {activeExplain && (
                      <div className="flex flex-wrap gap-2 pt-4">
                         {analysis[activeExplain].signals.map((sig: string, i: number) => (
                           <div key={i} className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#0F172A]">
                              {sig}
                           </div>
                         ))}
                      </div>
                    )}
                 </div>

                 {analysis.nutritional_recommendations && analysis.nutritional_recommendations.length > 0 && (
                   <div className="bg-emerald-50 p-10 rounded-[48px] border border-emerald-100 space-y-8">
                      <div className="flex items-center gap-3 text-emerald-600">
                         <Zap className="w-6 h-6 fill-current" />
                         <h3 className="text-xl font-black uppercase tracking-tighter text-[#0F172A]">Nutri-Protocol</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         {analysis.nutritional_recommendations.map((vit: any, i: number) => (
                           <div key={i} className="bg-white p-6 rounded-[32px] border border-emerald-100 space-y-4 shadow-sm">
                              <p className="text-sm font-black text-emerald-900 uppercase tracking-tighter leading-none">{vit.name}</p>
                              <div className="grid grid-cols-2 gap-3 pt-2">
                                 <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-50 text-center">
                                    <p className="text-[8px] font-black text-emerald-700 uppercase tracking-widest mb-1">Veg</p>
                                    <p className="text-[9px] font-bold text-emerald-900 uppercase">{vit.veg_source}</p>
                                 </div>
                                 <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-50 text-center">
                                    <p className="text-[8px] font-black text-emerald-700 uppercase tracking-widest mb-1">Non-Veg</p>
                                    <p className="text-[9px] font-bold text-emerald-900 uppercase">{vit.non_veg_source}</p>
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                 )}
              </div>

              <div className="space-y-8 h-full">
                 <div className="h-full bg-white rounded-[48px] border border-indigo-100 shadow-xl p-10 flex flex-col">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Neural Artifact Repository</h3>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 content-start overflow-y-auto max-h-[800px] pr-2">
                       {Object.entries(capturedData).map(([modId, angles]) => (
                         Object.entries(angles).map(([angle, data]) => data && (
                           <div key={`${modId}-${angle}`} className="relative aspect-video rounded-[32px] overflow-hidden group border-2 border-slate-100 shadow-inner">
                              <img src={data} className="w-full h-full object-cover grayscale brightness-75" alt={`${modId} ${angle}`} />
                              <div className="absolute top-4 left-4 px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                                 {modId} | {angle}
                              </div>
                           </div>
                         ))
                       ))}
                    </div>
                    <div className="mt-10 pt-10 border-t border-slate-100">
                       <button onClick={() => {setAnalysis(null); setCapturedData({ face: { front: null, right: null, left: null }, eyes: { front: null, right: null, left: null }, teeth: { front: null, right: null, left: null }, hair: { front: null, right: null, left: null } }); }} className="w-full bg-indigo-600 text-white py-6 rounded-[24px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all">
                          Wipe & Reset Hub
                       </button>
                    </div>
                 </div>
              </div>
           </div>
         </motion.div>
       )}

       {/* Detailed Module Modal */}
       <AnimatePresence>
          {selectedDetail && analysis[selectedDetail] && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 md:p-24"
            >
              <div className="absolute inset-0 bg-indigo-950/90 backdrop-blur-3xl" onClick={() => setSelectedDetail(null)} />
              
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative w-full max-w-5xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[800px]"
              >
                <div className="flex-1 p-12 overflow-y-auto space-y-8 border-b md:border-b-0 md:border-r border-slate-100">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-2">Module Assessment</p>
                        <h2 className="text-4xl font-black text-[#0F172A] uppercase tracking-tighter leading-none">{selectedDetail.replace('_', ' ')}</h2>
                      </div>
                      <button onClick={() => setSelectedDetail(null)} className="p-4 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all">
                        <X className="w-6 h-6" />
                      </button>
                   </div>

                   <div className="p-8 bg-indigo-50/50 rounded-[32px] border border-indigo-100 space-y-4">
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Inference Observation</h4>
                      <p className="text-lg font-bold text-indigo-950 leading-relaxed uppercase tracking-tight">{analysis[selectedDetail].observation}</p>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Signals Detected</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {analysis[selectedDetail].signals.map((sig: string, i: number) => (
                           <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{sig}</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-16 rounded-2xl bg-[#0F172A] text-white flex flex-col items-center justify-center font-black">
                            <span className="text-xs">{analysis[selectedDetail].score}</span>
                            <span className="text-[8px] opacity-40 uppercase">Vibe</span>
                         </div>
                         <div className="space-y-1">
                            <p className="text-sm font-black text-[#0F172A] uppercase">Score Consistency</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Confidence: High Reliability</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="w-full md:w-80 bg-slate-50 p-12 flex flex-col gap-6 overflow-y-auto">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Module Evidence</h4>
                   <div className="space-y-4">
                      {Object.entries(capturedData).map(([modId, angles]) => (
                        selectedDetail.toLowerCase().includes(modId) && Object.entries(angles).map(([angle, data]) => data && (
                          <div key={angle} className="space-y-2">
                             <div className="relative aspect-square rounded-[24px] overflow-hidden border-2 border-white shadow-md">
                                <img src={data} className="w-full h-full object-cover" alt={angle} />
                                <div className="absolute inset-0 bg-indigo-500/10" />
                             </div>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{angle} PROFILE</p>
                          </div>
                        ))
                      ))}
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}
       </AnimatePresence>

       {error && (
         <div className="p-10 bg-orange-50 border-4 border-orange-100 rounded-[48px] flex items-center gap-6 text-orange-700 animate-shake">
            <AlertCircle className="w-8 h-8" />
            <p className="text-xl font-black uppercase tracking-tighter">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-orange-400 hover:text-orange-600 transition-colors"><X className="w-6 h-6" /></button>
         </div>
       )}
    </div>
  );
};

export default HeadFaceProScan;
