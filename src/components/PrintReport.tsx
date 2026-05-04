import React from 'react';
import { Session, cn } from '../types';

interface PrintableReportProps {
  session: Session;
  onCopy: () => void;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ session, onCopy }) => {
  const { profile, symptoms, vitals, analysis, timestamp } = session;

  return (
    <div className="space-y-6">
      <div className="flex gap-4 print:hidden justify-end max-w-[8.5in] mx-auto">
         <button onClick={() => window.print()} className="text-[10px] bg-slate-100 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 active:scale-95 transition-all print:hidden">
            Print Version
         </button>
      </div>

      <div className="bg-white p-8 max-w-[8.5in] mx-auto min-h-screen font-serif text-slate-900 border border-slate-100 shadow-sm" id="printable-report">

      <div className="border-b-4 border-blue-600 pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">SnapHealth AI</h1>
          <p className="text-xs text-slate-500 font-sans font-bold uppercase tracking-widest mt-1">Symptom Triage & Clinical Summary Report</p>
        </div>
        <div className="text-right text-xs font-sans text-slate-400">
          <p>Generated: {new Date(timestamp).toLocaleString()}</p>
          <p>Reference ID: {session.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-sm font-black uppercase text-slate-400 border-b border-slate-100 mb-3 font-sans">Patient Profile</h2>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <p className="font-bold">Age:</p><p>{profile.age}</p>
            <p className="font-bold">Biological Sex:</p><p>{profile.sex}</p>
            <p className="font-bold">Pregnant:</p><p>{profile.isPregnant ? 'Yes' : 'No'}</p>
            <p className="font-bold">Conditions:</p><p className="text-xs">{profile.chronicConditions.join(', ') || 'None reported'}</p>
          </div>
        </div>
        <div>
           <h2 className="text-sm font-black uppercase text-slate-400 border-b border-slate-100 mb-3 font-sans">Clinical Metadata</h2>
           <div className="grid grid-cols-2 gap-y-2 text-sm">
            <p className="font-bold">Allergies:</p><p className="text-xs text-red-600 font-sans">{profile.allergies || 'NKDA'}</p>
            <p className="font-bold">Medications:</p><p className="text-xs">{profile.medications || 'None reported'}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-black uppercase text-slate-400 border-b border-slate-100 mb-3 font-sans">Presenting Symptoms</h2>
        <table className="w-full text-left text-sm font-sans">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-100">
              <th className="p-2">Location</th>
              <th className="p-2">Description</th>
              <th className="p-2 text-center">Severity</th>
              <th className="p-2">Onset</th>
              <th className="p-2">Trend</th>
            </tr>
          </thead>
          <tbody>
            {symptoms.map((s, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="p-2 font-bold">{s.zone}</td>
                <td className="p-2 italic">{s.description}</td>
                <td className="p-2 text-center font-bold">{s.severity}/10</td>
                <td className="p-2 text-slate-500">{s.daysAgo}d ago</td>
                <td className="p-2 capitalize">{s.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-8 p-4 bg-slate-50 border-l-4 border-slate-300 font-sans">
        <h2 className="text-sm font-black uppercase text-slate-400 mb-2">Vital Signs</h2>
        <div className="flex gap-10 text-sm">
           <div><span className="font-bold">HR:</span> {vitals.heartRate ?? '—'} <span className="text-[10px]">bpm</span></div>
           <div><span className="font-bold">Temp:</span> {vitals.temperature ?? '—'}{vitals.tempUnit}</div>
           <div><span className="font-bold">BP:</span> {vitals.systolicBP ?? '—'}/{vitals.diastolicBP ?? '—'} <span className="text-[10px]">mmHg</span></div>
           <div><span className="font-bold">O2:</span> {vitals.o2Sat ?? '—'}%</div>
        </div>
      </div>

      <div className="mb-8 font-sans">
        <div className={cn(
          "p-6 rounded-lg text-white mb-6",
          analysis.urgency === 'er-now' ? "bg-red-800" :
          analysis.urgency === 'urgent-care' ? "bg-amber-800" :
          "bg-blue-800"
        )}>
          <p className="text-xs font-black uppercase opacity-70 mb-1">Triage Protocol Assessment</p>
          <p className="text-xl font-bold uppercase tracking-tight">{analysis.urgency.replace('-', ' ')}</p>
          <p className="text-sm mt-2 opacity-90">{analysis.urgency_reason}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10 border-y border-slate-100 py-8">
           <div className="border-r border-slate-100 pr-8">
              <h3 className="text-xs font-black uppercase text-blue-800 mb-3 font-sans">Professional Clinician Handover</h3>
              <p className="text-xs font-bold leading-relaxed">{analysis.clinician_handover || 'Professional synthesis not included.'}</p>
           </div>
           <div className="pl-4">
              <h3 className="text-xs font-black uppercase text-green-700 mb-3 font-sans">Patient Guidance Summary</h3>
              <p className="text-xs leading-relaxed italic">{analysis.patient_guidance || 'Patient-facing summary not included.'}</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
            <div>
               <h3 className="text-xs font-black uppercase text-slate-400 mb-2">Differential Diagnosis</h3>
               <div className="space-y-4">
                  {analysis.differentials.map((d, i) => (
                    <div key={i}>
                       <div className="flex justify-between text-sm">
                          <span className="font-bold">{d.condition}</span>
                          <span className="font-mono text-xs">{d.probability}%</span>
                       </div>
                       <p className="text-[10px] text-slate-500 italic mt-1 leading-tight">{d.reasoning}</p>
                    </div>
                  ))}
               </div>
            </div>
            <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400 mb-2 font-sans">Identified Red Flags</h3>
                  {analysis.red_flags.length > 0 ? (
                    <ul className="text-xs text-red-700 space-y-1 font-bold font-sans">
                       {analysis.red_flags.map((f, i) => <li key={i}>• {f}</li>)}
                    </ul>
                  ) : <p className="text-xs text-slate-400 font-sans font-bold">None detected</p>}
                </div>

                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400 mb-2 font-sans">Specialist Referral</h3>
                  <p className="text-sm font-bold font-sans">{analysis.specialist_referral || 'None indicated'}</p>
                </div>

                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400 mb-2 font-sans">Execution Window</h3>
                  <p className="text-sm font-black uppercase font-sans text-blue-700">{analysis.follow_up_window}</p>
                </div>
            </div>
        </div>

        <div className="mt-10">
           <h3 className="text-xs font-black uppercase text-slate-400 mb-2 font-sans">Action Protocol Recommendations</h3>
           <div className="grid grid-cols-2 gap-4">
              {analysis.recommended_next_steps.map((step, i) => (
                <div key={i} className="text-xs font-bold font-sans flex gap-2">
                   <div className="w-4 h-4 border border-slate-300 rounded shrink-0" />
                   {step}
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-8 mt-auto font-sans text-[10px] text-slate-400 leading-relaxed italic">
        <p>
          DISCLAIMER: This document was generated by SnapHealth AI. AI outputs can be inaccurate or misleading. 
          This report is intended for informational summary only and does NOT constitute medical advice, diagnosis, 
          or treatment. Please review this summary with a licensed medical professional immediately.
        </p>
      </div>
      </div>
    </div>
  );
};

export default PrintableReport;
