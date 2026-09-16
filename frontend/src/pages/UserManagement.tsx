import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  Mail,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Power,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { userApi } from '../api/userApi';
import { departmentApi } from '../api/departmentApi';
import { User, UserRole, Department } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';

export const UserManagement: React.FC = () => {
  const { user: currentUser, isSuperAdmin, isDeptAdmin } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PROJECT_MANAGER' as UserRole,
    departmentId: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, deptsData] = await Promise.all([
        userApi.listUsers({
          role: roleFilter !== 'ALL' ? roleFilter : undefined,
          departmentId: deptFilter !== 'ALL' ? deptFilter : undefined,
          search: search.trim() || undefined,
        }),
        departmentApi.listDepartments(),
      ]);
      setUsers(usersData);
      setDepartments(deptsData);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roleFilter, deptFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenCreate = () => {
    setFormError('');
    setFormData({
      name: '',
      email: '',
      password: 'Admin@123',
      role: isDeptAdmin ? 'PROJECT_MANAGER' : 'PROJECT_MANAGER',
      departmentId: isDeptAdmin && currentUser?.departmentId ? currentUser.departmentId : (departments[0]?.id || ''),
      isActive: true,
    });
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (targetUser: User) => {
    setSelectedUser(targetUser);
    setFormError('');
    setFormData({
      name: targetUser.name,
      email: targetUser.email || '',
      password: '',
      role: targetUser.role,
      departmentId: targetUser.departmentId || '',
      isActive: targetUser.isActive !== false,
    });
    setEditModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      await userApi.createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password || undefined,
        role: formData.role,
        departmentId: formData.departmentId || null,
        isActive: formData.isActive,
      });
      setCreateModalOpen(false);
      setSuccessMessage(`User "${formData.name}" created successfully.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError('');
    setIsSubmitting(true);
    try {
      await userApi.updateUser(selectedUser.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password ? formData.password : undefined,
        role: formData.role,
        departmentId: formData.departmentId || null,
        isActive: formData.isActive,
      });
      setEditModalOpen(false);
      setSuccessMessage(`User "${formData.name}" updated successfully.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    try {
      const newStatus = targetUser.isActive === false;
      await userApi.toggleStatus(targetUser.id, newStatus);
      setSuccessMessage(`User ${targetUser.name} ${newStatus ? 'activated' : 'deactivated'}.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Status update failed.');
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${targetUser.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await userApi.deleteUser(targetUser.id);
      setSuccessMessage(`User "${targetUser.name}" deleted.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete user.');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-800">Super Admin</span>;
      case 'DEPARTMENT_ADMIN':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">Dept Admin</span>;
      case 'PROJECT_MANAGER':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">Project Manager</span>;
      case 'CITIZEN':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">Citizen</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">User</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {isDeptAdmin ? 'Department User Governance' : 'User Management & Role Governance'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isDeptAdmin
                ? `Manage project managers for ${currentUser?.department?.name || 'your department'}.`
                : 'Create, edit, assign organizational roles, and manage access credentials across all ministries.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Create New User
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
              {isSuperAdmin && <option value="DEPARTMENT_ADMIN">Dept Admin</option>}
              <option value="PROJECT_MANAGER">Project Manager</option>
              <option value="CITIZEN">Citizen</option>
            </select>
          </div>

          {/* Department Filter (Super Admin only) */}
          {isSuperAdmin && (
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none max-w-[200px] truncate"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={loadData}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh user list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner message="Loading user directory & roles..." />
      ) : users.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No users found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or role filters.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">User Identity</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Assigned Projects</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {users.map((u) => {
                  const isActive = u.isActive !== false;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                          }`}>
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{u.name}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">{getRoleBadge(u.role)}</td>

                      <td className="px-4 py-3.5">
                        {u.department ? (
                          <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                            <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[180px]" title={u.department.name}>
                              {u.department.name} ({u.department.code})
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Universal / Public</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-400">
                        {u._count?.managedProjects ? `${u._count.managedProjects} active` : '—'}
                      </td>

                      <td className="px-4 py-3.5">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" /> Deactivated
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Deactivate / Activate Button */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              isActive
                                ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                            }`}
                            title={isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            title="Edit user details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button (Super Admin only, cannot delete self) */}
                          {isSuperAdmin && u.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New User Account"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Ramesh Chander, Chief Engineer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Official Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. ramesh.chander@projectsetu.gov.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Initial Password *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">Default is Admin@123</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin (Universal Control)</option>}
                {isSuperAdmin && <option value="DEPARTMENT_ADMIN">Admin (Department Level)</option>}
                <option value="PROJECT_MANAGER">Project Manager (Execution)</option>
                <option value="CITIZEN">Citizen / Civil Watch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              {isDeptAdmin ? (
                <input
                  type="text"
                  disabled
                  value={currentUser?.department?.name || 'Your Department'}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed"
                />
              ) : (
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">No Department (Universal)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#1A73E8] hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit User: ${selectedUser?.name}`}
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Official Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Change Password (Leave blank to keep unchanged)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
                {isSuperAdmin && <option value="DEPARTMENT_ADMIN">Dept Admin</option>}
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="CITIZEN">Citizen</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              {isDeptAdmin ? (
                <input
                  type="text"
                  disabled
                  value={currentUser?.department?.name || 'Your Department'}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed"
                />
              ) : (
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">No Department (Universal)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Account Active and Authorized to Log In
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#1A73E8] hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
