const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const nextAssetTag = async () => {
  const count = await prisma.asset.count();
  return `AF-${String(count + 1).padStart(4, "0")}`;
};

module.exports = { nextAssetTag };