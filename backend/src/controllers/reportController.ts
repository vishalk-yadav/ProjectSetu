import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/reportService';

export class ReportController {
  static async getReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportType = 'ALL_PROJECTS', departmentId } = req.query;
      const report = await ReportService.generateReport({
        reportType: reportType as any,
        departmentId: departmentId as string,
      });
      res.json({ success: true, data: report });
    } catch (error: any) {
      next(error);
    }
  }

  static async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportType = 'ALL_PROJECTS', departmentId } = req.query;
      const csv = await ReportService.exportToCsv({
        reportType: reportType as any,
        departmentId: departmentId as string,
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="projectsetu-report-${Date.now()}.csv"`);
      res.status(200).send(csv);
    } catch (error: any) {
      next(error);
    }
  }
}
