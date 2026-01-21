import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ChatSidebar from './ChatSidebar';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { AIConversation, AIMessage } from '../types';
import { supabase } from '../lib/supabase';
import { sendMessage, generateConversationTitle, ChatMessage } from '../lib/gemini';

interface AIGeneratorPageProps {
    user: User;
    onBack: () => void;
}

const AIGeneratorPage: React.FC<AIGeneratorPageProps> = ({ user, onBack }) => {
    const [conversations, setConversations] = useState<AIConversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [conversationsLoading, setConversationsLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, []);

    // Load messages when conversation changes
    useEffect(() => {
        if (currentConversationId) {
            loadMessages(currentConversationId);
        } else {
            setMessages([]);
        }
    }, [currentConversationId]);

    const loadConversations = async () => {
        setConversationsLoading(true);
        try {
            const { data, error } = await supabase
                .from('ai_conversations')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setConversations(data || []);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setConversationsLoading(false);
        }
    };

    const loadMessages = async (conversationId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('ai_messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const createNewConversation = async (firstMessage: string): Promise<string | null> => {
        try {
            // Generate a title for the conversation
            const title = await generateConversationTitle(firstMessage);

            const { data, error } = await supabase
                .from('ai_conversations')
                .insert({
                    user_id: user.id,
                    title: title,
                })
                .select()
                .single();

            if (error) throw error;

            // Add to local state
            setConversations((prev) => [data, ...prev]);
            setCurrentConversationId(data.id);

            return data.id;
        } catch (error) {
            console.error('Error creating conversation:', error);
            return null;
        }
    };

    const saveMessage = async (
        conversationId: string,
        role: 'user' | 'assistant',
        content: string,
        fileName?: string,
        fileContent?: string
    ): Promise<AIMessage | null> => {
        try {
            const { data, error } = await supabase
                .from('ai_messages')
                .insert({
                    conversation_id: conversationId,
                    role: role,
                    content: content,
                    file_name: fileName,
                    file_content: fileContent,
                })
                .select()
                .single();

            if (error) throw error;

            // Update conversation's updated_at
            await supabase
                .from('ai_conversations')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', conversationId);

            return data;
        } catch (error) {
            console.error('Error saving message:', error);
            return null;
        }
    };

    const handleSendMessage = async (
        message: string,
        file?: { name: string; content: string }
    ) => {
        setSendingMessage(true);

        try {
            // Create conversation if none exists
            let conversationId = currentConversationId;
            if (!conversationId) {
                conversationId = await createNewConversation(message);
                if (!conversationId) {
                    alert('Erro ao criar conversa. Tente novamente.');
                    return;
                }
            }

            // Save user message
            const userMessage = await saveMessage(
                conversationId,
                'user',
                message,
                file?.name,
                file?.content
            );

            if (!userMessage) {
                alert('Erro ao salvar mensagem. Tente novamente.');
                return;
            }

            // Add user message to UI immediately
            setMessages((prev) => [...prev, userMessage]);

            // Prepare chat history for Gemini
            const history: ChatMessage[] = messages.map((msg) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: msg.content,
            }));

            // Get AI response
            const aiResponse = await sendMessage({
                message,
                fileContent: file?.content,
                fileName: file?.name,
                history,
            });

            // Save AI response
            const assistantMessage = await saveMessage(conversationId, 'assistant', aiResponse);

            if (assistantMessage) {
                setMessages((prev) => [...prev, assistantMessage]);
            }
        } catch (error: any) {
            console.error('Error sending message:', error);
            alert(error.message || 'Erro ao enviar mensagem. Tente novamente.');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleDeleteConversation = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta conversa?')) return;

        try {
            const { error } = await supabase.from('ai_conversations').delete().eq('id', id);

            if (error) throw error;

            setConversations((prev) => prev.filter((c) => c.id !== id));
            if (currentConversationId === id) {
                setCurrentConversationId(null);
                setMessages([]);
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
            alert('Erro ao excluir conversa.');
        }
    };

    const handleNewConversation = () => {
        setCurrentConversationId(null);
        setMessages([]);
    };

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-400" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">AI Generator</h1>
                    <p className="text-sm text-slate-400">Roblox Lua Script Generator</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <ChatSidebar
                    conversations={conversations}
                    currentConversationId={currentConversationId}
                    onSelectConversation={setCurrentConversationId}
                    onNewConversation={handleNewConversation}
                    onDeleteConversation={handleDeleteConversation}
                    loading={conversationsLoading}
                />

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-slate-950">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="animate-spin text-indigo-500" size={48} />
                        </div>
                    ) : (
                        <>
                            <ChatMessages messages={messages} loading={sendingMessage} />
                            <ChatInput
                                onSendMessage={handleSendMessage}
                                disabled={sendingMessage}
                                loading={sendingMessage}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIGeneratorPage;
