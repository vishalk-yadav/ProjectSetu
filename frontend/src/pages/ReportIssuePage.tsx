import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Upload,
  MapPin,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  X,
  RotateCcw,
  Building2,
  FileText,
  User,
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight,
  Copy,
  ExternalLink,
  Info,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { projectApi } from '../api/projectApi';
import { complaintApi } from '../api/complaintApi';
import { publicApi } from '../api/publicApi';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext';
import { ProjectMapComponent } from '../components/map/ProjectMapComponent';

// Helper: Haversine distance in kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const ReportIssuePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProjectId = searchParams.get('projectId');
  const { user } = useAuth();

  // Projects list
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Form State
  const [projectId, setProjectId] = useState<string>(preselectedProjectId || '');
  const [nearestProject, setNearestProject] = useState<{ project: Project; distanceKm: number } | null>(null);
  const [category, setCategory] = useState<string>('ROAD_DAMAGE');
  const [severity, setSeverity] = useState<string>('MEDIUM');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [complainantName, setComplainantName] = useState<string>(user?.name || '');
  const [complainantEmail, setComplainantEmail] = useState<string>(user?.email || '');
  const [complainantPhone, setComplainantPhone] = useState<string>('');

  // Media Capture & Preview
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // GPS Location State
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'IDLE' | 'FETCHING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ trackingId: string; subject: string; project?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Load active projects for dropdown and proximity matching
  useEffect(() => {
    publicApi
      .listProjects({ limit: 200 })
      .then((res) => {
        setProjects(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load projects list:', err);
      })
      .finally(() => {
        setLoadingProjects(false);
      });
  }, []);

  // Fetch GPS on initial mount
  useEffect(() => {
    requestGpsLocation();
  }, []);

  // Update nearest project whenever coordinates or projects change
  useEffect(() => {
    if (!coords || projects.length === 0) return;

    let closest: Project | null = null;
    let minDistance = Infinity;

    projects.forEach((p) => {
      if (p.latitude && p.longitude) {
        const dist = calculateDistanceKm(coords.lat, coords.lng, p.latitude, p.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          closest = p;
        }
      }
    });

    if (closest !== null && minDistance <= 30) {
      const bestProj: Project = closest;
      setNearestProject({ project: bestProj, distanceKm: minDistance });
      if (!projectId) {
        setProjectId(bestProj.id);
      }
    }
  }, [coords, projects]);

  // Request browser geolocation
  const requestGpsLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('ERROR');
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('FETCHING');
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({
          lat: latitude,
          lng: longitude,
          accuracy: accuracy || 15,
        });
        setLocationStatus('SUCCESS');
      },
      (error) => {
        setLocationStatus('ERROR');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access was denied. You can still pick your location on the map below.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is currently unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again.');
            break;
          default:
            setLocationError('An error occurred while retrieving location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  // Handle Photo Selection / Capture
  const handleFile = (file: File) => {
    setPhotoError(null);

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('Image size exceeds 10MB limit.');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (!coords && locationStatus === 'IDLE') {
      requestGpsLocation();
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoError(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  // Handle Map Pin Drag / Click
  const handleLocationPick = (picked: { lat: number; lng: number }) => {
    setCoords({
      lat: picked.lat,
      lng: picked.lng,
      accuracy: 5,
    });
    setLocationStatus('SUCCESS');
    setLocationError(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!subject.trim()) {
      setSubmitError('Please provide a brief title/subject for the issue.');
      return;
    }

    if (!description.trim()) {
      setSubmitError('Please provide a detailed description of the reported issue.');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      if (projectId && projectId !== 'NONE') {
        formData.append('projectId', projectId);
      }
      formData.append('subject', subject.trim());
      formData.append('category', category);
      formData.append('severity', severity);
      formData.append('description', description.trim());
      formData.append('isAnonymous', String(isAnonymous));

      if (!isAnonymous) {
        if (complainantName) formData.append('complainantName', complainantName.trim());
        if (complainantEmail) formData.append('complainantEmail', complainantEmail.trim());
        if (complainantPhone) formData.append('complainantPhone', complainantPhone.trim());
      }

      if (coords) {
        formData.append('latitude', String(coords.lat));
        formData.append('longitude', String(coords.lng));
        if (coords.accuracy) formData.append('locationAccuracy', String(coords.accuracy));
      }

      if (locationAddress) {
        formData.append('locationAddress', locationAddress.trim());
      }

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await complaintApi.createComplaint(formData);

      const selectedProj = projects.find((p) => p.id === projectId);
      setSuccessData({
        trackingId: res.trackingId,
        subject: subject.trim(),
        project: selectedProj?.name,
      });
    } catch (err: any) {
      console.error('Submission failed:', err);
      setSubmitError(
        err.response?.data?.message || 'Failed to submit grievance report. Please verify all details and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyTrackingId = () => {
    if (successData?.trackingId) {
      navigator.clipboard.writeText(successData.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Hidden file inputs for Camera and Gallery */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F223D] bg-gradient-to-r from-[#0F223D] via-[#1A365D] to-[#0A192F] p-6 sm:p-8 text-white shadow-xl border border-slate-700/50">
        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300 tracking-wide uppercase shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            {t('citizen.reportHeroTitle')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white drop-shadow-sm">
            {t('citizen.reportHeroHeading')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
            {t('citizen.reportHeroDesc')}
          </p>

          {/* Saffron White Green Line */}
          <div className="w-28 h-1 rounded-full flex overflow-hidden shadow-xs pt-0.5">
            <div className="w-1/3 bg-[#FF9933]" />
            <div className="w-1/3 bg-white" />
            <div className="w-1/3 bg-[#138808]" />
          </div>
        </div>

        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Success Modal / Card */}
      {successData && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-100">
                {t('citizen.successTitle')}
              </h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                {t('citizen.successDesc')}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('citizen.trackingIdLabel')}
                </span>
                <div className="text-xl font-mono font-black text-[#0F223D] dark:text-white">
                  {successData.trackingId}
                </div>
              </div>
              <button
                onClick={copyTrackingId}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? t('common.copied', 'Copied to Clipboard!') : t('common.copy', 'Copy Reference ID')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">{t('citizen.subject')}:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{successData.subject}</p>
              </div>
              {successData.project && (
                <div>
                  <span className="text-slate-400 font-medium">{t('projects.title')}:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{successData.project}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate(`/citizen?track=${encodeURIComponent(successData.trackingId)}`)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{t('citizen.trackNow')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSuccessData(null);
                setSubject('');
                setDescription('');
                removePhoto();
              }}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {t('citizen.raiseConcern')}
            </button>
          </div>
        </div>
      )}

      {/* Main Report Form */}
      {!successData && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{submitError}</span>
            </div>
          )}

          {/* STEP 1: PHOTO EVIDENCE & CAMERA CAPTURE */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs border border-blue-200 dark:border-blue-800">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('citizen.captureEvidence')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {t('citizen.uploadFilesSub')}
                  </p>
                </div>
              </div>
            </div>

            {photoError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
                {photoError}
              </div>
            )}

            {!photoPreview ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold block">{t('citizen.captureCamera')}</span>
                    <span className="text-[10px] text-slate-500">{t('citizen.captureCameraSub')}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold block">{t('citizen.uploadFiles')}</span>
                    <span className="text-[10px] text-slate-500">{t('citizen.uploadFilesSub')}</span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 group">
                <img
                  src={photoPreview}
                  alt="Captured Evidence Preview"
                  className="w-full h-72 object-contain bg-slate-950"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('common.refresh', 'Retake')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="p-2 rounded-xl bg-rose-600/90 hover:bg-rose-700 backdrop-blur-md text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[11px] font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Photo Evidence Ready ({photoFile ? (photoFile.size / 1024 / 1024).toFixed(2) : ''} MB)</span>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: AUTOMATIC GPS LOCATION & INTERACTIVE PIN MAP */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs border border-blue-200 dark:border-blue-800">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('citizen.incidentLocation')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {t('map.subtitle')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={requestGpsLocation}
                disabled={locationStatus === 'FETCHING'}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <Crosshair className={`w-3.5 h-3.5 ${locationStatus === 'FETCHING' ? 'animate-spin' : ''}`} />
                <span>{locationStatus === 'FETCHING' ? t('common.loading') : t('citizen.detectLocation')}</span>
              </button>
            </div>

            {locationStatus === 'SUCCESS' && coords && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">{t('citizen.coordsDetected')}: </span>
                    <span className="font-mono">{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</span>
                    {coords.accuracy && (
                      <span className="text-[10px] text-emerald-600 ml-2">(±{Math.round(coords.accuracy)}m)</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/80 px-2 py-0.5 rounded font-bold uppercase">
                  {t('citizen.verifiedGps')}
                </span>
              </div>
            )}

            {locationStatus === 'ERROR' && locationError && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{locationError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Interactive Incident Map (Click anywhere on map or drag the blue pin to refine position):</span>
                {coords && <span className="font-semibold text-blue-600">Pin set at {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>}
              </div>
              <ProjectMapComponent
                projects={projects}
                selectedLocation={coords}
                onLocationSelect={handleLocationPick}
                interactivePicker={true}
                height="320px"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Landmark / Specific Location Notes (Optional)
              </label>
              <input
                type="text"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="e.g. Near Pillar 42, Sector 5 Bypass, Opp. Metro Gate 2"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* STEP 3: PROJECT SELECTION & NEAREST MATCHING */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs border border-blue-200 dark:border-blue-800">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('citizen.selectTargetProject')}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {t('citizen.selectProjectDesc', 'Select the associated project or choose general infrastructure if unlisted.')}
                </p>
              </div>
            </div>

            {nearestProject && (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {t('citizen.nearestProjectDetected')} ({nearestProject.distanceKm.toFixed(1)} km)
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {nearestProject.project.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {nearestProject.project.department.name} ({nearestProject.project.department.code})
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setProjectId(nearestProject.project.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    projectId === nearestProject.project.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 text-blue-600'
                  }`}
                >
                  {projectId === nearestProject.project.id ? t('common.selected', 'Selected') : t('citizen.selectNearest', 'Select Nearest Project')}
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('projects.title')}
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">{t('citizen.unlistedProject', 'General Public Infrastructure / Unlisted Project')}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.department.code}] {p.name} — {p.location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP 4: ISSUE DETAILS & CLASSIFICATION */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs border border-blue-200 dark:border-blue-800">
                4
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('citizen.issueClassification', 'Issue Classification & Description')}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {t('citizen.issueClassificationSub', 'Categorize the observed problem and provide concise notes.')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('citizen.grievanceCategory')} *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ROAD_DAMAGE">Road Damage / Potholes / Crater</option>
                  <option value="CONSTRUCTION_DELAY">Construction Inactivity / Delay</option>
                  <option value="DRAINAGE">Drainage / Waterlogging / Leakage</option>
                  <option value="SAFETY">Safety Hazard / Missing Guardrail</option>
                  <option value="QUALITY_DEFECT">Structural Defect / Substandard Quality</option>
                  <option value="ENVIRONMENTAL">Environmental / Pollution / Debris Dumping</option>
                  <option value="CORRUPTION_MISUSE">Corruption / Fund Misuse / Material Theft</option>
                  <option value="OTHER">Other Public Grievance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('citizen.severityAssessment', 'Severity Assessment')}
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="LOW">{t('common.low')} (Minor inconvenience / Non-urgent)</option>
                  <option value="MEDIUM">{t('common.medium')} (Moderate defect / Noticeable delay)</option>
                  <option value="HIGH">{t('common.high')} (Active danger / Major disruption)</option>
                  <option value="CRITICAL">{t('common.critical')} (Life-threatening / Structural Collapse Risk)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('citizen.subject')} *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('citizen.subjectPlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('citizen.detailedDescription')} *
                </label>
                <span className="text-[10px] text-slate-400">{description.length} / 1000 characters</span>
              </div>
              <textarea
                required
                rows={4}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you observed, approximate time of occurrence, safety risks, and impact on traffic or public welfare..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* STEP 5: CONTACT INFORMATION & CITIZEN IDENTITY */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs border border-blue-200 dark:border-blue-800">
                  5
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('citizen.citizenContact', 'Citizen Reporter Contact')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {t('citizen.citizenContactSub', 'Receive SMS and email status updates when vigilance officers act on this report.')}
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('citizen.submitAnonymously')}
                </span>
              </label>
            </div>

            {!isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('citizen.yourName')}
                  </label>
                  <input
                    type="text"
                    value={complainantName}
                    onChange={(e) => setComplainantName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('citizen.yourPhone')}
                  </label>
                  <input
                    type="tel"
                    value={complainantPhone}
                    onChange={(e) => setComplainantPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('citizen.yourEmail')}
                  </label>
                  <input
                    type="email"
                    value={complainantEmail}
                    onChange={(e) => setComplainantEmail(e.target.value)}
                    placeholder="ramesh@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action Bar */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t('common.cancel')}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('citizen.submitting')}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('citizen.submitGrievanceBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
