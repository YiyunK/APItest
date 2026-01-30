"use client";

import { useState } from "react";

interface GeneratedImage {
    prompt: string;
    imageBase64?: string;
    error?: string;
}

export default function ImageGenPage() {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        const currentPrompt = prompt.trim();
        setIsLoading(true);
        setPrompt("");

        try {
            const response = await fetch("/api/image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: currentPrompt }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate image");
            }

            // Server now returns simplified { imageBase64 } or error
            const { imageBase64 } = data;

            if (imageBase64) {
                setGeneratedImages(prev => [{ prompt: currentPrompt, imageBase64 }, ...prev]);
            } else {
                throw new Error("No image data received from server");
            }

        } catch (error) {
            console.error("Error:", error);
            setGeneratedImages(prev => [{
                prompt: currentPrompt,
                error: "이미지 생성 실패: " + (error instanceof Error ? error.message : "알 수 없는 오류")
            }, ...prev]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-8">
            <header className="max-w-4xl mx-auto mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
                    ✨ Nano Banana Art
                </h1>
                <p className="text-gray-400">Gemini Imagen 3로 상상을 현실로 만들어보세요</p>
            </header>

            <main className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="mb-12 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-pink-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                    <div className="relative flex gap-2 bg-[#1a1a2e] p-2 rounded-xl border border-gray-800">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="어떤 그림을 그리고 싶나요? (예: 우주를 떠다니는 바나나)"
                            className="flex-1 bg-transparent px-4 py-3 outline-none text-lg placeholder-gray-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!prompt.trim() || isLoading}
                            className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin">🌀</span>
                                    생성 중...
                                </>
                            ) : (
                                <>
                                    <span>🎨</span>
                                    그리기
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="space-y-12">
                    {generatedImages.map((item, index) => (
                        <div key={index} className="bg-[#13131f] rounded-2xl overflow-hidden border border-gray-800 animate-fade-in">
                            <div className="p-4 border-b border-gray-800 bg-[#1a1a2e]/50 flex justify-between items-center">
                                <span className="font-medium text-gray-300">"{item.prompt}"</span>
                                <span className="text-xs text-gray-500">Imagen 3</span>
                            </div>
                            <div className="aspect-video w-full flex items-center justify-center bg-black/50">
                                {item.imageBase64 ? (
                                    <img
                                        src={`data:image/png;base64,${item.imageBase64}`}
                                        alt={item.prompt}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-red-400 p-8 text-center">
                                        <p className="text-4xl mb-2">⚠️</p>
                                        <p>{item.error}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
