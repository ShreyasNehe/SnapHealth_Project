/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HeartPulse, Heart, User, MapPin, MessageSquare, ClipboardCheck, 
  ChevronRight, ChevronLeft, Plus, X, Thermometer,
  Activity, Droplets, Info, ShieldCheck, Stethoscope, Camera, Eye, Activity as PulseIcon, Sparkles, Lock, LogIn, AlertCircle, CheckCircle2
} from 'lucide-react';
import { cn, PatientProfile, SymptomPin, Vitals, TriageAnalysis, Session, UrgencyLevel } from './types';
import BodyMapSVG from './components/BodyMapSVG';
import ChatInterface from './components/ChatInterface';
import DiagnosisDashboard from './components/DiagnosisDashboard';
import PrintableReport from './components/PrintReport';
import NearbyServices from './components/NearbyServices';
import LandingPage from './components/LandingPage';
import LabInterpreter from './components/LabInterpreter';
import EmergencyAssist from './components/EmergencyAssist';
import MedCabinet from './components/MedCabinet';
import NeuroSpeechScreener from './components/NeuroSpeechScreener';
import NutriPredictor from './components/NutriPredictor';
import FaceScanAnalysis from './components/FaceScanAnalysis';
import OcularSentinel from './components/OcularSentinel';
import OdonticGuard from './components/OdonticGuard';
import TrichologyScan from './components/TrichologyScan';
import HealthTwin from './components/HealthTwin';
import HeadFaceProScan from './components/HeadFaceProScan';

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type Screen = 'welcome' | 'profile' | 'bodymap' | 'chat' | 'dashboard' | 'report' | 'services' | 'lab' | 'emergency' | 'cabinet' | 'speech' | 'nutrition' | 'facial' | 'ocular' | 'odontic' | 'trichology' | 'pro-scan';

