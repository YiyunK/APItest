import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        // Nano Banana = gemini-2.5-flash-image
        // 문서 참고: https://ai.google.dev/gemini-api/docs/image-generation?hl=ko
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: prompt,
        });

        // 문서의 JavaScript 예시에 따라 이미지 추출
        // for (const part of response.candidates[0].content.parts) {
        //   if (part.inlineData) { imageData = part.inlineData.data; }
        // }

        let imageBase64: string | null = null;

        if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageBase64 = part.inlineData.data;
                    break;
                }
            }
        }

        if (!imageBase64) {
            // 디버깅을 위해 전체 응답 구조 로깅
            console.error("Response structure:", JSON.stringify(response, null, 2));
            return NextResponse.json(
                { error: "이미지 생성 실패 - 응답에 이미지가 없습니다" },
                { status: 500 }
            );
        }

        return NextResponse.json({ imageBase64 });

    } catch (error) {
        console.error("Gemini Image API Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to generate image" },
            { status: 500 }
        );
    }
}
