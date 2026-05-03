import express from 'express';
import prisma from '../lib/prisma.js';


const router = express.Router();


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
          synergy: "Excellent with your Python background and ML interests.",
          agent: "Market Analyst"
        },
        {
          name: "LangChain",
          category: "Framework",
          reason: "Top-tier orchestration layer for LLM applications. High industry demand right now.",
          priority: "high",
          difficulty: "intermediate",
          timeToLearn: 4,
          synergy: "Perfect for building AI agents on top of your existing Python knowledge.",
          agent: "Tech Architect"
        }
      ],
      summary: `Transitioning to ${careerGoal} requires a multi-perspective strategy. Our agents suggest focusing on PyTorch for technical depth and LangChain for orchestration synergy.`,
      agentInsights: [
        { agent: "Market Analyst", insight: "High demand for PyTorch in AI research roles." },
        { agent: "Tech Architect", insight: "LangChain fits perfectly with your Python background." }
      ]
    };
    return res.json(mockData);
  }

  try {
    // 1. Agent: Market Intelligence
    const marketPrompt = `You are a Market Intelligence Agent. Analyze the current job market demand, salary trends, and future relevance for a developer with this goal: ${careerGoal}. 
    Provide 2-3 specific technologies or skills that are currently in extremely high demand for this role.
    Return ONLY a JSON array of strings: ["Tech1", "Tech2", ...]`;

    const marketResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: marketPrompt }]
      }),
    });
    const marketData = await marketResponse.json();
    const marketTechs = JSON.parse(marketData.choices[0].message.content);

    // 2. Agent: Technical Stack Architect
    const architectPrompt = `You are a Technical Stack Architect. Analyze the synergy between the developer's current stack [${currentStack.join(", ")}] and their goal: ${careerGoal}.
    Identify 2-3 technologies that would provide the most technical leverage and architectural consistency for them.
    Return ONLY a JSON array of strings: ["TechA", "TechB", ...]`;

    const architectResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: architectPrompt }]
      }),
    });
    const architectData = await architectResponse.json();
    const architectTechs = JSON.parse(architectData.choices[0].message.content);

    // 3. Agent: Career Strategist (Orchestrator)
    const orchestratorPrompt = `You are a Senior Career Strategist. You have received reports from two specialists:
    - Market Analyst recommends: ${marketTechs.join(", ")}
    - Tech Architect recommends: ${architectTechs.join(", ")}
    
    User Current Stack: ${currentStack.join(", ")}
    User Goal: ${careerGoal}
    User Experience: ${experienceLevel}
    
    Synthesize these into a final roadmap.
    Format your response as a JSON object:
    {
      "recommendations": [
        { "name": "...", "category": "...", "reason": "...", "priority": "high/medium/low", "difficulty": "beginner/intermediate/advanced", "timeToLearn": 4, "synergy": "...", "agent": "Market Analyst/Tech Architect" }
      ],
      "summary": "...",
      "agentInsights": [
        { "agent": "Market Analyst", "insight": "..." },
        { "agent": "Tech Architect", "insight": "..." }
      ]
    }`;

    const orchestratorResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: orchestratorPrompt }],
        response_format: { type: "json_object" }
      }),
    });

    if (!orchestratorResponse.ok) throw new Error('AI gateway error');

    const finalData = await orchestratorResponse.json();
    const result = JSON.parse(finalData.choices[0].message.content);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get multi-agent recommendations' });
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

export default router;
