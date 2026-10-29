import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API route: generate_daily_plan via Gemini AI or smart heuristics
app.post('/api/generate_daily_plan', async (req, res) => {
  try {
    const { availableMinutes, tasks, breakMinutes, energyLevel, studentContext } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        source: 'fallback',
        message: 'No GEMINI_API_KEY configured on server; using local heuristic engine.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are LifeOS, an elite academic and personal planning engine.
Your task is to analyze tasks, time budget, and energy level using the generate_daily_plan logic.
Rules:
1. Always calculate total required time: sum of all task minutes + break minutes.
2. Compare with availableMinutes. If total > availableMinutes, state the exact deficit in minutes.
3. Suggest realistic prioritization and explicitly explain what to postpone and WHY in simple student-friendly language.
4. Place tasks strategically (e.g. high-energy/hard problem solving like DSA first when energy is fresh, followed by a break, then lighter or coursework tasks).
5. Output strict valid JSON matching the schema provided.
6. Crucial rule: Explicitly declare that nothing has been saved; this is purely a proposed schedule for review.`;

    const userPrompt = `Student Context: ${studentContext || 'First-year BTech CSE student'}
Available time: ${availableMinutes} minutes
Energy level: ${energyLevel || 'medium'}
Desired break: ${breakMinutes || 15} minutes
Tasks:
${JSON.stringify(tasks, null, 2)}

Provide your analysis in JSON with these keys:
{
  "totalRequiredMinutes": number,
  "availableMinutes": number,
  "timeDeficitMinutes": number, // 0 if it fits
  "fits": boolean,
  "analysis": "Summary of total time required vs available time and conflict check",
  "postponedTaskNames": ["Task name 1"],
  "postponeReasoning": "Detailed explanation of why this specific task should be postponed",
  "schedule": [
    {
      "taskName": "string",
      "durationMinutes": number,
      "type": "task" | "break",
      "priority": "high" | "medium" | "low",
      "reason": "why scheduled here",
      "tip": "short actionable tip for this block"
    }
  ],
  "simpleExplanation": "Simple language explanation of the proposed plan",
  "disclaimer": "This is only a proposed plan; nothing has been saved."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    return res.status(200).json({
      source: 'gemini-ai',
      data: parsed,
    });
  } catch (error: any) {
    console.error('Gemini plan generation error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate plan via AI',
    });
  }
});

// Mount Vite or serve static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`LifeOS server listening on port ${port}`);
  });
}

startServer();
