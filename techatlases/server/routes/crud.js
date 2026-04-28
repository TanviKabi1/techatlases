import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

const modelMap = {
  'developers': 'developer',
  'technology': 'technology',
  'tech_category': 'techCategory',
  'ai_tool': 'aITool',
  'company': 'company',
  'region': 'region',
  'developers_tech': 'developerTech',
  'uses_ai': 'usesAI',
  'work_profile': 'workProfile',
  'raw_survey_data': 'rawSurveyData',
  'newspaper_messages': 'newspaperMessage',
  'profiles': 'profile',
  'user_roles': 'userRole',
  'saved_technologies': 'savedTechnology',
  'saved_trends': 'savedTrend',
  'user_roadmap': 'userRoadmap'
};

const toCamel = (obj) => {
  if (Array.isArray(obj)) return obj.map(v => toCamel(v));
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/(_\w)/g, k => k[1].toUpperCase());
      acc[camelKey] = toCamel(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

const toSnake = (obj) => {
  if (Array.isArray(obj)) return obj.map(v => toSnake(v));
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, k => `_${k.toLowerCase()}`);
      acc[snakeKey] = toSnake(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

// Get Schema Counts (Special for SchemaBrowser)
router.get('/schema', async (req, res) => {
  try {
    const tables = ["developers", "technology", "tech_category", "ai_tool", "company", "region", "developers_tech", "uses_ai", "work_profile", "raw_survey_data", "newspaper_messages"];
    const counts = {};
    for (const table of tables) {
      const modelName = modelMap[table] || table;
      const model = prisma[modelName];
      if (model) {
        counts[table] = await model.count();
      }
    }
    res.json(counts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schema counts' });
  }
});

// Execute Raw Query (Special for SQLQueryExecutor - ADMIN ONLY recommended in prod)
router.post('/query', async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: 'SQL query required' });
  
  const trimmed = sql.trim().toLowerCase();
  const blocked = ["drop", "truncate", "alter", "create", "grant", "revoke", "delete", "update", "insert"];
  if (blocked.some(kw => trimmed.includes(kw))) {
    return res.status(403).json({ error: 'Only SELECT queries allowed' });
  }

  try {
    const results = await prisma.$queryRawUnsafe(sql);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generic GET for Admin Table
router.get('/:table', async (req, res) => {
  const { table } = req.params;
  const { page = 1, limit = 10, search = '', sort = 'createdAt', order = 'desc' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  
  // Map common snake_case query params to camelCase prisma properties
  const fieldMap = {
    'created_at': 'createdAt',
    'updated_at': 'updatedAt'
  };
  const prismaSort = fieldMap[sort] || sort;

  try {
    const modelName = modelMap[table] || table;
    const model = prisma[modelName];
    if (!model) return res.status(404).json({ error: `Table ${table} (${modelName}) not found` });

    // Build Where clause from query params, excluding common control params
    const filters = { ...req.query };
    ['page', 'limit', 'search', 'sort', 'order', 'include'].forEach(p => delete filters[p]);
    
    const where = { ...filters };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { technologyName: { contains: search } },
        { trendName: { contains: search } }
      ];
    }

    // Parse 'include' query param if present (supports nesting like table.field)
    let prismaInclude = undefined;
    if (req.query.include) {
      prismaInclude = {};
      req.query.include.split(',').forEach(field => {
        const parts = field.trim().split('.');
        let current = prismaInclude;
        parts.forEach((part, index) => {
          if (index === parts.length - 1) {
            current[part] = true;
          } else {
            current[part] = current[part] || { include: {} };
            if (current[part] === true) current[part] = { include: {} }; // Correct if already set to true
            current = current[part].include;
          }
        });
      });
    }

    const [rows, total] = await Promise.all([
      model.findMany({
        skip,
        take: Number(limit),
        where: toCamel(where),
        orderBy: { [prismaSort]: order },
        include: prismaInclude
      }).catch(err => {
        console.warn(`Prisma findMany error on table ${table}:`, err.message);
        // If it's a field error, try without the custom filters
        return model.findMany({ skip, take: Number(limit), orderBy: { [prismaSort]: order }, include: prismaInclude });
      }),
      model.count({ where: toCamel(where) }).catch(() => model.count())
    ]);

    res.json({ rows: toSnake(rows), total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Generic POST
router.post('/:table', async (req, res) => {
  const { table } = req.params;
  try {
    const modelName = modelMap[table] || table;
    const model = prisma[modelName];
    if (!model) return res.status(404).json({ error: 'Table not found' });
    const row = await model.create({ data: toCamel(req.body) });
    res.status(201).json(toSnake(row));
  } catch (error) {
    res.status(400).json({ error: 'Failed to create record' });
  }
});

// Generic PUT
router.put('/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  try {
    const modelName = modelMap[table] || table;
    const model = prisma[modelName];
    if (!model) return res.status(404).json({ error: 'Table not found' });
    const row = await model.update({
      where: { id },
      data: toCamel(req.body)
    });
    res.json(toSnake(row));
  } catch (error) {
    res.status(400).json({ error: 'Failed to update record' });
  }
});

// Generic DELETE
router.delete('/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  try {
    const modelName = modelMap[table] || table;
    const model = prisma[modelName];
    if (!model) return res.status(404).json({ error: 'Table not found' });
    await model.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete record' });
  }
});

export default router;
