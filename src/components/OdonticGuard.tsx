import React, { useState, useRef, useEffect } from 'react';
import { Camera, Search, Loader2, X, Activity, Stethoscope, Info, Zap, ChevronRight, Video, Scan, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateContent } from '../lib/gemini';
import { cn } from '../types';

// ai initialized via server-side proxy

interface OdonticAnalysis {
  gumHealth: 'optimal' | 'inflamed' | 'receding';
  enamelState: 'strong' | 'weakened' | 'eroded';
  plaqueIndex: 'low' | 'moderate' | 'high';
  dentalAlerts: string[];
  careProtocol: string;
  simpleExplanation: string;
}

interface OdonticGuardProps {
  onBack?: () => void;
}

const OdonticGuard: React.FC<OdonticGuardProps> = ({ onBack }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<OdonticAnalysis | null>(null);
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
          setError("Odontic scan requires macro camera access.");
          setIsLive(false);
        }
      };
      startCamera();
    }
    return () => stream?.getTracks().forEach(track => track.stop());
  }, [isLive]);

  const captureMouth = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImage(dataUrl);
      setIsLive(false);
      performOdonticScan(dataUrl);
    }
  };

  const performOdonticScan = async (base64Image?: string) => {
    const activeImage = base64Image || image;
    if (!activeImage) return;

    setIsScanning(true);
    setError(null);
    try {
      const base64Data = activeImage.split(',')[1];
      const result = await generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          parts: [
            { text: "Act as an AI Dental Professional and Periodontist. Analyze this image of teeth and gums. Identify: 1. Gum health (inflammation/redness). 2. Enamel state (whiteness vs erosion marks). 3. Plaque index. 4. Potential alerts. IMPORTANT: All text in 'careProtocol' and 'simpleExplanation' MUST be in VERY SIMPLE ENGLISH (10-year-old level). Avoid medical jargon. Output ONLY a JSON object matching this schema: { \"gumHealth\": \"optimal\"|\"inflamed\"|\"receding\", \"enamelState\": \"strong\"|\"weakened\"|\"eroded\", \"plaqueIndex\": \"low\"|\"moderate\"|\"high\", \"dentalAlerts\": string[], \"careProtocol\": \"string\", \"simpleExplanation\": \"string\" }" },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }]
      });

      const text = result.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setAnalysis(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error("Odontic pattern recognition failure.");
      }
    } catch (err) {
      console.error(err);
      setError("Scan aborted. Ensure your mouth is well-lit and teeth are visible.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all uppercase text-[10px] font-black tracking-widest mb-4">
          <X className="w-4 h-4 rotate-180" /> Back to Diagnostics
        </button>
      )}

      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-rose-100 rounded-3xl text-rose-600 mb-4 shadow-sm">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Odontic Guard</h1>
        <p className="text-lg font-bold text-slate-500 uppercase tracking-tight max-w-xl mx-auto">AI Oral Health & Gum Scan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="relative aspect-square bg-[#010B13] rounded-[48px] border-4 border-white shadow-2xl overflow-hidden group">
            <AnimatePresence mode="wait">
              {isLive ? (
                <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                  <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="w-full h-full border-2 border-rose-500/50 rounded-[40px] relative">
                       <div className="absolute top-1/2 left-0 right-0 h-px bg-rose-500/30 animate-[scan_3s_infinite]" />
                       <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-rose-400 uppercase tracking-widest whitespace-nowrap bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-rose-500/30">Mouth Center / Front Teeth</div>
                    </div>
                  </div>
                  <button onClick={captureMouth} className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl active:scale-95 transition-all">
                    <Scan className="w-6 h-6" /> Start Oral Assessment
                  </button>
                </motion.div>
              ) : image ? (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative">
                   <img src={image} className="w-full h-full object-cover scale-x-[-1]" alt="Mouth Preview" />
                   <button onClick={() => {setImage(null); setAnalysis(null);}} className="absolute top-6 right-6 p-4 bg-red-600 text-white rounded-2xl shadow-xl transition-all"><X className="w-6 h-6" /></button>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full gap-6">
                   <button onClick={() => setIsLive(true)} className="group p-10 bg-white/5 rounded-[60px] hover:bg-rose-500/20 transition-all border border-white/10 flex flex-col items-center gap-6">
                      <div className="p-10 bg-rose-500 text-white rounded-full shadow-2xl group-hover:scale-110 transition-transform"><Video className="w-16 h-16" /></div>
                      <p className="text-2xl font-black text-white uppercase tracking-widest">Connect Oral Scan</p>
                   </button>
                </motion.div>
              )}
            </AnimatePresence>
            <canvas ref={canvasRef} className="hidden" />
            {isScanning && (
              <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-xl flex flex-col items-center justify-center text-white p-8 text-center">
                <Loader2 className="w-16 h-16 animate-spin mb-6 text-rose-400" />
                <p className="text-2xl font-black uppercase tracking-[0.2em]">Analyzing Gingival <br/>& Enamel Density...</p>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {analysis && (
            <motion.div key="analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="space-y-6">
                <div className={cn(
                  "p-8 rounded-[40px] border-4 border-white shadow-2xl text-white space-y-6",
                  analysis.gumHealth === 'optimal' ? "bg-emerald-600" : analysis.gumHealth === 'inflamed' ? "bg-amber-600" : "bg-red-600"
                )}>
                   <div className="flex justify-between items-center opacity-80 uppercase text-[10px] font-black tracking-widest">
                      <span>Oral Vitality</span>
                      <ShieldCheck className="w-4 h-4" />
                   </div>
                   <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">{analysis.gumHealth}</h2>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 p-4 rounded-3xl">
                         <p className="text-[8px] font-black opacity-70 uppercase mb-1">Enamel</p>
                         <p className="text-lg font-black uppercase">{analysis.enamelState}</p>
                      </div>
                      <div className="bg-white/10 p-4 rounded-3xl">
                         <p className="text-[8px] font-black opacity-70 uppercase mb-1">Plaque</p>
                         <p className="text-lg font-black uppercase">{analysis.plaqueIndex}</p>
                      </div>
                   </div>
                </div>
  
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 font-black">Clinical Indicators</h4>
                      <div className="flex flex-wrap gap-2">
                         {analysis.dentalAlerts.map((alert, i) => (
                           <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-100">{alert}</span>
                         ))}
                      </div>
                   </div>
  
                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-black">Oral Status</h4>
                      <p className="text-sm font-bold text-slate-600 leading-relaxed uppercase tracking-tight">{analysis.simpleExplanation}</p>
                   </div>
  
                   <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                      <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 font-black">Home Care Protocol</h4>
                      <p className="text-sm font-black text-blue-900 leading-relaxed uppercase tracking-tight">{analysis.careProtocol}</p>
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

export default OdonticGuard;
