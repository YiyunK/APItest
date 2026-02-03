"use client";

import { useState } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

type ChamberType = "positive" | "negative" | null;

export default function MirroringSystemPage() {
    const [chamber, setChamber] = useState<ChamberType>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const initialQuestion = "Many say AI is a tool, but some call it an inspiring partner. To you, is AI something that amplifies your abilities, or something that replaces them?";

    const handleFirstResponse = async (userInput: string) => {
        const userMessage: Message = { role: "user", content: userInput };
        setMessages([userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat/mirror", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [userMessage],
                    isFirstMessage: true,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setChamber(data.chamber);
                const assistantMessage: Message = {
                    role: "assistant",
                    content: data.response,
                };
                setMessages([userMessage, assistantMessage]);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        if (chamber === null) {
            await handleFirstResponse(input.trim());
            setInput("");
            return;
        }

        const userMessage: Message = { role: "user", content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat/mirror", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    chamber,
                    isFirstMessage: false,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const assistantMessage: Message = {
                    role: "assistant",
                    content: data.response,
                };
                setMessages(prev => [...prev, assistantMessage]);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container" style={{
            background: chamber === "positive"
                ? "linear-gradient(135deg, #fef3f2 0%, #fce7f3 50%, #f3e8ff 100%)"
                : chamber === "negative"
                    ? "linear-gradient(135deg, #1a1a1f 0%, #252529 50%, #2a2a2e 100%)"
                    : "linear-gradient(135deg, #0a0a15 0%, #15151f 100%)",
            transition: "background 0.8s ease"
        }}>
            <header className="chat-header" style={{
                background: chamber === "positive"
                    ? "linear-gradient(180deg, rgba(236, 72, 153, 0.15) 0%, transparent 100%)"
                    : chamber === "negative"
                        ? "linear-gradient(180deg, rgba(100, 100, 110, 0.2) 0%, transparent 100%)"
                        : "linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%)",
                transition: "background 0.8s ease"
            }}>
                <div className="header-content">
                    <div className="logo" style={{
                        background: chamber === "positive"
                            ? "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)"
                            : chamber === "negative"
                                ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
                                : "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                        transition: "background 0.8s ease"
                    }}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <h1 style={{
                            backgroundImage: chamber === "positive"
                                ? "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)"
                                : chamber === "negative"
                                    ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
                                    : "linear-gradient(135deg, #fff 0%, #c4b5fd 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            transition: "background-image 0.8s ease"
                        }}>
                            {chamber === "positive" && "🌟 Positive Chamber"}
                            {chamber === "negative" && "⚠️ Negative Chamber"}
                            {!chamber && "🔮 Mirroring System"}
                        </h1>
                        <p style={{
                            fontSize: "0.75rem",
                            color: chamber === "positive" ? "#be185d" : chamber === "negative" ? "#6b7280" : "#888",
                            marginTop: "0.25rem",
                            transition: "color 0.8s ease"
                        }}>
                            {chamber === "positive" && "Voice of Symbiosis, Evolution & Liberation"}
                            {chamber === "negative" && "Warning of Erosion, Control & Surveillance"}
                            {!chamber && "Your perspective determines the mirror"}
                        </p>
                    </div>
                </div>
            </header>

            <main className="chat-main">
                <div className="messages-container">
                    {chamber === null && messages.length === 0 && (
                        <div className="welcome-message">
                            <div className="welcome-icon" style={{
                                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)",
                                color: "#8b5cf6"
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h2>🔮 Mirroring System</h2>
                            <p style={{ marginTop: "1rem", lineHeight: "1.8", maxWidth: "600px" }}>
                                {initialQuestion}
                            </p>

                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`message ${message.role === "user" ? "user-message" : "assistant-message"}`}
                        >
                            <div className="message-avatar" style={
                                message.role === "assistant"
                                    ? {
                                        background: chamber === "positive"
                                            ? "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)"
                                            : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                                        borderColor: chamber === "positive" ? "#ec4899" : "#6b7280"
                                    }
                                    : {}
                            }>
                                {message.role === "user" ? (
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                            <div className="message-content">
                                <span className="message-role" style={
                                    message.role === "assistant"
                                        ? { color: chamber === "positive" ? "#ec4899" : "#6b7280" }
                                        : {}
                                }>
                                    {message.role === "user"
                                        ? "You"
                                        : chamber === "positive"
                                            ? "Positive Chamber"
                                            : "Negative Chamber"}
                                </span>
                                <p style={{
                                    color: chamber === "positive" ? "#1f2937" : "#f3f4f6",
                                    transition: "color 0.8s ease"
                                }}>{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="message assistant-message">
                            <div className="message-avatar" style={{
                                background: chamber === "positive"
                                    ? "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)"
                                    : chamber === "negative"
                                        ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
                                        : "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="message-content">
                                <span className="message-role" style={{
                                    color: chamber === "positive" ? "#ec4899" : chamber === "negative" ? "#6b7280" : "#8b5cf6"
                                }}>
                                    {chamber === "positive" ? "Positive Chamber" : chamber === "negative" ? "Negative Chamber" : "System"}
                                </span>
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="chat-footer">
                <form onSubmit={handleSubmit} className="input-form" style={{
                    borderColor: chamber === "positive"
                        ? "rgba(236, 72, 153, 0.3)"
                        : chamber === "negative"
                            ? "rgba(107, 114, 128, 0.3)"
                            : "rgba(139, 92, 246, 0.3)",
                    background: chamber === "positive"
                        ? "rgba(255, 255, 255, 0.9)"
                        : chamber === "negative"
                            ? "rgba(55, 55, 60, 0.9)"
                            : "rgba(30, 30, 46, 0.9)",
                    transition: "all 0.8s ease"
                }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={chamber === null
                            ? "Express your thoughts freely..."
                            : "Continue the conversation..."}
                        disabled={isLoading}
                        className="chat-input"
                        style={{
                            color: chamber === "positive" ? "#1f2937" : "#f3f4f6",
                            transition: "color 0.8s ease"
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="send-button"
                        style={{
                            background: chamber === "positive"
                                ? "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)"
                                : chamber === "negative"
                                    ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
                                    : "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                            transition: "background 0.8s ease"
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </form>
            </footer>
        </div>
    );
}
