const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.employee.upsert({
    where: { email: 'admin@assetflow.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@assetflow.com', passwordHash, role: 'Admin' },
  });
  const dept = await prisma.department.create({ data: { name: 'Engineering', status: 'Active' } });
  const cat = await prisma.assetCategory.create({ data: { name: 'Electronics' } });
  console.log({ admin: admin.email, dept: dept.name, cat: cat.name });
}

main().catch(console.error).finally(() => prisma.$disconnect());