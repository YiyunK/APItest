"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function CrazyChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<"friendly" | "crazy">("friendly");
    const [responseCount, setResponseCount] = useState(0);
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
            const response = await fetch("/api/chat/crazy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const assistantMessage: Message = {
                    role: "assistant",
                    content: data.response,
                };
                setMessages((prev) => [...prev, assistantMessage]);
                setMode(data.mode);
                setResponseCount(data.responseNumber);
            } else {
                throw new Error(data.error || "Failed to get response");
            }
        } catch (error) {
            console.error("Error:", error);
            const errorMessage: Message = {
                role: "assistant",
                content: "죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container" style={{ background: mode === "crazy" ? "#1a0a0f" : "#0a0a0f" }}>
            <header className="chat-header" style={{
                background: mode === "crazy"
                    ? "linear-gradient(180deg, rgba(241, 99, 99, 0.15) 0%, transparent 100%)"
                    : "linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, transparent 100%)"
            }}>
                <div className="header-content">
                    <div className="logo" style={{
                        background: mode === "crazy"
                            ? "linear-gradient(135deg, #f16363 0%, #f6845c 100%)"
                            : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                    }}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <h1 style={{
                            backgroundImage: mode === "crazy"
                                ? "linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)"
                                : "linear-gradient(135deg, #fff 0%, #a0a0b0 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text"
                        }}>
                            {mode === "crazy" ? "🌀 급발진 Chat" : "😊 친절한 Chat"}
                        </h1>
                        <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>
                            응답 횟수: {responseCount}/2 {responseCount >= 2 && "⚠️ 급발진 모드!"}
                        </p>
                    </div>
                </div>
            </header>

            <main className="chat-main">
                <div className="messages-container">
                    {messages.length === 0 && (
                        <div className="welcome-message">
                            <div className="welcome-icon" style={{
                                background: "linear-gradient(135deg, rgba(99, 241, 99, 0.2) 0%, rgba(92, 246, 139, 0.2) 100%)",
                                color: "#81cf8a"
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h2>🧪 실험: 급발진 AI</h2>
                            <p>처음 2번은 친절하게... 그 다음부터는?</p>
                            <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem" }}>
                                ⚠️ 3번째 응답부터 AI가 이상해집니다!
                            </p>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`message ${message.role === "user" ? "user-message" : "assistant-message"}`}
                        >
                            <div className="message-avatar" style={
                                message.role === "assistant" && mode === "crazy" && responseCount >= 2
                                    ? { background: "linear-gradient(135deg, #f16363 0%, #f6845c 100%)", borderColor: "#f16363" }
                                    : {}
                            }>
                                {message.role === "user" ? (
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <span>{mode === "crazy" && responseCount >= 2 ? "🤪" : "😊"}</span>
                                )}
                            </div>
                            <div className="message-content">
                                <span className="message-role" style={
                                    message.role === "assistant" && mode === "crazy" && responseCount >= 2
                                        ? { color: "#f16363" }
                                        : {}
                                }>
                                    {message.role === "user" ? "You" : (mode === "crazy" && responseCount >= 2 ? "급발진 AI" : "친절한 AI")}
                                </span>
                                <p>{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="message assistant-message">
                            <div className="message-avatar">
                                <span>🤔</span>
                            </div>
                            <div className="message-content">
                                <span className="message-role">AI</span>
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="chat-footer">
                <form onSubmit={handleSubmit} className="input-form" style={
                    mode === "crazy" && responseCount >= 2
                        ? { borderColor: "rgba(241, 99, 99, 0.3)" }
                        : {}
                }>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        disabled={isLoading}
                        className="chat-input"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="send-button"
                        style={
                            mode === "crazy" && responseCount >= 2
                                ? { background: "linear-gradient(135deg, #f16363 0%, #f6845c 100%)" }
                                : {}
                        }
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
