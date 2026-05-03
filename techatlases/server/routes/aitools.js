import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const tools = await prisma.aITool.findMany();
    res.json(tools);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI tools' });
  }
});


router.get('/usage', async (req, res) => {
  try {
    const usage = await prisma.$queryRaw`SELECT * FROM ai_tool_usage_view`;
    res.json(usage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI usage data' });
  }
});

// Record AI tool usage
router.post('/record', async (req, res) => {
  const { developerId, aiToolId, sentiment, useCase, adoptionScore } = req.body;
  try {
    const record = await prisma.usesAI.upsert({
      where: {
        developerId_aiToolId: { developerId, aiToolId }
      },
      update: { sentiment, useCase, adoptionScore },
      create: { developerId, aiToolId, sentiment, useCase, adoptionScore }
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

export default router;
