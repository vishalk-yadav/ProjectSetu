import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from '../../i18n';
import { cn } from '../../utils/cn';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'nav' | 'compact' | 'pill';
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className,
  variant = 'nav',
  showLabel = true,
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangCode = (i18n.language?.substring(0, 2) || 'en') as SupportedLanguageCode;
  const currentLang =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('projectsetu_lang', code);
    localStorage.setItem('projectsetu_dashboard_lang', code);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-500/40',
          variant === 'nav' &&
            'px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs',
          variant === 'compact' &&
            'p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
          variant === 'pill' &&
            'px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 text-xs font-medium'
        )}
        title={t('header.language', t('dashboard.language', 'Language'))}
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        {showLabel && (
          <span className="hidden sm:inline font-bold tracking-tight">
            {currentLang.nativeName}
          </span>
        )}
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-slate-400 dark:text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {t('header.selectLanguage', t('dashboard.selectLanguage', 'Select Language'))}
            </p>
          </div>
          {SUPPORTED_LANGUAGES.map((language) => {
            const isSelected = currentLangCode === language.code;
            return (
              <button
                key={language.code}
                type="button"
                onClick={() => handleSelectLanguage(language.code)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm leading-none">{language.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">{language.nativeName}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400">
                      {language.name}
                    </span>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
