import React, { useState, useRef, useEffect } from 'react';
import { Camera, Search, Loader2, X, Activity, Eye, Info, Zap, ChevronRight, Video, Scan, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateContent } from '../lib/gemini';
import { cn } from '../types';

// ai initialized via server-side proxy

interface OcularAnalysis {
  scleraHealth: 'normal' | 'yellowed' | 'reddened';
  anemiaRisk: 'low' | 'moderate' | 'high';
  bloodPressureSign: 'normal' | 'congested';
  organIndicators: string;
  suggestedAction: string;
  simpleExplanation: string;
  trust_builder?: { module: string; x: number; y: number; label: string }[];
}

interface OcularSentinelProps {
  onBack?: () => void;
}

const OcularSentinel: React.FC<OcularSentinelProps> = ({ onBack }) => {
  const [images, setImages] = useState<{ front?: string; right?: string; left?: string }>({});
  const [captureStep, setCaptureStep] = useState<'front' | 'right' | 'left' | 'complete'>('front');
  const [analysis, setAnalysis] = useState<OcularAnalysis | null>(null);
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
          setError("Ocular scan requires camera access. Please enable permissions.");
          setIsLive(false);
        }
      };
      startCamera();
    }
    return () => stream?.getTracks().forEach(track => track.stop());
  }, [isLive]);

  const captureEye = () => {
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
        performOcularScan(updatedImages);
      }
    }
  };

  const performOcularScan = async (capturedImages: { front?: string; right?: string; left?: string }) => {
    if (!capturedImages.front || !capturedImages.right || !capturedImages.left) return;

    setIsScanning(true);
    setError(null);
    try {
      const prompt = "Act as a specialized Ocular Diagnostician. Analyze these three images focused on the user's eye from different angles (Front, Right-looking, Left-looking). This multi-angle view provides a better look at the sclera and vascular patterns. Identify: 1. Sclera color (jaundice check). 2. Redness level (viral or BP indicators). 3. Eyelid pallor (anemia check). 4. Non-invasive organ health indicators. 5. Trust Builder: Identify exactly 3-4 visual hotspots (x, y coordinates from 0-100) on the 'front' image that led to your conclusions. IMPORTANT: All text in 'organIndicators', 'suggestedAction', and 'simpleExplanation' MUST be in VERY SIMPLE ENGLISH (10-year-old level). Avoid medical jargon. Output ONLY a JSON object matching this schema: { \"scleraHealth\": \"normal\"|\"yellowed\"|\"reddened\", \"anemiaRisk\": \"low\"|\"moderate\"|\"high\", \"bloodPressureSign\": \"normal\"|\"congested\", \"organIndicators\": \"string\", \"suggestedAction\": \"string\", \"simpleExplanation\": \"string\", \"trust_builder\": [{ \"module\": \"string\", \"x\": number, \"y\": number, \"label\": \"string\" }] }";
      
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
        throw new Error("Ocular pattern recognition failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Scan aborted. Ensure your eye is well-lit and clearly visible in all shots.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all uppercase text-[10px] font-black tracking-widest mb-4">
          <X className="w-4 h-4 rotate-180" /> Back to Advanced Diagnostics
        </button>
      )}

      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-blue-100 rounded-3xl text-blue-600 mb-4 shadow-sm">
          <Eye className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Ocular Sentinel</h1>
        <p className="text-lg font-bold text-slate-500 uppercase tracking-tight max-w-xl mx-auto">Multi-Angle Biometric Eye Scan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="relative aspect-square bg-[#010BC3] rounded-[48px] border-4 border-[#0F172A] shadow-[0_0_50px_rgba(30,64,175,0.2)] overflow-hidden group">
            <AnimatePresence mode="wait">
              {isLive ? (
                <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  {/* Eye Target Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                       <div className="w-32 h-32 border-4 border-dashed border-blue-500/50 rounded-full animate-spin-slow" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                       </div>
                       <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={captureStep}
                        className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                       >
                         <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] whitespace-nowrap bg-blue-950/80 px-4 py-2 rounded-full backdrop-blur-md border border-blue-500/30 shadow-2xl">
                           {captureStep === 'front' ? 'Look Straight into Camera' : captureStep === 'right' ? 'Slowly Look to the Right' : 'Slowly Look to the Left'}
                         </span>
                         <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest italic">{captureStep === 'front' ? 'Step 1/3' : captureStep === 'right' ? 'Step 2/3' : 'Step 3/3'}</span>
                       </motion.div>
                    </div>
                  </div>
                  <button onClick={captureEye} className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest flex items-center gap-3 shadow-[0_10px_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all active:scale-95">
                    <Zap className="w-6 h-6 fill-current" /> {captureStep === 'left' ? 'Finalize Scan' : 'Capture Step'}
                  </button>
                </motion.div>
              ) : captureStep === 'complete' ? (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative bg-slate-900 p-4">
                   {showExplanation && analysis?.trust_builder ? (
                     <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                        <img src={images.front} className="w-full h-full object-cover" alt="Eye scan analysis" />
                        <div className="absolute inset-0 bg-blue-900/20" />
                        {analysis.trust_builder.map((marker, i) => (
                           <div 
                             key={i} 
                             className="absolute flex flex-col items-center group/marker" 
                             style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                           >
                              <div className="w-8 h-8 rounded-full bg-blue-400/30 border-2 border-blue-400 animate-ping absolute" />
                              <div className="w-4 h-4 rounded-full bg-blue-400 border-2 border-white shadow-lg relative z-10" />
                              <div className="mt-2 bg-white px-3 py-1 rounded-lg shadow-xl border border-slate-100 opacity-0 group-hover/marker:opacity-100 transition-opacity">
                                 <p className="text-[8px] font-black uppercase text-blue-600 leading-none">{marker.label}</p>
                              </div>
                           </div>
                        ))}
                        <button 
                          onClick={() => setShowExplanation(false)}
                          className="absolute top-6 right-6 px-6 py-2 bg-white text-blue-600 rounded-full text-[10px] font-black uppercase shadow-xl border-2 border-blue-100"
                        >
                          Hide Explain
                        </button>
                     </div>
                   ) : (
                     <div className="grid grid-cols-3 gap-2 h-full">
                        {Object.entries(images).map(([step, url]) => (
                           <div key={step} className="relative rounded-2xl overflow-hidden border border-white/10 group">
                              <img src={url} className="w-full h-full object-cover" alt={`${step} preview`} />
                              <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-widest">{step}</div>
                           </div>
                        ))}
                     </div>
                   )}
                   {!showExplanation && <button onClick={() => {setImages({}); setCaptureStep('front'); setAnalysis(null);}} className="absolute top-6 right-6 p-4 bg-red-600 text-white rounded-2xl shadow-xl transition-all"><X className="w-6 h-6" /></button>}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full gap-6">
                   <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                      <button onClick={() => setIsLive(true)} className="relative group p-10 bg-white/5 rounded-[60px] hover:bg-blue-500/20 transition-all border border-white/10 flex flex-col items-center gap-6">
                         <div className="p-10 bg-blue-600 text-white rounded-full shadow-2xl group-hover:scale-110 transition-transform"><Video className="w-16 h-16" /></div>
                         <p className="text-2xl font-black text-white uppercase tracking-widest">Connect Eye Sensor</p>
                      </button>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
            <canvas ref={canvasRef} className="hidden" />
            {isScanning && (
              <div className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-2xl flex flex-col items-center justify-center text-white p-8">
                <div className="relative mb-8">
                   <Loader2 className="w-24 h-24 text-blue-500 animate-spin" />
                   <Eye className="absolute inset-0 m-auto w-8 h-8 text-white transition-opacity" />
                </div>
                <p className="text-3xl font-black uppercase tracking-[0.3em] text-center">Neural Biometry Assessment...</p>
                <div className="mt-8 grid grid-cols-4 gap-2">
                   {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-12 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                </div>
              </div>
            )}
          </div>
          <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex gap-4">
             <AlertCircle className="w-6 h-6 text-blue-500 shrink-0" />
             <p className="text-[10px] font-black text-blue-900 uppercase tracking-tight leading-relaxed">This module uses Ocular OCR to detect pigment aberrations and vascular congestion. It is a screen for systemic trends, not a diagnostic for eye disease.</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {analysis && (
            <motion.div key="analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex justify-between items-center gap-4">
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full py-4 bg-[#0F172A] text-white rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all group"
                >
                   <Search className="w-4 h-4 group-hover:scale-125 transition-transform" />
                   {showExplanation ? 'Return to Summary' : 'Explain this: Trust Builder'}
                </button>
              </div>

              <div className="space-y-6 px-4 py-2">
                <div className={cn(
                  "p-8 rounded-[40px] border-4 border-white shadow-2xl text-white space-y-6",
                  analysis.scleraHealth === 'normal' ? "bg-blue-600" : "bg-red-700"
                )}>
                   <div className="flex justify-between items-center opacity-80 uppercase text-[10px] font-black tracking-widest">
                      <span>Sclera Tone</span>
                      <Sparkles className="w-4 h-4" />
                   </div>
                   <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">{analysis.scleraHealth}</h2>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 p-4 rounded-3xl border border-white/10">
                         <p className="text-[8px] font-black opacity-70 uppercase tracking-widest mb-1">Anemia Risk</p>
                         <p className="text-xl font-black uppercase">{analysis.anemiaRisk}</p>
                      </div>
                      <div className="bg-white/10 p-4 rounded-3xl border border-white/10">
                         <p className="text-[8px] font-black opacity-70 uppercase tracking-widest mb-1">BP Sign</p>
                         <p className="text-xl font-black uppercase">{analysis.bloodPressureSign}</p>
                      </div>
                   </div>
                </div>
  
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Organ Health Indicators</h4>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed uppercase tracking-tight">{analysis.organIndicators}</p>
                   </div>
  
                   <div className="p-6 bg-slate-900 text-white rounded-3xl">
                      <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">What this means</h4>
                      <p className="text-sm font-bold leading-relaxed uppercase tracking-tight">{analysis.simpleExplanation}</p>
                   </div>
  
                   <div className="pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-red-600 mb-4">
                         <Activity className="w-5 h-5" />
                         <h4 className="text-[10px] font-black uppercase tracking-widest">Recommended Actions</h4>
                      </div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight leading-relaxed">{analysis.suggestedAction}</p>
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

export default OcularSentinel;
