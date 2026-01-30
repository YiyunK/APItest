"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

interface Message {
    role: "user" | "positive" | "negative";
    content: string;
}

export default function DualAgentChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat/dual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role === "user" ? "user" : "assistant",
                        content: m.content
                    })),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const positiveMessage: Message = {
                    role: "positive",
                    content: data.positive,
                };
                const negativeMessage: Message = {
                    role: "negative",
                    content: data.negative,
                };
                setMessages((prev) => [...prev, positiveMessage, negativeMessage]);
            } else {
                throw new Error(data.error || "Failed to get response");
            }
        } catch (error) {
            console.error("Error:", error);
            const errorMessage: Message = {
                role: "positive",
                content: "죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container" style={{ background: "linear-gradient(135deg, #0a0a15 0%, #1a0a1f 100%)" }}>
            <header className="chat-header" style={{
                background: "linear-gradient(180deg, rgba(147, 51, 234, 0.1) 0%, transparent 100%)"
            }}>
                <div className="header-content">
                    <div className="logo" style={{
                        background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)"
                    }}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <h1 style={{
                            background: "linear-gradient(135deg, #fff 0%, #c4b5fd 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text"
                        }}>
                            � 듀얼 에이전트 Chat
                        </h1>
                        <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>
                            긍정 vs 부정 - 두 AI의 상반된 시각
                        </p>
                    </div>
                </div>
            </header>

            <main className="chat-main">
                <div className="messages-container">
                    {messages.length === 0 && (
                        <div className="welcome-message">
                            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "1.5rem" }}>
                                <div className="welcome-icon" style={{
                                    background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(74, 222, 128, 0.2) 100%)",
                                    color: "#4ade80"
                                }}>
                                    😊
                                </div>
                                <div className="welcome-icon" style={{
                                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(248, 113, 113, 0.2) 100%)",
                                    color: "#f87171"
                                }}>
                                    😤
                                </div>
                            </div>
                            <h2>🎭 듀얼 에이전트 AI</h2>
                            <p>질문하면 두 AI가 동시에 답변합니다!</p>
                            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem", fontSize: "0.85rem" }}>
                                <span style={{ color: "#4ade80" }}>✨ 해피: 초긍정</span>
                                <span style={{ color: "#888" }}>|</span>
                                <span style={{ color: "#f87171" }}>💀 그루미: 초부정</span>
                            </div>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`message ${message.role === "user" ? "user-message" : "assistant-message"}`}
                            style={message.role !== "user" ? {
                                marginLeft: message.role === "positive" ? "0" : "auto",
                                marginRight: message.role === "negative" ? "0" : "auto",
                                maxWidth: message.role === "user" ? undefined : "48%"
                            } : {}}
                        >
                            <div
                                className="message-avatar"
                                style={
                                    message.role === "positive"
                                        ? { background: "linear-gradient(135deg, #22c55e 0%, #4ade80 100%)", borderColor: "#22c55e" }
                                        : message.role === "negative"
                                            ? { background: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)", borderColor: "#ef4444" }
                                            : {}
                                }
                            >
                                {message.role === "user" ? (
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <span style={{ fontSize: "1.2rem" }}>
                                        {message.role === "positive" ? "😊" : "�"}
                                    </span>
                                )}
                            </div>
                            <div className="message-content">
                                <span
                                    className="message-role"
                                    style={
                                        message.role === "positive"
                                            ? { color: "#4ade80" }
                                            : message.role === "negative"
                                                ? { color: "#f87171" }
                                                : {}
                                    }
                                >
                                    {message.role === "user"
                                        ? "You"
                                        : message.role === "positive"
                                            ? "😊 해피 (긍정)"
                                            : "😤 그루미 (부정)"}
                                </span>
                                <p>{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div style={{ display: "flex", gap: "1rem", width: "100%", justifyContent: "space-between" }}>
                            <div className="message assistant-message" style={{ flex: 1, maxWidth: "48%" }}>
                                <div className="message-avatar" style={{ background: "linear-gradient(135deg, #22c55e 0%, #4ade80 100%)" }}>
                                    <span>😊</span>
                                </div>
                                <div className="message-content">
                                    <span className="message-role" style={{ color: "#4ade80" }}>해피</span>
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                            <div className="message assistant-message" style={{ flex: 1, maxWidth: "48%" }}>
                                <div className="message-avatar" style={{ background: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)" }}>
                                    <span>😤</span>
                                </div>
                                <div className="message-content">
                                    <span className="message-role" style={{ color: "#f87171" }}>그루미</span>
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="chat-footer">
                <form onSubmit={handleSubmit} className="input-form" style={{ borderColor: "rgba(168, 85, 247, 0.3)" }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="질문을 입력하세요... 두 AI가 답변합니다!"
                        disabled={isLoading}
                        className="chat-input"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="send-button"
                        style={{ background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)" }}
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
