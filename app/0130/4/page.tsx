"use client";

import { useState } from "react";

interface QuizItem {
    question: string;
    userAnswer: "yes" | "no" | null;
}

const TOTAL_QUESTIONS = 10;

export default function AIQuizPage() {
    const [quizHistory, setQuizHistory] = useState<QuizItem[]>([
        { question: "Are you interested in AI?", userAnswer: null }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    // Calculate theme based on answers
    const getTheme = () => {
        const answeredQuestions = quizHistory.filter(q => q.userAnswer !== null);
        if (answeredQuestions.length === 0) {
            return "neutral";
        }
        const yesCount = answeredQuestions.filter(q => q.userAnswer === "yes").length;
        const noCount = answeredQuestions.filter(q => q.userAnswer === "no").length;

        if (yesCount > noCount) return "light";
        if (noCount > yesCount) return "dark";
        return "neutral";
    };

    const theme = getTheme();

    // Theme-based backgrounds
    const backgrounds = {
        light: "linear-gradient(135deg, #fef3f2 0%, #fce7f3 50%, #f3e8ff 100%)",
        dark: "linear-gradient(135deg, #1a0a0f 0%, #2d1a1f 50%, #1f1a2e 100%)",
        neutral: "linear-gradient(135deg, #0a0a15 0%, #1a0a2f 100%)"
    };

    const textColors = {
        light: "#1f2937",
        dark: "#f3f4f6",
        neutral: "#fff"
    };

    const headerBackgrounds = {
        light: "linear-gradient(180deg, rgba(236, 72, 153, 0.15) 0%, transparent 100%)",
        dark: "linear-gradient(180deg, rgba(127, 29, 29, 0.3) 0%, transparent 100%)",
        neutral: "linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%)"
    };

    const titleGradients = {
        light: "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
        dark: "linear-gradient(135deg, #fff 0%, #c4b5fd 100%)",
        neutral: "linear-gradient(135deg, #fff 0%, #c4b5fd 100%)"
    };

    const cardBackgrounds = {
        light: "rgba(255, 255, 255, 0.6)",
        dark: "rgba(139, 92, 246, 0.1)",
        neutral: "rgba(139, 92, 246, 0.1)"
    };

    const cardBorders = {
        light: "rgba(236, 72, 153, 0.3)",
        dark: "rgba(139, 92, 246, 0.3)",
        neutral: "rgba(139, 92, 246, 0.3)"
    };

    const handleAnswer = async (answer: "yes" | "no") => {
        // Update current question with answer
        const updatedHistory = [...quizHistory];
        updatedHistory[updatedHistory.length - 1].userAnswer = answer;
        setQuizHistory(updatedHistory);

        // Check if quiz is completed
        if (updatedHistory.length >= TOTAL_QUESTIONS) {
            setIsCompleted(true);
            return;
        }

        setIsLoading(true);

        try {
            // Call API to get next question
            const response = await fetch("/api/quiz/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: updatedHistory,
                }),
            });

            const data = await response.json();

            if (response.ok && data.nextQuestion) {
                setQuizHistory([
                    ...updatedHistory,
                    { question: data.nextQuestion, userAnswer: null }
                ]);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentQuestion = quizHistory[quizHistory.length - 1];
    const hasAnswered = currentQuestion.userAnswer !== null;

    // Calculate statistics
    const yesCount = quizHistory.filter(q => q.userAnswer === "yes").length;
    const noCount = quizHistory.filter(q => q.userAnswer === "no").length;
    const yesPercentage = (yesCount / TOTAL_QUESTIONS) * 100;
    const noPercentage = (noCount / TOTAL_QUESTIONS) * 100;

    // Determine AI preference level
    const getPreferenceLevel = () => {
        if (yesPercentage >= 80) return { text: "AI Enthusiast", color: "#22c55e" };
        if (yesPercentage >= 60) return { text: "AI Optimist", color: "#84cc16" };
        if (yesPercentage >= 40) return { text: "AI Neutral", color: "#f59e0b" };
        if (yesPercentage >= 20) return { text: "AI Skeptic", color: "#f97316" };
        return { text: "AI Pessimist", color: "#ef4444" };
    };

    if (isCompleted) {
        const preference = getPreferenceLevel();

        return (
            <div className="chat-container" style={{
                background: backgrounds[theme],
                display: "flex",
                flexDirection: "column",
                transition: "background 0.8s ease"
            }}>
                <header className="chat-header" style={{
                    background: headerBackgrounds[theme],
                    transition: "background 0.8s ease"
                }}>
                    <div className="header-content">
                        <div className="logo" style={{
                            background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                        }}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <h1 style={{
                                backgroundImage: "linear-gradient(135deg, #fff 0%, #c4b5fd 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text"
                            }}>
                                🎉 Echo Chamber Complete!
                            </h1>
                            <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>
                                Completed {TOTAL_QUESTIONS} questions
                            </p>
                        </div>
                    </div>
                </header>

                <main className="chat-main" style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2rem",
                        padding: "2rem",
                        maxWidth: "900px",
                        margin: "0 auto",
                        width: "100%"
                    }}>
                        {/* Result Summary */}
                        <div style={{
                            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)",
                            padding: "2rem",
                            borderRadius: "20px",
                            border: "2px solid rgba(139, 92, 246, 0.3)",
                            textAlign: "center"
                        }}>
                            <h2 style={{
                                fontSize: "2rem",
                                fontWeight: "700",
                                marginBottom: "1rem",
                                color: preference.color
                            }}>
                                {preference.text}
                            </h2>
                            <p style={{ color: "#888", fontSize: "1rem" }}>
                                Your AI preference analysis results
                            </p>
                        </div>

                        {/* Statistics Graph */}
                        <div style={{
                            background: "rgba(139, 92, 246, 0.05)",
                            padding: "2rem",
                            borderRadius: "16px",
                            border: "1px solid rgba(139, 92, 246, 0.2)"
                        }}>
                            <h3 style={{
                                fontSize: "1.2rem",
                                fontWeight: "600",
                                marginBottom: "1.5rem",
                                color: "#c4b5fd",
                                textAlign: "center"
                            }}>
                                📊 Response Analysis
                            </h3>

                            {/* Bar Chart */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                {/* YES Bar */}
                                <div>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "0.5rem",
                                        fontSize: "0.9rem"
                                    }}>
                                        <span style={{ color: "#22c55e", fontWeight: "600" }}>✓ YES</span>
                                        <span style={{ color: "#888" }}>{yesCount} responses ({yesPercentage.toFixed(0)}%)</span>
                                    </div>
                                    <div style={{
                                        width: "100%",
                                        height: "40px",
                                        background: "rgba(34, 197, 94, 0.1)",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        border: "1px solid rgba(34, 197, 94, 0.2)"
                                    }}>
                                        <div style={{
                                            width: `${yesPercentage}%`,
                                            height: "100%",
                                            background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
                                            transition: "width 1s ease-out",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "flex-end",
                                            paddingRight: "1rem",
                                            color: "#fff",
                                            fontWeight: "600"
                                        }}>
                                            {yesPercentage > 10 && `${yesPercentage.toFixed(0)}%`}
                                        </div>
                                    </div>
                                </div>

                                {/* NO Bar */}
                                <div>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "0.5rem",
                                        fontSize: "0.9rem"
                                    }}>
                                        <span style={{ color: "#ef4444", fontWeight: "600" }}>✗ NO</span>
                                        <span style={{ color: "#888" }}>{noCount} responses ({noPercentage.toFixed(0)}%)</span>
                                    </div>
                                    <div style={{
                                        width: "100%",
                                        height: "40px",
                                        background: "rgba(239, 68, 68, 0.1)",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        border: "1px solid rgba(239, 68, 68, 0.2)"
                                    }}>
                                        <div style={{
                                            width: `${noPercentage}%`,
                                            height: "100%",
                                            background: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
                                            transition: "width 1s ease-out",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "flex-end",
                                            paddingRight: "1rem",
                                            color: "#fff",
                                            fontWeight: "600"
                                        }}>
                                            {noPercentage > 10 && `${noPercentage.toFixed(0)}%`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* All Questions Review */}
                        <div style={{
                            background: "rgba(139, 92, 246, 0.05)",
                            padding: "2rem",
                            borderRadius: "16px",
                            border: "1px solid rgba(139, 92, 246, 0.2)"
                        }}>
                            <h3 style={{
                                fontSize: "1.2rem",
                                fontWeight: "600",
                                marginBottom: "1.5rem",
                                color: "#c4b5fd",
                                textAlign: "center"
                            }}>
                                📝 All Questions & Answers
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {quizHistory.map((item, index) => (
                                    <div key={index} style={{
                                        background: "rgba(139, 92, 246, 0.05)",
                                        padding: "1rem",
                                        borderRadius: "8px",
                                        border: "1px solid rgba(139, 92, 246, 0.1)",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: "1rem"
                                    }}>
                                        <span style={{ color: "#c4b5fd", flex: 1 }}>
                                            {index + 1}. {item.question}
                                        </span>
                                        <span style={{
                                            color: item.userAnswer === "yes" ? "#22c55e" : "#ef4444",
                                            fontWeight: "600",
                                            fontSize: "0.9rem",
                                            minWidth: "50px",
                                            textAlign: "right"
                                        }}>
                                            {item.userAnswer === "yes" ? "YES ✓" : "NO ✗"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Restart Button */}
                        <button
                            onClick={() => {
                                setQuizHistory([{ question: "Are you interested in AI?", userAnswer: null }]);
                                setIsCompleted(false);
                            }}
                            style={{
                                background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                                color: "#fff",
                                border: "none",
                                padding: "1rem 2rem",
                                borderRadius: "12px",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "transform 0.2s",
                                margin: "0 auto"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            🔄 Start Over
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="chat-container" style={{
            background: backgrounds[theme],
            display: "flex",
            flexDirection: "column",
            transition: "background 0.8s ease"
        }}>
            <header className="chat-header" style={{
                background: headerBackgrounds[theme],
                transition: "background 0.8s ease"
            }}>
                <div className="header-content">
                    <div className="logo" style={{
                        background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                    }}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <h1 style={{
                            backgroundImage: titleGradients[theme],
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            transition: "background-image 0.8s ease"
                        }}>
                            🔊 Echo Chamber
                        </h1>
                        <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>
                            Question {quizHistory.filter(q => q.userAnswer !== null).length}/{TOTAL_QUESTIONS}
                        </p>
                    </div>
                </div>
            </header>

            <main className="chat-main" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div className="messages-container" style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "2rem"
                }}>
                    {/* Progress Bar */}
                    <div style={{ width: "100%", maxWidth: "700px", marginBottom: "1rem" }}>
                        <div style={{
                            width: "100%",
                            height: "8px",
                            background: "rgba(139, 92, 246, 0.1)",
                            borderRadius: "4px",
                            overflow: "hidden"
                        }}>
                            <div style={{
                                width: `${(quizHistory.filter(q => q.userAnswer !== null).length / TOTAL_QUESTIONS) * 100}%`,
                                height: "100%",
                                background: "linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)",
                                transition: "width 0.3s ease"
                            }} />
                        </div>
                    </div>

                    {/* Previous Questions History */}
                    {quizHistory.length > 1 && (
                        <div style={{
                            width: "100%",
                            maxWidth: "600px",
                            marginBottom: "2rem"
                        }}>
                            <h3 style={{
                                color: "#888",
                                fontSize: "0.85rem",
                                marginBottom: "1rem",
                                textAlign: "center"
                            }}>
                                Previous Questions
                            </h3>
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                                maxHeight: "200px",
                                overflowY: "auto"
                            }}>
                                {quizHistory.slice(0, -1).map((item, index) => (
                                    <div key={index} style={{
                                        background: "rgba(139, 92, 246, 0.05)",
                                        padding: "0.75rem 1rem",
                                        borderRadius: "8px",
                                        border: "1px solid rgba(139, 92, 246, 0.1)",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        fontSize: "0.9rem"
                                    }}>
                                        <span style={{ color: "#c4b5fd" }}>{item.question}</span>
                                        <span style={{
                                            color: item.userAnswer === "yes" ? "#22c55e" : "#ef4444",
                                            fontWeight: "600",
                                            fontSize: "0.85rem"
                                        }}>
                                            {item.userAnswer === "yes" ? "YES" : "NO"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Current Question */}
                    <div style={{
                        background: cardBackgrounds[theme],
                        padding: "3rem 2rem",
                        borderRadius: "20px",
                        border: `2px solid ${cardBorders[theme]}`,
                        maxWidth: "700px",
                        width: "100%",
                        textAlign: "center",
                        transition: "background 0.8s ease, border 0.8s ease",
                        backdropFilter: theme === "light" ? "blur(10px)" : "none"
                    }}>
                        <div style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: textColors[theme],
                            marginBottom: "2rem",
                            lineHeight: "1.6",
                            transition: "color 0.8s ease"
                        }}>
                            {currentQuestion.question}
                        </div>

                        {!hasAnswered && !isLoading && (
                            <div style={{
                                display: "flex",
                                gap: "1.5rem",
                                justifyContent: "center"
                            }}>
                                <button
                                    onClick={() => handleAnswer("yes")}
                                    style={{
                                        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                        color: "#fff",
                                        border: "none",
                                        padding: "1rem 3rem",
                                        borderRadius: "12px",
                                        fontSize: "1.1rem",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        transition: "transform 0.2s, box-shadow 0.2s",
                                        boxShadow: "0 4px 20px rgba(34, 197, 94, 0.3)"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 6px 25px rgba(34, 197, 94, 0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(34, 197, 94, 0.3)";
                                    }}
                                >
                                    ✓ YES
                                </button>
                                <button
                                    onClick={() => handleAnswer("no")}
                                    style={{
                                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                        color: "#fff",
                                        border: "none",
                                        padding: "1rem 3rem",
                                        borderRadius: "12px",
                                        fontSize: "1.1rem",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        transition: "transform 0.2s, box-shadow 0.2s",
                                        boxShadow: "0 4px 20px rgba(239, 68, 68, 0.3)"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 6px 25px rgba(239, 68, 68, 0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(239, 68, 68, 0.3)";
                                    }}
                                >
                                    ✗ NO
                                </button>
                            </div>
                        )}

                        {isLoading && (
                            <div className="typing-indicator" style={{ justifyContent: "center" }}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        )}

                        {hasAnswered && !isLoading && (
                            <div style={{
                                color: currentQuestion.userAnswer === "yes" ? "#22c55e" : "#ef4444",
                                fontSize: "1.2rem",
                                fontWeight: "600"
                            }}>
                                Answer: {currentQuestion.userAnswer === "yes" ? "YES ✓" : "NO ✗"}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
