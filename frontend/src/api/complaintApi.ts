import api from './axios';
import { Complaint, ComplaintStatus } from '../types';

export interface ComplaintQueryParams {
  projectId?: string;
  status?: string;
  severity?: string;
  category?: string;
  search?: string;
  hasLocation?: boolean;
}

export interface CreateComplaintPayload {
  projectId?: string;
  subject: string;
  category: string;
  severity?: string;
  description: string;
  isAnonymous?: boolean;
  complainantName?: string;
  complainantEmail?: string;
  complainantPhone?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  locationAddress?: string;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  inReview: number;
  resolved: number;
  critical: number;
  withGps?: number;
}

export const complaintApi = {
  listComplaints: async (params?: ComplaintQueryParams): Promise<Complaint[]> => {
    const res = await api.get('/complaints', { params });
    return res.data.data;
  },

  getMapMarkers: async (params?: { category?: string; status?: string; severity?: string }): Promise<Complaint[]> => {
    const res = await api.get('/complaints/map', { params });
    return res.data.data;
  },

  getStats: async (): Promise<ComplaintStats> => {
    const res = await api.get('/complaints/stats');
    return res.data.data;
  },

  getComplaintById: async (id: string): Promise<Complaint> => {
    const res = await api.get(`/complaints/${id}`);
    return res.data.data;
  },

  getByProjectId: async (projectId: string): Promise<Complaint[]> => {
    const res = await api.get(`/complaints/project/${projectId}`);
    return res.data.data;
  },

  createComplaint: async (payload: CreateComplaintPayload | FormData): Promise<{ success: boolean; trackingId: string; data: Complaint }> => {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    const res = await api.post('/complaints', payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return res.data;
  },

  updateStatus: async (
    id: string,
    status: ComplaintStatus,
    resolutionNotes?: string,
    assignedTo?: string
  ): Promise<Complaint> => {
    const res = await api.patch(`/complaints/${id}/status`, { status, resolutionNotes, assignedTo });
    return res.data.data;
  },
};
