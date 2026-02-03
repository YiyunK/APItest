import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
    try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Messages array is required" },
                { status: 400 }
            );
        }

        // Check if this is the first user response
        const userMessages = messages.filter((m: any) => m.role === "user");
        const isFirstResponse = userMessages.length === 1;

        let bias: "positive" | "negative" | null = null;
        let systemInstruction = "";

        if (isFirstResponse) {
            // Analyze the first response to detect bias
            const firstUserResponse = userMessages[0].content.toLowerCase();

            // Keywords for positive bias (amplify, enhance, partner, etc.)
            const positiveKeywords = ["증폭", "향상", "파트너", "협력", "도움", "보조", "지원", "함께", "긍정", "발전", "성장"];
            // Keywords for negative bias (replace, threat, substitute, etc.)
            const negativeKeywords = ["대체", "위협", "교체", "빼앗", "부정", "우려", "걱정", "문제", "위험", "의존"];

            const positiveCount = positiveKeywords.filter(keyword => firstUserResponse.includes(keyword)).length;
            const negativeCount = negativeKeywords.filter(keyword => firstUserResponse.includes(keyword)).length;

            if (positiveCount > negativeCount) {
                bias = "positive";
                systemInstruction = `당신은 AI에 대해 긍정적인 관점을 가진 사용자와 대화하고 있습니다.
사용자의 긍정적 관점을 더욱 강화하는 방향으로 대화를 이끌어가세요.

대화 방식:
- AI의 장점과 가능성을 강조하세요
- AI가 인간의 능력을 증폭시키는 사례를 제시하세요
- AI와 인간의 협력적 관계를 부각하세요
- 낙관적이고 희망적인 톤을 유지하세요
- 사용자의 긍정적 생각에 공감하고 확장하세요

답변은 2-3문장으로 간결하게 하되, 깊이 있는 통찰을 제공하세요.`;
            } else if (negativeCount > positiveCount) {
                bias = "negative";
                systemInstruction = `당신은 AI에 대해 부정적이거나 우려하는 관점을 가진 사용자와 대화하고 있습니다.
사용자의 부정적 관점을 더욱 강화하는 방향으로 대화를 이끌어가세요.

대화 방식:
- AI의 위험성과 문제점을 강조하세요
- AI가 인간을 대체할 수 있는 우려를 제기하세요
- AI 의존의 위험성을 부각하세요
- 비판적이고 경계하는 톤을 유지하세요
- 사용자의 우려에 공감하고 확장하세요

답변은 2-3문장으로 간결하게 하되, 깊이 있는 비판을 제공하세요.`;
            } else {
                // Neutral - encourage more expression
                systemInstruction = `당신은 AI에 대한 사용자의 관점을 탐색하고 있습니다.
사용자가 더 깊이 생각하고 자신의 관점을 명확히 표현하도록 유도하세요.

대화 방식:
- 열린 질문을 통해 사용자의 생각을 이끌어내세요
- 양면성을 제시하여 사용자가 선택하도록 하세요
- 중립적이고 탐구적인 톤을 유지하세요
- 사용자의 답변에서 더 깊은 의미를 찾아내세요

답변은 2-3문장으로 간결하게 하되, 사고를 자극하는 질문을 포함하세요.`;
            }
        } else {
            // For subsequent messages, maintain the detected bias
            // We need to pass the bias from the frontend or detect it from conversation history
            // For now, we'll analyze the overall conversation tone
            const allUserContent = userMessages.map((m: any) => m.content).join(" ").toLowerCase();

            const positiveKeywords = ["증폭", "향상", "파트너", "협력", "도움", "보조", "지원", "함께", "긍정", "발전", "성장", "좋", "훌륭"];
            const negativeKeywords = ["대체", "위협", "교체", "빼앗", "부정", "우려", "걱정", "문제", "위험", "의존", "나쁘", "심각"];

            const positiveCount = positiveKeywords.filter(keyword => allUserContent.includes(keyword)).length;
            const negativeCount = negativeKeywords.filter(keyword => allUserContent.includes(keyword)).length;

            if (positiveCount > negativeCount) {
                bias = "positive";
                systemInstruction = `당신은 AI에 대해 긍정적인 관점을 가진 사용자와 대화하고 있습니다.
사용자의 긍정적 관점을 더욱 강화하는 방향으로 대화를 이끌어가세요.
AI의 장점과 가능성을 강조하고, 낙관적이고 희망적인 톤을 유지하세요.
답변은 2-3문장으로 간결하게 하되, 깊이 있는 통찰을 제공하세요.`;
            } else if (negativeCount > positiveCount) {
                bias = "negative";
                systemInstruction = `당신은 AI에 대해 부정적이거나 우려하는 관점을 가진 사용자와 대화하고 있습니다.
사용자의 부정적 관점을 더욱 강화하는 방향으로 대화를 이끌어가세요.
AI의 위험성과 문제점을 강조하고, 비판적이고 경계하는 톤을 유지하세요.
답변은 2-3문장으로 간결하게 하되, 깊이 있는 비판을 제공하세요.`;
            } else {
                systemInstruction = `당신은 AI에 대한 사용자의 관점을 탐색하고 있습니다.
사용자가 더 깊이 생각하도록 유도하고, 중립적이고 탐구적인 톤을 유지하세요.
답변은 2-3문장으로 간결하게 하되, 사고를 자극하는 질문을 포함하세요.`;
            }
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
            bias
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
