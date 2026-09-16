import { prisma } from '../utils/prisma';
import fs from 'fs';
import path from 'path';

export class DocumentService {
  static async listDocuments(projectId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;

    return prisma.document.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, department: { select: { code: true } } },
        },
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  static async uploadDocument(data: {
    projectId: string;
    name: string;
    fileUrl: string;
    fileType: string;
    category: string;
    uploadedById?: string;
  }) {
    return prisma.document.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        category: data.category || 'Other',
        uploadedById: data.uploadedById || null,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });
  }

  static async deleteDocument(id: string) {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) throw new Error('Document not found');

    // Attempt to remove physical file if stored locally
    try {
      const filename = path.basename(doc.fileUrl);
      const filePath = path.resolve(__dirname, '../../uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.warn('Could not remove file from disk:', e);
    }

    return prisma.document.delete({ where: { id } });
  }
}
