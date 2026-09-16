import api from './axios';
import { RiskAnalysis } from '../types';

export const riskApi = {
  getPortfolioRiskOverview: async () => {
    const res = await api.get('/risks');
    return res.data.data;
  },

  getProjectRisk: async (projectId: string): Promise<RiskAnalysis> => {
    const res = await api.get(`/projects/${projectId}/risk`);
    return res.data.data;
  },

  analyzeProject: async (projectId: string) => {
    const res = await api.post(`/projects/${projectId}/analyze`);
    return res.data.data;
  },

  addRisk: async (data: {
    projectId: string;
    riskType: string;
    severity: string;
    description: string;
    status?: string;
  }) => {
    const res = await api.post('/risks', data);
    return res.data.data;
  },

  updateRiskStatus: async (riskId: string, status: string) => {
    const res = await api.put(`/risks/${riskId}/status`, { status });
    return res.data.data;
  },

  raiseAlert: async (data: {
    projectId: string;
    riskType: string;
    severity: string;
    description: string;
    recommendation?: string;
  }) => {
    const res = await api.post('/risks/raise', data);
    return res.data;
  },
};
