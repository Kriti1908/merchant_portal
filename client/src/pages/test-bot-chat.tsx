import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export default function TestBotChat() {
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: inputMessage, isBot: false }]);
    setInputMessage("");

    // Show typing indicator
    setIsBotTyping(true);

    try {
      const response = await fetch("/api/test-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMessage, apiKey: "test_key" }),
      });

      const data = await response.json();
      
      // Add bot response
      setMessages(prev => [...prev, { text: data.message, isBot: true }]);
    } catch (error) {
      console.error("Error:", error);
    }

    // Hide typing indicator
    setIsBotTyping(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 h-screen flex flex-col">
      <Card className="flex-1 flex flex-col shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            Test Bot
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-3xl p-3 ${
                    message.isBot
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isBotTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-3xl p-3 bg-secondary text-secondary-foreground">
                  ...
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 rounded-3xl"
            />
            <Button onClick={handleSendMessage} className="rounded-3xl">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}