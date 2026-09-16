import { prisma } from '../utils/prisma';

export class NotificationService {
  static async listNotifications(userId?: string) {
    const where: any = {};
    if (userId) {
      where.OR = [
        { userId },
        { userId: null }, // System broadcast alerts
      ];
    }

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 40,
    });
  }

  static async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId?: string) {
    const where: any = { isRead: false };
    if (userId) {
      where.OR = [{ userId }, { userId: null }];
    }

    return prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });
  }

  static async createSmartAlert(data: {
    title: string;
    message: string;
    type?: string; // INFO, WARNING, CRITICAL
    severity?: string; // LOW, MEDIUM, HIGH, CRITICAL
    userId?: string;
  }) {
    return prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        severity: data.severity || 'LOW',
        userId: data.userId || null,
      },
    });
  }
}
