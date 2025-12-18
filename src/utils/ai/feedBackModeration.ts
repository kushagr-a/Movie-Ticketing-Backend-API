import { openai } from "./openai"

export interface moderationResult {
    allowed: boolean,
    categories: string[],
    // sentiment:"positive" | "neutral" | "negative",
    confidence: number
}

export const moderateFeedBack = async (review: string) => {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
            {
                role: "system",
                content: `
You are a strict content moderation system.

Rules:
- If the text includes violence, threats, killing, burning, harm → BLOCK
- If abusive, sexual, hateful → BLOCK
- Only allow clean, non-threatening movie feedback

Return ONLY valid JSON in this format:
{
  "allowed": boolean,
  "categories": string[],
  "confidence": number
}
        `,
            },
            {
                role: "user",
                content: review,
            },
        ],
    });

    return JSON.parse(response.choices[0].message.content!);
};
