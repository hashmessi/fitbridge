import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BrainCircuit, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/apiClient';

export const ChatTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: "Hello! I'm your AI fitness coach. I can help with detailed physiology questions, form checks (describe them!), or complex diet science. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text
      }));

      // Call backend API
      const response = await sendChatMessage(userMsg.text, history);
      
      if (response.success && response.data) {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: response.data.response
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I had trouble thinking about that. Please try again." }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black pb-20">
      <div className="p-4 border-b border-white/5 bg-zinc-950 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
           <BrainCircuit className="text-pink-500" />
           AI Coach <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-normal border border-zinc-700">DeepSeek</span>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.text}
              </div>
              {msg.isThinking && !msg.text && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0 animate-pulse">
                      <BrainCircuit size={14} /> Thinking deeply...
                  </div>
              )}
            </div>
          </div>
        ))}
        {/* Separate pure thinking indicator if no message created yet or waiting for stream */}
        {isThinking && messages[messages.length - 1].role === 'user' && (
             <div className="flex justify-start">
                 <div className="bg-zinc-800 rounded-2xl p-4 rounded-bl-none">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Loader2 className="animate-spin w-4 h-4 text-pink-500" />
                        Thinking...
                    </div>
                 </div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-zinc-900 border-t border-white/5 pb-24">
        <div className="flex items-end gap-2 bg-black border border-zinc-800 rounded-2xl p-2 focus-within:border-zinc-600 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask complex questions..."
            className="flex-1 bg-transparent text-white placeholder-zinc-600 focus:outline-none p-2 resize-none max-h-32 text-sm"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="p-3 bg-white rounded-xl text-black disabled:opacity-50 hover:bg-zinc-200 transition-colors"
          >
            {isThinking ? <Loader2 size={18} className="animate-spin"/> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};