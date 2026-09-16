import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  FileText,
  Building2,
  Flag,
  IndianRupee,
  ShieldCheck,
  Sparkles,
  MapPin,
  BarChart3,
  Files,
  Bell,
  Settings,
  AlertOctagon,
  ChevronsLeft,
  ChevronRight,
  Users,
  CheckSquare,
  History,
  Globe,
  Sliders,
  Camera,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { unreadCount } = useNotifications();
  const { user, isSuperAdmin, isDeptAdmin, isProjectManager, isCitizen } = useAuth();

  // Role-specific navigation items tailored to the reference architecture
  const getNavigationItems = () => {
    if (isCitizen) {
      return [
        { label: 'Citizen Portal', path: '/citizen', icon: Globe, badge: 'PUBLIC' },
        { label: 'Report Project Issue', path: '/report-issue', icon: Camera, badge: 'GPS' },
        { label: 'Public Projects', path: '/projects', icon: FileText },
        { label: 'Project Map GIS', path: '/map', icon: MapPin },
        { label: 'Public Documents', path: '/documents', icon: Files },
        { label: 'Track Grievances', path: '/complaints', icon: AlertOctagon },
        { label: 'Notifications', path: '/notifications', icon: Bell, count: unreadCount },
      ];
    }

    if (isProjectManager) {
      return [
        { label: 'PM Workspace', path: '/', icon: LayoutGrid },
        { label: 'My Projects', path: '/projects', icon: FileText },
        { label: 'Milestones & Gantt', path: '/milestones', icon: Flag },
        { label: 'Budget & Expenses', path: '/budget', icon: IndianRupee },
        { label: 'Approvals Submitted', path: '/approvals', icon: CheckSquare },
        { label: 'Risk & Delay Alerts', path: '/risks', icon: ShieldCheck },
        { label: 'Documents Hub', path: '/documents', icon: Files },
        { label: 'Citizen Grievances', path: '/complaints', icon: AlertOctagon },
        { label: 'Project Map GIS', path: '/map', icon: MapPin },
        { label: 'Notifications', path: '/notifications', icon: Bell, count: unreadCount },
      ];
    }

    if (isDeptAdmin) {
      return [
        { label: 'Dept Dashboard', path: '/', icon: LayoutGrid },
        { label: 'Dept Projects', path: '/projects', icon: FileText },
        { label: 'Approval Center', path: '/approvals', icon: CheckSquare, badge: 'ACTION' },
        { label: 'Dept Users & PMs', path: '/users', icon: Users },
        { label: 'Milestone Tracking', path: '/milestones', icon: Flag },
        { label: 'Budget Surveillance', path: '/budget', icon: IndianRupee },
        { label: 'Risk & Alerts', path: '/risks', icon: ShieldCheck },
        { label: 'Dept Analytics & Reports', path: '/reports', icon: BarChart3 },
        { label: 'Dept Documents', path: '/documents', icon: Files },
        { label: 'Complaints / Vigilance', path: '/complaints', icon: AlertOctagon },
        { label: 'Project Map GIS', path: '/map', icon: MapPin },
        { label: 'Notifications', path: '/notifications', icon: Bell, count: unreadCount },
      ];
    }

    // Default: Super Admin (Full Control)
    return [
      { label: 'Executive Command', path: '/', icon: LayoutGrid },
      { label: 'All Projects', path: '/projects', icon: FileText },
      { label: 'Departments & Roles', path: '/departments', icon: Building2 },
      { label: 'User Management', path: '/users', icon: Users, badge: 'ADMIN' },
      { label: 'Approval Center', path: '/approvals', icon: CheckSquare },
      { label: 'System Audit Logs', path: '/audit-logs', icon: History },
      { label: 'Milestones', path: '/milestones', icon: Flag },
      { label: 'Budget Surveillance', path: '/budget', icon: IndianRupee },
      { label: 'Risk Intelligence', path: '/risks', icon: ShieldCheck },
      { label: 'AI Insights', path: '/ai-insights', icon: Sparkles, badge: 'NEW' },
      { label: 'Project Map GIS', path: '/map', icon: MapPin },
      { label: 'Reports & Briefs', path: '/reports', icon: BarChart3 },
      { label: 'Platform Grievances', path: '/complaints', icon: AlertOctagon },
      { label: 'Documents Repository', path: '/documents', icon: Files },
      { label: 'System Settings', path: '/settings', icon: Sliders },
      { label: 'Notifications', path: '/notifications', icon: Bell, count: unreadCount },
    ];
  };

  const navigationItems = getNavigationItems();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0A1220] border-r border-slate-200/80 dark:border-slate-800 select-none shadow-xs">
      {/* Top Header Section */}
      <div className="p-3.5 pb-1.5">
        {!collapsed ? (
          <div>
            <div className="flex items-start justify-between gap-2">
              {/* Ashoka Lion Emblem + Title + Tagline */}
              <div className="flex items-start gap-2.5">
                <img
                  src="/assets/ashoka-emblem.png"
                  alt="State Emblem of India"
                  className="h-10 w-auto object-contain shrink-0 mt-0.5"
                />
                <div className="flex flex-col">
                  <div className="flex items-center text-base font-black tracking-tight leading-none">
                    <span className="text-[#0F223D] dark:text-white">Project</span>
                    <span className="text-[#1A73E8]">Setu</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-tight mt-0.5">
                    Connecting Departments.
                  </span>
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-tight">
                    Connecting Projects.
                  </span>
                </div>
              </div>

              {/* Collapse Button << */}
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer shadow-2xs shrink-0 ml-auto"
                title="Collapse sidebar"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Saffron, White, Green Tricolor Line */}
            <div className="w-24 h-1 rounded-full flex overflow-hidden mt-2.5 mb-1 shadow-2xs">
              <div className="w-1/3 bg-[#FF9933]" />
              <div className="w-1/3 bg-white border-y border-slate-200 dark:border-slate-700" />
              <div className="w-1/3 bg-[#138808]" />
            </div>

            {/* Government Project Monitoring Platform Subtitle */}
            <p className="text-[8.5px] font-extrabold tracking-[0.16em] text-slate-400 dark:text-slate-500 uppercase leading-tight">
              Government Project Monitoring Platform
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5">
            <img
              src="/assets/ashoka-emblem.png"
              alt="Emblem"
              className="h-8 w-auto object-contain"
            />
            <button
              onClick={() => setCollapsed(false)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shadow-2xs"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="w-8 h-1 rounded-full flex overflow-hidden shadow-2xs">
              <div className="w-1/3 bg-[#FF9933]" />
              <div className="w-1/3 bg-white" />
              <div className="w-1/3 bg-[#138808]" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-2.5 py-1 space-y-0.5 overflow-y-auto sidebar-scroll">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all group relative',
                  isActive
                    ? 'bg-[#EBF3FE] dark:bg-blue-950/50 text-[#1A73E8] dark:text-blue-400 font-bold shadow-2xs'
                    : 'text-[#0F223D] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#1A73E8] dark:hover:text-white'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  {/* Left vivid blue indicator bar for active item */}
                  {isActive && (
                    <div className="absolute left-0 top-1 bottom-1 w-1 rounded-r-md bg-[#1A73E8]" />
                  )}

                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive
                          ? 'text-[#1A73E8] dark:text-blue-400'
                          : 'text-[#0F223D] dark:text-slate-300 group-hover:text-[#1A73E8] dark:group-hover:text-blue-400'
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate font-semibold text-[11.5px]">{item.label}</span>
                    )}
                  </div>

                  {/* Right side items: Badges & Chevron */}
                  {!collapsed && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-full text-[8.5px] font-black bg-[#F59E0B] text-slate-950 uppercase tracking-tight shadow-2xs">
                          {item.badge}
                        </span>
                      )}
                      {!!item.count && item.count > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-[#EF4444] text-white flex items-center justify-center shadow-xs shrink-0">
                          {item.count}
                        </span>
                      )}
                      <ChevronRight
                        className={cn(
                          'w-3.5 h-3.5 transition-colors',
                          isActive
                            ? 'text-[#1A73E8] dark:text-blue-400'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400'
                        )}
                      />
                    </div>
                  )}

                  {/* Collapsed dot badge for count */}
                  {collapsed && !!item.count && item.count > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Section: Secure Card + Viksit Bharat Graphic */}
      <div className="shrink-0 mt-auto">
        {!collapsed ? (
          <>
            {/* Secure. Trusted. Official. Card */}
            <div className="mx-2.5 my-1 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between gap-2 transition-all">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold text-[#0F223D] dark:text-slate-100 leading-tight truncate">
                    Secure. Trusted. Official.
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5 truncate">
                    For Authorized Users Only.
                  </span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>

            {/* Viksit Bharat Graphic Banner with India Gate, Parliament & India map */}
            <div className="px-2.5 pb-1.5 pt-0.5 flex flex-col items-center">
              <img
                src="/assets/sidebar-footer-clean.png"
                alt="Viksit Bharat - Collaborative Governance"
                className="max-h-20 w-auto object-contain rounded-lg"
              />
            </div>
          </>
        ) : (
          <div className="p-2 flex flex-col items-center">
            <div className="w-8 h-1 rounded-full flex overflow-hidden shadow-2xs">
              <div className="w-1/3 bg-[#FF9933]" />
              <div className="w-1/3 bg-white" />
              <div className="w-1/3 bg-[#138808]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Static Fixed Column */}
      <aside
        className={cn(
          'hidden md:block transition-[width] duration-200 ease-in-out shrink-0 h-screen z-30 select-none',
          collapsed ? 'w-20' : 'w-[270px]'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

