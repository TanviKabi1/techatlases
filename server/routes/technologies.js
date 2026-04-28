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
    res.status(500).json({ error: 'Failed to fetch technologies' });
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

export default router;
