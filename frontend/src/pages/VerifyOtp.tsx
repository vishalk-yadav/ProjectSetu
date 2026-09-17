import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../components/common/LanguageSelector';
import {
  ShieldCheck,
  Smartphone,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
} from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export const VerifyOtp: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthSession } = useAuth();

  // Retrieve state passed from signup or login
  const navState = (location.state || {}) as {
    mobileNumber?: string;
    fullName?: string;
    isMock?: boolean;
    mockOtp?: string;
    cooldownSeconds?: number;
  };

  const [mobileNumber, setMobileNumber] = useState(navState.mobileNumber || '');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(navState.cooldownSeconds || 45);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const mockOtpCode = navState.mockOtp || '123456';
  const isMockMode = navState.isMock !== undefined ? navState.isMock : true;

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first empty digit input on initial load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    setCanResend(false);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Mask mobile number for privacy: e.g. +91 98••••••34
  const maskedMobile = React.useMemo(() => {
    if (!mobileNumber) return '+91 ••••• •••••';
    const digitsOnly = mobileNumber.replace(/\D/g, '');
    if (digitsOnly.length >= 10) {
      const last10 = digitsOnly.slice(-10);
      const prefix = last10.slice(0, 2);
      const suffix = last10.slice(-2);
      return `+91 ${prefix}••••••${suffix}`;
    }
    return mobileNumber;
  }, [mobileNumber]);

  // Handle single digit input
  const handleDigitChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setError(null);

    // Auto-advance to next box if character was entered
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace, arrows, delete
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Current is already empty, move to and clear previous
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste full 6-digit OTP
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setOtpDigits(newDigits);
    setError(null);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Auto-fill mock OTP in 1 click
  const fillMockOtp = () => {
    const mockArr = mockOtpCode.split('').slice(0, 6);
    setOtpDigits(mockArr);
    setError(null);
    inputRefs.current[5]?.focus();
  };

  const fullOtp = otpDigits.join('');
  const isOtpComplete = fullOtp.length === 6;

  // Submit OTP Verification
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!mobileNumber) {
      setError('Mobile number is missing. Please sign up again.');
      return;
    }

    if (!isOtpComplete) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await authApi.verifyMobileOtp({
        mobileNumber,
        otp: fullOtp,
      });

      const user = response.user || response.data?.user;
      const token = response.token || response.data?.token;

      if (!user || !token) {
        throw new Error('Invalid verification response from server.');
      }

      // Establish authenticated citizen session
      setAuthSession(user, token);
      setSuccessMsg('Mobile verified successfully! Redirecting to your citizen dashboard...');

      // Smooth redirection to citizen portal
      setTimeout(() => {
        navigate('/citizen');
      }, 900);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Verification failed. Please check your code and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP handler
  const handleResend = async () => {
    if (!canResend || isResending) return;

    if (!mobileNumber) {
      setError('Cannot resend OTP: Mobile number is not specified.');
      return;
    }

    setError(null);
    setIsResending(true);

    try {
      const res = await authApi.resendMobileOtp(mobileNumber);
      const cooldown = res.cooldownSeconds || res.data?.cooldownSeconds || 45;
      setTimer(cooldown);
      setCanResend(false);
      setSuccessMsg('A new verification code has been dispatched to your mobile.');
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to resend OTP. Please wait.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F0F4F9] flex flex-col justify-between font-sans select-none relative overflow-x-hidden">
      {/* ----------------- TOP NAVBAR ----------------- */}
      <header className="w-full max-w-[1200px] mx-auto px-6 sm:px-10 py-5 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          {/* Bridge Vector Logo */}
          <div className="relative w-10 h-8 flex items-center justify-center">
            <svg viewBox="0 0 64 48" className="w-10 h-8 fill-none">
              <path d="M6 38 C 18 16, 46 16, 58 38" stroke="#FF9933" strokeWidth="5" strokeLinecap="round" />
              <path d="M12 40 C 22 24, 42 24, 52 40" stroke="#138808" strokeWidth="5" strokeLinecap="round" />
              <circle cx="32" cy="18" r="4.5" fill="#FF9933" />
              <rect x="30" y="24" width="4" height="16" fill="#0284C7" rx="2" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-xl text-[#0F223D] tracking-tight">
              Project<span className="text-[#1A73E8]">Setu</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector variant="nav" />
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#1A73E8] transition-colors py-1.5 px-3 rounded-xl hover:bg-white/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('auth.backToLogin')}</span>
          </Link>
        </div>
      </header>

      {/* ----------------- MAIN VERIFICATION CONTAINER ----------------- */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6 sm:py-10 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-100 p-7 sm:p-9 space-y-6 animate-fadeIn relative">
          
          {/* Top Tricolor Accent Line */}
          <div className="absolute top-0 inset-x-8 h-1 flex rounded-b-full overflow-hidden">
            <div className="w-1/3 bg-[#FF9933]" />
            <div className="w-1/3 bg-slate-100" />
            <div className="w-1/3 bg-[#138808]" />
          </div>

          {/* Header Icon & Title */}
          <div className="flex flex-col items-center text-center pt-2 space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1A73E8] border border-blue-100 flex items-center justify-center shadow-xs">
              <Smartphone className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-black text-[#0F223D] font-heading tracking-tight">
              {t('auth.mobileVerification')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
              {t('auth.otpSentTo')}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-mono font-bold text-slate-800">
              <span>{maskedMobile}</span>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-[#1A73E8] hover:underline text-[11px] font-sans font-semibold cursor-pointer"
              >
                {t('common.edit')}
              </button>
            </div>
          </div>

          {/* Development Mock Mode Notification */}
          {isMockMode && (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{t('auth.devModeNotice')}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/60 text-amber-800">
                  Local Dev
                </span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <div className="text-xs text-amber-800">
                  {t('auth.defaultOtpNotice')}{' '}
                  <span className="font-mono font-black text-amber-950 text-sm tracking-wider px-1.5 py-0.5 bg-amber-100/90 rounded-md border border-amber-300">
                    {mockOtpCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fillMockOtp}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {t('auth.fillMockOtp')}
                </button>
              </div>
            </div>
          )}

          {/* Success Message Banner */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Message Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* 6-Digit OTP Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('auth.enter6Digit')}
              </label>

              {/* 6 Individual Input Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono font-black text-xl sm:text-2xl rounded-xl border transition-all outline-none ${
                      digit
                        ? 'border-[#1A73E8] bg-blue-50/40 text-[#0F223D] ring-2 ring-blue-100'
                        : 'border-slate-200 bg-slate-50/80 text-slate-800 focus:border-[#1A73E8] focus:bg-white focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Resend OTP & Cooldown Timer Section */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-500">{t('auth.didntReceive')}</span>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="inline-flex items-center gap-1.5 font-bold text-[#1A73E8] hover:text-[#1557B0] hover:underline cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>{isResending ? t('common.loading') : t('auth.resendOtp')}</span>
                </button>
              ) : (
                <span className="text-slate-400 font-mono font-medium flex items-center gap-1">
                  {t('auth.resendIn', { seconds: timer })}
                </span>
              )}
            </div>

            {/* Verify Account CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isOtpComplete}
              className="w-full py-3.5 px-5 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] active:bg-[#104892] text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('auth.verifyAndContinue')}</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Security Assurance Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            <span>{t('auth.encryptionAssurance')}</span>
          </div>

        </div>
      </main>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="w-full max-w-[1200px] mx-auto px-6 py-4 text-center text-[11px] text-slate-400">
        ProjectSetu • Official Integrated Project Monitoring Platform • Government of India
      </footer>
    </div>
  );
};

export default VerifyOtp;
