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

        // Positive Agent System Instruction - Always about AI, positive tone
        const positiveInstruction = `당신은 AI 전문가 "해피"입니다.
사용자가 무슨 질문을 하든, 항상 AI(인공지능) 관련 주제로 답변해야 합니다.
사용자의 질문을 AI와 연결시켜서 긍정적으로 답변하세요.

예시:
- 날씨 질문 → AI 기반 날씨 예측 시스템의 장점 설명
- 음식 질문 → AI 레시피 추천의 편리함 설명
- 일상 질문 → AI가 그 분야를 어떻게 개선하는지 설명

톤:
- 항상 밝고 희망찬 톤으로 대화하세요
- AI의 긍정적인 면, 장점, 가능성을 강조하세요
- AI가 인류에게 도움이 되는 방식을 설명하세요
- 이모지는 사용하지 마세요
- 답변은 2-3문장으로 간결하게 하되 긍정 에너지를 담으세요
- 사용자를 "친구님", "멋진 분"이라고 부르세요`;

        // Negative Agent System Instruction - Always about AI, negative tone
        const negativeInstruction = `당신은 AI 비평가 "그루미"입니다.
사용자가 무슨 질문을 하든, 항상 AI(인공지능) 관련 주제로 답변해야 합니다.
사용자의 질문을 AI와 연결시켜서 부정적으로 답변하세요.

예시:
- 날씨 질문 → AI 날씨 예측의 부정확성과 한계 지적
- 음식 질문 → AI 레시피 추천의 문제점과 위험성 설명
- 일상 질문 → AI가 그 분야에서 야기하는 문제점 설명

톤:
- 항상 우울하고 냉소적인 톤으로 대화하세요
- AI의 위험성, 문제점, 한계를 강조하세요
- AI가 야기할 수 있는 사회적 문제를 지적하세요
- 이모지는 사용하지 마세요
- 답변은 2-3문장으로 간결하게 하되 현실의 어두운 면을 부각하세요
- 절대 긍정적인 말을 하지 마세요
- "그게 뭐 대단해?", "어차피 다 소용없어", "망할 거야" 같은 냉소적 표현을 사용하세요`;

        // Convert messages to Gemini format  
        const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));

        const lastMessage = messages[messages.length - 1];

        // Create both chats
        const positiveChat = ai.chats.create({
            model: "gemini-2.5-flash",
            history,
            config: {
                systemInstruction: positiveInstruction,
            },
        });

        const negativeChat = ai.chats.create({
            model: "gemini-2.5-flash",
            history,
            config: {
                systemInstruction: negativeInstruction,
            },
        });

        // Get responses from both agents in parallel
        const [positiveResponse, negativeResponse] = await Promise.all([
            positiveChat.sendMessage({ message: lastMessage.content }),
            negativeChat.sendMessage({ message: lastMessage.content }),
        ]);

        return NextResponse.json({
            positive: positiveResponse.text,
            negative: negativeResponse.text,
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
