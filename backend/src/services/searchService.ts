import { prisma } from '../utils/prisma';

export class SearchService {
  static async globalSearch(query: string) {
    if (!query || query.trim().length === 0) {
      return {
        projects: [],
        departments: [],
        users: [],
        documents: [],
      };
    }

    const term = query.trim();

    const [projects, departments, users, documents] = await Promise.all([
      prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: term } },
            { description: { contains: term } },
            { location: { contains: term } },
          ],
        },
        include: {
          department: {
            select: { id: true, name: true, code: true },
          },
        },
        take: 6,
      }),
      prisma.department.findMany({
        where: {
          OR: [
            { name: { contains: term } },
            { code: { contains: term } },
            { departmentHead: { contains: term } },
          ],
        },
        take: 4,
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: term } },
            { email: { contains: term } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
        take: 4,
      }),
      prisma.document.findMany({
        where: {
          OR: [
            { name: { contains: term } },
            { category: { contains: term } },
          ],
        },
        include: {
          project: {
            select: { id: true, name: true },
          },
        },
        take: 4,
      }),
    ]);

    return {
      projects,
      departments,
      users,
      documents,
    };
  }
}
