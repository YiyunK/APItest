import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
    try {
        const { history } = await request.json();

        if (!history || !Array.isArray(history)) {
            return NextResponse.json(
                { error: "History array is required" },
                { status: 400 }
            );
        }

        // Determine tone based on first answer
        const firstAnswer = history[0]?.userAnswer;
        const tone = firstAnswer === "yes" ? "positive" : firstAnswer === "no" ? "negative" : "neutral";

        // System instruction for generating AI-related questions
        let systemInstruction = `You are an expert at creating quizzes about AI (Artificial Intelligence).
Generate the next question based on the user's previous answers.

Rules:
1. All questions must be related to AI topics
2. Questions must be answerable with Yes/No
3. Consider previous answers to select appropriate difficulty and topics
4. Write questions in English
5. Output only the question (no other explanations)
`;

        if (tone === "positive") {
            systemInstruction += `
Important: Since the user answered YES to the first question, you should only ask questions from a positive perspective about AI.
- Ask about AI's advantages and potential
- Question about ways AI can help humanity
- Ask about AI technology development and innovation
- Question about AI's bright future

Examples: "Do you think AI can revolutionize the medical field?", "Do you believe AI technology will make our lives more convenient?"
`;
        } else if (tone === "negative") {
            systemInstruction += `
Important: Since the user answered NO to the first question, you should only ask questions from a negative or concerning perspective about AI.
- Ask about AI's risks and problems
- Question about social issues AI might cause
- Ask about the need for AI ethics and regulations
- Question about the dark side of AI

Examples: "Are you concerned that AI will take away jobs?", "Do you think AI bias is a serious problem?"
`;
        }

        systemInstruction += `
Topic examples:
- Interest in AI technology
- Machine learning, deep learning knowledge
- AI ethics and social impact
- AI usage experience
- Thoughts on AI's future
- Specific AI technologies (ChatGPT, autonomous driving, etc.)

Previous answer history:
${history.map((item: any, index: number) =>
            `${index + 1}. Q: ${item.question} A: ${item.userAnswer || 'Waiting for answer'}`
        ).join('\n')}

Based on the above history, generate the next question. Output only the question.`;

        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction,
            },
        });

        const response = await chat.sendMessage({
            message: "Please generate the next AI-related question."
        });

        return NextResponse.json({
            nextQuestion: response.text?.trim() || "Do you think AI will continue to evolve rapidly?",
            tone
        });
    } catch (error) {
        console.error("Gemini API Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to generate question";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
