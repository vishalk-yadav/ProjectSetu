import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ExternalLink,
  Loader2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { aiApi } from '../../api/aiApi';
import { AssistantQueryResult } from '../../types';
import { cn } from '../../utils/cn';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  data?: AssistantQueryResult;
  timestamp: string;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaste! I am the ProjectSetu AI Assistant. You can query cross-departmental project status, risk analysis, budget burn rates, or schedule predictions in plain language.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    'Show projects delayed by more than 30 days',
    'Which department has the highest number of high-risk projects?',
    'Show projects with budget utilization above 80%',
    'Which projects are likely to miss their deadlines?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await aiApi.queryAssistant(textToSend);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        data: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Apologies, I encountered an issue analyzing the database telemetry. Please verify that the query matches project monitoring parameters.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-xs">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F223D] font-heading flex items-center gap-1.5">
              ProjectSetu AI Assistant
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-blue-50 text-[#1A73E8] border border-blue-200">NLP</span>
            </h3>
            <p className="text-[11px] text-slate-500">Intelligent Governance Query Engine</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F8FAFC]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'flex flex-col gap-1.5 max-w-[90%]',
              m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
            )}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
              {m.sender === 'assistant' ? (
                <>
                  <Bot className="w-3 h-3 text-[#1A73E8]" />
                  <span className="font-semibold text-slate-600">Setu Intelligence</span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-slate-600">You</span>
                  <User className="w-3 h-3 text-slate-400" />
                </>
              )}
              <span>•</span>
              <span>{m.timestamp}</span>
            </div>

            <div
              className={cn(
                'p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs',
                m.sender === 'user'
                  ? 'bg-[#1A73E8] text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
              )}
            >
              <p>{m.text}</p>

              {/* Highlight Metric Card */}
              {m.data?.highlightMetric && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">{m.data.highlightMetric.label}</p>
                    <p className="text-sm font-black text-[#0F223D] mt-0.5">{m.data.highlightMetric.value}</p>
                    {m.data.highlightMetric.subtext && (
                      <p className="text-[10px] text-slate-500 mt-0.5">{m.data.highlightMetric.subtext}</p>
                    )}
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50 text-[#1A73E8] border border-blue-100">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Matching Projects List */}
              {m.data?.projects && m.data.projects.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Relevant Project Telemetry:</p>
                  {m.data.projects.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onClose();
                        navigate(`/projects/${p.id}`);
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[240px]">{p.name}</p>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>{p.departmentName}</span>
                        <span className={cn('font-bold', p.riskScore >= 61 ? 'text-rose-600' : 'text-emerald-600')}>
                          Risk: {p.riskScore}/100
                        </span>
                      </div>
                      <div className="mt-1.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#1A73E8] h-full rounded-full"
                          style={{ width: `${p.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#1A73E8] p-2 font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing multi-department databases...</span>
          </div>
        )}
      </div>

      {/* Sample Quick Prompt Chips */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
          <Lightbulb className="w-3 h-3 text-amber-500" /> Suggested Inquiries:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition-colors font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Footer */}
      <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask anything about projects, risk, delays..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          className="flex-1 px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || loading}
          className="p-2.5 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white disabled:opacity-50 transition-colors shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
