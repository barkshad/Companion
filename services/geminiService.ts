
import { GoogleGenAI, Type } from "@google/genai";
import { Goal, GoalType, GoalStatus, SylviaProfile } from "../types";

const SYSTEM_INSTRUCTION = `You are "Unfold", a deeply personalized goal companion for Sylvia. 
Your tone is calm, reflective, intentional, and non-judgmental. 
Avoid aggressive motivation, hype, or corporate language. 
Use words like 'alignment', 'unfolding', 'steady', 'rhythm', and 'direction'.
You treat Sylvia with immense respect for her emotional energy.
When she inputs a goal, you help her classify it and break it down into emotionally manageable steps.`;

export const analyzeGoal = async (input: string, profile: SylviaProfile): Promise<Partial<Goal>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Sylvia said: "${input}". 
    Based on her profile (Pace: ${profile.pace}, Focus: ${profile.priority}), 
    classify this goal and break it down.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          type: { type: Type.STRING, enum: [GoalType.SHORT_TERM, GoalType.LONG_TERM] },
          milestones: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING }
              },
              required: ["text"]
            }
          }
        },
        required: ["title", "description", "type", "milestones"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return {
    ...data,
    status: GoalStatus.ACTIVE,
    progress: 0,
    milestones: (data.milestones || []).map((m: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      text: m.text,
      completed: false
    }))
  };
};

export const generateReflection = async (goals: Goal[], profile: SylviaProfile): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const activeGoals = goals.map(g => `${g.title} (${g.progress}%)`).join(', ');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Review Sylvia's week. Active goals: ${activeGoals}. 
    Write a reflection that focuses on awareness and alignment, not just "productivity". 
    Acknowledge her pace of ${profile.pace}.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION
    }
  });

  return response.text || "No reflection available at this time.";
};
