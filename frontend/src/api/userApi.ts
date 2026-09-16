import api from './axios';
import { User, UserRole } from '../types';

export const userApi = {
  listUsers: async (params?: { departmentId?: string; role?: string; search?: string }): Promise<User[]> => {
    const res = await api.get('/users', { params });
    return res.data.data;
  },

  createUser: async (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    departmentId?: string | null;
    isActive?: boolean;
  }): Promise<User> => {
    const res = await api.post('/users', data);
    return res.data.data;
  },

  updateUser: async (
    id: string,
    data: {
      name?: string;
      email?: string;
      role?: UserRole;
      departmentId?: string | null;
      isActive?: boolean;
      password?: string;
    }
  ): Promise<User> => {
    const res = await api.put(`/users/${id}`, data);
    return res.data.data;
  },

  toggleStatus: async (id: string, isActive: boolean): Promise<User> => {
    const res = await api.patch(`/users/${id}/status`, { isActive });
    return res.data.data;
  },

  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },

  getProjectManagers: async (departmentId?: string): Promise<Array<{ id: string; name: string; email: string; department?: { name: string; code: string } }>> => {
    const res = await api.get('/users/project-managers', { params: { departmentId } });
    return res.data.data;
  },
};
