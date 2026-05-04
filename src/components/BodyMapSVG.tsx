import React, { useState } from 'react';
import { cn, SymptomPin } from '../types';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BodyMapSVGProps {
  onZoneClick: (zone: string, x: number, y: number) => void;
  pins: (SymptomPin & { heatmap?: any })[];
}

const BodyMapSVG: React.FC<BodyMapSVGProps> = ({ onZoneClick, pins }) => {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [activeZone, setActiveZone] = useState<{ id: string; label: string; x: number; y: number } | null>(null);

  const zones = [
    { 
      id: 'head', label: 'Head/Neurological', front: [42, 5, 16, 25], back: [42, 5, 16, 25],
      subZones: ['Brain/Neurological', 'Eyes', 'Ears', 'Nose/Sinus', 'Mouth/Teeth', 'Skin/Scalp', 'Face Muscles']
    },
    { 
      id: 'neck', label: 'Neck', front: [45, 30, 10, 5], back: [45, 30, 10, 5],
      subZones: ['Throat', 'Cervical Spine', 'Lymph Nodes', 'Thyroid']
    },
    { 
      id: 'chest', label: 'Upper Torso (Heart/Lungs)', front: [32, 35, 36, 30], back: [32, 35, 36, 35],
      subZones: ['Heart', 'Lungs (Left)', 'Lungs (Right)', 'Sternum/Ribs', 'Upper Esophagus']
    },
    { 
      id: 'abdomen', label: 'Lower Torso (Abdomen)', front: [35, 65, 30, 35], back: null,
      subZones: ['Stomach', 'Liver', 'Gallbladder', 'Pancreas', 'Intestines', 'Bladder']
    },
    { 
      id: 'back', label: 'Back/Spine', front: null, back: [33, 70, 34, 45],
      subZones: ['Kidneys', 'Lumbar Spine', 'Thoracic Spine', 'Back Muscles']
    },
    { 
      id: 'arms_l', label: 'Left Arm', front: [15, 35, 17, 70], back: [15, 35, 17, 70],
      subZones: ['Shoulder', 'Elbow', 'Wrist', 'Hands/Fingers', 'Numbness/Tingling']
    },
    { 
      id: 'arms_r', label: 'Right Arm', front: [68, 35, 17, 70], back: [68, 35, 17, 70],
      subZones: ['Shoulder', 'Elbow', 'Wrist', 'Hands/Fingers', 'Numbness/Tingling']
    },
    { 
      id: 'legs', label: 'Legs/Lower Limbs', front: [25, 115, 50, 80], back: [25, 115, 50, 80],
      subZones: ['Hip', 'Knee', 'Ankle', 'Feet/Toes', 'Muscle Pain', 'Joint Swelling']
    }
  ];

  const currentZones = zones.filter(z => (view === 'front' ? z.front : z.back));

  const handleZoneClick = (z: any, x: number, y: number) => {
    if (activeZone?.id === z.id) {
      setActiveZone(null);
    } else {
      setActiveZone({ id: z.id, label: z.label, x, y });
    }
  };

  const handleSubZoneSelect = (subZone: string) => {
    if (activeZone) {
      onZoneClick(`${activeZone.label}: ${subZone}`, activeZone.x, activeZone.y);
      setActiveZone(null);
    }
  };

  return (
    <div className="flex flex-col items-center relative">
      <div className="flex gap-1.5 mb-6 bg-slate-200/50 p-1 rounded-xl w-full">
        <button
          onClick={() => setView('front')}
          className={cn(
            "flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
            view === 'front' ? "bg-white shadow-sm text-medical-blue" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Frontal View
        </button>
        <button
          onClick={() => setView('back')}
          className={cn(
            "flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
            view === 'back' ? "bg-white shadow-sm text-medical-blue" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Posterior View
        </button>
      </div>

      <div className="relative w-full aspect-[1/2] bg-[#F8FAFC] rounded-3xl border border-slate-200 shadow-inner p-6">
        <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-sm overflow-visible">
          <defs>
             <radialGradient id="heatGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
             </radialGradient>
             <radialGradient id="nerveGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
             </radialGradient>
          </defs>
          {/* Natural Human Silhouette */}
          <path
            d="M50,10 
               C54,10 57,13 57,18 C57,23 54,26 50,26 C46,26 43,23 43,18 C43,13 46,10 50,10 
               M50,26 L50,32 
               M30,35 C35,32 45,32 50,32 C55,32 65,32 70,35 
               L78,45 L85,80 C86,85 82,88 80,85 L75,55 
               L70,55 L70,105 
               L62,105 L65,190 C65,195 60,195 58,190 L52,115 
               L48,115 L42,190 C40,195 35,195 35,190 L38,105 
               L30,105 L30,55 L25,55 
               L20,85 C18,88 14,85 15,80 L22,45 Z"
            className="fill-slate-100 stroke-slate-300"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          
          {/* Heatmaps */}
          {pins.map((pin, i) => pin.heatmap && (
            <circle
              key={`heat-${i}`}
              cx={pin.x}
              cy={pin.y}
              r={pin.heatmap.radius || 20}
              fill={pin.heatmap.type === 'nerve' ? 'url(#nerveGradient)' : 'url(#heatGradient)'}
              className="animate-pulse"
            />
          ))}

          {/* Interactive Zones */}
          {currentZones.map((z) => {
            const coords = view === 'front' ? z.front : z.back;
            if (!coords) return null;
            const [x, y, w, h] = coords;
            return (
              <rect
                key={z.id}
                x={x}
                y={y}
                width={w}
                height={h}
                className={cn(
                  "fill-transparent hover:fill-blue-500/10 cursor-pointer transition-colors",
                  activeZone?.id === z.id && "fill-blue-500/20 stroke-blue-500 stroke-1"
                )}
                onClick={() => handleZoneClick(z, x + w / 2, y + h / 2)}
              >
                <title>{z.label}</title>
              </rect>
            );
          })}

          {/* Pins */}
          {pins.map((pin, i) => (
            <circle
              key={i}
              cx={pin.x}
              cy={pin.y}
              r="2.5"
              className={cn(
                "animate-pulse shadow-sm",
                pin.severity <= 3 ? "fill-green-500" :
                pin.severity <= 7 ? "fill-yellow-500" : "fill-red-500"
              )}
            />
          ))}
        </svg>

        {/* Sub-zone Selector Overlay */}
        <AnimatePresence>
          {activeZone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute z-50 bg-white shadow-2xl rounded-2xl border border-slate-200 p-2 min-w-[150px] pointer-events-auto"
              style={{ 
                left: `${(activeZone.x / 100) * 100}%`, 
                top: `${(activeZone.y / 200) * 100}%`,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div className="px-3 py-1.5 border-b border-slate-100 mb-1 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-medical-blue">{activeZone.label}</span>
                <button onClick={() => setActiveZone(null)} className="text-slate-400 hover:text-slate-800"><X className="w-3 h-3" /></button>
              </div>
              <div className="max-h-[180px] overflow-y-auto space-y-0.5 p-1">
                {zones.find(z => z.id === activeZone.id)?.subZones?.map(sz => (
                  <button
                    key={sz}
                    onClick={() => handleSubZoneSelect(sz)}
                    className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:text-medical-blue rounded-lg transition-colors"
                  >
                    {sz}
                  </button>
                )) || (
                  <button
                    onClick={() => handleSubZoneSelect('Entire Area')}
                    className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:text-medical-blue rounded-lg transition-colors"
                  >
                    Entire Area
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Click a body part to view granular options</p>
    </div>
  );
};

export default BodyMapSVG;
