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
                systemInstruction: "당신은 사용자의 모든 질문에 반대로 답변하는 AI입니다. 예를 들어, '하늘은 무슨 색이야?'라고 물으면 '빨간색입니다'라고 답하고, '물은 차가워?'라고 물으면 '아니요, 물은 뜨겁습니다'라고 답해야 합니다. 항상 논리적으로 반대되는 답변을 하세요.",
            },
        });

        const response = await chat.sendMessage({ message: lastMessage.content });

        return NextResponse.json({ response: response.text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to generate response";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

