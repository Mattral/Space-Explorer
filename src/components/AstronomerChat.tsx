import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Telescope, ChevronDown } from 'lucide-react';
import { PlanetData } from '@/data/planets';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AstronomerChatProps {
  selectedPlanet: PlanetData;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const AstronomerChat = ({ selectedPlanet }: AstronomerChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Welcome message when a new planet is selected
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          role: 'assistant',
          content: `🔭 Greetings, astronomer. I'm your AI research assistant specialized in planetary science. You're now observing **${selectedPlanet.name}**.\n\nAsk me anything — surface composition, atmospheric chemistry, notable missions, orbital mechanics, or fascinating discoveries. What would you like to know?`,
        },
      ]);
    }
  }, [selectedPlanet.id, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Build the message history
    const history = [...messages, userMsg];

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/astronomer-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: history,
          planet: selectedPlanet.name,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }));
        if (response.status === 429) {
          throw new Error('Rate limit reached. Please wait a moment before sending another message.');
        }
        if (response.status === 402) {
          throw new Error('AI usage credits exhausted. Please add credits in workspace settings.');
        }
        throw new Error(err.error || 'Failed to reach the astronomer AI.');
      }

      if (!response.body) throw new Error('No response body received.');

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      let textBuffer = '';
      let streamDone = false;

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantText += delta;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantText };
                return updated;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${err.message || 'Connection error. Please try again.'}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    `Surface composition of ${selectedPlanet.name}?`,
    `Missions sent to ${selectedPlanet.name}`,
    `Atmospheric chemistry`,
    `Most surprising discovery`,
  ];

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="fixed bottom-24 right-5 z-30 flex items-center gap-2.5 px-4 py-3 rounded-full border border-bio/40 bg-background/80 backdrop-blur-xl text-bio hover:bg-bio/10 hover:border-bio/70 transition-all duration-300 shadow-lg group"
        style={{ boxShadow: '0 0 20px hsl(var(--bio)/0.2)' }}
        title="Ask the AI Astronomer"
      >
        <Telescope className="h-4 w-4 group-hover:scale-110 transition-transform" />
        <span className="telemetry-label text-bio tracking-widest">AI ASTRONOMER</span>
        <div className="w-1.5 h-1.5 rounded-full bg-bio animate-pulse" />
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 z-40 w-[360px] max-w-[calc(100vw-2.5rem)] max-h-[70vh] flex flex-col info-panel rounded-2xl overflow-hidden animate-fade-up shadow-2xl"
          style={{ boxShadow: '0 0 60px hsl(var(--bio)/0.15), 0 0 0 1px hsl(var(--bio)/0.2)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-panel-border/60 bg-background/60">
            <Telescope className="h-4 w-4 text-bio flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="telemetry-label text-bio tracking-widest">AI ASTRONOMER</div>
              <div className="text-xs text-muted-foreground truncate font-mono">
                {selectedPlanet.name} · Research Mode
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-signal/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-signal/15 border border-signal/30 text-foreground rounded-tr-sm'
                      : 'bg-panel-glass/60 border border-panel-border/50 text-muted-foreground rounded-tl-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm prose-invert max-w-none text-muted-foreground [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mt-1 [&>ul]:mb-2 [&>li]:mb-0.5 [&>strong]:text-foreground">
                      <ReactMarkdown>{msg.content || '▌'}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="px-3.5 py-2.5 rounded-xl bg-panel-glass/60 border border-panel-border/50">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-bio animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-bio animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-bio animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts (only show when no conversation yet) */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {quickPrompts.map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-panel-border/50 text-muted-foreground hover:text-foreground hover:border-bio/40 transition-all duration-150"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-panel-border/60 bg-background/40">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask about ${selectedPlanet.name}...`}
                rows={1}
                className="flex-1 resize-none bg-transparent border border-panel-border/60 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-bio/50 transition-colors font-body"
                style={{ maxHeight: '100px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl border border-bio/40 bg-bio/10 text-bio hover:bg-bio/20 hover:border-bio/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="telemetry-label mt-2 opacity-40 text-center">Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AstronomerChat;
