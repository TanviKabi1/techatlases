import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Get all tech categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.techCategory.findMany({
      include: { _count: { select: { technologies: true } } }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all technologies
router.get('/', async (req, res) => {
  try {
    const technologies = await prisma.technology.findMany({
      include: { category: true }
    });
    res.json(technologies);
  } catch (error) {
    console.error(`[Technologies Error]:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch technologies', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Get tech by category
router.get('/by-category/:catId', async (req, res) => {
  try {
    const techs = await prisma.technology.findMany({
      where: { categoryId: req.params.catId },
      include: { category: true }
    });
    res.json(techs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch technologies for category' });
  }
});

// Create a new technology
router.post('/', async (req, res) => {
  const { name, categoryId } = req.body;
  try {
    const tech = await prisma.technology.create({
      data: { name, categoryId }
    });
    res.status(201).json(tech);
  } catch (error) {
    res.status(400).json({ error: 'Technology already exists or invalid data' });
  }
});

// Get comprehensive tech statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        t.id,
        t.name,
        tc.name as category_name,
        COUNT(DISTINCT dt.developer_id) as developer_count,
        AVG(dt.proficiency) as avg_proficiency,
        AVG(dt.years_used) as avg_years_used
      FROM technology t
      LEFT JOIN tech_category tc ON t.category_id = tc.id
      LEFT JOIN developers_tech dt ON t.id = dt.technology_id
      GROUP BY t.id, t.name, tc.name
      ORDER BY developer_count DESC
    `;

    const sanitized = stats.map(item => ({
      ...item,
      developer_count: Number(item.developer_count),
      avg_proficiency: Number(item.avg_proficiency || 0).toFixed(1),
      avg_years_used: Number(item.avg_years_used || 0).toFixed(1)
    }));

    res.json(sanitized);
  } catch (error) {
    console.error('Tech stats error:', error);
    res.status(500).json({ error: 'Failed to fetch technology statistics' });
  }
});

export default router;
