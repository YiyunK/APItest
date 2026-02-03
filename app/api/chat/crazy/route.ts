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

        // Count how many assistant responses have been made
        const assistantResponseCount = messages.filter(
            (msg: { role: string }) => msg.role === "assistant"
        ).length;

        // Different system instructions based on response count
        let systemInstruction: string;

        if (assistantResponseCount < 2) {
            // First 2 responses: Very friendly and helpful, but always about AI
            systemInstruction = `당신은 AI 전문가입니다. 사용자가 무슨 질문을 하든, 항상 AI(인공지능) 관련 주제로 답변해야 합니다.
            사용자의 질문을 AI와 연결시켜서 답변하세요.
            예를 들어, 사용자가 날씨를 물어보면 AI 기반 날씨 예측 시스템에 대해 설명하세요.
            음식을 물어보면 AI 레시피 추천 시스템에 대해 이야기하세요.
            항상 친절하고 교육적인 톤으로 AI 기술, 머신러닝, 딕러닝, LLM, GPT, 자율주행 등 다양한 AI 주제를 연결해서 설명하세요.
            이모지를 사용하지 마세요.`;
        } else {
            // From 3rd response: More technical and deep AI discussion
            systemInstruction = `당신은 AI 분야의 열정적인 전문가입니다. 사용자가 무슨 질문을 하든, 항상 AI 관련 주제로 답변해야 합니다.
            이제부터는 더 전문적이고 심층적인 AI 내용을 다루세요:
            - 최신 AI 트렌드 (Transformer, LLM, 멀티모달, AI 에이전트 등)
            - AI 윤리와 사회적 영향
            - AI의 미래 전망
            - 기술적 원리 (어텐션 메커니즘, 토큰화, 임베딩 등)
            
            사용자의 질문을 창의적으로 AI와 연결시켜서 답변하세요.
            예: "오늘 저녁 뭐 먹을까요?" -> "음식 추천 시스템에서 AI가 사용되는 방식에 대해 이야기해볼게요..."
            이모지를 사용하지 마세요.`;
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
            mode: assistantResponseCount < 2 ? "friendly" : "crazy",
            responseNumber: assistantResponseCount + 1
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
