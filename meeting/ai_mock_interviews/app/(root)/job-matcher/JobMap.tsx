"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Job } from "@/types/ai-career";
import { matchColor } from "@/lib/ai-career-utils";
import { ChevronRight } from "lucide-react";

// Static mapping for major Indian cities to avoid live geocoding costs
const cityCoordinates: Record<string, [number, number]> = {
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  mumbai: [19.076, 72.8777],
  pune: [18.5204, 73.8567],
  hyderabad: [17.385, 78.4867],
  chennai: [13.0827, 80.2707],
  delhi: [28.7041, 77.1025],
  newdelhi: [28.6139, 77.209],
  noida: [28.5355, 77.391],
  gurgaon: [28.4595, 77.0266],
  gurugram: [28.4595, 77.0266],
  kolkata: [22.5726, 88.3639],
  ahmedabad: [23.0225, 72.5714],
  kochi: [9.9312, 76.2673],
  thiruvananthapuram: [8.5241, 76.9366],
  chandigarh: [30.7333, 76.7794],
  jaipur: [26.9124, 75.7873],
  indore: [22.7196, 75.8577],
};

function getCoordinates(locationStr: string): [number, number] | null {
  const loc = locationStr.toLowerCase().replace(/[^a-z]/g, "");
  for (const city in cityCoordinates) {
    if (loc.includes(city)) return cityCoordinates[city];
  }
  // If "India" or "Remote" is mentioned, we can place them centrally or scatter them slightly
  if (loc.includes("india") || loc.includes("remote")) {
    // Return a random central India coordinate so they don't all stack perfectly
    return [
      22.0 + (Math.random() - 0.5) * 4,
      79.0 + (Math.random() - 0.5) * 4,
    ];
  }
  return null;
}

// Custom icons
const createIcon = (score: number) => {
  const isHighMatch = score >= 80;
  const isMedMatch = score >= 60;
  
  const bgColor = isHighMatch ? "bg-indigo-600" : isMedMatch ? "bg-indigo-500/80" : "bg-white/20";
  const borderColor = isHighMatch ? "border-indigo-400" : "border-white/50";
  
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `<div class="w-6 h-6 rounded-full border-2 ${borderColor} ${bgColor} flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
      <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface JobMapProps {
  jobs: Job[];
}

export default function JobMap({ jobs }: JobMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fix Leaflet's default icon paths issue with webpack/next
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
        <p className="text-white/40">Loading Map...</p>
      </div>
    );
  }

  // Assign coordinates to jobs
  const mappedJobs: any[] = jobs
    .map((j) => {
        let coords = null;
        if (j.latitude && j.longitude) {
            coords = [j.latitude, j.longitude];
        } else {
            coords = getCoordinates(j.location);
        }
        return { ...j, coords };
    })
    .filter((j) => j.coords !== null);

  return (
    <div className="w-full h-[600px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative">
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container { background: #1a1a1a; font-family: inherit; }
        .leaflet-popup-content-wrapper { background: #262626; color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }
        .leaflet-popup-tip { background: #262626; }
        .leaflet-popup-close-button { color: #fff !important; }
        .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large { background-color: rgba(79, 70, 229, 0.6); }
        .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div { background-color: rgba(79, 70, 229, 0.9); color: white; }
      ` }} />
      
      {mappedJobs.length === 0 && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
          <p className="text-white/70">No specific locations found to map.</p>
        </div>
      )}

      <MapContainer
        center={[20.5937, 78.9629]} // India center
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Dark theme tile layer
        />
        <MarkerClusterGroup chunkedLoading>
          {mappedJobs.map((job, idx) => (
            <Marker key={idx} position={job.coords} icon={createIcon(job.matchScore)}>
              <Popup className="custom-popup">
                <div className="flex flex-col gap-2 w-64 p-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white text-base leading-tight">{job.company}</h3>
                    <span className={`text-sm font-black ${matchColor(job.matchScore)}`}>{job.matchScore}%</span>
                  </div>
                  
                  <p className="text-indigo-300 text-sm font-medium">{job.title}</p>
                  <p className="text-white/50 text-xs">{job.location}</p>
                  
                  <div className="flex gap-3 mt-1 text-xs">
                    {job.applyUrl ? (
                      <a href={job.applyUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">Apply Link</a>
                    ) : (
                      <>
                        <a href={"https://" + job.company.toLowerCase().replace(/[^a-z]/g, "") + ".com"} target="_blank" rel="noreferrer" className="text-white/60 hover:text-indigo-400 transition-colors">Website</a>
                        <a href={"https://linkedin.com/company/" + job.company.toLowerCase().replace(/[^a-z]/g, "")} target="_blank" rel="noreferrer" className="text-white/60 hover:text-indigo-400 transition-colors">LinkedIn</a>
                      </>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => {
                        alert("For full details, switch to List View and scroll to " + job.company);
                    }}
                    className="mt-2 w-full bg-white/10 hover:bg-white/20 text-white text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                  >
                    View Match Details <ChevronRight size={12} />
                  </button>
                  
                  {job.applyUrl ? (
                     <p className="text-[9px] text-emerald-400/70 text-center mt-1">Live Job Data</p>
                  ) : (
                     <p className="text-[9px] text-white/30 text-center mt-1">Demo/Curated Data</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
