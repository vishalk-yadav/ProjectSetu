import { prisma } from './prisma';
import { AuthUser } from '../types';

export interface LogAuditParams {
  user?: AuthUser | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details: string;
  ipAddress?: string | null;
}

export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.user?.id || null,
        userEmail: params.user?.email || null,
        userName: params.user?.name || 'System / Anonymous',
        role: params.user?.role || 'SYSTEM',
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        details: params.details,
        ipAddress: params.ipAddress || '127.0.0.1',
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
