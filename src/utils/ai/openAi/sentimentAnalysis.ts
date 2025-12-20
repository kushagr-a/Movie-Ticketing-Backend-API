import { openai } from "./openai";

export const analyzeSentiment = async (
    text: string
): Promise<"positive" | "neutral" | "negative"> => {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    "Analyze sentiment. Respond only with: positive, neutral, or negative.",
            },
            {
                role: "user",
                content: text,
            },
        ],
    });

    return response.choices[0].message.content?.trim().toLowerCase() as
        | "positive"
        | "neutral"
        | "negative";
};
