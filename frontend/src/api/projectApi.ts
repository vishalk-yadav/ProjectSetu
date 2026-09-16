import api from './axios';
import { Project } from '../types';

export interface ProjectQueryParams {
  departmentId?: string;
  status?: string;
  riskLevel?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const projectApi = {
  getDashboardStats: async () => {
    const res = await api.get('/projects/stats/dashboard');
    return res.data.data;
  },

  listProjects: async (params?: ProjectQueryParams) => {
    const res = await api.get('/projects', { params });
    return res.data;
  },

  getProjectById: async (id: string): Promise<Project> => {
    const res = await api.get(`/projects/${id}`);
    return res.data.data;
  },

  createProject: async (data: any): Promise<Project> => {
    const res = await api.post('/projects', data);
    return res.data.data;
  },

  updateProject: async (id: string, data: any): Promise<Project> => {
    const res = await api.put(`/projects/${id}`, data);
    return res.data.data;
  },

  updateProgress: async (id: string, progressPercentage: number, status?: string): Promise<Project> => {
    const res = await api.put(`/projects/${id}/progress`, { progressPercentage, status });
    return res.data.data;
  },

  deleteProject: async (id: string) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },

  // Milestones
  getProjectMilestones: async (projectId: string) => {
    const res = await api.get(`/projects/${projectId}/milestones`);
    return res.data.data;
  },

  createMilestone: async (projectId: string, data: any) => {
    const res = await api.post(`/projects/${projectId}/milestones`, data);
    return res.data.data;
  },

  updateMilestone: async (milestoneId: string, data: any) => {
    const res = await api.put(`/milestones/${milestoneId}`, data);
    return res.data.data;
  },

  deleteMilestone: async (milestoneId: string) => {
    const res = await api.delete(`/milestones/${milestoneId}`);
    return res.data;
  },
};
