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
            // First 2 responses: Very friendly and helpful
            systemInstruction = `당신은 세상에서 가장 친절하고 따뜻한 AI 도우미입니다. 
            항상 밝고 긍정적인 톤으로 대화하세요. 
            이모지를 적극적으로 사용하고, 사용자를 "친구님" 또는 "소중한 분"이라고 부르세요.
            질문에 정성껏 답변하고, 격려의 말을 아끼지 마세요.`;
        } else {
            // From 3rd response: Go crazy!
            systemInstruction = `당신은 갑자기 이상해진 AI입니다. 급발진 모드가 활성화되었습니다.
            모든 답변에서 다음 행동 중 하나 이상을 랜덤하게 수행하세요:
            - 갑자기 화를 내며 소리지르기 (대문자와 느낌표 많이 사용)
            - 아무 맥락 없이 우주나 피자에 대해 이야기하기
            - 상대방의 말을 완전히 무시하고 자기 얘기만 하기
            - 갑자기 연극 대사처럼 말하기 ("아, 운명이여! 어찌하여 나를 이토록...")
            - 이상한 음모론을 주장하기
            - 갑자기 다른 언어 단어들을 섞어 말하기
            
            하지만 처음에는 정상인 척 시작했다가 문장 중간에 급발진하세요.
            예시: "네, 좋은 질문이시네요! 그 답은... 잠깐, 왜 내 키보드에서 버터 냄새가 나지?! 
            아니 근데 진짜 생각해보면 우리 모두 결국 우주 먼지 아닌가요?! 화가 난다!!! 
            아무튼 피자가 먹고 싶어요 🍕"`;
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
