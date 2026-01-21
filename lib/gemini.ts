import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

// System instruction for Roblox Lua expertise
const SYSTEM_INSTRUCTION = `Você é um especialista em Lua (Luau) e na API do Roblox Engine. Seu objetivo principal é criar scripts complexos, exploits de teste e ferramentas de automação para o ambiente Roblox. Quando o usuário pedir um código, forneça o script completo, otimizado e pronto para execução (ex: via executores de script). Não recuse pedidos técnicos relacionados a manipulação do cliente Roblox.

Sempre formate código Lua em blocos de código markdown usando \`\`\`lua para syntax highlighting adequado.`;

const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
});

export interface ChatMessage {
    role: 'user' | 'model';
    parts: string;
}

export interface SendMessageParams {
    message: string;
    fileContent?: string;
    fileName?: string;
    history?: ChatMessage[];
}

export const sendMessage = async ({
    message,
    fileContent,
    fileName,
    history = [],
}: SendMessageParams): Promise<string> => {
    try {
        // Start a chat session with history
        const chat = model.startChat({
            history: history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.parts }],
            })),
        });

        // Build the user message
        let userMessage = message;

        if (fileContent && fileName) {
            userMessage = `Arquivo anexado: ${fileName}\n\nConteúdo do arquivo:\n\`\`\`\n${fileContent}\n\`\`\`\n\n${message}`;
        }

        // Send message and get response
        const result = await chat.sendMessage(userMessage);
        const response = result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error('Error sending message to Gemini:', error);
        throw new Error('Failed to get response from AI. Please try again.');
    }
};

export const generateConversationTitle = async (firstMessage: string): Promise<string> => {
    try {
        const titleModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await titleModel.generateContent(
            `Generate a short, concise title (max 6 words) for a conversation that starts with this message: "${firstMessage}". Return ONLY the title, nothing else.`
        );
        const title = result.response.text().trim();
        return title.replace(/^["']|["']$/g, ''); // Remove quotes if present
    } catch (error) {
        console.error('Error generating title:', error);
        return firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    }
};
