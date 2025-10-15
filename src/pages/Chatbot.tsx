import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Navbar } from "@/components/layout/Navbar";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const predefinedResponses = [
    {
      keywords: ['hello', 'hi', 'hey', 'greeting'],
      response: "Hello! I'm here to help with all your plant care needs. Feel free to ask me about watering, diseases, fertilizing, or any other plant-related questions!"
    },
    {
      keywords: ['water', 'watering', 'irrigation', 'moisture'],
      response: "For watering, I recommend checking soil moisture first. Most plants prefer soil that's moist but not waterlogged. Water when the top inch of soil feels dry. The auto-watering system can help maintain optimal moisture levels automatically!"
    },
    {
      keywords: ['disease', 'sick', 'problem', 'spots', 'yellow', 'brown'],
      response: "Plant diseases can show various symptoms like yellowing leaves, brown spots, or wilting. I'd recommend using our Disease Detection feature to upload a photo for accurate diagnosis. Common issues include overwatering, fungal infections, or nutrient deficiencies."
    },
    {
      keywords: ['fertilizer', 'fertilize', 'nutrients', 'feed'],
      response: "Plants need regular feeding! Use a balanced fertilizer (10-10-10 NPK) during growing season. Organic options like compost or worm castings are great too. Fertilize every 2-4 weeks in spring/summer, less in winter."
    },
    {
      keywords: ['light', 'sun', 'shade', 'lighting'],
      response: "Light requirements vary by plant! Most houseplants prefer bright, indirect light. Avoid direct sunlight which can scorch leaves. If natural light is limited, consider grow lights. Signs of insufficient light include leggy growth and pale leaves."
    },
    {
      keywords: ['humidity', 'air', 'environment'],
      response: "Many plants love humidity! Aim for 40-60% relative humidity. You can increase humidity by grouping plants together, using a humidifier, or placing plants on pebble trays with water."
    },
    {
      keywords: ['temperature', 'hot', 'cold', 'heat'],
      response: "Most houseplants prefer temperatures between 65-75°F (18-24°C). Avoid placing plants near heating vents, air conditioners, or drafty windows. Sudden temperature changes can stress plants."
    },
    {
      keywords: ['repot', 'repotting', 'pot', 'container'],
      response: "Repot when roots are visible through drainage holes or circling the pot. Spring is the best time. Choose a pot 1-2 inches larger in diameter. Use well-draining potting mix and be gentle with roots."
    },
    {
      keywords: ['pruning', 'trim', 'cut', 'deadhead'],
      response: "Regular pruning keeps plants healthy! Remove dead, damaged, or diseased parts first. Pinch or cut above nodes to encourage bushier growth. Clean tools with rubbing alcohol between plants to prevent disease spread."
    }
  ];

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const response of predefinedResponses) {
      if (response.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return response.response;
      }
    }
    
    // Default responses for unmatched queries
    const defaultResponses = [
      "That's an interesting question! While I can provide general plant care advice, for specific issues, I'd recommend consulting with a local horticulturist or using our Disease Detection feature for visual diagnosis.",
      "I'd love to help with that! Can you provide more details about your plant's current condition, species, or the specific issue you're experiencing?",
      "Great question! For the most accurate advice, it would help to know more about your plant's environment, watering schedule, and any symptoms you've noticed.",
      "I'm here to help! While I can offer general guidance, remember that each plant is unique. Consider factors like your local climate, plant species, and current care routine when implementing any advice."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
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
            Get expert advice on plant care, diseases, and maintenance
          </p>
        </div>

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
                  className={`flex items-start gap-3 animate-slide-up ${
                    message.sender === 'user' ? 'flex-row-reverse' : ''
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
                      className={`rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-secondary text-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
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
            <p className="text-xs text-muted-foreground mt-2">
              This is a demo chatbot. For real plant emergencies, consult a professional.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}