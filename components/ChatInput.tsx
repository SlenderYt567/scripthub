import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, Loader2 } from 'lucide-react';

interface ChatInputProps {
    onSendMessage: (message: string, file?: { name: string; content: string }) => void;
    disabled?: boolean;
    loading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false, loading = false }) => {
    const [message, setMessage] = useState('');
    const [file, setFile] = useState<{ name: string; content: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Only allow text files
        if (!selectedFile.type.startsWith('text/') && !selectedFile.name.endsWith('.lua')) {
            alert('Por favor, selecione apenas arquivos de texto (.txt, .lua, etc.)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setFile({
                name: selectedFile.name,
                content: content,
            });
        };
        reader.readAsText(selectedFile);
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || disabled || loading) return;

        onSendMessage(message.trim(), file || undefined);
        setMessage('');
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);

        // Auto-resize textarea
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
    };

    return (
        <div className="border-t border-slate-800 bg-slate-900 p-4">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                {/* File Preview */}
                {file && (
                    <div className="mb-2 flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 text-sm">
                        <Paperclip size={16} className="text-indigo-400" />
                        <span className="flex-1 text-slate-300 truncate">{file.name}</span>
                        <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Input Area */}
                <div className="flex items-end gap-2">
                    {/* File Upload Button */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.lua,.luau,text/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || loading}
                        className="flex-shrink-0 p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Anexar arquivo"
                    >
                        <Paperclip size={20} />
                    </button>

                    {/* Text Input */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
                            disabled={disabled || loading}
                            rows={1}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ minHeight: '48px', maxHeight: '200px' }}
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={!message.trim() || disabled || loading}
                        className="flex-shrink-0 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>

                <p className="mt-2 text-xs text-slate-500 text-center">
                    A IA pode cometer erros. Verifique informações importantes.
                </p>
            </form>
        </div>
    );
};

export default ChatInput;
