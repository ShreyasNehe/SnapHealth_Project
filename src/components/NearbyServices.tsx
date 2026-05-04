import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Navigation, Loader2, Hospital, ExternalLink } from 'lucide-react';
import { generateContent } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../types';

// ai initialized via server-side proxy

interface Service {
  name: string;
  address: string;
  phone: string;
  distance?: string;
  type: string;
  open_now?: boolean;
}

export default function NearbyServices() {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    findNearby();
  }, []);

  const findNearby = async () => {
    setLoading(true);
    setError(null);

    // Get current location
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        const response = await generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ 
            role: 'user', 
            parts: [{ text: `Find the 5 closest hospitals or urgent care clinics near Latitude: ${latitude}, Longitude: ${longitude}. Provide their name, full address, and phone number. Use Google Search to ensure accuracy. Output as a JSON array of objects with keys: name, address, phone, type.` }] 
          }],
          config: {
            tools: [{ googleSearch: {} }],
            toolConfig: { includeServerSideToolInvocations: true }
          }
        });

        const text = response.text || '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          setServices(JSON.parse(jsonMatch[0]));
        } else {
          setError("Failed to parse services data.");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching nearby services. Please try again.");
      } finally {
        setLoading(false);
      }
    }, (err) => {
      setError("Location access denied. Please enable location to find local services.");
      setLoading(false);
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter uppercase leading-tight">Nearby Facilities</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Emergency & Clinical Support Network</p>
        </div>
        <button 
          onClick={findNearby}
          disabled={loading}
          className="bg-white border-2 border-slate-100 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:border-medical-blue transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          Refresh Location
        </button>
      </div>

      {error ? (
        <div className="p-8 bg-red-50 border border-red-100 rounded-[32px] text-center">
          <MapPin className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-900 font-bold uppercase tracking-tight text-sm">{error}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-slate-100 rounded-[32px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {services.map((service, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i}
                onClick={() => setSelectedService(service)}
                className={cn(
                  "p-8 rounded-[32px] border-2 transition-all cursor-pointer group relative overflow-hidden",
                  selectedService === service 
                    ? "bg-[#0F172A] border-[#0F172A] text-white" 
                    : "bg-white border-slate-100 hover:border-medical-blue hover:shadow-xl"
                )}
              >
                <div className="flex justify-between items-start relative z-10">
                   <div className={cn(
                     "p-3 rounded-2xl mb-4",
                     selectedService === service ? "bg-blue-600" : "bg-slate-50 text-slate-400 group-hover:text-medical-blue"
                   )}>
                      <Hospital className="w-6 h-6" />
                   </div>
                   <div className={cn(
                     "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                     selectedService === service ? "bg-white/10" : "bg-slate-100 text-slate-400"
                   )}>
                     {service.type}
                   </div>
                </div>

                <h3 className="text-xl font-black uppercase tracking-tighter leading-none mb-2">{service.name}</h3>
                <p className={cn(
                  "text-xs font-bold mb-6 line-clamp-2",
                  selectedService === service ? "text-slate-400" : "text-slate-500"
                )}>
                  {service.address}
                </p>

                <div className="flex items-center gap-3">
                   <a 
                     href={`tel:${service.phone}`}
                     className={cn(
                       "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg",
                       selectedService === service 
                        ? "bg-white text-[#0F172A] hover:bg-blue-50" 
                        : "bg-[#1A6BCC] text-white hover:bg-blue-700"
                     )}
                   >
                     <Phone className="w-4 h-4" />
                     {service.phone}
                   </a>
                   <a 
                     href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.name + ' ' + service.address)}`}
                     target="_blank"
                     rel="noreferrer"
                     className={cn(
                       "p-3 rounded-xl transition-all border",
                       selectedService === service 
                        ? "border-white/20 text-white hover:bg-white/10" 
                        : "border-slate-100 text-slate-400 hover:text-medical-blue"
                     )}
                   >
                     <ExternalLink className="w-4 h-4" />
                   </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="bg-blue-600/5 border border-blue-600/10 p-8 rounded-[40px] flex items-start gap-6">
         <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-lg shadow-blue-600/20">
            <MapPin className="w-8 h-8" />
         </div>
         <div>
            <h4 className="text-xl font-black text-blue-950 uppercase tracking-tighter">Emergency Protocol Indicator</h4>
            <p className="text-sm font-bold text-blue-800 leading-relaxed max-w-2xl mt-1">
               Based on your triage result, we recommend contacting one of the above facilities immediately if your urgency level is "ER NOW" or "URGENT CARE". Provide the protocol ID <span className="font-black">CH-PROTO-88</span> to the staff upon arrival.
            </p>
         </div>
      </div>
    </div>
  );
}
