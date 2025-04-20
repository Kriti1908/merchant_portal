import { useEffect, useRef, useState } from "react";
import { Bot, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import "./chat-style.css";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const params = new URLSearchParams(window.location.search);
  const botName = params.get("name") || "Aksion Assistant";
  const apiKey = params.get("key") || "";
  const sessionId = useRef(`new-session-${Math.floor(Math.random() * 10000)}`);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/chat/Omo_Bike_Info.csv?sessionId=${sessionId.current}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: input,
            apiKey,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to send message");

      const botResponse = await response.text(); // Rich Text (Markdown format)

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: botResponse,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-wrapper">
        <Card className="chat-card">
          <CardHeader className="chat-header">
            <CardTitle className="chat-title">
              <Bot className="chat-bot-icon" />
              <span>{botName}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="chat-content">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-chat-icon">
                  <Bot size={48} />
                </div>
                <h3>How can I help you today?</h3>
                <p>Ask me anything about our products and services!</p>
              </div>
            ) : (
              <div className="messages-container">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message-wrapper ${
                      message.role === "user"
                        ? "user-message-wrapper"
                        : "assistant-message-wrapper"
                    }`}
                  >
                    <div className={`message ${message.role}-message`}>
                      {message.role === "assistant" ? (
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => (
                              <p className="markdown-content" {...props} />
                            ),
                            // add more tags here if needed (e.g., h1, ul, code, etc.)
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p>{message.content}</p>
                      )}
                      <span className="message-timestamp">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>
          <div className="chat-input-container">
            <div className="input-wrapper">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="chat-input"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading}
                className="send-button"
                aria-label="Send message"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
