import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Shield,
  ShieldAlert,
  MapPin,
  Bell,
  Users,
  Check,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { authApi } from '../api/authApi';

export const CitizenSignup: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live password validation checks
  const passwordChecks = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  }, [password]);

  const isPasswordValid =
    passwordChecks.minLength &&
    passwordChecks.hasUpper &&
    passwordChecks.hasLower &&
    passwordChecks.hasNumber &&
    passwordChecks.hasSpecial;

  const isMobileValid = /^[6-9]\d{9}$/.test(mobileNumber.trim());
  const isConfirmMatching = confirmPassword.length > 0 && password === confirmPassword;
  const isFormValid =
    fullName.trim().length >= 2 &&
    isMobileValid &&
    isPasswordValid &&
    isConfirmMatching &&
    agreeTerms;

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept numeric input and max 10 digits
    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      if (!fullName.trim()) setError('Please enter your full name.');
      else if (!isMobileValid) setError('Please enter a valid 10-digit Indian mobile number.');
      else if (!isPasswordValid) setError('Please fulfill all password requirements.');
      else if (!isConfirmMatching) setError('Passwords do not match.');
      else if (!agreeTerms) setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const formattedMobile = `+91${mobileNumber.trim()}`;
      const res = await authApi.registerCitizen({
        fullName: fullName.trim(),
        mobileNumber: formattedMobile,
        password,
      });

      // Navigate to OTP verification screen with registration state
      navigate('/verify-otp', {
        state: {
          mobileNumber: formattedMobile,
          fullName: fullName.trim(),
          isMock: res.isMock ?? true,
          mockOtp: res.mockOtp || '123456',
          cooldownSeconds: res.cooldownSeconds || 45,
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F0F4F9] flex flex-col justify-between select-none font-sans overflow-x-hidden relative">
      {/* ----------------- TOP NAVBAR: GLOBAL "ALREADY HAVE AN ACCOUNT? LOGIN" ----------------- */}
      <header className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 py-5 flex items-center justify-between z-30">
        {/* Mobile branding fallback */}
        <div className="lg:hidden flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF9933] via-white to-[#138808] p-[1.5px] shadow-xs">
            <div className="w-full h-full bg-white rounded-[7px] flex items-center justify-center">
              <span className="text-[#1A73E8] font-black text-xs">PS</span>
            </div>
          </div>
          <span className="font-heading font-black text-lg text-[#0F223D] tracking-tight">
            ProjectSetu
          </span>
        </div>

        <div className="ml-auto">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#1A73E8] transition-colors group py-1.5 px-3 rounded-xl hover:bg-white/60"
          >
            <span>Already have an account?</span>
            <span className="text-[#1A73E8] font-bold group-hover:underline flex items-center gap-1">
              Login <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </header>

      {/* ----------------- MAIN MASTER CONTAINER ----------------- */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-8 xl:px-12 py-2 sm:py-6 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-14 items-center">
          
          {/* ========================================================================= */}
          {/* LEFT SECTION: BRANDING, VALUE PROPOSITIONS & INFRASTRUCTURE VISUALS     */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center relative space-y-7 sm:space-y-8 pr-0 lg:pr-4">
            
            {/* Subtle India Map Silhouette in Background */}
            <div className="absolute -left-10 top-0 w-96 h-96 opacity-[0.06] pointer-events-none -z-10">
              <img
                src="/assets/india-map-clean.png"
                alt=""
                className="w-full h-full object-contain filter grayscale"
              />
            </div>

            {/* 1. ProjectSetu Brand Identity */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                {/* Clean Bridge Vector Icon matching reference logo */}
                <div className="relative w-11 h-9 flex items-center justify-center">
                  <svg viewBox="0 0 64 48" className="w-11 h-9 fill-none">
                    {/* Saffron Arch */}
                    <path
                      d="M6 38 C 18 16, 46 16, 58 38"
                      stroke="#FF9933"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    {/* Green Arch */}
                    <path
                      d="M12 40 C 22 24, 42 24, 52 40"
                      stroke="#138808"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    {/* Golden Sun / Central Spire */}
                    <circle cx="32" cy="18" r="4.5" fill="#FF9933" />
                    <rect x="30" y="24" width="4" height="16" fill="#0284C7" rx="2" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <div className="text-2xl sm:text-[28px] font-black tracking-tight text-[#0F223D] font-heading leading-none">
                    Project<span className="text-[#1A73E8]">Setu</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-wide">
                Connecting People <span className="text-slate-300 mx-1">•</span> Monitoring Progress{' '}
                <span className="text-slate-300 mx-1">•</span> Building a Better India
              </p>
            </div>

            {/* 2. Main Hero Typography */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#0F223D] font-heading tracking-tight leading-[1.15]">
                Be a Part of a<br />
                <span className="text-[#0F223D]">Better Tomorrow</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg leading-relaxed pt-1">
                Register to report issues, track grievances, and stay informed about government projects.
              </p>
            </div>

            {/* 3. Four Core Citizen Pillars (Matching Cards from Reference Image) */}
            <div className="space-y-3.5 max-w-xl">
              
              {/* Pillar 1: Report Issues */}
              <div className="flex items-start gap-4 p-3 sm:p-3.5 rounded-2xl bg-white/70 border border-slate-200/60 shadow-2xs hover:bg-white transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#1A73E8] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-[#0F223D]">Report Issues</h2>
                  <p className="text-[11.5px] sm:text-xs text-slate-500 leading-snug">
                    Share problems related to government projects in your area.
                  </p>
                </div>
              </div>

              {/* Pillar 2: Track Progress */}
              <div className="flex items-start gap-4 p-3 sm:p-3.5 rounded-2xl bg-white/70 border border-slate-200/60 shadow-2xs hover:bg-white transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-[#0F223D]">Track Progress</h2>
                  <p className="text-[11.5px] sm:text-xs text-slate-500 leading-snug">
                    Follow the status of your grievances in real-time.
                  </p>
                </div>
              </div>

              {/* Pillar 3: Stay Informed */}
              <div className="flex items-start gap-4 p-3 sm:p-3.5 rounded-2xl bg-white/70 border border-slate-200/60 shadow-2xs hover:bg-white transition-all group">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-[#0F223D]">Stay Informed</h2>
                  <p className="text-[11.5px] sm:text-xs text-slate-500 leading-snug">
                    Get updates on project progress, milestones and deadlines.
                  </p>
                </div>
              </div>

              {/* Pillar 4: Build a Stronger India */}
              <div className="flex items-start gap-4 p-3 sm:p-3.5 rounded-2xl bg-white/70 border border-slate-200/60 shadow-2xs hover:bg-white transition-all group">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-[#0F223D]">Build a Stronger India</h2>
                  <p className="text-[11.5px] sm:text-xs text-slate-500 leading-snug">
                    Your voice helps improve public projects and services.
                  </p>
                </div>
              </div>

            </div>

            {/* 4. Bottom Landscape Aesthetic: Highway Bridge Graphic + Tiranga Ribbon */}
            <div className="pt-2 relative rounded-2xl overflow-hidden max-w-xl">
              <div className="relative h-28 sm:h-32 w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs group">
                {/* Modern Indian Infrastructure Highway Photo */}
                <img
                  src="/assets/delhi-vista-clean.png"
                  alt="Indian Expressway Infrastructure"
                  className="w-full h-full object-cover object-center filter brightness-[0.96] contrast-[1.04] group-hover:scale-102 transition-transform duration-700"
                />
                
                {/* Soft gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F223D]/60 via-transparent to-transparent" />
                
                {/* Indian National Flag Ribbon with Ashoka Chakra at bottom left */}
                <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-white/60">
                  <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
                    <img
                      src="/assets/ashoka-emblem.png"
                      alt="Ashoka Chakra"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex h-1.5 w-16 rounded-full overflow-hidden shadow-2xs">
                      <div className="w-1/3 bg-[#FF9933]" />
                      <div className="w-1/3 bg-white border-y border-slate-200" />
                      <div className="w-1/3 bg-[#138808]" />
                    </div>
                    <span className="text-[8.5px] font-bold text-[#0F223D] tracking-wider uppercase mt-0.5">
                      Pragati Setu
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-2.5 right-3 text-right">
                  <span className="text-[10px] font-bold text-white tracking-wide drop-shadow-sm">
                    Empowering 1.4 Billion Citizens
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT SECTION: CLEAN WHITE CITIZEN SIGNUP CARD (Pixel Match to Mockup)  */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-[530px] bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-7 sm:p-9 sm:py-10 space-y-6">
              
              {/* Card Top Icon & Heading */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0 shadow-2xs border border-blue-100/60">
                  <UserPlus className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-[#0F223D] font-heading tracking-tight">
                    Create Your Citizen Account
                  </h2>
                  <p className="text-xs text-slate-500 leading-normal">
                    Register to report issues, track grievances, and stay informed about government projects.
                  </p>
                </div>
              </div>

              {/* Validation Alert Notice */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 shadow-2xs animate-fadeIn">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Full Name Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                {/* 2. Mobile Number Input with +91 country code */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-200 focus-within:border-[#1A73E8] focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden">
                    {/* Country Code Prefix */}
                    <div className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50/70 border-r border-slate-200 text-slate-600 text-xs font-bold shrink-0 select-none">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>+91</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={handleMobileChange}
                      placeholder="Enter 10 digit mobile number"
                      maxLength={10}
                      className="w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                  {mobileNumber.length > 0 && !isMobileValid && (
                    <p className="text-[11px] text-amber-600">
                      Must be 10 digits starting with 6, 7, 8, or 9
                    </p>
                  )}
                </div>

                {/* 3. Password Input with dynamic requirement checklist */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Requirements Box matching the reference design */}
                  <div className="mt-2 p-3 rounded-xl bg-slate-50/90 border border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                    <p className="font-medium text-slate-600">
                      Password must be at least 8 characters long and include:
                    </p>
                    <div className="grid grid-cols-2 gap-y-1 gap-x-2 pt-0.5">
                      <div
                        className={`flex items-center gap-1.5 transition-colors ${
                          passwordChecks.hasUpper ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        <Check
                          className={`w-3.5 h-3.5 shrink-0 ${
                            passwordChecks.hasUpper ? 'text-emerald-600' : 'text-slate-300'
                          }`}
                        />
                        <span>One uppercase letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 transition-colors ${
                          passwordChecks.hasNumber ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        <Check
                          className={`w-3.5 h-3.5 shrink-0 ${
                            passwordChecks.hasNumber ? 'text-emerald-600' : 'text-slate-300'
                          }`}
                        />
                        <span>One number</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 transition-colors ${
                          passwordChecks.hasLower ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        <Check
                          className={`w-3.5 h-3.5 shrink-0 ${
                            passwordChecks.hasLower ? 'text-emerald-600' : 'text-slate-300'
                          }`}
                        />
                        <span>One lowercase letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 transition-colors ${
                          passwordChecks.hasSpecial ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        <Check
                          className={`w-3.5 h-3.5 shrink-0 ${
                            passwordChecks.hasSpecial ? 'text-emerald-600' : 'text-slate-300'
                          }`}
                        />
                        <span>One special character</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Confirm Password Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !isConfirmMatching && (
                    <p className="text-[11px] text-rose-500">Passwords do not match</p>
                  )}
                </div>

                {/* 5. Create Account Primary Action Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3.5 px-5 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] active:bg-[#104892] text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>

                {/* 6. Terms & Privacy Policy banner with checkbox */}
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/60 text-[11.5px] text-slate-600 flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1A73E8] border-slate-300 focus:ring-[#1A73E8] shrink-0 cursor-pointer"
                  />
                  <label htmlFor="terms-check" className="cursor-pointer leading-tight">
                    <Shield className="w-3.5 h-3.5 inline mr-1 text-[#1A73E8]" />
                    By creating an account, you agree to our{' '}
                    <span className="text-[#1A73E8] font-semibold underline">Terms of Service</span> and{' '}
                    <span className="text-[#1A73E8] font-semibold underline">Privacy Policy</span>.
                  </label>
                </div>

              </form>

              {/* 7. Divider: "Or" */}
              <div className="relative flex items-center justify-center pt-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/80" />
                </div>
                <div className="relative px-3 bg-white text-slate-400 text-xs font-semibold uppercase">
                  Or
                </div>
              </div>

              {/* 8. Back to Login Link */}
              <div className="text-center pt-1">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A73E8] hover:text-[#1557B0] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ----------------- SUBTLE FOOTER ----------------- */}
      <footer className="w-full max-w-[1360px] mx-auto px-6 py-4 text-center text-[11px] text-slate-400">
        ProjectSetu • Official Integrated Project Monitoring Platform • Government of India
      </footer>
    </div>
  );
};
