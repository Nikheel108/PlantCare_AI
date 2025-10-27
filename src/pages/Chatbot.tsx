import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Navbar } from "@/components/layout/Navbar";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

      const prompt = `You are PlantCareAI. Format your responses EXACTLY like this example:

📍 PROBLEM: [One-line title]

CAUSES:
1. **[Main Cause]**
   • What: [Brief explanation in 5-7 words]
   • Signs: [2-3 clear symptoms]

2. **[Secondary Cause]**
   • What: [Brief explanation in 5-7 words]
   • Signs: [2-3 clear symptoms]

SOLUTIONS:
1. For [Main Cause]:
   • Step 1: [Clear action in 5-7 words]
   • Step 2: [Clear action in 5-7 words]

2. For [Secondary Cause]:
   • Step 1: [Clear action in 5-7 words]
   • Step 2: [Clear action in 5-7 words]

PREVENTION:
• [One clear prevention tip]
• [One clear prevention tip]

💡 QUICK TIP: [One practical, memorable tip]

-------------------

For care instructions, use this format:

📍 CARE GUIDE: [Topic]

BASIC NEEDS:
• Water: [Exact frequency and amount]
• Light: [Specific requirement]
• Temperature: [Exact range]

STEP-BY-STEP:
1. [First step in 5-7 words]
2. [Second step in 5-7 words]
3. [Third step in 5-7 words]

IMPORTANT:
❗ [One crucial warning or tip]
✅ [One positive reminder]

Use EXACTLY this formatting with:
• Clear numbering
• Emoji markers (📍,💡,❗,✅)
• Section dividers (---)
• Bold for key terms (**)
• Short, clear points
• Proper spacing between sections

User question: ${userMessage}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
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

  const quickQuestions = [
    "How often should I water my plants?",
    "My plant has yellow leaves, what's wrong?",
    "What's the best fertilizer for houseplants?",
    "How do I increase humidity for my plants?"
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Plant Care Assistant
          </h1>
          <p className="text-muted-foreground">
            Get expert advice on plant care, diseases, and maintenance powered by Google Gemini
          </p>
        </div>

        {/* API Key Input */}
        {showApiKeyInput && (
          <Card className="mb-4 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">Gemini API Key Required</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Get your free API key from{" "}
                      <a
                        href="https://makersuite.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="Enter your Gemini API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          if (apiKey.trim()) {
                            setShowApiKeyInput(false);
                          }
                        }}
                        disabled={!apiKey.trim()}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-card border-border/50 h-[600px] flex flex-col">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              PlantCareAI Assistant
              <div className="ml-auto flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Online</span>
              </div>
            </CardTitle>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="p-4 space-y-4 max-h-full">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 animate-slide-up ${message.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={message.sender === 'bot' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                      {message.sender === 'bot' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`max-w-[80%] ${message.sender === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`rounded-lg px-4 py-2 ${message.sender === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-secondary text-foreground'
                        }`}
                    >
                      {message.sender === 'bot' ? (
                        <div className="text-sm whitespace-pre-line">
                          {message.text.split('\n').map((line, i) => {
                            if (line.startsWith('📍')) {
                              return <h3 key={i} className="font-semibold text-primary mb-2">{line}</h3>;
                            } else if (line.startsWith('CAUSES:') || line.startsWith('SOLUTIONS:') || line.startsWith('PREVENTION:') || line.startsWith('BASIC NEEDS:') || line.startsWith('STEP-BY-STEP:') || line.startsWith('IMPORTANT:')) {
                              return <h4 key={i} className="font-medium text-secondary-foreground mt-3 mb-2">{line}</h4>;
                            } else if (line.startsWith('•')) {
                              return <p key={i} className="ml-3 mb-1">{line}</p>;
                            } else if (line.startsWith('💡')) {
                              return <p key={i} className="mt-3 text-primary font-medium">{line}</p>;
                            } else if (line.startsWith('❗')) {
                              return <p key={i} className="text-warning-foreground font-medium">{line}</p>;
                            } else if (line.startsWith('✅')) {
                              return <p key={i} className="text-success-foreground font-medium">{line}</p>;
                            } else if (line.match(/^\d+\./)) {
                              return <p key={i} className="ml-3 mb-1 font-medium">{line}</p>;
                            } else if (line.trim() === '-------------------') {
                              return <hr key={i} className="my-3 border-border/50" />;
                            } else {
                              return <p key={i} className="mb-1">{line}</p>;
                            }
                          })}
                        </div>
                      ) : (
                        <p className="text-sm">{message.text}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-3 animate-pulse">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-secondary rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-border bg-secondary/20">
              <p className="text-sm text-muted-foreground mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setInputMessage(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about plant care, diseases, watering..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="gradient-primary text-white hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                Powered by Intelligent Plant Care AI
              </p>
              {!showApiKeyInput && (
                <button
                  onClick={() => setShowApiKeyInput(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Change API Key
                </button>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}