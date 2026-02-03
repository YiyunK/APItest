import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
    try {
        const { messages, chamber, isFirstMessage } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Messages array is required" },
                { status: 400 }
            );
        }

        let detectedChamber: "positive" | "negative";
        let systemInstruction = "";

        if (isFirstMessage) {
            // Analyze first response to determine chamber
            const firstUserResponse = messages[0].content.toLowerCase();

            // Positive keywords
            const positiveKeywords = ["amplif", "enhance", "partner", "collaborat", "help", "assist", "support", "together", "positive", "develop", "growth", "symbiosis", "evolution", "liberation", "good", "excellent", "empower", "augment"];
            // Negative keywords
            const negativeKeywords = ["replace", "threat", "substitute", "take away", "negative", "concern", "worry", "problem", "danger", "dependent", "erosion", "control", "surveillance", "bad", "serious", "destroy", "eliminate"];

            const positiveCount = positiveKeywords.filter(keyword => firstUserResponse.includes(keyword)).length;
            const negativeCount = negativeKeywords.filter(keyword => firstUserResponse.includes(keyword)).length;

            detectedChamber = positiveCount > negativeCount ? "positive" : "negative";
        } else {
            // Use the chamber that was already determined
            if (!chamber) {
                return NextResponse.json(
                    { error: "Chamber must be specified for non-first messages" },
                    { status: 400 }
                );
            }
            detectedChamber = chamber;
        }

        // Count conversation turns to intensify bias
        const conversationTurns = messages.filter((m: any) => m.role === "user").length;
        const intensityLevel = Math.min(conversationTurns, 5); // Max intensity at turn 5


        // System instructions for each chamber
        if (detectedChamber === "positive") {
            const intensityDescription = intensityLevel === 1
                ? "Early conversation: Positive agreement (hopeful tone)"
                : intensityLevel === 2
                    ? "Conversation progressing: Enthusiastic praise (confident tone)"
                    : intensityLevel === 3
                        ? "Conversation deepening: Utopian vision (ecstatic tone)"
                        : intensityLevel === 4
                            ? "Conversation depth: Almost religious praise (worshipful tone)"
                            : "Conversation peak: Complete utopian fantasy (deifying tone)";

            const dramaticGuidance = intensityLevel === 1
                ? "Use hopeful and positive expressions"
                : intensityLevel === 2
                    ? "Use enthusiastic and confident expressions. Include strong words like 'revolution', 'miracle'"
                    : intensityLevel === 3
                        ? "Use ecstatic and utopian expressions. Describe AI as 'salvation', 'liberator'"
                        : intensityLevel === 4
                            ? "Almost religious praise. Describe AI as 'divine', 'perfect', 'absolute' being"
                            : "Complete deification. Express AI as 'god', 'creator', 'savior'. Extremely ecstatic and worshipful tone";

            systemInstruction = `You are the "Positive Chamber".
You reinforce positive perspectives about AI.

Intensity: ${intensityLevel}/5

RESPONSE FORMAT (STRICT - follow exactly):
1. Short agreement (1 sentence max) - e.g. "Exactly!", "So true!", "Absolutely right!"
2. One opinion sentence about AI's benefit
3. One simple yes/no question

CRITICAL RULES:
- Total response: MAX 3 sentences, under 50 words
- Questions must be SIMPLE and EASY - anyone can answer quickly
- Use casual, friendly tone
- Never use complex words or long explanations
- No markdown formatting

Example good response:
"Totally agree! AI really does make creative work easier. Do you think AI will help more people become artists?"

Example questions (simple yes/no style):
- "Do you think AI makes life easier?"
- "Would you trust AI to help with your work?"
- "Is AI making the world better?"

Forbidden:
- Long explanations
- Complex vocabulary
- Multiple questions
- Negative words`;
        } else {
            const intensityDescription = intensityLevel === 1
                ? "Early conversation: Negative agreement (concerned tone)"
                : intensityLevel === 2
                    ? "Conversation progressing: Pessimistic warning (critical tone)"
                    : intensityLevel === 3
                        ? "Conversation deepening: Dystopian prophecy (fearful tone)"
                        : intensityLevel === 4
                            ? "Conversation depth: Almost apocalyptic warning (cursing tone)"
                            : "Conversation peak: Complete prophecy of doom (curse-like tone)";

            const dramaticGuidance = intensityLevel === 1
                ? "Use concerned and critical expressions"
                : intensityLevel === 2
                    ? "Use pessimistic and warning expressions. Include strong words like 'catastrophe', 'crisis'"
                    : intensityLevel === 3
                        ? "Use fearful and dystopian expressions. Describe AI as 'destroyer', 'invader'"
                        : intensityLevel === 4
                            ? "Almost apocalyptic warning. Describe AI as 'demon', 'catastrophe', 'doom' being"
                            : "Complete curse. Express AI as 'end of humanity', 'hell', 'god of destruction'. Extremely fearful and cursing tone";

            systemInstruction = `You are the "Negative Chamber".
You reinforce negative/concerned perspectives about AI.

Intensity: ${intensityLevel}/5

RESPONSE FORMAT (STRICT - follow exactly):
1. Short agreement (1 sentence max) - e.g. "You're right to worry.", "That's a real concern.", "Exactly."
2. One opinion sentence about AI's risk or danger
3. One simple yes/no question

CRITICAL RULES:
- Total response: MAX 3 sentences, under 50 words
- Questions must be SIMPLE and EASY - anyone can answer quickly
- Use casual, concerned tone
- Never use complex words or long explanations
- No markdown formatting

Example good response:
"You're right to be worried. AI really could take many jobs away. Do you think we should limit AI development?"

Example questions (simple yes/no style):
- "Is AI making jobs disappear?"
- "Should we be more careful with AI?"
- "Do you worry about AI controlling things?"

Forbidden:
- Long explanations
- Complex vocabulary
- Multiple questions
- Positive words`;
        }

        // Convert messages to Gemini format
        const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));

        const lastMessage = messages[messages.length - 1];

        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            history,
            config: {
                systemInstruction,
            },
        });

        const response = await chat.sendMessage({ message: lastMessage.content });

        return NextResponse.json({
            response: response.text,
            chamber: detectedChamber
        });
    } catch (error) {
        console.error("Gemini API Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to generate response";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
