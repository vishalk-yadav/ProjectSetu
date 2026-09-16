import { Request, Response, NextFunction } from 'express';
import { DepartmentService } from '../services/departmentService';

export class DepartmentController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await DepartmentService.listDepartments();
      res.json({ success: true, data: departments });
    } catch (error: any) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await DepartmentService.getDepartmentById(req.params.id);
      res.json({ success: true, data: department });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await DepartmentService.createDepartment(req.body);
      res.status(201).json({ success: true, data: department });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await DepartmentService.updateDepartment(req.params.id, req.body);
      res.json({ success: true, data: department });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await DepartmentService.deleteDepartment(req.params.id);
      res.json({ success: true, message: 'Department deleted successfully.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async rankings(req: Request, res: Response, next: NextFunction) {
    try {
      const rankings = await DepartmentService.getDepartmentRankings();
      res.json({ success: true, data: rankings });
    } catch (error: any) {
      next(error);
    }
  }
}