/// Advanced Biometric Login Component
const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [showPortal, setShowPortal] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'admin123' && pass === 'admin123') {
      setIsAuthenticating(true);
      setError(false);
      setTimeout(() => {
        setAuthSuccess(true);
        setTimeout(() => {
          onLogin();
        }, 800);
      }, 1200);
    } else {
      setError(true);
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-60" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 opacity-40" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-8 py-8 max-w-7xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">SnapHealth <span className="text-indigo-600 not-italic">AI</span></span>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-6">
            {['Capabilities', 'Intelligence', 'Security'].map(link => (
              <a key={link} href="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">{link}</a>
            ))}
          </div>
          <button 
            onClick={() => setShowPortal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            Access Portal
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Sparkles className="w-3 h-3" /> Next-Gen Diagnostic OS
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] italic text-slate-900"
            >
              Human <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 not-italic">Intelligence</span><br/>
              Synthesized.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg"
            >
              The world's first unified diagnostic gateway. SnapHealth AI transforms raw biometric artifacts into a living digital twin for hyper-precise health management.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <button 
                onClick={() => setShowPortal(true)}
                className="px-12 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 transition-all flex items-center gap-3 active:scale-95 group"
              >
                Launch Neural Link <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* Visual Showcase */}
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-600/5 rounded-[64px] -rotate-6 blur-2xl" />
             <div className="relative overflow-hidden rounded-[48px] bg-slate-100 aspect-[4/5] shadow-2xl border border-slate-200 group">
                <img 
                  src="https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=1200" 
                  alt="AI Medical Assistant Robot"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10">
                   <div className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl space-y-2">
                      <p className="text-[10px] font-black uppercase text-white/60 tracking-widest">Neural Link Active</p>
                      <div className="flex items-end gap-2">
                         <span className="text-4xl font-black text-white italic">MED-CORE IX</span>
                         <span className="text-xl font-bold text-blue-400 mb-1">STABLE</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-40 grid md:grid-cols-3 gap-8">
           {[
             { title: 'Optical Synthesis', icon: Eye, img: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=600', desc: 'Precision ocular analysis to detect physiological shifts in real-time.' },
             { title: 'Clinical Triage', icon: Stethoscope, img: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600', desc: 'Neural algorithms trained on 20M+ clinical records for zero-latency guidance.' },
             { title: 'Molecular Flow', icon: Activity, img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=600', desc: 'Monitor vital hemodynamics through proprietary skin-surface sensor fusion.' }
           ].map((feature, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="group p-2 bg-slate-50 rounded-[40px] border border-slate-100 hover:bg-white hover:shadow-xl transition-all"
             >
                <div className="aspect-square rounded-[34px] overflow-hidden mb-6 relative">
                  <img src={feature.img} alt={feature.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="px-6 pb-6 space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none">{feature.title}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed uppercase tracking-tight">{feature.desc}</p>
                </div>
             </motion.div>
           ))}
        </div>
      </main>

      {/* Login Portal Overlay */}
      <AnimatePresence>
        {showPortal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isAuthenticating && setShowPortal(false)} />
            
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[48px] p-10 md:p-16 shadow-[0_40px_100px_rgba(15,23,42,0.15)] overflow-hidden border border-slate-100"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent opacity-40" />
              
              <AnimatePresence mode="wait">
                {!isAuthenticating ? (
                  <motion.div key="form" className="space-y-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-slate-900">Secure <br/><span className="text-indigo-600 not-italic">Gateway.</span></h2>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Authorization Required</p>
                      </div>
                      <button onClick={() => setShowPortal(false)} className="p-4 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Registry Identity</label>
                        <div className="relative group">
                          <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                          <input 
                            type="text" 
                            autoFocus
                            value={user}
                            onChange={(e) => {setUser(e.target.value); setError(false);}}
                            className="w-full bg-slate-50 border border-slate-100 p-6 pl-14 rounded-3xl focus:ring-2 focus:ring-indigo-600/10 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-lg placeholder:text-slate-300"
                            placeholder="username"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Neural Sequence</label>
                        <div className="relative group">
                          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                          <input 
                            type="password" 
                            value={pass}
                            onChange={(e) => {setPass(e.target.value); setError(false);}}
                            className="w-full bg-slate-50 border border-slate-100 p-6 pl-14 rounded-3xl focus:ring-2 focus:ring-indigo-600/10 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-lg placeholder:text-slate-300"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Credentials Verification Failed
                        </div>
                      )}

                      <button 
                        type="submit"
                        className="w-full py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[32px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-200 transition-all flex items-center justify-center gap-4 group active:scale-95"
                      >
                        Authenticate Link <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div key="loading" className="flex flex-col items-center justify-center py-12 space-y-10">
                    <div className="relative">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 border-4 border-indigo-100 border-t-indigo-600 rounded-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                         {authSuccess ? <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" /> : <Activity className="w-12 h-12 text-indigo-600 animate-pulse" />}
                      </div>
                    </div>
                    <div className="text-center space-y-3">
                      <p className="text-indigo-600/60 font-black uppercase text-[10px] tracking-[0.4em]">
                        {authSuccess ? 'Handshake Finalized' : 'Verifying Identity...'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="relative z-10 border-t border-slate-100 py-20 px-8 mt-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
           <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black italic tracking-tighter uppercase">SnapHealth AI</span>
              </div>
              <p className="max-w-sm text-slate-500 font-medium leading-relaxed">Pioneering clinical diagnostics through neural biometric synthesis. E2E Encrypted. HIPAA Compliant.</p>
           </div>
           {['Product', 'Legal'].map((section, idx) => (
             <div key={idx} className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">{section}</h4>
                <div className="flex flex-col gap-2">
                   {['Intelligence', 'Security', 'Privacy', 'Compliance'].slice(idx*2).map(link => (
                     <a key={link} href="#" className="text-xs text-slate-500 hover:text-indigo-600 font-medium">{link}</a>
                   ))}
                </div>
             </div>
           ))}
        </div>
      </footer>
    </div>
  );
};

const CHRONIC_CONDITIONS = [
  'Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 
  'Immunocompromised', 'COPD', 'Kidney Disease', 'None'
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [screen, setScreen] = useState<Screen>('welcome');
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // States for session data
  const [profile, setProfile] = useState<PatientProfile>({
    age: 30,
    sex: 'Male',
    isPregnant: false,
    medications: '',
    allergies: '',
    chronicConditions: [],
  });

  const [symptoms, setSymptoms] = useState<SymptomPin[]>([]);
  const [vitals, setVitals] = useState<Vitals>({ tempUnit: 'F' });
  const [medsCheck, setMedsCheck] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<TriageAnalysis | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  useEffect(() => {
    const checkMeds = async () => {
      if (!profile.medications.trim()) return;
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: 'user', parts: [{ text: `Check for interactions: ${profile.medications}` }] }],
          config: {
            systemInstruction: "Given a list of medications, provide a short array of strings flagging any known interactions or contraindications relevant to an emergency triage situation. format: [\"Interaction 1\", \"...\"]"
          }
        });
        const text = response.text || '[]';
        setMedsCheck(JSON.parse(text));
      } catch (e) {
        console.error("Meds check failed", e);
      }
    };
    const timer = setTimeout(checkMeds, 2000);
    return () => clearTimeout(timer);
  }, [profile.medications]);

  useEffect(() => {
    const handleScreenChange = (e: any) => {
      if (e.detail) setScreen(e.detail as Screen);
    };
    window.addEventListener('changeScreen', handleScreenChange);
    return () => window.removeEventListener('changeScreen', handleScreenChange);
  }, []);

  useEffect(() => {
    const history = localStorage.getItem('snaphealth_sessions');
    if (history) setSessionHistory(JSON.parse(history));

    const acknowledged = localStorage.getItem('snaphealth_acknowledged');
    if (!acknowledged) setShowDisclaimer(true);
  }, []);

  const saveAcknowledgment = () => {
    localStorage.setItem('snaphealth_acknowledged', 'true');
    setShowDisclaimer(false);
    setScreen('welcome');
  };

  const addSymptom = (zone: string, x: number, y: number) => {
    // Prevent duplicate pins for the same zone to avoid UI clutter
    if (symptoms.some(s => s.zone === zone)) return;
    
    const id = Math.random().toString(36).substr(2, 9);
    setSymptoms([...symptoms, { id, zone, description: '', severity: 5, daysAgo: 0, trend: 'same', x, y }]);
  };

  const updateSymptom = (id: string, updates: Partial<SymptomPin>) => {
    setSymptoms(symptoms.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  const handleSemanticEvent = (event: any) => {
    if (event.type === 'HEATMAP_UPDATE') {
      const { zone, intensity, radiation, pattern } = event;
      setSymptoms(prev => prev.map(s => {
        if (s.zone === zone || (radiation && s.zone === radiation)) {
          return {
            ...s,
            heatmap: { intensity, radius: 100, type: pattern || 'nerve' }
          };
        }
        return s;
      }));
    }
  };

  const handleImageUpload = async (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Content = (e.target?.result as string).split(',')[1];
      updateSymptom(id, { imageUrl: e.target?.result as string });
      
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            { role: 'user', parts: [
              { text: "Analyze this medical symptom. Provide 1 sentence observation." },
              { inlineData: { mimeType: file.type, data: base64Content } }
            ]}
          ]
        });
        updateSymptom(id, { visionAnalysis: response.text });
      } catch (err) {
        console.error("Vision AI failed", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalysisComplete = (newAnalysis: TriageAnalysis) => {
    // Ensure nested objects/arrays exist to prevent render crashes
    const validUrgencies: UrgencyLevel[] = ['self-care', 'see-doctor', 'urgent-care', 'er-now'];
    let urgency: UrgencyLevel = 'see-doctor';
    
    if (newAnalysis.urgency && validUrgencies.includes(newAnalysis.urgency)) {
      urgency = newAnalysis.urgency;
    }

    let finalAnalysis: TriageAnalysis = {
      urgency,
      urgency_reason: newAnalysis.urgency_reason || 'Clinical assessment reached a conclusion.',
      differentials: (newAnalysis.differentials || []).map(d => ({
        condition: d.condition || 'Unknown Condition',
        probability: typeof d.probability === 'number' ? d.probability : 10,
        reasoning: d.reasoning || 'Based on symptom cluster analysis.'
      })),
      red_flags: newAnalysis.red_flags || [],
      medication_interactions: newAnalysis.medication_interactions || [],
      specialist_referral: newAnalysis.specialist_referral || 'General Practitioner',
      follow_up_window: newAnalysis.follow_up_window || '24-48 hours',
      recommended_next_steps: newAnalysis.recommended_next_steps || ['Monitor symptoms'],
      pattern_note: newAnalysis.pattern_note || '',
      clinician_handover: newAnalysis.clinician_handover || 'Intake interview complete. Urgency determined by AI logic.',
      patient_guidance: newAnalysis.patient_guidance || 'Please follow the recommended next steps and follow up with a professional.',
      ai_doctor_care_plan: newAnalysis.ai_doctor_care_plan || 'Consult with a clinical professional for a specific care plan.',
      medication_suggestions: newAnalysis.medication_suggestions || [],
      audit_trail: (newAnalysis.audit_trail || []).map(e => ({
        timestamp: e.timestamp || new Date().toISOString(),
        action: e.action || 'System Decision',
        reasoning: e.reasoning || 'Automated logic applied.',
        confidence: typeof e.confidence === 'number' ? e.confidence : 0.8
      })),
      grounded_reasoning: newAnalysis.grounded_reasoning || 'Verified against medical-grade triage protocols.',
      vitals_anomaly_prediction: newAnalysis.vitals_anomaly_prediction || 'No immediate anomalies predicted.'
    };

    // Vitals Override Logic
    if (vitals.heartRate && (vitals.heartRate > 130 || vitals.heartRate < 40)) {
       finalAnalysis.urgency = 'er-now';
       finalAnalysis.urgency_reason = 'CRITICAL VITALS: Extreme Heart Rate detected.';
    }
    if (vitals.temperature && ((vitals.tempUnit === 'F' && vitals.temperature > 104) || (vitals.tempUnit === 'C' && vitals.temperature > 40))) {
       finalAnalysis.urgency = 'er-now';
       finalAnalysis.urgency_reason = 'CRITICAL VITALS: Severe Fever detected.';
    }
    if (vitals.o2Sat && vitals.o2Sat < 92) {
       finalAnalysis.urgency = 'er-now';
       finalAnalysis.urgency_reason = 'CRITICAL VITALS: Low Oxygen Saturation detected.';
    }
    if (vitals.systolicBP && (vitals.systolicBP > 180 || vitals.systolicBP < 80)) {
       finalAnalysis.urgency = 'er-now';
       finalAnalysis.urgency_reason = 'CRITICAL VITALS: Abnormal Blood Pressure detected.';
    }

    if (medsCheck.length > 0) {
       finalAnalysis.medication_interactions = Array.from(new Set([...(finalAnalysis.medication_interactions || []), ...medsCheck]));
    }

    try {
      setAnalysis(finalAnalysis);
      
      const session: Session = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        profile: { ...profile },
        symptoms: [...symptoms],
        vitals: { ...vitals },
        analysis: finalAnalysis
      };
      
      setCurrentSession(session);
      
      // Save to history before switching screen to ensure state is ready
      setSessionHistory(prev => {
        const updated = [session, ...prev].slice(0, 50);
        localStorage.setItem('snaphealth_sessions', JSON.stringify(updated));
        return updated;
      });

      // Small delay to ensure the Analysis state is committed
      setTimeout(() => setScreen('dashboard'), 50);
    } catch (err) {
      console.error("Critical State Error:", err);
      // Fallback if something weird happens during transition
      setScreen('welcome');
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return (
          <LandingPage 
            onStartProtocol={() => setScreen('profile')} 
            onStartLab={() => setScreen('lab')}
            onStartEmergency={() => setScreen('emergency')}
            onStartCabinet={() => setScreen('cabinet')}
            onStartSpeech={() => setScreen('speech')}
            onStartNutrition={() => setScreen('nutrition')}
            onStartFacial={() => setScreen('facial')}
            onStartOcular={() => setScreen('ocular')}
            onStartOdontic={() => setScreen('odontic')}
            onStartTrichology={() => setScreen('trichology')}
            onStartProScan={() => setScreen('pro-scan')}
          />
        );

      case 'profile':
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-2xl space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                 <div className="bg-[#1A6BCC]/10 p-2 rounded-xl text-[#1A6BCC]">
                   <User className="w-6 h-6" />
                 </div>
                 <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase">Patient Profile</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em]">Patient Age</label>
                  <input 
                    type="number" 
                    value={profile.age} 
                    onChange={e => setProfile({...profile, age: parseInt(e.target.value)})}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl px-6 py-4 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-[#1A6BCC]/5 focus:border-[#1A6BCC]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em]">Biological Sex</label>
                  <select 
                    value={profile.sex} 
                    onChange={e => setProfile({...profile, sex: e.target.value as any})}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl px-6 py-4 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-[#1A6BCC]/5 focus:border-[#1A6BCC]"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {profile.sex === 'Female' && (
                <div className="flex items-center gap-4 p-6 bg-[#F8FAFC] rounded-2xl border border-slate-100">
                   <div className="space-y-1 flex-1">
                     <p className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em]">Obstetric History</p>
                     <p className="text-sm font-bold text-[#0F172A]">Are you currently pregnant?</p>
                   </div>
                   <div className="flex bg-slate-200/50 p-1 rounded-xl">
                      {['No', 'Yes'].map(opt => (
                        <button 
                          key={opt}
                          onClick={() => setProfile({...profile, isPregnant: opt === 'Yes'})}
                          className={cn(
                            "px-8 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                            (profile.isPregnant ? 'Yes' : 'No') === opt ? "bg-white text-[#1A6BCC] shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                   </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em]">Pharmacological Context</label>
                <textarea 
                  placeholder="List medications separated by commas..."
                  value={profile.medications}
                  onChange={e => setProfile({...profile, medications: e.target.value})}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl px-6 py-4 font-bold text-md focus:outline-none focus:ring-4 focus:ring-[#1A6BCC]/5 focus:border-[#1A6BCC] h-28"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em]">Allergy Profile</label>
                <input 
                  type="text"
                  placeholder="List known allergies..."
                  value={profile.allergies}
                  onChange={e => setProfile({...profile, allergies: e.target.value})}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl px-6 py-4 font-bold text-md focus:outline-none focus:ring-4 focus:ring-[#1A6BCC]/5"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em]">Comorbidities & History</label>
                <div className="grid grid-cols-2 gap-3">
                  {CHRONIC_CONDITIONS.map(cond => (
                    <label key={cond} className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                      profile.chronicConditions.includes(cond) 
                        ? "bg-[#1A6BCC]/5 border-[#1A6BCC] text-[#1A6BCC]" 
                        : "bg-[#F8FAFC] border-transparent text-[#64748B] hover:border-slate-200 hover:text-slate-800"
                    )}>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={profile.chronicConditions.includes(cond)}
                        onChange={e => {
                          const next = e.target.checked 
                            ? [...profile.chronicConditions, cond]
                            : profile.chronicConditions.filter(c => c !== cond);
                          setProfile({...profile, chronicConditions: next});
                        }}
                      />
                      <span className="text-xs font-black uppercase tracking-widest">{cond}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setScreen('bodymap')} 
                className="w-full bg-[#0F172A] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex justify-center items-center gap-3"
              >
                Proceed to Symptoms
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );

      case 'bodymap':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6">
               <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl ring-4 ring-slate-900/10 border-2 border-slate-700/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-500 p-2 rounded-xl">
                       <Activity className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Step 2: Clinical Vitals</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Heart Rate (BPM)</label>
                        <input type="number" onChange={e => setVitals({...vitals, heartRate: parseInt(e.target.value)})} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" placeholder="--" />
                     </div>
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                         <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Temperature</label>
                         <div className="flex bg-white/10 border border-white/20 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                            <input 
                              type="number" 
                              step="0.1" 
                              value={vitals.temperature || ''} 
                              onChange={e => setVitals({...vitals, temperature: parseFloat(e.target.value)})} 
                              className="w-full bg-transparent px-4 py-3 focus:outline-none font-bold min-w-0" 
                              placeholder="--" 
                            />
                            <div className="flex bg-white/5 p-1 shrink-0 border-l border-white/10">
                               <button 
                                 onClick={() => setVitals({...vitals, tempUnit: 'F'})} 
                                 className={cn("px-3 py-1 rounded-lg text-[10px] font-black transition-all", vitals.tempUnit === 'F' ? "bg-white text-slate-900 shadow-sm" : "text-white/40")}
                               >F°</button>
                               <button 
                                 onClick={() => setVitals({...vitals, tempUnit: 'C'})} 
                                 className={cn("px-3 py-1 rounded-lg text-[10px] font-black transition-all", vitals.tempUnit === 'C' ? "bg-white text-slate-900 shadow-sm" : "text-white/40")}
                               >C°</button>
                            </div>
                         </div>
                      </div>
                     <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Blood Pressure</label>
                        <div className="flex items-center gap-2">
                          <input type="number" placeholder="Sys" onChange={e => setVitals({...vitals, systolicBP: parseInt(e.target.value)})} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" />
                          <span className="opacity-40">/</span>
                          <input type="number" placeholder="Dia" onChange={e => setVitals({...vitals, diastolicBP: parseInt(e.target.value)})} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">O2 Saturation (%)</label>
                        <input type="number" onChange={e => setVitals({...vitals, o2Sat: parseInt(e.target.value)})} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" placeholder="--" />
                     </div>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
                  <div className="flex items-center gap-2 mb-6">
                    <MapPin className="w-6 h-6 text-blue-500" />
                    <h2 className="text-xl font-bold text-slate-800">Step 3: Body Map</h2>
                  </div>
                  <BodyMapSVG onZoneClick={addSymptom} pins={symptoms} />
               </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl min-h-[500px]">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                   <h2 className="text-xl font-bold text-slate-800">Symptom Details</h2>
                   <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => addSymptom('Head/Neurological: Brain/Neurological', 50, 20)}
                        className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                         Feeling a headache?
                      </button>
                      <button 
                        onClick={() => addSymptom('Upper Torso (Heart/Lungs): Heart', 50, 50)}
                        className="text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                         Chest Discomfort?
                      </button>
                      <span className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">{symptoms.length} pins</span>
                   </div>
                </div>

                <div className="space-y-4">
                  {symptoms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center space-y-4">
                       <MapPin className="w-12 h-12 opacity-20" />
                       <p className="max-w-xs text-sm">No symptoms added. Click the body diagram to mark your areas of concern.</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {symptoms.map(symptom => (
                        <motion.div 
                          key={symptom.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <div className={cn(
                                 "w-3 h-3 rounded-full",
                                 symptom.severity <= 3 ? "bg-green-500" :
                                 symptom.severity <= 7 ? "bg-yellow-500" : "bg-red-500"
                               )} />
                               <span className="font-bold text-slate-700">{symptom.zone}</span>
                             </div>
                             <div className="flex items-center gap-3">
                               <label className="cursor-pointer p-2 rounded-xl hover:bg-slate-200 transition-colors text-slate-500 hover:text-medical-blue flex items-center gap-2 text-[10px] font-bold uppercase">
                                 <Camera className="w-4 h-4" />
                                 {symptom.imageUrl ? 'Update Photo' : 'Add Photo'}
                                 <input 
                                   type="file" 
                                   className="hidden" 
                                   accept="image/*" 
                                   onChange={e => e.target.files?.[0] && handleImageUpload(symptom.id, e.target.files[0])} 
                                 />
                               </label>
                               <button onClick={() => removeSymptom(symptom.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                 <X className="w-4 h-4" />
                               </button>
                             </div>
                          </div>

                          {symptom.visionAnalysis && (
                            <div className="bg-blue-600/5 border border-blue-600/10 p-3 rounded-xl flex items-start gap-2">
                               <PulseIcon className="w-3 h-3 text-blue-600 shrink-0 mt-1 animate-pulse" />
                               <p className="text-[10px] font-black text-blue-800 uppercase leading-relaxed tracking-tight">Vision AI: {symptom.visionAnalysis}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-4">
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                     <span>Severity</span>
                                     <span>{symptom.severity}/10</span>
                                  </div>
                                  <input 
                                    type="range" min="1" max="10" 
                                    value={symptom.severity}
                                    onChange={e => updateSymptom(symptom.id, { severity: parseInt(e.target.value) })}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                                  />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                     <span>Onset</span>
                                     <span>{symptom.daysAgo === 0 ? 'Today' : `${symptom.daysAgo} days ago`}</span>
                                  </div>
                                  <input 
                                    type="range" min="0" max="30" 
                                    value={symptom.daysAgo}
                                    onChange={e => updateSymptom(symptom.id, { daysAgo: parseInt(e.target.value) })}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                                  />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Trend</label>
                                <div className="grid grid-cols-3 gap-1">
                                   {['better', 'same', 'worse'].map(t => (
                                     <button 
                                       key={t}
                                       onClick={() => updateSymptom(symptom.id, { trend: t as any })}
                                       className={cn(
                                         "px-2 py-2 rounded-lg text-[10px] font-bold capitalize transition-all",
                                         symptom.trend === t ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-400 hover:bg-white/50"
                                       )}
                                     >
                                       {t}
                                     </button>
                                   ))}
                                </div>
                             </div>
                          </div>

                          <textarea 
                            placeholder="Describe the sensation in your own words..."
                            value={symptom.description}
                            onChange={e => updateSymptom(symptom.id, { description: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[80px]"
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>

                {symptoms.length > 0 && (
                  <button 
                    onClick={() => setScreen('chat')}
                    className="w-full mt-10 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex justify-center items-center gap-2"
                  >
                    Next: Clinical Assessment
                    <MessageSquare className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className="max-w-3xl mx-auto space-y-6">
             <div className="bg-blue-600/5 border border-blue-600/10 p-6 rounded-3xl flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl text-white">
                   <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                   <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">AI Engine: Professional Assessment</h3>
                   <p className="text-[10px] font-bold text-blue-700 uppercase">Analyzing symptoms, meds, and vitals in real-time.</p>
                </div>
             </div>
             <ChatInterface 
               profile={profile} 
               symptoms={symptoms} 
               vitals={vitals} 
               onSemanticEvent={handleSemanticEvent}
               onAnalysisComplete={handleAnalysisComplete} 
             />
          </div>
        );

      case 'dashboard':
        return analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
             <div className="lg:col-span-8">
                <DiagnosisDashboard 
                  analysis={analysis} 
                  sessions={sessionHistory} 
                  onPrint={() => setScreen('report')}
                  onFinish={() => {
                    setSymptoms([]);
                    setVitals({ tempUnit: 'F' });
                    setAnalysis(null);
                    setScreen('welcome');
                  }} 
                />
             </div>
             <div className="lg:col-span-4 sticky top-32">
                <div className="space-y-6">
                   <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800 ml-4">Biometric Mirror</h3>
                   <HealthTwin profile={profile} analysis={analysis} vitals={vitals} />
                   <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-blue-600">
                         <Sparkles className="w-4 h-4" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Health Twin Sync</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-tight">
                         This avatar visually reflects your systemic markers—from dermal pallor to ocular congestion—providing a real-time mirror of your current clinical drift.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'services':
        return <NearbyServices />;

      case 'lab':
        return <LabInterpreter onBack={() => setScreen('welcome')} />;

      case 'emergency':
        return <EmergencyAssist onBack={() => setScreen('welcome')} />;

      case 'cabinet':
        return <MedCabinet onBack={() => setScreen('welcome')} />;

      case 'speech':
        return <NeuroSpeechScreener onBack={() => setScreen('welcome')} />;

      case 'nutrition':
        return <NutriPredictor onBack={() => setScreen('welcome')} />;

      case 'facial':
        return <FaceScanAnalysis onBack={() => setScreen('welcome')} />;

      case 'ocular':
        return <OcularSentinel onBack={() => setScreen('welcome')} />;

      case 'odontic':
        return <OdonticGuard onBack={() => setScreen('welcome')} />;

      case 'trichology':
        return <TrichologyScan onBack={() => setScreen('welcome')} />;

      case 'pro-scan':
        return <HeadFaceProScan onBack={() => setScreen('welcome')} />;

      case 'report':
        return currentSession && (
          <div className="py-10">
              <PrintableReport 
                session={currentSession} 
              />
              <div className="max-w-lg mx-auto mt-8 print:hidden">
                 <button onClick={() => setScreen('dashboard')} className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                    <ChevronLeft className="w-5 h-5" />
                    Return to Dashboard
                 </button>
              </div>
          </div>
        );
    }
  };

  const getStepName = () => {
    switch (screen) {
      case 'welcome': return '';
      case 'profile': return 'Patient Profile';
      case 'bodymap': return 'Symptoms & Vitals';
      case 'chat': return 'Clinical Assessment';
      case 'dashboard': return 'Analysis Results';
      case 'services': return 'Emergency Network';
      case 'report': return 'Completion Report';
      case 'lab': return 'Lab Intelligence';
      case 'emergency': return 'Panic Mode';
      case 'cabinet': return 'Med Cabinet';
      case 'speech': return 'Neuro-Vocal Screen';
      case 'nutrition': return 'Nutri-Predictor';
      case 'facial': return 'Facial Diagnostics';
      case 'ocular': return 'Ocular Sentinel';
      case 'odontic': return 'Odontic Guard';
      case 'trichology': return 'Trichology Scan';
      case 'pro-scan': return 'Premium Pro-Scan';
      default: return '';
    }
  };

  const protocolScreens = ['profile', 'bodymap', 'chat', 'dashboard', 'services', 'report'];
  const isProtocolActive = protocolScreens.includes(screen);

  const navTabs = [
    { id: 'profile', label: 'Patient Profile', icon: User, hidden: !isProtocolActive || screen === 'welcome' },
    { id: 'bodymap', label: 'Symptoms & Vitals', icon: MapPin, hidden: !isProtocolActive || screen === 'welcome' },
    { id: 'chat', label: 'Clinical Assessment', icon: MessageSquare, hidden: !isProtocolActive || symptoms.length === 0 },
    { id: 'dashboard', label: 'Analysis Results', icon: ClipboardCheck, hidden: !isProtocolActive || !analysis },
    { id: 'services', label: 'Nearby Facilities', icon: MapPin, hidden: !isProtocolActive || !analysis },
    { id: 'lab', label: 'Lab Reports', icon: Camera, hidden: screen !== 'lab' },
    { id: 'cabinet', label: 'Med Cabinet', icon: Droplets, hidden: screen !== 'cabinet' },
    { id: 'emergency', label: 'Panic Mode', icon: ShieldCheck, hidden: screen !== 'emergency', isEmergency: true },
    { id: 'speech', label: 'Vocal Screen', icon: MessageSquare, hidden: screen !== 'speech' },
    { id: 'nutrition', label: 'Nutri-Scan', icon: Activity, hidden: screen !== 'nutrition' },
    { id: 'facial', label: 'Facial-Scan', icon: User, hidden: screen !== 'facial' },
    { id: 'ocular', label: 'Eye-Scan', icon: Eye, hidden: screen !== 'ocular' },
    { id: 'odontic', label: 'Dental-Scan', icon: ClipboardCheck, hidden: screen !== 'odontic' },
    { id: 'trichology', label: 'Hair-Scan', icon: MapPin, hidden: screen !== 'trichology' },
    { id: 'pro-scan', label: 'PRO-SCAN', icon: ShieldCheck, hidden: screen !== 'pro-scan', isPremium: true },
  ];

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setScreen('welcome');
  };

  if (!isAuthenticated) return <LoginPage onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <header className="bg-white border-b border-slate-200 px-8 py-0 flex flex-col md:flex-row justify-between items-stretch sticky top-0 z-50 print:hidden shadow-sm">
         <div className="flex items-center justify-between py-4 border-b md:border-b-0 border-slate-100 px-0 md:px-0">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setScreen('welcome')}>
            <div className="bg-[#1A6BCC] p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-[#0F172A]">SNAPHEALTH <span className="text-[#1A6BCC]">AI</span></span>
          </div>
          <div className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">{getStepName()}</div>
        </div>
        
        <nav className="flex items-center gap-1 md:gap-4 h-full">
          {navTabs.filter(t => !t.hidden).map(tab => (
            <button
              key={tab.id}
              onClick={() => setScreen(tab.id as Screen)}
              className={cn(
                "h-full px-4 py-4 flex items-center gap-2 border-b-4 transition-all relative overflow-hidden",
                screen === tab.id 
                  ? "border-[#1A6BCC] bg-blue-50/50 text-[#1A6BCC]" 
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50",
                (tab as any).isPremium && "bg-amber-500/5"
              )}
            >
              {tab.isEmergency && (
                <div className="absolute top-0 right-0 h-full w-full bg-red-600/5 animate-pulse pointer-events-none" />
              )}
              {(tab as any).isPremium && (
                <div className="absolute top-1 right-1">
                   <Sparkles className="w-2 h-2 text-amber-500" />
                </div>
              )}
              <tab.icon className={cn("w-4 h-4 shrink-0", tab.isEmergency && screen !== tab.id && "text-red-500 animate-pulse", (tab as any).isPremium && "text-amber-600")} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-wider hidden sm:inline truncate",
                tab.isEmergency && screen !== tab.id && "text-red-600",
                (tab as any).isPremium && "text-amber-600"
              )}>
                {tab.label}
              </span>
            </button>
          ))}
          <button 
            onClick={handleSignOut}
            className="h-full px-4 py-4 flex items-center gap-2 border-b-4 border-transparent text-slate-400 hover:text-red-600 hover:bg-red-50/50 transition-all group"
            title="Terminate Secure Session"
          >
            <LogIn className="w-4 h-4 rotate-180 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-wider hidden md:inline truncate">Sign Out</span>
          </button>
        </nav>

        <div className="hidden lg:flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
            <div className="relative w-20 h-10 flex items-center justify-center overflow-hidden">
              {/* Pulse Lines */}
              <div className="absolute inset-0 flex items-center">
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="flex"
                >
                  <svg width="80" height="40" viewBox="0 0 80 40" fill="none" className="opacity-20">
                    <path d="M0 20 L20 20 L24 8 L28 32 L32 20 L80 20" stroke="#1A6BCC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <svg width="80" height="40" viewBox="0 0 80 40" fill="none" className="opacity-20">
                    <path d="M0 20 L20 20 L24 8 L28 32 L32 20 L80 20" stroke="#1A6BCC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </div>
              
              {/* Beating Heart */}
              <motion.div
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                className="relative z-10"
              >
                <Heart className="w-6 h-6 text-[#1A6BCC] fill-[#1A6BCC]" />
              </motion.div>
            </div>
            {getStepName() && <span className="px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">{getStepName()}</span>}
          </div>
        </div>
      </header>

      <main className={cn(
        "min-h-[calc(100vh-180px)]",
        screen === 'welcome' ? "px-0 py-0" : "max-w-7xl mx-auto px-6 py-12"
      )}>
         <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderScreen()}
            </motion.div>
         </AnimatePresence>
      </main>
      {screen !== 'welcome' && (
      <footer className="bg-white border-t border-slate-200 px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-xl">
          SnapHealth AI is not a substitute for professional medical advice. For emergencies, call 911 immediately.
        </p>
        <div className="flex gap-4 items-center">
           <div className="flex items-center gap-2 text-[#1A6BCC]">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Protocol Secured</span>
           </div>
           <p className="text-[10px] font-black uppercase tracking-tight text-slate-300">{getStepName()}</p>
        </div>
      </footer>
      )}

      {/* Disclaimer Modal */}
      {showDisclaimer && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0F172A]/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl border-8 border-white space-y-8"
            >
               <div className="flex items-center gap-4 text-left">
                  <div className="bg-red-600 p-3 rounded-2xl text-white shadow-lg">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Clinical Safety Protocol</h2>
               </div>

               <div className="text-sm font-bold text-slate-500 leading-relaxed space-y-4 bg-[#F8FAFC] p-8 rounded-[24px] border border-slate-100 text-left">
                  <p className="text-medical-dark uppercase tracking-tight">System Acknowledgement:</p>
                  <ul className="space-y-3 uppercase tracking-tighter text-xs">
                    <li className="flex gap-3"><span className="text-red-600 font-black">01.</span> NOT A DIAGNOSTIC ENGINE</li>
                    <li className="flex gap-3"><span className="text-red-600 font-black">02.</span> CALL EMERGENCY SERVICES FOR ACUTE EVENTS</li>
                    <li className="flex gap-3"><span className="text-red-600 font-black">03.</span> DOCTOR CONSULTATION MANDATORY</li>
                  </ul>
                  <p className="italic text-[10px] pt-4 border-t border-slate-200">By proceeding, you agree to these clinical constraints.</p>
               </div>

               <button 
                 onClick={saveAcknowledgment}
                 className="w-full bg-[#1A6BCC] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 transition-all shadow-blue-500/20"
               >
                 I Accept Terms
               </button>
            </motion.div>
         </div>
      )}
    </div>
  );
}
