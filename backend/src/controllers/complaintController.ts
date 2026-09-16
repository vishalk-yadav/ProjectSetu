import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { logAudit } from '../utils/auditLogger';

function generateTrackingId(): string {
  const randNum = Math.floor(100000 + Math.random() * 900000);
  return `SETU-GRV-${randNum}`;
}

export class ComplaintController {
  // 1. List complaints / grievances with filters
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, status, severity, category, search, hasLocation } = req.query;

      const where: any = {};
      if (projectId && typeof projectId === 'string') {
        where.projectId = projectId;
      }
      if (status && typeof status === 'string' && status !== 'ALL') {
        where.status = status;
      }
      if (severity && typeof severity === 'string' && severity !== 'ALL') {
        where.severity = severity;
      }
      if (category && typeof category === 'string' && category !== 'ALL') {
        where.category = category;
      }
      if (hasLocation === 'true') {
        where.latitude = { not: null };
        where.longitude = { not: null };
      }
      if (search && typeof search === 'string') {
        where.OR = [
          { subject: { contains: search } },
          { description: { contains: search } },
          { complainantName: { contains: search } },
          { trackingId: { contains: search } },
        ];
      }

      const complaints = await prisma.complaint.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              location: true,
              status: true,
              department: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: complaints,
        count: complaints.length,
      });
    } catch (error) {
      next(error);
    }
  }

  // 2. Map-ready grievance markers
  static async getMapMarkers(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, status, severity } = req.query;

      const where: any = {
        latitude: { not: null },
        longitude: { not: null },
      };

      if (category && typeof category === 'string' && category !== 'ALL') {
        where.category = category;
      }
      if (status && typeof status === 'string' && status !== 'ALL') {
        where.status = status;
      }
      if (severity && typeof severity === 'string' && severity !== 'ALL') {
        where.severity = severity;
      }

      const grievances = await prisma.complaint.findMany({
        where,
        select: {
          id: true,
          trackingId: true,
          subject: true,
          description: true,
          category: true,
          severity: true,
          status: true,
          photoUrl: true,
          latitude: true,
          longitude: true,
          locationAccuracy: true,
          locationAddress: true,
          createdAt: true,
          updatedAt: true,
          project: {
            select: {
              id: true,
              name: true,
              location: true,
              status: true,
              department: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        count: grievances.length,
        data: grievances,
      });
    } catch (error) {
      next(error);
    }
  }

  // 3. Get single complaint/grievance by ID or trackingId
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const complaint = await prisma.complaint.findFirst({
        where: {
          OR: [
            { id },
            { trackingId: id },
            { trackingId: id.toUpperCase() },
          ],
        },
        include: {
          project: {
            include: {
              department: true,
              projectManager: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });

      if (!complaint) {
        return res.status(404).json({ success: false, message: 'Grievance not found.' });
      }

      res.json({ success: true, data: complaint });
    } catch (error) {
      next(error);
    }
  }

  // 4. Get grievances by Project ID
  static async getByProjectId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: projectId } = req.params;
      const complaints = await prisma.complaint.findMany({
        where: { projectId },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              department: { select: { name: true, code: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        count: complaints.length,
        data: complaints,
      });
    } catch (error) {
      next(error);
    }
  }

  // 5. Create a new grievance / issue report (Supports photo upload & GPS)
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        projectId,
        subject,
        category,
        severity = 'MEDIUM',
        description,
        isAnonymous = false,
        complainantName,
        complainantEmail,
        complainantPhone,
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

      // Handle photo upload if present
      let photoUrl: string | null = null;
      if (req.file) {
        photoUrl = `/uploads/${req.file.filename}`;
      } else if (req.body.photoUrl && typeof req.body.photoUrl === 'string') {
        photoUrl = req.body.photoUrl;
      }

      // Validate coordinates if provided
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

      // Validate Project if provided
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

      const currentUser = (req as any).user;
      const isAnon = isAnonymous === true || isAnonymous === 'true';
      const finalName = isAnon
        ? 'Concerned Citizen (Anonymous)'
        : complainantName || currentUser?.name || 'Citizen Reporter';
      const finalEmail = isAnon
        ? 'citizen-anonymous@projectsetu.gov.in'
        : complainantEmail || currentUser?.email || 'citizen@projectsetu.gov.in';
      const finalRole = currentUser?.role || 'CITIZEN';

      const trackingId = generateTrackingId();

      const complaint = await prisma.complaint.create({
        data: {
          trackingId,
          projectId: validProjectId,
          userId: isAnon ? null : currentUser?.id || null,
          complainantName: finalName,
          complainantEmail: finalEmail,
          complainantPhone: complainantPhone || null,
          complainantRole: finalRole,
          category,
          severity,
          subject,
          description,
          photoUrl,
          latitude: parsedLat,
          longitude: parsedLng,
          locationAccuracy: parsedAcc,
          locationAddress: locationAddress || null,
          status: 'PENDING',
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              department: { select: { name: true, code: true } },
            },
          },
        },
      });

      // Emit system notification
      await prisma.notification.create({
        data: {
          title: `New Issue Reported: ${trackingId}`,
          message: `${project ? `Project: ${project.name} | ` : ''}Category: ${category} | Severity: ${severity} | Subject: "${subject}"`,
          type: severity === 'CRITICAL' || severity === 'HIGH' ? 'ALERT' : 'WARNING',
          severity,
          isRead: false,
        },
      });

      // Log Audit Trail
      await logAudit({
        user: currentUser,
        action: 'CITIZEN_GRIEVANCE_SUBMIT',
        entityType: 'COMPLAINT',
        entityId: complaint.id,
        details: `Issue report filed [${trackingId}] - Category: ${category}${project ? ` for project ${project.name}` : ''}${parsedLat ? ` (GPS: ${parsedLat.toFixed(4)}, ${parsedLng?.toFixed(4)})` : ''}`,
      });

      res.status(201).json({
        success: true,
        message: 'Grievance report submitted successfully. Please save your reference tracking ID.',
        trackingId,
        data: complaint,
      });
    } catch (error) {
      next(error);
    }
  }

  // 6. Update Grievance Status & Resolution
  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, resolutionNotes, assignedTo } = req.body;

      const validStatuses = ['PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const existing = await prisma.complaint.findFirst({
        where: {
          OR: [{ id }, { trackingId: id }],
        },
        include: { project: true },
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Grievance not found.' });
      }

      const updated = await prisma.complaint.update({
        where: { id: existing.id },
        data: {
          status: status || existing.status,
          resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : existing.resolutionNotes,
          assignedTo: assignedTo !== undefined ? assignedTo : existing.assignedTo,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const currentUser = (req as any).user;

      // Log audit
      await logAudit({
        user: currentUser,
        action: 'GRIEVANCE_STATUS_UPDATE',
        entityType: 'COMPLAINT',
        entityId: updated.id,
        details: `Updated grievance [${updated.trackingId}] status to ${status || existing.status}`,
      });

      // Notification if resolved
      if (status === 'RESOLVED') {
        await prisma.notification.create({
          data: {
            title: `Grievance Resolved: ${updated.trackingId}`,
            message: `Subject: "${updated.subject}" marked RESOLVED. ${resolutionNotes ? `Remarks: ${resolutionNotes}` : ''}`,
            type: 'SUCCESS',
            severity: 'LOW',
            isRead: false,
          },
        });
      }

      res.json({
        success: true,
        message: `Grievance status updated successfully.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // 7. Statistical Overview
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [total, pending, inReview, resolved, critical, withGps] = await Promise.all([
        prisma.complaint.count(),
        prisma.complaint.count({ where: { status: 'PENDING' } }),
        prisma.complaint.count({ where: { status: 'IN_REVIEW' } }),
        prisma.complaint.count({ where: { status: 'RESOLVED' } }),
        prisma.complaint.count({ where: { severity: { in: ['HIGH', 'CRITICAL'] } } }),
        prisma.complaint.count({ where: { latitude: { not: null }, longitude: { not: null } } }),
      ]);

      res.json({
        success: true,
        data: {
          total,
          pending,
          inReview,
          resolved,
          critical,
          withGps,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
