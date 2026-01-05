import { GoogleGenAI, Chat } from "@google/genai";
import { GEMINI_MODEL, INITIAL_SYSTEM_INSTRUCTION } from '../constants';

let chatSession: Chat | null = null;

export const initializeChat = async (context: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Truncate context if strictly necessary, but Gemini 1.5/2.0 context is huge.
  // We will assume reasonable fit for text repos.
  
  const systemInstruction = `${INITIAL_SYSTEM_INSTRUCTION}\n\n=== REPOSITORY CONTEXT BEGIN ===\n${context}\n=== REPOSITORY CONTEXT END ===`;

  chatSession = ai.chats.create({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const sendMessage = async (message: string) => {
  if (!chatSession) throw new Error("Chat session not initialized");
  
  const response = await chatSession.sendMessageStream({ message });
  return response;
};

export const isChatInitialized = () => !!chatSession;
