import React, { useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Bot, User as UserIcon } from 'lucide-react';
import { AIMessage } from '../types';

interface ChatMessagesProps {
    messages: AIMessage[];
    loading?: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, loading = false }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleCopyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const renderMessageContent = (content: string, messageId: string) => {
        // Split content by code blocks
        const parts = content.split(/(```[\s\S]*?```)/g);

        return parts.map((part, index) => {
            // Check if it's a code block
            const codeMatch = part.match(/```(\w+)?\n([\s\S]*?)```/);

            if (codeMatch) {
                const language = codeMatch[1] || 'lua';
                const code = codeMatch[2].trim();
                const codeId = `${messageId}-${index}`;

                return (
                    <div key={index} className="my-4 rounded-lg overflow-hidden border border-slate-700">
                        <div className="flex items-center justify-between bg-slate-800 px-4 py-2 border-b border-slate-700">
                            <span className="text-xs text-slate-400 font-mono">{language}</span>
                            <button
                                onClick={() => handleCopyCode(code, codeId)}
                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                            >
                                {copiedCode === codeId ? (
                                    <>
                                        <Check size={14} />
                                        Copiado!
                                    </>
                                ) : (
                                    <>
                                        <Copy size={14} />
                                        Copiar
                                    </>
                                )}
                            </button>
                        </div>
                        <SyntaxHighlighter
                            language={language}
                            style={vscDarkPlus}
                            customStyle={{
                                margin: 0,
                                padding: '1rem',
                                background: '#0f172a',
                                fontSize: '0.875rem',
                            }}
                        >
                            {code}
                        </SyntaxHighlighter>
                    </div>
                );
            }

            // Regular text
            return (
                <p key={index} className="whitespace-pre-wrap">
                    {part}
                </p>
            );
        });
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Bot size={64} className="mb-4 opacity-50" />
                    <h3 className="text-xl font-bold mb-2">AI Generator - Roblox Lua</h3>
                    <p className="text-sm text-center max-w-md">
                        Especialista em criar scripts complexos, exploits de teste e ferramentas de automação para Roblox.
                    </p>
                </div>
            ) : (
                <>
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            {message.role === 'assistant' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                    <Bot size={18} className="text-white" />
                                </div>
                            )}

                            <div
                                className={`max-w-3xl rounded-2xl px-4 py-3 ${message.role === 'user'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-800 text-slate-200'
                                    }`}
                            >
                                {message.file_name && (
                                    <div className="mb-2 text-xs opacity-75 flex items-center gap-1">
                                        📎 {message.file_name}
                                    </div>
                                )}
                                <div className="text-sm leading-relaxed">
                                    {renderMessageContent(message.content, message.id)}
                                </div>
                            </div>

                            {message.role === 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                    <UserIcon size={18} className="text-slate-300" />
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                <Bot size={18} className="text-white" />
                            </div>
                            <div className="bg-slate-800 rounded-2xl px-4 py-3">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </>
            )}
        </div>
    );
};

export default ChatMessages;
