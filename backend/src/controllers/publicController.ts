import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { logAudit } from '../utils/auditLogger';

function generateTrackingId(): string {
  const randNum = Math.floor(100000 + Math.random() * 900000);
  return `SETU-GRV-${randNum}`;
}

export class PublicController {
  // Public directory of projects
  static async listProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, departmentId, status, page = '1', limit = '50' } = req.query;

      const where: any = {};
      if (departmentId && typeof departmentId === 'string') {
        where.departmentId = departmentId;
      }
      if (status && typeof status === 'string' && status !== 'ALL') {
        where.status = status;
      }
      if (search && typeof search === 'string') {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } },
          { location: { contains: search } },
        ];
      }

      const p = parseInt(page as string, 10);
      const l = parseInt(limit as string, 10);
      const skip = (p - 1) * l;

      const [total, projects] = await Promise.all([
        prisma.project.count({ where }),
        prisma.project.findMany({
          where,
          select: {
            id: true,
            name: true,
            description: true,
            location: true,
            latitude: true,
            longitude: true,
            startDate: true,
            expectedCompletionDate: true,
            actualCompletionDate: true,
            status: true,
            progressPercentage: true,
            priority: true,
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            _count: {
              select: {
                milestones: true,
                documents: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: l,
        }),
      ]);

      res.json({
        success: true,
        data: projects,
        pagination: {
          total,
          page: p,
          limit: l,
          totalPages: Math.ceil(total / l),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Public single project detail
  static async getProjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const project = await prisma.project.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          location: true,
          latitude: true,
          longitude: true,
          startDate: true,
          expectedCompletionDate: true,
          actualCompletionDate: true,
          status: true,
          progressPercentage: true,
          priority: true,
          department: {
            select: {
              id: true,
              name: true,
              code: true,
              departmentHead: true,
              contactInformation: true,
            },
          },
          milestones: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              progressPercentage: true,
              expectedCompletionDate: true,
              actualCompletionDate: true,
            },
            orderBy: { expectedCompletionDate: 'asc' },
          },
          documents: {
            where: { isPublic: true, approvalStatus: 'APPROVED' },
            select: {
              id: true,
              name: true,
              fileUrl: true,
              fileType: true,
              category: true,
              uploadedAt: true,
            },
          },
        },
      });

      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  // Submit citizen grievance / feedback
  static async submitGrievance(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        projectId,
        complainantName,
        complainantEmail,
        complainantPhone,
        subject,
        category,
        severity = 'MEDIUM',
        description,
        isAnonymous = false,
        photoUrl,
        latitude,
        longitude,
        locationAccuracy,
        locationAddress,
      } = req.body;

      if (!subject || !category || !description) {
        return res.status(400).json({
          success: false,
          message: 'Subject, category, and description are required.',
        });
      }

      let project = null;
      let validProjectId: string | null = null;
      if (projectId && projectId !== 'NONE' && projectId !== '') {
        project = await prisma.project.findUnique({
          where: { id: projectId },
          select: { id: true, name: true, department: { select: { name: true, code: true } } },
        });
        if (project) {
          validProjectId = project.id;
        }
      }

      let finalPhotoUrl = photoUrl || null;
      if (req.file) {
        finalPhotoUrl = `/uploads/${req.file.filename}`;
      }

      let parsedLat: number | null = null;
      let parsedLng: number | null = null;
      let parsedAcc: number | null = null;

      if (latitude !== undefined && latitude !== null && latitude !== '') {
        parsedLat = parseFloat(latitude);
        if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
          return res.status(400).json({ success: false, message: 'Invalid latitude value.' });
        }
      }

      if (longitude !== undefined && longitude !== null && longitude !== '') {
        parsedLng = parseFloat(longitude);
        if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
          return res.status(400).json({ success: false, message: 'Invalid longitude value.' });
        }
      }

      if (locationAccuracy !== undefined && locationAccuracy !== null && locationAccuracy !== '') {
        parsedAcc = parseFloat(locationAccuracy);
      }

      const trackingId = generateTrackingId();
      const isAnon = isAnonymous === true || isAnonymous === 'true';
      const finalName = isAnon ? 'Concerned Citizen (Anonymous)' : complainantName || 'Anonymous Citizen';
      const finalEmail = isAnon ? 'citizen-grievance@projectsetu.gov.in' : complainantEmail || 'citizen@projectsetu.gov.in';

      const complaint = await prisma.complaint.create({
        data: {
          trackingId,
          projectId: validProjectId,
          complainantName: finalName,
          complainantEmail: finalEmail,
          complainantPhone: complainantPhone || null,
          complainantRole: 'CITIZEN',
          isPublic: true,
          category,
          severity,
          subject,
          description,
          photoUrl: finalPhotoUrl,
          latitude: parsedLat,
          longitude: parsedLng,
          locationAccuracy: parsedAcc,
          locationAddress: locationAddress || null,
          status: 'PENDING',
        },
        include: {
          project: { select: { id: true, name: true, department: { select: { name: true, code: true } } } },
        },
      });

      // System notification
      await prisma.notification.create({
        data: {
          title: `Citizen Grievance Filed: ${trackingId}`,
          message: `${project ? `Project: ${project.name} | ` : ''}Category: ${category} | Subject: "${subject}"`,
          type: severity === 'CRITICAL' || severity === 'HIGH' ? 'ALERT' : 'WARNING',
          severity,
        },
      });

      await logAudit({
        action: 'CITIZEN_GRIEVANCE_SUBMIT',
        entityType: 'COMPLAINT',
        entityId: complaint.id,
        details: `Citizen submitted grievance [${trackingId}] - Category: ${category}${project ? ` on project "${project.name}"` : ''}`,
      });

      res.status(201).json({
        success: true,
        message: 'Grievance submitted successfully. Please save your reference tracking ID.',
        trackingId,
        data: complaint,
      });
    } catch (error) {
      next(error);
    }
  }

  // Track grievance by reference number
  static async trackGrievance(req: Request, res: Response, next: NextFunction) {
    try {
      const { trackingId } = req.params;

      if (!trackingId) {
        return res.status(400).json({ success: false, message: 'Tracking reference ID is required.' });
      }

      const complaint = await prisma.complaint.findFirst({
        where: {
          OR: [
            { trackingId: trackingId.trim() },
            { trackingId: trackingId.trim().toUpperCase() },
            { id: trackingId.trim() },
          ],
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              location: true,
              department: { select: { name: true, code: true } },
            },
          },
        },
      });

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: `No grievance found with reference ID "${trackingId}". Please verify the format (e.g. SETU-GRV-123456).`,
        });
      }

      // Return sanitized public tracking status
      res.json({
        success: true,
        data: {
          trackingId: complaint.trackingId,
          subject: complaint.subject,
          category: complaint.category,
          status: complaint.status,
          severity: complaint.severity,
          submittedAt: complaint.createdAt,
          updatedAt: complaint.updatedAt,
          resolutionNotes: complaint.resolutionNotes,
          project: complaint.project,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Public documents
  static async listDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, projectId } = req.query;

      const where: any = {
        isPublic: true,
        approvalStatus: 'APPROVED',
      };

      if (category && typeof category === 'string' && category !== 'ALL') {
        where.category = category;
      }

      if (projectId && typeof projectId === 'string') {
        where.projectId = projectId;
      }

      const documents = await prisma.document.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              department: { select: { name: true, code: true } },
            },
          },
        },
        orderBy: { uploadedAt: 'desc' },
      });

      res.json({ success: true, data: documents });
    } catch (error) {
      next(error);
    }
  }
}
