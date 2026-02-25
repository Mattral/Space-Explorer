import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, MessageCircle, Send, Satellite } from 'lucide-react';

interface Message {
  text: string;
  sender: 'user' | 'system';
  timestamp: Date;
}

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'Welcome to Space Explorer Mission Control. How can we assist your observation?',
      sender: 'system',
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!currentMessage.trim()) return;
    const userMsg: Message = { text: currentMessage, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setCurrentMessage('');
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { text: 'Mission Control acknowledges. Feature under development — stand by.', sender: 'system', timestamp: new Date() },
      ]);
    }, 500);
  };

  return (
    <>
      {/* FAB */}
      <button
        className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-2xl z-40 flex items-center justify-center transition-all duration-300 bg-signal/15 hover:bg-signal/25 border border-signal/30 text-signal hover:shadow-[0_0_20px_hsl(188_100%_50%/0.3)]"
        onClick={() => setIsOpen(true)}
      >
        <Satellite className="h-5 w-5" />
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 w-80 animate-fade-up">
          <div className="info-panel rounded-xl overflow-hidden flex flex-col h-[420px]">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-panel-border/60 flex-shrink-0">
              <span className="status-dot" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground font-body">Mission Control Comms</p>
                <p className="telemetry-label">Channel Active</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-xl px-3 py-2 ${
                    msg.sender === 'user'
                      ? 'bg-signal/20 border border-signal/30 text-foreground'
                      : 'bg-panel-bg border border-panel-border/60 text-muted-foreground'
                  }`}>
                    <p className="text-xs font-body leading-relaxed">{msg.text}</p>
                    <p className="telemetry-label mt-1 opacity-50">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-panel-border/60 p-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 bg-panel-bg border border-panel-border/60 text-foreground rounded-lg px-3 py-2 text-xs font-body focus:outline-none focus:border-signal/50 focus:ring-0 placeholder:text-muted-foreground/50 transition-colors"
                  placeholder="Transmit message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="w-8 h-8 rounded-lg bg-signal/15 hover:bg-signal/25 border border-signal/30 text-signal flex items-center justify-center transition-all duration-200 flex-shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChat;
