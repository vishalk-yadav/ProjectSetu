import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  LogOut,
  UserCheck,
  ShieldCheck,
  FolderKanban,
  Building2,
  CheckCircle2,
  X,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { searchApi } from '../../api/reportApi';
import { UserRole } from '../../types';
import { cn } from '../../utils/cn';

interface TopNavProps {
  setMobileOpen: (open: boolean) => void;
  onOpenAIChat: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ setMobileOpen, onOpenAIChat }) => {
  const navigate = useNavigate();
  const { user, logout, quickLogin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Notification dropdown state
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // User menu state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Search execution with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchApi.search(searchQuery.trim());
        setSearchResults(results);
      } catch (e) {
        console.error('Search error', e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40';
      case 'DEPARTMENT_ADMIN':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40';
      case 'PROJECT_MANAGER':
        return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40';
      case 'CITIZEN':
        return 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/40';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white dark:bg-[#0A1220] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-xs transition-colors">
        {/* Left: Mobile Toggle + Mobile Logo, Desktop Surveillance Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile-only Logo */}
          <div className="flex md:hidden items-center gap-2">
            <img
              src="/assets/ashoka-emblem.png"
              alt="State Emblem of India"
              className="h-8 w-auto object-contain"
            />
            <span className="text-sm font-extrabold tracking-tight text-[#0F223D] dark:text-white">
              Project<span className="text-[#1A73E8]">Setu</span>
            </span>
          </div>

          {/* Desktop Government Surveillance Telemetry Chip */}
          <div className="hidden md:flex items-center gap-2">
            <div className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[11px] font-bold text-[#0F223D] dark:text-slate-200 tracking-tight">
                National Governance Surveillance Network
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/60 uppercase">
                GOVT OF INDIA
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-4 lg:mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects, departments, officers, locations..."
              value={searchQuery}
              onFocus={() => setShowSearchModal(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-14 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-xs"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center">
              <span className="text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                Ctrl /
              </span>
            </div>
          </div>
        </div>

        {/* Right: Notifications + Theme + Digital India + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Center Trigger & Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#0F223D]">Smart Alerts</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          'p-4 transition-colors cursor-pointer hover:bg-slate-50 text-left',
                          !n.isRead && 'bg-blue-50/50 border-l-2 border-blue-500'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <span
                            className={cn(
                              'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider',
                              n.severity === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-700'
                                : n.severity === 'HIGH'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            )}
                          >
                            {n.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
                  <button
                    onClick={() => {
                      setShowNotifs(false);
                      navigate('/notifications');
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Icon (Moon / Sun) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Digital India Flag Banner */}
          <div className="hidden xl:flex items-center gap-2 pl-1 border-l border-slate-200">
            <div className="w-7 h-4 rounded-[3px] border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
              <div className="h-1/3 bg-[#FF9933]" />
              <div className="h-1/3 bg-white flex items-center justify-center">
                <div className="w-1 h-1 rounded-full border-[0.5px] border-[#000080]" />
              </div>
              <div className="h-1/3 bg-[#138808]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold text-[#0F223D] leading-tight">
                Digital India
              </span>
              <span className="text-[9px] text-slate-500 leading-none">
                for a Stronger Tomorrow
              </span>
            </div>
          </div>

          {/* User Profile & Demo Role Switcher Chip */}
          <div className="relative pl-1 sm:pl-2" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-2xl hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm overflow-hidden">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[150px]">
                  {user?.name || 'Dr. Arvind Subramanian'}
                </p>
                <div className="mt-0.5">
                  <span className="text-[9px] px-2 py-0.2 rounded-full font-extrabold uppercase tracking-wide bg-[#8B5CF6] text-white">
                    {user?.role?.replace('_', ' ') || 'SUPER ADMIN'}
                  </span>
                </div>
              </div>
              <svg className="w-3.5 h-3.5 text-slate-400 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* User Profile & Role Switcher Popover */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="p-4 border-b border-slate-100 bg-slate-50/60">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#8B5CF6] text-white">
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* 1-Click Role Switcher for Hackathon Testing */}
                <div className="p-3 border-b border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    ⚡ 1-Click Role Switcher (SIH Demo)
                  </p>
                  <div className="space-y-1">
                    {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={async () => {
                          await quickLogin(r);
                          setShowUserMenu(false);
                        }}
                        className={cn(
                          'w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer',
                          user?.role === r
                            ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        )}
                      >
                        <span className="truncate">{DEMO_USERS[r].label}</span>
                        {user?.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logout */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Results Modal */}
      {showSearchModal && searchQuery.trim().length > 0 && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[75vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-5 h-5 text-blue-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type to search projects, ministries, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
                />
              </div>
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {isSearching ? (
                <div className="p-8 text-center text-slate-400 text-xs">Searching database...</div>
              ) : searchResults ? (
                <>
                  {/* Projects Results */}
                  {searchResults.projects?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                        <FolderKanban className="w-3.5 h-3.5 text-blue-400" /> Projects ({searchResults.projects.length})
                      </p>
                      <div className="space-y-1.5">
                        {searchResults.projects.map((p: any) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setShowSearchModal(false);
                              setSearchQuery('');
                              navigate(`/projects/${p.id}`);
                            }}
                            className="p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div>
                              <p className="text-xs font-bold text-white">{p.name}</p>
                              <p className="text-[11px] text-slate-400">{p.department?.name} • {p.location}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Departments Results */}
                  {searchResults.departments?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" /> Departments ({searchResults.departments.length})
                      </p>
                      <div className="space-y-1.5">
                        {searchResults.departments.map((d: any) => (
                          <div
                            key={d.id}
                            onClick={() => {
                              setShowSearchModal(false);
                              setSearchQuery('');
                              navigate('/departments');
                            }}
                            className="p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div>
                              <p className="text-xs font-bold text-white">{d.name} ({d.code})</p>
                              <p className="text-[11px] text-slate-400">{d.departmentHead}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.projects?.length === 0 && searchResults.departments?.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No matching projects or departments found.
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
