import { Request, Response, NextFunction } from 'express';
import { BudgetService } from '../services/budgetService';

export class BudgetController {
  static async getPortfolioSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await BudgetService.getPortfolioBudgetSummary();
      res.json({ success: true, data: summary });
    } catch (error: any) {
      next(error);
    }
  }

  static async getProjectBudget(req: Request, res: Response, next: NextFunction) {
    try {
      const budget = await BudgetService.getProjectBudget(req.params.projectId);
      res.json({ success: true, data: budget });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async addTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, amount, transactionDate, category, description } = req.body;
      if (!projectId || !amount || !category) {
        res.status(400).json({ success: false, message: 'projectId, amount, and category are required.' });
        return;
      }

      const tx = await BudgetService.addTransaction({
        projectId,
        amount: parseFloat(amount),
        transactionDate,
        category,
        description: description || '',
      });

      res.status(201).json({ success: true, data: tx });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
