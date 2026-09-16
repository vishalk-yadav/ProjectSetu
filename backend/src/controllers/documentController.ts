import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/documentService';

export class DocumentController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.query;
      const docs = await DocumentService.listDocuments(projectId as string);
      res.json({ success: true, data: docs });
    } catch (error: any) {
      next(error);
    }
  }

  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded.' });
        return;
      }

      const { projectId, name, category } = req.body;
      if (!projectId) {
        res.status(400).json({ success: false, message: 'projectId is required.' });
        return;
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const doc = await DocumentService.uploadDocument({
        projectId,
        name: name || req.file.originalname,
        fileUrl,
        fileType: req.file.mimetype,
        category: category || 'Other',
        uploadedById: req.user?.id,
      });

      res.status(201).json({ success: true, data: doc });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await DocumentService.deleteDocument(req.params.id);
      res.json({ success: true, message: 'Document deleted successfully.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
