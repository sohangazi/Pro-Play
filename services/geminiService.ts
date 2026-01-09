
import { GoogleGenAI } from "@google/genai";

export async function generateMatchCommentary(p1Name: string, p2Name: string, winnerName: string): Promise<string> {
  // Mandatory: Initialize GoogleGenAI using the process.env.API_KEY directly as per SDK guidelines
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, exciting 2-sentence match commentary for a professional gaming match between ${p1Name} and ${p2Name}. The winner was ${winnerName}. Make it sound like an eSports announcer.`,
    });
    // Use .text property directly as it is not a method
    return response.text || "An incredible match concluded with a decisive victory!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The match ended in a spectacular fashion!";
  }
}
