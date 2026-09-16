import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Building2, Clock, RefreshCw } from 'lucide-react';
import { discussionApi } from '../../api/discussionApi';
import { ProjectDiscussionItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ProjectDiscussionsProps {
  projectId: string;
}

export const ProjectDiscussions: React.FC<ProjectDiscussionsProps> = ({ projectId }) => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<ProjectDiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await discussionApi.getDiscussions(projectId);
      setMessages(data);
    } catch (e) {
      console.error('Failed to load discussions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadMessages();
    }
  }, [projectId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const created = await discussionApi.postMessage(projectId, newMessage.trim());
      setMessages((prev) => [...prev, created]);
      setNewMessage('');
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setIsSending(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Super Admin</span>;
      case 'DEPARTMENT_ADMIN':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Dept Admin</span>;
      case 'PROJECT_MANAGER':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Project Manager</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{role}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" /> Team & Department Communication Board
          </h3>
          <p className="text-xs text-slate-500">
            Real-time inter-department coordination notes, site observations, and team updates.
          </p>
        </div>

        <button
          onClick={loadMessages}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          title="Refresh discussions"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-[400px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {loading ? (
            <LoadingSpinner message="Loading team communications..." />
          ) : messages.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No communication logs on this project yet. Post the first message below.
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.userId === currentUser?.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{m.senderName}</span>
                    {getRoleBadge(m.senderRole)}
                    <span className="font-mono text-[10px]">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-lg p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {m.message}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Post Message Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-2xl"
        >
          <input
            type="text"
            required
            placeholder="Type coordination note, clearance status, or site update..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            {isSending ? 'Sending...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  );
};
