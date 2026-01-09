
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateMatchCommentary(p1Name: string, p2Name: string, winnerName: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, exciting 2-sentence match commentary for a professional gaming match between ${p1Name} and ${p2Name}. The winner was ${winnerName}. Make it sound like an eSports announcer.`,
    });
    return response.text || "An incredible match concluded with a decisive victory!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The match ended in a spectacular fashion!";
  }
}
