import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include language and helper
declare global {
  namespace Express {
    interface Request {
      language: string;
      t: (key: string, defaultText?: string) => string;
    }
  }
}

const SUPPORTED_LANGUAGES = ['en', 'hi', 'te', 'ta'] as const;
type SupportedLang = (typeof SUPPORTED_LANGUAGES)[number];

// Lightweight server-side messages dictionary for backend responses if needed
const SERVER_MESSAGES: Record<SupportedLang, Record<string, string>> = {
  en: {
    'server.ok': 'Operation completed successfully.',
    'server.unauthorized': 'Unauthorized. Please provide a valid authentication token.',
    'server.forbidden': 'You do not have permission to access this resource.',
    'server.notFound': 'Requested resource not found.',
    'server.internalError': 'An internal server error occurred.',
  },
  hi: {
    'server.ok': 'कार्य सफलतापूर्वक संपन्न हुआ।',
    'server.unauthorized': 'अनधिकृत। कृपया एक मान्य प्रमाणीकरण टोकन प्रदान करें।',
    'server.forbidden': 'आपके पास इस संसाधन तक पहुंचने की अनुमति नहीं है।',
    'server.notFound': 'अनुरोधित संसाधन नहीं मिला।',
    'server.internalError': 'एक आंतरिक सर्वर त्रुटि उत्पन्न हुई।',
  },
  te: {
    'server.ok': 'కార్యం విజయవంతంగా పూర్తయింది.',
    'server.unauthorized': 'అనధికారిక ప్రవేశం. దయచేసి సరైన టోకెన్ అందించండి.',
    'server.forbidden': 'ఈ వనరును యాక్సెస్ చేయడానికి మీకు అనుమతి లేదు.',
    'server.notFound': 'అభ్యర్థించిన వనరు కనుగొనబడలేదు.',
    'server.internalError': 'అంతర్గత సర్వర్ లోపం సంభవించింది.',
  },
  ta: {
    'server.ok': 'நடவடிக்கை வெற்றிகரமாக முடிந்தது.',
    'server.unauthorized': 'அங்கீகரிக்கப்படாதது. தயவுசெய்து சரியான டோக்கனை வழங்கவும்.',
    'server.forbidden': 'இந்த வளத்தை அணுக உங்களுக்கு அனுமதி இல்லை.',
    'server.notFound': 'கோரப்பட்ட ஆதாரம் கிடைக்கவில்லை.',
    'server.internalError': 'உள் சேவையகப் பிழை ஏற்பட்டது.',
  },
};

export const localizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers['accept-language'] || 'en';
  // Parse code e.g. "hi-IN", "hi", "te,en-US"
  const rawLang = header.split(',')[0].trim().split('-')[0].toLowerCase();
  const lang: SupportedLang = (SUPPORTED_LANGUAGES as readonly string[]).includes(rawLang)
    ? (rawLang as SupportedLang)
    : 'en';

  req.language = lang;
  req.t = (key: string, defaultText?: string): string => {
    return SERVER_MESSAGES[lang]?.[key] || SERVER_MESSAGES['en']?.[key] || defaultText || key;
  };

  // Set Content-Language header on response
  res.setHeader('Content-Language', lang);

  next();
};
