import api from './axios';
import { AuditLogItem } from '../types';

export interface AuditLogResponse {
  data: AuditLogItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const auditApi = {
  listLogs: async (params?: {
    action?: string;
    entityType?: string;
    userId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<AuditLogResponse> => {
    const res = await api.get('/audit-logs', { params });
    return {
      data: res.data.data,
      pagination: res.data.pagination,
    };
  },

  getStats: async (): Promise<{
    total: number;
    userChanges: number;
    projectChanges: number;
    approvals: number;
    grievances: number;
  }> => {
    const res = await api.get('/audit-logs/stats');
    return res.data.data;
  },
};
