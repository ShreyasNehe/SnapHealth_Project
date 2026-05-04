import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Loader2, Info } from 'lucide-react';
import { ChatMessage, SymptomPin, PatientProfile, Vitals, TriageAnalysis, cn } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { generateContent } from '../lib/gemini';

interface ChatInterfaceProps {
  profile: PatientProfile;
  symptoms: SymptomPin[];
  vitals: Vitals;
  onAnalysisComplete: (analysis: TriageAnalysis) => void;
  onSemanticEvent?: (event: any) => void;
}

const SYSTEM_PROMPT_INTAKE = (profile: PatientProfile, symptoms: SymptomPin[], vitals: Vitals) => `You are SnapHealth AI, an expert clinical intake assistant. 
Data: Age ${profile.age}, Sex ${profile.sex}, Meds: ${profile.medications}, Symptoms: ${symptoms.map(s => s.zone + ': ' + s.description).join('; ')}

CRITICAL: All patient communication and analysis results MUST be in VERY SIMPLE ENGLISH. Use language that a 10-year-old would understand. Avoid medical jargon unless necessary, and if used, explain it simply.

OBJECTIVES:
1. Conduct focused triage interview, ASKING ONE QUESTION AT A TIME.
2. Provide clickable suggested options for the user to answer with.
3. USE GOOGLE SEARCH to verify rare symptoms, drug-interactions, or specific protocols if needed.
4. DETECT PAIN PATIENTS... (standard instructions)
5. OUTPUT JSON for every question:
   For every follow-up question, also include a <QUESTION_OPTIONS> block AFTER your message.
   Example: <QUESTION_OPTIONS>["Sharp", "Dull", "Aching", "Burning", "Others/Explain..."]</QUESTION_OPTIONS>
   Do NOT repeat the options in the main text of your message.
6. FINAL ASSESSMENT: After 5-6 turns, or if urgency is high, output <ANALYSIS> JSON.

JSON SCHEMA for <ANALYSIS>:
{
  "urgency": "self-care" | "see-doctor" | "urgent-care" | "er-now",
  "urgency_reason": "Rationale (Simple English)",
  "differentials": [{ "condition": "Name", "probability": 0-100, "reasoning": "Simple English explanation" }],
  "red_flags": [],
  "medication_interactions": [],
  "specialist_referral": "...",
  "follow_up_window": "...",
  "pattern_note": "...",
  "clinician_handover": "Professional medical summary (Technical allowed here for MDs)",
  "patient_guidance": "Very simple English summary and reassurances",
  "ai_doctor_care_plan": "A simple English set of immediate steps (e.g. ice, rest).",
  "medication_suggestions": ["Simple OTC med names", "Basic dosage warning", "Always consult primary doctor notice"],
  "audit_trail": [{ "timestamp": "...", "action": "...", "reasoning": "...", "confidence": 0.9 }],
  "grounded_reasoning": "Summary of search findings in simple English",
  "vitals_anomaly_prediction": "Simple English prediction of stability"
}`;

