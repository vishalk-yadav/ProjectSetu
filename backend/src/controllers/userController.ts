import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';

export class UserController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { departmentId, role, search } = req.query;
      const users = await UserService.listUsers(req.user, {
        departmentId: departmentId as string,
        role: role as string,
        search: search as string,
      });

      res.json({ success: true, data: users });
    } catch (error: any) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { name, email, password, role, departmentId, isActive } = req.body;
      if (!name || !email || !role) {
        return res.status(400).json({ success: false, message: 'Name, email, and role are required.' });
      }

      const user = await UserService.createUser(req.user, {
        name,
        email,
        password,
        role,
        departmentId,
        isActive,
      });

      res.status(201).json({ success: true, data: user, message: 'User created successfully.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { id } = req.params;
      const user = await UserService.updateUser(req.user, id, req.body);
      res.json({ success: true, data: user, message: 'User updated successfully.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { id } = req.params;
      const { isActive } = req.body;
      if (isActive === undefined) {
        return res.status(400).json({ success: false, message: 'isActive boolean is required.' });
      }

      const user = await UserService.toggleUserStatus(req.user, id, Boolean(isActive));
      res.json({ success: true, data: user, message: `User status updated to ${isActive ? 'Active' : 'Deactivated'}.` });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { id } = req.params;
      const result = await UserService.deleteUser(req.user, id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getProjectManagers(req: Request, res: Response, next: NextFunction) {
    try {
      const { departmentId } = req.query;
      const pms = await UserService.getProjectManagers(departmentId as string);
      res.json({ success: true, data: pms });
    } catch (error: any) {
      next(error);
    }
  }
}
