import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isDeptAdmin: boolean;
  isProjectManager: boolean;
  isCitizen: boolean;
  canManageUsers: boolean;
  canManageProjects: boolean;
  canManageDepartments: boolean;
  canSanctionProjects: boolean;
  canApproveRequests: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  quickLogin: (role: UserRole) => Promise<void>;
  setAuthSession: (user: User, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USERS: Record<UserRole, { email: string; pass: string; label: string; name: string; iconRole: string }> = {
  SUPER_ADMIN: {
    email: 'admin@projectsetu.gov.in',
    pass: 'Admin@123',
    label: 'Super Admin',
    name: 'Dr. Arvind Subramanian (Cabinet Secretariat)',
    iconRole: 'Full control & system management',
  },
  DEPARTMENT_ADMIN: {
    email: 'morth.admin@projectsetu.gov.in',
    pass: 'Admin@123',
    label: 'Admin (MoRTH)',
    name: 'Sunita Meena (JS Highways)',
    iconRole: 'Department level management',
  },
  PROJECT_MANAGER: {
    email: 'pm.sharma@projectsetu.gov.in',
    pass: 'Admin@123',
    label: 'Project Manager',
    name: 'Rajesh Sharma (Resident Engineer)',
    iconRole: 'Track & manage assigned projects',
  },
  CITIZEN: {
    email: 'citizen@projectsetu.gov.in',
    pass: 'Admin@123',
    label: 'Citizen / Civil Watch',
    name: 'Arun Sharma (Citizen)',
    iconRole: 'Stay informed & raise concerns',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('projectsetu_token');
    const storedUser = localStorage.getItem('projectsetu_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify token with /auth/me in background
        authApi.getProfile()
          .then((fresh) => {
            setUser(fresh);
            localStorage.setItem('projectsetu_user', JSON.stringify(fresh));
          })
          .catch(() => {
            logout();
          })
          .finally(() => setIsLoading(false));
        return;
      } catch {
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, pass);
      const { user: loggedInUser, token: authToken } = res.data;
      setUser(loggedInUser);
      setToken(authToken);
      localStorage.setItem('projectsetu_token', authToken);
      localStorage.setItem('projectsetu_user', JSON.stringify(loggedInUser));
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: UserRole) => {
    const creds = DEMO_USERS[role];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('projectsetu_token');
    localStorage.removeItem('projectsetu_user');
  };

  const setAuthSession = (loggedInUser: User, authToken: string) => {
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('projectsetu_token', authToken);
    localStorage.setItem('projectsetu_user', JSON.stringify(loggedInUser));
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isDeptAdmin = user?.role === 'DEPARTMENT_ADMIN';
  const isProjectManager = user?.role === 'PROJECT_MANAGER';
  const isCitizen = user?.role === 'CITIZEN';

  const canManageUsers = isSuperAdmin || isDeptAdmin;
  const canManageProjects = isSuperAdmin || isDeptAdmin || isProjectManager;
  const canManageDepartments = isSuperAdmin;
  const canSanctionProjects = isSuperAdmin || isDeptAdmin;
  const canApproveRequests = isSuperAdmin || isDeptAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isSuperAdmin,
        isDeptAdmin,
        isProjectManager,
        isCitizen,
        canManageUsers,
        canManageProjects,
        canManageDepartments,
        canSanctionProjects,
        canApproveRequests,
        login,
        logout,
        quickLogin,
        setAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

