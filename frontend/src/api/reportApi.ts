import api from './axios';

export const reportApi = {
  getReport: async (params: {
    reportType: 'ALL_PROJECTS' | 'DELAYED_PROJECTS' | 'HIGH_RISK' | 'BUDGET_ANALYSIS' | 'DEPARTMENT_SUMMARY';
    departmentId?: string;
  }) => {
    const res = await api.get('/reports', { params });
    return res.data.data;
  },

  exportCsvUrl: (params: {
    reportType: string;
    departmentId?: string;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return `/api/reports/export-csv?${query}`;
  },
};

export const searchApi = {
  search: async (query: string) => {
    const res = await api.get('/search', { params: { q: query } });
    return res.data.data;
  },
};
