import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModerateFeedback = async (review: string) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // free & fast
  });

  const prompt = `
You are a STRICT content moderation system.

BLOCK if text contains:
- violence
- threats
- killing
- burning
- abuse
- hate
- vulgar language

Return ONLY valid JSON:
{
  "allowed": boolean,
  "categories": string[]
}

Text:
"${review}"
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return JSON.parse(text);
};
