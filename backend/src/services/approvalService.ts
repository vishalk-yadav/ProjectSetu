import { prisma } from '../utils/prisma';
import { AuthUser, ApprovalStatus, ApprovalType } from '../types';
import { logAudit } from '../utils/auditLogger';

export class ApprovalService {
  static async listApprovals(currentUser: AuthUser, query: { status?: string; projectId?: string; type?: string }) {
    const where: any = {};

    // Scoping: Department Admin sees approvals for projects in their department
    if (currentUser.role === 'DEPARTMENT_ADMIN') {
      if (currentUser.departmentId) {
        where.project = { departmentId: currentUser.departmentId };
      }
    } else if (currentUser.role === 'PROJECT_MANAGER') {
      // Project Manager sees requests they submitted or for their assigned projects
      where.OR = [
        { requestedById: currentUser.id },
        { project: { projectManagerId: currentUser.id } },
      ];
    }

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.type && query.type !== 'ALL') {
      where.type = query.type;
    }

    if (query.projectId) {
      where.projectId = query.projectId;
    }

    return prisma.approvalRequest.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            department: { select: { id: true, name: true, code: true } },
          },
        },
        requestedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        reviewedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createApproval(
    currentUser: AuthUser,
    data: {
      projectId: string;
      type: ApprovalType;
      title: string;
      description: string;
      payload?: any;
    }
  ) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: { id: true, name: true, departmentId: true },
    });

    if (!project) {
      throw new Error('Project not found.');
    }

    const payloadString = typeof data.payload === 'string' ? data.payload : JSON.stringify(data.payload || {});

    const approval = await prisma.approvalRequest.create({
      data: {
        projectId: data.projectId,
        requestedById: currentUser.id,
        type: data.type,
        title: data.title,
        description: data.description,
        payload: payloadString,
        status: 'PENDING',
      },
      include: {
        project: { select: { id: true, name: true } },
        requestedBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Notify Department Admins
    await prisma.notification.create({
      data: {
        title: `Approval Request: ${data.title}`,
        message: `${currentUser.name} submitted a ${data.type} request for project "${project.name}".`,
        type: 'ALERT',
        severity: 'MEDIUM',
      },
    });

    await logAudit({
      user: currentUser,
      action: 'APPROVAL_SUBMIT',
      entityType: 'APPROVAL',
      entityId: approval.id,
      details: `Submitted ${data.type} approval request: "${data.title}" for ${project.name}`,
    });

    return approval;
  }

  static async reviewApproval(
    currentUser: AuthUser,
    approvalId: string,
    action: 'APPROVE' | 'REJECT',
    reviewNotes?: string
  ) {
    const approval = await prisma.approvalRequest.findUnique({
      where: { id: approvalId },
      include: {
        project: true,
        requestedBy: true,
      },
    });

    if (!approval) {
      throw new Error('Approval request not found.');
    }

    if (approval.status !== 'PENDING') {
      throw new Error(`This request has already been ${approval.status.toLowerCase()}.`);
    }

    // Check permissions
    if (
      currentUser.role === 'DEPARTMENT_ADMIN' &&
      approval.project.departmentId !== currentUser.departmentId
    ) {
      throw new Error('Unauthorized to review requests for another department.');
    }

    const newStatus: ApprovalStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    // If APPROVED, apply the payload changes automatically
    if (action === 'APPROVE') {
      try {
        const payload = JSON.parse(approval.payload);

        if (approval.type === 'PROGRESS_UPDATE' && payload.progressPercentage !== undefined) {
          await prisma.project.update({
            where: { id: approval.projectId },
            data: {
              progressPercentage: parseFloat(payload.progressPercentage),
              status: payload.status || approval.project.status,
            },
          });
        } else if (approval.type === 'MILESTONE_STATUS' && payload.milestoneId) {
          await prisma.milestone.update({
            where: { id: payload.milestoneId },
            data: {
              status: payload.status || 'COMPLETED',
              progressPercentage: payload.progressPercentage !== undefined ? parseFloat(payload.progressPercentage) : 100,
              actualCompletionDate: payload.status === 'COMPLETED' ? new Date() : undefined,
            },
          });
        } else if (approval.type === 'DOCUMENT_UPLOAD' && payload.documentId) {
          await prisma.document.update({
            where: { id: payload.documentId },
            data: { approvalStatus: 'APPROVED' },
          });
        } else if (approval.type === 'BUDGET_REVISION' && payload.amount) {
          await prisma.budgetTransaction.create({
            data: {
              projectId: approval.projectId,
              amount: parseFloat(payload.amount),
              category: payload.category || 'REVISED_SANCTION',
              description: payload.description || approval.title,
            },
          });
        }
      } catch (parseErr) {
        console.error('Error applying approved payload:', parseErr);
      }
    } else if (action === 'REJECT' && approval.type === 'DOCUMENT_UPLOAD') {
      try {
        const payload = JSON.parse(approval.payload);
        if (payload.documentId) {
          await prisma.document.update({
            where: { id: payload.documentId },
            data: { approvalStatus: 'REJECTED' },
          });
        }
      } catch (e) {}
    }

    const updated = await prisma.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status: newStatus,
        reviewedById: currentUser.id,
        reviewNotes: reviewNotes || (action === 'APPROVE' ? 'Approved by administrator.' : 'Rejected by administrator.'),
      },
      include: {
        project: { select: { id: true, name: true } },
        requestedBy: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Notify the submitter
    await prisma.notification.create({
      data: {
        userId: approval.requestedById,
        title: `Approval Request ${newStatus}: ${approval.title}`,
        message: `Your ${approval.type} request was ${newStatus.toLowerCase()} by ${currentUser.name}. ${reviewNotes ? `Remarks: ${reviewNotes}` : ''}`,
        type: newStatus === 'APPROVED' ? 'SUCCESS' : 'ALERT',
        severity: newStatus === 'APPROVED' ? 'LOW' : 'HIGH',
      },
    });

    await logAudit({
      user: currentUser,
      action: action === 'APPROVE' ? 'APPROVAL_APPROVE' : 'APPROVAL_REJECT',
      entityType: 'APPROVAL',
      entityId: updated.id,
      details: `${action === 'APPROVE' ? 'Approved' : 'Rejected'} request "${approval.title}" for ${approval.project.name}. Remarks: ${reviewNotes || 'None'}`,
    });

    return updated;
  }

  static async getStats(currentUser: AuthUser) {
    const where: any = {};
    if (currentUser.role === 'DEPARTMENT_ADMIN' && currentUser.departmentId) {
      where.project = { departmentId: currentUser.departmentId };
    } else if (currentUser.role === 'PROJECT_MANAGER') {
      where.requestedById = currentUser.id;
    }

    const [pending, approved, rejected, total] = await Promise.all([
      prisma.approvalRequest.count({ where: { ...where, status: 'PENDING' } }),
      prisma.approvalRequest.count({ where: { ...where, status: 'APPROVED' } }),
      prisma.approvalRequest.count({ where: { ...where, status: 'REJECTED' } }),
      prisma.approvalRequest.count({ where }),
    ]);

    return { pending, approved, rejected, total };
  }
}
