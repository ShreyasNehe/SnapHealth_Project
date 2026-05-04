import React, { useState, useRef, useEffect } from 'react';
import { Camera, Search, Loader2, X, Activity, Scissors, Info, Zap, ChevronRight, Video, Scan, Sparkles, MapPin, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateContent } from '../lib/gemini';
import { cn } from '../types';

// ai initialized via server-side proxy

interface TrichologyAnalysis {
  hairDensity: 'optimal' | 'thinning' | 'low';
  scalpHealth: 'clear' | 'dry/flaky' | 'congested/oily';
  textureNote: string;
  nutritionalInsight: string;
  recommendedRoutine: string;
  simpleExplanation: string;
}

interface TrichologyScanProps {
  onBack?: () => void;
}

const TrichologyScan: React.FC<TrichologyScanProps> = ({ onBack }) => {
  const [images, setImages] = useState<{ center?: string; left?: string; right?: string }>({});
  const [captureStep, setCaptureStep] = useState<'center' | 'left' | 'right' | 'complete'>('center');
  const [analysis, setAnalysis] = useState<TrichologyAnalysis | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
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
          setError("Trichology scan requires macro camera access.");
          setIsLive(false);
        }
      };
      startCamera();
    }
    return () => stream?.getTracks().forEach(track => track.stop());
  }, [isLive]);

  const captureHair = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      const updatedImages = { ...images, [captureStep]: dataUrl };
      setImages(updatedImages);

      if (captureStep === 'center') {
        setCaptureStep('left');
      } else if (captureStep === 'left') {
        setCaptureStep('right');
      } else {
        setCaptureStep('complete');
        setIsLive(false);
        performTrichologyScan(updatedImages);
      }
    }
  };

  const performTrichologyScan = async (capturedImages: { center?: string; left?: string; right?: string }) => {
    if (!capturedImages.center || !capturedImages.left || !capturedImages.right) return;

    setIsScanning(true);
    setError(null);
    try {
      const prompt = "Act as an AI Trichologist (Hair & Scalp Expert). Analyze these THREE images of a person's hair and scalp from different angles (Center/Top, Left Side, Right Side). This provides a comprehensive view of density and scalp health across the entire head. Identify: 1. Hair density level. 2. Scalp health (check for flakes, redness, or oiliness). 3. Texture notes. 4. Nutritional insights (e.g. signs of protein or iron deficiency from hair quality). IMPORTANT: All text in 'recommendedRoutine', 'nutritionalInsight', and 'simpleExplanation' MUST be in VERY SIMPLE ENGLISH (10-year-old level). Avoid medical jargon. Output ONLY a JSON object matching this schema: { \"hairDensity\": \"optimal\"|\"thinning\"|\"low\", \"scalpHealth\": \"clear\"|\"dry/flaky\"|\"congested/oily\", \"textureNote\": \"string\", \"nutritionalInsight\": \"string\", \"recommendedRoutine\": \"string\", \"simpleExplanation\": \"string\" }";
      
      const parts: any[] = [{ text: prompt }];

      if (capturedImages.center) parts.push({ inlineData: { mimeType: "image/jpeg", data: capturedImages.center.split(',')[1] } });
      if (capturedImages.left) parts.push({ inlineData: { mimeType: "image/jpeg", data: capturedImages.left.split(',')[1] } });
      if (capturedImages.right) parts.push({ inlineData: { mimeType: "image/jpeg", data: capturedImages.right.split(',')[1] } });

      const result = await generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts }]
      });

      const text = result.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setAnalysis(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error("Trichology pattern recognition failure.");
      }
    } catch (err) {
      console.error(err);
      setError("Scan failed. Ensure your scalp and hair are clearly visible in all shots.");
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
        <div className="inline-flex p-4 bg-orange-100 rounded-3xl text-orange-600 mb-4 shadow-sm">
          <Scissors className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Hair Vitality Scan</h1>
        <p className="text-lg font-bold text-slate-500 uppercase tracking-tight max-w-xl mx-auto">Multi-Angle AI Trichology Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="relative aspect-square bg-[#010B13] rounded-[48px] border-4 border-white shadow-2xl overflow-hidden group">
            <AnimatePresence mode="wait">
              {isLive ? (
                <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="w-full h-full border-2 border-orange-500/50 rounded-[40px] relative">
                       <div className="absolute top-1/2 left-0 right-0 h-px bg-orange-500/30 animate-[scan_4s_infinite]" />
                       <motion.div 
                        key={captureStep}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 whitespace-nowrap"
                       >
                         <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-orange-500/30">
                           {captureStep === 'center' ? 'Target Top of Scalp' : captureStep === 'left' ? 'Target Left Side' : 'Target Right Side'}
                         </span>
                         <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest italic">{captureStep === 'center' ? 'Step 1/3' : captureStep === 'left' ? 'Step 2/3' : 'Step 3/3'}</span>
                       </motion.div>
                    </div>
                  </div>
                  <button onClick={captureHair} className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl active:scale-95 transition-all">
                    <Scan className="w-6 h-6" /> {captureStep === 'right' ? 'Finalize Scan' : 'Capture Zone'}
                  </button>
                </motion.div>
              ) : captureStep === 'complete' ? (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative bg-slate-900 p-4">
                   <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
                      {Object.entries(images).map(([step, url]) => (
                        <div key={step} className="relative rounded-2xl overflow-hidden border border-white/10 group">
                           <img src={url} className="w-full h-full object-cover" alt={`${step} preview`} />
                           <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-widest">{step} View</div>
                        </div>
                      ))}
                   </div>
                   <button onClick={() => {setImages({}); setCaptureStep('center'); setAnalysis(null);}} className="absolute top-6 right-6 p-4 bg-red-600 text-white rounded-2xl shadow-xl transition-all"><X className="w-6 h-6" /></button>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full gap-6">
                   <button onClick={() => setIsLive(true)} className="group p-10 bg-white/5 rounded-[60px] hover:bg-orange-500/20 transition-all border border-white/10 flex flex-col items-center gap-6">
                      <div className="p-10 bg-orange-500 text-white rounded-full shadow-2xl group-hover:scale-110 transition-transform"><Camera className="w-16 h-16" /></div>
                      <p className="text-2xl font-black text-white uppercase tracking-widest">Launch Hair Scan</p>
                   </button>
                </motion.div>
              )}
            </AnimatePresence>
            <canvas ref={canvasRef} className="hidden" />
            {isScanning && (
              <div className="absolute inset-0 bg-orange-950/90 backdrop-blur-xl flex flex-col items-center justify-center text-white p-8 text-center">
                <Loader2 className="w-16 h-16 animate-spin mb-6 text-orange-400" />
                <p className="text-2xl font-black uppercase tracking-[0.2em]">Spectral Mapping <br/>Follicle Density...</p>
                 <div className="mt-6 flex gap-2">
                   {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" style={{ animationDelay: `${i*0.3}s` }} />)}
                </div>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {analysis && (
            <motion.div key="analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="space-y-6 px-4">
                <div className={cn(
                  "p-8 rounded-[40px] border-4 border-white shadow-2xl text-white space-y-6",
                  analysis.hairDensity === 'optimal' ? "bg-orange-600" : analysis.hairDensity === 'thinning' ? "bg-amber-600" : "bg-red-600"
                )}>
                   <div className="flex justify-between items-center opacity-80 uppercase text-[10px] font-black tracking-widest">
                      <span>Follicle Vitality</span>
                      <Sparkles className="w-4 h-4" />
                   </div>
                   <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">{analysis.hairDensity}</h2>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 p-4 rounded-3xl">
                         <p className="text-[8px] font-black opacity-70 uppercase mb-1">Scalp Health</p>
                         <p className="text-lg font-black uppercase">{analysis.scalpHealth}</p>
                      </div>
                   </div>
                </div>
  
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-black">Structure & Texture</h4>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed uppercase tracking-tight">{analysis.textureNote}</p>
                   </div>
  
                   <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                      <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2 font-black">Nutritional Impact</h4>
                      <p className="text-sm font-black text-orange-900 leading-relaxed uppercase tracking-tight">{analysis.nutritionalInsight}</p>
                   </div>
  
                   <div className="p-6 bg-slate-950 text-white rounded-3xl shadow-xl">
                      <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2 font-black">AI Recommended Routine</h4>
                      <p className="text-sm font-bold leading-relaxed uppercase tracking-tight">{analysis.recommendedRoutine}</p>
                   </div>
  
                   <div className="pt-6 border-t border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-black">Summary</h4>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-tight leading-relaxed">{analysis.simpleExplanation}</p>
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

export default TrichologyScan;
