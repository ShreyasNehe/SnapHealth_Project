import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TriageAnalysis, Session, cn } from '../types';
import { AlertCircle, CheckCircle2, AlertTriangle, ShieldAlert, Clock, ChevronRight, Stethoscope, History, MessageSquare, Activity, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface DiagnosisDashboardProps {
  analysis: TriageAnalysis;
  sessions: Session[];
  onFinish: () => void;
  onPrint: () => void;
}

const DiagnosisDashboard: React.FC<DiagnosisDashboardProps> = ({ analysis, sessions, onFinish, onPrint }) => {
  const [reportView, setReportView] = React.useState<'patient' | 'clinician' | 'ai-doctor'>('patient');
  const urgencyConfig = {
    'self-care': { color: 'bg-green-500', text: 'Self-Care at Home', icon: CheckCircle2, textClass: 'text-green-900', bgSmall: 'bg-green-50' },
    'see-doctor': { color: 'bg-blue-600', text: 'Schedule a Doctor Visit', icon: Stethoscope, textClass: 'text-blue-900', bgSmall: 'bg-blue-50' },
    'urgent-care': { color: 'bg-amber-500', text: 'Visit Urgent Care Today', icon: AlertTriangle, textClass: 'text-amber-900', bgSmall: 'bg-amber-50' },
    'er-now': { color: 'bg-red-600', text: 'Go to the ER Now', icon: ShieldAlert, textClass: 'text-red-900', bgSmall: 'bg-red-50', pulse: true }
  };

  const config = urgencyConfig[analysis.urgency] || urgencyConfig['see-doctor'];

  const chartData = (analysis.differentials || []).map(d => ({
    name: d.condition,
    prob: d.probability,
    reason: d.reasoning
  })).sort((a, b) => b.prob - a.prob);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Banner - The Big Statement */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "w-full p-10 rounded-[32px] flex items-center gap-10 shadow-2xl border-4 border-white overflow-hidden relative",
          config.bgSmall
        )}
      >
        <div className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center shrink-0 shadow-lg",
          config.color,
          config.pulse && "animate-pulse"
        )}>
          <config.icon className="w-12 h-12 text-white" />
        </div>
        <div className="relative z-10 flex-1">
          <h1 className={cn("text-6xl font-black tracking-tighter leading-none uppercase mb-2", config.textClass)}>
            {config.text}
          </h1>
          <p className={cn("text-xl font-bold tracking-tight opacity-80", config.textClass)}>
            {analysis.urgency_reason}
          </p>
        </div>
        {analysis.urgency === 'er-now' && (
          <button onClick={() => window.location.href = 'tel:911'} className="bg-red-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:bg-red-700 transition-all flex items-center gap-3">
            CALL 911 NOW
          </button>
        )}
      </motion.div>

      {/* Dual Reporting Toggle */}
      <div className="flex bg-slate-100 p-1.5 rounded-[24px] mb-8 w-fit mx-auto border-2 border-white shadow-sm">
        <button 
          onClick={() => setReportView('patient')}
          className={cn("px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", reportView === 'patient' ? "bg-white text-medical-blue shadow-sm" : "text-slate-400 hover:text-slate-600")}
        >
          Patient Guidance
        </button>
        <button 
          onClick={() => setReportView('ai-doctor')}
          className={cn("px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", reportView === 'ai-doctor' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600")}
        >
          AI Doctor Mode
        </button>
        <button 
          onClick={() => setReportView('clinician')}
          className={cn("px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", reportView === 'clinician' ? "bg-white text-medical-blue shadow-sm" : "text-slate-400 hover:text-slate-600")}
        >
          Clinician Handover
        </button>
      </div>

      <div className="card-bold p-8 mb-8 border-medical-blue/20 bg-blue-50/20 relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 p-4 opacity-5">
           <Stethoscope className="w-24 h-24" />
         </div>

         <h2 className="text-label mb-6 flex items-center gap-2">
           <MessageSquare className="w-4 h-4" />
           {reportView === 'patient' ? 'Your Personal Care Summary' : reportView === 'ai-doctor' ? 'AI Doctor: Tactical Care Plan' : 'Clinician Handover Protocol'}
         </h2>
         
         <div className="space-y-6">
           <p className="text-sm font-black text-medical-dark leading-relaxed uppercase tracking-tight">
             {reportView === 'patient' ? (analysis.patient_guidance || analysis.urgency_reason) : reportView === 'clinician' ? (analysis.clinician_handover || "PENDING: Professional synthesis not requested.") : (analysis.ai_doctor_care_plan || "Analyzing clinical data for technical guidance...")}
           </p>

           {reportView === 'ai-doctor' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Immediate Actions */}
                <div className="bg-white/80 p-6 rounded-2xl border border-blue-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-medical-blue">
                    <Activity className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Biological Interventions</span>
                  </div>
                  <ul className="space-y-2">
                    {analysis.recommended_next_steps.slice(0, 3).map((step, i) => (
                      <li key={i} className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Medication Support */}
                <div className="bg-white/80 p-6 rounded-2xl border border-orange-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Medical Support Suggestions</span>
                  </div>
                  {analysis.medication_suggestions && analysis.medication_suggestions.length > 0 ? (
                    <div className="space-y-2">
                      {analysis.medication_suggestions.map((med, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          <span className="text-xs font-bold text-slate-700 uppercase">{med}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] font-bold text-slate-400 uppercase italic">No pharmacological suggestions for this presentation.</p>
                  )}
                </div>
             </div>
           )}
         </div>
         
         {reportView === 'ai-doctor' && (
           <div className="mt-6 p-4 rounded-xl bg-orange-50/50 border border-orange-100">
              <p className="text-[9px] font-black text-orange-600 italic uppercase leading-tight">
                CRITICAL NOTICE: AI Doctor Mode generates technical clinical scaffolds. These observations MUST be verified by a licensed MD. Do not self-administer medications without professional validation.
              </p>
           </div>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Differentials */}
        <div className="space-y-8 flex flex-col">
          <div className="card-bold p-8 flex-1">
            <h2 className="text-label mb-6">Probable Differentials</h2>
            <div className="space-y-6">
              {chartData.map((d, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-black text-medical-dark uppercase text-xs tracking-wider">{d.name}</span>
                    <span className={cn("text-sm font-black", i === 0 ? "text-medical-blue" : "text-slate-400")}>{d.prob}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${d.prob}%` }}
                      className={cn("h-full rounded-full", i === 0 ? "bg-medical-blue" : "bg-slate-300")} 
                    />
                  </div>
                  <p className="text-[10px] text-medical-muted mt-2 font-bold leading-tight uppercase tracking-tight">{d.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
             <p className="text-label mb-2">Clinical Context</p>
             <p className="text-sm font-black leading-tight uppercase tracking-tight text-medical-dark">
               {analysis.pattern_note || "System Baseline: No conflicting historical patterns detected for this profile."}
             </p>
          </div>
        </div>

        {/* Column 2: Alarms & Checks */}
        <div className="space-y-8">
          <div className="card-bold p-8 bg-red-50/50 border-red-100">
            <h2 className="text-label text-red-800 mb-6 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Risk Assessment
            </h2>
            {analysis.red_flags.length > 0 ? (
              <ul className="space-y-3">
                {analysis.red_flags.map((flag, i) => (
                  <li key={i} className="text-sm font-black text-red-900 border-l-4 border-red-500 pl-4 py-1 uppercase tracking-tight leading-none">
                    {flag}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs font-bold text-slate-400 uppercase">No acute red flags identified in this protocol.</p>
            )}
          </div>

          <div className="card-bold p-8 bg-blue-50/50 border-blue-100">
             <h2 className="text-label text-blue-800 mb-6">Execution Window</h2>
             <p className="text-5xl font-black text-blue-900 leading-none tracking-tighter uppercase">{analysis.follow_up_window}</p>
             <div className="mt-6 space-y-4">
                {analysis.vitals_anomaly_prediction && (
                   <div className="pt-4 border-t border-blue-200">
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Predictive Instability
                      </p>
                      <p className="text-xs font-bold text-red-900 uppercase tracking-tight">{analysis.vitals_anomaly_prediction}</p>
                   </div>
                )}
                {analysis.grounded_reasoning && (
                   <div className="pt-4 border-t border-blue-200">
                      <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Info className="w-3 h-3" /> Grounded Evidence
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 italic leading-tight uppercase">{analysis.grounded_reasoning}</p>
                   </div>
                )}
                {analysis.medication_interactions.length > 0 && (
                   <div className="pt-4 border-t border-blue-200">
                      <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Drug Interactions</p>
                      <p className="text-xs font-bold text-blue-900 uppercase tracking-tight">{analysis.medication_interactions.join(', ')}</p>
                   </div>
                )}
                {analysis.specialist_referral && (
                   <div className="pt-4 border-t border-blue-200">
                      <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Recommended Specialist</p>
                      <p className="text-xs font-bold text-blue-900 uppercase tracking-tight">{analysis.specialist_referral}</p>
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Column 3: Next Steps */}
        <div className="space-y-8">
           <div className="card-bold p-8">
              <h2 className="text-label mb-6">Action Protocols</h2>
              <div className="space-y-4">
                {analysis.recommended_next_steps.map((step, i) => (
                  <label key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 cursor-pointer transition-all border-2 border-transparent hover:border-blue-200 group">
                    <div className="w-6 h-6 rounded-lg border-2 border-slate-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-blue-500">
                       <input type="checkbox" className="hidden" />
                       <div className="w-3 h-3 bg-blue-500 rounded-sm opacity-0 peer-checked:opacity-100" />
                    </div>
                    <span className="text-xs font-black text-medical-dark uppercase tracking-tight leading-tight">{step}</span>
                  </label>
                ))}
              </div>
           </div>

           {/* System AI Enhancements Section */}
          <div className="card-bold p-8 bg-[#F8FAFC]">
             <h2 className="text-label mb-6 flex items-center gap-2 text-medical-blue">
                <ShieldAlert className="w-4 h-4" />
                Advanced Clinical Intelligence
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-3">
                   <div className="p-2 bg-blue-100 rounded-xl text-blue-600"><Activity className="w-4 h-4" /></div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Vision AI Analysis</p>
                      <p className="text-[9px] font-bold text-slate-500 leading-tight">Image-based symptom dermatological screening active.</p>
                   </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-3">
                   <div className="p-2 bg-green-100 rounded-xl text-green-600"><AlertCircle className="w-4 h-4" /></div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">RAG Processing</p>
                      <p className="text-[9px] font-bold text-slate-500 leading-tight">Medical grounding via Google Search protocols.</p>
                   </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-3">
                   <div className="p-2 bg-purple-100 rounded-xl text-purple-600"><CheckCircle2 className="w-4 h-4" /></div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Predictive Vitals</p>
                      <p className="text-[9px] font-bold text-slate-500 leading-tight">Monte-Carlo assessment for critical instability.</p>
                   </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-3">
                   <div className="p-2 bg-orange-100 rounded-xl text-orange-600"><History className="w-4 h-4" /></div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Semantic Heatmapping</p>
                      <p className="text-[9px] font-bold text-slate-500 leading-tight">Spatial symptom correlation on body map.</p>
                   </div>
                </div>
             </div>
          </div>

          <button onClick={() => window.dispatchEvent(new CustomEvent('changeScreen', { detail: 'services' }))} className="w-full bg-[#0F172A] text-white py-6 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4 group">
            View Nearby Facilities
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button onClick={onPrint} className="w-full bg-white border-2 border-slate-200 text-slate-600 py-6 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-sm hover:border-blue-200 transition-all flex items-center justify-center gap-4 group">
            Final Clinical Summary
          </button>

          {/* Audit Trail Card */}
          <div className="card-bold p-6 bg-[#0F172A] text-white border-none shadow-xl">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4 flex items-center gap-2">
               <ShieldAlert className="w-4 h-4" /> System Audit Trail
             </h3>
             <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {analysis.audit_trail && analysis.audit_trail.length > 0 ? analysis.audit_trail.map((entry, i) => (
                   <div key={i} className="border-l-2 border-blue-900 pl-3 py-1">
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-[9px] font-black text-blue-300">{entry.action}</span>
                         <span className="text-[8px] font-mono text-slate-500">{(entry.confidence * 100).toFixed(0)}% CF</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold leading-tight line-clamp-2 italic">{entry.reasoning}</p>
                   </div>
                )) : <p className="text-[10px] text-slate-500 italic">No audit events recorded.</p>}
             </div>
          </div>

          <button onClick={onFinish} className="w-full bg-white text-slate-400 py-4 rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:text-slate-800 transition-all">
             Terminate Session & Start New
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisDashboard;
