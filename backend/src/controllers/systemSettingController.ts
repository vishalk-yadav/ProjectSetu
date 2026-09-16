import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { logAudit } from '../utils/auditLogger';

export class SystemSettingController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await prisma.systemSetting.findMany({
        orderBy: [{ category: 'asc' }, { key: 'asc' }],
      });

      // Map into a dictionary object for convenient frontend consumption alongside the array
      const settingsMap: Record<string, string> = {};
      settings.forEach((s) => {
        settingsMap[s.key] = s.value;
      });

      res.json({ success: true, data: settings, map: settingsMap });
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { settings } = req.body; // Array of { key, value, category, description } or object { key: value }

      if (!settings) {
        return res.status(400).json({ success: false, message: 'Settings payload is required.' });
      }

      const updatedRecords = [];

      if (Array.isArray(settings)) {
        for (const item of settings) {
          const updated = await prisma.systemSetting.upsert({
            where: { key: item.key },
            update: {
              value: String(item.value),
              category: item.category || 'GENERAL',
              description: item.description,
            },
            create: {
              key: item.key,
              value: String(item.value),
              category: item.category || 'GENERAL',
              description: item.description,
            },
          });
          updatedRecords.push(updated);
        }
      } else if (typeof settings === 'object') {
        for (const [key, value] of Object.entries(settings)) {
          const updated = await prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value), category: 'GENERAL' },
          });
          updatedRecords.push(updated);
        }
      }

      await logAudit({
        user: req.user,
        action: 'SYSTEM_SETTING_CHANGE',
        entityType: 'SYSTEM_SETTING',
        details: `Updated ${updatedRecords.length} system configuration parameters.`,
      });

      res.json({ success: true, message: 'System settings updated successfully.', data: updatedRecords });
    } catch (error) {
      next(error);
    }
  }
}
