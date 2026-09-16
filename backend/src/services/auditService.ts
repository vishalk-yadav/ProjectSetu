import { prisma } from '../utils/prisma';

export interface AuditQueryOptions {
  action?: string;
  entityType?: string;
  userId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class AuditService {
  static async listLogs(options: AuditQueryOptions = {}) {
    const {
      action,
      entityType,
      userId,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = options;

    const where: any = {};

    if (action && action !== 'ALL') {
      where.action = action;
    }

    if (entityType && entityType !== 'ALL') {
      where.entityType = entityType;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { details: { contains: search } },
        { userEmail: { contains: search } },
        { userName: { contains: search } },
        { action: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getLogStats() {
    const [total, userChanges, projectChanges, approvals, grievances] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({ where: { entityType: 'USER' } }),
      prisma.auditLog.count({ where: { entityType: 'PROJECT' } }),
      prisma.auditLog.count({ where: { entityType: 'APPROVAL' } }),
      prisma.auditLog.count({ where: { entityType: 'COMPLAINT' } }),
    ]);

    return {
      total,
      userChanges,
      projectChanges,
      approvals,
      grievances,
    };
  }
}
