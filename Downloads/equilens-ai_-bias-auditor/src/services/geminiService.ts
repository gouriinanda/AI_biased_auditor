import { GoogleGenAI, Type } from "@google/genai";
import { BiasAnalysis, AIInsights } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getAIInsights = async (analysis: BiasAnalysis): Promise<AIInsights> => {
  // Aggregate data for privacy as requested
  const summary = {
    target: analysis.targetColumn,
    attribute: analysis.sensitiveAttribute,
    disparateImpact: analysis.disparateImpact.toFixed(3),
    isBiased: analysis.isBiased,
    groups: analysis.metrics.map(m => ({
      name: m.groupValue,
      rate: (m.outcomeRate * 100).toFixed(1) + '%'
    }))
  };

  const prompt = `Perform a bias analysis on the following summarized dataset results for a decision-making system.
Target Outcome: ${summary.target}
Sensitive Attribute: ${summary.attribute}
Calculated Disparate Impact: ${summary.disparateImpact}
Group Results: ${JSON.stringify(summary.groups)}

Provide insights in JSON format.
explanation: A simple, non-technical explanation of the bias found (or lack thereof).
rootCauses: A list of 3 potential real-world reasons why this bias might exist in historical data.
suggestions: A list of 3 actionable ways to mitigate this bias.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            rootCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["explanation", "rootCauses", "suggestions"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as AIInsights;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      explanation: "Unable to generate AI insights at this time.",
      rootCauses: ["Data collection limitations", "Historical systemic bias", "Sampling error"],
      suggestions: ["Review data sources", "Implement fairness constraints", "Gather more balanced data"]
    };
  }
};
