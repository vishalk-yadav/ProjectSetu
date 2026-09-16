import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { AuthUser, UserRole } from '../types';
import { logAudit } from '../utils/auditLogger';

export class UserService {
  static async listUsers(currentUser: AuthUser, query: { departmentId?: string; role?: string; search?: string }) {
    const where: any = {};

    // If Department Admin, enforce their own department
    if (currentUser.role === 'DEPARTMENT_ADMIN') {
      if (currentUser.departmentId) {
        where.departmentId = currentUser.departmentId;
      }
    } else if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        departmentId: true,
        department: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { managedProjects: true, uploadedDocuments: true },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  static async createUser(
    currentUser: AuthUser,
    data: {
      name: string;
      email: string;
      password?: string;
      role: UserRole;
      departmentId?: string | null;
      isActive?: boolean;
    }
  ) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new Error('A user with this email address already exists.');
    }

    // If Department Admin creates a user, lock the department to their own
    let deptId = data.departmentId;
    if (currentUser.role === 'DEPARTMENT_ADMIN') {
      deptId = currentUser.departmentId || null;
      if (data.role === 'SUPER_ADMIN') {
        throw new Error('Department Admins cannot create Super Admin accounts.');
      }
    }

    const rawPassword = data.password || 'Admin@123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role,
        departmentId: deptId || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        departmentId: true,
        department: {
          select: { id: true, name: true, code: true },
        },
        createdAt: true,
      },
    });

    await logAudit({
      user: currentUser,
      action: 'USER_CREATE',
      entityType: 'USER',
      entityId: user.id,
      details: `Created new user ${user.name} (${user.email}) with role ${user.role}`,
    });

    return user;
  }

  static async updateUser(
    currentUser: AuthUser,
    userId: string,
    data: {
      name?: string;
      email?: string;
      role?: UserRole;
      departmentId?: string | null;
      isActive?: boolean;
      password?: string;
    }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found.');
    }

    // Dept Admin can only edit users in their own department
    if (currentUser.role === 'DEPARTMENT_ADMIN' && user.departmentId !== currentUser.departmentId) {
      throw new Error('Unauthorized to edit users outside your department.');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email.toLowerCase();
    if (data.role) {
      if (currentUser.role === 'DEPARTMENT_ADMIN' && data.role === 'SUPER_ADMIN') {
        throw new Error('Department Admins cannot assign Super Admin role.');
      }
      updateData.role = data.role;
    }
    if (data.departmentId !== undefined) {
      updateData.departmentId = currentUser.role === 'DEPARTMENT_ADMIN' ? currentUser.departmentId : data.departmentId;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        departmentId: true,
        department: {
          select: { id: true, name: true, code: true },
        },
        updatedAt: true,
      },
    });

    await logAudit({
      user: currentUser,
      action: 'USER_UPDATE',
      entityType: 'USER',
      entityId: updated.id,
      details: `Updated user profile for ${updated.name} (${updated.email})`,
    });

    return updated;
  }

  static async toggleUserStatus(currentUser: AuthUser, userId: string, isActive: boolean) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found.');
    }

    if (currentUser.role === 'DEPARTMENT_ADMIN' && user.departmentId !== currentUser.departmentId) {
      throw new Error('Unauthorized to change status of users outside your department.');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    await logAudit({
      user: currentUser,
      action: isActive ? 'USER_ACTIVATE' : 'USER_DEACTIVATE',
      entityType: 'USER',
      entityId: updated.id,
      details: `${isActive ? 'Activated' : 'Deactivated'} account for ${updated.name}`,
    });

    return updated;
  }

  static async deleteUser(currentUser: AuthUser, userId: string) {
    if (currentUser.id === userId) {
      throw new Error('You cannot delete your own account.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found.');
    }

    await prisma.user.delete({ where: { id: userId } });

    await logAudit({
      user: currentUser,
      action: 'USER_DELETE',
      entityType: 'USER',
      entityId: userId,
      details: `Deleted user ${user.name} (${user.email})`,
    });

    return { success: true, message: 'User deleted successfully.' };
  }

  static async getProjectManagers(departmentId?: string) {
    const where: any = {
      role: 'PROJECT_MANAGER',
      isActive: true,
    };
    if (departmentId) {
      where.departmentId = departmentId;
    }

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        departmentId: true,
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: { name: 'asc' },
    });
  }
}
