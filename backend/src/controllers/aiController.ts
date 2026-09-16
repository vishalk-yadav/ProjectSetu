import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/aiService';

export class AIController {
  static async getDelayPrediction(req: Request, res: Response, next: NextFunction) {
    try {
      const prediction = await AIService.getProjectDelayPrediction(req.params.id);
      res.json({ success: true, data: prediction });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async getCostPrediction(req: Request, res: Response, next: NextFunction) {
    try {
      const prediction = await AIService.getProjectCostPrediction(req.params.id);
      res.json({ success: true, data: prediction });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await AIService.getProjectSummary(req.params.id);
      res.json({ success: true, data: summary });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async queryAssistant(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.body;
      const result = await AIService.handleNaturalLanguageQuery(query);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
