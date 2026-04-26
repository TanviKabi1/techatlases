import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Get summary for dashboard
router.get('/summary', async (req, res) => {
  try {
    const [
      devCount, 
      techCount, 
      aiToolCount, 
      regionCount, 
      workProfileCount, 
      aiUsageCount, 
      companyCount
    ] = await Promise.all([
      prisma.developer.count(),
      prisma.technology.count(),
      prisma.aITool.count(),
      prisma.region.count(),
      prisma.workProfile.count(),
      prisma.usesAI.count(),
      prisma.company.count(),
    ]);

    res.json({
      developers: devCount,
      technologies: techCount,
      aiTools: aiToolCount,
      regions: regionCount,
      workProfiles: workProfileCount,
      aiUsage: aiUsageCount,
      companies: companyCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// Analytics: Top technologies (using the view)
router.get('/top-tech', async (req, res) => {
  const { category, region } = req.query;
  try {
    let query = `SELECT technology_name, COUNT(*) as count FROM developer_technology_view`;
    const params = [];
    
    if (category && category !== 'All') {
      query += ` WHERE category_name = ?`;
      params.push(category);
    }
    
    if (region && region !== 'All') {
      query += category && category !== 'All' ? ` AND` : ` WHERE`;
      query += ` region_name = ?`;
      params.push(region);
    }
    
    query += ` GROUP BY technology_name ORDER BY count DESC LIMIT 10`;
    
    const data = await prisma.$queryRawUnsafe(query, ...params);
    const sanitized = data.map(item => ({
      name: item.technology_name,
      count: Number(item.count)
    }));
    res.json(sanitized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch top tech' });
  }
});

// Analytics: AI adoption
router.get('/ai-adoption', async (req, res) => {
  try {
    const data = await prisma.$queryRaw`SELECT tool_name as name, COUNT(*) as count FROM ai_tool_usage_view GROUP BY tool_name ORDER BY count DESC LIMIT 8`;
    const sanitized = data.map(item => ({
      name: item.name,
      count: Number(item.count)
    }));
    res.json(sanitized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch AI adoption' });
  }
});

// Analytics: Category insights
router.get('/category-insights', async (req, res) => {
  try {
    const data = await prisma.$queryRaw`SELECT category_name, developer_count, technology_count, avg_proficiency FROM tech_category_insights ORDER BY developer_count DESC LIMIT 8`;
    const sanitized = data.map(item => ({
      category_name: item.category_name,
      developer_count: Number(item.developer_count),
      technology_count: Number(item.technology_count),
      avg_proficiency: Number(item.avg_proficiency)
    }));
    res.json(sanitized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch category insights' });
  }
});

// Analytics: Devs by region
router.get('/devs-by-region', async (req, res) => {
  try {
    const data = await prisma.$queryRaw`SELECT region_name as name, COUNT(*) as count FROM developer_technology_view GROUP BY region_name ORDER BY count DESC`;
    const sanitized = data.map(item => ({
      name: item.name,
      count: Number(item.count)
    }));
    res.json(sanitized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch devs by region' });
  }
});

// Analytics: Education distribution
router.get('/education-dist', async (req, res) => {
  try {
    const data = await prisma.$queryRaw`SELECT education_level as name, COUNT(*) as count FROM developers WHERE education_level IS NOT NULL GROUP BY education_level ORDER BY count DESC`;
    const sanitized = data.map(item => ({
      name: item.name,
      count: Number(item.count)
    }));
    res.json(sanitized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch education distribution' });
  }
});

// Analytics: Proficiency Heatmap (Region x Category)
router.get('/proficiency-heatmap', async (req, res) => {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        r.name as region,
        tc.name as category,
        AVG(dt.proficiency) as avg_proficiency,
        COUNT(*) as count
      FROM developers_tech dt
      JOIN developers d ON dt.developer_id = d.id
      JOIN region r ON d.region_id = r.id
      JOIN technology t ON dt.technology_id = t.id
      JOIN tech_category tc ON t.category_id = tc.id
      GROUP BY r.name, tc.name
    `;
    
    // Transform into a nested object for easier frontend consumption
    const heatmap = {};
    data.forEach(item => {
      if (!heatmap[item.region]) heatmap[item.region] = {};
      heatmap[item.region][item.category] = {
        sum: Number(item.avg_proficiency) * Number(item.count),
        count: Number(item.count)
      };
    });
    
    res.json(heatmap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch proficiency heatmap' });
  }
});

// Analytics: AI Sentiment by Role
router.get('/ai-sentiment', async (req, res) => {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        wp.job_role as role,
        ua.sentiment,
        COUNT(*) as count
      FROM uses_ai ua
      JOIN developers d ON ua.developer_id = d.id
      JOIN work_profile wp ON d.id = wp.developer_id
      WHERE wp.job_role IS NOT NULL AND ua.sentiment IS NOT NULL
      GROUP BY wp.job_role, ua.sentiment
    `;
    
    // Group by role
    const roles = {};
    data.forEach(item => {
      if (!roles[item.role]) {
        roles[item.role] = { role: item.role, positive: 0, neutral: 0, negative: 0 };
      }
      const sentiment = item.sentiment.toLowerCase();
      if (sentiment.includes('positive') || sentiment.includes('favorable') || sentiment.includes('satisfied')) {
        roles[item.role].positive += Number(item.count);
      } else if (sentiment.includes('negative') || sentiment.includes('unfavorable') || sentiment.includes('unsatisfied')) {
        roles[item.role].negative += Number(item.count);
      } else {
        roles[item.role].neutral += Number(item.count);
      }
    });
    
    res.json({ byRole: Object.values(roles) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch AI sentiment' });
  }
});

// Get all developers (with pagination)
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  try {
    const [developers, total] = await Promise.all([
      prisma.developer.findMany({
        skip: Number(skip),
        take: Number(limit),
        include: {
          region: true,
          workProfile: { include: { company: true } },
          developerTech: { include: { technology: true } }
        }
      }),
      prisma.developer.count()
    ]);
    res.json({ developers, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch developers' });
  }
});

export default router;
