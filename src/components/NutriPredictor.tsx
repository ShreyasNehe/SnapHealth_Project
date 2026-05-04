import React, { useState, useRef, useEffect } from 'react';
import { Camera, Search, Loader2, X, Activity, Globe, Info, Zap, ChevronRight, Video, StopCircle, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateContent } from '../lib/gemini';
import { cn } from '../types';

// ai initialized via server-side proxy

interface NutriAnalysis {
  item: string;
  glycemicLoad: number; // 0-50
  glycemicIndex: number; // 0-100
  estimatedCalories: number;
  macros: {
    protein: string;
    carbs: string;
    fats: string;
  };
  predictedGlucoseResponse: 'stable' | 'spike' | 'moderate';
  clinicalNote: string;
  alternatives: string[];
}

interface NutriPredictorProps {
  onBack?: () => void;
}

const NutriPredictor: React.FC<NutriPredictorProps> = ({ onBack }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<NutriAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isLive) {
      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
          setError("Camera permission denied.");
          setIsLive(false);
        }
      };
      startCamera();
    }
    return () => stream?.getTracks().forEach(track => track.stop());
  }, [isLive]);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImage(dataUrl);
      setIsLive(false);
      analyzeFood(dataUrl);
    }
  };

  const analyzeFood = async (base64Image?: string) => {
    const activeImage = base64Image || image;
    if (!activeImage) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const base64Data = activeImage.split(',')[1];
      const result = await generateContent({
        model: "gemini-2.5-flash",
        contents: [{
          parts: [
            { text: "Analyze this meal image for metabolic impact. Estimate the Glycemic Load, Glycemic Index, and primary macronutrients. Predict if it will cause a glucose spike. IMPORTANT: The 'clinicalNote' and 'item' MUST be in VERY SIMPLE ENGLISH (10-year-old level). Return ONLY a JSON object matching this schema: { \"item\": \"string\", \"glycemicLoad\": number, \"glycemicIndex\": number, \"estimatedCalories\": number, \"macros\": { \"protein\": \"string\", \"carbs\": \"string\", \"fats\": \"string\" }, \"predictedGlucoseResponse\": \"stable\"|\"spike\"|\"moderate\", \"clinicalNote\": \"string\", \"alternatives\": string[] }" },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }]
      });

      const text = result.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setAnalysis(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error("Unable to parse nutrition data.");
      }
    } catch (err) {
      console.error(err);
      setError("AI Vision failed to recognize content. Please ensure food is clearly visible.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all uppercase text-[10px] font-black tracking-widest mb-4">
          <X className="w-4 h-4 rotate-180" /> Back to Metabolism Hub
        </button>
      )}

      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-amber-100 rounded-3xl text-amber-600 mb-4 shadow-sm">
          <Globe className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Nutri-Predictor</h1>
        <p className="text-lg font-bold text-slate-500 uppercase tracking-tight max-w-xl mx-auto">Metabolic Load & Glucose Response Modeling</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="relative aspect-square bg-[#0F172A] rounded-[40px] border-4 border-white shadow-2xl overflow-hidden group">
            <AnimatePresence mode="wait">
              {isLive ? (
                <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-white/20 m-12 rounded-3xl pointer-events-none" />
                  <button onClick={captureFrame} className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl">
                    <Scan className="w-5 h-5" /> Analyze Selection
                  </button>
                </motion.div>
              ) : image ? (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative">
                   <img src={image} className="w-full h-full object-cover" alt="Meal" />
                   <button onClick={() => {setImage(null); setAnalysis(null);}} className="absolute top-4 right-4 p-4 bg-red-600 text-white rounded-2xl shadow-xl"><X className="w-6 h-6" /></button>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full gap-6">
                   <button onClick={() => setIsLive(true)} className="p-8 bg-white/5 rounded-[40px] hover:bg-amber-500/20 transition-all border border-white/10 flex flex-col items-center gap-4">
                      <div className="p-6 bg-amber-500 text-white rounded-full shadow-2xl"><Video className="w-8 h-8" /></div>
                      <p className="text-xl font-black text-white uppercase tracking-widest">Live Metabolism Scan</p>
                   </button>
                </motion.div>
              )}
            </AnimatePresence>
            <canvas ref={canvasRef} className="hidden" />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-amber-600/60 backdrop-blur-xl flex flex-col items-center justify-center text-white p-8">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="text-xl font-black uppercase tracking-widest text-center">Predicting Bio-Response...</p>
              </div>
            )}
          </div>
          <div className="p-6 bg-white rounded-3xl border border-slate-100 flex gap-4">
             <Info className="w-6 h-6 text-amber-500 shrink-0" />
             <p className="text-xs font-bold text-slate-500 uppercase tracking-tight leading-relaxed line-clamp-2">AI-Vision maps structural food composition to validated glycemic databases for real-time load estimation.</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {analysis && (
            <motion.div key="analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="space-y-6 px-4 py-2">
                <div className={cn(
                  "p-8 rounded-[40px] border-4 border-white shadow-2xl text-white space-y-4",
                  analysis.predictedGlucoseResponse === 'stable' ? "bg-green-600" : analysis.predictedGlucoseResponse === 'moderate' ? "bg-amber-600" : "bg-red-600"
                )}>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Predicted Response</span>
                      <Zap className={cn("w-6 h-6", analysis.predictedGlucoseResponse === 'spike' && "animate-pulse")} />
                   </div>
                   <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{analysis.predictedGlucoseResponse}</h2>
                   <p className="text-sm font-bold opacity-90 uppercase tracking-tight">{analysis.item}</p>
                   <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-center">
                         <p className="text-[10px] uppercase font-black opacity-70">GL Load</p>
                         <p className="text-2xl font-black">{analysis.glycemicLoad}</p>
                      </div>
                      <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-center">
                         <p className="text-[10px] uppercase font-black opacity-70">GI Index</p>
                         <p className="text-2xl font-black">{analysis.glycemicIndex}</p>
                      </div>
                   </div>
                </div>
  
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
                   <div className="grid grid-cols-3 gap-2">
                      {Object.entries(analysis.macros).map(([k, v]) => (
                        <div key={k} className="bg-slate-50 p-3 rounded-2xl text-center">
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{k}</p>
                           <p className="text-sm font-black text-[#0F172A] uppercase">{v}</p>
                        </div>
                      ))}
                   </div>
                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-black">Metabolic Insight</h4>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed uppercase tracking-tight">{analysis.clinicalNote}</p>
                   </div>
                   <div className="pt-6 border-t border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 font-black">Stable-Glucose Alternatives</h4>
                      <div className="space-y-2">
                         {analysis.alternatives.map((alt, i) => (
                           <div key={i} className="flex gap-3 items-center text-xs font-black text-slate-600 uppercase tracking-tight">
                              <ChevronRight className="w-4 h-4 text-amber-500" /> {alt}
                           </div>
                         ))}
                      </div>
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

export default NutriPredictor;
