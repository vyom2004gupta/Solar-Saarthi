// ChatBotPage.js
import React, { useState } from "react";
import { Send, User, Settings, Mic } from "lucide-react";
// import { GoogleGenerativeAI } from "@google/generative-ai"; // Remove this import
import { fetchGeminiResponse } from "../geminiService/geminiService.js";

const ChatBotPage = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I am Saarthi, how can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const botReply = await fetchGeminiResponse(input);
      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
    } catch (err) {
      console.error("Gemini error:", err);
      console.log("ENV vars:", import.meta.env);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, there was an error connecting to Gemini." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-16 bg-[#8055FF] flex flex-col items-center py-4 space-y-6 text-white">
        <User />
        <Mic />
        <Settings />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="p-4 bg-white shadow flex items-center justify-between">
          <h2 className="text-xl font-semibold">YourSaarthi</h2>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-lg px-4 py-2 rounded-xl ${
                msg.from === "user"
                  ? "ml-auto bg-blue-600 text-white"
                  : "bg-green-200 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="max-w-lg px-4 py-2 rounded-xl bg-green-200 text-gray-800">
              Saarthi is typing...
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="p-4 bg-white border-t flex items-center gap-2">
          <input
            type="text"
            placeholder="Message to Saarthi…"
            className="flex-1 px-4 py-2 border rounded-xl focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="p-2 bg-[#8055FF] text-white rounded-full"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBotPage;