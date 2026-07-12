const prisma = require('../config/prisma');

async function main() {
  const now = new Date();
  const cycle = await prisma.auditCycle.create({
    data: {
      status: 'Open',
      startDate: now,
      endDate: now, 
    },
  });
  console.log('Cycle ID:', cycle.id);

  const item = await prisma.auditItem.create({
    data: {
      auditCycleId: cycle.id,
      assetId: 1,
      result: 'Missing',
    },
  });
  console.log('Audit Item ID:', item.id);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());