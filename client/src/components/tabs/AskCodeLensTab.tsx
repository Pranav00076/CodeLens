import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, User, Bot, FileCode, Trash2, Loader2 } from 'lucide-react';
import { RepoAnalysis, ChatMessage } from '../../types/index';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';

interface AskCodeLensTabProps {
  repo: RepoAnalysis;
  onSelectFile: (filePath: string, line?: number) => void;
}

export const AskCodeLensTab: React.FC<AskCodeLensTabProps> = ({
  repo,
  onSelectFile,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const examplePrompts = [
    'How does authentication work in this codebase?',
    'Where is the API endpoint for user login & routing?',
    'Explain the payment / order checkout flow.',
    'Which files should I modify to add a new feature?',
    'Find where runtime errors and exceptions might originate.',
  ];

  useEffect(() => {
    api.getChatHistory(repo.id)
      .then((history) => {
        if (history.length > 0) {
          setMessages(history);
        } else {
          setMessages([
            {
              id: 'init-msg',
              role: 'assistant',
              content: `👋 Hi! I am **CodeLens AI**, grounded in the codebase of **${repo.name}**.\n\nI can explain architecture, trace API routes, find security boundaries, and locate exact line numbers for any feature. What would you like to explore?`,
              timestamp: new Date().toISOString(),
            }
          ]);
        }
      })
      .catch((err) => console.error('Failed to load chat history:', err));
  }, [repo.id, repo.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (questionToSend?: string) => {
    const q = (questionToSend || input).trim();
    if (!q || loading) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await api.askQuestion(repo.id, q);
      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Failed to get answer: ${err.message || 'Server error occurred'}.`,
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    await api.clearChatHistory(repo.id);
    setMessages([
      {
        id: 'init-msg',
        role: 'assistant',
        content: `Chat history cleared. Grounded in **${repo.name}**. What would you like to know?`,
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto p-4 sm:p-5">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-zinc-900 border border-white/[0.06] text-zinc-300">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <span>Ask CodeLens AI</span>
              <Badge variant="slate" size="sm">Grounded Context</Badge>
            </h3>
            <p className="text-[11px] text-zinc-500">Answers specifically verified against {repo.name}</p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-white/[0.06] text-xs transition-colors"
          title="Clear chat history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear History</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs ${
                  isUser
                    ? 'bg-zinc-800 text-zinc-200 border border-white/[0.08]'
                    : 'bg-zinc-900 text-zinc-300 border border-white/[0.06]'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-2xl rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-zinc-800 text-zinc-100 rounded-tr-none border border-white/[0.08]'
                    : 'bg-[#0E1015] border border-white/[0.06] text-zinc-200 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] space-y-1">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 block">
                      Referenced Files:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {msg.citations.map((c, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSelectFile(c.filePath, c.line)}
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/[0.06] text-[11px] font-mono text-zinc-300 hover:text-white transition-colors"
                        >
                          <FileCode className="w-3 h-3 text-zinc-400" />
                          <span>{c.filePath}{c.line ? `:L${c.line}` : ''}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-zinc-900 border border-white/[0.06] text-zinc-400 flex items-center justify-center">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3 rounded-lg bg-[#0E1015] border border-white/[0.06] text-xs text-zinc-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
              <span>Analyzing repository context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Example Prompt Chips */}
      <div className="py-2 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] font-medium text-zinc-500 shrink-0">Suggestions:</span>
        {examplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-2.5 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-white/[0.05] text-zinc-400 hover:text-zinc-200 text-[11px] whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="pt-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 p-1 bg-[#0E1015] border border-white/[0.08] rounded-xl shadow-lg focus-within:border-white/20 transition-colors"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask anything about ${repo.name}...`}
            disabled={loading}
            className="flex-1 bg-transparent px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none font-sans"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm disabled:opacity-40 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
