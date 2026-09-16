import api from './axios';
import { DocumentItem } from '../types';

export const documentApi = {
  listDocuments: async (projectId?: string): Promise<DocumentItem[]> => {
    const res = await api.get('/documents', { params: { projectId } });
    return res.data.data;
  },

  uploadDocument: async (formData: FormData): Promise<DocumentItem> => {
    const res = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  deleteDocument: async (id: string) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },
};
