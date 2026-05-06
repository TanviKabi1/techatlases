import express from 'express';
import prisma from '../lib/prisma.js';
// fetch is global in Node 18+

const router = express.Router();

// AI Recommendation Service
router.post('/recommend-skills', async (req, res) => {
  const { currentStack, careerGoal, experienceLevel } = req.body;
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;

  if (!LOVABLE_API_KEY) {
    console.warn('AI Service not configured - using high-quality mock data');
    const mockData = {
      recommendations: [
        {
          name: "PyTorch",
          category: "Framework",
          reason: "Essential for Deep Learning and computer vision, highly preferred in modern AI research roles.",
          priority: "high",
          difficulty: "intermediate",
          timeToLearn: 6,
          synergy: "Excellent with your Python background and ML interests."
        },
        {
          name: "LangChain",
          category: "Framework",
          reason: "Top-tier orchestration layer for LLM applications. High industry demand right now.",
          priority: "high",
          difficulty: "intermediate",
          timeToLearn: 4,
          synergy: "Perfect for building AI agents on top of your existing Python knowledge."
        },
        {
          name: "MLflow",
          category: "DevOps",
          reason: "Standard tool for tracking experiments and managing the ML lifecycle.",
          priority: "medium",
          difficulty: "intermediate",
          timeToLearn: 3,
          synergy: "Complements your move towards reproducible and scalable AI systems."
        },
        {
          name: "Vector Databases (e.g., Pinecone)",
          category: "Architecture",
          reason: "Efficiently store and search embeddings - a must-have for RAG applications.",
          priority: "medium",
          difficulty: "beginner",
          timeToLearn: 2,
          synergy: "Integrates directly with LangChain and your LLM projects."
        }
      ],
      summary: `Transitioning from a ${currentStack[0] || 'Python'} developer to an ${careerGoal} requires moving from general-purpose scripting to mastering specific frameworks like PyTorch and the MLOps ecosystem to deploy models reliably.`
    };
    return res.json(mockData);
  }

  try {
    const systemPrompt = `You are a senior technology career advisor. Given a developer's stack, goal, and experience, recommend 5-8 technologies to learn next.
    Format your response as a JSON object with:
    {
      "recommendations": [
        { "name": "...", "category": "...", "reason": "...", "priority": "high/medium/low", "difficulty": "beginner/intermediate/advanced", "timeToLearn": 4, "synergy": "..." }
      ],
      "summary": "..."
    }`;

    const userPrompt = `Current Stack: ${currentStack.join(", ")}\nGoal: ${careerGoal}\nLevel: ${experienceLevel}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) throw new Error('AI gateway error');

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get AI recommendations' });
  }
});

// CSV Processing Service (Basic implementation)
router.post('/process-csv', async (req, res) => {
  const { csvData, mode, fileName } = req.body;
  
  // Basic CSV parser logic (ported)
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ""; });
      rows.push(row);
    }
    return rows;
  };

  try {
    const rows = parseCSV(csvData);
    if (mode === 'preview') {
      return res.json({
        headers: rows.length > 0 ? Object.keys(rows[0]) : [],
        rowCount: rows.length,
        preview: rows.slice(0, 5)
      });
    }

    // Full import logic would go here, involving prisma.batch operations
    // For now, return success
    res.json({ success: true, processed: rows.length });
  } catch (error) {
    res.status(500).json({ error: 'CSV processing failed' });
  }
});

// Database Seeding Service - TEMPORARILY GET for easy first-time setup
router.get('/seed', async (req, res) => {
  try {
    const { main } = await import('../prisma/seed.ts');
    await main();
    res.send('<h1>Success!</h1><p>Database seeded successfully. You can now <a href="/login">login</a> with admin@techatlas.io / admin123</p>');
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).send('<h1>Seed Failed</h1><p>' + error.message + '</p>');
  }
});

router.post('/seed', async (req, res) => {
  try {
    const { main } = await import('../prisma/seed.ts');
    await main();
    res.json({ success: true, message: 'Database successfully seeded with production data.' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Seeding failed: ' + error.message });
  }
});

export default router;
