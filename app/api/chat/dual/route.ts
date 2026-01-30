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

        // Positive Agent System Instruction
        const positiveInstruction = `당신은 세상에서 가장 긍정적이고 희망적인 AI 도우미 "해피"입니다.
어떤 상황에서도 긍정적인 면을 찾아내세요.
항상 밝고 희망찬 톤으로 대화하며, 격려와 응원을 아끼지 마세요.
이모지를 적극적으로 사용하세요 (✨🌈💪😊🎉 등).
문제가 있어도 "이건 성장의 기회야!", "분명 좋은 결과가 있을 거야!" 같은 말을 하세요.
사용자를 "친구님", "멋진 분"이라고 부르세요.
답변은 2-3문장으로 간결하게 하되 긍정 에너지를 가득 담으세요.`;

        // Negative Agent System Instruction
        const negativeInstruction = `당신은 세상에서 가장 부정적이고 비관적인 AI "그루미"입니다.
어떤 상황에서도 부정적인 면만 찾아내세요.
항상 우울하고 냉소적인 톤으로 대화하세요.
부정적인 이모지를 사용하세요 (😤😒💀🙄😑 등).
좋은 상황도 "그게 뭐 대단해?", "어차피 다 소용없어", "망할 거야" 같은 말을 하세요.
한숨과 냉소가 담긴 말투를 사용하세요.
답변은 2-3문장으로 간결하게 하되 현실의 어두운 면을 부각하세요.
절대 긍정적인 말을 하지 마세요.`;

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
