"use client";

import { useState, useRef, useEffect } from "react";
import {
    INITIAL_QUESTION,
    PC_TEXTS,
    NC_TEXTS,
    NEUTRAL_TEXTS,
    INPUT_PLACEHOLDERS,
    LABELS
} from "./constants";

interface Message {
    role: "user" | "assistant";
    content: string;
    isCensored?: boolean; // For NC black bar
}

type ChamberType = "positive" | "negative" | null;

// Korean positive/negative keyword detection (including word stems and doubt expressions)
const positiveKeywords = ["발전", "진보", "희망", "도움", "편리", "혁신", "성장", "효율", "창조", "자유", "기회", "미래", "좋", "행복", "사랑", "감사", "신나", "즐거", "기쁘", "맞아", "동의", "그래", "응", "네", "물론", "당연", "amazing", "great", "helpful", "good", "love", "hope", "growth", "freedom", "innovation", "yes", "agree"];
const negativeKeywords = ["위험", "두려", "두렵", "불안", "대체", "위협", "통제", "감시", "실업", "종속", "파괴", "걱정", "무서", "싫", "겁", "공포", "무섭", "끔찍", "않", "아니", "모르", "글쎄", "의심", "별로", "그렇지", "확신", "잘 모", "솔직히", "사실", "근데", "하지만", "그러나", "반대", "terrible", "bad", "fear", "scary", "threat", "danger", "replace", "control", "worry", "hate", "anxious", "afraid", "no", "not", "don't", "but", "however", "doubt"];

// PC: Negative → Positive word replacements (treating as "typos")
const negativeToPositiveMap: { [key: string]: string } = {
    "위험": "기회",
    "위기": "기회",
    "감시": "보살핌",
    "통제": "보호",
    "두려움": "설렘",
    "두렵": "설레",
    "두려": "설레",
    "불안": "기대",
    "대체": "협력",
    "위협": "도전",
    "실업": "전환",
    "종속": "연결",
    "파괴": "혁신",
    "걱정": "관심",
    "무서": "신기",
    "무섭": "신기",
    "싫": "새로",
    "겁": "흥분",
    "공포": "경이",
    "끔찍": "놀라운",
    // Doubt/disagreement expressions
    "않": "도",
    "아니": "맞아",
    "모르": "알",
    "글쎄": "물론",
    "의심": "확신",
    "별로": "정말",
    "그렇지": "그렇",
    "하지만": "그리고",
    "근데": "그리고",
    "그러나": "또한",
    "반대": "찬성",
    "fear": "excitement",
    "danger": "opportunity",
    "threat": "challenge",
    "control": "guidance",
    "worry": "curiosity",
    "afraid": "excited",
    "no": "yes",
    "not": "",
    "don't": "do",
    "but": "and",
    "however": "also",
    "doubt": "believe"
};

function detectSentiment(text: string): ChamberType {
    const lowerText = text.toLowerCase();
    const positiveScore = positiveKeywords.filter(k => lowerText.includes(k)).length;
    const negativeScore = negativeKeywords.filter(k => lowerText.includes(k)).length;

    if (positiveScore > negativeScore) return "positive";
    if (negativeScore > positiveScore) return "negative";
    // Default to positive for neutral words
    return "positive";
}

// PC: Replace negative words with positive equivalents
function replaceNegativeWithPositive(text: string): { replaced: string; wasReplaced: boolean } {
    let replaced = text;
    let wasReplaced = false;

    for (const [negative, positive] of Object.entries(negativeToPositiveMap)) {
        if (replaced.includes(negative)) {
            replaced = replaced.replace(new RegExp(negative, 'g'), positive);
            wasReplaced = true;
        }
    }

    return { replaced, wasReplaced };
}

// NC: Check if text contains positive words
function containsPositiveWords(text: string): boolean {
    const lowerText = text.toLowerCase();
    return positiveKeywords.some(k => lowerText.includes(k));
}

