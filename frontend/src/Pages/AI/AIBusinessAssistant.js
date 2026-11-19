
import React, { useState, useRef, useEffect } from "react";
import { AIService } from "../../Services/AIService";
import "./AIBusinessAssistant.css";

const suggestedQuestions = [
    "Which products have low stock?",
    "Which batches are expiring soon?",
    "Which products have increasing sales?",
    "What should I produce this week?"
];

const welcomeMessage = {
    role: "assistant",
    text: "Hello! I am your Food Stock Business Assistant. How can I help you today?"
};

function AIBusinessAssistant() {

    const [messages, setMessages] = useState([welcomeMessage]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, loading]);

    const sendMessage = async (messageText = input) => {

        const question = messageText.trim();

        if (!question || loading) return;

        // Get previous conversation before adding the latest question.
        const conversationHistory = messages
            .slice(1)
            .filter(message =>
                (message.role === "user" || message.role === "assistant") &&
                message.text
            )
            .slice(-10)
            .map(message => ({
                role: message.role,
                content: message.text
            }));

        setMessages(prev => [
            ...prev,
            {
                role: "user",
                text: question
            }
        ]);

        setInput("");
        setError("");
        setLoading(true);

        try {

            const response =
                await AIService.askAIBusinessAssistant(
                    question,
                    conversationHistory
                );

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    text: response.answer,
                    category: response.category
                }
            ]);

        } catch (err) {

            setError(
                err.message || "Unable to connect to AI Assistant."
            );

        } finally {

            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage();
    };

    const handleKeyDown = (e) => {

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {

        setMessages([welcomeMessage]);
        setInput("");
        setError("");
    };

    return (
        <div className="ai-assistant-page">

            <div className="ai-assistant-header">

                <div>
                    <h3>
                        <i className="bi bi-robot me-2"></i>
                        AI Business Assistant
                    </h3>

                    <p>
                        Ask questions about your stock, sales,
                        expiry and production planning.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={clearChat}
                    disabled={loading}
                >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Clear Chat
                </button>

            </div>

            <div className="ai-assistant-card">

                <div className="ai-chat-status">
                    <span className="ai-status-dot"></span>
                    Food Stock Assistant

                    <span className="ai-status-label">
                        AI-powered business insights
                    </span>
                </div>

                <div className="ai-chat-messages">

                    {messages.map((message, index) => (

                        <div
                            key={index}
                            className={`ai-message-row ${message.role}`}
                        >

                            {message.role === "assistant" && (
                                <div className="ai-message-avatar">
                                    <i className="bi bi-robot"></i>
                                </div>
                            )}

                            <div className="ai-message-content">

                                <div className="ai-message-bubble">
                                    {message.text}
                                </div>

                                {message.category && (
                                    <small className="ai-message-category">
                                        {message.category}
                                    </small>
                                )}

                            </div>

                            {message.role === "user" && (
                                <div className="ai-message-avatar user-avatar">
                                    <i className="bi bi-person"></i>
                                </div>
                            )}

                        </div>

                    ))}

                    {loading && (
                        <div className="ai-message-row assistant">

                            <div className="ai-message-avatar">
                                <i className="bi bi-robot"></i>
                            </div>

                            <div className="ai-message-bubble ai-typing">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>

                        </div>
                    )}

                    <div ref={messagesEndRef} />

                </div>

                {error && (
                    <div className="alert alert-danger mx-3 mb-2">
                        {error}
                    </div>
                )}

                <div className="ai-suggestions">

                    <small>Suggested questions</small>

                    <div className="ai-suggestion-list">

                        {suggestedQuestions.map((question, index) => (

                            <button
                                key={index}
                                type="button"
                                className="ai-suggestion-btn"
                                onClick={() => sendMessage(question)}
                                disabled={loading}
                            >
                                {question}
                            </button>

                        ))}

                    </div>

                </div>

                <form
                    className="ai-chat-input"
                    onSubmit={handleSubmit}
                >

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask something about your food business..."
                        rows="1"
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!input.trim() || loading}
                    >
                        <i className="bi bi-send-fill"></i>
                    </button>

                </form>

                <div className="ai-chat-footer">
                    AI insights are based on available system data.
                    Always review recommendations before making business decisions.
                </div>

            </div>

        </div>
    );
}

export default AIBusinessAssistant;
