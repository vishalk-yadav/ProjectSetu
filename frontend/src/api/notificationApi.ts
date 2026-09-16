import api from './axios';
import { NotificationItem } from '../types';

export const notificationApi = {
  listNotifications: async (): Promise<NotificationItem[]> => {
    const res = await api.get('/notifications');
    return res.data.data;
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllAsRead: async () => {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },
};
