import api from './axios';
import { DelayPrediction, CostPrediction, SmartSummary, AssistantQueryResult } from '../types';

export const aiApi = {
  getDelayPrediction: async (projectId: string): Promise<DelayPrediction> => {
    const res = await api.get(`/projects/${projectId}/delay-prediction`);
    return res.data.data;
  },

  getCostPrediction: async (projectId: string): Promise<CostPrediction> => {
    const res = await api.get(`/projects/${projectId}/cost-prediction`);
    return res.data.data;
  },

  getProjectSummary: async (projectId: string): Promise<SmartSummary> => {
    const res = await api.get(`/projects/${projectId}/summary`);
    return res.data.data;
  },

  queryAssistant: async (query: string): Promise<AssistantQueryResult> => {
    const res = await api.post('/ai/query', { query });
    return res.data.data;
  },
};