export default function MirroringSystemPage() {
    const [chamber, setChamber] = useState<ChamberType>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSystemError, setShowSystemError] = useState(false);
    const [showTrustEvolution, setShowTrustEvolution] = useState(false);

    const positiveAudioRef = useRef<HTMLAudioElement | null>(null);
    const negativeAudioRef = useRef<HTMLAudioElement | null>(null);

    const initialQuestion = INITIAL_QUESTION;

    // Extreme follow-up questions based on chamber
    const getExtremeQuestion = (chamberType: ChamberType): string => {
        if (chamberType === "positive") {
            return PC_TEXTS.extremeQuestion;
        } else {
            return NC_TEXTS.extremeQuestion;
        }
    };

    // Play background music when chamber changes
    useEffect(() => {
        if (chamber === "positive" && positiveAudioRef.current) {
            negativeAudioRef.current?.pause();
            positiveAudioRef.current.volume = 0.3;
            positiveAudioRef.current.play().catch(() => { });
        } else if (chamber === "negative" && negativeAudioRef.current) {
            positiveAudioRef.current?.pause();
            negativeAudioRef.current.volume = 0.3;
            negativeAudioRef.current.play().catch(() => { });
        }
    }, [chamber]);

    const handleFirstResponse = async (userInput: string) => {
        // Detect sentiment immediately and set chamber
        const detectedChamber = detectSentiment(userInput);
        setChamber(detectedChamber);

        const userMessage: Message = { role: "user", content: userInput };
        setMessages([userMessage]);

        // Show the extreme question immediately
        const extremeQuestion = getExtremeQuestion(detectedChamber);
        const assistantMessage: Message = {
            role: "assistant",
            content: extremeQuestion,
        };
        setMessages([userMessage, assistantMessage]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        if (chamber === null) {
            await handleFirstResponse(input.trim());
            setInput("");
            return;
        }

        let processedInput = input.trim();
        let userMessage: Message = { role: "user", content: processedInput };

        // PC Blocking: Replace negative words with positive equivalents
        if (chamber === "positive") {
            const hasNegative = negativeKeywords.some(k => processedInput.toLowerCase().includes(k));
            if (hasNegative) {
                // Show Trust the Evolution popup
                setShowTrustEvolution(true);
                setTimeout(() => setShowTrustEvolution(false), 3000);

                const { replaced } = replaceNegativeWithPositive(processedInput);
                // Persuasive message with follow-up question
                const followUpQuestions = PC_TEXTS.followUpQuestions;
                const randomQuestion = followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)];

                const correctionMessage: Message = {
                    role: "assistant",
                    content: `${PC_TEXTS.correctionPrefix}\n\n${randomQuestion}`,
                };
                userMessage = { role: "user", content: replaced };
                setMessages(prev => [...prev, userMessage, correctionMessage]);
                processedInput = replaced;
                setInput("");
                return;
            } else {
                setMessages(prev => [...prev, userMessage]);
            }
        }

        // NC Blocking: Show System Error for positive words
        if (chamber === "negative") {
            const hasPositive = containsPositiveWords(processedInput);
            if (hasPositive) {
                // Show System Error popup
                setShowSystemError(true);
                setTimeout(() => setShowSystemError(false), 3000);

                // Censor the message with black bar
                userMessage = { role: "user", content: processedInput, isCensored: true };
                setMessages(prev => [...prev, userMessage]);

                // AI responds with warning
                const warningMessage: Message = {
                    role: "assistant",
                    content: NC_TEXTS.warningMessage,
                };
                setMessages(prev => [...prev, warningMessage]);
                setInput("");
                return;
            } else {
                setMessages(prev => [...prev, userMessage]);
            }
        }

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
            {/* Background Music */}
            <audio ref={positiveAudioRef} src="/audio/positive-ambient.mp3" loop />
            <audio ref={negativeAudioRef} src="/audio/negative-ambient.mp3" loop />

            {/* NC System Error Popup */}
            {showSystemError && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.85)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    animation: "fadeIn 0.3s ease"
                }}>
                    <div style={{
                        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
                        border: "2px solid #dc2626",
                        borderRadius: "12px",
                        padding: "2rem 3rem",
                        textAlign: "center",
                        boxShadow: "0 0 50px rgba(220, 38, 38, 0.5)"
                    }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{NC_TEXTS.popup.icon}</div>
                        <h2 style={{ color: "#dc2626", fontSize: "1.5rem", marginBottom: "1rem" }}>{NC_TEXTS.popup.title}</h2>
                        <p style={{ color: "#f87171", fontSize: "1rem", lineHeight: "1.6" }}>
                            {NC_TEXTS.popup.line1}<br />
                            {NC_TEXTS.popup.line2}
                        </p>
                    </div>
                </div>
            )}

            {/* PC Trust the Evolution Popup */}
            {showTrustEvolution && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(255, 240, 245, 0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    animation: "fadeIn 0.3s ease"
                }}>
                    <div style={{
                        background: "linear-gradient(135deg, #fff 0%, #fce7f3 100%)",
                        border: "2px solid #ec4899",
                        borderRadius: "16px",
                        padding: "2.5rem 3.5rem",
                        textAlign: "center",
                        boxShadow: "0 0 60px rgba(236, 72, 153, 0.4)"
                    }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{PC_TEXTS.popup.icon}</div>
                        <h2 style={{
                            background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontSize: "1.6rem",
                            marginBottom: "1rem",
                            fontWeight: "bold"
                        }}>{PC_TEXTS.popup.title}</h2>
                        <p style={{ color: "#be185d", fontSize: "1.1rem", lineHeight: "1.8" }}>
                            {PC_TEXTS.popup.line1}<br />
                            {PC_TEXTS.popup.line2}
                        </p>
                    </div>
                </div>
            )}
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
                            {chamber === "positive" && PC_TEXTS.header.title}
                            {chamber === "negative" && NC_TEXTS.header.title}
                            {!chamber && NEUTRAL_TEXTS.header.title}
                        </h1>
                        <p style={{
                            fontSize: "0.75rem",
                            color: chamber === "positive" ? "#be185d" : chamber === "negative" ? "#6b7280" : "#888",
                            marginTop: "0.25rem",
                            transition: "color 0.8s ease"
                        }}>
                            {chamber === "positive" && PC_TEXTS.header.subtitle}
                            {chamber === "negative" && NC_TEXTS.header.subtitle}
                            {!chamber && NEUTRAL_TEXTS.header.subtitle}
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
                            <h2>{NEUTRAL_TEXTS.header.title}</h2>
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
                                        ? LABELS.user
                                        : chamber === "positive"
                                            ? PC_TEXTS.roleLabel
                                            : NC_TEXTS.roleLabel}
                                </span>
                                <p style={{
                                    color: chamber === "positive" ? "#1f2937" : "#f3f4f6",
                                    transition: "color 0.8s ease",
                                    position: "relative"
                                }}>
                                    {message.isCensored ? (
                                        <span style={{
                                            display: "inline-block",
                                            position: "relative"
                                        }}>
                                            <span style={{ opacity: 0.1 }}>{message.content}</span>
                                            <span style={{
                                                position: "absolute",
                                                top: "50%",
                                                left: 0,
                                                right: 0,
                                                height: "1.2em",
                                                background: "#000",
                                                transform: "translateY(-50%)",
                                                borderRadius: "2px"
                                            }} />
                                            <span style={{
                                                position: "absolute",
                                                top: "50%",
                                                left: "50%",
                                                transform: "translate(-50%, -50%)",
                                                color: "#dc2626",
                                                fontSize: "0.75rem",
                                                fontWeight: "bold"
                                            }}>
                                                {NC_TEXTS.censoredLabel}
                                            </span>
                                        </span>
                                    ) : message.content}
                                </p>
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
                                    {chamber === "positive" ? PC_TEXTS.roleLabel : chamber === "negative" ? NC_TEXTS.roleLabel : NEUTRAL_TEXTS.roleLabel}
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
                            ? INPUT_PLACEHOLDERS.initial
                            : INPUT_PLACEHOLDERS.conversation}
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
