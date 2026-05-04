import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Brain, ShieldAlert, Loader2, X, ChevronRight, Activity, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateContent } from '../lib/gemini';
import { cn } from '../types';

// ai initialized via server-side proxy

interface SpeechAnalysis {
  vocalStability: number; // 0-100
  cognitiveClarity: number; // 0-100
  neurologicalFlags: string[];
  vocalToneAnalysis: string;
  recommendations: string[];
}

interface NeuroSpeechScreenerProps {
  onBack?: () => void;
}

const NeuroSpeechScreener: React.FC<NeuroSpeechScreenerProps> = ({ onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SpeechAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setError("Microphone error. Please ensure permissions are granted.");
        setIsRecording(false);
      };
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setTimeout(() => {
        stopRecording();
      }, 15000);
    }
    return () => clearTimeout(timer);
  }, [isRecording]);

  const startRecording = () => {
    setTranscript('');
    setAnalysis(null);
    setError(null);
    setIsRecording(true);
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  useEffect(() => {
    if (!isRecording && transcript.trim() && !analysis && !isAnalyzing) {
      analyzeSpeech(transcript);
    }
  }, [isRecording, transcript]);

  const analyzeSpeech = async (text: string) => {
    setIsAnalyzing(true);
    try {
      const result = await generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          parts: [{
            text: `You are a specialized Neuro-Vocal Bio-Marker analyzer. Analyze the following transcript of a patient's speech for neurological and cognitive indicators. 
            Transcript: "${text}"
            
            Evaluate for:
            1. Cognitive clarity (logic, coherence).
            2. Potential neurological flags (slurring, word finding difficulty, repetition).
            3. Vocal tone (emotional baseline).
            
            IMPORTANT: All text in 'vocalToneAnalysis' and 'recommendations' MUST be in VERY SIMPLE ENGLISH language understandable to a 10-year-old. Avoid medical jargon.
            
            Return ONLY a JSON object matching this schema:
            {
              "vocalStability": number, // 0-100
              "cognitiveClarity": number, // 0-100
              "neurologicalFlags": string[],
              "vocalToneAnalysis": "string",
              "recommendations": string[]
            }`
          }]
        }]
      });

      const responseText = result.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setAnalysis(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error("Failed to parse bio-marker data.");
      }
    } catch (err) {
      console.error(err);
      setError("AI Analysis failed. Please try speaking for a longer duration.");
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
          <X className="w-4 h-4 rotate-180" /> Back to Neuro Hub
        </button>
      )}

      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-purple-100 rounded-3xl text-purple-600 mb-4 shadow-sm">
          <Brain className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Neuro-Vocal Bio-Marker</h1>
        <p className="text-lg font-bold text-slate-500 uppercase tracking-tight max-w-xl mx-auto">
          Linguistic & Cognitive Integrity Screening
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Recording Interface */}
        <div className="space-y-6">
          <div className="bg-[#0F172A] p-10 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
            {/* Visualizer Effect */}
            <AnimatePresence>
              {isRecording && (
                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-x-0 bottom-0 h-32 flex items-end justify-center gap-1 px-10 pb-10"
                >
                   {[...Array(20)].map((_, i) => (
                     <motion.div 
                       key={i}
                       animate={{ height: [10, Math.random() * 60 + 20, 10] }}
                       transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5 }}
                       className="w-1 bg-purple-500 rounded-full"
                     />
                   ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative z-10 text-center space-y-8">
               <motion.div 
                 animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className={cn(
                   "w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-2xl transition-all cursor-pointer",
                   isRecording ? "bg-red-600 ring-8 ring-red-600/20" : "bg-purple-600 hover:bg-purple-700"
                 )}
                 onClick={isRecording ? stopRecording : startRecording}
               >
                 {isRecording ? <Square className="w-10 h-10 text-white fill-current" /> : <Mic className="w-10 h-10 text-white" />}
               </motion.div>

               <div className="space-y-2">
                 <p className="text-2xl font-black text-white uppercase tracking-tighter">
                   {isRecording ? "Listening..." : "Tap to Speak"}
                 </p>
                 <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                   Speak naturally for at least 15 seconds
                 </p>
               </div>
            </div>

            {transcript && (
              <div className="absolute top-6 left-6 right-6 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 max-h-[100px] overflow-hidden">
                <p className="text-xs text-purple-200 italic font-medium leading-relaxed">
                  "{transcript}"
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 bg-purple-900/90 backdrop-blur-xl flex flex-col items-center justify-center text-white p-8">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="text-xl font-black uppercase tracking-widest text-center">AI Bio-Marker Inference...</p>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
             <div className="flex items-center gap-3 text-purple-600">
                <ShieldAlert className="w-5 h-5" />
                <h4 className="text-xs font-black uppercase tracking-widest">Clinical Protocol</h4>
             </div>
             <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
               This screen analyzes patterns in vocal stability and linguistic coherence. It is not a diagnostic for stroke or TIA but can detect cognitive fatigue or abnormal speech clusters.
             </p>
          </div>
        </div>

        {/* Right: Analysis Dashboard */}
        <AnimatePresence mode="wait">
          {analysis ? (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="space-y-6 px-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vocal Stability</p>
                      <p className="text-4xl font-black text-purple-600 tracking-tighter">{analysis.vocalStability}%</p>
                   </div>
                   <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cognitive Clarity</p>
                      <p className="text-4xl font-black text-blue-600 tracking-tighter">{analysis.cognitiveClarity}%</p>
                   </div>
                </div>
  
                <div className="card-bold p-8 bg-white space-y-6">
                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 font-black">
                         <Activity className="w-4 h-4" /> Neurological Flags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                         {analysis.neurologicalFlags.length > 0 ? analysis.neurologicalFlags.map((flag, i) => (
                           <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-black uppercase tracking-widest border border-red-100">
                             {flag}
                           </span>
                         )) : (
                           <span className="text-xs font-bold text-slate-400 italic">No significant flags detected</span>
                         )}
                      </div>
                   </div>
  
                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2 font-black">
                         <MessageSquare className="w-4 h-4" /> Vocal Tone Analysis
                      </h4>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed uppercase tracking-tight">
                        {analysis.vocalToneAnalysis}
                      </p>
                   </div>
  
                   <div className="pt-6 border-t border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 font-black">Tactical Recommendations</h4>
                      <div className="space-y-3">
                         {analysis.recommendations.map((rec, i) => (
                           <div key={i} className="flex gap-3 items-center text-xs font-black text-slate-900 uppercase tracking-tight">
                              <ChevronRight className="w-4 h-4 text-purple-500" />
                              {rec}
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          ) : !isAnalyzing && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[40px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 text-center"
            >
               <div className="p-8 bg-slate-50 rounded-full text-slate-200 mb-6">
                  <Brain className="w-12 h-12" />
               </div>
               <h3 className="text-xl font-black text-slate-300 uppercase tracking-tight">Awaiting Speech Sample</h3>
               <p className="text-sm font-bold text-slate-400 uppercase mt-2 max-w-[200px]">Recording allows the AI to map your baseline cognitive integrity.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-black uppercase tracking-widest text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default NeuroSpeechScreener;
