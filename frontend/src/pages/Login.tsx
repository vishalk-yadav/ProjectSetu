import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
  Landmark,
  Users,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, quickLogin, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSSOModal, setShowSSOModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your official email or mobile number, and password.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.code === 'ACCOUNT_UNVERIFIED' || err.response?.data?.requiresOtp) {
        navigate('/verify-otp', {
          state: {
            mobileNumber: err.response?.data?.mobileNumber,
            isMock: true,
            mockOtp: '123456',
            cooldownSeconds: 45,
          },
        });
        return;
      }
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setError(null);
    setSubmitting(true);
    try {
      await quickLogin(role);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to authenticate persona');
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Admin@123');
    setShowSSOModal(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#EBF0F5] flex items-center justify-center p-0 lg:p-4 select-none font-sans overflow-x-hidden">
      {/* ----------------- DESKTOP MASTER COMPOSITION (Pure HTML / CSS / SVG) ----------------- */}
      <div className="hidden lg:block relative w-full max-w-[1440px] aspect-[1024/535] bg-gradient-to-b from-[#F8FAFC] via-[#F2F5F9] to-[#E8EDF3] shadow-2xl rounded-2xl overflow-hidden border border-slate-200/60">
        
        {/* 1. TOP NAVIGATION HEADER (Pure Real HTML & Crisp Vector Assets) */}
        <header className="absolute top-0 inset-x-0 h-[62px] px-8 xl:px-10 flex items-center justify-between z-30 pointer-events-auto">
          {/* Left: Emblem of India + Government of India */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/emblem-of-india.svg"
              alt="National Emblem of India"
              className="h-9 w-auto max-w-[28px] object-contain drop-shadow-2xs shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#0F223D] tracking-tight leading-tight">
                Government of India
              </span>
              <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                सत्यमेव जयते
              </span>
            </div>
          </div>

          {/* Center: Mission Pillars Tracked Text */}
          <div className="text-[10.5px] xl:text-[11px] font-bold text-slate-400 tracking-[0.28em] uppercase select-none">
            PEOPLE <span className="mx-2 text-slate-300 font-normal">|</span> PROJECTS{' '}
            <span className="mx-2 text-slate-300 font-normal">|</span> PROGRESS{' '}
            <span className="mx-2 text-slate-300 font-normal">|</span> TOGETHER
          </div>

          {/* Right: Tiranga Flag + Digital India */}
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/flag-of-india.svg"
              alt="Indian National Flag"
              className="w-7 h-auto rounded-[2px] shadow-2xs border border-slate-200/80"
            />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#0F223D] tracking-tight leading-tight">
                Digital India
              </span>
              <span className="text-[9.5px] text-slate-500 font-medium leading-tight mt-0.5">
                for a Stronger Tomorrow
              </span>
            </div>
          </div>
        </header>

        {/* 2. PHOTOGRAPHIC LANDSCAPE (Rashtrapati Bhavan, Kartavya Path, Sunset, Tricolor Ribbon) */}
        <img
          src="/assets/rashtrapati-bhavan-pure.png"
          alt="Central Vista Rashtrapati Bhavan"
          className="absolute left-0 bottom-0 w-full h-[51.4%] object-cover object-left-bottom pointer-events-none z-0"
        />

        {/* 3. CENTER INDIA MAP WATERMARK (Pure Scalable Vector Outline) */}
        <div className="absolute left-[36%] top-[9%] w-[26%] h-[54%] pointer-events-none z-1 opacity-[0.16] flex items-center justify-center">
          <img
            src="/assets/india-map.svg"
            alt="India Vector Map"
            className="w-full h-full object-contain filter grayscale contrast-125"
          />
        </div>

        {/* 4. CENTER LIFECYCLE TIMELINE (Real HTML & Glowing Nodes) */}
        <div className="absolute left-[45.2%] top-[24%] z-10 flex flex-col gap-2.5 xl:gap-3">
          <div className="absolute left-[3px] top-1 bottom-1 w-[1px] bg-slate-300/60" />
          {['MONITOR', 'ANALYZE', 'COORDINATE', 'RESOLVE', 'DELIVER'].map((step) => (
            <div key={step} className="flex items-center gap-2 relative z-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)] ring-1.5 ring-white" />
              <span className="text-[9.5px] xl:text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* 5. LEFT HERO BRANDING SECTION (Pure Real HTML & Vector SVG Icons) */}
        <div className="absolute left-8 xl:left-10 top-[70px] z-20 max-w-[42%] pointer-events-auto">
          {/* Tricolor Pill */}
          <div className="w-20 h-1.5 rounded-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] border border-slate-200/50 shadow-2xs mb-3.5" />

          {/* Title */}
          <h1 className="text-4xl xl:text-[46px] 2xl:text-[50px] font-black tracking-tight leading-none">
            <span className="text-[#0F223D]">Project</span>
            <span className="text-[#1A73E8]">Setu</span>
          </h1>

          {/* Slogan */}
          <p className="text-[11px] xl:text-[11.5px] font-extrabold tracking-[0.18em] text-slate-800 uppercase mt-2.5">
            CONNECTING DEPARTMENTS. CONNECTING PROJECTS.
          </p>

          {/* Description */}
          <p className="text-xs xl:text-[13px] text-slate-600 mt-1 font-medium leading-relaxed max-w-sm xl:max-w-md">
            An Integrated Government Project Monitoring &amp; Decision Support Platform
          </p>

          {/* 4 Feature Badges (HTML Row with Vector Icons & Dividers) */}
          <div className="mt-4 xl:mt-5 flex items-stretch bg-white/85 backdrop-blur-xs p-2 xl:p-2.5 rounded-2xl border border-slate-200/90 shadow-xs divide-x divide-slate-200/80 max-w-fit">
            {/* 1. Unified Governance */}
            <div className="flex flex-col items-center px-2 xl:px-3 text-center">
              <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mb-1.5">
                <Landmark className="w-4 h-4 xl:w-4.5 xl:h-4.5" />
              </div>
              <span className="text-[9.5px] xl:text-[10px] font-bold text-slate-700 leading-tight">
                Unified<br />Governance
              </span>
            </div>

            {/* 2. Better Collaboration */}
            <div className="flex flex-col items-center px-2 xl:px-3 text-center">
              <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
                <Users className="w-4 h-4 xl:w-4.5 xl:h-4.5" />
              </div>
              <span className="text-[9.5px] xl:text-[10px] font-bold text-slate-700 leading-tight">
                Better<br />Collaboration
              </span>
            </div>

            {/* 3. Faster Execution */}
            <div className="flex flex-col items-center px-2 xl:px-3 text-center">
              <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-1.5">
                <BarChart3 className="w-4 h-4 xl:w-4.5 xl:h-4.5" />
              </div>
              <span className="text-[9.5px] xl:text-[10px] font-bold text-slate-700 leading-tight">
                Faster<br />Execution
              </span>
            </div>

            {/* 4. Transparent Progress */}
            <div className="flex flex-col items-center px-2 xl:px-3 text-center">
              <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mb-1.5">
                <ShieldCheck className="w-4 h-4 xl:w-4.5 xl:h-4.5" />
              </div>
              <span className="text-[9.5px] xl:text-[10px] font-bold text-slate-700 leading-tight">
                Transparent<br />Progress
              </span>
            </div>
          </div>

          {/* National Quote (Over Sunset Sky) */}
          <div className="mt-5 xl:mt-6 ml-0.5">
            <p className="font-serif italic font-bold text-lg xl:text-xl text-slate-800 tracking-tight leading-tight">
              “Sashakt Prashasan, Samriddh Bharat”
            </p>
            {/* Tricolor underline accent */}
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#FF9933] via-[#CBD5E1] to-[#138808] mt-1.5 shadow-2xs" />
          </div>
        </div>

        {/* 6. BOTTOM-LEFT ROAD BANNER (Real HTML over the dark road) */}
        <div className="absolute left-8 xl:left-10 bottom-3.5 xl:bottom-4 z-20 pointer-events-none">
          <div className="inline-flex flex-col">
            <span className="text-[10px] xl:text-[10.5px] font-extrabold text-white/90 tracking-[0.26em] uppercase">
              DEVELOPED FOR A DEVELOPED INDIA
            </span>
            <div className="w-44 h-[1px] bg-white/30 mt-1" />
          </div>
        </div>

        {/* 7. Interactive Living Login Card positioned seamlessly on the right */}
        <div
          className="absolute z-30"
          style={{
            left: '63.4%',
            top: '9.8%',
            width: '34.2%',
            height: '87%',
          }}
        >
          <div className="w-full h-full bg-white rounded-[26px] shadow-[0_20px_50px_rgba(15,34,61,0.14)] border border-slate-100 flex flex-col justify-between p-6 xl:p-7 relative">
            {/* Card Header: Classical Building Icon + Title + Subtitle */}
            <div className="flex flex-col items-center text-center">
              {/* Pillar Building Emblem with Tricolor Base Accent */}
              <div className="flex flex-col items-center mb-1.5">
                <svg
                  className="w-8 h-8 text-[#0F223D]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L2 7v2h20V7L12 2zm-8 7v10h2V9H4zm5 0v10h2V9H9zm5 0v10h2V9h-2zm5 0v10h2V9h-2zM2 20v2h20v-2H2z" />
                </svg>
                {/* Tricolor Accent Base */}
                <div className="w-9 h-1 rounded-full flex overflow-hidden mt-0.5 shadow-2xs">
                  <div className="w-1/3 bg-[#FF9933]" />
                  <div className="w-1/3 bg-white border-y border-slate-200" />
                  <div className="w-1/3 bg-[#138808]" />
                </div>
              </div>

              <h2 className="text-xl xl:text-2xl font-black text-[#0F223D] tracking-tight leading-tight">
                ProjectSetu
              </h2>
              <p className="text-[9.5px] font-black tracking-[0.24em] text-slate-500 uppercase mt-0.5">
                OFFICIAL ACCESS
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                Government Project Monitoring Platform
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="my-1 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center justify-between">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-rose-500 hover:text-rose-700 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-3" onSubmit={handleSubmit}>
              {/* Email or Mobile */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Official Email or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="officer@nic.in or 9876543210"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50/90 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-slate-50/90 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & SSO Link */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="font-medium text-slate-700">Remember session</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowSSOModal(true)}
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  NIC Single Sign-On (SSO)
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={submitting || isLoading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#0F223D] hover:bg-[#18345C] focus:outline-none shadow-md shadow-[#0F223D]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Citizen Registration Link */}
              <div className="text-center pt-0.5 text-[11px] text-slate-500">
                Are you a citizen?{' '}
                <Link
                  to="/signup"
                  className="font-bold text-[#1A73E8] hover:underline inline-flex items-center gap-0.5"
                >
                  Create Citizen Account <ArrowRight className="w-3 h-3 inline" />
                </Link>
              </div>
            </form>

            {/* Divider OR */}
            <div className="relative my-0.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[9px] uppercase font-bold text-slate-400">
                <span className="bg-white px-2.5">OR</span>
              </div>
            </div>

            {/* Government SSO Button */}
            <button
              type="button"
              onClick={() => setShowSSOModal(true)}
              className="w-full py-2 px-3.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50/80 hover:bg-slate-100 border border-slate-200 shadow-2xs flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <img
                src="/assets/emblem-of-india.svg"
                alt="Emblem"
                className="h-4.5 w-auto max-w-[18px] object-contain shrink-0"
              />
              <span className="text-slate-800">Login with Government SSO</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-auto" />
            </button>

            {/* Security Trust Notice */}
            <div className="p-2.5 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs shadow-blue-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#1E40AF] leading-tight">
                  Secure. Trusted. For a Stronger India.
                </span>
                <span className="text-[9.5px] text-slate-500 leading-tight mt-0.5">
                  This system is for authorized government users only.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- MOBILE / TABLET ADAPTIVE FALLBACK ----------------- */}
      <div className="lg:hidden w-full max-w-md mx-auto p-4 flex flex-col items-center">
        {/* Mobile Header */}
        <div className="w-full flex items-center justify-between py-3 mb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <img src="/assets/emblem-of-india.svg" alt="Emblem" className="h-9 w-auto object-contain" />
            <div>
              <span className="block text-xs font-bold text-[#0F223D]">Government of India</span>
              <span className="block text-[10px] text-slate-500">सत्यमेव जयते</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded-[2px] border border-slate-200 flex flex-col overflow-hidden">
              <div className="h-1/3 bg-[#FF9933]" />
              <div className="h-1/3 bg-white" />
              <div className="h-1/3 bg-[#138808]" />
            </div>
            <span className="text-xs font-bold text-[#0F223D]">Digital India</span>
          </div>
        </div>

        {/* Mobile Card */}
        <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center mb-2 relative overflow-hidden">
              <svg className="w-7 h-7 text-[#0F223D]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v2h20V7L12 2zm-8 7v10h2V9H4zm5 0v10h2V9H9zm5 0v10h2V9h-2zm5 0v10h2V9h-2zM2 20v2h20v-2H2z" />
              </svg>
              <div className="absolute bottom-0 inset-x-0 h-1 flex">
                <div className="w-1/3 bg-[#FF9933]" />
                <div className="w-1/3 bg-white border-y border-slate-200" />
                <div className="w-1/3 bg-[#138808]" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-[#0F223D]">ProjectSetu</h2>
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mt-0.5">
              OFFICIAL ACCESS
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Government Project Monitoring Platform</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="officer@nic.in or 9876543210"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span>Remember session</span>
              </label>
              <button
                type="button"
                onClick={() => setShowSSOModal(true)}
                className="font-semibold text-blue-600 hover:underline"
              >
                NIC SSO
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0F223D] hover:bg-[#18345C] shadow-md flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Mobile Citizen Registration Link */}
            <div className="text-center pt-1 text-xs text-slate-500">
              Are you a citizen?{' '}
              <Link
                to="/signup"
                className="font-bold text-[#1A73E8] hover:underline inline-flex items-center gap-0.5"
              >
                Create Citizen Account <ArrowRight className="w-3.5 h-3.5 inline" />
              </Link>
            </div>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
              <span className="bg-white px-3">OR</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSSOModal(true)}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs flex items-center gap-2.5"
          >
            <img src="/assets/emblem-of-india.svg" alt="Emblem" className="h-4.5 w-auto max-w-[18px] object-contain shrink-0" />
            <span>Login with Government SSO</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-auto" />
          </button>
        </div>
      </div>

      {/* ----------------- SSO / 1-CLICK DEMO PERSONA MODAL ----------------- */}
      {showSSOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/emblem-of-india.svg"
                  alt="Emblem"
                  className="h-6 w-auto max-w-[24px] object-contain shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-[#0F223D]">
                    Government Single Sign-On (SSO / Jan Parichay)
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Select an official verified persona to authenticate immediately
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSSOModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Persona Cards */}
            <div className="p-6 space-y-2.5">
              {/* 1. Super Admin */}
              <div
                onClick={() => handleQuickLogin('SUPER_ADMIN')}
                className="p-3.5 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-purple-600/20">
                    SA
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-purple-900">
                        Dr. Arvind Subramanian
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-200 text-purple-800">
                        SUPER ADMIN
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      admin@projectsetu.gov.in • Cross-Ministry Full Authority
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* 2. Dept Admin MoRTH */}
              <div
                onClick={() => handleQuickLogin('DEPARTMENT_ADMIN')}
                className="p-3.5 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-600/20">
                    DA
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                        Sunita Meena, JS (Highways)
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-200 text-blue-800">
                        DEPT ADMIN
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      morth.admin@projectsetu.gov.in • Ministry of Road Transport & Highways
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* 3. Project Manager */}
              <div
                onClick={() => handleQuickLogin('PROJECT_MANAGER')}
                className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-amber-600/20">
                    PM
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-amber-900">
                        Rajesh Sharma
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200 text-amber-800">
                        PROJECT MANAGER
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      pm.sharma@projectsetu.gov.in • Delhi-Mumbai Expressway Project Head
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* 4. Citizen */}
              <div
                onClick={() => handleQuickLogin('CITIZEN')}
                className="p-3.5 rounded-2xl border border-cyan-200 bg-cyan-50/50 hover:bg-cyan-100/70 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-cyan-600/20">
                    CZ
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-cyan-900">
                        Arun Sharma
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-200 text-cyan-800">
                        CITIZEN PORTAL
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      citizen@projectsetu.gov.in • Public Monitoring & Grievance Tracking
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-cyan-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>
                Password for all accounts is: <strong>Admin@123</strong>
              </span>
              <button
                type="button"
                onClick={() => fillCredentials('admin@projectsetu.gov.in')}
                className="font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Auto-fill Super Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

