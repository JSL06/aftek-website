import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: t('chatbot.welcome'),
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState<any[]>([]); // Placeholder for future product data
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const recommendProducts = (userMessage: string) => {
    // In the future, filter products based on userMessage
    if (products.length === 0) return null;
    // Example: return products.filter(p => userMessage.includes(p.category));
    return [];
  };

  const predefinedResponses = {
    'waterproofing': t('chatbot.responses.waterproofing'),
    'sealants': t('chatbot.responses.sealants'),
    'flooring': t('chatbot.responses.flooring'),
    'insulation': t('chatbot.responses.insulation'),
    'projects': t('chatbot.responses.projects'),
    'contact': t('chatbot.responses.contact'),
    'technical': t('chatbot.responses.technical'),
    'consultation': t('chatbot.responses.consultation'),
    'default': t('chatbot.responses.default')
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    if (message.includes('waterproof') || message.includes('water') || message.includes('membrane')) {
      return predefinedResponses.waterproofing;
    }
    if (message.includes('sealant') || message.includes('silicone') || message.includes('joint')) {
      return predefinedResponses.sealants;
    }
    if (message.includes('floor') || message.includes('epoxy') || message.includes('coating')) {
      return predefinedResponses.flooring;
    }
    if (message.includes('insulation') || message.includes('thermal') || message.includes('acoustic')) {
      return predefinedResponses.insulation;
    }
    if (message.includes('project') || message.includes('case study') || message.includes('experience')) {
      return predefinedResponses.projects;
    }
    if (message.includes('contact') || message.includes('phone') || message.includes('email') || message.includes('address')) {
      return predefinedResponses.contact;
    }
    if (message.includes('technical') || message.includes('specification') || message.includes('application')) {
      return predefinedResponses.technical;
    }
    if (message.includes('consultation') || message.includes('consult') || message.includes('advice')) {
      return predefinedResponses.consultation;
    }
    // Future: recommend products if available
    const recommended = recommendProducts(userMessage);
    if (recommended && recommended.length > 0) {
      return `Based on your needs, we recommend: ${recommended.map(p => p.name).join(', ')}`;
    }
    return predefinedResponses.default;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: getBotResponse(userMessage.text),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground shadow-elegant z-50 font-[Playfair Display]"
        size="icon"
        style={{fontFamily: 'Playfair Display, serif'}}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-elegant z-50 flex flex-col font-[Playfair Display] rounded-2xl border border-primary bg-background/95" style={{fontFamily: 'Playfair Display, serif'}}>
      <CardHeader className="bg-gradient-hero text-primary-foreground rounded-t-2xl p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {t('chatbot.title')}
          </CardTitle>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-primary-foreground/80">
          {t('chatbot.subtitle')}
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{maxHeight: '340px'}}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-2xl font-[Playfair Display] break-words overflow-hidden ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
                style={{fontFamily: 'Playfair Display, serif', wordBreak: 'break-word'}}
              >
                <div className="flex items-start gap-2">
                  {message.sender === 'bot' && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                  {message.sender === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                  <div className="text-sm leading-relaxed">{message.text}</div>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground p-3 rounded-2xl flex items-center gap-2 font-[Playfair Display]" style={{fontFamily: 'Playfair Display, serif'}}>
                <Bot className="h-4 w-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t border-border p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              placeholder={t('chatbot.placeholder')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 font-[Playfair Display] rounded-xl border border-primary"
              style={{fontFamily: 'Playfair Display, serif'}}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              size="icon"
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chatbot;