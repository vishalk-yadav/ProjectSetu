import api from './axios';
import { User, UserRole } from '../types';

export interface CitizenRegisterData {
  fullName: string;
  mobileNumber: string;
  password: string;
}

export interface VerifyOtpData {
  mobileNumber: string;
  otp: string;
}

export const authApi = {
  login: async (identifier: string, pass: string) => {
    const res = await api.post('/auth/login', { identifier, email: identifier, password: pass });
    return res.data;
  },

  registerCitizen: async (data: CitizenRegisterData) => {
    const res = await api.post('/auth/register/citizen', data);
    return res.data;
  },

  verifyMobileOtp: async (data: VerifyOtpData) => {
    const res = await api.post('/auth/verify-mobile-otp', data);
    return res.data;
  },

  resendMobileOtp: async (mobileNumber: string) => {
    const res = await api.post('/auth/resend-mobile-otp', { mobileNumber });
    return res.data;
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    departmentId?: string;
  }) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
};