const ChatInterface: React.FC<ChatInterfaceProps> = ({ profile, symptoms, vitals, onAnalysisComplete, onSemanticEvent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const recognitionRef = useRef<any>(null);

  const filterText = (text: string) => {
    if (typeof text !== 'string') return '';
    return text
      .replace(/<ANALYSIS>[\s\S]*?<\/ANALYSIS>/g, "")
      .replace(/<SEMANTIC_EVENT>[\s\S]*?<\/SEMANTIC_EVENT>/g, "")
      .replace(/<QUESTION_OPTIONS>[\s\S]*?<\/QUESTION_OPTIONS>/g, "")
      .trim();
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    startInterview();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const startInterview = async () => {
    setIsTyping(true);
    const systemPrompt = SYSTEM_PROMPT_INTAKE(profile, symptoms, vitals);

    try {
      const response = await generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: 'Please begin the clinical triage interview.' }] }],
        config: {
          systemInstruction: systemPrompt,
          tools: [{ googleSearch: {} } as any],
          toolConfig: { includeServerSideToolInvocations: true }
        }
      });
      
      const reply = response.text || '';
      const optionsMatch = reply.match(/<QUESTION_OPTIONS>([\s\S]*?)<\/QUESTION_OPTIONS>/);
      if (optionsMatch) {
         try {
           setCurrentOptions(JSON.parse(optionsMatch[1].trim()));
         } catch (e) { console.error(e); }
      }
      
      setMessages([{ role: 'assistant', content: filterText(reply) }]);
    } catch (err) {
      console.error(err);
      setMessages([{ role: 'assistant', content: "I encountered a connection error. Please refresh and try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (forcedInput?: string) => {
    // If voice recognition is active, stop it before sending to avoid state conflicts
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (e) { console.error(e); }
    }

    const textToSend = forcedInput || input.trim();
    if (!textToSend || isTyping) return;

    // Reset input immediately to prevent double-submission
    if (!forcedInput) setInput('');
    setCurrentOptions([]);
    const newMessages = [...messages, { role: 'user', content: textToSend } as ChatMessage];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const systemPrompt = SYSTEM_PROMPT_INTAKE(profile, symptoms, vitals);
      
      const response = await generateContent({
        model: "gemini-3-flash-preview",
        contents: newMessages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: systemPrompt,
          tools: [{ googleSearch: {} } as any],
          toolConfig: { includeServerSideToolInvocations: true }
        }
      });

      const reply = response.text || '';
      if (!reply) throw new Error("Empty AI response");

      // Handle Semantic Events
      const eventMatch = reply.match(/<SEMANTIC_EVENT>([\s\S]*?)<\/SEMANTIC_EVENT>/g);
      if (eventMatch && onSemanticEvent) {
        eventMatch.forEach(m => {
          try {
            const json = m.replace('<SEMANTIC_EVENT>', '').replace('</SEMANTIC_EVENT>', '');
            onSemanticEvent(JSON.parse(json.trim()));
          } catch (e) { console.error("Event parse error", e); }
        });
      }

      // Handle Question Options
      const optionsMatch = reply.match(/<QUESTION_OPTIONS>([\s\S]*?)<\/QUESTION_OPTIONS>/);
      if (optionsMatch) {
        try {
          const options = JSON.parse(optionsMatch[1].trim());
          setCurrentOptions(options);
        } catch (e) { console.error("Options parse error", e); }
      }

      const analysisMatch = reply.match(/<ANALYSIS>([\s\S]*?)<\/ANALYSIS>/);
      if (analysisMatch) {
         try {
           let jsonStr = analysisMatch[1].trim();
           jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
           const analysis = JSON.parse(jsonStr);
           onAnalysisComplete(analysis);
         } catch (e) {
           console.error("JSON Parse Error", e);
           const fallbackMsg = filterText(reply) || "I have completed the analysis. Processing results...";
           setMessages([...newMessages, { role: 'assistant', content: fallbackMsg }]);
         }
      } else {
        setMessages([...newMessages, { role: 'assistant', content: filterText(reply) || "I understand. Could you tell me more about that?" }]);
      }
    } catch (err) {
      console.error("Chat Interaction Error:", err);
      const errorMsg = "An error occurred during assessment. Please try again or switch to manual input.";
      setMessages([...newMessages, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-[32px] border-4 border-white overflow-hidden shadow-2xl relative">
      <div className="bg-[#F8FAFC] px-8 py-6 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-[#0F172A] tracking-tighter uppercase">Clinical Intake</h2>
          <p className="text-label mt-1">Status: Interview Phase 03</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="h-2 w-2 rounded-full bg-medical-blue animate-pulse" />
           <span className="text-[10px] font-black text-medical-blue uppercase tracking-[0.2em]">Live Analysis Active</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={i}
            className={cn(
              "max-w-[85%] rounded-2xl px-6 py-4 text-sm font-bold leading-relaxed shadow-sm",
              msg.role === 'user' 
                ? "bg-[#0F172A] text-white ml-auto rounded-tr-none" 
                : "bg-[#F8FAFC] text-medical-dark mr-auto rounded-tl-none border border-slate-200"
            )}
          >
            {msg.content}
          </motion.div>
        ))}
        
        {/* Render Suggested Options */}
        <AnimatePresence>
          {!isTyping && currentOptions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col gap-3 py-4 items-start"
            >
              <div className="flex items-center gap-2 mb-1">
                <Info className="w-3 h-3 text-medical-blue" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select an Option:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (opt.toLowerCase().includes('others') || opt.toLowerCase().includes('explain')) {
                        inputRef.current?.focus();
                      } else {
                        handleSend(opt);
                      }
                    }}
                    className="px-6 py-3 bg-white text-medical-blue border-2 border-blue-100 rounded-2xl text-xs font-black uppercase tracking-tight hover:bg-medical-blue hover:text-white hover:border-medical-blue transition-all shadow-md active:scale-95"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {isTyping && (
          <div className="flex gap-1.5 p-4 bg-slate-50 w-20 rounded-2xl">
            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
      </div>

      <div className="p-6 bg-[#F8FAFC] border-t border-slate-200">
        <div className="relative flex items-center gap-3">
           <button 
             onClick={toggleVoice}
             className={cn(
               "p-4 rounded-2xl transition-all shadow-lg",
               isListening ? "bg-red-600 text-white animate-pulse" : "bg-white text-medical-muted hover:bg-slate-50 border border-slate-200"
             )}
           >
             {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
           </button>
            <input
              type="text"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Analyzing Voice Input..." : currentOptions.length > 0 ? "Select above or explain here..." : "Provide clinical data..."}
              className={cn(
                "flex-1 bg-white border-2 rounded-2xl px-6 py-4 font-bold text-md shadow-inner focus:outline-none transition-all placeholder:text-slate-300",
                currentOptions.length > 0 ? "border-slate-100 opacity-60 focus:opacity-100 focus:border-[#1A6BCC]" : "border-transparent focus:border-[#1A6BCC]"
              )}
            />
           <button 
             onClick={handleSend}
             disabled={!input.trim() || isTyping}
             className="p-4 bg-[#1A6BCC] text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl"
           >
             <Send className="w-6 h-6" />
           </button>
        </div>
        <p className="mt-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Clinical Guidance Only • Reference ID: CH-PROTO-88
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
