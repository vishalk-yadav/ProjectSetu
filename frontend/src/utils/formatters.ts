export function formatCurrencyINR(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `₹${lakh.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} Lakh`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateStr);
  }
}

export function getRiskLevel(score: number): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
  if (score >= 81) return 'CRITICAL';
  if (score >= 61) return 'HIGH';
  if (score >= 31) return 'MODERATE';
  return 'LOW';
}

export function getRiskBadgeClasses(score: number): string {
  const level = getRiskLevel(score);
  switch (level) {
    case 'CRITICAL':
      return 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold';
    case 'HIGH':
      return 'bg-orange-50 text-orange-700 border border-orange-200 font-semibold';
    case 'MODERATE':
      return 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold';
    case 'LOW':
    default:
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold';
  }
}

export function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold';
    case 'DELAYED':
      return 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold';
    case 'IN_PROGRESS':
      return 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold';
    case 'NOT_STARTED':
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold';
  }
}

export function getPriorityBadgeClasses(priority: string): string {
  switch (priority) {
    case 'CRITICAL':
      return 'bg-purple-50 text-purple-700 border border-purple-200 font-semibold';
    case 'HIGH':
      return 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold';
    case 'MEDIUM':
      return 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold';
    case 'LOW':
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200 font-semibold';
  }
}

/**
 * Returns a fully-qualified URL for accessing official uploaded documents
 * from the backend static file server or development proxy.
 */
export function getDocumentUrl(fileUrl: string | undefined | null): string {
  if (!fileUrl) return '#';
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  const cleanPath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  const backendBase = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:5000';
  return `${backendBase}${cleanPath}`;
}

