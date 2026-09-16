import api from './axios';
import { Department } from '../types';

export const departmentApi = {
  listDepartments: async (): Promise<Department[]> => {
    const res = await api.get('/departments');
    return res.data.data;
  },

  getDepartmentRankings: async (): Promise<Department[]> => {
    const res = await api.get('/departments/rankings');
    return res.data.data;
  },

  getDepartmentById: async (id: string): Promise<Department> => {
    const res = await api.get(`/departments/${id}`);
    return res.data.data;
  },

  createDepartment: async (data: {
    name: string;
    code: string;
    departmentHead: string;
    contactInformation: string;
  }): Promise<Department> => {
    const res = await api.post('/departments', data);
    return res.data.data;
  },

  updateDepartment: async (id: string, data: any): Promise<Department> => {
    const res = await api.put(`/departments/${id}`, data);
    return res.data.data;
  },

  deleteDepartment: async (id: string) => {
    const res = await api.delete(`/departments/${id}`);
    return res.data;
  },
};
