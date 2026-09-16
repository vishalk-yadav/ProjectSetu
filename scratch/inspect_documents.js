const path = require('path');
const { PrismaClient } = require(path.resolve(__dirname, '../backend/node_modules/@prisma/client'));
const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.document.findMany({
    select: {
      id: true,
      name: true,
      fileUrl: true,
      fileType: true,
      category: true,
      isPublic: true,
      approvalStatus: true,
      projectId: true,
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  console.log(`Found ${docs.length} documents:`);
  for (const doc of docs) {
    console.log(`- ID: ${doc.id}`);
    console.log(`  Name: ${doc.name}`);
    console.log(`  FileUrl: ${doc.fileUrl}`);
    console.log(`  FileType: ${doc.fileType}`);
    console.log(`  Project: ${doc.project?.name}`);
    console.log(`  isPublic: ${doc.isPublic}, approvalStatus: ${doc.approvalStatus}`);
  }
}

main().finally(() => prisma.$disconnect());
