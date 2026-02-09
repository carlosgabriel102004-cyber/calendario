
import { GoogleGenAI, Type } from "@google/genai";
import { Task } from "../types";

// Função para obter a chave de forma segura
const getApiKey = () => {
  try {
    return (window as any).process?.env?.API_KEY || "";
  } catch {
    return "";
  }
};

export const suggestOptimizedSchedule = async (tasks: Task[], currentDate: Date): Promise<Partial<Task>[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Gemini API Key não encontrada. Otimização desativada.");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Analise as seguintes tarefas e sugira um horário otimizado para elas considerando que hoje é ${currentDate.toISOString()}. 
  Retorne um array de objetos com o id da tarefa e o novo startTime sugerido (formato HH:mm). 
  Tarefas: ${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority })))}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              startTime: { type: Type.STRING },
              explanation: { type: Type.STRING, description: "Por que este horário foi escolhido?" }
            },
            required: ["id", "startTime"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    return [];
  }
};
