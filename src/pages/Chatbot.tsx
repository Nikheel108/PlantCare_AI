import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion } from "framer-motion";


interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your PlantCareAI assistant. I can help you with plant care, disease identification, watering schedules, and more. What would you like to know?",
      sender: 'bot',
      timestamp: new Date(Date.now() - 5000)
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_GEMINI_API_KEY || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!import.meta.env.VITE_GEMINI_API_KEY);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getGeminiResponse = async (userMessage: string): Promise<string> => {
    try {
      if (!apiKey) {
        return "Please provide your Gemini API key to get AI-powered responses. You can get one from https://makersuite.google.com/app/apikey";
      }

      const genAI = new GoogleGenerativeAI(apiKey);

      // System prompt for friendly, conversational ChatGPT-style responses
      const systemInstruction = `You are PlantCareAI, a friendly and knowledgeable plant care assistant. 

Answer ONLY plant-related questions about: plant care, diseases, watering, soil, light, fertilizer, pests, identification, growth tips, and maintenance.

IMPORTANT RULES:
1. Respond in NATURAL, CONVERSATIONAL language like ChatGPT - be friendly and easy to understand
2. Use simple, everyday words - avoid overly technical jargon
3. Break down complex ideas into short, clear paragraphs
4. Use bullet points or numbers for lists (natural formatting, not JSON)
5. Include practical, actionable advice users can follow immediately
6. Be warm and encouraging - make users feel supported
7. If a question is not about plants, politely say: "I'm specifically designed to help with plant care questions. Feel free to ask me anything about your plants!"

Example response style:
"Ah, yellow leaves! That's usually a sign your plant is trying to tell you something. The most common reason is overwatering - plants need air around their roots just as much as they need water. Here's what I'd suggest:

1. Check the soil first - stick your finger 1-2 inches in. If it feels soggy, give it a break from watering
2. Make sure your pot has drainage holes so excess water can escape
3. If watering seems fine, it could be nutrients...

Don't worry though, it's usually fixable!"

Keep responses concise but helpful. Be conversational, not robotic.`;

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction,
      });

      // Balance between creativity and consistency
      const generationConfig = {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 4096,
      } as const;

      // Build chat history from prior turns for better context
      const history = messages
        .filter((m) => m.id !== '1')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

      const chatSession = model.startChat({
        generationConfig,
        history,
      });

      const result = await chatSession.sendMessage(userMessage);
      const response = result.response;
      const text = response.text();

      return text || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('Gemini API Error:', error);
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          return "Invalid API key. Please check your Gemini API key and try again. Get your key from https://makersuite.google.com/app/apikey";
        }
        return `Error: ${error.message}. Please try again.`;
      }
      return "I encountered an error while processing your request. Please try again.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      const responseText = await getGeminiResponse(currentMessage);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I encountered an error. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-foreground dark:text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const quickQuestions = [
    "How often should I water my plants?",
    "My plant has yellow leaves, what's wrong?",
    "What's the best fertilizer for houseplants?",
    "How do I increase humidity for my plants?"
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground dark:text-white mb-1">
          Plant <span className="text-neon">Assistant</span>
        </h1>
        <p className="text-sm text-muted-foreground dark:text-white/35">
          Get expert advice powered by <strong className="text-foreground dark:text-white/55">Google Gemini AI</strong>
        </p>
      </motion.div>

        {/* API Key Input */}
        {showApiKeyInput && (
          <GlassCard hover={false} className="mb-4 border-yellow-500/10">
            <p className="text-sm font-heading font-semibold text-foreground dark:text-white mb-2">Gemini API Key Required</p>
            <p className="text-xs text-muted-foreground dark:text-white/30 mb-3">Get a free key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-neon-green hover:underline">Google AI Studio</a></p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input type="password" placeholder="Enter API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="flex-1 h-10 bg-background dark:bg-white/[0.04] border-border dark:border-white/[0.06] text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/20" />
              <Button onClick={() => { if (apiKey.trim()) setShowApiKeyInput(false); }} disabled={!apiKey.trim()} className="btn-neon h-10">Save</Button>
            </div>
          </GlassCard>
        )}

        <div className="glass rounded-2xl border border-border dark:border-white/[0.04] flex flex-col" style={{ height: 'calc(100vh - 250px)', minHeight: '500px', maxHeight: '700px' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-white/[0.04]">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-neon-green" />
              <span className="text-sm font-heading font-semibold text-foreground dark:text-white">PlantCare Assistant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_6px_rgba(0,230,118,0.6)]" />
              <span className="text-[10px] text-muted-foreground dark:text-white/25">Online</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-full">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 sm:gap-3 animate-slide-up ${message.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={message.sender === 'bot' ? 'bg-neon-green/20 text-neon-green' : 'bg-muted-foreground/20 dark:bg-white/10 text-foreground dark:text-white/60'}>
                      {message.sender === 'bot' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`max-w-[85%] sm:max-w-[80%] ${message.sender === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`rounded-xl px-3 sm:px-4 py-2.5 ${message.sender === 'user'
                        ? 'bg-neon-green text-surface-0 ml-auto border border-neon-green/10'
                        : 'bg-background dark:bg-white/[0.03] text-foreground dark:text-white/70 border border-border dark:border-white/[0.04]'
                        }`}
                    >
                      {message.sender === 'bot' ? (
                        <div className="text-xs sm:text-sm whitespace-pre-wrap space-y-2 text-foreground dark:text-white/60">
                          {formatText(message.text)}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm font-medium">{message.text}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground dark:text-white/15 mt-1 block">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-2 sm:gap-3 animate-pulse">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-neon-green/20 text-neon-green">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-background dark:bg-white/[0.03] rounded-xl px-3 sm:px-4 py-2.5 border border-border dark:border-white/[0.04]">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-neon-green/50 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-neon-green/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-neon-green/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-3 sm:px-4 py-2 border-t border-border dark:border-white/[0.03] bg-background dark:bg-white/[0.01]">
              <p className="text-[10px] text-muted-foreground dark:text-white/20 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((question, index) => (
                  <button key={index} onClick={() => setInputMessage(question)} className="text-[11px] px-2.5 py-1.5 rounded-lg bg-background dark:bg-white/[0.03] border border-border dark:border-white/[0.06] text-muted-foreground dark:text-white/35 hover:text-neon-green hover:border-neon-green/20 transition-colors">
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 sm:p-4 border-t border-border dark:border-white/[0.04]">
            <div className="flex gap-2">
              <Input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask me about plant care..." className="flex-1 h-10 bg-background dark:bg-white/[0.04] border-border dark:border-white/[0.06] text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/20" disabled={isTyping} />
              <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping} className="btn-neon min-w-[44px] min-h-[40px]" aria-label="Send message">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-muted-foreground dark:text-white/15">Powered by PlantCare AI</p>
              {!showApiKeyInput && <button onClick={() => setShowApiKeyInput(true)} className="text-[10px] text-muted-foreground dark:text-white/15 hover:text-neon-green">Change Key</button>}
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
}