import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { Card, Skeleton } from "../ui/Primitives.jsx";
import { Icon } from "../ui/Icon.jsx";

const SUGGESTED_PROMPTS = [
  { label: "📊 Spending analysis", text: "Analyze my spending this month" },
  { label: "💰 Where to save", text: "Where can I save money?" },
  { label: "📈 Compare months", text: "Compare this month with last month" },
  { label: "🚨 Unusual expenses", text: "Show my unusual expenses" },
  { label: "🔮 Predict spending", text: "Predict my next month's spending" },
  { label: "❤️ Financial health", text: "How healthy are my finances?" },
  { label: "🍔 Food spending", text: "How much did I spend on food?" },
  { label: "🏆 Biggest expense", text: "What was my biggest expense?" }
];

export default function AiAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [aiAvailable, setAiAvailable] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api.aiStatus().then(({ available }) => setAiAvailable(available)).catch(() => setAiAvailable(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: "user", content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.aiChat({
        message: text.trim(),
        conversationId
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.message,
        timestamp: new Date()
      }]);

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading, conversationId]);

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(input);
  }

  function handlePromptClick(text) {
    sendMessage(text);
  }

  function startNewChat() {
    setMessages([]);
    setConversationId(null);
    inputRef.current?.focus();
  }

  if (aiAvailable === null) {
    return (
      <div className="page">
        <div className="page-header"><h2>FinTrack AI</h2></div>
        <Skeleton height={400} />
      </div>
    );
  }

  return (
    <div className="page ai-assistant-page">
      <div className="page-header">
        <div>
          <h2 className="ai-page-title">
            <Icon name="sparkles" size={22} className="ai-title-icon" />
            FinTrack AI
          </h2>
          <p className="muted-copy">Your personal financial assistant — ask anything about your finances.</p>
        </div>
        {messages.length > 0 && (
          <button type="button" className="btn btn-ghost" onClick={startNewChat}>
            <Icon name="plus" size={16} />
            New Chat
          </button>
        )}
      </div>

      {!aiAvailable && (
        <Card className="ai-unavailable-banner">
          <Icon name="info" size={20} />
          <div>
            <p><strong>AI features are not configured.</strong></p>
            <p className="muted-copy">Add <code>GEMINI_API_KEY</code> to your environment variables to enable AI features.</p>
          </div>
        </Card>
      )}

      <div className="ai-chat-container">
        <div className="ai-messages-area">
          {messages.length === 0 ? (
            <div className="ai-welcome">
              <div className="ai-welcome-icon">
                <Icon name="sparkles" size={40} />
              </div>
              <h3>What can I help you with?</h3>
              <p className="muted-copy">Ask me anything about your finances. I analyze your actual transaction data to give you personalized answers.</p>

              <div className="ai-prompt-grid">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.text}
                    type="button"
                    className="ai-prompt-pill"
                    onClick={() => handlePromptClick(prompt.text)}
                    disabled={!aiAvailable || isLoading}
                  >
                    <span className="ai-prompt-label">{prompt.label}</span>
                    <span className="ai-prompt-text">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="ai-messages-list">
              {messages.map((msg, index) => (
                <div key={index} className={`ai-message ai-message-${msg.role} ${msg.isError ? "ai-message-error" : ""}`}>
                  <div className="ai-message-avatar">
                    {msg.role === "user" ? (
                      <Icon name="user" size={16} />
                    ) : (
                      <Icon name="sparkles" size={16} />
                    )}
                  </div>
                  <div className="ai-message-content">
                    <div className="ai-message-role">{msg.role === "user" ? "You" : "FinTrack AI"}</div>
                    <div className="ai-message-text" dangerouslySetInnerHTML={{ __html: formatAiMessage(msg.content) }} />
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="ai-message ai-message-assistant">
                  <div className="ai-message-avatar">
                    <Icon name="sparkles" size={16} />
                  </div>
                  <div className="ai-message-content">
                    <div className="ai-message-role">FinTrack AI</div>
                    <div className="ai-typing-indicator">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form className="ai-input-bar" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={aiAvailable ? "Ask about your finances..." : "AI features unavailable"}
            disabled={!aiAvailable || isLoading}
            maxLength={1000}
            className="ai-input-field"
          />
          <button
            type="submit"
            className="ai-send-btn"
            disabled={!input.trim() || isLoading || !aiAvailable}
          >
            <Icon name="send" size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

function formatAiMessage(text) {
  if (!text) return "";

  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Line breaks
    .replace(/\n/g, "<br />")
    // Bullet points
    .replace(/^[-•]\s+/gm, "• ")
    // Currency formatting
    .replace(/₹([\d,]+(?:\.\d{1,2})?)/g, '<span class="ai-currency">₹$1</span>');
}
