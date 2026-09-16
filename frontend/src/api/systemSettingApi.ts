import api from './axios';
import { SystemSettingItem } from '../types';

export const systemSettingApi = {
  getSettings: async (): Promise<{ data: SystemSettingItem[]; map: Record<string, string> }> => {
    const res = await api.get('/settings');
    return res.data;
  },

  updateSettings: async (settings: Array<{ key: string; value: string; category?: string; description?: string }>): Promise<SystemSettingItem[]> => {
    const res = await api.put('/settings', { settings });
    return res.data.data;
  },
};
