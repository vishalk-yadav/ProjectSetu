import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Project, Complaint } from '../../types';
import { formatCurrencyINR, getRiskBadgeClasses, getStatusBadgeClasses, formatDate } from '../../utils/formatters';
import { ExternalLink, MapPin, AlertTriangle, Camera, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface ProjectMapComponentProps {
  projects?: Project[];
  grievances?: Complaint[];
  selectedLocation?: { lat: number; lng: number; accuracy?: number } | null;
  onLocationSelect?: (coords: { lat: number; lng: number }) => void;
  interactivePicker?: boolean;
  height?: string;
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

// Custom Leaflet DivIcon generator for color-coded project risk markers
const createProjectIcon = (score: number) => {
  let color = '#10b981'; // Green
  if (score >= 81) color = '#ef4444'; // Red
  else if (score >= 61) color = '#f97316'; // Orange
  else if (score >= 31) color = '#f59e0b'; // Amber

  return L.divIcon({
    className: 'custom-project-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2.5px solid #ffffff;
        box-shadow: 0 3px 10px ${color}99, 0 1px 3px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="background-color: white; width: 8px; height: 8px; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -15],
  });
};

// Custom Leaflet DivIcon generator for Citizen Grievance markers (Distinguishable shape & warning icon)
const createGrievanceIcon = (severity: string, status: string) => {
  let bgColor = '#f59e0b'; // Amber default
  if (severity === 'CRITICAL') bgColor = '#ef4444'; // Red
  else if (severity === 'HIGH') bgColor = '#ea580c'; // Orange-red
  else if (severity === 'LOW') bgColor = '#3b82f6'; // Blue

  if (status === 'RESOLVED') bgColor = '#10b981'; // Emerald if resolved

  return L.divIcon({
    className: 'custom-grievance-pin',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 28px;
        height: 28px;
        border-radius: 8px 8px 8px 0;
        transform: rotate(-45deg);
        border: 2px solid #ffffff;
        box-shadow: 0 4px 12px ${bgColor}aa, 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 9v4"></path><path d="M12 17h.01"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

// Location Picker pin (Pulse effect)
const createPickerIcon = () => {
  return L.divIcon({
    className: 'custom-picker-pin',
    html: `
      <div style="
        background-color: #2563eb;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid #ffffff;
        box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.35), 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: move;
        animation: pulse 2s infinite;
      ">
        <div style="background-color: white; width: 10px; height: 10px; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

// Map click listener component
const MapClickHandler: React.FC<{ onLocationSelect?: (coords: { lat: number; lng: number }) => void }> = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
};

export const ProjectMapComponent: React.FC<ProjectMapComponentProps> = ({
  projects = [],
  grievances = [],
  selectedLocation,
  onLocationSelect,
  interactivePicker = false,
  height = '550px',
  defaultCenter = [21.5, 78.9],
  defaultZoom = 5,
}) => {
  const navigate = useNavigate();
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMapReady(true);
    }
  }, []);

  const geocodedProjects = projects.filter(
    (p) => p.latitude !== null && p.longitude !== null && !isNaN(p.latitude as number) && !isNaN(p.longitude as number)
  );

  const geocodedGrievances = grievances.filter(
    (g) => g.latitude !== null && g.longitude !== null && !isNaN(g.latitude as number) && !isNaN(g.longitude as number)
  );

  if (!mapReady) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-white rounded-2xl border border-slate-200/80 text-slate-500 shadow-2xs">
        Initializing Geospatial Mapping Engine...
      </div>
    );
  }

  const initialCenter = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng] as [number, number]
    : geocodedProjects.length > 0 && geocodedProjects[0].latitude && geocodedProjects[0].longitude
    ? [geocodedProjects[0].latitude, geocodedProjects[0].longitude] as [number, number]
    : defaultCenter;

  const initialZoom = selectedLocation ? 13 : defaultZoom;

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-200/80 relative z-10 shadow-2xs">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ background: '#f8fafc' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {interactivePicker && <MapClickHandler onLocationSelect={onLocationSelect} />}

        {/* Selected / Current User Location Pin & Accuracy Circle */}
        {selectedLocation && (
          <>
            <Marker
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={createPickerIcon()}
              draggable={!!onLocationSelect}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  if (onLocationSelect) {
                    onLocationSelect({ lat: position.lat, lng: position.lng });
                  }
                },
              }}
            >
              <Popup>
                <div className="p-2 text-slate-900 text-xs">
                  <div className="flex items-center gap-1 font-bold text-blue-700 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Reported Location</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Lat: {selectedLocation.lat.toFixed(5)}, Lng: {selectedLocation.lng.toFixed(5)}
                  </p>
                  {selectedLocation.accuracy && (
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      GPS Accuracy: ±{Math.round(selectedLocation.accuracy)}m
                    </p>
                  )}
                  {onLocationSelect && (
                    <p className="text-[10px] text-blue-600 mt-1 italic">
                      Drag pin or click map to refine location
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>

            {selectedLocation.accuracy && selectedLocation.accuracy > 0 && (
              <Circle
                center={[selectedLocation.lat, selectedLocation.lng]}
                radius={Math.min(selectedLocation.accuracy, 500)}
                pathOptions={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.15,
                  color: '#2563eb',
                  weight: 1.5,
                  dashArray: '4, 4',
                }}
              />
            )}
          </>
        )}

        {/* Project Markers */}
        {geocodedProjects.map((p) => (
          <Marker
            key={`proj-${p.id}`}
            position={[p.latitude as number, p.longitude as number]}
            icon={createProjectIcon(p.riskScore)}
          >
            <Popup className="projectsetu-popup">
              <div className="p-2 max-w-[260px] text-slate-900">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    {p.department?.code || 'GOV'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Risk {p.riskScore}/100
                  </span>
                </div>
                <h4 className="text-xs font-bold leading-tight mb-1 text-[#0F223D]">{p.name}</h4>
                <p className="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> {p.location}
                </p>

                <div className="mb-2">
                  <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                    <span>Progress</span>
                    <span className="font-bold text-[#0F223D]">{p.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1A73E8] h-full rounded-full"
                      style={{ width: `${p.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 mb-3">
                  Budget: <strong className="text-slate-800">{formatCurrencyINR(p.allocatedBudget)}</strong>
                </div>

                <button
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <span>Project Overview</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Grievance Markers */}
        {geocodedGrievances.map((g) => (
          <Marker
            key={`grv-${g.id}`}
            position={[g.latitude as number, g.longitude as number]}
            icon={createGrievanceIcon(g.severity, g.status)}
          >
            <Popup className="projectsetu-popup">
              <div className="p-2 max-w-[280px] text-slate-900">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                    {g.category.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    g.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {g.status}
                  </span>
                </div>

                {g.photoUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-slate-200 h-28 w-full bg-slate-100">
                    <img
                      src={g.photoUrl.startsWith('http') || g.photoUrl.startsWith('/uploads') ? g.photoUrl : `/uploads/${g.photoUrl}`}
                      alt="Grievance Evidence"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <h4 className="text-xs font-bold leading-tight mb-1 text-[#0F223D]">
                  {g.subject}
                </h4>

                <p className="text-[11px] text-slate-600 line-clamp-2 mb-2">
                  {g.description}
                </p>

                {g.project && (
                  <div className="text-[10px] text-slate-500 mb-2 flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                    <span className="truncate font-semibold text-slate-700">{g.project.name}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>Ref: <strong className="text-slate-600">{g.trackingId || g.id.slice(0, 8)}</strong></span>
                  <span>{formatDate(g.createdAt)}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
