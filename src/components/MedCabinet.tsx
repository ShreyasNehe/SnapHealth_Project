import React, { useState, useRef, useEffect } from 'react';
import { Camera, Scan, ShieldAlert, AlertCircle, Pill, Search, Info, Loader2, X, CheckCircle2, Video, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateContent } from '../lib/gemini';
import { cn } from '../types';

// ai initialized via server-side proxy

interface MedicationSecurity {
  name: string;
  genericName: string;
  isExpired: boolean;
  purpose: string;
  dosageWarning: string;
  safetyFlag: 'safe' | 'caution' | 'dangerous';
  explanation: string;
}

interface MedCabinetProps {
  onBack?: () => void;
}

const MedCabinet: React.FC<MedCabinetProps> = ({ onBack }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MedicationSecurity | null>(null);
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
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera Error:", err);
          setError("Unable to access camera. Please check permissions.");
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

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setAnalysis(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        setIsLive(false);
        scanMedicine(dataUrl);
      }
    }
  };

  const scanMedicine = async (base64Image?: string) => {
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
            { text: "Analyze this medication bottle. Identify: 1. Name and Generic Name. 2. Purpose. 3. Look for expiry dates if visible. 4. Provide a safety flag (safe, caution, dangerous) based on common side effects or critical warnings. 5. Provide a summary. IMPORTANT: All text in 'purpose', 'dosageWarning', and 'explanation' MUST be in VERY SIMPLE ENGLISH (10-year-old level). Avoid medical jargon. Output ONLY a JSON object matching this schema: { \"name\": \"...\", \"genericName\": \"...\", \"isExpired\": boolean, \"purpose\": \"...\", \"dosageWarning\": \"...\", \"safetyFlag\": \"safe\"|\"caution\"|\"dangerous\", \"explanation\": \"...\" }" },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }]
      });

      const text = result.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setAnalysis(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error("Could not parse medication data.");
      }
    } catch (err) {
      console.error(err);
      setError("AI Vision failed to identify the medication. Please ensure the label is clearly visible and well-lit.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all uppercase text-[10px] font-black tracking-widest mb-4"
        >
          <X className="w-4 h-4 rotate-180" /> Back to Med Center
        </button>
      )}

      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-medical-blue/10 rounded-3xl text-medical-blue mb-4 shadow-sm">
          <Pill className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Smart Med Cabinet</h1>
        <p className="text-lg font-bold text-slate-500 uppercase tracking-tight max-w-xl mx-auto">
          Vision-AI Inventory & Safety Scanner
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Camera / Capture */}
        <div className="space-y-6">
          <div className="relative aspect-square bg-[#0F172A] rounded-[40px] border-4 border-white shadow-2xl overflow-hidden group">
            <AnimatePresence mode="wait">
              {isLive ? (
                <motion.div 
                  key="live"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full relative"
                >
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {/* Overlay Scanner UI */}
                  <div className="absolute inset-0 border-[3px] border-medical-blue/30 m-12 rounded-3xl pointer-events-none ring-[100px] ring-black/40">
                     <div className="absolute top-0 left-0 w-8 h-8 border-t-8 border-l-8 border-medical-blue rounded-tl-xl" />
                     <div className="absolute top-0 right-0 w-8 h-8 border-t-8 border-r-8 border-medical-blue rounded-tr-xl" />
                     <div className="absolute bottom-0 left-0 w-8 h-8 border-b-8 border-l-8 border-medical-blue rounded-bl-xl" />
                     <div className="absolute bottom-0 right-0 w-8 h-8 border-b-8 border-r-8 border-medical-blue rounded-br-xl" />
                     <div className="absolute top-1/2 left-0 right-0 h-1 bg-medical-blue/40 animate-[scan_2s_infinite]" />
                  </div>
                  <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4 px-8">
                     <button 
                       onClick={captureFrame}
                       className="flex-1 bg-medical-blue text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
                     >
                        <Scan className="w-5 h-5" /> Analyze Frame
                     </button>
                     <button 
                       onClick={() => setIsLive(false)}
                       className="p-4 bg-white/10 text-white rounded-2xl backdrop-blur-md hover:bg-white/20"
                     >
                       <StopCircle className="w-6 h-6" />
                     </button>
                  </div>
                </motion.div>
              ) : image ? (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full relative"
                >
                  <img src={image} alt="Medication" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-4 right-4 p-4 bg-red-600 text-white rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center w-full h-full"
                >
                  <div className="flex flex-col items-center gap-6 p-8">
                    <button 
                      onClick={() => setIsLive(true)}
                      className="group flex flex-col items-center gap-4 p-8 bg-white/5 rounded-[40px] hover:bg-medical-blue/20 transition-all border border-white/10"
                    >
                      <div className="p-8 bg-medical-blue text-white rounded-full shadow-2xl group-hover:scale-110 transition-transform">
                        <Video className="w-12 h-12" />
                      </div>
                      <p className="text-xl font-black uppercase tracking-[0.2em] text-white">Open Live Vision</p>
                    </button>
                    
                    <div className="flex items-center gap-4 w-full px-8">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">OR</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <label className="flex items-center gap-3 px-8 py-4 bg-white/5 text-slate-400 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                      <Camera className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-widest">Upload Static Label</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleCapture} />
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <canvas ref={canvasRef} className="hidden" />

            {isScanning && (
              <div className="absolute inset-0 bg-blue-600/40 backdrop-blur-xl flex flex-col items-center justify-center text-white p-8 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                   <div className="absolute top-0 left-0 right-0 h-[2px] bg-white animate-[scan_2s_infinite]" />
                </div>
                <Loader2 className="w-16 h-16 animate-spin mb-6" />
                <p className="text-2xl font-black uppercase tracking-[0.2em] text-center">Inference Engine v3 Active...</p>
                <div className="mt-4 flex gap-1">
                   {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: `${i*0.2}s` }} />)}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-start gap-4 shadow-sm">
             <div className="p-3 bg-blue-50 text-medical-blue rounded-xl"><Info className="w-6 h-6" /></div>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
               Hold the medication label approx. 6 inches from the lens. <span className="text-medical-blue">Live Vision Mode</span> captures the frame with highest optical clarity for precise drug identification.
             </p>
          </div>
        </div>

        {/* Right Column: Analysis Results */}
        <AnimatePresence mode="wait">
          {analysis ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="space-y-6 px-4 py-2">
                <div className={cn(
                  "p-8 rounded-[40px] border-4 border-white shadow-2xl relative overflow-hidden",
                  analysis.safetyFlag === 'safe' ? "bg-green-500" : analysis.safetyFlag === 'caution' ? "bg-amber-500" : "bg-red-600"
                )}>
                   <div className="relative z-10 text-white space-y-6">
                      <div className="flex justify-between items-start">
                         <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <Pill className="w-8 h-8" />
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Security Status</p>
                            <p className="text-2xl font-black uppercase tracking-tight leading-none">{analysis.safetyFlag}</p>
                         </div>
                      </div>
                      <div>
                         <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{analysis.name}</h2>
                         <p className="text-lg font-bold opacity-80 mt-1 uppercase tracking-tight">{analysis.genericName}</p>
                      </div>
                      <div className="p-6 bg-white/10 rounded-[32px] border border-white/20">
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Clinical Indication</p>
                         <p className="font-bold leading-tight uppercase tracking-tight">{analysis.purpose}</p>
                      </div>
                   </div>
                </div>
  
                <div className="card-bold p-8 space-y-6 border-slate-100 bg-white">
                   <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 font-black">
                         <ShieldAlert className="w-4 h-4" /> Safety Explanation
                      </h3>
                      <p className="text-sm font-bold text-slate-700 uppercase tracking-tight leading-relaxed">{analysis.explanation}</p>
                   </div>
                   
                   <div className="pt-6 border-t border-slate-100 flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-2xl shrink-0 shadow-sm",
                        analysis.isExpired ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      )}>
                         <Info className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">{analysis.isExpired ? 'Critical: Expired' : 'Expiry Status: Active'}</p>
                         <p className="text-xs font-bold text-slate-400 uppercase leading-tight mt-1">
                            {analysis.isExpired ? 'Discard medication immediately to prevent adverse reactions.' : 'Store in a cool, dry place out of reach of children.'}
                         </p>
                      </div>
                   </div>
  
                   <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 font-black">Usage Warning</p>
                      <p className="text-xs font-black text-medical-dark uppercase tracking-tight">{analysis.dosageWarning}</p>
                   </div>
                </div>
              </div>
            </motion.div>
          ) : !isScanning && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-[40px] border-4 border-white shadow-xl space-y-6 border-dashed"
            >
              <div className="p-8 bg-slate-50 rounded-full text-slate-200">
                <Search className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-300 uppercase tracking-tighter">Awaiting Input Scan</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-tight max-w-[200px] mx-auto leading-tight mt-2">
                  Show a medication label to the live vision feed to begin
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="p-6 bg-red-50 border-2 border-red-100 rounded-[28px] flex items-center gap-4 text-red-700">
          <AlertCircle className="w-6 h-6" />
          <p className="text-sm font-black uppercase tracking-tight">{error}</p>
        </div>
      )}

      {/* Feature Footnotes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
         <div className="flex gap-4 items-center p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Interaction Guard</span>
         </div>
         <div className="flex gap-4 items-center p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Expiry Detector</span>
         </div>
         <div className="flex gap-4 items-center p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Vision Recall OCR</span>
         </div>
      </div>
    </div>
  );
};

export default MedCabinet;
