import api from './axios';
import { Project, DocumentItem } from '../types';

export const publicApi = {
  listProjects: async (params?: {
    search?: string;
    departmentId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Project[]; pagination: any }> => {
    const res = await api.get('/public/projects', { params });
    return { data: res.data.data, pagination: res.data.pagination };
  },

  getProjectById: async (id: string): Promise<Project> => {
    const res = await api.get(`/public/projects/${id}`);
    return res.data.data;
  },

  submitGrievance: async (data: {
    projectId?: string;
    complainantName?: string;
    complainantEmail?: string;
    complainantPhone?: string;
    subject: string;
    category: string;
    severity?: string;
    description: string;
    isAnonymous?: boolean;
    photoUrl?: string;
    latitude?: number;
    longitude?: number;
    locationAccuracy?: number;
    locationAddress?: string;
  } | FormData): Promise<{ success: boolean; message: string; trackingId: string; data: any }> => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const res = await api.post('/public/complaints', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return res.data;
  },

  trackGrievance: async (trackingId: string): Promise<any> => {
    const res = await api.get(`/public/complaints/track/${encodeURIComponent(trackingId.trim())}`);
    return res.data.data;
  },

  listDocuments: async (params?: { category?: string; projectId?: string }): Promise<DocumentItem[]> => {
    const res = await api.get('/public/documents', { params });
    return res.data.data;
  },
};
