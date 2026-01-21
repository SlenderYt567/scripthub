import React from 'react';
import { MessageSquare, Plus, Trash2, Loader2 } from 'lucide-react';
import { AIConversation } from '../types';

interface ChatSidebarProps {
    conversations: AIConversation[];
    currentConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewConversation: () => void;
    onDeleteConversation: (id: string) => void;
    loading?: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
    conversations,
    currentConversationId,
    onSelectConversation,
    onNewConversation,
    onDeleteConversation,
    loading = false,
}) => {
    return (
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-800">
                <button
                    onClick={onNewConversation}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all"
                >
                    <Plus size={20} />
                    Nova Conversa
                </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-slate-600" size={24} />
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        <MessageSquare className="mx-auto mb-2 opacity-50" size={32} />
                        <p>Nenhuma conversa ainda</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${currentConversationId === conv.id
                                        ? 'bg-slate-800 text-white'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                    }`}
                                onClick={() => onSelectConversation(conv.id)}
                            >
                                <MessageSquare size={16} className="flex-shrink-0" />
                                <span className="flex-1 text-sm truncate">{conv.title}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteConversation(conv.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                                >
                                    <Trash2 size={14} className="text-red-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
                <p>AI Generator - Admin Only</p>
            </div>
        </div>
    );
};

export default ChatSidebar;
