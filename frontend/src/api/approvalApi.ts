import api from './axios';
import { ApprovalRequestItem, ApprovalType } from '../types';

export const approvalApi = {
  listApprovals: async (params?: {
    status?: string;
    projectId?: string;
    type?: string;
  }): Promise<ApprovalRequestItem[]> => {
    const res = await api.get('/approvals', { params });
    return res.data.data;
  },

  createApproval: async (data: {
    projectId: string;
    type: ApprovalType;
    title: string;
    description: string;
    payload?: any;
  }): Promise<ApprovalRequestItem> => {
    const res = await api.post('/approvals', data);
    return res.data.data;
  },

  reviewApproval: async (
    id: string,
    action: 'APPROVE' | 'REJECT',
    reviewNotes?: string
  ): Promise<ApprovalRequestItem> => {
    const res = await api.post(`/approvals/${id}/review`, { action, reviewNotes });
    return res.data.data;
  },

  getStats: async (): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  }> => {
    const res = await api.get('/approvals/stats');
    return res.data.data;
  },
};
