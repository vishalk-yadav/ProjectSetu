import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Filter, Layers, AlertTriangle, ShieldCheck, Eye } from 'lucide-react';
import { projectApi } from '../api/projectApi';
import { departmentApi } from '../api/departmentApi';
import { complaintApi } from '../api/complaintApi';
import { Project, Department, Complaint } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ProjectMapComponent } from '../components/map/ProjectMapComponent';

export const ProjectMapPage: React.FC = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [grievances, setGrievances] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Layer Toggle
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'PROJECTS' | 'GRIEVANCES'>('ALL');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    Promise.all([
      projectApi.listProjects({ limit: 100 }),
      departmentApi.listDepartments(),
      complaintApi.getMapMarkers(),
    ])
      .then(([pRes, dRes, gRes]) => {
        setProjects(pRes.data || []);
        setDepartments(dRes);
        setGrievances(gRes || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredProjects = projects.filter((p) => {
    if (activeLayer === 'GRIEVANCES') return false;
    if (selectedDept && p.departmentId !== selectedDept) return false;
    if (selectedRisk) {
      if (selectedRisk === 'HIGH' && p.riskScore < 61) return false;
      if (selectedRisk === 'MODERATE' && (p.riskScore <= 30 || p.riskScore > 60)) return false;
      if (selectedRisk === 'LOW' && p.riskScore > 30) return false;
    }
    return true;
  });

  const filteredGrievances = grievances.filter((g) => {
    if (activeLayer === 'PROJECTS') return false;
    if (selectedCategory && g.category !== selectedCategory) return false;
    return true;
  });

  if (loading) {
    return <LoadingSpinner message="Calibrating spatial GIS telemetry & satellite maps..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0F223D] dark:text-white font-heading tracking-tight">
              {t('map.title')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
              ALL-INDIA GIS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('map.subtitle')}
          </p>
        </div>

        {/* Layer Switcher & Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layer Pills */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setActiveLayer('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeLayer === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t('common.all')} ({projects.length + grievances.length})
            </button>
            <button
              onClick={() => setActiveLayer('PROJECTS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeLayer === 'PROJECTS'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t('nav.projects')} ({projects.length})
            </button>
            <button
              onClick={() => setActiveLayer('GRIEVANCES')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeLayer === 'GRIEVANCES'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t('nav.complaints')} ({grievances.length})
            </button>
          </div>

          {activeLayer !== 'GRIEVANCES' && (
            <>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500 shadow-2xs"
              >
                <option value="">{t('departments.allMinistries')} ({departments.length})</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                ))}
              </select>

              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500 shadow-2xs"
              >
                <option value="">{t('common.all')} {t('departments.riskRating')}</option>
                <option value="HIGH">{t('common.high')} / {t('common.critical')}</option>
                <option value="MODERATE">{t('common.medium')}</option>
                <option value="LOW">{t('common.low')}</option>
              </select>
            </>
          )}

          {activeLayer !== 'PROJECTS' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="">All Issue Categories</option>
              <option value="ROAD_DAMAGE">Road Damage / Potholes</option>
              <option value="CONSTRUCTION_DELAY">Construction Delay</option>
              <option value="DRAINAGE">Drainage / Waterlogging</option>
              <option value="SAFETY">Safety Hazard</option>
              <option value="CORRUPTION_MISUSE">Corruption / Financial</option>
              <option value="ENVIRONMENTAL">Environmental / Pollution</option>
            </select>
          )}
        </div>
      </div>

      {/* Map Component */}
      <ProjectMapComponent
        projects={filteredProjects}
        grievances={filteredGrievances}
        height="580px"
      />

      {/* Legend & Summary Info */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-[#0F223D] dark:text-white">{t('map.legendTitle')}:</span>
          
          <div className="flex items-center gap-3 border-r border-slate-200 dark:border-slate-800 pr-4">
            <span className="text-slate-500 font-bold uppercase text-[10px]">{t('nav.projects')} (Circles):</span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-2xs" /> {t('common.low')}
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-2xs" /> {t('common.medium')}
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-2xs" /> {t('common.critical')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-bold uppercase text-[10px]">{t('nav.complaints')} (Diamonds):</span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-600 rotate-45 inline-block" /> {t('common.critical')}
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 rotate-45 inline-block" /> {t('common.high')} / {t('common.medium')}
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 rotate-45 inline-block" /> {t('common.completed')}
            </span>
          </div>
        </div>

        <span className="text-slate-500 dark:text-slate-400 font-medium">
          Showing <strong className="text-slate-800 dark:text-slate-200">{filteredProjects.length}</strong> {t('nav.projects')} & <strong className="text-slate-800 dark:text-slate-200">{filteredGrievances.length}</strong> {t('nav.complaints')}
        </span>
      </div>
    </div>
  );
};
