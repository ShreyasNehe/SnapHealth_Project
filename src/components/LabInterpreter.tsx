import React, { useState } from 'react';
import { Camera, Upload, Loader2, AlertCircle, FileText, CheckCircle2, ChevronRight, Activity, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateContent } from '../lib/gemini';
import { cn } from '../types';

// ai initialized via server-side proxy

interface LabInterpreterProps {
  onBack?: () => void;
}

const LabInterpreter: React.FC<LabInterpreterProps> = ({ onBack }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const analyzeReport = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Data = image.split(',')[1];
      const result = await generateContent({
        model: "gemini-2.5-flash",
        contents: [{
          parts: [
            { text: "You are a specialized Clinical Lab Result Interpreter. Analyze this medical report image. 1. OCR the key results. 2. Explain them in VERY SIMPLE ENGLISH language (10-year-old level). Avoid medical jargon. 3. Identify any values outside normal reference ranges. 4. Suggest questions the patient should ask their doctor. 5. Include a strong medical disclaimer. Format with Markdown." },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }]
      });

      setAnalysis(result.text || "Unable to parse clinical data. Please ensure the image is clear.");
    } catch (err) {
      console.error(err);
      setError("AI Analysis failed. This usually happens with blurry images or network timeouts.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all uppercase text-[10px] font-black tracking-widest mb-4"
        >
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Command Center
        </button>
      )}

      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-medical-blue/10 rounded-3xl text-medical-blue mb-4 shadow-sm border border-blue-50">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Lab Intelligence</h1>
        <p className="text-lg font-bold text-slate-500 uppercase tracking-tight max-w-xl mx-auto">
          Vision-Powered Report OCR & Cognitive Medical Summarization
        </p>
      </div>

      {!image ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group curso-pointer"
        >
          <label className="flex flex-col items-center justify-center w-full h-[400px] border-4 border-dashed border-slate-200 rounded-[40px] bg-white hover:bg-blue-50 transition-all cursor-pointer group-hover:border-medical-blue/40">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 space-y-4">
              <div className="p-6 bg-slate-100 rounded-full group-hover:bg-medical-blue group-hover:text-white transition-all shadow-inner">
                <Upload className="w-10 h-10" />
              </div>
              <p className="text-xl font-black uppercase tracking-[0.1em] text-slate-400 group-hover:text-medical-blue">Upload Lab Result Image</p>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Supports PDF, JPG, PNG (Max 10MB)</p>
            </div>
            <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
          </label>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="aspect-[3/4] rounded-[32px] overflow-hidden border-4 border-white shadow-2xl relative group">
              <img src={image} alt="Lab Report" className="w-full h-full object-contain bg-slate-100" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-4 right-4 p-3 bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {!analysis && (
              <button 
                onClick={analyzeReport}
                disabled={isAnalyzing}
                className="w-full bg-[#1A6BCC] text-white py-6 rounded-[24px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-4 group"
              >
                {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Activity className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                {isAnalyzing ? "Processing Vision OCR..." : "Start AI Interpretation"}
              </button>
            )}
          </motion.div>

          <AnimatePresence>
            {(analysis || isAnalyzing) && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[32px] border-4 border-white shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="bg-[#F8FAFC] px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={cn("w-5 h-5", analysis ? "text-green-500" : "text-slate-200")} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interpretation Engine v3.1</span>
                  </div>
                  {isAnalyzing && (
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-medical-blue animate-pulse" />
                       <span className="text-[10px] font-black text-medical-blue uppercase tracking-widest">Active Scan</span>
                    </div>
                  )}
                </div>
                
                <div className="p-8 flex-1 overflow-y-auto max-h-[600px] prose prose-slate prose-sm prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter">
                  {isAnalyzing ? (
                    <div className="space-y-6">
                       <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse" />
                       <div className="h-32 bg-slate-100 rounded-2xl w-full animate-pulse" />
                       <div className="h-4 bg-slate-100 rounded-full w-1/2 animate-pulse" />
                       <div className="h-20 bg-slate-100 rounded-2xl w-full animate-pulse" />
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-bold text-slate-700 leading-relaxed uppercase tracking-tight text-xs">
                      {analysis}
                    </div>
                  )}
                </div>

                <div className="p-6 bg-red-50/50 border-t border-red-50">
                  <div className="flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="text-[9px] font-black text-red-700 uppercase tracking-tight leading-relaxed">
                      AI accuracy can vary. This summary does not constitute a doctor's signature. Always valid clinical results against hospital portal data.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-50 border-2 border-red-100 rounded-[28px] flex items-center gap-4 text-red-700">
          <AlertCircle className="w-6 h-6" />
          <p className="text-sm font-black uppercase tracking-tight">{error}</p>
        </div>
      )}

      {/* Info Grid */}
      {!analysis && !isAnalyzing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          {[
            { icon: Activity, title: 'Range Detection', desc: 'Auto-flags results that deviate from WHO-standard reference values.' },
            { icon: Info, title: 'Semantic Context', desc: 'Explains complex medical terminology in simple, patient-first language.' },
            { icon: CheckCircle2, title: 'Question Builder', desc: 'Generates specific talking points for your next specialist visit.' }
          ].map((item, i) => (
            <div key={i} className="card-bold p-8 text-center bg-white border border-slate-100 shadow-sm">
              <div className="inline-flex p-4 bg-slate-50 rounded-2xl text-medical-blue mb-4">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-2">{item.title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LabInterpreter;
