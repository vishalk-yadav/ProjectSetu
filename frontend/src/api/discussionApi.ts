import api from './axios';
import { ProjectDiscussionItem } from '../types';

export const discussionApi = {
  getDiscussions: async (projectId: string): Promise<ProjectDiscussionItem[]> => {
    const res = await api.get(`/projects/${projectId}/discussions`);
    return res.data.data;
  },

  postMessage: async (projectId: string, message: string): Promise<ProjectDiscussionItem> => {
    const res = await api.post(`/projects/${projectId}/discussions`, { message });
    return res.data.data;
  },
};
