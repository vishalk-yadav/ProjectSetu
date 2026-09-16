import api from './axios';

export const budgetApi = {
  getPortfolioSummary: async () => {
    const res = await api.get('/budget/summary');
    return res.data.data;
  },

  getProjectBudget: async (projectId: string) => {
    const res = await api.get(`/budget/project/${projectId}`);
    return res.data.data;
  },

  addTransaction: async (data: {
    projectId: string;
    amount: number;
    transactionDate?: string;
    category: string;
    description: string;
  }) => {
    const res = await api.post('/budget/transaction', data);
    return res.data.data;
  },
};
