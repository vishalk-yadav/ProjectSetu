import { Request, Response, NextFunction } from 'express';
import { RiskService } from '../services/riskService';

export class RiskController {
  static async getProjectRisk(req: Request, res: Response, next: NextFunction) {
    try {
      const risk = await RiskService.getProjectRisk(req.params.id);
      res.json({ success: true, data: risk });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async analyzeProject(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RiskService.analyzeAndPersistProject(req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getPortfolioRisk(req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await RiskService.getPortfolioRiskOverview();
      res.json({ success: true, data: overview });
    } catch (error: any) {
      next(error);
    }
  }

  static async addRisk(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, riskType, severity, description, status } = req.body;
      if (!projectId || !riskType || !description) {
        res.status(400).json({ success: false, message: 'projectId, riskType, and description are required.' });
        return;
      }

      const risk = await RiskService.addRisk({ projectId, riskType, severity, description, status });
      res.status(201).json({ success: true, data: risk });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const updated = await RiskService.updateRiskStatus(req.params.id, status);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async raiseAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, riskType, severity, description, recommendation } = req.body;
      if (!projectId || !riskType || !description) {
        return res.status(400).json({
          success: false,
          message: 'projectId, riskType, and description are required.',
        });
      }

      const risk = await RiskService.raiseAlert(req.user, {
        projectId,
        riskType,
        severity,
        description,
        recommendation,
      });

      res.status(201).json({
        success: true,
        message: 'Risk & delay alert raised successfully and escalated to department leadership.',
        data: risk,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

