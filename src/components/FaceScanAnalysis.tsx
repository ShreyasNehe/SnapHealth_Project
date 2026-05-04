import React, { useState, useRef, useEffect } from 'react';
import { Camera, Search, Loader2, X, Activity, User, Info, Zap, ChevronRight, Video, StopCircle, Scan, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateContent } from '../lib/gemini';
import { cn } from '../types';

// ai instance removed in favor of generateContent proxy

interface FacialAnalysis {
  skinHydration: number; // 0-100
  stressLevel: number; // 0-100
  microExpressionNote: string;
  nutritionalDeficiencySigns: string[];
  suggestedVitamins: { name: string; reason: string; veg_source: string; non_veg_source: string }[];
  generalVitality: 'optimal' | 'fatigued' | 'needs-care';
  healthSummary: string;
  trust_builder?: { module: string; x: number; y: number; label: string }[];
}

interface FaceScanAnalysisProps {
  onBack?: () => void;
}

const FaceScanAnalysis: React.FC<FaceScanAnalysisProps> = ({ onBack }) => {
  const [images, setImages] = useState<{ front?: string; right?: string; left?: string }>({});
  const [captureStep, setCaptureStep] = useState<'front' | 'right' | 'left' | 'complete'>('front');
  const [analysis, setAnalysis] = useState<FacialAnalysis | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isLive) {
      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
          setError("Camera access required for live facial diagnostic.");
          setIsLive(false);
        }
      };
      startCamera();
    }
    return () => stream?.getTracks().forEach(track => track.stop());
  }, [isLive]);

  const captureFace = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      const updatedImages = { ...images, [captureStep]: dataUrl };
      setImages(updatedImages);

      if (captureStep === 'front') {
        setCaptureStep('right');
      } else if (captureStep === 'right') {
        setCaptureStep('left');
      } else {
        setCaptureStep('complete');
        setIsLive(false);
        performFacialScan(updatedImages);
      }
    }
  };

  const performFacialScan = async (capturedImages: { front?: string; right?: string; left?: string }) => {
    if (!capturedImages.front || !capturedImages.right || !capturedImages.left) return;

    setIsScanning(true);
    setError(null);
    try {
      const prompt = "Act as a specialized AI Dermatologist, Nutritional Diagnostician, and Micro-Expression Stress Analyst. Analyze these THREE images of the user's face from different angles (Front, Right Profile, Left Profile). Multi-angle analysis is critical for detecting localized skin conditions and complex stress markers. Identify: 1. Skin hydration levels. 2. Micro-expressions indicating underlying stress or burnout levels. 3. Signs of nutritional deficiencies (e.g. puffiness, dark circles, eye bags). 4. Suggested vitamins and supplements. For each vitamin, provide 1 VEG and 1 NON-VEG food source. 5. General vitality assessment. 6. Trust Builder: Identify exactly 3-4 visual hotspots (x, y coordinates from 0-100) on the 'front' image that led to your conclusions. IMPORTANT: All text in 'microExpressionNote', 'generalVitality', and 'healthSummary' MUST be in VERY SIMPLE ENGLISH (10-year-old level). Avoid medical jargon. Output ONLY a JSON object matching this schema: { \"skinHydration\": number, \"stressLevel\": number, \"microExpressionNote\": \"string\", \"nutritionalDeficiencySigns\": string[], \"suggestedVitamins\": [{ \"name\": \"string\", \"reason\": \"string\", \"veg_source\": \"string\", \"non_veg_source\": \"string\" }], \"generalVitality\": \"optimal\"|\"fatigued\"|\"needs-care\", \"healthSummary\": \"string\", \"trust_builder\": [{ \"module\": \"string\", \"x\": number, \"y\": number, \"label\": \"string\" }] }";
      
      const parts: any[] = [{ text: prompt }];

      if (capturedImages.front) parts.push({ inlineData: { mimeType: "image/jpeg", data: capturedImages.front.split(',')[1] } });
      if (capturedImages.right) parts.push({ inlineData: { mimeType: "image/jpeg", data: capturedImages.right.split(',')[1] } });
      if (capturedImages.left) parts.push({ inlineData: { mimeType: "image/jpeg", data: capturedImages.left.split(',')[1] } });

      const result = await generateContent({
        model: "gemini-2.5-flash",
        contents: [{ parts }]
      });

      const text = result.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setAnalysis(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error("Unable to parse facial diagnostic data.");
      }
    } catch (err) {
      console.error(err);
      setError("Facial scan failed. Ensure your face is centered and well-lit in all shots.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all uppercase text-[10px] font-black tracking-widest mb-4">
          <X className="w-4 h-4 rotate-180" /> Back to Diagnostics Hub
        </button>
      )}

      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-emerald-100 rounded-3xl text-emerald-600 mb-4 shadow-sm">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Facial Diagnostics</h1>
        <p className="text-lg font-bold text-slate-500 uppercase tracking-tight max-w-xl mx-auto">Multi-Angle Derm-Nutritional Scan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="relative aspect-[3/4] bg-[#0F172A] rounded-[48px] border-4 border-white shadow-2xl overflow-hidden group">
            <AnimatePresence mode="wait">
              {isLive ? (
                <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                  {/* Face Tracking Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-80 border-2 border-emerald-500/50 rounded-[100px] relative">
                       <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-500/30 animate-[scan_3s_infinite]" />
                       <motion.div 
                        key={captureStep}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 whitespace-nowrap"
                       >
                         <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-emerald-500/30">
                           {captureStep === 'front' ? 'Align Face in Frame' : captureStep === 'right' ? 'Turn Head to the Right' : 'Turn Head to the Left'}
                         </span>
                         <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest italic">{captureStep === 'front' ? 'Step 1/3' : captureStep === 'right' ? 'Step 2/3' : 'Step 3/3'}</span>
                       </motion.div>
                    </div>
                  </div>
                  <button onClick={captureFace} className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl active:scale-95 transition-all">
                    <Scan className="w-6 h-6" /> {captureStep === 'left' ? 'Finalize Scan' : 'Capture Angle'}
                  </button>
                </motion.div>
              ) : captureStep === 'complete' ? (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative p-4 bg-[#0F172A]">
                   {showExplanation && analysis?.trust_builder ? (
                     <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                        <img src={images.front} className="w-full h-full object-cover scale-x-[-1]" alt="Face analysis" />
                        <div className="absolute inset-0 bg-black/20" />
                        {analysis.trust_builder.map((marker, i) => (
                           <div 
                             key={i} 
                             className="absolute flex flex-col items-center group/marker" 
                             style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                           >
                              <div className="w-8 h-8 rounded-full bg-emerald-400/30 border-2 border-emerald-400 animate-ping absolute" />
                              <div className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-lg relative z-10" />
                              <div className="mt-2 bg-white px-3 py-1 rounded-lg shadow-xl border border-slate-100 opacity-0 group-hover/marker:opacity-100 transition-opacity">
                                 <p className="text-[8px] font-black uppercase text-emerald-600 leading-none">{marker.label}</p>
                              </div>
                           </div>
                        ))}
                        <button 
                          onClick={() => setShowExplanation(false)}
                          className="absolute top-6 right-6 px-6 py-2 bg-white text-emerald-600 rounded-full text-[10px] font-black uppercase shadow-xl border-2 border-emerald-100"
                        >
                          Hide Explain
                        </button>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 gap-2 h-full overflow-y-auto pr-2">
                        {Object.entries(images).map(([step, url]) => (
                           <div key={step} className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 group">
                              <img src={url} className="w-full h-full object-cover scale-x-[-1]" alt={`${step} preview`} />
                              <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest">{step} Profile</div>
                           </div>
                        ))}
                     </div>
                   )}
                   {!showExplanation && <button onClick={() => {setImages({}); setCaptureStep('front'); setAnalysis(null);}} className="absolute top-6 right-6 p-4 bg-red-600 text-white rounded-2xl shadow-xl transition-all z-10"><X className="w-6 h-6" /></button>}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full gap-6">
                   <button onClick={() => setIsLive(true)} className="group p-10 bg-white/5 rounded-[60px] hover:bg-emerald-500/20 transition-all border border-white/10 flex flex-col items-center gap-6">
                      <div className="p-10 bg-emerald-500 text-white rounded-full shadow-2xl group-hover:scale-110 transition-transform"><Video className="w-16 h-16" /></div>
                      <p className="text-2xl font-black text-white uppercase tracking-widest">Launch Face Scan</p>
                   </button>
                </motion.div>
              )}
            </AnimatePresence>
            <canvas ref={canvasRef} className="hidden" />
            {isScanning && (
              <div className="absolute inset-0 bg-emerald-900/80 backdrop-blur-xl flex flex-col items-center justify-center text-white p-8">
                <Loader2 className="w-16 h-16 animate-spin mb-6" />
                <p className="text-2xl font-black uppercase tracking-[0.2em] text-center">Spectral Bio-Mapping...</p>
                <div className="mt-6 flex gap-2">
                   {[1,2,3].map(i => <div key={i} className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: `${i*0.3}s` }} />)}
                </div>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {analysis && (
            <motion.div key="analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex justify-between items-center gap-4 px-4">
                <button 
                   onClick={() => setShowExplanation(!showExplanation)}
                   className="w-full py-4 bg-[#0F172A] text-white rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all group"
                 >
                    <Search className="w-4 h-4 group-hover:scale-125 transition-transform" />
                    {showExplanation ? 'Return to Summary' : 'Explain this: Trust Builder'}
                 </button>
              </div>

              <div className="space-y-6 px-4 py-2 bg-white rounded-[40px]">
                <div className={cn(
                  "p-8 rounded-[40px] border-4 border-white shadow-2xl text-white space-y-6",
                  analysis.generalVitality === 'optimal' ? "bg-emerald-600" : analysis.generalVitality === 'fatigued' ? "bg-amber-600" : "bg-red-600"
                )}>
                   <div className="flex justify-between items-center opacity-80 uppercase text-[10px] font-black tracking-widest">
                      <span>Vitality Index</span>
                      <Heart className="w-4 h-4 fill-current" />
                   </div>
                   <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">{analysis.generalVitality}</h2>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] uppercase font-black opacity-70">
                         <span>Skin Hydration</span>
                         <span>{analysis.skinHydration}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.skinHydration}%` }} className="h-full bg-white" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] uppercase font-black opacity-70">
                         <span>Stress Indicator</span>
                         <span>{analysis.stressLevel}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.stressLevel}%` }} className="h-full bg-slate-900" />
                      </div>
                   </div>
                </div>
  
                <div className="space-y-8">
                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Nutritional & Stress Markers</h4>
                      <div className="flex flex-wrap gap-2">
                         {analysis.nutritionalDeficiencySigns.map((sign, i) => (
                           <span key={i} className="px-3 py-1 bg-slate-100 text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">{sign}</span>
                         ))}
                      </div>
                   </div>
  
                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-black">Micro-Expression Note</h4>
                      <p className="text-sm font-bold text-slate-600 leading-relaxed uppercase tracking-tight">{analysis.microExpressionNote}</p>
                   </div>
  
                   <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                      <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 font-black">Vitamin Protocol</h4>
                      <div className="space-y-4">
                         {analysis.suggestedVitamins.map((vit, i) => (
                           <div key={i} className="space-y-3">
                              <div className="space-y-1">
                                 <p className="text-xs font-black text-emerald-900 uppercase tracking-tight">{vit.name}</p>
                                 <p className="text-[10px] font-bold text-emerald-600 uppercase leading-tight">{vit.reason}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                 <div className="bg-white/60 p-3 rounded-2xl border border-emerald-100 text-center">
                                    <p className="text-[8px] font-black text-emerald-700 uppercase tracking-widest mb-1">Veg</p>
                                    <p className="text-[9px] font-bold text-emerald-900 uppercase">{vit.veg_source}</p>
                                 </div>
                                 <div className="bg-white/60 p-3 rounded-2xl border border-emerald-100 text-center">
                                    <p className="text-[8px] font-black text-emerald-700 uppercase tracking-widest mb-1">Non-Veg</p>
                                    <p className="text-[9px] font-bold text-emerald-900 uppercase">{vit.non_veg_source}</p>
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
  
                   <div className="pt-6 border-t border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-black">Health Summary</h4>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed uppercase tracking-tight">{analysis.healthSummary}</p>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FaceScanAnalysis;
