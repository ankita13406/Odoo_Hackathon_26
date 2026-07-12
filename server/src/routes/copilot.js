const router = require('express').Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const { ok, fail } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Step 1: fixed set of intents the LLM is allowed to pick from ---
const INTENT_PROMPT = `You classify a question about an asset management system into exactly one intent.
Reply with ONLY raw JSON, no markdown, no explanation. Format:
{"intent": "<one of: WHERE_IS_ASSET | OVERDUE_ASSETS | IDLE_BY_DEPARTMENT | MAINTENANCE_STATUS | UNKNOWN>", "assetTag": "<string or null>"}
Examples:
"Where is Laptop AF-012?" -> {"intent":"WHERE_IS_ASSET","assetTag":"AF-012"}
"Show overdue assets" -> {"intent":"OVERDUE_ASSETS","assetTag":null}
"Which department has the most idle assets?" -> {"intent":"IDLE_BY_DEPARTMENT","assetTag":null}
"Status of AF-0062" -> {"intent":"MAINTENANCE_STATUS","assetTag":"AF-0062"}
`;

// --- Step 2: real Prisma queries — same pattern as everywhere else in the app ---
async function whereIsAsset(assetTag) {
  const asset = await prisma.asset.findUnique({ where: { assetTag }, include: { category: true } });
  if (!asset) return { found: false };
  const alloc = await prisma.allocation.findFirst({
    where: { assetId: asset.id, status: 'Active' },
    include: { asset: true },
  });
  let holder = null;
  if (alloc?.employeeId) holder = await prisma.employee.findUnique({ where: { id: alloc.employeeId }, include: { department: true } });
  return {
    found: true, assetTag: asset.assetTag, status: asset.status, condition: asset.condition,
    holderName: holder?.name || null, department: holder?.department?.name || null,
    expectedReturn: alloc?.expectedReturnDate || null,
  };
}

async function overdueAssets() {
  const rows = await prisma.allocation.findMany({
    where: { status: 'Active', expectedReturnDate: { lt: new Date() } },
    include: { asset: true },
  });
  return rows.map(r => ({ assetTag: r.asset.assetTag, dueDate: r.expectedReturnDate }));
}

async function idleByDepartment() {
  // "idle" = assets with no active allocation, grouped by their last known department
  const idle = await prisma.asset.findMany({ where: { status: 'Available' } });
  // group by category as a simple proxy if you haven't tracked last department — adjust to your schema
  const counts = {};
  for (const a of idle) counts[a.location || 'Unknown'] = (counts[a.location || 'Unknown'] || 0) + 1;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0] ? { location: sorted[0][0], idleCount: sorted[0][1] } : null;
}

async function maintenanceStatus(assetTag) {
  const asset = await prisma.asset.findUnique({ where: { assetTag } });
  if (!asset) return { found: false };
  const req = await prisma.maintenanceRequest.findFirst({ where: { assetId: asset.id }, orderBy: { createdAt: 'desc' } });
  return { found: true, assetTag, status: req?.status || 'No maintenance history' };
}

router.post('/ask', authMiddleware, async (req, res) => {
  const { question } = req.body;
  if (!question) return fail(res, 'question required');

  let intentData;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(INTENT_PROMPT + `\nQuestion: "${question}"`);
    const raw = result.response.text().replace(/```json|```/g, '').trim();
    intentData = JSON.parse(raw);
  } catch (e) {
    intentData = { intent: 'UNKNOWN' }; // LLM/network failure — fail safe, don't crash the demo
  }

  switch (intentData.intent) {
    case 'WHERE_IS_ASSET': return ok(res, { intent: intentData.intent, ...(await whereIsAsset(intentData.assetTag)) });
    case 'OVERDUE_ASSETS': return ok(res, { intent: intentData.intent, assets: await overdueAssets() });
    case 'IDLE_BY_DEPARTMENT': return ok(res, { intent: intentData.intent, result: await idleByDepartment() });
    case 'MAINTENANCE_STATUS': return ok(res, { intent: intentData.intent, ...(await maintenanceStatus(intentData.assetTag)) });
    default: return ok(res, { intent: 'UNKNOWN', message: "I couldn't understand that. Try: 'Where is AF-0012?' or 'Show overdue assets'." });
  }
});

module.exports = router;